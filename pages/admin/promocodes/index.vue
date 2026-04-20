<template>
  <section class="admin-promocodes">
    <div class="admin-promocodes__layout">
      <form class="admin-promocodes__form" @submit.prevent="createPromo">
        <UiInput label="Название" v-model.trim="form.title" />
        <UiInput label="Код" v-model.trim="form.code" />

        <div class="admin-promocodes__grid">
          <UiSelect
            label="Тип скидки"
            v-model="form.discountType"
            :options="discountTypeOptions"
            option-label="label"
            option-value="value"
          />
          <UiInput label="Значение" type="number" v-model="form.value" />
        </div>

        <div class="admin-promocodes__grid">
          <UiSelect
            label="Область действия"
            v-model="form.targetType"
            :options="targetTypeOptions"
            option-label="label"
            option-value="value"
          />
          <UiSelect
            v-if="isAdmin"
            label="Партнер"
            v-model="form.partner"
            :options="partnerOptions"
            option-label="label"
            option-value="value"
          />
        </div>

        <UiSelect
          v-if="form.targetType === 'tour'"
          label="Тур"
          v-model="form.tour"
          :options="tourOptions"
          option-label="label"
          option-value="value"
        />

        <UiSelect
          v-if="form.targetType === 'hotel'"
          label="Отель"
          v-model="form.hotel"
          :options="hotelOptions"
          option-label="label"
          option-value="value"
        />

        <div class="admin-promocodes__grid">
          <UiCalendar label="Дата начала" v-model="form.startsAt" />
          <UiCalendar label="Дата окончания" v-model="form.endsAt" />
        </div>

        <label class="admin-promocodes__check">
          <input v-model="form.isActive" type="checkbox" />
          <span>Промокод активен</span>
        </label>

        <p v-if="message" class="admin-promocodes__message">{{ message }}</p>

        <UiButton
          class="admin-promocodes__submit button-primary"
          label="Создать промокод"
          :is-loading="isSubmitting"
          type="submit"
        />
      </form>

      <div class="admin-promocodes__list">
        <article
          v-for="promo in promos"
          :key="promo._id"
          class="admin-promocodes__card"
        >
          <div class="admin-promocodes__card-top">
            <strong>{{ promo.code }}</strong>
            <span>{{ promo.discountType === "percent" ? "%" : "₸" }}</span>
          </div>
          <p>{{ promo.title || "Без названия" }}</p>
          <p>Скидка: {{ promo.value }}</p>
          <p>Область: {{ promo.targetType }}</p>
          <p>
            Период:
            {{ promo.startsAt || "без даты" }} -
            {{ promo.endsAt || "без даты" }}
          </p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
definePageMeta({
  layout: "admin",
  middleware: "admin",
});

useSeo({
  title: "Промокоды",
  description: "Управление промокодами FlyAway.",
});

const api = useApi();
const authStore = useAuthStore();
const isAdmin = computed(() => authStore.getUser?.role === "admin");

const promos = ref([]);
const tours = ref([]);
const hotels = ref([]);
const partners = ref([]);
const isSubmitting = ref(false);
const message = ref("");

const form = reactive({
  title: "",
  code: "",
  discountType: "percent",
  value: "",
  targetType: "all",
  partner: "",
  tour: "",
  hotel: "",
  startsAt: null,
  endsAt: null,
  isActive: true,
});

const discountTypeOptions = [
  { label: "Процент", value: "percent" },
  { label: "Фиксированная сумма", value: "fixed" },
];

const targetTypeOptions = [
  { label: "Для всего", value: "all" },
  { label: "Для тура", value: "tour" },
  { label: "Для отеля", value: "hotel" },
];

const partnerOptions = computed(() =>
  partners.value.map((partner) => ({
    label: partner.title,
    value: partner._id,
  })),
);

const tourOptions = computed(() =>
  tours.value.map((tour) => ({
    label: tour.title,
    value: tour._id,
  })),
);

const hotelOptions = computed(() =>
  hotels.value.map((hotel) => ({
    label: hotel.name,
    value: hotel._id,
  })),
);

const formatApiDate = (value) => {
  if (!value) return "";
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value || "");
};

const loadData = async () => {
  const [promoRes, tourRes, hotelRes, partnerRes] = await Promise.allSettled([
    api.client({ url: "/promocodes", method: "get" }),
    api.client({ url: "/tours/manage", method: "get" }),
    api.client({ url: "/hotels/manage", method: "get" }),
    isAdmin.value
      ? api.client({ url: "/partners", method: "get" })
      : Promise.resolve({ data: [] }),
  ]);

  promos.value = promoRes.value?.data || [];
  tours.value = tourRes.value?.data || [];
  hotels.value = hotelRes.value?.data || [];
  partners.value = partnerRes.value?.data || [];
};

const resetForm = () => {
  form.title = "";
  form.code = "";
  form.discountType = "percent";
  form.value = "";
  form.targetType = "all";
  form.partner = "";
  form.tour = "";
  form.hotel = "";
  form.startsAt = null;
  form.endsAt = null;
  form.isActive = true;
};

const createPromo = async () => {
  isSubmitting.value = true;
  message.value = "";

  try {
    await api.client({
      url: "/promocodes",
      method: "post",
      data: {
        title: form.title,
        code: form.code,
        discountType: form.discountType,
        value: Number(form.value) || 0,
        targetType: form.targetType,
        partner: form.partner || undefined,
        tour: form.targetType === "tour" ? form.tour : undefined,
        hotel: form.targetType === "hotel" ? form.hotel : undefined,
        startsAt: formatApiDate(form.startsAt),
        endsAt: formatApiDate(form.endsAt),
        isActive: form.isActive,
      },
    });

    message.value = "Промокод создан";
    resetForm();
    await loadData();
  } catch (error) {
    message.value = error?.message || "Не удалось создать промокод";
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(loadData);
</script>

<style scoped lang="scss">
.admin-promocodes {
  display: grid;
  gap: 18px;

  &__layout {
    display: grid;
    grid-template-columns: minmax(0, 460px) minmax(0, 1fr);
    gap: 18px;
  }

  &__form,
  &__list {
    display: grid;
    gap: 14px;
    padding: 20px;
    border-radius: 24px;
    background: $white;
    box-shadow: 0 14px 36px rgba(32, 36, 38, 0.08);
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  &__check {
    display: flex;
    align-items: center;
    gap: 10px;
    color: $surface-900;
  }

  &__message {
    color: $red-500;
    font-size: 14px;
    font-weight: 600;
  }

  &__submit {
    width: fit-content;
  }

  &__card {
    display: grid;
    gap: 6px;
    padding: 16px;
    border-radius: 18px;
    background: rgba($red-500, 0.04);
    color: $surface-900;
  }

  &__card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }
}

@media (max-width: 980px) {
  .admin-promocodes {
    &__layout {
      grid-template-columns: 1fr;
    }
  }
}
</style>
