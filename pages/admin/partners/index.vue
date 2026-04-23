<template>
  <section>
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

const partners = ref([]);
const isLoading = ref(false);
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
    phoneLabel: partner.contacts?.phone || "-",
    addressLabel: partner.contacts?.address || "-",
    websiteLabel: partner.contacts?.website || "-",
    ratingLabel: Number(partner.rating || 0).toFixed(1),
    tourCount: Number(partner.tour_count) || getCount(partner.tours),
    hotelCount: getCount(partner.hotels),
    createdAtLabel: formatDate(partner.createdAt),
  }));
});

const loadPartners = async () => {
  isLoading.value = true;

  try {
    const res = await useApi().client({ url: "/partners" });
    partners.value = res.data || [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadPartners);
</script>
