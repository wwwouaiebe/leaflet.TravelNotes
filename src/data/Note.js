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
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
	- v1.6.0:
		- Issue ♯65 : Time to go to ES6 modules?
	- v2.0.0:
		- Issue ♯138 : Protect the app - control html entries done by user.
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file Note.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module data
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/* eslint no-fallthrough: ["error", { "commentPattern": "eslint break omitted intentionally" }]*/

import ObjId from '../data/ObjId.js';
import ObjType from '../data/ObjType.js';
import { LAT_LNG, DISTANCE, ZERO, ONE, INVALID_OBJ_ID, ICON_DIMENSIONS } from '../main/Constants.js';
import theHTMLSanitizer from '../coreLib/HTMLSanitizer.js';

const OUR_OBJ_TYPE = new ObjType ( 'Note' );

/**
@--------------------------------------------------------------------------------------------------------------------------

@class Note
@classdesc This class represent a note
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class Note {

	#objId = INVALID_OBJ_ID;;

	/**
	Transform a style attribute to a class attribute for conversion from 1.13.0 to 2.0.0 version
	@param {string} somethingText
	@return {string} the modified text
	@private
	*/

	#UpdateStyles ( somethingText ) {
		let returnValue = somethingText
			.replaceAll ( /style='color:white;background-color:red'/g, 'class=\'TravelNotes-Note-WhiteRed\'' )
			.replaceAll ( /style='color:white;background-color:green'/g, 'class=\'TravelNotes-Note-WhiteGreen\'' )
			.replaceAll ( /style='color:white;background-color:blue'/g, 'class=\'TravelNotes-Note-WhiteBlue\'' )
			.replaceAll ( /style='color:white;background-color:brown'/g, 'class=\'TravelNotes-Note-WhiteBrown\'' )
			.replaceAll ( /style='color:white;background-color:black'/g, 'class=\'TravelNotes-Note-WhiteBlack\'' )
			.replaceAll ( /style='border:solid 0.1em'/g, 'class=\'TravelNotes-Note-BlackWhite\'' )
			.replaceAll ( /style='background-color:white;'/g, 'class=\'TravelNotes-Note-Knooppunt\'' )
			.replaceAll ( /style='fill:green;font:bold 120px sans-serif;'/g, '' )
			.replaceAll ( /style='fill:none;stroke:green;stroke-width:10;'/g, '' );
		return returnValue;
	}

	/**
	Performs the upgrade
	@param {Object} note a note to upgrade
	@throws {Error} when the note version is invalid
	@private
	*/

	/* eslint-disable-next-line complexity */
	#upgradeObject ( note ) {
		switch ( note.objType.version ) {
		case '1.0.0' :
		case '1.1.0' :
		case '1.2.0' :
		case '1.3.0' :
		case '1.4.0' :
		case '1.5.0' :
		case '1.6.0' :
		case '1.7.0' :
		case '1.7.1' :
		case '1.8.0' :
		case '1.9.0' :
		case '1.10.0' :
		case '1.11.0' :
		case '1.12.0' :
		case '1.13.0' :
			if ( 'string' === typeof ( note.iconHeight ) ) {
				note.iconHeight = Number.parseInt ( note.iconHeight );
			}
			if ( 'string' === typeof ( note.iconWidth ) ) {
				note.iconWidth = Number.parseInt ( note.iconWidth );
			}
			note.iconContent = this.#UpdateStyles ( note.iconContent );
			note.popupContent = this.#UpdateStyles ( note.popupContent );
			note.tooltipContent = this.#UpdateStyles ( note.tooltipContent );
			note.phone = this.#UpdateStyles ( note.phone );
			note.address = this.#UpdateStyles ( note.address );
			// eslint break omitted intentionally
		case '2.0.0' :
		case '2.1.0' :
		case '2.2.0' :
			note.objType.version = '2.3.0';
			break;
		default :
			throw new Error ( 'invalid version for ' + OUR_OBJ_TYPE.name );
		}
	}

	/**
	Verify that the parameter can be transformed to a Note and performs the upgrate if needed
	@param {Object} something an object to validate
	@return {Object} the validated object
	@throws {Error} when the parameter is invalid
	@private
	*/

	#validateObject ( something ) {
		if ( ! Object.getOwnPropertyNames ( something ).includes ( 'objType' ) ) {
			throw new Error ( 'No objType for ' + OUR_OBJ_TYPE.name );
		}
		OUR_OBJ_TYPE.validate ( something.objType );
		if ( OUR_OBJ_TYPE.version !== something.objType.version ) {
			this.#upgradeObject ( something );
		}
		let properties = Object.getOwnPropertyNames ( something );
		[
			'iconHeight',
			'iconWidth',
			'iconContent',
			'popupContent',
			'tooltipContent',
			'phone',
			'url',
			'address',
			'iconLat',
			'iconLng',
			'lat',
			'lng',
			'distance',
			'chainedDistance',
			'objId'
		].forEach (
			property => {
				if ( ! properties.includes ( property ) ) {
					throw new Error ( 'No ' + property + ' for ' + OUR_OBJ_TYPE.name );
				}
			}
		);
		return something;
	}

	/*
	constructor
	*/

	constructor ( ) {

		/**
		the height of the icon associated to the note
		@type {!number}
		*/

		this.iconHeight = ICON_DIMENSIONS.height;

		/**
		the width of the icon associated to the note
		@type {!number}
		*/

		this.iconWidth = ICON_DIMENSIONS.width;

		/**
		the html needed to display the icon
		@type {string}
		*/

		this.iconContent = '';

		/**
		the html added to the icon popup
		@type {string}
		*/

		this.popupContent = '';

		/**
		the html added to the icon tooltip
		@type {string}
		*/

		this.tooltipContent = '';

		/**
		the phone number dsplayed in the Note
		@type {string}
		*/

		this.phone = '';

		/**
		the url dsplayed in the Note
		@type {string}
		*/

		this.url = '';

		/**
		the address dsplayed in the Note
		@type {string}
		*/

		this.address = '';

		/**
		the latitude of the Note icon
		@type {number}
		*/

		this.iconLat = LAT_LNG.defaultValue;

		/**
		the longitude of the Note icon
		@type {number}
		*/

		this.iconLng = LAT_LNG.defaultValue;

		/**
		the latitude of the Note
		@type {number}
		*/

		this.lat = LAT_LNG.defaultValue;

		/**
		the longitude of the Note
		@type {number}
		*/

		this.lng = LAT_LNG.defaultValue;

		/**
		the distance between the beginning of the Route and the Note
		@default DISTANCE.invalid
		@type {number}
		*/

		this.distance = DISTANCE.invalid;

		/**
		the distance between the beginning of the Travel and the Note
		@default DISTANCE.defaultValue
		@type {number}
		*/

		this.chainedDistance = DISTANCE.defaultValue;

		this.#objId = ObjId.nextObjId;

		Object.seal ( this );
	}

	/**
	is true when the note is linked with a route
	@type {boolean}
	@readonly
	*/

	get isRouteNote ( ) { return this.distance !== DISTANCE.invalid; }

	/**
	the latitude and longitude of the Note icon
	@type {Array.<number>}
	*/

	get iconLatLng ( ) { return [ this.iconLat, this.iconLng ]; }
	set iconLatLng ( IconLatLng ) {
		this.iconLat = IconLatLng [ ZERO ];
		this.iconLng = IconLatLng [ ONE ];
	}

	/**
	the latitude and longitude of the Note
	@type {Array.<number>}
	*/

	get latLng ( ) { return [ this.lat, this.lng ]; }
	set latLng ( LatLng ) {
		this.lat = LatLng [ ZERO ];
		this.lng = LatLng [ ONE ];
	}

	/**
	the ObjType of the Note.
	@type {ObjType}
	@readonly
	*/

	get objType ( ) { return OUR_OBJ_TYPE; }

	/**
	the objId of the Note. objId are unique identifier given by the code
	@readonly
	@type {!number}
	*/

	get objId ( ) { return this.#objId; }

	/**
	An object literal with the Note properties and without any methods.
	This object can be used with the JSON object
	@type {Object}
	*/

	get jsonObject ( ) {
		return {
			iconHeight : this.iconHeight,
			iconWidth : this.iconWidth,
			iconContent : this.iconContent,
			popupContent : this.popupContent,
			tooltipContent : this.tooltipContent,
			phone : this.phone,
			url : this.url,
			address : this.address,
			iconLat : parseFloat ( this.iconLat.toFixed ( LAT_LNG.fixed ) ),
			iconLng : parseFloat ( this.iconLng.toFixed ( LAT_LNG.fixed ) ),
			lat : parseFloat ( this.lat.toFixed ( LAT_LNG.fixed ) ),
			lng : parseFloat ( this.lng.toFixed ( LAT_LNG.fixed ) ),
			distance : parseFloat ( this.distance.toFixed ( DISTANCE.fixed ) ),
			chainedDistance : parseFloat ( this.chainedDistance.toFixed ( DISTANCE.fixed ) ),
			objId : this.#objId,
			objType : OUR_OBJ_TYPE.jsonObject
		};
	}
	set jsonObject ( something ) {
		let otherthing = this.#validateObject ( something );
		this.iconHeight = otherthing.iconHeight || ICON_DIMENSIONS.height;
		this.iconWidth = otherthing.iconWidth || ICON_DIMENSIONS.width;
		this.iconContent = otherthing.iconContent || '';
		this.popupContent = otherthing.popupContent || '';
		this.tooltipContent = otherthing.tooltipContent || '';
		this.phone = otherthing.phone || '';
		this.url = otherthing.url || '';
		this.address = otherthing.address || '';
		this.iconLat = otherthing.iconLat || LAT_LNG.defaultValue;
		this.iconLng = otherthing.iconLng || LAT_LNG.defaultValue;
		this.lat = otherthing.lat || LAT_LNG.defaultValue;
		this.lng = otherthing.lng || LAT_LNG.defaultValue;
		this.distance = otherthing.distance || DISTANCE.invalid;
		this.chainedDistance = otherthing.chainedDistance || DISTANCE.defaultValue;
		this.#objId = ObjId.nextObjId;
		this.validateData ( true );
	}

	/*
	This method verify that the data stored in the object have the correct type, and,
	for html string data, that they not contains invalid tags and attributes.
	This method must be called each time the data are modified by the user or when
	a file is opened
	*/

	/* eslint-disable-next-line complexity, max-statements */
	validateData ( verbose ) {
		if ( 'number' !== typeof ( this.iconHeight ) ) {
			this.iconHeight = ICON_DIMENSIONS.height;
		}
		if ( 'number' !== typeof ( this.iconWidth ) ) {
			this.iconWidth = ICON_DIMENSIONS.width;
		}
		if ( 'string' === typeof ( this.iconContent ) ) {
			let result = theHTMLSanitizer.sanitizeToHtmlString ( this.iconContent );
			if ( verbose && '' !== result.errorsString ) {
				/* eslint-disable-next-line no-console */
				console.log ( result.errorsString + ' (' + this.iconContent + ')' );
			}
			this.iconContent = result.htmlString;
		}
		else {
			this.iconContent = '';
		}
		if ( 'string' === typeof ( this.popupContent ) ) {
			let result = theHTMLSanitizer.sanitizeToHtmlString ( this.popupContent );
			if ( verbose && '' !== result.errorsString ) {
				/* eslint-disable-next-line no-console */
				console.log ( result.errorsString + ' (' + this.popupContent + ')' );
			}
			this.popupContent = result.htmlString;
		}
		else {
			this.popupContent = '';
		}
		if ( 'string' === typeof ( this.tooltipContent ) ) {
			let result = theHTMLSanitizer.sanitizeToHtmlString ( this.tooltipContent );
			if ( verbose && '' !== result.errorsString ) {
				/* eslint-disable-next-line no-console */
				console.log ( result.errorsString + ' (' + this.tooltipContent + ')' );
			}
			this.tooltipContent = result.htmlString;
		}
		else {
			this.tooltipContent = '';
		}
		if ( 'string' === typeof ( this.phone ) ) {
			let result = theHTMLSanitizer.sanitizeToHtmlString ( this.phone );
			if ( verbose && '' !== result.errorsString ) {
				/* eslint-disable-next-line no-console */
				console.log ( result.errorsString + ' (' + this.phone + ')' );
			}
			this.phone = result.htmlString;
		}
		else {
			this.phone = '';
		}
		if ( 'string' === typeof ( this.url ) && '' !== this.url ) {
			let result = theHTMLSanitizer.sanitizeToUrl ( this.url );
			if ( verbose && '' !== result.errorsString ) {
				/* eslint-disable-next-line no-console */
				console.log ( result.errorsString + ' (' + this.url + ')' );
			}
			this.url = encodeURI ( result.url );
		}
		else {
			this.url = '';
		}
		if ( 'string' === typeof ( this.address ) ) {
			this.address = theHTMLSanitizer.sanitizeToHtmlString ( this.address ).htmlString;
		}
		else {
			this.address = '';
		}
		if ( 'number' !== typeof ( this.iconLat ) ) {
			this.iconLat = LAT_LNG.defaultValue;
		}
		if ( 'number' !== typeof ( this.iconLng ) ) {
			this.iconLng = LAT_LNG.defaultValue;
		}
		if ( 'number' !== typeof ( this.lat ) ) {
			this.lat = LAT_LNG.defaultValue;
		}
		if ( 'number' !== typeof ( this.lng ) ) {
			this.lng = LAT_LNG.defaultValue;
		}
		if ( 'number' !== typeof ( this.distance ) ) {
			this.distance = DISTANCE.invalid;
		}
		if ( 'number' !== typeof ( this.chainedDistance ) ) {
			this.chainedDistance = DISTANCE.defaultValue;
		}
	}
}

export default Note;

/*
--- End of Note.js file -------------------------------------------------------------------------------------------------------
*/