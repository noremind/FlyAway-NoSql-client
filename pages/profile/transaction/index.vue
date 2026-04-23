<template>
  <section class="transaction">
    <div class="transaction__wrapper">
      <section class="transaction__banner">
        <img
          class="transaction__banner-img"
          src="@/assets/image/content/carving.png"
          alt="Banner"
        />

        <div class="transaction__banner-content">
          <div class="transaction__banner-top">
            <h2 class="transaction__title">Кошелек и бонусы</h2>
            <p class="transaction__subtitle">
              История начислений и списаний по вашему аккаунту FlyAway.
            </p>
          </div>

          <div class="transaction__totals">
            <div class="transaction__total-card">
              <p class="transaction__total-label">Бонусы</p>
              <p class="transaction__total-value">
                {{ Number(wallet.bonusBalance || 0).toLocaleString("ru-RU") }} Б
              </p>
            </div>

            <div class="transaction__total-card transaction__total-card--light">
              <p class="transaction__total-label">Транзакций</p>
              <p class="transaction__total-value transaction__total-value--small">
                {{ transactions.length }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div v-if="isLoading" class="transaction__state">
        Загружаем операции...
      </div>

      <div
        v-else-if="errorMessage"
        class="transaction__state transaction__state--error"
      >
        {{ errorMessage }}
      </div>

      <div v-else class="transaction__body">
        <div v-if="transactions.length" class="transaction__blocks">
          <section
            class="transaction__block"
            v-for="(item, index) in transactions"
            :key="`${item.name}-${item.createdAt || index}`"
          >
            <div class="transaction__block-left">
              <h3 class="transaction__block-title">{{ item.name }}</h3>
              <div class="transaction__block-meta">
                <p class="transaction__block-badge">{{ item.type }}</p>
                <p class="transaction__block-note" v-if="item.note">
                  {{ item.note }}
                </p>
              </div>
            </div>

            <div class="transaction__block-right">
              <p
                class="transaction__block-amount"
                :class="{
                  'transaction__block-amount--positive': item.amount > 0,
                  'transaction__block-amount--negative': item.amount < 0,
                }"
              >
                {{ formatAmount(item.amount, item.currency) }}
              </p>
              <p class="transaction__block-date">{{ item.date }}</p>
            </div>
          </section>
        </div>

        <div v-else class="transaction__empty">
          Пока в кошельке нет операций.
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const api = useApi();
const isLoading = ref(false);
const errorMessage = ref("");
const wallet = ref({
  balance: 0,
  bonusBalance: 0,
  currency: "KZT",
  transactions: [],
});

useSeoMeta({
  title: "FlyAway - Кошелек и бонусы",
  ogTitle: "FlyAway - Кошелек и бонусы",
  description: "FlyAway - сайт для бронирования туров и отелей",
  ogDescription: "FlyAway - сайт для бронирования туров и отелей",
});

const loadWallet = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const res = await api.client({
      url: "/personal-cabinet/wallet",
      method: "get",
    });

    wallet.value = res.data || {
      balance: 0,
      bonusBalance: 0,
      currency: "KZT",
      transactions: [],
    };
  } catch (error) {
    errorMessage.value = error?.message || "Не удалось загрузить операции.";
    wallet.value = {
      balance: 0,
      bonusBalance: 0,
      currency: "KZT",
      transactions: [],
    };
  } finally {
    isLoading.value = false;
  }
};

