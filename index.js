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
 
"use strict";

require('./lib/toType.js');
var _Colors = require('./lib/_colors.js'),
    fs = require('graceful-fs'),
    stringify = require('json-stable-stringify'),
    _ = require('lodash'),
    path = require('path'),
    clone = require('clone'),
    util = require('util');

/**
 * Sets the default value of this.opts[key][key1]...[keyn] if the value is not already set. 
 *
 * @param this.arguments[0] root object
 * @param this.arguments[1] ... this.arguments[this.arguments.length - 2] are keys 1 through n
 * @param this.arguments[this.arguments.length - 1] is the default value
 * @throw IllegalArgumentException if this.arguments.length < 3 
 */
function setDefault() {
    if (arguments.length < 3)
        throw new Error('IllegalArgumentException');

    var obj = arguments[0],
        valid = obj ? true : false;

    if (!valid) obj = {};

    for (var i = 1; i < arguments.length - 1; i++) {
        valid = obj[arguments[i]] !== undefined ? true : false;
        if (!valid)
            obj[arguments[i]] = {};

        obj = obj[arguments[i]];
    }

    if (!valid)
        obj = arguments[arguments.length - 1];

    return obj;
}

function getStack() {
    // Stack trace format :
    // https://github.com/v8/v8/wiki/Stack%20Trace%20API
    var stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/i,
        stackReg2 = /at\s+()(.*):(\d*):(\d*)/i,
        data = {};

    // get call stack, and analyze it
    // get all file,method and line number
    var stacklist = (new Error()).stack.split('\n').slice(3),
        i = 0,
        s = stacklist[i],
        sp = stackReg.exec(s) || stackReg2.exec(s),
        data = {};


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

    return data;
}

