const mergeResults = require('wdio-mochawesome-reporter/mergeResults');
mergeResults('./reports/json', /results.*\.json/, 'merged.json');
