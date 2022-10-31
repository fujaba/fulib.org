import fs from 'fs/promises';
import child_process from 'child_process';

const text = await fs.readFile('../frontend/src/assets/projects/code-server-images.json', 'utf8');
const images = JSON.parse(text);
const argv = new Set(process.argv.slice(2));

async function run(cmd, ...args) {
  console.log(cmd, ...args);
  const child = child_process.execFile(cmd, args);
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  return new Promise((resolve, reject) => {
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${cmd} exited with code ${code}`));
      }
    });
  });
}

async function build({tag, dockerfile, args}) {
  await run('docker',
    'build',
    '-t',
    tag,
    '-f',
    dockerfile,
    ...Object.entries(args).filter(([, v]) => v).flatMap(([k, v]) => ['--build-arg', `${k}=${v}`]),
    '.',
  );
  await run('docker', 'push', tag);
}

await build({
  tag: 'registry.uniks.de/fulib/code-server-base',
  dockerfile: 'base/Dockerfile',
  args: {},
});
await Promise.all(images.filter((image) => image.dockerfile && (argv.size === 0 || argv.has(image.tag))).map(build));
