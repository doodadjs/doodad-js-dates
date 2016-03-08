"use strict";

const root = require('doodad-js').createRoot( /*bootstrapModules*/ null, /*options*/ { node_env: 'development' } );

const modules = {};
require('doodad-js-unicode').add(modules);
require('doodad-js-locale').add(modules);
require('doodad-js-dates').add(modules);

function startup() {
	const dates = root.Doodad.Tools.Dates;
	console.log( dates.strftime("%c", new Date()) );
};

root.Doodad.Namespaces.loadNamespaces(modules, startup)
	['catch'](function(err) {
		console.error(err);
	});
