<template>
  <div class="favourites">
    <div class="favourites__wrapper">
      <UiTabs
        class="favourites__tabs"
        :tabs="tabs"
        v-model="selectedTab"
        type="line"
      ></UiTabs>

      <div v-if="errorMessage && !isLoading" class="favourites__error">
        {{ errorMessage }}
      </div>

      <div v-if="isLoading" class="favourites__state">
        Загружаем избранное...
      </div>

      <div v-else class="favourites__body">
        <div
          class="favourites__cards"
          :class="{
            'favourites__cards--hotels': selectedTab.id === 2,
          }"
        >
          <template v-if="selectedTab.id === 1">
            <TheCommonTourCard
              v-for="tour in paginatedTours"
              :key="tour._id"
              :tour="tour"
              :view-type="screenWidth > 325 ? 'list' : 'tablet'"
            ></TheCommonTourCard>

            <div v-if="!paginatedTours.length" class="favourites__empty">
              В избранном пока нет туров.
            </div>
          </template>

          <template v-else>
            <TheHotelsBlock
              v-for="hotel in paginatedHotels"
              :key="hotel._id || hotel.id"
              :hotel="hotel"
              view-type="list"
            ></TheHotelsBlock>

            <div v-if="!paginatedHotels.length" class="favourites__empty">
              В избранном пока нет отелей.
            </div>
          </template>
        </div>

        <UiPagination
          v-if="lastPage > 1"
          class="favourites__pagination"
          :total-items="currentItems.length"
          :current-page="currentPage"
          :last-page="lastPage"
          :per-page="perPage"
          @change-page="changePage"
        ></UiPagination>
      </div>
    </div>
  </div>
</template>

<script setup>
const api = useApi();
const authStore = useAuthStore();

const tabs = reactive([
  {
    id: 1,
    name: "Туры",
  },
  {
    id: 2,
    name: "Отели",
  },
]);
const selectedTab = ref(tabs[0]);
const favouriteTours = ref([]);
const favouriteHotels = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");
const currentPage = ref(1);
const perPage = 6;

useSeoMeta({
  title: "FlyAway - Избранное",
  ogTitle: "FlyAway - Избранное",
  description: "FlyAway - сайт для бронирования туров и отелей",
  ogDescription: "FlyAway - сайт для бронирования туров и отелей",
});

const windowWidth = ref(process.client ? window.innerWidth : null);

const updateWidth = () => {
  windowWidth.value = window.innerWidth;
};

const screenWidth = computed(() => {
  return windowWidth.value;
});

const currentItems = computed(() =>
  selectedTab.value.id === 1 ? favouriteTours.value : favouriteHotels.value,
);

const lastPage = computed(() => {
  return Math.max(1, Math.ceil(currentItems.value.length / perPage));
});

const paginatedTours = computed(() => {
  if (selectedTab.value.id !== 1) return [];
  const startIndex = (currentPage.value - 1) * perPage;
  return favouriteTours.value.slice(startIndex, startIndex + perPage);
});

const paginatedHotels = computed(() => {
  if (selectedTab.value.id !== 2) return [];
  const startIndex = (currentPage.value - 1) * perPage;
  return favouriteHotels.value.slice(startIndex, startIndex + perPage);
});

const syncPageBounds = () => {
  if (currentPage.value > lastPage.value) {
    currentPage.value = lastPage.value;
  }

  if (currentPage.value < 1) {
    currentPage.value = 1;
  }
};

const loadFavourites = async () => {
  if (!authStore.isLoggedIn) {
    favouriteTours.value = [];
    favouriteHotels.value = [];
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";

  try {
    const [toursResponse, hotelsResponse] = await Promise.all([
      api.client({
        url: "/personal-cabinet/favourites/tours",
        method: "get",
      }),
      api.client({
        url: "/personal-cabinet/favourites/hotels",
        method: "get",
      }),
    ]);

    favouriteTours.value = Array.isArray(toursResponse?.data)
      ? toursResponse.data
      : Array.isArray(toursResponse)
        ? toursResponse
        : [];
    favouriteHotels.value = Array.isArray(hotelsResponse?.data)
      ? hotelsResponse.data
      : Array.isArray(hotelsResponse)
        ? hotelsResponse
        : [];
    currentPage.value = 1;
  } catch (error) {
    errorMessage.value = error?.message || "Не удалось загрузить избранное.";
  } finally {
    isLoading.value = false;
  }
};

const changePage = (page) => {
  currentPage.value = Math.min(Math.max(1, Number(page) || 1), lastPage.value);
};

watch(
  () => selectedTab.value?.id,
  () => {
    currentPage.value = 1;
  },
);

watch(currentItems, syncPageBounds);

onMounted(() => {
  window.addEventListener("resize", updateWidth);
  void loadFavourites();
});

onUnmounted(() => {
  window.removeEventListener("resize", updateWidth);
});
</script>

<style lang="scss" scoped>
.favourites {
  &__wrapper {
    background-color: $white;
    padding: 28px 28px 32px;
    border-radius: 24px;
    box-shadow: 0px 8px 28px rgba(0, 0, 0, 0.06);
    min-height: 640px;
  }

  &__tabs {
    display: flex;
    justify-content: center;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 28px;
    margin-top: 20px;
  }

  &__cards {
    padding: 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
    gap: 16px;

    &--hotels {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
  }

  &__pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
  }

  &__empty,
  &__state {
    grid-column: 1 / -1;
    padding: 32px 16px;
    border-radius: 20px;
    background: rgba($red-500, 0.04);
    color: $surface-500;
    text-align: center;
  }

  &__error {
    margin-top: 18px;
    font-size: 14px;
    font-weight: 600;
    color: $orange-200;
  }
}

@media (max-width: 1024px) {
  .favourites {
    &__cards {
      grid-template-columns: 1fr;
    }
  }
}

@media (max-width: 768px) {
  .favourites {
    &__wrapper {
      padding: 20px 16px 24px;
      border-radius: 18px;
      min-height: auto;
    }

    &__body {
      gap: 22px;
    }
  }
}

@media (max-width: 640px) {
  .favourites {
    &__tabs {
      justify-content: flex-start;
      overflow-x: auto;
      padding-bottom: 4px;
    }
  }
}

@media (max-width: 375px) {
  .favourites {
    &__wrapper {
      background-color: transparent;
      box-shadow: none;
      padding: 0;
    }

    &__cards {
      grid-template-columns: 1fr;
      gap: 12px;
    }
  }
}
</style>
