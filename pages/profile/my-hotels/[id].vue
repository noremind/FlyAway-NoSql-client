<template>
  <div class="hotel-ticket-page">
    <UiGoBack label="Мои отели" go-back="/profile/my-hotels" />

    <div v-if="isLoading" class="hotel-ticket-page__state">Загружаем бронь...</div>
    <div v-else-if="errorMessage" class="hotel-ticket-page__state hotel-ticket-page__state--error">{{ errorMessage }}</div>

    <section v-else-if="booking" class="hotel-ticket-page__card">
      <div class="hotel-ticket-page__header">
        <div>
          <p class="hotel-ticket-page__number">Бронь №{{ bookingNumber }}</p>
          <h1 class="hotel-ticket-page__title">{{ hotelName }}</h1>
        </div>
        <button v-if="['new', 'active'].includes(bookingStatus)" class="hotel-ticket-page__cancel" type="button" :disabled="isCancelling" @click="handleCancelBooking(booking._id)">
          {{ isCancelling ? 'Отменяем...' : 'Отменить заявку' }}
        </button>
      </div>

      <div class="hotel-ticket-page__layout">
        <aside class="hotel-ticket-page__qr-side">
          <a class="hotel-ticket-page__qr-box" :href="qrVerifyPath" target="_blank" rel="noopener">
            <img class="hotel-ticket-page__qr-image" :src="qrImageUrl" alt="QR бронь" />
          </a>
          <p class="hotel-ticket-page__qr-caption">QR ведет на {{ qrVerifyPath }}</p>
          <span class="hotel-ticket-page__status" :class="`hotel-ticket-page__status--${bookingStatus}`">{{ statusLabel }}</span>
          <div class="hotel-ticket-page__request-meta">
            <span>Статус заявки</span>
            <strong>{{ requestStatusLabel }}</strong>
          </div>
        </aside>

        <div class="hotel-ticket-page__content">
          <div class="hotel-ticket-page__partner-line">
            <div class="hotel-ticket-page__partner">
              <img class="hotel-ticket-page__partner-avatar" :src="partnerAvatar" :alt="partnerTitle" />
              <span>{{ partnerTitle }}</span>
            </div>
            <span class="hotel-ticket-page__rating">{{ starsLabel }} • {{ ratingLabel }}</span>
          </div>

          <div class="hotel-ticket-page__visual">
            <img class="hotel-ticket-page__image" :src="hotelImage" :alt="hotelName" />
          </div>

          <div class="hotel-ticket-page__section">
            <h2>Об отеле</h2>
            <p>{{ hotelDescription }}</p>
          </div>

          <div class="hotel-ticket-page__summary">
            <div class="hotel-ticket-page__row"><span>Заезд</span><strong>{{ checkInLabel }}</strong></div>
            <div class="hotel-ticket-page__row"><span>Выезд</span><strong>{{ checkOutLabel }}</strong></div>
            <div class="hotel-ticket-page__row"><span>Гостей</span><strong>{{ guestsLabel }}</strong></div>
            <div class="hotel-ticket-page__row"><span>Стоимость</span><strong>{{ totalLabel }}</strong></div>
            <div class="hotel-ticket-page__row"><span>Имя</span><strong>{{ contactName }}</strong></div>
            <div class="hotel-ticket-page__row"><span>Телефон</span><strong>{{ contactPhone }}</strong></div>
            <div class="hotel-ticket-page__row"><span>Email</span><strong>{{ contactEmail }}</strong></div>
            <div class="hotel-ticket-page__row"><span>Локация</span><strong>{{ hotelLocation }}</strong></div>
          </div>

          <div class="hotel-ticket-page__section">
            <h2>Комментарий</h2>
            <p>{{ commentLabel }}</p>
          </div>

          <div v-if="bookingStatus === 'completed'" class="hotel-ticket-page__review">
            <template v-if="canReview">
              <h2 class="hotel-ticket-page__review-title">Оставить отзыв</h2>
              <p class="hotel-ticket-page__review-text">Бронь завершена, поэтому вы можете оценить этот отель.</p>

              <div class="hotel-ticket-page__review-stars" aria-label="Рейтинг отеля">
                <button
                  v-for="star in 5"
                  :key="star"
                  type="button"
                  class="hotel-ticket-page__review-star"
                  :class="{ 'hotel-ticket-page__review-star--active': star <= reviewForm.rating }"
                  @click="reviewForm.rating = star"
                >
                  ★
                </button>
              </div>

              <UiTextarea
                label="Ваш отзыв"
                placeholder="Напишите, что понравилось или что можно улучшить"
                v-model.trim="reviewForm.comment"
                :rows="4"
              />

              <p v-if="reviewError" class="hotel-ticket-page__review-error">{{ reviewError }}</p>
              <p v-if="reviewMessage" class="hotel-ticket-page__review-success">{{ reviewMessage }}</p>

              <UiButton
                label="Отправить отзыв"
                class="hotel-ticket-page__review-submit button-primary"
                :is-loading="isSubmittingReview"
                :disabled="isSubmittingReview"
                @click="submitHotelReview"
              />
            </template>

            <p v-else-if="hasReview" class="hotel-ticket-page__review-note">
              Вы уже оставили отзыв для этого отеля.
            </p>

            <p v-else class="hotel-ticket-page__review-note">
              Отзыв доступен только после подтверждённой завершённой брони.
            </p>
          </div>

          <div class="hotel-ticket-page__actions">
            <NuxtLink class="hotel-ticket-page__action hotel-ticket-page__action--primary" :to="hotelLink">Перейти к отелю</NuxtLink>
            <NuxtLink class="hotel-ticket-page__action" :to="qrVerifyPath" target="_blank">Открыть QR-проверку</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <div v-else class="hotel-ticket-page__state">Заявка не найдена.</div>
  </div>
