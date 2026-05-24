<template>
  <UiModal :is-show="isShow" max-width="680px" @close="emit('close')">
    <section class="hotel-booking-modal">
      <template v-if="step === 'confirm'">
        <div class="hotel-booking-modal__head hotel-booking-modal__head--confirm">
          <h3 class="hotel-booking-modal__title">Подтвердите бронирование</h3>
          <p class="hotel-booking-modal__subtitle">{{ hotelTitle }}</p>
        </div>

        <div v-if="selectedRoomLabel" class="hotel-booking-modal__selected">
          <UiIcons icon="circle-check" size="size-18" color="red-500" />
          <span>{{ selectedRoomLabel }}</span>
        </div>

        <div class="hotel-booking-modal__summary hotel-booking-modal__summary--plain">
          <div class="hotel-booking-modal__row">
            <span>Дата от</span>
            <strong>{{ checkInLabel }}</strong>
          </div>
          <div class="hotel-booking-modal__row">
            <span>Дата до</span>
            <strong>{{ checkOutLabel }}</strong>
          </div>
          <div class="hotel-booking-modal__row">
            <span>{{ selectedRoomName }}</span>
            <strong>{{ roomPriceLabel }}</strong>
          </div>
          <div v-if="discountLabel" class="hotel-booking-modal__row">
            <span>Скидка</span>
            <strong>{{ discountLabel }}</strong>
          </div>
          <div class="hotel-booking-modal__row hotel-booking-modal__row--total">
            <span>Итого</span>
            <strong>{{ priceLabel || 'По запросу' }}</strong>
          </div>
        </div>

        <UiButton
          label="Подтвердить"
          class="hotel-booking-modal__submit button-primary"
          @click="step = 'form'"
        />
      </template>

      <template v-else>
        <div class="hotel-booking-modal__head">
          <div>
            <h3 class="hotel-booking-modal__title">Данные клиента</h3>
            <p class="hotel-booking-modal__subtitle">{{ hotelTitle }}</p>
          </div>
        </div>

        <div v-if="selectedRoomLabel" class="hotel-booking-modal__selected">
          <UiIcons icon="circle-check" size="size-18" color="red-500" />
          <span>{{ selectedRoomLabel }}</span>
        </div>

        <div class="hotel-booking-modal__summary">
          <div class="hotel-booking-modal__row">
            <span>Дата от</span>
            <strong>{{ checkInLabel }}</strong>
          </div>
          <div class="hotel-booking-modal__row">
            <span>Дата до</span>
            <strong>{{ checkOutLabel }}</strong>
          </div>
          <div class="hotel-booking-modal__row">
            <span>Гостей</span>
            <strong>{{ guestsLabel }}</strong>
          </div>
          <div v-if="priceLabel" class="hotel-booking-modal__row">
            <span>{{ priceTitle }}</span>
            <strong>{{ priceLabel }}</strong>
          </div>
        </div>

        <form class="hotel-booking-modal__form" @submit.prevent="emit('submit')">
          <div class="hotel-booking-modal__grid">
            <UiInput
              label="Имя"
              placeholder="Как к вам обращаться"
              v-model.trim="localForm.name"
              :is-error="Boolean(errors?.name)"
            />
            <UiInput
              label="Телефон"
              placeholder="+7 700 000 00 00"
              maska="+7 ### ### ## ##"
              v-model="localForm.phone"
              :is-error="Boolean(errors?.phone)"
            />
          </div>

          <UiInput
            label="Email"
            type="email"
            placeholder="name@example.com"
            v-model.trim="localForm.email"
            :is-error="Boolean(errors?.email)"
          />

          <div class="hotel-booking-modal__grid">
            <UiCalendar label="Дата заезда" placeholder="Выберите дату" v-model="localForm.checkIn" :clearable="true" />
            <UiCalendar label="Дата выезда" placeholder="Выберите дату" v-model="localForm.checkOut" :clearable="true" />
          </div>

          <UiInput
            label="Гостей"
            type="number"
            placeholder="Количество гостей"
            v-model="localForm.guests"
            :is-error="Boolean(errors?.guests)"
          />

          <UiTextarea
            label="Комментарий"
            placeholder="Напишите пожелания к проживанию"
            v-model.trim="localForm.comment"
            :rows="4"
          />

          <p v-if="statusMessage" class="hotel-booking-modal__status" :class="`hotel-booking-modal__status--${statusType}`">
            {{ statusMessage }}
          </p>

          <UiButton
            :label="submitLabel"
            class="hotel-booking-modal__submit button-primary"
            type="submit"
            :is-loading="isLoading"
            :disabled="isLoading"
          />
        </form>
      </template>
    </section>
  </UiModal>
