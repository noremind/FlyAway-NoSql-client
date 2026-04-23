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
        <button class="tours__top-text" type="button" @click="openFilterMobile">
          Фильтр
        </button>
      </div>

      <UiTabs
        class="tours__tabs tours__tabs--mobile"
        :tabs="tabsMobile"
        v-model="selectedTabMobile"
      ></UiTabs>

      <div
        class="tours__hero"
        :class="{
          'tours__hero--map-mobile': selectedTabMobile.id === 3,
        }"
      >
        <h1 class="tours__title title">Туры</h1>
        <UiTabs
          class="tours__tabs tours__tabs--desktop"
          :tabs="tabs"
          v-model="selectedTab"
        ></UiTabs>
      </div>

      <div class="tours__content" v-show="selectedTabMobile.id !== 3">
        <aside class="tours__sidebar">
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

              <div class="tours__filters-group">
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

              <UiSelect
                label="Продолжительность"
                placeholder="Выберите длительность"
                :options="durationOptions"
                option-label="label"
                option-value="value"
                v-model="filters.duration"
              ></UiSelect>

              <UiSelect
                label="Локация"
                placeholder="Выберите локацию"
                :options="locationOptions"
                option-label="label"
                option-value="value"
                v-model="filters.location"
              ></UiSelect>

              <div class="tours__filters-actions">
                <button class="tours__filters-reset" type="button" @click="resetFilters">
                  Сбросить фильтры
                </button>
              </div>
            </div>
          </section>

          <TheCommonAdBanner class="tours__ad"></TheCommonAdBanner>
        </aside>

        <div class="tours__block">
          <section class="tours__sort">
            <div class="tours__sort-head">
              <h2 class="tours__sort-title">Сортировка</h2>
            </div>

            <div class="tours__sort-groups">
              <button
                v-for="group in sortGroups"
                :key="group.value"
                type="button"
                class="tours__sort-chip"
                :class="{
                  'tours__sort-chip--active': selectedSortGroup === group.value,
                }"
                @click="selectSortGroup(group.value)"
              >
                <span class="tours__sort-radio"></span>
                <span>{{ group.label }}</span>
              </button>
            </div>

            <UiSelect
              class="tours__sort-order"
              placeholder="Порядок"
              :options="sortDirectionOptions"
              option-label="label"
              option-value="value"
              v-model="selectedSortDirection"
              :disabled="selectedSortGroup !== 'price'"
            ></UiSelect>
          </section>

          <div v-if="isLoading" class="tours__state">Загружаем туры...</div>

          <div v-else-if="errorMessage" class="tours__state tours__state--error">
            {{ errorMessage }}
          </div>

          <template v-else-if="tours.length">
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
            </div>

            <div v-show="selectedTab?.id === 2" class="tours__location">
              <div class="tours__map" ref="mapContainer"></div>

              <div class="tours__scroll-wrapper">
                <div class="tours__scroll-cards">
                  <TheCommonTourCard
                    v-for="tour in tours"
                    :key="tour._id || tour.id"
                    :tour="tour"
                    view-type="list"
                  ></TheCommonTourCard>
                </div>
              </div>
            </div>

            <UiPagination
              v-if="pagination?.last_page && pagination?.last_page !== 1"
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
              По выбранным фильтрам туры не нашлись. Попробуйте изменить
              диапазон цены, даты или поисковый запрос.
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
    <div class="tours__filters-box tours__filters-box--mobile">
      <UiInput
        label="Название"
        placeholder="Введите название"
        after-icon="lupa"
        icon-color="surface-900"
        v-model="filters.search"
      ></UiInput>

      <div class="tours__filters-group">
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

      <UiSelect
        label="Продолжительность"
        placeholder="Выберите длительность"
        :options="durationOptions"
        option-label="label"
        option-value="value"
        v-model="filters.duration"
      ></UiSelect>

      <UiSelect
        label="Локация"
        placeholder="Выберите локацию"
        :options="locationOptions"
        option-label="label"
        option-value="value"
        v-model="filters.location"
      ></UiSelect>

      <div class="tours__sort-mobile">
        <p class="tours__filters-text">Сортировка</p>
        <div class="tours__sort-groups tours__sort-groups--mobile">
          <button
            v-for="group in sortGroups"
            :key="`${group.value}-mobile`"
            type="button"
            class="tours__sort-chip"
            :class="{
              'tours__sort-chip--active': selectedSortGroup === group.value,
            }"
            @click="selectSortGroup(group.value)"
          >
            <span class="tours__sort-radio"></span>
            <span>{{ group.label }}</span>
          </button>
        </div>
        <UiSelect
          placeholder="Порядок"
          :options="sortDirectionOptions"
          option-label="label"
          option-value="value"
          v-model="selectedSortDirection"
          :disabled="selectedSortGroup !== 'price'"
        ></UiSelect>
      </div>

      <div class="tours__filters-actions">
        <button class="tours__filters-reset" type="button" @click="resetFilters">
          Сбросить фильтры
        </button>
      </div>
    </div>
  </UiOverlay>

  <UiPartialModal
    :is-show="selectedTabMobile.id === 3 && isOpenPartialLocationCards"
    :dark-bg="false"
    @close="closePartialLocationCards"
  >
    <template #body>
      <div v-if="isLoading" class="tours__state tours__state--mobile">
        Загружаем туры...
      </div>
      <div
        v-else-if="errorMessage"
        class="tours__state tours__state--error tours__state--mobile"
      >
        {{ errorMessage }}
      </div>
      <div v-else class="tours__cards tours__cards--mobile-sheet">
        <TheCommonTourCard
          v-for="tour in tours"
          :key="tour._id || tour.id"
          :tour="tour"
          view-type="list"
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
const isLoading = ref(false);
const errorMessage = ref("");
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
  sortBy: "price_desc",
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
const sortGroups = [
  { label: "по цене", value: "price" },
  { label: "по популярности", value: "popularity" },
  { label: "по отзывам", value: "reviews" },
];
const sortDirectionOptions = [
  { label: "по возрастанию", value: "asc" },
  { label: "по убыванию", value: "desc" },
];
const selectedSortGroup = ref("price");
const selectedSortDirection = ref("desc");

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

