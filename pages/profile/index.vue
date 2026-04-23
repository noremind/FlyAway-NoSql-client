<template>
  <div class="profile-main">
    <div class="profile-main__wrapper">
      <section class="profile-main__card profile-main__card--account">
        <div class="profile-main__account-head">
          <div class="profile-main__avatar-box">
            <img
              v-if="avatar"
              class="profile-main__avatar"
              :src="avatar"
              alt="Avatar"
            />
            <span v-else class="profile-main__avatar profile-main__avatar--empty">
              {{ userInitial }}
            </span>
          </div>

          <div class="profile-main__account-texts">
            <h2 class="profile-main__account-title">Личные данные</h2>
            <p class="profile-main__account-subtitle">
              Обновите фото профиля, имя и контактную информацию.
            </p>
          </div>
        </div>

        <div class="profile-main__avatar-actions">
          <label class="profile-main__action profile-main__action--upload">
            <UiIcons color="red-500" icon="upload"></UiIcons>
            <span>Загрузить другое фото</span>
            <input
              class="profile-main__file"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              @change="handleAvatarChange"
            />
          </label>

          <button
            type="button"
            class="profile-main__action profile-main__action--delete"
            @click="deleteAvatar()"
          >
            <UiIcons color="orange-200" icon="trash" size="size-14"></UiIcons>
            <span>Удалить аватарку</span>
          </button>
        </div>

        <div class="profile-main__partner-block" v-if="userStore.getUser?.role !== 'partner'">
          <p class="profile-main__partner-title">Хотите размещать свои услуги?</p>
          <p class="profile-main__partner-text">
            Подайте заявку и подключитесь к FlyAway как партнер.
          </p>
          <UiButton
            class="profile-main__btn profile-main__btn--partner"
            label="Стать партнером"
            @click="openPartnerModal"
          ></UiButton>
        </div>
      </section>

      <section class="profile-main__card profile-main__card--form">
        <div class="profile-main__section-head">
          <h2 class="profile-main__section-title">Основная информация</h2>
          <p class="profile-main__section-subtitle">
            Эти данные используются в вашем личном кабинете и при оформлении заявок.
          </p>
        </div>

        <div class="profile-main__fields">
          <div class="profile-main__field">
            <UiInput
              class="profile-main__input"
              label="Ваше имя*"
              placeholder="Дана"
              v-model.trim="name"
            ></UiInput>
            <p class="profile-main__input-error" v-if="errorMessage.name">
              {{ errorMessage.name }}
            </p>
          </div>

          <div class="profile-main__field">
            <UiInput
              class="profile-main__input"
              label="Номер телефона*"
              maska="8(###)-###-##-##"
              placeholder="8 (___) ___ __ __"
              v-model.trim="phone"
            ></UiInput>
          </div>

          <div class="profile-main__field">
            <UiInput
              class="profile-main__input"
              label="Ваша почта*"
              v-model.trim="email"
              placeholder="Не указан"
              :disabled="true"
            ></UiInput>
          </div>

          <div class="profile-main__field">
            <UiCalendar
              label="Дата рождения"
              class="profile-main__calendar"
              placeholder="dd.mm.yyyy"
              v-model.trim="birthDate"
            />
          </div>

          <div class="profile-main__field profile-main__field--full">
            <UiSelect
              class="profile-main__select"
              v-model.trim="selectedGender"
              :options="genders.slice(0, 3)"
              label="Пол"
              placeholder="Не указан"
            ></UiSelect>
          </div>
        </div>

        <div class="profile-main__actions">
          <UiButton
            class="profile-main__btn button-primary"
            label="Сохранить"
            @click="postProfile"
            :is-loading="isLoading"
          ></UiButton>

          <UiButton
            v-if="userStore.getUser?.role !== 'partner'"
            class="profile-main__btn profile-main__btn--partner profile-main__btn--mobile-partner"
            label="Стать партнером"
            @click="openPartnerModal"
          ></UiButton>
        </div>
      </section>
    </div>

    <TheProfileBecomePartnerModal
      :is-show="isPartnerModalOpen"
      @close="closePartnerModal"
      @created="handlePartnerCreated"
    />
  </div>
</template>

<script setup>
const userCookie = useCookie("user");
const userStore = useAuthStore();
const { fileToBase64 } = useBlobFiles();
const user = ref(userStore.getUser);
const name = ref(user.value?.name || null);
const email = ref(user.value?.email || null);
const phone = ref(user.value?.phone || null);
const birthDate = ref(user.value?.birthday || null);
const avatar = ref(user.value?.avatar || null);
const avatarFile = ref(null);
const userInitial = computed(() =>
  String(name.value || user.value?.name || "U")
    .charAt(0)
    .toUpperCase(),
);

const isLoading = ref(false);
const isPartnerModalOpen = ref(false);

const genders = reactive([
  {
    id: 1,
    name: "Мужской",
    value: "men",
  },
  {
    id: 2,
    name: "Женский",
    value: "woman",
  },
  {
    id: 3,
    name: "Другой",
    value: "another",
  },
  {
    id: 4,
    name: "Не указан",
    value: null,
  },
]);
const selectedGender = ref(genders[3]);

const errorMessage = reactive({
  name: "",
});

const checkFields = () => {
  if (
    !String(name.value || "").trim() ||
    String(name.value || "").trim().length < 2
  ) {
    errorMessage.name = "Минимум 2 букв";
    return false;
  }
  return true;
};

