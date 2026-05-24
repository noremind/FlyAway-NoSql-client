<template>
  <section class="partners">
    <div class="partners__wrapper">
      <div class="partners__top">
        <UiInput
          class="partners__top-search"
          placeholder="Введите название"
          after-icon="lupa"
          v-model="filters.search"
          @input="debouncedGetPartners"
        ></UiInput>
        <p class="partners__top-text" @click="openFilterMobile">Фильтр</p>
      </div>

      <div class="partners__header">
        <div>
          <h1 class="partners__title title">Партнеры</h1>
          <p class="partners__subtitle">
            Туристические компании и отели, которые размещают предложения на FlyAway.
          </p>
        </div>
      </div>

      <div class="partners__content">
        <div class="partners__content-left">
          <section class="partners__filters">
            <div class="partners__filters-header">
              <UiIcons icon="filter-burger" size="size-36" color="red-500"></UiIcons>
              <h2 class="partners__filters-title">Фильтр</h2>
            </div>

            <div class="partners__filters-box">
              <UiInput
                placeholder="Введите название"
                after-icon="lupa"
                icon-color="surface-900"
                label="Поиск по названию"
                v-model="filters.search"
                @input="debouncedGetPartners"
              ></UiInput>
            </div>
          </section>
          <TheCommonAdBanner class="partners__ad"></TheCommonAdBanner>
        </div>

        <div class="partners__block">
          <section class="partners__sort">
            <h2 class="partners__sort-title">Сортировка</h2>
            <label v-for="option in sortOptions" :key="option.value" class="partners__sort-option">
              <input
                type="radio"
                name="partner-sort"
                :value="option.value"
                v-model="filters.sortBy"
                @change="getPartners"
              />
              <span>{{ option.label }}</span>
            </label>
          </section>

          <div v-if="isLoading" class="partners__state">Загружаем партнеров...</div>
          <div v-else-if="partners.length" class="partners__cards">
            <ThePartnersCard
              v-for="partner in partners"
              :key="partner._id"
              :partner="partner"
            ></ThePartnersCard>
          </div>
          <div v-else class="partners__state">Партнеры не найдены.</div>
        </div>
      </div>
    </div>
  </section>

  <UiOverlay
    :is-show="isOpenFilterMobile"
    @close="closeFilterMobile"
    title="Фильтр"
  >
    <div class="partners__overlay-checkboxs">
      <p class="partners__overlay-bold">Поиск</p>
      <UiInput
        placeholder="Введите название"
        after-icon="lupa"
        v-model="filters.search"
        @input="debouncedGetPartners"
      />
    </div>

    <div class="partners__overlay-checkboxs">
      <p class="partners__overlay-bold">Сортировка</p>
      <label v-for="option in sortOptions" :key="option.value" class="partners__sort-option">
        <input
          type="radio"
          name="partner-sort-mobile"
          :value="option.value"
          v-model="filters.sortBy"
          @change="getPartners"
        />
        <span>{{ option.label }}</span>
      </label>
    </div>
  </UiOverlay>
</template>

<script setup>
const api = useApi();
const partners = ref([]);
const isLoading = ref(false);
const isOpenFilterMobile = ref(false);
const debounceTimer = ref(null);

const filters = reactive({
  search: '',
  sortBy: 'rating_desc',
});

const sortOptions = [
  { label: 'по рейтингу ↓', value: 'rating_desc' },
  { label: 'по рейтингу ↑', value: 'rating_asc' },
  { label: 'А–Я', value: 'title_asc' },
  { label: 'Я–А', value: 'title_desc' },
];

const openFilterMobile = () => {
  isOpenFilterMobile.value = true;
};

const closeFilterMobile = () => {
  isOpenFilterMobile.value = false;
};

useSeoMeta({
  title: 'FlyAway - Наши партнеры',
  ogTitle: 'FlyAway - Наши партнеры',
  description: 'FlyAway - партнеры туристического сервиса',
  ogDescription: 'FlyAway - партнеры туристического сервиса',
});

const getPartners = async () => {
  isLoading.value = true;
  try {
    const res = await api.client({
      url: '/partners',
      method: 'get',
      query: {
        search: filters.search || undefined,
        sortBy: filters.sortBy,
      },
    });
    partners.value = Array.isArray(res?.data) ? res.data : [];
  } catch (error) {
    partners.value = [];
  } finally {
    isLoading.value = false;
  }
};

const debouncedGetPartners = () => {
  clearTimeout(debounceTimer.value);
  debounceTimer.value = setTimeout(getPartners, 350);
};

onMounted(getPartners);

onBeforeUnmount(() => clearTimeout(debounceTimer.value));
</script>

<style lang="scss" scoped>
.partners {
  &__wrapper {
    margin: 60px 0 30px 0;
  }
  &__header {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: center;
  }
  &__subtitle {
    margin-top: 8px;
    color: $surface-500;
    line-height: 1.5;
  }
  &__content {
    width: 100%;
    display: flex;
    gap: 24px;
    margin: 36px 0;
  }
  &__filters {
    width: 255px;
    border-radius: 16px;
    background-color: $white;
    box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.04);
    &-box {
      display: flex;
      flex-direction: column;
      gap: 24px;
      padding: 20px;
    }
    &-header {
      display: flex;
      gap: 12px;
      align-items: center;
      background-color: rgba($red-500, 0.06);
      padding: 20px;
      border-radius: 16px;
    }
    &-title {
      color: $surface-900;
      font-size: 16px;
    }
  }
  &__block {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-width: 0;
  }
  &__sort {
    background-color: $white;
    border-radius: 16px;
    display: flex;
    align-items: center;
    gap: 20px;
    box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.04);
    flex-wrap: wrap;
    &-title {
      padding: 26px;
      background-color: rgba($red-500, 0.06);
      border-radius: 16px;
      color: $surface-900;
      font-size: 16px;
      margin-right: 6px;
    }
    &-option {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: $surface-600;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;

      input {
        accent-color: $red-500;
      }
    }
  }
  &__cards {
    border-radius: 16px;
    display: grid;
    background-color: $white;
    padding: 16px;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
  &__state {
    padding: 36px;
    border-radius: 16px;
    background: $white;
    color: $surface-500;
    text-align: center;
  }
  &__overlay {
    &-checkboxs {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 32px;
    }
    &-bold {
      font-weight: 700;
      font-size: 14px;
    }
  }
  &__top {
    display: none;
  }
}

@media (max-width: 1100px) {
  .partners {
    &__cards {
      grid-template-columns: repeat(3, 1fr);
    }
  }
}

@media (max-width: 820px) {
  .partners {
    &__content {
      flex-direction: column;
    }
    &__content-left,
    &__filters {
      width: 100%;
    }
    &__cards {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

@media (max-width: 560px) {
  .partners {
    &__wrapper {
      padding: 0;
      margin-top: 12px;
    }
    &__title {
      margin: 16px 0 0 0;
    }
    &__top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      &-text {
        color: $red-500;
        font-weight: 700;
        cursor: pointer;
      }
      &-search {
        width: 100%;
        background-color: $white;
        border-radius: 26px;
      }
    }
    &__content {
      margin-top: 18px;
    }
    &__filters,
    &__ad,
    &__sort {
      display: none;
    }
    &__cards {
      display: flex;
      flex-direction: column;
      background-color: transparent;
      padding: 0;
    }
  }
}
</style>