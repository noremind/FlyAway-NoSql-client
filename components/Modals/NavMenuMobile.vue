<template>
  <div class="menu">
    <div class="menu__wrapper">
      <div class="menu__avatar">
        <button v-if="!user?.avatar" class="menu__avatar-default" type="button">
          <UiIcons icon="profile-user" color="red-500" size="size-32"></UiIcons>
        </button>
        <img
          v-else
          class="menu__avatar-user"
          :src="user?.avatar"
          alt="Avatar"
        />
        <p class="menu__avatar-name">{{ user?.name }}</p>
      </div>

      <div class="menu__auth" v-if="!userStore.isLoggedIn">
        <UiButton
          label="Войти"
          before-icon="login"
          icon-color="red-500"
          @click="openAuthLoginModal"
          class="menu__auth-login"
        ></UiButton>
        <UiButton
          background-color="red-500"
          label="Зарегестрироваться"
          @click="openAuthRegisterModal"
          class="menu__auth-register button-primary"
        ></UiButton>
      </div>

      <ul class="menu__list">
        <li
          v-for="list in navList"
          :key="list.id"
          :class="{ 'menu__list-item--active': isActiveLink(list.link) }"
          class="menu__list-item"
        >
          <nuxt-link :to="list.link" class="menu__list-link">{{
            list.name
          }}</nuxt-link>
        </li>
      </ul>

      <ul class="menu__list" v-if="userStore.isLoggedIn">
        <li class="menu__item" v-for="(list, index) in lists" :key="index">
          <nuxt-link
            :to="list.link"
            class="menu__link"
            :class="{ 'menu__link--active': list.link === route.path }"
          >
            <UiIcons size="size-20" color="red-500" :icon="list.icon"></UiIcons>
            <p class="menu__text">{{ list.name }}</p>
          </nuxt-link>
        </li>
      </ul>

      <div class="menu__footer" v-if="userStore.isLoggedIn">
        <UiButton
          class="menu__leave-btn"
          label="Выйти"
          before-icon="login"
          icon-color="orange-200"
          @click="userStore.logoutUser"
        ></UiButton>
      </div>
    </div>
  </div>
  <UiModal
    :is-show="isOpenLeaveModal"
    max-width="327px"
    @close="closeLeaveModal"
  >
    <ModalsLeave></ModalsLeave>
  </UiModal>
</template>

<script setup>
const route = useRoute();
const userStore = useAuthStore();
const user = computed(() => userStore.getUser);
const isOpenLeaveModal = ref(false);
const emit = defineEmits(["close"]);
const navList = ref([
  { id: 1, name: "Туры", link: "/tours" },
  { id: 2, name: "Отели", link: "/hotels" },
  { id: 3, name: "Партнеры", link: "/partners" },
  { id: 4, name: "Горячие туры", link: "/#hot-tours" },
  { id: 5, name: "FAQ", link: "/faq" },
  { id: 6, name: "Контакты", link: "/#contacts" },
]);
const lists = [
  {
    icon: "profile-user",
    name: "Мой профиль",
    link: "/profile",
  },
  {
    icon: "heart",
    name: "Избранные",
    link: "/profile/favourites",
  },
  {
    icon: "map",
    name: "Туры",
    link: "/profile/my-tours",
  },
  {
    icon: "home",
    name: "Отели",
    link: "/profile/my-hotels",
  },
  {
    icon: "tablet-blog",
    name: "Мои покупки и брони",
    link: "/",
  },
  {
    icon: "wallet",
    name: "Кошелок и бонусы",
    link: "/profile/transactions",
  },
];

const isActiveLink = (link) => {
  if (link.includes("#")) return route.fullPath === link;
  return route.path === link;
};

const openLeaveModal = () => {
  isOpenLeaveModal.value = true;
};

const closeLeaveModal = () => {
  isOpenLeaveModal.value = false;
};

const openAuthRegisterModal = () => {
  emit("close");
  userStore.isOpenRegisteredModal = true;
};

const openAuthLoginModal = () => {
  emit("close");
  userStore.isOpenLoginModal = true;
};
</script>

<style lang="scss" scoped>
.menu {
  &__wrapper {
    display: flex;
    flex-direction: column;
    gap: 12px;
    color: $surface-900;
    position: relative;
    // height: 85vh;
  }
  &__avatar {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    &-name {
      font-weight: 500;
      margin-top: 12px;
      font-size: 18px;
    }
    &-img {
      width: 94px;
      height: 94px;
      border-radius: 50%;
      object-fit: cover;
    }
    &-user,
    &-default {
      width: 94px;
      object-fit: cover;
      height: 94px;
      border-radius: 50%;
      // background-color: $surface-150;
    }
  }
  &__auth {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    &-login {
      background-color: $surface-150;
      font-weight: 100;
    }
  }
  &__list {
    display: flex;
    flex-direction: column;
  }
  &__list {
    margin-top: 20px;
    display: flex;
    gap: 20px;
    align-items: center;
    flex-wrap: wrap;
    &-link {
      color: inherit;
      transition: color 0.2s ease;
    }
    &-item {
      font-size: 14px;
      font-weight: 500;
      white-space: nowrap;
      &--active,
      &:hover {
        color: $red-500;
      }
    }
  }
  &__link {
    font-weight: 400;
    color: $surface-900;
    align-items: center;
    font-size: 14px;
    line-height: 17.5px;
    flex-shrink: 0;
  }
  &__link {
    display: flex;
    align-items: center;
    color: $surface-900;
    cursor: pointer;
    gap: 12px;
    padding: 18px 16px;
    &--active {
      background-color: $blue-200;
      font-weight: 400;
    }
  }
  &__footer {
    display: flex;
    justify-content: space-between;
    width: 100%;
    // position: absolute;
    bottom: 0;
    // left: 50%;
    margin: 0 auto;
    text-align: center;
    padding: 0 12px;
  }
  &__leave-btn {
    width: 92px;
    color: $orange-200;
    font-weight: 100;
    background-color: transparent;
    border: 1px solid $orange-200;
    margin: 0 auto;
    margin-bottom: 20px;
  }
}
</style>
