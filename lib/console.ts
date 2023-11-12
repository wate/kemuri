import chalk from 'chalk';
import { Console } from 'node:console';

class ConsoleOverride extends Console {
  public constructor() {
    super(process.stdout, process.stderr);
  }
  public debug(message?: any, ...optionalParams: any[]) {
    super.debug(chalk.gray(message), ...optionalParams);
  }
  public info(message?: any, ...optionalParams: any[]) {
    super.info(chalk.cyan(message), ...optionalParams);
  }
  public warn(message?: any, ...optionalParams: any[]) {
    super.warn(chalk.yellow(message), ...optionalParams);
  }
  public error(message?: any, ...optionalParams: any[]) {
    super.error(chalk.red(message), ...optionalParams);
  }
  public group(message?: any, ...optionalParams: any[]) {
    super.group(chalk.blue(message), ...optionalParams);
  }
}

console = new ConsoleOverride();

export default console;
