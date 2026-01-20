import type { APIRoute } from "astro";
import { APPS } from "../../apps";

export const prerender = false;

const STATUS_TIMEOUT_MS = 1300;
const SERVER_PROBE_APP_ID = "immich";

function getPingUrl(href: string): string {
  try {
    const u = new URL(href);
    return `${u.origin}/`;
  } catch {
    return href;
  }
}

async function pingOnce(url: string, timeoutMs = STATUS_TIMEOUT_MS): Promise<boolean> {
  const headController = new AbortController();
  const getController = new AbortController();
  const timeoutId = setTimeout(() => {
    headController.abort();
    getController.abort();
  }, timeoutMs);

  const head = fetch(url, {
    method: "HEAD",
    redirect: "follow",
    signal: headController.signal,
  }).then(() => true);

  const get = fetch(url, {
    method: "GET",
    redirect: "follow",
    signal: getController.signal,
  }).then(() => true);

  try {
    // If either request gets *any* response, the host is reachable.
    const ok = await Promise.any([head, get]);
    if (ok) {
      headController.abort();
      getController.abort();
      return true;
    }
    return false;
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function ping(url: string, timeoutMs = STATUS_TIMEOUT_MS): Promise<boolean> {
  if (await pingOnce(url, timeoutMs)) return true;

  // Light retry for transient DNS/TLS hiccups.
  await new Promise((r) => setTimeout(r, 200));
  return pingOnce(url, timeoutMs);
}

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
} as const;

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: JSON_HEADERS,
  });
}

async function checkId(id: string): Promise<boolean> {
  const app = APPS.find((a) => a.id === id);
  if (!app) return false;

  const probe = APPS.find((a) => a.id === SERVER_PROBE_APP_ID);

  // These services are on the same box; treat "server reachable" as "up".
  const targetHref = id === "vaultwarden" && probe?.href ? probe.href : app.href;

  return ping(getPingUrl(targetHref), STATUS_TIMEOUT_MS);
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json().catch(() => null)) as
      | { id?: unknown }
      | null;
    const id = typeof body?.id === "string" ? body.id.trim() : "";
    if (!id) return json({ ok: false });

    const ok = await checkId(id);
    return json({ ok });
  } catch {
    return json({ ok: false });
  }
};

// Keep GET for manual debugging / backwards compatibility.
export const GET: APIRoute = async ({ url }) => {
  try {
    const id = (url.searchParams.get("id") ?? "").trim();
    if (!id) return json({ ok: false });
    const ok = await checkId(id);
    return json({ ok });
  } catch {
    return json({ ok: false });
  }
};
