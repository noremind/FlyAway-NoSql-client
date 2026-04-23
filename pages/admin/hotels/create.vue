<template>
  <section class="hotel-editor">
    <div v-if="isBooting" class="hotel-editor__loading">
      Загружаем форму отеля...
    </div>

    <form v-else class="hotel-editor__shell" @submit.prevent="submitHotel">
      <div class="hotel-editor__main">
        <section class="hotel-editor__card hotel-editor__card--hero">
          <div class="hotel-editor__section-head">
            <div>
              <p class="hotel-editor__eyebrow">Карточка отеля</p>
              <h2 class="hotel-editor__hero-title">Основная информация</h2>
              <p class="hotel-editor__section-text">
                Эти поля соответствуют модели Hotel и используются в каталоге,
                детальной странице и управлении отелями.
              </p>
            </div>
          </div>

          <div class="hotel-editor__grid">
            <UiInput
              label="Название отеля*"
              placeholder="The Ritz-Carlton Almaty"
              v-model.trim="form.name"
            />

            <UiSelect
              v-if="!isPartnerUser"
              label="Партнер*"
              placeholder="Выберите партнера"
              :options="partnerOptions"
              option-label="label"
              option-value="value"
              v-model="selectedPartnerId"
            />

            <UiInput
              label="Локация*"
              placeholder="Алматы, проспект Аль-Фараби"
              v-model.trim="form.location"
            />

            <UiInput
              label="Рейтинг"
              type="number"
              placeholder="4.8"
              v-model="form.rating"
            />
          </div>
        </section>

        <section class="hotel-editor__card">
          <div class="hotel-editor__section-head">
            <div>
              <p class="hotel-editor__eyebrow">Описание</p>
              <h2 class="hotel-editor__section-title">Тексты для сайта</h2>
              <p class="hotel-editor__section-text">
                Короткое описание показывается в списках, контент раскрывает
                отель на детальной странице.
              </p>
            </div>
          </div>

          <div class="hotel-editor__stack">
            <UiTextarea
              label="Описание*"
              placeholder="Коротко опишите отель, расположение и настроение проживания"
              :rows="5"
              v-model.trim="form.description"
            />

            <UiTextarea
              label="Контент*"
              placeholder="Подробная информация: номера, сервис, питание, инфраструктура, правила заселения"
              :rows="9"
              v-model.trim="form.content"
            />
          </div>
        </section>

        <section class="hotel-editor__card">
          <div class="hotel-editor__section-head">
            <div>
              <p class="hotel-editor__eyebrow">Галерея</p>
              <h2 class="hotel-editor__section-title">Фотографии отеля</h2>
              <p class="hotel-editor__section-text">
                Можно загрузить файлы или добавить готовые ссылки на изображения.
              </p>
            </div>
          </div>

          <div class="hotel-editor__gallery">
            <div class="hotel-editor__preview">
              <img
                v-if="previewImage"
                class="hotel-editor__preview-image"
                :src="previewImage"
                :alt="form.name || 'Отель'"
              />
              <div v-else class="hotel-editor__preview-empty">
                Превью отеля
              </div>
            </div>

            <div class="hotel-editor__stack">
              <UiFileUpload
                v-model="galleryFiles"
                title="Загрузить фото отеля"
                accept="image/png,image/jpeg,image/webp"
                multiple
              />

              <TheAdminToursListEditor
                v-model="form.images"
                add-label="Добавить ссылку на фото"
                placeholder="https://example.com/hotel.jpg"
                item-label-prefix="Фото"
                :default-item="''"
              />
            </div>
          </div>
        </section>

        <p v-if="message" class="hotel-editor__message">{{ message }}</p>
      </div>

      <aside class="hotel-editor__side">
        <section class="hotel-editor__card hotel-editor__card--sticky">
          <div class="hotel-editor__summary">
            <div class="hotel-editor__summary-head">
              <div>
                <p class="hotel-editor__summary-partner">
                  {{ selectedPartnerData?.title || "Партнер не выбран" }}
                </p>
                <h2 class="hotel-editor__summary-title">
                  {{ form.name || "Новый отель" }}
                </h2>
              </div>

              <span class="hotel-editor__rating">
                {{ normalizedRatingLabel }}
              </span>
            </div>

            <div class="hotel-editor__summary-preview">
              <img
                v-if="previewImage"
                class="hotel-editor__summary-image"
                :src="previewImage"
                :alt="form.name || 'Отель'"
              />
              <div v-else class="hotel-editor__summary-empty">Фото</div>
            </div>

            <div class="hotel-editor__summary-stats">
              <div class="hotel-editor__summary-stat">
                <span>Фото</span>
                <strong>{{ totalImageCount }}</strong>
              </div>
              <div class="hotel-editor__summary-stat">
                <span>Рейтинг</span>
                <strong>{{ normalizedRatingLabel }}</strong>
              </div>
            </div>

            <div class="hotel-editor__location">
              <span>Локация</span>
              <strong>{{ form.location || "Не указана" }}</strong>
            </div>
          </div>

          <div class="hotel-editor__checklist">
            <div
              v-for="item in checklist"
              :key="item.title"
              class="hotel-editor__checklist-item"
              :class="{ 'hotel-editor__checklist-item--done': item.done }"
            >
              <span class="hotel-editor__checklist-dot"></span>
              <div>
                <strong>{{ item.title }}</strong>
                <span>{{ item.text }}</span>
              </div>
            </div>
          </div>

          <button
            class="hotel-editor__submit"
            type="submit"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? "Сохраняем..." : "Создать отель" }}
          </button>
        </section>
      </aside>
    </form>
  </section>
