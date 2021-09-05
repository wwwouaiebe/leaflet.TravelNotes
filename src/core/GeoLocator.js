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
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests 20210903
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

@module core
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theEventDispatcher from '../coreLib/EventDispatcher.js';
import theConfig from '../data/Config.js';
import { GEOLOCATION_STATUS, ONE } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class GeoLocator
@classdesc This class manage the geolocation
@see {@link theGeoLocator} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class GeoLocator {

	#status = ( 'geolocation' in navigator ) ? GEOLOCATION_STATUS.inactive : GEOLOCATION_STATUS.disabled;

	#watchId = null;

	/**
	Send an event to show the current position on the map
	@param {GeolocationPosition} position a JS GeolocationPosition object
	@fires geolocationpositionchanged
	@private
	*/

	#showPosition ( position ) {
		theEventDispatcher.dispatch ( 'geolocationpositionchanged', { position : position } );
	}

	/**
	Stop the geolocation
	@fires geolocationstatuschanged
	@private
	*/

	#stop ( ) {
		if ( GEOLOCATION_STATUS.active === this.#status ) {
			this.#status = GEOLOCATION_STATUS.inactive;
		}

		/*
			if ( this.#watchId )
			FF: the this.#watchId is always 0 so we cannot use this.#watchId to see if the geolocation is running
		*/

		theEventDispatcher.dispatch ( 'geolocationstatuschanged', { status : this.#status } );
		navigator.geolocation.clearWatch ( this.#watchId );
		this.#watchId = null;
	}

	/**
	Stop the geolocation because the user don't accept the geolocation
	@fires geolocationstatuschanged
	@private
	*/

	#error ( positionError ) {
		if ( ONE === positionError.code ) { // see positionError object in MDN
			this.#status = GEOLOCATION_STATUS.refusedByUser;
		}
		this.#stop ( );
	}

	/**
	Start the geolocation
	@fires geolocationstatuschanged
	@private
	*/

	#start ( ) {
		this.#status = GEOLOCATION_STATUS.active;
		theEventDispatcher.dispatch ( 'geolocationstatuschanged', { status : this.#status } );
		navigator.geolocation.getCurrentPosition (
			position => this.#showPosition ( position ),
			positionError => this.#error ( positionError ),
			theConfig.geoLocation.options
		);
		this.#watchId = navigator.geolocation.watchPosition (
			this.#showPosition,
			this.#error,
			theConfig.geoLocation.options
		);
	}

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	The status of the geolocation
	@type {GEOLOCATION_STATUS}
	@readonly
	*/

	get status ( ) { return this.#status; }

	/**
	Start or stop the geolocatiion, depending of the status
	@return {GEOLOCATION_STATUS} the status after the switch
	@fires geolocationstatuschanged
	@fires geolocationpositionchanged
	@readonly
	*/

	switch ( ) {
		switch ( this.#status ) {
		case GEOLOCATION_STATUS.inactive :
			this.#start ( );
			break;
		case GEOLOCATION_STATUS.active :
			this.#stop ( );
			break;
		default :
			break;
		}

		return this.#status;
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@desc The one and only one instance of GeoLocator class
@type {GeoLocator}
@constant
@global

@------------------------------------------------------------------------------------------------------------------------------
*/

const theGeoLocator = new GeoLocator ( );

export default theGeoLocator;

/*
--- End of GeoLocator.js file -------------------------------------------------------------------------------------------------
*/