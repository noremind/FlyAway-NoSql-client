<template>
  <div class="clamp-text">
    <div class="clamp-text__text-wrap">
      <p
        class="clamp-text__content"
        :class="{ 'clamp-text__content--expanded': isExpanded }"
      >
        {{ normalizedText }}
      </p>
    </div>

    <button
      v-if="canToggle"
      type="button"
      class="clamp-text__toggle"
      @mousedown.prevent
      @click.stop="toggleExpanded"
    >
      {{ isExpanded ? hideLabel : moreLabel }}
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  text: {
    type: String,
    default: "",
  },
  limit: {
    type: Number,
    default: 140,
  },
  moreLabel: {
    type: String,
    default: "Читать дальше",
  },
  hideLabel: {
    type: String,
    default: "Скрыть",
  },
});

const isExpanded = ref(false);

const normalizedText = computed(() => String(props.text || "").trim());
const canToggle = computed(() => normalizedText.value.length > props.limit);

const toggleExpanded = (event) => {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  isExpanded.value = !isExpanded.value;
};
</script>

<style scoped lang="scss">
.clamp-text {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 92px;
}

.clamp-text__text-wrap {
  height: 60px; // фикс высоты под 3 строки
  overflow: hidden;
}

.clamp-text__content {
  margin: 0;
  color: inherit;
  line-height: 1.45;
  white-space: pre-line;
  overflow: hidden;

  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.clamp-text__content--expanded {
  display: block;
  max-height: 60px; // не даем карточке расти
  overflow-y: auto;
}

.clamp-text__toggle {
  display: inline-flex;
  align-self: flex-start;
  color: $blue-500;
  font-size: 13px;
  font-weight: 600;
}
</style>
