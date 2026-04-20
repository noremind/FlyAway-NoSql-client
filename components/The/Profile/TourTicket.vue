<template>
  <section
    class="ticket"
    :class="{ 'ticket--nonactive': bookingStatus !== 'active' }"
  >
    <div class="ticket__wrapper">
      <div class="ticket__info">
        <p class="ticket__number">Билет №{{ ticketNumber }}</p>
        <nuxt-link :to="detailsLink">
          <h2 class="ticket__title title">{{ bookingTitle }}</h2>
        </nuxt-link>
        <div class="ticket__info-box">
          <p class="ticket__date">Дата</p>
          <p class="ticket__day">{{ bookingDate }}</p>
        </div>
        <div class="ticket__info-box">
          <p class="ticket__date ticket__date--mobile ticket__date--bold">
            Сумма
          </p>
          <p class="ticket__price ticket__price--mobile ticket__price--mobile">
            {{ bookingTotal }}
          </p>
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
});

const normalizeString = (value) => String(value || "").trim();

const formatMoney = (value) => `${Number(value || 0).toLocaleString("ru-RU")} ₸`;

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

const bookingStatus = computed(() => normalizeString(props.booking?.status) || "active");

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
  return String(props.booking?._id || "").slice(-6).toUpperCase() || "000000";
});

const detailsLink = computed(() => {
  const id = props.booking?.tour?._id;
  return id ? `/tours/${id}` : "/profile/my-tours";
});
</script>

<style lang="scss" scoped>
.ticket {
  width: 100%;
  border-radius: 16px;
  box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.1);
  padding: 16px;
  border-right: 40px solid $red-500;
  &--nonactive {
    border-right: 40px solid $surface-400;
  }
  &__wrapper {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    width: 90%;
  }
  &__title {
    font-size: 24px;
  }
  &__number {
    color: $surface-900;
    font-weight: 400;
  }
  &__info {
    max-width: 500px;
    width: 100%;
  }
  &__date {
    &--mobile {
      display: none;
    }
    &--bold {
      font-weight: 400;
      font-size: 12px;
    }
  }
  &__info-box {
    max-width: 350px;
    width: 100%;
    display: flex;
    color: $surface-900;
    justify-content: space-between;
    margin-top: 8px;
  }
  &__total {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    &-text {
      font-size: 14px;
      color: $surface-900;
      font-weight: 400;
    }
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

@media (max-width: 375px) {
  .ticket {
    border-right: 20px solid $red-500;
    font-size: 12px;
    &__total {
      display: none;
    }
    &__title {
      font-size: 14px;
    }
    &__price {
      &--mobile {
        display: block;
      }
    }
    &__date {
      &--mobile {
        display: block;
      }
    }
  }
}
</style>
