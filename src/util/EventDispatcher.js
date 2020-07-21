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
--- EventDispatcher.js file -------------------------------------------------------------------------------------------
This file contains:
	- the newEventDispatcher function
Changes:
	- v1.6.0:
		- created
	- v1.12.0:
		- Issue #120 : Review the UserInterface
Doc reviewed 20191125
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { NOT_FOUND } from '../util/Constants.js';

/*
--- newEventDispatcher function ---------------------------------------------------------------------------------------

This function returns the eventDispatcher object

-----------------------------------------------------------------------------------------------------------------------
*/

function newEventDispatcher ( ) {

	/*
	--- myGetTarget function ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetTarget ( eventName ) {
		if ( NOT_FOUND <
			[
				'setitinerary',
				'updateitinerary',
				'settravelnotes',
				'updatetravelnotes',
				'setsearch',
				'updatesearch',
				'setrouteslist',
				'setprovider',
				'providersadded',
				'travelnotesfileloaded',
				'settransitmode'
			].indexOf ( eventName )
		) {
			return document.getElementById ( 'TravelNotes-UI-MainDiv' );
		}
		else if ( NOT_FOUND <
			[
				'removeobject',
				'removeallobjects',
				'zoomto',
				'additinerarypointmarker',
				'addsearchpointmarker',
				'addrectangle',
				'addwaypoint',
				'layerchange',
				'geolocationstatuschanged',
				'geolocationpositionchanged',
				'routeupdated',
				'routepropertiesupdated',
				'noteupdated',
				'roadbookupdate',
				'profileclosed'
			].indexOf ( eventName )
		) {
			return document;
		}
		return null;
	}

	/*
	--- myDispatch function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myDispatch ( eventName, eventData ) {
		let target = myGetTarget ( eventName );
		if ( target ) {
			let dispatchedEvent = new Event ( eventName );
			if ( eventData ) {
				dispatchedEvent.data = eventData;
			}
			target.dispatchEvent ( dispatchedEvent );
		}
	}

	/*
	--- eventDispatcher object ----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			dispatch : ( eventName, eventData ) => myDispatch ( eventName, eventData )
		}
	);

}

export { newEventDispatcher };

/*
--- End of EventDispatcher.js file ------------------------------------------------------------------------------------
*/