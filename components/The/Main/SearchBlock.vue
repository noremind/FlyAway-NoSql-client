<template>
  <div class="search">
    <div class="search__wrapper">
      <UiTabs v-model="selectedTab" :tabs="tabs"></UiTabs>

      <div class="search__filter">
        <div class="search__box">
          <UiInput
            placeholder="Введите название"
            after-icon="lupa"
            icon-color="surface-900"
            :label="searchLabel"
            v-model="searchValue"
          ></UiInput>
        </div>
        <div class="search__box">
          <div class="search__box-calendar">
            <UiCalendar
              class="search__start-date"
              placeholder=""
              :have-icon="false"
              :label="dateFromLabel"
              v-model="dateFrom"
            ></UiCalendar>
            <!-- <UiIcons icon="arrow" color="red-500" size="size-14"></UiIcons> -->
            <UiCalendar
              class="search__start-date"
              placeholder=""
              :label="dateToLabel"
              :have-icon="false"
              v-model="dateTo"
            ></UiCalendar>
          </div>
        </div>
        <UiButton
          class="search__btn button-secondary"
          :label="buttonLabel"
          before-icon="lupa"
          icon-color="red-500"
          @click="submitSearch"
        ></UiButton>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const router = useRouter();

const tabs = reactive([
  {
    id: 1,
    name: "Туры",
    value: "tours",
  },
  {
    id: 2,
    name: "Отели",
    value: "hotels",
  },
]);
const selectedTab = ref(tabs[0]);
const searchValue = ref(String(route.query.search || ""));
const dateFrom = ref(
  parseQueryDate(route.query.dateFrom || route.query.checkIn),
);
const dateTo = ref(parseQueryDate(route.query.dateTo || route.query.checkOut));

const isHotelsTab = computed(() => selectedTab.value?.value === "hotels");

const searchLabel = computed(() =>
  isHotelsTab.value ? "Поиск отеля" : "Поиск тура",
);
const dateFromLabel = computed(() => (isHotelsTab.value ? "Заезд" : "Дата от"));
const dateToLabel = computed(() => (isHotelsTab.value ? "Выезд" : "Дата до"));
const buttonLabel = computed(() =>
  isHotelsTab.value ? "Найти отели" : "Найти туры",
);

const submitSearch = async () => {
  const normalizedRange = normalizeDateRange(dateFrom.value, dateTo.value);
  dateFrom.value = normalizedRange.from;
  dateTo.value = normalizedRange.to;

  const query = isHotelsTab.value
    ? buildQueryObject({
        search: searchValue.value,
        checkIn: formatQueryDate(dateFrom.value),
        checkOut: formatQueryDate(dateTo.value),
      })
    : buildQueryObject({
        search: searchValue.value,
        dateFrom: formatQueryDate(dateFrom.value),
        dateTo: formatQueryDate(dateTo.value),
      });

  await router.push({
    path: isHotelsTab.value ? "/hotels" : "/tours",
    query,
  });
};
</script>

<style lang="scss" scoped>
.search {
  position: relative;
  width: 90%;
  display: flex;
  justify-content: center;
  top: -170px;
  padding: 0 12px;
  margin: 0 auto;
  min-height: 160px;
  &__wrapper {
    width: 100%;
    position: absolute;
    z-index: 5;
    box-shadow: 0px 0px 20px 0px #00000029;
    border-radius: 16px;
    max-width: 1120px;
    padding: 16px 16px 46px 16px;
    background-color: $white;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 44px;
    margin: 12px;
  }
  &__box {
    min-width: 0;

    &-calendar {
      display: flex;
      // grid-template-columns: minmax(190px, 1fr) auto minmax(190px, 1fr);
      gap: 12px;
      align-items: end;
      padding: 3px;
      border-radius: 26px;
      min-width: 0;
    }
  }
  &__btn {
    max-width: 215px;
    width: 100%;
    margin: 20px 0 0 0;
    padding: 12px 16px;
    white-space: nowrap;
  }
  &__text {
    color: $surface-900;
    font-weight: 400;
    font-size: 14px;
    margin-bottom: 10px;
  }
  &__filter {
    display: flex;
    gap: 36px;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    width: 100%;
  }
  &__start-date,
  &__end-date {
    display: flex;
    margin-top: 0px;
    padding: 3.2px;
    min-width: 0;
  }

  :deep(.calendar__label) {
    white-space: nowrap;
  }
}

@media (max-width: 768px) {
  .search {
    min-height: 250px;
    top: -10px;
    &__wrapper {
    }
    &__filter {
      gap: 12px;
    }

    &__box-calendar {
      grid-template-columns: 1fr;
      justify-items: stretch;
    }
  }
}
</style>
