<template>
  <section class="hotels">
    <div
      class="hotels__map hotels__map--mobile"
      v-show="selectedTabMobile.id === 3"
      ref="mapContainerMobile"
    ></div>

    <div class="hotels__wrapper">
      <div class="hotels__top">
        <UiInput
          class="hotels__top-search"
          placeholder="Введите название"
          after-icon="lupa"
          v-model="filters.search"
        />
        <button class="hotels__top-text" type="button" @click="openFilterMobile">
          Фильтр
        </button>
      </div>

      <UiTabs
        class="hotels__tabs hotels__tabs--mobile"
        :tabs="tabsMobile"
        v-model="selectedTabMobile"
      />

      <div class="hotels__header" :class="{ 'hotels__header--visible': selectedTabMobile.id === 3 }">
        <h1 class="hotels__title title">Отели</h1>
        <UiTabs class="hotels__tabs hotels__tabs--desktop" :tabs="tabs" v-model="selectedTab" />
      </div>

      <div class="hotels__content" v-show="selectedTabMobile.id !== 3">
        <aside class="hotels__sidebar">
          <section class="hotels__filters">
            <div class="hotels__filters-header">
              <UiIcons icon="filter-burger" size="size-36" color="red-500" />
              <h2 class="hotels__filters-title">Фильтр</h2>
            </div>

            <div class="hotels__filters-box">
              <UiInput
                placeholder="Введите название"
                after-icon="lupa"
                icon-color="surface-900"
                v-model="filters.search"
              />

              <div class="hotels__filters-group">
                <p class="hotels__filters-text">Дата</p>
                <UiCalendar class="hotels__filters-calendar" label="от" v-model="filters.checkIn" />
                <UiCalendar class="hotels__filters-calendar" label="до" v-model="filters.checkOut" />
              </div>

              <div class="hotels__filters-range">
                <div>
                  <p class="hotels__filters-text">Цена за ночь</p>
                  <UiRange />
                </div>

                <div class="hotels__filters-inner">
                  <span>от</span>
                  <UiInput type="number" placeholder="0" v-model="filters.priceFrom" />
                  <span>₸</span>
                </div>

                <div class="hotels__filters-inner">
                  <span>до</span>
                  <UiInput type="number" placeholder="0" v-model="filters.priceTo" />
                  <span>₸</span>
                </div>
              </div>

              <UiSelect
                label="Регион"
                placeholder="Выберите регион"
                :options="locationOptions"
                option-label="label"
                option-value="value"
                v-model="filters.region"
              />

              <UiSelect
                label="Рейтинг"
                placeholder="Выберите рейтинг"
                :options="ratingOptions"
                option-label="label"
                option-value="value"
                v-model="filters.rating"
              />

              <div class="hotels__filters-actions">
                <button class="hotels__filters-reset" type="button" @click="resetFilters">
                  Сбросить фильтры
                </button>
              </div>
            </div>
          </section>

          <TheCommonAdBanner class="hotels__ad" />
        </aside>

        <div class="hotels__block">
          <section class="hotels__sort">
            <h2 class="hotels__sort-title">Сортировка</h2>
            <div class="hotels__sort-options">
              <button
                v-for="group in sortGroups"
                :key="group.value"
                type="button"
                class="hotels__sort-chip"
                :class="{ 'hotels__sort-chip--active': selectedSortGroup === group.value }"
                @click="selectedSortGroup = group.value"
              >
                <span class="hotels__sort-radio"></span>
                <span>{{ group.label }}</span>
              </button>
            </div>
            <UiSelect
              class="hotels__sort-order"
              placeholder="Порядок"
              :options="sortDirectionOptions"
              option-label="label"
              option-value="value"
              v-model="selectedSortDirection"
            />
          </section>

          <div v-if="isLoading" class="hotels__state">Загружаем отели...</div>
          <div v-else-if="errorMessage" class="hotels__state hotels__state--error">{{ errorMessage }}</div>
          <template v-else-if="sortedHotels.length">
            <div v-show="selectedTab.id === 1" class="hotels__cards">
              <div
                class="hotels__cards-inner"
                :class="{ 'hotels__cards-inner--tablet': selectedTabMobile.id === 1 }"
              >
                <TheHotelsBlock
                  v-for="hotel in paginatedHotels"
                  :key="hotel._id || hotel.id"
                  :hotel="hotel"
                  :view-type="selectedTabMobile.id === 1 ? 'tablet' : 'list'"
                />
              </div>
            </div>

            <div v-show="selectedTab.id === 2" class="hotels__location">
              <div class="hotels__map" ref="mapContainer"></div>
              <div class="hotels__scroll-wrapper">
                <div class="hotels__scroll-cards">
                  <TheHotelsBlock
                    v-for="hotel in paginatedHotels"
                    :key="hotel._id || hotel.id"
                    :hotel="hotel"
                    view-type="list"
                  />
                </div>
              </div>
            </div>

            <UiPagination
              v-if="lastPage > 1"
              class="hotels__pagination"
              :total-items="sortedHotels.length"
              :current-page="currentPage"
              :last-page="lastPage"
              :per-page="perPage"
              @change-page="changePage"
            />
          </template>

          <div v-else class="hotels__empty">
            <h3 class="hotels__empty-title">Отели не найдены</h3>
            <p class="hotels__empty-text">
              Попробуйте изменить фильтры, дату заезда, рейтинг или поисковый запрос.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <UiOverlay :is-show="isOpenFilterMobile" @close="closeFilterMobile" title="Фильтр">
    <div class="hotels__filters-box hotels__filters-box--mobile">
      <UiInput
        placeholder="Введите название"
        after-icon="lupa"
        icon-color="surface-900"
        v-model="filters.search"
      />
      <UiCalendar class="hotels__filters-calendar" label="Дата от" v-model="filters.checkIn" />
      <UiCalendar class="hotels__filters-calendar" label="Дата до" v-model="filters.checkOut" />
      <UiInput type="number" label="Цена от" placeholder="0" v-model="filters.priceFrom" />
      <UiInput type="number" label="Цена до" placeholder="0" v-model="filters.priceTo" />
      <UiSelect
        label="Регион"
        :options="locationOptions"
        option-label="label"
        option-value="value"
        v-model="filters.region"
      />
      <UiSelect
        label="Рейтинг"
        :options="ratingOptions"
        option-label="label"
        option-value="value"
        v-model="filters.rating"
      />
      <UiSelect
        label="Порядок"
        :options="sortDirectionOptions"
        option-label="label"
        option-value="value"
        v-model="selectedSortDirection"
      />
      <div class="hotels__sort-options hotels__sort-options--mobile">
        <button
          v-for="group in sortGroups"
          :key="`${group.value}-mobile`"
          type="button"
          class="hotels__sort-chip"
          :class="{ 'hotels__sort-chip--active': selectedSortGroup === group.value }"
          @click="selectedSortGroup = group.value"
        >
          <span class="hotels__sort-radio"></span>
          <span>{{ group.label }}</span>
        </button>
      </div>
      <div class="hotels__filters-actions">
        <button class="hotels__filters-reset" type="button" @click="resetFilters">
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
      <div class="hotels__cards hotels__cards--mobile-sheet">
        <TheHotelsBlock
          v-for="hotel in paginatedHotels"
          :key="hotel._id || hotel.id"
          :hotel="hotel"
          view-type="list"
        />
      </div>
    </template>
  </UiPartialModal>
