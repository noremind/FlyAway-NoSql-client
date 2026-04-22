<template>
  <section class="tours">
    <div
      class="tours__map tours__map--mobile"
      v-show="selectedTabMobile.id === 3"
      ref="mapContainerMobile"
    ></div>
    <div class="tours__wrapper">
      <div class="tours__top">
        <UiInput
          class="tours__top-search"
          placeholder="Введите название"
          after-icon="lupa"
          v-model="filters.search"
        ></UiInput>
        <p class="tours__top-text" @click="openFilterMobile">Фильтр</p>
      </div>

      <UiTabs
        class="tours__tabs tours__tabs--mobile"
        :tabs="tabsMobile"
        v-model="selectedTabMobile"
      ></UiTabs>

      <div
        class="tours__header"
        :class="{
          'tours__header--visible': selectedTabMobile.id === 3,
        }"
      >
        <h1 class="tours__title title">Туры</h1>
        <UiTabs class="tours__tabs" :tabs="tabs" v-model="selectedTab"></UiTabs>
      </div>

      <div class="tours__content" v-show="selectedTabMobile.id !== 3">
        <div class="tours__content-left">
          <section class="tours__filters">
            <div class="tours__filters-header">
              <UiIcons
                icon="filter-burger"
                size="size-36"
                color="red-500"
              ></UiIcons>
              <h2 class="tours__filters-title">Фильтр</h2>
            </div>

            <div class="tours__filters-box">
              <UiInput
                label="Название"
                placeholder="Введите название"
                after-icon="lupa"
                icon-color="surface-900"
                v-model="filters.search"
              ></UiInput>

              <div>
                <p class="tours__filters-text">Дата поездки</p>
                <div class="tours__filters-dates">
                  <UiCalendar
                    class="tours__filters-calendar"
                    label="Дата от"
                    v-model="filters.dateFrom"
                  />
                  <UiCalendar
                    class="tours__filters-calendar"
                    label="Дата до"
                    v-model="filters.dateTo"
                  />
                </div>
              </div>

              <div class="tours__filters-range">
                <div>
                  <p class="tours__filters-text">Цена</p>
                  <UiRange></UiRange>
                </div>

                <div class="tours__filters-inner">
                  <span>от</span>
                  <UiInput
                    type="number"
                    placeholder="0"
                    v-model="filters.priceFrom"
                  ></UiInput>
                  <span>₸</span>
                </div>

                <div class="tours__filters-inner">
                  <span>до</span>
                  <UiInput
                    type="number"
                    placeholder="0"
                    v-model="filters.priceTo"
                  ></UiInput>
                  <span>₸</span>
                </div>
              </div>

              <!-- <div>
                <p class="tours__filters-text">Продолжительность</p>
                <UiInput
                  placeholder="Например, 1 день"
                  v-model="filters.duration"
                ></UiInput>
              </div> -->

              <!-- <div>
                <p class="tours__filters-text">Локация</p>
                <UiInput
                  placeholder="Алматы или точка отправления"
                  v-model="filters.location"
                ></UiInput>
              </div> -->

              <!-- <UiHashTag :tags="tags" label="Тип отдыха"></UiHashTag> -->
            </div>
          </section>
          <TheCommonAdBanner class="tours__ad"></TheCommonAdBanner>
        </div>
        <div class="tours__block">
          <section class="tours__sort">
            <h2 class="tours__sort-title">Сортировка</h2>
            <UiCheckbox
              :options="sortOptions"
              :model-value="selectedSortOption"
              @update:model-value="selectSortOption"
            ></UiCheckbox>
          </section>
          <template v-if="tours?.length">
            <div
              v-show="selectedTab?.id === 1"
              class="tours__cards"
              :class="{ 'tours__cards--tablet': selectedTabMobile.id === 1 }"
            >
              <TheCommonTourCard
                v-for="tour in tours"
                :key="tour._id"
                :tour="tour"
                :view-type="selectedTabMobile.id === 1 ? 'tablet' : 'list'"
              ></TheCommonTourCard>

              <!-- <TheCommonPopularBanner
                class="tours__banner"
              ></TheCommonPopularBanner> -->
            </div>
            <div v-show="selectedTab?.id === 2" class="tours__location">
              <div class="tours__map" ref="mapContainer"></div>
              <div class="tours__scroll-wrapper">
                <div class="tours__scroll-cards">
                  <TheCommonTourCard
                    v-for="tour in tours"
                    :key="tour._id || tour.id"
                    :tour="tour"
                  ></TheCommonTourCard>
                  <div class="tours__scroll-pagination">
                    <UiPagination
                      v-if="
                        pagination?.last_page && pagination?.last_page !== 1
                      "
                      :total-items="pagination?.total_items"
                      :current-page="currentPage"
                      @change-page="paginationPage"
                      :last-page="pagination?.last_page"
                      :per-page="pagination?.per_page"
                      class="tours__pagination tours__pagination--scroll"
                    ></UiPagination>
                  </div>
                </div>
              </div>
            </div>
            <UiPagination
              v-if="
                pagination?.last_page &&
                pagination?.last_page !== 1 &&
                selectedTab?.id === 1
              "
              :total-items="pagination?.total_items"
              :current-page="currentPage"
              @change-page="paginationPage"
              :last-page="pagination?.last_page"
              :per-page="pagination?.per_page"
              class="tours__pagination"
            ></UiPagination>
          </template>
          <div v-else class="tours__empty">
            <h3 class="tours__empty-title">Туры не найдены</h3>
            <p class="tours__empty-text">
              Сервер не вернул туры по выбранным фильтрам. Попробуйте изменить
              даты, цену или поисковый запрос.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <UiOverlay
    :is-show="isOpenFilterMobile"
    @close="closeFilterMobile"
    title="Фильтр"
  >
    <div class="tours__filters-box">
      <div>
        <p class="tours__filters-text">Сортировка</p>
        <div class="tours__filters-checkboxs">
          <UiCheckbox
            :options="sortOptions"
            :model-value="selectedSortOption"
            @update:model-value="selectSortOption"
          ></UiCheckbox>
        </div>
      </div>

      <UiInput
        label="Название"
        placeholder="Введите название"
        after-icon="lupa"
        icon-color="surface-900"
        v-model="filters.search"
      ></UiInput>

      <div>
        <p class="tours__filters-text">Дата поездки</p>
        <div class="tours__filters-dates">
          <UiCalendar
            class="tours__filters-calendar"
            label="Дата от"
            v-model="filters.dateFrom"
          />
          <UiCalendar
            class="tours__filters-calendar"
            label="Дата до"
            v-model="filters.dateTo"
          />
        </div>
      </div>

      <div class="tours__filters-range">
        <div>
          <p class="tours__filters-text">Цена</p>
          <UiRange></UiRange>
        </div>

        <div class="tours__filters-inner">
          <span>от</span>
          <UiInput
            type="number"
            placeholder="0"
            v-model="filters.priceFrom"
          ></UiInput>
          <span>₸</span>
        </div>

        <div class="tours__filters-inner">
          <span>до</span>
          <UiInput
            type="number"
            placeholder="0"
            v-model="filters.priceTo"
          ></UiInput>
          <span>₸</span>
        </div>
      </div>

      <!-- <div>
        <p class="tours__filters-text">Продолжительность</p>
        <UiInput
          placeholder="Например, 1 день"
          v-model="filters.duration"
        ></UiInput>
      </div> -->

      <!-- <div>
        <p class="tours__filters-text">Локация</p>
        <UiInput
          placeholder="Алматы или точка отправления"
          v-model="filters.location"
        ></UiInput>
      </div> -->

      <!-- <UiHashTag :tags="tags" label="Тип отдыха"></UiHashTag> -->
    </div>
  </UiOverlay>

  <UiPartialModal
    :is-show="selectedTabMobile.id === 3 && isOpenPartialLocationCards"
    :dark-bg="false"
    @close="closePartialLocationCards"
  >
    <template #body>
      <div class="tours__cards">
        <TheCommonTourCard
          v-for="card in 6"
          :key="card"
          :view-type="'list'"
        ></TheCommonTourCard>
      </div>
    </template>
  </UiPartialModal>
