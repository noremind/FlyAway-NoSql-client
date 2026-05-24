<template>
  <div class="select">
    <label v-if="label" class="select__label">{{ label }}</label>

    <div
      class="select__wrapper"
      :class="{
        'select__wrapper--disabled': disabled,
        'select__wrapper--with-clear': showClear,
      }"
    >
      <Select
        v-model="model"
        :options="options"
        :optionLabel="optionLabel"
        :optionValue="optionValue || undefined"
        :placeholder="placeholder"
        :disabled="disabled"
        class="select__field"
      />
      <button
        v-if="showClear"
        type="button"
        class="select__clear"
        aria-label="Сбросить выбор"
        @click="clearValue"
      >
        <UiIcons icon="circle-close" size="size-16" color="surface-400" />
      </button>
    </div>
  </div>
</template>

<script setup>
import Select from "primevue/select";

const props = defineProps({
  modelValue: {
    type: [String, Number, Object, Boolean, Array],
    default: null,
  },
  options: {
    type: Array,
    default: () => [],
  },
  optionLabel: {
    type: String,
    default: "name",
  },
  optionValue: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "",
  },
  label: {
    type: String,
    default: "",
  },
  disabled: Boolean,
  clearable: {
    type: Boolean,
    default: true,
  },
});
const emit = defineEmits(["update:modelValue", "clear"]);

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const showClear = computed(() => {
  return (
    props.clearable &&
    !props.disabled &&
    props.modelValue !== null &&
    props.modelValue !== undefined &&
    props.modelValue !== ""
  );
});

const clearValue = () => {
  emit("update:modelValue", null);
  emit("clear");
};
</script>

<style lang="scss" scoped>
.select {
  &__label {
    display: block;
    margin-bottom: 6px;
    font-size: 14px;
    font-weight: 500;
    color: $surface-900;
  }

  &__wrapper {
    position: relative;
    border: 1px solid $surface-300;
    border-radius: 26px;
    background: $white;
    box-shadow: 0 8px 20px rgba(32, 36, 38, 0.06);
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;

    &:focus-within {
      border-color: rgba($red-500, 0.55);
      box-shadow: 0 10px 24px rgba($red-500, 0.1);
    }

    &--disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }

    &--with-clear {
      :deep(.p-select-label) {
        padding-right: 56px !important;
      }
    }
  }

  &__clear {
    position: absolute;
    top: 50%;
    right: 34px;
    transform: translateY(-50%);
    z-index: 1;
    width: 24px;
    height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: rgba($surface-300, 0.18);
    transition:
      background-color 0.2s ease,
      transform 0.2s ease;

    &:hover {
      transform: translateY(-50%) scale(1.04);
      background: rgba($red-500, 0.08);
    }
  }
}
</style>
