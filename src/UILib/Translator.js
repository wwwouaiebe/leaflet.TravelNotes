/*
Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/

This  program is free software;
you can redistribute it and/or modify it under the terms of the
GNU General Public License as published by the Free Software Foundation;
either version 3 of the License, or any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/
/*
Changes:
	- v1.0.0:
		- created
	- v1.6.0:
		- Issue ♯65 : Time to go to ES6 modules?
	- v2.0.0:
		- Issue ♯137 : Remove html tags from json files
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file Translator.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@typedef {Object} Translation
@desc An object used to store translated messages
@property {string} msgid an id to use to identify the message
@property {string} msgstr The message translated
@public

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module UILib
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theHTMLSanitizer from '../coreLib/HTMLSanitizer.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class is used to translate the messages in another language
@see {@link theTranslator} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class Translator {

	#translations = new Map ( );

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	Load the translations
	@param {Array.<Translation>} translations The translations to load
	*/

	setTranslations ( translations ) {
		translations.forEach (
			translation => this.#translations.set (
				translation.msgid,
				theHTMLSanitizer.sanitizeToJsString ( translation.msgstr )
			)
		);
	}

	/**
	get a message translated
	@param {string} msgid The id to identify the message
	@param {?Object} params Parameters to include in the message
	@return {string} The message corresponding to the id, eventually with params added, or the
	id if the corresponding Translation was not found
	*/

	getText ( msgid, params ) {
		let translation = this.#translations.get ( msgid );
		if ( params && translation ) {
			Object.getOwnPropertyNames ( params ).forEach (
				propertyName => translation = translation.replace ( '{' + propertyName + '}', params [ propertyName ] )
			);
		}
		return translation ? translation : msgid;
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@desc The one and only one instance of Translator class
@type {Translator}
@constant
@global

@--------------------------------------------------------------------------------------------------------------------------
*/

const theTranslator = new Translator ( );

export default theTranslator;

/*
--- End of Translator.js file -----------------------------------------------------------------------------------------
*/