export const useLoaderStore = defineStore("loader", () => {
	const isLoader = ref(false)

	const setLoader = (value) => {
		isLoader.value = Boolean(value)
	};

	const start = () => {
		isLoader.value = true
	}

	const stop = () => {
		isLoader.value = false
	}

	const reset = () => {
		isLoader.value = false
	}

	return {
		isLoader,
		setLoader,
		start,
		stop,
		reset,
	};
});
