import { defineStore } from 'pinia'
export const useAccountPreview = defineStore('account-preview', {
  state: () => ({ name: '', email: '', phone: '', city: '', address: '' }),
})
