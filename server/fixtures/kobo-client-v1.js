// Kōbō bridge client, version 1 (docs/kobo-storage.md §3–§4, §9a).
//
// Shipped with every Kōbō web app (Hikari, Fumi, …) and loaded before the app. It defines
// window.KoboStorage, which talks to the website shell over a MessageChannel. It never contacts
// storage itself and never sees credentials. When the app isn't launched by the shell, status()
// reports reason "bridge-unavailable" and every other call fails with "unauthorized".
//
// It also defines window.KoboLocal.detect(), the browser-storage probe of §9a.
//
// Configuration: kobo.json next to index.html, {"app": "hikari", "shellOrigins": ["https://…"]}.
// Edit it at deploy time; no rebuild needed.
(function () {
  "use strict";

  var BRIDGE_VERSION = 1;
  var DEFAULT_TIMEOUT_MS = 60000;
  var HELLO_TIMEOUT_MS = 8000;

  // ---------------------------------------------------------------- errors
  var RETRYABLE = { offline: true, timeout: true, "rate-limited": true };
  function KoboStorageError(code, message, retryable, retryAfterMs) {
    var e = new Error(message || code);
    Object.setPrototypeOf(e, KoboStorageError.prototype);
    e.name = "KoboStorageError";
    e.code = code;
    e.retryable = retryable === undefined ? !!RETRYABLE[code] : !!retryable;
    if (retryAfterMs !== undefined) e.retryAfterMs = retryAfterMs;
    return e;
  }
  KoboStorageError.prototype = Object.create(Error.prototype);
  KoboStorageError.prototype.constructor = KoboStorageError;

  // ---------------------------------------------------------------- state
  var config = { app: "", shellOrigins: [] };
  var port = null;            // MessagePort after the handshake
  var shellOrigin = null;
  var nextId = 1;
  var pending = new Map();    // id -> {resolve, reject, timer, onProgress}
  var listeners = new Set();
  var lastStatus = null;
  var closedReason = "bridge-unavailable";

  function launchId() {
    var m = /(?:^|[#&])kobo-launch=([A-Za-z0-9_-]{16,128})(?:&|$)/.exec(location.hash || "");
    return m ? m[1] : null;
  }

  function unavailableStatus(reason) {
    return {
      available: false, reason: reason || closedReason, userKey: "", connectionId: "",
      provider: "webdav", label: "", root: "", readOnly: true,
      maxPutBytes: 0, maxGetBytes: 0, settingsUrl: "/studio/storage"
    };
  }

  function notify(status) {
    lastStatus = status;
    listeners.forEach(function (cb) { try { cb(status); } catch (e) { /* a listener's error is its own */ } });
  }

  function failAll(code, message) {
    pending.forEach(function (p) {
      clearTimeout(p.timer);
      p.reject(KoboStorageError(code, message));
    });
    pending.clear();
  }

  function closePort(reason) {
    if (port) { try { port.close(); } catch (e) {} }
    port = null;
    closedReason = reason || "bridge-unavailable";
    failAll("unauthorized", "the storage connection was closed (" + closedReason + ")");
    notify(unavailableStatus(closedReason));
  }

  function onPortMessage(ev) {
    var m = ev.data;
    if (!m || typeof m !== "object") return;
    if (m.type === "change" && m.status) { notify(m.status); return; }
    if (m.type === "close") { closePort(m.reason || "signed-out"); return; }
    if (m.type === "progress" && pending.has(m.id)) {
      var pp = pending.get(m.id);
      if (pp.onProgress) { try { pp.onProgress(m.sent, m.total); } catch (e) {} }
      return;
    }
    if (typeof m.id !== "number" || !pending.has(m.id)) return;
    var p = pending.get(m.id);
    pending.delete(m.id);
    clearTimeout(p.timer);
    if (m.ok) p.resolve(m.result);
    else {
      var er = m.error || {};
      p.reject(KoboStorageError(er.code || "server", er.message, er.retryable, er.retryAfterMs));
    }
  }

  // ---------------------------------------------------------------- handshake
  var ready = new Promise(function (resolve) {
    var id = launchId();
    if (!id || window.parent === window) { closedReason = "bridge-unavailable"; resolve(false); return; }
    loadConfig().then(function () {
      if (!config.app || !config.shellOrigins.length) { closedReason = "bridge-unavailable"; resolve(false); return; }
      var done = false;
      function onWelcome(ev) {
        var m = ev.data;
        if (done || !m || m.type !== "kobo-welcome" || m.launchId !== id) return;
        if (ev.source !== window.parent) return;
        if (config.shellOrigins.indexOf(ev.origin) < 0) return;
        if (!ev.ports || !ev.ports[0]) return;
        done = true;
        window.removeEventListener("message", onWelcome);
        clearTimeout(timer);
        shellOrigin = ev.origin;
        port = ev.ports[0];
        port.onmessage = onPortMessage;
        port.start();
        resolve(true);
        if (m.status) notify(m.status);
      }
      window.addEventListener("message", onWelcome);
      var hello = { type: "kobo-hello", launchId: id, app: config.app, bridgeVersion: BRIDGE_VERSION };
      // postMessage to each allowed shell origin: only the one the parent really has receives it.
      config.shellOrigins.forEach(function (o) { try { window.parent.postMessage(hello, o); } catch (e) {} });
      var timer = setTimeout(function () {
        if (done) return;
        done = true;
        window.removeEventListener("message", onWelcome);
        closedReason = "bridge-unavailable";
        resolve(false);
      }, HELLO_TIMEOUT_MS);
    });
  });

  function loadConfig() {
    return fetch("./kobo.json", { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function () { return {}; })
      .then(function (c) {
        config.app = typeof c.app === "string" ? c.app : "";
        config.shellOrigins = Array.isArray(c.shellOrigins)
          ? c.shellOrigins.filter(function (o) { return typeof o === "string" && /^https?:\/\/[^/]+$/.test(o); })
          : [];
      });
  }

  // ---------------------------------------------------------------- requests
  function request(op, args, opts) {
    opts = opts || {};
    return ready.then(function (ok) {
      if (!ok || !port) throw KoboStorageError("unauthorized", "Kōbō storage isn't connected (" + closedReason + ")", false);
      return new Promise(function (resolve, reject) {
        var id = nextId++;
        var signal = opts.signal;
        if (signal && signal.aborted) { reject(KoboStorageError("cancelled", "cancelled")); return; }
        var timer = setTimeout(function () {
          if (!pending.has(id)) return;
          pending.delete(id);
          try { port.postMessage({ id: nextId++, op: "cancel", target: id }); } catch (e) {}
          reject(KoboStorageError("timeout", op + " timed out"));
        }, opts.timeoutMs || DEFAULT_TIMEOUT_MS);
        pending.set(id, { resolve: resolve, reject: reject, timer: timer, onProgress: opts.onProgress });
        if (signal) {
          signal.addEventListener("abort", function () {
            if (!pending.has(id)) return;
            pending.delete(id);
            clearTimeout(timer);
            try { port.postMessage({ id: nextId++, op: "cancel", target: id }); } catch (e) {}
            reject(KoboStorageError("cancelled", "cancelled"));
          }, { once: true });
        }
        var transfer = [];
        if (args && args.data instanceof ArrayBuffer) transfer.push(args.data);
        port.postMessage({ id: id, op: op, args: args || {} }, transfer);
      });
    });
  }

  function checkApp(app) {
    if (app !== config.app) throw KoboStorageError("forbidden", "this app is " + JSON.stringify(config.app) + ", not " + JSON.stringify(app), false);
  }
  function bytesOf(data) {
    if (data instanceof Uint8Array) return data.slice().buffer; // a copy we can transfer
    if (data instanceof ArrayBuffer) return data.slice(0);
    throw KoboStorageError("invalid", "data must be a Uint8Array or ArrayBuffer", false);
  }

  var KoboStorage = {
    version: 1,
    status: function (app) {
      return ready.then(function (ok) {
        if (app !== config.app && config.app) return unavailableStatus("app-not-permitted");
        if (!ok || !port) return unavailableStatus(closedReason);
        return request("status", { app: app }).then(function (s) { notify(s); return s; });
      });
    },
    read: function (app, path, opts) {
      opts = opts || {};
      return ready.then(function () {
        checkApp(app);
        return request("read", { app: app, path: path, ifMatch: opts.ifMatch }, opts).then(function (r) {
          if (r === null) return null;
          return { data: new Uint8Array(r.data), etag: r.etag };
        });
      });
    },
    put: function (app, path, data, opts) {
      opts = opts || {};
      return ready.then(function () {
        checkApp(app);
        if (opts.ifMatch !== undefined && opts.ifNoneMatch !== undefined) {
          throw KoboStorageError("invalid", "ifMatch and ifNoneMatch are mutually exclusive", false);
        }
        if (opts.ifNoneMatch !== undefined && opts.ifNoneMatch !== "*") {
          throw KoboStorageError("invalid", "ifNoneMatch must be \"*\"", false);
        }
        var buf = bytesOf(data);
        return request("put", { app: app, path: path, data: buf, ifMatch: opts.ifMatch, ifNoneMatch: opts.ifNoneMatch }, opts);
      });
    },
    stat: function (app, path, opts) {
      return ready.then(function () { checkApp(app); return request("stat", { app: app, path: path }, opts); });
    },
    list: function (app, dir, opts) {
      return ready.then(function () { checkApp(app); return request("list", { app: app, dir: dir }, opts); });
    },
    remove: function (app, path, opts) {
      opts = opts || {};
      return ready.then(function () { checkApp(app); return request("remove", { app: app, path: path, ifMatch: opts.ifMatch }, opts); });
    },
    onChange: function (app, callback) {
      var cb = function (s) { if (app === config.app) callback(s); };
      listeners.add(cb);
      return function () { listeners.delete(cb); };
    },
    openSettings: function () {
      return request("openSettings", {});
    }
  };
  Object.freeze(KoboStorage);

  // ---------------------------------------------------------------- browser storage (§9a)
  var PROBE = "kobo-probe-" + Math.random().toString(36).slice(2);
  function probeOpfs() {
    if (!navigator.storage || typeof navigator.storage.getDirectory !== "function") return Promise.resolve("absent");
    return navigator.storage.getDirectory().then(function (dir) {
      return dir.getFileHandle(PROBE, { create: true }).then(function (fh) {
        if (typeof fh.createWritable !== "function") {
          return dir.removeEntry(PROBE).then(function () { return "read-only"; });
        }
        return fh.createWritable().then(function (w) {
          return w.write(new Uint8Array([107, 111, 98, 111])).then(function () { return w.close(); });
        }).then(function () { return fh.getFile(); })
          .then(function (f) { return f.arrayBuffer(); })
          .then(function (b) {
            var ok = b.byteLength === 4 && new Uint8Array(b)[0] === 107;
            return dir.removeEntry(PROBE).then(function () { return ok ? "ok" : "corrupt"; });
          });
      });
    }).catch(function (e) { return "error:" + (e && e.name || e); });
  }
  function probeIdb() {
    if (typeof indexedDB === "undefined" || !indexedDB) return Promise.resolve("absent");
    return new Promise(function (resolve) {
      var req;
      try { req = indexedDB.open(PROBE, 1); } catch (e) { resolve("error:" + (e && e.name || e)); return; }
      req.onupgradeneeded = function () { req.result.createObjectStore("p"); };
      req.onerror = function () { resolve("error:" + (req.error && req.error.name)); };
      req.onsuccess = function () {
        var db = req.result;
        try {
          var tx = db.transaction("p", "readwrite");
          tx.objectStore("p").put("kobo", "k");
          tx.oncomplete = function () {
            var r = db.transaction("p").objectStore("p").get("k");
            r.onsuccess = function () {
              var ok = r.result === "kobo";
              db.close();
              var del = indexedDB.deleteDatabase(PROBE);
              del.onsuccess = del.onerror = del.onblocked = function () { resolve(ok ? "ok" : "corrupt"); };
            };
            r.onerror = function () { db.close(); resolve("error:read"); };
          };
          tx.onerror = function () { db.close(); resolve("error:" + (tx.error && tx.error.name)); };
        } catch (e) { db.close(); resolve("error:" + (e && e.name || e)); }
      };
    });
  }
  // Below this quota a browser is very likely keeping the data only for a private session
  // (a heuristic; the §9a test matrix refines it per browser).
  var SESSION_QUOTA_BYTES = 120 * 1024 * 1024;

  var KoboLocal = {
    /** {cls: "persistent"|"best-effort"|"session-only"|"unavailable", opfs, idb, persisted, quota} */
    detect: function () {
      return Promise.all([probeOpfs(), probeIdb()]).then(function (r) {
        var opfs = r[0], idb = r[1];
        var works = opfs === "ok" || idb === "ok";
        var st = navigator.storage || {};
        var ask = typeof st.persist === "function" ? st.persist().catch(function () { return false; }) : Promise.resolve(false);
        var est = typeof st.estimate === "function" ? st.estimate().catch(function () { return {}; }) : Promise.resolve({});
        return Promise.all([ask, est]).then(function (x) {
          var persisted = !!x[0];
          var quota = typeof x[1].quota === "number" ? x[1].quota : null;
          var cls;
          if (!works) cls = "unavailable";
          else if (quota !== null && quota < SESSION_QUOTA_BYTES) cls = "session-only";
          else cls = persisted ? "persistent" : "best-effort";
          return { cls: cls, opfs: opfs, idb: idb, persisted: persisted, quota: quota };
        });
      });
    },
    /** The §9a message for a class (English; the app may translate). */
    message: function (cls, appName) {
      var n = appName || "This app";
      switch (cls) {
        case "persistent": return "Saved locally";
        case "best-effort": return "Saved in this browser (it may clear it when space runs low)";
        case "session-only": return "Private window: your work is kept only until you close it. Sync to storage or download a backup.";
        default: return "This browser won't let " + n + " keep files here. Your work is not saved: sync to storage or download a backup before closing.";
      }
    }
  };

  Object.defineProperty(window, "KoboStorage", { value: KoboStorage, writable: false, configurable: false });
  Object.defineProperty(window, "KoboStorageError", { value: KoboStorageError, writable: false, configurable: false });
  Object.defineProperty(window, "KoboLocal", { value: Object.freeze(KoboLocal), writable: false, configurable: false });
  window.addEventListener("pagehide", function () { if (port) closePort("bridge-unavailable"); });
})();
