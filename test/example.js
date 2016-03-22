var _Console = require('./../index.js');
var console = new _Console('frog logs');

console.tag('test').log('the frog jumped the boat');
console.warn({frog:1, water: 0});
console.error('it drowned');
console.tag('Sort Frog Array').sort(true).log(['Frog1', 'Frog3', 'Frog2']);

console.tag('Sort Test Array').sort(true).log([1, 3, 2]);
console.tag('Sort Test Object').options(true).log({1: 'a', 3: 'c', 2: 'b'});
console.tag('Sort Test Function Inveser').sort(function(a, b) { return b.value.charCodeAt(0) - a.value.charCodeAt(0)}).log({1: 'a', 3: 'c', 2: 	'b'});