</template>

<script setup>
const mapContainer = ref(null);
const mapContainerMobile = ref(null);
const isOpenFilterMobile = ref(false);
const isOpenPartialLocationCards = ref(false);
const tours = ref([]);
const pagination = reactive({
  last_page: 1,
  total_items: 0,
  per_page: 9,
});
const currentPage = ref(1);
const route = useRoute();
const router = useRouter();
const api = useApi();
const filters = reactive({
  search: "",
  dateFrom: null,
  dateTo: null,
  priceFrom: "",
  priceTo: "",
  duration: "",
  location: "",
  sortBy: "newest",
});
let syncSearchFromRoute = false;

const tabs = reactive([
  {
    id: 1,
    name: "Список",
    icon: "burger-list",
  },
  {
    id: 2,
    name: "Локация",
    icon: "location",
  },
]);
const tabsMobile = reactive([
  {
    id: 1,
    name: "Плитка",
    icon: "tablets",
  },
  {
    id: 2,
    name: "Список",
    icon: "burger-list",
  },
  {
    id: 3,
    name: "Локация",
    icon: "location",
  },
]);
const selectedTab = ref(tabs[0]);
const selectedTabMobile = ref(tabsMobile[0]);
const mapCenter = [76.889709, 43.238949];
const desktopMap = shallowRef(null);
const mobileMap = shallowRef(null);
const sortOptions = [
  { label: "Сначала новые", value: "newest" },
  { label: "По цене: дешевле", value: "price_asc" },
  { label: "По цене: дороже", value: "price_desc" },
  { label: "По рейтингу", value: "rating_desc" },
];

