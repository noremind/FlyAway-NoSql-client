<template>
  <div class="tour-ticket-page">
    <div class="tour-ticket-page__wrapper">
      <UiGoBack
        class="tour-ticket-page__back"
        label="Мои туры"
        go-back="/profile/my-tours"
      />

      <div v-if="isLoading" class="tour-ticket-page__state">
        Загружаем билет...
      </div>

      <div
        v-else-if="errorMessage"
        class="tour-ticket-page__state tour-ticket-page__state--error"
      >
        {{ errorMessage }}
      </div>

      <section v-else-if="booking" class="tour-ticket-page__card">
        <div class="tour-ticket-page__card-header">
          <h1 class="tour-ticket-page__ticket-title">Билет №{{ ticketNumber }}</h1>
          <button
            v-if="bookingStatus === 'active'"
            type="button"
            class="tour-ticket-page__refund"
            :disabled="isCancelling"
            @click="handleCancelBooking(booking._id)"
          >
            {{ isCancelling ? "Оформляем возврат..." : "Оформить возврат" }}
          </button>
        </div>

        <div class="tour-ticket-page__content">
          <div class="tour-ticket-page__qr-column">
            <div class="tour-ticket-page__qr-box">
              <img
                class="tour-ticket-page__qr-image"
                :src="qrImageUrl"
                alt="QR билет"
              />
            </div>

            <div
              class="tour-ticket-page__status"
              :class="{
                'tour-ticket-page__status--completed': bookingStatus === 'completed',
                'tour-ticket-page__status--cancelled': bookingStatus === 'cancelled',
              }"
            >
              {{ statusLabel }}
            </div>
          </div>

          <div class="tour-ticket-page__details">
            <div class="tour-ticket-page__partner-line">
              <div class="tour-ticket-page__partner-box">
                <img
                  class="tour-ticket-page__partner-avatar"
                  :src="partnerAvatar"
                  :alt="partnerTitle"
                />
                <p class="tour-ticket-page__partner-name">{{ partnerTitle }}</p>
              </div>

              <div class="tour-ticket-page__reviews-box">
                <span class="tour-ticket-page__reviews-text">{{ reviewsLabel }}</span>
                <span class="tour-ticket-page__reviews-rating">★ {{ ratingLabel }}</span>
              </div>
            </div>

            <h2 class="tour-ticket-page__tour-title">{{ bookingTitle }}</h2>

            <div class="tour-ticket-page__about">
              <p class="tour-ticket-page__section-title">О туре</p>
              <p class="tour-ticket-page__description">
                {{ bookingDescription }}
              </p>

              <div v-if="bookingHighlights.length" class="tour-ticket-page__highlights">
                <p class="tour-ticket-page__highlights-title">Что вас ждет:</p>
                <ul class="tour-ticket-page__highlights-list">
                  <li
                    v-for="highlight in bookingHighlights"
                    :key="highlight"
                    class="tour-ticket-page__highlights-item"
                  >
                    {{ highlight }}
                  </li>
                </ul>
              </div>
            </div>

            <div class="tour-ticket-page__summary-grid">
              <div class="tour-ticket-page__summary-labels">
                <p class="tour-ticket-page__summary-row">Дата</p>
                <p class="tour-ticket-page__summary-row tour-ticket-page__summary-row--accent">
                  Ваши билеты
                </p>
                <div class="tour-ticket-page__ticket-lines">
                  <p
                    v-for="item in ticketLines"
                    :key="`${item.title}-${item.quantity}`"
                    class="tour-ticket-page__summary-row"
                  >
                    {{ item.title }}
                  </p>
                </div>
                <p class="tour-ticket-page__summary-row">Скидка</p>
                <p class="tour-ticket-page__summary-row">Промокод</p>
                <p v-if="paidWithBonuses > 0" class="tour-ticket-page__summary-row">
                  Бонусы
                </p>
                <p class="tour-ticket-page__summary-row tour-ticket-page__summary-row--total">
                  Итого
                </p>
              </div>

              <div class="tour-ticket-page__summary-values">
                <p class="tour-ticket-page__summary-value">{{ bookingDate }}</p>
                <div class="tour-ticket-page__summary-space"></div>
                <div class="tour-ticket-page__ticket-lines">
                  <p
                    v-for="item in ticketLines"
                    :key="`${item.title}-${item.quantity}-value`"
                    class="tour-ticket-page__summary-value"
                  >
                    {{ item.quantity }} билет x {{ formatMoney(item.price) }}
                  </p>
                </div>
                <p class="tour-ticket-page__summary-value">-{{ discountLabel }}%</p>
                <p class="tour-ticket-page__summary-value">{{ promoAmountLabel }}</p>
                <p v-if="paidWithBonuses > 0" class="tour-ticket-page__summary-value">
                  -{{ formatMoney(paidWithBonuses) }} Б
                </p>
                <p
                  class="tour-ticket-page__summary-value tour-ticket-page__summary-value--total"
                >
                  {{ bookingTotal }}
                </p>
              </div>
            </div>

            <div class="tour-ticket-page__payment">
              <p class="tour-ticket-page__payment-title">Способ оплаты</p>
              <p class="tour-ticket-page__payment-method">{{ paymentMethodLabel }}</p>
              <p v-if="paymentMaskLabel" class="tour-ticket-page__payment-mask">{{ paymentMaskLabel }}</p>
              <p v-else-if="paidWithBonuses > 0" class="tour-ticket-page__payment-mask">
                Списано бонусов: {{ formatMoney(paidWithBonuses) }} Б
              </p>
            </div>

            <button
              type="button"
              class="tour-ticket-page__download"
              @click="downloadTicket"
            >
              Скачать билет в PDF
            </button>

            <div
              v-if="bookingStatus === 'completed'"
              class="tour-ticket-page__review-block"
            >
              <p class="tour-ticket-page__review-title">Поставьте оценку</p>
              <div class="tour-ticket-page__stars">
                <button
                  v-for="star in 5"
                  :key="star"
                  type="button"
                  class="tour-ticket-page__star"
                  :class="{ 'tour-ticket-page__star--active': star <= reviewRating }"
                  @click="reviewRating = star"
                >
                  ★
                </button>
              </div>

              <p class="tour-ticket-page__review-title">Напишите отзыв</p>
              <textarea
                v-model="reviewText"
                class="tour-ticket-page__textarea"
                placeholder="Напишите отзыв"
              ></textarea>

              <button
                type="button"
                class="tour-ticket-page__review-button"
                @click="goToReviewPage"
              >
                Оставить отзыв
              </button>
            </div>
          </div>
        </div>
      </section>

      <div v-else class="tour-ticket-page__state">Билет не найден.</div>
    </div>
  </div>
