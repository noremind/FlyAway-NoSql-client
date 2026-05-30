<template>
  <section class="hotel-page">
    <div class="hotel-page__wrapper">
      <template v-if="isLoading">
        <div class="hotel-page__state">Загружаем отель...</div>
      </template>

      <template v-else-if="errorMessage">
        <div class="hotel-page__state hotel-page__state--error">
          {{ errorMessage }}
        </div>
      </template>

      <template v-else-if="hotel">
        <UiGoBack class="hotel-page__go-back" label="Отели" go-back="/hotels" />

        <div class="hotel-page__layout">
          <section class="hotel-page__main">
            <article class="hotel-page__card hotel-page__card--hero">
              <div class="hotel-page__head">
                <h1 class="hotel-page__title title">{{ hotelName }}</h1>

                <button
                  type="button"
                  class="hotel-page__favorite"
                  aria-label="Добавить в избранное"
                  @click="toggleFavouriteHotel"
                >
                  <UiIcons
                    :icon="isFavouriteHotel ? 'heart-fill' : 'heart'"
                    size="size-24"
                    :color="isFavouriteHotel ? 'red-500' : 'surface-900'"
                  />
                </button>
              </div>

              <div v-if="previewImages.length" class="hotel-page__gallery">
                <UiIcons
                  icon="chevron"
                  class="hotel-page__gallery-nav hotel-page__gallery-nav--prev down"
                  size="size-30"
                  color="surface-900"
                />
                <UiSwiper
                  :loop="false"
                  :pagination="{ clickable: true }"
                  next-btn-class=".hotel-page__gallery-nav--next"
                  prev-btn-class=".hotel-page__gallery-nav--prev"
                >
                  <swiper-slide v-for="image in previewImages" :key="image">
                    <img
                      class="hotel-page__gallery-image"
                      :src="image"
                      :alt="hotelName"
                      @click="openPreviewPicture(image)"
                    />
                  </swiper-slide>
                </UiSwiper>
                <UiIcons
                  icon="chevron"
                  class="hotel-page__gallery-nav hotel-page__gallery-nav--next"
                  size="size-30"
                  color="surface-900"
                />
              </div>

              <div class="hotel-page__section">
                <h2 class="hotel-page__section-title">Об отеле</h2>

                <p v-if="hotel.description" class="hotel-page__text">
                  {{ hotel.description }}
                </p>

                <div
                  v-if="hotel.content"
                  class="hotel-page__text hotel-page__text--html"
                  v-html="hotel.content"
                />
              </div>

              <div class="hotel-page__meta-grid">
                <div v-if="hasRating" class="hotel-page__meta-block">
                  <h3 class="hotel-page__meta-title">Категория</h3>
                  <div class="hotel-page__stars">
                    <UiIcons
                      v-for="star in 5"
                      :key="star"
                      icon="star"
                      size="size-18"
                      :color="
                        star <= roundedRating ? 'yellow-500' : 'surface-300'
                      "
                    />
                    <span class="hotel-page__meta-note">{{ ratingText }}</span>
                  </div>
                </div>

                <div v-if="hotel.location" class="hotel-page__meta-block">
                  <h3 class="hotel-page__meta-title">Расположение</h3>
                  <div class="hotel-page__location-row">
                    <UiIcons icon="location" size="size-20" color="red-500" />
                    <span>{{ hotel.location }}</span>
                  </div>
                </div>

                <div v-if="partnerName" class="hotel-page__meta-block">
                  <h3 class="hotel-page__meta-title">Партнер</h3>
                  <nuxt-link
                    :to="`/partners/${hotel?.partner?._id}`"
                    class="hotel-page__partner-row"
                  >
                    <img
                      v-if="partnerLogo"
                      class="hotel-page__partner-logo"
                      :src="partnerLogo"
                      :alt="partnerName"
                    />
                    <span
                      v-else
                      class="hotel-page__partner-logo hotel-page__partner-logo--empty"
                    >
                      {{ partnerInitial }}
                    </span>
                    <span>{{ partnerName }}</span>
                  </nuxt-link>
                </div>
              </div>

              <div
                v-if="hotel.location || nearbyPoints.length"
                class="hotel-page__map-block"
              >
                <div class="hotel-page__mini-map">
                  <img
                    class="hotel-page__mini-map-image"
                    :src="mapPreview"
                    alt="Локация отеля"
                  />
                </div>

                <div v-if="nearbyPoints.length" class="hotel-page__distances">
                  <div
                    v-for="item in nearbyPoints"
                    :key="`${item.label}-${item.value}`"
                    class="hotel-page__distance-item"
                  >
                    <UiIcons icon="location" size="size-18" color="red-500" />
                    <span>{{ item.value }} {{ item.label }}</span>
                  </div>
                </div>
              </div>

              <div v-if="policyItems.length" class="hotel-page__section">
                <h2 class="hotel-page__section-title">Политика отеля</h2>
                <ul class="hotel-page__list">
                  <li
                    v-for="item in policyItems"
                    :key="item"
                    class="hotel-page__list-item"
                  >
                    {{ item }}
                  </li>
                </ul>
              </div>

              <div v-if="roomTypes.length" class="hotel-page__section">
                <h2 class="hotel-page__section-title">Виды номеров</h2>

                <div class="hotel-page__rooms">
                  <TheHotelsRoom
                    v-for="room in roomTypes"
                    :key="getRoomId(room)"
                    :room="room"
                    :selected="selectedRoomId === getRoomId(room)"
                    @select="selectRoom"
                  />
                </div>
              </div>

              <div
                v-for="group in amenityGroups"
                :key="group.title"
                class="hotel-page__section"
              >
                <h2 class="hotel-page__section-title">{{ group.title }}</h2>
                <ul class="hotel-page__icon-list">
                  <li
                    v-for="item in group.items"
                    :key="item"
                    class="hotel-page__icon-item"
                  >
                    <UiIcons icon="check" size="size-18" color="red-500" />
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </div>

              <div v-if="contactsItems.length" class="hotel-page__section">
                <h2 class="hotel-page__section-title">Контакты</h2>

                <div class="hotel-page__contacts">
                  <div
                    v-for="item in contactsItems"
                    :key="`${item.icon}-${item.value}`"
                    class="hotel-page__contact-item"
                  >
                    <UiIcons :icon="item.icon" size="size-20" color="red-500" />
                    <span>{{ item.value }}</span>
                  </div>
                </div>
              </div>
            </article>
          </section>

          <aside class="hotel-page__aside">
            <article class="hotel-page__booking-card">
              <div class="hotel-page__booking-head">
                <nuxt-link
                  :to="`/partners/${hotel?.partner?._id}`"
                  class="hotel-page__partner"
                >
                  <img
                    v-if="partnerLogo"
                    class="hotel-page__partner-logo"
                    :src="partnerLogo"
                    :alt="partnerName"
                  />
                  <span
                    v-else
                    class="hotel-page__partner-logo hotel-page__partner-logo--empty"
                  >
                    {{ partnerInitial }}
                  </span>
                  <p class="hotel-page__partner-name">{{ partnerName }}</p>
                </nuxt-link>

                <span v-if="discountLabel" class="hotel-page__discount">
                  {{ discountLabel }}
                </span>
              </div>

              <div class="hotel-page__booking-section">
                <h3 class="hotel-page__booking-title">Выберите дату</h3>

                <div class="hotel-page__booking-grid">
                  <UiCalendar
                    label="Дата от"
                    placeholder="Выберите дату"
                    v-model="bookingForm.checkIn"
                    :clearable="true"
                  />
                  <UiCalendar
                    label="Дата до"
                    placeholder="Выберите дату"
                    v-model="bookingForm.checkOut"
                    :clearable="true"
                  />
                </div>
              </div>

              <div class="hotel-page__booking-section">
                <h3 class="hotel-page__booking-title">Гости</h3>
                <UiInput
                  type="number"
                  placeholder="Количество гостей"
                  v-model="bookingForm.guests"
                />
              </div>

              <div v-if="selectedRoom" class="hotel-page__selected-room">
                <UiIcons icon="circle-check" size="size-18" color="red-500" />
                <span>Вы выбрали {{ selectedRoom.name }}</span>
              </div>

              <div class="hotel-page__summary">
                <div class="hotel-page__summary-row">
                  <span>Номер</span>
                  <strong>{{ selectedRoom?.name || "Не выбран" }}</strong>
                </div>

                <div class="hotel-page__summary-row">
                  <span>Гостей</span>
                  <strong>{{ guestsLabel }}</strong>
                </div>

                <div class="hotel-page__summary-row">
                  <span>Ночей</span>
                  <strong>{{ nightsCount }}</strong>
                </div>

                <div class="hotel-page__summary-row">
                  <span>Цена</span>
                  <strong>{{ summaryPriceLabel }}</strong>
                </div>

                <div
                  v-if="discount > 0 && rawTotal > 0"
                  class="hotel-page__summary-row"
                >
                  <span>Скидка</span>
                  <strong class="hotel-page__summary-discount">
                    -{{ discount }}%
                  </strong>
                </div>

                <div
                  class="hotel-page__summary-row hotel-page__summary-row--total"
                >
                  <span>Итого</span>
                  <strong>{{ totalPriceLabel }}</strong>
                </div>
              </div>

              <p class="hotel-page__booking-note">
                После отправки заявки менеджер проверит доступность и свяжется с
                вами.
              </p>

              <UiButton
                label="Забронировать"
                class="hotel-page__booking-btn button-primary"
                :disabled="!selectedRoom"
                @click="openBookingModal"
              />
            </article>
          </aside>
        </div>
      </template>

      <template v-else>
        <div class="hotel-page__state">Отель не найден.</div>
      </template>
    </div>
  </section>

  <TheHotelsBookingRequestModal
    :is-show="isBookingModalOpen"
    :hotel-title="hotelName"
    :selected-room-label="selectedRoomLabel"
    :check-in-label="checkInLabel"
    :check-out-label="checkOutLabel"
    :guests-label="guestsLabel"
    :price-title="priceTitle"
    :price-label="modalPriceLabel"
    :model-value="bookingForm"
    :errors="fieldErrors"
    :status-message="bookingStatusMessage"
    :status-type="bookingStatusType"
    :is-loading="isSubmittingRequest"
    submit-label="Подтвердить"
    @close="closeBookingModal"
    @submit="submitHotelRequest"
    @update:model-value="syncBookingForm"
  />

  <TheHotelsBookingSuccessModal
    :is-show="isSuccessModalOpen"
    title="Наш менеджер с вами свяжется"
    text="Заявка отправлена. Она появилась в разделе «Мои отели» со статусом «Новые». После подтверждения админом статус станет «Активные»."
    button-label="Готово"
    @close="closeSuccessModal"
    @action="closeSuccessModal"
  />

  <UiModal
    :is-show="isOpenPreviewPicture"
    max-width="760px"
    @close="closePreviewPicture"
  >
    <img
      v-if="previewImage"
      class="hotel-page__preview-img"
      :src="previewImage"
      :alt="hotelName"
    />
  </UiModal>
