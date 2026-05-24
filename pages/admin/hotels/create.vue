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
                Форма теперь работает как создание тура: адрес выбирается через карту, а изображения загружаются файлами.
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
          </div>

          <div class="hotel-editor__map">
            <div class="hotel-editor__section-head">
              <div>
                <h2 class="hotel-editor__section-title">Адрес на карте</h2>
                <p class="hotel-editor__text">Поставьте метку на Яндекс-карте. Координаты сохранятся в карточке отеля.</p>
              </div>
              <button class="hotel-editor__ghost" type="button" @click="clearLocation">Сбросить</button>
            </div>
            <UiMap
              v-model="form.coordinates"
              :selectable="true"
              :center="[76.889709, 43.238949]"
              marker-text="Отель"
            />
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

            <div class="hotel-editor__gallery">
              <div class="hotel-editor__cover">
                <img v-if="coverPreview" class="hotel-editor__cover-img" :src="coverPreview" :alt="form.name || 'Отель'" />
                <div v-else class="hotel-editor__cover-empty">Обложка отеля</div>
              </div>
              <div class="hotel-editor__upload-list">
                <UiFileUpload
                  v-model="coverFiles"
                  title="Загрузить главное изображение"
                  accept="image/png,image/jpeg,image/webp"
                />
                <UiFileUpload
                  v-model="galleryFiles"
                  title="Загрузить галерею отеля"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                />
              </div>
            </div>
          </div>
        </section>

        <section class="hotel-editor__card">
          <div class="hotel-editor__section-head">
            <div>
              <h2 class="hotel-editor__section-title">Виды номеров</h2>
              <p class="hotel-editor__text">Пользователь должен выбрать номер перед бронированием.</p>
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
              <UiFileUpload
                v-model="roomFiles[index]"
                title="Загрузить фото номера"
                accept="image/png,image/jpeg,image/webp"
                multiple
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
          <div class="hotel-editor__summary-row"><span>Фото</span><strong>{{ selectedFileCount }}</strong></div>
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
const { uploadFiles } = useBlobFiles();
const isSubmitting = ref(false);
const message = ref('');
const partners = ref([]);
const coverFiles = ref([]);
const galleryFiles = ref([]);
const roomFiles = ref([[]]);
const localCoverPreview = ref('');

const createEmptyRoom = () => ({ name: '', price: '', description: '', benefits: [''], images: [] });

const form = reactive({
  name: '', partner: '', location: '', rating: '', price: '', discount: '', is_hot: false,
  description: '', content: '', images: [],
  coordinates: null,
  contacts: { website: '', phone: '', address: '', instagram: '' },
  room_types: [createEmptyRoom()],
  policy: [''], meals: [''], amenities: [''], paid_services: [''], family_features: [''], accessibility: [''], entertainment: [''],
});

const isPartnerUser = computed(() => userStore.getUser?.role === 'partner');
const partnerOptions = computed(() => partners.value.map((partner) => ({ label: partner.title, value: partner._id })));
const priceLabel = computed(() => Number(form.price || 0) ? `${Number(form.price).toLocaleString('ru-RU')} ₸` : 'По запросу');
const selectedFileCount = computed(() => coverFiles.value.length + galleryFiles.value.length + roomFiles.value.flat().length);
const coverPreview = computed(() => localCoverPreview.value || form.images[0] || '');

const cleanList = (list) => Array.isArray(list) ? list.map((item) => String(item || '').trim()).filter(Boolean) : [];

const buildLocalPreview = (file) => {
  if (typeof File === 'undefined' || !(file instanceof File) || !file.type?.startsWith('image/')) return '';
  return URL.createObjectURL(file);
};
const revokeLocalPreview = () => {
  if (!localCoverPreview.value) return;
  URL.revokeObjectURL(localCoverPreview.value);
  localCoverPreview.value = '';
};

watch(coverFiles, (files) => {
  revokeLocalPreview();
  localCoverPreview.value = buildLocalPreview(files?.[0]);
}, { deep: true });

