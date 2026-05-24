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
        />
        <button class="tours__top-text" type="button" @click="openFilterMobile">
          Фильтр
        </button>
      </div>

      <UiTabs
        class="tours__tabs tours__tabs--mobile"
        :tabs="tabsMobile"
        v-model="selectedTabMobile"
      />

      <div
        class="tours__hero"
        :class="{ 'tours__hero--map-mobile': selectedTabMobile.id === 3 }"
      >
        <h1 class="tours__title title">Туры</h1>

        <UiTabs
          class="tours__tabs tours__tabs--desktop"
          :tabs="tabs"
          v-model="selectedTab"
        />
      </div>

      <div class="tours__content" v-show="selectedTabMobile.id !== 3">
        <aside class="tours__sidebar">
          <section class="tours__filters">
            <div class="tours__filters-header">
              <UiIcons icon="filter-burger" size="size-36" color="red-500" />
              <h2 class="tours__filters-title">Фильтр</h2>
            </div>

            <div class="tours__filters-box">
              <UiInput
                label="Название"
                placeholder="Введите название"
                after-icon="lupa"
                icon-color="surface-900"
                v-model="filters.search"
              />

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

              <UiSelect
                label="Продолжительность"
                placeholder="Выберите длительность"
                :options="durationOptions"
                option-label="label"
                option-value="value"
                v-model="filters.duration"
              />

              <UiSelect
                label="Локация"
                placeholder="Выберите локацию"
                :options="locationOptions"
                option-label="label"
                option-value="value"
                v-model="filters.location"
              />

              <div class="tours__filters-actions">
                <button
                  class="tours__filters-reset"
                  type="button"
                  @click="resetFilters"
                >
                  Сбросить фильтры
                </button>
              </div>
            </div>
          </section>

          <TheCommonAdBanner class="tours__ad" />
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
            />
          </section>

          <div v-if="isLoading" class="tours__state">Загружаем туры...</div>

          <div
            v-else-if="errorMessage"
            class="tours__state tours__state--error"
          >
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
                :key="tour._id || tour.id"
                :tour="tour"
                :view-type="selectedTabMobile.id === 1 ? 'tablet' : 'list'"
              />
            </div>

            <div v-show="selectedTab?.id === 2" class="tours__location">
              <div class="tours__map" ref="mapContainer"></div>

              <div class="tours__scroll-wrapper">
                <div class="tours__scroll-cards">
                  <TheCommonTourCard
                    v-for="tour in tours"
                    :key="`location-${tour._id || tour.id}`"
                    :tour="tour"
                    view-type="list"
                  />
                </div>
              </div>
            </div>

            <UiPagination
              v-if="pagination.last_page > 1"
              :total-items="pagination.total_items"
              :current-page="currentPage"
              :last-page="pagination.last_page"
              :per-page="pagination.per_page"
              class="tours__pagination"
              @change-page="paginationPage"
            />
          </template>

          <div v-else class="tours__empty">
            <h3 class="tours__empty-title">Туры не найдены</h3>
            <p class="tours__empty-text">
              Попробуйте изменить даты поездки, локацию или поисковый запрос.
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
      />

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

      <UiSelect
        label="Продолжительность"
        placeholder="Выберите длительность"
        :options="durationOptions"
        option-label="label"
        option-value="value"
        v-model="filters.duration"
      />

      <UiSelect
        label="Локация"
        placeholder="Выберите локацию"
        :options="locationOptions"
        option-label="label"
        option-value="value"
        v-model="filters.location"
      />

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
        />
      </div>

      <div class="tours__filters-actions">
        <button
          class="tours__filters-reset"
          type="button"
          @click="resetFilters"
        >
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
          :key="`mobile-location-${tour._id || tour.id}`"
          :tour="tour"
          view-type="list"
        />
      </div>
    </template>
  </UiPartialModal>
</template>

<script setup>
const api = useApi();
const router = useRouter();
const { createMap } = useYandexMaps();

const mapContainer = ref(null);
const mapContainerMobile = ref(null);
const desktopMap = shallowRef(null);
const mobileMap = shallowRef(null);

const isOpenFilterMobile = ref(false);
const isOpenPartialLocationCards = ref(false);
const isLoading = ref(false);
const errorMessage = ref("");
const tours = ref([]);
const currentPage = ref(1);
const debounceHandle = ref(null);

const locationOptions = ref([{ label: "Все локации", value: "" }]);
const durationOptions = ref([{ label: "Все варианты", value: "" }]);

const pagination = reactive({
  last_page: 1,
  total_items: 0,
  per_page: 9,
});

const filters = reactive({
  search: "",
  dateFrom: null,
  dateTo: null,
  duration: "",
  location: "",
  sortBy: "price_desc",
});