</template>

<script setup>
import placeholderImage from "@/assets/image/content/main-image.png";
import mapPreview from "@/assets/image/content/map.svg";

const api = useApi();
const authStore = useAuthStore();
const route = useRoute();

const hotel = ref(null);
const isLoading = ref(false);
const errorMessage = ref("");

const isFavouriteHotel = ref(false);
const selectedRoomId = ref("");

const isBookingModalOpen = ref(false);
const isSuccessModalOpen = ref(false);
const isSubmittingRequest = ref(false);

const isOpenPreviewPicture = ref(false);
const previewImage = ref("");

const bookingStatusMessage = ref("");
const bookingStatusType = ref("error");

const fieldErrors = reactive({
  name: "",
  phone: "",
  email: "",
  guests: "",
});

const bookingForm = reactive({
  name: "",
  phone: "",
  email: "",
  checkIn: null,
  checkOut: null,
  guests: "1",
  comment: "",
});

const normalizeString = (value) => String(value || "").trim();

const stripHtml = (value) =>
  normalizeString(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const formatMoney = (value) => Number(value || 0).toLocaleString("ru-RU");

const normalizeList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeString(item)).filter(Boolean);
  }

  if (!value || typeof value !== "string") {
    return [];
  }

  return value
    .split(/\n|•|;|,/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const formatApiDate = (value) => {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatHumanDate = (value) => {
  if (!value) return "—";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

const getRoomId = (room) =>
  String(room?._id || room?.id || room?.name || Math.random());

const hotelName = computed(() => normalizeString(hotel.value?.name) || "Отель");

const hotelDescription = computed(() => {
  const text = stripHtml(hotel.value?.description || hotel.value?.content);
  return text || "";
});

const previewImages = computed(() => {
  const images = Array.isArray(hotel.value?.images)
    ? hotel.value.images.filter(Boolean)
    : [];

  return images.length ? images : [placeholderImage];
});

const roundedRating = computed(() =>
  Math.max(0, Math.min(5, Math.round(Number(hotel.value?.rating) || 0))),
);

const hasRating = computed(() => Number(hotel.value?.rating || 0) > 0);

const ratingText = computed(() => {
  if (!hasRating.value) return "Без рейтинга";
  return `${Number(hotel.value?.rating || 0)
    .toFixed(1)
    .replace(".", ",")} звездочный отель`;
});

const roomTypes = computed(() =>
  Array.isArray(hotel.value?.room_types) ? hotel.value.room_types : [],
);

const selectedRoom = computed(
  () =>
    roomTypes.value.find((room) => getRoomId(room) === selectedRoomId.value) ||
    null,
);

const partnerName = computed(
  () =>
    hotel.value?.partner?.title ||
    hotel.value?.partner?.name ||
    "FlyAway Partner",
);

const partnerLogo = computed(() => hotel.value?.partner?.logo || "");

const partnerInitial = computed(() =>
  partnerName.value.charAt(0).toUpperCase(),
);

const discount = computed(() =>
  Math.max(0, Number(hotel.value?.discount) || 0),
);

const discountLabel = computed(() =>
  discount.value ? `-${discount.value}%` : "",
);

const nearbyPoints = computed(() => {
  const items =
    hotel.value?.nearby_points ||
    hotel.value?.nearbyPoints ||
    hotel.value?.distances ||
    [];

  if (Array.isArray(items)) {
    return items
      .map((item) => {
        if (typeof item === "string") {
          return { label: item, value: "" };
        }

        return {
          label: normalizeString(item?.label || item?.title),
          value: normalizeString(item?.value || item?.distance),
        };
      })
      .filter((item) => item.label || item.value);
  }

  return [];
});

const policyItems = computed(() => {
  return normalizeList(
    hotel.value?.policy ||
      hotel.value?.policies ||
      hotel.value?.rules ||
      hotel.value?.hotel_policy,
  );
});

const amenityGroups = computed(() => {
  const groups = [
    {
      title: "Питание",
      items: normalizeList(
        hotel.value?.meals ||
          hotel.value?.meal_options ||
          hotel.value?.nutrition ||
          hotel.value?.food,
      ),
    },
    {
      title: "Удобства",
      items: normalizeList(
        hotel.value?.amenities ||
          hotel.value?.facilities ||
          hotel.value?.comforts,
      ),
    },
    {
      title: "Платные услуги",
      items: normalizeList(
        hotel.value?.paid_services || hotel.value?.extra_services,
      ),
    },
    {
      title: "Особенности для семей",
      items: normalizeList(
        hotel.value?.family_features || hotel.value?.family_options,
      ),
    },
    {
      title: "Доступность",
      items: normalizeList(hotel.value?.accessibility),
    },
    {
      title: "Развлечения и отдых",
      items: normalizeList(hotel.value?.entertainment || hotel.value?.leisure),
    },
  ];

  return groups.filter((group) => group.items.length);
});

const contactsItems = computed(() => {
  const contacts =
    hotel.value?.contacts || hotel.value?.partner?.contacts || {};

  const items = [
    { icon: "globe", value: contacts.website || hotel.value?.website },
    { icon: "phone", value: contacts.phone || hotel.value?.phone },
    { icon: "location", value: contacts.address || hotel.value?.address },
    { icon: "instagram", value: contacts.instagram || hotel.value?.instagram },
  ];

  return items.filter((item) => normalizeString(item.value));
});

const nightsCount = computed(() => {
  const checkIn = bookingForm.checkIn ? new Date(bookingForm.checkIn) : null;
  const checkOut = bookingForm.checkOut ? new Date(bookingForm.checkOut) : null;

  if (!checkIn || !checkOut) return 1;
  if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime()))
    return 1;

  const diff = Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
  );
  return diff > 0 ? diff : 1;
});

