<template>
  <div class="tour-booking-details">
    <div class="tour-booking-details__wrapper">
      <UiGoBack
        class="tour-booking-details__back"
        label="Мои туры"
        go-back="/profile/my-tours"
      />

      <div v-if="isLoading" class="tour-booking-details__state">
        Загружаем билет...
      </div>

      <div v-else-if="errorMessage" class="tour-booking-details__state tour-booking-details__state--error">
        {{ errorMessage }}
      </div>

      <div v-else-if="booking" class="tour-booking-details__content">
        <TheProfileTourTicket
          :booking="booking"
          :is-cancelling="isCancelling"
          @cancel="handleCancelBooking"
        />

        <section class="tour-booking-details__card">
          <h2 class="tour-booking-details__title">Детали бронирования</h2>

          <div class="tour-booking-details__grid">
            <div class="tour-booking-details__item">
              <p class="tour-booking-details__label">Дата</p>
              <p class="tour-booking-details__value">{{ bookingDate }}</p>
            </div>

            <div class="tour-booking-details__item">
              <p class="tour-booking-details__label">Время</p>
              <p class="tour-booking-details__value">{{ bookingTime }}</p>
            </div>

            <div class="tour-booking-details__item">
              <p class="tour-booking-details__label">Гостей</p>
              <p class="tour-booking-details__value">{{ guestsLabel }}</p>
            </div>

            <div class="tour-booking-details__item">
              <p class="tour-booking-details__label">Способ оплаты</p>
              <p class="tour-booking-details__value">{{ paymentMethodLabel }}</p>
            </div>

            <div class="tour-booking-details__item">
              <p class="tour-booking-details__label">Промокод</p>
              <p class="tour-booking-details__value">{{ promoCodeLabel }}</p>
            </div>

            <div class="tour-booking-details__item">
              <p class="tour-booking-details__label">Итоговая сумма</p>
              <p class="tour-booking-details__value tour-booking-details__value--price">
                {{ bookingTotal }}
              </p>
            </div>
          </div>

          <div v-if="ticketSummary.length" class="tour-booking-details__tickets">
            <p class="tour-booking-details__label">Билеты</p>
            <p class="tour-booking-details__tickets-text">{{ ticketSummary }}</p>
          </div>
        </section>
      </div>

      <div v-else class="tour-booking-details__state">
        Билет не найден.
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const router = useRouter();
const api = useApi();

const booking = ref(null);
const isLoading = ref(false);
const isCancelling = ref(false);
const errorMessage = ref("");

useSeoMeta({
  title: "FlyAway - Билет",
  ogTitle: "FlyAway - Билет",
  description: "Информация о забронированном туре",
  ogDescription: "Информация о забронированном туре",
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

const formatMoney = (value) =>
  `${Number(value || 0).toLocaleString("ru-RU")} ₸`;

const bookingDate = computed(() => {
  const parsed = parseDateValue(booking.value?.date);

  if (!parsed) {
    return normalizeString(booking.value?.date) || "Дата уточняется";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
});

const bookingTime = computed(() => {
  const from = normalizeString(booking.value?.timeFrom);
  const to = normalizeString(booking.value?.timeTo);
  return [from, to].filter(Boolean).join(" - ") || "Уточняется";
});

const guestsLabel = computed(() => `${Number(booking.value?.guests || 0) || 1}`);

const paymentMethodLabel = computed(() => {
  const value = normalizeString(booking.value?.paymentMethod);
  if (value === "bonus") return "Бонусами";
  return "Банковская карта";
});

const promoCodeLabel = computed(() =>
  normalizeString(booking.value?.promoCode) || "Не использован",
);

const bookingTotal = computed(() => formatMoney(booking.value?.total));

const ticketSummary = computed(() => {
  const selections = Array.isArray(booking.value?.ticketSelections)
    ? booking.value.ticketSelections
    : [];

  return selections
    .filter((item) => Number(item?.quantity) > 0)
    .map((item) => `${item.title || "Билет"} × ${Number(item.quantity) || 0}`)
    .join(", ");
});

const loadBooking = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response = await api.client({
      url: "/personal-cabinet/bookings/tours",
      method: "get",
    });

    const bookings = Array.isArray(response?.data) ? response.data : [];
    booking.value = bookings.find((item) => item?._id === route.params.id) || null;

    if (!booking.value) {
      errorMessage.value = "Билет не найден.";
    }
  } catch (error) {
    errorMessage.value = error?.message || "Не удалось загрузить билет.";
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
      : window.confirm("Отменить это бронирование?");

  if (!confirmed) {
    return;
  }

  isCancelling.value = true;
  errorMessage.value = "";

  try {
    const response = await api.client({
      url: `/personal-cabinet/bookings/tours/${bookingId}/cancel`,
      method: "patch",
    });

    booking.value = response?.data || booking.value;
  } catch (error) {
    errorMessage.value = error?.message || "Не удалось отменить бронирование.";
  } finally {
    isCancelling.value = false;
  }
};

onMounted(loadBooking);
</script>

<style lang="scss" scoped>
.tour-booking-details {
  &__wrapper {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__state,
  &__card {
    background: $white;
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.06);
  }

  &__state {
    color: $surface-500;
    text-align: center;
  }

  &__state--error {
    color: $orange-200;
  }

  &__title {
    color: $surface-900;
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 18px;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  &__item {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__label {
    color: $surface-500;
    font-size: 14px;
  }

  &__value {
    color: $surface-900;
    font-size: 16px;
    font-weight: 600;

    &--price {
      color: $blue-500;
    }
  }

  &__tickets {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid rgba($surface-300, 0.4);
  }

  &__tickets-text {
    margin-top: 6px;
    color: $surface-900;
    line-height: 1.5;
  }
}

@media (max-width: 768px) {
  .tour-booking-details {
    &__state,
    &__card {
      padding: 18px;
    }

    &__grid {
      grid-template-columns: 1fr;
    }

    &__title {
      font-size: 20px;
      margin-bottom: 14px;
    }
  }
}
