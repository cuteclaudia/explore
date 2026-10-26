// Kōbō library sync, version 1 (docs/kobo-storage.md §7). Shared by every Kōbō web app.
//
// An app's library is a set of named files ("catalog.snap", "catalog.log", "prefs.json", …).
// KoboSync stores it under library/ through window.KoboStorage:
//   library/gen/<uuid>/<n>     immutable parts (≤ partSize bytes), written once per save
//   library/head.json          the commit point: which parts make up each file
// A save uploads only what changed (an append-only file uploads only its new tail), then replaces
// head.json conditionally. A conflict means another device committed first.
(function () {
  "use strict";
  var PART = 1024 * 1024;               // fixed part size (format version 1)
  var UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

  function err(code, message) { return new window.KoboStorageError(code, message, code === "offline" || code === "timeout"); }
  function uuid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    var b = crypto.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
    var h = Array.from(b, function (x) { return x.toString(16).padStart(2, "0"); }).join("");
    return h.slice(0, 8) + "-" + h.slice(8, 12) + "-" + h.slice(12, 16) + "-" + h.slice(16, 20) + "-" + h.slice(20);
  }
  function hex(buf) { return Array.from(new Uint8Array(buf), function (x) { return x.toString(16).padStart(2, "0"); }).join(""); }
  function sha256(bytes) { return crypto.subtle.digest("SHA-256", bytes).then(hex); }
  function concat(chunks, total) {
    var out = new Uint8Array(total), o = 0;
    chunks.forEach(function (c) { out.set(c, o); o += c.byteLength; });
    return out;
  }
  function deviceId() {
    try {
      var d = localStorage.getItem("kobo-device");
      if (!d) { d = uuid(); localStorage.setItem("kobo-device", d); }
      return d;
    } catch (e) { return "device-" + uuid(); }
  }

  /** Validate a head.json before trusting it (§7). Returns the parsed head or throws. */
  function parseHead(bytes) {
    var h;
    try { h = JSON.parse(new TextDecoder().decode(bytes)); } catch (e) { throw err("server", "head.json is not JSON"); }
    if (!h || h.format !== "kobo-library" || h.version !== 1) throw err("server", "unknown library format");
    if (!UUID.test(h.generation) || (h.parent !== null && !UUID.test(h.parent))) throw err("server", "bad generation id");
    if (!Array.isArray(h.files) || !Array.isArray(h.logical)) throw err("server", "bad head");
    var re = /^gen\/([0-9a-f-]{36})\/\d{1,6}$/;
    h.files.forEach(function (f) {
      var m = re.exec(f.path || "");
      if (!m || !UUID.test(m[1]) || typeof f.file !== "string" || !(f.size >= 0 && f.size <= PART) || !/^[0-9a-f]{64}$/.test(f.sha256)) {
        throw err("server", "bad part entry " + JSON.stringify(f).slice(0, 120));
      }
    });
    h.logical.forEach(function (l) {
      if (typeof l.file !== "string" || !(l.size >= 0) || !/^[0-9a-f]{64}$/.test(l.sha256)) throw err("server", "bad file entry");
    });
    return h;
  }

  var KoboSync = {
    PART_SIZE: PART,

    /** Read the committed library. → null (no library yet) or
     *  {head, etag, files: {name: Uint8Array}} with every part and file hash verified. */
    pull: function (app, opts) {
      var S = window.KoboStorage;
      return S.read(app, "library/head.json", opts).then(function (r) {
        if (r === null) return null;
        var head = parseHead(r.data);
        var byFile = {};
        head.files.forEach(function (f) { (byFile[f.file] = byFile[f.file] || []).push(f); });
        var files = {};
        return head.logical.reduce(function (p, l) {
          return p.then(function () {
            var parts = byFile[l.file] || [];
            var chunks = [], total = 0;
            return parts.reduce(function (pp, f) {
              return pp.then(function () {
                return S.read(app, "library/" + f.path, opts).then(function (x) {
                  if (x === null) throw err("server", "missing part " + f.path);
                  if (x.data.byteLength !== f.size) throw err("server", "part size mismatch " + f.path);
                  return sha256(x.data).then(function (h) {
                    if (h !== f.sha256) throw err("server", "part hash mismatch " + f.path);
                    chunks.push(x.data); total += x.data.byteLength;
                  });
                });
              });
            }, Promise.resolve()).then(function () {
              if (total !== l.size) throw err("server", "file size mismatch " + l.file);
              var data = concat(chunks, total);
              return sha256(data).then(function (h) {
                if (h !== l.sha256) throw err("server", "file hash mismatch " + l.file);
                files[l.file] = data;
              });
            });
          });
        }, Promise.resolve()).then(function () { return { head: head, etag: r.etag, files: files }; });
      });
    },

    /** Commit a new generation. files: {name: Uint8Array}; base: the {head, etag} this device last
     *  pulled or committed (null for a new library). appendOnly: names that only ever grow (their
     *  new tail is uploaded when the old content is a prefix). → {head, etag}.
     *  Rejects with code "conflict" when another device committed first. */
    commit: function (app, files, base, opts) {
      opts = opts || {};
      var S = window.KoboStorage;
      var appendOnly = opts.appendOnly || [];
      var gen = uuid();
      var oldHead = base && base.head;
      var oldParts = {}, oldLogical = {};
      if (oldHead) {
        oldHead.files.forEach(function (f) { (oldParts[f.file] = oldParts[f.file] || []).push(f); });
        oldHead.logical.forEach(function (l) { oldLogical[l.file] = l; });
      }
      var n = 0, newParts = [], logical = [], uploads = [];
      var names = Object.keys(files).sort();
      return names.reduce(function (p, name) {
        return p.then(function () {
          var data = files[name];
          return sha256(data).then(function (fileHash) {
            logical.push({ file: name, size: data.byteLength, sha256: fileHash });
            var prev = oldLogical[name];
            if (prev && prev.sha256 === fileHash) { newParts = newParts.concat(oldParts[name] || []); return; }
            var start = 0, keep = [];
            if (prev && appendOnly.indexOf(name) >= 0 && data.byteLength > prev.size) {
              return sha256(data.subarray(0, prev.size)).then(function (prefixHash) {
                if (prefixHash === prev.sha256) { keep = oldParts[name] || []; start = prev.size; }
                return addParts(name, data, start, keep);
              });
            }
            return addParts(name, data, 0, []);
          });
        });
      }, Promise.resolve()).then(function () {
        // upload the new parts (create-only), then confirm their sizes, then commit the head
        return uploads.reduce(function (p, u) {
          return p.then(function () { return S.put(app, "library/" + u.path, u.data, { ifNoneMatch: "*", signal: opts.signal }); });
        }, Promise.resolve());
      }).then(function () {
        return uploads.reduce(function (p, u) {
          return p.then(function () {
            return S.stat(app, "library/" + u.path, { signal: opts.signal }).then(function (st) {
              if (!st || st.size !== u.data.byteLength) throw err("server", "uploaded part didn't verify: " + u.path);
            });
          });
        }, Promise.resolve());
      }).then(function () {
        var head = {
          format: "kobo-library", version: 1, generation: gen,
          parent: oldHead ? oldHead.generation : null,
          sequence: oldHead ? (oldHead.sequence || 0) + 1 : 1,
          files: newParts, logical: logical, writer: deviceId(), written: new Date().toISOString()
        };
        var body = new TextEncoder().encode(JSON.stringify(head));
        var cond = base && base.etag ? { ifMatch: base.etag } : { ifNoneMatch: "*" };
        cond.signal = opts.signal;
        return S.put(app, "library/head.json", body, cond).then(function (r) { return { head: head, etag: r.etag, uploaded: uploads.length }; });
      });

      function addParts(name, data, start, keep) {
        // slice and name the parts in order first; hashing is async, the order must not depend on it
        var chunks = [];
        for (var o = start; o < data.byteLength; o += PART) chunks.push(data.subarray(o, Math.min(o + PART, data.byteLength)));
        if (chunks.length === 0 && keep.length === 0) chunks.push(data.subarray(0, 0)); // an empty file: one empty part
        var paths = chunks.map(function () { return "gen/" + gen + "/" + (n++); });
        return Promise.all(chunks.map(sha256)).then(function (hashes) {
          newParts = newParts.concat(keep);
          chunks.forEach(function (c, i) {
            newParts.push({ file: name, path: paths[i], size: c.byteLength, sha256: hashes[i] });
            uploads.push({ path: paths[i], data: c });
          });
        });
      }
    }
  };
  Object.defineProperty(window, "KoboSync", { value: Object.freeze(KoboSync), writable: false, configurable: false });
})();