</template>

<script setup>
import placeholderImage from "@/assets/image/content/main-image.png";

const { createMap } = useYandexMaps();
const api = useApi();
const mapContainer = ref(null);
const mapContainerMobile = ref(null);
const desktopMap = shallowRef(null);
const mobileMap = shallowRef(null);
const isOpenFilterMobile = ref(false);
const isOpenPartialLocationCards = ref(false);
const hotels = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");
const currentPage = ref(1);
const perPage = 6;
const filters = reactive({
  search: "",
  checkIn: null,
  checkOut: null,
  priceFrom: "",
  priceTo: "",
  region: "",
  rating: "",
});
const tabs = reactive([
  { id: 1, name: "Список", icon: "burger-list" },
  { id: 2, name: "Локация", icon: "location" },
]);
const selectedTab = ref(tabs[0]);
const tabsMobile = reactive([
  { id: 1, name: "Плитка", icon: "tablets" },
  { id: 2, name: "Список", icon: "burger-list" },
  { id: 3, name: "Локация", icon: "location" },
]);
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
const selectedSortDirection = ref("asc");
const mapCenter = [76.889709, 43.238949];

useSeoMeta({
  title: "FlyAway - Отели",
  ogTitle: "FlyAway - Отели",
  description: "FlyAway - сайт для бронирования туров и отелей",
  ogDescription: "FlyAway - сайт для бронирования туров и отелей",
});

