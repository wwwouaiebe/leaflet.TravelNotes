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

/**
@------------------------------------------------------------------------------------------------------------------------------

@function myNewNote
@desc Constructor for a Note object
@return {Note} an instance of a Note object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function myNewNote ( ) {

	const DEFAULT_ICON_SIZE = 0;

	let myObjId = newObjId ( );

	let myIconHeight = DEFAULT_ICON_SIZE;

	let myIconWidth = DEFAULT_ICON_SIZE;

	let myIconContent = '';

	let myPopupContent = '';

	let myTooltipContent = '';

	let myPhone = '';

	let myUrl = '';

	let myAddress = '';

	let myIconLat = LAT_LNG.defaultValue;

	let myIconLng = LAT_LNG.defaultValue;

	let myLat = LAT_LNG.defaultValue;

	let myLng = LAT_LNG.defaultValue;

	let myDistance = DISTANCE.invalid;

	let myChainedDistance = DISTANCE.defaultValue;

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myValidate
	@desc verify that the parameter can be transformed to a Note and performs the upgrate if needed
	@param {Object} something an object to validate
	@return {Object} the validated object
	@throws {Error} when the parameter is invalid
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myValidate ( something ) {
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
				something.objType.version = '1.12.0';
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

		/**
		is true when the note is linked with a route
		@type {boolean}
		@readonly
		*/

		get isRouteNote ( ) { return myDistance !== DISTANCE.invalid; }

		/**
		the height of the icon associated to the note
		@type {!number}
		*/

		get iconHeight ( ) { return myIconHeight; }
		set iconHeight ( IconHeight ) { myIconHeight = IconHeight; }

		/**
		the width of the icon associated to the note
		@type {!number}
		*/

		get iconWidth ( ) { return myIconWidth; }
		set iconWidth ( IconWidth ) { myIconWidth = IconWidth; }

		/**
		the html needed to display the icon
		@type {string}
		*/

		get iconContent ( ) { return myIconContent; }
		set iconContent ( IconContent ) { myIconContent = IconContent; }

		/**
		the latitude of the Note icon
		@type {number}
		*/

		get iconLat ( ) { return myIconLat; }
		set iconLat ( IconLat ) { myIconLat = IconLat; }

		/**
		the longitude of the Note icon
		@type {number}
		*/

		get iconLng ( ) { return myIconLng; }
		set iconLng ( IconLng ) { myIconLng = IconLng; }

		/**
		the latitude and longitude of the Note icon
		@type {number[]}
		*/

		get iconLatLng ( ) { return [ myIconLat, myIconLng ]; }
		set iconLatLng ( IconLatLng ) {
			myIconLat = IconLatLng [ ZERO ];
			myIconLng = IconLatLng [ ONE ];
		}

		/**
		the html added to the icon popup
		@type {string}
		*/

		get popupContent ( ) { return myPopupContent; }
		set popupContent ( PopupContent ) { myPopupContent = PopupContent; }

		/**
		the html added to the icon tooltip
		@type {string}
		*/

		get tooltipContent ( ) { return myTooltipContent; }
		set tooltipContent ( TooltipContent ) { myTooltipContent = TooltipContent; }

		/**
		the phone number dsplayed in the Note
		@type {string}
		*/

		get phone ( ) { return myPhone; }
		set phone ( Phone ) { myPhone = Phone; }

		/**
		the url dsplayed in the Note
		@type {string}
		*/

		get url ( ) { return myUrl; }
		set url ( Url ) { myUrl = Url; }

		/**
		the address dsplayed in the Note
		@type {string}
		*/

		get address ( ) { return myAddress; }
		set address ( Address ) { myAddress = Address; }

		/**
		the latitude of the Note
		@type {number}
		*/

		get lat ( ) { return myLat; }
		set lat ( Lat ) { myLat = Lat; }

		/**
		the longitude of the Note
		@type {number}
		*/

		get lng ( ) { return myLng; }
		set lng ( Lng ) { myLng = Lng; }

		/**
		the latitude and longitude of the Note
		@type {number[]}
		*/

		get latLng ( ) { return [ myLat, myLng ]; }
		set latLng ( LatLng ) {
			myLat = LatLng [ ZERO ];
			myLng = LatLng [ ONE ];
		}

		/**
		the distance between the beginning of the Route and the Note
		@default DISTANCE.invalid
		@type {number}
		*/

		get distance ( ) { return myDistance; }
		set distance ( Distance ) { myDistance = Distance; }

		/**
		the distance between the beginning of the Travel and the Note
		@default DISTANCE.defaultValue
		@type {number}
		*/

		get chainedDistance ( ) { return myChainedDistance; }
		set chainedDistance ( ChainedDistance ) { myChainedDistance = ChainedDistance; }

		/**
		the objId of the Note. objId are unique identifier given by the code
		@readonly
		@type {!number}
		*/

		get objId ( ) { return myObjId; }

		/**
		the ObjType of the Note.
		@type {ObjType}
		@readonly
		*/

		get objType ( ) { return ourObjType; }

		/**
		An object literal with the Note properties and without any methods.
		This object can be used with the JSON object
		@type {Object}
		*/

		get jsonObject ( ) {
			return {
				iconHeight : myIconHeight,
				iconWidth : myIconWidth,
				iconContent : myIconContent,
				popupContent : myPopupContent,
				tooltipContent : myTooltipContent,
				phone : myPhone,
				url : myUrl,
				address : myAddress,
				iconLat : parseFloat ( myIconLat.toFixed ( LAT_LNG.fixed ) ),
				iconLng : parseFloat ( myIconLng.toFixed ( LAT_LNG.fixed ) ),
				lat : parseFloat ( myLat.toFixed ( LAT_LNG.fixed ) ),
				lng : parseFloat ( myLng.toFixed ( LAT_LNG.fixed ) ),
				distance : parseFloat ( myDistance.toFixed ( DISTANCE.fixed ) ),
				chainedDistance : parseFloat ( myChainedDistance.toFixed ( DISTANCE.fixed ) ),
				objId : myObjId,
				objType : ourObjType.jsonObject
			};
		}
		set jsonObject ( something ) {
			let otherthing = myValidate ( something );
			myIconHeight = otherthing.iconHeight || DEFAULT_ICON_SIZE;
			myIconWidth = otherthing.iconWidth || DEFAULT_ICON_SIZE;
			myIconContent = otherthing.iconContent || '';
			myPopupContent = otherthing.popupContent || '';
			myTooltipContent = otherthing.tooltipContent || '';
			myPhone = otherthing.phone || '';
			myUrl = otherthing.url || '';
			myAddress = otherthing.address || '';
			myIconLat = otherthing.iconLat || LAT_LNG.defaultValue;
			myIconLng = otherthing.iconLng || LAT_LNG.defaultValue;
			myLat = otherthing.lat || LAT_LNG.defaultValue;
			myLng = otherthing.lng || LAT_LNG.defaultValue;
			myDistance = otherthing.distance || DISTANCE.invalid;
			myChainedDistance = otherthing.chainedDistance;
			myObjId = newObjId ( );
		}
	}

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

	myNewNote as newNote
};

/*
--- End of Note.js file -------------------------------------------------------------------------------------------------------
*/