const tabs = reactive([
  { id: 1, name: "Список", icon: "burger-list" },
  { id: 2, name: "Локация", icon: "location" },
]);

const tabsMobile = reactive([
  { id: 1, name: "Плитка", icon: "tablets" },
  { id: 2, name: "Список", icon: "burger-list" },
  { id: 3, name: "Локация", icon: "location" },
]);

const selectedTab = ref(tabs[0]);
const selectedTabMobile = ref(tabsMobile[0]);

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
const mapCenter = [76.889709, 43.238949];

useSeoMeta({
  title: "FlyAway - Туры",
  ogTitle: "FlyAway - Туры",
  description: "FlyAway - сайт для бронирования туров и отелей",
  ogDescription: "FlyAway - сайт для бронирования туров и отелей",
});

const normalizeString = (value) => String(value || "").trim();

const formatQueryDate = (value) => {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const normalizeDateRange = () => {
  if (!filters.dateFrom || !filters.dateTo) return;

  const from = new Date(filters.dateFrom);
  const to = new Date(filters.dateTo);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return;
  if (from.getTime() <= to.getTime()) return;

  const nextFrom = filters.dateTo;
  filters.dateTo = filters.dateFrom;
  filters.dateFrom = nextFrom;
};

const buildFallbackOptions = (mapper, emptyLabel) => {
  const values = [
    ...new Set(
      tours.value
        .map(mapper)
        .map((item) => normalizeString(item))
        .filter(Boolean),
    ),
  ];

  return [
    { label: emptyLabel, value: "" },
    ...values.map((value) => ({ label: value, value })),
  ];
};

const syncSortBy = () => {
  if (selectedSortGroup.value === "price") {
    filters.sortBy =
      selectedSortDirection.value === "asc" ? "price_asc" : "price_desc";
    return;
  }

  if (selectedSortGroup.value === "reviews") {
    filters.sortBy = "rating_desc";
    return;
  }

  filters.sortBy = "popularity";
};

const syncSortControlsFromSortBy = () => {
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

const mapMarkers = computed(() => {
  return tours.value
    .map((tour) => {
      const x = Number(tour?.departureLocation?.x);
      const y = Number(tour?.departureLocation?.y);
      const id = String(tour?._id || tour?.id || "");

      if (!id || !Number.isFinite(x) || !Number.isFinite(y)) return null;

      return {
        id,
        coordinates: [x, y],
        title: normalizeString(tour?.title) || "Тур",
        onClick: () => router.push(`/tours/${id}`),
      };
    })
    .filter(Boolean);
});

const getTours = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    normalizeDateRange();

    const response = await api.client({
      url: "/tours",
      method: "get",
      query: {
        page: currentPage.value,
        per_page: pagination.per_page || 9,
        search: filters.search || undefined,
        dateFrom: formatQueryDate(filters.dateFrom) || undefined,
        dateTo: formatQueryDate(filters.dateTo) || undefined,
        duration: filters.duration || undefined,
        location: filters.location || undefined,
        sortBy: filters.sortBy || undefined,
      },
    });

    tours.value = Array.isArray(response?.data) ? response.data : [];

    const meta = response?.meta || {};
    pagination.last_page = Number(meta.last_page) || 1;
    pagination.total_items =
      Number(meta.total_items ?? meta.total) || tours.value.length;
    pagination.per_page = Number(meta.per_page) || pagination.per_page || 9;
    currentPage.value = Number(meta.current_page) || currentPage.value;

    if (locationOptions.value.length <= 1) {
      locationOptions.value = buildFallbackOptions(
        (tour) => tour?.departureCity || tour?.departurePoint,
        "Все локации",
      );
    }

    if (durationOptions.value.length <= 1) {
      durationOptions.value = buildFallbackOptions(
        (tour) => tour?.duration,
        "Все варианты",
      );
    }
  } catch (error) {
    tours.value = [];
    errorMessage.value = error?.message || "Не удалось загрузить туры.";
  } finally {
    isLoading.value = false;
  }
};

const loadFilterOptions = async () => {
  try {
    const [citiesResponse, durationsResponse] = await Promise.all([
      api.client({
        url: "/tours/filter/cities",
        method: "get",
      }),
      api.client({
        url: "/tours/filter/durations",
        method: "get",
      }),
    ]);

    const cities = Array.isArray(citiesResponse?.data)
      ? citiesResponse.data
      : [];
    const durations = Array.isArray(durationsResponse?.data)
      ? durationsResponse.data
      : [];

    locationOptions.value = [
      { label: "Все локации", value: "" },
      ...cities.filter((item) => normalizeString(item?.value || item?.label)),
    ];

    durationOptions.value = [
      { label: "Все варианты", value: "" },
      ...durations.filter((item) =>
        normalizeString(item?.value || item?.label),
      ),
    ];
  } catch {
    locationOptions.value = buildFallbackOptions(
      (tour) => tour?.departureCity || tour?.departurePoint,
      "Все локации",
    );
    durationOptions.value = buildFallbackOptions(
      (tour) => tour?.duration,
      "Все варианты",
    );
  }
};

