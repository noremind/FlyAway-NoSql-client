<template>
  <div class="hotel-request-page">
    <div class="hotel-request-page__wrapper">
      <UiGoBack
        class="hotel-request-page__back"
        label="Мои отели"
        go-back="/profile/my-hotels"
      />

      <div v-if="isLoading" class="hotel-request-page__state">
        Загружаем заявку...
      </div>

      <div
        v-else-if="errorMessage"
        class="hotel-request-page__state hotel-request-page__state--error"
      >
        {{ errorMessage }}
      </div>

      <section v-else-if="booking" class="hotel-request-page__card">
        <div class="hotel-request-page__header">
          <div>
            <p class="hotel-request-page__number">Бронь №{{ bookingNumber }}</p>
            <h1 class="hotel-request-page__title">{{ hotelName }}</h1>
          </div>

          <button
            v-if="bookingStatus === 'active'"
            type="button"
            class="hotel-request-page__cancel"
            :disabled="isCancelling"
            @click="handleCancelBooking(booking._id)"
          >
            {{ isCancelling ? "Отменяем..." : "Отменить заявку" }}
          </button>
        </div>

        <div class="hotel-request-page__content">
          <div class="hotel-request-page__visuals">
            <img
              class="hotel-request-page__image"
              :src="hotelImage"
              :alt="hotelName"
            />

            <div
              class="hotel-request-page__status"
              :class="{
                'hotel-request-page__status--completed': bookingStatus === 'completed',
                'hotel-request-page__status--cancelled': bookingStatus === 'cancelled',
              }"
            >
              {{ statusLabel }}
            </div>

            <div class="hotel-request-page__request-meta">
              <p class="hotel-request-page__request-title">Статус заявки</p>
              <p class="hotel-request-page__request-value">{{ requestStatusLabel }}</p>
            </div>
          </div>

          <div class="hotel-request-page__details">
            <div class="hotel-request-page__partner-line">
              <div class="hotel-request-page__partner-box">
                <img
                  class="hotel-request-page__partner-avatar"
                  :src="partnerAvatar"
                  :alt="partnerTitle"
                />
                <p class="hotel-request-page__partner-name">{{ partnerTitle }}</p>
              </div>

              <div class="hotel-request-page__rating-box">
                <span class="hotel-request-page__rating-stars">{{ starsLabel }}</span>
                <span class="hotel-request-page__rating-value">{{ ratingLabel }}</span>
              </div>
            </div>

            <div class="hotel-request-page__about">
              <p class="hotel-request-page__section-title">Об отеле</p>
              <p class="hotel-request-page__description">{{ hotelDescription }}</p>
            </div>

            <div class="hotel-request-page__summary-grid">
              <div class="hotel-request-page__summary-item">
                <p class="hotel-request-page__label">Заезд</p>
                <p class="hotel-request-page__value">{{ checkInLabel }}</p>
              </div>

              <div class="hotel-request-page__summary-item">
                <p class="hotel-request-page__label">Выезд</p>
                <p class="hotel-request-page__value">{{ checkOutLabel }}</p>
              </div>

              <div class="hotel-request-page__summary-item">
                <p class="hotel-request-page__label">Гостей</p>
                <p class="hotel-request-page__value">{{ guestsLabel }}</p>
              </div>

              <div class="hotel-request-page__summary-item">
                <p class="hotel-request-page__label">Стоимость</p>
                <p class="hotel-request-page__value hotel-request-page__value--accent">
                  {{ totalLabel }}
                </p>
              </div>
            </div>

            <div class="hotel-request-page__summary-block">
              <p class="hotel-request-page__section-title">Контакты</p>
              <div class="hotel-request-page__summary-grid hotel-request-page__summary-grid--contacts">
                <div class="hotel-request-page__summary-item">
                  <p class="hotel-request-page__label">Имя</p>
                  <p class="hotel-request-page__value">{{ contactName }}</p>
                </div>
                <div class="hotel-request-page__summary-item">
                  <p class="hotel-request-page__label">Телефон</p>
                  <p class="hotel-request-page__value">{{ contactPhone }}</p>
                </div>
                <div class="hotel-request-page__summary-item hotel-request-page__summary-item--wide">
                  <p class="hotel-request-page__label">Email</p>
                  <p class="hotel-request-page__value">{{ contactEmail }}</p>
                </div>
              </div>
            </div>

            <div class="hotel-request-page__summary-block">
              <p class="hotel-request-page__section-title">Локация</p>
              <p class="hotel-request-page__description">{{ hotelLocation }}</p>
            </div>

            <div class="hotel-request-page__summary-block">
              <p class="hotel-request-page__section-title">Комментарий</p>
              <p class="hotel-request-page__description">
                {{ commentLabel }}
              </p>
            </div>

            <div class="hotel-request-page__actions">
              <NuxtLink class="hotel-request-page__action hotel-request-page__action--primary" :to="hotelLink">
                Перейти к отелю
              </NuxtLink>
              <NuxtLink class="hotel-request-page__action" to="/hotels">
                Смотреть другие отели
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <div v-else class="hotel-request-page__state">Заявка не найдена.</div>
    </div>
  </div>