const roomPrice = computed(() => Number(selectedRoom.value?.price) || 0);

const rawTotal = computed(() => roomPrice.value * nightsCount.value);

const totalWithDiscount = computed(() => {
  if (!rawTotal.value) return 0;
  if (!discount.value) return rawTotal.value;
  return Math.round(rawTotal.value * (1 - discount.value / 100));
});

const guestsLabel = computed(
  () => `${Math.max(1, Number(bookingForm.guests) || 1)}`,
);

const selectedRoomLabel = computed(() =>
  selectedRoom.value?.name ? `Вы выбрали ${selectedRoom.value.name}` : "",
);

const checkInLabel = computed(() => formatHumanDate(bookingForm.checkIn));
const checkOutLabel = computed(() => formatHumanDate(bookingForm.checkOut));

const summaryPriceLabel = computed(() => {
  if (!roomPrice.value) return "По запросу";
  return `${formatMoney(roomPrice.value)} ₸ / ночь`;
});

const totalPriceLabel = computed(() => {
  if (!totalWithDiscount.value) return "По запросу";
  return `${formatMoney(totalWithDiscount.value)} ₸`;
});

const priceTitle = computed(() =>
  bookingForm.checkIn && bookingForm.checkOut
    ? `Итого за ${nightsCount.value} ${nightsCount.value === 1 ? "ночь" : nightsCount.value < 5 ? "ночи" : "ночей"}`
    : "Цена за ночь",
);

