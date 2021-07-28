const { Expo } = require('expo-server-sdk');

const expo = new Expo();

module.exports = function $notificationService(
  errors,
  logger,
  notificationRepository,
  sendNotifications
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
    logger.info(`Adding ExpoToken for user ${userId}`);

    if (!Expo.isExpoPushToken(token))
      throw errors.create(
        400,
        `Push token ${token} is not a valid Expo push token`
      );

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
