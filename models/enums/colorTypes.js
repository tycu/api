require('enum').register();

// https://github.com/adrai/enum

var colorTypes = new Enum(
  { 'blue': 1,
    'red': 2
  }, {
    name: 'colorTypes',
    ignoreCase: true,
    freez: true
  }
);