const modalPriceLabel = computed(() => {
  if (!selectedRoom.value) return "";
  if (bookingForm.checkIn && bookingForm.checkOut && totalWithDiscount.value) {
    return `${formatMoney(totalWithDiscount.value)} ₸`;
  }
  return `${formatMoney(roomPrice.value)} ₸`;
});

const syncBookingForm = (value) => {
  Object.assign(bookingForm, value || {});
};

const resetFieldErrors = () => {
  fieldErrors.name = "";
  fieldErrors.phone = "";
  fieldErrors.email = "";
  fieldErrors.guests = "";
};

const hydrateBookingFormFromUser = () => {
  const user = authStore.getUser;
  if (!user) return;

  bookingForm.name ||= user.name || user.fullName || "";
  bookingForm.phone ||= user.phone || "";
  bookingForm.email ||= user.email || "";
};

const loadHotel = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response = await api.client({
      url: `/hotels/${route.params.id}`,
      method: "get",
    });

    hotel.value = response?.data || response || null;

    if (!selectedRoomId.value && roomTypes.value.length) {
      selectedRoomId.value = getRoomId(roomTypes.value[0]);
    }

    await syncFavouriteHotelState();
  } catch (error) {
    errorMessage.value = error?.message || "Не удалось загрузить отель.";
    hotel.value = null;
  } finally {
    isLoading.value = false;
  }
};

