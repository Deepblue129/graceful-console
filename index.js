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

require('./lib/toType.js');
let ColorString = require('./lib/ColorString.js'),
    fs = require('graceful-fs'),
    stringify = require('json-stable-stringify'),
    _ = require('lodash'),
    path = require('path'),
    clone = require('clone'),
    util = require('util');

// Set the default options via settings
function setDefault(options, settings) {
    options.lvl = _.isUndefined(settings.lvl) ? Scribe.ALL : settings.lvl;
    options.sort = _.isUndefined(settings.sort) ? false : settings.sort;
    options.tag = _.isUndefined(settings.tag) ? '' : settings.tag;
    options.label = _.isUndefined(settings.label) ? {
        color: '',
        text: ''
    } : settings.label;

    // Permanent settings
    if (_.isUndefined(settings.maxLvl) ||
        _.isUndefined(settings.isStack) ||
        _.isUndefined(settings.isTime) ||
        _.isUndefined(settings.chunk)) {
        throw new Error();
    }

    // Preset
    options.maxLvl = settings.maxLvl;
    options.write = settings.write;
    options.isStack = settings.isStack;
    options.isTime = settings.isTime;
    options.chunk = settings.chunk;
}

// Pad the number by 2
function padNum2(num) {
    let str = num.toString();
    if (str.length == 1)
        return '0' + str;
    else
        return str;
}

function repeatedString(substr, length) {
    let str = '';
    for (let i = 0; i < length; i += substr.length) {
        str += substr;
    }
    return str;
}

class Log {
    static header(out) {
        let chunk = Scribe._options.chunk;

        if (chunk.isChunk) {
            if (chunk.isFirstLog) {
                out.concat('+ ', ColorString.GRAY);
                Log.time(out);
                Log.stack(out);

                Scribe._options.chunk.indent = new ColorString('└' + repeatedString('—', out.length - 1), ColorString.GRAY);
                Scribe._options.chunk.isFirstLog = false;
            } else {
                out.concat(chunk.indent);
            }
        } else {
            Log.time(out);
            Log.stack(out);
        }

        Log.label(out);
        Log.tag(out);

        if (out.length) {
            out.concat('» ', ColorString.GRAY);
        }
    }

    // [frog] ([tag])
    static tag(out) {
        let tag = Scribe._options.tag;
        if (!tag) {
            return;
        }

        out.concat('[', ColorString.GRAY);
        out.concat(tag, ColorString.GREEN);
        out.concat('] ', ColorString.GRAY);
    }

    // #error (#label)
    static label(out) {
        let label = Scribe._options.label;
        if (!label.text || !label.color) {
            return;
        }

        label.text = label.text.toLowerCase();
        label.color = label.color.toUpperCase();

        if (label.color && !ColorString[label.color]) {
            throw new Error(label.color + ' is not a available color. Available colors are ' + Array.toString(ColorString.COLORS));
        }

        if (label.text) {
            out.concat(new ColorString('#').concat(label.text + ' ', ColorString[label.color]));
        }
    }

    // [07:57:57] ([hour:minute:second])
    static time(out) {
        if (!Scribe._options.isTime) {
            return;
        }

        let d = new Date(),
            h = padNum2(d.getHours()),
            m = padNum2(d.getMinutes()),
            s = padNum2(d.getSeconds());

        out.concat('[' + h + ':' + m + ':' + s + ']' + ' ', ColorString.GRAY);
    }

