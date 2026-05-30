<template>
  <section class="admin-bookings">
    <div class="admin-bookings__head">
      <div>
        <h2 class="admin-bookings__title-page">Бронирования туров</h2>
        <p class="admin-bookings__page-text">
          Список сгруппирован по турам. Внутри карточки тура открывается подробная информация о пользователях, билетах и оплате.
        </p>
      </div>
      <button class="admin-bookings__reload" type="button" @click="loadBookings">Обновить</button>
    </div>

    <div class="admin-bookings__stats">
      <article v-for="item in statItems" :key="item.label" class="admin-bookings__stat">
        <p class="admin-bookings__stat-value">{{ item.value }}</p>
        <p class="admin-bookings__stat-label">{{ item.label }}</p>
      </article>
    </div>

    <div class="admin-bookings__toolbar">
      <div class="admin-bookings__filters">
        <UiSelect label="Статус" v-model="selectedStatus" :options="statusOptions" option-label="label" option-value="value" />
      </div>
    </div>

    <p v-if="errorMessage" class="admin-bookings__error">{{ errorMessage }}</p>

    <div v-if="isLoading" class="admin-bookings__state">Загружаем туры...</div>
    <div v-else-if="!groups.length" class="admin-bookings__state">Бронирований пока нет.</div>

    <div v-else class="admin-bookings__list">
      <NuxtLink
        v-for="group in groups"
        :key="group._id"
        class="admin-bookings__card"
        :to="`/admin/tour-booking/${group._id}`"
      >
        <div class="admin-bookings__card-head">
          <div class="admin-bookings__tour-box">
            <img class="admin-bookings__image" :src="getTourImage(group.tour)" :alt="group?.tour?.title || 'Тур'" />
            <div>
              <h3 class="admin-bookings__title">{{ group?.tour?.title || 'Тур' }}</h3>
              <p class="admin-bookings__meta">
                {{ group?.tour?.partner?.title || 'Партнер не указан' }}
                <span v-if="group?.tour?.departureCity"> • {{ group.tour.departureCity }}</span>
              </p>
            </div>
          </div>
          <span class="admin-bookings__more">Открыть</span>
        </div>

        <div class="admin-bookings__grid">
          <div class="admin-bookings__field">
            <span class="admin-bookings__label">Броней</span>
            <span class="admin-bookings__value">{{ group.bookingCount || 0 }}</span>
          </div>
          <div class="admin-bookings__field">
            <span class="admin-bookings__label">Активные</span>
            <span class="admin-bookings__value">{{ group.activeCount || 0 }}</span>
          </div>
          <div class="admin-bookings__field">
            <span class="admin-bookings__label">Завершенные</span>
            <span class="admin-bookings__value">{{ group.completedCount || 0 }}</span>
          </div>
          <div class="admin-bookings__field">
            <span class="admin-bookings__label">Отмененные</span>
            <span class="admin-bookings__value">{{ group.cancelledCount || 0 }}</span>
          </div>
          <div class="admin-bookings__field">
            <span class="admin-bookings__label">Гостей</span>
            <span class="admin-bookings__value">{{ group.guestsCount || 0 }}</span>
          </div>
          <div class="admin-bookings__field">
            <span class="admin-bookings__label">Сумма</span>
            <span class="admin-bookings__value admin-bookings__value--accent">{{ formatMoney(group.totalAmount) }} ₸</span>
          </div>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup>
import tourPlaceholder from '@/assets/image/content/main-image.png';

definePageMeta({ layout: 'admin', middleware: 'admin' });
useSeo({ title: 'Бронирования туров', description: 'Группировка бронирований туров FlyAway.' });

const api = useApi();
const groups = ref([]);
const isLoading = ref(false);
const errorMessage = ref('');
const selectedStatus = ref('');

const statusOptions = [
  { label: 'Все', value: '' },
  { label: 'Активные', value: 'active' },
  { label: 'Завершенные', value: 'completed' },
  { label: 'Отмененные', value: 'cancelled' },
];

const formatMoney = (value) => Number(value || 0).toLocaleString('ru-RU');
const getTourImage = (tour) => tour?.avatar || (Array.isArray(tour?.images) ? tour.images.find(Boolean) : '') || tourPlaceholder;

const statItems = computed(() => {
  const totalGroups = groups.value.length;
  const totalBookings = groups.value.reduce((sum, item) => sum + (Number(item.bookingCount) || 0), 0);
  const totalGuests = groups.value.reduce((sum, item) => sum + (Number(item.guestsCount) || 0), 0);
  const revenue = groups.value.reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0);
  return [
    { label: 'Туров с бронями', value: totalGroups },
    { label: 'Всего броней', value: totalBookings },
    { label: 'Гостей', value: totalGuests },
    { label: 'Сумма броней', value: `${formatMoney(revenue)} ₸` },
  ];
});

const loadBookings = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const response = await api.client({
      url: '/tour-bookings/manage',
      method: 'get',
      query: { grouped: true, status: selectedStatus.value || undefined },
    });
    groups.value = Array.isArray(response?.data) ? response.data : [];
  } catch (error) {
    errorMessage.value = error?.message || 'Не удалось загрузить бронирования.';
  } finally {
    isLoading.value = false;
  }
};

watch(selectedStatus, loadBookings);
onMounted(loadBookings);
</script>

<style lang="scss" scoped>
.admin-bookings {
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
  &__tour-box { display: flex; gap: 14px; align-items: center; min-width: 0; }
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

@media (max-width: 1100px) { .admin-bookings { &__stats, &__grid { grid-template-columns: repeat(2, 1fr); } } }
@media (max-width: 640px) { .admin-bookings { &__head, &__card-head, &__tour-box { flex-direction: column; align-items: flex-start; } &__stats, &__grid { grid-template-columns: 1fr; } } }
</style>
