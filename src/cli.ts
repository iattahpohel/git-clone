#!/usr/bin/env node

import { Command } from 'commander';
import { init } from './commands/init';
import { add } from './commands/add';
import { commit } from './commands/commit';
import { status } from './commands/status';
import { log } from './commands/log';

const program = new Command();

program
  .name('mygit')
  .description('A Git clone implementation in TypeScript')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize a new git repository')
  .action(async () => {
    try {
      await init();
    } catch (error: any) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program
  .command('add')
  .description('Add files to staging area')
  .argument('<files...>', 'files to add')
  .action(async (files: string[]) => {
    try {
      await add(files);
    } catch (error: any) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program
  .command('commit')
  .description('Create a new commit')
  .option('-m, --message <message>', 'commit message')
  .option('--author <author>', 'author name and email (format: "Name <email>")')
  .action(async (options) => {
    try {
      if (!options.message) {
        console.error('Error: commit message is required (-m)');
        process.exit(1);
      }
      
      let author;
      if (options.author) {
        const match = options.author.match(/^(.+?)\s*<(.+?)>$/);
        if (match) {
          author = { name: match[1].trim(), email: match[2].trim() };
        }
      }
      
      await commit(options.message, author);
    } catch (error: any) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Show working tree status')
  .action(async () => {
    try {
      await status();
    } catch (error: any) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program
  .command('log')
  .description('Show commit history')
  .option('-n, --limit <number>', 'number of commits to show', '10')
  .action(async (options) => {
    try {
      await log(parseInt(options.limit, 10));
    } catch (error: any) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program.parse();

