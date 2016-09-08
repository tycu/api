require('enum').register();

// https://github.com/adrai/enum

module.exports = new Enum(
  { 'undecided': 1,
    'blue': 2,
    'red': 3,
    'independent': 4
  }, {
    name: 'colorTypes',
    ignoreCase: true,
    freez: true
  }
);
