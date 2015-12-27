//! REPLACE_BY("// Copyright 2015 Claude Petit, licensed under Apache License version 2.0\n")
// dOOdad - Object-oriented programming framework with some extras
// File: Tools_Dates.js - Useful date/time tools
// Project home: https://sourceforge.net/projects/doodad-js/
// Trunk: svn checkout svn://svn.code.sf.net/p/doodad-js/code/trunk doodad-js-code
// Author: Claude Petit, Quebec city
// Contact: doodadjs [at] gmail.com
// Note: I'm still in alpha-beta stage, so expect to find some bugs or incomplete parts !
// License: Apache V2
//
//	Copyright 2015 Claude Petit
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

(function() {
	var global = this;

	var exports = {};
	if (global.process) {
		module.exports = exports;
	};
	
	exports.add = function add(DD_MODULES) {
		DD_MODULES = (DD_MODULES || {});
		DD_MODULES['Doodad.Tools.Dates'] = {
			type: null,
			version: '1r',
			namespaces: null,
			dependencies: ['Doodad.Tools', 'Doodad.Tools.Locale'],
			
			create: function create(root, /*optional*/_options) {
				"use strict";

				var doodad = root.Doodad,
					tools = doodad.Tools,
					locale = tools.Locale,
					dates = tools.Dates;

				// Source: http://stackoverflow.com/questions/8619879/javascript-calculate-the-day-of-the-year-1-366
				dates.isLeapYear = function isLeapYear(year) {
					if ((year & 3) != 0) {
						return false;
					};
					return ((year % 100) != 0 || (year % 400) == 0);
				};

				// Source: http://stackoverflow.com/questions/8619879/javascript-calculate-the-day-of-the-year-1-366
				var __dayCount__ = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
				dates.getDayOfYear = function getDayOfYear(date, /*optional*/utc) {
					var mn = (utc ? date.getUTCMonth() : date.getMonth()),
						dn = (utc ? date.getUTCDate() : date.getDate()),
						dayOfYear = __dayCount__[mn] + dn;
					if ((mn > 1) && dates.isLeapYear((utc ? date.getUTCFullYear() : date.getFullYear()))) {
						dayOfYear++;
					};
					return dayOfYear;
				};
				
				/****************************************************************************************************/

				//! REPLACE_BY("\n// Copyright (C) 2002-2015 Free Software Foundation, Inc.\n")
				/* Copyright (C) 2002-2015 Free Software Foundation, Inc.
				   The following is a translation of the file 'strftime_l.c' of the GNU C Library.

				   The GNU C Library is free software; you can redistribute it and/or
				   modify it under the terms of the GNU Lesser General Public
				   License as published by the Free Software Foundation; either
				   version 2.1 of the License, or (at your option) any later version.

				   The GNU C Library is distributed in the hope that it will be useful,
				   but WITHOUT ANY WARRANTY; without even the implied warranty of
				   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
				   Lesser General Public License for more details.

				   You should have received a copy of the GNU Lesser General Public
				   License along with the GNU C Library; if not, see
				   <http://www.gnu.org/licenses/>.  */
				//! END_REPLACE()

				//var tzset_called = false;
				
				var ISO_WEEK_START_WDAY = 1,
					ISO_WEEK1_WDAY = 4, /* Thursday */
					YDAY_MINIMUM = -366,
					big_enough_multiple_of_7 = (Math.floor(-YDAY_MINIMUM / 7) + 2) * 7;
					
				dates.isoWeekDays = function isoWeekDays(yday, wday) {
					/* Add enough to the first operand of % to make it nonnegative.  */
					return (yday
					- (yday - wday + ISO_WEEK1_WDAY + big_enough_multiple_of_7) % 7
					+ ISO_WEEK1_WDAY - ISO_WEEK_START_WDAY);
				};
				
				dates.strftime = function strftime(format, obj, /*optional*/loc, /*optional*/utc) {
					var current;
					if (loc) {
						current = loc.categories[locale.LC_TIME];
					} else {
						current = locale.getCurrent().categories[locale.LC_TIME]
					};
					
					var negative_number;
					
					/* The POSIX test suite assumes that setting
					 the environment variable TZ to a new value before calling strftime()
					 will influence the result (the %Z format) even if the information in
					 TP is computed with a totally different time zone.
					 This is bogus: though POSIX allows bad behavior like this,
					 POSIX does not require it.  Do the right thing instead.  */

					// NOTE: The offset sign is inverted
					var zone = (utc ? 0 : -obj.getTimezoneOffset());
					if (zone === 0) {
						zone = 'UTC';
					} else {
						negative_number = zone < 0;
						if (negative_number) {
							zone = -zone;
						};
						zone = 'UTC' + (negative_number ? '-' : '+') + ('0' + Math.floor(zone / 60)).slice(-2) + ':' + ('0' + (zone % 60)).slice(-2);
					};

					var hour12 = (utc ? obj.getUTCHours() : obj.getHours());
					if (hour12 > 12) {
						hour12 -= 12;
					} else if (hour12 == 0) {
						hour12 = 12;
					};
					
					function do_number_sign_and_padding(str, digits) {
						if (pad !== '-') {
							var padding = digits - str.length;
							if (negative_number) {
								padding--;
							};

							if (padding > 0) {
								if (pad == '_') {
									str = tools.repeat(' ', padding) + str;
									//width = width > padding ? width - padding : 0;
								} else {
									str = tools.repeat('0', padding) + str;
									//width = 0;
								};
							};
						};

						if (negative_number) {
							str = '-' + str;
						};
						
						return str;
					};
					
					function DO_NUMBER(digits, number_value) {
						digits = digits > width ? digits : width;
						
						/* Format the number according to the MODIFIER flag.  */

						if ((modifier === 'O') && (0 <= number_value))
						{
							/* Get the locale specific alternate representation of
							the number NUMBER_VALUE.  If none exist NULL is returned.  */
							var cp = current.alt_digits[number_value];

							if (cp) {
								return cpy (cp);
							};
						};
						
						negative_number = number_value < 0;

						if (negative_number) {
							number_value = -number_value;
						};
					  
						return do_number_sign_and_padding(number_value + '', digits);
					};
					
					function DO_NUMBER_SPACEPAD(digits, number_value) {
						/* Force `_' flag unless overwritten by `0' or '-' flag.  */
						if ((pad !== '0') && (pad !== '-')) {
							pad = '_';
						};

						return DO_NUMBER(digits, number_value);
					};
					
					function ISDIGIT(chr) {
						return ((chr >= '0') && (chr <= '9'));
					};
					
					function add(s) {
						var _delta = width - s.length;
						if (_delta > 0) {
							if (pad == '0')	{
								s = tools.repeat('0', _delta) + s;
							} else {
								s = tools.repeat(' ', _delta) + s;
							};
						};
						return s;
					};

					function cpy(s) {
						s = add(s);
						if (to_lowcase) {
							s = s.toLowerCase();
						} else if (to_uppcase) {
							s = s.toUpperCase();
						};
						return s;
					};
					
					function subformat(subfmt) {
						var retval = add(strftime(subfmt, obj, loc));

						if (to_uppcase) {
							retval = retval.toUpperCase();
						};
						
						return retval;
					};

					function bad_format() {
						var retval = format.slice(p);
						var pos = retval.indexOf('%');
						if (pos >= 0) {
							retval = retval.slice(0, pos);
						};
						p += retval.length;
						return cpy(retval);
					};
					
					var retval = '';
					  
					var p = 0,
						formatLen = format.length;
					
					while (p < formatLen) {
						var pad = null,		/* Padding for number ('-', '_', or null).  */
							modifier = null,		/* Field modifier ('E', 'O', or null).  */
							digits = 0,		/* Max digits for numeric format.  */
							number_value = 0, 	/* Numeric value to be printed.  */
							negative_number = false,	/* 1 if the number is negative.  */
							subfmt = '',
							width = -1,
							to_lowcase = false,
							to_uppcase = false,
							change_case = false;

						  /* Either multibyte encodings are not supported, they are
						 safe for formats, so any non-'%' byte can be copied through,
						 or this is the wide character version.  */
						var chr = format[p];
						if (chr !== '%')
						{
							retval += add (chr);
							p++;
							continue;
						};
						
						/* Check for flags that can modify a format.  */
						while (p < formatLen) {
							var chr = format[++p];
							switch (chr) {
								/* This influences the number formats.  */
								case '_':
								case '-':
								case '0':
									pad = chr;
									continue;

								/* This changes textual output.  */
								case '^':
									to_uppcase = true;
									continue;
								case '#':
									change_case = true;
									continue;

								default:
									break;
							};
							break;
						};

						/* As a GNU extension we allow to specify the field width.  */
						width = '';
						while (p < formatLen) {
							chr = format[p];
							if (!ISDIGIT(chr)) {
								break;
							};
							width += chr;
							p++;
						};
						width = parseInt(width) || 0;

						/* Check for modifiers.  */
						if (p >= formatLen) {
							break;
						};
						switch (chr) {
							case 'E':
							case 'O':
								modifier = chr;
								p++;
								break;

							default:
								modifier = null;
								break;
						};

						/* Now do the specified format.  */
						if (p >= formatLen) {
							break;
						};
						chr = format[p];
						switch (chr) {
							case '%':
								if (modifier !== null) {
									retval += bad_format();
									break;
								};
								retval += add (chr);
								break;

							case 'a': // Short Weekday
								if (modifier !== null) {
									retval += bad_format();
									break;
								};
								if (change_case)
								{
									to_uppcase = true;
									to_lowcase = false;
								};
								retval += cpy (current.abday[(utc ? obj.getUTCDay() : obj.getDay())]);
								
								break;

							case 'A': // Full Weekday
								if (modifier !== null) {
									retval += bad_format();
									break;
								};
								if (change_case)
								{
									to_uppcase = true;
									to_lowcase = false;
								};
								retval += cpy (current.day[(utc ? obj.getUTCDay() : obj.getDay())]);
								break;

							case 'b': // Short Month
							case 'h':
								if (change_case)
								{
									to_uppcase = true;
									to_lowcase = false;
								}
								if (modifier !== null) {
									retval += bad_format();
									break;
								};
								retval += cpy (current.abmon[(utc ? obj.getUTCMonth() : obj.getMonth())]);
								break;

							case 'B': // Full Month
								if (modifier !== null) {
									retval += bad_format();
									break;
								};
								if (change_case)
								{
									to_uppcase = true;
									to_lowcase = false;
								}
								retval += cpy (current.mon[(utc ? obj.getUTCMonth() : obj.getMonth())]);
								break;

							case 'c':
								if (modifier === 'O') {
									retval += bad_format();
									break;
								};
								if (!((modifier === 'E') && (subfmt = current.era_d_t_fmt))) {
									subfmt = current.d_t_fmt;
								};

								retval += subformat(subfmt);
								break;

							case 'C':	// Century
								if (modifier === 'E') {
									retval += bad_format();
									break;
		/*
									struct era_entry *era = _nl_get_era_entry (obj HELPER_LOCALE_ARG);
									if (era) {
										retval += cpy (era->era_name);
										break;
									};
		*/
								};

								var year = (utc ? obj.getUTCFullYear() : obj.getFullYear());
								retval += DO_NUMBER (1, Math.floor(year / 100) - (year % 100 < 0));
								break;

							case 'x':
								if (modifier === 'O') {
									retval += bad_format();
									break;
								};
								if (!((modifier === 'E') && (subfmt = current.era_d_fmt))) {
									subfmt = current.d_fmt;
								};

								retval += subformat(subfmt);
								break;
								
							case 'D':
								if (modifier !== null) {
									retval += bad_format();
									break;
								};
								subfmt = "%m/%d/%y";
								retval += subformat(subfmt);
								break;

							case 'd': // Day of month
								if (modifier === 'E') {
									retval += bad_format();
									break;
								};

								retval += DO_NUMBER (2, (utc ? obj.getUTCDate() : obj.getDate()));
								break;

							case 'e': // Day of month (padding)
								if (modifier == 'E') {
									retval += bad_format();
									break;
								};
								
								retval += DO_NUMBER_SPACEPAD (2, (utc ? obj.getUTCDate() : obj.getDate()));
								break;

							case 'F':
								if (modifier !== null) {
									retval += bad_format();
									break;
								};
								subfmt = "%Y-%m-%d";
								retval += subformat(subfmt);
								break;

							case 'H': // Hours 24
								if (modifier === 'E') {
									retval += bad_format();
									break;
								};
								
								retval += DO_NUMBER (2, (utc ? obj.getUTCHours() : obj.getHours()));
								break;

							case 'I': // Hours 12
								if (modifier == 'E') {
									retval += bad_format();
									break;
								};

								retval += DO_NUMBER (2, hour12);
								break;

							case 'k': // Hour 24 (padding)		/* GNU extension.  */
								if (modifier === 'E') {
									retval += bad_format();
									break;
								};

								retval += DO_NUMBER_SPACEPAD (2, (utc ? obj.getUTCHours() : obj.getHours()));
								break;

							case 'l': // Hour 12 (padding)		/* GNU extension.  */
								if (modifier === 'E') {
									retval += bad_format();
									break;
								};

								retval += DO_NUMBER_SPACEPAD (2, hour12);
								break;

							case 'j':  // Day of year
								if (modifier === 'E') {
									retval += bad_format();
									break;
								};

								retval += DO_NUMBER (3, 1 + dates.getDayOfYear(obj, utc));
								break;

							case 'M': // Minutes
								if (modifier === 'E') {
									retval += bad_format();
									break;
								};

								retval += DO_NUMBER (2, (utc ? obj.getUTCMinutes() : obj.getMinutes()));
								break;

							case 'm': // Month
								if (modifier === 'E') {
									retval += bad_format();
									break;
								};

								retval += DO_NUMBER (2, (utc ? obj.getUTCMonth() : obj.getMonth()) + 1);
								break;

							case 'n': // New line
								retval += add ('\n');
								break;

							case 'P': // am/pm
								to_uppcase = false;
								to_lowcase = true;
								retval += cpy (current.am_pm[(utc ? obj.getUTCHours() : obj.getHours()) > 11 ? 1 : 0]);
								break;

							case 'p': // AM/PM
								if (change_case)
								{
								  to_uppcase = false;
								  to_lowcase = true;
								};
								retval += cpy (current.am_pm[(utc ? obj.getUTCHours() : obj.getHours()) > 11 ? 1 : 0]);
								break;

							case 'R':
								subfmt = "%H:%M";
								retval += subformat(subfmt);
								break;

							case 'r':
								if (!(subfmt = current.t_fmt_ampm)) {
									subfmt = "%I:%M:%S %p";
								};
								retval += subformat(subfmt);
								break;

							case 'S': // Seconds
								if (modifier === 'E') {
									retval += bad_format();
									break;
								};

								retval += DO_NUMBER (2, (utc ? obj.getUTCSeconds() : obj.getSeconds()));
								break;

		/*
							case 's':		/ * GNU extension.  * /
								struct tm ltm;
								time_t t;

								ltm = *obj;
								t = mktime (&ltm);

								/ * Generate string value for T using time_t arithmetic;
								this works even if sizeof (long) < sizeof (time_t).  * /

								bufp = buf + sizeof (buf) / sizeof (buf[0]);
								negative_number = t < 0;

								do {
									var d = t % 10;
									t /= 10;

									if (negative_number)
									{
										d = -d;

										/ * Adjust if division truncates to minus infinity.  * /
										if (0 < -1 % 10 && d < 0)
										{
											t++;
											d += 10;
										};
									};

									*--bufp = d + '0';
								} while (t != 0);

								digits = 1;
								retval += do_number_sign_and_padding(buf, digits);
								break;
		*/

							case 'X':
								if (modifier === 'O') {
									retval += bad_format();
									break;
								};
								if (!((modifier === 'E') && (subfmt = current.era_t_fmt))) {
									subfmt = current.t_fmt;
								};
								retval += subformat(subfmt);
								break;
						  
							case 'T':
								subfmt = "%H:%M:%S";
								retval += subformat(subfmt);
								break;

							case 't':  // Tab
								retval += add ('\t');
								break;

							case 'u': // Day of week
								retval += DO_NUMBER (1, ((utc ? obj.getUTCDay() : obj.getDay()) - 1 + 7) % 7 + 1);
								break;

							case 'U':
								if (modifier === 'E') {
									retval += bad_format();
									break;
								};

								retval += DO_NUMBER (2, Math.floor((dates.getDayOfYear(obj, utc) - (utc ? obj.getUTCDay() : obj.getDay()) + 7) / 7));
								break;

							case 'V':
							case 'g':
							case 'G':
								if (modifier === 'E') {
									retval += bad_format();
									break;
								};
								var year = (utc ? obj.getUTCFullYear() : obj.getFullYear()),
									days = dates.isoWeekDays(dates.getDayOfYear(obj, utc), (utc ? obj.getUTCDay() : obj.getDay()));

								if (days < 0) {
									/* This ISO week belongs to the previous year.  */
									year--;
									days = dates.isoWeekDays (dates.getDayOfYear(obj, utc) + (365 + dates.isLeapYear (year)), (utc ? obj.getUTCDay() : obj.getDay()));
								} else {
									var d = dates.isoWeekDays (dates.getDayOfYear(obj, utc) - (365 + dates.isLeapYear (year)), (utc ? obj.getUTCDay() : obj.getDay()));
									if (0 <= d)
									{
										/* This ISO week belongs to the next year.  */
										year++;
										days = d;
									};
								};

								switch (chr) {
									case 'g':
										retval += DO_NUMBER (2, (year % 100 + 100) % 100);
										break;

									case 'G':
										retval += DO_NUMBER (1, year);
										break;

									default:
										retval += DO_NUMBER (2, Math.floor(days / 7) + 1);
										break;
								};
								break;

							case 'W':  // Week of year
								if (modifier === 'E') {
									retval += bad_format();
									break;
								};

								retval += DO_NUMBER (2, Math.floor(((dates.getDayOfYear(obj, utc) - ((utc ? obj.getUTCDay() : obj.getDay()) - 1 + 7) % 7 + 7) / 7) + 0.5));
								break;
				
							case 'w': // Week day number
								if (modifier === 'E') {
									retval += bad_format();
									break;
								};

								retval += DO_NUMBER (1, (utc ? obj.getUTCDay() : obj.getDay()));
								break;

							case 'Y':
								if (modifier === 'E') {
									retval += bad_format();
									break;
		/*
									struct era_entry *era = _nl_get_era_entry (obj HELPER_LOCALE_ARG);
									if (era) {
										subfmt = era->era_format;
										retval += subformat(subfmt);
										break;
									}
		*/
								} else if (modifier === 'O') {
									retval += bad_format();
									break;
								} else {
									retval += DO_NUMBER (1, (utc ? obj.getUTCFullYear() : obj.getFullYear()));
									break;
								};
								break;

							case 'y':
								if (modifier === 'E') {
									retval += bad_format();
									break;
		/*
									struct era_entry *era = _nl_get_era_entry (obj HELPER_LOCALE_ARG);
									if (era)
									{
										var delta = (utc ? obj.????() : obj.getYear()) - era->start_date[0];
										retval += DO_NUMBER (1, (era->offset + delta * era->absolute_direction));
										break;
									};
		*/
								};
								
								retval += DO_NUMBER (2, ((utc ? obj.getUTCFullYear() : obj.getFullYear()) % 100 + 100) % 100);
								break;

							case 'Z': // Timezone name
								if (change_case)
								{
									to_uppcase = false;
									to_lowcase = true;
								};

								if (!zone) {
									zone = "";
								};

								retval += cpy (zone);
								break;

							case 'z':  // Timezone offset
				/*
								if (obj->tm_isdst < 0) {
									break;
								};
				*/

								// NOTE: The offset sign is inverted
								var diff = (utc ? 0 : -obj.getTimezoneOffset());

								if (diff < 0) {
									retval += add ('-');
									diff = -diff;
								} else {
									retval += add ('+');
								};

								//diff /= 60;
								retval += DO_NUMBER (4, Math.floor(diff / 60 * 100) + (diff % 60));
								break;

	/*
							case '\0':		/ * GNU extension: % at end of format.  * /
								p--;
								retval += bad_format();
								break;
	*/

							default:
						  /* Unknown format; output the format, including the '%',
							 since this is most likely the right thing to do if a
							 multibyte string has been misparsed.  */
								retval += bad_format();
						};
						
						p++;
					};

					return retval;
				};	
				
				/****************************************************************************************************/
				
				
				//return function init(/*optional*/options) {
				//
				//};
			},
		};
		
		return DD_MODULES;
	};
	
	if (!global.process) {
		// <PRB> export/import are not yet supported in browsers
		global.DD_MODULES = exports.add(global.DD_MODULES);
	};
})();
