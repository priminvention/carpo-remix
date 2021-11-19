const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');

const copySync = require('@patract/dev/scripts/copySync');
const execSync = require('@patract/dev/scripts/execSync');

console.log('$ npm-deploy', process.argv.slice(2).join(' '));

function runClean() {
  execSync('yarn polkadot-dev-clean-build');
}

function runCheck() {
  execSync('yarn lint');
}

function runBuild() {
  execSync('yarn build:ts');
}

function npmGetVersion() {
  return JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8')).version;
}

function npmPublish() {
  const tag = npmGetVersion().includes('-') ? '--tag beta' : '';
  let count = 1;

  while (true) {
    try {
      execSync(`npm publish --access public ${tag}`);

      break;
    } catch (error) {
      if (count < 5) {
        const end = Date.now() + 15000;

        console.error(`Publish failed on attempt ${count}/5. Retrying in 15s`);
        count++;

        while (Date.now() < end) {
          // just spin our wheels
        }
      }
    }
  }
}

function loopFunc(fn) {
  fs.readdirSync('packages')
    .filter((dir) => {
      const pkgDir = path.join(process.cwd(), 'packages', dir);

      return (
        fs.statSync(pkgDir).isDirectory() &&
        fs.existsSync(path.join(pkgDir, 'package.json')) &&
        fs.existsSync(path.join(pkgDir, 'build'))
      );
    })
    .forEach((dir) => {
      process.chdir(path.join('packages', dir));

      if (fs.existsSync('.skip-npm')) {
        process.chdir('../..');

        return;
      }

      rimraf.sync('build/package.json');
      ['LICENSE', 'README.md', 'package.json'].forEach((file) => copySync(file, 'build'));

      process.chdir('build');

      fn();

      process.chdir('../../..');
    });
}

runClean();
runCheck();
runBuild();

loopFunc(npmPublish);
