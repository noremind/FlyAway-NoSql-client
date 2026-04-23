<template>
  <section class="admin-catalog">
    <div class="admin-catalog__head">
      <div>
        <h2 class="admin-catalog__title">Туры</h2>
        <p class="admin-catalog__text">
          Управление каталогом туров, датами, рейтингом, билетами и статусами
          публикации.
        </p>
      </div>

      <div class="admin-catalog__actions">
        <button class="admin-catalog__ghost" type="button" @click="loadTours">
          Обновить
        </button>
        <NuxtLink class="admin-catalog__primary" to="/admin/tours/create">
          Создать тур
        </NuxtLink>
      </div>
    </div>

    <div class="admin-catalog__stats">
      <article
        v-for="item in statItems"
        :key="item.label"
        class="admin-catalog__stat"
      >
        <p class="admin-catalog__stat-value">{{ item.value }}</p>
        <p class="admin-catalog__stat-label">{{ item.label }}</p>
      </article>
    </div>

    <section class="admin-catalog__toolbar">
      <UiInput
        class="admin-catalog__search"
        placeholder="Поиск по названию тура"
        after-icon="lupa"
        icon-color="surface-500"
        v-model="searchQuery"
      />

      <UiSelect
        class="admin-catalog__filter"
        placeholder="Все статусы"
        :options="statusOptions"
        option-label="label"
        option-value="value"
        v-model="selectedStatus"
      />
    </section>

    <p v-if="errorMessage" class="admin-catalog__error">{{ errorMessage }}</p>

    <div v-if="isLoading" class="admin-catalog__state">Загружаем туры...</div>

    <div v-else-if="!filteredTours.length" class="admin-catalog__state">
      Туры по выбранным условиям не найдены.
    </div>

    <div v-else class="admin-catalog__table-wrap">
      <table class="admin-catalog__table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Партнер</th>
            <th>Даты</th>
            <th>Билеты</th>
            <th>Цена</th>
            <th>Рейтинг</th>
            <th>Отзывы</th>
            <th>Статус</th>
            <th>Создан</th>
            <th>Действие</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="tour in filteredTours" :key="tour._id">
            <td>
              <div class="admin-catalog__cell-main">
                <strong>{{ tour.title }}</strong>
                <span v-if="tour.description" class="admin-catalog__muted">
                  {{ truncateText(tour.description, 90) }}
                </span>
              </div>
            </td>

            <td>
              <div class="admin-catalog__cell-main">
                <strong>{{ tour?.partner?.title || "—" }}</strong>
                <span class="admin-catalog__muted">
                  {{ tour?.departureCity || tour?.departurePoint || "Без точки отправления" }}
                </span>
              </div>
            </td>

            <td>
              <div class="admin-catalog__cell-main">
                <strong>{{ getDatesCount(tour) }}</strong>
                <span class="admin-catalog__muted">
                  {{ getAvailabilitySummary(tour) }}
                </span>
              </div>
            </td>

            <td>
              <div class="admin-catalog__cell-main">
                <strong>{{ getTicketsCount(tour) }}</strong>
                <span class="admin-catalog__muted">
                  {{ getCheapestTicketLabel(tour) }}
                </span>
              </div>
            </td>

            <td>
              <div class="admin-catalog__cell-main">
                <strong>{{ formatMoney(getFinalPrice(tour)) }} ₸</strong>
                <span class="admin-catalog__muted">
                  {{ Number(tour.discount || 0) }}% скидка
                </span>
              </div>
            </td>

            <td>{{ formatRating(tour.rating) }}</td>
            <td>{{ Number(tour.reviewsCount || 0) }}</td>

            <td>
              <span
                class="admin-catalog__badge"
                :class="{
                  'admin-catalog__badge--hot': tour.is_hot,
                  'admin-catalog__badge--regular': !tour.is_hot,
                }"
              >
                {{ tour.is_hot ? "Горящий" : "Обычный" }}
              </span>
            </td>

            <td>{{ formatDate(tour.createdAt) }}</td>

            <td>
              <div class="admin-catalog__row-actions">
                <NuxtLink
                  class="admin-catalog__link"
                  :to="`/admin/tours/${tour._id}`"
                >
                  Редактировать
                </NuxtLink>
                <NuxtLink class="admin-catalog__link admin-catalog__link--ghost" :to="`/tours/${tour._id}`">
                  Открыть на сайте
                </NuxtLink>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
definePageMeta({
  layout: "admin",
  middleware: "admin",
});

useSeo({
  title: "Туры",
  description: "Управление турами в админ-панели FlyAway.",
});

const api = useApi();
const tours = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");
const searchQuery = ref("");
const selectedStatus = ref("");

const statusOptions = [
  { label: "Все статусы", value: "" },
  { label: "Горящие", value: "hot" },
  { label: "Обычные", value: "regular" },
];

const formatMoney = (value) => Number(value || 0).toLocaleString("ru-RU");

const formatRating = (value) => {
  const rating = Number(value || 0);
  return rating ? rating.toFixed(1).replace(".", ",") : "0,0";
};

