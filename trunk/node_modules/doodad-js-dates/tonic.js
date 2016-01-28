"use strict";

const root = require('doodad-js').createRoot( /*bootstrapModules*/ null, /*options*/ { node_env: 'development' } );

const modules = {};
require('doodad-js-locale').add(modules);
require('doodad-js-dates').add(modules);

root.Doodad.Namespaces.loadNamespaces( function callback() {
	
	const dates = root.Doodad.Tools.Dates;
	console.log( dates.strftime("%c", new Date()) );
	
}, /*donThrow*/ false, /*options*/ null, modules )
	['catch'](function(err) {
		console.error(err);
	});
