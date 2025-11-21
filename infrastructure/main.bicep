targetScope = 'subscription'

@description('The environment for the deployment.')
param environment 'prod' | 'test' | 'dev'

@description('The container image version to deploy to the container app.')
param imageVersion string

@description('Tags to apply to the resource group for management and organization.')
param tags object = {}

@description('The location for all resources. Should be left to default since it\'s the deployment that decides the location.')
param location string = deployment().location

var workload string = 'linkedin-profile-image'
var owner string = 'patric.jansson@magello.se'

var defaultTags = union(tags, {
  workload: workload
  environment: environment
  owner: owner
})

resource resourceGroup 'Microsoft.Resources/resourceGroups@2025-04-01' = {
  name: 'rg-${workload}-${environment}'
  location: location
  tags: defaultTags
}

module ca 'br:crmagello.azurecr.io/bicep/container-app:latest' = {
  name: 'DeployContainerApp'
  scope: resourceGroup
  params: {
    workload: workload
    environment: environment
    location: location
    deployment: {
      type: 'containerApp'
      image: 'crmagello.azurecr.io/${workload}:${imageVersion}'
      cpu: '0.25'
      memory: '0.5Gi'
    }
    ingress: {
      external: true
      targetPort: 80
      customDomain: environment == 'prod' ? '${workload}.magello.se' : '${workload}-${environment}.magello.se'
    }
  }
}