const normalizeString = (value) => String(value || "").trim();
const stripHtml = (value) => normalizeString(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const getHotelPrice = (hotel) => {
  const roomTypes = Array.isArray(hotel?.room_types) ? hotel.room_types : [];
  const prices = roomTypes.map((room) => Number(room?.price) || 0).filter((price) => price > 0);
  if (prices.length) return Math.min(...prices);
  return Number(hotel?.price) || 0;
};

const locationOptions = computed(() => {
  const values = [...new Set(hotels.value.map((hotel) => normalizeString(hotel?.location).split(",")[0]).filter(Boolean))];
  return [{ label: "Все регионы", value: "" }, ...values.map((value) => ({ label: value, value }))];
});

const ratingOptions = [
  { label: "Любой рейтинг", value: "" },
  { label: "4+", value: "4" },
  { label: "3+", value: "3" },
  { label: "2+", value: "2" },
];

const filteredHotels = computed(() => {
  const query = normalizeString(filters.search).toLowerCase();
  const priceFrom = Math.max(0, Number(filters.priceFrom) || 0);
  const priceTo = Math.max(0, Number(filters.priceTo) || 0);
  const ratingFrom = Number(filters.rating) || 0;

  return hotels.value.filter((hotel) => {
    const haystack = [hotel?.name, hotel?.description, hotel?.content, hotel?.location]
      .map((item) => stripHtml(item).toLowerCase())
      .join(" ");
    const hotelPrice = getHotelPrice(hotel);
    const region = normalizeString(hotel?.location).split(",")[0];
    const rating = Number(hotel?.rating) || 0;

    const matchesQuery = !query || haystack.includes(query);
    const matchesRegion = !filters.region || region === filters.region;
    const matchesRating = !ratingFrom || rating >= ratingFrom;
    const matchesPriceFrom = !priceFrom || (hotelPrice && hotelPrice >= priceFrom);
    const matchesPriceTo = !priceTo || (hotelPrice && hotelPrice <= priceTo);

    return matchesQuery && matchesRegion && matchesRating && matchesPriceFrom && matchesPriceTo;
  });
});

const sortedHotels = computed(() => {
  const direction = selectedSortDirection.value === "asc" ? 1 : -1;
  return [...filteredHotels.value].sort((a, b) => {
    if (selectedSortGroup.value === "reviews") {
      return ((Number(a?.reviewsCount || a?.reviews) || 0) - (Number(b?.reviewsCount || b?.reviews) || 0)) * direction;
    }

    if (selectedSortGroup.value === "popularity") {
      return ((Number(a?.rating) || 0) - (Number(b?.rating) || 0)) * direction;
    }

    return (getHotelPrice(a) - getHotelPrice(b)) * direction;
  });
});

const lastPage = computed(() => Math.max(1, Math.ceil(sortedHotels.value.length / perPage)));
const paginatedHotels = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return sortedHotels.value.slice(start, start + perPage);
});

const changePage = (page) => {
  currentPage.value = Math.min(Math.max(1, Number(page) || 1), lastPage.value);
};

const resetFilters = () => {
  filters.search = "";
  filters.checkIn = null;
  filters.checkOut = null;
  filters.priceFrom = "";
  filters.priceTo = "";
  filters.region = "";
  filters.rating = "";
  selectedSortGroup.value = "price";
  selectedSortDirection.value = "asc";
  currentPage.value = 1;
};

const loadHotels = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const res = await api.client({
      url: "/hotels",
      method: "get",
      query: {
        search: filters.search || undefined,
        checkIn: formatQueryDate(filters.checkIn) || undefined,
        checkOut: formatQueryDate(filters.checkOut) || undefined,
      },
    });
    hotels.value = Array.isArray(res?.data) ? res.data : [];
  } catch (error) {
    errorMessage.value = error?.message || "Не удалось загрузить отели.";
    hotels.value = [];
  } finally {
    isLoading.value = false;
  }
};

