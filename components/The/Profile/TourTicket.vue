<template>
  <section
    class="ticket"
    :class="{ 'ticket--nonactive': bookingStatus !== 'active' }"
  >
    <div class="ticket__wrapper">
      <div class="ticket__content">
        <div class="ticket__head">
          <p class="ticket__number">Билет №{{ ticketNumber }}</p>
          <p v-if="bookingStatus !== 'active'" class="ticket__status">
            {{ statusLabel }}
          </p>
        </div>

        <NuxtLink :to="detailsLink" class="ticket__title-link">
          <h2 class="ticket__title">{{ bookingTitle }}</h2>
        </NuxtLink>

        <div class="ticket__meta">
          <div class="ticket__meta-item">
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

        <div v-if="ticketSummary.length" class="ticket__summary">
          <p class="ticket__summary-text">{{ ticketSummary }}</p>
        </div>

        <div class="ticket__actions">
          <NuxtLink class="ticket__open-link" :to="detailsLink">
            Открыть билет
          </NuxtLink>

          <button
            v-if="bookingStatus === 'active'"
            class="ticket__cancel"
            type="button"
            :disabled="isCancelling"
            @click="handleCancelClick"
          >
            {{ isCancelling ? "Отменяем..." : "Отменить бронь" }}
          </button>

          <NuxtLink
            v-else-if="bookingStatus === 'completed'"
            class="ticket__review-link"
            :to="reviewLink"
          >
            Оставить отзыв
          </NuxtLink>
        </div>
      </div>

      <div class="ticket__accent"></div>
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

const emit = defineEmits(["cancel"]);

const normalizeString = (value) => String(value || "").trim();

const formatMoney = (value) => {
  const amount = Number(value);
  const formattedAmount = Number.isFinite(amount)
    ? amount.toLocaleString("ru-RU")
    : "0";

  return `${formattedAmount} ₸`;
};

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

const bookingStatus = computed(() => {
  const status = normalizeString(props.booking?.status);
  return ["active", "completed", "cancelled"].includes(status)
    ? status
    : "active";
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
  const raw = String(props.booking?._id || "").slice(-6);
  const numeric = Number.parseInt(raw, 16);

  if (!Number.isFinite(numeric)) {
    return "12345";
  }

  return String(numeric % 100000).padStart(5, "0");
});

const detailsLink = computed(() => {
  return props.booking?._id
    ? `/profile/my-tours/${props.booking._id}`
    : "/profile/my-tours";
});

const reviewLink = computed(() => {
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

const handleCancelClick = () => {
  if (!props.booking?._id || props.isCancelling) {
    return;
  }

  emit("cancel", props.booking._id);
};
</script>

<style lang="scss" scoped>
.ticket {
  width: 100%;
  border-radius: 24px;
  background: #f3f3f3;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.06);
  overflow: hidden;

  &--completed {
    .ticket__accent {
      background: $blue-500;
    }
  }

  &--cancelled {
    .ticket__accent {
      background: $surface-400;
    }
  }

  &__wrapper {
    display: flex;
    min-height: 156px;
  }

  &__content {
    flex: 1;
    padding: 28px 34px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
  }

  &__accent {
    width: 52px;
    flex: 0 0 52px;
    background: $blue-500;
    border-top-right-radius: 24px;
    border-bottom-right-radius: 24px;
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  &__number {
    color: $surface-900;
    font-size: 14px;
    font-weight: 600;
  }

  &__status {
    color: $surface-500;
    font-size: 13px;
    font-weight: 600;
  }

  &__title-link {
    display: block;
    width: fit-content;
  }

  &__title {
    color: $surface-900;
    font-size: 28px;
    line-height: 1.15;
    font-weight: 700;
    margin: 0;
  }

  &__meta {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
  }

  &__meta-item {
    display: flex;
    flex-direction: column;
    gap: 6px;

    &--total {
      align-items: flex-start;
      min-width: 180px;
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
  }

  &__hint {
    color: $surface-500;
    font-size: 12px;
    line-height: 1.35;
  }

  &__price {
    color: $blue-500;
    font-size: 32px;
    font-weight: 800;
    line-height: 1;
  }

  &__summary {
    margin-top: -2px;
  }

  &__summary-text {
    color: $surface-500;
    font-size: 14px;
    line-height: 1.45;
  }

  &__actions {
    margin-top: 16px;
  }

  &__open-link,
  &__review-link,
  &__cancel {
    min-height: 40px;
    padding: 0 14px;
    border-radius: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
  }

  &__open-link {
    color: $blue-500;
    background: rgba($blue-500, 0.08);
    border: 1px solid rgba($blue-500, 0.18);
  }

  &__review-link {
    color: $blue-500;
    background: rgba($blue-500, 0.08);
    border: 1px solid rgba($blue-500, 0.18);
  }

  &__cancel {
    color: $orange-200;
    background: rgba($orange-200, 0.08);
    border: 1px solid rgba($orange-200, 0.2);

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

@media (max-width: 768px) {
  .ticket {
    &__wrapper {
      min-height: auto;
    }

    &__content {
      padding: 22px 20px;
      gap: 12px;
    }

    &__accent {
      width: 22px;
      flex-basis: 22px;
    }

    &__title {
      font-size: 22px;
    }

    &__meta {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    &__meta-item {
      &--total {
        min-width: auto;
      }
    }

    &__price {
      font-size: 26px;
    }

    &__actions {
      flex-direction: column;
    }

    &__open-link,
    &__review-link,
    &__cancel {
      width: 100%;
    }
  }
}
</style>
