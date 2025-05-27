<template>
  <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
    <!-- En-tête -->
    <div class="flex items-center justify-between mb-2">
      <h4 class="font-medium text-gray-900 truncate">
        {{ cronjob.name }}
      </h4>
      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {{ cronjob.namespace }}
      </span>
    </div>
    
    <!-- Informations -->
    <div class="text-sm text-gray-600 space-y-1">
      <div class="flex justify-between">
        <span>Schedule:</span>
        <span class="font-mono text-xs">{{ cronjob.schedule || 'N/A' }}</span>
      </div>
      
      <div v-if="cronjob.lastRun" class="flex justify-between">
        <span>Dernière exécution:</span>
        <span class="font-medium text-xs">
          {{ formatLastRun(cronjob.lastRun) }}
        </span>
      </div>
      
      <div class="flex justify-between">
        <span>Status:</span>
        <span class="font-medium" :class="statusClass">
          {{ cronjob.status || 'Active' }}
        </span>
      </div>
    </div>
    
    <!-- Actions -->
    <div class="mt-3 flex justify-end space-x-2">
      <button 
        @click="$emit('view-details', cronjob)"
        class="text-xs text-blue-600 hover:text-blue-800 font-medium"
      >
        Détails
      </button>
      <button 
        @click="$emit('trigger', cronjob)"
        class="text-xs text-green-600 hover:text-green-800 font-medium"
      >
        Déclencher
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  cronjob: {
    type: Object,
    required: true
  }
})

defineEmits(['view-details', 'trigger'])

const statusClass = computed(() => {
  const status = props.cronjob.status?.toLowerCase() || 'active'
  return {
    'text-green-600': status === 'active',
    'text-yellow-600': status === 'suspended',
    'text-red-600': status === 'failed'
  }
})

function formatLastRun(lastRun) {
  if (!lastRun) return 'N/A'
  
  try {
    const date = new Date(lastRun)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffMins < 60) {
      return `Il y a ${diffMins}min`
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`
    } else {
      return `Il y a ${diffDays}j`
    }
  } catch (error) {
    return 'N/A'
  }
}
</script>
