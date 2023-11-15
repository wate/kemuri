#!/usr/bin/env node
import snippetBuilder from './builder/snippet';
import configLoader from './config';
import yargs from 'yargs';

const argv = yargs(process.argv.slice(2))
  .options({
    w: { type: 'boolean', default: false, alias: 'watch', description: 'watchモードの指定' },
  })
  .parseSync();

const builderOption = configLoader.getSnippetOption();
snippetBuilder.setOption(builderOption);

if (argv.watch) {
  snippetBuilder.watch();
} else {
  snippetBuilder.build();
}
