import type { App } from "./apps";

const TIMEOUT_MS = 1200;

function isHealthyStatus(status: number): boolean {
	return status >= 200 && status < 400;
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
		const headRes = await fetch(url, {
			method: "HEAD",
			redirect: "follow",
			cache: "no-store",
			signal: controller.signal,
		});

		// 405 still means the host answered => up.
		if (headRes.status === 405) return true;
		if (isHealthyStatus(headRes.status)) return true;

		// Some providers (and some app servers) block HEAD but allow GET.
		// If HEAD isn't clearly healthy, try a lightweight GET before declaring down.
		const getRes = await fetch(url, {
			method: "GET",
			redirect: "follow",
			cache: "no-store",
			signal: controller.signal,
		});
		return isHealthyStatus(getRes.status);
	} catch (error) {
		return false;
	} finally {
		clearTimeout(timeoutId);
	}
}
