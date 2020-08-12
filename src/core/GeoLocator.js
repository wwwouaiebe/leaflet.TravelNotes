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
	- v1.6.0:
		- created
Doc reviewed ...
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file GeoLocator.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module GeoLocator
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { newEventDispatcher } from '../util/EventDispatcher.js';
import { theConfig } from '../data/Config.js';
import { GEOLOCATION_STATUS, ONE } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewGeoLocator
@desc constructor for theGeoLocator object
@return {GeoLocator} an instance of GeoLocator object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewGeoLocator ( ) {

	let myStatus =
		( 'geolocation' in navigator )
			?
			GEOLOCATION_STATUS.inactive
			:
			GEOLOCATION_STATUS.disabled;
	let myWatchId = null;
	let myEventDispatcher = newEventDispatcher ( );

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myShowPosition
	@desc send an event to show the current position on the map
	@param {GeolocationPosition} position a JS GeolocationPosition object
	@fires geolocationpositionchanged
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myShowPosition ( position ) {
		myEventDispatcher.dispatch ( 'geolocationpositionchanged', { position : position } );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myStop
	@desc stop the geolocation
	@fires geolocationstatuschanged
	@private

	@--------------------------------------------------------------------------------------------------------------------------
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

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myError
	@desc stop the geolocation because the user don't accept the geolocation
	@fires geolocationstatuschanged
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myError ( positionError ) {
		if ( ONE === positionError.code ) { // see positionError object in MDN
			myStatus = GEOLOCATION_STATUS.refusedByUser;
		}
		myStop ( );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myStart
	@desc start the geolocation
	@fires geolocationstatuschanged
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myStart ( ) {
		myStatus = GEOLOCATION_STATUS.active;
		myEventDispatcher.dispatch ( 'geolocationstatuschanged', { status : myStatus } );
		navigator.geolocation.getCurrentPosition ( myShowPosition, myError, theConfig.geoLocation.options );
		myWatchId = navigator.geolocation.watchPosition ( myShowPosition, myError, theConfig.geoLocation.options );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class GeoLocator
	@classdesc This class manage the geolocation
	@see {@link theGeoLocator} for the one and only one instance of this class
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	class GeoLocator {

		/**
		The status of the geolocation
		@type {GEOLOCATION_STATUS}
		@readonly
		*/

		get status ( ) { return myStatus; }

		/**
		Start or stop the geolocatiion, depending of the status
		@return {GEOLOCATION_STATUS} the status after the switch
		@fires geolocationstatuschanged
		@fires geolocationpositionchanged
		@readonly
		*/

		switch ( ) {
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
	}

	return Object.seal ( new GeoLocator );
}

const ourGeoLocator = ourNewGeoLocator ( );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of GeoLocator class
	@type {GeoLocator}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourGeoLocator as theGeoLocator
};

/*
--- End of GeoLocator.js file -------------------------------------------------------------------------------------------------
*/