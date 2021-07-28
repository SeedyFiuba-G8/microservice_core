const { Expo } = require('expo-server-sdk');

module.exports = function $notificationService(
  errors,
  logger,
  notificationRepository,
  sendNotifications,
  scGateway,
  walletRepository
) {
  return {
    pushMessage,
    pushToken
  };

  /**
   *
   * @param {String} userId
   * @param {String} token
   * @returns {Promise}
   */
  async function pushToken(userId, token) {
    if (!Expo.isExpoPushToken(token))
      throw errors.create(
        400,
        `Push token ${token} is not a valid Expo push token`
      );

    logger.info(`Adding ExpoToken for user ${userId}`);

    await scGateway.pushToken(await walletRepository.get(userId), token);

    return notificationRepository.push(userId, token);
  }

  async function pushMessage(fromUser, userId, message) {
    const toUserTokens = await notificationRepository.get(userId);
    const notifications = [];

    logger.info(
      `Sending message: '${message}' from username ${fromUser} to user id ${userId}`
    );

    toUserTokens.forEach((token) =>
      notifications.push({
        to: token,
        sound: 'default',
        title: fromUser,
        body: message
      })
    );

    return sendNotifications(notifications);
  }
};
