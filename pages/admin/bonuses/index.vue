<template>
  <section class="admin-bonuses">
    <form class="admin-bonuses__card" @submit.prevent="submitBonus">
      <UiSelect
        label="Пользователь"
        v-model="form.userId"
        :options="userOptions"
        option-label="label"
        option-value="value"
      />
      <UiInput label="Количество бонусов" type="number" v-model="form.amount" />
      <UiInput label="Комментарий" v-model.trim="form.note" />

      <p v-if="message" class="admin-bonuses__message">{{ message }}</p>

      <UiButton
        class="admin-bonuses__submit button-primary"
        label="Начислить бонусы"
        :is-loading="isSubmitting"
        type="submit"
      />
    </form>
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

const loadUsers = async () => {
  const response = await api.client({
    url: "/users",
    method: "get",
  });

  users.value = Array.isArray(response?.data) ? response.data : [];
};

const submitBonus = async () => {
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

    message.value = "Бонусы начислены";
    form.amount = "";
    form.note = "";
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
    max-width: 520px;
    display: grid;
    gap: 14px;
    padding: 20px;
    border-radius: 24px;
    background: $white;
    box-shadow: 0 14px 36px rgba(32, 36, 38, 0.08);
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
