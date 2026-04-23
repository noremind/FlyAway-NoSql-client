<template>
  <section class="hotel-card">
    <article class="hotel-card__wrapper" :class="`hotel-card__wrapper--${viewType}`">
      <div class="hotel-card__preview">
        <div class="hotel-card__top-actions">
          <span v-if="isHot" class="hotel-card__hot">
            <UiIcons icon="hot" size="size-20" color="orange-200" />
          </span>

          <button type="button" class="hotel-card__favourite" @click="goToHotel">
            <UiIcons icon="heart" size="size-28" color="white" />
          </button>
        </div>

        <UiSwiper class="hotel-card__swiper" :pagination="{ clickable: true }">
          <swiper-slide v-for="image in previewImages" :key="image">
            <img class="hotel-card__image" :src="image" :alt="hotelTitle" />
          </swiper-slide>
        </UiSwiper>
      </div>

      <div class="hotel-card__content">
        <div class="hotel-card__content-head">
          <div class="hotel-card__partner-box">
            <img
              v-if="partnerLogo"
              class="hotel-card__partner-logo"
              :src="partnerLogo"
              :alt="partnerName"
            />
            <span v-else class="hotel-card__partner-logo hotel-card__partner-logo--empty">
              {{ partnerInitial }}
            </span>
            <p class="hotel-card__partner-name">{{ partnerName }}</p>
          </div>

          <div class="hotel-card__reviews">
            <p class="hotel-card__reviews-text">{{ reviewsCountLabel }}</p>
            <UiIcons icon="star" color="yellow-500" size="size-14" />
            <p class="hotel-card__reviews-rating">{{ ratingLabel }}</p>
          </div>
        </div>

        <div class="hotel-card__body">
          <div class="hotel-card__info">
            <NuxtLink :to="detailLink">
              <h3 class="hotel-card__title">{{ hotelTitle }}</h3>
            </NuxtLink>

            <div class="hotel-card__stars">
              <UiIcons
                v-for="star in 5"
                :key="star"
                icon="star"
                size="size-18"
                :color="star <= roundedRating ? 'yellow-500' : 'surface-300'"
              />
            </div>

            <p class="hotel-card__description">
              {{ shortDescription }}
            </p>

            <div class="hotel-card__meta">
              <span v-if="discountLabel" class="hotel-card__badge hotel-card__badge--discount">
                {{ discountLabel }}
              </span>
              <span v-else-if="isNew" class="hotel-card__badge hotel-card__badge--new">
                Новинка
              </span>

              <div class="hotel-card__location">
                <UiIcons icon="location" size="size-16" color="surface-400" />
                <span>{{ regionLabel }}</span>
              </div>
            </div>
          </div>

          <div class="hotel-card__side">
            <ul v-if="benefits.length" class="hotel-card__benefits">
              <li v-for="benefit in benefits" :key="benefit" class="hotel-card__benefit">
                <UiIcons icon="check" color="red-500" size="size-18" />
                <span>{{ benefit }}</span>
              </li>
            </ul>

            <div class="hotel-card__cta">
              <div class="hotel-card__price-wrap">
                <p class="hotel-card__price">
                  {{ minPriceLabel }}
                  <span v-if="oldPriceLabel" class="hotel-card__old-price">
                    {{ oldPriceLabel }}
                  </span>
                </p>
              </div>

              <NuxtLink :to="detailLink">
                <UiButton label="Забронировать" class="hotel-card__btn button-primary" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </article>
  </section>
</template>

<script setup>
import placeholderImage from "@/assets/image/content/main-image.png";

const props = defineProps({
  viewType: {
    type: String,
    default: "list",
  },
  hotel: {
    type: Object,
    default: () => ({}),
  },
});

const router = useRouter();

