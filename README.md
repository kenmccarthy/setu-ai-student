# AI at SETU — Using GenAI to Support Your Learning

A self-paced, 45–60 minute web course for **all SETU students** on using Generative AI
to support their learning — critically, responsibly and transparently. Built on the
same template as SETU's staff GenAI programme (**AI Literacy**, **AI Competency**,
**AI Fluency**), so every SETU AI course reads as one family.

> **Core message:** Use AI to support your learning — not to replace it.

## What it is

A **standalone static website** — plain HTML, CSS and JavaScript with **no build step
and no dependencies**. It runs by opening a file in a browser and can be hosted anywhere
(GitHub Pages, the SETU web server, an intranet folder, or an LMS as an embedded/uploaded
package).

## Two ways to distribute — one source

The same `index.html` + `assets/` power **both**:

1. **Standalone website** — host the folder anywhere (GitHub Pages, the SETU web
   server, an intranet). Nothing to build.
2. **SCORM package for your LMS** — run `python3 scorm/build_scorm.py` to produce
   `dist/setu-ai-student-scorm-1.2.zip`, then upload it to Moodle/Blackboard/etc.
   The LMS tracks progress, resume position and completion. See **`scorm/README.md`**.

The SCORM adapter (`assets/js/scorm.js`) is inert without an LMS, so the website version
is unaffected and the two never diverge.

```
index.html              The whole course (welcome + 10 sections + completion)
assets/css/styles.css   Design system (SETU brand tokens at the top — shared with the staff courses)
assets/js/course.js     Navigation, progress, activities, spectrums, chip sets, ratings, reflection
assets/js/scorm.js      SCORM 1.2 adapter (no-op outside an LMS)
assets/js/certificate.js Learner-generated certificate of completion
assets/fonts/           Self-hosted DM Sans + Inter (brand fonts) + fonts.css
scorm/                  Build script + packaging docs
assets/img/             SETU logo assets (light/dark) + favicon — course images are still
                        placeholders, see docs/CONTENT-TODO.md
docs/CONTENT-TODO.md    Checklist of images, links and SETU-specific content still to insert
```

## Branding

Built to the **SETU Brand Guidelines (v1, May 2022)**, matching the staff courses:
- **Colour** — Slate Grey `#435465` primary with **Grass Green** as this course's
  accent. Each course in the family takes its own colour from the SETU secondary
  palette (AI Literacy = Sea Green, AI Competency = Clover, AI Fluency = Barrow Blue,
  this student course = Grass Green). All tokens live at the top of
  `assets/css/styles.css`.
- **Typography** — DM Sans (headings) and Inter (body), self-hosted in `assets/fonts/`
  so the course is fully self-contained and works offline.
- **Logo** — master logo in the top bar (with a white variant that swaps in for dark
  mode), on the cover, on the certificate, and on the printed decision card; the crest
  symbol as the favicon.

## Sections

Welcome · Understand AI · A Learning Partner · Working Effectively with AI · AI and
Your Assessments · Academic Integrity and Transparency · Responsible AI · Protect
Yourself and Others · AI and Your Wellbeing · Your AI Decision Check · Keep Your
Thinking in the Loop — plus a completion screen. Content is drawn from the student
course development script, *AI at SETU: Using GenAI to Support Your Learning*.

## Three recurring devices

The script asks for three ideas to run through the whole course, and each has its own
component:

1. **Supports learning ↔ replaces learning** — the "Support or offload?" spectrum, and
   the cognitive-offloading thread that runs from Section 2 onwards.
2. **Ask → Explore → Check → Learn** — a four-step framework (Section 3) that gives
   students a method rather than a set of prompts to memorise.
3. **The five-question AI Decision Check** — Learning, Permission, Trust, Transparency,
   Responsibility. It is the final synthesis (Section 9), the final challenge works
   through it question by question, and it is downloadable as a one-page card.

## Features

- **Progress bar** driven by activities actually completed, not sections walked past
  (saved in the browser). See "Completion rules" below.
- **Contents panel** for jumping between sections; collapses to a drawer on mobile. A
  section shows a solid tick when finished and a dashed ring when started but not.
