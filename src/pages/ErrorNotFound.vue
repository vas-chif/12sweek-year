<template>
  <div
    class="fullscreen bg-dark-page text-white text-center q-pa-md flex flex-center"
  >
    <div>
      <div class="text-primary text-weight-bolder" style="font-size: 20vh">
        404
      </div>

      <div class="text-h4 text-grey-4 q-mb-md"> Pagina Non Trovata </div>

      <div class="text-body1 text-grey-5 q-mb-xl">
        La rotta richiesta non esiste nell'Operational Hub 12WY.
      </div>

      <q-btn
        unelevated
        color="primary"
        text-color="dark"
        to="/"
        label="Torna alla Dashboard Tattica"
        no-caps
        class="text-weight-bold q-px-lg"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// ErrorNotFound
</script>

<style scoped>
.bg-dark-page {
  background-color: #090d16 !important;
}
</style>
