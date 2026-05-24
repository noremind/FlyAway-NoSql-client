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

useSeo({
  title: "Пользователи",
  description: "Управление пользователями в админ-панели FlyAway.",
});

const api = useApi();
const users = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");
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

const statItems = computed(() => {
  const total = users.value.length;
  const admins = users.value.filter((user) => user?.role === "admin").length;
  const partners = users.value.filter(
    (user) => user?.role === "partner",
  ).length;
  const verified = users.value.filter((user) => user?.isVerified).length;

  return [
    { label: "Всего пользователей", value: total },
    { label: "Администраторы", value: admins },
    { label: "Партнеры", value: partners },
    { label: "Верифицированы", value: verified },
  ];
});

const loadUsers = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const res = await api.client({ url: "/users" });
    users.value = Array.isArray(res?.data) ? res.data : [];
  } catch (error) {
    errorMessage.value =
      error?.message || "Не удалось загрузить пользователей.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadUsers);
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
