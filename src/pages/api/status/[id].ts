import type { APIRoute } from "astro";
import { APPS } from "../../../apps";

export const prerender = false;

const STATUS_TIMEOUT_MS = 8000;
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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const head = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
    });

    if (head.status !== 405) return true;
  } catch {
    // ignore and try GET
  }

  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
    });
    void res;
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function ping(url: string, timeoutMs = STATUS_TIMEOUT_MS): Promise<boolean> {
  if (await pingOnce(url, timeoutMs)) return true;
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

export const GET: APIRoute = async ({ params }) => {
  const id = (params.id ?? "").trim();
  if (!id) return json({ ok: false });

  const app = APPS.find((a) => a.id === id);
  if (!app) return json({ ok: false });

  const probe = APPS.find((a) => a.id === SERVER_PROBE_APP_ID);
  const targetHref = id === "vaultwarden" && probe?.href ? probe.href : app.href;

  const ok = await ping(getPingUrl(targetHref), STATUS_TIMEOUT_MS);
  return json({ ok });
};
