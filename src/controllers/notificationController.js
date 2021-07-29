module.exports = function $notificationController(
  expressify,
  notificationService
) {
  return expressify({
    pushMessage,
    pushToken,
    removeToken
  });

  async function pushToken(req, res) {
    const { userId } = req.params;
    const { token } = req.body;
    await notificationService.pushToken(userId, token);
    return res.status(200).json(userId);
  }

  async function pushMessage(req, res) {
    const { userId } = req.params;
    const { fromUser, message } = req.body;
    await notificationService.pushMessage(fromUser, userId, message);
    return res.status(200).json(userId);
  }

  async function removeToken(req, res) {
    const { userId } = req.params;
    const expoToken = req.headers['expo-token'];
    await notificationService.removeToken(userId, expoToken);
    return res.status(200).json();
  }
};
