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

'use strict';

let path = require('path');
global.console = require('./../index.js');

scribe.break();

scribe.log(true);
scribe.log(false);
scribe.log('Log');
scribe.log('A string');
scribe.log('A manipulated string (%s) with number: %d', 'apple', 42);
scribe.log(1);
scribe.log(true);
scribe.log({me:1});
scribe.log([1,2,3]);
scribe.log('');
scribe.log(new Date);
scribe.log(/abc/);

scribe.tag('log').log('Log');
scribe.tag('string').log('A string');
scribe.tag('printf').log('A manipulated string (%s) with number: %d', 'apple', 42);
scribe.tag('number').log(1);
scribe.tag('boolean').log(true);
scribe.tag('object').log({me:1});
scribe.tag('array').log([1,2,3]);
scribe.tag('string').log('');

scribe.tag('log').info('Log');
scribe.tag('string').info('A string');
scribe.tag('printf').info('A manipulated string (%s) with number: %d', 'apple', 42);
scribe.tag('number').info(1);
scribe.tag('boolean').info(true);
scribe.tag('object').info({me:1});
scribe.tag('array').info([1,2,3]);
scribe.tag('string').info('');

scribe.info('Information');
scribe.info('A string');
scribe.info('A manipulated string (%s) with number: %d', 'apple', 42);
scribe.info(1);
scribe.info(true);
scribe.info({me:1});
scribe.info([1,2,3]);
scribe.info('');

scribe.warn('Warning');
scribe.warn('A string');
scribe.warn('A manipulated string (%s) with number: %d', 'apple', 42);
scribe.warn(1);
scribe.warn(true);
scribe.warn({me:1});
scribe.warn([1,2,3]);
scribe.warn('');

scribe.error('Error');
scribe.error('A string');
scribe.error('A manipulated string (%s) with number: %d', 'apple', 42);
scribe.error(1);
scribe.error(true);
scribe.error({me:1});
scribe.error([1,2,3]);
scribe.error('');
scribe.error(new Error("Errorrrs"));

// Options test
scribe.tag('Sort Test Array').sort().log([1, 3, 2]);
scribe.tag('Sort Test Object').sort().log({1: 'a', 3: 'c', 2: 'b'});
scribe.tag('Sort Test Function Inveser').sort(function(a, b) { return b.value.charCodeAt(0) - a.value.charCodeAt(0) }).log({1: 'a', 3: 'c', 2: 'b'});

// Chunk test
scribe.tag('chunk').chunk(() => {
	scribe.log(true);
	scribe.log(false);
	scribe.tag('string').log('A string');
	scribe.tag('printf').log('A manipulated string (%s) with number: %d', 'apple', 42);
	scribe.tag('number').log(1);
	scribe.log(1);
	scribe.log(true);
	scribe.log({me:1});
	scribe.log([1,2,3]);
	scribe.error([1,2,3]);
	scribe.error('');
	scribe.error(new Error("Errorrrs"));
	scribe.tag('Sort Test Array').sort().log([1, 3, 2]);
	scribe.tag('Sort Test Object').sort().log({1: 'a', 3: 'c', 2: 'b'});
	scribe.tag('Sort Test Function Inveser').sort(function(a, b) { return b.value.charCodeAt(0) - a.value.charCodeAt(0) }).log({1: 'a', 3: 'c', 2: 'b'});
});

// Time Test
scribe.options({
	isTime: true
}, true);
scribe.log('Log');
scribe.log('A string');
scribe.log('A manipulated string (%s) with number: %d', 'apple', 42);
scribe.log(1);
scribe.log(true);
scribe.log({me:1});
scribe.log([1,2,3]);
scribe.log('');

// Stack Test
scribe.options({
	isStack: false
}, true);
scribe.log('Log');
scribe.log('A string');
scribe.log('A manipulated string (%s) with number: %d', 'apple', 42);
scribe.log(1);
scribe.log(true);
scribe.log({me:1});
scribe.log([1,2,3]);
scribe.log('');

// Write Test
scribe.options({
	write: path.join(__dirname, 'log.txt')
}, true);
scribe.log('Log');
scribe.log('A string');
scribe.log('A manipulated string (%s) with number: %d', 'apple', 42);
scribe.log(1);
scribe.log(true);
scribe.log({me:1});
scribe.log([1,2,3]);
scribe.log('');


// scribe.time("asd");
// scribe.timeEnd("asd");

scribe.options({
	maxLvl: scribe.CRITICAL
}, true);
scribe.error('Should See');
scribe.critical('Should See');
scribe.warn('Should not see');
scribe.log('Should not see');
scribe.info('Should not see');

scribe.assert(true);
// Crashes code like supposed too
// scribe.assert(false);