const tags = reactive([
  {
    id: 1,
    name: "активный",
  },
  {
    id: 2,
    name: "экскурсионный",
  },
  {
    id: 3,
    name: "wellness",
  },
  {
    id: 4,
    name: "активный",
  },
]);

useSeoMeta({
  title: "FlyAway - Туры",
  ogTitle: "FlyAway - Туры",
  description: "FlyAway - сайт для бронирования туров и отелей",
  ogDescription: "FlyAway - сайт для бронирования туров и отелей",
});

const { createMap } = useYandexMaps();

const normalizeNumberInput = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const parsed = Math.max(0, Number(value) || 0);
  return parsed ? String(parsed) : "";
};

const selectedSortOption = computed(() => {
  return (
    sortOptions.find((option) => option.value === filters.sortBy) ||
    sortOptions[0]
  );
});

const selectSortOption = (option) => {
  filters.sortBy = option?.value || "newest";
};

const syncFiltersFromRoute = () => {
  syncSearchFromRoute = true;
  filters.search = String(route.query.search || "");
  filters.dateFrom = parseQueryDate(route.query.dateFrom);
  filters.dateTo = parseQueryDate(route.query.dateTo);
  filters.priceFrom = normalizeNumberInput(route.query.priceFrom);
  filters.priceTo = normalizeNumberInput(route.query.priceTo);
  filters.duration = String(route.query.duration || "");
  filters.location = String(route.query.location || "");
  filters.sortBy = String(route.query.sortBy || "newest");
};

const updateRouteFilters = async () => {
  if (syncSearchFromRoute) {
    syncSearchFromRoute = false;
    return;
  }

  const normalizedRange = normalizeDateRange(filters.dateFrom, filters.dateTo);
  filters.dateFrom = normalizedRange.from;
  filters.dateTo = normalizedRange.to;

  const priceFrom = normalizeNumberInput(filters.priceFrom);
  const priceTo = normalizeNumberInput(filters.priceTo);

  if (priceFrom && priceTo && Number(priceFrom) > Number(priceTo)) {
    filters.priceFrom = priceTo;
    filters.priceTo = priceFrom;
  } else {
    filters.priceFrom = priceFrom;
    filters.priceTo = priceTo;
  }

  const nextQuery = buildQueryObject({
    search: filters.search,
    dateFrom: formatQueryDate(filters.dateFrom),
    dateTo: formatQueryDate(filters.dateTo),
    priceFrom: filters.priceFrom,
    priceTo: filters.priceTo,
    duration: filters.duration,
    location: filters.location,
    sortBy: filters.sortBy !== "newest" ? filters.sortBy : "",
  });

  if (areQueriesEqual(nextQuery, route.query)) {
    return;
  }

  await router.replace({ query: nextQuery });
};

