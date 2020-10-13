/*
Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/

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
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed 20200731
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file Note.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module Note
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { newObjId } from '../data/ObjId.js';
import { newObjType } from '../data/ObjType.js';
import { LAT_LNG, DISTANCE, ZERO, ONE } from '../util/Constants.js';

const ourObjType = newObjType ( 'Note' );
const ourObjIds = new WeakMap ( );
const DEFAULT_ICON_SIZE = 0;

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourValidate
@desc verify that the parameter can be transformed to a Note and performs the upgrate if needed
@param {Object} something an object to validate
@return {Object} the validated object
@throws {Error} when the parameter is invalid
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourValidate ( something ) {
	if ( ! Object.getOwnPropertyNames ( something ).includes ( 'objType' ) ) {
		throw new Error ( 'No objType for ' + ourObjType.name );
	}
	ourObjType.validate ( something.objType );
	if ( ourObjType.version !== something.objType.version ) {
		switch ( something.objType.version ) {
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
			something.objType.version = '1.13.0';
			break;
		default :
			throw new Error ( 'invalid version for ' + ourObjType.name );
		}
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
				throw new Error ( 'No ' + property + ' for ' + ourObjType.name );
			}
		}
	);
	return something;
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class Note
@classdesc This class represent a note
@see {@link newNote} for constructor
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class Note	{
	constructor ( ) {

		/**
		the height of the icon associated to the note
		@type {!number}
		*/

		this.iconHeight = DEFAULT_ICON_SIZE;

		/**
		the width of the icon associated to the note
		@type {!number}
		*/

		this.iconWidth = DEFAULT_ICON_SIZE;

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

		ourObjIds.set ( this, newObjId ( ) );
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

	get objType ( ) { return ourObjType; }

	/**
	the objId of the Note. objId are unique identifier given by the code
	@readonly
	@type {!number}
	*/

	get objId ( ) { return ourObjIds.get ( this ); }

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
			objId : ourObjIds.get ( this ),
			objType : ourObjType.jsonObject
		};
	}
	set jsonObject ( something ) {
		let otherthing = ourValidate ( something );
		this.iconHeight = otherthing.iconHeight || DEFAULT_ICON_SIZE;
		this.iconWidth = otherthing.iconWidth || DEFAULT_ICON_SIZE;
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
		this.chainedDistance = otherthing.chainedDistance;
		ourObjIds.set ( this, newObjId ( ) );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewNote
@desc Constructor for a Note object
@return {Note} an instance of a Note object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewNote ( ) {
	return Object.seal ( new Note );
}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newNote
	@desc Constructor for a Note object
	@return {Note} an instance of a Note object
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourNewNote as newNote
};

/*
--- End of Note.js file -------------------------------------------------------------------------------------------------------
*/