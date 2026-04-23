<template>
  <div class="places">
    <div class="places__wrapper">
      <img class="places__img" :src="placeImage" :alt="placeTitle" />
      <h4 class="places__title">{{ placeTitle }}</h4>
    </div>
  </div>
</template>

<script setup>
import placePlaceholder from "@/assets/image/content/main-image.png";

const props = defineProps({
  title: {
    type: String,
    default: "Место маршрута",
  },
  image: {
    type: String,
    default: "",
  },
});

const placeTitle = computed(() => String(props.title || "").trim() || "Место маршрута");
const placeImage = computed(() => String(props.image || "").trim() || placePlaceholder);
</script>

<style lang="scss" scoped>
.places {
  &__wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 190px;
    width: 100%;
  }

  &__img {
    width: 100%;
    height: 102px;
    object-fit: cover;
    border-radius: 16px;
    border: 1px solid rgba($surface-300, 0.4);
  }

  &__title {
    color: $surface-900;
    font-weight: 600;
    text-align: center;
    font-size: 14px;
    line-height: 1.35;
  }
}

@media (max-width: 375px) {
  .places {
    &__wrapper {
      width: 190px;
    }
  }
}
</style>
