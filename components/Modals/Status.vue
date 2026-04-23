<template>
  <div class="status">
    <div class="status__wrapper">
      <img
        class="status__logo"
        src="@/assets/image/logo/FlyAway-logo.png"
        alt="FlyAway"
      />
      <UiIcons
        icon="circle-check"
        size="size-160"
        :color="checkStatus"
      ></UiIcons>

      <h4 class="status__title">{{ displayTitle }}</h4>

      <nuxt-link @click="clickAction" class="status__link">
        <UiButton
          :label="displayButtonLabel"
          class="status__btn button-primary"
        ></UiButton>
      </nuxt-link>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(["action"]);
const props = defineProps({
  title: String,
  status: String,
  btnLabel: String,
  goTo: String,
});

const router = useRouter();

const clickAction = () => {
  emit("action");
  router.push(props.goTo);
};

const checkStatus = computed(() => {
  switch (props.status) {
    case "success":
      return "green-400";
    case "error":
      return "orange-200";
    default:
      return "";
  }
});

const displayTitle = computed(() => {
  if (props.status === "success" && props.title === "Бронирование оформлено") {
    return "Ваш заказ оплачен";
  }

  return props.title;
});

const displayButtonLabel = computed(() => {
  if (
    props.status === "success" &&
    props.btnLabel === "Перейти в Мои туры"
  ) {
    return "Перейти в мои туры";
  }

  return props.btnLabel;
});
</script>

<style lang="scss" scoped>
.status {
  &__wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 28px;
    margin: 32px auto 40px auto;
    max-width: 460px;
  }
  &__title {
    color: $red-500;
    font-size: 28px;
    font-weight: 700;
    text-align: center;
    line-height: 1.2;
  }
  &__btn {
    width: 100%;
  }
  &__link {
    width: 100%;
  }
  &__logo {
    width: 120px;
  }
}
</style>
