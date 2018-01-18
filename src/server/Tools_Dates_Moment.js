//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Tools_Dates_Moment.js - Moment helper (server)
// Project home: https://github.com/doodadjs/
// Author: Claude Petit, Quebec city
// Contact: doodadjs [at] gmail.com
// Note: I'm still in alpha-beta stage, so expect to find some bugs or incomplete parts !
// License: Apache V2
//
//	Copyright 2015-2018 Claude Petit
//
//	Licensed under the Apache License, Version 2.0 (the "License");
//	you may not use this file except in compliance with the License.
//	You may obtain a copy of the License at
//
//		http://www.apache.org/licenses/LICENSE-2.0
//
//	Unless required by applicable law or agreed to in writing, software
//	distributed under the License is distributed on an "AS IS" BASIS,
//	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//	See the License for the specific language governing permissions and
//	limitations under the License.
//! END_REPLACE()


//! IF_SET('mjs')
	// TODO: Make "moment-timezone" optional. For now, we can't !

	//!	INJECT("import {default as nodeMoment} from 'moment-timezone';")
//! ELSE()
	let nodeMoment = null;
	try {
		/* eslint global-require: "off", import/no-dynamic-require: "off" */
		const pkg = 'moment-timezone'; // Prevent browserify
		nodeMoment = require(pkg);
	} catch(ex) {
		try {
			/* eslint global-require: "off", import/no-dynamic-require: "off" */
			const pkg = 'moment'; // Prevent browserify
			nodeMoment = require(pkg);
		} catch(ex) {
			// Do nothing
		};
	};
//! END_IF()


exports.add = function add(DD_MODULES) {
	DD_MODULES = (DD_MODULES || {});
	if (nodeMoment) {
		DD_MODULES['Doodad.Tools.Dates.Moment'] = {
			version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
			proto: function(root) {
				const types = root.Doodad.Types,
					tools = root.Doodad.Tools;
				return tools.nullObject(nodeMoment, {locale: types.CONFIGURABLE(nodeMoment.locale), lang: types.CONFIGURABLE(nodeMoment.lang), tz: types.CONFIGURABLE(nodeMoment.tz)});
			},
			create: function create(root, /*optional*/_options, _shared) {
				"use strict";

				const doodad = root.Doodad,
					types = doodad.Types,
					tools = doodad.Tools,
					files = doodad.Files,
					config = tools.Config,
					locale = tools.Locale,
					dates = tools.Dates,
					moment = dates.Moment;

				const __Internal__ = {
					oldLocaleFn: nodeMoment.locale,
					oldPrototypeLocaleFn: nodeMoment.prototype.locale,
					loaded: tools.nullObject(),
					hasTz: false, 
					oldTzLoad: null,
				};

				const __options__ = tools.nullObject({
					dataUri: null,
				}, _options);

				//__options__. = types.to...(__options__.);

				types.freezeObject(__options__);

				moment.ADD('getOptions', function() {
					return __options__;
				});


				__Internal__.loadLocale = function loadLocale(name, /*optional*/globally) {
					// tools.Locale.load('fr').then(l=>tools.Dates.Moment.create().locale(l.NAME).format('LLLL')).then(console.log);

					const ddName = locale.momentToDoodadName(name);
					name = locale.doodadToMomentName(ddName);
					if (!__Internal__.loaded[name]) {
						if (tools.indexOf(moment.locales(), name) < 0) {
							if (!locale.has(ddName)) {
								throw new types.Error("You must load locale '~0~' using the 'Doodad.Tools.Locale.load' function.", [ddName]);
							};
							const data = locale.get(ddName);
							const LC_MOMENT = types.get(data, 'LC_MOMENT');
							if (!LC_MOMENT) {
								throw new types.Error("There is no data for 'moment' in locale '~0~'.", [ddName]);
							};
							if (types.isString(LC_MOMENT)) {
								const defineFake = function(whatever, factory) {
									const cur = moment.locale();

									data.LC_MOMENT = factory(moment);

									if (moment.locale() !== cur) {
										moment.locale(cur); // <FIX> "moment.defineLocale" globally sets the new locale
									};
								};
								defineFake.amd = true;

								const getData = new global.Function('exports', 'module', 'require', 'define', LC_MOMENT);
								getData.call(global, undefined, undefined, undefined, defineFake);
							};
						};
						__Internal__.loaded[name] = true;
					};

					if (globally) {
						locale.setCurrent(ddName);
					};

					return name;
				};

				nodeMoment.lang = nodeMoment.locale = moment.ADD('lang', moment.ADD('locale', function locale(/*optional*/name) {
					if (name) {
						name = __Internal__.loadLocale(name, true);
						return __Internal__.oldLocaleFn.call(this, name);
					} else {
						return __Internal__.oldLocaleFn.call(this);
					};
				}));

				nodeMoment.prototype.lang = nodeMoment.prototype.locale = function locale(/*optional*/name) {
					if (name) {
						name = __Internal__.loadLocale(name, false);
						return __Internal__.oldPrototypeLocaleFn.call(this, name);
					} else {
						return __Internal__.oldPrototypeLocaleFn.call(this);
					};
				};

				moment.ADD('create', function create(/*paramarray*/...args) {
					const moment = nodeMoment(...args);
					const loc = locale.getCurrent();
					if (types.has(loc, 'LC_MOMENT')) {
						moment.locale(loc.LC_MOMENT.name);
					};
					return moment;
				});

				if (typeof moment.tz === 'function') {
					__Internal__.hasTz = true;
					__Internal__.oldTzLoad = moment.tz.load;
					moment.ADD('tz', moment.tz); // Will make it read-only
					moment.tz.load = function(/*optional*/data) {
						const Promise = types.getPromise();
						if (types.isNothing(data)) {
							data = 'latest.json';
						};
						if (types.isString(data)) {
							data = files.Path.parse(data);
						};
						if (types._instanceof(data, files.Path)) {
							return config.load(data, {encoding: 'utf-8', configPath: __options__.dataUri, async: true})
								.then(function(packedData) {
									return __Internal__.oldTzLoad.call(this, packedData);
								}, null, this);
						} else {
							return Promise.resolve(__Internal__.oldTzLoad.call(this, data));
						};
					};
				} else{
					moment.ADD('tz', function(/*paramarray*/) {
						throw new types.NotAvailable("The library 'moment-timezone' is not available.");
					});
					moment.tz.load = function() {
						const Promise = types.getPromise();
						return Promise.reject(new types.NotAvailable("The library 'moment-timezone' is not available."));
					};
				};

				moment.ADD('hasTz', function hasTz() {
					return __Internal__.hasTz;
				});

				return function init(/*optional*/options) {
					const loc = locale.getCurrent();
					if (types.has(loc, 'LC_MOMENT')) {
						nodeMoment.locale(loc.NAME);
					};
				};
			},
		};
	};
	return DD_MODULES;
};

//! END_MODULE()