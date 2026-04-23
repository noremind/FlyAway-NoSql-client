<template>
  <section class="admin-catalog">
    <div class="admin-catalog__head">
      <div>
        <h2 class="admin-catalog__title">Отели</h2>
        <p class="admin-catalog__text">
          Контроль гостиничного каталога, фото, рейтинга, контента и размещения
          по партнёрам.
        </p>
      </div>

      <div class="admin-catalog__actions">
        <button class="admin-catalog__ghost" type="button" @click="loadHotels">
          Обновить
        </button>
        <NuxtLink class="admin-catalog__primary" to="/admin/hotels/create">
          Создать отель
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
        placeholder="Поиск по названию отеля"
        after-icon="lupa"
        icon-color="surface-500"
        v-model="searchQuery"
      />

      <UiSelect
        class="admin-catalog__filter"
        placeholder="Все партнеры"
        :options="partnerOptions"
        option-label="label"
        option-value="value"
        v-model="selectedPartnerId"
      />
    </section>

    <p v-if="errorMessage" class="admin-catalog__error">{{ errorMessage }}</p>

    <div v-if="isLoading" class="admin-catalog__state">Загружаем отели...</div>

    <div v-else-if="!filteredHotels.length" class="admin-catalog__state">
      Отели по выбранным условиям не найдены.
    </div>

    <div v-else class="admin-catalog__table-wrap">
      <table class="admin-catalog__table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Партнер</th>
            <th>Локация</th>
            <th>Фото</th>
            <th>Рейтинг</th>
            <th>Описание</th>
            <th>Создан</th>
            <th>Действие</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="hotel in filteredHotels" :key="hotel._id">
            <td>
              <div class="admin-catalog__cell-main">
                <strong>{{ hotel.name }}</strong>
                <span class="admin-catalog__muted">
                  {{ truncateText(hotel.content, 90) || "Контент не заполнен" }}
                </span>
              </div>
            </td>

            <td>
              <div class="admin-catalog__cell-main">
                <strong>{{ hotel?.partner?.title || "—" }}</strong>
                <span class="admin-catalog__muted">
                  {{ hotel?.partner?.phone || hotel?.partner?.email || "Без контактов" }}
                </span>
              </div>
            </td>

            <td>{{ hotel.location || "—" }}</td>
            <td>{{ getImagesCount(hotel) }}</td>
            <td>{{ formatRating(hotel.rating) }}</td>
            <td>{{ truncateText(hotel.description, 90) || "—" }}</td>
            <td>{{ formatDate(hotel.createdAt) }}</td>

            <td>
              <div class="admin-catalog__row-actions">
                <NuxtLink
                  class="admin-catalog__link"
                  :to="`/admin/hotels/${hotel._id}`"
                >
                  Редактировать
                </NuxtLink>
                <NuxtLink
                  class="admin-catalog__link admin-catalog__link--ghost"
                  :to="`/hotels/${hotel._id}`"
                  target="_blank"
                >
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
  title: "Отели",
  description: "Управление отелями в админ-панели FlyAway.",
});

const api = useApi();
const hotels = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");
const searchQuery = ref("");
const selectedPartnerId = ref("");

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

const getImagesCount = (hotel) => {
  return Array.isArray(hotel?.images) ? hotel.images.length : 0;
};

const partnerOptions = computed(() => {
  const partners = [...new Map(
    hotels.value
      .filter((hotel) => hotel?.partner?._id)
      .map((hotel) => [hotel.partner._id, hotel.partner]),
  ).values()];

  return [
    { label: "Все партнеры", value: "" },
    ...partners.map((partner) => ({
      label: partner.title || "Партнер",
      value: partner._id,
    })),
  ];
});

const statItems = computed(() => {
  const total = hotels.value.length;
  const withPhotos = hotels.value.filter(
    (hotel) => Array.isArray(hotel?.images) && hotel.images.length,
  ).length;

  const avgRating = total
    ? (
        hotels.value.reduce(
          (sum, hotel) => sum + (Number(hotel?.rating) || 0),
          0,
        ) / total
      ).toFixed(1)
    : "0.0";

  const uniquePartners = new Set(
    hotels.value.map((hotel) => hotel?.partner?._id).filter(Boolean),
  ).size;

  return [
    { label: "Всего отелей", value: total },
    { label: "С фото", value: withPhotos },
    { label: "Уникальных партнеров", value: uniquePartners },
    { label: "Средний рейтинг", value: String(avgRating).replace(".", ",") },
  ];
});

const filteredHotels = computed(() => {
  const query = String(searchQuery.value || "").trim().toLowerCase();

  return hotels.value.filter((hotel) => {
    const matchesSearch = !query
      ? true
      : [hotel?.name, hotel?.description, hotel?.content, hotel?.partner?.title]
          .map((item) => String(item || "").toLowerCase())
          .some((item) => item.includes(query));

    const matchesPartner = !selectedPartnerId.value
      ? true
      : String(hotel?.partner?._id || "") === String(selectedPartnerId.value);

    return matchesSearch && matchesPartner;
  });
});

const loadHotels = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const res = await api.client({ url: "/hotels/manage" });
    hotels.value = Array.isArray(res?.data) ? res.data : [];
  } catch (error) {
    errorMessage.value = error?.message || "Не удалось загрузить отели.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadHotels);
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
    grid-template-columns: minmax(0, 1fr) 260px;
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
    min-width: 1100px;
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

  &__row-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 150px;
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
