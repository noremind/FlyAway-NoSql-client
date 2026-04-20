<template>
  <section>
    <TheAdminToursForm mode="create" />
  </section>
</template>

<script setup>
definePageMeta({
  layout: "admin",
  middleware: "admin",
});

useSeo({
  title: "Создать тур",
  description: "Создание тура в админ-панели FlyAway.",
});
</script>
