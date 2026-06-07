<template>
  <div class="ticket-page">
    <UiGoBack label="Мои туры" go-back="/profile/my-tours" />

    <div v-if="isLoading" class="ticket-page__state">Загружаем билет...</div>
    <div
      v-else-if="errorMessage"
      class="ticket-page__state ticket-page__state--error"
    >
      {{ errorMessage }}
    </div>

    <section v-else-if="booking" class="ticket-page__card">
      <div class="ticket-page__header">
        <div>
          <p class="ticket-page__number">Билет №{{ ticketNumber }}</p>
          <h1 class="ticket-page__title">{{ bookingTitle }}</h1>
        </div>
        <button
          v-if="bookingStatus === 'active'"
          class="ticket-page__refund"
          type="button"
          :disabled="isCancelling"
          @click="handleCancelBooking(booking._id)"
        >
          {{ isCancelling ? "Оформляем возврат..." : "Оформить возврат" }}
        </button>
      </div>

      <div class="ticket-page__layout">
        <aside class="ticket-page__qr-side">
          <a
            class="ticket-page__qr-box"
            :href="qrVerifyPath"
            target="_blank"
            rel="noopener"
          >
            <img
              class="ticket-page__qr-image"
              :src="qrImageUrl"
              alt="QR билет"
            />
          </a>
          <p class="ticket-page__qr-caption">QR ведет на {{ qrVerifyPath }}</p>
          <span
            class="ticket-page__status"
            :class="`ticket-page__status--${bookingStatus}`"
            >{{ statusLabel }}</span
          >
        </aside>

        <div class="ticket-page__content">
          <div class="ticket-page__partner-line">
            <div class="ticket-page__partner">
              <img
                class="ticket-page__partner-avatar"
                :src="partnerAvatar"
                :alt="partnerTitle"
              />
              <span>{{ partnerTitle }}</span>
            </div>
            <span class="ticket-page__rating"
              >{{ reviewsLabel }} • ★ {{ ratingLabel }}</span
            >
          </div>

          <div class="ticket-page__section">
            <h2>О туре</h2>
            <p>{{ bookingDescription }}</p>
            <ul v-if="bookingHighlights.length" class="ticket-page__list">
              <li v-for="item in bookingHighlights" :key="item">{{ item }}</li>
            </ul>
          </div>

          <div class="ticket-page__summary">
            <div class="ticket-page__row">
              <span>Дата</span><strong>{{ bookingDate }}</strong>
            </div>
            <div
              v-for="item in ticketLines"
              :key="`${item.title}-${item.quantity}`"
              class="ticket-page__row"
            >
              <span>{{ item.title }}</span>
              <strong
                >{{ item.quantity }} × {{ formatMoney(item.price) }}</strong
              >
            </div>
            <div class="ticket-page__row">
              <span>Скидка</span><strong>-{{ discountLabel }}%</strong>
            </div>
            <div class="ticket-page__row">
              <span>Промокод</span><strong>{{ promoAmountLabel }}</strong>
            </div>
            <div v-if="paidWithBonuses > 0" class="ticket-page__row">
              <span>Бонусы</span
              ><strong>-{{ formatMoney(paidWithBonuses) }} Б</strong>
            </div>
            <div class="ticket-page__row ticket-page__row--total">
              <span>Итого</span><strong>{{ bookingTotal }}</strong>
            </div>
          </div>

          <div class="ticket-page__payment">
            <h2>Способ оплаты</h2>
            <p>{{ paymentMethodLabel }}</p>
            <p v-if="paymentMaskLabel">{{ paymentMaskLabel }}</p>
            <p v-else-if="paidWithBonuses > 0">
              Списано бонусов: {{ formatMoney(paidWithBonuses) }} Б
            </p>
          </div>

          <div class="ticket-page__actions">
            <button
              class="ticket-page__download"
              type="button"
              @click="downloadTicket"
            >
              Скачать билет в PDF
            </button>
            <NuxtLink
              class="ticket-page__verify"
              :to="qrVerifyPath"
              target="_blank"
              >Открыть QR-проверку</NuxtLink
            >
          </div>
        </div>
      </div>
    </section>

    <div v-else class="ticket-page__state">Билет не найден.</div>
  </div>
</template>

<script setup>
import partnerPlaceholder from "@/assets/image/common/tour-avatar.png";

const route = useRoute();
const api = useApi();

const booking = ref(null);
const isLoading = ref(false);
const isCancelling = ref(false);
const errorMessage = ref("");

useSeoMeta({
  title: "FlyAway - Билет",
  description: "Информация о забронированном туре",
});

const normalizeString = (value) => String(value || "").trim();

