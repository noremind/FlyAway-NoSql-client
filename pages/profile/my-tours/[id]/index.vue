<template>
  <UiOverlay
    :is-show="true"
    :have-footer="true"
    :title="overlayTitle"
    :show-header-icons="false"
    @close="goTo('/profile/my-tours')"
  >
    <section class="ticket">
      <div class="ticket__wrapper">
        <div v-if="isLoading" class="ticket__state">
          Загружаем билет...
        </div>

        <div v-else-if="errorMessage && !booking" class="ticket__state">
          <p>{{ errorMessage }}</p>
          <button class="ticket__retry" type="button" @click="loadBooking">
            Повторить
          </button>
        </div>

        <template v-else-if="booking">
          <div class="ticket__header">
            <h2 class="ticket__title title">Билет №{{ ticketNumber }}</h2>
            <button
              v-if="canCancelBooking"
              type="button"
              class="ticket__refund"
              @click="openRefundModal"
            >
              Оформить возврат
            </button>
          </div>

          <p v-if="message" class="ticket__message">{{ message }}</p>
          <p v-if="errorMessage" class="ticket__error">{{ errorMessage }}</p>

          <div class="ticket__box">
            <div class="ticket__box-inner">
              <img
                class="ticket__qr"
                src="@/assets/image/content/qr-code.png"
                alt="Qr Code"
              />
              <button
                type="button"
                class="ticket__btn button-primary"
                :class="`ticket__btn--${bookingStatus}`"
              >
                {{ statusButtonLabel }}
              </button>
              <UiButton
                before-icon="upload"
                icon-color="red-500"
                label="Скачать билет"
                class="ticket__download ticket__download--mobile"
              ></UiButton>
            </div>

            <div class="ticket__content">
              <div class="ticket__content-box">
                <div class="ticket__content-inner">
                  <img
                    class="ticket__avatar"
                    :src="partnerAvatar"
                    :alt="partnerName"
                  />
                  <p class="ticket__name">{{ partnerName }}</p>
                </div>
                <div class="ticket__reviews">
                  <p class="ticket__count">{{ reviewsCountLabel }}</p>
                  <UiIcons
                    class="ticket__star"
                    size="size-14"
                    color="yellow-500"
                    icon="star"
                  ></UiIcons>
                  <p class="ticket__average">{{ ratingLabel }}</p>
                </div>
              </div>

              <section class="ticket__content-info">
                <h3 class="ticket__content-title">{{ tourTitle }}</h3>
                <p class="ticket__content-about">О туре</p>
                <p class="ticket__content-description">
                  {{ tourDescription }}
                </p>

                <div v-if="tourHighlights.length">
                  <p class="ticket__content-text">Что вас ждет:</p>
                  <ul class="ticket__content-list">
                    <li
                      v-for="(item, index) in tourHighlights"
                      :key="index"
                      class="ticket__content-list-item"
                    >
                      {{ item }}
                    </li>
                  </ul>
                </div>

                <table class="ticket__table">
                  <tbody>
                    <tr class="ticket__tr">
                      <td class="ticket__td">Дата</td>
                      <td class="ticket__td">{{ bookingDate }}</td>
                    </tr>
                    <tr v-if="timeRange" class="ticket__tr">
                      <td class="ticket__td">Время</td>
                      <td class="ticket__td">{{ timeRange }}</td>
                    </tr>
                    <tr class="ticket__tr ticket__tr--blue">
                      <td>Ваши билеты</td>
                    </tr>
                    <tr
                      v-for="item in ticketRows"
                      :key="item.key"
                      class="ticket__tr"
                    >
                      <td class="ticket__td">{{ item.title }}</td>
                      <td class="ticket__td">{{ item.value }}</td>
                    </tr>
                    <tr v-if="!ticketRows.length" class="ticket__tr">
                      <td class="ticket__td">Гости</td>
                      <td class="ticket__td">{{ guestsLabel }}</td>
                    </tr>
                    <tr v-if="tourDiscountLabel" class="ticket__tr">
                      <td class="ticket__td ticket__td--bold">Скидка</td>
                      <td class="ticket__td">{{ tourDiscountLabel }}</td>
                    </tr>
                    <tr v-if="promoCodeLabel" class="ticket__tr">
                      <td class="ticket__td ticket__td--bold">Промокод</td>
                      <td class="ticket__td">{{ promoCodeLabel }}</td>
                    </tr>
                    <tr v-if="bonusPaymentLabel" class="ticket__tr">
                      <td class="ticket__td ticket__td--bold">Бонусы</td>
                      <td class="ticket__td">{{ bonusPaymentLabel }}</td>
                    </tr>
                    <tr class="ticket__tr ticket__tr--padding">
                      <td class="ticket__td ticket__td--bold">Итого</td>
                      <td class="ticket__td">{{ bookingTotal }}</td>
                    </tr>
                    <tr class="ticket__tr ticket__tr--blue">
                      <td>Способ оплаты</td>
                    </tr>
                    <tr class="ticket__tr">
                      <td class="ticket__td ticket__td--box">
                        <UiIcons
                          :icon="paymentIcon"
                          color="red-500"
                          size="size-24"
                        ></UiIcons>
                        <span>{{ paymentMethodLabel }}</span>
                      </td>
                      <td class="ticket__td"></td>
                    </tr>
                  </tbody>
                </table>

                <button
                  v-if="canCancelBooking"
                  type="button"
                  class="ticket__refund ticket__refund--mobile"
                  @click="openPartialRefundModal"
                >
                  Оформить возврат
                </button>

                <UiButton
                  before-icon="upload"
                  icon-color="red-500"
                  label="Скачать билет"
                  class="ticket__download"
                ></UiButton>

                <UiSendReview v-if="bookingStatus === 'completed'"></UiSendReview>
              </section>
            </div>
          </div>
        </template>
      </div>
    </section>
  </UiOverlay>

  <UiModal
    max-width="600px"
    :is-show="isOpenRefundModal"
    @close="closeRefundModal"
  >
    <ModalsRefund
      :is-loading="isCancelling"
      :close-on-submit="false"
      @next-step="handleRefundRequest"
      @close-modal="closeRefundModal"
    ></ModalsRefund>
  </UiModal>

  <UiModal
    max-width="600px"
    :is-show="statusRefundModal === 'success'"
    @close="closeStatusRefundModal"
  >
    <ModalsStatus
      title="Возврат оформлен"
      status="success"
      btn-label="Перейти в мои туры"
      goTo="/profile/my-tours"
    ></ModalsStatus>
  </UiModal>

  <UiModal
    max-width="600px"
    :is-show="statusRefundModal === 'cancelled'"
    @close="closeStatusRefundModal"
  >
    <ModalsInfo
      title="Возврат невозможен"
      :description="refundErrorDescription"
      btn-label="Закрыть"
      @go-to="closeStatusRefundModal"
    ></ModalsInfo>
  </UiModal>

  <UiPartialModal
    :is-show="isOpenPartialRefundModal"
    @close="closePartialRefundModal"
  >
    <template #body>
      <ModalsRefund
        :is-loading="isCancelling"
        :close-on-submit="false"
        @next-step="handlePartialRefundRequest"
        @close-modal="closePartialRefundModal"
      ></ModalsRefund>
    </template>
  </UiPartialModal>

  <UiModal
    max-width="600px"
    :is-show="statusPartialRefundModal === 'success'"
    :full-screen="true"
    @close="closeStatusPartialRefundModal"
  >
    <ModalsStatus
      title="Возврат оформлен"
      status="success"
      btn-label="Перейти в мои туры"
      goTo="/profile/my-tours"
    ></ModalsStatus>
  </UiModal>

  <UiModal
    max-width="600px"
    :is-show="statusPartialRefundModal === 'cancelled'"
    @close="closeStatusPartialRefundModal"
  >
    <ModalsInfo
      title="Возврат невозможен"
      :description="refundErrorDescription"
      btn-label="Закрыть"
      @go-to="closeStatusPartialRefundModal"
    ></ModalsInfo>
  </UiModal>
