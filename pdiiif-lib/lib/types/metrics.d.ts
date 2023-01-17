import type { Histogram } from 'prom-client';
type Metrics = {
    pageGenerationDuration: Histogram<string>;
    imageFetchDuration: Histogram<string>;
    imageInfoDuration: Histogram<string>;
    ocrFetchDuration: Histogram<string>;
} | undefined;
declare let metrics: Metrics;
export default metrics;
//# sourceMappingURL=metrics.d.ts.map