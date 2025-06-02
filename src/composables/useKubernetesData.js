import { ref, reactive, computed, watch } from 'vue'
import { kubernetesApi, mockData } from '../services/kubernetesApi'
import { clusters } from '../config/clusters'

export function useKubernetesData() {
  // État réactif
  const state = reactive({
    deployments: [],
    cronjobs: [],
    statefulsets: [],
    namespaces: [],
    loading: false,
    error: null,
    clusterStatuses: {}, // { clusterId: 'loading' | 'success' | 'error' }
    clusterErrors: {} // { clusterId: errorMessage }
  })

  // Filtres
  const selectedNamespace = ref('')
  const selectedResourceType = ref('')
  const selectedClusters = ref([]) // Aucun cluster sélectionné par défaut

  // Fonction pour regrouper les déploiements par nom
  function groupDeploymentsByName(deployments) {
    const grouped = {}
    
    // Initialiser les groupes avec tous les déploiements uniques
    deployments.forEach(deployment => {
      const key = `${deployment.namespace}-${deployment.name}`
      if (!grouped[key]) {
        grouped[key] = {
          name: deployment.name,
          namespace: deployment.namespace,
          status: deployment.status,
          ready: deployment.ready,
          replicas: deployment.replicas,
          clusterVersions: {} // { clusterId: { version, status, ready } }
        }
      }
      
      // Ajouter les informations de version pour ce cluster
      grouped[key].clusterVersions[deployment.clusterId] = {
        version: deployment.images?.[0] || 'N/A',
        status: deployment.status,
        ready: deployment.ready,
        replicas: deployment.replicas
      }
    })
    
    // S'assurer que tous les clusters sélectionnés ont une entrée (même vide)
    Object.values(grouped).forEach(deployment => {
      selectedClusters.value.forEach(clusterId => {
        if (!deployment.clusterVersions[clusterId]) {
          deployment.clusterVersions[clusterId] = {
            version: 'N/A',
            status: 'N/A',
            ready: 'N/A',
            replicas: 'N/A'
          }
        }
      })
    })
    
    return Object.values(grouped)
  }

  // Charger les données des clusters sélectionnés
  async function loadAllData() {
    if (selectedClusters.value.length === 0) {
      state.deployments = []
      state.cronjobs = []
      state.statefulsets = []
      state.namespaces = []
      return
    }

    state.loading = true
    state.error = null
    state.clusterStatuses = {}
    state.clusterErrors = {}

    // Marquer tous les clusters sélectionnés comme en cours de chargement
    selectedClusters.value.forEach(clusterId => {
      state.clusterStatuses[clusterId] = 'loading'
    })

    try {
      const data = await kubernetesApi.getAllClustersResources(selectedClusters.value)
      
      // Regrouper les déploiements par nom
      state.deployments = groupDeploymentsByName(data.deployments)
      state.cronjobs = data.cronjobs
      state.statefulsets = data.statefulsets
      state.namespaces = data.namespaces

      // Mettre à jour les statuts des clusters
      selectedClusters.value.forEach(clusterId => {
        const hasError = data.errors?.some(e => e.cluster === clusters.find(c => c.id === clusterId)?.name)
        if (hasError) {
          const error = data.errors.find(e => e.cluster === clusters.find(c => c.id === clusterId)?.name)
          state.clusterStatuses[clusterId] = 'error'
          state.clusterErrors[clusterId] = error.error
        } else {
          state.clusterStatuses[clusterId] = 'success'
        }
      })

      // S'il y a des erreurs mais aussi des données, on affiche un message d'avertissement
      if (data.errors && data.errors.length > 0) {
        const failedClusters = data.errors.map(e => e.cluster).join(', ')
        state.error = `Impossible de charger les données de certains clusters: ${failedClusters}`
      }
    } catch (error) {
      state.error = `Erreur générale: ${error.message}`
      console.warn('Utilisation des données de démonstration')
      
      // Utiliser les données de démonstration en cas d'erreur complète
      state.deployments = groupDeploymentsByName(mockData.deployments)
      state.cronjobs = mockData.cronjobs
      state.statefulsets = mockData.statefulsets
      state.namespaces = mockData.namespaces

      // Marquer tous les clusters comme en erreur
      selectedClusters.value.forEach(clusterId => {
        state.clusterStatuses[clusterId] = 'error'
        state.clusterErrors[clusterId] = error.message
      })
    } finally {
      state.loading = false
    }
  }

  // Recharger quand les clusters sélectionnés changent
  watch(selectedClusters, () => {
    loadAllData()
  }, { deep: true })

  // Filtrer les ressources par namespace et cluster
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

    // Filtrer par namespace si nécessaire
    if (selectedNamespace.value) {
      resources = resources.filter(resource => resource.namespace === selectedNamespace.value)
    }

    return resources
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

  // Obtenir les clusters disponibles
  function getAvailableClusters() {
    return clusters
  }

  return {
    // État
    state,
    selectedNamespace,
    selectedResourceType,
    selectedClusters,
    
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
    shouldShowResourceType,
    getAvailableClusters
  }
}