const syncFavouriteHotelState = async () => {
  if (!authStore.isLoggedIn || !hotel.value?._id) {
    isFavouriteHotel.value = false;
    return;
  }

  try {
    const response = await api.client({
      url: "/personal-cabinet/favourites/hotels",
      method: "get",
    });

    const items = Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response)
        ? response
        : [];

    isFavouriteHotel.value = items.some(
      (item) =>
        String(item?._id || item?.id || "") === String(hotel.value?._id),
    );
  } catch {
    isFavouriteHotel.value = false;
  }
};

const toggleFavouriteHotel = async () => {
  if (!authStore.isLoggedIn) {
    authStore.openAuthModalLogin();
    return;
  }

  if (!hotel.value?._id) return;

  const previousValue = isFavouriteHotel.value;
  isFavouriteHotel.value = !previousValue;

  try {
    const response = await api.client({
      url: `/personal-cabinet/favourites/hotels/${hotel.value._id}/toggle`,
      method: "post",
    });

    isFavouriteHotel.value = Boolean(response?.data?.isFavourite);
  } catch {
    isFavouriteHotel.value = previousValue;
  }
};

const selectRoom = (room) => {
  selectedRoomId.value = getRoomId(room);
};

const openBookingModal = () => {
  bookingStatusMessage.value = "";
  bookingStatusType.value = "error";

  if (!authStore.isLoggedIn) {
    authStore.openAuthModalLogin();
    return;
  }

  hydrateBookingFormFromUser();

  if (!selectedRoom.value && roomTypes.value.length) {
    selectedRoomId.value = getRoomId(roomTypes.value[0]);
  }

  isBookingModalOpen.value = true;
};

