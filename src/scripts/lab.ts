// Small typed wrappers around the push helpers defined inline in Base.astro.
declare global {
  interface Window {
    dataLayer: unknown[];
    adobeDataLayer: unknown[];
    labPage: Record<string, any>;
    lab: { ga4: (e: Record<string, unknown>) => void; adobe: (e: Record<string, unknown>) => void };
  }
}

export const ga4 = (evt: Record<string, unknown>) => window.lab.ga4(evt);
export const adobe = (evt: Record<string, unknown>) => window.lab.adobe(evt);
