module.exports.add = async ({models}) => {
  const instrumentNames = [
    'piano',
    'violin',
    'viola',
    'cello',
    'double bass',
    'guitar',
    'bass guitar',
    'voice',
    'flute',
    'piccolo',
    'clarinet',
    'saxophone',
    'oboe',
    'bassoon',
    'trumpet',
    'trombone',
    'tuba',
    'drums',
    'mallet percussion',
  ];
  for (const instrumentName of instrumentNames) {
    // Add if not already in the database.
    await models.Instrument.findOrCreate({
      where: {instrument: instrumentName},
    });
  }
};
