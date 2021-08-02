module.exports = {
  logger: {
    format: 'local',
    http: {
      enabled: false
    }
  },
  monitoring: false,
  services: {
    apikeys: {
      enabled: false,
      baseUrl: 'http://apikeys-test/'
    },
    sc: {
      baseUrl: 'http://sc-test/'
    }
  }
};
