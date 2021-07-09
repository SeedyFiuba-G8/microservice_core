const path = require('path');
const containerFactory = require('../src/containerFactory');

function createContainer() {
  const container = containerFactory.createContainer();
  const entries = ['support'];

  entries.forEach((entry) => container.load(path.join(__dirname, entry)));

  return container;
}

module.exports = {
  createContainer
};