const transactions = computed(() => {
  return (
    Array.isArray(wallet.value?.transactions) ? wallet.value.transactions : []
  ).map((item) => ({
    name: item?.name || "Транзакция",
    type: item?.type || "Операция",
    note: item?.note || "",
    currency: item?.currency || "KZT",
    createdAt: item?.createdAt || null,
    date: item?.createdAt
      ? new Intl.DateTimeFormat("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(new Date(item.createdAt))
      : "-",
    amount: Number(item?.amount) || 0,
  }));
});

const formatAmount = (amount, currency = "KZT") => {
  const absAmount = Math.abs(Number(amount) || 0).toLocaleString("ru-RU");
  const prefix = Number(amount) >= 0 ? "+" : "-";
  const suffix = currency === "BONUS" ? "Б" : "₸";
  return `${prefix} ${absAmount} ${suffix}`;
};

onMounted(loadWallet);
</script>

<style lang="scss" scoped>
.transaction {
  &__wrapper {
    background-color: $white;
    padding: 24px;
    border-radius: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    box-shadow: 0px 8px 28px rgba(0, 0, 0, 0.06);
    min-height: 640px;
  }

  &__banner {
    width: 100%;
    min-height: 220px;
    background-color: $red-500;
    border-radius: 24px;
    padding: 24px;
    position: relative;
    overflow: hidden;

    &-img {
      position: absolute;
      max-width: 520px;
      width: 100%;
      opacity: 0.14;
      left: -20px;
      top: -70px;
      pointer-events: none;
    }
  }

  &__banner-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-height: 172px;
    justify-content: space-between;
  }

  &__banner-top {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 520px;
  }

  &__title {
    font-size: 28px;
    line-height: 1.15;
    color: $white;
    font-weight: 700;
  }

  &__subtitle {
    color: rgba($white, 0.92);
    font-size: 14px;
    line-height: 1.5;
  }

  &__totals {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
  }

  &__total-card {
    min-width: 180px;
    padding: 16px 18px;
    border-radius: 18px;
    background: rgba($white, 0.12);
    backdrop-filter: blur(2px);

    &--light {
      background: rgba($white, 0.2);
    }
  }

  &__total-label {
    color: rgba($white, 0.85);
    font-size: 13px;
    margin-bottom: 6px;
  }

  &__total-value {
    color: $white;
    font-size: 34px;
    line-height: 1;
    font-weight: 800;

    &--small {
      font-size: 28px;
    }
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  &__state,
  &__empty {
    padding: 36px 20px;
    border-radius: 20px;
    background: rgba($red-500, 0.04);
    color: $surface-500;
    text-align: center;
  }

  &__state {
    &--error {
      color: $orange-200;
    }
  }

  &__blocks {
    display: flex;
    flex-direction: column;
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid rgba($surface-300, 0.35);
  }

  &__block {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    padding: 18px 18px;
    border-bottom: 1px solid rgba($surface-300, 0.35);
    background: $white;

    &:nth-child(odd) {
      background: rgba($red-500, 0.025);
    }

    &:last-child {
      border-bottom: none;
    }
  }

  &__block-left,
  &__block-right {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__block-right {
    align-items: flex-end;
    text-align: right;
    flex-shrink: 0;
  }

  &__block-title {
    font-size: 15px;
    font-weight: 700;
    color: $surface-900;
  }

  &__block-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  &__block-badge {
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 999px;
    background: rgba($red-500, 0.08);
    color: $red-500;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  &__block-note,
  &__block-date {
    font-size: 13px;
    color: $surface-500;
    line-height: 1.45;
  }

  &__block-amount {
    font-size: 16px;
    font-weight: 800;
    color: $surface-900;

    &--positive {
      color: $green-400;
    }

    &--negative {
      color: $orange-200;
    }
  }
}

@media (max-width: 768px) {
  .transaction {
    &__wrapper {
      padding: 18px 16px 22px;
      border-radius: 18px;
      min-height: auto;
    }

    &__banner {
      min-height: 200px;
      border-radius: 18px;
      padding: 18px;
    }

    &__title {
      font-size: 24px;
    }

    &__total-value {
      font-size: 28px;

      &--small {
        font-size: 24px;
      }
    }

    &__block {
      flex-direction: column;
    }

    &__block-right {
      align-items: flex-start;
      text-align: left;
    }
  }
}

@media (max-width: 375px) {
  .transaction {
    &__wrapper {
      background-color: transparent;
      box-shadow: none;
      padding: 0;
      gap: 14px;
    }

    &__banner {
      border-radius: 18px;
    }

    &__totals {
      flex-direction: column;
    }

    &__total-card {
      width: 100%;
      min-width: 0;
    }
  }
}
</style>