    // index.js:97 (file:linenumber)
    static stack(out) {
        if (!Scribe._options.isStack) {
            return;
        }

        // Stack trace format :
        // https://github.com/v8/v8/wiki/Stack%20Trace%20API
        let stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/i,
            stackReg2 = /at\s+()(.*):(\d*):(\d*)/i,
            data = {};

        let stacklist = (new Error()).stack.split('\n').slice(3),
            i = 0,
            s = stacklist[i],
            sp = stackReg.exec(s) || stackReg2.exec(s);

        // Loop till stack does not include this directory
        do {
            data = {};

            if (sp && sp.length === 5) {
                data.method = sp[1];
                data.path = sp[2];
                data.line = sp[3];
                data.pos = sp[4];
                data.file = path.basename(data.path);
                data.stack = stacklist.join('\n');
            }

            i++;
            s = stacklist[i];
            sp = stackReg.exec(s) || stackReg2.exec(s);
        } while (data.path.indexOf(__filename) !== -1 && s);

        out.concat(data.file, ColorString.GRAY);
        out.concat(':' + data.line + ' ');
    }

    static object(out) {
        let sort = Scribe._options.sort,
            chunk = Scribe._options.chunk,
            obj = arguments[1];

        // Print arg
        if (Array.isArray(obj)) {
            if (_.isFunction(sort)) {
                out.concat(JSON.stringify(clone(obj).sort(sort)));
            } else if (sort) {
                out.concat(JSON.stringify(clone(obj).sort()));
            } else {
                out.concat(JSON.stringify(obj));
            }
        } else if (_.isObject(obj) && !_.isError(obj) && !_.isDate(obj)) {
            if (obj.toString() !== '[object Object]') { // Check if default toString overridden
                out.concat(obj.toString());
            } else {
                out.concat(' \n' + chunk.indent);

                // Either a sorting function on keys/ value or true/false or undefined.
                // https://github.com/substack/json-stable-stringify documentation for sorting function
                let str;
                if (_.isFunction(sort)) {
                    str = stringify(obj, {
                        space: 2,
                        cmp: sort
                    });
                } else if (sort) {
                    str = stringify(obj, {
                        space: 2
                    });
                } else {
                    str = JSON.stringify(obj, null, 2);
                }

                if (!chunk.isFirstLog && chunk.isChunk) {
                    str = str.replace(/\n/g, '\n' + chunk.indent);
                }

                out.concat(str);
            }
        } else {
            if (_.isString(obj)) {
                out.concat('"', ColorString.GRAY);
            }

            let str = util.format.apply(null, Array.prototype.slice.call(arguments, 1));
            if (!chunk.isFirstLog && chunk.isChunk) {
                str = str.replace(/\n/g, '\n' + chunk.indent);
            }

            out.concat(str);

            if (_.isString(obj)) {
                out.concat('"', ColorString.GRAY);
            }
        }
    }
}

class Scribe {
    static log() {
        // This log lvl is to low, do not log
        if (Scribe._options.lvl <= Scribe._options.maxLvl) {
            // Print to stdout
            let out = new ColorString();
            Log.header(out);
            Array.prototype.unshift.call(arguments, out)
            Log.object.apply(null, arguments);
            out.concat(' \n');
            process.stdout.write(out.toString());

            // Write to file
            let write = Scribe._options.write;
            if (write != '') {
                fs.appendFileSync(write, out.toPlainString());
            }
        }

        // Consume previous options
        setDefault(Scribe._options, Scribe._settings);
        return this;
    }

    static info() {
        Scribe.opts({
            label: {
                text: 'info',
                color: ColorString.GRAY
            },
            lvl: Scribe.INFO
        });

        return this.log.apply(this, arguments);
    }

    static critical() {
        Scribe.opts({
            label: {
                text: 'critical',
                color: ColorString.YELLOW
            },
            lvl: Scribe.CRITICAL
        });

        return this.log.apply(this, arguments);
    }

    static warn() {
        Scribe.opts({
            label: {
                text: 'warn',
                color: ColorString.YELLOW
            },
            lvl: Scribe.WARN
        });

        return this.log.apply(this, arguments);
    }

    static error() {
        Scribe.opts({
            label: {
                text: 'error',
                color: ColorString.RED
            },
            lvl: Scribe.ERROR
        });

        return this.log.apply(this, arguments);
    }


