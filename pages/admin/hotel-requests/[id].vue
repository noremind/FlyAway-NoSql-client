<template>
  <section class="admin-request-detail">
    <UiGoBack label="Заявки на отели" go-back="/admin/hotel-requests" />

    <div v-if="isLoading" class="admin-request-detail__state">Загружаем данные отеля...</div>
    <div v-else-if="errorMessage" class="admin-request-detail__state admin-request-detail__state--error">{{ errorMessage }}</div>

    <template v-else-if="group">
      <section class="admin-request-detail__hero">
        <img class="admin-request-detail__image" :src="hotelImage" :alt="hotelName" />
        <div class="admin-request-detail__hero-content">
          <p class="admin-request-detail__eyebrow">Отель</p>
          <h1 class="admin-request-detail__title">{{ hotelName }}</h1>
          <p class="admin-request-detail__text">{{ hotelDescription }}</p>
          <div class="admin-request-detail__hero-meta">
            <span>{{ partnerTitle }}</span>
            <span v-if="group?.hotel?.location">{{ group.hotel.location }}</span>
            <span v-if="group?.hotel?.rating">★ {{ group.hotel.rating }}</span>
          </div>
        </div>
      </section>

      <div class="admin-request-detail__stats">
        <article v-for="item in statItems" :key="item.label" class="admin-request-detail__stat">
          <p class="admin-request-detail__stat-value">{{ item.value }}</p>
          <p class="admin-request-detail__stat-label">{{ item.label }}</p>
        </article>
      </div>

      <section class="admin-request-detail__panel">
        <div class="admin-request-detail__panel-head">
          <div>
            <h2 class="admin-request-detail__section-title">Клиенты и заявки</h2>
            <p class="admin-request-detail__section-text">Здесь отображаются пользователи, которые оставили заявку на этот отель.</p>
          </div>
          <UiSelect label="Статус" v-model="selectedStatus" :options="statusOptions" option-label="label" option-value="value" />
        </div>

        <div v-if="!requests.length" class="admin-request-detail__empty">По выбранному статусу записей нет.</div>

        <article v-for="request in requests" :key="request._id" class="admin-request-detail__request">
          <div class="admin-request-detail__request-head">
            <div>
              <h3 class="admin-request-detail__customer">{{ request?.name || request?.createdBy?.name || 'Клиент' }}</h3>
              <p class="admin-request-detail__muted">
                <span v-if="request?.phone">{{ request.phone }}</span>
                <span v-if="request?.email"> • {{ request.email }}</span>
              </p>
            </div>
            <span class="admin-request-detail__status" :class="`admin-request-detail__status--${request.status}`">{{ getStatusLabel(request.status) }}</span>
          </div>

          <div class="admin-request-detail__grid">
            <div class="admin-request-detail__field"><span>Заезд</span><strong>{{ formatDate(request.checkIn) }}</strong></div>
            <div class="admin-request-detail__field"><span>Выезд</span><strong>{{ formatDate(request.checkOut) }}</strong></div>
            <div class="admin-request-detail__field"><span>Гостей</span><strong>{{ request.guests || 1 }}</strong></div>
            <div class="admin-request-detail__field"><span>Создано</span><strong>{{ formatDateTime(request.createdAt) }}</strong></div>
            <div class="admin-request-detail__field"><span>QR</span><strong>{{ request._id }}</strong></div>
            <div class="admin-request-detail__field"><span>Источник</span><strong>{{ request.source || 'website' }}</strong></div>
            <div class="admin-request-detail__field admin-request-detail__field--full"><span>Комментарий клиента</span><strong>{{ request.comment || 'Без комментария' }}</strong></div>
            <div class="admin-request-detail__field admin-request-detail__field--full"><span>Заметка менеджера</span><strong>{{ request.managerNote || 'Нет заметки' }}</strong></div>
          </div>

          <div class="admin-request-detail__actions">
            <UiSelect
              label="Статус"
              :model-value="request.status"
              :options="statusOptions.filter((item) => item.value)"
              option-label="label"
              option-value="value"
              @update:model-value="updateStatus(request, $event)"
            />
            <UiTextarea
              label="Заметка менеджера"
              :model-value="pendingNotes[request._id] || request.managerNote || ''"
              @update:model-value="pendingNotes[request._id] = $event"
            />
          </div>
        </article>
      </section>
    </template>
  </section>
</template>

<script setup>
import hotelPlaceholder from '@/assets/image/content/main-image.png';

definePageMeta({ layout: 'admin', middleware: 'admin' });
useSeo({ title: 'Детали заявок отеля', description: 'Клиенты и заявки конкретного отеля.' });

const route = useRoute();
const api = useApi();
const group = ref(null);
const isLoading = ref(false);
const errorMessage = ref('');
const selectedStatus = ref('');
const pendingNotes = reactive({});

const statusOptions = [
  { label: 'Все', value: '' },
  { label: 'Новые', value: 'new' },
  { label: 'В работе', value: 'in_progress' },
  { label: 'Связались', value: 'contacted' },
  { label: 'Закрыто', value: 'closed' },
  { label: 'Отменено', value: 'cancelled' },
];

