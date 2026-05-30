<template>
  <section class="admin-booking-detail">
    <UiGoBack label="Бронирования туров" go-back="/admin/tour-bookings" />

    <div v-if="isLoading" class="admin-booking-detail__state">Загружаем данные тура...</div>
    <div v-else-if="errorMessage" class="admin-booking-detail__state admin-booking-detail__state--error">{{ errorMessage }}</div>

    <template v-else-if="group">
      <section class="admin-booking-detail__hero">
        <img class="admin-booking-detail__image" :src="tourImage" :alt="tourTitle" />
        <div class="admin-booking-detail__hero-content">
          <p class="admin-booking-detail__eyebrow">Тур</p>
          <h1 class="admin-booking-detail__title">{{ tourTitle }}</h1>
          <p class="admin-booking-detail__text">{{ tourDescription }}</p>
          <div class="admin-booking-detail__hero-meta">
            <span>{{ partnerTitle }}</span>
            <span v-if="group?.tour?.departureCity">{{ group.tour.departureCity }}</span>
            <span v-if="group?.tour?.duration">{{ group.tour.duration }}</span>
          </div>
        </div>
      </section>

      <div class="admin-booking-detail__stats">
        <article v-for="item in statItems" :key="item.label" class="admin-booking-detail__stat">
          <p class="admin-booking-detail__stat-value">{{ item.value }}</p>
          <p class="admin-booking-detail__stat-label">{{ item.label }}</p>
        </article>
      </div>

      <section class="admin-booking-detail__panel">
        <div class="admin-booking-detail__panel-head">
          <div>
            <h2 class="admin-booking-detail__section-title">Покупатели тура</h2>
            <p class="admin-booking-detail__section-text">Здесь отображаются пользователи, которые купили этот тур.</p>
          </div>
          <UiSelect label="Статус" v-model="selectedStatus" :options="statusOptions" option-label="label" option-value="value" />
        </div>

        <div v-if="!bookings.length" class="admin-booking-detail__empty">По выбранному статусу записей нет.</div>

        <article v-for="booking in bookings" :key="booking._id" class="admin-booking-detail__booking">
          <div class="admin-booking-detail__booking-head">
            <div>
              <h3 class="admin-booking-detail__customer">{{ booking?.customer?.name || 'Пользователь' }}</h3>
              <p class="admin-booking-detail__muted">
                <span v-if="booking?.customer?.phone">{{ booking.customer.phone }}</span>
                <span v-if="booking?.customer?.email"> • {{ booking.customer.email }}</span>
              </p>
            </div>
            <span class="admin-booking-detail__status" :class="`admin-booking-detail__status--${booking.status}`">{{ getStatusLabel(booking.status) }}</span>
          </div>

          <div class="admin-booking-detail__grid">
            <div class="admin-booking-detail__field"><span>Дата</span><strong>{{ formatDate(booking.date) }}</strong></div>
            <div class="admin-booking-detail__field"><span>Гостей</span><strong>{{ booking.guests || 0 }}</strong></div>
            <div class="admin-booking-detail__field"><span>Сумма</span><strong>{{ formatMoney(booking.total) }} ₸</strong></div>
            <div class="admin-booking-detail__field"><span>Оплата</span><strong>{{ getPaymentLabel(booking.paymentMethod) }}</strong></div>
            <div class="admin-booking-detail__field"><span>Создано</span><strong>{{ formatDateTime(booking.createdAt) }}</strong></div>
            <div class="admin-booking-detail__field"><span>QR</span><strong>{{ booking._id }}</strong></div>
            <div class="admin-booking-detail__field admin-booking-detail__field--full"><span>Билеты</span><strong>{{ getTicketsSummary(booking.ticketSelections) || 'Не выбраны' }}</strong></div>
          </div>

          <div class="admin-booking-detail__actions">
            <UiSelect
              label="Изменить статус"
              :model-value="booking.status"
              :options="statusOptions.filter((item) => item.value)"
              option-label="label"
              option-value="value"
              @update:model-value="updateStatus(booking, $event)"
            />
          </div>
        </article>
      </section>
    </template>
  </section>
</template>

<script setup>
import tourPlaceholder from '@/assets/image/content/main-image.png';

definePageMeta({ layout: 'admin', middleware: 'admin' });
useSeo({ title: 'Детали бронирований тура', description: 'Покупатели и бронирования конкретного тура.' });

const route = useRoute();
const api = useApi();
const group = ref(null);
const isLoading = ref(false);
const errorMessage = ref('');
const selectedStatus = ref('');

const statusOptions = [
  { label: 'Все', value: '' },
  { label: 'Активные', value: 'active' },
  { label: 'Завершенные', value: 'completed' },
  { label: 'Отмененные', value: 'cancelled' },
];

const normalizeString = (value) => String(value || '').trim();
const formatMoney = (value) => Number(value || 0).toLocaleString('ru-RU');
const tourTitle = computed(() => normalizeString(group.value?.tour?.title) || 'Тур');
const tourDescription = computed(() => normalizeString(group.value?.tour?.description) || 'Описание тура не указано.');
const partnerTitle = computed(() => normalizeString(group.value?.tour?.partner?.title) || 'Партнер не указан');
const tourImage = computed(() => group.value?.tour?.avatar || (Array.isArray(group.value?.tour?.images) ? group.value.tour.images.find(Boolean) : '') || tourPlaceholder);
const bookings = computed(() => Array.isArray(group.value?.bookings) ? group.value.bookings : []);

