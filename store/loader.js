export const useLoaderStore = defineStore("loader", () => {
	const pendingCount = ref(0)
	const isLoader = computed(() => pendingCount.value > 0)

	const setLoader = (value) => {
		pendingCount.value = value ? pendingCount.value + 1 : Math.max(0, pendingCount.value - 1)
	};

	const start = () => {
		pendingCount.value += 1
	}

	const stop = () => {
		pendingCount.value = Math.max(0, pendingCount.value - 1)
	}

	return {
		isLoader,
		pendingCount,
		setLoader,
		start,
		stop,
	};
});
