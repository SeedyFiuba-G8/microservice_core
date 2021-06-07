const containerFactory = require('./containerFactory');

function main() {
  containerFactory
    .createContainer()
    .resolve(function start(app, config, logger) {
      const { port, host } = config.express;

      app.listen(port, host, () => {
        logger.info(`Listening on ${host}:${port}...`);
      });
    });
}

if (require.main === module) {
  main();
}
