export async function useFetchSsr(options = {}) {
	const authStore = useAuthStore()
	const loaderStore = useLoaderStore()
	const config = useRuntimeConfig();
	const shouldShowLoader = import.meta.client && options?.loader !== false

	const headers = {
		Accept: "application/json",
		"Content-Type": "application/json",
		"Authorization": `Bearer ${authStore.getToken || null}`,
		...options?.headers,
	};

	if (shouldShowLoader) {
		loaderStore.start()
	}

	try {
		const response = await useFetch(options.url, {
			body: options?.data || options?.body,
			method: options?.method || "get",
			baseURL: config.public.baseURL,
			params: options?.params || options?.query,
			headers,
		});

		const data = response.data?.value
		const error = response?.error.value

		if (error) { throw error }

		return data;

	} catch (error) {
		console.log(error)
		if (error?.statusCode === 401 || error?.data?.message === "Unauthenticated") {
			authStore.logout({ type: 'local' })
		}
		throw error;
	} finally {
		if (shouldShowLoader) {
			loaderStore.stop()
		}
	}
};
