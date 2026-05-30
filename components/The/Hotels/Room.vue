<template>
  <section class="hotel-room">
    <article
      class="hotel-room__wrapper"
      :class="{ 'hotel-room__wrapper--selected': selected }"
    >
      <div class="hotel-room__preview">
        <UiSwiper class="hotel-room__swiper" :pagination="{ clickable: true }">
          <swiper-slide v-for="image in roomImages" :key="image">
            <img class="hotel-room__image" :src="image" :alt="roomTitle" />
          </swiper-slide>
        </UiSwiper>
      </div>

      <div class="hotel-room__content">
        <div class="hotel-room__info">
          <h3 class="hotel-room__title">{{ roomTitle }}</h3>
          <ul class="hotel-room__list">
            <li
              v-for="item in roomBenefits"
              :key="item"
              class="hotel-room__list-item"
            >
              {{ item }}
            </li>
          </ul>
        </div>

        <div class="hotel-room__side">
          <div class="hotel-room__price">
            {{ priceLabel }}
          </div>

          <UiButton
            :label="selected ? 'Вы выбрали' : 'Выбрать'"
            :before-icon="selected ? 'circle-check' : ''"
            :icon-size="selected ? 'size-18' : ''"
            :icon-color="selected ? 'white' : ''"
            :class="
              selected
                ? 'hotel-room__btn hotel-room__btn--selected'
                : 'hotel-room__btn button-secondary'
            "
            @click="emit('select', room)"
          />
        </div>
      </div>
    </article>
  </section>
</template>

<script setup>
import placeholderImage from "@/assets/image/content/main-image.png";

const emit = defineEmits(["select"]);

const props = defineProps({
  room: {
    type: Object,
    default: () => ({}),
  },
  selected: {
    type: Boolean,
    default: false,
  },
});

const normalizeString = (value) => String(value || "").trim();
const roomTitle = computed(() => normalizeString(props.room?.name) || "Номер");
const roomImages = computed(() => {
  const images = Array.isArray(props.room?.images)
    ? props.room.images.filter(Boolean)
    : [];
  return images.length ? images : [placeholderImage];
});
const roomBenefits = computed(() => {
  const source = props.room?.benefits || props.room?.description || [];

  if (Array.isArray(source)) {
    return source.filter(Boolean).slice(0, 5);
  }

  const items = normalizeString(source)
    .split(/\n|•|;|,/)
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length
    ? items.slice(0, 5)
    : ["Комфортный номер", "Уютное проживание"];
});
const priceLabel = computed(() => {
  const price = Number(props.room?.price) || 0;
  return price ? `${price.toLocaleString("ru-RU")} ₸` : "По запросу";
});
</script>

<style lang="scss" scoped>
.hotel-room {
  &__wrapper {
    display: grid;
    grid-template-columns: 210px minmax(0, 1fr);
    gap: 16px;
    padding: 10px;
    border-radius: 18px;
    background: $white;
    box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba($surface-300, 0.35);
    transition: 0.4 ease-out;

    &--selected {
      border-color: rgba($red-500, 0.35);
      box-shadow: 0px 10px 26px rgba($red-500, 0.08);
    }
  }

  &__preview {
    min-height: 150px;
    overflow: hidden;
    border-radius: 14px;
  }

  &__image {
    width: 100%;
    height: 150px;
    object-fit: cover;
  }

  &__content {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 180px;
    gap: 16px;
    align-items: stretch;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__title {
    color: $surface-900;
    font-size: 20px;
    font-weight: 700;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__list-item {
    list-style: disc;
    margin-left: 18px;
    color: $surface-500;
    font-size: 13px;
    line-height: 1.45;
  }

  &__side {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 10px;
  }

  &__price {
    min-height: 42px;
    padding: 0 14px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: $white;
    background: #137214;
    font-size: 22px;
    font-weight: 800;
  }

  &__btn {
    width: 100%;
    justify-content: center;
    height: fit-content;
    padding: 12px;

    &--selected {
      background: $red-500;
      color: $white;
    }
  }
}

.hotel-room__swiper :deep(.custom-swiper::part(pagination)) {
  position: absolute !important;
}

@media (max-width: 768px) {
  .hotel-room {
    &__wrapper,
    &__content {
      grid-template-columns: 1fr;
    }

    &__side {
      align-items: stretch;
    }

    &__price {
      width: 100%;
      font-size: 18px;
    }
  }
}
</style>
