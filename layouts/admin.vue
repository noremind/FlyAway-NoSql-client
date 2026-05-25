<template>
  <div class="admin-layout">
    <TheAdminLayoutAside class="admin-layout__aside" />
    <button
      v-if="isNavOpen"
      class="admin-layout__overlay"
      type="button"
      aria-label="Закрыть меню"
      @click="closeNav"
    ></button>

    <div class="admin-layout__main">
      <TheAdminLayoutHeader class="admin-layout__header" />
      <main class="admin-layout__content">
        <div class="admin-layout__content-inner">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const isNavOpen = useState("admin-nav-open", () => false);

const closeNav = () => {
  isNavOpen.value = false;
};

watch(
  () => route.fullPath,
  () => {
    closeNav();
  },
);
</script>

<style lang="scss" scoped>
.admin-layout {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 286px minmax(0, 1fr);
  background:
    radial-gradient(circle at top left, rgba($red-500, 0.12), transparent 26%),
    radial-gradient(
      circle at top right,
      rgba($orange-200, 0.12),
      transparent 22%
    ),
    linear-gradient(180deg, #fffaf8 0%, #f8f4f2 52%, #f6f3f1 100%);

  &__aside {
    position: relative;
    z-index: 20;
  }

  &__overlay {
    position: fixed;
    inset: 0;
    z-index: 15;
    border: 0;
    background: rgba(32, 36, 38, 0.34);
  }

  &__main {
    min-width: 0;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  &__main::before {
    content: "";
    position: absolute;
    inset: 0 0 auto;
    height: 220px;
    pointer-events: none;
    background:
      linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.72),
        rgba(255, 255, 255, 0)
      ),
      linear-gradient(135deg, rgba($red-500, 0.04), transparent 55%);
  }

  &__header {
    position: sticky;
    top: 0;
    z-index: 10;
  }

  &__content {
    width: 100%;
    max-width: 1480px;
    margin: 0 auto;
    padding: 28px 32px 48px;
  }

  &__content-inner {
    display: flex;
    flex-direction: column;
    gap: 24px;
    animation: adminAppear 0.24s ease;
  }
}

@keyframes adminAppear {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.admin-form),
:deep(.tour-editor__card),
:deep(.partner-profile),
:deep(.partner-profile__empty),
:deep(.admin-contacts),
:deep(.admin-list__item),
:deep(.admin-dashboard__panel) {
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba($red-500, 0.08);
  border-radius: 24px;
  box-shadow:
    0 18px 42px rgba(32, 36, 38, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(12px);
}

:deep(.admin-form),
:deep(.tour-editor__card),
:deep(.partner-profile),
:deep(.partner-profile__empty),
:deep(.admin-contacts) {
  padding: 26px;
}

:deep(.admin-form .input__wrapper),
:deep(.tour-editor__card .input__wrapper),
:deep(.partner-profile .input__wrapper),
:deep(.admin-contacts .input__wrapper) {
  min-height: 48px;
  padding: 10px 14px;
  background: #fff;
  border: 1px solid rgba($surface-300, 0.85);
  border-radius: 26px;
  box-shadow: 0 6px 18px rgba(32, 36, 38, 0.05);
}

:deep(.admin-form .textarea__wrapper),
:deep(.tour-editor__card .textarea__wrapper),
:deep(.partner-profile .textarea__wrapper),
:deep(.admin-contacts .textarea__wrapper) {
  border: 1px solid rgba($surface-300, 0.9);
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(32, 36, 38, 0.05);
}

:deep(.admin-form .select),
:deep(.tour-editor__card .select),
:deep(.partner-profile .select) {
  background: transparent;
}

:deep(.admin-form .select__wrapper),
:deep(.tour-editor__card .select__wrapper),
:deep(.partner-profile .select__wrapper) {
  border-radius: 26px;
  box-shadow: 0 6px 18px rgba(32, 36, 38, 0.05);
}

@media (max-width: 1024px) {
  .admin-layout {
    display: flex;
    flex-direction: column;
    // grid-template-columns: 1fr;
    &__aside {
      position: absolute;
    }
    &__content {
      padding: 16px 18px 30px;
    }
  }
}

@media (max-width: 520px) {
  .admin-layout {
    &__content {
      padding: 12px 12px 22px;
    }
  }

  :deep(.admin-form),
  :deep(.partner-profile),
  :deep(.partner-profile__empty),
  :deep(.admin-contacts) {
    padding: 16px;
  }
}
</style>
