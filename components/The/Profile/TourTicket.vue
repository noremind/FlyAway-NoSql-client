<template>
  <NuxtLink
    :to="detailsLink"
    class="ticket"
    :class="{
      'ticket--completed': bookingStatus === 'completed',
      'ticket--cancelled': bookingStatus === 'cancelled',
    }"
  >
    <div class="ticket__wrapper">
      <div class="ticket__content">
        <p class="ticket__number">Билет №{{ ticketNumber }}</p>

        <h2 class="ticket__title">{{ bookingTitle }}</h2>

        <div class="ticket__meta">
          <div class="ticket__meta-item">
            <p class="ticket__label">Дата</p>
            <p class="ticket__value">{{ bookingDate }}</p>
          </div>

          <div class="ticket__meta-item ticket__meta-item--total">
            <p class="ticket__label">Итого</p>
            <p class="ticket__price">{{ bookingTotal }}</p>
          </div>
        </div>
      </div>

      <div class="ticket__accent"></div>
    </div>
  </NuxtLink>
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
</script>

<style lang="scss" scoped>
.ticket {
  width: 100%;
  display: block;
  border-radius: 24px;
  background: $white;
  box-shadow: 0px 6px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;

  &--completed {
    .ticket__accent {
      background: $surface-400;
    }
  }

  &--cancelled {
    .ticket__accent {
      background: $surface-300;
    }
  }

  &__wrapper {
    display: flex;
    min-height: 122px;
  }

  &__content {
    flex: 1;
    padding: 22px 26px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
  }

  &__accent {
    width: 34px;
    flex: 0 0 34px;
    background: $red-500;
    border-top-right-radius: 24px;
    border-bottom-right-radius: 24px;
  }

  &__number {
    color: $surface-900;
    font-size: 14px;
    font-weight: 500;
  }

  &__title {
    color: $surface-900;
    font-size: 20px;
    line-height: 1.2;
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
    gap: 4px;

    &--total {
      min-width: 160px;
      align-items: flex-start;
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

  &__price {
    color: $red-500;
    font-size: 18px;
    font-weight: 800;
    line-height: 1;
  }
}

@media (max-width: 768px) {
  .ticket {
    &__wrapper {
      min-height: auto;
    }

    &__content {
      padding: 18px 18px;
    }

    &__accent {
      width: 18px;
      flex-basis: 18px;
    }

    &__title {
      font-size: 18px;
    }

    &__meta {
      gap: 16px;
    }

    &__meta-item--total {
      min-width: auto;
    }
  }
}
</style>
