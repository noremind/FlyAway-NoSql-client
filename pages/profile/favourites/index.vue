<template>
  <div class="favourites">
    <div class="favourites__wrapper">
      <UiTabs
        class="favourites__tabs"
        :tabs="tabs"
        v-model="selectedTab"
        type="line"
      ></UiTabs>

      <div
        class="favourites__cards"
        :class="{
          'favourites__cards--hotels': selectedTab.id === 2,
        }"
      >
        <TheCommonTourCard
          v-if="selectedTab.id === 1"
          v-for="tour in favouriteTours"
          :key="tour._id"
          :tour="tour"
          :view-type="screenWidth > 325 ? 'list' : 'tablet'"
        ></TheCommonTourCard>

        <div
          v-if="selectedTab.id === 1 && !isLoading && !favouriteTours.length"
          class="favourites__empty"
        >
          В избранном пока нет туров.
        </div>

        <div v-if="selectedTab.id === 2" class="favourites__empty">
          Избранные отели появятся следующим этапом.
        </div>
      </div>
    </div>
    <br />
    <UiPagination class="favourites__pagination"></UiPagination>
  </div>
</template>

<script setup>
const tabs = reactive([
  {
    id: 1,
    name: "Tyры",
  },
  {
    id: 2,
    name: "Отели",
  },
]);
const selectedTab = ref(tabs[0]);
const authStore = useAuthStore();
const favouritesStore = useFavouritesStore();
const favouriteTours = computed(() => favouritesStore.favouriteTours);
const isLoading = computed(() => favouritesStore.isLoading);

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

onMounted(() => {
  window.addEventListener("resize", updateWidth);
  if (authStore.isLoggedIn) {
    void favouritesStore.fetchFavourites({ force: true });
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", updateWidth);
});
</script>

<style lang="scss" scoped>
.favourites {
  &__wrapper {
    background-color: $white;
    padding: 16px;
    border-radius: 16px;
  }
  &__tabs {
    display: flex;
    justify-content: center;
  }
  &__cards {
    padding: 10px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    align-items: start;
    margin: 26px 0;
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
  }
  &__empty {
    grid-column: 1 / -1;
    padding: 32px 16px;
    border-radius: 16px;
    background: rgba($red-500, 0.04);
    color: $surface-500;
    text-align: center;
  }
}

@media (max-width: 375px) {
  .favourites {
    &__wrapper {
      background-color: transparent;
      padding: 0;
    }
    &__cards {
      padding: 0;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
    }
  }
}
</style>
