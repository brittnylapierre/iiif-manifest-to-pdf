/// <reference types="less" />
import { PartialMessage } from 'esbuild';
/** Recursively get .less/.css imports from file */
export declare const getLessImports: (filePath: string) => string[];
/** Convert less error into esbuild error */
export declare const convertLessError: (error: Less.RenderError) => PartialMessage;