function _Console(id, opts) {
    // Set Debug Constants
    // lvl, filename, time
    var LVL = setDefault(opts, 'lvl', _Console.ALL),
        ID = id ? id.toLowerCase() : false,
        WRITE = setDefault(opts, 'write', false),
        STACK = setDefault(opts, 'stack', true),
        TIME = setDefault(opts, 'time', false);

    if (WRITE) {
        console.log(WRITE);
        fs.writeFileSync(WRITE, 'abc');
    }

    return {
        init: function() {
            this.opts = {};
            return this;
        },
        log: function() {
            if (LVL < setDefault(this.opts, 'lvl', _Console.ALL)) {
                this.opts = {};
                return this;
            }

            // Out is:
            // [Timestamp] ID:label <tag> >> obj

            // Either a sorting function on keys/ value or true/false or undefined.
            // https://github.com/substack/json-stable-stringify documentation for sorting function
            var sort = setDefault(this.opts, 'sort', false),
                tag = setDefault(this.opts, 'tag', ''), // Output tag
                label = {},
                obj = arguments[0]; // Arg

            label.text = setDefault(this.opts, 'label', 'text', '').toLowerCase();
            label.color = setDefault(this.opts, 'label', 'color', false);
            label.color = label.color ? label.color.toUpperCase() : false;

            if (label.color && !_Colors[label.color])
                throw new Error(label.color + ' is not a available color. Available colors are ' + Array.toString(_Colors.COLORS));

            label.str = label.text ? new _Colors().concat(":").concat(label.text, _Colors[label.color]) : new _Colors().concat('');
            var out = new _Colors(),
                str = ''; // Temp String 

            function padNum2(num) {
                var str = num.toString();
                if (str.length == 1)
                    return '0' + str;
                else
                    return str;
            }

            if (TIME) {
                var d = new Date(),
                    h = padNum2(d.getHours()),
                    m = padNum2(d.getMinutes()),
                    s = padNum2(d.getSeconds());

                str = '[' + h + ':' + m + ':' + s + '] ';
                out.concat(str, _Colors.GRAY);
            }

            if (STACK) {
                var stack = getStack();
                out.concat(stack.file, _Colors.GRAY);
                out.concat(":" + stack.line + " ");
            }

            if (ID) {
                out.concat("[" + ID + "]", _Colors.GREY);
            }

            out.concat(label.str);

            if (tag) {
                out.concat(' <');
                out.concat(tag, _Colors.GREEN);
                out.concat('>');
            }

            if (id || label.text || tag)
                out.concat(' >> ', _Colors.GRAY);

            if (Array.isArray(obj)) {
                if (_.isFunction(sort))
                    out.concat(JSON.stringify(clone(obj).sort(sort)));
                else if (sort)
                    out.concat(JSON.stringify(clone(obj).sort()));
                else
                    out.concat(JSON.stringify(obj));
            } else if (_.isObject(obj) && !_.isError(obj) && !_.isDate(obj)) {
                if (obj.toString() !== '[object Object]') // Check if default toString overridden
                    out.concat(obj.toString());
                else {
                    out.concat(' \n');

                    if (_.isFunction(sort))
                        out.concat(stringify(obj, { space: 2, cmp: sort }));
                    else if (sort)
                        out.concat(stringify(obj, { space: 2 }));
                    else
                        out.concat(JSON.stringify(obj, null, 2));
                }
            } else {
                if (_.isString(obj))
                    out.concat('"', _Colors.GRAY);

                if(_.isError(obj)) {
                    console.log('Error');
                    out.concat(util.format.apply(null, arguments), _Colors.RED);
                } else {
                    out.concat(util.format.apply(null, arguments));
                }

                if (_.isString(obj))
                    out.concat('"', _Colors.GRAY);
            }

            out.concat(' \n');
            process.stdout.write(out.toString());

            if (WRITE) {
                fs.appendFileSync(WRITE, out.toNonColorString());
            }

            this.opts = {};
            return this;
        },

        info: function() {
            if (this.opts && (this.opts.lvl || this.opts.label))
                throw Error("AntiPattern: Info function is an alias to this.log with opts.lvl & opts.label parameter set. Either opts.lvl & opts.label are already set.");

            this.opts.label = {
                text: "info",
                color: _Colors.GRAY
            }
            this.opts.lvl = _Console.INFO;
            return this.log.apply(this, arguments);
        },

        critical: function() {
            if (this.opts && (this.opts.lvl || this.opts.label))
                throw Error("AntiPattern: Critical function is an alias to this.log with opts.lvl & opts.label parameter set. Either opts.lvl & opts.label are already set.");

            this.opts.label = {
                text: "critical",
                color: _Colors.YELLOW
            }
            this.opts.lvl = _Console.CRITICAL;
            return this.log.apply(this, arguments);
        },

        warn: function() {
            if (this.opts && (this.opts.lvl || this.opts.label))
                throw Error("AntiPattern: Warn function is an alias to this.log with opts.lvl & opts.label parameter set. Either opts.lvl & opts.label are already set.");

            this.opts.label = {
                text: "warn",
                color: _Colors.YELLOW
            }
            this.opts.lvl = _Console.WARN;
            return this.log.apply(this, arguments);
        },

        error: function() {
            if (this.opts && (this.opts.lvl || this.opts.label))
                throw Error("AntiPattern: Error function is an alias to this.log with opts.lvl & opts.label parameter set. Either opts.lvl & opts.label are already set.");

            this.opts.label = {
                text: "error",
                color: _Colors.RED
            }
            this.opts.lvl = _Console.ERROR;
            return this.log.apply(this, arguments);
        },

        // Prints an interactive listing of all properties of the object.
        dir: function() {
            console.dir.apply(this, arguments);
        },

        // Prints a stack trace of JavaScript execution at the point
        // where it is called. The stack trace details the functions on the stack,
        // as well as the values that were passed as arguments to each function.
        trace: function() {
            console.trace.apply(this, arguments);
        },

        assert: function() {
            console.assert.apply(this, arguments);
        },

        // Creates a new timer under the given name. Call console.timeEnd(name)
        // with the same name to stop the timer and print the time elapsed..
        time: function() {
            console.time.apply(this, arguments);
        },

        // Stops a timer created by a call to console.time(name) and writes the time
        // elapsed.
        timeEnd: function() {
            console.timeEnd.apply(this, arguments);
        },

        /**
         * [sort description]
         * @param  {[type]} arg Either boolean or a function
         * @return {[type]}     [description]
         */
        sort: function(arg) {
            if (!_.isBoolean(arg) && !_.isFunction(arg))
                throw Error("IllegalArgumentException: arg must be a boolean or function");

            if (this.opts.sort)
                throw Error("AntiPattern: opts.write is already set");

            this.opts.sort = arg;
            return this;

        },

        tag: function(tag) {
            if (!_.isString(tag))
                throw Error("IllegalArgumentException: tag must be a string");

            if (this.opts.tag)
                throw Error("AntiPattern: opts.tag is already set");

            this.opts.tag = tag;
            return this;
        },


        options: function(_new) {
            for (var key in _new) {
                this.opts[key] = _new[key];
            }
            return this;
        }
    }.init();
}

_Console.ERROR = 1;
_Console.WARN = 2;
_Console.ALL = 3;
/** See CRITICAL debug messages.
 *  OR
 *  A CRITICAL debug message. 
 *  Showen when lvl <= 1.
 */
_Console.CRITICAL = 1;

/** A INFO debug message. 
 * Showen when lvl <= 2 
 */
_Console.INFO = 3;

module.exports = _Console;
