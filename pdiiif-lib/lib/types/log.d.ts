type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export interface Logger {
    setLevel(level: LogLevel): void;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
}
/** Simple logger that ismply outputs to the console */
export declare class ConsoleLogger implements Logger {
    private level;
    constructor(level?: LogLevel);
    setLevel(level: LogLevel): void;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
}
declare let logger: Logger;
export declare function setLogger(newLogger: Logger): void;
export { logger as default };
//# sourceMappingURL=log.d.ts.map