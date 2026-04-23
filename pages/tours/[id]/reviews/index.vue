<template>
  <section class="tour-reviews-page">
    <div class="tour-reviews-page__wrapper">
      <UiGoBack label="Назад к туру" :go-back="`/tours/${route.params.id}`" />

      <div class="tour-reviews-page__header">
        <div>
          <h1 class="tour-reviews-page__title title">Отзывы о туре</h1>
          <p class="tour-reviews-page__text">
            Поделитесь впечатлениями после поездки и помогите другим выбрать
            тур.
          </p>
        </div>
      </div>

      <div v-if="successMessage" class="tour-reviews-page__message">
        {{ successMessage }}
      </div>
      <div v-if="submitErrorMessage" class="tour-reviews-page__error">
        {{ submitErrorMessage }}
      </div>

      <form
        v-if="authStore.isLoggedIn && canReview && !isCheckingAccess"
        class="tour-reviews-page__form"
        @submit.prevent="submitReview"
      >
        <div class="tour-reviews-page__rating">
          <p class="tour-reviews-page__label">Оценка</p>

          <div class="tour-reviews-page__stars">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              class="tour-reviews-page__star"
              :aria-label="`Поставить ${star}`"
              :aria-pressed="star <= form.rating"
              @click="form.rating = star"
            >
              <UiIcons
                icon="star"
                size="size-20"
                :color="star <= form.rating ? 'yellow-500' : 'surface-300'"
              />
            </button>
          </div>
        </div>

        <UiTextarea
          label="Ваш отзыв"
          placeholder="Напишите, как прошла поездка"
          v-model="form.comment"
        />

        <UiButton
          label="Оставить отзыв"
          type="submit"
          class="tour-reviews-page__submit"
          :disabled="isSubmitting"
          :is-loading="isSubmitting"
        />
      </form>

      <div
        v-else-if="authStore.isLoggedIn && isCheckingAccess"
        class="tour-reviews-page__state"
      >
        Проверяем возможность оставить отзыв...
      </div>

      <div
        v-else-if="authStore.isLoggedIn && hasReview"
        class="tour-reviews-page__state"
      >
        Вы уже оставили отзыв на этот тур.
      </div>

      <div
        v-else-if="authStore.isLoggedIn && !canReview"
        class="tour-reviews-page__state"
      >
        Отзыв можно оставить только после завершённой поездки.
      </div>

      <div v-else class="tour-reviews-page__state">
        Чтобы оставить отзыв, войдите в аккаунт.
      </div>

      <div v-if="accessErrorMessage" class="tour-reviews-page__error">
        {{ accessErrorMessage }}
      </div>

      <div class="tour-reviews-page__list">
        <div v-if="isLoading" class="tour-reviews-page__state">
          Загружаем отзывы...
        </div>

        <div v-else-if="reviewsErrorMessage" class="tour-reviews-page__error">
          {{ reviewsErrorMessage }}
        </div>

        <template v-else>
          <TheCommonReview
            v-for="review in normalizedReviews"
            :key="getReviewKey(review)"
            :review="review"
            type="single"
            :show-tour-meta="false"
          />
        </template>

        <div
          v-if="!isLoading && !reviewsErrorMessage && !normalizedReviews.length"
          class="tour-reviews-page__state"
        >
          Пока отзывов нет.
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const route = useRoute();
const api = useApi();
const authStore = useAuthStore();

const reviews = ref([]);
const canReview = ref(false);
const hasReview = ref(false);
const isLoading = ref(false);
const isCheckingAccess = ref(false);
const isSubmitting = ref(false);
const successMessage = ref("");
const reviewsErrorMessage = ref("");
const submitErrorMessage = ref("");
const accessErrorMessage = ref("");

const form = reactive({
  rating: 5,
  comment: "",
});

const normalizedReviews = computed(() => {
  return Array.isArray(reviews.value) ? reviews.value.filter(Boolean) : [];
});

useSeoMeta({
  title: "FlyAway - Отзывы о туре",
  ogTitle: "FlyAway - Отзывы о туре",
  description: "Отзывы путешественников о туре FlyAway",
  ogDescription: "Отзывы путешественников о туре FlyAway",
});

