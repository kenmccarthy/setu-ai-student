# SCORM packaging

This folder turns the course into a **SCORM 1.2** package for your LMS, while the
standalone website keeps working exactly as before. There is **one source of
truth** — the `index.html` + `assets/` at the repo root power both. Nothing is
duplicated.

## How it works

- **`assets/js/scorm.js`** is a small SCORM 1.2 adapter loaded by every page. Inside
  a SCORM-conformant LMS it finds the LMS API and reports **progress**, **resume
  location** and **completion**. Run as a plain website (no LMS), every call is a
  safe no-op — so the HTML version is unaffected.
- **`build_scorm.py`** bundles the site with a generated `imsmanifest.xml` and zips it.

## Build the package

From the repo root:

```bash
python3 scorm/build_scorm.py
```

This writes:

```
dist/setu-ai-student-scorm-1.2.zip
```

Upload that `.zip` to your LMS as a SCORM package (Moodle, Brightspace, Blackboard,
Canvas, SCORM Cloud, etc.). **Re-run the script whenever you edit the course** to
regenerate the zip.

## What the LMS will track

- **Completion** — marked *completed* when the learner reaches the final section.
  There is no pass/fail gate (this is a reflective, practice-based course), so no score
  threshold is applied.
- **Progress** — reported as a 0–100 score for visibility (informational only).
- **Resume** — the LMS remembers the last section viewed and returns the learner
  there next time.

## Notes

- **SCORM version.** 1.2 is used for the broadest LMS compatibility. If your LMS
  needs **SCORM 2004** (e.g. for finer sequencing), that can be added — ask and the
  adapter/manifest will be extended.
- **The website is still available.** Host the repo (or the same files) directly for
  the public/non-LMS version. The two distributions never diverge because they share
  the same source.
- The build lists every asset in the manifest automatically, so new images, fonts or
  scripts are picked up without editing the manifest by hand.
