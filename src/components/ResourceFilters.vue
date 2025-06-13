<template>
  <div class="bg-white rounded-lg shadow p-6 mb-6">
    <div class="flex flex-col gap-4">
      <!-- Première ligne : filtres principaux -->
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

      <!-- Deuxième ligne : filtres avancés -->
      <div class="border-t border-gray-200 pt-4">
        <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <!-- Case à cocher pour versions différentes -->
          <div class="flex items-center">
            <input
              id="different-versions-filter"
              type="checkbox"
              :checked="showOnlyDifferentVersions"
              @change="$emit('update:showOnlyDifferentVersions', $event.target.checked)"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label 
              for="different-versions-filter" 
              class="ml-2 text-sm text-gray-700 cursor-pointer"
            >
              Afficher uniquement les ressources avec des versions différentes
            </label>
          </div>

          <!-- Indicateur si le filtre est actif -->
          <div v-if="showOnlyDifferentVersions" class="flex items-center">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
              </svg>
              Versions différentes uniquement
            </span>
          </div>
        </div>
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
  showOnlyDifferentVersions: {
    type: Boolean,
    default: false
  },
  totalCount: {
    type: Number,
    default: 0
  }
})

defineEmits([
  'update:selectedNamespace', 
  'update:selectedResourceType',
  'update:showOnlyDifferentVersions',
  'reset-filters'
])
</script>
