<template>
  <TheMainBanner></TheMainBanner>
  <TheMainSearchBlock></TheMainSearchBlock>

  <section class="main__tours" id="hot-tours">
    <img
      class="main__tours-carving"
      src="@/assets/image/content/carving.png"
      alt="Carving"
    />

    <div class="main__tours-box">
      <div class="main__tours-inner">
        <UiIcons icon="hot" size="size-32" color="orange-200"></UiIcons>
        <h2 class="main__title title">Горящие туры</h2>
      </div>
      <nuxt-link
        v-if="hotTours?.length > 4"
        class="main__tours-link"
        to="/tours?is_hot=true"
      >
        Все горящие туры
      </nuxt-link>
    </div>

    <div class="main__tours-slider" v-if="hotTours?.length">
      <UiSwiper
        :pagination="{ clickable: true }"
        :autoplay="true"
        :autoHeight="true"
        :breakpoints="{
          1100: { slidesPerView: 4 },
          924: { slidesPerView: 3 },
          640: { slidesPerView: 2 },
          320: { slidesPerView: 1 },
          0: { slidesPerView: 1 },
        }"
      >
        <swiper-slide v-for="tour in hotTours" :key="tour._id">
          <TheCommonTourCard
            :tour="tour"
            :view-type="'tablet'"
          ></TheCommonTourCard>
        </swiper-slide>
      </UiSwiper>
    </div>

    <div v-else class="main__empty">Горящие туры скоро появятся.</div>

    <div
      class="main__tours-slider main__tours-slider--block"
      v-if="hotTours?.length"
    >
      <TheCommonTourCard
        v-for="tour in hotTours"
        :key="tour._id"
        :tour="tour"
        :view-type="'tablet'"
      ></TheCommonTourCard>
    </div>

    <UiButton
      class="main__tours-link main__tours-link--mobile"
      label="Все горящие туры"
      after-icon="chevron"
      icon-color="red-500"
      icon-size="size-14"
      @click="router.push('/tours?is_hot=true')"
    ></UiButton>
  </section>

  <UiSwiper
    :pagination="{ clickable: true }"
    :per-slides="1"
    :autoplay="true"
    v-if="banners?.length"
  >
    <swiper-slide v-for="banner in banners" :key="banner._id">
      <TheCommonPopularBanner :banner="banner"></TheCommonPopularBanner>
    </swiper-slide>
  </UiSwiper>

  <section class="main__hotels" id="popular-hotels">
    <div class="main__hotels-box">
      <h2 class="main__title title">Отели</h2>
      <nuxt-link class="main__hotels-link" to="/hotels">Все отели</nuxt-link>
    </div>
    <div class="main__hotels-cards">
      <TheCommonPopularBanner
        v-for="banner in banners"
        :key="banner._id"
        :banner="banner"
      ></TheCommonPopularBanner>
    </div>
    <!-- <div v-else class="main__empty">Отели скоро появятся.</div> -->

    <UiButton
      class="main__hotels-link main__hotels-link--mobile"
      label="Все отели"
      after-icon="chevron"
      icon-color="red-500"
      icon-size="size-14"
      @click="router.push('/hotels')"
    ></UiButton>
  </section>

  <section class="main__faq" id="faq" v-if="faqItems.length">
    <div class="main__faq-head">
      <div>
        <p class="main__eyebrow">Помощь путешественнику</p>
        <h2 class="main__title title">FAQ</h2>
      </div>
      <p class="main__faq-description">
        Ответы на частые вопросы о бронировании туров, отелей, оплате, бонусах и
        работе с партнерами FlyAway.
      </p>
    </div>

    <div class="main__faq-list">
      <article
        v-for="item in faqItems"
        :key="item._id"
        class="main__faq-item"
        :class="{ 'main__faq-item--open': activeFaqId === item._id }"
      >
        <button
          class="main__faq-question"
          type="button"
          @click="toggleFaq(item._id)"
        >
          <span>{{ item.question }}</span>
          <UiIcons
            icon="chevron"
            size="size-18"
            color="red-500"
            :deg="activeFaqId === item._id ? 'top' : 'right'"
          />
        </button>
        <p v-if="activeFaqId === item._id" class="main__faq-answer">
          {{ item.answer }}
        </p>
      </article>
    </div>
  </section>

  <section class="main__reviews" v-if="reviews?.length">
    <h2 class="main__title title">Отзывы путешественников</h2>

    <div class="main__reviews-cards">
      <UiSwiper
        :breakpoints="{
          1240: { slidesPerView: 2.5 },
          992: { slidesPerView: 2.5 },
          720: { slidesPerView: 2 },
          0: { slidesPerView: 1.5 },
        }"
      >
        <swiper-slide v-for="review in reviews" :key="review._id">
          <TheCommonReview :review="review" />
        </swiper-slide>
      </UiSwiper>
    </div>
    <div class="main__reviews-cards main__reviews-cards--mobile">
      <TheCommonReview
        v-for="review in reviews.slice(0, 2)"
        :key="review._id"
        :review="review"
      />
    </div>
  </section>
