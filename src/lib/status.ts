import type { App } from "./apps";

const TIMEOUT_MS = 1200;

function probeUrl(app: App): string {
	const url = new URL(app.href);
	return `${url.origin}/`;
}

export async function isAppUp(app: App, timeoutMs = TIMEOUT_MS): Promise<boolean> {
	const url = probeUrl(app);

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

	try {
		await fetch(url, {
			method: "HEAD",
			redirect: "follow",
			cache: "no-store",
			signal: controller.signal,
		});
		return true;
	} catch {
		try {
			await fetch(url, {
				method: "GET",
				redirect: "follow",
				cache: "no-store",
				signal: controller.signal,
			});
			return true;
		} catch {
			return false;
		}
	} finally {
		clearTimeout(timeoutId);
	}
}