- **Interactive activities**, each drawn from the script:
  - **Confidence self-rating** — 1–5 scale on five statements, taken at the start and
    repeated at the end, with an inline "started at X · now Y" comparison.
  - A **multi-select chip set** — "Where is AI already in your life?" — with no right
    answer; the count is the point.
  - **Eight self-check questions** with per-option feedback, including the three
    "Same student, different rules" assessment scenarios.
  - **Two three-option spectrums** on a green → amber → red ramp: "Support or offload?"
    (five scenarios) and "Share, think first, or stop?" (six items), each with a
    discussion note per row.
  - **Progressive-reveal activities** — "Think beyond *Can I?*", the five-question final
    challenge, "Now change one thing", and the prompt-rewrite exercise.
  - **Flip cards** for the five responsible-AI considerations (bias, misinformation,
    copyright, people, environment) — the consideration on the front, why it matters
    and the question worth asking on the back.
  - The **five-question decision card**, printable on its own page with a SETU lockup.
- **Reflection notes** — spread across the course, autosaved locally, downloadable as
  a single text file at the end (including the three closing statements the script
  specifies).
- **Certificate of completion** — released only once every section is finished; the
  learner then enters their name and downloads a branded certificate (print / save as
  PDF). The LMS separately records completion via SCORM, gated on the same condition.
- Accessible (keyboard nav, skip link, focus states, reduced-motion support),
  responsive, light/dark aware, and printable to PDF.

## Completion rules

Navigation is deliberately unrestricted — students can browse ahead, and jump back to a
section a lecturer referenced. What is restricted is what counts as *progress*.

A section is finished once every activity in it has been engaged with:

| Activity | Finished when |
| --- | --- |
| Self-check question | an option is chosen (any option — these are self-checks, not an assessment) |
| Spectrum row | one of its three options is chosen |
| Flip card | it has been flipped |
| Progressive reveal | the reveal button has been clicked |
| Chip set | at least one chip is selected and the reveal clicked |
| Confidence rating row | a 1–5 value is chosen |

Reflection textareas are **not** required. They are private journalling, and compelling
free text produces filler rather than thought.

That comes to 46 activities across the eleven content sections. The progress bar reads
completed activities as a percentage of those 46, so it reaches 100% at exactly the
moment the certificate unlocks. Until then the final section shows a live checklist of
what is outstanding, with a link into each unfinished section.

Requirements are derived from the markup at load (`collectRequirements` in
`assets/js/course.js`), so adding or removing an activity in `index.html` changes what a
section demands with no list to keep in sync.

One limitation worth stating plainly: this is a static site with no server, so a
determined student with browser developer tools can bypass any of this. The gate stops
casual skipping, which is the behaviour it was built to address. The SCORM completion
call is the record that carries weight, because the LMS holds it.

## What this course changes versus the staff-course template

- It does **not** use the role-pathway tabs or the click-the-error activity (students
  aren't split by role, and no section presents a passage with planted errors).
- AI Fluency's four-option spectrum variant is replaced by **`.srow__opts--risk`**, a
  three-option green → amber → red ramp, because both of this course's spectrums run
  from safe to unsafe rather than across neutral categories.
- A **`[data-chipset]`** handler was added for the opening activity — chips with no
  right answer, tallied and revealed as a set.
- The template's printable-resource slot holds the **five-question decision card**
  instead of AI Fluency's tool-evaluation checklist, with a print-only SETU lockup
  and footer so the printed page reads as an official SETU resource.

## Run it locally

Just open `index.html` in a browser. Or serve the folder:

```bash
python3 -m http.server 8000    # then visit http://localhost:8000
```

## Before it goes live — SETU to complete

The narrated content is in place from the script. **Every image in this course is
still a placeholder** (a dashed box), because no photography or illustrations have
been supplied yet. Two sets of links are also still needed — student support contact
details, and the Blackboard/Moodle GenAI hubs — and both are flagged inside the course
itself as well as in **`docs/CONTENT-TODO.md`**. SETU's AI website, **ai.setu.ie**, is
already linked from "Where to go next".

## Notes

- In the **website** version, progress, ratings and reflections are stored in the
  visitor's own browser (`localStorage`) — nothing personal leaves the device. That
  matters more in a student course than a staff one, and the course says so on screen.
- In the **SCORM/LMS** version, completion, progress and resume position are reported to
  the LMS for record-keeping (notes still stay on the device). Rebuild the package with
  `python3 scorm/build_scorm.py` after any content edit.
