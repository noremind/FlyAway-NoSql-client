<template>
  <section class="payment">
    <div class="payment__wrapper">
      <h3 class="payment__title title">{{ title }}</h3>
      <p class="payment__description">{{ tourTitle }}</p>

      <table class="payment__table">
        <tbody>
          <tr class="payment__tr">
            <td class="payment__td">Дата</td>
            <td class="payment__td">{{ dateLabel }}</td>
          </tr>
          <tr class="payment__tr payment__tr--blue">
            <td>Ваши билеты</td>
          </tr>
          <tr
            v-for="item in normalizedItems"
            :key="`${item.title}-${item.quantity}`"
            class="payment__tr"
          >
            <td class="payment__td">{{ item.title }}</td>
            <td class="payment__td">
              {{ item.quantity }} x {{ formatMoney(item.price) }} ₸
            </td>
          </tr>
          <tr class="payment__tr payment__tr--padding">
            <td class="payment__td payment__td--bold">Скидка</td>
            <td class="payment__td">-{{ discountLabel }}%</td>
          </tr>
          <tr class="payment__tr">
            <td class="payment__td payment__td--bold">Промокод</td>
            <td class="payment__td">-{{ formatMoney(promoDiscountAmount) }} ₸</td>
          </tr>
          <tr v-if="bonusAmount" class="payment__tr">
            <td class="payment__td payment__td--bold">Бонусы</td>
            <td class="payment__td">-{{ formatMoney(bonusAmount) }} Б</td>
          </tr>
          <tr class="payment__tr payment__tr--padding">
            <td class="payment__td payment__td--bold">Итого</td>
            <td class="payment__td">{{ formatMoney(total) }} ₸</td>
          </tr>
          <tr class="payment__tr payment__tr--blue">
            <td>Способ оплаты</td>
          </tr>
          <tr class="payment__tr">
            <td class="payment__td payment__td--box">
              <UiCheckbox
                :options="paymentOptions"
                :model-value="selectedPaymentOption"
                @update:model-value="updatePaymentMethod"
                type="checkmark"
              />
            </td>
            <td class="payment__td"></td>
          </tr>
        </tbody>
      </table>

      <p
        v-if="selectedPaymentMethod === 'bonus'"
        class="payment__bonus-note"
      >
        Доступно бонусов: {{ formatMoney(bonusBalance) }} Б
      </p>

      <UiButton
        @click="emit('payed')"
        class="payment__btn button-primary"
        :is-loading="isLoading"
        :label="payLabel"
      ></UiButton>
    </div>
  </section>
</template>

<script setup>
const emit = defineEmits(["payed", "update:paymentMethod"]);

const props = defineProps({
  title: {
    type: String,
    default: "Платежи",
  },
  tourTitle: {
    type: String,
    default: "",
  },
  dateLabel: {
    type: String,
    default: "Дата уточняется",
  },
  items: {
    type: Array,
    default: () => [],
  },
  discountLabel: {
    type: [String, Number],
    default: 0,
  },
  promoDiscountAmount: {
    type: Number,
    default: 0,
  },
  bonusAmount: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
  paymentMethod: {
    type: String,
    default: "card",
  },
  isLoading: Boolean,
  bonusBalance: {
    type: Number,
    default: 0,
  },
});

const paymentOptions = [
  { label: "Банковская карта", value: "card" },
  { label: "Рассрочка на 3 месяца", value: "installment" },
  { label: "Оплатить бонусом", value: "bonus" },
];

const normalizedItems = computed(() =>
  (Array.isArray(props.items) ? props.items : []).filter(
    (item) => Number(item?.quantity) > 0,
  ),
);

const selectedPaymentOption = computed(() => {
  return (
    paymentOptions.find((item) => item.value === props.paymentMethod) ||
    paymentOptions[0]
  );
});

const selectedPaymentMethod = computed(() => selectedPaymentOption.value.value);

const payLabel = computed(() =>
  selectedPaymentMethod.value === "bonus" ? "Оплатить бонусами" : "Оплатить",
);

const updatePaymentMethod = (option) => {
  emit("update:paymentMethod", option?.value || "card");
};

const formatMoney = (value) => Number(value || 0).toLocaleString("ru-RU");
</script>

<style lang="scss" scoped>
.payment {
  &__wrapper {
    margin: 40px 26px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    justify-content: center;
    align-items: center;
    color: $surface-900;
  }
  &__title {
    margin-bottom: 16px;
  }
  &__description {
    font-size: 20px;
    font-weight: 700;
  }
  &__btn {
    width: 90%;
    margin-top: 12px;
    font-weight: 700;
  }
  &__bonus-note {
    color: $red-500;
    font-size: 14px;
    font-weight: 600;
  }

  &__table {
    color: $surface-900;
  }
  &__tr &__td:last-child {
    text-align: right;
    font-weight: 400;
  }
  &__td {
    font-weight: 100;
    padding-top: 4px;
    &--bold {
      font-weight: 400;
    }
    &--box {
      display: flex;
      gap: 4px;
      align-items: center;
    }
  }
  &__tr {
    &--padding td {
      padding-top: 24px;
    }
    &--blue {
      color: $red-500;
      font-weight: 400;
      & td {
        padding-top: 16px;
      }
    }
  }
}
</style>
