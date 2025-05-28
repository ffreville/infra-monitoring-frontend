<template>
  <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
    <!-- En-tête -->
    <div class="flex items-center justify-between mb-2">
      <h4 class="font-medium text-gray-900 truncate">
        {{ deployment.name }}
      </h4>
      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {{ deployment.namespace }}
      </span>
    </div>
    
    <!-- Informations -->
    <div class="text-sm text-gray-600 space-y-1">

      <div v-if="deployment.ready" class="flex justify-between">
        <span>Prêt:</span>
        <span class="font-medium" :class="readyStatusClass">
          {{ deployment.ready }} / {{ deployment.replicas }}
        </span>
      </div>
      
      <div class="flex justify-between">
        <span>Status:</span>
        <span class="font-medium" :class="statusClass">
          {{ deployment.status || 'Running' }}
        </span>
      </div>
      <div v-if="deployment.images" class="flex justify-between">
         <span>Versions:</span>
         <span>
             <li v-for="(image, index) in deployment.images" :key="index">
                {{ image }}
            </li>
         </span>
       
      </div>
    </div>
    
    <!-- Actions -->
    <!--div class="mt-3 flex justify-end space-x-2">
      <button 
        @click="$emit('view-details', deployment)"
        class="text-xs text-blue-600 hover:text-blue-800 font-medium"
      >
        Détails
      </button>
      <button 
        @click="$emit('scale', deployment)"
        class="text-xs text-green-600 hover:text-green-800 font-medium"
      >
        Scale
      </button>
    </div-->
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  deployment: {
    type: Object,
    required: true
  }
})

defineEmits(['view-details', 'scale'])

const statusClass = computed(() => {
  const status = props.deployment.status?.toLowerCase() || 'running'
  return {
    'text-green-600': status === 'running',
    'text-yellow-600': status === 'pending',
    'text-red-600': status === 'failed'
  }
})

const readyStatusClass = computed(() => {
  const ready = props.deployment.ready || '0'
  const replicas = props.deployment.replicas || '0'
  return {
    'text-green-600': ready === replicas && replicas > 0,
    'text-yellow-600': ready < replicas && ready > 0,
    'text-red-600': ready === 0 && replicas > 0
  }

})
</script>
