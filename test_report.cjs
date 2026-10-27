// Compatibility entry point for the full shadcn report interaction tests.
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const test = spawnSync(process.execPath, ['--test', path.join(__dirname, 'ui/test/report.test.mjs')], { stdio: 'inherit' });
process.exit(test.status ?? 1);
