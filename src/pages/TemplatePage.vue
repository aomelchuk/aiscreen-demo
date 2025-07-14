<script setup lang="ts">
import { useRoute } from 'vue-router'
import AddCardForm from "../components/AddCardForm.vue";

const route = useRoute()

const id = route.params.id

</script>

<template>
  <div class="max-w-xl mx-auto p-4 space-y-6">
    <h1 class="text-2xl font-bold">Edit card #{{id}}</h1>
    <AddCardForm :id="+id"/>
  </div>
</template>

<style scoped>

</style>