    // Prints an interactive listing of all properties of the object.
    static dir() {
        console.dir.apply(this, arguments);
    }

    // Prints a stack trace of JavaScript execution at the point
    // where it is called. The stack trace details the functions on the stack,
    // as well as the values that were passed as arguments to each function.
    static trace() {
        console.trace.apply(this, arguments);
    }

    static assert() {
        console.assert.apply(this, arguments);
    }

    // Creates a new timer under the given name. Call console.timeEnd(name)
    // with the same name to stop the timer and print the time elapsed..
    static time() {
        console.time.apply(this, arguments);
    }

    // Stops a timer created by a call to console.time(name) and writes the time
    // elapsed.
    static timeEnd() {
        console.timeEnd.apply(this, arguments);
    }

    /**
     * [sort description]
     * @param  {[type]} arg Either boolean or a function
     * @return {[type]}     [description]
     */
    static sort(arg) {
        return Scribe.options({
            sort: _.isUndefined(arg) ? true : arg
        });
    }

    static tag(tag) {
        return Scribe.options({
            tag: tag
        });
    }

    static options(opts, isSetting) {
        isSetting = _.isUndefined(isSetting) ? false : isSetting;

        for (let key in opts) {
            let val = opts[key];

            // Defensive programming
            switch (key) {
                case 'label':
                    if (!_.isObject(val) && !_.isString(val.text) && !_.isString(val.color)) {
                        throw Error('IllegalArgumentException: label must be an object with a string text and color');
                    }
                    break;
                case 'maxLvl':
                case 'lvl':
                    if (!_.isNumber(val)) {
                        throw Error('IllegalArgumentException: lvl must be a number');
                    }
                    break;
                case 'isStack':
                case 'isTime':
                    if (!_.isBoolean(val)) {
                        throw Error('IllegalArgumentException: ' + key + ' must be a boolean');
                    }
                    break;
                case 'sort':
                    if (!_.isBoolean(val) && !_.isFunction(val)) {
                        throw Error('IllegalArgumentException: sort(' + val + ') must be a boolean or a function');
                    }
                    break;
                case 'tag':
                case 'write':
                    if (!_.isString(val)) {
                        throw Error('IllegalArgumentException: ' + key + ' must be a string');
                    }
                    break;
                default:
                    throw Error('IllegalArgumentException: ' + key + ' is not recognized');
            }

            if (isSetting) {
                Scribe._settings[key] = val;
            } else {
                Scribe._options[key] = val;
            }
        }

        return this;
    }

    static opts() {
        return Scribe.options.apply(this, arguments);
    }

    static settings(opts) {
        return Scribe.options(opts, true);
    }

    static break () {
        process.stdout.write('\n');
    }

    static chunk(f) {
        if (!_.isFunction(f)) {
            throw Error('IllegalArgumentException: f must be a function');
        }

        Scribe._settings.chunk.isChunk = true;
        Scribe._settings.chunk.isFirstLog = true;
        Scribe._settings.chunk.indent = '';

        f();

        Scribe._settings.chunk.isChunk = false;
        Scribe._settings.chunk.isFirstLog = false;
        Scribe._settings.chunk.indent = '';
    }
}

// Levels 
Scribe.ERROR = 1;
Scribe.CRITICAL = 1;
Scribe.WARN = 2;
Scribe.ALL = 3;
Scribe.INFO = 3;

// Fixed options for the immediate next log
Scribe._options = {};

// Fixed options for every next log
Scribe._settings = {
    maxLvl: Scribe.ALL, // Max level that'll get logged
    write: '', // Filepath to write too
    isStack: true, // Show stack or not
    isTime: false, // Show timestamp or not
    chunk: {
        isChunk: false,
        isFirstLog: false,
        indent: ''
    } // Weather to chunk the next logs or not
};


setDefault(Scribe._options, Scribe._settings);

module.exports = Scribe;