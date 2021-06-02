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
    await models.Instrument.create({instrument: instrumentName});
  }
};
