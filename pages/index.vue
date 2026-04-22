<template>
  <TheMainBanner></TheMainBanner>
  <TheMainSearchBlock></TheMainSearchBlock>

  <!-- <TheMainLinkBlocks></TheMainLinkBlocks> -->

  <section class="main__tours">
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
      <nuxt-link v-if="tours?.length > 4" class="main__tours-link" to="/tours"
        >Все горящие туры</nuxt-link
      >
    </div>
    <div class="main__tours-slider" v-if="tours?.length">
      <UiSwiper
        :pagination="{ clickable: true }"
        :autoplay="true"
        :autoHeight="true"
        :breakpoints="{
          1100: {
            slidesPerView: 4,
          },
          924: {
            slidesPerView: 3,
          },
          640: {
            slidesPerView: 2,
          },
          320: {
            slidesPerView: 1,
          },
          0: {
            slidesPerView: 1,
          },
        }"
      >
        <swiper-slide v-for="tour in tours" :key="tour._id">
          <TheCommonTourCard
            :tour="tour"
            :view-type="'tablet'"
          ></TheCommonTourCard>
        </swiper-slide>
      </UiSwiper>
    </div>
    <div class="main__tours-slider main__tours-slider--block">
      <TheCommonTourCard
        v-for="tour in tours"
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
      @click="router.push('/tours')"
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

  <section class="main__hotels">
    <div class="main__hotels-box">
      <h2 class="main__title title">Отели</h2>
      <nuxt-link class="main__hotels-link" to="/hotels">Все отели</nuxt-link>
    </div>
    <div class="main__hotels-cards">
      <TheMainHotelCard v-for="hotel in 4" :key="4"></TheMainHotelCard>
    </div>

    <UiButton
      class="main__hotels-link main__hotels-link--mobile"
      label="Все отели"
      after-icon="chevron"
      icon-color="red-500"
      icon-size="size-14"
      @click="router.push('/tours')"
    ></UiButton>
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
const tours = ref(null);

const banners = ref(null);

useFetchSsr({
  url: "/ads",
}).then((res) => {
  banners.value = res.data;
});

const reviews = ref([]);

useFetchSsr({
  url: "/tour-reviews/latest",
  method: "get",
  query: { limit: 6 },
}).then((res) => {
  reviews.value = Array.isArray(res?.data) ? res.data : [];
});

useSeo({
  title: "Туры, отели и путешествия в одном месте",
  description:
    "FlyAway - удобный сервис для поиска туров, отелей и туристических предложений. Выбирайте путешествия, сравнивайте варианты и планируйте отдых легко и быстро.",
});

useFetchSsr({
  url: "/tours",
  method: "get",
}).then((res) => {
  tours.value = res.data;
});
</script>

<style lang="scss" scoped>
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
</style>
