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
	- v1.4.0:
		- created from DataManager
		- added searchData
	- v1.5.0:
		- Issue #52 : when saving the travel to the file, save also the edited route.
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed 20200728
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

/**
@----------------------------------------------------------------------------------------------------------------------

@file TravelNotesData.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@----------------------------------------------------------------------------------------------------------------------
*/

/**
@----------------------------------------------------------------------------------------------------------------------

@module TravelNotesData
@private

@----------------------------------------------------------------------------------------------------------------------
*/

import { newTravel } from '../data/Travel.js';
import { newUtilities } from '../util/Utilities.js';
import { INVALID_OBJ_ID } from '../util/Constants.js';

/**
@----------------------------------------------------------------------------------------------------------------------

@function myNewTravelNotesData
@desc constructor of theTravelNotesData object
@return {Object} an instance of TravelNotesData object
@private

@----------------------------------------------------------------------------------------------------------------------
*/

function myNewTravelNotesData ( ) {

	let myTravelNotesData = {
		map : null,
		providers : new Map ( ),
		mapObjects : new Map ( ),
		travel : newTravel ( ),
		editedRouteObjId : INVALID_OBJ_ID,
		routing : Object.seal ( { provider : '', transitMode : '' } ),
		searchData : [],
		UUID : newUtilities ( ).UUID
	};

	/**
	@typedef {Object} routing
	@desc An object to store the current provider and transit mode
	@property {string} provider The current provider name as defined by the plugins
	@property {string} transitMode The current transitMode. Must be car, bike, etc... as defined by the plugins
	*/

	/**
	@typedef {Object} provider
	@desc An object that stores the provider properties. Created by the plugins
	@property {string} icon The icon displayed in the provider toolbar, base64 encoded
	@property {string} name The	name of the provider
	@property {object} transitModes An object with the possible transit modes
	@property {boolean} providerKeyNeeded A boolean true when a provider key is needed
	@property {string} providerKey 	The provider key
	@property {string} userLanguage The user language
	@property {method} getPromiseRoute A method that start the routing
	*/

	/**
	@--------------------------------------------------------------------------------------------------------------

	@class TravelNotesData
	@classdesc Class used to store the data needed by TravelNotes
	@see {@link theTravelNotesData} for the one and only one instance of this class
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------
	*/

	class TravelNotesData {

		/**
		The Leaflet map object
		@type {object}
		@see {@link https://leafletjs.com/reference-1.6.0.html#map}
		*/

		get map ( ) { return myTravelNotesData.map; }
		set map ( newMap ) { myTravelNotesData.map = newMap; }

		/**
		A JS map with the provider objects. Providers objects are created and added by the plugins
		@type {Map.provider}
		@see {@link module:TravelNotesData~provider}
		*/

		get providers ( ) { return myTravelNotesData.providers; }

		/**
		A JS map with all the Leaflet objects
		@type {Map.Object}
		*/

		get mapObjects ( ) { return myTravelNotesData.mapObjects; }

		/**
		The one and only one object Travel
		@type {Object}
		@see Travel
		*/

		get travel ( ) { return myTravelNotesData.travel; }
		set travel ( Travel ) { myTravelNotesData.travel = Travel; }

		/**
		The objId of the currently edited route or INVALID_OBJ_ID if none
		@type {!number}
		*/

		get editedRouteObjId ( ) { return myTravelNotesData.editedRouteObjId; }
		set editedRouteObjId ( EditedRouteObjId ) { myTravelNotesData.editedRouteObjId = EditedRouteObjId; }

		/**
		A literal object with the provider and transit mode used
		@type {routing}
		@see {@link module:TravelNotesData~routing}
		*/

		get routing ( ) { return myTravelNotesData.routing; }

		/**
		The POI data found in OpenStreetMap
		@type {Object[]}
		*/

		get searchData ( ) { return myTravelNotesData.searchData; }
		set searchData ( SearchData ) { myTravelNotesData.searchData = SearchData; }

		/**
		The UUID currently used
		@type {string}
		*/

		get UUID ( ) { return myTravelNotesData.UUID; }
	}

	return Object.seal ( new TravelNotesData );
}

const theTravelNotesData = myNewTravelNotesData ( );

export {

	/**
	@------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of TravelNoteData class
	@type {TravelNotesData}
	@constant
	@global

	@------------------------------------------------------------------------------------------------------------------
	*/

	theTravelNotesData
};

/*
--- End of TravelNotesData.js file ------------------------------------------------------------------------------------
*/