const normalizeString = (value) => String(value || '').trim();
const hotelName = computed(() => normalizeString(group.value?.hotel?.name) || 'Отель');
const hotelDescription = computed(() => normalizeString(group.value?.hotel?.description) || normalizeString(group.value?.hotel?.content) || 'Описание отеля не указано.');
const partnerTitle = computed(() => normalizeString(group.value?.partner?.title || group.value?.hotel?.partner?.title) || 'Партнер не указан');
const hotelImage = computed(() => (Array.isArray(group.value?.hotel?.images) ? group.value.hotel.images.find(Boolean) : '') || hotelPlaceholder);
const requests = computed(() => Array.isArray(group.value?.requests) ? group.value.requests : []);

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
  if (status === 'in_progress') return 'В работе';
  if (status === 'contacted') return 'Связались';
  if (status === 'closed') return 'Закрыто';
  if (status === 'cancelled') return 'Отменено';
  return 'Новая';
};

const statItems = computed(() => [
  { label: 'Всего заявок', value: group.value?.requestCount || 0 },
  { label: 'Новые', value: group.value?.newCount || 0 },
  { label: 'В работе', value: group.value?.inProgressCount || 0 },
  { label: 'Гостей', value: group.value?.guestsCount || 0 },
]);

const loadGroup = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const response = await api.client({
      url: `/hotel-requests/manage/${route.params.id}`,
      method: 'get',
      query: { status: selectedStatus.value || undefined },
    });
    group.value = response?.data || null;
    for (const item of requests.value) pendingNotes[item._id] = item.managerNote || '';
  } catch (error) {
    errorMessage.value = error?.message || 'Не удалось загрузить данные отеля.';
  } finally {
    isLoading.value = false;
  }
};

const updateStatus = async (request, status) => {
  if (!request?._id || !status) return;
  try {
    await api.client({
      url: `/hotel-requests/${request._id}/status`,
      method: 'patch',
      data: { status, managerNote: pendingNotes[request._id] || '' },
    });
    await loadGroup();
  } catch (error) {
    errorMessage.value = error?.message || 'Не удалось обновить статус.';
  }
};

watch(selectedStatus, loadGroup);
onMounted(loadGroup);
</script>

<style lang="scss" scoped>
.admin-request-detail { display: grid; gap: 18px; }
.admin-request-detail__state, .admin-request-detail__hero, .admin-request-detail__panel { padding: 22px; border-radius: 22px; background: $white; box-shadow: 0 10px 26px rgba(32,36,38,.04); }
.admin-request-detail__state { color: $surface-500; text-align: center; &--error { color: $orange-200; } }
.admin-request-detail__hero { display: grid; grid-template-columns: 260px minmax(0,1fr); gap: 22px; align-items: center; }
.admin-request-detail__image { width: 100%; height: 180px; border-radius: 18px; object-fit: cover; }
.admin-request-detail__eyebrow { color: $red-500; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: .12em; }
.admin-request-detail__title { margin-top: 6px; color: $surface-900; font-size: 30px; font-weight: 900; line-height: 1.1; }
.admin-request-detail__text { margin-top: 10px; color: $surface-500; line-height: 1.55; }
.admin-request-detail__hero-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; span { padding: 8px 12px; border-radius: 999px; background: rgba($red-500,.06); color: $red-500; font-weight: 800; font-size: 13px; } }
.admin-request-detail__stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
.admin-request-detail__stat { padding: 18px; border-radius: 18px; background: $white; border: 1px solid rgba($red-500,.08); }
.admin-request-detail__stat-value { color: $red-500; font-size: 28px; font-weight: 900; }
.admin-request-detail__stat-label { margin-top: 8px; color: $surface-500; font-size: 13px; }
.admin-request-detail__panel { display: grid; gap: 16px; }
.admin-request-detail__panel-head { display: flex; justify-content: space-between; gap: 16px; align-items: flex-end; }
.admin-request-detail__section-title { color: $surface-900; font-size: 22px; font-weight: 900; }
.admin-request-detail__section-text, .admin-request-detail__muted { color: $surface-500; font-size: 14px; line-height: 1.45; }
.admin-request-detail__request { display: grid; gap: 14px; padding: 18px; border-radius: 18px; border: 1px solid rgba($red-500,.08); background: rgba($surface-75,.8); }
.admin-request-detail__request-head { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
.admin-request-detail__customer { color: $surface-900; font-size: 18px; font-weight: 900; }
.admin-request-detail__status { padding: 8px 12px; border-radius: 999px; color: $white; background: $red-500; font-size: 12px; font-weight: 900; &--closed { background: $surface-400; } &--cancelled { background: $surface-300; color: $surface-900; } }
.admin-request-detail__grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
.admin-request-detail__field { display: grid; gap: 5px; padding: 12px; border-radius: 14px; background: $white; span { color: $surface-500; font-size: 12px; } strong { color: $surface-900; font-size: 14px; overflow-wrap: anywhere; } &--full { grid-column: 1 / -1; } }
.admin-request-detail__actions { display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: 14px; align-items: start; }
.admin-request-detail__empty { padding: 22px; color: $surface-500; text-align: center; }
@media (max-width: 900px) { .admin-request-detail__hero, .admin-request-detail__stats, .admin-request-detail__grid, .admin-request-detail__actions { grid-template-columns: 1fr; } .admin-request-detail__panel-head, .admin-request-detail__request-head { flex-direction: column; align-items: flex-start; } }
</style>
