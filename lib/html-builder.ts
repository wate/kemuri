import htmlBuilder from './builder/html';
import configLoader from './builder/config';
import yargs from 'yargs';
import * as dotenv from 'dotenv';
import './console';
dotenv.config();

const argv = yargs(process.argv.slice(2))
  .options({
    w: { type: 'boolean', default: false, alias: 'watch', description: 'watchモードの指定' },
  })
  .parseSync();

const builderOption = configLoader.getHtmlOption();
htmlBuilder.setOption(builderOption);

if (argv.watch) {
  htmlBuilder.watch();
} else {
  htmlBuilder.build();
}
