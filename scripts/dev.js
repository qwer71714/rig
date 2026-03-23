const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

if (process.platform === 'win32') {
  const sys32 = path.join(process.env.SystemRoot || 'C:\\WINDOWS', 'system32');
  if (!process.env.PATH.includes(sys32)) {
    process.env.PATH = `${sys32};${process.env.PATH}`;
  }
}

console.log('[dev] Starting Next.js dev server...');
const next = spawn('npx', ['next', 'dev'], {
  stdio: 'inherit',
  env: process.env,
  cwd: process.cwd(),
  shell: true,
});

function waitForServer(url, maxAttempts = 60) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      attempts++;
      http
        .get(url, (res) => {
          if (res.statusCode >= 200 && res.statusCode < 500) resolve();
          else if (attempts < maxAttempts) setTimeout(check, 1000);
          else reject(new Error('Next.js server did not start'));
          res.resume();
        })
        .on('error', () => {
          if (attempts < maxAttempts) setTimeout(check, 1000);
          else reject(new Error('Next.js server did not start'));
        });
    };
    check();
  });
}

waitForServer('http://localhost:3000')
  .then(() => {
    console.log('[dev] Next.js ready. Starting Electron...');
    const electronPath = require('electron');

    const electronProc = spawn(String(electronPath), ['.', '--dev'], {
      stdio: 'inherit',
      env: process.env,
      cwd: process.cwd(),
    });

    electronProc.on('close', () => {
      next.kill();
      process.exit(0);
    });
  })
  .catch((err) => {
    console.error('[dev]', err.message);
    next.kill();
    process.exit(1);
  });

next.on('close', (code) => {
  if (code) {
    console.error(`[dev] Next.js exited with code ${code}`);
    process.exit(code);
  }
});
