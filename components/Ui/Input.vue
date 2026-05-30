<template>
  <div class="input">
    <label class="input__label" for="" v-if="label">{{ label }}</label>
    <div
      class="input__wrapper"
      :class="[
        customClass,
        {
          'input__wrapper--error': isError,
          'input__wrapper--with-clear': showClear,
        },
      ]"
    >
      <UiIcons
        v-if="beforeIcon"
        :icon="beforeIcon"
        :color="iconColor"
        :size="iconSize"
      ></UiIcons>
      <input
        class="input__field"
        :class="{
          'input__field--center': isCenter,
          'input__field--disabled': disabled,
          'input__field--center': position === 'center',
        }"
        :type="type"
        :name="name"
        v-maska
        :data-maska="maska"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :placeholder="placeholder"
        :disabled="disabled"
        :maxlength="maxLength"
      />
      <button
        v-if="showClear"
        type="button"
        class="input__clear"
        aria-label="Сбросить поле"
        @click="clearValue"
      >
        <UiIcons icon="circle-close" size="size-16" color="surface-400" />
      </button>
      <UiIcons
        v-if="afterIcon"
        :icon="afterIcon"
        :color="iconColor"
        :size="iconSize"
      ></UiIcons>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  type: {
    type: String,
    default: "text",
  },
  modelValue: {
    type: [String, Number],
    default: "",
  },
  maska: {
    type: String,
    default: "",
  },
  label: String,
  placeholder: String,
  disabled: Boolean,
  beforeIcon: String,
  afterIcon: String,
  iconSize: String,
  iconColor: String,
  customClass: String,
  isCenter: Boolean,
  isError: Boolean,
  name: String,
  position: String,
  maxLength: Number,
  clearable: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:modelValue", "clear"]);

const hasValue = computed(() => {
  return (
    props.modelValue !== null &&
    props.modelValue !== undefined &&
    props.modelValue !== ""
  );
});

const showClear = computed(() => {
  return props.clearable && !props.disabled && hasValue.value;
});

const clearValue = () => {
  emit("update:modelValue", "");
  emit("clear");
};
</script>

<style lang="scss" scoped>
.input {
  &__wrapper {
    border-radius: 26px;
    min-height: 46px;
    padding: 10px 14px;
    max-width: 100%;
    border: 1px solid $surface-300;
    background: $white;
    box-shadow: 0 8px 20px rgba(32, 36, 38, 0.06);
    display: flex;
    gap: 6px;
    align-items: center;
    justify-content: space-between;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;

    &:focus-within {
      border-color: rgba($red-500, 0.55);
      box-shadow: 0 10px 24px rgba($red-500, 0.1);
    }

    &--error {
      border-color: $orange-200;
    }

    &--with-clear {
      .input__field {
        padding-right: 4px;
      }
    }
  }
  &__label {
    display: block;
    margin-bottom: 6px;
    color: $surface-900;
    font-weight: 500;
    font-size: 14px;
  }
  &__field {
    width: 100%;
    min-width: 0;
    color: $surface-900;
    font-size: 14px;
    font-weight: 500;

    &--center {
      text-align: center;
      font-size: 16px;
      font-weight: 500;
    }
    &--disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    &[placeholder] {
      color: $surface-900;
    }

    &::placeholder {
      color: $surface-400;
      font-weight: 500;
    }
  }

  &__clear {
    width: 24px;
    height: 24px;
    flex: 0 0 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: rgba($surface-300, 0.18);
    transition:
      background-color 0.2s ease,
      transform 0.2s ease;

    &:hover {
      transform: scale(1.04);
      background: rgba($red-500, 0.08);
    }
  }
}
</style>
