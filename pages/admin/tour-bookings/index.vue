<template>
  <section class="admin-bookings">
    <div class="admin-bookings__head">
      <div>
        <h2 class="admin-bookings__title-page">Бронирования туров</h2>
        <p class="admin-bookings__page-text">
          Контроль активных поездок, завершённых туров, отмен и способов оплаты
          по всем бронированиям.
        </p>
      </div>

      <div class="admin-bookings__head-actions">
        <button class="admin-bookings__reload" type="button" @click="loadBookings">
          Обновить
        </button>
      </div>
    </div>

    <div class="admin-bookings__stats">
      <article
        v-for="item in statItems"
        :key="item.label"
        class="admin-bookings__stat"
      >
        <p class="admin-bookings__stat-value">{{ item.value }}</p>
        <p class="admin-bookings__stat-label">{{ item.label }}</p>
      </article>
    </div>

    <div class="admin-bookings__toolbar">
      <div class="admin-bookings__filters">
        <UiSelect
          label="Статус"
          v-model="selectedStatus"
          :options="statusOptions"
          option-label="label"
          option-value="value"
        />
      </div>
    </div>

    <p v-if="message" class="admin-bookings__message">{{ message }}</p>
    <p v-if="errorMessage" class="admin-bookings__error">{{ errorMessage }}</p>

    <div v-if="isLoading" class="admin-bookings__state">
      Загружаем бронирования...
    </div>

    <div v-else-if="!bookings.length" class="admin-bookings__state">
      Бронирований пока нет.
    </div>

    <div v-else class="admin-bookings__list">
      <article
        v-for="booking in bookings"
        :key="booking._id"
        class="admin-bookings__card"
      >
        <div class="admin-bookings__card-head">
          <div>
            <h3 class="admin-bookings__title">
              {{ booking?.tour?.title || "Тур" }}
            </h3>
            <p class="admin-bookings__meta">
              {{ booking?.customer?.name || "Пользователь" }}
              <span v-if="booking?.customer?.phone">
                • {{ booking.customer.phone }}
              </span>
              <span v-if="booking?.customer?.email">
                • {{ booking.customer.email }}
              </span>
            </p>
          </div>

          <span
            class="admin-bookings__status"
            :class="`admin-bookings__status--${booking.status}`"
          >
            {{ getStatusLabel(booking.status) }}
          </span>
        </div>

        <div class="admin-bookings__grid">
          <div class="admin-bookings__field">
            <span class="admin-bookings__label">Дата</span>
            <span class="admin-bookings__value">{{ formatDate(booking.date) }}</span>
          </div>

          <div class="admin-bookings__field">
            <span class="admin-bookings__label">Гостей</span>
            <span class="admin-bookings__value">{{ booking.guests || 0 }}</span>
          </div>

          <div class="admin-bookings__field">
            <span class="admin-bookings__label">Сумма</span>
            <span class="admin-bookings__value">{{ formatMoney(booking.total) }} ₸</span>
          </div>

          <div class="admin-bookings__field">
            <span class="admin-bookings__label">Оплата</span>
            <span class="admin-bookings__value">{{ getPaymentLabel(booking.paymentMethod) }}</span>
          </div>

          <div class="admin-bookings__field">
            <span class="admin-bookings__label">Создано</span>
            <span class="admin-bookings__value">{{ formatDateTime(booking.createdAt) }}</span>
          </div>

          <div class="admin-bookings__field">
            <span class="admin-bookings__label">Партнер</span>
            <span class="admin-bookings__value">{{ booking?.tour?.partner?.title || '—' }}</span>
          </div>

          <div class="admin-bookings__field admin-bookings__field--full">
            <span class="admin-bookings__label">Билеты</span>
            <span class="admin-bookings__value">
              {{ getTicketsSummary(booking.ticketSelections) || 'Не выбраны' }}
            </span>
          </div>
        </div>

        <div class="admin-bookings__actions">
          <UiSelect
            label="Изменить статус"
            :model-value="booking.status"
            :options="statusOptions.filter((item) => item.value)"
            option-label="label"
            option-value="value"
            @update:model-value="updateStatus(booking, $event)"
          />
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
definePageMeta({
  layout: "admin",
  middleware: "admin",
});

useSeo({
  title: "Бронирования туров",
  description: "Управление бронированиями туров FlyAway.",
});

const api = useApi();

const bookings = ref([]);
const isLoading = ref(false);
const message = ref("");
const errorMessage = ref("");
const selectedStatus = ref("");

const statusOptions = [
  { label: "Все", value: "" },
  { label: "Активные", value: "active" },
  { label: "Завершенные", value: "completed" },
  { label: "Отмененные", value: "cancelled" },
];

const formatMoney = (value) => Number(value || 0).toLocaleString("ru-RU");

const formatDate = (value) => {
  if (!value) return "Дата не указана";

  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(String(value))
    ? new Date(`${value}T00:00:00`)
    : new Date(value);

  if (Number.isNaN(parsed.getTime())) return String(value);

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
};

const formatDateTime = (value) => {
  if (!value) return "Не указано";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
};

