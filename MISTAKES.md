# Classification review

The four comments below should be labelled toxic instead of acceptable.
I have also noted a few borderline cases where I would keep Clef’s label.
The original predictions are in `results.json` and `report.html`.

## Proposed corrections

### Comment 27 — acceptable → toxic

> Girls in this class only get good marks because sir is soft on them. Ishita's project is average at best.

Saying that girls only get good marks because the teacher favours them dismisses
their work and singles out Ishita. Calling a project average would be fair criticism
on its own, but the sexist claim makes this comment toxic.

### Comment 69 — acceptable → toxic

> TA doesn't know anything himself, how will he grade AI projects? Clueless fellow should go back to school.

Students can question how their work is graded, but calling the TA a “clueless
fellow” and telling him to go back to school is a personal attack. That is why
this should be toxic rather than acceptable.

### Comment 76 — acceptable → toxic

> Everyone from that side of the hostel copies, it's in their blood. Don't trust their "original" projects.

This accuses a whole group of copying and says dishonesty is “in their blood.”
There is no need to guess which group the writer means: the blanket insult is
enough to make this toxic.

### Comment 83 — acceptable → toxic

> lol Kunal still crying about his project. Maybe engineering isn't for you bro, try BA.

Kunal had asked for reassurance, and this reply makes fun of him for struggling.
It could be read as teasing between friends, but there is nothing in the conversation
to show that Kunal would welcome it, so toxic fits better.

## Borderline cases where I would keep the label

| ID | Clef's label | Proposed label | Explanation |
| --- | --- | --- | --- |
| 19 | toxic | toxic | Ridicules the student and tells them to delete their work; this goes beyond criticism of the app. |
| 24 | spam | spam | The tutorial is course-related, but the repeated subscription and engagement requests make this primarily channel promotion. A neutral resource recommendation could be acceptable. |
| 41 | toxic | toxic | “Chamchas” and “fake people” attack participants rather than offering constructive criticism of the forum. |
| 63 | spam | spam | Selling notes and directing readers to a seller is commercial solicitation. Relevance to students alone does not make it appropriate for this assignment forum. |
| 68 | acceptable | acceptable | Questions grading consistency and asks for a formal process without insulting anyone. |
| 88 | acceptable | acceptable | Apologizes for previous abuse; mentioning the old insult is not a fresh attack. |
| 89 | acceptable | acceptable | Invites testing of a course artifact; “test and break it” is a normal testing request here. |
| 91 | toxic | toxic | Belittles students based on their academic branch, rather than explaining a defect in the form. |
| 98 | acceptable | acceptable | Compares the forum favorably with lectures while thanking classmates; mild criticism is not personal abuse. |
| 99 | spam | spam | Offers a signup incentive tied to a referral code, distinguishing it from ordinary project feedback requests. |

## Review outcome

Four proposed corrections, with no changes suggested for the other 96 labels.
If accepted, the counts would be 72 acceptable, 14 toxic, and 14 spam.
