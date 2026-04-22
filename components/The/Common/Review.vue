<template>
  <section class="review">
    <div
      class="review__wrapper"
      :class="{ 'review__wrapper--full': type === 'single' }"
    >
      <div class="review__inner">
        <div class="review__header">
          <div class="review__header-box">
            <img
              v-if="userAvatar"
              class="review__avatar"
              :src="userAvatar"
              :alt="userName"
            />
            <span v-else class="review__avatar review__avatar--empty">
              {{ userInitial }}
            </span>

            <div class="review__header-inner">
              <p class="review__name">{{ userName }}</p>
              <span class="review__date">{{ dateLabel }}</span>
            </div>
          </div>

          <div class="review__stars">
            <UiIcons
              v-for="star in 5"
              :key="star"
              icon="star"
              size="size-14"
              :color="star <= reviewRating ? 'yellow-500' : 'surface-300'"
            />
          </div>
        </div>

        <p class="review__comment">
          {{ reviewComment }}
        </p>
      </div>

      <div
        v-if="type !== 'single' && showTourMeta && reviewTour"
        class="review__footer"
      >
        <div class="review__footer-box">
          <img
            v-if="partnerAvatar"
            class="review__avatar review__avatar--small"
            :src="partnerAvatar"
            :alt="partnerTitle"
          />
          <span
            v-else
            class="review__avatar review__avatar--small review__avatar--empty"
          >
            {{ partnerInitial }}
          </span>

          <p class="review__name review__name--small">{{ partnerTitle }}</p>
        </div>

        <NuxtLink class="review__info" :to="detailsLink">
          {{ reviewTour.title }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  review: {
    type: Object,
    default: null,
  },
  type: {
    type: String,
    default: "many",
  },
  showTourMeta: {
    type: Boolean,
    default: true,
  },
});

const normalizeString = (value) => String(value || "").trim();

const reviewTour = computed(() => props.review?.tour || null);

const userName = computed(() => {
  return normalizeString(props.review?.createdBy?.name) || "Гость FlyAway";
});

const userAvatar = computed(() => {
  return normalizeString(props.review?.createdBy?.avatar) || "";
});

const userInitial = computed(() => userName.value.charAt(0).toUpperCase());

const partnerTitle = computed(() => {
  return normalizeString(reviewTour.value?.partner?.title) || "FlyAway Partner";
});

const partnerAvatar = computed(() => {
  return (
    normalizeString(reviewTour.value?.partner?.logo) ||
    normalizeString(reviewTour.value?.partner?.avatar) ||
    ""
  );
});

const partnerInitial = computed(() =>
  partnerTitle.value.charAt(0).toUpperCase(),
);

const reviewRating = computed(() => {
  return Math.max(1, Math.min(5, Number(props.review?.rating) || 5));
});

const reviewComment = computed(() => {
  return normalizeString(props.review?.comment) || "Отзыв появится позже.";
});

const dateLabel = computed(() => {
  const raw = props.review?.createdAt;
  if (!raw) return "Недавно";

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "Недавно";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
});

const detailsLink = computed(() => {
  const id = reviewTour.value?._id;
  return id ? `/tours/${id}` : "/";
});
</script>

<style lang="scss" scoped>
.review {
  &__wrapper {
    background-color: $white;
    padding: 16px;
    border-radius: 16px;
    border: 0.5px solid $surface-300;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    max-width: 480px;
    min-width: 327px;
    gap: 16px;

    &--full {
      max-width: 100%;
      min-width: 100%;
    }
  }

  &__header {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;

    &-box {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }

    &-inner {
      min-width: 0;
    }
  }

  &__avatar {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: 50%;

    &--empty {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: $white;
      background: $red-500;
      font-size: 16px;
      font-weight: 700;
    }

    &--small {
      width: 24px;
      height: 24px;
    }
  }

  &__date {
    font-size: 12px;
    color: $surface-400;
    font-weight: 400;
  }

  &__name {
    color: $surface-900;
    font-weight: 400;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &--small {
      font-size: 14px;
    }
  }

  &__comment {
    font-size: 14px;
    font-weight: 100;
    color: $surface-900;
    line-height: 1.55;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;

    &-box {
      display: flex;
      gap: 8px;
      align-items: center;
      min-width: 0;
    }
  }

  &__info {
    color: $red-500;
    font-weight: 700;
    line-height: 17.5px;
    font-size: 14px;
    cursor: pointer;
    text-align: right;
  }
}

@media (max-width: 640px) {
  .review {
    &__wrapper {
      min-width: 100%;
    }

    &__footer {
      flex-direction: column;
      align-items: flex-start;
    }

    &__info {
      text-align: left;
    }
  }
}
</style>
