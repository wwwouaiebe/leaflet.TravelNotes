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

import { GEOLOCATION_STATUS, ONE } from '../util/Constants.js';

/*
--- newGeoLocator function --------------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/

function newGeoLocator ( ) {

	let myStatus = GEOLOCATION_STATUS.disabled;
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
		if ( GEOLOCATION_STATUS.active === myStatus ) {
			myStatus = GEOLOCATION_STATUS.inactive;
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
		if ( ONE === positionError.code ) { // see positionError object in MDN
			myStatus = GEOLOCATION_STATUS.refusedByUser;
		}
		myStop ( );
	}

	/*
	--- myStart function ----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myStart ( ) {
		myStatus = GEOLOCATION_STATUS.active;
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
		case GEOLOCATION_STATUS.inactive :
			myStart ( );
			break;
		case GEOLOCATION_STATUS.active :
			myStop ( );
			break;
		default :
			break;
		}

		return myStatus;
	}

	myStatus =
		( 'geolocation' in navigator )
			?
			GEOLOCATION_STATUS.inactive
			:
			GEOLOCATION_STATUS.disabled;

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