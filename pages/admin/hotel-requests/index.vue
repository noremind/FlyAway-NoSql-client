<template>
  <section class="admin-hotel-requests">
    <div class="admin-hotel-requests__head">
      <div>
        <h2 class="admin-hotel-requests__title-page">Заявки на отели</h2>
        <p class="admin-hotel-requests__page-text">
          Список сгруппирован по отелям. Внутри карточки отеля открывается подробная информация о клиентах и заявках.
        </p>
      </div>
      <button class="admin-hotel-requests__reload" type="button" @click="loadRequests">Обновить</button>
    </div>

    <div class="admin-hotel-requests__stats">
      <article v-for="item in statItems" :key="item.label" class="admin-hotel-requests__stat">
        <p class="admin-hotel-requests__stat-value">{{ item.value }}</p>
        <p class="admin-hotel-requests__stat-label">{{ item.label }}</p>
      </article>
    </div>

    <div class="admin-hotel-requests__toolbar">
      <div class="admin-hotel-requests__filters">
        <UiSelect label="Статус" v-model="selectedStatus" :options="statusOptions" option-label="label" option-value="value" />
      </div>
    </div>

    <p v-if="errorMessage" class="admin-hotel-requests__error">{{ errorMessage }}</p>

    <div v-if="isLoading" class="admin-hotel-requests__state">Загружаем отели...</div>
    <div v-else-if="!groups.length" class="admin-hotel-requests__state">Заявок пока нет.</div>

    <div v-else class="admin-hotel-requests__list">
      <NuxtLink
        v-for="group in groups"
        :key="group._id"
        class="admin-hotel-requests__card"
        :to="`/admin/hotel-requests/${group._id}`"
      >
        <div class="admin-hotel-requests__card-head">
          <div class="admin-hotel-requests__hotel-box">
            <img class="admin-hotel-requests__image" :src="getHotelImage(group.hotel)" :alt="group?.hotel?.name || 'Отель'" />
            <div>
              <h3 class="admin-hotel-requests__title">{{ group?.hotel?.name || 'Отель' }}</h3>
              <p class="admin-hotel-requests__meta">
                {{ group?.partner?.title || group?.hotel?.partner?.title || 'Партнер не указан' }}
                <span v-if="group?.hotel?.location"> • {{ group.hotel.location }}</span>
              </p>
            </div>
          </div>
          <span class="admin-hotel-requests__more">Открыть</span>
        </div>

        <div class="admin-hotel-requests__grid">
          <div class="admin-hotel-requests__field">
            <span class="admin-hotel-requests__label">Заявок</span>
            <span class="admin-hotel-requests__value">{{ group.requestCount || 0 }}</span>
          </div>
          <div class="admin-hotel-requests__field">
            <span class="admin-hotel-requests__label">Новые</span>
            <span class="admin-hotel-requests__value">{{ group.newCount || 0 }}</span>
          </div>
          <div class="admin-hotel-requests__field">
            <span class="admin-hotel-requests__label">В работе</span>
            <span class="admin-hotel-requests__value">{{ group.inProgressCount || 0 }}</span>
          </div>
          <div class="admin-hotel-requests__field">
            <span class="admin-hotel-requests__label">Связались</span>
            <span class="admin-hotel-requests__value">{{ group.contactedCount || 0 }}</span>
          </div>
          <div class="admin-hotel-requests__field">
            <span class="admin-hotel-requests__label">Закрытые</span>
            <span class="admin-hotel-requests__value">{{ group.closedCount || 0 }}</span>
          </div>
          <div class="admin-hotel-requests__field">
            <span class="admin-hotel-requests__label">Гостей</span>
            <span class="admin-hotel-requests__value admin-hotel-requests__value--accent">{{ group.guestsCount || 0 }}</span>
          </div>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup>
import hotelPlaceholder from '@/assets/image/content/main-image.png';

definePageMeta({ layout: 'admin', middleware: 'admin' });
useSeo({ title: 'Заявки на отели', description: 'Группировка заявок на отели FlyAway.' });

const api = useApi();
const groups = ref([]);
const isLoading = ref(false);
const errorMessage = ref('');
const selectedStatus = ref('');

const statusOptions = [
  { label: 'Все', value: '' },
  { label: 'Новые', value: 'new' },
  { label: 'В работе', value: 'in_progress' },
  { label: 'Связались', value: 'contacted' },
  { label: 'Закрыто', value: 'closed' },
  { label: 'Отменено', value: 'cancelled' },
];

