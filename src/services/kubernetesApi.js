// Configuration de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// Fonction générique pour les appels API
async function apiCall(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`)
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`Erreur lors de l'appel à ${endpoint}:`, error)
    throw error
  }
}

// API Kubernetes
export const kubernetesApi = {
  // Récupérer les deployments
  async getDeployments() {
    return apiCall('/deployments')
  },

  // Récupérer les cronjobs
  async getCronJobs() {
    return apiCall('/cronjobs')
  },

  // Récupérer les statefulsets
  async getStatefulSets() {
    return apiCall('/statefulsets')
  },

  // Récupérer les namespaces
  async getNamespaces() {
    return apiCall('/namespaces')
  },

  // Récupérer toutes les données en parallèle
  async getAllResources() {
    try {
      const [deployments, cronjobs, statefulsets, namespaces] = await Promise.all([
        this.getDeployments(),
        this.getCronJobs(),
        this.getStatefulSets(),
        this.getNamespaces()
      ])

      return {
        deployments,
        cronjobs,
        statefulsets,
        namespaces
      }
    } catch (error) {
      console.error('Erreur lors du chargement des ressources:', error)
      throw error
    }
  }
}

// Données de démonstration pour le développement
export const mockData = {
  namespaces: [
    { name: 'default' },
    { name: 'kube-system' },
    { name: 'production' },
    { name: 'staging' },
    { name: 'monitoring' }
  ],

  deployments: [
    { name: 'nginx-deployment', namespace: 'default', replicas: 3, status: 'Running', ready: '3/3' },
    { name: 'api-server', namespace: 'production', replicas: 5, status: 'Running', ready: '5/5' },
    { name: 'frontend-app', namespace: 'staging', replicas: 2, status: 'Running', ready: '2/2' },
    { name: 'worker-service', namespace: 'production', replicas: 4, status: 'Running', ready: '4/4' },
    { name: 'auth-service', namespace: 'production', replicas: 2, status: 'Running', ready: '2/2' }
  ],

  cronjobs: [
    { name: 'backup-job', namespace: 'default', schedule: '0 2 * * *', status: 'Active', lastRun: '2024-01-15T02:00:00Z' },
    { name: 'cleanup-logs', namespace: 'production', schedule: '0 0 * * 0', status: 'Active', lastRun: '2024-01-14T00:00:00Z' },
    { name: 'report-generator', namespace: 'staging', schedule: '0 6 * * 1', status: 'Suspended', lastRun: '2024-01-08T06:00:00Z' },
    { name: 'db-backup', namespace: 'production', schedule: '0 3 * * *', status: 'Active', lastRun: '2024-01-15T03:00:00Z' }
  ],

  statefulsets: [
    { name: 'postgres-cluster', namespace: 'production', replicas: 3, status: 'Running', ready: '3/3' },
    { name: 'redis-cluster', namespace: 'default', replicas: 3, status: 'Running', ready: '3/3' },
    { name: 'elasticsearch', namespace: 'production', replicas: 5, status: 'Running', ready: '5/5' },
    { name: 'mongodb-replica', namespace: 'staging', replicas: 3, status: 'Running', ready: '2/3' }
  ]
}
