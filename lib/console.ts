import chalk from 'chalk';
import { Console } from 'node:console';

class ConsoleOverride extends Console {
  public constructor() {
    super(process.stdout, process.stderr);
  }
  public debug(message?: any, ...optionalParams: any[]) {
    return super.debug(chalk.gray(message), ...optionalParams);
  }
  public info(message?: any, ...optionalParams: any[]) {
    return super.info(chalk.blue(message), ...optionalParams);
  }
  public warn(message?: any, ...optionalParams: any[]) {
    return super.warn(chalk.yellow(message), ...optionalParams);
  }
  public error(message?: any, ...optionalParams: any[]) {
    return super.error(chalk.red(message), ...optionalParams);
  }
  public group(message?: any, ...optionalParams: any[]) {
    return super.group(chalk.cyan(message), ...optionalParams);
  }
}

console = new ConsoleOverride();

export default console;