</template>

<script setup>
definePageMeta({
  layout: "admin",
  middleware: "admin",
});

useSeo({
  title: "Создать отель",
  description: "Создание отеля в админ-панели FlyAway.",
});

const userStore = useAuthStore();
const api = useApi();
const { uploadFiles } = useBlobFiles();

const isBooting = ref(true);
const isSubmitting = ref(false);
const message = ref("");
const partners = ref([]);
const selectedPartnerId = ref("");
const galleryFiles = ref([]);
const localPreview = ref("");

const form = reactive({
  name: "",
  location: "",
  rating: "",
  description: "",
  content: "",
  images: [""],
});

const isPartnerUser = computed(() => userStore.getUser?.role === "partner");

const partnerOptions = computed(() =>
  partners.value.map((partner) => ({
    label: partner.title,
    value: partner._id,
  })),
);

const selectedPartnerData = computed(() => {
  return (
    partners.value.find((partner) => partner._id === selectedPartnerId.value) ||
    null
  );
});

const normalizeImageList = (value) => {
  const list = Array.isArray(value) ? value : [];
  return Array.from(
    new Set(list.map((item) => String(item || "").trim()).filter(Boolean)),
  );
};

const normalizedImages = computed(() => normalizeImageList(form.images));

const normalizedRating = computed(() => {
  const rating = Number(form.rating);

  if (Number.isNaN(rating)) {
    return 0;
  }

  return Math.min(5, Math.max(0, rating));
});

const normalizedRatingLabel = computed(() =>
  normalizedRating.value.toFixed(1).replace(".", ","),
);

const totalImageCount = computed(() => {
  return normalizedImages.value.length + galleryFiles.value.length;
});

const previewImage = computed(() => {
  return localPreview.value || normalizedImages.value[0] || "";
});

const checklist = computed(() => [
  {
    title: "Партнер",
    text: selectedPartnerId.value ? "Отель привязан" : "Выберите партнера",
    done: Boolean(selectedPartnerId.value),
  },
  {
    title: "Основные поля",
    text:
      form.name.trim() && form.location.trim()
        ? "Название и локация заполнены"
        : "Заполните название и локацию",
    done: Boolean(form.name.trim() && form.location.trim()),
  },
  {
    title: "Тексты",
    text:
      form.description.trim() && form.content.trim()
        ? "Описание и контент готовы"
        : "Добавьте описание и контент",
    done: Boolean(form.description.trim() && form.content.trim()),
  },
  {
    title: "Галерея",
    text: totalImageCount.value ? "Фото добавлены" : "Добавьте фото отеля",
    done: Boolean(totalImageCount.value),
  },
]);

