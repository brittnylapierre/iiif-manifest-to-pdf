import { Helper } from "./Helper";
import { IManifoldOptions } from "./IManifoldOptions";
export declare class Bootstrapper {
    private _options;
    constructor(options: IManifoldOptions);
    bootstrap(res?: (helper: Helper) => void, rej?: (error: any) => void): Promise<Helper>;
    private _loaded;
}
