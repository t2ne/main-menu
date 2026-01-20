import type { App } from "./apps";

const TIMEOUT_MS = 1200;

function isUpStatus(status: number): boolean {
	if (status >= 500) return false;
	if (status === 404 || status === 410) return false;
	return true;
}

function probeUrl(app: App): string {
	const url = new URL(app.href);
	return `${url.origin}/`;
}

export async function isAppUp(app: App, timeoutMs = TIMEOUT_MS): Promise<boolean> {
	const url = probeUrl(app);

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const res = await fetch(url, {
			method: "HEAD",
			redirect: "follow",
			cache: "no-store",
			signal: controller.signal,
		});

		// 405 still means the host answered => up.
		if (res.status === 405) return true;
		return isUpStatus(res.status);
	} catch (error) {
		return false;
	} finally {
		clearTimeout(timeoutId);
	}
}
