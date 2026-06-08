export default defineNuxtRouteMiddleware((to) => {
	if (to.path.startsWith("/admin") || to.path.startsWith("/ru/admin")) {
		useSeoMeta({ robots: "noindex, nofollow" })
		return
	}

	if (to.path.startsWith("/profile") || to.path.startsWith("/ru/profile")) {
		useSeoMeta({ robots: "noindex, nofollow" })
		return
	}

	useSeoMeta({ robots: "index, follow" })
})