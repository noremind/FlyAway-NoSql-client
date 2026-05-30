<template>
  <section class="payment">
    <div class="payment__wrapper">
      <h3 class="payment__title title">{{ title }}</h3>
      <p class="payment__description">{{ tourTitle }}</p>

      <div class="payment__card">
        <table class="payment__table">
          <tbody>
            <tr class="payment__tr">
              <td class="payment__td payment__td--label">Дата</td>
              <td class="payment__td payment__td--value">{{ dateLabel }}</td>
            </tr>

            <tr class="payment__tr payment__tr--section">
              <td colspan="2">Ваши билеты</td>
            </tr>

            <tr
              v-for="item in normalizedItems"
              :key="`${item.title}-${item.quantity}`"
              class="payment__tr"
            >
              <td class="payment__td payment__td--label">{{ item.title }}</td>
              <td class="payment__td payment__td--value">
                {{ item.quantity }} × {{ formatMoney(item.price) }} ₸
              </td>
            </tr>

            <tr class="payment__tr payment__tr--summary-gap">
              <td class="payment__td payment__td--label payment__td--bold">Скидка</td>
              <td class="payment__td payment__td--value">-{{ discountLabel }}%</td>
            </tr>
            <tr class="payment__tr">
              <td class="payment__td payment__td--label payment__td--bold">Промокод</td>
              <td class="payment__td payment__td--value">-{{ formatMoney(promoDiscountAmount) }} ₸</td>
            </tr>
            <tr v-if="bonusAmount" class="payment__tr">
              <td class="payment__td payment__td--label payment__td--bold">Бонусы</td>
              <td class="payment__td payment__td--value">-{{ formatMoney(bonusAmount) }} Б</td>
            </tr>
            <tr class="payment__tr payment__tr--total">
              <td class="payment__td payment__td--label payment__td--bold">Итого</td>
              <td class="payment__td payment__td--value payment__td--total-value">
                {{ formatMoney(total) }} ₸
              </td>
            </tr>
          </tbody>
        </table>

        <div class="payment__methods-block">
          <p class="payment__section-title">Способ оплаты</p>

          <div class="payment__methods">
            <button
              v-for="option in paymentOptions"
              :key="option.value"
              type="button"
              class="payment__method"
              :class="{ 'payment__method--active': selectedPaymentMethod === option.value }"
              @click="emit('update:paymentMethod', option.value)"
            >
              <span class="payment__method-radio"></span>
              <span class="payment__method-content">
                <span class="payment__method-label">{{ option.label }}</span>
                <span class="payment__method-hint">{{ option.hint }}</span>
              </span>
            </button>
          </div>

          <div v-if="selectedPaymentMethod === 'card'" class="payment__card-form">
            <UiInput
              label="Номер карты"
              placeholder="1234 5678 9012"
              v-model="cardForm.number"
              :is-error="Boolean(cardErrors.number)"
            />
            <UiInput
              label="Имя держателя"
              placeholder="NURYM MAKSA"
              v-model="cardForm.holder"
              :is-error="Boolean(cardErrors.holder)"
            />
            <div class="payment__card-grid">
              <UiInput
                label="Срок действия"
                placeholder="MM/YY"
                v-model="cardForm.expiry"
                :is-error="Boolean(cardErrors.expiry)"
              />
              <UiInput
                label="CVV"
                placeholder="123"
                v-model="cardForm.cvv"
                :is-error="Boolean(cardErrors.cvv)"
              />
            </div>
            <p v-if="cardFormError" class="payment__form-error">{{ cardFormError }}</p>
          </div>

          <p v-if="selectedPaymentMethod === 'bonus'" class="payment__note payment__note--bonus">
            Доступно бонусов: {{ formatMoney(bonusBalance) }} Б. После подтверждения бронь будет оформлена со списанием бонусов.
          </p>
          <p v-else class="payment__note">
            Данные карты проверяются только для оформления демо-оплаты. Полный номер карты и CVV не сохраняются.
          </p>
        </div>
      </div>

      <UiButton
        class="payment__btn button-primary"
        :is-loading="isLoading"
        :label="payLabel"
        @click="handleSubmit"
      />
    </div>
  </section>