const parseDateValue = (value) => {
  const text = normalizeString(value);
  if (!text) return null;
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(text)
    ? new Date(`${text}T00:00:00`)
    : new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatMoney = (value) =>
  `${Number(value || 0).toLocaleString("ru-RU")} ₸`;
const formatDate = (value) => {
  const parsed = parseDateValue(value);
  if (!parsed) return normalizeString(value) || "Дата уточняется";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
};

const bookingStatus = computed(() =>
  ["active", "completed", "cancelled"].includes(
    normalizeString(booking.value?.status),
  )
    ? booking.value.status
    : "active",
);
const statusLabel = computed(() =>
  bookingStatus.value === "completed"
    ? "Завершенный"
    : bookingStatus.value === "cancelled"
      ? "Отмененный"
      : "Активный билет",
);
const bookingTitle = computed(
  () => normalizeString(booking.value?.tour?.title) || "Тур FlyAway",
);
const bookingDate = computed(() => formatDate(booking.value?.date));
const bookingTotal = computed(() => formatMoney(booking.value?.total));
const bookingDescription = computed(
  () =>
    normalizeString(booking.value?.tour?.description) ||
    "Описание тура скоро появится.",
);
const bookingHighlights = computed(() =>
  (Array.isArray(booking.value?.tour?.highlights)
    ? booking.value.tour.highlights
    : []
  )
    .map(normalizeString)
    .filter(Boolean)
    .slice(0, 4),
);
const ticketLines = computed(() =>
  (Array.isArray(booking.value?.ticketSelections)
    ? booking.value.ticketSelections
    : []
  )
    .filter((item) => Number(item?.quantity) > 0)
    .map((item) => ({
      title: normalizeString(item?.title) || "Билет",
      quantity: Number(item?.quantity) || 0,
      price: Number(item?.price) || 0,
    })),
);
const discountLabel = computed(() =>
  Math.max(0, Number(booking.value?.tourDiscountPercent) || 0),
);
const promoAmountLabel = computed(() =>
  Number(booking.value?.promoDiscountAmount) > 0
    ? `-${formatMoney(booking.value?.promoDiscountAmount)}`
    : "0 ₸",
);
const paidWithBonuses = computed(() =>
  Math.max(0, Number(booking.value?.paidWithBonuses) || 0),
);
const paymentMethodLabel = computed(() =>
  normalizeString(booking.value?.paymentMethod) === "bonus"
    ? "Бонусы"
    : "Банковская карта",
);
const paymentMaskLabel = computed(() =>
  normalizeString(booking.value?.paymentMethod) === "bonus"
    ? ""
    : normalizeString(booking.value?.paymentCardMask) || "4400 ... 8909",
);
const partnerTitle = computed(
  () =>
    normalizeString(booking.value?.tour?.partner?.title) || "FlyAway Partner",
);
const partnerAvatar = computed(
  () =>
    booking.value?.tour?.partner?.logo ||
    booking.value?.tour?.partner?.avatar ||
    partnerPlaceholder,
);
const ratingLabel = computed(() =>
  (Number(booking.value?.tour?.rating) || 0).toFixed(1).replace(".", ","),
);
const reviewsLabel = computed(
  () => `${Number(booking.value?.tour?.reviewsCount) || 0} отзывов`,
);
const ticketNumber = computed(() => {
  const numeric = Number.parseInt(
    String(booking.value?._id || "").slice(-6),
    16,
  );
  return Number.isFinite(numeric)
    ? String(numeric % 100000).padStart(5, "0")
    : "12345";
});

const qrVerifyPath = computed(() =>
  booking.value?._id ? `/qr/tours/${booking.value._id}` : "/qr/tours/not-found",
);
const qrVerifyUrl = computed(() => {
  if (typeof window !== "undefined")
    return `${window.location.origin}${qrVerifyPath.value}`;
  return qrVerifyPath.value;
});
const qrImageUrl = computed(
  () =>
    `https://quickchart.io/qr?text=${encodeURIComponent(qrVerifyUrl.value)}&size=280`,
);

const loadBooking = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const response = await api.client({
      url: "/personal-cabinet/bookings/tours",
      method: "get",
    });
    const bookings = Array.isArray(response?.data) ? response.data : [];
    booking.value =
      bookings.find((item) => item?._id === route.params.id) || null;
    if (!booking.value) errorMessage.value = "Билет не найден.";
  } catch (error) {
    errorMessage.value = error?.message || "Не удалось загрузить билет.";
  } finally {
    isLoading.value = false;
  }
};

const handleCancelBooking = async (bookingId) => {
  if (!bookingId || isCancelling.value) return;
  if (
    typeof window !== "undefined" &&
    !window.confirm("Оформить возврат по этому билету?")
  )
    return;
  isCancelling.value = true;
  try {
    const response = await api.client({
      url: `/personal-cabinet/bookings/tours/${bookingId}/cancel`,
      method: "patch",
    });
    booking.value = response?.data || booking.value;
  } catch (error) {
    errorMessage.value = error?.message || "Не удалось оформить возврат.";
  } finally {
    isCancelling.value = false;
  }
};