</template>

<script setup>
import partnerPlaceholder from "@/assets/image/common/tour-avatar.png";

const route = useRoute();
const router = useRouter();
const api = useApi();

const booking = ref(null);
const isLoading = ref(false);
const isCancelling = ref(false);
const errorMessage = ref("");
const reviewRating = ref(4);
const reviewText = ref("");

useSeoMeta({
  title: "FlyAway - Билет",
  ogTitle: "FlyAway - Билет",
  description: "Информация о забронированном туре",
  ogDescription: "Информация о забронированном туре",
});

const normalizeString = (value) => String(value || "").trim();

const parseDateValue = (value) => {
  const text = normalizeString(value);
  if (!text) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const parsed = new Date(`${text}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatMoney = (value) => {
  const amount = Number(value);
  const formattedAmount = Number.isFinite(amount)
    ? amount.toLocaleString("ru-RU")
    : "0";

  return `${formattedAmount} ₸`;
};

const bookingStatus = computed(() => {
  const status = normalizeString(booking.value?.status);
  return ["active", "completed", "cancelled"].includes(status)
    ? status
    : "active";
});

const statusLabel = computed(() => {
  if (bookingStatus.value === "completed") return "Завершенный";
  if (bookingStatus.value === "cancelled") return "Отмененный";
  return "Активный билет";
});

const bookingTitle = computed(() => {
  return normalizeString(booking.value?.tour?.title) || "Тур FlyAway";
});

const bookingDate = computed(() => {
  const parsed = parseDateValue(booking.value?.date);

  if (!parsed) {
    return normalizeString(booking.value?.date) || "Дата уточняется";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
});

const bookingTotal = computed(() => formatMoney(booking.value?.total));

const bookingDescription = computed(() => {
  return (
    normalizeString(booking.value?.tour?.description) ||
    "Описание тура скоро появится."
  );
});

const bookingHighlights = computed(() => {
  const source = Array.isArray(booking.value?.tour?.highlights)
    ? booking.value.tour.highlights
    : [];

  return source.map((item) => normalizeString(item)).filter(Boolean).slice(0, 3);
});

const ticketLines = computed(() => {
  const selections = Array.isArray(booking.value?.ticketSelections)
    ? booking.value.ticketSelections
    : [];

  return selections
    .filter((item) => Number(item?.quantity) > 0)
    .map((item) => ({
      title: normalizeString(item?.title) || "Билет",
      quantity: Number(item?.quantity) || 0,
      price: Number(item?.price) || 0,
    }));
});

const discountLabel = computed(() => {
  return Math.max(0, Number(booking.value?.tourDiscountPercent) || 0);
});

const promoAmountLabel = computed(() => {
  const value = Number(booking.value?.promoDiscountAmount) || 0;
  return value ? `-${formatMoney(value)}` : "0 ₸";
});

const paidWithBonuses = computed(() => Math.max(0, Number(booking.value?.paidWithBonuses) || 0));

const paymentMethodLabel = computed(() => {
  const value = normalizeString(booking.value?.paymentMethod);
  if (value === "bonus") return "Бонусы";
  return "Банковская карта";
});

const paymentMaskLabel = computed(() => {
  if (normalizeString(booking.value?.paymentMethod) === "bonus") {
    return "";
  }

  return normalizeString(booking.value?.paymentCardMask) || "4400 ... 8909";
});

const partnerTitle = computed(() => {
  return normalizeString(booking.value?.tour?.partner?.title) || "FlyAway Partner";
});

const partnerAvatar = computed(() => {
  return (
    booking.value?.tour?.partner?.logo ||
    booking.value?.tour?.partner?.avatar ||
    partnerPlaceholder
  );
});

const ratingLabel = computed(() => {
  const rating = Number(booking.value?.tour?.rating) || 0;
  return rating ? rating.toFixed(1).replace(".", ",") : "0,0";
});

const reviewsLabel = computed(() => {
  const count = Number(booking.value?.tour?.reviewsCount) || 0;
  return `${count} отзывов`;
});

const ticketNumber = computed(() => {
  const raw = String(booking.value?._id || "").slice(-6);
  const numeric = Number.parseInt(raw, 16);

  if (!Number.isFinite(numeric)) {
    return "12345";
  }

  return String(numeric % 100000).padStart(5, "0");
});

const qrPayload = computed(() => {
  return JSON.stringify({
    bookingId: booking.value?._id,
    tourId: booking.value?.tour?._id,
    title: bookingTitle.value,
    date: bookingDate.value,
    total: bookingTotal.value,
  });
});

const qrImageUrl = computed(() => {
  return `https://quickchart.io/qr?text=${encodeURIComponent(qrPayload.value)}&size=280`;
});