const uniqueOptionsFromTours = (mapper, fallbackLabel) => {
  const values = [...new Set((Array.isArray(tours.value) ? tours.value : [])
    .map(mapper)
    .map((item) => String(item || "").trim())
    .filter(Boolean))];

  return [
    { label: fallbackLabel, value: "" },
    ...values.map((value) => ({ label: value, value })),
  ];
};

const durationOptions = computed(() =>
  uniqueOptionsFromTours((tour) => tour?.duration, "Все варианты"),
);

const locationOptions = computed(() =>
  uniqueOptionsFromTours(
    (tour) => tour?.departureCity || tour?.departurePoint,
    "Все локации",
  ),
);

const applySortByUi = () => {
  if (selectedSortGroup.value === "price") {
    filters.sortBy = selectedSortDirection.value === "asc" ? "price_asc" : "price_desc";
    return;
  }

  if (selectedSortGroup.value === "reviews") {
    filters.sortBy = "rating_desc";
    return;
  }

  filters.sortBy = "popularity";
};

const syncSortUiFromFilters = () => {
  if (filters.sortBy === "price_asc") {
    selectedSortGroup.value = "price";
    selectedSortDirection.value = "asc";
    return;
  }

  if (filters.sortBy === "rating_desc") {
    selectedSortGroup.value = "reviews";
    selectedSortDirection.value = "desc";
    return;
  }

  if (filters.sortBy === "popularity") {
    selectedSortGroup.value = "popularity";
    selectedSortDirection.value = "desc";
    return;
  }

  selectedSortGroup.value = "price";
  selectedSortDirection.value = "desc";
  filters.sortBy = "price_desc";
};

const selectSortGroup = (value) => {
  selectedSortGroup.value = value;
  applySortByUi();
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
  filters.sortBy = String(route.query.sortBy || "price_desc");
  syncSortUiFromFilters();
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
    sortBy: filters.sortBy !== "price_desc" ? filters.sortBy : "",
  });

  if (areQueriesEqual(nextQuery, route.query)) {
    return;
  }

  await router.replace({ query: nextQuery });
};

const getTours = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
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
  } catch (error) {
    tours.value = [];
    errorMessage.value = error?.message || "Не удалось загрузить туры.";
  } finally {
    isLoading.value = false;
  }
};

const resetFilters = async () => {
  filters.search = "";
  filters.dateFrom = null;
  filters.dateTo = null;
  filters.priceFrom = "";
  filters.priceTo = "";
  filters.duration = "";
  filters.location = "";
  selectedSortGroup.value = "price";
  selectedSortDirection.value = "desc";
  applySortByUi();
  currentPage.value = 1;
  await updateRouteFilters();
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
      openPartialLocationCards();
      return;
    }

    closePartialLocationCards();
  },
);

watch(
  () => selectedSortDirection.value,
  () => {
    if (selectedSortGroup.value === "price") {
      applySortByUi();
    }
  },
);

