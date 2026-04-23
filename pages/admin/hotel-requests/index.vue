<template>
  <section class="admin-hotel-requests">
    <div class="admin-hotel-requests__head">
      <div>
        <h2 class="admin-hotel-requests__title-page">Заявки на отели</h2>
        <p class="admin-hotel-requests__page-text">
          Контроль входящих заявок, статусов обработки и заметок менеджера по
          каждому бронированию.
        </p>
      </div>

      <div class="admin-hotel-requests__head-actions">
        <button class="admin-hotel-requests__reload" type="button" @click="loadRequests">
          Обновить
        </button>
      </div>
    </div>

    <div class="admin-hotel-requests__stats">
      <article
        v-for="item in statItems"
        :key="item.label"
        class="admin-hotel-requests__stat"
      >
        <p class="admin-hotel-requests__stat-value">{{ item.value }}</p>
        <p class="admin-hotel-requests__stat-label">{{ item.label }}</p>
      </article>
    </div>

    <div class="admin-hotel-requests__toolbar">
      <div class="admin-hotel-requests__filters">
        <UiSelect
          label="Статус"
          v-model="selectedStatus"
          :options="statusOptions"
          option-label="label"
          option-value="value"
        />
      </div>
    </div>

    <p v-if="message" class="admin-hotel-requests__message">{{ message }}</p>
    <p v-if="errorMessage" class="admin-hotel-requests__error">
      {{ errorMessage }}
    </p>

    <div v-if="isLoading" class="admin-hotel-requests__state">
      Загружаем заявки...
    </div>

    <div v-else-if="!requests.length" class="admin-hotel-requests__state">
      Заявок пока нет.
    </div>

    <div v-else class="admin-hotel-requests__list">
      <article
        v-for="request in requests"
        :key="request._id"
        class="admin-hotel-requests__card"
      >
        <div class="admin-hotel-requests__card-head">
          <div>
            <h3 class="admin-hotel-requests__title">
              {{ request?.hotel?.name || "Отель" }}
            </h3>
            <p class="admin-hotel-requests__meta">
              {{ request?.name || "Клиент" }}
              <span v-if="request?.phone"> • {{ request.phone }} </span>
              <span v-if="request?.email"> • {{ request.email }} </span>
            </p>
          </div>

          <span
            class="admin-hotel-requests__status"
            :class="`admin-hotel-requests__status--${request.status}`"
          >
            {{ getStatusLabel(request.status) }}
          </span>
        </div>

        <div class="admin-hotel-requests__grid">
          <div class="admin-hotel-requests__field">
            <span class="admin-hotel-requests__label">Заезд</span>
            <span class="admin-hotel-requests__value">
              {{ formatDate(request.checkIn) }}
            </span>
          </div>

          <div class="admin-hotel-requests__field">
            <span class="admin-hotel-requests__label">Выезд</span>
            <span class="admin-hotel-requests__value">
              {{ formatDate(request.checkOut) }}
            </span>
          </div>

          <div class="admin-hotel-requests__field">
            <span class="admin-hotel-requests__label">Гостей</span>
            <span class="admin-hotel-requests__value">
              {{ request.guests || 1 }}
            </span>
          </div>

          <div class="admin-hotel-requests__field">
            <span class="admin-hotel-requests__label">Создано</span>
            <span class="admin-hotel-requests__value">
              {{ formatDateTime(request.createdAt) }}
            </span>
          </div>

          <div class="admin-hotel-requests__field">
            <span class="admin-hotel-requests__label">Партнер</span>
            <span class="admin-hotel-requests__value">
              {{ request?.partner?.title || request?.hotel?.partner?.title || '—' }}
            </span>
          </div>

          <div class="admin-hotel-requests__field">
            <span class="admin-hotel-requests__label">Локация</span>
            <span class="admin-hotel-requests__value">
              {{ request?.hotel?.location || '—' }}
            </span>
          </div>

          <div
            class="admin-hotel-requests__field admin-hotel-requests__field--full"
          >
            <span class="admin-hotel-requests__label">Комментарий клиента</span>
            <span class="admin-hotel-requests__value">
              {{ request.comment || "Без комментария" }}
            </span>
          </div>
        </div>

        <div class="admin-hotel-requests__actions">
          <UiSelect
            label="Статус"
            :model-value="request.status"
            :options="statusOptions.filter((item) => item.value)"
            option-label="label"
            option-value="value"
            @update:model-value="updateStatus(request, $event)"
          />

          <UiTextarea
            label="Заметка менеджера"
            :model-value="request.managerNote || ''"
            @update:model-value="updateManagerNote(request, $event)"
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
  title: "Заявки на отели",
  description: "Управление заявками на отели FlyAway.",
});

