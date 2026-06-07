<template>
  <UiOverlay
    :is-show="true"
    header-icon="share"
    btn-label="Перейти к бронированию"
    :have-footer="true"
    :have-favorite-icon="true"
    @close="goTo('/tours')"
    @action="openPartialModalPayment"
  >
    <section v-if="tour" class="details">
      <div class="details__wrapper">
        <UiGoBack class="details__go-back" label="Туры" go-back="/tours" />

        <div class="details__box">
          <section class="details__content">
            <div class="details__header">
              <h1 class="details__title title">{{ tour.title }}</h1>
              <div class="details__icons">
                <button
                  type="button"
                  class="details__favorite"
                  aria-label="Добавить в избранное"
                  @click="toggleFavourite"
                >
                  <UiIcons
                    :icon="isFavourite ? 'heart-fill' : 'heart'"
                    size="size-24"
                    :color="isFavourite ? 'red-500' : 'blue-500'"
                  />
                </button>
                <div v-if="tour.is_hot" class="details__icons-box">
                  <UiIcons
                    icon="hot"
                    size="size-24"
                    color="orange-200"
                  ></UiIcons>
                  <p class="details__icons-text">Горящий тур</p>
                </div>
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
                <swiper-slide
                  v-for="(image, index) in galleryImages"
                  :key="`${image}-${index}`"
                >
                  <img
                    class="details__swiper-img"
                    :src="image"
                    :alt="tour.title"
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

            <div class="details__totals-header details__totals-header--mobile">
              <nuxt-link
                :to="`/partners/${tour?.partner?._id}`"
                class="details__totals-box"
              >
                <img
                  class="details__avatar"
                  :src="partnerAvatar"
                  :alt="partnerTitle"
                />
                <p class="details__name">{{ partnerTitle }}</p>
              </nuxt-link>
              <div
                class="details__reviews-inner details__reviews-inner--mobile"
              >
                <p class="details__reviews-count details__reviews-count">
                  {{ reviewsCountLabel }}
                </p>
                <UiIcons
                  icon="star"
                  color="yellow-500"
                  size="size-14"
                ></UiIcons>
                <p class="details__reviews-average">{{ ratingLabel }}</p>
              </div>
            </div>

            <h1 class="details__title details__title--mobile title">
              {{ tour.title }}
            </h1>

            <div
              v-if="tour.is_hot"
              class="details__icons details__icons--mobile"
            >
              <div class="details__icons-box">
                <UiIcons icon="hot" size="size-24" color="orange-200"></UiIcons>
                <p class="details__icons-text">Горящий тур</p>
              </div>
            </div>

            <UiTabs
              class="details__tabs"
              :tabs="tabs"
              v-model="selectedTab"
              type="line"
            ></UiTabs>

            <div
              class="details__info hide"
              :class="{ show: selectedTab.id === 1 }"
            >
              <p class="details__about">О туре</p>

              <p class="details__description">
                {{ tour.description || "Описание скоро появится." }}
              </p>

              <div v-if="highlights.length">
                <p class="details__text">Что вас ждет:</p>
                <ul class="details__list">
                  <li
                    v-for="highlight in highlights"
                    :key="highlight"
                    class="details__list-item"
                  >
                    {{ highlight }}
                  </li>
                </ul>
              </div>

              <div class="details__info-box">
                <p class="details__bold">Продолжительность</p>
                <p class="details__info-text">
                  {{ tour.duration || "Уточняется" }}
                </p>
              </div>

              <div
                v-if="displayDates.length"
                class="details__info-box details__info-box--start"
              >
                <p class="details__bold">Даты</p>
                <ul class="details__info-list">
                  <li
                    v-for="dateItem in displayDates"
                    :key="dateItem.key"
                    class="details__info-item"
                  >
                    {{ dateItem.label }}
                  </li>
                </ul>
              </div>

              <div class="details__location">
                <p class="details__bold">Место отправления</p>
                <p class="details__address">
                  {{ departureAddress }}
                </p>

                <div
                  style="width: 100%; height: 400px"
                  class="details__map"
                  ref="yandexMapInfo"
                ></div>
              </div>

              <div class="details__programma">
                <p class="details__bold">Программа тура</p>

                <ul class="details__programma-list">
                  <li
                    v-for="(step, index) in program"
                    :key="`${step.time}-${step.text}-${index}`"
                    class="details__programma-item"
                  >
                    <p class="details__time">{{ step.time }}</p>
                    <p class="details__programma-text">
                      {{ step.text }}
                    </p>
                  </li>
                </ul>
              </div>
            </div>

            <div
              class="details__road hide"
              :class="{ show: selectedTab.id === 2 }"
            >
              <section class="details__road-box">
                <h3 class="details__road-text">
                  Места, которые вы успеете посетить
                </h3>
                <div class="details__road-cards">
                  <TheToursPlaces
                    v-for="(place, index) in routePlaces"
                    :key="`${place.title}-${index}`"
                    :title="place.title"
                    :image="place.image"
                  ></TheToursPlaces>
                </div>
              </section>

              <section class="details__road-box">
                <h3 class="details__road-text">Карта тура</h3>
                <div
                  class="details__road-map"
                  :style="routeMapBackgroundStyle"
                  ref="yandexMapPath"
                ></div>
              </section>
            </div>

            <div
              class="details__tourist hide"
              :class="{ show: selectedTab.id === 3 }"
            >
              <div class="details__tourist-box">
                <p class="details__tourist-text">Что взять с собой?</p>
                <ul class="details__tourist-list">
                  <li
                    v-for="item in packingList"
                    :key="item"
                    class="details__tourist-item"
                  >
                    {{ item }}
                  </li>
                </ul>
              </div>

              <div class="details__tourist-box">
                <p class="details__tourist-text">
                  Рекомендации и важная информация
                </p>
                <ul class="details__tourist-list">
                  <li
                    v-for="item in recommendations"
                    :key="item"
                    class="details__tourist-item"
                  >
                    {{ item }}
                  </li>
                </ul>
              </div>

              <div class="details__tourist-box">
                <p class="details__tourist-text">Условия</p>
                <ul class="details__tourist-list details__tourist-list--icon">
                  <li
                    v-for="item in includes"
                    :key="`include-${item}`"
                    class="details__tourist-item details__tourist-item--icon"
                  >
                    <UiIcons
                      icon="star-unfill"
                      color="blue-500"
                      size="size-24"
                    ></UiIcons>
                    <p>{{ item }}</p>
                  </li>
                  <li
                    v-for="item in excludes"
                    :key="`exclude-${item}`"
                    class="details__tourist-item details__tourist-item--icon"
                  >
                    <UiIcons
                      icon="x-icon"
                      color="orange-200"
                      size="size-24"
                    ></UiIcons>
                    <p>{{ item }}</p>
                  </li>
                </ul>
              </div>
            </div>

            <div
              class="details__contacts hide"
              :class="{ show: selectedTab.id === 4 }"
            >
              <div class="details__contacts-box">
                <p class="details__contacts-text">Контакты</p>

                <div class="details__contacts-inner">
                  <div class="details__contacts-info">
                    <UiIcons
                      icon="globe"
                      color="blue-500"
                      size="size-24"
                    ></UiIcons>
                    <p class="details__contacts-desc">{{ contactWebsite }}</p>
                  </div>
                  <div class="details__contacts-info">
                    <UiIcons
                      icon="phone"
                      color="blue-500"
                      size="size-24"
                    ></UiIcons>
                    <p class="details__contacts-desc">{{ contactPhone }}</p>
                  </div>
                  <div class="details__contacts-info">
                    <UiIcons
                      icon="location"
                      color="blue-500"
                      size="size-24"
                    ></UiIcons>
                    <p class="details__contacts-desc">{{ contactAddress }}</p>
                  </div>
                  <div class="details__contacts-info">
                    <UiIcons
                      icon="instagram"
                      color="blue-500"
                      size="size-24"
                    ></UiIcons>
                    <p class="details__contacts-desc">{{ contactInstagram }}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <div class="details__totals">
            <div class="details__totals-header">
              <nuxt-link
                :to="`/partners/${tour?.partner?._id}`"
                class="details__totals-box"
              >
                <img
                  class="details__avatar"
                  :src="partnerAvatar"
                  :alt="partnerTitle"
                />
                <p class="details__name">{{ partnerTitle }}</p>
              </nuxt-link>
              <p class="details__baige">-{{ discountLabel }}%</p>
            </div>

            <Calendar
              class="details__calendar"
              v-model="date"
              inline
              :manualInput="false"
              :minDate="minSelectableDate"
              :maxDate="maxSelectableDate"
              :disabledDates="disabledCalendarDates"
            >
              <template #date="slotProps">
                <span
                  class="details__calendar-day"
                  :class="{
                    'details__calendar-day--available': availableDateKeys.has(
                      normalizeDateKey(slotProps.date),
                    ),
                  }"
                >
                  {{ slotProps.date.day }}
                </span>
              </template>
            </Calendar>
            <p v-if="selectedDateTimeRange" class="details__calendar-time">
              {{ selectedDateTimeRange }}
            </p>
            <p v-if="selectedDateAvailability" class="details__calendar-seats">
              Доступно мест: {{ selectedDateAvailableSeats }}
            </p>

            <p class="details__bold">Выберите билет</p>

            <div
              v-for="(ticket, index) in ticketTypes"
              :key="`${ticket.title}-${index}`"
              class="details__input-box"
            >
              <p class="details__input-name">{{ ticket.title }}</p>
              <p class="details__input-price">
                {{ formatMoney(ticket.price) }} ₸
              </p>
              <div class="details__input-inner">
                <button
                  type="button"
                  class="details__counter-btn"
                  @click="decrementTicket(index)"
                >
                  -
                </button>

                <UiInput
                  class="details__input"
                  :model-value="String(ticketQuantities[index] || 0)"
                  position="center"
                  disabled
                  :clearable="false"
                ></UiInput>

                <button
                  type="button"
                  class="details__counter-btn"
                  :disabled="!canIncreaseTicket(index)"
                  @click="incrementTicket(index)"
                >
                  +
                </button>
              </div>
            </div>

            <div class="details__input-box">
              <p class="details__bold">Промокод</p>
              <UiInput
                class="details__input details__input--bg"
                placeholder="Введите промокод"
                v-model.trim="promoCode"
              ></UiInput>
              <p class="details__accept" @click="applyPromo()">
                {{ isApplyingPromo ? "Проверяем..." : "Применить" }}
              </p>
              <p v-if="appliedPromo" class="details__promo-status">
                Промокод {{ appliedPromo.code }} применен
              </p>
              <p v-else-if="promoError" class="details__promo-error">
                {{ promoError }}
              </p>
            </div>

            <ul class="details__totals-list">
              <li class="details__totals-item">
                <p class="details__totals-answer">Всего:</p>
                <p class="details__totals-question">
                  {{ formatMoney(subtotal) }} ₸
                </p>
              </li>
              <li class="details__totals-item">
                <p class="details__totals-answer">Скидка:</p>
                <p
                  class="details__totals-question details__totals-question--discount"
                >
                  -{{ discountLabel }}%
                </p>
              </li>
              <li v-if="appliedPromo" class="details__totals-item">
                <p class="details__totals-answer">Промокод:</p>
                <p
                  class="details__totals-question details__totals-question--discount"
                >
                  -{{ formatMoney(promoDiscountAmount) }} ₸
                </p>
              </li>
              <li v-if="paymentMethod === 'bonus'" class="details__totals-item">
                <p class="details__totals-answer">Бонусы:</p>
                <p
                  class="details__totals-question details__totals-question--discount"
                >
                  -{{ formatMoney(bonusAmount) }} Б
                </p>
              </li>
              <li class="details__totals-item details__totals-item--result">
                <p class="details__totals-answer">Итого:</p>
                <p class="details__totals-question details__totals-question">
                  {{ formatMoney(totalToPay) }} ₸
                </p>
              </li>
            </ul>

            <UiButton
              :label="paymentActionLabel"
              class="details__totals-btn"
              :disabled="!selectedDateAvailability || !selectedGuests"
              @click="openPaymentModal"
            ></UiButton>
          </div>
        </div>
      </div>
      <section class="details__reviews">
        <div class="details__reviews-box">
          <div>
            <h3 class="details__reviews-title">Отзывы путешественников</h3>
            <div class="details__reviews-inner">
              <p class="details__reviews-count">{{ reviewsCountLabel }}</p>
              <UiIcons icon="star" color="yellow-500" size="size-14"></UiIcons>
              <p class="details__reviews-average">{{ ratingLabel }}</p>
            </div>
          </div>
          <nuxt-link
            class="details__reviews-link"
            :to="`/tours/${route.params.id}/reviews`"
            >Все отзывы</nuxt-link
          >
        </div>

        <div v-if="isReviewsLoading" class="details__reviews-empty">
          Загружаем отзывы...
        </div>

        <div v-else-if="reviewsErrorMessage" class="details__reviews-error">
          {{ reviewsErrorMessage }}
        </div>

        <UiSwiper
          v-else-if="tourReviews.length"
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
          <swiper-slide
            v-for="review in tourReviews"
            :key="review._id || `${review.createdAt}-${review.comment}`"
          >
            <TheCommonReview :review="review" :show-tour-meta="false" />
          </swiper-slide>
        </UiSwiper>

        <div v-else class="details__reviews-empty">Пока отзывов нет.</div>

        <UiButton
          v-if="canReviewTour"
          class="details__reviews-write"
          label="Оставить отзыв"
          @click="goTo(`/tours/${route.params.id}/reviews`)"
        ></UiButton>

        <UiButton
          class="details__reviews-btn"
          label="Все отзывы"
          after-icon="chevron"
          icon-size="size-20"
          icon-color="blue-500"
          @click="goTo(`/tours/${route.params.id}/reviews`)"
        ></UiButton>
      </section>
    </section>
  </UiOverlay>

  <UiModal
    :is-show="isOpenPayment"
    max-width="600px"
    @close="closePaymentModal"
  >
    <ModalsPayment
      :tour-title="tour.title"
      :date-label="selectedDateLabel"
      :items="selectedTicketItems"
      :discount-label="discountLabel"
      :promo-discount-amount="promoDiscountAmount"
      :bonus-amount="bonusAmount"
      :total="totalToPay"
      :payment-method="paymentMethod"
      :bonus-balance="wallet.bonusBalance"
      :is-loading="isSubmittingBooking"
      @update:payment-method="paymentMethod = $event"
      @payed="submitBooking('desktop')"
    />
  </UiModal>

  <UiModal
    :is-show="isOpenStatusPayment"
    max-width="600px"
    @close="closeStatusPaymentModal"
  >
    <ModalsStatus
      v-if="isOpenStatusPayment === 'success'"
      title="Бронирование оформлено"
      status="success"
      btn-label="Перейти в Мои туры"
      go-to="/profile/my-tours"
      @action="closeStatusPaymentModal"
    />
  </UiModal>

  <!-- Mobile -->

  <!-- Step 1 -->
  <UiPartialModal
    :is-show="isOpenPartialModalPayment"
    height="85%"
    @close="closePartialModalPayment"
  >
    <template #body>
      <div class="details__partial-payment-box">
        <p class="details__bold">Выберите дату</p>

        <Calendar
          class="details__calendar"
          v-model="date"
          inline
          :manualInput="false"
          :minDate="minSelectableDate"
          :maxDate="maxSelectableDate"
          :disabledDates="disabledCalendarDates"
        >
          <template #date="slotProps">
            <span
              class="details__calendar-day"
              :class="{
                'details__calendar-day--available': availableDateKeys.has(
                  normalizeDateKey(slotProps.date),
                ),
              }"
            >
              {{ slotProps.date.day }}
            </span>
          </template>
        </Calendar>
        <p v-if="selectedDateTimeRange" class="details__calendar-time">
          {{ selectedDateTimeRange }}
        </p>
        <p v-if="selectedDateAvailability" class="details__calendar-seats">
          Доступно мест: {{ selectedDateAvailableSeats }}
        </p>

        <p class="details__bold">Выберите билет</p>

        <div
          v-for="(ticket, index) in ticketTypes"
          :key="`${ticket.title}-${index}-mobile`"
          class="details__input-box"
        >
          <p class="details__input-name">{{ ticket.title }}</p>
          <p class="details__input-price">{{ formatMoney(ticket.price) }} ₸</p>
          <div class="details__input-inner">
            <button
              type="button"
              class="details__counter-btn"
              @click="decrementTicket(index)"
            >
              -
            </button>

            <UiInput
              class="details__input"
              :model-value="String(ticketQuantities[index] || 0)"
              disabled
              :clearable="false"
            ></UiInput>

            <button
              type="button"
              class="details__counter-btn"
              :disabled="!canIncreaseTicket(index)"
              @click="incrementTicket(index)"
            >
              +
            </button>
          </div>
        </div>
        <div class="details__input-box">
          <p class="details__bold">Промокод</p>
          <UiInput
            class="details__input details__input--bg"
            placeholder="Введите промокод"
            v-model.trim="promoCode"
          ></UiInput>
          <p class="details__accept" @click="applyPromo()">
            {{ isApplyingPromo ? "Проверяем..." : "Применить" }}
          </p>
          <p v-if="appliedPromo" class="details__promo-status">
            Промокод {{ appliedPromo.code }} применен
          </p>
          <p v-else-if="promoError" class="details__promo-error">
            {{ promoError }}
          </p>
        </div>

        <ul class="details__totals-list">
          <li class="details__totals-item">
            <p class="details__totals-answer">Всего:</p>
            <p class="details__totals-question">
              {{ formatMoney(subtotal) }} ₸
            </p>
          </li>
          <li class="details__totals-item">
            <p class="details__totals-answer">Скидка:</p>
            <p
              class="details__totals-question details__totals-question--discount"
            >
              -{{ discountLabel }}%
            </p>
          </li>
          <li v-if="appliedPromo" class="details__totals-item">
            <p class="details__totals-answer">Промокод:</p>
            <p
              class="details__totals-question details__totals-question--discount"
            >
              -{{ formatMoney(promoDiscountAmount) }} ₸
            </p>
          </li>
          <li v-if="paymentMethod === 'bonus'" class="details__totals-item">
            <p class="details__totals-answer">Бонусы:</p>
            <p
              class="details__totals-question details__totals-question--discount"
            >
              -{{ formatMoney(bonusAmount) }} Б
            </p>
          </li>
          <li class="details__totals-item details__totals-item--result">
            <p class="details__totals-answer">Итого:</p>
            <p class="details__totals-question details__totals-question">
              {{ formatMoney(totalToPay) }} ₸
            </p>
          </li>
        </ul>

        <UiButton
          class="details__partial-payment-btn"
          :label="paymentActionLabel"
          :disabled="!selectedDateAvailability || !selectedGuests"
          @click="openOverlayPayment"
        ></UiButton>
      </div>
    </template>
  </UiPartialModal>

  <!-- Step 2 -->
  <UiOverlay
    :is-show="isOpenOverlayPayment"
    title="Подтверждение бронирования"
    @close="closeOverlayPayment"
    :btn-label="paymentActionLabel"
    :show-header-icons="false"
    @action="submitBooking('mobile')"
  >
    <div class="overlay-payment">
      <div class="overlay-payment__wrapper">
        <div class="overlay-payment__preview">
          <img
            class="overlay-payment__img"
            :src="coverImage"
            :alt="tour.title"
          />
          <h2 class="overlay-payment__title title">
            {{ tour.title }}
          </h2>
        </div>
        <table class="overlay-payment__table">
          <tbody>
            <tr class="overlay-payment__tr">
              <td class="overlay-payment__td">Дата</td>
              <td class="overlay-payment__td">{{ selectedDateLabel }}</td>
            </tr>
            <tr class="overlay-payment__tr overlay-payment__tr--blue">
              <td>Ваши билеты</td>
            </tr>
            <tr
              v-for="(ticket, index) in selectedTicketItems"
              :key="`${ticket.title}-${index}-checkout`"
              class="overlay-payment__tr"
            >
              <td class="overlay-payment__td">{{ ticket.title }}</td>
              <td class="overlay-payment__td">
                {{ ticket.quantity }} x {{ formatMoney(ticket.price) }} ₸
              </td>
            </tr>
            <tr class="overlay-payment__tr overlay-payment__tr--padding">
              <td class="overlay-payment__td payment__td--bold">Скидка</td>
              <td class="overlay-payment__td">-{{ discountLabel }}%</td>
            </tr>
            <tr class="overlay-payment__tr">
              <td class="overlay-payment__td overlay-payment__td--bold">
                Промокод
              </td>
              <td class="overlay-payment__td">
                -{{ formatMoney(promoDiscountAmount) }} ₸
              </td>
            </tr>
            <tr v-if="paymentMethod === 'bonus'" class="overlay-payment__tr">
              <td class="overlay-payment__td overlay-payment__td--bold">
                Бонусы
              </td>
              <td class="overlay-payment__td">
                -{{ formatMoney(bonusAmount) }} Б
              </td>
            </tr>
            <tr class="overlay-payment__tr overlay-payment__tr--padding">
              <td class="overlay-payment__td overlay-payment__td--bold">
                Итого
              </td>
              <td class="overlay-payment__td">
                {{ formatMoney(totalToPay) }} ₸
              </td>
            </tr>
            <tr class="overlay-payment__tr overlay-payment__tr--blue">
              <td>Способ оплаты</td>
            </tr>
            <tr class="overlay-payment__tr">
              <td class="overlay-payment__td overlay-payment__td--box">
                <UiCheckbox
                  :options="[
                    { label: 'Банковская карта', value: 'card' },
                    { label: 'Оплатить бонусами', value: 'bonus' },
                  ]"
                  :model-value="paymentMethod"
                  @update:model-value="paymentMethod = $event?.value || $event"
                  type="checkmark"
                ></UiCheckbox>
              </td>
              <td class="overlay-payment__td"></td>
            </tr>
          </tbody>
        </table>
        <p v-if="paymentMethod === 'bonus'" class="overlay-payment__bonus-note">
          Доступно бонусов: {{ formatMoney(wallet.bonusBalance) }} Б
        </p>
      </div>
    </div>
  </UiOverlay>

  <!-- Step 3 -->
  <UiModal
    :is-show="isOpenMobileStatusPayment"
    max-width="600px"
    @close="closeMobileStatusPayment"
    :full-screen="true"
  >
    <ModalsStatus
      title="Бронирование оформлено"
      status="success"
      btn-label="Перейти в Мои туры"
      go-to="/profile/my-tours"
      @action="closeMobileStatusPayment"
    />
  </UiModal>