const formatDate = (value) => {
  if (!value) return "—";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

const truncateText = (value, limit = 80) => {
  const text = String(value || "").trim();
  if (!text) return "";
  return text.length > limit ? `${text.slice(0, limit)}...` : text;
};

const getDatesCount = (tour) => {
  const availabilityDates = Array.isArray(tour?.availabilityDates)
    ? tour.availabilityDates.length
    : 0;

  const dates = Array.isArray(tour?.dates) ? tour.dates.length : 0;
  const total = Math.max(availabilityDates, dates);

  return `${total} дат`;
};

const getAvailabilitySummary = (tour) => {
  const items = Array.isArray(tour?.availabilityDates)
    ? tour.availabilityDates
    : [];

  if (!items.length) {
    return "Даты уточняются";
  }

  const totalSeats = items.reduce(
    (sum, item) => sum + Math.max(0, Number(item?.seats) || 0),
    0,
  );
  const bookedSeats = items.reduce(
    (sum, item) => sum + Math.max(0, Number(item?.bookedSeats) || 0),
    0,
  );

  return `мест: ${Math.max(0, totalSeats - bookedSeats)} свободно`;
};

const getTicketsCount = (tour) => {
  return Array.isArray(tour?.ticketTypes) ? tour.ticketTypes.filter(Boolean).length : 0;
};

const getCheapestTicketLabel = (tour) => {
  const ticketTypes = Array.isArray(tour?.ticketTypes) ? tour.ticketTypes : [];
  const minPrice = ticketTypes.reduce((min, item) => {
    const price = Number(item?.price) || 0;
    if (!price) return min;
    return min === null ? price : Math.min(min, price);
  }, null);

  return minPrice ? `от ${formatMoney(minPrice)} ₸` : "Без билетов";
};

const getFinalPrice = (tour) => {
  const price = Number(tour?.price) || 0;
  const discount = Number(tour?.discount) || 0;
  const total = price - (price * discount) / 100;
  return total > 0 ? total : price;
};

const statItems = computed(() => {
  const total = tours.value.length;
  const hot = tours.value.filter((tour) => tour?.is_hot).length;

  const avgRating = total
    ? (
        tours.value.reduce(
          (sum, tour) => sum + (Number(tour?.rating) || 0),
          0,
        ) / total
      ).toFixed(1)
    : "0.0";

  const avgPrice = total
    ? Math.round(
        tours.value.reduce((sum, tour) => sum + getFinalPrice(tour), 0) / total,
      )
    : 0;

  return [
    { label: "Всего туров", value: total },
    { label: "Горящих туров", value: hot },
    { label: "Средний рейтинг", value: String(avgRating).replace(".", ",") },
    { label: "Средняя цена", value: `${formatMoney(avgPrice)} ₸` },
  ];
});

const filteredTours = computed(() => {
  const query = String(searchQuery.value || "").trim().toLowerCase();

  return tours.value.filter((tour) => {
    const matchesSearch = !query
      ? true
      : [tour?.title, tour?.description, tour?.partner?.title]
          .map((item) => String(item || "").toLowerCase())
          .some((item) => item.includes(query));

    const matchesStatus = !selectedStatus.value
      ? true
      : selectedStatus.value === "hot"
        ? Boolean(tour?.is_hot)
        : !tour?.is_hot;

    return matchesSearch && matchesStatus;
  });
});

const loadTours = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const res = await api.client({ url: "/tours/manage" });
    tours.value = Array.isArray(res?.data) ? res.data : [];
  } catch (error) {
    errorMessage.value = error?.message || "Не удалось загрузить туры.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadTours);
</script>

<style lang="scss" scoped>
.admin-catalog {
  display: flex;
  flex-direction: column;
  gap: 18px;

  &__head {
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
    margin-top: 6px;
    color: $surface-500;
    font-size: 14px;
    line-height: 1.45;
    max-width: 720px;
  }

  &__actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  &__primary,
  &__ghost {
    min-height: 44px;
    padding: 0 16px;
    border-radius: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
  }

  &__primary {
    color: $white;
    background: $red-500;
  }

  &__ghost {
    color: $red-500;
    background: rgba($red-500, 0.06);
    border: 1px solid rgba($red-500, 0.14);
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
    display: grid;
    grid-template-columns: minmax(0, 1fr) 240px;
    gap: 14px;
    align-items: center;
  }

  &__table-wrap {
    overflow-x: auto;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba($red-500, 0.08);
    padding: 8px 0;
    box-shadow: 0 10px 26px rgba(32, 36, 38, 0.04);
  }

  &__table {
    width: 100%;
    min-width: 1200px;
    border-collapse: collapse;

    th,
    td {
      padding: 12px 14px;
      text-align: left;
      border-bottom: 1px solid rgba($surface-300, 0.2);
      vertical-align: top;
      font-size: 14px;
    }

    th {
      color: $surface-500;
      font-weight: 700;
      white-space: nowrap;
    }

    td {
      color: $surface-900;
    }
  }

  &__cell-main {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__muted {
    color: $surface-500;
    line-height: 1.45;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    padding: 0 12px;
    border-radius: 999px;
    color: $white;
    font-size: 12px;
    font-weight: 700;

    &--hot {
      background: $red-500;
    }

    &--regular {
      background: $surface-400;
    }
  }

  &__row-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 140px;
  }

  &__link {
    color: $blue-500;
    font-weight: 700;

    &--ghost {
      color: $surface-500;
    }
  }

  &__state,
  &__error {
    padding: 24px 16px;
    border-radius: 16px;
    text-align: center;
  }

  &__state {
    background: rgba($red-500, 0.04);
    color: $surface-500;
  }

  &__error {
    background: rgba($orange-200, 0.08);
    color: $orange-200;
    font-weight: 600;
  }
}

@media (max-width: 1100px) {
  .admin-catalog {
    &__stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    &__toolbar {
      grid-template-columns: 1fr;
    }
  }
}

@media (max-width: 700px) {
  .admin-catalog {
    &__head {
      flex-direction: column;
      align-items: stretch;
    }

    &__actions {
      width: 100%;
    }

    &__primary,
    &__ghost {
      flex: 1;
    }

    &__stats {
      grid-template-columns: 1fr;
    }
  }
}
</style>
