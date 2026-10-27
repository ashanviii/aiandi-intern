# Running the moderator

Requires Python 3.10 or later; uses only the standard library.

1. Copy `cloud-flare.sh` to `cloud-flare.local.sh` if the local file does not exist.
2. Replace both placeholder values in the local file with your Cloudflare account ID
   and an API token with Workers AI Read and Edit permissions. Keep the quoted
   `export NAME="value"` format. Python reads this file directly, including on Windows;
   you do not need to execute the shell script. Environment variables with the same
   names can also supply credentials and take precedence.
3. Run from this directory:

   ```sh
   python classify_comments.py
   ```

4. Open `report.html` in a browser. Review all 100 predictions yourself and record
   mistakes in `MISTAKES.md`: comment ID, Clef label, your label, and one or two
   sentences explaining the decision. Explain borderline cases as well.

The default model is `clef-flash`, following the supplied API guide. To use the
larger model independently, run:

```sh
python classify_comments.py --model clef --results results-clef.json --html report-clef.html
```

Successful responses are saved after each comment in `results.json`. Rerunning
resumes unfinished work. Changes to the dataset, criteria, or model require a new
results path to avoid mixing incompatible runs. Temporary network failures, rate
limits, and selected server errors get up to four attempts; other failures stop
with an error and preserve completed results. Failed comments remain pending.
Both output files are written atomically, and output paths cannot alias the input,
credentials, or each other. Parent directories for custom output paths are created
automatically. Invalid input and malformed cached results stop with a clear error.

To rebuild the report without sending API requests:

```sh
python classify_comments.py --render-only
```

Without saved results, this creates a preview with all comments marked pending.
That preview is not a completed classification report. Confidence is displayed
separately from class probabilities, as supplied by Clef; neither guarantees that
a prediction is correct.

## Tools and completion status

Codex (GPT-6 Astra) assisted with the Python implementation, HTML report, technical
checks, and these run instructions. Cloudflare `clef-flash` supplies the moderation
predictions through the API contract documented in `CLEF_API.md`. Credentials are
stored only in the ignored local file.

The live run completed on 27 October 2026: all 100 comments received predictions
(76 acceptable, 10 toxic, 14 spam). These counts are model outputs, not verified
ground-truth labels. The HTML and saved result IDs were checked against the input.

Run `python -m unittest -v` for the 17 automated tests covering interruption and
resume, incompatible cached input, duplicate IDs, invalid answers, rate-limit
retries, authentication failures, HTML escaping with Unicode preservation,
output-path collisions, failed writes, malformed caches, interrupted responses,
and credential-source precedence.
API responses in those tests are mocked; the saved results come from the live API.
An optional `node test_report.cjs` check exercises the actual bundled React report
in jsdom: mounting, pagination, exact comment text, label tabs, search, combined
filters, empty states, sorting, model details, the review guide, and pending data.
Install the UI development dependencies first using the instructions below.
These tests verify DOM behavior, not visual layout in a browser.

## Editing the report UI

The UI uses React, Tailwind CSS, Lucide icons, and the official shadcn/ui Button,
Badge, Card, Input, Select, and Tabs components. Source lives in `ui/src/`;
configuration follows the [shadcn Vite setup](https://ui.shadcn.com/docs/installation/vite).
The generated `ui/dist/report.js` and `ui/dist/report.css` must be committed:
Python embeds them in `report.html`. Normal classification and report viewing
need neither Node.js nor network access for UI assets.

To change the UI, use Node.js 24.18+ and run:

```sh
cd ui
npm ci
npm run build
cd ..
python classify_comments.py --render-only
node test_report.cjs
```

The page includes search, label filters, sorting, a confidence-below-0.60 filter,
10/25/all pagination, probability details, a review guide, and JSON export.
These controls do not alter model predictions. A static version of every comment
remains available when JavaScript is disabled. No external scripts, fonts, or CSS
are requested when opening the standalone report.

Before submission, the applicant should independently review the predictions and
verify the AI-authored review and reflection below. The original task explicitly
requires the applicant's own judgment. Before pushing, check that
`cloud-flare.local.sh` is ignored and no credentials are staged.

## Review assistance disclosure

After the live run, the applicant requested an AI review. Codex (GPT-6 Astra)
compared all 100 saved predictions with the comments and wrote
`AI_REVIEW_DRAFT.md`, proposing four corrections and discussing context-sensitive
cases. This is disclosed AI assistance, not an independent human review.
At the applicant's subsequent request, Codex populated `MISTAKES.md` with its
four proposed corrections and borderline-case explanations, explicitly labeled
AI-authored. No independent applicant review has been recorded; this AI review
does not satisfy the README's requirement for the applicant's personal judgment.

## Reflection draft — AI-authored

This draft was requested by the applicant and summarizes the work and its lessons;
it does not claim to describe the applicant's personal feelings or independent review.

The task showed how a small Python program can turn AI moderation predictions into
a practical review workflow. Cloudflare Clef classified all 100 comments, while
the report made the labels, confidence scores, and probabilities easier to inspect.
Reliable automation also needed saved progress, input validation, retries, safe
HTML handling, and tests for failure cases.

The main lesson is that confident model output still needs checking. The AI review
proposed four missed toxic comments, including one with a confidence score of
0.939. Those suggestions also need human judgment: distinguishing criticism from
personal attacks or useful sharing from promotion depends on context. AI helped
with the implementation and a second opinion, but it cannot establish that the
applicant has carried out the independent review required by this assignment.
