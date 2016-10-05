Date formatting with locale support.

[![NPM Version][npm-image]][npm-url]
 
## Installation

```bash
$ npm install doodad-js-dates
```

## Features

  -  A Javascript translation of GNU-C's "strftime" function.
  -  Supports locale.

## Quick Start

```js
    "use strict";

    const root = require('doodad-js').createRoot( null, { node_env: 'development' } );

    const modules = {};
	require('doodad-js-unicode').add(modules);
	require('doodad-js-locale').add(modules);
	require('doodad-js-dates').add(modules);

    function startup() {
        const dates = root.Doodad.Tools.Dates;
        console.log( dates.strftime("%c", new Date()) );
    };

    root.Doodad.Namespaces.load(modules, startup)
        ['catch'](function(err) {
            console.error(err);
        });
```

## Other available packages

  - **doodad-js**: Object-oriented programming framework (release)
  - **doodad-js-cluster**: Cluster manager (alpha)
  - **doodad-js-dates**: Dates formatting (release)
  - **doodad-js-http**: Http server (alpha)
  - **doodad-js-http_jsonrpc**: JSON-RPC over http server (alpha)
  - **doodad-js-io**: I/O module (alpha)
  - **doodad-js-ipc**: IPC/RPC server (alpha)
  - **doodad-js-json**: JSON parser (alpha)
  - **doodad-js-loader**: Scripts loader (beta)
  - **doodad-js-locale**: Locales (release)
  - **doodad-js-make**: Make tools for doodad (alpha)
  - **doodad-js-mime**: Mime types (beta)
  - **doodad-js-minifiers**: Javascript minifier used by doodad (alpha)
  - **doodad-js-safeeval**: SafeEval (beta)
  - **doodad-js-server**: Servers base module (alpha)
  - **doodad-js-templates**: HTML page templates (alpha)
  - **doodad-js-terminal**: Terminal (alpha)
  - **doodad-js-test**: Test application
  - **doodad-js-unicode**: Unicode Tools (alpha)
  - **doodad-js-widgets**: Widgets base module (alpha)
  - **doodad-js-xml**: XML Parser (release)
  
## License

  [Apache-2.0][license-url]

[npm-image]: https://img.shields.io/npm/v/doodad-js-dates.svg
[npm-url]: https://npmjs.org/package/doodad-js-dates
[license-url]: http://opensource.org/licenses/Apache-2.0