</template>

<script setup>
import partnerPlaceholder from "@/assets/image/common/tour-avatar.png";
import hotelPlaceholder from "@/assets/image/content/main-image.png";

const route = useRoute();
const api = useApi();

const booking = ref(null);
const isLoading = ref(false);
const isCancelling = ref(false);
const errorMessage = ref("");

useSeoMeta({
  title: "FlyAway - Заявка на отель",
  ogTitle: "FlyAway - Заявка на отель",
  description: "Информация о заявке на бронирование отеля",
  ogDescription: "Информация о заявке на бронирование отеля",
});

const normalizeString = (value) => String(value || "").trim();

const parseDateValue = (value) => {
  const text = normalizeString(value);
  if (!text) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const parsed = new Date(`${text}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDateLabel = (value) => {
  const parsed = parseDateValue(value);

  if (!parsed) {
    return normalizeString(value) || "Дата уточняется";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
};

const bookingStatus = computed(() => {
  const status = normalizeString(booking.value?.status);
  return ["active", "completed", "cancelled"].includes(status)
    ? status
    : "active";
});

const statusLabel = computed(() => {
  if (bookingStatus.value === "completed") return "Завершенная";
  if (bookingStatus.value === "cancelled") return "Отмененная";
  return "Активная заявка";
});

const requestStatusLabel = computed(() => {
  const value = normalizeString(booking.value?.requestStatus);

  if (value === "contacted") return "Менеджер связался";
  if (value === "in_progress") return "В обработке";
  if (value === "closed") return "Закрыта";
  if (value === "cancelled") return "Отменена";
  return "Новая";
});

const hotelName = computed(() => {
  return normalizeString(booking.value?.hotel?.name) || "Отель FlyAway";
});

const hotelImage = computed(() => {
  const firstImage = Array.isArray(booking.value?.hotel?.images)
    ? booking.value.hotel.images.find(Boolean)
    : "";

  return firstImage || hotelPlaceholder;
});

const hotelDescription = computed(() => {
  return (
    normalizeString(booking.value?.hotel?.description) ||
    normalizeString(booking.value?.hotel?.content) ||
    "Описание отеля скоро появится."
  );
});

const hotelLocation = computed(() => {
  return normalizeString(booking.value?.hotel?.location) || "Локация уточняется";
});

const checkInLabel = computed(() => formatDateLabel(booking.value?.checkIn));
const checkOutLabel = computed(() => formatDateLabel(booking.value?.checkOut));

const guestsLabel = computed(() => {
  const guests = Math.max(1, Number(booking.value?.guests) || 1);
  return `${guests}`;
});

const totalLabel = computed(() => {
  const total = Number(booking.value?.total);
  if (Number.isFinite(total) && total > 0) {
    return `${total.toLocaleString("ru-RU")} ₸`;
  }

  return "Уточняется";
});

const contactName = computed(() => normalizeString(booking.value?.name) || "—");
const contactPhone = computed(() => normalizeString(booking.value?.phone) || "—");
const contactEmail = computed(() => normalizeString(booking.value?.email) || "—");
const commentLabel = computed(() => normalizeString(booking.value?.comment) || "Без комментария");

const partnerTitle = computed(() => {
  return (
    normalizeString(booking.value?.hotel?.partner?.title) ||
    normalizeString(booking.value?.partner?.title) ||
    "FlyAway Partner"
  );
});

const partnerAvatar = computed(() => {
  return (
    booking.value?.hotel?.partner?.logo ||
    booking.value?.hotel?.partner?.avatar ||
    booking.value?.partner?.logo ||
    booking.value?.partner?.avatar ||
    partnerPlaceholder
  );
});

const ratingLabel = computed(() => {
  const rating = Number(booking.value?.hotel?.rating) || 0;
  return rating ? rating.toFixed(1).replace(".", ",") : "0,0";
});

const starsLabel = computed(() => {
  const stars = Math.max(0, Math.round(Number(booking.value?.hotel?.rating) || 0));
  return stars ? "★".repeat(stars) : "Без рейтинга";
});

const bookingNumber = computed(() => {
  const raw = String(booking.value?._id || "").slice(-6);
  const numeric = Number.parseInt(raw, 16);

  if (!Number.isFinite(numeric)) {
    return "12345";
  }

  return String(numeric % 100000).padStart(5, "0");
});

const hotelLink = computed(() => {
  return booking.value?.hotel?._id ? `/hotels/${booking.value.hotel._id}` : "/hotels";
});

const loadBooking = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response = await api.client({
      url: "/personal-cabinet/bookings/hotels",
      method: "get",
    });

    const items = Array.isArray(response?.data) ? response.data : [];
    booking.value = items.find((item) => item?._id === route.params.id) || null;

    if (!booking.value) {
      errorMessage.value = "Заявка не найдена.";
    }
  } catch (error) {
    errorMessage.value = error?.message || "Не удалось загрузить заявку.";
  } finally {
    isLoading.value = false;
  }
};

const handleCancelBooking = async (bookingId) => {
  if (!bookingId || isCancelling.value) {
    return;
  }

  const confirmed =
    typeof window === "undefined"
      ? true
      : window.confirm("Отменить эту заявку на отель?");

  if (!confirmed) {
    return;
  }

  isCancelling.value = true;
  errorMessage.value = "";

  try {
    const response = await api.client({
      url: `/personal-cabinet/bookings/hotels/${bookingId}/cancel`,
      method: "patch",
    });

    booking.value = response?.data || booking.value;
  } catch (error) {
    errorMessage.value = error?.message || "Не удалось отменить заявку.";
  } finally {
    isCancelling.value = false;
  }
};

onMounted(loadBooking);
</script>

<style lang="scss" scoped>
.hotel-request-page {
  &__wrapper {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__state,
  &__card {
    background: $white;
    border-radius: 24px;
    box-shadow: 0px 8px 28px rgba(0, 0, 0, 0.06);
  }

  &__state {
    padding: 32px 24px;
    color: $surface-500;
    text-align: center;

    &--error {
      color: $orange-200;
    }
  }

  &__card {
    padding: 28px 28px 34px;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: center;
    margin-bottom: 24px;
  }

  &__number {
    color: $surface-500;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  &__title {
    color: $surface-900;
    font-size: 28px;
    line-height: 1.15;
    font-weight: 700;
    margin: 0;
  }

  &__cancel {
    color: $orange-200;
    font-size: 14px;
    font-weight: 700;

    &:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }
  }

  &__content {
    display: grid;
    grid-template-columns: 280px minmax(0, 1fr);
    gap: 34px;
  }

  &__visuals {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  &__image {
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    border-radius: 18px;
  }

  &__status {
    min-height: 44px;
    border-radius: 999px;
    background: $red-500;
    color: $white;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;

    &--completed {
      background: $surface-400;
    }

    &--cancelled {
      background: $surface-300;
      color: $surface-900;
    }
  }

  &__request-meta {
    padding: 16px;
    border-radius: 18px;
    background: rgba($red-500, 0.04);
  }

  &__request-title {
    color: $surface-500;
    font-size: 13px;
    margin-bottom: 6px;
  }

  &__request-value {
    color: $surface-900;
    font-size: 16px;
    font-weight: 700;
  }

  &__details {
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-width: 0;
  }

  &__partner-line {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: center;
  }

  &__partner-box {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__partner-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    object-fit: cover;
  }

  &__partner-name,
  &__rating-stars,
  &__rating-value {
    font-size: 13px;
    color: $surface-500;
  }

  &__rating-box {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  &__section-title {
    color: $surface-900;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  &__description {
    color: $surface-500;
    line-height: 1.5;
  }

  &__summary-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;

    &--contacts {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  &__summary-item {
    display: flex;
    flex-direction: column;
    gap: 6px;

    &--wide {
      grid-column: 1 / -1;
    }
  }

  &__label {
    color: $surface-500;
    font-size: 14px;
  }

  &__value {
    color: $surface-900;
    font-size: 16px;
    font-weight: 600;

    &--accent {
      color: $red-500;
    }
  }

  &__summary-block {
    padding-top: 2px;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding-top: 4px;
  }

  &__action {
    min-height: 48px;
    padding: 0 22px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: $red-500;
    border: 1px solid rgba($red-500, 0.45);
    background: transparent;
    font-size: 14px;
    font-weight: 700;

    &--primary {
      color: $white;
      background: $red-500;
      border-color: $red-500;
    }
  }
}

@media (max-width: 1024px) {
  .hotel-request-page {
    &__content {
      grid-template-columns: 1fr;
    }
  }
}

@media (max-width: 768px) {
  .hotel-request-page {
    &__card {
      padding: 22px 18px 24px;
    }

    &__header {
      flex-direction: column;
      align-items: flex-start;
      margin-bottom: 18px;
    }

    &__title {
      font-size: 24px;
    }

    &__partner-line {
      flex-direction: column;
      align-items: flex-start;
    }

    &__rating-box {
      justify-content: flex-start;
    }

    &__summary-grid,
    &__summary-grid--contacts {
      grid-template-columns: 1fr;
    }

    &__action {
      width: 100%;
    }
  }
}
</style>
