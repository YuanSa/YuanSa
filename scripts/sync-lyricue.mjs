import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const release = JSON.parse(readFileSync(join(root, 'scripts/lyricue-release.json'), 'utf8'));
if (!/^[a-f0-9]{40}$/.test(release.revision)) throw new Error('Pin a full Lyricue commit SHA before updating.');
const temporary = mkdtempSync(join(tmpdir(), 'yuansa-lyricue-'));
const run = (command, args, cwd) => execFileSync(command, args, { cwd, stdio: 'inherit' });

try {
  let repository = process.argv[2] && resolve(process.argv[2]);
  if (!repository) {
    repository = join(temporary, 'upstream');
    run('git', ['clone', '--quiet', '--no-checkout', release.repository, repository], temporary);
  }
  // Export the pinned commit, never local changes or an existing build directory.
  const source = join(temporary, 'source');
  mkdirSync(source);
  const archive = execFileSync('git', ['archive', '--format=tar', release.revision], { cwd: repository, maxBuffer: 32 * 1024 * 1024 });
  execFileSync('tar', ['-xf', '-', '-C', source], { input: archive });
  const pkg = JSON.parse(readFileSync(join(source, 'package.json'), 'utf8'));
  if (pkg.name !== 'lyricue' || pkg.version !== release.version || pkg.license !== 'MIT') throw new Error('Unexpected Lyricue release.');
  run('npm', ['ci', '--no-audit', '--no-fund'], source);
  run('npm', ['run', 'build:demo'], source);
  const built = join(source, 'demo-dist');
  const html = readFileSync(join(built, 'index.html'), 'utf8');
  const references = [...html.matchAll(/(?:src|href)="(\.\/assets\/[^\"]+)"/g)].map(match => match[1]);
  if (!references.length || references.some(path => !existsSync(join(built, path)))) throw new Error('Demo assets are missing.');
  if (/<(?:script|link)[^>]+(?:src|href)="https?:\/\//.test(html)) throw new Error('Demo must load its scripts and styles locally.');
  const files = readdirSync(join(built, 'assets'));
  if (!files.some(file => file.endsWith('.mp3'))) throw new Error('Demo audio is missing.');

  const target = join(root, 'website/projects/lyricue');
  mkdirSync(target, { recursive: true });
  // Only replace the generated demo directory, leaving the rest of the site alone.
  rmSync(join(target, 'assets'), { recursive: true, force: true });
  cpSync(join(built, 'assets'), join(target, 'assets'), { recursive: true });
  cpSync(join(built, 'index.html'), join(target, 'index.html'));
  cpSync(join(source, 'LICENSE'), join(target, 'LICENSE.txt'));
  writeFileSync(join(target, 'release.json'), `${JSON.stringify(release, null, 2)}\n`);
  console.log(`Hosted Lyricue ${release.version} at /projects/lyricue/ (${files.length} bundled assets).`);
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
