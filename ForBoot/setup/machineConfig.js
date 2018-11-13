exports.config = {
  piFig: {
    /*wifiHotspot: {
      ssid: 'Template',
      password: 'template!',
      domainName: 'template.net',
    },*/
    appRepo: 'https://github.com/heidgera/waterWallServerPXE',
    wiredRouter: {
      domainName: 'waterwall.net',
    },
    autostart: true,
    gitWatch: true,
    softShutdown: {
      monitorPin: 24,
      controlPin: 23,
      delayTime: 1000,
    },
    /*wifi: {
      ssid: 'SensorServer',
      password: 'defaultPass',
    },*/
  },
};
