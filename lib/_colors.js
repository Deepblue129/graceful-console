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

var chalk = require('chalk'),
    _ = require('lodash');
require('./toType.js');

/** 
 * _colors is a string wrapper. It supports adding color to strings.
 *
 * See https://www.npmjs.com/package/colors for supported colors
 */
function _colors() {
    this.string = {
        color: "",
        reg: ""
    };

    // Concat text to string
    // this.arguments[1]...this.arguments[n] may be color arguments
    this.concat = function(text) {
        if(!_.isString(text) && text && text.constructor && text.constructor.name !== '_colors')
            throw new Error("IllegalArgumentException - Accepted objects are _colors objects or string. Text given is of type: " + Object.toType(text));

        // Handle Colors Object
        if(text && text.constructor && text.constructor.name === '_colors') {
            if(color)
                 throw new Error("AntiPattern - Excepts concat text _colors object to have color set.");

            this.string.color += text.toString();
            this.string.reg += text.toNonColorString();
        } else {
            this.string.reg += text;

            if(arguments[1]) {
                for(var i = 1; i < arguments.length; i++) {
                    var color = arguments[i].toUpperCase();
                    color = _colors[color.toUpperCase()];

                    if(!color)
                        throw new Error('Color is unsupported. Find supported colors here https://www.npmjs.com/package/chalk')

                    text = chalk[color](text);
                }

                this.string.color += text;
            } else {
                this.string.color += text;
            }
        }
        return this;
    };

    this.toNonColorString = function() {
        return this.string.reg;
    };

    this.toString = function() {
        return this.string.color;   
    };
}

// Set of default colors supported by https://www.npmjs.com/package/colors
_colors.COLORS = ['red', 'green', 'yellow', 'blue', 
                    'magenta', 'cyan', 'white', 'gray', 'grey', 
                    'bgBlack', 'bgRed','bgGreen','bgYellow',
                    'bgBlue','bgMagenta','bgCyan','bgWhite'];
// Set every color as a static variable 
// For Example: <code>_console.BLACK = 'black';</code>
for(var i = 0; i < _colors.COLORS.length; i++) {
    var key = _colors.COLORS[i];
    _colors[key.toUpperCase()] = key;
}

module.exports = _colors;
