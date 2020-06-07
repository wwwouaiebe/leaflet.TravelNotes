/*
Copyright - 2017 - wwwouaiebe - Contact: http//www.ouaie.be/
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
--- Note.js file ------------------------------------------------------------------------------------------------------
This file contains:
	- the newNote function
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed 20191122
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { newObjId } from '../data/ObjId.js';
import { newObjType } from '../data/ObjType.js';

import { LAT_LNG, DISTANCE, ZERO, ONE } from '../util/Constants.js';

const ourObjType = newObjType ( 'Note' );

/*
--- newNote function ----------------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/

function newNote ( ) {

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

	/*
	--- myValidate function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
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
				something.objType.version = '1.11.0';
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

	/*
	--- myGetObject function ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetObject ( ) {
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
			objType : ourObjType.object
		};
	}

	/*
	--- mySetObject function ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySetObject ( something ) {
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

	/*
	--- note object ---------------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{

			get isRouteNote ( ) { return myDistance !== DISTANCE.invalid; },

			get iconHeight ( ) { return myIconHeight; },
			set iconHeight ( IconHeight ) { myIconHeight = IconHeight; },

			get iconWidth ( ) { return myIconWidth; },
			set iconWidth ( IconWidth ) { myIconWidth = IconWidth; },

			get iconContent ( ) { return myIconContent; },
			set iconContent ( IconContent ) { myIconContent = IconContent; },

			get popupContent ( ) { return myPopupContent; },
			set popupContent ( PopupContent ) { myPopupContent = PopupContent; },

			get tooltipContent ( ) { return myTooltipContent; },
			set tooltipContent ( TooltipContent ) { myTooltipContent = TooltipContent; },

			get phone ( ) { return myPhone; },
			set phone ( Phone ) { myPhone = Phone; },

			get url ( ) { return myUrl; },
			set url ( Url ) { myUrl = Url; },

			get address ( ) { return myAddress; },
			set address ( Address ) { myAddress = Address; },

			get iconLat ( ) { return myIconLat; },
			set iconLat ( IconLat ) { myIconLat = IconLat; },

			get iconLng ( ) { return myIconLng; },
			set iconLng ( IconLng ) { myIconLng = IconLng; },

			get iconLatLng ( ) { return [ myIconLat, myIconLng ]; },
			set iconLatLng ( IconLatLng ) {
				myIconLat = IconLatLng [ ZERO ];
				myIconLng = IconLatLng [ ONE ];
			},

			get lat ( ) { return myLat; },
			set lat ( Lat ) { myLat = Lat; },

			get lng ( ) { return myLng; },
			set lng ( Lng ) { myLng = Lng; },

			get latLng ( ) { return [ myLat, myLng ]; },
			set latLng ( LatLng ) {
				myLat = LatLng [ ZERO ];
				myLng = LatLng [ ONE ];
			},

			get distance ( ) { return myDistance; },
			set distance ( Distance ) { myDistance = Distance; },

			get chainedDistance ( ) { return myChainedDistance; },
			set chainedDistance ( ChainedDistance ) { myChainedDistance = ChainedDistance; },

			get objId ( ) { return myObjId; },

			get objType ( ) { return ourObjType; },

			get object ( ) { return myGetObject ( ); },
			set object ( something ) { mySetObject ( something ); }
		}
	);
}

export { newNote };

/*
--- End of Note.js file -----------------------------------------------------------------------------------------------
*/