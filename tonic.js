"use strict";

const modules = {};
require('doodad-js-unicode').add(modules);
require('doodad-js-locale').add(modules);
require('doodad-js-dates').add(modules);

require('doodad-js').createRoot(modules)
	.then(root => {
		const dates = root.Doodad.Tools.Dates;
		console.log( dates.strftime("%c", new Date()) );
	})
	.catch(err => {
		console.error(err);
	});