const api = useApi();

const requests = ref([]);
const isLoading = ref(false);
const message = ref("");
const errorMessage = ref("");
const selectedStatus = ref("");

const statusOptions = [
  { label: "Все", value: "" },
  { label: "Новые", value: "new" },
  { label: "В работе", value: "in_progress" },
  { label: "Связались", value: "contacted" },
  { label: "Закрыто", value: "closed" },
  { label: "Отменено", value: "cancelled" },
];

const pendingNotes = reactive({});

const getStatusLabel = (status) => {
  if (status === "in_progress") return "В работе";
  if (status === "contacted") return "Связались";
  if (status === "closed") return "Закрыто";
  if (status === "cancelled") return "Отменено";
  return "Новая";
};

const formatDate = (value) => {
  if (!value) return "Не указано";

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

const statItems = computed(() => {
  const total = requests.value.length;
  const fresh = requests.value.filter((item) => item?.status === "new").length;
  const inProgress = requests.value.filter((item) => item?.status === "in_progress").length;
  const closed = requests.value.filter((item) => item?.status === "closed").length;

  return [
    { label: "Всего заявок", value: total },
    { label: "Новые", value: fresh },
    { label: "В работе", value: inProgress },
    { label: "Закрытые", value: closed },
  ];
});

const loadRequests = async () => {
  isLoading.value = true;
  message.value = "";
  errorMessage.value = "";

  try {
    const response = await api.client({
      url: "/hotel-requests/manage",
      method: "get",
      query: {
        status: selectedStatus.value || undefined,
      },
    });

    requests.value = Array.isArray(response?.data) ? response.data : [];

    for (const item of requests.value) {
      pendingNotes[item._id] = item.managerNote || "";
    }
  } catch (error) {
    errorMessage.value = error?.message || "Не удалось загрузить заявки.";
  } finally {
    isLoading.value = false;
  }
};

const updateManagerNote = (request, value) => {
  pendingNotes[request._id] = value;
};

const updateStatus = async (request, status) => {
  if (!request?._id || !status) {
    return;
  }

  message.value = "";
  errorMessage.value = "";

  try {
    const response = await api.client({
      url: `/hotel-requests/${request._id}/status`,
      method: "patch",
      data: {
        status,
        managerNote: pendingNotes[request._id] || "",
      },
    });

    requests.value = requests.value.map((item) =>
      item._id === request._id ? response?.data || item : item,
    );

    message.value = "Статус заявки обновлен.";
  } catch (error) {
    errorMessage.value = error?.message || "Не удалось обновить статус заявки.";
  }
};

watch(selectedStatus, loadRequests);

onMounted(loadRequests);
</script>

<style lang="scss" scoped>
.admin-hotel-requests {
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

    &--new {
      background: $red-500;
    }

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
    display: grid;
    grid-template-columns: minmax(0, 260px) minmax(0, 1fr);
    gap: 16px;
    align-items: start;
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
  .admin-hotel-requests {
    &__stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    &__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}

@media (max-width: 700px) {
  .admin-hotel-requests {
    &__head,
    &__toolbar {
      flex-direction: column;
      align-items: stretch;
    }

    &__filters {
      max-width: 100%;
    }

    &__stats,
    &__grid,
    &__actions {
      grid-template-columns: 1fr;
    }

    &__card-head {
      flex-direction: column;
    }
  }
}
</style>
