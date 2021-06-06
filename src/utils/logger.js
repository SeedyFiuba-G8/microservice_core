const winston = require('winston');

module.exports = function loggerFactory(config) {
  // eslint-disable-next-line arrow-body-style
  const timezone = () => {
    return new Date().toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires'
    });
  };

  const getFormatter = () =>
    winston.format.printf(
      (info) => `[${info.timestamp}] (${info.level}) ${info.message}`
    );

  const addConsoleTransport = (logger) => {
    logger.add(new winston.transports.Console(config.log.console));
  };

  const logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp({ format: timezone }),
      winston.format.colorize({ all: true }),
      winston.format.splat(),
      getFormatter()
    )
  });

  const transports = [
    {
      type: 'console',
      adder: addConsoleTransport
    }
    // Here we can add transports to log in files (in prod, for example), and even
    // distinguish between logging levels to diferents transports.
  ];

  transports.forEach((transport) => {
    if (config.log[transport.type] && config.log[transport.type].enabled) {
      transport.adder(logger);
    }
  });

  return logger;
};
