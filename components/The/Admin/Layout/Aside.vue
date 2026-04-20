<template>
  <aside class="admin-aside" :class="{ 'admin-aside--open': isNavOpen }">
    <div class="admin-aside__panel">
      <div class="admin-aside__intro">
        <div class="admin-aside__top">
          <NuxtLink class="admin-aside__brand" to="/admin" @click="closeNav">
            <img
              class="admin-aside__logo"
              src="@/assets/image/logo/FlyAway-logo.png"
              alt="FlyAway"
            />
            <div class="admin-aside__brand-meta">
              <strong>FlyAway</strong>
            </div>
          </NuxtLink>

          <button
            class="admin-aside__close"
            type="button"
            aria-label="Закрыть меню"
            @click="closeNav"
          >
            <UiIcons icon="circle-close" size="size-20" color="surface-900" />
          </button>
        </div>

        <div class="admin-aside__intro-card">
          <p class="admin-aside__intro-title">
            {{
              user?.role === "partner"
                ? "Кабинет партнера"
                : "Панель управления"
            }}
          </p>
          <p class="admin-aside__intro-text">
            Быстрый доступ к созданию, управлению каталогом и настройкам сайта.
          </p>
        </div>
      </div>

      <nav class="admin-aside__nav">
        <section
          v-for="section in navSections"
          :key="section.id"
          class="admin-aside__section"
        >
          <button
            class="admin-aside__section-toggle"
            type="button"
            @click="toggleSection(section.id)"
          >
            <span>{{ section.title }}</span>
            <span class="admin-aside__section-count">{{
              section.items.length
            }}</span>
            <UiIcons
              icon="chevron"
              size="size-14"
              color="surface-400"
              :deg="isSectionOpen(section.id) ? 'top' : 'right'"
            />
          </button>

          <div v-if="isSectionOpen(section.id)" class="admin-aside__links">
            <NuxtLink
              v-for="item in section.items"
              :key="item.to"
              class="admin-aside__link"
              :to="item.to"
              @click="closeNav"
            >
              <span class="admin-aside__icon">
                <UiIcons :icon="item.icon" size="size-17-5" color="red-500" />
              </span>
              <span class="admin-aside__label">{{ item.label }}</span>
            </NuxtLink>
          </div>
        </section>
      </nav>
    </div>
  </aside>
</template>

<script setup>
const isNavOpen = useState("admin-nav-open", () => false);
const userStore = useAuthStore();
const user = computed(() => userStore.getUser);
const openSections = ref(["overview", "content", "catalog", "site"]);

const closeNav = () => {
  isNavOpen.value = false;
};

const navSections = computed(() => {
  if (user.value?.role === "partner") {
    return [
      {
        id: "overview",
        title: "Профиль",
        items: [
          { label: "Обзор", to: "/admin", icon: "home" },
          { label: "Профиль", to: "/admin/profile", icon: "profile-user" },
        ],
      },
      {
        id: "content",
        title: "Каталог",
        items: [
          { label: "Создать тур", to: "/admin/tours/create", icon: "plus" },
          { label: "Мои туры", to: "/admin/tours", icon: "hot" },
          { label: "Создать отель", to: "/admin/hotels/create", icon: "plus" },
          { label: "Мои отели", to: "/admin/hotels", icon: "home-hotel" },
          { label: "Промокоды", to: "/admin/promocodes", icon: "copy" },
        ],
      },
    ];
  }

  return [
    {
      id: "overview",
      title: "Профиль",
      items: [
        { label: "Обзор", to: "/admin", icon: "home" },
        { label: "Профиль", to: "/admin/profile", icon: "profile-user" },
      ],
    },
    {
      id: "content",
      title: "Создание",
      items: [
        { label: "Создать тур", to: "/admin/tours/create", icon: "plus" },
        { label: "Создать отель", to: "/admin/hotels/create", icon: "plus" },
      ],
    },
    {
      id: "catalog",
      title: "Управление",
      items: [
        { label: "Пользователи", to: "/admin/users", icon: "side-bar" },
        { label: "Партнеры", to: "/admin/partners", icon: "globe" },
        { label: "Туры", to: "/admin/tours", icon: "hot" },
        { label: "Отели", to: "/admin/hotels", icon: "home-hotel" },
        { label: "Промокоды", to: "/admin/promocodes", icon: "copy" },
        { label: "Бонусы", to: "/admin/bonuses", icon: "wallet" },
      ],
    },
    {
      id: "site",
      title: "Главная и сайт",
      items: [
        { label: "Баннеры", to: "/admin/banners", icon: "copy" },
        { label: "FAQ", to: "/admin/faq", icon: "smile" },
        { label: "Контакты", to: "/admin/contacts", icon: "phone" },
      ],
    },
  ];
});

