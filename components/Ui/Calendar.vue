<template>
  <div class="calendar">
    <label v-if="label" class="calendar__label" :for="inputId">{{
      label
    }}</label>
    <div class="calendar__control" :class="{ 'calendar__control--with-clear': showClear }">
      <Calendar
        class="calendar__field"
        :inputId="inputId"
        v-model="model"
        :showIcon="haveIcon"
        iconDisplay="input"
        :selectionMode="selectionMode || undefined"
        dateFormat="dd.mm.yy"
        :placeholder="placeholder"
        panelClass="calendar__panel"
      >
        <template #inputicon="{ clickCallback }">
          <button
            v-if="haveIcon"
            type="button"
            class="calendar__icon"
            @click="clickCallback"
            aria-label="Открыть календарь"
          >
            <i class="pi pi-calendar"></i>
          </button>
        </template>
      </Calendar>

      <button
        v-if="showClear"
        type="button"
        class="calendar__clear"
        aria-label="Сбросить дату"
        @click="clearValue"
      >
        <UiIcons icon="circle-close" size="size-16" color="surface-400" />
      </button>
    </div>
  </div>
</template>

<script setup>
import Calendar from "primevue/calendar";

const emit = defineEmits(["update:modelValue", "clear"]);

const props = defineProps({
  modelValue: {
    type: [Date, String, Array],
    default: () => null,
  },
  label: {
    type: String,
    default: "",
  },
  inputId: {
    type: String,
    default: "",
  },
  haveIcon: {
    type: Boolean,
    default: true,
  },
  selectionMode: {
    type: String,
    default: "",
  },
  placeholder: String,
  clearable: {
    type: Boolean,
    default: true,
  },
});

const model = computed({
  get: () => props.modelValue,
  set: (newVal) => emit("update:modelValue", newVal),
});

const instance = getCurrentInstance();
const inputId = computed(
  () => props.inputId || `ui-calendar-${instance?.uid || 0}`,
);

const showClear = computed(() => {
  if (!props.clearable) {
    return false;
  }

  if (Array.isArray(props.modelValue)) {
    return props.modelValue.length > 0;
  }

  return props.modelValue !== null && props.modelValue !== undefined && props.modelValue !== "";
});

const clearValue = () => {
  emit("update:modelValue", Array.isArray(props.modelValue) ? [] : null);
  emit("clear");
};
</script>

<style scoped lang="scss">
.calendar {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__label {
    color: $surface-900;
    font-weight: 500;
    font-size: 14px;
  }

  &__field {
    width: 100%;
    min-width: 0;
  }

  &__control {
    position: relative;

    &--with-clear {
      :deep(.p-inputtext) {
        padding-right: 76px !important;
      }
    }
  }

  &__icon {
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: $surface-600;
    background: transparent;
    border-radius: 8px;
    transition:
      color 0.2s ease,
      background-color 0.2s ease;

    &:hover {
      color: $red-500;
      background: rgba($red-500, 0.08);
    }

    i {
      font-size: 15px;
    }
  }

  :deep(.p-inputtext) {
    width: 100%;
    min-height: 46px;
    padding: 10px 14px;
    color: $surface-900;
    font-size: 14px;
    font-weight: 500;
    border: 1px solid $surface-300;
    border-radius: 26px;
    background: $white;
    box-shadow: 0 8px 20px rgba(32, 36, 38, 0.06);
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;

    &:focus {
      border-color: rgba($red-500, 0.55);
      box-shadow: 0 10px 24px rgba($red-500, 0.1);
    }

    &::placeholder {
      color: $surface-400;
      font-weight: 500;
    }
  }

  :deep(.p-datepicker-input-icon-container) {
    right: 12px;
    color: $surface-500;
  }

  :deep(.p-datepicker-input-icon) {
    display: none;
  }

  &__clear {
    position: absolute;
    top: 50%;
    right: 44px;
    transform: translateY(-50%);
    z-index: 3;
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
