const { endOfLine } = require("./.prettierrc")

/* eslint-disable prettier/prettier */
module.exports = {
  root: true,
  extends: '@react-native',
  rules:{
    'prettier/prettier':{

      "error":{endOfLine:"auto"},
    }
  },
};