</template>

<script setup>
import fallbackAvatar from "@/assets/image/common/tour-avatar.png";

const api = useApi();
const route = useRoute();

const booking = ref(null);
const isLoading = ref(false);
const isCancelling = ref(false);
const errorMessage = ref("");
const message = ref("");
const statusRefundModal = ref("");
const statusPartialRefundModal = ref("");
const isOpenRefundModal = ref(false);
const isOpenPartialRefundModal = ref(false);
const refundErrorDescription = ref(
  "Это бронирование сейчас нельзя отменить. Проверьте статус билета или свяжитесь со службой поддержки.",
);

const normalizeString = (value) => String(value || "").trim();

const bookingId = computed(() => normalizeString(route.params.id));

const formatMoney = (value) => {
  const amount = Number(value);
  const formattedAmount = Number.isFinite(amount)
    ? amount.toLocaleString("ru-RU")
    : "0";

  return `${formattedAmount} ₸`;
};

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

const getResponseItems = (response) => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
};

const getStatus = (value) => {
  const status = normalizeString(value);
  return ["active", "completed", "cancelled"].includes(status)
    ? status
    : "active";
};

const pluralizeTickets = (count) => {
  const normalizedCount = Math.abs(Number(count) || 0);
  const lastTwo = normalizedCount % 100;
  const last = normalizedCount % 10;

  if (lastTwo >= 11 && lastTwo <= 14) return "билетов";
  if (last === 1) return "билет";
  if (last >= 2 && last <= 4) return "билета";
  return "билетов";
};

