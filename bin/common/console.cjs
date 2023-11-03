'use strict';

var chalk = require('chalk');
var node_console = require('node:console');

class ConsoleOverride extends node_console.Console {
    constructor() {
        super(process.stdout, process.stderr);
    }
    debug(message, ...optionalParams) {
        return super.debug(chalk.gray(message), ...optionalParams);
    }
    info(message, ...optionalParams) {
        return super.info(chalk.blue(message), ...optionalParams);
    }
    warn(message, ...optionalParams) {
        return super.warn(chalk.yellow(message), ...optionalParams);
    }
    error(message, ...optionalParams) {
        return super.error(chalk.red(message), ...optionalParams);
    }
    group(message, ...optionalParams) {
        return super.group(chalk.cyan(message), ...optionalParams);
    }
}
console = new ConsoleOverride();
