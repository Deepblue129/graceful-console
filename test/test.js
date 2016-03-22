// Copyright (c) 2016 Michael Petrochuk <Petrochukm@gmail.com>

// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

var _Console = require('./../index.js'),
    path = require('path'),
    console = new _Console('Generic tests');
console.log(JSON.stringify(console));

console.log('Something');

console.log('Log');
console.log('A string');
console.log('A manipulated string (%s) with number: %d', 'apple', 42);
console.log(1);
console.log(true);
console.log({me:1});
console.log([1,2,3]);
console.log('');
console.log(new Date);
console.log(/abc/);

console.tag('log').log('Log');
console.tag('string').log('A string');
console.tag('printf').log('A manipulated string (%s) with number: %d', 'apple', 42);
console.tag('number').log(1);
console.tag('boolean').log(true);
console.tag('object').log({me:1});
console.tag('array').log([1,2,3]);
console.tag('string').log('');

console.tag('log').info('Log');
console.tag('string').info('A string');
console.tag('printf').info('A manipulated string (%s) with number: %d', 'apple', 42);
console.tag('number').info(1);
console.tag('boolean').info(true);
console.tag('object').info({me:1});
console.tag('array').info([1,2,3]);
console.tag('string').info('');

console.info('Information');
console.info('A string');
console.info('A manipulated string (%s) with number: %d', 'apple', 42);
console.info(1);
console.info(true);
console.info({me:1});
console.info([1,2,3]);
console.info('');

console.warn('Warning');
console.warn('A string');
console.warn('A manipulated string (%s) with number: %d', 'apple', 42);
console.warn(1);
console.warn(true);
console.warn({me:1});
console.warn([1,2,3]);
console.warn('');

console.error('Error');
console.error('A string');
console.error('A manipulated string (%s) with number: %d', 'apple', 42);
console.error(1);
console.error(true);
console.error({me:1});
console.error([1,2,3]);
console.error('');
console.error(new Error("Errorrrs"));

// Options test
console.tag('Sort Test Array').options({sort: true}).log([1, 3, 2]);
console.tag('Sort Test Object').options({sort: true}).log({1: 'a', 3: 'c', 2: 'b'});
console.tag('Sort Test Function Inveser').options({sort: function(a, b) { return b.value.charCodeAt(0) - a.value.charCodeAt(0)}}).log({1: 'a', 3: 'c', 2: 'b'});

// Time Test
console = new _Console('Time Test', {time: true});
console.log('Log');
console.log('A string');
console.log('A manipulated string (%s) with number: %d', 'apple', 42);
console.log(1);
console.log(true);
console.log({me:1});
console.log([1,2,3]);
console.log('');

// Stack Test
console = new _Console('No Stack Test', {stack: false});
console.log('Log');
console.log('A string');
console.log('A manipulated string (%s) with number: %d', 'apple', 42);
console.log(1);
console.log(true);
console.log({me:1});
console.log([1,2,3]);
console.log('');

// Write Test
console = new _Console('No Stack Test', {write: path.join(__dirname, 'log.txt')});
console.log('Log');
console.log('A string');
console.log('A manipulated string (%s) with number: %d', 'apple', 42);
console.log(1);
console.log(true);
console.log({me:1});
console.log([1,2,3]);
console.log('');


// console.time("asd");
// console.timeEnd("asd");

console = new _Console('Level Test', {lvl: _Console.CRITICAL});
console.error('Should See');
console.critical('Should See');
console.warn('Should not see');
console.log('Should not see');
console.info('Should not see');



console.assert(true);
console.assert(false);