const closeBookingModal = () => {
  isBookingModalOpen.value = false;
  bookingStatusMessage.value = "";
};

const closeSuccessModal = () => {
  isSuccessModalOpen.value = false;
};

const validateBookingForm = () => {
  resetFieldErrors();

  const guests = Math.max(1, Number(bookingForm.guests) || 0);
  const checkIn = formatApiDate(bookingForm.checkIn);
  const checkOut = formatApiDate(bookingForm.checkOut);

  if (!normalizeString(bookingForm.name)) {
    fieldErrors.name = "Укажите имя";
  }

  if (!normalizeString(bookingForm.phone)) {
    fieldErrors.phone = "Укажите телефон";
  }

  if (!normalizeString(bookingForm.email)) {
    fieldErrors.email = "Укажите email";
  }

  if (guests < 1) {
    fieldErrors.guests = "Минимум 1 гость";
  }

  if (!checkIn || !checkOut) {
    bookingStatusMessage.value = "Выберите дату заезда и дату выезда.";
    bookingStatusType.value = "error";
    return false;
  }

  if (checkIn > checkOut) {
    bookingStatusMessage.value =
      "Дата выезда не может быть раньше даты заезда.";
    bookingStatusType.value = "error";
    return false;
  }

  if (Object.values(fieldErrors).some(Boolean)) {
    bookingStatusMessage.value = "Проверьте обязательные поля.";
    bookingStatusType.value = "error";
    return false;
  }

  return true;
};

const buildComment = () => {
  const parts = [];

  if (selectedRoom.value?.name) {
    parts.push(`Выбранный номер: ${selectedRoom.value.name}`);
  }

  if (bookingForm.checkIn && bookingForm.checkOut) {
    parts.push(
      `Период проживания: ${formatApiDate(bookingForm.checkIn)} — ${formatApiDate(bookingForm.checkOut)}`,
    );
  }

  if (normalizeString(bookingForm.comment)) {
    parts.push(normalizeString(bookingForm.comment));
  }

  return parts.join("\n");
};

const submitHotelRequest = async () => {
  bookingStatusMessage.value = "";
  bookingStatusType.value = "error";

  if (!authStore.isLoggedIn) {
    closeBookingModal();
    authStore.openAuthModalLogin();
    return;
  }

  if (!validateBookingForm()) return;

  isSubmittingRequest.value = true;

  try {
    await api.client({
      url: "/hotel-requests",
      method: "post",
      data: {
        hotelId: hotel.value?._id || route.params.id,
        name: normalizeString(bookingForm.name),
        phone: normalizeString(bookingForm.phone),
        email: normalizeString(bookingForm.email),
        checkIn: formatApiDate(bookingForm.checkIn),
        checkOut: formatApiDate(bookingForm.checkOut),
        guests: Math.max(1, Number(bookingForm.guests) || 1),
        comment: buildComment(),
      },
    });

    isBookingModalOpen.value = false;
    isSuccessModalOpen.value = true;
    bookingStatusMessage.value = "";
    bookingForm.comment = "";
  } catch (error) {
    bookingStatusMessage.value =
      error?.message || "Не удалось отправить заявку. Попробуйте еще раз.";
    bookingStatusType.value = "error";
  } finally {
    isSubmittingRequest.value = false;
  }
};

const openPreviewPicture = (image) => {
  if (!image) return;
  previewImage.value = image;
  isOpenPreviewPicture.value = true;
};

const closePreviewPicture = () => {
  isOpenPreviewPicture.value = false;
  previewImage.value = "";
};

watch(
  roomTypes,
  (items) => {
    if (!selectedRoomId.value && items.length) {
      selectedRoomId.value = getRoomId(items[0]);
    }
  },
  { immediate: true },
);

onMounted(async () => {
  hydrateBookingFormFromUser();
  await loadHotel();
});
</script>
