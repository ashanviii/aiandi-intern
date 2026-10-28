# Review notes

## Proposed mistakes

### Comment 27

> Girls in this class only get good marks because sir is soft on them. Ishita's project is average at best.

- **Clef's label:** acceptable
- **Proposed label:** toxic
- **Why:** The comment says girls only succeed because the teacher favours them, then
  singles out Ishita. Criticising her project is one thing; dismissing the whole
  group’s work because of gender is what makes this toxic.
- **Borderline?** The project criticism alone could be acceptable; the full
  comment contains discriminatory disparagement.

### Comment 69

> TA doesn't know anything himself, how will he grade AI projects? Clueless fellow should go back to school.

- **Clef's label:** acceptable
- **Proposed label:** toxic
- **Why:** The writer can question the grading, but “clueless fellow” and “go back
  to school” are personal insults rather than useful feedback.
- **Borderline?** Criticism of staff is allowed; the explicit insult is what
  moves this comment across the boundary.

### Comment 76

> Everyone from that side of the hostel copies, it's in their blood. Don't trust their "original" projects.

- **Clef's label:** acceptable
- **Proposed label:** toxic
- **Why:** Saying everyone in a group copies and that it is “in their blood” is a
  blanket insult. It does not raise a specific plagiarism concern that can be checked.
- **Borderline?** The phrase "that side of the hostel" does not establish a
  caste, religion, region, or other protected identity, and none should be
  inferred. The group-directed hostility is enough under the stated toxic criteria.

### Comment 83

> lol Kunal still crying about his project. Maybe engineering isn't for you bro, try BA.

- **Clef's label:** acceptable
- **Proposed label:** toxic
- **Why:** Kunal had asked for reassurance about his project. This reply mocks him
  for struggling and suggests he does not belong in engineering.
- **Borderline?** Friends sometimes tease each other, but the supplied conversation
  does not show that Kunal would welcome it. I would treat this as a personal attack.

## Other labels worth a closer look

These comments need some context, but I would keep their current labels.

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

## What stood out

All four missed comments attack a person or a group. Clef caught several other
insults and threats, but let these through. That is a useful pattern in this set
of comments, although it is too small a sample to judge the model overall.

Confidence alone would not reliably identify the proposed mistakes:

| Comment | Clef confidence, rounded |
| ---     | ---   |
| 27      | 0.794 |
| 69      | 0.939 |
| 76      | 0.496 |
| 83      | 0.881 |

These are the API's confidence values, not measured probabilities of being correct.
For comparison, comment 91 has confidence 0.395, yet I agree with its toxic label.
Reviewing only low-confidence predictions would miss three of the four proposed
corrections if the cutoff were 0.5.

If all four changes are accepted, the label counts would become **72 acceptable,
14 toxic, and 14 spam**, versus Clef's **76 acceptable, 10 toxic, and 14 spam**.
That means this review agrees with 96 of Clef’s 100 labels. This is not a verified
accuracy score, since the repository does not include an answer key.
