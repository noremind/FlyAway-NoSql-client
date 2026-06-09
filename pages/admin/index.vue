<template>
  <section class="admin-home">
    <div class="admin-home__header"></div>

    <p v-if="message" class="admin-home__message">{{ message }}</p>
    <p v-if="errorMessage" class="admin-home__error">{{ errorMessage }}</p>
    <div v-if="isLoading" class="admin-home__state">Загружаем сводку...</div>

    <template v-else>
      <TheAdminCommonStatGrid :items="stats" />

      <section class="admin-home__filters">
        <UiSelect
          label="Период"
          :options="rangeOptions"
          option-label="label"
          option-value="value"
          v-model="rangeDays"
        />
        <UiSelect
          label="Метрика"
          :options="metricOptions"
          option-label="label"
          option-value="value"
          v-model="selectedMetric"
        />
        <UiSelect
          label="Тип графика"
          :options="chartTypeOptions"
          option-label="label"
          option-value="value"
          v-model="selectedChartType"
        />
      </section>

      <section class="admin-home__summary-grid">
        <article class="admin-home__panel admin-home__panel--wide">
          <div class="admin-home__panel-head">
            <div>
              <h2 class="admin-home__panel-title">Динамика за период</h2>
              <p class="admin-home__panel-subtitle">
                {{ selectedMetricLabel }}
              </p>
            </div>
          </div>
          <ClientOnly>
            <ApexChart
              height="340"
              :type="selectedChartType"
              :options="timelineChartOptions"
              :series="timelineSeries"
            />
          </ClientOnly>
        </article>

        <article class="admin-home__panel">
          <div class="admin-home__panel-head">
            <div>
              <h2 class="admin-home__panel-title">Оплата</h2>
              <p class="admin-home__panel-subtitle">
                Деньги: {{ payments.moneyPercent || 0 }}% • Бонусы:
                {{ payments.bonusPercent || 0 }}%
              </p>
            </div>
          </div>
          <ClientOnly>
            <ApexChart
              height="300"
              type="donut"
              :options="paymentChartOptions"
              :series="paymentSeries"
            />
          </ClientOnly>
          <div class="admin-home__money">
            <span class="admin-home__money-label">Общая сумма</span>
            <strong class="admin-home__money-value"
              >{{ formatMoney(payments.totalAmount) }} ₸</strong
            >
          </div>
        </article>
      </section>

      <section class="admin-home__summary-grid">
        <article class="admin-home__panel">
          <div class="admin-home__panel-head">
            <div>
              <h2 class="admin-home__panel-title">Статусы бронирований</h2>
              <p class="admin-home__panel-subtitle">
                Всего: {{ bookings.total || 0 }}
              </p>
            </div>
          </div>
          <ClientOnly>
            <ApexChart
              height="300"
              type="pie"
              :options="bookingStatusChartOptions"
              :series="bookingStatusSeries"
            />
          </ClientOnly>
        </article>

        <article class="admin-home__panel">
          <div class="admin-home__panel-head">
            <div>
              <h2 class="admin-home__panel-title">Статусы заявок на отели</h2>
              <p class="admin-home__panel-subtitle">
                Всего: {{ hotelRequests.total || 0 }}
              </p>
            </div>
          </div>
          <ClientOnly>
            <ApexChart
              height="300"
              type="donut"
              :options="requestStatusChartOptions"
              :series="requestStatusSeries"
            />
          </ClientOnly>
        </article>
      </section>

      <section class="admin-home__summary-grid">
        <article class="admin-home__panel">
          <div class="admin-home__panel-head">
            <div>
              <h2 class="admin-home__panel-title">Топ туров</h2>
              <p class="admin-home__panel-subtitle">По выручке и просмотрам</p>
            </div>
          </div>
          <ClientOnly>
            <ApexChart
              height="320"
              type="bar"
              :options="topToursChartOptions"
              :series="topToursSeries"
            />
          </ClientOnly>
        </article>

        <article class="admin-home__panel">
          <div class="admin-home__panel-head">
            <div>
              <h2 class="admin-home__panel-title">Топ отелей</h2>
              <p class="admin-home__panel-subtitle">По заявкам и просмотрам</p>
            </div>
          </div>
          <ClientOnly>
            <ApexChart
              height="320"
              type="bar"
              :options="topHotelsChartOptions"
              :series="topHotelsSeries"
            />
          </ClientOnly>
        </article>
      </section>

      <section class="admin-home__tables">
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
                  <th>Сумма</th>
                  <th>Оплата</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="booking in recentBookings" :key="booking._id">
                  <td>{{ booking?.tour?.title || "Тур" }}</td>
                  <td>{{ booking?.customer?.name || "Пользователь" }}</td>
                  <td>{{ formatDate(booking.date) }}</td>
                  <td>{{ formatMoney(booking.total) }} ₸</td>
                  <td>{{ getPaymentLabel(booking) }}</td>
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
      </section>
    </template>
  </section>
