<template>
  <section class="refund">
    <div class="refund__wrapper">
      <div class="refund__header">
        <h3 class="refund__title">Причина возврата</h3>
        <p class="refund__description">Выберите причину</p>
      </div>

      <div class="refund__checkboxs">
        <UiCheckbox
          v-model="selectedReason"
          :options="options"
        ></UiCheckbox>
      </div>

      <UiTextarea
        v-model="comment"
        placeholder="Напишите причину возврата"
      ></UiTextarea>

      <UiButton
        @click="clickButton"
        class="refund__btn button-primary"
        :disabled="isDisabled"
        :is-loading="isLoading"
        label="Оформить возврат"
      ></UiButton>
    </div>
  </section>
</template>

<script setup>
const emit = defineEmits(["nextStep", "closeModal"]);

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  closeOnSubmit: {
    type: Boolean,
    default: true,
  },
});

const options = [
  { label: "Изменились планы", value: "plans_changed" },
  { label: "Не подходит дата или время", value: "date_or_time" },
  { label: "Нашел другой тур", value: "another_tour" },
  { label: "Ошибка при бронировании", value: "booking_error" },
  { label: "Другое", value: "other" },
];

const selectedReason = ref(options[0]);
const comment = ref("");

const isDisabled = computed(() => props.isLoading || !selectedReason.value);

const clickButton = () => {
  if (isDisabled.value) {
    return;
  }

  emit("nextStep", {
    reason: selectedReason.value,
    comment: comment.value.trim(),
  });

  if (props.closeOnSubmit) {
    emit("closeModal");
  }
};
</script>

<style lang="scss" scoped>
.refund {
  &__wrapper {
    margin: 0 auto;
    max-width: 327px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 40px 0;
  }
  &__title {
    font-size: 32px;
    color: $surface-900;
    margin-bottom: 8px;
    font-weight: 700;
  }
  &__description {
    font-size: 14px;
    color: $surface-900;
    font-weight: 400;
  }
  &__checkboxs {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}
</style>