await loadHotels();

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

const destroyMap = (mapRef) => {
  if (mapRef.value && typeof mapRef.value.destroy === "function") {
    mapRef.value.destroy();
  }
  mapRef.value = null;
};

const mapMarkers = computed(() => {
  return hotels.value.map((hotel, index) => ({
    id: hotel?._id || `${index}`,
    coordinates: [mapCenter[0] + index * 0.02, mapCenter[1] + index * 0.01],
    title: normalizeString(hotel?.name) || "Отель",
  }));
});

const mountMap = async (containerRef, mapRef) => {
  if (!containerRef.value || mapRef.value) return;
  try {
    mapRef.value = await createMap({
      container: containerRef.value,
      center: mapCenter,
      zoom: 9,
      markers: mapMarkers.value,
      markerCoordinates: mapCenter,
      markerText: "Отели FlyAway",
    });
  } catch (error) {
    console.error(error);
  }
};

onMounted(async () => {
  await nextTick();
  if (selectedTab.value.id === 2) {
    await mountMap(mapContainer, desktopMap);
  }
  if (selectedTabMobile.value.id === 3) {
    await mountMap(mapContainerMobile, mobileMap);
  }
});

watch(() => selectedTab.value.id, async (id) => {
  if (id === 2) {
    await nextTick();
    await mountMap(mapContainer, desktopMap);
  }
});

watch(() => selectedTabMobile.value.id, async (id) => {
  if (id === 3) {
    await nextTick();
    await mountMap(mapContainerMobile, mobileMap);
    openPartialLocationCards();
    return;
  }
  closePartialLocationCards();
});

watch(mapMarkers, (markers) => {
  desktopMap.value?.setMarkers?.(markers);
  mobileMap.value?.setMarkers?.(markers);
}, { deep: true });

watch(filteredHotels, () => {
  if (currentPage.value > lastPage.value) currentPage.value = lastPage.value;
  if (currentPage.value < 1) currentPage.value = 1;
});

watch(() => [filters.search, filters.checkIn, filters.checkOut], async () => {
  currentPage.value = 1;
  await loadHotels();
}, { deep: true });

onBeforeUnmount(() => {
  destroyMap(desktopMap);
  destroyMap(mobileMap);
});
</script>

<style lang="scss" scoped>
.hotels {
  position: relative;

  &__wrapper {
    margin: 48px 0 34px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: center;
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
  &__state,
  &__location {
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
    gap: 20px;
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

  &__filters-inner {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  &__filters-calendar {
    border-radius: 24px;
  }

  &__filters-text {
    font-size: 14px;
    font-weight: 600;
    color: $surface-900;
  }

  &__filters-actions {
    display: flex;
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
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__sort {
    display: grid;
    grid-template-columns: auto 1fr 220px;
    gap: 16px;
    align-items: center;
    padding: 18px 20px;
  }

  &__sort-options {
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

  &__cards {
    padding: 16px;
  }

  &__cards-inner {
    display: flex;
    flex-direction: column;
    gap: 16px;

    &--tablet {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  &__location {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 360px;
    overflow: hidden;
    min-height: 610px;
  }

  &__map {
    width: 100%;
    height: 610px;

    &--mobile {
      display: none;
      width: 100%;
      height: 100vh;
      position: fixed;
      z-index: 1;
      inset: 0;
    }
  }

  &__scroll-wrapper {
    border-left: 1px solid rgba($surface-300, 0.28);
    background: $white;
  }

  &__scroll-cards {
    height: 610px;
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
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}

@media (max-width: 1200px) {
  .hotels {
    &__sort {
      grid-template-columns: 1fr;
    }
  }
}

@media (max-width: 900px) {
  .hotels {
    &__content {
      grid-template-columns: 1fr;
    }

    &__sidebar {
      display: none;
    }
  }
}

@media (max-width: 640px) {
  .hotels {
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

    &__cards-inner {
      gap: 8px;
      &--tablet {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    &__location {
      grid-template-columns: 1fr;
      min-height: auto;
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
