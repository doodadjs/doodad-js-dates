//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2016 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Tools_Dates_Moment.js - Moment helper (client)
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

module.exports = {
	add: function add(DD_MODULES) {
		DD_MODULES = (DD_MODULES || {});
		if (typeof global.moment === 'function') {
			DD_MODULES['Doodad.Tools.Dates.Moment'] = {
				version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
				proto: function(root) {
					var types = root.Doodad.Types;
					return types.nullObject(global.moment, {locale: types.CONFIGURABLE(global.moment.locale), lang: types.CONFIGURABLE(global.moment.lang), tz: types.CONFIGURABLE(global.moment.tz)});
				},
				create: function create(root, /*optional*/_options, _shared) {
					"use strict";

					var doodad = root.Doodad,
						types = doodad.Types,
						tools = doodad.Tools,
						locale = tools.Locale,
						dates = tools.Dates,
						moment = dates.Moment,
						files = tools.Files,
						config = tools.Config;


					var __Internal__ = {
						oldLocaleFn: global.moment.locale,
						oldPrototypeLocaleFn: global.moment.prototype.locale,
						hasTz: false, 
						oldTzLoad: null,
						loaded: types.nullObject(),
					};

					var __options__ = types.nullObject({
						dataUri: null,
					}, _options);

					__options__.dataUri = __options__.dataUri && files.Url.parse(__options__.dataUri);

					types.freezeObject(__options__);

					moment.ADD('getOptions', function() {
						return __options__;
					});


					__Internal__.loadLocale = function loadLocale(name, /*optional*/globally) {
						// DD_ROOT.Doodad.Tools.Locale.load('fr-FR').then(l=>DD_ROOT.Doodad.Tools.Dates.Moment.create().locale('fr-fr').format('LLLL')).then(console.log);

						var ddName = locale.momentToDoodadName(name);
						name = locale.doodadToMomentName(ddName);
						if (!__Internal__.loaded[name]) {
							if (tools.indexOf(moment.locales(), name) < 0) {
								if (!locale.has(ddName)) {
									throw new types.Error("You must load locale '~0~' using the 'Doodad.Tools.Locale.load' function.", [ddName]);
								};
								var data = locale.get(ddName);
								var LC_MOMENT = types.get(data, 'LC_MOMENT');
								if (!LC_MOMENT) {
									throw new types.Error("There is no data for 'moment' in locale '~0~'.", [ddName]);
								};
							};
							__Internal__.loaded[name] = true;
						};

						if (globally) {
							locale.setCurrent(ddName);
						};

						return name;
					};

					global.moment.lang = global.moment.locale = moment.ADD('lang', moment.ADD('locale', function locale(name) {
						if (name) {
							name = __Internal__.loadLocale(name, true);
							return __Internal__.oldLocaleFn.call(this, name);
						} else {
							return __Internal__.oldLocaleFn.call(this);
						};
					}));

					global.moment.prototype.lang = global.moment.prototype.locale = function locale(name) {
						if (name) {
							name = __Internal__.loadLocale(name, false);
							return __Internal__.oldPrototypeLocaleFn.call(this, name);
						} else {
							return __Internal__.oldPrototypeLocaleFn.call(this);
						};
					};

					moment.ADD('create', function create(/*paramarray*/) {
						var moment = global.moment.apply(global.moment, arguments);
						var loc = locale.getCurrent();
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
							var Promise = types.getPromise();
							if (types.isNothing(data)) {
								data = 'latest.json';
							};
							if (types.isString(data)) {
								data = files.Url.parse(data);
							};
							if (types._instanceof(data, files.Url)) {
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
							var Promise = types.getPromise();
							return Promise.reject(new types.NotAvailable("The library 'moment-timezone' is not available."));
						};
					};

					moment.ADD('hasTz', function hasTz() {
						return __Internal__.hasTz;
					});

					return function init(/*optional*/options) {
						var loc = locale.getCurrent();
						if (types.has(loc, 'LC_MOMENT')) {
							global.moment.locale(loc.LC_MOMENT.name);
						};
						if (__Internal__.hasTz && !types.isNothing(__options__.dataUri)) {
							return moment.tz.load();
						};
					};
				},
			};
		};
		return DD_MODULES;
	},
};
//! END_MODULE()