const postProfile = async () => {
  if (checkFields()) {
    isLoading.value = true;
    const formatBirthdate = formatBirthDate(birthDate.value);
    try {
      const payload = {
        name: name.value,
        phone: phone.value,
        birthDate: formatBirthdate,
        gender: selectedGender.value.value,
      };

      if (avatarFile.value) {
        payload.avatarFile = {
          fileName: avatarFile.value.name,
          mimeType: avatarFile.value.type,
          size: avatarFile.value.size,
          base64Data: await fileToBase64(avatarFile.value),
        };
      } else if (avatar.value === null) {
        payload.avatar = null;
      }

      const res = await useApi().client({
        url: "/users/update",
        method: "put",
        data: payload,
      });

      userStore.setUserData(res.data);
      userCookie.value = res.data;
      user.value = res.data;
      avatar.value = res.data.avatar || null;
      avatarFile.value = null;
    } finally {
      isLoading.value = false;
    }
  }
};

const deleteAvatar = () => {
  avatar.value = null;
  avatarFile.value = null;
};

const handleAvatarChange = (event) => {
  const file = event.target.files?.[0] || null;

  if (!file) return;

  avatarFile.value = file;
  avatar.value = URL.createObjectURL(file);
};

const openPartnerModal = () => {
  isPartnerModalOpen.value = true;
};

const closePartnerModal = () => {
  isPartnerModalOpen.value = false;
};

const handlePartnerCreated = () => {
  closePartnerModal();
  userStore.logoutUser("/");
};

watch(
  () => name.value,
  () => {
    errorMessage.name = "";
  },
);

watch(
  () => userStore.getUser,
  (nextUser) => {
    user.value = nextUser;
    name.value = nextUser?.name || null;
    email.value = nextUser?.email || null;
    phone.value = nextUser?.phone || null;
    birthDate.value = nextUser?.birthday || nextUser?.birthDate || null;
    avatar.value = nextUser?.avatar || null;
    selectedGender.value =
      genders.find((gender) => gender.value === nextUser?.gender) || genders[3];
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.profile-main {
  &__wrapper {
    display: grid;
    grid-template-columns: 320px minmax(0, 1fr);
    gap: 24px;
    margin: 12px 0;
  }

  &__card {
    background-color: $white;
    border-radius: 24px;
    box-shadow: 0px 8px 28px rgba(0, 0, 0, 0.06);
    padding: 24px;

    &--account {
      display: flex;
      flex-direction: column;
      gap: 20px;
      align-self: start;
    }

    &--form {
      display: flex;
      flex-direction: column;
      gap: 22px;
      min-width: 0;
    }
  }

  &__account-head {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
    text-align: center;
  }

  &__avatar-box {
    display: flex;
    justify-content: center;
  }

  &__avatar {
    width: 92px;
    height: 92px;
    border-radius: 50%;
    object-fit: cover;

    &--empty {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: $white;
      background: $red-500;
      font-size: 32px;
      font-weight: 700;
    }
  }

  &__account-title,
  &__section-title {
    color: $surface-900;
    font-size: 22px;
    line-height: 1.2;
    font-weight: 700;
    margin: 0;
  }

  &__account-subtitle,
  &__section-subtitle,
  &__partner-text {
    color: $surface-500;
    font-size: 14px;
    line-height: 1.5;
  }

  &__section-head {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__avatar-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__action {
    min-height: 44px;
    border-radius: 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 14px;
    font-size: 14px;
    font-weight: 600;
    position: relative;

    &--upload {
      color: $red-500;
      background: rgba($red-500, 0.06);
      border: 1px solid rgba($red-500, 0.18);
    }

    &--delete {
      color: $orange-200;
      background: rgba($orange-200, 0.08);
      border: 1px solid rgba($orange-200, 0.18);
    }
  }

  &__partner-block {
    padding: 18px;
    border-radius: 18px;
    background: rgba($red-500, 0.04);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__partner-title {
    color: $surface-900;
    font-size: 16px;
    font-weight: 700;
  }

  &__fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;

    &--full {
      grid-column: 1 / -1;
    }
  }

  &__input,
  &__calendar,
  &__select {
    display: block;
  }

  &__input-error {
    color: $orange-200;
    font-size: 14px;
  }

  &__calendar,
  &__select {
    border-radius: 26px;
    background-color: transparent;
    width: 100%;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding-top: 4px;
  }

  &__btn {
    min-height: 46px;

    &--partner {
      justify-content: center;
      color: $red-500;
      border: 1px solid $red-500;
      background: transparent;
    }

    &--mobile-partner {
      display: none;
    }
  }

  &__file {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }
}

@media (max-width: 1024px) {
  .profile-main {
    &__wrapper {
      grid-template-columns: 1fr;
    }

    &__card {
      &--account {
        align-self: stretch;
      }
    }

    &__account-head {
      align-items: flex-start;
      text-align: left;
    }
  }
}

@media (max-width: 768px) {
  .profile-main {
    &__wrapper {
      gap: 16px;
    }

    &__card {
      padding: 20px 16px;
      border-radius: 18px;
    }

    &__fields {
      grid-template-columns: 1fr;
    }

    &__actions {
      flex-direction: column;
    }

    &__btn {
      width: 100%;

      &--mobile-partner {
        display: inline-flex;
      }
    }

    &__partner-block {
      display: none;
    }
  }
}

@media (max-width: 375px) {
  .profile-main {
    &__wrapper {
      margin: 0;
      gap: 12px;
    }

    &__card {
      background-color: $white;
      box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.06);
      padding: 18px 14px;
    }

    &__account-title,
    &__section-title {
      font-size: 20px;
    }
  }
}
</style>