</template>

<script setup>
import partnerPlaceholder from "@/assets/image/common/tour-avatar.png";
import tourPlaceholder from "@/assets/image/content/main-image.png";

const route = useRoute();
const api = useApi();
const authStore = useAuthStore();
const favouritesStore = useFavouritesStore();
const { createMap } = useYandexMaps();

const isOpenPayment = ref(false);
const isOpenStatusPayment = ref(null);
const isOpenPartialModalPayment = ref(false);
const isOpenOverlayPayment = ref(false);
const isOpenMobileStatusPayment = ref(null);

const yandexMapInfo = ref(null);
const yandexMapPath = ref(null);
const infoMap = shallowRef(null);
const pathMap = shallowRef(null);

const tabs = reactive([
  { id: 1, name: "О туре" },
  { id: 2, name: "Маршрут" },
  { id: 3, name: "Для туристов" },
  { id: 4, name: "Контакты" },
]);
const selectedTab = ref(tabs[0]);
const tourReviews = ref([]);
const isReviewsLoading = ref(false);
const reviewsErrorMessage = ref("");

const canReviewTour = ref(false);

const loadTourReviews = async () => {
  isReviewsLoading.value = true;
  reviewsErrorMessage.value = "";

  try {
    const response = await api.client({
      url: `/tour-reviews/tour/${route.params.id}`,
      method: "get",
      query: { limit: 6 },
    });

    tourReviews.value = Array.isArray(response?.data) ? response.data : [];
  } catch (error) {
    tourReviews.value = [];
    reviewsErrorMessage.value =
      error?.message || "Не удалось загрузить отзывы.";
  } finally {
    isReviewsLoading.value = false;
  }
};

