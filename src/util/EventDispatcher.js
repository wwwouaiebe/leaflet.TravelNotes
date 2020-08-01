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

/**
@------------------------------------------------------------------------------------------------------------------------------

@event providersadded
@desc fired when the ProvidersToolbarUI must be updated with a new provider

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@event removeallobjects
@desc fired when all objects have to be removed from the map

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@event routeupdated
@desc fired when a route must be updated, added or removed on the map

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@event noteupdated
@desc fired when a note must be updated, added or removed on the map

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@event travelnameupdated
@desc fired when a file is loaded and the travel name updated on theTravelUI

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@event layerchange
@desc fired when the background map must be changed

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@event setrouteslist
@desc fired when the route list must be updated on theTravelUI

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@event setprovider
@desc fired when the provider must be updated on theProvidersToolbarUI

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@event settransitmode
@desc fired when the transit mode must be updated on theProvidersToolbarUI

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@event setitinerary
@desc fired when theItineraryPaneUI must be updated

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@event roadbookupdate
@desc fired when the roadbook must be updated

@------------------------------------------------------------------------------------------------------------------------------
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
				'travelnameupdated',
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