</template>

<script setup>
const emit = defineEmits(["payed", "update:paymentMethod"]);

const props = defineProps({
  title: { type: String, default: "Платежи" },
  tourTitle: { type: String, default: "" },
  dateLabel: { type: String, default: "Дата уточняется" },
  items: { type: Array, default: () => [] },
  discountLabel: { type: [String, Number], default: 0 },
  promoDiscountAmount: { type: Number, default: 0 },
  bonusAmount: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  paymentMethod: { type: String, default: "card" },
  isLoading: Boolean,
  bonusBalance: { type: Number, default: 0 },
});

const paymentOptions = [
  { label: "Банковская карта", value: "card", hint: "Оплата картой с проверкой данных" },
  { label: "Оплата бонусами", value: "bonus", hint: "Списание доступного бонусного баланса" },
];

const cardForm = reactive({ number: "", holder: "", expiry: "", cvv: "" });
const cardErrors = reactive({ number: "", holder: "", expiry: "", cvv: "" });
const cardFormError = ref("");

const normalizedItems = computed(() =>
  (Array.isArray(props.items) ? props.items : []).filter((item) => Number(item?.quantity) > 0),
);
const selectedPaymentMethod = computed(() => (props.paymentMethod === "bonus" ? "bonus" : "card"));
const payLabel = computed(() => selectedPaymentMethod.value === "bonus" ? "Списать бонусы и оплатить" : "Оплатить");

const formatMoney = (value) => Number(value || 0).toLocaleString("ru-RU");
const normalizeDigits = (value) => String(value || "").replace(/\D/g, "");

const clearCardErrors = () => {
  cardErrors.number = "";
  cardErrors.holder = "";
  cardErrors.expiry = "";
  cardErrors.cvv = "";
  cardFormError.value = "";
};

watch(() => selectedPaymentMethod.value, (value) => {
  if (value !== "card") clearCardErrors();
});

watch(() => cardForm.number, (value) => {
  const digits = normalizeDigits(value).slice(0, 12);
  const formatted = (digits.match(/.{1,4}/g) || []).join(" ");
  if (formatted !== value) cardForm.number = formatted;
});

watch(() => cardForm.holder, (value) => {
  const formatted = String(value || "")
    .toUpperCase()
    .replace(/[^A-Z\s]/g, "")
    .replace(/\s+/g, " ")
    .trimStart();
  if (formatted !== value) cardForm.holder = formatted;
});

watch(() => cardForm.expiry, (value) => {
  const digits = normalizeDigits(value).slice(0, 4);
  const formatted = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  if (formatted !== value) cardForm.expiry = formatted;
});

watch(() => cardForm.cvv, (value) => {
  const digits = normalizeDigits(value).slice(0, 3);
  if (digits !== value) cardForm.cvv = digits;
});

const getPaymentCardPayload = () => ({
  number: normalizeDigits(cardForm.number),
  holder: String(cardForm.holder || "").trim().toUpperCase(),
  expiry: normalizeDigits(cardForm.expiry),
  cvv: normalizeDigits(cardForm.cvv),
});

const validateCardForm = () => {
  clearCardErrors();

  const payload = getPaymentCardPayload();
  const month = Number(payload.expiry.slice(0, 2));

  if (payload.number.length !== 12) cardErrors.number = "Введите ровно 12 цифр";
  if (!/^[A-Z]+(?: [A-Z]+)*$/.test(payload.holder)) {
    cardErrors.holder = "Только английские заглавные буквы";
  }
  if (payload.expiry.length !== 4 || month < 1 || month > 12) {
    cardErrors.expiry = "Формат MM/YY";
  }
  if (payload.cvv.length !== 3) cardErrors.cvv = "Введите ровно 3 цифры";

  const hasErrors = Object.values(cardErrors).some(Boolean);
  if (hasErrors) {
    cardFormError.value = "Проверьте данные банковской карты.";
    return false;
  }

  return true;
};

