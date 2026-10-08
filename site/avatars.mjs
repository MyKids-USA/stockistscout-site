#!/usr/bin/env node
/**
 * Placeholder portraits for the eight agents: img/agents/agent-<name>.png, 240x240.
 * Each is the agent's initial on a brand gradient with a small magnifier. The real
 * cartoon portraits replace these later with the same file names (square, at least
 * 240x240); after that, do not run this script again or it overwrites them.
 *
 *   node site/avatars.mjs        (needs Google Chrome and macOS sips)
 */
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { AGENTS, avatar } from './shell.mjs';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'img', 'agents');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
mkdirSync(OUT, { recursive: true });
const tmp = join(tmpdir(), 'ss-avatars');
mkdirSync(tmp, { recursive: true });

AGENTS.forEach((a, i) => {
  const html = join(tmp, `${i}.html`);
  const big = join(tmp, `${i}.png`);
  writeFileSync(html, `<!doctype html><html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@800&display=swap"><style>html,body{margin:0;background:#fff}svg{display:block;width:600px;height:600px}</style></head><body>${avatar(a.name, i, 600).replace('<circle cx="32" cy="32" r="32"', '<rect width="64" height="64"')}</body></html>`);
  execFileSync(CHROME, ['--headless=new', '--hide-scrollbars', '--virtual-time-budget=3000', '--window-size=600,600', `--screenshot=${big}`, `file://${html}`], { stdio: 'ignore' });
  execFileSync('sips', ['-Z', '240', big, '--out', join(OUT, `agent-${a.name.toLowerCase()}.png`)], { stdio: 'ignore' });
});
rmSync(tmp, { recursive: true });
console.log(`avatars: ${AGENTS.length} placeholders in img/agents`);
