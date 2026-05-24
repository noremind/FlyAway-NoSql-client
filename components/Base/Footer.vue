<template>
  <footer class="footer" id="contacts">
    <div class="footer__wrapper">
      <nuxt-link to="/">
        <img
          class="footer__logo"
          src="@/assets/image/logo/FlyAway-logo.png"
          alt="FlyAway"
        />
      </nuxt-link>

      <div class="footer__box">
        <ul
          class="footer__list"
          v-for="section in footerList"
          :key="section.id"
        >
          <li
            v-for="list in section.list"
            :key="list.name"
            class="footer__list-item"
          >
            <nuxt-link class="footer__link" :to="list.link">
              <UiIcons
                size="size-24"
                v-if="list.icon"
                :icon="list.icon"
              ></UiIcons>
              <p class="footer__list-text">{{ list.name }}</p>
            </nuxt-link>
          </li>
        </ul>
      </div>
    </div>
  </footer>
</template>

<script setup>
const footerList = reactive([
  {
    id: 1,
    list: [
      { name: "О нас", icon: "", link: "/#about" },
      { name: "FAQ", icon: "", link: "/#faq" },
      { name: "Контакты", icon: "", link: "/#contacts" },
    ],
  },
  {
    id: 2,
    list: [
      { name: "Партнеры", icon: "", link: "/partners" },
      { name: "Туры", icon: "", link: "/tours" },
      { name: "Отели", icon: "", link: "/hotels" },
      { name: "Горячие туры", icon: "", link: "/#hot-tours" },
    ],
  },
  {
    id: 3,
    list: [
      { name: "@FlyAway.kz", icon: "instagram", link: "/#contacts" },
      { name: "FlyAway@gmail.com", icon: "email", link: "/#contacts" },
      { name: "@FlyAway.kz", icon: "tiktok", link: "/#contacts" },
    ],
  },
  {
    id: 4,
    list: [
      { name: "г. Алматы, ул. Такая, офис 67", icon: "location", link: "/#contacts" },
      { name: "+7 777 (777) 77 77", icon: "phone", link: "/#contacts" },
    ],
  },
]);
</script>

<style lang="scss" scoped>
.footer {
  background-color: $surface-900;
  scroll-margin-top: 120px;
  &__wrapper {
    max-width: 1240px;
    width: 100%;
    margin: 0 auto;
    padding: 40px 24px 100px 24px;
  }
  &__box {
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }
  &__logo {
    width: 64px;
    margin: 46px 0;
    cursor: pointer;
  }
  &__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  &__list-item {
    color: $white;
  }
  &__link {
    display: flex;
    gap: 4px;
    align-items: center;
    margin-top: 12px;
    color: inherit;
  }
}

@media (max-width: 768px) {
  .footer {
    &__wrapper {
      padding: 16px 24px 40px 24px;
    }
    &__box {
      flex-wrap: wrap;
    }
    &__list-item {
      margin-top: 12px;
    }
  }
}
</style>