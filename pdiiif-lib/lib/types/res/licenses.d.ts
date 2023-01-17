export interface LicenseDescription {
    text: string;
    logo: string;
}
export type LicenseList = Record<string, LicenseDescription>;
export declare const licenses: LicenseList;
export declare function getLicenseInfo(uri: string): LicenseDescription | null;
//# sourceMappingURL=licenses.d.ts.map