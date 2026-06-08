const trimTrailingSlashes = (value?: string | null) =>
	String(value || "").replace(/\/+$/, "")

const ensureApiBase = (value?: string | null, fallback = "http://localhost:3001") => {
	const normalized = trimTrailingSlashes(value) || fallback
	return normalized.endsWith("/api") ? normalized : `${normalized}/api`
}

const devApiBase = ensureApiBase(
	process.env.NUXT_DEV_API_TARGET || process.env.NUXT_API_PROXY_TARGET,
	"http://localhost:3001"
)

const publicApiBase =
	process.env.NODE_ENV === "production"
		? ensureApiBase(process.env.SERVER_URL, "https://api-flyaway-project.vercel.app/api")
		: devApiBase

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	modules: [
		"@primevue/nuxt-module",
		"nuxt-swiper",
		"@pinia/nuxt",
		"@nuxtjs/i18n",
	],

	app: {
		head: {
			titleTemplate: "%s",
			meta: [
				{ name: "robots", content: "index, follow" },
				{
					name: "description",
					content:
						"FlyAway - сервис для поиска туров, отелей и туристических предложений в Казахстане.",
				},
			],
			script: process.env.NUXT_PUBLIC_YANDEX_MAPS_API_KEY
				? [
						{
							id: "yandex-maps-sdk",
							src: `https://api-maps.yandex.ru/2.1/?apikey=${process.env.NUXT_PUBLIC_YANDEX_MAPS_API_KEY}&lang=ru_RU`,
							type: "text/javascript",
							defer: true,
						},
					]
				: [],
		},
	},

	routeRules: {
		"/profile/**": { ssr: false },
		"/admin/**": { ssr: false },
		"/ru/profile/**": { ssr: false },
		"/ru/admin/**": { ssr: false },
	},

	components: {
		global: true,
		dirs: ["@/components"],
	},

	i18n: {
		strategy: "prefix_except_default",
		locales: [
			{
				code: "kz",
				language: "kz",
				file: { path: "kz.js", cache: false },
			},
			{
				code: "ru",
				language: "ru",
				file: { path: "ru.js", cache: false },
			},
		],
		lazy: true,
		langDir: "../locale",
		defaultLocale: "kz",
	},

	pinia: {
		storesDirs: ["./store/**"],
	},

	nitro: {
		devProxy: {
			"/api": {
				target: devApiBase,
				changeOrigin: true,
			},
		},
	},

	vite: {
		css: {
			preprocessorOptions: {
				scss: {
					api: "modern-compiler",
					additionalData: `
          @use "@/assets/scss/variables.scss" as *;
        `,
				},
			},
		},
	},

	plugins: ["~/plugins/maska.ts", "~/plugins/apexcharts.client.ts"],

	css: [
		"@/assets/scss/normalize.scss",
		"@/assets/scss/index.scss",
		"@/assets/scss/icons.scss",
		"@/assets/scss/primevue/index.scss",
	],

	runtimeConfig: {
		apiProxyTarget: publicApiBase,
		public: {
			baseURL: publicApiBase,
			yandexMapsApiKey: process.env.NUXT_PUBLIC_YANDEX_MAPS_API_KEY || "",
		},
	},

	ssr: true,
	compatibilityDate: "2024-11-01",
	devtools: { enabled: true },
})