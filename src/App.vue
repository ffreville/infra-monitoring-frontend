<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header -->
    <KubernetesHeader 
      :loading="state.loading" 
      @refresh="refreshData" 
    />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Sélecteur de clusters -->
      <div class="px-4 sm:px-0">
        <ClusterSelector
          v-model:selected-clusters="selectedClusters"
          :cluster-statuses="state.clusterStatuses"
          :cluster-errors="state.clusterErrors"
        />
      </div>

      <!-- Filtres -->
      <div class="px-4 py-6 sm:px-0">
        <ResourceFilters
          :namespaces="state.namespaces"
          v-model:selected-namespace="selectedNamespace"
          v-model:selected-resource-type="selectedResourceType"
          :total-count="totalResourcesCount"
          @reset-filters="resetFilters"
        />
      </div>

      <!-- Message d'erreur -->
      <Transition name="fade">
        <div v-if="state.error && selectedClusters.length > 0" class="px-4 sm:px-0 mb-6">
          <div class="bg-red-50 border border-red-200 rounded-md p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path 
                    fill-rule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                    clip-rule="evenodd" 
                  />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Erreur de chargement</h3>
                <p class="mt-1 text-sm text-red-700">{{ state.error }}</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Message si aucun cluster sélectionné -->
      <div v-if="selectedClusters.length === 0" class="px-4 sm:px-0">
        <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-center">
          <p class="text-sm text-yellow-800">
            Veuillez sélectionner au moins un cluster pour afficher les ressources.
          </p>
        </div>
      </div>

      <!-- Cartes de ressources -->
      <div v-else class="px-4 sm:px-0">
        <div class="grid grid-cols-1 gap-6">
          <!-- Deployments -->
          <Transition name="slide">
            <ResourceCard
              v-if="shouldShowResourceType('deployments')"
              title="Deployments"
              type="deployments"
              :resources="filteredDeployments"
              empty-message="Aucun deployment trouvé"
            >
              <template #default="{ resources }">
                <DeploymentCard
                  v-for="deployment in resources"
                  :key="`${deployment.clusterId}-${deployment.namespace}-${deployment.name}`"
                  :deployment="deployment"
                  @view-details="handleViewDetails"
                  @scale="handleScale"
                />
              </template>
            </ResourceCard>
          </Transition>

          <!-- CronJobs -->
          <Transition name="slide">
            <ResourceCard
              v-if="shouldShowResourceType('cronjobs')"
              title="CronJobs"
              type="cronjobs"
              :resources="filteredCronJobs"
              empty-message="Aucun cronjob trouvé"
            >
              <template #default="{ resources }">
                <CronJobCard
                  v-for="cronjob in resources"
                  :key="`${cronjob.clusterId}-${cronjob.namespace}-${cronjob.name}`"
                  :cronjob="cronjob"
                  @view-details="handleViewDetails"
                  @trigger="handleTrigger"
                />
              </template>
            </ResourceCard>
          </Transition>

          <!-- StatefulSets -->
          <Transition name="slide">
            <ResourceCard
              v-if="shouldShowResourceType('statefulsets')"
              title="StatefulSets"
              type="statefulsets"
              :resources="filteredStatefulSets"
              empty-message="Aucun statefulset trouvé"
            >
              <template #default="{ resources }">
                <StatefulSetCard
                  v-for="statefulset in resources"
                  :key="`${statefulset.clusterId}-${statefulset.namespace}-${statefulset.name}`"
                  :statefulset="statefulset"
                  @view-details="handleViewDetails"
                  @scale="handleScale"
                />
              </template>
            </ResourceCard>
          </Transition>
        </div>
      </div>

      <!-- État de chargement -->
      <Transition name="fade">
        <div v-if="state.loading && !state.error" class="px-4 sm:px-0">
          <LoadingSpinner />
        </div>
      </Transition>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useKubernetesData } from './composables/useKubernetesData'

// Composants
import KubernetesHeader from './components/KubernetesHeader.vue'
import ClusterSelector from './components/ClusterSelector.vue'
import ResourceFilters from './components/ResourceFilters.vue'
import ResourceCard from './components/ResourceCard.vue'
import DeploymentCard from './components/DeploymentCard.vue'
import CronJobCard from './components/CronJobCard.vue'
import StatefulSetCard from './components/StatefulSetCard.vue'
import LoadingSpinner from './components/LoadingSpinner.vue'

// Composable pour la gestion des données
const {
  state,
  selectedNamespace,
  selectedResourceType,
  selectedClusters,
  filteredDeployments,
  filteredCronJobs,
  filteredStatefulSets,
  totalResourcesCount,
  loadAllData,
  refreshData,
  resetFilters,
  shouldShowResourceType
} = useKubernetesData()

// Gestionnaires d'événements
function handleViewDetails(resource) {
  console.log('Voir les détails de:', resource)
  // Ici vous pourriez ouvrir une modal ou naviguer vers une page de détails
}

function handleScale(resource) {
  console.log('Scale resource:', resource)
  // Ici vous pourriez ouvrir une modal pour modifier le nombre de réplicas
}

function handleTrigger(cronjob) {
  console.log('Déclencher cronjob:', cronjob)
  // Ici vous pourriez déclencher manuellement le cronjob
}

// Charger les données au montage
onMounted(() => {
  loadAllData()
})
</script>
