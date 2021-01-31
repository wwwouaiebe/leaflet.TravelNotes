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
	- v1.6.0:
		- created
Doc reviewed ...
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file GeoLocator.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
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

import { theEventDispatcher } from '../util/EventDispatcher.js';
import { theConfig } from '../data/Config.js';
import { GEOLOCATION_STATUS, ONE } from '../util/Constants.js';

let ourStatus =
	( 'geolocation' in navigator )
		?
		GEOLOCATION_STATUS.inactive
		:
		GEOLOCATION_STATUS.disabled;
let ourWatchId = null;

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourShowPosition
@desc send an event to show the current position on the map
@param {GeolocationPosition} position a JS GeolocationPosition object
@fires geolocationpositionchanged
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourShowPosition ( position ) {
	theEventDispatcher.dispatch ( 'geolocationpositionchanged', { position : position } );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourStop
@desc stop the geolocation
@fires geolocationstatuschanged
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourStop ( ) {
	if ( GEOLOCATION_STATUS.active === ourStatus ) {
		ourStatus = GEOLOCATION_STATUS.inactive;
	}

	// if ( ourWatchId ) FF: the ourWatchId is always 0 so we cannot use ourWatchId to see if the geolocation is running
	theEventDispatcher.dispatch ( 'geolocationstatuschanged', { status : ourStatus } );
	navigator.geolocation.clearWatch ( ourWatchId );
	ourWatchId = null;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourError
@desc stop the geolocation because the user don't accept the geolocation
@fires geolocationstatuschanged
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourError ( positionError ) {
	if ( ONE === positionError.code ) { // see positionError object in MDN
		ourStatus = GEOLOCATION_STATUS.refusedByUser;
	}
	ourStop ( );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourStart
@desc start the geolocation
@fires geolocationstatuschanged
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourStart ( ) {
	ourStatus = GEOLOCATION_STATUS.active;
	theEventDispatcher.dispatch ( 'geolocationstatuschanged', { status : ourStatus } );
	navigator.geolocation.getCurrentPosition ( ourShowPosition, ourError, theConfig.geoLocation.options );
	ourWatchId = navigator.geolocation.watchPosition ( ourShowPosition, ourError, theConfig.geoLocation.options );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class GeoLocator
@classdesc This class manage the geolocation
@see {@link theGeoLocator} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class GeoLocator {

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	The status of the geolocation
	@type {GEOLOCATION_STATUS}
	@readonly
	*/

	get status ( ) { return ourStatus; }

	/**
	Start or stop the geolocatiion, depending of the status
	@return {GEOLOCATION_STATUS} the status after the switch
	@fires geolocationstatuschanged
	@fires geolocationpositionchanged
	@readonly
	*/

	switch ( ) {
		switch ( ourStatus ) {
		case GEOLOCATION_STATUS.inactive :
			ourStart ( );
			break;
		case GEOLOCATION_STATUS.active :
			ourStop ( );
			break;
		default :
			break;
		}

		return ourStatus;
	}
}

const OUR_GEO_LOCATOR = new GeoLocator ( );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of GeoLocator class
	@type {GeoLocator}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	OUR_GEO_LOCATOR as theGeoLocator
};

/*
--- End of GeoLocator.js file -------------------------------------------------------------------------------------------------
*/