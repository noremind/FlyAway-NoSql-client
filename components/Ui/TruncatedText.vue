<script setup>
const { t } = useI18n();

const props = defineProps({
  description: { type: String, required: true },
  isOpen: { type: Boolean, default: false },
  limit: { type: Number, default: 200 },
});

const emit = defineEmits(["toggle"]);

const fullHtml = ref("");
const truncatedHtml = ref("");
const localOpen = ref(props.isOpen);
const wasTruncated = ref(false);

function updateContent(html, limit) {
  const { html: nextHtml, truncated } = truncateHtml(html, limit);

  fullHtml.value = html || "";
  truncatedHtml.value = nextHtml;
  wasTruncated.value = truncated;
}

onMounted(() => {
  updateContent(props.description, props.limit);
});

watch(
  () => props.isOpen,
  (val) => {
    localOpen.value = val;
  },
);

watch(
  () => props.description,
  (newVal) => {
    updateContent(newVal, props.limit);
  },
  { immediate: true },
);

watch(
  () => props.limit,
  (newVal) => {
    updateContent(props.description, newVal);
  },
);

function truncateHtml(html, limit) {
  if (!process.client) {
    return { html: html || "", truncated: false };
  }

  const div = document.createElement("div");
  div.innerHTML = html || "";

  let result = "";
  let length = 0;
  let truncated = false;

  function traverse(node) {
    if (length >= limit) {
      truncated = true;
      return;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      if (length + text.length <= limit) {
        result += text;
        length += text.length;
      } else {
        result += text.slice(0, limit - length) + "...";
        length = limit;
        truncated = true;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      result += `<${node.nodeName.toLowerCase()}${getAttrs(node)}>`;
      for (const child of node.childNodes) traverse(child);
      result += `</${node.nodeName.toLowerCase()}>`;
    }
  }

  function getAttrs(node) {
    return Array.from(node.attributes || [])
      .map((a) => ` ${a.name}="${a.value}"`)
      .join("");
  }

  for (const child of div.childNodes) traverse(child);

  return { html: result, truncated };
}

function onToggle() {
  localOpen.value = !localOpen.value;
  emit("toggle", localOpen.value);
}
</script>
<template>
  <div class="trunc">
    <div class="trunc__body" :class="{ 'trunc__body--open': localOpen }">
      <client-only>
        <div
          v-if="localOpen"
          v-html="fullHtml"
          class="trunc__content trunc__content--full"
        ></div>

        <div
          v-else
          v-html="truncatedHtml"
          class="trunc__content trunc__content--short"
        ></div>
      </client-only>
    </div>

    <button
      v-if="wasTruncated"
      class="trunc__more"
      type="button"
      @click.stop="onToggle"
    >
      {{ localOpen ? t("Скрыть") : t("Читать дальше") }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.trunc {
}
.trunc {
  &__wrapper {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  &__more {
    margin-top: 0;
    padding: 0;
    background: none;
    border: none;
    cursor: pointer;
    color: $blue-500;
    line-height: 1.2;
  }

  &__short {
    margin: 0;
  }
}

.trunc__body {
  min-height: 0;
  overflow: hidden;
}

.trunc__body--open {
  overflow-y: auto;
  padding-right: 4px;
}

.trunc__content {
  line-height: 1.45;
  color: inherit;
  word-break: break-word;
}

.trunc__content--short {
  overflow: hidden;
}

.trunc__more {
  margin-top: 5px;
  background: none;
  border: none;
  cursor: pointer;
  color: $surface-400;
  text-decoration: underline;
  justify-self: start;
}

.trunc__body--open {
  max-height: 120px;
  overflow-y: auto;
  padding-right: 6px;

  scrollbar-width: thin;
  scrollbar-color: $red-500 transparent;
}

.trunc__body--open::-webkit-scrollbar {
  width: 5px;
}

.trunc__body--open::-webkit-scrollbar-track {
  background: transparent;
}

.trunc__body--open::-webkit-scrollbar-thumb {
  background: $red-500;
  border-radius: 10px;
}
</style>
