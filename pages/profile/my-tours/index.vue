<template>
  <div class="my-tours">
    <div class="my-tours__wrapper">
      <UiTabs
        class="my-tours__tabs"
        :tabs="tabs"
        type="line"
        v-model="selectedTab"
      ></UiTabs>

      <div class="my-tours__cards">
        <TheProfileTourTicket
          v-for="booking in filteredBookings"
          :key="booking._id"
          :booking="booking"
        ></TheProfileTourTicket>

        <div v-if="!isLoading && !filteredBookings.length" class="my-tours__empty">
          Бронирований пока нет.
        </div>
      </div>
    </div>
    <br />
    <UiPagination class="my-tours__pagination"></UiPagination>
  </div>
</template>

<script setup>
const tabs = reactive([
  {
    id: 1,
    name: "Активные",
  },
  {
    id: 2,
    name: "Завершенные",
  },
]);
const selectedTab = ref(tabs[0]);
const bookings = ref([]);
const isLoading = ref(false);

useSeoMeta({
  title: "FlyAway - Мой туры",
  ogTitle: "FlyAway - Мой туры",
  description: "FlyAway - сайт для бронирования туров и отелей",
  ogDescription: "FlyAway - сайт для бронирования туров и отелей",
});

const filteredBookings = computed(() => {
  const now = Date.now();

  return bookings.value.filter((booking) => {
    const dateValue = String(booking?.date || "");
    const parsed = dateValue ? new Date(`${dateValue}T00:00:00`).getTime() : now;

    if (selectedTab.value.id === 1) {
      return parsed >= now - 24 * 60 * 60 * 1000;
    }

    return parsed < now - 24 * 60 * 60 * 1000;
  });
});

const loadBookings = async () => {
  isLoading.value = true;

  try {
    const response = await useApi().client({
      url: "/personal-cabinet/bookings/tours",
      method: "get",
    });

    bookings.value = Array.isArray(response?.data) ? response.data : [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadBookings);
</script>

<style lang="scss" scoped>
.my-tours {
  &__wrapper {
    background-color: $white;
    padding: 16px;
    border-radius: 16px;
  }
  &__tabs {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  &__cards {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 24px 0;
  }
  &__pagination {
    margin: 0 auto;
  }
  &__empty {
    padding: 28px 16px;
    border-radius: 16px;
    background: rgba($red-500, 0.04);
    color: $surface-500;
    text-align: center;
  }
}

@media (max-width: 375px) {
  .my-tours {
    &__wrapper {
      background-color: transparent;
      padding: 0;
    }
  }
}
</style>