const buildLocalPreview = (file) => {
  if (typeof File === "undefined" || !(file instanceof File)) {
    return "";
  }

  if (!file.type?.startsWith("image/")) {
    return "";
  }

  return URL.createObjectURL(file);
};

const revokeLocalPreview = () => {
  if (!localPreview.value) {
    return;
  }

  URL.revokeObjectURL(localPreview.value);
  localPreview.value = "";
};

watch(
  galleryFiles,
  (files) => {
    revokeLocalPreview();
    localPreview.value = buildLocalPreview(files?.[0]);
  },
  { deep: true },
);

const loadPartners = async () => {
  if (isPartnerUser.value) {
    const response = await api.client({ url: "/partners/me" });
    const currentPartner = response.data;

    partners.value = currentPartner ? [currentPartner] : [];
    selectedPartnerId.value = currentPartner?._id || "";
    return;
  }

  const response = await api.client({ url: "/partners" });
  partners.value = Array.isArray(response.data) ? response.data : [];
};

const uploadPendingImages = async () => {
  if (!galleryFiles.value.length) {
    return [];
  }

  const uploaded = await uploadFiles({
    files: galleryFiles.value,
    bucket: "hotels",
    entityId: selectedPartnerId.value || "draft",
    scope: "gallery",
  });

  return uploaded.map((item) => item.url).filter(Boolean);
};

const buildPayload = (uploadedImages = []) => ({
  name: form.name.trim(),
  partner: selectedPartnerId.value,
  location: form.location.trim(),
  rating: normalizedRating.value,
  description: form.description.trim(),
  content: form.content.trim(),
  images: normalizeImageList([...form.images, ...uploadedImages]),
});

const resetForm = () => {
  form.name = "";
  form.location = "";
  form.rating = "";
  form.description = "";
  form.content = "";
  form.images = [""];
  galleryFiles.value = [];
  revokeLocalPreview();

  if (!isPartnerUser.value) {
    selectedPartnerId.value = "";
  }
};

