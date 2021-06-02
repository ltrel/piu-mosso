module.exports.add = async ({models}) => {
  const instrumentNames = [
    'piano',
    'violin',
    'viola',
    'cello',
    'guitar',
    'voice',
    'flute',
    'clarinet',
    'saxophone',
    'oboe',
    'bassoon',
    'trumpet',
    'trombone',
    'tuba',
  ];
  for (const instrumentName of instrumentNames) {
    // Add if not already in the database.
    await models.Instrument.findOrCreate({
      where: {instrument: instrumentName},
    });
  }
};
