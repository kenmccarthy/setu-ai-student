/* ============================================================
   AI at SETU (Student Course) — certificate of completion
   Learner enters their name; the certificate renders and can be
   previewed on screen or downloaded (print / save as PDF).
   Self-contained, no dependencies. Works in the website and in
   the SCORM package (the LMS separately records completion).
   ============================================================ */
(function () {
  "use strict";

  var NAME_KEY = "setu-ai-student-certname";
  var input   = document.getElementById("certName");
  var cert    = document.getElementById("certificate");
  var nameOut = document.getElementById("certNameOut");
  var dateOut = document.getElementById("certDate");
  var previewBtn  = document.getElementById("certPreviewBtn");
  var downloadBtn = document.getElementById("certDownloadBtn");
  var hint    = document.getElementById("certHint");
  if (!input || !cert || !nameOut) return;

  function today() {
    try {
      return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    } catch (e) {
      return new Date().toDateString();
    }
  }

  // Restore a previously entered name.
  try {
    var saved = localStorage.getItem(NAME_KEY);
    if (saved) input.value = saved;
  } catch (e) {}

  input.addEventListener("input", function () {
    try { localStorage.setItem(NAME_KEY, input.value); } catch (e) {}
  });

  function fillCertificate() {
    var name = (input.value || "").trim();
    nameOut.textContent = name || "Your Name";
    if (dateOut) dateOut.textContent = today();
    return name;
  }

  function requireName() {
    if ((input.value || "").trim()) return true;
    input.focus();
    if (hint) {
      hint.textContent = "Please enter your name first.";
      hint.style.color = "var(--danger)";
    }
    return false;
  }

  // course.js hides this whole block until every section is complete, so this
  // is a second lock rather than the only one: it keeps the buttons inert if
  // the form is ever revealed by some other route.
  function courseFinished() {
    if (document.body.classList.contains("is-course-complete")) return true;
    if (hint) {
      hint.textContent = "Finish the remaining sections first — your certificate will unlock here.";
      hint.style.color = "var(--danger)";
    }
    return false;
  }

  if (previewBtn) previewBtn.addEventListener("click", function () {
    if (!courseFinished()) return;
    if (!requireName()) return;
    fillCertificate();
    cert.classList.add("is-preview");
    cert.setAttribute("aria-hidden", "false");
    cert.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  if (downloadBtn) downloadBtn.addEventListener("click", function () {
    if (!courseFinished()) return;
    if (!requireName()) return;
    fillCertificate();
    cert.classList.add("is-preview");           // ensure it is renderable
    document.body.classList.add("printing-cert");
    var cleanup = function () {
      document.body.classList.remove("printing-cert");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    setTimeout(cleanup, 1500);                  // fallback if afterprint doesn't fire
    window.print();
  });
})();
