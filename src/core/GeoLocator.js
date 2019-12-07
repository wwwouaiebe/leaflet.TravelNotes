/*
Copyright - 2019 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- GeoLocator.js file ------------------------------------------------------------------------------------------------
This file contains:
	- the newGeoLocator function
Changes:
	- v1.6.0:
		- created
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

/*
--- newGeoLocator function --------------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/

import { newEventDispatcher } from '../util/EventDispatcher.js';
import { theConfig } from '../data/Config.js';

import  { OUR_CONST } from '../util/Constants.js';

/*
--- newGeoLocator function --------------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/

function newGeoLocator ( ) {

	let myStatus = OUR_CONST.geoLocation.status.disabled;
	let myWatchId = null;
	let myEventDispatcher = newEventDispatcher ( );

	/*
	--- myShowPosition function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myShowPosition ( position ) {
		myEventDispatcher.dispatch ( 'geolocationpositionchanged', { position : position } );
	}

	/*
	--- myStop function -----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myStop ( ) {
		if ( OUR_CONST.geoLocation.status.active === myStatus ) {
			myStatus = OUR_CONST.geoLocation.status.inactive;
		}

		// if ( myWatchId ) FF: the myWatchId is always 0 so we cannot use myWatchId to see if the geolocation is running
		myEventDispatcher.dispatch ( 'geolocationstatuschanged', { status : myStatus } );
		navigator.geolocation.clearWatch ( myWatchId );
		myWatchId = null;
	}

	/*
	--- myError function ----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myError ( positionError ) {
		if ( OUR_CONST.number1 === positionError.code ) { // see positionError object in MDN
			myStatus = OUR_CONST.geoLocation.status.refusedByUser;
		}
		myStop ( );
	}

	/*
	--- myStart function ----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myStart ( ) {
		myStatus = OUR_CONST.geoLocation.status.active;
		myEventDispatcher.dispatch ( 'geolocationstatuschanged', { status : myStatus } );
		navigator.geolocation.getCurrentPosition ( myShowPosition, myError, theConfig.geoLocation.options );
		myWatchId = navigator.geolocation.watchPosition ( myShowPosition, myError, theConfig.geoLocation.options );
	}

	/*
	--- mySwitch function ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySwitch ( ) {
		switch ( myStatus ) {
		case OUR_CONST.geoLocation.status.inactive :
			myStart ( );
			break;
		case OUR_CONST.geoLocation.status.active :
			myStop ( );
			break;
		default :
			break;
		}

		return myStatus;
	}

	myStatus = ( 'geolocation' in navigator ) ? 1 : 0;

	/*
	--- GeoLocator object ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			get status ( ) { return myStatus; },
			switch : ( ) => mySwitch ( )

		}
	);
}

const theGeoLocator = newGeoLocator ( );

export { theGeoLocator };

/*
--- End of GeoLocator.js file -----------------------------------------------------------------------------------------
*/