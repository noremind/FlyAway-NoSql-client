<template>
  <section class="admin-faq">
    <div class="admin-faq__layout">
      <form class="admin-faq__form" @submit.prevent="saveFaq">
        <h2 class="admin-faq__form-title">
          {{ editingId ? "Редактировать вопрос" : "Новый вопрос" }}
        </h2>

        <UiInput
          label="Вопрос"
          placeholder="Как забронировать тур?"
          v-model.trim="form.question"
        />
        <UiTextarea
          label="Ответ"
          placeholder="Напишите понятный ответ для пользователя"
          :rows="5"
          v-model.trim="form.answer"
        />

        <div class="admin-faq__grid">
          <UiInput
            label="Категория"
            placeholder="Бронирование"
            v-model.trim="form.category"
          />
          <UiInput
            label="Порядок"
            type="number"
            placeholder="1"
            v-model="form.order"
          />
        </div>

        <label class="admin-faq__check">
          <input type="checkbox" v-model="form.isActive" />
          <span>Показывать на сайте</span>
        </label>

        <p v-if="message" class="admin-faq__message">{{ message }}</p>

        <div class="admin-faq__actions">
          <button class="admin-faq__submit" type="submit" :disabled="isSaving">
            {{
              isSaving ? "Сохраняем..." : editingId ? "Сохранить" : "Создать"
            }}
          </button>
          <button
            v-if="editingId"
            class="admin-faq__ghost"
            type="button"
            @click="resetForm"
          >
            Отмена
          </button>
        </div>
      </form>

      <div class="admin-faq__list">
        <div v-if="isLoading" class="admin-faq__state">Загружаем FAQ...</div>
        <div v-else-if="!items.length" class="admin-faq__state">
          Пока нет вопросов.
        </div>

        <article v-for="item in items" :key="item._id" class="admin-faq__item">
          <div>
            <div class="admin-faq__item-meta">
              <span>{{ item.category || "Общее" }}</span>
              <span>№{{ item.order || 0 }}</span>
              <span
                :class="
                  item.isActive
                    ? 'admin-faq__status admin-faq__status--active'
                    : 'admin-faq__status'
                "
              >
                {{ item.isActive ? "Активен" : "Скрыт" }}
              </span>
            </div>
            <h3 class="admin-faq__question">{{ item.question }}</h3>
            <p class="admin-faq__answer">{{ item.answer }}</p>
          </div>
          <div class="admin-faq__item-actions">
            <button type="button" @click="editFaq(item)">Редактировать</button>
            <button type="button" @click="deleteFaq(item._id)">Удалить</button>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
definePageMeta({ layout: "admin", middleware: "admin" });
useSeo({ title: "FAQ", description: "Управление FAQ FlyAway." });

const api = useApi();
const items = ref([]);
const isLoading = ref(false);
const isSaving = ref(false);
const message = ref("");
const editingId = ref("");

const form = reactive({
  question: "",
  answer: "",
  category: "Общее",
  order: 0,
  isActive: true,
});

const resetForm = () => {
  editingId.value = "";
  form.question = "";
  form.answer = "";
  form.category = "Общее";
  form.order = 0;
  form.isActive = true;
  message.value = "";
};

const loadFaq = async () => {
  isLoading.value = true;
  try {
    const res = await api.client({
      url: "/faq",
      method: "get",
      query: { all: true },
    });
    items.value = Array.isArray(res?.data) ? res.data : [];
  } catch (error) {
    message.value = error?.message || "Не удалось загрузить FAQ";
  } finally {
    isLoading.value = false;
  }
};

const buildPayload = () => ({
  question: form.question.trim(),
  answer: form.answer.trim(),
  category: form.category.trim() || "Общее",
  order: Number(form.order) || 0,
  isActive: Boolean(form.isActive),
});

