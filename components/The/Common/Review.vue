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

        <p
          v-if="reviewComment"
          class="review__comment"
          :class="{ 'review__comment--clamped': type !== 'single' }"
        >
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

  const now = new Date();
  const isToday =
    parsed.getDate() === now.getDate() &&
    parsed.getMonth() === now.getMonth() &&
    parsed.getFullYear() === now.getFullYear();

  const time = new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);

  if (isToday) {
    return `сегодня в ${time}`;
  }

  const date = new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);

  return `${date} • ${time}`;
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
    padding: 18px;
    border-radius: 18px;
    border: 1px solid rgba($surface-300, 0.55);
    box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    max-width: 100%;
    min-width: 0;
    gap: 18px;

    &--full {
      max-width: 100%;
      min-width: 100%;
      padding: 20px 18px;
    }
  }

  &__inner {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;

    &-box {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      flex: 1;
    }

    &-inner {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
  }

  &__avatar {
    width: 42px;
    height: 42px;
    object-fit: cover;
    border-radius: 50%;
    flex: 0 0 42px;

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
      width: 26px;
      height: 26px;
      flex-basis: 26px;
    }
  }

  &__stars {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
    padding-top: 2px;
  }

  &__date {
    font-size: 12px;
    color: $surface-400;
    font-weight: 400;
  }

  &__name {
    color: $surface-900;
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.2;

    &--small {
      font-size: 14px;
      font-weight: 600;
    }
  }

  &__comment {
    font-size: 14px;
    font-weight: 400;
    color: $surface-900;
    line-height: 1.65;
    white-space: pre-line;

    &--clamped {
      display: -webkit-box;
      -webkit-line-clamp: 5;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
    padding-top: 2px;

    &-box {
      display: flex;
      gap: 8px;
      align-items: center;
      min-width: 0;
      flex: 1;
    }
  }

  &__info {
    color: $red-500;
    font-weight: 700;
    line-height: 1.4;
    font-size: 14px;
    cursor: pointer;
    text-align: right;
    flex-shrink: 0;
  }
}

@media (max-width: 768px) {
  .review {
    &__wrapper {
      padding: 16px;
      border-radius: 16px;
    }
  }
}

@media (max-width: 640px) {
  .review {
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
