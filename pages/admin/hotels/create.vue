<template>
  <section class="hotel-editor">
    <form class="hotel-editor__shell" @submit.prevent="submitHotel">
      <div class="hotel-editor__main">
        <section class="hotel-editor__card">
          <div class="hotel-editor__section-head">
            <div>
              <p class="hotel-editor__eyebrow">Отель</p>
              <h2 class="hotel-editor__title">Создать отель</h2>
              <p class="hotel-editor__text">
                Заполните карточку отеля, типы номеров, цены, контакты и блоки,
                которые используются на публичной странице отеля.
              </p>
            </div>
          </div>

          <div class="hotel-editor__grid">
            <UiInput label="Название*" placeholder="Business po kazakhsky" v-model.trim="form.name" />
            <UiSelect
              v-if="!isPartnerUser"
              label="Партнер*"
              placeholder="Выберите партнера"
              :options="partnerOptions"
              option-label="label"
              option-value="value"
              v-model="form.partner"
            />
            <UiInput label="Локация*" placeholder="Алматы, Байтурсынова и Абая" v-model.trim="form.location" />
            <UiInput label="Рейтинг" type="number" placeholder="4.5" v-model="form.rating" />
            <UiInput label="Цена от" type="number" placeholder="15000" v-model="form.price" />
            <UiInput label="Скидка %" type="number" placeholder="20" v-model="form.discount" />
            <UiInput label="Координата X / longitude" type="number" placeholder="76.889709" v-model="form.coordinates.x" />
            <UiInput label="Координата Y / latitude" type="number" placeholder="43.238949" v-model="form.coordinates.y" />
          </div>

          <label class="hotel-editor__check">
            <input type="checkbox" v-model="form.is_hot" />
            <span>Горячее предложение</span>
          </label>
        </section>

        <section class="hotel-editor__card">
          <h2 class="hotel-editor__section-title">Описание и галерея</h2>
          <div class="hotel-editor__stack">
            <UiTextarea label="Краткое описание*" :rows="4" v-model.trim="form.description" />
            <UiTextarea label="Подробное описание*" :rows="6" v-model.trim="form.content" />
            <TheAdminToursListEditor
              v-model="form.images"
              add-label="Добавить фото"
              placeholder="https://example.com/hotel.jpg"
              item-label-prefix="Фото"
              :default-item="''"
            />
          </div>
        </section>

        <section class="hotel-editor__card">
          <div class="hotel-editor__section-head">
            <div>
              <h2 class="hotel-editor__section-title">Виды номеров</h2>
              <p class="hotel-editor__text">
                Эти данные используются на странице отеля. Пользователь должен выбрать номер перед бронированием.
              </p>
            </div>
            <button type="button" class="hotel-editor__ghost" @click="addRoom">Добавить номер</button>
          </div>

          <div class="hotel-editor__rooms">
            <article v-for="(room, index) in form.room_types" :key="index" class="hotel-editor__room">
              <div class="hotel-editor__room-head">
                <strong>Номер {{ index + 1 }}</strong>
                <button type="button" @click="removeRoom(index)">Удалить</button>
              </div>

              <div class="hotel-editor__grid">
                <UiInput label="Название" placeholder="Стандарт" v-model.trim="room.name" />
                <UiInput label="Цена" type="number" placeholder="30000" v-model="room.price" />
              </div>
              <UiTextarea label="Описание номера" :rows="3" v-model.trim="room.description" />
              <TheAdminToursListEditor
                v-model="room.benefits"
                add-label="Добавить пункт"
                placeholder="Роскошная ванная комната"
                item-label-prefix="Пункт"
                :default-item="''"
              />
              <TheAdminToursListEditor
                v-model="room.images"
                add-label="Добавить фото номера"
                placeholder="https://example.com/room.jpg"
                item-label-prefix="Фото"
                :default-item="''"
              />
            </article>
          </div>
        </section>

        <section class="hotel-editor__card">
          <h2 class="hotel-editor__section-title">Информация для детальной страницы</h2>
          <div class="hotel-editor__grid hotel-editor__grid--lists">
            <TheAdminToursListEditor v-model="form.policy" add-label="Политика" placeholder="Время заезда и выезда" item-label-prefix="Пункт" :default-item="''" />
            <TheAdminToursListEditor v-model="form.meals" add-label="Питание" placeholder="Полный пансион" item-label-prefix="Пункт" :default-item="''" />
            <TheAdminToursListEditor v-model="form.amenities" add-label="Удобства" placeholder="Wi‑Fi" item-label-prefix="Пункт" :default-item="''" />
            <TheAdminToursListEditor v-model="form.paid_services" add-label="Платные услуги" placeholder="SPA" item-label-prefix="Пункт" :default-item="''" />
            <TheAdminToursListEditor v-model="form.family_features" add-label="Для семей" placeholder="Детская площадка" item-label-prefix="Пункт" :default-item="''" />
            <TheAdminToursListEditor v-model="form.accessibility" add-label="Доступность" placeholder="Удобства для людей с ограниченными возможностями" item-label-prefix="Пункт" :default-item="''" />
            <TheAdminToursListEditor v-model="form.entertainment" add-label="Развлечения" placeholder="Бассейн" item-label-prefix="Пункт" :default-item="''" />
          </div>
        </section>

        <section class="hotel-editor__card">
          <h2 class="hotel-editor__section-title">Контакты</h2>
          <div class="hotel-editor__grid">
            <UiInput label="Website" placeholder="https://hotel.kz" v-model.trim="form.contacts.website" />
            <UiInput label="Phone" placeholder="+7 777 777 77 77" v-model.trim="form.contacts.phone" />
            <UiInput label="Address" placeholder="г. Алматы, ул. Абая" v-model.trim="form.contacts.address" />
            <UiInput label="Instagram" placeholder="@hotel" v-model.trim="form.contacts.instagram" />
          </div>
        </section>

        <p v-if="message" class="hotel-editor__message">{{ message }}</p>
      </div>

      <aside class="hotel-editor__side">
        <section class="hotel-editor__card hotel-editor__card--sticky">
          <h2 class="hotel-editor__summary-title">{{ form.name || 'Новый отель' }}</h2>
          <p class="hotel-editor__summary-text">{{ form.location || 'Локация не указана' }}</p>
          <div class="hotel-editor__summary-row"><span>Цена от</span><strong>{{ priceLabel }}</strong></div>
          <div class="hotel-editor__summary-row"><span>Скидка</span><strong>{{ form.discount || 0 }}%</strong></div>
          <div class="hotel-editor__summary-row"><span>Номеров</span><strong>{{ form.room_types.length }}</strong></div>
          <button class="hotel-editor__submit" type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Сохраняем...' : 'Создать отель' }}
          </button>
        </section>
      </aside>
    </form>
  </section>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'admin' });
