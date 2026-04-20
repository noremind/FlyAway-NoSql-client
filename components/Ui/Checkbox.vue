<template>
  <div v-for="option in normalizedOptions" :key="option.value">
    <label
      class="checkbox-container"
      :class="{ 'checkbox-container--checkmark': type === 'checkmark' }"
    >
      <input
        type="radio"
        :value="option.value"
        v-model="model"
      />
      <span class="custom-checkbox"></span>
      {{ option.label }}
    </label>
  </div>
</template>

<script setup>
const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  label: String,
  options: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: Object,
    default: () => {},
  },
  type: {
    type: String,
    default: "circle",
  },
});

const normalizedOptions = computed(() => {
  if (Array.isArray(props.options) && props.options.length) {
    return props.options;
  }

  if (props.label) {
    return [{ label: props.label, value: props.label }];
  }

  return [];
});

const resolveModelValue = (value) => {
  if (value && typeof value === "object" && "value" in value) {
    return value.value;
  }

  return value;
};

const model = computed({
  get: () => resolveModelValue(props.modelValue),
  set: (value) => {
    const option = normalizedOptions.value.find((item) => item.value === value);
    emit("update:modelValue", option || value);
  },
});
</script>

<style lang="scss" scoped>
.checkbox-container {
  display: flex;
  align-items: center;
  font-size: 16px;
  cursor: pointer;
}

.checkbox-container input {
  display: none;
}

.custom-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid $red-500;
  border-radius: 50%;
  margin-right: 8px;
  position: relative;
  background-color: $white;
  transition: all 0.3s ease;
}

.checkbox-container input:checked + .custom-checkbox::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: $red-500;
}

.checkbox-container--checkmark input:checked + .custom-checkbox::after {
  content: "";
  background: url("@/assets/icons/checkmark.svg") no-repeat center/contain;
  position: absolute;
  transform: rotate(10deg);
  top: -0.5px;
  left: -0.5px;
  width: 17px;
  height: 17px;
  border-radius: 50%;
  background-color: $red-500;
}
</style>
