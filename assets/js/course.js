/* ============================================================
   AI at SETU — Student Course
   Course navigation, progress persistence, and interactions.
   Vanilla JS, no dependencies. Shares its component vocabulary
   with the staff courses (AI Literacy / Competency / Fluency).
   ============================================================ */
(function () {
  "use strict";

  var STORAGE_KEY = "setu-ai-student";
  var sections = Array.prototype.slice.call(document.querySelectorAll(".section"));
  var total = sections.length;
  var current = 0;

  // ---- Persisted state ------------------------------------------------
  function loadState() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveState(patch) {
    var s = loadState();
    for (var k in patch) s[k] = patch[k];
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {}
    return s;
  }
  // State version 2 replaced "furthest" (a single high-water mark) with a
  // record of the individual activities the learner has actually engaged with.
  // Under v1, jumping to the last section implicitly marked every earlier one
  // complete, which drove the progress bar to 100%, ticked the whole contents
  // list and released the certificate. v1 state is migrated by discarding its
  // progress and keeping the learner's own writing (notes and ratings).
  var STATE_VERSION = 2;
  var state = loadState();
  if (state.version !== STATE_VERSION) {
    state = { version: STATE_VERSION, reflections: state.reflections || {}, ratings: state.ratings || {} };
    saveState(state);
  }
  var visited = state.visited || {};        // { sectionIndex: 1 } — sections opened
  var steps = state.steps || {};            // { stepId: 1 }       — activities done
  var reflections = state.reflections || {};
  var ratings = state.ratings || {};       // { start: {statement: 1-5}, end: {...} }
  var scorm = window.SCORM || null;        // SCORM adapter (no-op if not in an LMS)

  // The last section is the certificate; the ones before it carry the course.
  var CONTENT_TOTAL = total - 1;

  // ====================================================================
  // Completion model
  // Requirements are derived from the markup at load, so adding or removing
  // an activity in index.html changes what a section demands with no list to
  // keep in sync here. Each activity gets an id of "<section>:<type>:<n>",
  // which is stable as long as the order of activities within a section is.
  // ====================================================================
  var bySection = [];        // [sectionIndex] -> [stepId]
  var requiredIds = [];      // every stepId in the content sections

  (function collectRequirements() {
    sections.forEach(function (sec, i) {
      var ids = [];
      function add(type, nodes) {
        Array.prototype.slice.call(nodes).forEach(function (el, n) {
          var id = i + ":" + type + ":" + n;
          el.setAttribute("data-step-id", id);
          ids.push(id);
        });
      }
      // Any answer counts. These are self-checks, not an assessment, so a
      // wrong answer is still engagement — what we are ruling out is a
      // learner who never stopped at all.
      add("quiz", sec.querySelectorAll("[data-quiz]"));
      add("srow", sec.querySelectorAll("[data-spectrum] .srow"));
      add("flip", sec.querySelectorAll(".flip-card"));
      add("reveal", sec.querySelectorAll("[data-reveal-simple]"));
      add("chipset", sec.querySelectorAll("[data-chipset]"));
      add("rating", sec.querySelectorAll(".rating__row"));
      bySection[i] = ids;
      if (i < CONTENT_TOTAL) requiredIds = requiredIds.concat(ids);
    });
  })();

  // Reflection textareas are deliberately NOT required. They are private
  // journalling, and compelling free text produces filler rather than thought.

  function markStep(id) {
    if (!id || steps[id]) return;
    steps[id] = 1;
    // Doing an activity implies being on its section, which keeps "all
    // activities done" and "all sections visited" from ever disagreeing.
    var sec = parseInt(id.split(":")[0], 10);
    if (!isNaN(sec)) visited[sec] = 1;
    saveState({ steps: steps, visited: visited });
    refresh();
  }

  function stepsLeft(i) {
    return (bySection[i] || []).filter(function (id) { return !steps[id]; }).length;
  }

  function sectionComplete(i) {
    if (!visited[i]) return false;
    return stepsLeft(i) === 0;   // true for a section with nothing to do
  }

  function sectionStarted(i) {
    return !!visited[i] || (bySection[i] || []).some(function (id) { return !!steps[id]; });
  }

  function sectionsComplete() {
    var n = 0;
    for (var i = 0; i < CONTENT_TOTAL; i++) if (sectionComplete(i)) n++;
    return n;
  }

  function courseComplete() {
    return sectionsComplete() === CONTENT_TOTAL;
  }

  // The final section holds the certificate rather than any activities of its
  // own, so it carries a tick only once the course behind it is finished —
  // otherwise merely opening it would tick it, which is the very thing this
  // model exists to prevent.
  function tocDone(i) {
    return i === CONTENT_TOTAL ? courseComplete() : sectionComplete(i);
  }

  // ---- Build the table of contents -----------------------------------
  var tocList = document.getElementById("tocList");
  sections.forEach(function (sec, i) {
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.href = "#";
    a.textContent = sec.getAttribute("data-nav") || sec.getAttribute("data-title") || ("Section " + i);
    a.setAttribute("data-index", i);
    a.addEventListener("click", function (e) { e.preventDefault(); go(i); closeToc(); });
    li.appendChild(a);
    tocList.appendChild(li);
  });
  var tocLinks = Array.prototype.slice.call(tocList.querySelectorAll("a"));

  // ---- Progress -------------------------------------------------------
  var fill = document.getElementById("progressFill");
  var pctLabel = document.getElementById("progressPct");
  var track = document.querySelector(".progress__track");
  function progressPct() {
    // Progress = activities actually completed, not sections walked past.
    if (!requiredIds.length) return 0;
    var done = requiredIds.filter(function (id) { return !!steps[id]; }).length;
    return Math.round((done / requiredIds.length) * 100);
  }

  function updateProgress() {
    var pct = progressPct();
    fill.style.width = pct + "%";
    pctLabel.textContent = pct + "%";
    track.setAttribute("aria-valuenow", String(pct));
  }

  // ---- Navigation -----------------------------------------------------
  var pagerCount = document.getElementById("pagerCount");
  var prevBtn = document.getElementById("prevBtn");
  var nextBtn = document.getElementById("nextBtn");

  // Repaint everything that depends on completion state. Called on navigation
  // and whenever an activity is completed, so the contents ticks, the bar and
  // the certificate panel always agree with each other.
  function refresh() {
    tocLinks.forEach(function (a, idx) {
      a.removeAttribute("aria-current");
      var done = tocDone(idx);
      a.classList.toggle("is-done", done);
      a.classList.toggle("is-partial", !done && sectionStarted(idx));
      if (idx === current) a.setAttribute("aria-current", "step");
    });

    updateProgress();
    renderCertGate();

    // Report to the LMS (no-op when running as plain HTML). Completion is
    // gated on the same condition as the certificate: under v1 this fired the
    // moment the learner landed on the last section, so a course that was
    // skipped through was recorded in the LMS as finished.
    if (scorm) {
      scorm.setProgress(progressPct());
      scorm.setLocation(current);
      if (courseComplete()) scorm.complete();
    }
  }

  function go(i) {
    i = Math.max(0, Math.min(total - 1, i));
    sections[current].classList.remove("is-active");
    sections[i].classList.add("is-active");
    current = i;

    if (!visited[i]) { visited[i] = 1; saveState({ visited: visited }); }

    // Pager
    prevBtn.disabled = i === 0;
    nextBtn.textContent = i === total - 1 ? "Finish ✓" : "Next →";
    pagerCount.textContent = "Section " + (i + 1) + " of " + total;

    refresh();

    document.getElementById("main").scrollIntoView({ block: "start" });
    window.scrollTo(0, 0);
  }

  prevBtn.addEventListener("click", function () { go(current - 1); });
  nextBtn.addEventListener("click", function () {
    if (current === total - 1) { go(0); } else { go(current + 1); }
  });

  // Buttons with data-goto ("next" | index)
  document.querySelectorAll("[data-goto]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var t = btn.getAttribute("data-goto");
      if (t === "next") go(current + 1); else go(parseInt(t, 10));
    });
  });

  // Keyboard: left/right arrows when not typing
  document.addEventListener("keydown", function (e) {
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "textarea" || tag === "input") return;
    if (isLightboxOpen()) return;
    if (e.key === "ArrowRight") go(current + 1);
    if (e.key === "ArrowLeft") go(current - 1);
  });

  // ---- Mobile TOC drawer ---------------------------------------------
  var menuBtn = document.getElementById("menuBtn");
  var toc = document.getElementById("toc");
  var backdrop = document.getElementById("tocBackdrop");
  function openToc() { toc.classList.add("is-open"); backdrop.classList.add("is-open"); menuBtn.setAttribute("aria-expanded", "true"); }
  function closeToc() { toc.classList.remove("is-open"); backdrop.classList.remove("is-open"); menuBtn.setAttribute("aria-expanded", "false"); }
  menuBtn.addEventListener("click", function () {
    toc.classList.contains("is-open") ? closeToc() : openToc();
  });
  backdrop.addEventListener("click", closeToc);

  // ====================================================================
  // Self-check quizzes (radio + reveal feedback)
  // ====================================================================
  document.querySelectorAll("[data-quiz]").forEach(function (quiz) {
    var answer = quiz.getAttribute("data-answer");
    var feedback = quiz.querySelector("[data-feedback]");
    var opts = Array.prototype.slice.call(quiz.querySelectorAll(".opt"));
    quiz.querySelectorAll('input[type="radio"]').forEach(function (input) {
      input.addEventListener("change", function () {
        opts.forEach(function (o) { o.classList.remove("correct", "incorrect"); });
        opts.forEach(function (o) {
          var inp = o.querySelector("input");
          if (inp.value === answer) o.classList.add("correct");
          else if (inp.checked) o.classList.add("incorrect");
        });
        feedback.classList.add("show");
        markStep(quiz.getAttribute("data-step-id"));
      });
    });
  });

  // ====================================================================
  // Reflection: autosave + download
  // ====================================================================
  (function () {
    var areas = Array.prototype.slice.call(document.querySelectorAll("[data-reflect]"));
    if (!areas.length) return;
    var savedLabel = document.getElementById("reflectSaved");
    var saveTimer = null;

    areas.forEach(function (a) {
      var key = a.getAttribute("data-reflect");
      if (reflections[key]) a.value = reflections[key];
      a.addEventListener("input", function () {
        reflections[key] = a.value;
        clearTimeout(saveTimer);
        saveTimer = setTimeout(function () {
          saveState({ reflections: reflections });
          if (savedLabel) {
            savedLabel.textContent = "✓ Saved on this device · " + new Date().toLocaleTimeString();
          }
        }, 400);
      });
    });

    var dl = document.getElementById("reflectDownload");
    if (dl) dl.addEventListener("click", function () {
      var lines = [
        "AI at SETU — Using GenAI to Support Your Learning",
        "My notes · " + new Date().toLocaleString(),
        ""
      ];
      areas.forEach(function (a) {
        var label = a.getAttribute("data-label") || a.getAttribute("data-reflect");
        lines.push(label + ":");
        lines.push(a.value || "(not answered)");
        lines.push("");
      });
      var blob = new Blob([lines.join("\n")], { type: "text/plain" });
      var url = URL.createObjectURL(blob);
      var link = document.createElement("a");
      link.href = url; link.download = "SETU-AI-Student-Course-notes.txt";
      document.body.appendChild(link); link.click();
      document.body.removeChild(link); URL.revokeObjectURL(url);
    });

    var clr = document.getElementById("reflectClear");
    if (clr) clr.addEventListener("click", function () {
      if (!confirm("Clear all your notes on this device?")) return;
      areas.forEach(function (a) { a.value = ""; });
      reflections = {}; saveState({ reflections: {} });
      if (savedLabel) savedLabel.textContent = "Cleared.";
    });
  })();

  // ====================================================================
  // Simple reveal buttons (data-reveal-simple)
  // ====================================================================
  document.querySelectorAll("[data-reveal-simple]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var el = document.getElementById(btn.getAttribute("data-reveal-simple"));
      if (el) { el.hidden = false; btn.disabled = true; }
      markStep(btn.getAttribute("data-step-id"));
    });
  });

  // ====================================================================
  // Print / download the five-question decision card
  // ====================================================================
  var cardPrintBtn = document.getElementById("cardPrintBtn");
  if (cardPrintBtn) cardPrintBtn.addEventListener("click", function () {
    document.body.classList.add("printing-checklist");
    var cleanup = function () {
      document.body.classList.remove("printing-checklist");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    setTimeout(cleanup, 1500);
    window.print();
  });

  // ====================================================================
  // Spectrum activity (Support or offload? / Share, think or stop?)
  // ====================================================================
  document.querySelectorAll("[data-spectrum] .srow").forEach(function (row) {
    var note = row.querySelector(".srow__note");
    var opts = Array.prototype.slice.call(row.querySelectorAll(".srow__opts button"));
    opts.forEach(function (b) {
      b.addEventListener("click", function () {
        opts.forEach(function (o) { o.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
        if (note) { note.textContent = row.getAttribute("data-note"); note.classList.add("show"); }
        markStep(row.getAttribute("data-step-id"));
      });
    });
  });

  // ====================================================================
  // Multi-select chip sets ("Where is AI already in your life?")
  // Toggle any number of chips, then reveal the feedback for the set.
  // Unlike Course 1's "Which of these are AI?", there is no right answer
  // here — the count is the point, so no chip carries a correct/incorrect
  // state. Purely a prompt for reflection.
  // ====================================================================
  document.querySelectorAll("[data-chipset]").forEach(function (wrap) {
    var chips = Array.prototype.slice.call(wrap.querySelectorAll(".chip"));
    var tally = wrap.querySelector("[data-chipset-tally]");
    var revealBtn = wrap.querySelector("[data-chipset-reveal]");
    var box = revealBtn && document.getElementById(revealBtn.getAttribute("data-chipset-reveal"));

    function count() {
      return wrap.querySelectorAll('.chip[aria-pressed="true"]').length;
    }
    function paintTally() {
      if (!tally) return;
      var n = count();
      tally.textContent = n === 0 ? "Nothing selected yet."
        : "You selected " + n + " of " + chips.length + ".";
    }

    function paintReveal() {
      if (revealBtn && !revealBtn.hidden) {
        // Only enabled once a choice has been made, so the activity cannot be
        // cleared by clicking straight past it.
        var spent = wrap.getAttribute("data-chipset-done") === "true";
        revealBtn.disabled = spent || count() === 0;
      }
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chip.setAttribute("aria-pressed", chip.getAttribute("aria-pressed") === "true" ? "false" : "true");
        paintTally();
        paintReveal();
      });
    });
    paintTally();
    paintReveal();

    if (revealBtn && box) revealBtn.addEventListener("click", function () {
      if (count() === 0) return;
      box.hidden = false;
      wrap.setAttribute("data-chipset-done", "true");
      revealBtn.disabled = true;
      markStep(wrap.getAttribute("data-step-id"));
    });
  });

  // ====================================================================
  // Confidence self-rating (Where are you now? / Reflection)
  // ====================================================================
  document.querySelectorAll("[data-rating]").forEach(function (block) {
    var key = block.getAttribute("data-rating"); // "start" | "end"
    ratings[key] = ratings[key] || {};
    var rows = Array.prototype.slice.call(block.querySelectorAll(".rating__row"));

    function paint(row) {
      var stmt = row.getAttribute("data-statement");
      var val = ratings[key][stmt];
      row.querySelectorAll(".rating__scale button").forEach(function (b) {
        b.setAttribute("aria-pressed", String(parseInt(b.getAttribute("data-v"), 10) === val));
      });
      var compare = row.querySelector(".rating__compare");
      if (!compare) return;
      var startVal = (ratings.start || {})[stmt];
      if (key === "end" && val && startVal) {
        var diff = val - startVal;
        compare.hidden = false;
        compare.textContent = "Started at " + startVal + " · now " + val +
          (diff > 0 ? " (+" + diff + ")" : diff < 0 ? " (" + diff + ")" : " (no change)");
      } else {
        compare.hidden = true;
      }
    }

    rows.forEach(function (row) {
      row.querySelectorAll(".rating__scale button").forEach(function (btn) {
        btn.addEventListener("click", function () {
          ratings[key][row.getAttribute("data-statement")] = parseInt(btn.getAttribute("data-v"), 10);
          saveState({ ratings: ratings });
          paint(row);
          markStep(row.getAttribute("data-step-id"));
        });
      });
      paint(row);
    });
  });

  // ====================================================================
  // Flip cards (What AI does well; AI Principles)
  // ====================================================================
  document.querySelectorAll(".flip-card").forEach(function (card) {
    function toggle() {
      var open = card.getAttribute("aria-expanded") === "true";
      card.setAttribute("aria-expanded", open ? "false" : "true");
      markStep(card.getAttribute("data-step-id"));
    }
    card.addEventListener("click", toggle);
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });
  });

  // ====================================================================
  // Image lightbox — click any course image to view it enlarged
  // ====================================================================
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxCaption = document.getElementById("lightboxCaption");
  var lightboxTrigger = null; // element to restore focus to on close

  function isLightboxOpen() {
    return !!(lightbox && !lightbox.hidden);
  }

  function openLightbox(img) {
    if (!lightbox) return;
    lightboxTrigger = img;
    lightboxImg.src = img.getAttribute("src");
    lightboxImg.alt = img.getAttribute("alt") || "";
    var figcaption = img.closest("figure") && img.closest("figure").querySelector("figcaption");
    lightboxCaption.textContent = figcaption ? figcaption.textContent : "";
    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    lightbox.querySelector(".lightbox__close").focus();
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.classList.remove("lightbox-open");
    lightboxImg.src = "";
    if (lightboxTrigger) { lightboxTrigger.focus(); lightboxTrigger = null; }
  }

  if (lightbox) {
    document.querySelectorAll(".figure__img").forEach(function (img) {
      img.setAttribute("tabindex", "0");
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", "View larger image: " + (img.getAttribute("alt") || ""));
      img.addEventListener("click", function () { openLightbox(img); });
      img.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLightbox(img); }
      });
    });

    lightbox.querySelectorAll("[data-lightbox-close]").forEach(function (el) {
      el.addEventListener("click", closeLightbox);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isLightboxOpen()) closeLightbox();
    });
  }

  // ====================================================================
  // Certificate gate
  // The final section shows one of two things: the certificate form once the
  // course is genuinely finished, or a live checklist of what is outstanding
  // with a way to jump straight there. Previously the form was always present
  // and asked only for a name, so the certificate could be had without
  // opening a single activity.
  // ====================================================================
  var certLocked = document.getElementById("certLocked");
  var certLockCount = document.getElementById("certLockCount");
  var certLockList = document.getElementById("certLockList");
  var certGen = document.getElementById("certgen");
  var finishComplete = document.getElementById("finishComplete");
  var finishIncomplete = document.getElementById("finishIncomplete");

  function renderCertGate() {
    var complete = courseComplete();
    document.body.classList.toggle("is-course-complete", complete);
    if (certGen) certGen.hidden = !complete;
    if (finishComplete) finishComplete.hidden = !complete;
    if (finishIncomplete) finishIncomplete.hidden = complete;
    if (!certLocked) return;

    certLocked.hidden = complete;
    if (complete) return;

    var done = sectionsComplete();
    if (certLockCount) {
      certLockCount.textContent = "You've finished " + done + " of " + CONTENT_TOTAL +
        (CONTENT_TOTAL === 1 ? " section." : " sections.");
    }
    if (!certLockList) return;

    certLockList.innerHTML = "";
    for (var i = 0; i < CONTENT_TOTAL; i++) {
      if (sectionComplete(i)) continue;
      certLockList.appendChild(lockRow(i));
    }
  }

  function lockRow(idx) {
    var sec = sections[idx];
    var li = document.createElement("li");
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "certlock__jump";

    var name = document.createElement("span");
    name.className = "certlock__name";
    name.textContent = (idx + 1) + ". " +
      (sec.getAttribute("data-nav") || sec.getAttribute("data-title") || "Section " + (idx + 1));

    var left = document.createElement("span");
    left.className = "certlock__left";
    var n = stepsLeft(idx);
    // A visited-but-incomplete section always has at least one activity left,
    // because that is what "incomplete" means once it has been opened.
    left.textContent = !visited[idx] ? "Not opened yet"
      : n === 1 ? "1 activity left" : n + " activities left";

    btn.appendChild(name);
    btn.appendChild(left);
    btn.addEventListener("click", function () { go(idx); });
    li.appendChild(btn);
    return li;
  }

  // ---- Init -----------------------------------------------------------
  var startAt = 0;
  if (scorm && scorm.init()) {
    // Inside an LMS: resume to the last-viewed section if recorded.
    var loc = scorm.getLocation();
    if (loc !== null && loc >= 0 && loc < total) startAt = loc;
  }
  go(startAt);
  updateProgress();
})();

// ====================================================================
// Theme toggle (light/dark) — independent of course state above.
// ====================================================================
(function () {
  "use strict";

  var THEME_KEY = "setu-genai-theme";
  var btn = document.getElementById("themeToggle");
  if (!btn) return;

  var root = document.documentElement;
  var sunIcon = btn.querySelector(".theme-toggle__sun");
  var moonIcon = btn.querySelector(".theme-toggle__moon");
  var media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function currentTheme() {
    var attr = root.getAttribute("data-theme");
    if (attr === "dark" || attr === "light") return attr;
    return media && media.matches ? "dark" : "light";
  }
  function render(theme) {
    var isDark = theme === "dark";
    btn.setAttribute("aria-pressed", String(isDark));
    btn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    sunIcon.hidden = isDark;
    moonIcon.hidden = !isDark;
  }
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    render(theme);
  }

  render(currentTheme());
  btn.addEventListener("click", function () {
    applyTheme(currentTheme() === "dark" ? "light" : "dark");
  });
})();
