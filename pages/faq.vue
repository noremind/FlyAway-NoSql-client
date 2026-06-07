<template>
  <section class="faq-page">
    <div class="faq-page__hero">
      <!-- <p class="faq-page__eyebrow">FlyAway help center</p> -->
      <h1 class="faq-page__title">FAQ</h1>
      <!-- <p class="faq-page__description">
        Здесь собраны ответы на основные вопросы о турах, отелях, оплате,
        бонусах, партнерах и работе сервиса.
      </p> -->
    </div>

    <div class="faq-page__layout">
      <aside class="faq-page__side">
        <button
          v-for="category in categories"
          :key="category"
          type="button"
          class="faq-page__category"
          :class="{
            'faq-page__category--active': selectedCategory === category,
          }"
          @click="selectedCategory = category"
        >
          {{ category }}
        </button>
      </aside>

      <div class="faq-page__content">
        <div v-if="isLoading" class="faq-page__state">Загружаем вопросы...</div>
        <div v-else-if="!filteredItems.length" class="faq-page__state">
          Вопросы пока не добавлены.
        </div>

        <article
          v-for="item in filteredItems"
          :key="item._id"
          class="faq-page__item"
          :class="{ 'faq-page__item--open': activeId === item._id }"
        >
          <button
            class="faq-page__question"
            type="button"
            @click="toggleFaq(item._id)"
          >
            <span>{{ item.question }}</span>
            <UiIcons
              icon="chevron"
              size="size-18"
              color="red-500"
              :deg="activeId === item._id ? 'top' : 'right'"
            />
          </button>
          <p v-if="activeId === item._id" class="faq-page__answer">
            {{ item.answer }}
          </p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
useSeo({
  title: "FAQ",
  description: "Часто задаваемые вопросы сервиса FlyAway.",
});

const items = ref([]);
const isLoading = ref(true);
const selectedCategory = ref("Все");
const activeId = ref("");

const categories = computed(() => {
  const list = [
    ...new Set(items.value.map((item) => item.category || "Общее")),
  ];
  return ["Все", ...list];
});

const filteredItems = computed(() => {
  if (selectedCategory.value === "Все") return items.value;
  return items.value.filter(
    (item) => (item.category || "Общее") === selectedCategory.value,
  );
});

const toggleFaq = (id) => {
  activeId.value = activeId.value === id ? "" : id;
};

useFetchSsr({
  url: "/faq",
  method: "get",
})
  .then((res) => {
    items.value = Array.isArray(res?.data) ? res.data : [];
    activeId.value = items.value[0]?._id || "";
  })
  .finally(() => {
    isLoading.value = false;
  });
</script>

<style lang="scss" scoped>
.faq-page {
  margin: 56px 0 72px;
  color: $surface-900;

  &__hero {
    padding: 42px;
    border-radius: 30px;
  }

  &__eyebrow {
    color: $red-500;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  &__title {
    font-size: 44px;
    font-weight: 900;
    line-height: 1;
  }

  &__description {
    max-width: 760px;
    margin-top: 14px;
    color: $surface-500;
    font-size: 17px;
    line-height: 1.65;
  }

  &__layout {
    display: grid;
    grid-template-columns: 260px minmax(0, 1fr);
    gap: 24px;
    margin-top: 28px;
    align-items: start;
  }

  &__side,
  &__content {
    background: $white;
    border-radius: 24px;
    box-shadow: 0 14px 34px rgba(32, 36, 38, 0.06);
    border: 1px solid rgba($red-500, 0.06);
  }

  &__side {
    position: sticky;
    top: 25px;
    display: grid;
    gap: 8px;
    padding: 14px;
  }

  &__category {
    min-height: 46px;
    padding: 0 16px;
    border-radius: 14px;
    color: $surface-600;
    text-align: left;
    font-weight: 700;
    transition: 0.2s ease;

    &--active,
    &:hover {
      color: $red-500;
      background: rgba($red-500, 0.07);
    }
  }

  &__content {
    display: grid;
    gap: 12px;
    padding: 18px;
  }

  &__item {
    border: 1px solid rgba($surface-300, 0.55);
    border-radius: 18px;
    overflow: hidden;
    transition: 0.2s ease;

    &--open {
      border-color: rgba($red-500, 0.32);
      box-shadow: 0 10px 26px rgba($red-500, 0.07);
    }
  }

  &__question {
    width: 100%;
    min-height: 68px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    color: $surface-900;
    font-size: 17px;
    font-weight: 850;
    text-align: left;
  }

  &__answer {
    padding: 0 20px 22px;
    color: $surface-500;
    font-size: 15px;
    line-height: 1.7;
  }

  &__state {
    padding: 42px;
    color: $surface-500;
    text-align: center;
  }
}

@media (max-width: 820px) {
  .faq-page {
    &__layout {
      grid-template-columns: 1fr;
    }

    &__side {
      position: static;
      display: flex;
      overflow-x: auto;
    }

    &__category {
      white-space: nowrap;
    }
  }
}

@media (max-width: 560px) {
  .faq-page {
    margin: 24px 0 48px;

    &__hero {
      padding: 26px;
    }

    &__title {
      font-size: 34px;
    }
  }
}
</style>