const saveFaq = async () => {
  message.value = "";
  if (!form.question.trim() || !form.answer.trim()) {
    message.value = "Заполните вопрос и ответ";
    return;
  }
  isSaving.value = true;
  try {
    const payload = buildPayload();
    if (editingId.value) {
      await api.client({
        url: `/faq/${editingId.value}`,
        method: "patch",
        data: payload,
      });
      message.value = "FAQ обновлен";
    } else {
      await api.client({ url: "/faq", method: "post", data: payload });
      message.value = "FAQ создан";
    }
    resetForm();
    await loadFaq();
  } catch (error) {
    message.value = error?.message || "Не удалось сохранить FAQ";
  } finally {
    isSaving.value = false;
  }
};

const editFaq = (item) => {
  editingId.value = item._id;
  form.question = item.question || "";
  form.answer = item.answer || "";
  form.category = item.category || "Общее";
  form.order = item.order || 0;
  form.isActive = Boolean(item.isActive);
  message.value = "";
};

const deleteFaq = async (id) => {
  if (typeof window !== "undefined" && !window.confirm("Удалить этот вопрос?"))
    return;
  try {
    await api.client({ url: `/faq/${id}`, method: "delete" });
    await loadFaq();
  } catch (error) {
    message.value = error?.message || "Не удалось удалить FAQ";
  }
};

onMounted(loadFaq);
</script>

<style lang="scss" scoped>
.admin-faq {
  display: grid;
  gap: 20px;

  &__title {
    color: $surface-900;
    font-size: 32px;
    font-weight: 800;
  }

  &__text {
    margin-top: 6px;
    color: $surface-500;
    line-height: 1.5;
  }

  &__layout {
    display: grid;
    grid-template-columns: 420px minmax(0, 1fr);
    gap: 20px;
    align-items: start;
  }

  &__form,
  &__list,
  &__item {
    background: $white;
    border-radius: 20px;
    box-shadow: 0 14px 34px rgba(32, 36, 38, 0.06);
  }

  &__form {
    display: grid;
    gap: 14px;
    padding: 22px;
    position: sticky;
    top: 96px;
  }

  &__form-title {
    color: $surface-900;
    font-size: 22px;
    font-weight: 800;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr 120px;
    gap: 12px;
  }

  &__check {
    display: flex;
    align-items: center;
    gap: 10px;
    color: $surface-900;
    font-weight: 600;
  }

  &__actions {
    display: flex;
    gap: 10px;
  }

  &__submit,
  &__ghost {
    min-height: 46px;
    padding: 0 18px;
    border-radius: 14px;
    font-weight: 800;
  }

  &__submit {
    color: $white;
    background: $red-500;
  }

  &__ghost {
    color: $red-500;
    background: rgba($red-500, 0.06);
  }

  &__message {
    color: $red-500;
    font-weight: 700;
  }

  &__list {
    display: grid;
    gap: 14px;
    padding: 16px;
  }

  &__item {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 16px;
    padding: 18px;
    border: 1px solid rgba($red-500, 0.08);
  }

  &__item-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    color: $surface-500;
    font-size: 12px;
    font-weight: 700;
    margin-bottom: 8px;
  }

  &__status {
    color: $orange-200;

    &--active {
      color: $green-400;
    }
  }

  &__question {
    color: $surface-900;
    font-size: 18px;
    font-weight: 800;
    margin-bottom: 8px;
  }

  &__answer {
    color: $surface-500;
    line-height: 1.55;
  }

  &__item-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;

    button {
      color: $red-500;
      font-weight: 700;
      text-align: right;
    }
  }

  &__state {
    padding: 30px;
    color: $surface-500;
    text-align: center;
  }
}

@media (max-width: 1100px) {
  .admin-faq {
    &__layout {
      grid-template-columns: 1fr;
    }

    &__form {
      position: static;
    }
  }
}

@media (max-width: 640px) {
  .admin-faq {
    &__grid,
    &__item {
      grid-template-columns: 1fr;
    }

    &__item-actions {
      flex-direction: row;
      justify-content: flex-end;
    }
  }
}
</style>