const saveCardPayloadForCheckout = (payload) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("flyaway_checkout_card", JSON.stringify(payload));
};

const handleSubmit = () => {
  let paymentCard = null;

  if (selectedPaymentMethod.value === "card") {
    if (!validateCardForm()) return;
    paymentCard = getPaymentCardPayload();
    saveCardPayloadForCheckout(paymentCard);
  }

  emit("payed", { paymentCard });
};
</script>

<style lang="scss" scoped>
.payment {
  &__wrapper { width: 100%; max-width: 760px; margin: 0 auto; padding: 20px 0 0; display: flex; flex-direction: column; gap: 18px; color: $surface-900; }
  &__title { text-align: center; margin: 0; }
  &__description { max-width: 640px; margin: 0 auto; text-align: center; font-size: clamp(20px, 2.5vw, 28px); font-weight: 700; line-height: 1.2; }
  &__card { display: flex; flex-direction: column; gap: 24px; width: 100%; }
  &__table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  &__tr { &--section td { padding-top: 18px; color: $red-500; font-weight: 700; font-size: 16px; } &--summary-gap td, &--total td { padding-top: 18px; } }
  &__td { padding: 6px 0; vertical-align: top; font-size: 16px; line-height: 1.35; &--label { color: $surface-900; padding-right: 16px; } &--value { text-align: right; font-weight: 600; white-space: nowrap; } &--bold { font-weight: 700; } &--total-value { color: $red-500; font-size: 18px; font-weight: 800; } }
  &__methods-block { display: flex; flex-direction: column; gap: 14px; }
  &__section-title { color: $red-500; font-size: 16px; font-weight: 700; margin: 0; }
  &__methods { display: flex; flex-direction: column; gap: 12px; }
  &__method { width: 100%; display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; border-radius: 18px; border: 1px solid rgba($surface-300, 0.55); background: $white; text-align: left; transition: border-color 0.2s ease, background-color 0.2s ease; &--active { border-color: rgba($red-500, 0.45); background: rgba($red-500, 0.04); } }
  &__method-radio { width: 20px; height: 20px; flex: 0 0 20px; margin-top: 2px; border-radius: 999px; border: 2px solid rgba($surface-300, 0.95); position: relative; }
  &__method--active &__method-radio { border-color: $red-500; &::after { content: ""; position: absolute; inset: 3px; border-radius: 999px; background: $red-500; } }
  &__method-content { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
  &__method-label { font-size: 15px; font-weight: 700; color: $surface-900; }
  &__method-hint { font-size: 14px; color: $surface-500; line-height: 1.4; }
  &__card-form { display: grid; gap: 12px; padding: 16px; border-radius: 18px; background: rgba($surface-150, 0.8); border: 1px solid rgba($red-500, 0.08); }
  &__card-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  &__form-error { color: $red-500; font-size: 13px; font-weight: 600; }
  &__note { padding: 14px 16px; border-radius: 16px; background: rgba($surface-300, 0.08); color: $surface-500; font-size: 14px; line-height: 1.45; &--bonus { color: $red-500; background: rgba($red-500, 0.06); font-weight: 700; } }
  &__btn { width: 100%; margin-top: 6px; font-weight: 700; }
}

@media (max-width: 640px) {
  .payment { &__wrapper { max-width: 100%; padding-top: 8px; gap: 16px; } &__description { font-size: 18px; line-height: 1.25; } &__td { font-size: 14px; &--label { padding-right: 12px; } &--value { white-space: normal; word-break: break-word; } &--total-value { font-size: 16px; } } &__method { padding: 12px 14px; border-radius: 16px; } &__method-label { font-size: 14px; } &__method-hint, &__note, &__form-error { font-size: 13px; } &__card-grid { grid-template-columns: 1fr; } }
}
</style>