const bookingStatus = computed(() => getStatus(booking.value?.status));

const canCancelBooking = computed(() => {
  return bookingStatus.value === "active" && !isCancelling.value;
});

const ticketNumber = computed(() => {
  return (
    String(booking.value?._id || "")
      .slice(-6)
      .toUpperCase() || "000000"
  );
});

const overlayTitle = computed(() => `Билет №${ticketNumber.value}`);
const tourTitle = computed(
  () => normalizeString(booking.value?.tour?.title) || "Тур FlyAway",
);
const tourDescription = computed(
  () =>
    normalizeString(booking.value?.tour?.description) ||
    "Подробности тура доступны в вашем билете и на странице тура.",
);
const tourHighlights = computed(() => {
  const items = Array.isArray(booking.value?.tour?.highlights)
    ? booking.value.tour.highlights
    : [];

  return items.map(normalizeString).filter(Boolean);
});

const partnerName = computed(
  () => normalizeString(booking.value?.tour?.partner?.title) || "FlyAway",
);
const partnerAvatar = computed(() => {
  return (
    booking.value?.tour?.partner?.logo ||
    booking.value?.tour?.partner?.avatar ||
    fallbackAvatar
  );
});

const ratingLabel = computed(() => {
  const rating =
    Number(booking.value?.tour?.rating) ||
    Number(booking.value?.tour?.partner?.rating) ||
    0;

  return rating.toFixed(1).replace(".", ",");
});

const reviewsCountValue = computed(
  () => Number(booking.value?.tour?.reviewsCount || 0) || 0,
);