const addRoom = () => {
  form.room_types.push(createEmptyRoom());
  roomFiles.value.push([]);
};
const removeRoom = (index) => {
  if (form.room_types.length === 1) return;
  form.room_types.splice(index, 1);
  roomFiles.value.splice(index, 1);
};
const clearLocation = () => {
  form.coordinates = null;
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

const uploadHotelFiles = async () => {
  const entityId = form.partner || 'draft';
  const coverUploads = coverFiles.value.length ? await uploadFiles({ files: coverFiles.value, bucket: 'hotels', entityId, scope: 'cover' }) : [];
  const galleryUploads = galleryFiles.value.length ? await uploadFiles({ files: galleryFiles.value, bucket: 'hotels', entityId, scope: 'gallery' }) : [];
  const roomsUploads = [];

  for (const files of roomFiles.value) {
    const uploaded = files?.length ? await uploadFiles({ files, bucket: 'hotels', entityId, scope: 'room' }) : [];
    roomsUploads.push(uploaded.map((item) => item.url).filter(Boolean));
  }

  const hotelImages = [...coverUploads, ...galleryUploads].map((item) => item.url).filter(Boolean);
  return { hotelImages, roomsUploads };
};

const buildCoordinates = () => {
  const coords = form.coordinates;
  if (!coords || typeof coords !== 'object') return null;
  return {
    x: coords.x ?? coords[0] ?? null,
    y: coords.y ?? coords[1] ?? null,
    address: coords.address || form.location,
    label: coords.label || form.name,
  };
};

const buildPayload = (uploaded) => ({
  name: form.name.trim(), partner: form.partner, location: form.location.trim(),
  rating: Number(form.rating) || 0, price: Number(form.price) || 0, discount: Number(form.discount) || 0, is_hot: Boolean(form.is_hot),
  description: form.description.trim(), content: form.content.trim(), images: uploaded.hotelImages,
  coordinates: buildCoordinates(),
  contacts: { ...form.contacts },
  room_types: form.room_types.map((room, index) => ({
    name: String(room.name || '').trim(), price: Number(room.price) || 0, description: String(room.description || '').trim(),
    benefits: cleanList(room.benefits), images: uploaded.roomsUploads[index] || [],
  })).filter((room) => room.name || room.price || room.description || room.images.length),
  policy: cleanList(form.policy), meals: cleanList(form.meals), amenities: cleanList(form.amenities), paid_services: cleanList(form.paid_services), family_features: cleanList(form.family_features), accessibility: cleanList(form.accessibility), entertainment: cleanList(form.entertainment),
});

const submitHotel = async () => {
  message.value = '';
  if (!form.partner) return (message.value = 'Выберите партнера');
  if (!form.name.trim() || !form.location.trim() || !form.description.trim() || !form.content.trim()) return (message.value = 'Заполните название, локацию, описание и контент');
  if (!form.coordinates) return (message.value = 'Поставьте метку адреса на карте');

  isSubmitting.value = true;
  try {
    const uploaded = await uploadHotelFiles();
    const response = await api.client({ url: '/hotels/create', method: 'post', data: buildPayload(uploaded) });
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
onBeforeUnmount(revokeLocalPreview);
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
  &__stack, &__rooms, &__upload-list, &__map { display: grid; gap: 14px; }
  &__gallery { display: grid; grid-template-columns: minmax(260px, .8fr) minmax(0, 1fr); gap: 18px; }
  &__cover { min-height: 260px; border-radius: 20px; overflow: hidden; background: $surface-150; border: 1px solid rgba($red-500,.08); }
  &__cover-img { width: 100%; height: 100%; object-fit: cover; }
  &__cover-empty { min-height: inherit; display: flex; align-items: center; justify-content: center; color: $surface-400; font-weight: 700; }
  &__room { display: grid; gap: 14px; padding: 16px; border-radius: 16px; border: 1px solid rgba($red-500,.12); background: rgba($red-500,.03); }
  &__room-head { display: flex; justify-content: space-between; gap: 12px; color: $surface-900; }
  &__room-head button, &__ghost { color: $red-500; font-weight: 700; }
  &__ghost { padding: 10px 14px; border-radius: 999px; background: rgba($red-500,.06); }
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
@media (max-width: 700px) { .hotel-editor { &__grid, &__gallery { grid-template-columns: 1fr; } &__card { padding: 18px; } } }
</style>
