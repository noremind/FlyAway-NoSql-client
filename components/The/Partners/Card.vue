<template>
  <NuxtLink class="card" :to="detailLink">
    <article class="card__wrapper">
      <div class="card__avatar-wrap">
        <img v-if="avatar" class="card__avatar" :src="avatar" :alt="title" />
        <span v-else class="card__avatar card__avatar--empty">{{
          initial
        }}</span>
      </div>

      <div class="card__box">
        <h2 class="card__author">{{ title }}</h2>
        <p v-if="description" class="card__description">{{ description }}</p>

        <div class="card__reviews">
          <p class="card__count">{{ reviewsCount }} отзывов</p>
          <UiIcons icon="star" color="yellow-500" size="size-14"></UiIcons>
          <p class="card__average">{{ ratingLabel }}</p>
        </div>
      </div>

      <ul class="card__list">
        <li class="card__list-item">
          <p class="card__text">Туров</p>
          <p class="card__number">{{ toursCount }}</p>
        </li>
        <li class="card__list-item">
          <p class="card__text">Отелей</p>
          <p class="card__number">{{ hotelsCount }}</p>
        </li>
      </ul>
    </article>
  </NuxtLink>
</template>

<script setup>
const props = defineProps({
  partner: {
    type: Object,
    default: () => ({}),
  },
});

const normalizeString = (value) => String(value || "").trim();
const title = computed(
  () => normalizeString(props.partner?.title) || "Партнер FlyAway",
);
const initial = computed(() => title.value.charAt(0).toUpperCase());
const avatar = computed(() =>
  normalizeString(props.partner?.logo || props.partner?.avatar),
);
const detailLink = computed(() =>
  props.partner?._id ? `/partners/${props.partner._id}` : "/partners",
);
const description = computed(() => {
  const text = normalizeString(props.partner?.description);
  return text.length > 86 ? `${text.slice(0, 86)}...` : text;
});
const toursCount = computed(() =>
  Number(props.partner?.tour_count ?? props.partner?.tours?.length ?? 0),
);
const hotelsCount = computed(() =>
  Number(props.partner?.hotel_count ?? props.partner?.hotels?.length ?? 0),
);
const reviewsCount = computed(() =>
  Number(props.partner?.reviews_count ?? props.partner?.review_count ?? 0),
);
const ratingLabel = computed(() =>
  Number(props.partner?.rating || 0)
    .toFixed(1)
    .replace(".", ","),
);
</script>

<style lang="scss" scoped>
.card {
  display: block;
  color: inherit;

  &__wrapper {
    min-height: 260px;
    background-color: $white;
    box-shadow: 0px 12px 30px rgba(32, 36, 38, 0.08);
    padding: 24px 16px;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    color: $surface-900;
    border: 1px solid rgba($red-500, 0.08);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  &:hover &__wrapper {
    transform: translateY(-3px);
    box-shadow: 0px 16px 36px rgba(32, 36, 38, 0.12);
  }

  &__avatar-wrap {
    display: flex;
    justify-content: center;
  }

  &__avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid rgba($red-500, 0.08);

    &--empty {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: $white;
      background: $red-500;
      font-size: 24px;
      font-weight: 800;
    }
  }

  &__author {
    font-size: 22px;
    font-weight: 800;
    text-align: center;
    color: $surface-900;
    line-height: 1.15;
  }

  &__description {
    margin-top: 8px;
    color: $surface-500;
    font-size: 13px;
    line-height: 1.45;
    text-align: center;
  }

  &__reviews {
    display: flex;
    gap: 4px;
    align-items: center;
    justify-content: center;
    margin-top: 12px;
  }

  &__count {
    font-size: 12.5px;
    color: $surface-400;
  }

  &__average {
    font-size: 12.5px;
    font-weight: 700;
  }

  &__list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-top: auto;
  }

  &__list-item {
    display: grid;
    gap: 4px;
    padding: 12px;
    border-radius: 14px;
    // background: rgba($red-500, 0.05);
    text-align: center;
  }

  &__text {
    font-size: 12px;
    color: $surface-400;
  }

  &__number {
    color: $red-500;
    font-weight: 800;
    font-size: 20px;
  }

  &__box {
    display: flex;
    flex-direction: column;
    gap: 0;
  }
}

@media (max-width: 560px) {
  .card {
    &__wrapper {
      min-height: auto;
      display: grid;
      grid-template-columns: 70px minmax(0, 1fr);
      align-items: center;
      padding: 12px;
    }

    &__avatar {
      width: 58px;
      height: 58px;
    }

    &__author,
    &__description {
      text-align: left;
    }

    &__reviews {
      justify-content: flex-start;
    }

    &__list {
      grid-column: 1 / -1;
    }
  }
}
</style>
