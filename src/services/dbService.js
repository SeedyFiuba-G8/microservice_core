// module.exports = function dbService(logger) {
//   /**
//    * Health status
//    *
//    * @returns {Promise<boolean>}
//    */
//   function getDatabaseHealth(timeout = 1000) {
//     return usersRepository
//       .getVersion()
//       .timeout(timeout)
//       .then(() => true)
//       .catch((err) => {
//         logger.error('dbService:', err);
//         return false;
//       });
//   }

//   return {
//     getDatabaseHealth
//   };
// };
