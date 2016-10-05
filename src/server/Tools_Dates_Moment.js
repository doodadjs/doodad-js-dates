//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2016 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Tools_Dates_Moment.js - Moment helper (server)
// Project home: https://github.com/doodadjs/
// Author: Claude Petit, Quebec city
// Contact: doodadjs [at] gmail.com
// Note: I'm still in alpha-beta stage, so expect to find some bugs or incomplete parts !
// License: Apache V2
//
//	Copyright 2016 Claude Petit
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

let nodejsMoment = null;
try {
	const file = 'moment' + '-timezone'; // Prevent browserify
	nodejsMoment = require(file);
} catch(ex) {
	try {
		const file = 'moment' + '/min/moment.min.js'; // Prevent browserify
		nodejsMoment = require(file);
	} catch(ex) {
	};
};


module.exports = {
	add: function add(DD_MODULES) {
		DD_MODULES = (DD_MODULES || {});
		if (nodejsMoment) {
			DD_MODULES['Doodad.Tools.Dates.Moment'] = {
				version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
				proto: function(root) {
					const types = root.Doodad.Types;
					return types.nullObject(nodejsMoment, {locale: types.WRITABLE(nodejsMoment.locale), lang: types.WRITABLE(nodejsMoment.lang), tz: types.WRITABLE(nodejsMoment.tz)});
				},
				create: function create(root, /*optional*/_options, _shared) {
					"use strict";

					const doodad = root.Doodad,
						types = doodad.Types,
						tools = doodad.Tools,
						locale = tools.Locale,
						dates = tools.Dates,
						moment = dates.Moment;

					const __Internal__ = {
						oldLocaleFn: nodejsMoment.locale,
						oldPrototypeLocaleFn: nodejsMoment.prototype.locale,
						loaded: types.nullObject(),
						hasTz: false, 
						oldTzLoad: null,
					};

					const __options__ = types.nullObject({
						dataUri: null,
					}, _options);

					//__options__. = types.to...(__options__.);

					types.freezeObject(__options__);

					moment.getOptions = function() {
						return __options__;
					};


					__Internal__.loadLocale = function loadLocale(name) {
						const ddName = locale.momentToDoodadName(name);
						name = locale.doodadToMomentName(ddName);
						if (!__Internal__.loaded[name]) {
							if (tools.indexOf(moment.locales(), name) < 0) {
								if (!locale.has(ddName)) {
									throw new types.Error("You must load locale '~0~' using the 'Doodad.Tools.Locale.load' function.", [ddName]);
								};
								const data = types.get(locale.get(ddName), 'LC_MOMENT');
								if (!data) {
									throw new types.Error("There is no data for 'moment' in locale '~0~'.", [ddName]);
								};
								const cur = moment.locale();
								moment.defineLocale(name, data);
								if (moment.locale() !== cur) {
									moment.locale(cur); // <FIX> "moment.defineLocale" globally sets the new locale
								};
							};
							__Internal__.loaded[name] = true;
						};
						return name;
					};

					nodejsMoment.lang = nodejsMoment.locale = moment.lang = moment.locale = function locale(/*optional*/name) {
						if (name) {
							name = __Internal__.loadLocale(name);
							return __Internal__.oldLocaleFn(name);
						} else {
							return __Internal__.oldLocaleFn();
						};
					};

					nodejsMoment.prototype.lang = nodejsMoment.prototype.locale = function locale(/*optional*/name) {
						if (name) {
							name = __Internal__.loadLocale(name);
							return __Internal__.oldPrototypeLocaleFn.call(this, name);
						} else {
							return __Internal__.oldPrototypeLocaleFn.call(this);
						};
					};

					moment.create = function create(/*paramarray*/) {
						const moment = nodejsMoment.apply(nodejsMoment, arguments);
						const loc = locale.getCurrent();
						if (types.has(loc, 'LC_MOMENT')) {
							moment.locale(loc.LC_MOMENT.name);
						};
						return moment;
					};

					if (typeof moment.tz === 'function') {
						__Internal__.hasTz = true;
						__Internal__.oldTzLoad = moment.tz.load;
						moment.tz = moment.tz; // Will make it read-only
						moment.tz.load = function(/*optional*/data) {
							const Promise = types.getPromise();
							if (types.isNothing(data)) {
								data = 'latest.json';
							};
							if (types.isString(data)) {
								data = files.Path.parse(data);
							};
							if (data instanceof files.Path) {
								return config.load(data, {encoding: 'utf-8', configPath: __options__.dataUri, async: true})
									.then(function(packedData) {
										return __Internal__.oldTzLoad.call(this, packedData);
									}, null, this);
							} else {
								return Promise.resolve(__Internal__.oldTzLoad.call(this, data));
							};
						};
					} else{
						moment.tz = function(/*paramarray*/) {
							throw new types.NotAvailable("The library 'moment-timezone' is not available.");
						};
						moment.tz.load = function() {
							var Promise = types.getPromise();
							return Promise.reject(new types.NotAvailable("The library 'moment-timezone' is not available."));
						};
					};

					moment.hasTz = function hasTz() {
						return __Internal__.hasTz;
					};

					return function init(/*optional*/options) {
						const loc = locale.getCurrent();
						if (types.has(loc, 'LC_MOMENT')) {
							nodejsMoment.locale(loc.LC_MOMENT.name);
						};
					};
				},
			};
		};
		return DD_MODULES;
	},
};
//! END_MODULE()