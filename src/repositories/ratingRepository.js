const _ = require('lodash');

module.exports = function $ratingRepository(dbUtils, knex) {
  return {
    get,
    patch
  };

  async function get(projectId) {
    const ratings = await knex('ratings')
      .where(dbUtils.mapToDb({ projectId }))
      .select(['rating'])
      .then((results) => results.map(({ rating }) => rating));

    const { length: samples } = ratings;
    const sum = ratings.reduce((a, b) => a + b, 0);
    const mean = samples > 0 ? sum / samples : 0;

    return {
      samples,
      mean
    };
  }

  async function patch(ratingData) {
    // Delete value if it exists
    const rowsMatch = _.omit(ratingData, ['rating']);
    await knex('ratings').where(dbUtils.mapToDb(rowsMatch)).del();

    // Add value asked
    await knex('ratings').insert(dbUtils.mapToDb(ratingData));
  }
};
