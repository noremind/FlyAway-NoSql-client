export const useFavouritesStore = defineStore("favourites", () => {
  const api = useApi();
  const authStore = useAuthStore();

  const favouriteTours = ref([]);
  const isLoaded = ref(false);
  const isLoading = ref(false);

  const favouriteIds = computed(() =>
    new Set(
      favouriteTours.value
        .map((tour) => String(tour?._id || tour?.id || ""))
        .filter(Boolean),
    ),
  );

  const isFavourite = (tourId) => favouriteIds.value.has(String(tourId || ""));

  const reset = () => {
    favouriteTours.value = [];
    isLoaded.value = false;
  };

  const fetchFavourites = async ({ force = false } = {}) => {
    if (!authStore.isLoggedIn) {
      reset();
      return [];
    }

    if (isLoading.value || (isLoaded.value && !force)) {
      return favouriteTours.value;
    }

    isLoading.value = true;

    try {
      const response = await api.client({
        url: "/personal-cabinet/favourites/tours",
        method: "get",
      });

      favouriteTours.value = Array.isArray(response?.data) ? response.data : [];
      isLoaded.value = true;
      return favouriteTours.value;
    } finally {
      isLoading.value = false;
    }
  };

  const toggleFavourite = async (tour) => {
    const tourId = String(tour?._id || tour?.id || "");

    if (!tourId) {
      return false;
    }

    const response = await api.client({
      url: `/personal-cabinet/favourites/tours/${tourId}/toggle`,
      method: "post",
    });

    favouriteTours.value = Array.isArray(response?.data?.favourites)
      ? response.data.favourites
      : favouriteTours.value;
    isLoaded.value = true;

    return Boolean(response?.data?.isFavourite);
  };

  watch(
    () => authStore.isLoggedIn,
    (isLoggedIn) => {
      if (!isLoggedIn) {
        reset();
      }
    },
    { immediate: true },
  );

  return {
    favouriteTours,
    favouriteIds,
    isLoaded,
    isLoading,
    isFavourite,
    fetchFavourites,
    toggleFavourite,
    reset,
  };
});
