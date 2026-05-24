<template>
  <NuxtLink class="hotel" :to="detailLink">
    <article class="hotel__wrapper">
      <img class="hotel__img" :src="image" :alt="title" />
      <div class="hotel__overlay">
        <div class="hotel__head">
          <h3 class="hotel__title">{{ title }}</h3>
          <div class="hotel__rating">
            <UiIcons icon="star" color="yellow-500" size="size-14" />
            <span>{{ ratingLabel }}</span>
          </div>
        </div>
        <p class="hotel__location">{{ location }}</p>
        <p class="hotel__price">от {{ priceLabel }}</p>
      </div>
    </article>
  </NuxtLink>
</template>

<script setup>
import placeholderImage from "@/assets/image/content/hotel-card.png";

const props = defineProps({
  hotel: {
    type: Object,
    default: () => ({}),
  },
});

const title = computed(() => String(props.hotel?.name || "Отель").trim());
const detailLink = computed(() => props.hotel?._id ? `/hotels/${props.hotel._id}` : "/hotels");
const image = computed(() => {
  const images = Array.isArray(props.hotel?.images) ? props.hotel.images.filter(Boolean) : [];
  return images[0] || placeholderImage;
});
const location = computed(() => String(props.hotel?.location || "Локация уточняется").split(",")[0]);
const ratingLabel = computed(() => Number(props.hotel?.rating || 0).toFixed(1).replace(".", ","));
const priceLabel = computed(() => {
  const rooms = Array.isArray(props.hotel?.room_types) ? props.hotel.room_types : [];
  const prices = rooms.map((room) => Number(room?.price) || 0).filter(Boolean);
  const price = prices.length ? Math.min(...prices) : Number(props.hotel?.price) || 0;
  return price ? `${price.toLocaleString("ru-RU")} ₸` : "по запросу";
});
</script>

<style lang="scss" scoped>
.hotel {
  display: block;
  width: 100%;
  color: inherit;

  &__wrapper {
    min-height: 260px;
    border-radius: 22px;
    overflow: hidden;
    position: relative;
    background: $surface-150;
    box-shadow: 0 12px 28px rgba(32, 36, 38, 0.08);
  }

  &__img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.25s ease;
  }

  &:hover &__img {
    transform: scale(1.04);
  }

  &__overlay {
    position: absolute;
    left: 14px;
    right: 14px;
    bottom: 14px;
    display: grid;
    gap: 8px;
    padding: 14px;
    border-radius: 18px;
    background: rgba($white, 0.88);
    backdrop-filter: blur(12px);
  }

  &__head {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: flex-start;
  }

  &__title {
    color: $surface-900;
    font-size: 20px;
    font-weight: 800;
    line-height: 1.15;
  }

  &__rating {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: $surface-900;
    font-size: 13px;
    font-weight: 700;
    flex-shrink: 0;
  }

  &__location {
    color: $surface-500;
    font-size: 13px;
  }

  &__price {
    color: $red-500;
    font-size: 18px;
    font-weight: 800;
  }
}

@media (max-width: 768px) {
  .hotel {
    &__wrapper {
      min-height: 220px;
    }
    &__title {
      font-size: 16px;
    }
  }
}
</style>