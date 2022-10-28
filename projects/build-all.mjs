import fs from 'fs/promises';
import child_process from 'child_process';

const text = await fs.readFile('../frontend/src/assets/projects/code-server-images.json', 'utf8');
const images = JSON.parse(text);
const argv = new Set(process.argv.slice(2));

async function build({tag, dockerfile, args}) {
  let cmdArgs = [
    'build',
    '-t',
    tag,
    '-f',
    dockerfile,
    ...Object.entries(args).filter(([, v]) => v).flatMap(([k, v]) => ['--build-arg', `${k}=${v}`]),
    '.',
  ];
  console.log('docker', ...cmdArgs);
  const child = child_process.execFile('docker', cmdArgs);
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  return new Promise((resolve, reject) => {

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`docker exited with code ${code}`));
      }
    });
  });
}

await build({
  tag: 'fulib/code-server-base',
  dockerfile: 'base/Dockerfile',
  args: {},
});
await Promise.all(images.filter((image) => image.dockerfile && (argv.size === 0 || argv.has(image.tag))).map(build));
