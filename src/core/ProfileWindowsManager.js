/*
Copyright - 2020 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- ProfileWindowsManager.js file -------------------------------------------------------------------------------------
This file contains:
	- the newProfileWindowsManager function
	- theProfileWindowsManager object
Changes:
	- v1.7.0:
		- created
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theConfig } from '../data/Config.js';
import { newProfileWindow } from '../dialogs/ProfileWindow.js';
import { newProfileFactory } from '../core/ProfileFactory.js';
import { newDataSearchEngine } from '../data/DataSearchEngine.js';

/*
--- newProfileWindowsManager function ---------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newProfileWindowsManager ( ) {

	let myProfileWindows = new Map ( );

	let myProfileFactory = newProfileFactory ( );

	/*
	--- myCreateProfile function --------------------------------------------------------------------------------------

	This function ...

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateProfile ( route ) {
		let profileWindow = myProfileWindows.get ( route.objId );

		if ( route.itinerary.hasProfile ) {
			if ( theConfig.route.elev.smooth ) {
				myProfileFactory.smooth ( route );
			}
			if ( profileWindow ) {
				profileWindow.update ( route );
			}
		}
		else if ( profileWindow ) {
			profileWindow.close ( );
		}
	}

	/*
	--- myUpdateProfile function --------------------------------------------------------------------------------------

	This function ...

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myUpdateProfile ( oldRouteObjId, newRoute ) {

		let profileWindow = myProfileWindows.get ( oldRouteObjId );
		if ( profileWindow ) {
			myProfileWindows.delete ( oldRouteObjId );
			if ( newRoute && newRoute.itinerary.hasProfile ) {
				profileWindow.update ( newRoute );
				myProfileWindows.set ( newRoute.objId, profileWindow );
			}
			else {
				profileWindow.close ( );
			}
		}
	}

	/*
	--- myShowProfile function ----------------------------------------------------------------------------------------

	This function ...

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myShowProfile ( routeObjId ) {
		let profileWindow = myProfileWindows.get ( routeObjId );
		if ( ! profileWindow ) {
			profileWindow = newProfileWindow ( );
		}
		let route = newDataSearchEngine ( ).getRoute ( routeObjId );
		profileWindow.update ( route );
		myProfileWindows.set ( routeObjId, profileWindow );
	}

	/*
	--- myDeleteProfile function ----------------------------------------------------------------------------------------

	This function ...

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myDeleteProfile ( objId ) {
		let profileWindow = myProfileWindows.get ( objId );
		if ( profileWindow ) {
			profileWindow.close ( );
		}
	}

	/*
	--- myOnProfileClosed function ------------------------------------------------------------------------------------

	This function ...

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnProfileClosed ( objId ) {
		myProfileWindows.delete ( objId );
	}

	/*
	--- ProfileWindowsManager object  ---------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			createProfile : route => myCreateProfile ( route ),

			updateProfile : ( oldRouteObjId, newRoute ) => myUpdateProfile ( oldRouteObjId, newRoute ),

			deleteProfile : objId => myDeleteProfile ( objId ),

			showProfile : routeObjId => myShowProfile ( routeObjId ),

			onProfileClosed : objId => myOnProfileClosed ( objId )
		}
	);
}

const theProfileWindowsManager = newProfileWindowsManager ( );

export { theProfileWindowsManager };

/*
--- End of ProfileWindowsManager.js file ------------------------------------------------------------------------------
*/