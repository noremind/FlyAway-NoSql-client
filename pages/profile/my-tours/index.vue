<template>
  <div class="my-tours">
    <div class="my-tours__wrapper">
      <UiTabs
        class="my-tours__tabs"
        :tabs="tabs"
        type="line"
        v-model="selectedTab"
      ></UiTabs>

      <div v-if="message" class="my-tours__message">{{ message }}</div>
      <div v-if="errorMessage" class="my-tours__error">{{ errorMessage }}</div>

      <div v-if="isLoading" class="my-tours__state">
        Загружаем бронирования...
      </div>

      <div v-else class="my-tours__cards">
        <TheProfileTourTicket
          v-for="booking in filteredBookings"
          :key="booking._id"
          :booking="booking"
          :is-cancelling="cancellingBookingId === booking._id"
          @cancel="handleCancelBooking"
        />

        <div v-if="!filteredBookings.length" class="my-tours__empty">
          {{ emptyStateText }}
        </div>
      </div>
    </div>

    <br />
    <UiPagination class="my-tours__pagination"></UiPagination>
  </div>
</template>

<script setup>
const api = useApi();

const tabs = reactive([
  { id: "active", name: "Активные" },
  { id: "completed", name: "Завершенные" },
  { id: "cancelled", name: "Отмененные" },
]);

const selectedTab = ref(tabs[0]);
const bookings = ref([]);
const isLoading = ref(false);
const cancellingBookingId = ref(null);
const errorMessage = ref("");
const message = ref("");

useSeoMeta({
  title: "FlyAway - Мои туры",
  ogTitle: "FlyAway - Мои туры",
  description: "FlyAway - сайт для бронирования туров и отелей",
  ogDescription: "FlyAway - сайт для бронирования туров и отелей",
});

const normalizeString = (value) => String(value || "").trim();

const sortBookings = (items = []) => {
  return [...items].sort(
    (left, right) =>
      new Date(right?.createdAt || 0).getTime() -
      new Date(left?.createdAt || 0).getTime(),
  );
};

const filteredBookings = computed(() => {
  const currentTab = selectedTab.value?.id || "active";

  return bookings.value.filter((booking) => {
    const status = normalizeString(booking?.status) || "active";
    return status === currentTab;
  });
});

const emptyStateText = computed(() => {
  if (selectedTab.value?.id === "completed") {
    return "Завершенных поездок пока нет.";
  }

  if (selectedTab.value?.id === "cancelled") {
    return "Отмененных бронирований пока нет.";
  }

  return "Активных бронирований пока нет.";
});

const replaceBookingInList = (nextBooking) => {
  if (!nextBooking?._id) {
    return;
  }

  bookings.value = sortBookings(
    bookings.value.map((booking) =>
      booking._id === nextBooking._id ? nextBooking : booking,
    ),
  );
};

const loadBookings = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response = await api.client({
      url: "/personal-cabinet/bookings/tours",
      method: "get",
    });

    bookings.value = sortBookings(
      Array.isArray(response?.data) ? response.data : [],
    );
  } catch (error) {
    errorMessage.value = error?.message || "Не удалось загрузить бронирования.";
  } finally {
    isLoading.value = false;
  }
};

const handleCancelBooking = async (bookingId) => {
  if (!bookingId || cancellingBookingId.value) {
    return;
  }

  const confirmed =
    typeof window === "undefined"
      ? true
      : window.confirm("Отменить это бронирование?");

  if (!confirmed) {
    return;
  }

  cancellingBookingId.value = bookingId;
  errorMessage.value = "";
  message.value = "";

  try {
    const response = await api.client({
      url: `/personal-cabinet/bookings/tours/${bookingId}/cancel`,
      method: "patch",
    });

    replaceBookingInList(response?.data);
    message.value = "Бронирование отменено.";
    selectedTab.value = tabs.find((tab) => tab.id === "cancelled") || tabs[0];
  } catch (error) {
    errorMessage.value = error?.message || "Не удалось отменить бронирование.";
  } finally {
    cancellingBookingId.value = null;
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

  &__state,
  &__empty {
    padding: 28px 16px;
    border-radius: 16px;
    background: rgba($red-500, 0.04);
    color: $surface-500;
    text-align: center;
  }

  &__message,
  &__error {
    margin-top: 16px;
    font-size: 14px;
    font-weight: 600;
  }

  &__message {
    color: $green-400;
  }

  &__error {
    color: $orange-200;
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
