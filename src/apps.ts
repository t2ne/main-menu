export type AppTag =
	| "Self-Hosted"
	| "Personal"
	| "Network"
	| "Media"
	| "Security"
	| "Ops";

export type App = {
	id: string;
	name: string;
	href: string;
	tags: AppTag[];
	iconUrl: string;
};

export const APPS: App[] = [
	{
		id: "tailscale",
		name: "Tailscale",
		href: "https://login.tailscale.com/admin/",
		tags: ["Network"],
		iconUrl:
			"https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/webp/tailscale-light.webp",
	},
	{
		id: "nginx-proxy-manager",
		name: "Nginx",
		href: "https://proxy.no-tone.com",
		tags: ["Ops", "Network", "Self-Hosted"],
		iconUrl:
			"https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/webp/nginx-proxy-manager.webp",
	},
	{
		id: "portainer",
		name: "Portainer",
		href: "https://ports.no-tone.com",
		tags: ["Ops", "Self-Hosted"],
		iconUrl:
			"https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/webp/portainer-dark.webp",
	},
	{
		id: "vaultwarden",
		name: "Vaultwarden",
		href: "https://pass.no-tone.com",
		tags: ["Security", "Self-Hosted"],
		iconUrl:
			"https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/webp/vaultwarden-light.webp",
	},
	{
		id: "joplin",
		name: "Joplin",
		href: "https://notes.no-tone.com",
		tags: ["Personal", "Self-Hosted"],
		iconUrl:
			"https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/joplin.png",
	},
	{
		id: "immich",
		name: "Immich",
		href: "https://photos.no-tone.com",
		tags: ["Media", "Self-Hosted"],
		iconUrl:
			"https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/webp/immich.webp",
	},
	{
		id: "open-cloud",
		name: "OpenCloud",
		href: "https://drive.no-tone.com",
		tags: ["Media", "Self-Hosted"],
		iconUrl:
			"https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/webp/open-cloud-dark.webp",
	},
];

export const ALL_TAGS: AppTag[] = Array.from(
	new Set(APPS.flatMap((app) => app.tags)),
).sort() as AppTag[];
