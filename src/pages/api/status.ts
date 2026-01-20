import type { APIRoute } from "astro";
import { APPS } from "../../lib/apps";
import { isAppUp } from "../../lib/status";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const id = (url.searchParams.get("id") ?? "").trim();
  const app = APPS.find((a) => a.id === id);
  if (!app) {
    return Response.json(
      { ok: false },
      { headers: { "cache-control": "no-store" } },
    );
  }

  const ok = await isAppUp(app);
  return Response.json(
    { ok },
    { headers: { "cache-control": "no-store" } },
  );
};
