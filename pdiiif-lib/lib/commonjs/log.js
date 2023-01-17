"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.setLogger = exports.ConsoleLogger = void 0;
/** Simple logger that ismply outputs to the console */
class ConsoleLogger {
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
exports.ConsoleLogger = ConsoleLogger;
let logger = new ConsoleLogger();
exports.default = logger;
function setLogger(newLogger) {
    exports.default = logger = newLogger;
}
exports.setLogger = setLogger;
