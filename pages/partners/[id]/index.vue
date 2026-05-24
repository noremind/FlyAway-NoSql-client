<template>
  <section class="partner">
    <div class="partner__wrapper">
      <UiGoBack class="partner__go-back" label="Партнеры" go-back="/partners" />

      <div v-if="!partner" class="partner__state">Загружаем партнера...</div>

      <template v-else>
        <aside class="partner__info">
          <img v-if="avatar" class="partner__avatar" :src="avatar" :alt="partnerTitle" />
          <span v-else class="partner__avatar partner__avatar--empty">{{ partnerInitial }}</span>
          <h1 class="partner__author">{{ partnerTitle }}</h1>

          <div class="partner__review">
            <p class="partner__count">{{ reviewsCount }} отзывов</p>
            <UiIcons icon="star" color="yellow-500" size="size-14" />
            <p class="partner__average">{{ ratingLabel }}</p>
          </div>

          <ul class="partner__list">
            <li class="partner__list-item">
              <p class="partner__text">Количество туров</p>
              <p class="partner__number">{{ tours.length }}</p>
            </li>
            <li class="partner__list-item">
              <p class="partner__text">Количество отелей</p>
              <p class="partner__number">{{ hotels.length }}</p>
            </li>
          </ul>

          <template v-if="partner.description">
            <p class="partner__bold">О нас</p>
            <p class="partner__description">{{ partner.description }}</p>
          </template>

          <template v-if="contacts.length">
            <p class="partner__bold">Контакты</p>
            <ul class="partner__contacts">
              <li class="partner__contacts-item" v-for="item in contacts" :key="item.icon">
                <UiIcons :icon="item.icon" color="red-500" size="size-24" />
                <p class="partner__contacts-text">{{ item.name }}</p>
              </li>
            </ul>
          </template>
        </aside>

        <div class="partner__content">
          <section class="partner__block">
            <div class="partner__block-header">
              <h2 class="title">Туры</h2>
              <nuxt-link v-if="tours.length" class="partner__block-link" to="/tours">Все туры</nuxt-link>
            </div>
            <div class="partner__tours" v-if="tours.length">
              <TheCommonTourCard v-for="tour in tours" :key="tour._id" :tour="tour" />
            </div>
            <p v-else class="partner__empty">У партнера пока нет туров.</p>
          </section>

          <section class="partner__block">
            <div class="partner__block-header">
              <h2 class="title">Отели</h2>
              <nuxt-link v-if="hotels.length" class="partner__block-link" to="/hotels">Все отели</nuxt-link>
            </div>
            <div class="partner__hotels" v-if="hotels.length">
              <TheHotelsBlock v-for="hotel in hotels" :key="hotel._id" :hotel="hotel" view-type="list" />
            </div>
            <p v-else class="partner__empty">У партнера пока нет отелей.</p>
          </section>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup>
const partner = ref(null);
const route = useRoute();

const normalizeString = (value) => String(value || "").trim();

useFetchSsr({
  url: `/partners/${route.params.id}`,
  method: "get",
}).then((res) => {
  partner.value = res.data;
});

const partnerTitle = computed(() => normalizeString(partner.value?.title) || "Партнер FlyAway");
const partnerInitial = computed(() => partnerTitle.value.charAt(0).toUpperCase());
const avatar = computed(() => normalizeString(partner.value?.logo || partner.value?.avatar));
const ratingLabel = computed(() => Number(partner.value?.rating || 0).toFixed(1).replace(".", ","));
const reviewsCount = computed(() => Number(partner.value?.reviews_count || partner.value?.review_count || 0));
const tours = computed(() => Array.isArray(partner.value?.tours) ? partner.value.tours : []);
const hotels = computed(() => Array.isArray(partner.value?.hotels) ? partner.value.hotels : []);
const contacts = computed(() => {
  const source = partner.value?.contacts || {};
  return [
    { icon: "globe", name: source.website },
    { icon: "location", name: source.address },
    { icon: "phone", name: source.phone },
  ].filter((item) => normalizeString(item.name));
});

useSeoMeta({
  title: () => `${partnerTitle.value} | FlyAway`,
  ogTitle: () => `${partnerTitle.value} | FlyAway`,
  description: () => normalizeString(partner.value?.description) || "Партнер FlyAway",
  ogDescription: () => normalizeString(partner.value?.description) || "Партнер FlyAway",
});
</script>

<style lang="scss" scoped>
.partner {
  &__wrapper {
    display: grid;
    grid-template-columns: 280px minmax(0, 1fr);
    gap: 24px;
    margin: 48px 0;
    color: $surface-900;
    align-items: start;
  }

  &__go-back {
    grid-column: 1 / -1;
  }

  &__state {
    grid-column: 1 / -1;
    padding: 36px;
    text-align: center;
    color: $surface-500;
    background: $white;
    border-radius: 20px;
  }

  &__info,
  &__block {
    background-color: $white;
    border-radius: 20px;
    box-shadow: 0 12px 30px rgba(32, 36, 38, 0.06);
    border: 1px solid rgba($red-500, 0.08);
  }

  &__info {
    padding: 22px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    position: sticky;
    top: 120px;
  }

  &__avatar {
    width: 82px;
    height: 82px;
    border-radius: 50%;
    object-fit: cover;
    margin: 0 auto;

    &--empty {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: $white;
      background: $red-500;
      font-size: 28px;
      font-weight: 800;
    }
  }

  &__author {
    font-size: 24px;
    font-weight: 800;
    text-align: center;
    line-height: 1.15;
  }

  &__review {
    display: flex;
    gap: 5px;
    align-items: center;
    justify-content: center;
  }

  &__count,
  &__average,
  &__text,
  &__description,
  &__contacts-text,
  &__empty {
    color: $surface-500;
  }

  &__average,
  &__number {
    font-weight: 800;
  }

  &__list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  &__list-item {
    display: grid;
    gap: 4px;
    padding: 12px;
    border-radius: 14px;
    background: rgba($red-500, 0.05);
    text-align: center;
  }

  &__number {
    color: $red-500;
    font-size: 22px;
  }

  &__bold {
    font-weight: 800;
  }

  &__description {
    font-size: 14px;
    line-height: 1.55;
  }

  &__contacts {
    display: grid;
    gap: 8px;
  }

  &__contacts-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-width: 0;
  }

  &__block {
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  &__block-header {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
  }

  &__block-link {
    color: $red-500;
    font-weight: 800;
  }

  &__tours {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }

  &__hotels {
    display: grid;
    gap: 16px;
  }

  &__empty {
    padding: 24px;
    text-align: center;
    border-radius: 16px;
    background: rgba($surface-150, 0.7);
  }
}

@media (max-width: 980px) {
  .partner {
    &__wrapper {
      grid-template-columns: 1fr;
    }

    &__info {
      position: static;
    }

    &__tours {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}

@media (max-width: 560px) {
  .partner {
    &__wrapper {
      margin: 24px 0;
    }

    &__tours {
      grid-template-columns: 1fr;
    }
  }
}
</style>