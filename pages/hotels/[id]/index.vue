<template>
  <UiOverlay
    :is-show="true"
    header-icon="share"
    btn-label="Оставить заявку"
    :have-footer="true"
    :have-favorite-icon="true"
    @close="goTo('/hotels')"
    @action="scrollToRequestForm"
  >
    <section class="details">
      <div class="details__wrapper" v-if="hotel">
        <UiGoBack class="details__go-back" label="Отели" go-back="/hotels" />

        <div class="details__box">
          <section class="details__content">
            <div class="details__header">
              <h1 class="details__title title">{{ hotel.name }}</h1>
              <div class="details__icons">
                <UiIcons icon="heart" size="size-24" color="red-500"></UiIcons>
              </div>
            </div>

            <div class="details__imgs">
              <UiIcons
                icon="chevron"
                class="prev-img down"
                size="size-30"
                color="surface-900"
              ></UiIcons>
              <UiSwiper
                :loop="false"
                :pagination="{ clickable: true }"
                next-btn-class=".next-img"
                prev-btn-class=".prev-img"
              >
                <swiper-slide v-for="slide in hotel.images" :key="slide">
                  <img
                    @click="openPreviewPicture"
                    class="details__swiper-img"
                    :src="slide"
                    alt="Image"
                  />
                </swiper-slide>
              </UiSwiper>
              <UiIcons
                icon="chevron"
                class="next-img"
                size="size-30"
                color="surface-900"
              ></UiIcons>
            </div>

            <div class="details__reviews-inner details__reviews-inner--mobile">
              <p class="details__reviews-count details__reviews-count">
                20 отзывов
              </p>
              <UiIcons icon="star" color="yellow-500" size="size-14"></UiIcons>
              <p class="details__reviews-average">{{ hotel.rating }}</p>
            </div>

            <div class="details__totals-header details__totals-header--mobile">
              <div class="details__totals-box">
                <img
                  class="details__avatar"
                  :src="hotel?.partner?.logo"
                  alt="Avatar"
                />
              </div>
              <h1 class="details__title details__title--mobile title">
                {{ hotel.name }}
              </h1>
            </div>

            <div
              class="details__category-stars details__category-stars--mobile"
            >
              <UiIcons
                icon="star"
                color="yellow-500"
                v-for="star in 5"
                :key="star"
                size="size-20"
              ></UiIcons>
            </div>

            <div class="details__info">
              <p class="details__about">Об отеле</p>

              <p class="details__description" v-html="hotel.content"></p>

              <div class="details__category">
                <p class="details__category-title">Категория</p>
                <div class="details__category-stars">
                  <UiIcons
                    icon="star"
                    color="yellow-500"
                    v-for="star in Math.floor(hotel.rating)"
                    :key="star"
                    size="size-20"
                  ></UiIcons>
                </div>
                <p class="details__category-info">
                  {{ hotel.rating }} звездочный отель
                </p>
              </div>

              <div class="details__location">
                <p class="details__bold">Расположение</p>
                <p class="details__address">
                  г. Алматы, Пересечение улиц Байтурсынова и Абая
                </p>

                <div class="details__location-info">
                  <div
                    style="width: 100%; height: 400px"
                    class="details__map"
                    ref="yandexMapInfo"
                  ></div>
                  <div class="details__location-box">
                    <div
                      class="details__location-inner"
                      v-for="item in 4"
                      :key="item"
                    >
                      <UiIcons
                        icon="location"
                        size="size-24"
                        color="red-500"
                      ></UiIcons>
                      <p class="details__location-text">
                        <span class="details__location-path">20 км</span> от
                        аэропорта
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="details__tourist">
              <div class="details__tourist-box">
                <p class="details__tourist-text">Политика отеля</p>
                <ul class="details__tourist-list">
                  <li class="details__tourist-item">
                    Время заезда и выезда — стандартное время заселения и
                    выписки.
                  </li>
                  <li class="details__tourist-item">
                    Условия отмены бронирования — возможность возврата средств.
                  </li>
                  <li class="details__tourist-item">
                    Депозиты — нужны ли залоги за проживание или дополнительные
                    услуги.
                  </li>
                  <li class="details__tourist-item">
                    Размещение с детьми и животными — есть ли ограничения.
                  </li>
                </ul>
              </div>

              <div class="details__tourist-box">
                <p class="details__tourist-text">Виды номеров</p>
                <div class="details__rooms">
                  <TheHotelsRoom
                    v-for="room in hotel.room_types"
                    :key="room.id"
                    :room="room"
                    @select="selectRoom"
                  ></TheHotelsRoom>
                </div>
              </div>

              <div class="details__tourist-box">
                <p class="details__tourist-text">Питание</p>
                <ul class="details__tourist-list details__tourist-list--icon">
                  <li class="details__tourist-item details__tourist-item--icon">
                    <UiIcons
                      icon="check"
                      color="red-500"
                      size="size-24"
                    ></UiIcons>
                    <p>Полный пансион</p>
                  </li>
                  <li class="details__tourist-item details__tourist-item--icon">
                    <UiIcons
                      icon="check"
                      color="red-500"
                      size="size-24"
                    ></UiIcons>
                    <p>Ресторан</p>
                  </li>
                  <li class="details__tourist-item details__tourist-item--icon">
                    <UiIcons
                      icon="check"
                      color="red-500"
                      size="size-24"
                    ></UiIcons>
                    <p>
                      Возможность заказать специальное меню (вегетарианское,
                      халяль и др.).
                    </p>
                  </li>
                </ul>
              </div>

              <div class="details__tourist-box">
                <p class="details__tourist-text">Условия</p>
                <ul class="details__tourist-list details__tourist-list--icon">
                  <li class="details__tourist-item details__tourist-item--icon">
                    <UiIcons
                      icon="star-unfill"
                      color="red-500"
                      size="size-24"
                    ></UiIcons>
                    <p>Проживание 1 ночь</p>
                  </li>
                  <li class="details__tourist-item details__tourist-item--icon">
                    <UiIcons
                      icon="home"
                      color="red-500"
                      size="size-24"
                    ></UiIcons>
                    <p>Одноместный номер в Лоло</p>
                  </li>
                  <li class="details__tourist-item details__tourist-item--icon">
                    <UiIcons
                      icon="x-icon"
                      color="orange-200"
                      size="size-24"
                    ></UiIcons>
                    <p>Личные расходы</p>
                  </li>
                </ul>
              </div>

              <div class="details__tourist-box">
                <p class="details__tourist-text">Платные услуги</p>
                <ul class="details__tourist-list details__tourist-list--icon">
                  <li class="details__tourist-item details__tourist-item--icon">
                    <UiIcons
                      icon="check"
                      color="red-500"
                      size="size-24"
                    ></UiIcons>
                    <p>Полный пансион</p>
                  </li>
                  <li class="details__tourist-item details__tourist-item--icon">
                    <UiIcons
                      icon="check"
                      color="red-500"
                      size="size-24"
                    ></UiIcons>
                    <p>Ресторан</p>
                  </li>
                  <li class="details__tourist-item details__tourist-item--icon">
                    <UiIcons
                      icon="check"
                      color="red-500"
                      size="size-24"
                    ></UiIcons>
                    <p>
                      Возможность заказать специальное меню (вегетарианское,
                      халяль и др.).
                    </p>
                  </li>
                </ul>
              </div>

              <div class="details__tourist-box">
                <p class="details__tourist-text">Особенности для семей</p>
                <ul class="details__tourist-list details__tourist-list--icon">
                  <li class="details__tourist-item details__tourist-item--icon">
                    <UiIcons
                      icon="check"
                      color="red-500"
                      size="size-24"
                    ></UiIcons>
                    <p>Детские кроватки, услуги няни, детская площадка</p>
                  </li>
                </ul>
              </div>

              <div class="details__tourist-box">
                <p class="details__tourist-text">Доступность</p>
                <ul class="details__tourist-list details__tourist-list--icon">
                  <li class="details__tourist-item details__tourist-item--icon">
                    <UiIcons
                      icon="check"
                      color="red-500"
                      size="size-24"
                    ></UiIcons>
                    <p>
                      Удобства для людей с ограниченными возможностями (лифты,
                      пандусы)
                    </p>
                  </li>
                </ul>
              </div>

              <div class="details__tourist-box">
                <p class="details__tourist-text">Развлечения и отдых</p>
                <ul class="details__tourist-list details__tourist-list--icon">
                  <li class="details__tourist-item details__tourist-item--icon">
                    <UiIcons
                      icon="check"
                      color="red-500"
                      size="size-24"
                    ></UiIcons>
                    <p>Полный пансион</p>
                  </li>
                  <li class="details__tourist-item details__tourist-item--icon">
                    <UiIcons
                      icon="check"
                      color="red-500"
                      size="size-24"
                    ></UiIcons>
                    <p>Ресторан</p>
                  </li>
                  <li class="details__tourist-item details__tourist-item--icon">
                    <UiIcons
                      icon="check"
                      color="red-500"
                      size="size-24"
                    ></UiIcons>
                    <p>
                      Возможность заказать специальное меню (вегетарианское,
                      халяль и др.).
                    </p>
                  </li>
                </ul>
              </div>
            </div>

            <div class="details__contacts">
              <div class="details__contacts-box">
                <p class="details__contacts-text">Контакты</p>

                <div class="details__contacts-inner">
                  <div class="details__contacts-info">
                    <UiIcons
                      icon="globe"
                      color="red-500"
                      size="size-24"
                    ></UiIcons>
                    <p class="details__contacts-desc">website</p>
                  </div>
                  <div class="details__contacts-info">
                    <UiIcons
                      icon="phone"
                      color="red-500"
                      size="size-24"
                    ></UiIcons>
                    <p class="details__contacts-desc">phone number</p>
                  </div>
                  <div class="details__contacts-info">
                    <UiIcons
                      icon="location"
                      color="red-500"
                      size="size-24"
                    ></UiIcons>
                    <p class="details__contacts-desc">address</p>
                  </div>
                  <div class="details__contacts-info">
                    <UiIcons
                      icon="instagram"
                      color="red-500"
                      size="size-24"
                    ></UiIcons>
                    <p class="details__contacts-desc">instagram</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside ref="requestCard" class="details__request-card">
            <div class="details__request-header">
              <div class="details__totals-box">
                <img
                  class="details__avatar"
                  :src="hotel?.partner?.logo"
                  alt="Avatar"
                />
                <p class="details__name">
                  {{ hotel.partner?.name || hotel.partner?.title || "FlyAway" }}
                </p>
              </div>
              <span class="details__request-badge">Заявка</span>
            </div>

            <div class="details__request-intro">
              <h2 class="details__request-title">Оставить заявку</h2>
              <p class="details__request-text">
                Заполните контакты и даты проживания. Менеджер проверит
                доступность номеров и свяжется с вами.
              </p>
            </div>

            <div v-if="selectedRoom" class="details__message">
              <UiIcons
                icon="circle-check"
                color="red-500"
                size="size-20"
              ></UiIcons>
              <p class="details__message-text">
                Вы выбрали номер: {{ selectedRoom.name }}
              </p>
            </div>

            <form class="details__request-form" @submit.prevent="submitHotelRequest">
              <UiInput
                label="Имя"
                placeholder="Как к вам обращаться"
                v-model.trim="requestForm.name"
                :is-error="Boolean(fieldErrors.name)"
              />
              <UiInput
                label="Телефон"
                placeholder="+7 700 000 00 00"
                maska="+7 ### ### ## ##"
                v-model="requestForm.phone"
                :is-error="Boolean(fieldErrors.phone)"
              />
              <UiInput
                label="Email"
                type="email"
                placeholder="name@example.com"
                v-model.trim="requestForm.email"
                :is-error="Boolean(fieldErrors.email)"
              />

              <div class="details__request-grid">
                <UiCalendar
                  label="Дата заезда"
                  placeholder="Выберите дату"
                  v-model="requestForm.checkIn"
                  :clearable="true"
                />
                <UiCalendar
                  label="Дата выезда"
                  placeholder="Выберите дату"
                  v-model="requestForm.checkOut"
                  :clearable="true"
                />
              </div>

              <UiInput
                label="Гостей"
                type="number"
                placeholder="Например, 2"
                v-model="requestForm.guests"
                :is-error="Boolean(fieldErrors.guests)"
              />

              <UiTextarea
                label="Комментарий"
                placeholder="Например: нужен ранний заезд, детская кроватка или выбранный номер"
                v-model.trim="requestForm.comment"
                :rows="4"
              />

              <p
                v-if="statusMessage"
                class="details__request-status"
                :class="`details__request-status--${requestStatus}`"
              >
                {{ statusMessage }}
              </p>

              <UiButton
                label="Отправить заявку"
                class="details__request-btn button-primary"
                type="submit"
                :is-loading="isSubmittingRequest"
                :disabled="isSubmittingRequest"
              />
            </form>
          </aside>
        </div>
      </div>
      <section class="details__reviews">
        <div class="details__reviews-box">
          <div>
            <h3 class="details__reviews-title">Отзывы путешественников</h3>
            <div class="details__reviews-inner">
              <p class="details__reviews-count">20 отзывов</p>
              <UiIcons icon="star" color="yellow-500" size="size-14"></UiIcons>
              <p class="details__reviews-average">4,1</p>
            </div>
          </div>
          <nuxt-link class="details__reviews-link" to="/tours/1/reviews"
            >Все отзывы</nuxt-link
          >
        </div>

        <UiSwiper
          :loop="false"
          :breakpoints="{
            1000: {
              slidesPerView: 2.5,
            },
            375: {
              slidesPerView: 1,
            },
            0: {
              slidesPerView: 1,
            },
          }"
        >
          <swiper-slide v-for="review in 5" :key="review">
            <TheCommonReview />
          </swiper-slide>
        </UiSwiper>
        <UiButton
          class="details__reviews-btn"
          label="Все отзывы"
          after-icon="chevron"
          icon-size="size-20"
          icon-color="red-500"
        ></UiButton>
      </section>
    </section>
  </UiOverlay>

  <UiModal
    :is-show="isOpenPreviewPicture"
    max-width="600px"
    @close="closePreviewPicture"
  >
    <ModalsPicture></ModalsPicture>
  </UiModal>
