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
              <span v-if="dateLabel" class="review__date">{{ dateLabel }}</span>
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

        <p v-if="reviewComment" class="review__comment">
          {{ reviewComment }}
        </p>
      </div>

      <div
        v-if="type !== 'single' && showTourMeta && reviewTourTitle"
        class="review__footer"
      >
        <div v-if="partnerTitle" class="review__footer-box">
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
          {{ reviewTourTitle }}
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

const getFirstString = (...values) => {
  return values.map((value) => normalizeString(value)).find(Boolean) || "";
};

const reviewTour = computed(() => props.review?.tour || null);

const reviewAuthor = computed(() => {
  return (
    props.review?.createdBy ||
    props.review?.user ||
    props.review?.author ||
    props.review?.reviewer ||
    null
  );
});

const userName = computed(() => {
  const author = reviewAuthor.value || {};
  const fullName = getFirstString(
    author.name,
    author.fullName,
    author.username,
    props.review?.userName,
    props.review?.authorName,
  );

  if (fullName) {
    return fullName;
  }

  const nameParts = [author.firstName, author.lastName]
    .map((item) => normalizeString(item))
    .filter(Boolean);

  return nameParts.join(" ") || getFirstString(author.email) || "Пользователь";
});

const userAvatar = computed(() => {
  const author = reviewAuthor.value || {};
  return getFirstString(
    author.avatar,
    author.photo,
    author.image,
    props.review?.userAvatar,
  );
});

const userInitial = computed(() => userName.value.charAt(0).toUpperCase());

const partnerTitle = computed(() => {
  return getFirstString(
    reviewTour.value?.partner?.title,
    reviewTour.value?.partner?.name,
  );
});

const partnerAvatar = computed(() => {
  return getFirstString(
    reviewTour.value?.partner?.logo,
    reviewTour.value?.partner?.avatar,
    reviewTour.value?.partner?.image,
  );
});

const partnerInitial = computed(() =>
  partnerTitle.value.charAt(0).toUpperCase(),
);

const reviewRating = computed(() => {
  return Math.max(1, Math.min(5, Math.round(Number(props.review?.rating) || 5)));
});

const reviewComment = computed(() => {
  return getFirstString(
    props.review?.comment,
    props.review?.text,
    props.review?.content,
  );
});

const dateLabel = computed(() => {
  const raw =
    props.review?.createdAt || props.review?.date || props.review?.updatedAt;
  if (!raw) return "";

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
});

const reviewTourTitle = computed(() => getFirstString(reviewTour.value?.title));

const detailsLink = computed(() => {
  const id = reviewTour.value?._id || props.review?.tourId;
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