const getTours = async () => {
  const res = await api.client({
    url: "/tours",
    method: "get",
    query: {
      page: currentPage.value,
      per_page: pagination.per_page || 9,
      search: filters.search || undefined,
      dateFrom: formatQueryDate(filters.dateFrom) || undefined,
      dateTo: formatQueryDate(filters.dateTo) || undefined,
      priceFrom: filters.priceFrom || undefined,
      priceTo: filters.priceTo || undefined,
      duration: filters.duration || undefined,
      location: filters.location || undefined,
      sortBy: filters.sortBy || undefined,
    },
  });

  tours.value = Array.isArray(res?.data) ? res.data : [];

  const meta = res?.meta || {};
  pagination.last_page = Number(meta.last_page) || 1;
  pagination.total_items = Number(meta.total_items ?? meta.total) || tours.value.length;
  pagination.per_page = Number(meta.per_page) || pagination.per_page || 9;
  currentPage.value = Number(meta.current_page) || currentPage.value;
};

syncFiltersFromRoute();
await getTours();

const paginationPage = async (page) => {
  currentPage.value = page;
  await getTours();
};

const destroyMap = (mapRef) => {
  if (mapRef.value && typeof mapRef.value.destroy === "function") {
    mapRef.value.destroy();
  }

  mapRef.value = null;
};

const mountMap = async (containerRef, mapRef) => {
  if (!containerRef.value || mapRef.value) {
    return;
  }

  try {
    mapRef.value = await createMap({
      container: containerRef.value,
      center: mapCenter,
      zoom: 10,
      markers: mapMarkers.value,
    });
  } catch (error) {
    console.error(error);
  }
};

const mapMarkers = computed(() => {
  return (Array.isArray(tours.value) ? tours.value : [])
    .map((tour) => {
      const x = Number(tour?.departureLocation?.x);
      const y = Number(tour?.departureLocation?.y);
      const id = String(tour?._id || "");

      if (!Number.isFinite(x) || !Number.isFinite(y) || !id) {
        return null;
      }

      return {
        id,
        coordinates: [x, y],
        title: tour?.title || "Тур",
        onClick: () => router.push(`/tours/${id}`),
      };
    })
    .filter(Boolean);
});

onMounted(async () => {
  await nextTick();

  if (selectedTab.value.id === 2) {
    await mountMap(mapContainer, desktopMap);
  }

  if (selectedTabMobile.value.id === 3) {
    await mountMap(mapContainerMobile, mobileMap);
  }
});

watch(
  () => selectedTab.value.id,
  async (tabId) => {
    if (tabId === 2) {
      await nextTick();
      await mountMap(mapContainer, desktopMap);
    }
  },
);

watch(
  mapMarkers,
  (markers) => {
    desktopMap.value?.setMarkers?.(markers);
    mobileMap.value?.setMarkers?.(markers);
  },
  { deep: true },
);

watch(
  () => selectedTabMobile.value.id,
  async (tabId) => {
    if (tabId === 3) {
      await nextTick();
      await mountMap(mapContainerMobile, mobileMap);
    }
  },
);

onBeforeUnmount(() => {
  destroyMap(desktopMap);
  destroyMap(mobileMap);
});

const openFilterMobile = () => {
  isOpenFilterMobile.value = true;
};

const closeFilterMobile = () => {
  isOpenFilterMobile.value = false;
};

const closePartialLocationCards = () => {
  isOpenPartialLocationCards.value = false;
};

const openPartialLocationCards = () => {
  isOpenPartialLocationCards.value = true;
};

watch(
  () => selectedTabMobile.value,
  (newVal) => {
    newVal.id === 3 ? openPartialLocationCards() : null;
  },
);

watch(
  () => route.query,
  async () => {
    syncFiltersFromRoute();
    currentPage.value = 1;
    await getTours();
  },
  { deep: true },
);

useWatchDebounced(
  () =>
    JSON.stringify({
      search: filters.search,
      dateFrom: formatQueryDate(filters.dateFrom),
      dateTo: formatQueryDate(filters.dateTo),
      priceFrom: filters.priceFrom,
      priceTo: filters.priceTo,
      duration: filters.duration,
      location: filters.location,
      sortBy: filters.sortBy,
    }),
  async () => {
    currentPage.value = 1;
    await updateRouteFilters();
  },
  350,
);
</script>

