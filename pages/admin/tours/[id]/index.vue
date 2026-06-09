<template>
  <section class="admin-editor-page">
    <TheAdminToursForm mode="edit" :tour-id="route.params.id" />
  </section>
</template>

<script setup>
definePageMeta({
  layout: "admin",
  middleware: "admin",
});

const route = useRoute();

useSeo({
  title: "Редактировать тур",
  description: "Редактирование тура в админ-панели FlyAway.",
});
</script>

<style lang="scss" scoped>
.admin-editor-page {
  display: flex;
  flex-direction: column;
  gap: 18px;

  &__hero {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-end;
    padding: 22px 24px;
    border-radius: 22px;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba($red-500, 0.08);
    box-shadow: 0 12px 28px rgba(32, 36, 38, 0.04);
  }

  &__eyebrow {
    color: $red-500;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  &__title {
    color: $surface-900;
    font-size: 28px;
    font-weight: 800;
    line-height: 1.05;
  }

  &__text {
    margin-top: 8px;
    max-width: 760px;
    color: $surface-500;
    font-size: 14px;
    line-height: 1.5;
  }

  &__back {
    min-height: 42px;
    padding: 0 16px;
    border-radius: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: $red-500;
    background: rgba($red-500, 0.06);
    border: 1px solid rgba($red-500, 0.14);
    font-weight: 700;
    white-space: nowrap;
  }
}

@media (max-width: 700px) {
  .admin-editor-page {
    &__hero {
      flex-direction: column;
      align-items: stretch;
      padding: 18px;
    }

    &__title {
      font-size: 24px;
    }

    &__back {
      width: 100%;
    }
  }
}
</style>