</template>

<script setup>
import partnerPlaceholder from '@/assets/image/common/tour-avatar.png';
import hotelPlaceholder from '@/assets/image/content/main-image.png';

const route = useRoute();
const api = useApi();

const booking = ref(null);
const isLoading = ref(false);
const isCancelling = ref(false);
const errorMessage = ref('');
const canReview = ref(false);
const hasReview = ref(false);
const isSubmittingReview = ref(false);
const reviewMessage = ref('');
const reviewError = ref('');
const reviewForm = reactive({ rating: 5, comment: '' });

useSeoMeta({ title: 'FlyAway - Заявка на отель', description: 'Информация о заявке на бронирование отеля' });

const normalizeString = (value) => String(value || '').trim();
const parseDateValue = (value) => {
  const text = normalizeString(value);
  if (!text) return null;
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(text) ? new Date(`${text}T00:00:00`) : new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};
const formatDateLabel = (value) => {
  const parsed = parseDateValue(value);
  if (!parsed) return normalizeString(value) || 'Дата уточняется';
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' }).format(parsed);
};

const hotelId = computed(() => normalizeString(booking.value?.hotel?._id));
const bookingStatus = computed(() => ['new', 'active', 'completed', 'cancelled'].includes(normalizeString(booking.value?.status)) ? booking.value.status : 'new');
const statusLabel = computed(() => {
  if (bookingStatus.value === 'new') return 'Новая заявка';
  if (bookingStatus.value === 'completed') return 'Завершенная';
  if (bookingStatus.value === 'cancelled') return 'Отмененная';
  return 'Активная бронь';
});
const requestStatusLabel = computed(() => {
  const value = normalizeString(booking.value?.requestStatus || booking.value?.status);
  if (value === 'active' || value === 'contacted' || value === 'in_progress') return 'Активная';
  if (value === 'completed' || value === 'closed') return 'Завершенная';
  if (value === 'cancelled') return 'Отменена';
  return 'Новая';
});
const hotelName = computed(() => normalizeString(booking.value?.hotel?.name) || 'Отель FlyAway');
const hotelImage = computed(() => (Array.isArray(booking.value?.hotel?.images) ? booking.value.hotel.images.find(Boolean) : '') || hotelPlaceholder);
const hotelDescription = computed(() => normalizeString(booking.value?.hotel?.description) || normalizeString(booking.value?.hotel?.content) || 'Описание отеля скоро появится.');
const hotelLocation = computed(() => normalizeString(booking.value?.hotel?.location) || 'Локация уточняется');
const checkInLabel = computed(() => formatDateLabel(booking.value?.checkIn));
const checkOutLabel = computed(() => formatDateLabel(booking.value?.checkOut));
const guestsLabel = computed(() => `${Math.max(1, Number(booking.value?.guests) || 1)}`);
const totalLabel = computed(() => Number(booking.value?.total) > 0 ? `${Number(booking.value.total).toLocaleString('ru-RU')} ₸` : 'Уточняется');
const contactName = computed(() => normalizeString(booking.value?.name) || '—');
const contactPhone = computed(() => normalizeString(booking.value?.phone) || '—');
const contactEmail = computed(() => normalizeString(booking.value?.email) || '—');
const commentLabel = computed(() => normalizeString(booking.value?.comment) || 'Без комментария');
const partnerTitle = computed(() => normalizeString(booking.value?.hotel?.partner?.title || booking.value?.partner?.title) || 'FlyAway Partner');
const partnerAvatar = computed(() => booking.value?.hotel?.partner?.logo || booking.value?.hotel?.partner?.avatar || booking.value?.partner?.logo || booking.value?.partner?.avatar || partnerPlaceholder);
const ratingLabel = computed(() => (Number(booking.value?.hotel?.rating) || 0).toFixed(1).replace('.', ','));
const starsLabel = computed(() => {
  const stars = Math.max(0, Math.round(Number(booking.value?.hotel?.rating) || 0));
  return stars ? '★'.repeat(stars) : 'Без рейтинга';
});
const bookingNumber = computed(() => {
  const numeric = Number.parseInt(String(booking.value?._id || '').slice(-6), 16);
  return Number.isFinite(numeric) ? String(numeric % 100000).padStart(5, '0') : '12345';
});
const hotelLink = computed(() => hotelId.value ? `/hotels/${hotelId.value}` : '/hotels');
const qrVerifyPath = computed(() => booking.value?._id ? `/qr/hotels/${booking.value._id}` : '/qr/hotels/not-found');
const qrVerifyUrl = computed(() => typeof window !== 'undefined' ? `${window.location.origin}${qrVerifyPath.value}` : qrVerifyPath.value);
const qrImageUrl = computed(() => `https://quickchart.io/qr?text=${encodeURIComponent(qrVerifyUrl.value)}&size=280`);

