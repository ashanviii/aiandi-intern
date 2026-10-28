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