const reviewsCountLabel = computed(() => {
  const count = reviewsCountValue.value;
  const lastTwo = count % 100;
  const last = count % 10;

  if (lastTwo >= 11 && lastTwo <= 14) return `${count} отзывов`;
  if (last === 1) return `${count} отзыв`;
  if (last >= 2 && last <= 4) return `${count} отзыва`;
  return `${count} отзывов`;
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

const timeRange = computed(() => {
  return [booking.value?.timeFrom, booking.value?.timeTo]
    .map(normalizeString)
    .filter(Boolean)
    .join(" - ");
});

const bookingTotal = computed(() => formatMoney(booking.value?.total));
const guestsLabel = computed(() => `${Number(booking.value?.guests || 0) || 1}`);

const ticketRows = computed(() => {
  const selections = Array.isArray(booking.value?.ticketSelections)
    ? booking.value.ticketSelections
    : [];

  return selections
    .filter((item) => Number(item?.quantity) > 0)
    .map((item, index) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;

      return {
        key: `${item.title || "ticket"}-${index}`,
        title: item.title || "Билет",
        value: `${quantity} ${pluralizeTickets(quantity)} x ${formatMoney(price)}`,
      };
    });
});

const tourDiscountLabel = computed(() => {
  const discount = Number(booking.value?.tourDiscountPercent || 0);
  return discount > 0 ? `-${discount}%` : "";
});

const promoCodeLabel = computed(() => {
  const discountAmount = Number(booking.value?.promoDiscountAmount || 0);
  const promoCode = normalizeString(booking.value?.promoCode);

  if (discountAmount > 0) {
    return `-${formatMoney(discountAmount)}`;
  }

  return promoCode ? promoCode : "";
});

const bonusPaymentLabel = computed(() => {
  const paidWithBonuses = Number(booking.value?.paidWithBonuses || 0);
  return paidWithBonuses > 0 ? `-${formatMoney(paidWithBonuses)}` : "";
});

const paymentMethodLabel = computed(() => {
  const method = normalizeString(booking.value?.paymentMethod);

  if (method === "bonus") return "Бонусы";
  if (method === "installment") return "Рассрочка";
  return "Банковская карта";
});

const paymentIcon = computed(() => {
  return booking.value?.paymentMethod === "bonus" ? "wallet" : "credit-card";
});

const statusButtonLabel = computed(() => {
  if (bookingStatus.value === "completed") return "Завершенный билет";
  if (bookingStatus.value === "cancelled") return "Отмененный билет";
  return isCancelling.value ? "Отменяем..." : "Активный билет";
});

const setCancelledBooking = (nextBooking = null) => {
  booking.value = nextBooking?._id
    ? nextBooking
    : { ...booking.value, status: "cancelled" };
};

const loadBooking = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  message.value = "";

  try {
    const response = await api.client({
      url: "/personal-cabinet/bookings/tours",
      method: "get",
    });
    const items = getResponseItems(response);
    const foundBooking = items.find((item) => {
      return (
        String(item?._id || "") === bookingId.value ||
        String(item?.tour?._id || "") === bookingId.value
      );
    });

    if (!foundBooking) {
      booking.value = null;
      errorMessage.value = "Билет не найден.";
      return;
    }

    booking.value = foundBooking;
  } catch (error) {
    errorMessage.value = error?.message || "Не удалось загрузить билет.";
  } finally {
    isLoading.value = false;
  }
};

const getRefundPayload = (payload = {}) => {
  const reason = payload?.reason || {};
  const reasonValue =
    typeof reason === "object" ? reason.value : normalizeString(reason);
  const reasonLabel =
    typeof reason === "object" ? reason.label : normalizeString(reason);

  return {
    refundReason: normalizeString(reasonValue),
    refundReasonLabel: normalizeString(reasonLabel),
    refundComment: normalizeString(payload?.comment),
  };
};

const cancelBooking = async (payload = {}) => {
  if (!booking.value?._id || isCancelling.value) {
    return false;
  }

  if (bookingStatus.value !== "active") {
    refundErrorDescription.value =
      "Вернуть можно только активное бронирование. Этот билет уже не активен.";
    return false;
  }

  isCancelling.value = true;
  errorMessage.value = "";
  message.value = "";

  try {
    const response = await api.client({
      url: `/personal-cabinet/bookings/tours/${booking.value._id}/cancel`,
      method: "patch",
      data: getRefundPayload(payload),
    });

    setCancelledBooking(response?.data);
    message.value = "Бронирование отменено.";
    return true;
  } catch (error) {
    refundErrorDescription.value =
      error?.message ||
      "Не удалось оформить возврат. Попробуйте позже или свяжитесь со службой поддержки.";
    errorMessage.value = refundErrorDescription.value;
    return false;
  } finally {
    isCancelling.value = false;
  }
};

const openRefundModal = () => {
  if (!canCancelBooking.value) {
    return;
  }

  statusRefundModal.value = "";
  isOpenRefundModal.value = true;
};

const closeRefundModal = () => {
  if (isCancelling.value) {
    return;
  }

  isOpenRefundModal.value = false;
};

const openPartialRefundModal = () => {
  if (!canCancelBooking.value) {
    return;
  }

  statusPartialRefundModal.value = "";
  isOpenPartialRefundModal.value = true;
};

const closePartialRefundModal = () => {
  if (isCancelling.value) {
    return;
  }

  isOpenPartialRefundModal.value = false;
};

