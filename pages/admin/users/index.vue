<template>
  <section>
    <UiTable
      :columns="columns"
      :rows="userRows"
      :loading="isLoading"
      filter-placeholder="Поиск по имени, email, телефону или роли"
    />
  </section>
</template>

<script setup>
definePageMeta({
  layout: "admin",
  middleware: "admin",
});

const users = ref([]);
const isLoading = ref(false);
const columns = [
  { key: "name", label: "Имя" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Телефон" },
  { key: "roleLabel", label: "Роль" },
  { key: "bonusBalanceLabel", label: "Бонусы" },
  { key: "tourBookingsCount", label: "Брони туров" },
  { key: "walletTransactionsCount", label: "Транзакции" },
  { key: "isVerifiedLabel", label: "Верификация" },
  { key: "createdAtLabel", label: "Создан" },
];

const roleLabels = {
  admin: "Админ",
  partner: "Партнер",
  user: "Пользователь",
};

const formatNumber = (value) => {
  return (Number(value) || 0).toLocaleString("ru-RU");
};

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

const userRows = computed(() => {
  return users.value.map((user) => {
    const tourBookings = Array.isArray(user.tourBookings)
      ? user.tourBookings
      : [];
    const walletTransactions = Array.isArray(user.walletTransactions)
      ? user.walletTransactions
      : [];

    return {
      ...user,
      phone: user.phone || "-",
      roleLabel: roleLabels[user.role] || user.role || "-",
      bonusBalanceLabel: `${formatNumber(user.bonusBalance)} Б`,
      tourBookingsCount: tourBookings.length,
      walletTransactionsCount: walletTransactions.length,
      isVerifiedLabel: user.isVerified ? "Да" : "Нет",
      createdAtLabel: formatDate(user.createdAt),
    };
  });
});

const loadUsers = async () => {
  isLoading.value = true;

  try {
    const res = await useApi().client({ url: "/users" });
    users.value = res.data || [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadUsers);
</script>
