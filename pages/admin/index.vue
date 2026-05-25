<template>
  <section class="admin-home">
    <p v-if="message" class="admin-home__message">{{ message }}</p>
    <p v-if="errorMessage" class="admin-home__error">{{ errorMessage }}</p>

    <div v-if="isLoading" class="admin-home__state">Загружаем сводку...</div>

    <template v-else>
      <TheAdminCommonStatGrid :items="stats" />

      <div class="admin-home__summary-grid">
        <article class="admin-home__panel">
          <div class="admin-home__panel-head">
            <h2 class="admin-home__panel-title">Бронирования туров</h2>
            <p class="admin-home__panel-subtitle">
              Всего: {{ bookings.total }}
            </p>
          </div>

          <div class="admin-home__bars">
            <div
              v-for="item in bookingBarItems"
              :key="item.key"
              class="admin-home__bar"
            >
              <div class="admin-home__bar-top">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </div>
              <div class="admin-home__bar-track">
                <div
                  class="admin-home__bar-fill"
                  :style="{ width: `${item.percent}%` }"
                ></div>
              </div>
            </div>
          </div>

          <div class="admin-home__money">
            <span class="admin-home__money-label">Сумма бронирований</span>
            <strong class="admin-home__money-value">
              {{ formatMoney(revenue.totalTourRevenue) }} ₸
            </strong>
          </div>
        </article>

        <article class="admin-home__panel">
          <div class="admin-home__panel-head">
            <h2 class="admin-home__panel-title">Заявки на отели</h2>
            <p class="admin-home__panel-subtitle">
              Всего: {{ hotelRequests.total }}
            </p>
          </div>

          <div class="admin-home__bars">
            <div
              v-for="item in requestBarItems"
              :key="item.key"
              class="admin-home__bar"
            >
              <div class="admin-home__bar-top">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </div>
              <div class="admin-home__bar-track">
                <div
                  class="admin-home__bar-fill admin-home__bar-fill--secondary"
                  :style="{ width: `${item.percent}%` }"
                ></div>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div class="admin-home__tables">
        <article class="admin-home__panel">
          <div class="admin-home__panel-head">
            <h2 class="admin-home__panel-title">Последние бронирования</h2>
          </div>

          <div v-if="!recentBookings.length" class="admin-home__empty">
            Бронирований пока нет.
          </div>

          <div v-else class="admin-home__table-wrap">
            <table class="admin-home__table">
              <thead>
                <tr>
                  <th>Тур</th>
                  <th>Клиент</th>
                  <th>Дата</th>
                  <th>Гостей</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="booking in recentBookings" :key="booking._id">
                  <td>{{ booking?.tour?.title || "Тур" }}</td>
                  <td>{{ booking?.customer?.name || "Пользователь" }}</td>
                  <td>{{ formatDate(booking.date) }}</td>
                  <td>{{ booking.guests || 0 }}</td>
                  <td>{{ formatMoney(booking.total) }} ₸</td>
                  <td>
                    <span
                      class="admin-home__badge"
                      :class="`admin-home__badge--${booking.status}`"
                    >
                      {{ getBookingStatusLabel(booking.status) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <article class="admin-home__panel">
          <div class="admin-home__panel-head">
            <h2 class="admin-home__panel-title">Последние заявки на отели</h2>
          </div>

          <div v-if="!recentRequests.length" class="admin-home__empty">
            Заявок пока нет.
          </div>

          <div v-else class="admin-home__table-wrap">
            <table class="admin-home__table">
              <thead>
                <tr>
                  <th>Отель</th>
                  <th>Клиент</th>
                  <th>Заезд</th>
                  <th>Выезд</th>
                  <th>Гостей</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="request in recentRequests" :key="request._id">
                  <td>{{ request?.hotel?.name || "Отель" }}</td>
                  <td>{{ request?.name || "Клиент" }}</td>
                  <td>{{ formatDate(request.checkIn) }}</td>
                  <td>{{ formatDate(request.checkOut) }}</td>
                  <td>{{ request.guests || 1 }}</td>
                  <td>
                    <span
                      class="admin-home__badge"
                      :class="`admin-home__badge--${request.status}`"
                    >
                      {{ getRequestStatusLabel(request.status) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </template>
  </section>
</template>

<script setup>
definePageMeta({
  layout: "admin",
  middleware: "admin",
});

useSeo({
  title: "Админ-панель",
  description: "Рабочий стол админ-панели FlyAway.",
});

const api = useApi();

const isLoading = ref(false);
const message = ref("");
const errorMessage = ref("");

const stats = ref([
  { label: "Пользователи", value: 0 },
  { label: "Партнеры", value: 0 },
  { label: "Туры", value: 0 },
  { label: "Отели", value: 0 },
  { label: "Брони туров", value: 0 },
  { label: "Заявки на отели", value: 0 },
]);

const bookings = ref({
  total: 0,
  active: 0,
  completed: 0,
  cancelled: 0,
});

const hotelRequests = ref({
  total: 0,
  new: 0,
  in_progress: 0,
  contacted: 0,
  closed: 0,
  cancelled: 0,
});

const revenue = ref({
  totalTourRevenue: 0,
});

const recentBookings = ref([]);
const recentRequests = ref([]);

const formatMoney = (value) => Number(value || 0).toLocaleString("ru-RU");

const formatDate = (value) => {
  if (!value) return "Не указано";

  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(String(value))
    ? new Date(`${value}T00:00:00`)
    : new Date(value);

  if (Number.isNaN(parsed.getTime())) return String(value);

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

const getPercent = (value, total) => {
  if (!total) return 0;
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
};

const bookingBarItems = computed(() => [
  {
    key: "active",
    label: "Активные",
    value: bookings.value.active || 0,
    percent: getPercent(bookings.value.active || 0, bookings.value.total || 0),
  },
  {
    key: "completed",
    label: "Завершенные",
    value: bookings.value.completed || 0,
    percent: getPercent(
      bookings.value.completed || 0,
      bookings.value.total || 0,
    ),
  },
  {
    key: "cancelled",
    label: "Отмененные",
    value: bookings.value.cancelled || 0,
    percent: getPercent(
      bookings.value.cancelled || 0,
      bookings.value.total || 0,
    ),
  },
]);

const requestBarItems = computed(() => [
  {
    key: "new",
    label: "Новые",
    value: hotelRequests.value.new || 0,
    percent: getPercent(
      hotelRequests.value.new || 0,
      hotelRequests.value.total || 0,
    ),
  },
  {
    key: "in_progress",
    label: "В работе",
    value: hotelRequests.value.in_progress || 0,
    percent: getPercent(
      hotelRequests.value.in_progress || 0,
      hotelRequests.value.total || 0,
    ),
  },
  {
    key: "contacted",
    label: "Связались",
    value: hotelRequests.value.contacted || 0,
    percent: getPercent(
      hotelRequests.value.contacted || 0,
      hotelRequests.value.total || 0,
    ),
  },
  {
    key: "closed",
    label: "Закрыто",
    value: hotelRequests.value.closed || 0,
    percent: getPercent(
      hotelRequests.value.closed || 0,
      hotelRequests.value.total || 0,
    ),
  },
  {
    key: "cancelled",
    label: "Отменено",
    value: hotelRequests.value.cancelled || 0,
    percent: getPercent(
      hotelRequests.value.cancelled || 0,
      hotelRequests.value.total || 0,
    ),
  },
]);

const getBookingStatusLabel = (status) => {
  if (status === "completed") return "Завершено";
  if (status === "cancelled") return "Отменено";
  return "Активно";
};

const getRequestStatusLabel = (status) => {
  if (status === "in_progress") return "В работе";
  if (status === "contacted") return "Связались";
  if (status === "closed") return "Закрыто";
  if (status === "cancelled") return "Отменено";
  return "Новая";
};

const loadDashboard = async () => {
  isLoading.value = true;
  message.value = "";
  errorMessage.value = "";

  try {
    const response = await api.client({
      url: "/dashboard/summary",
      method: "get",
    });

    stats.value = Array.isArray(response?.data?.stats)
      ? response.data.stats
      : [];
    bookings.value = response?.data?.bookings || bookings.value;
    hotelRequests.value = response?.data?.hotelRequests || hotelRequests.value;
    revenue.value = response?.data?.revenue || revenue.value;
    recentBookings.value = Array.isArray(response?.data?.recentBookings)
      ? response.data.recentBookings
      : [];
    recentRequests.value = Array.isArray(response?.data?.recentRequests)
      ? response.data.recentRequests
      : [];
  } catch (error) {
    errorMessage.value =
      error?.message || "Не удалось загрузить сводку панели.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadDashboard);
</script>

<style lang="scss" scoped>
.admin-home {
  display: grid;
  gap: 16px;

  &__header {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-end;
  }

  &__title {
    color: $surface-900;
    font-size: 28px;
    font-weight: 700;
    line-height: 1.05;
  }

  &__text {
    margin-top: 4px;
    color: $surface-500;
    font-size: 14px;
    line-height: 1.45;
  }

  &__reload {
    min-height: 42px;
    padding: 0 14px;
    border-radius: 10px;
    color: $red-500;
    background: rgba($red-500, 0.06);
    border: 1px solid rgba($red-500, 0.14);
    font-weight: 700;
  }

  &__summary-grid,
  &__tables {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  &__panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 18px;
    overflow-x: scroll;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba($red-500, 0.08);
  }

  &__panel-head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;
  }

  &__panel-title {
    color: $surface-900;
    font-size: 18px;
    font-weight: 700;
  }

  &__panel-subtitle {
    color: $surface-500;
    font-size: 13px;
  }

  &__bars {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__bar {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__bar-top {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    color: $surface-900;
    font-size: 14px;
  }

  &__bar-track {
    width: 100%;
    height: 10px;
    border-radius: 999px;
    background: rgba($surface-300, 0.2);
    overflow: hidden;
  }

  &__bar-fill {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, $red-500 0%, rgba($red-500, 0.45) 100%);

    &--secondary {
      background: linear-gradient(
        90deg,
        $blue-500 0%,
        rgba($blue-500, 0.45) 100%
      );
    }
  }

  &__money {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
    padding: 14px 16px;
    border-radius: 14px;
    background: rgba($red-500, 0.04);
  }

  &__money-label {
    color: $surface-500;
    font-size: 14px;
  }

  &__money-value {
    color: $red-500;
    font-size: 20px;
    font-weight: 800;
  }

  &__table-wrap {
    overflow-x: auto;
  }

  &__table {
    width: 100%;
    border-collapse: collapse;
    min-width: 620px;

    th,
    td {
      padding: 10px 8px;
      text-align: left;
      border-bottom: 1px solid rgba($surface-300, 0.25);
      vertical-align: top;
      font-size: 14px;
    }

    th {
      color: $surface-500;
      font-weight: 700;
    }

    td {
      color: $surface-900;
    }
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    min-height: 26px;
    padding: 0 10px;
    border-radius: 999px;
    color: $white;
    font-size: 12px;
    font-weight: 700;

    &--active,
    &--new {
      background: $red-500;
    }

    &--completed,
    &--in_progress {
      background: $blue-500;
    }

    &--contacted {
      background: $green-400;
    }

    &--closed {
      background: $surface-900;
    }

    &--cancelled {
      background: $surface-400;
    }
  }

  &__empty,
  &__state {
    padding: 28px 16px;
    border-radius: 16px;
    background: rgba($red-500, 0.04);
    color: $surface-500;
    text-align: center;
  }

  &__message,
  &__error {
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

@media (max-width: 1024px) {
  .admin-home {
    display: flex;
    flex-direction: column;
    &__summary-grid,
    &__tables {
      grid-template-columns: 1fr;
    }
  }
}

@media (max-width: 700px) {
  .admin-home {
    &__header {
      flex-direction: column;
      align-items: stretch;
    }
  }
}
</style>
