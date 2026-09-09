/* ============================================================
   AI at SETU (Student Course) — SCORM 1.2 adapter
   Defines window.SCORM. When the course runs inside a SCORM-
   conformant LMS it reports progress, resume location and
   completion. When run as a plain website (no LMS API found)
   every method is a safe no-op, so the same index.html works
   in both contexts.
   ============================================================ */
(function () {
  "use strict";

  var api = null;          // the discovered LMS API object
  var connected = false;   // did LMSInitialize succeed?
  var finished = false;

  // ---- Locate the LMS API (SCORM 1.2 exposes window.API) ----
  function findAPI(win) {
    var tries = 0;
    while (win && (typeof win.API === "undefined" || win.API === null) && tries < 500) {
      if (!win.parent || win.parent === win) break;
      tries++;
      win = win.parent;
    }
    return (win && typeof win.API !== "undefined") ? win.API : null;
  }

  function getAPI() {
    var candidate = null;
    try { candidate = findAPI(window); } catch (e) {}
    if (!candidate && window.opener) {
      try { candidate = findAPI(window.opener); } catch (e) {}
    }
    return candidate;
  }

  function get(key) {
    if (!connected) return "";
    try { return api.LMSGetValue(key); } catch (e) { return ""; }
  }
  function set(key, val) {
    if (!connected) return false;
    try { return api.LMSSetValue(key, String(val)) === "true" || true; }
    catch (e) { return false; }
  }
  function commit() {
    if (!connected) return;
    try { api.LMSCommit(""); } catch (e) {}
  }

  var SCORM = {
    connected: false,

    /* Connect to the LMS. Returns true if an API was found. */
    init: function () {
      api = getAPI();
      if (!api) return false;
      var ok = false;
      try { ok = api.LMSInitialize("") === "true"; } catch (e) { ok = false; }
      connected = ok;
      this.connected = ok;
      if (ok) {
        // Move "not attempted" to "incomplete" so the LMS shows it as started.
        var status = get("cmi.core.lesson_status");
        if (!status || status === "not attempted") {
          set("cmi.core.lesson_status", "incomplete");
        }
        commit();
      }
      return ok;
    },

    /* Section index the learner is on (used for LMS-side resume). */
    setLocation: function (index) {
      if (set("cmi.core.lesson_location", index)) commit();
    },
    getLocation: function () {
      var v = parseInt(get("cmi.core.lesson_location"), 10);
      return isNaN(v) ? null : v;
    },

    /* Report progress 0–100 as the raw score (informational only). */
    setProgress: function (pct) {
      if (!connected) return;
      set("cmi.core.score.raw", Math.round(pct));
      set("cmi.core.score.min", 0);
      set("cmi.core.score.max", 100);
    },

    /* Mark the course complete. No pass/fail gate, so status = completed. */
    complete: function () {
      if (!connected) return;
      var status = get("cmi.core.lesson_status");
      if (status !== "completed" && status !== "passed") {
        set("cmi.core.lesson_status", "completed");
      }
      set("cmi.core.score.raw", 100);
      commit();
    },

    save: function () { commit(); },

    /* Close the session cleanly. */
    finish: function () {
      if (!connected || finished) return;
      finished = true;
      commit();
      try { api.LMSFinish(""); } catch (e) {}
    }
  };

  // Ensure the session is closed if the learner leaves.
  function bye() { SCORM.finish(); }
  window.addEventListener("pagehide", bye);
  window.addEventListener("unload", bye);
  window.addEventListener("beforeunload", function () { SCORM.save(); });

  window.SCORM = SCORM;
})();
