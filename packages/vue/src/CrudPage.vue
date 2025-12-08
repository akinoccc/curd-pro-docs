<script setup lang="ts">
import type { UseCrudReturn } from '@fcurd/core'
import { inject } from 'vue'
import { CrudInstanceSymbol } from './symbols'

interface CrudPageProps<Row = any> {
  crud?: UseCrudReturn<Row>
  title?: string
}

const props = defineProps<CrudPageProps<any>>()

const injectedCrud = inject(CrudInstanceSymbol)

const crud = props.crud ?? injectedCrud
</script>

<template>
  <div class="fcurd-page">
    <header v-if="$slots.header || title" class="fcurd-page__header">
      <slot name="header">
        <h2 class="fcurd-page__title">
          {{ title }}
        </h2>
      </slot>
    </header>

    <section v-if="$slots.toolbar" class="fcurd-page__toolbar">
      <slot name="toolbar" />
    </section>

    <section v-if="$slots.search" class="fcurd-page__search">
      <slot name="search" :crud="crud" />
    </section>

    <section v-if="$slots.beforeTable" class="fcurd-page__before-table">
      <slot name="beforeTable" :crud="crud" />
    </section>

    <section v-if="$slots.table" class="fcurd-page__table">
      <slot name="table" :crud="crud" />
    </section>

    <footer v-if="$slots.footer" class="fcurd-page__footer">
      <slot name="footer" :crud="crud" />
    </footer>
  </div>
</template>

<style scoped>
.fcurd-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
