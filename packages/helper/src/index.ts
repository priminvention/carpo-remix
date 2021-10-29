import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';

const version = fs.existsSync(path.join(__dirname, 'package.json'))
  ? fs.readJSONSync(path.join(__dirname, 'package.json')).version
  : fs.existsSync(path.join(__dirname, '..', 'package.json'))
  ? fs.readJSONSync(path.join(__dirname, '..', 'package.json')).version
  : '0.0.0';

const program = new Command();

program.name('carpo-helper').version(version);

program.command('compile [file]').description('Compile solidity file, or all if no file supplied').action(console.log);

program.parse(process.argv);
