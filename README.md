# graceful-console


## Synopsis

Dectorator console module that adds color, formatting, sorting, etc.. to the node console. 

## Code Example

The new console gives you more control. More colors. Line Numbers. Sorting. Etc... Contribute!

```javascript
var _Console = require('graceful-console');
var console = new _Console('frog logs');

console.tag('test').log('the frog jumped the boat');
console.warn({frog:1, water: 0});
console.error('it drowned');
console.tag('Sort Frog Array').sort(true).log(['Frog1', 'Frog3', 'Frog2']);
```

Drum role please...
![alt text](screenshot.png)

## Get Started

Use NPM to install 	`npm install graceful-console --save`
Then require graceful console 
```javascript
var _Console = require('graceful-console');
var console = new _Console();
```
Your all set!

## API Reference

###new _Console(str, opts)

Takes a string `str` as the console tag. Takes an options object `opts`.

`str` A console tag. Every console output will have this tag. By default, it is set at an empty string.

`opts` Choose the console options: write path, stack, time, and/or lvl. 

+ `write` path dictates where console should output a log file too.
+ `stack` dictates weather to show line numbers and file paths. *this is resource intensive, dont enable in production*
+ `time` dictates weather to show a time stamp. `lvl` dictates the console log level. 
+ `lvl` dictates how much information you want console to print: do you want to print all console messages or just errors? (**hierarchy** `_Console.ERROR || _Console.CRITICAL << _Console.WARN << _Console.ALL || _Console.INFO`)

```javascript
	console = new _Console('No Stack Test', 
		{
			write: path.join(__dirname, 'log.txt'), // default empty
			stack: true, // default true
			time: true, // default false
			lvl: _Console.ERROR // default _Console.ALL
		});
```
```
###console.log(str), console.error(str), console.info(str), console.warn(str)
Takes a string `str` as the output tag.

`str` prints to stdout with newline. Eats the current options such as tag and sort.

```javascript
	console.tag('test').log('the frog jumped the boat');
```
###console.tag(str)

Takes a string `str` as the output tag.

`str` the **next** log, error, warn, info will be tagged with the str

```javascript
	console.tag('test').log('the frog jumped the boat');
```

###console.sort(arg)

Takes a function or a boolean `arg`.

`str` the **next** log, error, warn, info array or object will be sorted.

```javascript
	console.tag('Sort Test Array').sort(true).log([1, 3, 2]);
	console.tag('Sort Test Object').options(true).log({1: 'a', 3: 'c', 2: 'b'});
	console.tag('Sort Test Function Inveser').sort(function(a, b) { return b.value.charCodeAt(0) - a.value.charCodeAt(0)}).log({1: 'a', 3: 'c', 2: 	'b'});
```

###console.dir, console.assert, console.time, console.timeEnd

Refer to Node documentation for behavior https://nodejs.org/api/console.html#console_console_log_data


## License

MIT