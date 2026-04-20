<template>
  <header class="admin-header">
    <div class="admin-header__lead">
      <button
        class="admin-header__menu"
        type="button"
        aria-label="Открыть меню"
        @click="toggleNav"
      >
        <UiIcons icon="burger-menu" size="size-20" color="red-500" />
      </button>

      <div class="admin-header__page">
        <!-- <p class="admin-header__eyebrow">{{ currentPage.eyebrow }}</p> -->
        <h1 class="admin-header__title">{{ currentPage.title }}</h1>
        <p class="admin-header__description">{{ currentPage.description }}</p>
      </div>
    </div>

    <div class="admin-header__actions">
      <NuxtLink class="admin-header__site-link" to="/"> Открыть сайт </NuxtLink>

      <div class="admin-header__profile" ref="profileRef">
        <button
          class="admin-header__user"
          type="button"
          @click="toggleDropdown"
        >
          <img
            v-if="userAvatar"
            class="admin-header__avatar"
            :src="userAvatar"
            :alt="userName"
          />
          <span v-else class="admin-header__avatar admin-header__avatar--empty">
            {{ userInitial }}
          </span>

          <span class="admin-header__meta">
            <span class="admin-header__role">{{ userRoleLabel }}</span>
            <span class="admin-header__name">{{ userName }}</span>
          </span>

          <UiIcons
            class="admin-header__chevron"
            icon="chevron"
            size="size-14"
            color="surface-400"
            :deg="isDropdownOpen ? 'top' : 'right'"
          />
        </button>

        <div v-if="isDropdownOpen" class="admin-header__dropdown">
          <NuxtLink
            class="admin-header__dropdown-link"
            to="/admin/profile"
            @click="closeDropdown"
          >
            <UiIcons icon="profile-user" size="size-17-5" color="red-500" />
            Профиль
          </NuxtLink>
          <button
            class="admin-header__dropdown-link"
            type="button"
            @click="logout"
          >
            <UiIcons icon="login" size="size-17-5" color="red-500" />
            Выйти
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
const userStore = useAuthStore();
const route = useRoute();
const isNavOpen = useState("admin-nav-open", () => false);
const user = computed(() => userStore.getUser);
const isDropdownOpen = ref(false);
const profileRef = ref(null);

const sessionPartner = computed(() => user.value?.partner || null);
const userName = computed(() => {
  if (user.value?.role === "partner") {
    return sessionPartner.value?.title || user.value?.name || "Партнер";
  }

  return user.value?.name || "Администратор";
});
const userAvatar = computed(() => {
  if (user.value?.role === "partner") {
    return (
      sessionPartner.value?.logo ||
      sessionPartner.value?.avatar ||
      user.value?.avatar ||
      null
    );
  }

  return user.value?.avatar || null;
});
const userInitial = computed(() => userName.value.charAt(0).toUpperCase());
const userRoleLabel = computed(() =>
  user.value?.role === "partner" ? "Партнер" : "Администратор",
);

const pageDefinitions = [
  {
    match: /^\/admin$/,
    eyebrow: "Рабочий стол",
    title: "Обзор",
    description:
      "Здесь собраны ключевые разделы панели: следите за количеством пользователей, партнеров, туров и отелей, а затем быстро переходите к нужному действию.",
  },
  {
    match: /^\/admin\/profile$/,
    eyebrow: "Аккаунт",
    title: "Профиль",
    description:
      "Редактируйте личные данные, контактную информацию и настройки кабинета, которые используются в работе администрации или партнера.",
  },
  {
    match: /^\/admin\/tours\/create$/,
    eyebrow: "Каталог туров",
    title: "Создание тура",
    description:
      "Заполните карточку тура по шагам: основная информация, маршрут, материалы для туристов, контакты и итоговое превью перед сохранением.",
  },
  {
    match: /^\/admin\/tours\/[^/]+$/,
    eyebrow: "Каталог туров",
    title: "Редактирование тура",
    description:
      "Обновляйте уже созданный тур: меняйте описание, программу, изображения, билеты и все данные, которые видят пользователи на витрине.",
  },
  {
    match: /^\/admin\/tours$/,
    eyebrow: "Каталог туров",
    title: "Туры",
    description:
      "Управляйте списком туров, проверяйте наполнение карточек и быстро переходите к созданию или редактированию нужного предложения.",
  },
  {
    match: /^\/admin\/hotels\/create$/,
    eyebrow: "Каталог отелей",
    title: "Создание отеля",
    description:
      "Добавьте новый объект размещения, загрузите фото, заполните основные параметры и подготовьте карточку отеля к публикации.",
  },
  {
    match: /^\/admin\/hotels$/,
    eyebrow: "Каталог отелей",
    title: "Отели",
    description:
      "Просматривайте и редактируйте объекты размещения, следите за их наполнением и управляйте каталогом отелей в одном месте.",
  },
  {
    match: /^\/admin\/users$/,
    eyebrow: "Пользователи",
    title: "Пользователи",
    description:
      "Контролируйте список пользователей, их роли и доступы, чтобы админская и партнерская части работали корректно.",
  },
  {
    match: /^\/admin\/partners$/,
    eyebrow: "Партнеры",
    title: "Партнеры",
    description:
      "Управляйте компаниями-партнерами, их профилями и доступом к кабинетам, из которых создаются туры и отели.",
  },
  {
    match: /^\/admin\/banners$/,
    eyebrow: "Контент сайта",
    title: "Баннеры",
    description:
      "Настраивайте промо-блоки, акценты и ссылки на главных экранах сайта, чтобы управлять подачей контента для пользователей.",
  },
  {
    match: /^\/admin\/faq$/,
    eyebrow: "Контент сайта",
    title: "FAQ",
    description:
      "Наполняйте раздел часто задаваемых вопросов, чтобы пользователи быстрее находили ответы без обращения в поддержку.",
  },
  {
    match: /^\/admin\/contacts$/,
    eyebrow: "Контент сайта",
    title: "Контакты",
    description:
      "Редактируйте контакты компании и партнеров, которые отображаются пользователям на сайте и в карточках.",
  },
];

