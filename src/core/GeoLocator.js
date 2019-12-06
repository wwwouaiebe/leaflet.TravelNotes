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

export { theGeoLocator };
import { newEventDispatcher } from '../util/EventDispatcher.js';
import { theConfig } from '../data/Config.js';

/*
--- newGeoLocator function --------------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/

function newGeoLocator ( ) {

	let myStatus = 0; // ( -1 refused by user, 0 disabled (http or not working ), 1 available but not working, 2 working )
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
	--- myError function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myError ( positionError ) {
		if ( 1 === positionError.code ) { // access not allowed by user
			myStatus = -1;
		}
		myStop ( );
	}

	/*
	--- myStart function ----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myStart ( ) {
		myStatus = 2;
		myEventDispatcher.dispatch ( 'geolocationstatuschanged', { status : myStatus } );
		navigator.geolocation.getCurrentPosition ( myShowPosition, myError, theConfig.geoLocation.options );
		myWatchId = navigator.geolocation.watchPosition ( myShowPosition, myError, theConfig.geoLocation.options );
	}

	/*
	--- myStop function -----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myStop ( ) {
		if ( 2 === myStatus ) {
			myStatus = 1;
		}

		// if ( myWatchId ) FF: the myWatchId is always 0 so we cannot use myWatchId to see if the geolocation is running
		myEventDispatcher.dispatch ( 'geolocationstatuschanged', { status : myStatus } );
		navigator.geolocation.clearWatch ( myWatchId );
		myWatchId = null;
	}

	/*
	--- mySwitch function ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySwitch ( ) {
		switch ( myStatus ) {
		case 1:
			myStart ( );
			break;
		case 2:
			myStop ( );
			break;
		default:
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
			switch : ( ) => { return mySwitch ( ); }

		}
	);
}

const theGeoLocator = newGeoLocator ( );

/*
--- End of GeoLocator.js file -----------------------------------------------------------------------------------------
*/