<template>
  <section class="partner-apply">
    <div class="partner-apply__hero">
      <div class="partner-apply__hero-copy">
        <NuxtLink class="partner-apply__back" to="/about">
          <UiIcons icon="chevron" size="size-14" color="red-500" deg="left" />
          О FlyAway
        </NuxtLink>

        <p class="partner-apply__eyebrow">Партнерская заявка</p>
        <h1 class="partner-apply__title">Станьте партнером FlyAway</h1>
        <p class="partner-apply__description">
          Заполните данные компании, и мы проверим заявку. После одобрения вы
          сможете управлять турами, отелями и заявками гостей из партнерского
          кабинета.
        </p>
      </div>

      <div class="partner-apply__summary">
        <span class="partner-apply__summary-icon">01</span>
        <strong>Что понадобится?</strong>
        <p>
          Контакты компании, БИН, данные владельца и краткое описание услуг.
          Логотип можно добавить сразу или позже в кабинете.
        </p>
      </div>
    </div>

    <div class="partner-apply__layout">
      <form class="partner-apply__form" @submit.prevent="submitPartner">
        <div class="partner-apply__form-head">
          <h2>Данные партнера</h2>
          <p>Поля помогут нам быстрее проверить компанию и связаться с вами.</p>
        </div>

        <div class="partner-apply__grid">
          <div class="partner-apply__field">
            <UiInput
              v-model.trim="form.title"
              label="Название компании"
              placeholder="FlyAway Travel"
              :is-error="!!errors.title"
            />
            <p v-if="errors.title" class="partner-apply__field-error">
              {{ errors.title }}
            </p>
          </div>

          <div class="partner-apply__field">
            <UiInput
              v-model.trim="form.email"
              label="Email"
              placeholder="partner@example.com"
              type="email"
              :is-error="!!errors.email"
            />
            <p v-if="errors.email" class="partner-apply__field-error">
              {{ errors.email }}
            </p>
          </div>

          <div class="partner-apply__field">
            <UiInput
              v-model.trim="form.phone"
              label="Телефон"
              placeholder="8 (___) ___ __ __"
              maska="8(###)-###-##-##"
              :is-error="!!errors.phone"
            />
            <p v-if="errors.phone" class="partner-apply__field-error">
              {{ errors.phone }}
            </p>
          </div>

          <div class="partner-apply__field">
            <UiInput
              v-model.trim="form.password"
              label="Пароль"
              placeholder="Минимум 6 символов"
              type="password"
              :is-error="!!errors.password"
            />
            <p v-if="errors.password" class="partner-apply__field-error">
              {{ errors.password }}
            </p>
          </div>

          <div class="partner-apply__field">
            <UiInput
              v-model.trim="form.bin"
              label="БИН"
              placeholder="000000000000"
              :is-error="!!errors.bin"
            />
            <p v-if="errors.bin" class="partner-apply__field-error">
              {{ errors.bin }}
            </p>
          </div>

          <div class="partner-apply__field">
            <UiInput
              v-model.trim="form.ownerName"
              label="Имя владельца"
              placeholder="Иван Иванов"
              :is-error="!!errors.ownerName"
            />
            <p v-if="errors.ownerName" class="partner-apply__field-error">
              {{ errors.ownerName }}
            </p>
          </div>
        </div>

        <div class="partner-apply__field">
          <UiInput
            v-model.trim="form.address"
            label="Адрес"
            placeholder="Город, улица, дом"
            :is-error="!!errors.address"
          />
          <p v-if="errors.address" class="partner-apply__field-error">
            {{ errors.address }}
          </p>
        </div>

        <div class="partner-apply__field">
          <UiTextarea
            v-model.trim="form.description"
            label="Описание"
            placeholder="Расскажите, какие туры, отели или услуги вы хотите размещать на FlyAway"
            :rows="5"
          />
          <p v-if="errors.description" class="partner-apply__field-error">
            {{ errors.description }}
          </p>
        </div>

        <UiFileUpload
          v-model="logoFiles"
          title="Логотип компании"
          accept="image/png,image/jpeg,image/webp"
        />

        <div
          v-if="successMessage"
          class="partner-apply__message partner-apply__message--success"
        >
          <strong>Заявка отправлена</strong>
          <p>{{ successMessage }}</p>
        </div>

        <div
          v-if="errorMessage"
          class="partner-apply__message partner-apply__message--error"
        >
          <strong>Не удалось отправить заявку</strong>
          <p>{{ errorMessage }}</p>
        </div>

        <div class="partner-apply__actions">
          <NuxtLink class="partner-apply__secondary" to="/about">
            Вернуться назад
          </NuxtLink>
          <UiButton
            class="partner-apply__submit button-primary"
            label="Отправить заявку"
            type="submit"
            :disabled="isLoading"
            :is-loading="isLoading"
          />
        </div>
      </form>

      <aside class="partner-apply__aside">
        <div class="partner-apply__aside-card">
          <h2>После отправки</h2>
          <ul>
            <li>Мы проверим данные компании.</li>
            <li>Свяжемся по телефону или email.</li>
            <li>После одобрения откроем партнерский кабинет.</li>
          </ul>
        </div>

        <div class="partner-apply__aside-card partner-apply__aside-card--accent">
          <p>Нужна помощь?</p>
          <strong>Заполните минимум обязательных данных, логотип можно добавить позже.</strong>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup>
