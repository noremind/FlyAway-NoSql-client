<template>
  <NuxtLink :to="detailsLink" class="ticket" :class="ticketClassName">
    <div class="ticket__wrapper">
      <div class="ticket__content">
        <p class="ticket__number">Бронь №{{ bookingNumber }}</p>

        <div class="ticket__title-row">
          <h2 class="ticket__title">{{ hotelName }}</h2>
          <div v-if="hotelStars.length" class="ticket__stars">
            <span v-for="star in hotelStars" :key="star" class="ticket__star">★</span>
          </div>
        </div>

        <div class="ticket__meta">
          <div class="ticket__meta-item">
            <p class="ticket__label">Дата</p>
            <p class="ticket__value">{{ bookingPeriod }}</p>
          </div>

          <div class="ticket__meta-item ticket__meta-item--total">
            <p class="ticket__label">Итого</p>
            <p class="ticket__price">{{ totalLabel }}</p>
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

const hotelName = computed(() => {
  return normalizeString(props.booking?.hotel?.name) || "Отель FlyAway";
});

const hotelStars = computed(() => {
  const rating = Math.max(0, Math.floor(Number(props.booking?.hotel?.rating) || 0));
  return Array.from({ length: rating }, (_, index) => index + 1);
});

const bookingPeriod = computed(() => {
  const checkIn = formatDateLabel(props.booking?.checkIn);
  const checkOut = formatDateLabel(props.booking?.checkOut);

  if (!normalizeString(props.booking?.checkIn) && !normalizeString(props.booking?.checkOut)) {
    return "Дата уточняется";
  }

  if (!normalizeString(props.booking?.checkOut)) {
    return checkIn;
  }

  return `${checkIn} - ${checkOut}`;
});

const totalLabel = computed(() => {
  return `${Number(props.booking?.total || 24800).toLocaleString("ru-RU")} ₸`;
});

const bookingNumber = computed(() => {
  const raw = String(props.booking?._id || "").slice(-6);
  const numeric = Number.parseInt(raw, 16);

  if (!Number.isFinite(numeric)) {
    return "12345";
  }

  return String(numeric % 100000).padStart(5, "0");
});

const detailsLink = computed(() => {
  return props.booking?._id
    ? `/profile/my-hotels/${props.booking._id}`
    : "/profile/my-hotels";
});

const ticketClassName = computed(() => {
  if (props.booking?.status === "completed") return "ticket--completed";
  if (props.booking?.status === "cancelled") return "ticket--cancelled";
  return "ticket--active";
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

  &__title-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  &__title {
    color: $surface-900;
    font-size: 20px;
    line-height: 1.2;
    font-weight: 700;
    margin: 0;
  }

  &__stars {
    display: inline-flex;
    gap: 3px;
  }

  &__star {
    color: #f4c531;
    font-size: 18px;
    line-height: 1;
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
      padding: 18px;
    }

    &__accent {
      width: 18px;
      flex-basis: 18px;
    }

    &__title {
      font-size: 18px;
    }

    &__meta-item--total {
      min-width: auto;
    }
  }
}
</style>
