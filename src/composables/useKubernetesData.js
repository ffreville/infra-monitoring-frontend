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

  // Fonction pour regrouper les déploiements par nom (méthode originale)
  function groupDeploymentsByName(deployments) {
    console.log('🚀 Grouping deployments:', deployments)
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
    
    const result = Object.values(grouped)
    console.log('✅ Grouped deployments result:', result)
    return result
  }

  // Fonction pour regrouper les CronJobs par nom
  function groupCronJobsByName(cronjobs) {
    console.log('🚀 Grouping cronjobs:', cronjobs)
    const grouped = {}
    
    cronjobs.forEach(cronjob => {
      const key = `${cronjob.namespace}-${cronjob.name}`
      if (!grouped[key]) {
        grouped[key] = {
          name: cronjob.name,
          namespace: cronjob.namespace,
          schedule: cronjob.schedule,
          lastRun: cronjob.lastRun,
          status: cronjob.status,
          clusterVersions: {}
        }
      }
      
      // Ajouter les informations pour ce cluster
      grouped[key].clusterVersions[cronjob.clusterId] = {
        version: cronjob.images?.[0] || 'N/A',
        status: cronjob.status,
        schedule: cronjob.schedule,
        lastRun: cronjob.lastRun,
        active: cronjob.active || 0,
        suspend: cronjob.suspend || false
      }
    })
    
    // S'assurer que tous les clusters sélectionnés ont une entrée
    Object.values(grouped).forEach(cronjob => {
      selectedClusters.value.forEach(clusterId => {
        if (!cronjob.clusterVersions[clusterId]) {
          cronjob.clusterVersions[clusterId] = {
            version: 'N/A',
            status: 'N/A',
            schedule: 'N/A',
            lastRun: 'N/A',
            active: 0,
            suspend: false
          }
        }
      })
    })
    
    const result = Object.values(grouped)
    console.log('✅ Grouped cronjobs result:', result)
    return result
  }

  // Fonction pour regrouper les StatefulSets par nom
  function groupStatefulSetsByName(statefulsets) {
    console.log('🚀 Grouping statefulsets:', statefulsets)
    const grouped = {}
    
    statefulsets.forEach(statefulset => {
      const key = `${statefulset.namespace}-${statefulset.name}`
      if (!grouped[key]) {
        grouped[key] = {
          name: statefulset.name,
          namespace: statefulset.namespace,
          status: statefulset.status,
          clusterVersions: {}
        }
      }
      
      // Ajouter les informations pour ce cluster
      grouped[key].clusterVersions[statefulset.clusterId] = {
        version: statefulset.images?.[0] || 'N/A',
        status: statefulset.status,
        ready: statefulset.ready,
        replicas: statefulset.replicas
      }
    })
    
    // S'assurer que tous les clusters sélectionnés ont une entrée
    Object.values(grouped).forEach(statefulset => {
      selectedClusters.value.forEach(clusterId => {
        if (!statefulset.clusterVersions[clusterId]) {
          statefulset.clusterVersions[clusterId] = {
            version: 'N/A',
            status: 'N/A',
            ready: 'N/A',
            replicas: 'N/A'
          }
        }
      })
    })
    
    const result = Object.values(grouped)
    console.log('✅ Grouped statefulsets result:', result)
    return result
  }

  // Charger les données des clusters sélectionnés
  async function loadAllData() {
    console.log('🔄 Loading data for clusters:', selectedClusters.value)
    
    if (selectedClusters.value.length === 0) {
      console.log('⚠️ No clusters selected, clearing data')
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
      console.log('📦 Raw data from API:', data)
      
      // Regrouper les ressources par nom
      state.deployments = groupDeploymentsByName(data.deployments)
      state.cronjobs = groupCronJobsByName(data.cronjobs)
      state.statefulsets = groupStatefulSetsByName(data.statefulsets)
      state.namespaces = data.namespaces

      console.log('📊 Final state:')
      console.log('  - Deployments:', state.deployments)
      console.log('  - CronJobs:', state.cronjobs)
      console.log('  - StatefulSets:', state.statefulsets)

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
      console.error('❌ Error loading data:', error)
      state.error = `Erreur générale: ${error.message}`
      console.warn('🔄 Using mock data')
      
      // Utiliser les données de démonstration en cas d'erreur complète
      state.deployments = groupDeploymentsByName(mockData.deployments)
      state.cronjobs = groupCronJobsByName(mockData.cronjobs)
      state.statefulsets = groupStatefulSetsByName(mockData.statefulsets)
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
  watch(selectedClusters, (newClusters, oldClusters) => {
    console.log('🔄 Selected clusters changed:', { old: oldClusters, new: newClusters })
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

    console.log(`🔍 Filtering ${resourceType}:`, resources)

    // Filtrer par namespace si nécessaire
    if (selectedNamespace.value) {
      resources = resources.filter(resource => resource.namespace === selectedNamespace.value)
    }

    console.log(`✅ Filtered ${resourceType}:`, resources)
    return resources
  }

  // Vérifier si un type de ressource doit être affiché
  function shouldShowResourceType(resourceType) {
    const shouldShow = !selectedResourceType.value || selectedResourceType.value === resourceType
    console.log(`👁️ Should show ${resourceType}:`, shouldShow)
    return shouldShow
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
