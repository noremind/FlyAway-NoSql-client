<template>
  <section class="admin-entities">
    <div class="admin-entities__stats">
      <article
        v-for="item in statItems"
        :key="item.label"
        class="admin-entities__stat"
      >
        <p class="admin-entities__stat-value">{{ item.value }}</p>
        <p class="admin-entities__stat-label">{{ item.label }}</p>
      </article>
    </div>

    <p v-if="errorMessage" class="admin-entities__error">{{ errorMessage }}</p>

    <UiTable
      :columns="columns"
      :rows="partnerRows"
      :loading="isLoading"
      filter-placeholder="Поиск по названию, владельцу, email или контактам"
    />
  </section>
</template>

<script setup>
definePageMeta({
  layout: "admin",
  middleware: "admin",
});

useSeo({
  title: "Партнеры",
  description: "Управление партнерами в админ-панели FlyAway.",
});

const api = useApi();
const partners = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");
const columns = [
  { key: "title", label: "Название" },
  { key: "email", label: "Email" },
  { key: "ownerName", label: "Владелец" },
  { key: "bin", label: "БИН" },
  { key: "phoneLabel", label: "Телефон" },
  { key: "addressLabel", label: "Адрес" },
  { key: "websiteLabel", label: "Сайт" },
  { key: "ratingLabel", label: "Рейтинг" },
  { key: "tourCount", label: "Туры" },
  { key: "hotelCount", label: "Отели" },
  { key: "createdAtLabel", label: "Создан" },
];

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const getCount = (value) => {
  if (Array.isArray(value)) return value.length;
  return Number(value) || 0;
};

const partnerRows = computed(() => {
  return partners.value.map((partner) => ({
    ...partner,
    email: partner.email || "-",
    ownerName: partner.ownerName || "-",
    bin: partner.bin || "-",
    phoneLabel: partner.contacts?.phone || partner.phone || "-",
    addressLabel: partner.contacts?.address || partner.address || "-",
    websiteLabel: partner.contacts?.website || partner.website || "-",
    ratingLabel: Number(partner.rating || 0).toFixed(1),
    tourCount: Number(partner.tour_count) || getCount(partner.tours),
    hotelCount: getCount(partner.hotels),
    createdAtLabel: formatDate(partner.createdAt),
  }));
});

const statItems = computed(() => {
  const total = partners.value.length;
  const totalTours = partners.value.reduce(
    (sum, partner) =>
      sum + (Number(partner.tour_count) || getCount(partner.tours)),
    0,
  );
  const totalHotels = partners.value.reduce(
    (sum, partner) => sum + getCount(partner.hotels),
    0,
  );
  const avgRating = total
    ? (
        partners.value.reduce(
          (sum, partner) => sum + (Number(partner.rating) || 0),
          0,
        ) / total
      ).toFixed(1)
    : "0.0";

  return [
    { label: "Всего партнеров", value: total },
    { label: "Всего туров", value: totalTours },
    { label: "Всего отелей", value: totalHotels },
    { label: "Средний рейтинг", value: String(avgRating).replace(".", ",") },
  ];
});

const loadPartners = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const res = await api.client({ url: "/partners" });
    partners.value = Array.isArray(res?.data) ? res.data : [];
  } catch (error) {
    errorMessage.value = error?.message || "Не удалось загрузить партнеров.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadPartners);
</script>

<style lang="scss" scoped>
.admin-entities {
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
    max-width: 760px;
    color: $surface-500;
    font-size: 14px;
    line-height: 1.45;
  }

  &__actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  &__ghost {
    min-height: 44px;
    padding: 0 16px;
    border-radius: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: $red-500;
    background: rgba($red-500, 0.06);
    border: 1px solid rgba($red-500, 0.14);
    font-weight: 700;
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

  &__error {
    padding: 18px 16px;
    border-radius: 16px;
    background: rgba($orange-200, 0.08);
    color: $orange-200;
    font-weight: 600;
    text-align: center;
  }
}

@media (max-width: 1100px) {
  .admin-entities {
    &__stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}

@media (max-width: 700px) {
  .admin-entities {
    &__head {
      flex-direction: column;
      align-items: stretch;
    }

    &__stats {
      grid-template-columns: 1fr;
    }
  }
}
</style>
