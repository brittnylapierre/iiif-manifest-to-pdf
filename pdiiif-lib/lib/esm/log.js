/** Simple logger that ismply outputs to the console */
export class ConsoleLogger {
    constructor(level = 'warn') {
        this.level = level;
    }
    setLevel(level) {
        this.level = level;
    }
    debug(message, ...args) {
        if (this.level === 'debug') {
            console.debug(message, ...args);
        }
    }
    info(message, ...args) {
        if (this.level !== 'error' && this.level !== 'warn') {
            console.info(message, ...args);
        }
    }
    warn(message, ...args) {
        if (this.level !== 'error') {
            console.warn(message, ...args);
        }
    }
    error(message, ...args) {
        console.error(message, ...args);
    }
}
let logger = new ConsoleLogger();
export function setLogger(newLogger) {
    logger = newLogger;
}
export { logger as default };
//# sourceMappingURL=log.js.map