</template>

<script setup>
const router = useRouter();
const hotTours = ref([]);
const hotels = ref([]);
const banners = ref([]);
const reviews = ref([]);
const faqItems = ref([]);
const activeFaqId = ref("");

const toggleFaq = (id) => {
  activeFaqId.value = activeFaqId.value === id ? "" : id;
};

useFetchSsr({ url: "/ads" }).then((res) => {
  banners.value = Array.isArray(res?.data) ? res.data : [];
});

useFetchSsr({
  url: "/tour-reviews/latest",
  method: "get",
  query: { limit: 6 },
}).then((res) => {
  reviews.value = Array.isArray(res?.data) ? res.data : [];
});

useFetchSsr({
  url: "/tours",
  method: "get",
  query: { is_hot: true, perPage: 8, sortBy: "rating_desc" },
}).then((res) => {
  hotTours.value = Array.isArray(res?.data) ? res.data : [];
});

useFetchSsr({
  url: "/hotels",
  method: "get",
  query: { sortBy: "rating_desc" },
}).then((res) => {
  hotels.value = Array.isArray(res?.data) ? res.data.slice(0, 4) : [];
});

useFetchSsr({
  url: "/faq",
  method: "get",
}).then((res) => {
  faqItems.value = Array.isArray(res?.data) ? res.data.slice(0, 8) : [];
  activeFaqId.value = faqItems.value[0]?._id || "";
});

useSeo({
  title: "Туры, отели и путешествия в одном месте",
  description:
    "FlyAway - удобный сервис для поиска туров, отелей и туристических предложений. Выбирайте путешествия, сравнивайте варианты и планируйте отдых легко и быстро.",
});
</script>

<style lang="scss" scoped>
.main__tours,
.main__hotels,
.main__faq {
  scroll-margin-top: 120px;
}

.main__tours-slider {
  :deep(.swiper) {
    height: 100%;
  }

  :deep(.swiper-wrapper) {
    align-items: stretch;
  }

  :deep(.swiper-slide) {
    height: auto !important;
    display: flex;
    align-items: stretch;
  }

  :deep(.swiper-slide > *) {
    width: 100%;
    height: 100%;
  }
}

.main__hotels-cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.main__empty {
  padding: 28px;
  border-radius: 18px;
  background: $white;
  color: $surface-500;
  text-align: center;
  box-shadow: 0 12px 30px rgba(32, 36, 38, 0.05);
}

.main__faq {
  margin: 64px 0;
  padding: 34px;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba($red-500, 0.12), transparent 28%),
    $white;
  box-shadow: 0 18px 42px rgba(32, 36, 38, 0.06);
}

.main__faq-head {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1fr);
  gap: 24px;
  align-items: end;
  margin-bottom: 24px;
}

.main__eyebrow {
  color: $red-500;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.main__faq-description {
  color: $surface-500;
  line-height: 1.6;
}

.main__faq-list {
  display: grid;
  gap: 12px;
}

.main__faq-item {
  border: 1px solid rgba($surface-300, 0.5);
  border-radius: 18px;
  background: rgba($white, 0.84);
  overflow: hidden;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &--open {
    border-color: rgba($red-500, 0.3);
    box-shadow: 0 12px 30px rgba($red-500, 0.08);
  }
}

.main__faq-question {
  width: 100%;
  min-height: 62px;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  color: $surface-900;
  font-size: 16px;
  font-weight: 800;
  text-align: left;
}

.main__faq-answer {
  padding: 0 20px 20px;
  color: $surface-500;
  line-height: 1.65;
}

@media (max-width: 980px) {
  .main__hotels-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .main__faq-head {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .main__hotels-cards {
    grid-template-columns: 1fr;
  }

  .main__faq {
    padding: 20px;
    margin: 36px 0;
  }
}
</style>