const loadReviews = async () => {
  isLoading.value = true;
  reviewsErrorMessage.value = "";

  try {
    const response = await api.client({
      url: `/tour-reviews/tour/${route.params.id}`,
      method: "get",
      query: { limit: 50 },
    });

    reviews.value = Array.isArray(response?.data) ? response.data : [];
  } catch (error) {
    reviews.value = [];
    reviewsErrorMessage.value =
      error?.message || "Не удалось загрузить отзывы.";
  } finally {
    isLoading.value = false;
  }
};

const loadCanReview = async () => {
  accessErrorMessage.value = "";

  if (!authStore.isLoggedIn) {
    canReview.value = false;
    hasReview.value = false;
    return;
  }

  isCheckingAccess.value = true;

  try {
    const response = await api.client({
      url: `/tour-reviews/can-review/${route.params.id}`,
      method: "get",
    });

    canReview.value = Boolean(response?.data?.canReview);
    hasReview.value = Boolean(response?.data?.hasReview);
  } catch {
    canReview.value = false;
    hasReview.value = false;
    accessErrorMessage.value =
      "Не удалось проверить возможность оставить отзыв.";
  } finally {
    isCheckingAccess.value = false;
  }
};

const submitReview = async () => {
  successMessage.value = "";
  submitErrorMessage.value = "";

  if (Number(form.rating) < 1 || Number(form.rating) > 5) {
    submitErrorMessage.value = "Выберите оценку от 1 до 5.";
    return;
  }

  if (String(form.comment || "").trim().length < 10) {
    submitErrorMessage.value = "Отзыв должен содержать минимум 10 символов.";
    return;
  }

  isSubmitting.value = true;

  try {
    const response = await api.client({
      url: "/tour-reviews",
      method: "post",
      data: {
        tourId: route.params.id,
        rating: form.rating,
        comment: form.comment.trim(),
      },
    });

    if (response?.data) {
      reviews.value = [response.data, ...normalizedReviews.value];
    } else {
      await loadReviews();
    }

    canReview.value = false;
    hasReview.value = true;
    form.rating = 5;
    form.comment = "";
    successMessage.value = "Спасибо, ваш отзыв опубликован.";
  } catch (error) {
    submitErrorMessage.value =
      error?.message || "Не удалось отправить отзыв.";
  } finally {
    isSubmitting.value = false;
  }
};

const getReviewKey = (review) => {
  return review?._id || `${review?.createdAt || ""}-${review?.comment || ""}`;
};

onMounted(async () => {
  await Promise.all([loadReviews(), loadCanReview()]);
});

watch(
  () => authStore.isLoggedIn,
  async () => {
    await loadCanReview();
  },
);
</script>

<style scoped lang="scss">
.tour-reviews-page {
  &__wrapper {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin: 24px 0 40px;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-start;
  }

  &__text {
    color: $surface-500;
    line-height: 1.5;
    margin-top: 8px;
  }

  &__form,
  &__list,
  &__state {
    background: $white;
    border-radius: 16px;
    padding: 16px;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__state {
    color: $surface-500;
  }

  &__rating {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__label {
    color: $surface-900;
    font-weight: 600;
  }

  &__stars {
    display: flex;
    gap: 6px;
  }

  &__star {
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: rgba($surface-300, 0.12);
  }

  &__submit {
    width: fit-content;
  }

  &__message,
  &__error {
    font-size: 14px;
    font-weight: 600;
  }

  &__message {
    color: $green-400;
  }

  &__error {
    color: $orange-200;
  }
}

@media (max-width: 640px) {
  .tour-reviews-page {
    &__wrapper {
      margin: 16px 0 28px;
      gap: 16px;
    }

    &__header {
      flex-direction: column;
    }

    &__form,
    &__list,
    &__state {
      border-radius: 12px;
      padding: 14px;
    }

    &__stars {
      justify-content: space-between;
    }

    &__star {
      width: 40px;
      height: 40px;
    }

    &__submit {
      width: 100%;
      justify-content: center;
    }
  }
}
</style>
