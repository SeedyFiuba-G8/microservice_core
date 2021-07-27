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
      baseUrl: 'http://apikeys-test/'
    },
    sc: {
      baseUrl: 'http://sc-test/'
    }
  }
};