watch(
  () => filters.sortBy,
  () => {
    syncSortUiFromFilters();
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
    margin: 48px 0 34px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__hero {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: center;

    &--map-mobile {
      position: relative;
      z-index: 2;
    }
  }

  &__title {
    color: $surface-900;
  }

  &__tabs {
    &--desktop {
      background-color: $white;
      border-radius: 999px;
      padding: 4px;
      box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.04);
    }

    &--mobile {
      display: none;
    }
  }

  &__content {
    display: grid;
    grid-template-columns: 280px minmax(0, 1fr);
    gap: 24px;
    align-items: start;
  }

  &__sidebar {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__filters,
  &__sort,
  &__cards,
  &__empty,
  &__state {
    background-color: $white;
    border-radius: 20px;
    box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.04);
  }

  &__filters {
    overflow: hidden;
  }

  &__filters-header {
    display: flex;
    gap: 12px;
    align-items: center;
    background-color: $blue-200;
    padding: 18px 20px;
  }

  &__filters-title,
  &__sort-title {
    color: $surface-900;
    font-size: 16px;
    font-weight: 700;
  }

  &__filters-box {
    display: flex;
    flex-direction: column;
    gap: 22px;
    padding: 20px;

    &--mobile {
      padding: 8px 0 0;
    }
  }

  &__filters-group,
  &__filters-range {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__filters-dates {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__filters-text {
    font-size: 14px;
    font-weight: 600;
    color: $surface-900;
  }

  &__filters-inner {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  &__filters-actions {
    display: flex;
    justify-content: flex-start;
  }

  &__filters-reset {
    min-height: 40px;
    padding: 0 14px;
    border-radius: 12px;
    color: $red-500;
    background: rgba($red-500, 0.06);
    font-weight: 700;
  }

  &__block {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__sort {
    display: grid;
    grid-template-columns: auto 1fr 210px;
    gap: 16px;
    align-items: center;
    padding: 18px 20px;
  }

  &__sort-head {
    display: flex;
    align-items: center;
  }

  &__sort-groups {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;

    &--mobile {
      flex-direction: column;
    }
  }

  &__sort-chip {
    min-height: 40px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid rgba($surface-300, 0.55);
    background: $white;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: $surface-500;
    font-size: 14px;
    font-weight: 600;

    &--active {
      border-color: rgba($red-500, 0.45);
      color: $surface-900;
      background: rgba($red-500, 0.04);
    }
  }

  &__sort-radio {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid rgba($surface-300, 0.95);
    position: relative;
    flex: 0 0 16px;
  }

  &__sort-chip--active &__sort-radio {
    border-color: $red-500;
  }

  &__sort-chip--active &__sort-radio::after {
    content: "";
    position: absolute;
    inset: 3px;
    border-radius: 50%;
    background: $red-500;
  }

  &__sort-order {
    width: 100%;
  }

  &__cards {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-items: stretch;
    padding: 16px;
    gap: 16px;
  }

  &__location {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 340px;
    gap: 0;
    height: 610px;
    border-radius: 20px;
    overflow: hidden;
    background: $white;
    box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.04);
  }

  &__map {
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
      left: 0;
    }
  }

  &__scroll-wrapper {
    height: 100%;
    background: $white;
    border-left: 1px solid rgba($surface-300, 0.3);
  }

  &__scroll-cards {
    height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px;
  }

  &__pagination {
    margin: 0 auto;
  }

  &__state,
  &__empty {
    padding: 36px 24px;
    text-align: center;
  }

  &__state {
    color: $surface-500;

    &--error {
      color: $orange-200;
    }

    &--mobile {
      background: transparent;
      box-shadow: none;
      padding: 28px 16px;
    }
  }

  &__empty-title {
    color: $surface-900;
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 10px;
  }

  &__empty-text {
    max-width: 560px;
    margin: 0 auto;
    color: $surface-500;
    line-height: 1.5;
  }

  &__top {
    display: none;
  }

  &__cards--mobile-sheet {
    background: transparent;
    box-shadow: none;
    grid-template-columns: 1fr;
    padding: 0;
  }
}

@media (max-width: 1200px) {
  .tours {
    &__cards {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    &__sort {
      grid-template-columns: 1fr;
    }
  }
}

@media (max-width: 900px) {
  .tours {
    &__content {
      grid-template-columns: 1fr;
    }

    &__sidebar {
      display: none;
    }

    &__cards {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}

@media (max-width: 640px) {
  .tours {
    &__wrapper {
      margin: 16px 0 24px;
      gap: 16px;
    }

    &__top {
      display: flex;
      align-items: center;
      gap: 12px;
      position: relative;
      z-index: 2;
    }

    &__top-search {
      width: 100%;
      background-color: $white;
      border-radius: 26px;
    }

    &__top-text {
      color: $red-500;
      font-weight: 700;
      white-space: nowrap;
    }

    &__tabs {
      &--desktop {
        display: none;
      }

      &--mobile {
        display: block;
        position: relative;
        z-index: 2;
      }
    }

    &__hero {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    &__title {
      font-size: 28px;
    }

    &__cards {
      grid-template-columns: 1fr;
      padding: 0;
      background: transparent;
      box-shadow: none;
    }

    &__cards--tablet {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }

    &__location {
      grid-template-columns: 1fr;
      height: auto;
      background: transparent;
      box-shadow: none;
    }

    &__scroll-wrapper {
      display: none;
    }

    &__map {
      display: none;

      &--mobile {
        display: block;
      }
    }
  }
}

@media (max-width: 375px) {
  .tours {
    &__title {
      font-size: 24px;
    }

    &__cards--tablet {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}
</style>
