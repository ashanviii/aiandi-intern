import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';

const html = readFileSync(new URL('../../report.html', import.meta.url), 'utf8');
const source = JSON.parse(readFileSync(new URL('../../comments.json', import.meta.url), 'utf8'));
const results = JSON.parse(readFileSync(new URL('../../results.json', import.meta.url), 'utf8')).results;
const pause = () => new Promise(resolve => setTimeout(resolve, 35));
async function open(t, markup = html) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => errors.push(error.message));
  const dom = new JSDOM(markup, { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole,
    beforeParse(window) {
      window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
      window.HTMLElement.prototype.scrollIntoView = function () {};
      window.HTMLElement.prototype.hasPointerCapture = () => false;
      window.HTMLElement.prototype.setPointerCapture = () => {};
      window.HTMLElement.prototype.releasePointerCapture = () => {};
    },
  });
  t.after(() => dom.window.close());
  for (let i = 0; i < 30 && !dom.window.document.querySelector('#report-app h1'); i++) await pause();
  assert.deepEqual(errors, [], 'The embedded UI should execute without runtime errors.');
  assert.ok(dom.window.document.querySelector('#report-app h1'), 'React UI mounted');
  await pause();
  return dom.window;
}
const root = window => window.document.getElementById('report-app');
const rows = window => [...root(window).querySelectorAll('article')];
const button = (window, label) => root(window).querySelector(`[aria-label="${label}"]`);
async function search(window, value) {
  const input = button(window, 'Search comments');
  Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(input, value);
  input.dispatchEvent(new window.Event('input', { bubbles: true }));
  await pause();
}
async function choose(window, label, value) {
  button(window, label).dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
  await pause();
  const option = [...window.document.querySelectorAll('[role="option"]')].find(node => node.textContent.includes(value));
  assert.ok(option, `Option ${value} exists`);
  option.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  await pause();
}

test('standalone shadcn app mounts, paginates, and retains all exact comment text', async t => {
  const window = await open(t);
  assert.equal(window.document.getElementById('report-fallback').hidden, true);
  assert.equal(rows(window).length, 10);
  assert.equal(rows(window)[0].id, 'comment-1');
  button(window, 'Next page').click(); await pause();
  assert.equal(rows(window)[0].id, 'comment-11');
  await choose(window, 'Comments per page', 'Show all');
  assert.equal(rows(window).length, source.comments.length);
  for (const row of source.comments) {
    const article = root(window).querySelector(`#comment-${row.id}`);
    assert.equal(article.querySelector('.comment-copy').textContent, row.comment);
    assert.equal(article.dataset.label, results[String(row.id)].choice);
  }
  assert.equal(window.document.querySelectorAll('script[src],link[rel="stylesheet"]').length, 0);
});

test('shadcn tabs, search, combined filtering, and empty-state reset work', async t => {
  const window = await open(t);
  const spam = [...root(window).querySelectorAll('[role="tab"]')].find(node => node.textContent.startsWith('Spam'));
  spam.dispatchEvent(new window.MouseEvent('mousedown', { bubbles: true, button: 0 })); await pause();
  assert.ok(rows(window).every(row => row.dataset.label === 'spam'));
  assert.match(root(window).querySelector('[role="status"]').textContent, /14 comments/);
  await search(window, 'Aditya');
  assert.equal(rows(window).length, 0);
  [...root(window).querySelectorAll('button')].find(node => node.textContent === 'Reset filters').click(); await pause();
  await search(window, 'ADITYA');
  assert.equal(rows(window).length, 3);
  button(window, 'Clear search').click(); await pause();
  assert.equal(rows(window).length, 10);
});

test('confidence filter, sort, model details, and guide work', async t => {
  const window = await open(t);
  root(window).querySelector('button[aria-pressed]').click(); await pause();
  const expected = Object.entries(results).filter(([, answer]) => answer.confidence < .6).map(([id]) => `comment-${id}`);
  assert.deepEqual(rows(window).map(row => row.id).sort(), expected.sort());
  await choose(window, 'Sort comments', 'Lowest confidence');
  assert.equal(rows(window)[0].id, 'comment-91');
  assert.match(rows(window)[0].querySelector('details').textContent, /Acceptable.*Toxic.*Spam/);
  [...root(window).querySelectorAll('button')].find(node => node.textContent === 'Guide').click(); await pause();
  assert.ok(root(window).querySelector('section[aria-label="Review guide"]'));
});

test('pending preview remains usable', async t => {
  const payload = JSON.parse(html.match(/id="report-data">([\s\S]*?)<\/script>/)[1]);
  payload.results = {}; payload.updated_at = null;
  const markup = html.replace(/(id="report-data">)[\s\S]*?(<\/script>)/, (_, start, end) => start + JSON.stringify(payload).replaceAll('<', '\\u003c') + end);
  const window = await open(t, markup);
  assert.ok(rows(window).every(row => row.dataset.label === 'pending'));
  assert.match(root(window).textContent, /0 of 100 comments processed/);
});

test('export contains the full dataset and predictions', async t => {
  const window = await open(t);
  let savedBlob;
  window.URL.createObjectURL = blob => { savedBlob = blob; return 'blob:local-test'; };
  window.URL.revokeObjectURL = () => {};
  let filename;
  window.document.addEventListener('click', event => {
    if (event.target.tagName === 'A') { filename = event.target.download; event.preventDefault(); }
  });
  [...root(window).querySelectorAll('button')].find(node => node.textContent === 'Export results').click();
  await pause();
  assert.equal(filename, 'clef-review-results.json');
  const text = await new Promise(resolve => {
    const reader = new window.FileReader(); reader.onload = () => resolve(reader.result); reader.readAsText(savedBlob);
  });
  const exported = JSON.parse(text);
  assert.equal(exported.comments.length, 100);
  assert.deepEqual(exported.results, results);
});

test('HTML-like comments remain text in the React UI', async t => {
  const payload = JSON.parse(html.match(/id="report-data">([\s\S]*?)<\/script>/)[1]);
  const hostile = '</script><img src=x onerror="window.injected=true"> हिंदी ₹';
  payload.comments[0].comment = hostile;
  const markup = html.replace(/(id="report-data">)[\s\S]*?(<\/script>)/, (_, start, end) => start + JSON.stringify(payload).replaceAll('<', '\\u003c') + end);
  const window = await open(t, markup);
  assert.equal(rows(window)[0].querySelector('.comment-copy').textContent, hostile);
  assert.equal(root(window).querySelectorAll('img').length, 0);
  assert.equal(window.injected, undefined);
});
