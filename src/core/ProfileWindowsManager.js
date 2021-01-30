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
	- v1.7.0:
		- created
	- v1.8.0:
		- Issue #98 : Elevation is not modified in the itinerary pane
Doc reviewed 20200805
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file ProfileWindowsManager.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module ProfileWindowsManager
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theConfig } from '../data/Config.js';
import { newProfileWindow } from '../dialogs/ProfileWindow.js';
import { newProfileFactory } from '../core/ProfileFactory.js';
import { theDataSearchEngine } from '../data/DataSearchEngine.js';
import { ZERO } from '../util/Constants.js';

let ourProfileWindows = new Map ( );
let ourProfileFactory = newProfileFactory ( );

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class provides methods to manage the profile windows
@see {@link theProfileWindowsManager} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class ProfileWindowsManager {

	constructor ( ) {
		Object.seal ( this );
	}

	/**
	This method creates the profile for a Route after a call to a provider
	and manages the window profile
	@param {Route} route The Route for witch a profile is created
	*/

	createProfile ( route ) {
		let profileWindow = ourProfileWindows.get ( route.objId );

		if ( route.itinerary.hasProfile ) {
			if ( theConfig.route.elev.smooth ) {
				ourProfileFactory.smooth ( route );
			}
			route.itinerary.ascent = ZERO;
			route.itinerary.descent = ZERO;
			let previousElev = route.itinerary.itineraryPoints.first.elev;
			route.itinerary.itineraryPoints.forEach (
				itineraryPoint => {
					let deltaElev = itineraryPoint.elev - previousElev;
					if ( ZERO > deltaElev ) {
						route.itinerary.descent -= deltaElev;
					}
					else {
						route.itinerary.ascent += deltaElev;
					}
					previousElev = itineraryPoint.elev;
				}
			);
			if ( profileWindow ) {
				profileWindow.update ( route );
			}
		}
		else if ( profileWindow ) {
			profileWindow.close ( );
		}
	}

	/**
	This method creates the profile window for a Route
	@param {!number} oldRouteObjId The objId of the Route that is in the profile window
	@param {Route} newRoute The  Route for witch the profile window is updated
	*/

	updateProfile ( oldRouteObjId, newRoute ) {
		let profileWindow = ourProfileWindows.get ( oldRouteObjId );
		if ( profileWindow ) {
			ourProfileWindows.delete ( oldRouteObjId );
			if ( newRoute && newRoute.itinerary.hasProfile ) {
				profileWindow.update ( newRoute );
				ourProfileWindows.set ( newRoute.objId, profileWindow );
			}
			else {
				profileWindow.close ( );
			}
		}
	}

	/**
	This method close the profile window of a route
	@param {!number} objId The objId of the Route that is in the profile window to close
	*/

	deleteProfile ( objId ) {
		let profileWindow = ourProfileWindows.get ( objId );
		if ( profileWindow ) {
			profileWindow.close ( );
		}
	}

	/**
	This method close the all the profile windows
	*/

	deleteAllProfiles ( ) {
		ourProfileWindows.forEach ( profileWindow => profileWindow.close ( ) );
	}

	/**
	This method creates the profile window for a Route
	@param {!number} routeObjId The Route objId for witch a profile window is created
	*/

	showProfile ( routeObjId ) {
		let profileWindow = ourProfileWindows.get ( routeObjId );
		if ( ! profileWindow ) {
			profileWindow = newProfileWindow ( );
		}
		let route = theDataSearchEngine.getRoute ( routeObjId );
		profileWindow.update ( route );
		ourProfileWindows.set ( routeObjId, profileWindow );
	}

	/**
	This method is called when a profile window is closed
	@param {!number} objId The Route objId for witch a profile window is created
	@listens profileclosed
	*/

	onProfileClosed ( objId ) {
		ourProfileWindows.delete ( objId );
	}

}

const ourProfileWindowsManager = new ProfileWindowsManager ( );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of ProfileWindowsManager class
	@type {ProfileWindowsManager}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourProfileWindowsManager as theProfileWindowsManager

};

/*
--- End of ProfileWindowsManager.js file --------------------------------------------------------------------------------------
*/