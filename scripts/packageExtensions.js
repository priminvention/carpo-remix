const path = require('path');
const fs = require('fs');

const execSync = require('@patract/dev/scripts/execSync');

console.log('$ package-extensions', process.argv.slice(2).join(' '));

function createOutDir() {
  if (fs.existsSync('out')) {
    fs.rmdirSync('out');
  }

  fs.mkdirSync('out');
}

function runClean() {
  execSync('yarn clean');
}

function runCheck() {
  execSync('yarn lint');
}

function runBuild() {
  execSync('yarn build');
}

function vscePackage() {
  const pkgJson = JSON.parse(fs.readFileSync('package.json').toString());

  execSync(`yarn vsce package --yarn --out ../../out/${pkgJson.name}-${pkgJson.version}.vsix`);
}

function loopFunc(fn) {
  fs.readdirSync('packages')
    .filter((dir) => dir.startsWith('extension-'))
    .forEach((dir) => {
      process.chdir(path.join('packages', dir));

      fn();

      process.chdir('../..');
    });
}

runClean();
runCheck();
runBuild();
createOutDir();

loopFunc(vscePackage);