</template>

<script setup>
definePageMeta({ layout: "admin", middleware: "admin" });

useSeo({
  title: "Админ-панель",
  description: "Рабочий стол админ-панели FlyAway.",
});

const api = useApi();

const isLoading = ref(false);
const message = ref("");
const errorMessage = ref("");
const rangeDays = ref(30);
const selectedMetric = ref("revenue");
const selectedChartType = ref("line");

const rangeOptions = [
  { label: "7 дней", value: 7 },
  { label: "30 дней", value: 30 },
  { label: "90 дней", value: 90 },
];
const metricOptions = [
  { label: "Выручка", value: "revenue" },
  { label: "Просмотры", value: "views" },
  { label: "Брони туров", value: "bookings" },
  { label: "Заявки на отели", value: "hotelRequests" },
];
const chartTypeOptions = [
  { label: "Line chart", value: "line" },
  { label: "Column chart", value: "bar" },
  { label: "Area chart", value: "area" },
];

const stats = ref([]);
const bookings = ref({ total: 0, active: 0, completed: 0, cancelled: 0 });
const hotelRequests = ref({
  total: 0,
  new: 0,
  in_progress: 0,
  contacted: 0,
  closed: 0,
  cancelled: 0,
});
const payments = ref({
  moneyAmount: 0,
  bonusAmount: 0,
  totalAmount: 0,
  moneyPercent: 0,
  bonusPercent: 0,
});
const charts = ref({
  timeline: [],
  bookingStatuses: [],
  requestStatuses: [],
  payments: [],
  topTours: [],
  topHotels: [],
});
const recentBookings = ref([]);
const recentRequests = ref([]);

const selectedMetricLabel = computed(
  () =>
    metricOptions.find((item) => item.value === selectedMetric.value)?.label ||
    "Метрика",
);
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

const baseChartOptions = computed(() => ({
  chart: { toolbar: { show: false }, animations: { enabled: true } },
  dataLabels: { enabled: false },
  stroke: { curve: "smooth", width: 3 },
  grid: { borderColor: "rgba(142, 142, 147, 0.18)" },
  tooltip: {
    y: { formatter: (value) => Number(value || 0).toLocaleString("ru-RU") },
  },
}));

const timelineLabels = computed(() =>
  charts.value.timeline.map((item) => item.label || item.date),
);
const timelineSeries = computed(() => [
  {
    name: selectedMetricLabel.value,
    data: charts.value.timeline.map(
      (item) => Number(item?.[selectedMetric.value]) || 0,
    ),
  },
]);
const timelineChartOptions = computed(() => ({
  ...baseChartOptions.value,
  xaxis: { categories: timelineLabels.value },
}));

const paymentSeries = computed(() => [
  Number(payments.value.moneyAmount) || 0,
  Number(payments.value.bonusAmount) || 0,
]);
const paymentChartOptions = computed(() => ({
  ...baseChartOptions.value,
  labels: ["Деньгами", "Бонусами"],
  legend: { position: "bottom" },
}));

const bookingStatusSeries = computed(() =>
  (charts.value.bookingStatuses || []).map((item) => Number(item.value) || 0),
);
const bookingStatusChartOptions = computed(() => ({
  ...baseChartOptions.value,
  labels: (charts.value.bookingStatuses || []).map((item) => item.label),
  legend: { position: "bottom" },
}));
const requestStatusSeries = computed(() =>
  (charts.value.requestStatuses || []).map((item) => Number(item.value) || 0),
);
const requestStatusChartOptions = computed(() => ({
  ...baseChartOptions.value,
  labels: (charts.value.requestStatuses || []).map((item) => item.label),
  legend: { position: "bottom" },
}));