useSeo({ title: 'Создать отель', description: 'Создание отеля в админ-панели FlyAway.' });

const userStore = useAuthStore();
const api = useApi();
const router = useRouter();
const isSubmitting = ref(false);
const message = ref('');
const partners = ref([]);

const createEmptyRoom = () => ({
  name: '',
  price: '',
  description: '',
  benefits: [''],
  images: [''],
});

const form = reactive({
  name: '',
  partner: '',
  location: '',
  rating: '',
  price: '',
  discount: '',
  is_hot: false,
  description: '',
  content: '',
  images: [''],
  coordinates: { x: '', y: '', address: '', label: '' },
  contacts: { website: '', phone: '', address: '', instagram: '' },
  room_types: [createEmptyRoom()],
  policy: [''],
  meals: [''],
  amenities: [''],
  paid_services: [''],
  family_features: [''],
  accessibility: [''],
  entertainment: [''],
});

const isPartnerUser = computed(() => userStore.getUser?.role === 'partner');
const partnerOptions = computed(() => partners.value.map((partner) => ({ label: partner.title, value: partner._id })));
const priceLabel = computed(() => Number(form.price || 0) ? `${Number(form.price).toLocaleString('ru-RU')} ₸` : 'По запросу');

const cleanList = (list) => Array.isArray(list) ? list.map((item) => String(item || '').trim()).filter(Boolean) : [];
const cleanRooms = () => form.room_types.map((room) => ({
  name: String(room.name || '').trim(),
  price: Number(room.price) || 0,
  description: String(room.description || '').trim(),
  benefits: cleanList(room.benefits),
  images: cleanList(room.images),
})).filter((room) => room.name || room.price || room.description || room.images.length);

const addRoom = () => form.room_types.push(createEmptyRoom());
const removeRoom = (index) => {
  if (form.room_types.length === 1) return;
  form.room_types.splice(index, 1);
};

