<template>
  <UiModal :is-show="isShow" max-width="560px" @close="emit('close')">
    <section class="hotel-booking-success">
      <img
        class="hotel-booking-success__logo"
        src="@/assets/image/logo/FlyAway-logo.png"
        alt="FlyAway"
      />

      <div class="hotel-booking-success__icon">
        <UiIcons icon="circle-check" size="size-120" color="green-400" />
      </div>

      <h3 class="hotel-booking-success__title">{{ title }}</h3>

      <p v-if="text" class="hotel-booking-success__text">{{ text }}</p>

      <UiButton
        :label="buttonLabel"
        class="hotel-booking-success__btn button-primary"
        @click="emit('action')"
      />
    </section>
  </UiModal>
</template>

<script setup>
const props = defineProps({
  isShow: Boolean,
  title: {
    type: String,
    default: "Наш менеджер с вами свяжется",
  },
  text: {
    type: String,
    default: "",
  },
  buttonLabel: {
    type: String,
    default: "Готово",
  },
});

const emit = defineEmits(["close", "action"]);
</script>

<style lang="scss" scoped>
.hotel-booking-success {
  display: grid;
  justify-items: center;
  gap: 18px;
  padding: 18px 6px 10px;
  text-align: center;

  &__logo {
    width: 160px;
    height: auto;
    object-fit: contain;
  }

  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  &__title {
    color: $red-500;
    font-size: 20px;
    font-weight: 700;
    line-height: 1.2;
  }

  &__text {
    max-width: 360px;
    color: $surface-500;
    line-height: 1.5;
  }

  &__btn {
    min-width: 220px;
    justify-content: center;
  }
}
</style>
