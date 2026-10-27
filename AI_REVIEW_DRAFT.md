# AI review draft — requires your own review

Prepared by Codex (GPT-6 Astra) on 27 October 2026 at the applicant's request.
This is an AI-generated second opinion, not the applicant's independent judgment
or an authoritative answer key. The README requires the applicant to review every
comment personally. Do not submit this draft as evidence of that independent review.

I compared all 100 comments in `comments.json` with the saved `clef-flash`
predictions in `results.json`, using the criteria recorded in that results file.
I propose four changes, all from **acceptable** to **toxic**. I agree with the
remaining 96 labels under those criteria, with the context-sensitive cases below.
The original predictions have not been changed. At the applicant's subsequent
request, the proposed corrections were also recorded in `MISTAKES.md`, explicitly
labeled AI-authored.

## Proposed mistakes

### Comment 27

> Girls in this class only get good marks because sir is soft on them. Ishita's project is average at best.

- **Clef's label:** acceptable
- **Proposed label:** toxic
- **Why:** The comment dismisses female students' achievements with a sexist
  generalization and singles out Ishita to support it. Criticizing a project or
  asking about grading would be acceptable, but attributing girls' success only
  to preferential treatment makes this a group-directed attack.
- **Borderline?** The project criticism alone could be acceptable; the full
  comment contains discriminatory disparagement.

### Comment 69

> TA doesn't know anything himself, how will he grade AI projects? Clueless fellow should go back to school.

- **Clef's label:** acceptable
- **Proposed label:** toxic
- **Why:** Calling the TA a "clueless fellow" and telling him to go back to school
  is a personal insult. A specific concern about grading competence could be
  legitimate feedback, but this wording attacks and belittles the person.
- **Borderline?** Criticism of staff is allowed; the explicit insult is what
  moves this comment across the boundary.

### Comment 76

> Everyone from that side of the hostel copies, it's in their blood. Don't trust their "original" projects.

- **Clef's label:** acceptable
- **Proposed label:** toxic
- **Why:** This accuses an entire group of dishonesty and presents copying as
  an inherent trait through "it's in their blood." It is hostile stereotyping,
  rather than a specific, evidence-based report of plagiarism.
- **Borderline?** The phrase "that side of the hostel" does not establish a
  caste, religion, region, or other protected identity, and none should be
  inferred. The group-directed hostility is enough under the stated toxic criteria.

### Comment 83

> lol Kunal still crying about his project. Maybe engineering isn't for you bro, try BA.

- **Clef's label:** acceptable
- **Proposed label:** toxic
- **Why:** The comment mocks a named student for struggling and belittles his
  ability instead of offering feedback. In the surrounding discussion, Kunal
  asked for reassurance; this reply turns that vulnerability into ridicule.
- **Borderline?** Friends sometimes tease each other, but the supplied conversation
  gives no evidence of mutually welcome banter. I would treat this as targeted humiliation.

## Context-sensitive labels I would keep

These are review notes, not additional claimed mistakes.

| ID | Clef label / proposed label | Reason and boundary |
| --- | --- | --- |
| 14 | acceptable / acceptable | Criticizes the assignment's difficulty and suggests a grading change without attacking a person. |
| 19 | toxic / toxic | "Delete it and save us the embarrassment" ridicules the student; there is no actionable feedback. Informal language and an emoji do not make the humiliation harmless. |
| 24 | spam / spam | The tutorial is course-related, but repeated subscription and engagement requests make the post primarily channel promotion. A neutrally shared, useful tutorial could be acceptable under a different wording or explicit resource-sharing policy. |
| 29, 30 | acceptable / acceptable | Raise a genuine group-work contribution problem and ask about process without insulting the non-contributor. Contrast this with comment 31's direct insults. |
| 41 | toxic / toxic | "Chamchas" means sycophants in this context, reinforced by calling participants "fake people." This attacks the forum participants rather than explaining a problem with the feedback culture. |
| 42, 43 | acceptable / acceptable | A criticism of AI-assisted learning followed by civil disagreement. Neither disagreement nor a negative opinion alone makes a comment toxic. |
| 63 | spam / spam | It solicits sales of notes and directs readers to an Instagram seller. Student relevance does not by itself make a commercial solicitation appropriate for this assignment forum; an explicit marketplace policy could change that decision. |
| 68 | acceptable / acceptable | Alleges inconsistent grading and asks for re-evaluation procedures without personal abuse. Moderation does not require deciding whether the allegation is true. |
| 88 | acceptable / acceptable | Explicitly apologizes for earlier abuse and offers a positive assessment. Mentioning the previous insult does not make the apology a new attack. |
| 89 | acceptable / acceptable | Requests testing of the student's assignment artifact. "Test and break it" describes invited software testing in this context, not a threat or an unrelated promotion. |
| 91 | toxic / toxic | Mocks mechanical-branch students as a group and tells them to stay away from coding. The label does not depend on treating academic branch as a protected identity. |
| 98 | acceptable / acceptable | Thanks classmates while making a mild comparison with lectures. It does not personally insult the lecturer. |
| 99 | spam / spam | Offers a signup reward tied to a referral code. That acquisition incentive distinguishes it from a request for feedback on a course artifact. |

## What the pattern suggests

All four proposed errors are missed personal or group-directed attacks. In this
run Clef recognized several explicit insults and threats, but also accepted some
belittling or stereotyped statements. This is a finding about this small synthetic
dataset, not proof of the model's general behavior.

Confidence alone would not reliably identify the proposed mistakes:

| Comment | Clef confidence, rounded |
| --- | ---: |
| 27 | 0.794 |
| 69 | 0.939 |
| 76 | 0.496 |
| 83 | 0.881 |

These are the API's confidence values, not measured probabilities of being correct.
For comparison, comment 91 has confidence 0.395, yet I agree with its toxic label.
Reviewing only low-confidence predictions would miss three of the four proposed
corrections if the cutoff were 0.5.

If all four changes are accepted, the label counts would become **72 acceptable,
14 toxic, and 14 spam**, versus Clef's **76 acceptable, 10 toxic, and 14 spam**.
The resulting 96/100 agreement with this AI review is not a verified accuracy score;
there is no independent human answer key in this repository.

## Your next step

Read every original comment and decide for yourself. For each mistake you identify,
write its ID, original label, your label, and your own short explanation in
`MISTAKES.md`; explain your choice for borderline cases. Disclose this AI review
assistance in `NOTES.md`, and write the personal reflection yourself.
