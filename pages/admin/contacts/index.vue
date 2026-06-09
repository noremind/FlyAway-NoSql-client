<template>
  <section class="admin-contacts-page">
    <div class="admin-contacts-page__stats">
      <article class="admin-contacts-page__stat">
        <p class="admin-contacts-page__stat-value">3</p>
        <p class="admin-contacts-page__stat-label">Основных полей</p>
      </article>
      <article class="admin-contacts-page__stat">
        <p class="admin-contacts-page__stat-value">1</p>
        <p class="admin-contacts-page__stat-label">Карта / геоблок</p>
      </article>
    </div>

    <form class="admin-contacts">
      <div class="admin-contacts__card">
        <UiInput label="Email" placeholder="info@flyaway.kz" />
        <UiInput label="Телефон" placeholder="+7 700 000 00 00" />
        <UiInput label="Адрес" placeholder="Алматы" />
      </div>

      <div class="admin-contacts__map-card">
        <div class="admin-contacts__map-head">
          <h3>Карта и координаты</h3>
          <p>Здесь позже можно подключить Yandex Map и координаты офиса.</p>
        </div>

        <div class="admin-contacts__map">Yandex Map</div>
      </div>
    </form>
  </section>
</template>

<script setup>
definePageMeta({
  layout: "admin",
  middleware: "admin",
});

useSeo({
  title: "Контакты",
  description: "Контакты в админ-панели FlyAway.",
});
</script>

<style lang="scss" scoped>
.admin-contacts-page {
  display: flex;
  flex-direction: column;
  gap: 18px;

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
}

.admin-contacts {
  display: grid;
  grid-template-columns: 360px minmax(0, 1fr);
  gap: 20px;

  &__card,
  &__map-card {
    display: grid;
    gap: 16px;
    padding: 22px;
    background: rgba(255, 255, 255, 0.94);
    border: 1px solid rgba($red-500, 0.1);
    border-radius: 16px;
    box-shadow: 0 18px 42px rgba(32, 36, 38, 0.06);
  }

  &__map-head {
    display: grid;
    gap: 6px;

    h3 {
      color: $surface-900;
      font-size: 18px;
      font-weight: 700;
    }

    p {
      color: $surface-500;
      font-size: 13px;
      line-height: 1.45;
    }
  }

  &__map {
    min-height: 340px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $red-500;
    background: $surface-150;
    border: 1px dashed $surface-300;
    border-radius: 14px;
    font-weight: 700;
  }
}

@media (max-width: 900px) {
  .admin-contacts {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .admin-contacts-page {
    &__stats {
      grid-template-columns: 1fr;
    }
  }
}
</style>
