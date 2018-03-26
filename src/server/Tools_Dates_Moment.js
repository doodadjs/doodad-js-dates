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
	"use strict";

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


exports.add = function add(modules) {
	modules = (modules || {});
	if (nodeMoment) {
		modules['Doodad.Tools.Dates.Moment'] = {
			version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
			proto: function(root) {
				const types = root.Doodad.Types,
					tools = root.Doodad.Tools;
				return tools.nullObject(nodeMoment, {locale: types.CONFIGURABLE(nodeMoment.locale), lang: types.CONFIGURABLE(nodeMoment.lang), tz: types.CONFIGURABLE(nodeMoment.tz)});
			},
			create: function create(root, /*optional*/_options, _shared) {
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

				let __options__ = tools.nullObject({
					dataUri: null,
				}, _options);

				//__options__. = types.to...(__options__.);

				types.freezeObject(__options__);

				moment.ADD('getOptions', function() {
					return __options__;
				});

				moment.ADD('setOptions', function setOptions(options) {
					const newOptions = tools.nullObject(__options__, options);
					newOptions.dataUri = files.parsePath(newOptions.dataUri);
					__options__ = types.freezeObject(newOptions);
					return __options__;
				});
	
				tools.setOptions(_options);
	
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


				moment.ADD('hasTz', function hasTz() {
					return __Internal__.hasTz;
				});


				return function init(/*optional*/options) {
					const Promise = types.getPromise();

					const loc = locale.getCurrent();
					if (types.has(loc, 'LC_MOMENT')) {
						nodeMoment.locale(loc.NAME);
					};

					if (typeof moment.tz === 'function') {
						__Internal__.hasTz = true;

						moment.ADD('tz', moment.tz);
						__Internal__.oldTzLoad = moment.tz.load;

						moment.tz.load = function(/*optional*/pathOrData) {
							return Promise.try(function tryLoad() {
								if (types.isNothing(pathOrData)) {
									pathOrData = 'latest.json';
								};
								if (types.isString(pathOrData)) {
									pathOrData = files.parsePath(pathOrData);
								};
								if (types._instanceof(pathOrData, [files.Path, files.Url])) {
									return config.load(__options__.dataUri.combine(pathOrData))
										.then(function(data) {
											return __Internal__.oldTzLoad.call(this, data);
										}, null, this);
								} else {
									return __Internal__.oldTzLoad.call(this, pathOrData);
								};
							});
						};

						if (!types.isNothing(__options__.dataUri)) {
							return moment.tz.load();
						};

					} else {
						moment.ADD('tz', function(name) {
							throw new types.NotAvailable("The library 'moment-timezone' is not available.");
						});
					};

					return undefined;
				};
			},
		};
	};
	return modules;
};

//! END_MODULE()