const topToursSeries = computed(() => [
  {
    name: "Выручка",
    data: (charts.value.topTours || []).map(
      (item) => Number(item.revenue) || 0,
    ),
  },
]);
const topToursChartOptions = computed(() => ({
  ...baseChartOptions.value,
  plotOptions: { bar: { horizontal: true } },
  xaxis: {
    categories: (charts.value.topTours || []).map(
      (item) => item.title || "Тур",
    ),
  },
}));
const topHotelsSeries = computed(() => [
  {
    name: "Заявки",
    data: (charts.value.topHotels || []).map(
      (item) => Number(item.requests) || 0,
    ),
  },
]);
const topHotelsChartOptions = computed(() => ({
  ...baseChartOptions.value,
  plotOptions: { bar: { horizontal: true } },
  xaxis: {
    categories: (charts.value.topHotels || []).map(
      (item) => item.title || "Отель",
    ),
  },
}));

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
const getPaymentLabel = (booking) => {
  if (
    Number(booking?.paidWithBonuses) > 0 &&
    Number(booking?.paidWithMoney) > 0
  )
    return "Деньги + бонусы";
  if (Number(booking?.paidWithBonuses) > 0) return "Бонусы";
  return "Карта";
};

const loadDashboard = async () => {
  isLoading.value = true;
  message.value = "";
  errorMessage.value = "";
  try {
    const response = await api.client({
      url: "/dashboard/summary",
      method: "get",
      query: { rangeDays: rangeDays.value },
    });
    const data = response?.data || {};
    stats.value = Array.isArray(data.stats) ? data.stats : [];
    bookings.value = data.bookings || bookings.value;
    hotelRequests.value = data.hotelRequests || hotelRequests.value;
    payments.value = data.payments || payments.value;
    charts.value = data.charts || charts.value;
    recentBookings.value = Array.isArray(data.recentBookings)
      ? data.recentBookings
      : [];
    recentRequests.value = Array.isArray(data.recentRequests)
      ? data.recentRequests
      : [];
  } catch (error) {
    errorMessage.value =
      error?.message || "Не удалось загрузить сводку панели.";
  } finally {
    isLoading.value = false;
  }
};

watch(rangeDays, loadDashboard);
onMounted(loadDashboard);
</script>

<style lang="scss" scoped>
.admin-home {
  display: grid;
  gap: 18px;

  &__header,
  &__filters {
    display: grid;
    gap: 14px;
    padding: 18px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba($red-500, 0.08);
  }

  &__header {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: end;
  }
  &__filters {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  &__eyebrow {
    color: $red-500;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  &__title {
    color: $surface-900;
    font-size: 28px;
    font-weight: 800;
    line-height: 1.05;
  }
  &__text {
    margin-top: 8px;
    color: $surface-500;
    font-size: 14px;
    line-height: 1.45;
    max-width: 840px;
  }
  &__reload {
    min-height: 42px;
    padding: 0 16px;
    border-radius: 12px;
    color: $red-500;
    background: rgba($red-500, 0.06);
    border: 1px solid rgba($red-500, 0.14);
    font-weight: 800;
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
    overflow: hidden;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba($red-500, 0.08);
    box-shadow: 0 10px 26px rgba(32, 36, 38, 0.04);
    &--wide {
      grid-column: span 1;
    }
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
    font-weight: 800;
  }
  &__panel-subtitle {
    color: $surface-500;
    font-size: 13px;
    margin-top: 4px;
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
    font-weight: 900;
  }
  &__table-wrap {
    overflow-x: auto;
  }
  &__table {
    width: 100%;
    border-collapse: collapse;
    min-width: 680px;
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
      font-weight: 800;
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
    font-weight: 800;
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
  &__message {
    color: $green-400;
    font-size: 14px;
    font-weight: 700;
  }
  &__error {
    color: $orange-200;
    font-size: 14px;
    font-weight: 700;
  }
}

@media (max-width: 1100px) {
  .admin-home {
    &__summary-grid,
    &__tables,
    &__filters,
    &__header {
      grid-template-columns: 1fr;
    }
  }
}
</style>
