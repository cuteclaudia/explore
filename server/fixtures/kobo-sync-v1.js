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
  var MAX_HEAD_BYTES = 1000000;         // head.json stays well inside one 1 MiB operation
  var MAX_LIBRARY_BYTES = 256 * 1024 * 1024; // the whole logical library, checked before allocating
  var MAX_FILES = 512, MAX_PARTS = 6000;
  // a file is compacted (re-uploaded whole) once appends leave it this many parts above its minimum
  var COMPACT_SLACK = 32;
  var NAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
  var RESERVED = { "__proto__": 1, "constructor": 1, "prototype": 1, "hasOwnProperty": 1, "toString": 1, "valueOf": 1 };
  function validName(n) { return typeof n === "string" && NAME.test(n) && !Object.prototype.hasOwnProperty.call(RESERVED, n); }
  function validSize(x, max) { return Number.isSafeInteger(x) && x >= 0 && x <= max; }
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

  /** Validate a head.json before trusting it (§7, schema in docs/kobo-storage.md §7a).
   *  Returns the parsed head or throws; nothing is allocated from it before this passes. */
  function parseHead(bytes) {
    if (bytes.byteLength > MAX_HEAD_BYTES) throw err("server", "head.json is too large");
    var h;
    try { h = JSON.parse(new TextDecoder().decode(bytes)); } catch (e) { throw err("server", "head.json is not JSON"); }
    if (!h || typeof h !== "object" || h.format !== "kobo-library" || h.version !== 1) throw err("server", "unknown library format");
    if (!UUID.test(h.generation) || (h.parent !== null && !UUID.test(h.parent))) throw err("server", "bad generation id");
    if (!Array.isArray(h.files) || !Array.isArray(h.logical)) throw err("server", "bad head");
    if (h.logical.length > MAX_FILES || h.files.length > MAX_PARTS) throw err("server", "too many files in head.json");
    var sizes = new Map(), total = 0;
    h.logical.forEach(function (l) {
      if (!l || !validName(l.file) || !validSize(l.size, MAX_LIBRARY_BYTES) || !/^[0-9a-f]{64}$/.test(l.sha256)) throw err("server", "bad file entry");
      if (sizes.has(l.file)) throw err("server", "duplicate file " + l.file);
      sizes.set(l.file, 0);
      total += l.size;
      if (total > MAX_LIBRARY_BYTES) throw err("server", "library larger than this app accepts");
    });
    var re = /^gen\/([0-9a-f-]{36})\/(\d{1,6})$/, paths = new Set();
    h.files.forEach(function (f) {
      var m = f && re.exec(f.path || "");
      if (!m || !UUID.test(m[1]) || !validName(f.file) || !validSize(f.size, PART) || !/^[0-9a-f]{64}$/.test(f.sha256)) {
        throw err("server", "bad part entry");
      }
      if (!sizes.has(f.file)) throw err("server", "part of an unlisted file " + f.file);
      if (paths.has(f.path)) throw err("server", "duplicate part " + f.path);
      paths.add(f.path);
      sizes.set(f.file, sizes.get(f.file) + f.size);
    });
    h.logical.forEach(function (l) {
      if (sizes.get(l.file) !== l.size) throw err("server", "parts don't add up for " + l.file);
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
        var byFile = new Map();
        head.files.forEach(function (f) { if (!byFile.has(f.file)) byFile.set(f.file, []); byFile.get(f.file).push(f); });
        var files = Object.create(null);
        return head.logical.reduce(function (p, l) {
          return p.then(function () {
            var parts = byFile.get(l.file) || [];
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
      var oldParts = new Map(), oldLogical = new Map();
      if (oldHead) {
        oldHead.files.forEach(function (f) { if (!oldParts.has(f.file)) oldParts.set(f.file, []); oldParts.get(f.file).push(f); });
        oldHead.logical.forEach(function (l) { oldLogical.set(l.file, l); });
      }
      var n = 0, newParts = [], logical = [], uploads = [];
      var names = Object.keys(files).sort();
      var total = 0;
      for (var i = 0; i < names.length; i++) {
        if (!validName(names[i])) return Promise.reject(err("invalid", "bad library file name " + JSON.stringify(names[i])));
        total += files[names[i]].byteLength;
      }
      if (names.length > MAX_FILES || total > MAX_LIBRARY_BYTES) return Promise.reject(err("too-large", "the library is larger than storage sync accepts"));
      return names.reduce(function (p, name) {
        return p.then(function () {
          var data = files[name];
          return sha256(data).then(function (fileHash) {
            logical.push({ file: name, size: data.byteLength, sha256: fileHash });
            var prev = oldLogical.get(name);
            var prevParts = oldParts.get(name) || [];
            // compaction: many small appended tails → upload the file whole again
            var fragmented = prevParts.length > Math.ceil(data.byteLength / PART) + COMPACT_SLACK;
            if (prev && prev.sha256 === fileHash && !fragmented) { newParts = newParts.concat(prevParts); return; }
            var start = 0, keep = [];
            if (prev && !fragmented && appendOnly.indexOf(name) >= 0 && data.byteLength > prev.size) {
              return sha256(data.subarray(0, prev.size)).then(function (prefixHash) {
                if (prefixHash === prev.sha256) { keep = prevParts; start = prev.size; }
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
        if (body.byteLength > MAX_HEAD_BYTES) throw err("too-large", "the library index is too large to commit");
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
