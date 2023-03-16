export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
export type LogLevelWithSilent = LogLevel | 'silent';

export interface LogFn {
  /* tslint:disable:no-unnecessary-generics */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <T extends object>(obj: T, msg?: string, ...args: any[]): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (obj: unknown, msg?: string, ...args: any[]): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (msg: string, ...args: any[]): void;
}
export interface ILogger {
  level: LogLevelWithSilent | string;
  fatal: LogFn;
  error: LogFn;
  warn: LogFn;
  info: LogFn;
  debug: LogFn;
  trace: LogFn;
  silent: LogFn;
}