</template>

<script setup>
const props = defineProps({
  isShow: Boolean,
  hotelTitle: { type: String, default: "Отель" },
  selectedRoomLabel: { type: String, default: "" },
  checkInLabel: { type: String, default: "—" },
  checkOutLabel: { type: String, default: "—" },
  guestsLabel: { type: String, default: "1" },
  priceTitle: { type: String, default: "Итого" },
  priceLabel: { type: String, default: "" },
  modelValue: {
    type: Object,
    default: () => ({
      name: "",
      phone: "",
      email: "",
      checkIn: null,
      checkOut: null,
      guests: "",
      comment: "",
    }),
  },
  errors: { type: Object, default: () => ({}) },
  statusMessage: { type: String, default: "" },
  statusType: { type: String, default: "error" },
  isLoading: Boolean,
  submitLabel: { type: String, default: "Отправить заявку" },
});

const emit = defineEmits(["close", "submit", "update:modelValue"]);
const step = ref("confirm");

const localForm = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const selectedRoomName = computed(() => {
  return String(props.selectedRoomLabel || "Выбранный номер").replace(/^Вы выбрали\s*/i, "") || "Номер";
});

const roomPriceLabel = computed(() => {
  return props.priceLabel || "По запросу";
});

const discountLabel = computed(() => "");

watch(
  () => props.isShow,
  (value) => {
    if (value) step.value = "confirm";
  },
);
</script>

<style lang="scss" scoped>
.hotel-booking-modal {
  display: grid;
  gap: 18px;
  padding: 6px 4px 4px;

  &__head {
    display: grid;
    gap: 6px;
    text-align: center;

    &--confirm {
      padding-top: 18px;
    }
  }

  &__title {
    color: $surface-900;
    font-size: clamp(26px, 4vw, 38px);
    font-weight: 800;
    line-height: 1.1;
  }

  &__subtitle {
    margin-top: 10px;
    color: $surface-900;
    font-size: 22px;
    font-weight: 800;
  }

  &__selected {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 38px;
    padding: 0 14px;
    border-radius: 999px;
    color: $red-500;
    margin: 0 auto;
    font-weight: 700;
  }

  &__summary {
    display: grid;
    gap: 10px;
    padding: 18px;
    border-radius: 18px;
    background: rgba($surface-150, 0.8);
    border: 1px solid rgba($red-500, 0.08);

    &--plain {
      max-width: 470px;
      width: 100%;
      margin: 0 auto;
      background: transparent;
      border: none;
      padding: 4px 0;
    }
  }

  &__row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    color: $surface-500;
    line-height: 1.45;

    strong {
      color: $surface-900;
      font-weight: 700;
      text-align: right;
    }

    &--total {
      margin-top: 6px;
      font-weight: 800;

      span,
      strong {
        color: $surface-900;
        font-weight: 800;
      }
    }
  }

  &__form {
    display: grid;
    gap: 12px;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  &__status {
    padding: 12px 14px;
    border-radius: 14px;
    font-size: 14px;
    line-height: 1.45;

    &--success {
      color: $green-400;
      background: rgba($green-400, 0.08);
    }

    &--error {
      color: $red-500;
      background: rgba($red-500, 0.08);
    }
  }

  &__submit {
    width: min(100%, 460px);
    margin: 0 auto;
    justify-content: center;
  }
}

@media (max-width: 700px) {
  .hotel-booking-modal {
    &__grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