const currentPage = computed(() => {
  return (
    pageDefinitions.find((item) => item.match.test(route.path)) || {
      eyebrow: "Панель управления",
      title: "Админ-панель",
      description:
        "Управляйте каталогом, контентом сайта, партнерами и настройками проекта из единого рабочего пространства.",
    }
  );
});

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const toggleNav = () => {
  isNavOpen.value = !isNavOpen.value;
};

const closeDropdown = () => {
  isDropdownOpen.value = false;
};

const logout = () => {
  closeDropdown();
  userStore.logoutUser("/");
};

const onDocumentClick = (event) => {
  if (!profileRef.value?.contains(event.target)) {
    closeDropdown();
  }
};

onMounted(() => {
  document.addEventListener("click", onDocumentClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocumentClick);
});
</script>

<style lang="scss" scoped>
.admin-header {
  min-height: 108px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  border-radius: 28px;
  padding: 20px clamp(18px, 2.2vw, 28px) 18px;
  background: rgba(255, 252, 250, 0.72);
  border-bottom: 1px solid rgba($red-500, 0.08);
  backdrop-filter: blur(16px);

  &__lead,
  &__actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__lead {
    min-width: 0;
    flex: 1;
  }

  &__menu {
    display: none;
    width: 42px;
    height: 42px;
    align-items: center;
    justify-content: center;
    background: rgba($red-500, 0.08);
    border: 1px solid rgba($red-500, 0.12);
    border-radius: 8px;
  }

  &__page {
    min-width: 0;
    display: grid;
    gap: 4px;
  }

  &__eyebrow {
    color: $red-500;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  &__title {
    color: $surface-900;
    font-size: 28px;
    font-weight: 800;
    line-height: 1.05;
  }

  &__description {
    max-width: 760px;
    color: $surface-500;
    font-size: 14px;
    line-height: 1.45;
  }

  &__site-link {
    min-height: 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 14px;
    color: $surface-900;
    background: rgba(255, 255, 255, 0.75);
    border: 1px solid rgba($red-500, 0.08);
    border-radius: 999px;
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
    transition:
      border-color 0.2s ease,
      background-color 0.2s ease;

    &:hover {
      border-color: rgba($red-500, 0.18);
      background: rgba(255, 255, 255, 0.95);
    }
  }

  &__profile {
    position: relative;
  }

  &__user {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 248px;
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.88);
    border: 1px solid rgba($red-500, 0.12);
    border-radius: 20px;
    box-shadow: 0 14px 30px rgba(32, 36, 38, 0.06);
    transition:
      border-color 0.2s ease,
      background-color 0.2s ease,
      transform 0.2s ease;

    &:hover {
      border-color: $red-500;
      background: $white;
      transform: translateY(-1px);
    }
  }

  &__avatar {
    width: 42px;
    height: 42px;
    flex: 0 0 42px;
    border-radius: 50%;
    object-fit: cover;

    &--empty {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: $white;
      background: $red-500;
      font-weight: 700;
    }
  }

  &__meta {
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 3px;
    flex: 1;
  }

  &__role {
    display: inline-flex;
    align-items: center;
    min-height: 22px;
    padding: 0 8px;
    color: $red-500;
    background: rgba($red-500, 0.08);
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  &__name {
    max-width: 156px;
    overflow: hidden;
    color: $surface-900;
    font-size: 14px;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__chevron {
    transition: transform 0.2s ease;
  }

  &__dropdown {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    z-index: 20;
    width: 220px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px;
    background: $white;
    border: 1px solid rgba($red-500, 0.12);
    border-radius: 8px;
    box-shadow: 0 14px 34px rgba(32, 36, 38, 0.12);
    animation: dropdownAppear 0.18s ease;
  }

  &__dropdown-link {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 12px;
    color: $surface-900;
    border-radius: 8px;
    font-size: 14px;
    transition:
      color 0.2s ease,
      background-color 0.2s ease;

    &:hover {
      color: $red-500;
      background: rgba($red-500, 0.06);
    }
  }
}

@keyframes dropdownAppear {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 700px) {
  .admin-header {
    align-items: stretch;
    flex-direction: column;
    padding: 14px 12px;

    &__lead,
    &__actions {
      width: 100%;
    }

    &__lead {
      align-items: flex-start;
    }

    &__actions {
      flex-wrap: wrap;
    }

    &__menu {
      display: inline-flex;
    }

    &__title {
      font-size: 24px;
    }

    &__site-link,
    &__user {
      width: 100%;
    }

    &__dropdown {
      left: 0;
      right: auto;
      width: 100%;
    }
  }
}

@media (min-width: 701px) and (max-width: 1024px) {
  .admin-header {
    &__menu {
      display: inline-flex;
    }
  }
}
</style>
