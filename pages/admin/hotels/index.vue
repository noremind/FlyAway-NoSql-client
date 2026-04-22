<template>
  <section class="admin-catalog">
    <div class="admin-catalog__head">
      <div>
        <h2 class="admin-catalog__title">Отели</h2>
        <p class="admin-catalog__text">
          Контроль гостиничного каталога, фото, рейтинга и размещения по
          партнёрам.
        </p>
      </div>

      <div class="admin-catalog__actions">
        <NuxtLink class="admin-catalog__primary" to="/admin/hotels/create">
          Создать отель
        </NuxtLink>

        <button class="admin-catalog__ghost" type="button" @click="loadHotels">
          Обновить
        </button>
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

    <p v-if="errorMessage" class="admin-catalog__error">{{ errorMessage }}</p>

    <div v-if="isLoading" class="admin-catalog__state">Загружаем отели...</div>

    <div v-else-if="!hotels.length" class="admin-catalog__state">
      Отелей пока нет.
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
            <th>Сайт</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="hotel in hotels" :key="hotel._id">
            <td>
              <div class="admin-catalog__cell-main">
                <strong>{{ hotel.name }}</strong>
                <span class="admin-catalog__muted">
                  {{ truncateText(hotel.content, 80) || "Контент не заполнен" }}
                </span>
              </div>
            </td>

            <td>{{ hotel?.partner?.title || "—" }}</td>
            <td>{{ hotel.location || "—" }}</td>
            <td>{{ getImagesCount(hotel) }}</td>
            <td>{{ formatRating(hotel.rating) }}</td>
            <td>{{ truncateText(hotel.description, 90) || "—" }}</td>
            <td>{{ formatDate(hotel.createdAt) }}</td>

            <td>
              <NuxtLink
                class="admin-catalog__link"
                :to="`/hotels/${hotel._id}`"
                target="_blank"
              >
                Открыть
              </NuxtLink>
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
    margin-top: 4px;
    color: $surface-500;
    font-size: 14px;
    line-height: 1.45;
  }

  &__actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  &__primary,
  &__ghost {
    min-height: 42px;
    padding: 0 14px;
    border-radius: 10px;
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

  &__table-wrap {
    overflow-x: auto;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba($red-500, 0.08);
    padding: 8px 0;
  }

  &__table {
    width: 100%;
    min-width: 1040px;
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

  &__link {
    color: $blue-500;
    font-weight: 700;
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
