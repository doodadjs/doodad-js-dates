"use strict";

const root = require('doodad-js').createRoot();

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