<style lang="scss" scoped>
.tours {
  position: relative;
  &__wrapper {
    margin: 60px 0 30px 0;
  }
  &__header {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: center;
    &--visible {
      display: block;
      position: relative;
      z-index: 2;
      color: $surface-900;
    }
  }
  &__tabs {
    background-color: $white;
    border-radius: 24px;
    &--mobile {
      display: none;
    }
  }
  &__content {
    width: 100%;
    display: flex;
    // justify-content: space-between;
    gap: 24px;
    margin: 36px 0;
  }
  &__filters {
    width: 255px;
    // width: 100%;
    border-radius: 16px;
    background-color: $white;
    box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.04);
    &-box {
      display: flex;
      flex-direction: column;
      gap: 36px;
      padding: 20px;
    }
    &-checkboxs {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    &-dates {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    &-calendar {
      width: 100%;
    }
    &-range {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    &-inner {
      display: flex;
      gap: 6px;
      align-items: center;
    }
    &-header {
      display: flex;
      gap: 12px;
      align-items: center;
      background-color: $blue-200;
      padding: 20px;
      border-radius: 16px;
      &--visible {
        display: block;
        position: relative;
        z-index: 2;
        color: $surface-900;
      }
    }
    &-title {
      color: $surface-900;
      font-size: 16px;
    }
    &-text {
      font-size: 14px;
      font-weight: 400;
      color: $surface-900;
      margin-bottom: 12px;
    }
  }
  &__block {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  &__sort {
    background-color: $white;
    border-radius: 16px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 24px;
    padding-right: 24px;
    box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.04);
    &-title {
      padding: 26px;
      background-color: $blue-200;
      border-radius: 16px;
      color: $surface-900;
      font-size: 16px;
      margin-right: 16px;
    }
  }
  &__empty {
    background-color: $white;
    border-radius: 16px;
    padding: 36px 28px;
    box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.04);
  }
  &__empty-title {
    font-size: 24px;
    font-weight: 700;
    color: $surface-900;
    margin-bottom: 10px;
  }
  &__empty-text {
    max-width: 520px;
    color: $surface-500;
    line-height: 1.5;
  }
  &__cards {
    background-color: $white;
    border-radius: 16px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    align-items: start;
    padding: 16px;
    gap: 16px;
    box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.04);
  }
  &__banner {
    grid-column: 1 / -1;
  }
  &__pagination {
    margin: 0 auto;
    &--scroll {
      position: absolute;
      bottom: 0;
      z-index: 3;
      margin-bottom: 12px;
    }
  }
  &__location {
    display: flex;
    justify-content: space-between;
    height: 610px;
  }
  &__map {
    max-width: 610px;
    width: 100%;
    height: 610px;
    &--mobile {
      display: none;
      width: 100%;
      max-width: 100%;
      height: 100vh;
      position: fixed;
      z-index: 1;
      top: 0;
      left: -0px;
    }
  }
  &__scroll-cards {
    max-width: 320px;
    width: 100%;
    padding: 12px;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: inherit;
    background-color: $white;
    border-top-right-radius: 16px;
    border-bottom-right-radius: 16px;
  }
  &__scroll-wrapper {
    display: flex;
    flex-direction: column;
    position: relative;
  }
  &__scroll-pagination {
    position: absolute;
    bottom: 0;
    background-color: $white;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    left: 0;
    height: 60px;
    border-bottom-right-radius: 16px;
    display: none;
  }
  &__top {
    display: none;
    position: relative;
    z-index: 2;
  }
}

@media (max-width: 375px) {
  .tours {
    &__wrapper {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin: 16px 0;
    }
    &__top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      &-text {
        color: $red-500;
        font-weight: 400;
        cursor: pointer;
      }
      &-search {
        width: 100%;
        background-color: $white;
        border-radius: 26px;
      }
    }
    &__map {
      display: none;
      &--mobile {
        display: block;
        width: 100%;
        max-width: 100%;
        height: 100vh;
        position: fixed;
        z-index: 1;
        top: 0;
        left: -0px;
      }
    }
    &__tabs {
      display: none;
      position: relative;
      z-index: 2;
      &--mobile {
        display: block;
      }
    }
    &__ad,
    &__filters,
    &__sort {
      display: none;
    }
    &__content {
      display: flex;
      flex-direction: column;
      margin: 0;
      gap: 0;
    }
    &__title {
      font-size: 24px;
      &--visible {
        display: block;
      }
    }
    &__cards {
      display: flex;
      flex-direction: column;
      padding: 0;
      background-color: transparent;
      align-items: center;
      box-shadow: none;
      &--tablet {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 6px;
      }
    }
  }
}
</style>