const downloadTicket = () => {
  if (typeof window === "undefined" || !booking.value) return;
  const html = `<!doctype html><html lang="ru"><head><meta charset="UTF-8"><title>Билет №${ticketNumber.value}</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#202426}.card{max-width:760px;margin:0 auto;border:1px solid #e5e7eb;border-radius:20px;padding:28px}.title{font-size:28px;font-weight:700}.qr{text-align:center;margin:20px}.qr img{width:180px}.row{display:flex;justify-content:space-between;padding:8px 0}.total{font-size:20px;font-weight:800;color:#fa3946}</style></head><body><div class="card"><h1 class="title">Билет №${ticketNumber.value}</h1><div class="qr"><img src="${qrImageUrl.value}"></div><h2>${bookingTitle.value}</h2><p>${bookingDescription.value}</p><div class="row"><span>Дата</span><strong>${bookingDate.value}</strong></div><div class="row total"><span>Итого</span><strong>${bookingTotal.value}</strong></div><p>QR проверка: ${qrVerifyUrl.value}</p></div></body></html>`;
  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) return;
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  window.setTimeout(() => printWindow.print(), 350);
};

onMounted(loadBooking);
</script>

<style lang="scss" scoped>
.ticket-page {
  display: grid;
  gap: 20px;
}
.ticket-page__state,
.ticket-page__card {
  background: $white;
  border-radius: 24px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.06);
}
.ticket-page__state {
  padding: 32px 24px;
  color: $surface-500;
  text-align: center;
  &--error {
    color: $orange-200;
  }
}
.ticket-page__card {
  padding: 28px;
}
.ticket-page__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 24px;
}
.ticket-page__number {
  color: $surface-500;
  font-weight: 700;
  margin-bottom: 6px;
}
.ticket-page__title {
  color: $surface-900;
  font-size: 28px;
  font-weight: 900;
  line-height: 1.15;
}
.ticket-page__refund {
  color: $orange-200;
  font-weight: 800;
}
.ticket-page__layout {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 34px;
}
.ticket-page__qr-side {
  display: grid;
  gap: 16px;
  align-content: start;
}
.ticket-page__qr-box {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: $white;
}
.ticket-page__qr-image {
  width: 100%;
  max-width: 210px;
}
.ticket-page__qr-caption {
  color: $surface-500;
  font-size: 12px;
  overflow-wrap: anywhere;
  text-align: center;
}
.ticket-page__status {
  padding: 12px;
  min-height: 44px;
  border-radius: 999px;
  background: $red-500;
  color: $white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  &--completed {
    background: $surface-400;
  }
  &--cancelled {
    background: $surface-300;
    color: $surface-900;
  }
}
.ticket-page__content {
  display: grid;
  gap: 20px;
}
.ticket-page__partner-line {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}
.ticket-page__partner {
  display: flex;
  align-items: center;
  gap: 10px;
  color: $surface-500;
}
.ticket-page__partner-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}
.ticket-page__rating {
  color: $surface-500;
  font-size: 13px;
}
.ticket-page__section h2,
.ticket-page__payment h2 {
  color: $surface-900;
  font-size: 17px;
  font-weight: 800;
  margin-bottom: 8px;
}
.ticket-page__section p,
.ticket-page__payment p,
.ticket-page__list {
  color: $surface-500;
  line-height: 1.5;
}
.ticket-page__list {
  padding-left: 18px;
  margin-top: 8px;
}
.ticket-page__summary {
  display: grid;
  gap: 8px;
}
.ticket-page__row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  color: $surface-500;
  strong {
    color: $surface-900;
    text-align: right;
  }
  &--total {
    color: $surface-900;
    font-weight: 900;
    strong {
      color: $red-500;
      font-size: 20px;
    }
  }
}
.ticket-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.ticket-page__download,
.ticket-page__verify {
  min-height: 48px;
  padding: 0 24px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}
.ticket-page__download {
  color: $red-500;
  border: 1px solid rgba($red-500, 0.55);
}
.ticket-page__verify {
  color: $white;
  background: $red-500;
}
@media (max-width: 900px) {
  .ticket-page__layout {
    grid-template-columns: 1fr;
  }
  .ticket-page__qr-side {
    justify-items: center;
  }
}
@media (max-width: 640px) {
  .ticket-page__card {
    padding: 22px 18px;
  }
  .ticket-page__header,
  .ticket-page__partner-line,
  .ticket-page__row {
    // flex-direction: column;
    align-items: flex-start;
  }
  .ticket-page__download,
  .ticket-page__verify {
    width: 100%;
  }
}
</style>
