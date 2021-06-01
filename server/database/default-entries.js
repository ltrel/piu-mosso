module.exports.add = ({models}) => {
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
    models.Instrument.create({instrument: instrumentName});
  }
};
