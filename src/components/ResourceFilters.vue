<template>
  <div class="bg-white rounded-lg shadow p-6 mb-6">
    <div class="flex flex-col gap-6">
      <!-- En-tête avec compteur et reset -->
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-900">Filtres</h3>
        <div class="flex items-center gap-4">
          <div class="text-sm text-gray-500">
            <span class="font-medium">{{ totalCount }}</span> 
            ressource(s) trouvée(s)
          </div>
          <button
            @click="$emit('reset-filters')"
            class="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      <!-- Filtres principaux -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Filtre par namespaces -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            Namespaces
            <span v-if="selectedNamespaces.length > 0" class="text-blue-600">
              ({{ selectedNamespaces.length }} sélectionné{{ selectedNamespaces.length > 1 ? 's' : '' }})
            </span>
          </label>
          <div class="border border-gray-200 rounded-md p-3 max-h-48 overflow-y-auto">
            <div class="space-y-2">
              <!-- Option "Tous les namespaces" -->
              <label class="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                <input
                  type="checkbox"
                  :checked="selectedNamespaces.length === 0"
                  @change="toggleAllNamespaces"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span class="ml-2 text-sm text-gray-700 font-medium">
                  Tous les namespaces
                </span>
              </label>
              
              <!-- Séparateur -->
              <hr class="border-gray-200">
              
              <!-- Namespaces individuels -->
              <label 
                v-for="ns in namespaces" 
                :key="ns.name"
                class="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded"
              >
                <input
                  type="checkbox"
                  :value="ns.name"
                  :checked="selectedNamespaces.includes(ns.name)"
                  @change="toggleNamespace(ns.name)"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span class="ml-2 text-sm text-gray-700">{{ ns.name }}</span>
              </label>
            </div>
          </div>
        </div>
        
        <!-- Filtre par types de ressources -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            Types de ressources
            <span v-if="selectedResourceTypes.length > 0" class="text-blue-600">
              ({{ selectedResourceTypes.length }} sélectionné{{ selectedResourceTypes.length > 1 ? 's' : '' }})
            </span>
          </label>
          <div class="border border-gray-200 rounded-md p-3">
            <div class="space-y-2">
              <!-- Option "Toutes les ressources" -->
              <label class="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                <input
                  type="checkbox"
                  :checked="selectedResourceTypes.length === 0"
                  @change="toggleAllResourceTypes"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span class="ml-2 text-sm text-gray-700 font-medium">
                  Toutes les ressources
                </span>
              </label>
              
              <!-- Séparateur -->
              <hr class="border-gray-200">
              
              <!-- Types de ressources -->
              <label 
                v-for="resourceType in resourceTypes" 
                :key="resourceType.value"
                class="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded"
              >
                <input
                  type="checkbox"
                  :value="resourceType.value"
                  :checked="selectedResourceTypes.includes(resourceType.value)"
                  @change="toggleResourceType(resourceType.value)"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div class="ml-2 flex items-center">
                  <div 
                    class="w-3 h-3 rounded-full mr-2" 
                    :class="resourceType.colorClass"
                  ></div>
                  <span class="text-sm text-gray-700">{{ resourceType.label }}</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtres avancés -->
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

          <!-- Indicateurs de filtres actifs -->
          <div class="flex flex-wrap gap-2">
            <!-- Indicateur namespaces -->
            <div v-if="selectedNamespaces.length > 0" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd" />
              </svg>
              {{ selectedNamespaces.length }} namespace{{ selectedNamespaces.length > 1 ? 's' : '' }}
            </div>

            <!-- Indicateur types de ressources -->
            <div v-if="selectedResourceTypes.length > 0" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
              </svg>
              {{ selectedResourceTypes.length }} type{{ selectedResourceTypes.length > 1 ? 's' : '' }}
            </div>

            <!-- Indicateur versions différentes -->
            <div v-if="showOnlyDifferentVersions" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              Versions différentes
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  namespaces: {
    type: Array,
    default: () => []
  },
  selectedNamespaces: {
    type: Array,
    default: () => []
  },
  selectedResourceTypes: {
    type: Array,
    default: () => []
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

const emit = defineEmits([
  'update:selectedNamespaces', 
  'update:selectedResourceTypes',
  'update:showOnlyDifferentVersions',
  'reset-filters'
])

// Types de ressources disponibles
const resourceTypes = [
  { 
    value: 'deployments', 
    label: 'Deployments', 
    colorClass: 'bg-green-500' 
  },
  { 
    value: 'cronjobs', 
    label: 'CronJobs', 
    colorClass: 'bg-yellow-500' 
  },
  { 
    value: 'statefulsets', 
    label: 'StatefulSets', 
    colorClass: 'bg-purple-500' 
  }
]

function toggleNamespace(namespace) {
  const current = [...props.selectedNamespaces]
  const index = current.indexOf(namespace)
  
  if (index > -1) {
    current.splice(index, 1)
  } else {
    current.push(namespace)
  }
  
  emit('update:selectedNamespaces', current)
}

function toggleAllNamespaces() {
  if (props.selectedNamespaces.length === 0) {
    // Si aucun n'est sélectionné, on ne fait rien (garde "tous")
    return
  } else {
    // Si certains sont sélectionnés, on désélectionne tout
    emit('update:selectedNamespaces', [])
  }
}

function toggleResourceType(resourceType) {
  const current = [...props.selectedResourceTypes]
  const index = current.indexOf(resourceType)
  
  if (index > -1) {
    current.splice(index, 1)
  } else {
    current.push(resourceType)
  }
  
  emit('update:selectedResourceTypes', current)
}

function toggleAllResourceTypes() {
  if (props.selectedResourceTypes.length === 0) {
    // Si aucun n'est sélectionné, on ne fait rien (garde "tous")
    return
  } else {
    // Si certains sont sélectionnés, on désélectionne tout
    emit('update:selectedResourceTypes', [])
  }
}
</script>
