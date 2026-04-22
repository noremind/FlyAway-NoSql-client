<template>
  <teleport to="body">
    <transition-group name="notify-list" tag="div" class="notify-stack">
      <article
        v-for="item in items"
        :key="item.id"
        class="notify-stack__item"
        :class="`notify-stack__item--${item.status}`"
      >
        <div class="notify-stack__body">
          <strong v-if="item.title" class="notify-stack__title">
            {{ item.title }}
          </strong>
          <p class="notify-stack__text">{{ item.text }}</p>
        </div>

        <button
          class="notify-stack__close"
          type="button"
          aria-label="Закрыть уведомление"
          @click="remove(item.id)"
        >
          ×
        </button>
      </article>
    </transition-group>
  </teleport>
</template>

<script setup>
const { items, remove } = useNotify();
</script>

<style lang="scss" scoped>
.notify-stack {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 1200;
  width: min(380px, calc(100vw - 24px));
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 14px 14px 16px;
    border-radius: 16px;
    color: $white;
    box-shadow: 0 18px 34px rgba(20, 24, 28, 0.16);

    &--success {
      background: linear-gradient(135deg, $green-400 0%, #1f9f6b 100%);
    }

    &--error {
      background: linear-gradient(135deg, $red-500 0%, #d22b3f 100%);
    }

    &--info {
      background: linear-gradient(135deg, $blue-500 0%, #3d73db 100%);
    }

    &--warning {
      background: linear-gradient(135deg, $orange-200 0%, #d8892a 100%);
    }
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__title {
    display: block;
    margin-bottom: 4px;
    font-size: 14px;
    font-weight: 800;
    line-height: 1.2;
  }

  &__text {
    font-size: 14px;
    line-height: 1.45;
    word-break: break-word;
  }

  &__close {
    width: 28px;
    height: 28px;
    flex: 0 0 28px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.14);
    color: $white;
    font-size: 18px;
    line-height: 1;
  }
}

.notify-list-enter-active,
.notify-list-leave-active {
  transition: all 0.22s ease;
}

.notify-list-enter-from,
.notify-list-leave-to {
  opacity: 0;
  transform: translateY(-8px) translateX(8px);
}

@media (max-width: 640px) {
  .notify-stack {
    top: auto;
    bottom: 14px;
    left: 12px;
    right: 12px;
    width: auto;
  }
}
</style>