const loadPartners = async () => {
  if (isPartnerUser.value) {
    const response = await api.client({ url: '/partners/me' });
    const currentPartner = response.data;
    partners.value = currentPartner ? [currentPartner] : [];
    form.partner = currentPartner?._id || '';
    return;
  }
  const response = await api.client({ url: '/partners' });
  partners.value = Array.isArray(response.data) ? response.data : [];
};

const buildPayload = () => ({
  name: form.name.trim(),
  partner: form.partner,
  location: form.location.trim(),
  rating: Number(form.rating) || 0,
  price: Number(form.price) || 0,
  discount: Number(form.discount) || 0,
  is_hot: Boolean(form.is_hot),
  description: form.description.trim(),
  content: form.content.trim(),
  images: cleanList(form.images),
  coordinates: {
    x: form.coordinates.x === '' ? null : Number(form.coordinates.x),
    y: form.coordinates.y === '' ? null : Number(form.coordinates.y),
    address: form.coordinates.address || form.location,
    label: form.coordinates.label || form.name,
  },
  contacts: { ...form.contacts },
  room_types: cleanRooms(),
  policy: cleanList(form.policy),
  meals: cleanList(form.meals),
  amenities: cleanList(form.amenities),
  paid_services: cleanList(form.paid_services),
  family_features: cleanList(form.family_features),
  accessibility: cleanList(form.accessibility),
  entertainment: cleanList(form.entertainment),
});

const submitHotel = async () => {
  message.value = '';
  if (!form.partner) return (message.value = 'Выберите партнера');
  if (!form.name.trim() || !form.location.trim() || !form.description.trim() || !form.content.trim()) {
    return (message.value = 'Заполните название, локацию, описание и контент');
  }
  isSubmitting.value = true;
  try {
    const response = await api.client({ url: '/hotels/create', method: 'post', data: buildPayload() });
    message.value = 'Отель создан';
    const id = response?.data?._id;
    if (id) await router.push(`/admin/hotels/${id}`);
  } catch (error) {
    message.value = error?.message || 'Не удалось создать отель';
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(loadPartners);
</script>

<style lang="scss" scoped>
.hotel-editor {
  &__shell { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 24px; align-items: start; }
  &__main { display: grid; gap: 20px; }
  &__card { display: grid; gap: 18px; padding: 24px; background: $white; border-radius: 18px; box-shadow: 0 14px 34px rgba(32,36,38,.06); }
  &__card--sticky { position: sticky; top: 96px; }
  &__section-head { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
  &__eyebrow { color: $red-500; font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
  &__title { margin-top: 4px; color: $surface-900; font-size: 28px; font-weight: 800; }
  &__section-title { color: $surface-900; font-size: 22px; font-weight: 800; }
  &__text { margin-top: 6px; color: $surface-500; line-height: 1.45; }
  &__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
  &__grid--lists { grid-template-columns: 1fr; }
  &__stack, &__rooms { display: grid; gap: 14px; }
  &__room { display: grid; gap: 14px; padding: 16px; border-radius: 16px; border: 1px solid rgba($red-500,.12); background: rgba($red-500,.03); }
  &__room-head { display: flex; justify-content: space-between; gap: 12px; color: $surface-900; }
  &__room-head button, &__ghost { color: $red-500; font-weight: 700; }
  &__check { display: flex; gap: 10px; align-items: center; color: $surface-900; font-weight: 600; }
  &__summary-title { color: $surface-900; font-size: 22px; font-weight: 800; }
  &__summary-text { color: $surface-500; line-height: 1.45; }
  &__summary-row { display: flex; justify-content: space-between; gap: 12px; padding: 12px 0; border-bottom: 1px solid rgba($surface-300,.2); color: $surface-500; }
  &__summary-row strong { color: $surface-900; }
  &__submit { min-height: 50px; border-radius: 14px; background: $red-500; color: $white; font-weight: 800; }
  &__submit:disabled { opacity: .65; cursor: not-allowed; }
  &__message { color: $red-500; font-weight: 700; }
}
@media (max-width: 1100px) { .hotel-editor { &__shell { grid-template-columns: 1fr; } &__card--sticky { position: static; } } }
@media (max-width: 700px) { .hotel-editor { &__grid { grid-template-columns: 1fr; } &__card { padding: 18px; } } }
</style>
