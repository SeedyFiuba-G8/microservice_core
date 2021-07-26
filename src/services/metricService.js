module.exports = function $metricService(
  projectRepository,
  errors,
  events,
  eventRepository
) {
  return {
    getBasic,
    getEventsBetween
  };

  async function getBasic(userId) {
    const additionalFilters = {};
    if (userId !== undefined) additionalFilters.userId = userId;

    const [draft, funding, inProgress, completed] = await Promise.all([
      projectRepository.count({
        filters: {
          ...additionalFilters,
          status: 'DRAFT'
        }
      }),
      projectRepository.count({
        filters: {
          ...additionalFilters,
          status: 'FUNDING'
        }
      }),
      projectRepository.count({
        filters: {
          ...additionalFilters,
          status: 'IN_PROGRESS'
        }
      }),
      projectRepository.count({
        filters: {
          ...additionalFilters,
          status: 'COMPLETED'
        }
      })
    ]);

    return {
      total: draft + funding + inProgress + completed,
      draft,
      funding,
      inProgress,
      completed
    };
  }

  async function getEventsBetween(rawInitialDate, rawFinalDate, userId) {
    const { initialDate, finalDate } = parseDates(rawInitialDate, rawFinalDate);

    const eventNames = ['CREATE', 'PUBLISH'];

    const [
      // Projects
      createdProjects,
      publishedProjects
    ] = await Promise.all(
      eventNames.map((event) =>
        eventRepository.count(events[event], initialDate, finalDate, userId)
      )
    );

    return {
      create: createdProjects,
      publish: publishedProjects
    };
  }

  // Aux
  function parseDates(rawInitialDate, rawFinalDate) {
    if (rawInitialDate === undefined) throw errors.create(400, 'Invalid dates');

    const initialDate = new Date(rawInitialDate);
    const finalDate =
      rawFinalDate === undefined ? new Date() : new Date(rawFinalDate);

    if (
      !isValidDate(initialDate) ||
      !isValidDate(finalDate) ||
      initialDate > finalDate ||
      finalDate > new Date()
    )
      throw errors.create(400, 'Invalid dates');

    return { initialDate, finalDate };
  }

  function isValidDate(d) {
    // eslint-disable-next-line
    return d instanceof Date && !isNaN(d);
  }
};