const formatDate = (value) => {
  if (!value) return 'Не указано';
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(String(value)) ? new Date(`${value}T00:00:00`) : new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' }).format(parsed);
};

const formatDateTime = (value) => {
  if (!value) return 'Не указано';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(parsed);
};

const getStatusLabel = (status) => {
  if (status === 'completed') return 'Завершено';
  if (status === 'cancelled') return 'Отменено';
  return 'Активно';
};

const getPaymentLabel = (method) => method === 'bonus' ? 'Бонусы' : 'Карта';
const getTicketsSummary = (ticketSelections) => (Array.isArray(ticketSelections) ? ticketSelections : [])
  .filter((item) => Number(item?.quantity) > 0)
  .map((item) => `${item.title || 'Билет'} × ${item.quantity}`)
  .join(', ');

const statItems = computed(() => [
  { label: 'Всего броней', value: group.value?.bookingCount || 0 },
  { label: 'Активные', value: group.value?.activeCount || 0 },
  { label: 'Гостей', value: group.value?.guestsCount || 0 },
  { label: 'Сумма', value: `${formatMoney(group.value?.totalAmount)} ₸` },
]);

const loadGroup = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const response = await api.client({
      url: `/tour-bookings/manage/${route.params.id}`,
      method: 'get',
      query: { status: selectedStatus.value || undefined },
    });
    group.value = response?.data || null;
  } catch (error) {
    errorMessage.value = error?.message || 'Не удалось загрузить данные тура.';
  } finally {
    isLoading.value = false;
  }
};

const updateStatus = async (booking, status) => {
  if (!booking?._id || !status || booking.status === status) return;
  try {
    await api.client({ url: `/tour-bookings/${booking._id}/status`, method: 'patch', data: { status } });
    await loadGroup();
  } catch (error) {
    errorMessage.value = error?.message || 'Не удалось обновить статус.';
  }
};

watch(selectedStatus, loadGroup);
onMounted(loadGroup);
</script>

<style lang="scss" scoped>
.admin-booking-detail { display: grid; gap: 18px; }
.admin-booking-detail__state, .admin-booking-detail__hero, .admin-booking-detail__panel { padding: 22px; border-radius: 22px; background: $white; box-shadow: 0 10px 26px rgba(32,36,38,.04); }
.admin-booking-detail__state { color: $surface-500; text-align: center; &--error { color: $orange-200; } }
.admin-booking-detail__hero { display: grid; grid-template-columns: 260px minmax(0,1fr); gap: 22px; align-items: center; }
.admin-booking-detail__image { width: 100%; height: 180px; border-radius: 18px; object-fit: cover; }
.admin-booking-detail__eyebrow { color: $red-500; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: .12em; }
.admin-booking-detail__title { margin-top: 6px; color: $surface-900; font-size: 30px; font-weight: 900; line-height: 1.1; }
.admin-booking-detail__text { margin-top: 10px; color: $surface-500; line-height: 1.55; }
.admin-booking-detail__hero-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; span { padding: 8px 12px; border-radius: 999px; background: rgba($red-500,.06); color: $red-500; font-weight: 800; font-size: 13px; } }
.admin-booking-detail__stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
.admin-booking-detail__stat { padding: 18px; border-radius: 18px; background: $white; border: 1px solid rgba($red-500,.08); }
.admin-booking-detail__stat-value { color: $red-500; font-size: 28px; font-weight: 900; }
.admin-booking-detail__stat-label { margin-top: 8px; color: $surface-500; font-size: 13px; }
.admin-booking-detail__panel { display: grid; gap: 16px; }
.admin-booking-detail__panel-head { display: flex; justify-content: space-between; gap: 16px; align-items: flex-end; }
.admin-booking-detail__section-title { color: $surface-900; font-size: 22px; font-weight: 900; }
.admin-booking-detail__section-text, .admin-booking-detail__muted { color: $surface-500; font-size: 14px; line-height: 1.45; }
.admin-booking-detail__booking { display: grid; gap: 14px; padding: 18px; border-radius: 18px; border: 1px solid rgba($red-500,.08); background: rgba($surface-75,.8); }
.admin-booking-detail__booking-head { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
.admin-booking-detail__customer { color: $surface-900; font-size: 18px; font-weight: 900; }
.admin-booking-detail__status { padding: 8px 12px; border-radius: 999px; color: $white; background: $red-500; font-size: 12px; font-weight: 900; &--completed { background: $surface-400; } &--cancelled { background: $surface-300; color: $surface-900; } }
.admin-booking-detail__grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
.admin-booking-detail__field { display: grid; gap: 5px; padding: 12px; border-radius: 14px; background: $white; span { color: $surface-500; font-size: 12px; } strong { color: $surface-900; font-size: 14px; overflow-wrap: anywhere; } &--full { grid-column: 1 / -1; } }
.admin-booking-detail__actions { max-width: 280px; }
.admin-booking-detail__empty { padding: 22px; color: $surface-500; text-align: center; }
@media (max-width: 900px) { .admin-booking-detail__hero, .admin-booking-detail__stats, .admin-booking-detail__grid { grid-template-columns: 1fr; } .admin-booking-detail__panel-head, .admin-booking-detail__booking-head { flex-direction: column; align-items: flex-start; } }
</style>
