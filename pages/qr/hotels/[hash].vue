<template>
  <section class="qr-page">
    <div class="qr-page__card">
      <div v-if="isLoading" class="qr-page__state">Проверяем QR-код...</div>
      <div
        v-else-if="errorMessage"
        class="qr-page__result qr-page__result--error"
      >
        <div class="qr-page__icon">!</div>
        <h1>Бронь не подтверждена</h1>
        <p>{{ errorMessage }}</p>
      </div>
      <div v-else-if="booking" class="qr-page__result">
        <div class="qr-page__icon qr-page__icon--success">✓</div>
        <!-- <p class="qr-page__eyebrow">QR проверен</p> -->
        <h1>Бронь отеля найдена</h1>
        <div class="qr-page__info">
          <div>
            <span>Отель</span
            ><strong>{{ booking?.hotel?.name || "Отель" }}</strong>
          </div>
          <div>
            <span>Клиент</span
            ><strong>{{
              booking?.name || booking?.customer?.name || "Клиент"
            }}</strong>
          </div>
          <div>
            <span>Заезд</span
            ><strong>{{ formatDate(booking?.checkIn) }}</strong>
          </div>
          <div>
            <span>Выезд</span
            ><strong>{{ formatDate(booking?.checkOut) }}</strong>
          </div>
          <div>
            <span>Статус</span
            ><strong>{{ getStatusLabel(booking?.status) }}</strong>
          </div>
          <div>
            <span>Гостей</span><strong>{{ booking?.guests || 1 }}</strong>
          </div>
          <div>
            <span>Телефон</span
            ><strong>{{
              booking?.phone || booking?.customer?.phone || "—"
            }}</strong>
          </div>
          <div>
            <span>Email</span
            ><strong>{{
              booking?.email || booking?.customer?.email || "—"
            }}</strong>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
definePageMeta({ layout: "default" });
useSeo({
  title: "Проверка QR брони отеля",
  description: "Открытая проверка QR-кода брони отеля FlyAway.",
});

const route = useRoute();
const api = useApi();
const booking = ref(null);
const isLoading = ref(false);
const errorMessage = ref("");

const formatDate = (value) => {
  if (!value) return "Не указано";
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(String(value))
    ? new Date(`${value}T00:00:00`)
    : new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
};
const getStatusLabel = (status) => {
  if (status === "in_progress") return "В работе";
  if (status === "contacted") return "Связались";
  if (status === "closed") return "Закрыта";
  if (status === "cancelled") return "Отменена";
  return "Новая";
};

const verifyQr = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const response = await api.client({
      url: `/qr/hotels/${route.params.hash}`,
      method: "get",
    });
    booking.value = response?.data?.booking || null;
    if (!booking.value) errorMessage.value = "Информация по брони не найдена.";
  } catch (error) {
    errorMessage.value = error?.message || "Не удалось проверить бронь.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(verifyQr);
</script>

<style lang="scss" scoped>
.qr-page {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
}
.qr-page__card {
  width: 100%;
  max-width: 760px;
  padding: 34px;
  border-radius: 28px;
  background: $white;
  box-shadow: 0 18px 48px rgba(32, 36, 38, 0.08);
}
.qr-page__state {
  color: $surface-500;
  text-align: center;
}
.qr-page__result {
  display: grid;
  justify-items: center;
  gap: 14px;
  text-align: center;
}
.qr-page__result h1 {
  color: $surface-900;
  font-size: 34px;
  font-weight: 900;
}
.qr-page__result p {
  color: $surface-500;
  line-height: 1.5;
}
.qr-page__eyebrow {
  color: $red-500 !important;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}
.qr-page__icon {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $orange-200;
  color: $white;
  font-size: 58px;
  font-weight: 900;
  &--success {
    background: #20bf55;
  }
}
.qr-page__result--error .qr-page__icon {
  background: $red-500;
}
.qr-page__info {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 12px;
  text-align: left;
}
.qr-page__info div {
  padding: 14px;
  border-radius: 16px;
  background: rgba($surface-100, 0.8);
  display: grid;
  gap: 5px;
}
.qr-page__info span {
  color: $surface-500;
  font-size: 12px;
}
.qr-page__info strong {
  color: $surface-900;
  overflow-wrap: anywhere;
}
@media (max-width: 640px) {
  .qr-page__card {
    padding: 24px 18px;
  }
  .qr-page__info {
    grid-template-columns: 1fr;
  }
  .qr-page__result h1 {
    font-size: 28px;
  }
}
</style>