</template>

<script setup>
const isOpenPreviewPicture = ref(false);
const yandexMapInfo = ref(null);
const { createMap } = useYandexMaps();
const api = useApi();
const authStore = useAuthStore();

const isMapReady = ref(false);
const infoMap = shallowRef(null);
const mapCenter = [76.889709, 43.238949];

const hotel = ref(null);
const route = useRoute();
const requestCard = ref(null);
const selectedRoom = ref(null);
const isSubmittingRequest = ref(false);
const requestStatus = ref("");
const statusMessage = ref("");
const fieldErrors = reactive({
  name: "",
  phone: "",
  email: "",
  guests: "",
});

const requestForm = reactive({
  name: "",
  phone: "",
  email: "",
  checkIn: null,
  checkOut: null,
  guests: "2",
  comment: "",
});

const formatApiDate = (value) => {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const resetFieldErrors = () => {
  fieldErrors.name = "";
  fieldErrors.phone = "";
  fieldErrors.email = "";
  fieldErrors.guests = "";
};

const hydrateRequestFormFromUser = () => {
  const user = authStore.getUser;

  if (!user) {
    return;
  }

  requestForm.name ||= user.name || user.fullName || "";
  requestForm.phone ||= user.phone || "";
  requestForm.email ||= user.email || "";
};

const validateRequestForm = () => {
  resetFieldErrors();
  const checkIn = formatApiDate(requestForm.checkIn);
  const checkOut = formatApiDate(requestForm.checkOut);
  const guests = Number(requestForm.guests) || 0;

  if (!requestForm.name.trim()) {
    fieldErrors.name = "Укажите имя";
  }

  if (!requestForm.phone.trim()) {
    fieldErrors.phone = "Укажите телефон";
  }

  if (!requestForm.email.trim()) {
    fieldErrors.email = "Укажите email";
  }

  if (guests < 1) {
    fieldErrors.guests = "Минимум 1 гость";
  }

  if (!checkIn || !checkOut) {
    statusMessage.value = "Выберите дату заезда и дату выезда.";
    requestStatus.value = "error";
    return false;
  }

  if (checkIn > checkOut) {
    statusMessage.value = "Дата выезда не может быть раньше даты заезда.";
    requestStatus.value = "error";
    return false;
  }

  const hasFieldErrors = Object.values(fieldErrors).some(Boolean);

  if (hasFieldErrors) {
    statusMessage.value = "Проверьте обязательные поля заявки.";
    requestStatus.value = "error";
    return false;
  }

  return true;
};

const buildComment = () => {
  const parts = [];

  if (selectedRoom.value?.name) {
    parts.push(`Выбранный номер: ${selectedRoom.value.name}`);
  }

  if (requestForm.comment.trim()) {
    parts.push(requestForm.comment.trim());
  }

  return parts.join("\n");
};

const submitHotelRequest = async () => {
  statusMessage.value = "";
  requestStatus.value = "";

  if (!validateRequestForm()) {
    return;
  }

  isSubmittingRequest.value = true;

  try {
    await api.client({
      url: "/hotel-requests",
      method: "post",
      data: {
        hotelId: hotel.value?._id || route.params.id,
        name: requestForm.name.trim(),
        phone: requestForm.phone.trim(),
        email: requestForm.email.trim(),
        checkIn: formatApiDate(requestForm.checkIn),
        checkOut: formatApiDate(requestForm.checkOut),
        guests: Number(requestForm.guests) || 1,
        comment: buildComment(),
      },
    });

    requestStatus.value = "success";
    statusMessage.value =
      "Заявка отправлена. Менеджер проверит доступность и свяжется с вами.";
    requestForm.checkIn = null;
    requestForm.checkOut = null;
    requestForm.comment = "";
    selectedRoom.value = null;
  } catch (error) {
    requestStatus.value = "error";
    statusMessage.value =
      error?.message || "Не удалось отправить заявку. Попробуйте еще раз.";
  } finally {
    isSubmittingRequest.value = false;
  }
};

const scrollToRequestForm = async () => {
  await nextTick();
  requestCard.value?.scrollIntoView?.({ behavior: "smooth", block: "start" });
};

const selectRoom = async (room) => {
  selectedRoom.value = room || null;
  await scrollToRequestForm();
};

useFetchSsr({
  url: `/hotels/${route.params.id}`,
  method: "get",
}).then((res) => {
  hotel.value = res.data;
});

hydrateRequestFormFromUser();

const destroyInfoMap = () => {
  if (infoMap.value && typeof infoMap.value.destroy === "function") {
    infoMap.value.destroy();
  }

  infoMap.value = null;
};

const getInfoMap = async () => {
  if (!yandexMapInfo.value || infoMap.value) {
    return;
  }

  try {
    infoMap.value = await createMap({
      container: yandexMapInfo.value,
      center: mapCenter,
      zoom: 10,
      markerCoordinates: mapCenter,
      markerText: "Алматы",
    });
    isMapReady.value = true;
  } catch (error) {
    console.error(error);
  }
};

watch(
  () => hotel.value,
  async (value) => {
    if (!value) {
      return;
    }

    await nextTick();
    await getInfoMap();
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  destroyInfoMap();
});

const closePreviewPicture = () => {
  isOpenPreviewPicture.value = false;
};

const openPreviewPicture = () => {
  isOpenPreviewPicture.value = true;
};
</script>

<style lang="scss" scoped>
.details {
  &__wrapper {
    width: 100%;
    margin: 40px 0 26px 0;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  &__box {
    width: 100%;
    display: flex;
    justify-content: space-between;
    gap: 16px;
  }
  &__content {
    background-color: $white;
    border-radius: 16px;
    padding: 20px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 26px;
  }
  &__calendar {
    width: 100%;
    border: none !important;
  }
  &__totals {
    background-color: $white;
    border-radius: 16px;
    padding: 16px;
    max-width: 360px;
    width: 100%;
  }
  &__request {
    &-card {
      position: sticky;
      top: 18px;
      align-self: flex-start;
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 380px;
      width: 100%;
      padding: 18px;
      border-radius: 24px;
      background: $white;
      color: $surface-900;
      box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.08);
    }

    &-header {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
    }

    &-badge {
      padding: 5px 10px;
      border-radius: 999px;
      background: rgba($red-500, 0.08);
      color: $red-500;
      font-size: 13px;
      font-weight: 700;
    }

    &-intro {
      display: grid;
      gap: 6px;
    }

    &-title {
      font-size: 24px;
      font-weight: 700;
      color: $surface-900;
    }

    &-text {
      color: $surface-500;
      font-size: 14px;
      line-height: 1.45;
    }

    &-form {
      display: grid;
      gap: 12px;
    }

    &-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    &-status {
      padding: 10px 12px;
      border-radius: 14px;
      font-size: 14px;
      line-height: 1.45;

      &--success {
        color: $green-400;
        background: rgba($green-400, 0.08);
      }

      &--error {
        color: $red-500;
        background: rgba($red-500, 0.08);
      }
    }

    &-btn {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 46px;
      padding: 12px;
      color: $white;
      background-color: $red-500;
    }
  }
  &__header {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: center;
  }
  &__title {
    color: $red-500;
    &--mobile {
      display: none;
    }
  }
  &__icons {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  &__imgs {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
  }
  &__tabs {
    margin: 0 auto;
  }
  &__bold {
    font-weight: 400;
    position: relative;
    &--center {
      text-align: center;
      font-weight: 700;
      font-size: 20px;
    }
  }
  &__about {
    font-weight: 400;
    font-size: 16px;
  }
  &__list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  &__rooms {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  &__list-item {
    list-style: disc;
    margin-left: 26px;
  }
  &__select-date {
    display: flex;
    gap: 12px;
    align-items: center;
    width: 95%;
    margin: 0 auto;
    justify-content: space-between;
    border: 1px solid $surface-300;
    padding: 8px;
    border-radius: 26px;
  }
  &__date {
    flex-grow: 1;
    color: $red-500;
    font-size: 14px;
    font-weight: 400;
  }
  &__message {
    display: flex;
    gap: 8px;
    align-items: center;
    &-text {
      color: $red-500;
      font-size: 16px;
      font-weight: 400;
    }
  }

  &__location {
    display: flex;
    flex-direction: column;
    gap: 4px;
    position: relative;
    &-info {
      display: flex;
    }
    &-box {
      flex-grow: 1;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
    }
    &-inner {
      display: flex;
      gap: 4px;
      align-items: center;
    }
    &-path {
      color: $red-500;
    }
  }
  &__map {
    max-width: 300px;
    width: 100%;
    max-height: 120px;
    border-radius: 16px;
  }
  &__category {
    display: flex;
    gap: 8px;
    align-items: center;
    color: $surface-900;
    margin: 16px 0;
    &-stars {
      &--mobile {
        display: none;
      }
    }
    &-title {
      font-weight: 400;
    }
  }
  &__time {
    padding: 4px 8px;
    border-radius: 16px;
    background-color: $blue-200;
  }

  &__reviews {
    margin: 16px 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
    &-box {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
    }
    &-link {
      color: $red-500;
      font-weight: 700;
      cursor: pointer;
    }
    &-inner {
      display: flex;
      gap: 6px;
      align-items: center;
      margin-top: 8px;

      &--mobile {
        display: none;
      }
    }
    &-btn {
      display: none;
    }
    &-count {
      font-size: 14px;
      color: $surface-400;
    }
    &-average {
      font-size: 14px;
      color: $surface-900;
      font-weight: 400;
    }
    &-cards {
      margin: 12px 0;
      display: flex;
      justify-content: space-between;
      gap: 16px;
    }
  }
  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }
  &__name {
    font-weight: 400;
  }
  &__baige {
    padding: 4px 8px;
    background-color: $orange-200;
    border-radius: 16px;
    font-size: 14px;
    color: $white;
  }
  &__totals {
    color: $surface-900;
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
    &-btn {
      background-color: $red-500;
      display: flex;
      justify-content: center;
      align-items: center;
      color: $white;
      padding: 12px;
    }
    &-header {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
      &--mobile {
        display: none;
      }
    }
    &-box {
      display: flex;
      gap: 6px;
      align-items: center;
    }
    &-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    &-item {
      font-weight: 400;
      display: flex;
      gap: 4px;
      align-items: center;
      font-size: 14px;
      &--result {
        color: $red-500;
      }
    }
    &-question {
      &--discount {
        color: $orange-200;
      }
    }
  }
  &__bold {
    font-weight: 400;
  }
  &__input {
    width: 100%;
    &--bg {
      background-color: $surface-150;
      border-radius: 16px;
    }
    &-box {
      display: flex;
      flex-direction: column;
      gap: 6px;
      color: $surface-900;
    }
    &-name {
      font-weight: 400;
      font-size: 14px;
    }
    &-price {
      font-size: 14px;
    }
    &-inner {
      display: flex;
      gap: 4px;
      justify-content: space-between;
      align-items: center;
    }
  }
  &__accept {
    color: $red-500;
    font-size: 14px;
    font-weight: 400;
    cursor: pointer;
  }
  &__tourist {
    display: flex;
    flex-direction: column;
    gap: 26px;
    color: $surface-900;
    &-list {
      &--icon {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
    }
    &-item {
      list-style-type: disc;
      margin-left: 28px;
      &--icon {
        display: flex;
        gap: 6px;
        align-items: center;
        margin-left: 0;
      }
    }
    &-text {
      margin-bottom: 12px;
      font-weight: 400;
    }
  }
  &__contacts {
    color: $surface-900;
    font-size: 14px;
    &-text {
      font-weight: 400;
      font-size: 16px;
      margin-bottom: 12px;
    }
    &-inner {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    &-info {
      display: flex;
      gap: 6px;
      align-items: center;
    }
  }
}

.hide {
  display: none;
}
.show {
  display: block;
}

.details .details__imgs :deep(.custom-swiper::part(pagination)) {
  position: absolute !important;
}

@media (max-width: 375px) {
  .details {
    &__wrapper {
      margin-top: 0;
    }
    &__box {
      flex-direction: column;
      gap: 16px;
    }
    &__content {
      padding: 0;
      background-color: transparent;
      flex-direction: column;
      gap: 16px;
    }
    &__request {
      &-card {
        position: static;
        max-width: 100%;
        padding: 16px;
        border-radius: 18px;
      }

      &-title {
        font-size: 20px;
      }

      &-grid {
        grid-template-columns: 1fr;
      }
    }
    &__totals {
      &-header {
        &--mobile {
          justify-content: flex-start;
          display: flex;
          gap: 4px;
        }
      }
    }
    &__tourist {
      &-box {
        &--mobile {
          display: block;
          margin: 12px 0;
        }
      }
    }
    &__category {
      display: none;
      &-stars {
        &--mobile {
          display: flex;
        }
      }
    }
    &__reviews {
      &-btn {
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid $red-500;
        padding: 10px 0;
        color: $red-500;
      }
      &-link {
        display: none;
      }
      &-average,
      &-count {
        font-size: 10px;
      }
      &-inner {
        display: none;
        margin: 0;
        &--mobile {
          display: flex;
          font-size: 10px;
        }
      }
    }
    &__about {
      margin-bottom: 12px;
    }
    &__totals,
    &__tabs,
    .prev-img,
    .next-img,
    &__title,
    &__icons,
    &__imgs i,
    &__go-back {
      display: none;
    }
    &__title {
      &--mobile {
        display: block;
        color: $surface-900;
        line-height: 30px;
      }
    }
    &__contacts {
      &-inner {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    &__hot {
      display: flex;
      gap: 6px;
      align-items: center;
    }
    &__info {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    &__location {
      &-info,
      &-box {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
    }
  }
  .hide {
    display: flex !important;
    flex-direction: column;
    gap: 12px;
  }
}
</style>