const loadReviewAccess = async () => {
  canReview.value = false;
  hasReview.value = false;
  reviewMessage.value = '';
  reviewError.value = '';

  if (!hotelId.value || bookingStatus.value !== 'completed') return;

  try {
    const response = await api.client({
      url: `/hotel-reviews/can-review/${hotelId.value}`,
      method: 'get',
    });
    canReview.value = Boolean(response?.data?.canReview);
    hasReview.value = Boolean(response?.data?.hasReview);
  } catch {
    canReview.value = false;
  }
};

const loadBooking = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const response = await api.client({ url: '/personal-cabinet/bookings/hotels', method: 'get' });
    const items = Array.isArray(response?.data) ? response.data : [];
    booking.value = items.find((item) => item?._id === route.params.id) || null;
    if (!booking.value) errorMessage.value = 'Заявка не найдена.';
    await loadReviewAccess();
  } catch (error) {
    errorMessage.value = error?.message || 'Не удалось загрузить заявку.';
  } finally {
    isLoading.value = false;
  }
};

const submitHotelReview = async () => {
  reviewError.value = '';
  reviewMessage.value = '';

  if (!hotelId.value) {
    reviewError.value = 'Отель не найден.';
    return;
  }

  if (!Number(reviewForm.rating) || reviewForm.rating < 1 || reviewForm.rating > 5) {
    reviewError.value = 'Выберите оценку от 1 до 5.';
    return;
  }

  if (normalizeString(reviewForm.comment).length < 10) {
    reviewError.value = 'Отзыв должен содержать минимум 10 символов.';
    return;
  }

  isSubmittingReview.value = true;

  try {
    const response = await api.client({
      url: '/hotel-reviews',
      method: 'post',
      data: {
        hotelId: hotelId.value,
        rating: Number(reviewForm.rating),
        comment: normalizeString(reviewForm.comment),
      },
    });

    if (booking.value?.hotel && response?.data?.hotel) {
      booking.value.hotel = { ...booking.value.hotel, ...response.data.hotel };
    }

    reviewMessage.value = 'Спасибо! Ваш отзыв опубликован.';
    hasReview.value = true;
    canReview.value = false;
    reviewForm.comment = '';
  } catch (error) {
    reviewError.value = error?.message || 'Не удалось отправить отзыв.';
  } finally {
    isSubmittingReview.value = false;
  }
};

const handleCancelBooking = async (bookingId) => {
  if (!bookingId || isCancelling.value) return;
  if (typeof window !== 'undefined' && !window.confirm('Отменить эту заявку на отель?')) return;
  isCancelling.value = true;
  try {
    const response = await api.client({ url: `/personal-cabinet/bookings/hotels/${bookingId}/cancel`, method: 'patch' });
    booking.value = response?.data || booking.value;
    await loadReviewAccess();
  } catch (error) {
    errorMessage.value = error?.message || 'Не удалось отменить заявку.';
  } finally {
    isCancelling.value = false;
  }
};

onMounted(loadBooking);
</script>