useSeo({
  title: "Стать партнером",
  description: "Заявка на партнерство с FlyAway.",
});

const form = reactive({
  title: "",
  email: "",
  phone: "",
  password: "",
  bin: "",
  ownerName: "",
  address: "",
  description: "",
});

const logoFiles = ref([]);
const errors = reactive({});
const errorMessage = ref("");
const successMessage = ref("");
const isLoading = ref(false);

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const buildLogoFile = async () => {
  const file = logoFiles.value?.[0];

  if (!file) return null;

  return {
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
    base64Data: await fileToBase64(file),
  };
};

const clearErrors = () => {
  Object.keys(errors).forEach((key) => {
    errors[key] = "";
  });
};

const validate = () => {
  clearErrors();

  const requiredFields = [
    "title",
    "email",
    "phone",
    "password",
    "bin",
    "ownerName",
    "address",
    "description",
  ];

  requiredFields.forEach((field) => {
    if (!form[field]?.trim()) {
      errors[field] = "Заполните поле";
    }
  });

  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Введите корректную почту";
  }

  if (form.password && form.password.length < 6) {
    errors.password = "Минимум 6 символов";
  }

  if (form.bin && !/^\d{12}$/.test(form.bin)) {
    errors.bin = "БИН должен содержать 12 цифр";
  }

  return !Object.values(errors).some(Boolean);
};

const resetForm = () => {
  form.title = "";
  form.email = "";
  form.phone = "";
  form.password = "";
  form.bin = "";
  form.ownerName = "";
  form.address = "";
  form.description = "";
  logoFiles.value = [];
};

const getErrorMessage = (error) => {
  return (
    error?.message ||
    error?.data?.message ||
    error?.response?.data?.message ||
    "Проверьте данные и попробуйте еще раз."
  );
};

const submitPartner = async () => {
  if (isLoading.value || !validate()) return;

  isLoading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const logoFile = await buildLogoFile();

    await useApi().client({
      url: "/partners/apply",
      method: "post",
      data: {
        ...form,
        logoFile,
      },
    });

    successMessage.value =
      "Спасибо! Мы получили данные и скоро свяжемся с вами для подтверждения.";
    resetForm();
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => ({ ...form }),
  () => {
    errorMessage.value = "";
  },
);
</script>

