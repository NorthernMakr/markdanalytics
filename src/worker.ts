// Cloudflare Worker in front of the static site.
//
// Almost every request is handed straight to the built site (env.ASSETS).
// The exception is /ee/*: a stand-in for Adobe's Edge Network, so the Web SDK
// can run for real on this site without an Adobe account. It accepts the same
// requests Adobe's edge would, returns a minimal valid response (including a
// fake ECID so the SDK's identity step completes), and sends nothing to Adobe.

interface Env { ASSETS: { fetch: (req: Request) => Promise<Response> } }

const ORG_COOKIE = (orgId: string) => `kndctr_${orgId.replace('@', '_')}_identity`;

function fakeEcid(): string {
  // 38 digits, the same shape as a real Experience Cloud ID
  let s = '';
  for (let i = 0; i < 38; i++) s += Math.floor(Math.random() * 10);
  return s;
}

function readCookie(req: Request, name: string): string | undefined {
  const raw = req.headers.get('cookie') ?? '';
  const hit = raw.split(/;\s*/).find((c) => c.startsWith(name + '='));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : undefined;
}

async function mockEdge(req: Request, url: URL): Promise<Response> {
  const cors = {
    'access-control-allow-origin': req.headers.get('origin') ?? '*',
    'access-control-allow-credentials': 'true',
    'access-control-allow-headers': 'content-type',
    'access-control-allow-methods': 'POST, GET, OPTIONS',
    'x-lab-mock-edge': 'true',
  };
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

  // sendBeacon-style /collect calls expect no body.
  if (url.pathname.includes('/collect')) return new Response(null, { status: 204, headers: cors });

  let body: any = {};
  try { body = await req.json(); } catch { /* empty or non-JSON body */ }

  const orgId: string = body?.meta?.configOverrides?.orgId
    ?? url.searchParams.get('orgId') ?? 'MARKDLAB000000000000000@AdobeOrg';
  const cookieName = ORG_COOKIE(orgId);
  // Reuse the visitor's fake ECID if the SDK already stored one, else mint one
  const existing = readCookie(req, cookieName);
  const ecid = existing?.startsWith('lab-ecid-') ? existing.slice(9) : fakeEcid();

  const response = {
    requestId: url.searchParams.get('requestId') ?? crypto.randomUUID(),
    handle: [
      {
        type: 'state:store',
        payload: [{ key: cookieName, value: 'lab-ecid-' + ecid, maxAge: 34128000 }],
      },
      {
        type: 'identity:result',
        payload: [{ id: ecid, namespace: { code: 'ECID' } }],
      },
      {
        // Echo back what was received, so it can be read in DevTools > Network > Response
        type: 'lab:received',
        payload: (body?.events ?? []).map((e: any) => ({ eventType: e?.xdm?.eventType, xdm: e?.xdm, data: e?.data })),
      },
    ],
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { 'content-type': 'application/json', ...cors },
  });
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname.startsWith('/ee/')) return mockEdge(req, url);
    return env.ASSETS.fetch(req);
  },
};
