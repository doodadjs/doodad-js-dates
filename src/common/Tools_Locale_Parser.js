//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2016 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Tools_Locale_Parser.js - Locale parser for LC_MOMENT
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
		DD_MODULES['Doodad.Tools.Locale/LC_MOMENT.parser'] = {
			version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
			dependencies: [
				{
					name: 'Doodad.Tools.Dates.Moment',
					optional: true,
				},
			],

			create: function create(root, /*optional*/_options, _shared) {
				"use strict";

				var doodad = root.Doodad,
					types = doodad.Types,
					tools = doodad.Tools,
					locale = tools.Locale,
					dates = tools.Dates,
					moment = types.get(dates, 'Moment'); // optional

				var __Internal__ = {
				};

				__Internal__.oldParseLocale = _shared.parseLocale;
				
				_shared.parseLocale = function parseLocale(data) {
					data = __Internal__.oldParseLocale(data);

					if (moment) {
						var LC_MOMENT = types.get(data, 'LC_MOMENT');
						if (LC_MOMENT) {
							var defineFake = function(whatever, factory) {
								var cur = moment.locale();

								data.LC_MOMENT = factory(moment);

								if (moment.locale() !== cur) {
									moment.locale(cur); // <FIX> "moment.defineLocale" globally sets the new locale
								};
							};
							defineFake.amd = true;

							var getData = new global.Function('exports', 'module', 'require', 'define', LC_MOMENT);
							getData.call(global, undefined, undefined, undefined, defineFake);
						};
					};

					return data;
				};

				
				/****************************************************************************************************/
				
				
				//return function init(/*optional*/options) {
				//
				//};
			},
		};
		return DD_MODULES;
	},
};
//! END_MODULE()