<style scoped lang="scss">
.partner-apply {
  display: grid;
  gap: 28px;
  margin: 36px 0 56px;
  color: $surface-900;

  &__hero {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(280px, 380px);
    gap: 24px;
    align-items: stretch;
    padding: clamp(22px, 4vw, 42px);
    border-radius: 28px;
    background:
      linear-gradient(135deg, rgba($red-500, 0.1), rgba($white, 0.92) 45%),
      $surface-150;
    box-shadow: $box-shadow;
  }

  &__hero-copy {
    display: grid;
    align-content: start;
    gap: 14px;
  }

  &__back,
  &__secondary {
    width: fit-content;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: $red-500;
    font-size: 14px;
    font-weight: 700;
  }

  &__eyebrow {
    color: $red-500;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  &__title {
    max-width: 760px;
    color: $surface-900;
    font-size: clamp(2rem, 1.182rem + 4.09vw, 4.25rem);
    font-weight: 800;
    line-height: 0.98;
    letter-spacing: -0.04em;
  }

  &__description {
    max-width: 720px;
    color: $surface-500;
    font-size: clamp(1rem, 0.864rem + 0.68vw, 1.375rem);
    line-height: 1.5;
  }

  &__summary {
    display: grid;
    align-content: end;
    gap: 12px;
    padding: 22px;
    border-radius: 24px;
    background: rgba($white, 0.88);
    border: 1px solid rgba($red-500, 0.08);
    box-shadow: 0 14px 36px rgba(32, 36, 38, 0.08);

    strong {
      font-size: 24px;
      line-height: 1.15;
    }

    p {
      color: $surface-500;
      line-height: 1.5;
    }
  }

  &__summary-icon {
    width: 54px;
    height: 54px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: $white;
    background: $red-500;
    border-radius: 18px;
    font-size: 18px;
    font-weight: 800;
  }

  &__layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
    gap: 24px;
    align-items: start;
  }

  &__form,
  &__aside-card {
    border-radius: 24px;
    background: $white;
    box-shadow: 0 14px 36px rgba(32, 36, 38, 0.08);
  }

  &__form {
    display: grid;
    gap: 18px;
    padding: clamp(18px, 3vw, 28px);
  }

  &__form-head {
    display: grid;
    gap: 8px;

    h2 {
      font-size: 28px;
      font-weight: 800;
    }

    p {
      color: $surface-500;
      line-height: 1.45;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  &__field {
    display: grid;
    gap: 6px;
  }

  &__field-error {
    color: $orange-200;
    font-size: 13px;
    font-weight: 600;
  }

  &__message {
    display: grid;
    gap: 5px;
    padding: 14px 16px;
    border-radius: 16px;
    line-height: 1.45;

    strong {
      font-size: 16px;
    }

    &--success {
      color: #056f50;
      background: rgba(46, 204, 113, 0.12);
    }

    &--error {
      color: $red-500;
      background: rgba($red-500, 0.08);
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding-top: 4px;
  }

  &__submit {
    min-height: 52px;
  }

  &__aside {
    position: sticky;
    top: 20px;
    display: grid;
    gap: 16px;
  }

  &__aside-card {
    display: grid;
    gap: 14px;
    padding: 22px;

    h2 {
      font-size: 24px;
      font-weight: 800;
    }

    ul {
      display: grid;
      gap: 10px;
    }

    li {
      position: relative;
      padding-left: 18px;
      color: $surface-500;
      line-height: 1.45;

      &::before {
        content: "";
        position: absolute;
        top: 9px;
        left: 0;
        width: 7px;
        height: 7px;
        border-radius: 999px;
        background: $red-500;
      }
    }

    &--accent {
      color: $white;
      background: $surface-900;

      p {
        color: rgba($white, 0.72);
      }

      strong {
        color: $white;
        line-height: 1.45;
      }
    }
  }
}

@media (max-width: 980px) {
  .partner-apply {
    &__hero,
    &__layout {
      grid-template-columns: 1fr;
    }

    &__aside {
      position: static;
    }
  }
}

@media (max-width: 640px) {
  .partner-apply {
    margin: 24px 0 42px;

    &__hero,
    &__form,
    &__aside-card {
      border-radius: 20px;
    }

    &__grid {
      grid-template-columns: 1fr;
    }

    &__actions {
      flex-direction: column-reverse;
      align-items: stretch;
    }

    &__secondary,
    &__submit {
      width: 100%;
      justify-content: center;
    }
  }
}
</style>
