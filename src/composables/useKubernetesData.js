import { ref, reactive, computed } from 'vue'
import { kubernetesApi, mockData } from '../services/kubernetesApi'

export function useKubernetesData() {
  // État réactif
  const state = reactive({
    deployments: [],
    cronjobs: [],
    statefulsets: [],
    namespaces: [],
    loading: false,
    error: null
  })

  // Filtres
  const selectedNamespace = ref('')
  const selectedResourceType = ref('')

  // Charger toutes les données
  async function loadAllData() {
    state.loading = true
    state.error = null

    try {
      const data = await kubernetesApi.getAllResources()
      
      state.deployments = data.deployments.deployments
      state.cronjobs = data.cronjobs.cronjobs
      state.statefulsets = data.statefulsets.statefulsets
      state.namespaces = data.namespaces.namespaces
    } catch (error) {
      state.error = `Impossible de charger les données: ${error.message}`
      console.warn('Utilisation des données de démonstration')
      
      // Utiliser les données de démonstration en cas d'erreur
      state.deployments = mockData.deployments
      state.cronjobs = mockData.cronjobs
      state.statefulsets = mockData.statefulsets
      state.namespaces = mockData.namespaces
    } finally {
      state.loading = false
    }
  }

  // Filtrer les ressources par namespace
  function getFilteredResources(resourceType) {
    let resources = []
    
    switch (resourceType) {
      case 'deployments':
        resources = state.deployments
        break
      case 'cronjobs':
        resources = state.cronjobs
        break
      case 'statefulsets':
        resources = state.statefulsets
        break
      default:
        return []
    }

    if (!selectedNamespace.value) {
      return resources
    }

    return resources.filter(resource => resource.namespace === selectedNamespace.value)
  }

  // Vérifier si un type de ressource doit être affiché
  function shouldShowResourceType(resourceType) {
    return !selectedResourceType.value || selectedResourceType.value === resourceType
  }

  // Computed properties
  const filteredDeployments = computed(() => getFilteredResources('deployments'))
  const filteredCronJobs = computed(() => getFilteredResources('cronjobs'))
  const filteredStatefulSets = computed(() => getFilteredResources('statefulsets'))

  const totalResourcesCount = computed(() => {
    let total = 0
    if (shouldShowResourceType('deployments')) {
      total += filteredDeployments.value.length
    }
    if (shouldShowResourceType('cronjobs')) {
      total += filteredCronJobs.value.length
    }
    if (shouldShowResourceType('statefulsets')) {
      total += filteredStatefulSets.value.length
    }
    return total
  })

  // Fonction pour actualiser les données
  function refreshData() {
    loadAllData()
  }

  // Réinitialiser les filtres
  function resetFilters() {
    selectedNamespace.value = ''
    selectedResourceType.value = ''
  }

  return {
    // État
    state,
    selectedNamespace,
    selectedResourceType,
    
    // Computed
    filteredDeployments,
    filteredCronJobs,
    filteredStatefulSets,
    totalResourcesCount,
    
    // Méthodes
    loadAllData,
    refreshData,
    resetFilters,
    getFilteredResources,
    shouldShowResourceType
  }
}
