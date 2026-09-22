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
- [x] **SETU's AI website** (Section 10, *Keep Your Thinking in the Loop*) —
  https://ai.setu.ie now leads the "Where to go next" list.
- [ ] **GenAI hub links** (Section 10, *Keep Your Thinking in the Loop*) — the
  Blackboard and Moodle GenAI hubs, and a direct link to the *SETU Student
  Guidelines for the Use of Generative AI*. The script points students to these
  repeatedly, so the links matter more here than anywhere else in the course.

## 3. Contents-panel links (resolved)

- [x] The contents panel used to link the three **staff** courses (AI Literacy, AI
  Competency, AI Fluency) at their `setu.potential.ly` playlist URLs. Removed in
  review as staff-facing; the panel now carries a single link to **ai.setu.ie**
  under the heading "Find out more". The `.btn--literacy` / `--competency` /
  `--fluency` colour rules went with them, so re-adding any of those buttons means
  restoring the matching rule in `styles.css`.
- [ ] Once this course has a hosted URL, consider adding it to the same block in
  the three staff-course repos if you want the link to be reciprocal.

## 4. Completion / certificate

- [ ] **Certificate wording** — reads "AI at SETU: Using GenAI to Support Your
  Learning", with "SETU Student Course" as the course line. If you want a signatory
  line (e.g. a name/title) or a QR/verify note, say so and it can be added. The
  learner types their own name; the LMS also records completion via SCORM.

- [ ] **Confirm the completion requirement.** The certificate is now released only when
  all eleven content sections are finished, and a section is finished when every
  activity in it has been engaged with — 46 activities in total. Reflection textareas
  are deliberately not required. The full rules are in the README under "Completion
  rules"; the working group should confirm the requirement is proportionate before
  go-live. The lightest sections are Understand AI, Working Effectively and Your
  Wellbeing (one activity each); the heaviest is Responsible AI (nine).

  Raised in review: a student could previously click the last section in the contents
  list, enter a name and download a certificate without opening any content — and that
  click also ticked every earlier section and reported 100% completion to the LMS. Both
  are fixed. Navigation stays unrestricted by choice: students can still look ahead and
  jump back, since locking sections blocks legitimate use and is a recurring
  accessibility complaint. Only the reporting changed.

  Note for the LMS deployment: because any browser-side gate can be bypassed with
  developer tools, the SCORM completion call is the record that matters. It is now
  gated on the same condition as the certificate, so a skipped course is no longer
  recorded in Blackboard or Moodle as finished.

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

## 9. Review changes applied (September 2026)

From the first round of SETU feedback on the student course:

1. Banner copy rewritten (the original repeated "learning" three times); a full stop
   was added to close the sentence.
2. Banner reduced to the timing stat alone — the section and activity counts are gone.
3. Welcome bullet 3 now says "GenAI" rather than "Generative AI". The two quoted
   assessment instructions elsewhere (Assessment 3 in *Your Assessments*, and "Now
   change one thing" in *Your AI Decision Check*) deliberately keep "Generative AI" —
   they are verbatim quotes of what a lecturer would write.
4. Colon added to "Because ultimately:".
5. "weigh" → "consider" in the last confidence statement, in both the start and end
   ratings (the two labels must stay identical for the start/end comparison to read).
6. "Includes a decision" removed from *Understand AI*'s meta row.
7. *Support or offload?* intro reworded for grammar, and the middle option relabelled
   "It depends" → "Depends on the purpose". Every row's discussion note turns on the
   purpose of the task, so the middle option now names a real position rather than
   acting as a shrug. The notes still commit to a verdict for all five scenarios, so
   "depends" is never the expected answer.
8. The five responsible-AI considerations became flip cards. This also fixed a latent
   bug in the shared `.flip-card` CSS: the inner grid collapsed to its own content, so
   cards in a row had ragged heights. `.flip-card, .flip-card__inner { height: 100% }`
   — worth porting back to the staff courses if they hit the same thing.
9. Reveal buttons now set `text-align: left` (`.btn[data-reveal-simple]`). Question 4
   in the final challenge wraps to two lines and was centring against its single-line
   neighbours.
10. Added https://ai.setu.ie to "Where to go next". This introduced the first
    body-copy link in the course, so a link style came with it — `--info` (Barrow
    Blue) rather than `--accent`, because Grass Green on white doesn't reach WCAG AA
    for text.

Still open from this round: whether ai.setu.ie should also appear in the contents
panel's "SETU AI Courses" block, alongside the three staff courses.