const loadBooking = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response = await api.client({
      url: "/personal-cabinet/bookings/tours",
      method: "get",
    });

    const bookings = Array.isArray(response?.data) ? response.data : [];
    booking.value = bookings.find((item) => item?._id === route.params.id) || null;

    if (!booking.value) {
      errorMessage.value = "Билет не найден.";
      return;
    }

    reviewText.value = "";
  } catch (error) {
    errorMessage.value = error?.message || "Не удалось загрузить билет.";
  } finally {
    isLoading.value = false;
  }
};

const handleCancelBooking = async (bookingId) => {
  if (!bookingId || isCancelling.value) {
    return;
  }

  const confirmed =
    typeof window === "undefined"
      ? true
      : window.confirm("Оформить возврат по этому билету?");

  if (!confirmed) {
    return;
  }

  isCancelling.value = true;
  errorMessage.value = "";

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

const buildPrintableTicketMarkup = () => {
  const ticketRows = ticketLines.value
    .map(
      (item) => `
        <tr>
          <td>${item.title}</td>
          <td style="text-align:right;">${item.quantity} x ${formatMoney(item.price)}</td>
        </tr>
      `,
    )
    .join("");

  return `
    <!doctype html>
    <html lang="ru">
      <head>
        <meta charset="UTF-8" />
        <title>Билет №${ticketNumber.value}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; color: #202426; }
          .card { max-width: 760px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 20px; padding: 28px; }
          .header { display:flex; justify-content:space-between; gap:16px; align-items:center; margin-bottom: 24px; }
          .title { font-size: 28px; font-weight: 700; margin:0; }
          .status { display:inline-flex; padding: 10px 18px; border-radius: 999px; background:#fa3946; color:#fff; font-weight:700; }
          .section-title { font-size:18px; font-weight:700; margin: 22px 0 12px; }
          .muted { color:#6b7280; line-height:1.5; }
          table { width:100%; border-collapse: collapse; margin-top: 12px; }
          td { padding: 8px 0; font-size: 14px; vertical-align: top; }
          .accent { color:#fa3946; font-weight:700; }
          .total { font-weight: 800; font-size: 18px; }
          .qr { display:flex; justify-content:center; margin: 18px 0 8px; }
          .qr img { width: 180px; height: 180px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1 class="title">Билет №${ticketNumber.value}</h1>
            <span class="status">${statusLabel.value}</span>
          </div>

          <div class="qr">
            <img src="${qrImageUrl.value}" alt="QR билет" />
          </div>

          <div class="section-title">${bookingTitle.value}</div>
          <p class="muted">${bookingDescription.value}</p>

          <table>
            <tr><td>Дата</td><td style="text-align:right;">${bookingDate.value}</td></tr>
            <tr><td class="accent" colspan="2">Ваши билеты</td></tr>
            ${ticketRows}
            <tr><td>Скидка</td><td style="text-align:right;">-${discountLabel.value}%</td></tr>
            <tr><td>Промокод</td><td style="text-align:right;">${promoAmountLabel.value}</td></tr>
            ${paidWithBonuses.value > 0 ? `<tr><td>Бонусы</td><td style="text-align:right;">-${formatMoney(paidWithBonuses.value)} Б</td></tr>` : ""}
            <tr><td class="total">Итого</td><td class="total" style="text-align:right;">${bookingTotal.value}</td></tr>
          </table>

          <div class="section-title">Способ оплаты</div>
          <p class="muted">${paymentMethodLabel.value}${paymentMaskLabel.value ? ` — ${paymentMaskLabel.value}` : paidWithBonuses.value > 0 ? ` — списано ${formatMoney(paidWithBonuses.value)} Б` : ""}</p>
        </div>
      </body>
    </html>
  `;
};

const downloadTicket = () => {
  if (typeof window === "undefined" || !booking.value) {
    return;
  }

  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) {
    return;
  }

  printWindow.document.open();
  printWindow.document.write(buildPrintableTicketMarkup());
  printWindow.document.close();
  printWindow.focus();

  window.setTimeout(() => {
    printWindow.print();
  }, 350);
};

