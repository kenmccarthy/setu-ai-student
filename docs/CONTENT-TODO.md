# Content to insert before go-live — SETU checklist

The course content and interactions are in place, built from the *AI at SETU:
Using GenAI to Support Your Learning* student development script (Dr Hazel
Farrell). The items below are what's still needed before go-live. Search the
codebase for `figure__slot` to find every image slot, and `placeholder__flag`
for every open item flagged in the course itself.

## 1. Images (you are supplying these)

Every slot is a `<figure class="figure">` with a dashed placeholder — none of this
course's images exist yet. To fill one, replace the inner
`<div class="figure__slot">…</div>` with `<img class="figure__img" src="assets/img/your-file.jpg"
alt="…">` (plus an optional `<figcaption>`). Recommended: SETU photography style
(shallow depth of field, natural light, authentic, inclusive), matching the staff
courses — and, since this is the student course, **students** rather than staff.
Suggested sizes below (all can be larger; keep the aspect ratio).

| Section | Where | Suggested size / ratio |
|---|---|---|
| Welcome | Banner under the hero | 1600×540 (3:1) |
| 1. Understand AI | Header illustration | 1200×675 (16:9) |
| 2. A Learning Partner | Header illustration | 1200×675 (16:9) |
| 3. Working Effectively | Header illustration | 1200×675 (16:9) |
| 4. Your Assessments | Header illustration | 1200×675 (16:9) |
| 5. Integrity and Transparency | Header illustration | 1200×675 (16:9) |
| 6. Responsible AI | Header illustration | 1200×675 (16:9) |
| 7. Protect Yourself and Others | Header illustration | 1200×675 (16:9) |
| 8. Your Wellbeing | Header illustration | 1200×675 (16:9) |
| 10. Keep Your Thinking in the Loop | Reflective/closing image | 1200×675 (16:9) |

Section 9 (Your AI Decision Check) has no image slot by design — the five-question
card is the visual of that section.

## 2. Links and contact details still to add

Both are marked in the course with a dashed `.placeholder` block, so they are
visible to anyone reviewing the course rather than buried in this file.

- [ ] **Student support contact details or links** (Section 8, *Your Wellbeing*) —
  Class Tutor, Student Services, Counselling Service, Students' Union, Centre for
  Academic Practice, IT Services. The tiles name each service; they need somewhere
  to go.
- [ ] **GenAI hub links** (Section 10, *Keep Your Thinking in the Loop*) — the
  Blackboard and Moodle GenAI hubs, and a direct link to the *SETU Student
  Guidelines for the Use of Generative AI*. The script points students to these
  repeatedly, so the links matter more here than anywhere else in the course.

## 3. Cross-course navigation (confirm)

- [ ] The contents panel links to the three **staff** courses (AI Literacy, AI
  Competency, AI Fluency) at their `setu.potential.ly` playlist URLs, under the
  heading "SETU AI Courses". Confirm you want students pointed at the staff
  programme; if not, swap that block for student-facing links (the GenAI hubs, the
  Student Guidelines, the Academic Integrity course). It's one `<nav
  class="course-links">` block in `index.html`.
- [ ] Once this course has a hosted URL, add it to the same block in the three
  staff-course repos if you want the link to be reciprocal.

## 4. Completion / certificate

- [ ] **Certificate wording** — reads "AI at SETU: Using GenAI to Support Your
  Learning", with "SETU Student Course" as the course line. If you want a signatory
  line (e.g. a name/title) or a QR/verify note, say so and it can be added. The
  learner types their own name; the LMS also records completion via SCORM.

## 5. Attribution (done — confirm)

- [x] The `.credits` line on the Done screen names the script author (Dr Hazel
  Farrell) and the Centre for Academic Practice, matching the staff courses'
  convention. Unlike those courses it does **not** credit ChatGPT-generated images,
  because no images have been supplied yet — add that credit if the images you
  supply are AI-generated.

## 6. Branding (done — confirm)

- [x] Built on the same template, tokens and terminology as the staff courses:
  **courses + sections** (no "module"/"stage"/"hub" as structural terms).
- [x] SETU logo, Slate Grey + secondary palette, DM Sans/Inter fonts (copied from
  the AI Fluency `assets/`).
- [x] Accent colour set to **Grass Green** (`--accent-base: var(--grass-green)`),
  the fourth colour taken from the SETU secondary palette across the family
  (AI Literacy = Sea Green, AI Competency = Clover, AI Fluency = Barrow Blue).
- [x] Worth a final visual check once real images are in place — particularly the
  cover hero, where the Slate Grey → Grass Green gradient sits behind the title.
- [ ] Optional: replace the extracted PNG logos with official **SVG/EPS** vector
  files (same optional item as the staff courses).

## 7. Differences from the staff-course template (for future maintainers)

- This course does **not** use the `.pathway`/`.ptab` role-tabs component — students
  aren't split by role — or the `.trust`/`.flag` click-the-error component (no
  section presents a passage with planted errors). Both handlers were removed from
  `course.js`; their CSS remains in `styles.css` as part of the shared design system.
- It does **not** use the four-option spectrum variant (`.srow__opts--4`) that
  AI Fluency added. That block was replaced by **`.srow__opts--risk`**, a
  three-option green → amber → red ramp used by both of this course's spectrum
  activities ("Support or offload?" and "Share, think first, or stop?"), where the
  options run from safe to unsafe rather than across neutral categories.
- A **`[data-chipset]`** handler was added to `course.js` for the opening "Where is
  AI already in your life?" activity. It differs from Course 1's "Which of these are
  AI?" chips in that there is no right answer — it tallies what you selected and
  reveals a single piece of feedback for the set.
- The printable-resource slot in the template (AI Fluency's *AI Tool Evaluation
  Checklist*) is used here for the **five-question decision card**, which the script
  specifically asks for. It reuses the `.checklist` component and the same
  print-on-its-own mechanism, plus a print-only SETU lockup and footer line
  (`.checklist__logo` / `.checklist__foot`) so the printed card reads as an official
  SETU resource.

## 8. Optional / general

- [ ] AI working group to review all sections for accuracy and SETU tone.
- [ ] Accessibility sign-off against SETU's WCAG target.
- [ ] After any edit, rebuild the SCORM package: `python3 scorm/build_scorm.py`.
