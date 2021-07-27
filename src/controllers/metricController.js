module.exports = function $metricController(expressify, metricService) {
  return expressify({
    getBasic,
    getEvents
  });

  async function getBasic(req, res) {
    const { userId } = req.query;
    const metrics = await metricService.getBasic(userId);

    return res.status(200).json(metrics);
  }

  async function getEvents(req, res) {
    const { userId, initialDate, finalDate } = req.query;
    const metrics = await metricService.getEventsBetween(
      initialDate,
      finalDate,
      userId
    );

    return res.status(200).json(metrics);
  }
};