const isSectionOpen = (sectionId) => openSections.value.includes(sectionId);

const toggleSection = (sectionId) => {
  openSections.value = isSectionOpen(sectionId)
    ? openSections.value.filter((item) => item !== sectionId)
    : [...openSections.value, sectionId];
};
</script>

<style lang="scss" scoped>
.admin-aside {
  min-height: 100%;

  &__panel {
    position: sticky;
    top: 14px;
    height: calc(100vh - 28px);
    margin: 14px 0 14px 14px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 18px 16px 16px;
    color: $surface-900;
    background:
      linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.96),
        rgba(255, 250, 248, 0.9)
      ),
      rgba(255, 255, 255, 0.9);
    border: 1px solid rgba($red-500, 0.08);
    border-radius: 28px;
    box-shadow:
      0 18px 42px rgba(32, 36, 38, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(12px);
  }

  &__intro {
    display: grid;
    gap: 14px;
  }

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: 12px;
    color: $surface-900;
  }

  &__logo {
    width: 42px;
    height: 42px;
    object-fit: contain;
  }

  &__brand-meta {
    display: grid;
    gap: 2px;

    strong {
      font-size: 20px;
      font-weight: 800;
      line-height: 1;
    }

    span {
      color: $surface-500;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
  }

  &__close {
    display: none;
    width: 34px;
    height: 34px;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: rgba($red-500, 0.08);
  }

  &__intro-card {
    display: grid;
    gap: 8px;
    padding: 16px;
    background:
      linear-gradient(135deg, rgba($red-500, 0.12), rgba($orange-200, 0.04)),
      #fff;
    border: 1px solid rgba($red-500, 0.08);
    border-radius: 22px;
  }

  &__eyebrow {
    color: $red-500;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  &__intro-title {
    color: $surface-900;
    font-size: 18px;
    font-weight: 800;
    line-height: 1.15;
  }

  &__intro-text {
    color: $surface-500;
    font-size: 13px;
    line-height: 1.5;
  }

  &__nav {
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow-y: auto;
    min-height: 0;
    padding-right: 4px;
  }

  &__section {
    display: grid;
    gap: 10px;
  }

  &__section-toggle {
    width: 100%;
    min-height: 34px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 10px 0 2px;
    color: $surface-500;
    background: transparent;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  &__section-count {
    opacity: 0;
    margin-left: auto;
    min-width: 24px;
    height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: $surface-600;
    background: rgba($surface-300, 0.45);
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
  }

  &__links {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__link {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 48px;
    padding: 0 12px 0 10px;
    color: $surface-900;
    border-radius: 16px;
    border: 1px solid transparent;
    transition:
      color 0.2s ease,
      border-color 0.2s ease,
      background-color 0.2s ease,
      transform 0.2s ease;

    &:hover,
    &.router-link-active {
      color: $red-500;
      background: rgba($red-500, 0.07);
      border-color: rgba($red-500, 0.08);
      transform: translateX(2px);
    }
  }

  &__icon {
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: rgba($red-500, 0.06);
    flex: 0 0 34px;
  }

  &__label {
    font-size: 14px;
    font-weight: 700;
  }

  &__footer {
    margin-top: auto;
  }

  &__back-link {
    min-height: 48px;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 0 16px;
    color: $surface-900;
    background: rgba($red-500, 0.05);
    border: 1px solid rgba($red-500, 0.08);
    border-radius: 18px;
    font-size: 13px;
    font-weight: 700;
  }
}

@media (max-width: 1024px) {
  .admin-aside {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 20;
    width: min(84vw, 260px);
    transform: translateX(-100%);
    transition: transform 0.24s ease;

    &--open {
      transform: translateX(0);
    }

    &__panel {
      height: calc(100vh - 16px);
      margin: 8px;
    }

    &__close {
      display: inline-flex;
    }
  }
}
</style>
