require('enum').register();

// https://github.com/adrai/enum
// http://www.fec.gov/pages/brochures/contrib.shtml

const pacTypes = new Enum(
  { 'A': 1,
    'B': 2,
    'C': 4
  }, {
    name: 'pacTypes',
    ignoreCase: true,
    freez: true
  }
);
