const fs = require('fs');
const path = require('path');

const execSync = require('@patract/dev/scripts/execSync');

console.log('$ build browser', process.argv.slice(2).join(' '));

function buildWebpack() {
  execSync('yarn polkadot-exec-webpack --config webpack.browser.js --mode production');
}

function buildJs(dir) {
  if (
    !fs.existsSync(path.join(process.cwd(), '.skip-build')) &&
    fs.existsSync(path.join(process.cwd(), 'webpack.browser.js'))
  ) {
    const { name, version } = require(path.join(process.cwd(), './package.json'));

    console.log(`*** ${name} ${version}`);

    buildWebpack(dir);

    console.log();
  }
}

function buildMonorepo() {
  process.chdir('packages');

  const dirs = fs
    .readdirSync('.')
    .filter((dir) => fs.statSync(dir).isDirectory() && fs.existsSync(path.join(process.cwd(), dir, 'src')));

  for (const dir of dirs) {
    process.chdir(dir);

    buildJs(dir);

    process.chdir('..');
  }

  process.chdir('..');
}

function main() {
  return buildMonorepo();
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exit(-1);
}