const handleRefundRequest = async (payload) => {
  const isCancelled = await cancelBooking(payload);

  closeRefundModal();
  statusRefundModal.value = isCancelled ? "success" : "cancelled";
};

const handlePartialRefundRequest = async (payload) => {
  const isCancelled = await cancelBooking(payload);

  closePartialRefundModal();
  statusPartialRefundModal.value = isCancelled ? "success" : "cancelled";
};

const closeStatusRefundModal = () => {
  statusRefundModal.value = "";
};

const closeStatusPartialRefundModal = () => {
  statusPartialRefundModal.value = "";
};

useSeoMeta({
  title: overlayTitle,
  ogTitle: overlayTitle,
  description: "FlyAway - билет тура",
  ogDescription: "FlyAway - билет тура",
});

onMounted(loadBooking);
</script>

<style lang="scss" scoped>
.ticket {
  &__wrapper {
    padding: 20px;
    background-color: $white;
    border-radius: 16px;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }

  &__refund {
    color: $orange-200;
    font-size: 14px;

    &--mobile {
      display: none;
    }
  }

  &__box {
    display: flex;
    justify-content: space-between;
    margin: 26px 0;
    gap: 26px;

    &-inner {
      display: flex;
      flex-direction: column;
      gap: 30px;
      max-width: 245px;
      width: 100%;
    }
  }

  &__qr {
    max-width: 100%;
    object-fit: cover;
  }

  &__btn {
    font-weight: 600;
    font-size: 14px;
    border-radius: 26px;

    &--completed {
      background: $blue-500;
    }

    &--cancelled {
      background: $surface-400;
    }
  }

  &__avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
  }

  &__content {
    width: 100%;

    &-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    &-inner {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    &-info {
      display: flex;
      flex-direction: column;
      gap: 24px;
      margin: 16px 0;
      color: $surface-900;
    }

    &-about {
      font-weight: 400;
    }

    &-list {
      display: flex;
      flex-direction: column;

      &-item {
        list-style: disc;
        margin-left: 30px;
      }
    }
  }

  &__reviews {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  &__name {
    color: $surface-900;
    font-size: 14px;
    font-weight: 400;
  }

  &__count {
    font-size: 12.5px;
    color: $surface-300;
    font-weight: 400;
  }

  &__average {
    font-size: 12.5px;
    color: $surface-900;
    font-weight: 400;
  }

  &__table {
    color: $surface-900;
  }

  &__tr &__td:last-child {
    text-align: right;
    font-weight: 400;
  }

  &__td {
    font-weight: 100;
    padding-top: 4px;

    &--bold {
      font-weight: 400;
    }

    &--box {
      display: flex;
      gap: 4px;
      align-items: center;
    }
  }

  &__tr {
    &--padding td {
      padding-top: 24px;
    }

    &--blue {
      color: $red-500;
      font-weight: 400;

      & td {
        padding-top: 16px;
      }
    }
  }

  &__download {
    border: 1px solid $red-500;
    max-width: 240px;
    background-color: transparent;
    width: 100%;
    display: flex;
    justify-content: center;
    color: $red-500;
    padding: 10px;

    &--mobile {
      display: none;
    }
  }

  &__state {
    min-height: 220px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: $surface-900;
    text-align: center;
  }

  &__retry {
    min-height: 40px;
    padding: 0 16px;
    border-radius: 10px;
    color: $white;
    background: $red-500;
    font-size: 14px;
    font-weight: 700;
  }

  &__message,
  &__error {
    margin-top: 16px;
    font-size: 14px;
    font-weight: 600;
  }

  &__message {
    color: $green-400;
  }

  &__error {
    color: $orange-200;
  }
}

@media (max-width: 375px) {
  .ticket {
    &__wrapper {
      margin: 26px 0;
    }

    &__header {
      display: none;
    }

    &__box {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      &-inner {
        gap: 16px;
      }
    }

    &__content-box {
      flex-direction: column;
      align-items: flex-start;
    }

    &__refund {
      &--mobile {
        display: block;
        text-align: left;
      }
    }

    &__download {
      display: none;

      &--mobile {
        display: flex;
      }
    }
  }
}
</style>
