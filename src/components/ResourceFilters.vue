<template>
  <div class="bg-white rounded-lg shadow p-6 mb-6">
    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <!-- Filtre par namespace -->
        <div>
          <label 
            for="namespace-select" 
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Namespace
          </label>
          <select 
            id="namespace-select"
            :value="selectedNamespace" 
            @input="$emit('update:selectedNamespace', $event.target.value)"
            class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">Tous les namespaces</option>
            <option 
              v-for="ns in namespaces" 
              :key="ns.name" 
              :value="ns.name"
            >
              {{ ns.name }}
            </option>
          </select>
        </div>
        
        <!-- Filtre par type de ressource -->
        <div>
          <label 
            for="resource-select" 
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Type de ressource
          </label>
          <select 
            id="resource-select"
            :value="selectedResourceType" 
            @input="$emit('update:selectedResourceType', $event.target.value)"
            class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">Toutes les ressources</option>
            <option value="deployments">Deployments</option>
            <option value="cronjobs">CronJobs</option>
            <option value="statefulsets">StatefulSets</option>
          </select>
        </div>
        
        <!-- Bouton reset -->
        <div class="flex items-end">
          <button
            @click="$emit('reset-filters')"
            class="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
          >
            Réinitialiser
          </button>
        </div>
      </div>
      
      <!-- Compteur de ressources -->
      <div class="text-sm text-gray-500">
        <span class="font-medium">{{ totalCount }}</span> 
        ressource(s) trouvée(s)
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  namespaces: {
    type: Array,
    default: () => []
  },
  selectedNamespace: {
    type: String,
    default: ''
  },
  selectedResourceType: {
    type: String,
    default: ''
  },
  totalCount: {
    type: Number,
    default: 0
  }
})

defineEmits([
  'update:selectedNamespace', 
  'update:selectedResourceType',
  'reset-filters'
])
</script>