const loadCanReviewTour = async () => {
  if (!authStore.isLoggedIn) {
    canReviewTour.value = false;
    return;
  }

  try {
    const response = await api.client({
      url: `/tour-reviews/can-review/${route.params.id}`,
      method: "get",
    });

    canReviewTour.value = Boolean(response?.data?.canReview);
  } catch {
    canReviewTour.value = false;
  }
};

const response = await useFetchSsr({
  url: `/tours/${route.params.id}`,
  method: "get",
});

const tour = ref(response?.data || {});
const wallet = ref({
  bonusBalance: 0,
});
const paymentMethod = ref("card");
const promoCode = ref("");
const appliedPromo = ref(null);
const promoError = ref("");
const isApplyingPromo = ref(false);
const isSubmittingBooking = ref(false);

useSeo({
  title: tour.value?.title,
  description: tour.value?.description,
});

const normalizeString = (value) => String(value || "").trim();

const normalizeStringList = (value) =>
  Array.isArray(value)
    ? value.map((item) => normalizeString(item)).filter(Boolean)
    : [];

const normalizeObjectList = (value) =>
  Array.isArray(value)
    ? value.filter((item) => item && typeof item === "object")
    : [];

const parseDateValue = (value) => {
  if (!value) {
    return null;
  }

  if (
    typeof value === "object" &&
    "year" in value &&
    "month" in value &&
    "day" in value
  ) {
    const parsed = new Date(
      Number(value.year),
      Number(value.month),
      Number(value.day),
    );
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const text = normalizeString(value);
  if (!text) {
    return null;
  }

  if (text.includes(".")) {
    const [day, month, year] = text.split(".");
    if (!day || !month || !year) {
      return null;
    }

    const parsed = new Date(`${year}-${month}-${day}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDateLabel = (value) => {
  const parsed = parseDateValue(value);

  if (!parsed) {
    return normalizeString(value);
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
};

const normalizeDateKey = (value) => {
  if (
    value &&
    typeof value === "object" &&
    "year" in value &&
    "month" in value &&
    "day" in value
  ) {
    return [
      Number(value.year),
      String(Number(value.month) + 1).padStart(2, "0"),
      String(Number(value.day)).padStart(2, "0"),
    ].join("-");
  }

  const parsed = parseDateValue(value);

  if (!parsed) {
    return normalizeString(value);
  }

  return [
    parsed.getFullYear(),
    String(parsed.getMonth() + 1).padStart(2, "0"),
    String(parsed.getDate()).padStart(2, "0"),
  ].join("-");
};

const formatTimeRange = (item) => {
  const from = normalizeString(item?.timeFrom);
  const to = normalizeString(item?.timeTo);

  if (!from && !to) {
    return "";
  }

  return [from, to].filter(Boolean).join(" - ");
};

const formatMoney = (value) => Number(value || 0).toLocaleString("ru-RU");

const galleryImages = computed(() => {
  const images = [tour.value?.avatar, ...(tour.value?.images || [])].filter(
    Boolean,
  );
  return images.length ? [...new Set(images)] : [tourPlaceholder];
});

const coverImage = computed(() => galleryImages.value[0] || tourPlaceholder);
const partnerTitle = computed(
  () => tour.value?.partner?.title || "FlyAway Partner",
);
const partnerAvatar = computed(
  () =>
    tour.value?.partner?.logo ||
    tour.value?.partner?.avatar ||
    partnerPlaceholder,
);
const ratingLabel = computed(() => {
  const rating =
    Number(tour.value?.rating) || Number(tour.value?.partner?.rating) || 0;
  return rating.toFixed(1).replace(".", ",");
});
const reviewsCountValue = computed(
  () => Number(tour.value?.reviewsCount || 0) || tourReviews.value.length || 0,
);
const reviewsCountLabel = computed(() => {
  const count = reviewsCountValue.value;
  const lastTwo = count % 100;
  const last = count % 10;

  if (lastTwo >= 11 && lastTwo <= 14) {
    return `${count} отзывов`;
  }

  if (last === 1) {
    return `${count} отзыв`;
  }

  if (last >= 2 && last <= 4) {
    return `${count} отзыва`;
  }

  return `${count} отзывов`;
});
const highlights = computed(() => normalizeStringList(tour.value?.highlights));
const routePlaces = computed(() => {
  return normalizeObjectList(tour.value?.routePlaces)
    .map((item) => ({
      title: normalizeString(item?.title),
      image: normalizeString(item?.image),
    }))
    .filter((item) => item.title || item.image);
});
const packingList = computed(() =>
  normalizeStringList(tour.value?.packingList),
);
const recommendations = computed(() =>
  normalizeStringList(tour.value?.recommendations),
);
const includes = computed(() => normalizeStringList(tour.value?.includes));
const excludes = computed(() => normalizeStringList(tour.value?.excludes));
const program = computed(() => {
  return normalizeObjectList(tour.value?.program)
    .map((item) => ({
      time: normalizeString(item?.time) || "Время",
      text: normalizeString(item?.text),
    }))
    .filter((item) => item.time || item.text);
});

const contactWebsite = computed(
  () =>
    tour.value?.contacts?.website ||
    tour.value?.partner?.contacts?.website ||
    tour.value?.partner?.website ||
    "-",
);
const contactPhone = computed(
  () =>
    tour.value?.contacts?.phone ||
    tour.value?.partner?.contacts?.phone ||
    tour.value?.partner?.phone ||
    "-",
);
const contactAddress = computed(
  () =>
    tour.value?.contacts?.address ||
    tour.value?.partner?.contacts?.address ||
    tour.value?.partner?.address ||
    "-",
);
const contactInstagram = computed(
  () =>
    tour.value?.contacts?.instagram ||
    tour.value?.partner?.contacts?.instagram ||
    tour.value?.partner?.instagram ||
    "-",
);

const departureAddress = computed(() => {
  const address = [
    normalizeString(tour.value?.departureCity),
    normalizeString(tour.value?.departurePoint),
  ]
    .filter(Boolean)
    .join(", ");

  return (
    address ||
    normalizeString(tour.value?.departureLocation?.address) ||
    normalizeString(tour.value?.departureLocation?.label) ||
    "-"
  );
});

const availabilityDates = computed(() =>
  normalizeObjectList(tour.value?.availabilityDates),
);
const dateDetails = computed(() =>
  normalizeObjectList(tour.value?.dateDetails),
);

const displayDates = computed(() => {
  const detailMap = new Map(
    dateDetails.value.map((item) => [normalizeDateKey(item?.date), item]),
  );
  const availabilityMap = new Map(
    availabilityDates.value.map((item) => [normalizeDateKey(item?.date), item]),
  );
  const sourceDates = [
    ...availabilityDates.value.map((item) => item?.date),
    ...dateDetails.value.map((item) => item?.date),
    ...(tour.value?.dates || []),
  ]
    .map((item) => normalizeString(item))
    .filter(Boolean);

  return [...new Set(sourceDates)].map((dateValue, index) => {
    const detail = detailMap.get(normalizeDateKey(dateValue));
    const availability = availabilityMap.get(normalizeDateKey(dateValue));
    const parts = [
      formatDateLabel(dateValue),
      formatTimeRange(availability),
      normalizeString(detail?.text),
    ].filter(Boolean);

    return {
      key: `${normalizeDateKey(dateValue)}-${index}`,
      label: parts.join(" • "),
    };
  });
});

const firstAvailableDate = computed(() => {
  return (
    availabilityDates.value.find((item) => normalizeString(item?.date))?.date ||
    dateDetails.value.find((item) => normalizeString(item?.date))?.date ||
    tour.value?.dates?.[0] ||
    null
  );
});

const date = ref(parseDateValue(firstAvailableDate.value) || new Date());
const availableDateKeys = computed(() => {
  const source = availabilityDates.value.length
    ? availabilityDates.value.map((item) => item?.date)
    : [
        ...dateDetails.value.map((item) => item?.date),
        ...(Array.isArray(tour.value?.dates) ? tour.value.dates : []),
      ];

  return new Set(source.map((item) => normalizeDateKey(item)).filter(Boolean));
});

const selectableDates = computed(() => {
  return [...availableDateKeys.value]
    .map((item) => parseDateValue(item))
    .filter(Boolean)
    .sort((left, right) => left.getTime() - right.getTime());
});

const minSelectableDate = computed(() => selectableDates.value[0] || null);
const maxSelectableDate = computed(
  () => selectableDates.value[selectableDates.value.length - 1] || null,
);

const disabledCalendarDates = computed(() => {
  if (!minSelectableDate.value || !maxSelectableDate.value) {
    return [];
  }

  const disabled = [];
  const current = new Date(minSelectableDate.value);

  while (current <= maxSelectableDate.value) {
    const key = normalizeDateKey(current);

    if (!availableDateKeys.value.has(key)) {
      disabled.push(new Date(current));
    }

    current.setDate(current.getDate() + 1);
  }

  return disabled;
});

watch(
  firstAvailableDate,
  (value) => {
    const parsed = parseDateValue(value);

    if (parsed) {
      date.value = parsed;
    }
  },
  { immediate: true },
);

const selectedDateAvailability = computed(() => {
  const selectedKey = normalizeDateKey(date.value);
  return (
    availabilityDates.value.find(
      (item) => normalizeDateKey(item?.date) === selectedKey,
    ) || null
  );
});

const selectedDateLabel = computed(() => {
  return formatDateLabel(date.value) || "Дата уточняется";
});

const selectedDateTimeRange = computed(() => {
  const range = formatTimeRange(selectedDateAvailability.value);
  return range ? `Время: ${range}` : "";
});

const selectedDateAvailableSeats = computed(() => {
  const seats = Math.max(0, Number(selectedDateAvailability.value?.seats) || 0);
  const bookedSeats = Math.max(
    0,
    Number(selectedDateAvailability.value?.bookedSeats) || 0,
  );

  return Math.max(0, seats - bookedSeats);
});

const ticketTypes = computed(() => {
  const items = normalizeObjectList(tour.value?.ticketTypes)
    .map((item) => ({
      title: normalizeString(item?.title),
      subtitle: normalizeString(item?.subtitle),
      price: Number(item?.price) || 0,
    }))
    .filter((item) => item.title || item.subtitle || item.price);

  return items.length
    ? items
    : [
        {
          title: "Стандартный билет",
          subtitle: "",
          price: Number(tour.value?.price) || 0,
        },
      ];
});
const ticketQuantities = ref([]);

const discountLabel = computed(() =>
  Math.max(0, Number(tour.value?.discount) || 0),
);

watch(
  ticketTypes,
  (items) => {
    ticketQuantities.value = items.map(
      (_, index) => Number(ticketQuantities.value[index]) || 0,
    );
  },
  { immediate: true },
);

const selectedTicketItems = computed(() => {
  return ticketTypes.value
    .map((ticket, index) => ({
      ...ticket,
      quantity: Math.max(0, Number(ticketQuantities.value[index]) || 0),
    }))
    .filter((item) => item.quantity > 0);
});

const selectedGuests = computed(() => {
  return selectedTicketItems.value.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0,
  );
});

const subtotal = computed(() => {
  return selectedTicketItems.value.reduce(
    (total, item) => total + item.quantity * item.price,
    0,
  );
});

const tourDiscountAmount = computed(() => {
  return Math.round((subtotal.value * discountLabel.value) / 100);
});

const promoDiscountAmount = computed(() => {
  return Number(appliedPromo.value?.discountAmount) || 0;
});

const totalBeforeBonus = computed(() => {
  return Math.max(
    0,
    subtotal.value - tourDiscountAmount.value - promoDiscountAmount.value,
  );
});

const bonusAmount = computed(() => {
  if (paymentMethod.value !== "bonus") {
    return 0;
  }

  return Math.min(
    Math.max(0, Number(wallet.value?.bonusBalance) || 0),
    totalBeforeBonus.value,
  );
});

const totalToPay = computed(() => {
  return Math.max(0, totalBeforeBonus.value - bonusAmount.value);
});

const paymentActionLabel = computed(() =>
  paymentMethod.value === "bonus"
    ? "Списать бонусы и забронировать"
    : "Оформить бронь",
);

const isFavourite = computed(() =>
  favouritesStore.isFavourite(tour.value?._id),
);

watch(
  selectedDateAvailableSeats,
  (availableSeats) => {
    const seatsLeft = Math.max(0, Number(availableSeats) || 0);
    let remaining = seatsLeft;

    ticketQuantities.value = ticketTypes.value.map((_, index) => {
      const nextValue = Math.min(
        Math.max(0, Number(ticketQuantities.value[index]) || 0),
        remaining,
      );
      remaining -= nextValue;
      return nextValue;
    });
  },
  { immediate: true },
);

watch(subtotal, async (value, previousValue) => {
  if (value === previousValue || !appliedPromo.value || !promoCode.value) {
    return;
  }

  await applyPromo({ silent: true });
});

const canIncreaseTicket = (index) => {
  return selectedGuests.value < selectedDateAvailableSeats.value;
};

const incrementTicket = (index) => {
  if (!canIncreaseTicket(index)) {
    return;
  }

  ticketQuantities.value[index] =
    Math.max(0, Number(ticketQuantities.value[index]) || 0) + 1;
};

const decrementTicket = (index) => {
  ticketQuantities.value[index] = Math.max(
    0,
    (Number(ticketQuantities.value[index]) || 0) - 1,
  );
};

const getBookingPayload = () => {
  return {
    availabilityDateId: selectedDateAvailability.value?._id,
    date: normalizeString(selectedDateAvailability.value?.date),
    timeFrom: normalizeString(selectedDateAvailability.value?.timeFrom),
    timeTo: normalizeString(selectedDateAvailability.value?.timeTo),
    ticketSelections: ticketTypes.value.map((ticket, index) => ({
      title: ticket.title,
      price: ticket.price,
      quantity: Math.max(0, Number(ticketQuantities.value[index]) || 0),
    })),
    promoCode: appliedPromo.value?.code || "",
    paymentMethod: paymentMethod.value,
  };
};

const applyPromo = async ({ silent = false } = {}) => {
  if (!promoCode.value.trim()) {
    appliedPromo.value = null;
    promoError.value = silent ? "" : "Введите промокод";
    return;
  }

  if (!subtotal.value) {
    appliedPromo.value = null;
    promoError.value = silent ? "" : "Сначала выберите билет";
    return;
  }

  isApplyingPromo.value = true;
  promoError.value = "";

  try {
    const response = await api.client({
      url: "/promocodes/preview",
      method: "post",
      data: {
        code: promoCode.value.trim(),
        subtotal: Math.max(0, subtotal.value - tourDiscountAmount.value),
        tourId: tour.value?._id,
      },
    });

    appliedPromo.value = response?.data || null;
  } catch (error) {
    appliedPromo.value = null;
    promoError.value = error?.message || "Промокод не подошел";
  } finally {
    isApplyingPromo.value = false;
  }
};

const toggleFavourite = async () => {
  if (!authStore.isLoggedIn) {
    authStore.openAuthModalLogin();
    return;
  }

  try {
    await favouritesStore.toggleFavourite(tour.value);
  } catch (error) {
    console.error("[TourDetails] favourite toggle error", error);
  }
};

const fetchWallet = async () => {
  if (!authStore.isLoggedIn) {
    wallet.value = { bonusBalance: 0 };
    return;
  }

  try {
    const response = await api.client({
      url: "/personal-cabinet/wallet",
      method: "get",
    });

    wallet.value = response?.data || { bonusBalance: 0 };
  } catch {
    wallet.value = { bonusBalance: 0 };
  }
};

const submitBooking = async (origin = "desktop") => {
  if (!authStore.isLoggedIn) {
    authStore.openAuthModalLogin();
    return;
  }

  if (!normalizeString(selectedDateAvailability.value?.date)) {
    promoError.value = "Выберите доступную дату";
    return;
  }

  if (!selectedGuests.value) {
    promoError.value = "Выберите хотя бы один билет";
    return;
  }

  isSubmittingBooking.value = true;

  try {
    const response = await api.client({
      url: `/tours/${route.params.id}/book-date`,
      method: "post",
      data: getBookingPayload(),
    });

    if (response?.data?.tour) {
      tour.value = response.data.tour;
    }

    if (response?.data?.wallet) {
      wallet.value = {
        ...wallet.value,
        ...response.data.wallet,
      };
    }

    isOpenPayment.value = false;
    isOpenOverlayPayment.value = false;
    isOpenPartialModalPayment.value = false;

    if (origin === "mobile") {
      isOpenMobileStatusPayment.value = true;
    } else {
      isOpenStatusPayment.value = "success";
    }
  } catch (error) {
    promoError.value = error?.message || "Не удалось оформить бронирование";
  } finally {
    isSubmittingBooking.value = false;
  }
};

const routeMapBackgroundStyle = computed(() => {
  const image = normalizeString(tour.value?.routeMapImage);

  if (!image) {
    return {};
  }

  return {
    backgroundImage: `url(${image})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };
});

const mapCenter = computed(() => {
  const x = Number(tour.value?.departureLocation?.x);
  const y = Number(tour.value?.departureLocation?.y);

  if (Number.isFinite(x) && Number.isFinite(y)) {
    return [x, y];
  }

  return [76.889709, 43.238949];
});

const destroyMap = (mapRef) => {
  if (mapRef.value && typeof mapRef.value.destroy === "function") {
    mapRef.value.destroy();
  }

  mapRef.value = null;
};

const mountInfoMap = async () => {
  if (!yandexMapInfo.value || infoMap.value) {
    return;
  }

  try {
    infoMap.value = await createMap({
      container: yandexMapInfo.value,
      center: mapCenter.value,
      zoom: 12,
      markerCoordinates: mapCenter.value,
      markerText:
        departureAddress.value === "-"
          ? tour.value?.title
          : departureAddress.value,
    });
  } catch (error) {
    console.error(error);
  }
};

const mountPathMap = async () => {
  if (
    normalizeString(tour.value?.routeMapImage) ||
    !yandexMapPath.value ||
    pathMap.value
  ) {
    return;
  }

  try {
    pathMap.value = await createMap({
      container: yandexMapPath.value,
      center: mapCenter.value,
      zoom: 10,
      markerCoordinates: mapCenter.value,
      markerText: tour.value?.title || "Маршрут тура",
    });
  } catch (error) {
    console.error(error);
  }
};

watch(
  () => selectedTab.value?.id,
  async (tabId) => {
    await nextTick();

    if (tabId === 1) {
      await mountInfoMap();
    }

    if (tabId === 2) {
      await mountPathMap();
    }
  },
);

watch(
  () => authStore.isLoggedIn,
  async () => {
    await loadCanReviewTour();
  },
);

await Promise.allSettled([
  favouritesStore.fetchFavourites(),
  fetchWallet(),
  loadTourReviews(),
  loadCanReviewTour(),
]);

onMounted(() => {
  mountInfoMap();
});

onBeforeUnmount(() => {
  destroyMap(infoMap);
  destroyMap(pathMap);
});

const closePartialModalPayment = () => {
  isOpenPartialModalPayment.value = false;
};

const openPartialModalPayment = () => {
  isOpenPartialModalPayment.value = true;
};

const openMobileStatusPayment = () => {
  isOpenPartialModalPayment.value = false;
  isOpenMobileStatusPayment.value = true;
};

const closeMobileStatusPayment = () => {
  isOpenMobileStatusPayment.value = false;
};

const closeOverlayPayment = () => {
  isOpenOverlayPayment.value = false;
};

const openOverlayPayment = () => {
  if (!selectedGuests.value) {
    promoError.value = "Выберите хотя бы один билет";
    return;
  }

  isOpenPartialModalPayment.value = false;
  isOpenOverlayPayment.value = true;
};

const closeStatusPaymentModal = () => {
  isOpenStatusPayment.value = null;
};

const openPaymentModal = () => {
  if (!selectedGuests.value) {
    promoError.value = "Выберите хотя бы один билет";
    return;
  }

  isOpenPayment.value = true;
};

const closePaymentModal = () => {
  isOpenPayment.value = false;
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
  &__reviews-empty {
    padding: 16px;
    border-radius: 12px;
    background: rgba($red-500, 0.04);
    color: $surface-500;
  }
  &__reviews-error {
    padding: 16px;
    border-radius: 12px;
    background: rgba($orange-200, 0.08);
    color: $orange-200;
    font-weight: 600;
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
  &__calendar-time {
    margin-top: -8px;
    color: $red-500;
    font-size: 14px;
    font-weight: 400;
  }
  &__calendar-seats {
    margin-top: -6px;
    color: $surface-500;
    font-size: 13px;
  }
  &__totals {
    background-color: $white;
    border-radius: 16px;
    padding: 16px;
    max-width: 360px;
    width: 100%;
  }
  &__header {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: center;
  }
  &__title {
    &--mobile {
      display: none;
    }
    color: $red-500;
    max-width: 590px;
  }
  &__icons {
    display: flex;
    gap: 12px;
    align-items: center;
    &--mobile {
      display: none;
    }
    &-box {
      display: flex;
      gap: 6px;
      align-items: center;
    }
  }
  &__favorite {
    width: 36px;
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    // background: rgba($blue-500, 0.08);
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
  &__info {
    display: flex;
    flex-direction: column;
    gap: 16px;
    color: $surface-900;
    &-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    &-box {
      display: flex;
      gap: 6px;
      align-items: center;
      &--start {
        align-items: flex-start;
      }
    }
    &__list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    &-item {
      color: $red-500;
      font-weight: 400;
    }
  }
  &__bold {
    font-weight: 400;
    position: relative;
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
  &__list-item {
    list-style: disc;
    margin-left: 26px;
  }
  &__location {
    display: flex;
    flex-direction: column;
    gap: 4px;
    position: relative;
  }
  &__calendar-day {
    width: 100%;
    height: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;

    &--available {
      background: rgba($red-500, 0.08);
      // color: $red-500;
      font-weight: 700;
    }
  }
  &__map {
    max-width: 300px;
    width: 100%;
    max-height: 120px;
    border-radius: 16px;
  }
  &__programma {
    &-list {
      display: flex;
      flex-direction: column;
      margin: 12px 0;
      gap: 6px;
    }
    &-item {
      display: flex;
      align-items: center;
      gap: 10px;
      color: $red-500;
    }
    &-text {
      color: $surface-900;
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
    &-btn {
      display: none;
    }
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
      display: grid;
      grid-template-columns: repeat(4, 1fr);
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
    color: $black;
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
  &__partial {
    &-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    &-count {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    &-payment {
      &-box {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      &-btn {
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: $red-500;
        color: $white;
        padding: 10px;
        margin-top: 12px;
        font-weight: 700;
      }
    }
    &-title {
      font-size: 16px;
    }
    &-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    &-item {
      list-style: disc;
      margin-left: 15px;
      font-size: 12px;
    }
    &-btn {
      border: 1px solid $red-500;
      background-color: transparent;
      color: $red-500;
      font-weight: 400;
      width: 100%;
      padding: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  &__swiper {
    &-img {
      border-radius: 12px;
      object-fit: cover;
      max-height: 400px;
      margin: 0 auto;
      display: flex;
      justify-content: center;
      align-items: center;
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
  &__counter-btn {
    width: 30px;
    height: 30px;
    flex: 0 0 30px;
    border-radius: 999px;
    border: 1px solid rgba($surface-300, 0.9);
    color: $surface-900;
    background: $white;
    font-size: 18px;
    font-weight: 700;
    transition:
      color 0.2s ease,
      border-color 0.2s ease,
      opacity 0.2s ease;

    &:hover {
      color: $red-500;
      border-color: rgba($red-500, 0.45);
    }

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
  }
  &__accept {
    color: $red-500;
    font-size: 14px;
    font-weight: 400;
    cursor: pointer;
  }
  &__promo-status {
    color: $green-400;
    font-size: 13px;
    font-weight: 600;
  }
  &__promo-error {
    color: $orange-200;
    font-size: 13px;
    font-weight: 600;
  }
  &__road {
    display: flex;
    flex-direction: column;
    gap: 44px;
    position: relative;
    &-text {
      margin-bottom: 16px;
      font-size: 16px;
    }
    &-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      align-items: center;
    }
    &-map {
      max-width: 812px;
      width: 100%;
      height: 430px;
      border-radius: 16px;
      max-height: 430px;
      overflow: hidden;
    }
  }
  &__tourist {
    display: flex;
    flex-direction: column;
    gap: 16px;
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

.overlay-payment {
  &__methods {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 8px;
  }

  &__method {
    width: 100%;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 14px;
    border: 1px solid rgba($surface-300, 0.5);
    background: $white;
    text-align: left;
    transition:
      border-color 0.2s ease,
      background-color 0.2s ease;

    &--active {
      border-color: rgba($red-500, 0.5);
      background: rgba($red-500, 0.05);
    }
  }

  &__method-radio {
    width: 18px;
    height: 18px;
    flex: 0 0 18px;
    margin-top: 2px;
    border-radius: 999px;
    border: 2px solid rgba($surface-300, 0.9);
    position: relative;
  }

  &__method--active &__method-radio {
    border-color: $red-500;
  }

  &__method--active &__method-radio::after {
    content: "";
    position: absolute;
    inset: 3px;
    border-radius: 999px;
    background: $red-500;
  }

  &__method-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__method-label {
    color: $surface-900;
    font-size: 14px;
    font-weight: 700;
  }

  &__method-hint {
    color: $surface-500;
    font-size: 13px;
    line-height: 1.4;
  }

  &__bonus-note,
  &__card-note {
    margin-top: 12px;
    padding: 12px 14px;
    border-radius: 12px;
    font-size: 13px;
    line-height: 1.45;
  }

  &__bonus-note {
    color: $red-500;
    background: rgba($red-500, 0.06);
    font-weight: 600;
  }

  &__card-note {
    color: $surface-500;
    background: rgba($surface-300, 0.08);
  }
}

.hide {
  display: none;
}
.show {
  display: flex;
}

.details .details__imgs :deep(.custom-swiper::part(pagination)) {
  position: absolute !important;
}

.details__reviews-empty {
  padding: 16px;
  border-radius: 12px;
  background: rgba($red-500, 0.04);
  color: $surface-500;
}

.details__reviews-write {
  width: fit-content;
}

.overlay-payment {
  &__wrapper {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  &__preview {
    width: 100%;
  }
  &__img {
    width: 100%;
    height: 137px;
    object-fit: cover;
    border-radius: 16px;
    margin: 0 auto;
  }
  &__table {
    color: $surface-900;
    font-size: 14px;
  }
  &__tr &__td:last-child {
    text-align: right;
    font-weight: 400;
    white-space: nowrap;
  }
  &__td {
    font-weight: 100;
    padding-top: 4px;
    font-size: 14px;

    &--bold {
      font-weight: 400;
    }
    &-img {
      width: 80px;
      margin-left: 28px;
    }
    &--box {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
  }
  &__tr {
    &--padding td {
      padding-top: 24px;
    }
    &--blue {
      color: $red-500;
      font-weight: 400;
      & td {
        padding-top: 16px;
      }
    }
  }
  &__bonus-note {
    color: $red-500;
    font-size: 13px;
    font-weight: 600;
  }
}

@media (max-width: 768px) {
  .details {
    &__box {
      flex-direction: column;
    }
    &__totals {
      max-width: 100%;
    }
  }
}

@media (max-width: 375px) {
  .details {
    &__wrapper {
      margin-top: 0;
    }
    &__content {
      padding: 0;
      background-color: transparent;
      flex-direction: column;
      gap: 16px;
    }
    &__totals {
      &-header {
        &--mobile {
          display: flex;
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
    &__go-back {
      display: none;
    }
    &__road {
      &-cards {
        overflow-x: scroll;
      }
      &-map {
        max-height: 175px;
        border-radius: 16px;
      }
    }
    &__title {
      &--mobile {
        display: block;
        color: $surface-900;
        line-height: 30px;
      }
    }
    &__icons {
      &--mobile {
        display: flex;
      }
    }
    &__contacts {
      &-inner {
        grid-template-columns: repeat(2, 1fr);
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