<style lang="scss" scoped>
.hotel-ticket-page { display: grid; gap: 20px; }
.hotel-ticket-page__state, .hotel-ticket-page__card { background: $white; border-radius: 24px; box-shadow: 0 8px 28px rgba(0,0,0,.06); }
.hotel-ticket-page__state { padding: 32px 24px; color: $surface-500; text-align: center; &--error { color: $orange-200; } }
.hotel-ticket-page__card { padding: 28px; }
.hotel-ticket-page__header { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; margin-bottom: 24px; }
.hotel-ticket-page__number { color: $surface-500; font-weight: 700; margin-bottom: 6px; }
.hotel-ticket-page__title { color: $surface-900; font-size: 28px; font-weight: 900; line-height: 1.15; }
.hotel-ticket-page__cancel { color: $orange-200; font-weight: 800; }
.hotel-ticket-page__layout { display: grid; grid-template-columns: 240px minmax(0,1fr); gap: 34px; }
.hotel-ticket-page__qr-side { display: grid; gap: 16px; align-content: start; }
.hotel-ticket-page__qr-box { display: flex; align-items: center; justify-content: center; border-radius: 18px; background: $white; }
.hotel-ticket-page__qr-image { width: 100%; max-width: 210px; }
.hotel-ticket-page__qr-caption { color: $surface-500; font-size: 12px; overflow-wrap: anywhere; text-align: center; }
.hotel-ticket-page__status { min-height: 44px; border-radius: 999px; background: $red-500; color: $white; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; &--new { background: $orange-200; } &--completed { background: $surface-400; } &--cancelled { background: $surface-300; color: $surface-900; } }
.hotel-ticket-page__request-meta { padding: 14px; border-radius: 16px; background: rgba($red-500,.05); display: grid; gap: 4px; span { color: $surface-500; font-size: 12px; } strong { color: $surface-900; } }
.hotel-ticket-page__content { display: grid; gap: 20px; }
.hotel-ticket-page__partner-line { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
.hotel-ticket-page__partner { display: flex; align-items: center; gap: 10px; color: $surface-500; }
.hotel-ticket-page__partner-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
.hotel-ticket-page__rating { color: $surface-500; font-size: 13px; }
.hotel-ticket-page__image { width: 100%; max-height: 320px; border-radius: 18px; object-fit: cover; }
.hotel-ticket-page__section h2 { color: $surface-900; font-size: 17px; font-weight: 800; margin-bottom: 8px; }
.hotel-ticket-page__section p { color: $surface-500; line-height: 1.5; }
.hotel-ticket-page__summary { display: grid; gap: 8px; }
.hotel-ticket-page__row { display: flex; justify-content: space-between; gap: 16px; color: $surface-500; strong { color: $surface-900; text-align: right; overflow-wrap: anywhere; } }
.hotel-ticket-page__review { display: grid; gap: 14px; padding: 18px; border-radius: 18px; background: rgba($red-500, .04); border: 1px solid rgba($red-500, .08); }
.hotel-ticket-page__review-title { color: $surface-900; font-size: 18px; font-weight: 900; }
.hotel-ticket-page__review-text, .hotel-ticket-page__review-note { color: $surface-500; line-height: 1.5; }
.hotel-ticket-page__review-stars { display: flex; gap: 6px; align-items: center; }
.hotel-ticket-page__review-star { font-size: 30px; line-height: 1; color: $surface-300; transition: color .2s ease, transform .2s ease; &:hover { transform: translateY(-1px); } &--active { color: $orange-200; } }
.hotel-ticket-page__review-error { color: $orange-200; font-size: 14px; font-weight: 700; }
.hotel-ticket-page__review-success { color: $green-400; font-size: 14px; font-weight: 700; }
.hotel-ticket-page__review-submit { max-width: 220px; justify-content: center; }
.hotel-ticket-page__actions { display: flex; flex-wrap: wrap; gap: 12px; }
.hotel-ticket-page__action { min-height: 48px; padding: 0 24px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; color: $red-500; border: 1px solid rgba($red-500,.45); &--primary { color: $white; background: $red-500; border-color: $red-500; } }
@media (max-width: 900px) { .hotel-ticket-page__layout { grid-template-columns: 1fr; } .hotel-ticket-page__qr-side { justify-items: center; } }
@media (max-width: 640px) { .hotel-ticket-page__card { padding: 22px 18px; } .hotel-ticket-page__header, .hotel-ticket-page__partner-line, .hotel-ticket-page__row { flex-direction: column; align-items: flex-start; } .hotel-ticket-page__action, .hotel-ticket-page__review-submit { width: 100%; max-width: 100%; } }
</style>
