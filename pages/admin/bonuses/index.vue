<template>
  <section class="admin-bonuses">
    <form class="admin-bonuses__card" @submit.prevent="submitBonus">
      <div class="admin-bonuses__fields">
        <UiSelect
          class="admin-bonuses__field"
          label="Пользователь"
          v-model="form.userId"
          :options="userOptions"
          option-label="label"
          option-value="value"
        />
        <UiInput
          class="admin-bonuses__field"
          label="Количество бонусов"
          type="number"
          v-model="form.amount"
        />
        <UiInput
          class="admin-bonuses__field"
          label="Комментарий"
          v-model.trim="form.note"
        />
      </div>

      <p v-if="message" class="admin-bonuses__message">{{ message }}</p>

      <UiButton
        class="admin-bonuses__submit button-primary"
        label="Начислить бонусы"
        :is-loading="isSubmitting"
        type="submit"
      />
    </form>

    <section class="admin-bonuses__history">
      <h2 class="admin-bonuses__title">История начисления бонусов</h2>
      <UiTable
        :columns="bonusColumns"
        :rows="bonusRows"
        :loading="isLoading"
        filter-placeholder="Поиск по пользователю, email или комментарию"
      />
    </section>
  </section>
</template>

<script setup>
definePageMeta({
  layout: "admin",
  middleware: "admin",
});

useSeo({
  title: "Начисление бонусов",
  description: "Ручное начисление бонусов пользователям FlyAway.",
});

const api = useApi();
const users = ref([]);
const message = ref("");
const isLoading = ref(false);
const isSubmitting = ref(false);

const form = reactive({
  userId: "",
  amount: "",
  note: "",
});

const userOptions = computed(() =>
  users.value.map((user) => ({
    label: `${user.name} (${user.email})`,
    value: user._id,
  })),
);

const formatBonusAmount = (value) => {
  const amount = Number(value) || 0;
  const sign = amount > 0 ? "+" : "";
  return `${sign}${amount.toLocaleString("ru-RU")} Б`;
};

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const bonusColumns = [
  { key: "createdAtLabel", label: "Когда" },
  { key: "userName", label: "Кому" },
  { key: "userEmail", label: "Email" },
  { key: "amountLabel", label: "Бонусы" },
  { key: "note", label: "Комментарий" },
];

const bonusRows = computed(() => {
  return users.value
    .flatMap((user) => {
      const transactions = Array.isArray(user.walletTransactions)
        ? user.walletTransactions
        : [];

      return transactions
        .filter((transaction) => {
          return (
            transaction?.type === "Бонусы" &&
            transaction?.currency === "BONUS" &&
            Number(transaction?.amount) > 0
          );
        })
        .map((transaction, index) => ({
          _id: transaction._id || `${user._id}-${index}`,
          createdAt: transaction.createdAt,
          createdAtLabel: formatDateTime(transaction.createdAt),
          userName: user.name || "-",
          userEmail: user.email || "-",
          amount: Number(transaction.amount) || 0,
          amountLabel: formatBonusAmount(transaction.amount),
          note: transaction.note || transaction.name || "-",
        }));
    })
    .sort(
      (left, right) =>
        new Date(right.createdAt || 0).getTime() -
        new Date(left.createdAt || 0).getTime(),
    );
});

const loadUsers = async ({ clearMessage = true } = {}) => {
  isLoading.value = true;

  if (clearMessage) {
    message.value = "";
  }

  try {
    const response = await api.client({
      url: "/users",
      method: "get",
    });

    users.value = Array.isArray(response?.data) ? response.data : [];
  } catch (error) {
    message.value = error?.message || "Не удалось загрузить пользователей";
  } finally {
    isLoading.value = false;
  }
};

const submitBonus = async () => {
  if (!form.userId) {
    message.value = "Выберите пользователя";
    return;
  }

  isSubmitting.value = true;
  message.value = "";

  try {
    await api.client({
      url: `/users/${form.userId}/bonus`,
      method: "patch",
      data: {
        amount: Number(form.amount) || 0,
        note: form.note,
      },
    });

    form.amount = "";
    form.note = "";
    await loadUsers({ clearMessage: false });
    message.value = "Бонусы начислены";
  } catch (error) {
    message.value = error?.message || "Не удалось начислить бонусы";
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(loadUsers);
</script>

<style scoped lang="scss">
.admin-bonuses {
  display: grid;
  gap: 18px;

  &__card {
    width: 100%;
    display: grid;
    gap: 14px;
    padding: 20px;
    border-radius: 8px;
    background: $white;
    box-shadow: 0 14px 36px rgba(32, 36, 38, 0.08);
  }

  &__fields {
    display: grid;
    gap: 14px;
  }

  &__field {
    width: 100%;

    :deep(.input__wrapper),
    :deep(.select__wrapper),
    :deep(.p-select) {
      width: 100%;
    }
  }

  &__history {
    width: 100%;
    display: grid;
    gap: 14px;
  }

  &__title {
    color: $surface-900;
    font-size: 22px;
    font-weight: 700;
  }

  &__message {
    color: $red-500;
    font-size: 14px;
    font-weight: 600;
  }

  &__submit {
    width: fit-content;
  }
}
</style>