const getHotelImage = (hotel) => (Array.isArray(hotel?.images) ? hotel.images.find(Boolean) : '') || hotelPlaceholder;

const statItems = computed(() => {
  const totalGroups = groups.value.length;
  const totalRequests = groups.value.reduce((sum, item) => sum + (Number(item.requestCount) || 0), 0);
  const newCount = groups.value.reduce((sum, item) => sum + (Number(item.newCount) || 0), 0);
  const guests = groups.value.reduce((sum, item) => sum + (Number(item.guestsCount) || 0), 0);
  return [
    { label: 'Отелей с заявками', value: totalGroups },
    { label: 'Всего заявок', value: totalRequests },
    { label: 'Новые', value: newCount },
    { label: 'Гостей', value: guests },
  ];
});

const loadRequests = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const response = await api.client({
      url: '/hotel-requests/manage',
      method: 'get',
      query: { grouped: true, status: selectedStatus.value || undefined },
    });
    groups.value = Array.isArray(response?.data) ? response.data : [];
  } catch (error) {
    errorMessage.value = error?.message || 'Не удалось загрузить заявки.';
  } finally {
    isLoading.value = false;
  }
};

watch(selectedStatus, loadRequests);
onMounted(loadRequests);
</script>

<style lang="scss" scoped>
.admin-hotel-requests {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__head { display: flex; justify-content: space-between; gap: 16px; align-items: flex-end; }
  &__title-page { color: $surface-900; font-size: 28px; font-weight: 800; line-height: 1.05; }
  &__page-text { margin-top: 6px; max-width: 760px; color: $surface-500; font-size: 14px; line-height: 1.45; }
  &__reload { min-height: 44px; padding: 0 16px; border-radius: 12px; color: $red-500; background: rgba($red-500, .06); border: 1px solid rgba($red-500, .14); font-weight: 700; }
  &__stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
  &__stat { padding: 18px; border-radius: 18px; background: rgba(255,255,255,.92); border: 1px solid rgba($red-500,.08); box-shadow: 0 10px 26px rgba(32,36,38,.04); }
  &__stat-value { color: $red-500; font-size: 28px; font-weight: 800; line-height: 1; }
  &__stat-label { margin-top: 10px; color: $surface-500; font-size: 13px; line-height: 1.4; }
  &__toolbar { display: flex; justify-content: space-between; gap: 16px; align-items: flex-end; }
  &__filters { max-width: 260px; width: 100%; }
  &__list { display: grid; gap: 14px; }
  &__card { display: flex; flex-direction: column; gap: 16px; padding: 18px; border-radius: 20px; background: rgba(255,255,255,.92); border: 1px solid rgba($red-500,.08); box-shadow: 0 10px 26px rgba(32,36,38,.04); transition: .2s ease; &:hover { transform: translateY(-2px); border-color: rgba($red-500,.24); } }
  &__card-head { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
  &__hotel-box { display: flex; gap: 14px; align-items: center; min-width: 0; }
  &__image { width: 84px; height: 64px; border-radius: 14px; object-fit: cover; flex: 0 0 84px; }
  &__title { color: $surface-900; font-size: 20px; font-weight: 800; }
  &__meta { margin-top: 4px; color: $surface-500; font-size: 13px; line-height: 1.4; }
  &__more { color: $red-500; font-weight: 800; white-space: nowrap; }
  &__grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; }
  &__field { padding: 14px; border-radius: 14px; background: rgba($surface-100,.72); }
  &__label { display: block; color: $surface-500; font-size: 12px; margin-bottom: 6px; }
  &__value { color: $surface-900; font-size: 15px; font-weight: 750; &--accent { color: $red-500; } }
  &__state, &__error { padding: 22px; border-radius: 18px; background: $white; color: $surface-500; text-align: center; }
  &__error { color: $orange-200; }
}

@media (max-width: 1100px) { .admin-hotel-requests { &__stats, &__grid { grid-template-columns: repeat(2, 1fr); } } }
@media (max-width: 640px) { .admin-hotel-requests { &__head, &__card-head, &__hotel-box { flex-direction: column; align-items: flex-start; } &__stats, &__grid { grid-template-columns: 1fr; } } }
</style>
