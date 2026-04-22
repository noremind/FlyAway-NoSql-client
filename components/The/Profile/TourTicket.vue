<template>
  <section
    class="ticket"
    :class="{
      'ticket--completed': bookingStatus === 'completed',
      'ticket--cancelled': bookingStatus === 'cancelled',
    }"
  >
    <div class="ticket__wrapper">
      <div class="ticket__info">
        <div class="ticket__top">
          <p class="ticket__number">Билет №{{ ticketNumber }}</p>
          <span
            class="ticket__status"
            :class="`ticket__status--${bookingStatus}`"
          >
            {{ statusLabel }}
          </span>
        </div>

        <NuxtLink :to="detailsLink">
          <h2 class="ticket__title title">{{ bookingTitle }}</h2>
        </NuxtLink>

        <div class="ticket__grid">
          <div class="ticket__info-box">
            <p class="ticket__label">Дата</p>
            <p class="ticket__value">{{ bookingDate }}</p>
          </div>

          <div class="ticket__info-box">
            <p class="ticket__label">Гостей</p>
            <p class="ticket__value">{{ guestsLabel }}</p>
          </div>

          <div class="ticket__info-box">
            <p class="ticket__label">Оплата</p>
            <p class="ticket__value">{{ paymentMethodLabel }}</p>
          </div>

          <div class="ticket__info-box ticket__info-box--mobile-total">
            <p class="ticket__label">Сумма</p>
            <p class="ticket__price ticket__price--mobile">
              {{ bookingTotal }}
            </p>
          </div>
        </div>

        <div v-if="ticketSummary.length" class="ticket__tickets">
          <p class="ticket__label">Билеты</p>
          <p class="ticket__tickets-text">{{ ticketSummary }}</p>
        </div>

        <div v-if="bookingStatus === 'active'" class="ticket__actions">
          <button
            class="ticket__cancel"
            type="button"
            :disabled="isCancelling"
            @click="$emit('cancel', booking._id)"
          >
            {{ isCancelling ? "Отменяем..." : "Отменить бронь" }}
          </button>
        </div>

        <div v-else-if="bookingStatus === 'completed'" class="ticket__actions">
          <NuxtLink class="ticket__review-link" :to="reviewLink">
            Оставить отзыв
          </NuxtLink>
        </div>
      </div>

      <div class="ticket__total">
        <p class="ticket__total-text">Итого</p>
        <p class="ticket__price">{{ bookingTotal }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  booking: {
    type: Object,
    default: () => ({}),
  },
  isCancelling: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["cancel"]);

const normalizeString = (value) => String(value || "").trim();

const formatMoney = (value) =>
  `${Number(value || 0).toLocaleString("ru-RU")} ₸`;

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

const bookingStatus = computed(
  () => normalizeString(props.booking?.status) || "active",
);

const reviewLink = computed(() => {
  const id = props.booking?.tour?._id;
  return id ? `/tours/${id}/reviews` : "/profile/my-tours";
});

const statusLabel = computed(() => {
  if (bookingStatus.value === "completed") return "Завершено";
  if (bookingStatus.value === "cancelled") return "Отменено";
  return "Активно";
});

const bookingTitle = computed(() => {
  return normalizeString(props.booking?.tour?.title) || "Тур FlyAway";
});

const bookingDate = computed(() => {
  const parsed = parseDateValue(props.booking?.date);

  if (!parsed) {
    return normalizeString(props.booking?.date) || "Дата уточняется";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
});

const bookingTotal = computed(() => formatMoney(props.booking?.total));

const ticketNumber = computed(() => {
  return (
    String(props.booking?._id || "")
      .slice(-6)
      .toUpperCase() || "000000"
  );
});

const detailsLink = computed(() => {
  const id = props.booking?.tour?._id;
  return id ? `/tours/${id}` : "/profile/my-tours";
});

const guestsLabel = computed(
  () => `${Number(props.booking?.guests || 0) || 1}`,
);

const paymentMethodLabel = computed(() => {
  const value = normalizeString(props.booking?.paymentMethod);

  if (value === "bonus") return "Бонусами";
  if (value === "installment") return "Рассрочка";
  return "Банковская карта";
});

const ticketSummary = computed(() => {
  const selections = Array.isArray(props.booking?.ticketSelections)
    ? props.booking.ticketSelections
    : [];

  return selections
    .filter((item) => Number(item?.quantity) > 0)
    .map((item) => `${item.title || "Билет"} × ${Number(item.quantity) || 0}`)
    .join(", ");
});
</script>

<style lang="scss" scoped>
.ticket {
  width: 100%;
  border-radius: 16px;
  box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.1);
  padding: 16px;
  border-right: 40px solid $red-500;
  background: $white;

  &--completed {
    border-right-color: $blue-500;
  }

  &--cancelled {
    border-right-color: $surface-400;
  }

  &__wrapper {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    width: 100%;
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
  }

  &__number {
    color: $surface-900;
    font-weight: 400;
  }

  &__status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 28px;
    padding: 0 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;

    &--active {
      color: $white;
      background: $red-500;
    }

    &--completed {
      color: $white;
      background: $blue-500;
    }

    &--cancelled {
      color: $white;
      background: $surface-400;
    }
  }

  &__title {
    font-size: 24px;
    margin-bottom: 12px;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 18px;
  }

  &__info-box {
    display: flex;
    flex-direction: column;
    gap: 4px;

    &--mobile-total {
      display: none;
    }
  }

  &__label {
    color: $surface-500;
    font-size: 13px;
    font-weight: 400;
  }

  &__value {
    color: $surface-900;
    font-size: 14px;
    font-weight: 600;
  }

  &__tickets {
    margin-top: 14px;
  }

  &__tickets-text {
    margin-top: 4px;
    color: $surface-900;
    line-height: 1.5;
  }

  &__actions {
    margin-top: 16px;
  }

  &__cancel {
    min-height: 40px;
    padding: 0 14px;
    border-radius: 10px;
    color: $orange-200;
    background: rgba($orange-200, 0.08);
    border: 1px solid rgba($orange-200, 0.2);
    font-size: 14px;
    font-weight: 700;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__total {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    min-width: 140px;
    align-items: flex-end;
  }

  &__total-text {
    font-size: 14px;
    color: $surface-900;
    font-weight: 400;
  }
  &__review-link {
    min-height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 14px;
    border-radius: 10px;
    color: $blue-500;
    background: rgba($blue-500, 0.08);
    border: 1px solid rgba($blue-500, 0.2);
    font-size: 14px;
    font-weight: 700;
  }

  &__price {
    color: $red-500;
    font-size: 24px;
    font-weight: 700;

    &--mobile {
      display: none;
      font-size: 14px;
    }
  }
}

@media (max-width: 640px) {
  .ticket {
    border-right-width: 20px;

    &__wrapper {
      flex-direction: column;
    }

    &__review-link {
      width: 100%;
    }

    &__title {
      font-size: 18px;
    }

    &__grid {
      grid-template-columns: 1fr;
    }

    &__info-box {
      &--mobile-total {
        display: flex;
      }
    }

    &__total {
      display: none;
    }

    &__price {
      &--mobile {
        display: block;
      }
    }

    &__top {
      align-items: flex-start;
      flex-direction: column;
    }

    &__status {
      width: fit-content;
    }

    &__cancel {
      width: 100%;
    }
  }
}
</style>
