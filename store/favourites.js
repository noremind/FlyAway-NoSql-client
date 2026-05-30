export const useFavouritesStore = defineStore("favourites", () => {
  const api = useApi();
  const authStore = useAuthStore();

  const favouriteTours = ref([]);
  const favouriteHotels = ref([]);
  const isLoaded = ref(false);
  const isHotelsLoaded = ref(false);
  const isLoading = ref(false);
  const isHotelsLoading = ref(false);

  const favouriteIds = computed(() =>
    new Set(
      favouriteTours.value
        .map((tour) => String(tour?._id || tour?.id || ""))
        .filter(Boolean),
    ),
  );

  const favouriteHotelIds = computed(() =>
    new Set(
      favouriteHotels.value
        .map((hotel) => String(hotel?._id || hotel?.id || ""))
        .filter(Boolean),
    ),
  );

  const isFavourite = (tourId) => favouriteIds.value.has(String(tourId || ""));
  const isFavouriteHotel = (hotelId) => favouriteHotelIds.value.has(String(hotelId || ""));

  const reset = () => {
    favouriteTours.value = [];
    favouriteHotels.value = [];
    isLoaded.value = false;
    isHotelsLoaded.value = false;
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

  const fetchFavouriteHotels = async ({ force = false } = {}) => {
    if (!authStore.isLoggedIn) {
      reset();
      return [];
    }

    if (isHotelsLoading.value || (isHotelsLoaded.value && !force)) {
      return favouriteHotels.value;
    }

    isHotelsLoading.value = true;

    try {
      const response = await api.client({
        url: "/personal-cabinet/favourites/hotels",
        method: "get",
      });

      favouriteHotels.value = Array.isArray(response?.data) ? response.data : [];
      isHotelsLoaded.value = true;
      return favouriteHotels.value;
    } finally {
      isHotelsLoading.value = false;
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

  const toggleFavouriteHotel = async (hotel) => {
    const hotelId = String(hotel?._id || hotel?.id || "");

    if (!hotelId) {
      return false;
    }

    const previousHotels = [...favouriteHotels.value];
    const wasFavourite = isFavouriteHotel(hotelId);

    favouriteHotels.value = wasFavourite
      ? favouriteHotels.value.filter((item) => String(item?._id || item?.id || "") !== hotelId)
      : [hotel, ...favouriteHotels.value.filter(Boolean)];
    isHotelsLoaded.value = true;

    try {
      const response = await api.client({
        url: `/personal-cabinet/favourites/hotels/${hotelId}/toggle`,
        method: "post",
      });

      favouriteHotels.value = Array.isArray(response?.data?.favourites)
        ? response.data.favourites
        : favouriteHotels.value;
      isHotelsLoaded.value = true;

      return Boolean(response?.data?.isFavourite);
    } catch (error) {
      favouriteHotels.value = previousHotels;
      throw error;
    }
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
    favouriteHotels,
    favouriteIds,
    favouriteHotelIds,
    isLoaded,
    isHotelsLoaded,
    isLoading,
    isHotelsLoading,
    isFavourite,
    isFavouriteHotel,
    fetchFavourites,
    fetchFavouriteHotels,
    toggleFavourite,
    toggleFavouriteHotel,
    reset,
  };
});
