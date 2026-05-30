<template>
  <div class="my-hotels">
    <div class="my-hotels__wrapper">
      <UiTabs
        class="my-hotels__tabs"
        :tabs="tabs"
        type="line"
        v-model="selectedTab"
      ></UiTabs>

      <div v-if="message" class="my-hotels__message">{{ message }}</div>
      <div v-if="errorMessage && !hasLoadError" class="my-hotels__error">
        {{ errorMessage }}
      </div>

      <div v-if="isLoading" class="my-hotels__state">
        Загружаем заявки по отелям...
      </div>

      <div
        v-else-if="hasLoadError"
        class="my-hotels__state my-hotels__state--error"
      >
        <p>{{ errorMessage }}</p>
        <button class="my-hotels__retry" type="button" @click="loadBookings">
          Повторить
        </button>
      </div>

      <div v-else class="my-hotels__body">
        <div class="my-hotels__cards">
          <TheProfileHotelTicket
            v-for="booking in paginatedBookings"
            :key="booking._id"
            :booking="booking"
          />

          <div v-if="!paginatedBookings.length" class="my-hotels__empty">
            {{ emptyStateText }}
          </div>
        </div>

        <UiPagination
          v-if="lastPage > 1"
          class="my-hotels__pagination"
          :total-items="filteredBookings.length"
          :current-page="currentPage"
          :last-page="lastPage"
          :per-page="perPage"
          @change-page="changePage"
        ></UiPagination>
      </div>
    </div>
  </div>
</template>

<script setup>
const api = useApi();

const tabs = reactive([
  { id: "new", name: "Новые" },
  { id: "active", name: "Активные" },
  { id: "completed", name: "Завершенные" },
  { id: "cancelled", name: "Отмененные" },
]);

const selectedTab = ref(tabs[0]);
const bookings = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");
const message = ref("");
const currentPage = ref(1);
const perPage = 5;

useSeoMeta({
  title: "FlyAway - Мои отели",
  ogTitle: "FlyAway - Мои отели",
  description: "FlyAway - сайт для бронирования туров и отелей",
  ogDescription: "FlyAway - сайт для бронирования туров и отелей",
});

const normalizeString = (value) => String(value || "").trim();

const hasLoadError = computed(
  () =>
    Boolean(errorMessage.value) && !bookings.value.length && !isLoading.value,
);

const sortBookings = (items = []) => {
  return [...items].sort(
    (left, right) =>
      new Date(right?.createdAt || 0).getTime() -
      new Date(left?.createdAt || 0).getTime(),
  );
};

const filteredBookings = computed(() => {
  const currentTab = selectedTab.value?.id || "new";

  return bookings.value.filter((booking) => {
    const status = normalizeString(booking?.status) || "new";
    return status === currentTab;
  });
});

const lastPage = computed(() => {
  return Math.max(1, Math.ceil(filteredBookings.value.length / perPage));
});

const paginatedBookings = computed(() => {
  const startIndex = (currentPage.value - 1) * perPage;
  return filteredBookings.value.slice(startIndex, startIndex + perPage);
});

const emptyStateText = computed(() => {
  if (selectedTab.value?.id === "new") {
    return "Новых заявок по отелям пока нет.";
  }

  if (selectedTab.value?.id === "completed") {
    return "Завершенных заявок по отелям пока нет.";
  }

  if (selectedTab.value?.id === "cancelled") {
    return "Отмененных заявок по отелям пока нет.";
  }

  return "Активных заявок по отелям пока нет.";
});

const syncPageBounds = () => {
  if (currentPage.value > lastPage.value) {
    currentPage.value = lastPage.value;
  }

  if (currentPage.value < 1) {
    currentPage.value = 1;
  }
};

const loadBookings = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  message.value = "";

  try {
    const response = await api.client({
      url: "/personal-cabinet/bookings/hotels",
      method: "get",
    });

    const items = Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response)
        ? response
        : [];

    bookings.value = sortBookings(items);
    currentPage.value = 1;
  } catch (error) {
    errorMessage.value = error?.message || "Не удалось загрузить мои отели.";
  } finally {
    isLoading.value = false;
  }
};

const changePage = (page) => {
  currentPage.value = Math.min(Math.max(1, Number(page) || 1), lastPage.value);
};

watch(
  () => selectedTab.value?.id,
  () => {
    currentPage.value = 1;
    message.value = "";
    errorMessage.value = "";
  },
);

watch(filteredBookings, syncPageBounds);

onMounted(loadBookings);
</script>

<style lang="scss" scoped>
.my-hotels {
  &__wrapper {
    background-color: $white;
    padding: 28px 28px 32px;
    border-radius: 24px;
    box-shadow: 0px 8px 28px rgba(0, 0, 0, 0.06);
    min-height: 640px;
  }

  &__tabs {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 28px;
    margin-top: 20px;
  }

  &__cards {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__pagination {
    margin: 0 auto;
  }

  &__state,
  &__empty {
    padding: 40px 24px;
    border-radius: 20px;
    background: rgba($red-500, 0.04);
    color: $surface-500;
    text-align: center;
  }

  &__state {
    margin-top: 24px;

    &--error {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: $orange-200;
    }
  }

  &__retry {
    min-height: 42px;
    padding: 0 18px;
    border-radius: 12px;
    color: $white;
    background: $red-500;
    font-size: 14px;
    font-weight: 700;
  }

  &__message,
  &__error {
    margin-top: 18px;
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

@media (max-width: 768px) {
  .my-hotels {
    &__wrapper {
      padding: 20px 16px 24px;
      border-radius: 18px;
      min-height: auto;
    }

    &__body {
      gap: 22px;
    }

    &__cards {
      gap: 16px;
    }
  }
}

@media (max-width: 640px) {
  .my-hotels {
    &__tabs {
      overflow-x: auto;
      justify-content: flex-start;
    }
  }
}
</style>
