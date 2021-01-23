// in the case that all the distribution js bundles need to be concatenated into one

var concat = require('concat');
const es5 = ['./dist/runtime-es5.js','./dist/polyfills-es5.js','./dist/main-es5.js'];
const es2015= ['./dist/runtime-es2015.js','./dist/polyfills-es2015.js','./dist/main-es2015.js'];
concat(es5, './dist/elements-es5.js');
concat(es2015, './dist/elements-es2015.js');