const getStatusLabel = (status) => {
  if (status === "completed") return "Завершено";
  if (status === "cancelled") return "Отменено";
  return "Активно";
};

const getPaymentLabel = (method) => {
  if (method === "bonus") return "Бонусы";
  return "Карта";
};

const getTicketsSummary = (ticketSelections) => {
  const items = Array.isArray(ticketSelections) ? ticketSelections : [];

  return items
    .filter((item) => Number(item?.quantity) > 0)
    .map((item) => `${item.title || "Билет"} × ${item.quantity}`)
    .join(", ");
};

const statItems = computed(() => {
  const total = bookings.value.length;
  const active = bookings.value.filter((item) => item?.status === "active").length;
  const completed = bookings.value.filter((item) => item?.status === "completed").length;
  const revenue = bookings.value.reduce((sum, item) => sum + (Number(item?.total) || 0), 0);

  return [
    { label: "Всего броней", value: total },
    { label: "Активные", value: active },
    { label: "Завершенные", value: completed },
    { label: "Сумма броней", value: `${formatMoney(revenue)} ₸` },
  ];
});

const loadBookings = async () => {
  isLoading.value = true;
  message.value = "";
  errorMessage.value = "";

  try {
    const response = await api.client({
      url: "/tour-bookings/manage",
      method: "get",
      query: {
        status: selectedStatus.value || undefined,
      },
    });

    bookings.value = Array.isArray(response?.data) ? response.data : [];
  } catch (error) {
    errorMessage.value = error?.message || "Не удалось загрузить бронирования.";
  } finally {
    isLoading.value = false;
  }
};

const updateStatus = async (booking, status) => {
  if (!booking?._id || !status || booking.status === status) {
    return;
  }

  message.value = "";
  errorMessage.value = "";

  try {
    const response = await api.client({
      url: `/tour-bookings/${booking._id}/status`,
      method: "patch",
      data: { status },
    });

    bookings.value = bookings.value.map((item) =>
      item._id === booking._id ? response?.data || item : item,
    );

    message.value = "Статус бронирования обновлен.";
  } catch (error) {
    errorMessage.value =
      error?.message || "Не удалось обновить статус бронирования.";
  }
};

watch(selectedStatus, loadBookings);

onMounted(loadBookings);
</script>

<style lang="scss" scoped>
.admin-bookings {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__head {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-end;
  }

  &__title-page {
    color: $surface-900;
    font-size: 28px;
    font-weight: 700;
    line-height: 1.05;
  }

  &__page-text {
    margin-top: 6px;
    max-width: 760px;
    color: $surface-500;
    font-size: 14px;
    line-height: 1.45;
  }

  &__head-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }

  &__stat {
    padding: 18px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba($red-500, 0.08);
    box-shadow: 0 10px 26px rgba(32, 36, 38, 0.04);
  }

  &__stat-value {
    color: $red-500;
    font-size: 28px;
    font-weight: 800;
    line-height: 1;
  }

  &__stat-label {
    margin-top: 10px;
    color: $surface-500;
    font-size: 13px;
    line-height: 1.4;
  }

  &__toolbar {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-end;
  }

  &__filters {
    max-width: 260px;
    width: 100%;
  }

  &__reload {
    min-height: 44px;
    padding: 0 16px;
    border-radius: 12px;
    color: $red-500;
    background: rgba($red-500, 0.06);
    border: 1px solid rgba($red-500, 0.14);
    font-weight: 700;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  &__card {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 18px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba($red-500, 0.08);
    box-shadow: 0 10px 26px rgba(32, 36, 38, 0.04);
  }

  &__card-head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;
  }

  &__title {
    color: $surface-900;
    font-size: 20px;
    font-weight: 700;
  }

  &__meta {
    margin-top: 4px;
    color: $surface-500;
    line-height: 1.45;
  }

  &__status {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    padding: 0 10px;
    border-radius: 999px;
    color: $white;
    font-size: 12px;
    font-weight: 700;

    &--active {
      background: $red-500;
    }

    &--completed {
      background: $blue-500;
    }

    &--cancelled {
      background: $surface-400;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px 18px;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 4px;

    &--full {
      grid-column: 1 / -1;
    }
  }

  &__label {
    color: $surface-500;
    font-size: 13px;
  }

  &__value {
    color: $surface-900;
    font-weight: 600;
    line-height: 1.45;
  }

  &__actions {
    max-width: 280px;
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

  &__state {
    padding: 28px 16px;
    border-radius: 16px;
    background: rgba($red-500, 0.04);
    color: $surface-500;
    text-align: center;
  }
}

@media (max-width: 1100px) {
  .admin-bookings {
    &__stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    &__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}

@media (max-width: 700px) {
  .admin-bookings {
    &__head,
    &__toolbar {
      flex-direction: column;
      align-items: stretch;
    }

    &__filters,
    &__actions {
      max-width: 100%;
    }

    &__stats,
    &__grid {
      grid-template-columns: 1fr;
    }

    &__card-head {
      flex-direction: column;
    }
  }
}
</style>