const normalizeString = (value) => String(value || "").trim();
const stripHtml = (value) => normalizeString(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const formatMoney = (value) => Number(value || 0).toLocaleString("ru-RU");

const hotelId = computed(() => props.hotel?._id || props.hotel?.id || "");
const detailLink = computed(() => (hotelId.value ? `/hotels/${hotelId.value}` : "/hotels"));
const hotelTitle = computed(() => normalizeString(props.hotel?.name) || "Отель");
const partnerName = computed(() => normalizeString(props.hotel?.partner?.title || props.hotel?.partner?.name) || "FlyAway Partner");
const partnerLogo = computed(() => normalizeString(props.hotel?.partner?.logo));
const partnerInitial = computed(() => partnerName.value.charAt(0).toUpperCase());
const roundedRating = computed(() => Math.max(0, Math.min(5, Math.round(Number(props.hotel?.rating) || 0))));
const ratingLabel = computed(() => {
  const rating = Number(props.hotel?.rating || 0);
  return rating ? rating.toFixed(1).replace(".", ",") : "0,0";
});
const reviewsCount = computed(() => Number(props.hotel?.reviewsCount || props.hotel?.reviews || 0));
const reviewsCountLabel = computed(() => `${reviewsCount.value} отзывов`);
const regionLabel = computed(() => normalizeString(props.hotel?.location).split(",")[0] || "Локация уточняется");
const shortDescription = computed(() => {
  const text = stripHtml(props.hotel?.description || props.hotel?.content);
  if (!text) return "Описание отеля скоро появится.";
  return text.length > 140 ? `${text.slice(0, 140)}...` : text;
});
const previewImages = computed(() => {
  const items = Array.isArray(props.hotel?.images) ? props.hotel.images.filter(Boolean) : [];
  return items.length ? items : [placeholderImage];
});
const roomTypes = computed(() => (Array.isArray(props.hotel?.room_types) ? props.hotel.room_types.filter(Boolean) : []));
const minRoomPrice = computed(() => {
  const prices = roomTypes.value.map((room) => Number(room?.price) || 0).filter((price) => price > 0);
  if (prices.length) return Math.min(...prices);
  return Number(props.hotel?.price) || 0;
});
const discount = computed(() => Math.max(0, Number(props.hotel?.discount) || 0));
const oldRoomPrice = computed(() => {
  if (!minRoomPrice.value || !discount.value) return 0;
  return Math.round(minRoomPrice.value / (1 - discount.value / 100));
});
const minPriceLabel = computed(() => (minRoomPrice.value ? `${formatMoney(minRoomPrice.value)} ₸` : "По запросу"));
const oldPriceLabel = computed(() => (oldRoomPrice.value ? `${formatMoney(oldRoomPrice.value)} ₸` : ""));
const discountLabel = computed(() => (discount.value ? `-${discount.value}%` : ""));
const benefits = computed(() => {
  const roomBenefitSource = roomTypes.value[0]?.benefits || roomTypes.value[0]?.description;
  const candidate = Array.isArray(roomBenefitSource)
    ? roomBenefitSource
    : normalizeString(roomBenefitSource)
        .split(/\n|•|;|,/)
        .map((item) => item.trim())
        .filter(Boolean);

  if (candidate.length) {
    return candidate.slice(0, 3);
  }

  return ["Комфортные номера", "Удобное расположение", "Быстрое подтверждение"];
});
const isHot = computed(() => Boolean(props.hotel?.is_hot));
const isNew = computed(() => {
  const createdAt = props.hotel?.createdAt;
  if (!createdAt) return false;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return false;
  return Date.now() - date.getTime() < 1000 * 60 * 60 * 24 * 45;
});

const goToHotel = () => {
  router.push(detailLink.value);
};
</script>

<style lang="scss" scoped>
.hotel-card {
  &__wrapper {
    display: grid;
    grid-template-columns: 290px minmax(0, 1fr);
    gap: 0;
    min-height: 240px;
    overflow: hidden;
    border-radius: 18px;
    background: $white;
    box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.06);

    &--tablet {
      grid-template-columns: 1fr;
      min-height: auto;
    }
  }

  &__preview {
    position: relative;
    min-height: 240px;
  }

  &__top-actions {
    position: absolute;
    inset: 12px 12px auto 12px;
    z-index: 3;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__hot,
  &__favourite {
    width: 30px;
    height: 30px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba($white, 0.9);
  }

  &__swiper {
    height: 100%;
  }

  &__image {
    width: 100%;
    height: 240px;
    object-fit: cover;
  }

  &__content {
    display: flex;
    flex-direction: column;
    padding: 16px 18px;
    gap: 14px;
    min-width: 0;
  }

  &__content-head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
  }

  &__partner-box {
    display: flex;
    gap: 8px;
    align-items: center;
    min-width: 0;
  }

  &__partner-logo {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;

    &--empty {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: $white;
      background: $red-500;
      font-size: 12px;
      font-weight: 700;
    }
  }

  &__partner-name {
    color: $surface-900;
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__reviews {
    display: flex;
    gap: 4px;
    align-items: center;
    flex-shrink: 0;
  }

  &__reviews-text {
    color: $surface-400;
    font-size: 12px;
  }

  &__reviews-rating {
    color: $surface-900;
    font-size: 12px;
    font-weight: 600;
  }

  &__body {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 220px;
    gap: 18px;
    min-width: 0;
    height: 100%;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  &__title {
    color: $surface-900;
    font-size: 32px;
    line-height: 1.05;
    font-weight: 800;
  }

  &__stars {
    display: flex;
    gap: 2px;
    align-items: center;
  }

  &__description {
    color: $surface-500;
    line-height: 1.55;
    font-size: 14px;
  }

  &__meta {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
    margin-top: auto;
  }

  &__badge {
    min-height: 28px;
    padding: 0 10px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: $white;
    font-size: 12px;
    font-weight: 700;

    &--discount {
      background: $orange-200;
    }

    &--new {
      background: #22c55e;
    }
  }

  &__location {
    display: flex;
    gap: 6px;
    align-items: center;
    color: $surface-400;
    font-size: 13px;
  }

  &__side {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 16px;
  }

  &__benefits {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__benefit {
    display: flex;
    gap: 6px;
    align-items: center;
    color: $surface-500;
    font-size: 12px;
    line-height: 1.4;
  }

  &__cta {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__price-wrap {
    display: flex;
    justify-content: flex-end;
  }

  &__price {
    min-height: 42px;
    padding: 0 16px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: $white;
    background: $red-500;
    font-size: 22px;
    font-weight: 800;
  }

  &__old-price {
    color: rgba($surface-900, 0.9);
    text-decoration: line-through;
    font-size: 14px;
    font-weight: 600;
  }

  &__btn {
    width: 100%;
    justify-content: center;
  }
}

.hotel-card__swiper :deep(.custom-swiper::part(pagination)) {
  position: absolute !important;
}

@media (max-width: 1024px) {
  .hotel-card {
    &__wrapper {
      grid-template-columns: 1fr;
      min-height: auto;
    }

    &__preview {
      min-height: 220px;
    }

    &__image {
      height: 220px;
    }

    &__body {
      grid-template-columns: 1fr;
    }

    &__side {
      gap: 12px;
    }

    &__title {
      font-size: 26px;
    }
  }
}

@media (max-width: 640px) {
  .hotel-card {
    &__content {
      padding: 12px;
    }

    &__content-head {
      align-items: flex-start;
    }

    &__title {
      font-size: 22px;
    }

    &__price {
      width: 100%;
      font-size: 18px;
    }
  }
}
</style>
