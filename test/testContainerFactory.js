const path = require('path');
const axios = require('axios');
const AxiosMockAdapter = require('axios-mock-adapter');
const containerFactory = require('../src/containerFactory');
const mockFetch = require('./support/mockFetch');

function createContainer() {
  const container = containerFactory.createContainer();
  const entries = ['support'];

  container.register('axiosMock', function $axiosMock() {
    return new AxiosMockAdapter(axios);
  });

  container.register('fetch', function $commonFetch(config) {
    return mockFetch(config);
  });

  entries.forEach((entry) => container.load(path.join(__dirname, entry)));

  return container;
}

module.exports = {
  createContainer
};