const submitHotel = async () => {
  message.value = "";

  if (!selectedPartnerId.value) {
    message.value = "Выберите партнера для отеля";
    return;
  }

  if (!form.name.trim() || !form.location.trim()) {
    message.value = "Название и локация обязательны";
    return;
  }

  if (!form.description.trim() || !form.content.trim()) {
    message.value = "Описание и контент обязательны";
    return;
  }

  isSubmitting.value = true;

  try {
    const uploadedImages = await uploadPendingImages();
    const response = await api.client({
      url: "/hotels/create",
      method: "post",
      data: buildPayload(uploadedImages),
    });

    message.value = response?.data?._id
      ? "Отель создан"
      : "Отель создан";
    resetForm();
  } catch (error) {
    message.value = error?.message || "Не удалось создать отель";
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(async () => {
  try {
    await loadPartners();
  } catch (error) {
    message.value = error?.message || "Не удалось загрузить партнеров";
  } finally {
    isBooting.value = false;
  }
});

onBeforeUnmount(() => {
  revokeLocalPreview();
});
</script>

<style lang="scss" scoped>
.hotel-editor {
  &__loading {
    min-height: 260px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $surface-500;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba($red-500, 0.1);
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
  }

  &__shell {
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.72fr);
    gap: 24px;
    align-items: start;
  }

  &__main,
  &__side,
  &__stack {
    display: grid;
    gap: 20px;
  }

  &__card {
    display: grid;
    gap: 20px;
    padding: 26px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba($red-500, 0.1);
    border-radius: 8px;
    box-shadow: 0 18px 44px rgba(32, 36, 38, 0.06);

    &--hero {
      gap: 18px;
    }

    &--sticky {
      position: sticky;
      top: 100px;
    }
  }

  &__section-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  &__eyebrow {
    color: $red-500;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  &__hero-title {
    margin-top: 6px;
    color: $surface-900;
    font-size: 24px;
    font-weight: 800;
    line-height: 1.08;
  }

  &__section-title {
    color: $surface-900;
    font-size: 20px;
    font-weight: 800;
  }

  &__section-text {
    margin-top: 6px;
    color: $surface-500;
    font-size: 13px;
    line-height: 1.45;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  &__gallery {
    display: grid;
    grid-template-columns: minmax(280px, 0.82fr) minmax(0, 1fr);
    gap: 20px;
    align-items: start;
  }

  &__preview,
  &__summary-preview {
    min-height: 260px;
    overflow: hidden;
    background: $surface-150;
    border: 1px solid rgba($red-500, 0.08);
    border-radius: 8px;
  }

  &__preview-image,
  &__summary-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__preview-empty,
  &__summary-empty {
    min-height: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $surface-400;
    font-size: 14px;
    font-weight: 600;
  }

  &__summary {
    display: grid;
    gap: 16px;
  }

  &__summary-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  &__summary-partner {
    color: $surface-500;
    font-size: 13px;
    font-weight: 600;
  }

  &__summary-title {
    margin-top: 4px;
    color: $surface-900;
    font-size: 20px;
    font-weight: 700;
    line-height: 1.2;
  }

  &__rating {
    min-height: 30px;
    display: inline-flex;
    align-items: center;
    padding: 0 11px;
    color: $white;
    background: $red-500;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 800;
  }

  &__summary-stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  &__summary-stat {
    display: grid;
    gap: 4px;
    padding: 14px;
    background: rgba($red-500, 0.05);
    border-radius: 8px;

    span {
      color: $surface-500;
      font-size: 12px;
      font-weight: 600;
    }

    strong {
      color: $surface-900;
      font-size: 18px;
      font-weight: 700;
    }
  }

  &__location {
    display: grid;
    gap: 6px;
    padding: 14px;
    background: rgba($surface-300, 0.16);
    border: 1px solid rgba($red-500, 0.08);
    border-radius: 8px;

    span {
      color: $surface-500;
      font-size: 12px;
      font-weight: 700;
    }

    strong {
      color: $surface-900;
      font-size: 14px;
      line-height: 1.35;
    }
  }

  &__checklist {
    display: grid;
    gap: 10px;
  }

  &__checklist-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 14px;
    background: rgba($surface-300, 0.12);
    border: 1px solid rgba($red-500, 0.06);
    border-radius: 8px;

    &--done {
      .hotel-editor__checklist-dot {
        background: $red-500;
        box-shadow: 0 0 0 5px rgba($red-500, 0.12);
      }
    }

    strong,
    span {
      display: block;
    }

    strong {
      color: $surface-900;
      font-size: 14px;
      font-weight: 700;
    }

    span {
      margin-top: 4px;
      color: $surface-500;
      font-size: 13px;
      line-height: 1.4;
    }
  }

  &__checklist-dot {
    width: 10px;
    height: 10px;
    flex: 0 0 10px;
    margin-top: 6px;
    border-radius: 50%;
    background: rgba($surface-400, 0.75);
    transition:
      background-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  &__submit {
    width: 100%;
    min-height: 52px;
    color: $white;
    background: $red-500;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 700;
    transition: background-color 0.2s ease;

    &:hover {
      background: $red-400;
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }

  &__message {
    color: $red-500;
    font-size: 14px;
    font-weight: 600;
  }
}

@media (max-width: 1180px) {
  .hotel-editor {
    &__shell,
    &__gallery {
      grid-template-columns: 1fr;
    }

    &__card--sticky {
      position: static;
    }
  }
}

@media (max-width: 700px) {
  .hotel-editor {
    &__card {
      padding: 18px;
    }

    &__grid,
    &__summary-stats {
      grid-template-columns: 1fr;
    }

    &__preview,
    &__summary-preview {
      min-height: 180px;
    }

    &__preview-empty,
    &__summary-empty {
      min-height: 180px;
    }
  }
}
</style>
