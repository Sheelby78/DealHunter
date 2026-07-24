@description('Nazwa aplikacji DealHunter na Azure App Service.')
param appName string = 'dealhunter-app'

@description('Lokalizacja zasobów Azure.')
param location string = resourceGroup().location

@description('Rozmiar instancji App Service Plan (np. B1 dla Linux).')
param skuName string = 'B1'

@description('Token Telegram Bota.')
@secure()
param telegramBotToken string = ''

@description('Identyfikator czatu Telegram.')
param telegramChatId string = ''

@description('PIN do panelu webowego (Admin PIN).')
@secure()
param webPanelPin string = ''

var appServicePlanName = '${appName}-plan'
var webAppName = appName

resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: appServicePlanName
  location: location
  kind: 'linux'
  sku: {
    name: skuName
  }
  properties: {
    reserved: true
  }
}

resource webApp 'Microsoft.Web/sites@2023-12-01' = {
  name: webAppName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      alwaysOn: true
      linuxFxVersion: 'DOTNETCORE|10.0'
      appSettings: [
        {
          name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE'
          value: 'true'
        }
        {
          name: 'ConnectionStrings__DefaultConnection'
          value: 'Data Source=/home/data/dealhunter.db'
        }
        {
          name: 'Telegram__BotToken'
          value: telegramBotToken
        }
        {
          name: 'Telegram__ChatId'
          value: telegramChatId
        }
        {
          name: 'Panel__WebPanelPin'
          value: webPanelPin
        }
      ]
    }
  }
}

output webAppUrl string = 'https://${webApp.properties.defaultHostName}'
