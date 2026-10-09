// node capture.mjs video out.mp4 [fps] [from] [to]   |   node capture.mjs stills dir t1 t2 ...
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const [mode, out, ...rest] = process.argv.slice(2);
const FFMPEG = '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2';
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 720, height: 1280 } });
page.on('console', m => { if (m.type() === 'error') console.error('page:', m.text()); });
page.on('pageerror', e => console.error('pageerror:', e.message));
await page.goto('http://127.0.0.1:8765/scene.html');
await page.waitForFunction('window.ready === true', null, { timeout: 60000 });

if (mode === 'stills') {
  for (const t of rest) {
    await page.evaluate(x => window.renderAt(x), Number(t));
    writeFileSync(`${out}/s${t}.png`, await page.screenshot({ type: 'png' }));
  }
} else {
  const fps = Number(rest[0] || 30), from = Number(rest[1] || 0), to = Number(rest[2] || 60);
  const ff = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-crf', '18', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round((to - from) * fps); const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    await page.evaluate(x => window.renderAt(x), from + i / fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 150 === 0) console.log(`frame ${i}/${n} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
}
await browser.close();
