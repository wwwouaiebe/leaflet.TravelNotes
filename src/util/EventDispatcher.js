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
	- v1.12.0:
		- Issue #120 : Review the UserInterface
Doc reviewed 20200824
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file EventDispatcher.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module EventDispatcher
@private

@------------------------------------------------------------------------------------------------------------------------------
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

@event showitinerary
@desc fired when ItineraryPaneUI must be visible and updated

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@event updateitinerary
@desc fired when ItineraryPaneUI must be updated

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@event showtravelnotes
@desc fired when TravelNotesPaneUI must be visible and updated

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@event updatetravelnotes
@desc fired when TravelNotesPaneUI must be updated

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@event showsearch
@desc fired when OsmSearchPaneUI must be visible and updated

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@event updatesearch
@desc fired when OsmSearchPaneUI must be updated

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@event roadbookupdate
@desc fired when the roadbook must be updated

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@event geolocationstatuschanged
@desc fired when theTravelNotesToolbarUI must be updated, changing the geolocation button
and when the geolocation marker must be removed from the map

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@event geolocationpositionchanged
@desc fired when the map must be updated, changing the position on the map

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@event additinerarypointmarker
@desc fired when an ItineraryPoint marker must be added to the map

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@event addrectangle
@desc fired when a rectangle must be added to the map

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@event addsearchpointmarker
@desc fired when a SearchPoint marker must be added to the map

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@event addwaypoint
@desc fired when a WayPoint must be added to the map

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@event removeobject
@desc fired when an object must be removed from the map

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@event routepropertiesupdated
@desc fired when the properties of a route must be changed on the map

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@event zoomto
@desc fired when a zoom to a point or to an array of points must be performed on the map

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@event profileclosed
@desc fired when a profile window is closed

@------------------------------------------------------------------------------------------------------------------------------
*/

import { NOT_FOUND } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourGetTarget
@desc This method get the target of a event from the event name
@param {string} eventName The name of the event
@return {?document|HTMLElement} The target for the event name
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourGetTarget ( eventName ) {
	if ( NOT_FOUND <
		[
			'showitinerary',
			'updateitinerary',
			'showtravelnotes',
			'updatetravelnotes',
			'showsearch',
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

/**
@--------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class contains methods for dispatching events
@see {@link theEventDispatcher} for the one and only one instance of this class
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class EventDispatcher {

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	Creates and dispatch an event to the correct target
	@param {string} eventName the name of the event
	@param {Object} enventData An object to set as data property of the event
	*/

	dispatch ( eventName, eventData ) {
		let target = ourGetTarget ( eventName );
		if ( target ) {
			let dispatchedEvent = new Event ( eventName );
			if ( eventData ) {
				dispatchedEvent.data = eventData;
			}
			target.dispatchEvent ( dispatchedEvent );
		}
	}
}

const ourEventDispatcher = new EventDispatcher ( );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of EventDispatcher class
	@type {EventDispatcher}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourEventDispatcher as theEventDispatcher
};

/*
--- End of EventDispatcher.js file --------------------------------------------------------------------------------------------
*/