const goToReviewPage = async () => {
  const tourId = booking.value?.tour?._id;

  if (!tourId) {
    return;
  }

  await router.push(`/tours/${tourId}/reviews`);
};

onMounted(loadBooking);
</script>

<style lang="scss" scoped>
.tour-ticket-page {
  &__wrapper {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__state,
  &__card {
    background: $white;
    border-radius: 24px;
    box-shadow: 0px 8px 28px rgba(0, 0, 0, 0.06);
  }

  &__state {
    padding: 32px 24px;
    color: $surface-500;
    text-align: center;

    &--error {
      color: $orange-200;
    }
  }

  &__card {
    padding: 28px 28px 34px;
  }

  &__card-header {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: center;
    margin-bottom: 24px;
  }

  &__ticket-title {
    color: $surface-900;
    font-size: 28px;
    line-height: 1.15;
    font-weight: 700;
    margin: 0;
  }

  &__refund {
    color: $orange-200;
    font-size: 14px;
    font-weight: 700;

    &:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }
  }

  &__content {
    display: grid;
    grid-template-columns: 230px minmax(0, 1fr);
    gap: 34px;
  }

  &__qr-column {
    display: flex;
    flex-direction: column;
    gap: 22px;
    align-items: stretch;
  }

  &__qr-box {
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 18px;
    background: $white;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__qr-image {
    width: 100%;
    max-width: 196px;
    height: auto;
    object-fit: contain;
  }

  &__status {
    min-height: 44px;
    border-radius: 999px;
    background: $red-500;
    color: $white;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;

    &--completed {
      background: $surface-400;
    }

    &--cancelled {
      background: $surface-300;
      color: $surface-900;
    }
  }

  &__details {
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-width: 0;
  }

  &__partner-line {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: center;
  }

  &__partner-box {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__partner-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    object-fit: cover;
  }

  &__partner-name,
  &__reviews-text,
  &__reviews-rating {
    font-size: 13px;
    color: $surface-500;
  }

  &__reviews-box {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  &__tour-title {
    color: $surface-900;
    font-size: 20px;
    line-height: 1.25;
    font-weight: 700;
    margin: 0;
  }

  &__section-title,
  &__highlights-title,
  &__payment-title,
  &__review-title {
    color: $surface-900;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  &__description {
    color: $surface-500;
    line-height: 1.45;
  }

  &__highlights-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-left: 18px;
    color: $surface-500;
    line-height: 1.45;
  }

  &__summary-grid {
    display: grid;
    grid-template-columns: minmax(180px, 240px) minmax(0, 1fr);
    gap: 24px;
  }

  &__summary-labels,
  &__summary-values {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__summary-row,
  &__summary-value {
    color: $surface-500;
    font-size: 15px;
    line-height: 1.4;
  }

  &__summary-row--accent {
    color: $red-500;
    font-weight: 700;
  }

  &__summary-row--total,
  &__summary-value--total {
    color: $surface-900;
    font-weight: 700;
  }

  &__summary-values {
    align-items: flex-end;
    text-align: right;
  }

  &__summary-space {
    min-height: 29px;
  }

  &__ticket-lines {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__payment-method,
  &__payment-mask {
    color: $surface-500;
    font-size: 15px;
    line-height: 1.4;
  }

  &__download,
  &__review-button {
    min-height: 48px;
    width: fit-content;
    min-width: 220px;
    padding: 0 24px;
    border-radius: 999px;
    font-size: 15px;
    font-weight: 700;
  }

  &__download {
    color: $red-500;
    border: 1px solid rgba($red-500, 0.55);
    background: transparent;
  }

  &__review-block {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-top: 6px;
  }

  &__stars {
    display: flex;
    gap: 6px;
  }

  &__star {
    font-size: 26px;
    line-height: 1;
    color: $surface-300;

    &--active {
      color: #f4c531;
    }
  }

  &__textarea {
    width: 100%;
    min-height: 160px;
    border-radius: 16px;
    border: 1px solid rgba($surface-300, 0.75);
    padding: 18px 16px;
    resize: vertical;
    color: $surface-900;
    font-size: 14px;
    line-height: 1.5;
  }

  &__review-button {
    color: $white;
    background: $red-500;
  }
}

@media (max-width: 1024px) {
  .tour-ticket-page {
    &__content {
      grid-template-columns: 1fr;
    }

    &__qr-column {
      align-items: center;
    }

    &__status {
      width: 100%;
      max-width: 240px;
    }
  }
}

@media (max-width: 768px) {
  .tour-ticket-page {
    &__card {
      padding: 22px 18px 24px;
    }

    &__card-header {
      flex-direction: column;
      align-items: flex-start;
      margin-bottom: 18px;
    }

    &__ticket-title {
      font-size: 24px;
    }

    &__partner-line {
      flex-direction: column;
      align-items: flex-start;
    }

    &__reviews-box {
      justify-content: flex-start;
    }

    &__summary-grid {
      grid-template-columns: 1fr;
      gap: 14px;
    }

    &__summary-values {
      align-items: flex-start;
      text-align: left;
    }

    &__summary-space {
      display: none;
    }

    &__download,
    &__review-button {
      width: 100%;
    }
  }
}
</style>
