// Copyright (c) 2016 Michael Petrochuk <Petrochukm@gmail.com>

// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the 'Software'),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

'use strict';

var chalk = require('chalk'),
    _ = require('lodash');
require('./toType.js');

/** 
 * ColorString is a string wrapper. It supports adding color to strings.
 *
 * See https://www.npmjs.com/package/colors for supported colors
 */
class ColorString {
    constructor() {
        this.color = '';
        this.reg = '';
        this.length = this.reg.length;

        if(!_.isUndefined(arguments[0])) {
            this.concat.apply(this, arguments);
        }
    }

    // Concat text to string
    // this.arguments[1]...this.arguments[n] may be color arguments
    concat(text) {
        if (!_.isString(text) && !text.constructor && !text.constructor.name !== 'ColorString') {
            throw new Error('IllegalArgumentException - Accepted objects are ColorString objects or string. Text given is of type: ' + Object.toType(text));
        }

        // Handle ColorStrings Object
        if (text && text.constructor && text.constructor.name === 'ColorString') {
            if (color) {
                throw new Error('AntiPattern - Excepts concat text ColorString object to have color set.');
            }

            this.color += text.toString();
            this.reg += text.toPlainString();
        } else {
            this.reg += text;

            if (arguments[1]) {
                for (var i = 1; i < arguments.length; i++) {
                    var color = ColorString[arguments[i].toUpperCase()];

                    if (!color) {
                        throw new Error('Color ' + arguments[i] + ' is unsupported. Find supported colors here https://www.npmjs.com/package/chalk')
                    }

                    text = chalk[color](text);
                }

                this.color += text;
            } else {
                this.color += text;
            }
        }

        this.length = this.reg.length;

        return this;
    }

    toPlainString() {
        return this.reg;
    }

    toString() {
        return this.color;
    }

    isEmpty() {
        return this.reg == ''
    }
}

// Set of default colors supported by https://www.npmjs.com/package/colors
ColorString.COLORS = ['red', 'green', 'yellow', 'blue',
    'magenta', 'cyan', 'white', 'gray', 'grey',
    'bgBlack', 'bgRed', 'bgGreen', 'bgYellow',
    'bgBlue', 'bgMagenta', 'bgCyan', 'bgWhite'
];

// Set every color as a static variable 
// For Example: <code>_console.BLACK = 'black';</code>
for (var i = 0; i < ColorString.COLORS.length; i++) {
    var key = ColorString.COLORS[i];
    ColorString[key.toUpperCase()] = key;
}

module.exports = ColorString;