const destroyMap = (mapRef) => {
  if (mapRef.value && typeof mapRef.value.destroy === "function") {
    mapRef.value.destroy();
  }

  mapRef.value = null;
};

const mountMap = async (containerRef, mapRef) => {
  if (!containerRef.value || mapRef.value) return;

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

const refreshToursDebounced = () => {
  clearTimeout(debounceHandle.value);

  debounceHandle.value = setTimeout(async () => {
    currentPage.value = 1;
    await getTours();
  }, 300);
};

const selectSortGroup = async (value) => {
  selectedSortGroup.value = value;
  syncSortBy();
  currentPage.value = 1;
  await getTours();
};

const resetFilters = async () => {
  filters.search = "";
  filters.dateFrom = null;
  filters.dateTo = null;
  filters.duration = "";
  filters.location = "";
  selectedSortGroup.value = "price";
  selectedSortDirection.value = "desc";
  syncSortBy();
  currentPage.value = 1;
  await getTours();
};

const paginationPage = async (page) => {
  currentPage.value = page;
  await getTours();
};

const openFilterMobile = () => {
  isOpenFilterMobile.value = true;
};

const closeFilterMobile = () => {
  isOpenFilterMobile.value = false;
};

const openPartialLocationCards = () => {
  isOpenPartialLocationCards.value = true;
};

const closePartialLocationCards = () => {
  isOpenPartialLocationCards.value = false;
};

watch(
  () => [
    filters.search,
    filters.dateFrom,
    filters.dateTo,
    filters.duration,
    filters.location,
  ],
  () => {
    refreshToursDebounced();
  },
  { deep: true },
);

watch(
  () => selectedSortDirection.value,
  async () => {
    if (selectedSortGroup.value !== "price") return;

    syncSortBy();
    currentPage.value = 1;
    await getTours();
  },
);

watch(
  () => selectedTab.value.id,
  async (value) => {
    if (value !== 2) return;

    await nextTick();
    await mountMap(mapContainer, desktopMap);
  },
);

watch(
  () => selectedTabMobile.value.id,
  async (value) => {
    if (value === 3) {
      await nextTick();
      await mountMap(mapContainerMobile, mobileMap);
      openPartialLocationCards();
      return;
    }

    closePartialLocationCards();
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

onMounted(async () => {
  syncSortControlsFromSortBy();

  await Promise.all([loadFilterOptions(), getTours()]);

  await nextTick();

  if (selectedTab.value.id === 2) {
    await mountMap(mapContainer, desktopMap);
  }

  if (selectedTabMobile.value.id === 3) {
    await mountMap(mapContainerMobile, mobileMap);
  }
});

onBeforeUnmount(() => {
  clearTimeout(debounceHandle.value);
  destroyMap(desktopMap);
  destroyMap(mobileMap);
});
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

  &__filters-group {
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

    &--tablet {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    &--mobile-sheet {
      background: transparent;
      box-shadow: none;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  }

  &__location {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 340px;
    gap: 0;
    height: 610px;
    min-height: 610px;
    border-radius: 20px;
    overflow: hidden;
    background: $white;
    box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.04);
    align-items: stretch;
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
    min-height: 0;
    height: 100%;
    overflow: hidden;
    background: $white;
    border-left: 1px solid rgba($surface-300, 0.3);
  }

  &__scroll-cards {
    min-height: 0;
    height: 100%;
    overflow-y: auto;
    overscroll-behavior: contain;
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
      padding: 12px 0;
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

  &__sort-mobile {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}

.tours__scroll-cards :deep(.tour) {
  width: 100%;
}

.tours__scroll-cards :deep(.tour__wrapper) {
  max-width: 100%;
}

@media (max-width: 1200px) {
  .tours {
    &__sort {
      grid-template-columns: 1fr;
    }

    &__cards {
      grid-template-columns: repeat(2, minmax(0, 1fr));
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
      grid-template-columns: 1fr;
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

    &__cards,
    &__location {
      background: transparent;
      box-shadow: none;
      padding: 0;
    }

    &__cards--tablet {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }

    &__location {
      grid-template-columns: 1fr;
      min-height: auto;
      height: auto;
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
</style>
