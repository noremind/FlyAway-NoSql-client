<template>
  <section class="admin-faq">
    <div class="admin-faq__stats">
      <article class="admin-faq__stat">
        <p class="admin-faq__stat-value">{{ items.length }}</p>
        <p class="admin-faq__stat-label">Разделов FAQ</p>
      </article>
      <article class="admin-faq__stat">
        <p class="admin-faq__stat-value">{{ totalHints }}</p>
        <p class="admin-faq__stat-label">Подсказок для команды</p>
      </article>
    </div>

    <div class="admin-faq__note">
      Сейчас этот раздел работает как контентная страница внутри админки. Для
      полноценного редактирования через интерфейс еще нужен backend CRUD.
    </div>

    <div class="admin-faq__content">
      <aside class="admin-faq__sidebar">
        <article
          v-for="item in items"
          :key="item.title"
          class="admin-faq__sidebar-card"
        >
          <strong>{{ item.title }}</strong>
          <p>{{ item.short }}</p>
        </article>
      </aside>

      <section class="admin-faq__main">
        <UiAccordion :items="accordionItems" />
      </section>
    </div>
  </section>
</template>

<script setup>
definePageMeta({
  layout: "admin",
  middleware: "admin",
});

useSeo({
  title: "FAQ",
  description: "Частые вопросы в админ-панели FlyAway.",
});

const items = [
  {
    title: "Бронирование",
    short: "Оплата, отмена, статусы и путь клиента после покупки.",
    text: "Покупка, оплата и отмена будут собраны здесь в одном компактном блоке. Здесь удобно хранить внутренние правила для менеджеров: как проверять бронирование, где смотреть статусы и что делать при отмене.",
  },
  {
    title: "Партнеры",
    short: "Правила доступа, публикации туров и обновления предложений.",
    text: "Здесь будут правила по доступам, публикации туров и редактированию предложений. Для команды это может стать короткой инструкцией: кто может создавать тур, кто утверждает публикацию и как проверять контент.",
  },
  {
    title: "Бонусы",
    short: "Начисления, списания и ограничения по использованию.",
    text: "После запуска бонусного потока сюда можно вынести правила начисления и списания. Раздел можно использовать как внутреннюю памятку по лимитам, способам оплаты и обработке спорных кейсов.",
  },
];

const accordionItems = computed(() =>
  items.map((item) => ({
    title: item.title,
    text: item.text,
  })),
);

const totalHints = computed(() => items.length * 3);
</script>

<style lang="scss" scoped>
.admin-faq {
  display: flex;
  flex-direction: column;
  gap: 18px;

  &__head {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-end;
  }

  &__title {
    color: $surface-900;
    font-size: 28px;
    font-weight: 700;
    line-height: 1.05;
  }

  &__text {
    margin-top: 6px;
    max-width: 760px;
    color: $surface-500;
    font-size: 14px;
    line-height: 1.45;
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  &__stat {
    padding: 18px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba($red-500, 0.08);
    box-shadow: 0 10px 26px rgba(32, 36, 38, 0.04);
  }

  &__stat-value {
    color: $red-500;
    font-size: 28px;
    font-weight: 800;
    line-height: 1;
  }

  &__stat-label {
    margin-top: 10px;
    color: $surface-500;
    font-size: 13px;
    line-height: 1.4;
  }

  &__note {
    padding: 16px 18px;
    border-radius: 16px;
    background: rgba($red-500, 0.05);
    color: $surface-500;
    line-height: 1.5;
  }

  &__content {
    display: grid;
    grid-template-columns: 300px minmax(0, 1fr);
    gap: 18px;
    align-items: start;
  }

  &__sidebar,
  &__main {
    padding: 18px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba($red-500, 0.08);
    box-shadow: 0 10px 26px rgba(32, 36, 38, 0.04);
  }

  &__sidebar {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__sidebar-card {
    padding: 14px;
    border-radius: 14px;
    background: rgba($red-500, 0.03);
    display: grid;
    gap: 6px;

    strong {
      color: $surface-900;
      font-size: 15px;
      font-weight: 700;
    }

    p {
      color: $surface-500;
      font-size: 13px;
      line-height: 1.45;
    }
  }
}

@media (max-width: 900px) {
  .admin-faq {
    &__content {
      grid-template-columns: 1fr;
    }
  }
}

@media (max-width: 700px) {
  .admin-faq {
    &__stats {
      grid-template-columns: 1fr;
    }
  }
}
</style>
