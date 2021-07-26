module.exports = function $eventRepository(dbUtils, knex) {
  return {
    count,
    log
  };

  function count(event, initialDate, finalDate, userId) {
    let query = knex('events')
      .count('event')
      .where('event', event)
      .whereBetween('date', [initialDate, finalDate]);

    if (userId) query = query.where('user_id', userId);

    return query.then((result) => Number(result[0].count));
  }

  async function log(event, userId) {
    const row = { event, date: new Date() };
    if (userId) row.userId = userId;

    await knex('events').insert(dbUtils.mapToDb(row));
  }
};
