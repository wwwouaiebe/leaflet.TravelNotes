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
	- v1.4.0:
		- created from DataManager
		- added searchData
	- v1.5.0:
		- Issue ♯52 : when saving the travel to the file, save also the edited route.
	- v1.6.0:
		- Issue ♯65 : Time to go to ES6 modules?
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210714
Tests ...

-------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file TravelNotesData.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@typedef {Object} Routing
@desc An object to store the current provider and transit mode
@property {string} provider The current provider name as defined by the plugins
@property {string} transitMode The current transitMode. Must be car, bike, etc... as defined by the plugins
@public

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@typedef {Object} Provider
@interface
@desc An object that stores the provider properties. Created by the plugins
@property {string} icon The icon displayed in the provider toolbar, base64 encoded
@property {string} name The name of the provider
@property {string} title The title used for the icon
@property {object} transitModes An object with the possible transit modes
@property {boolean} providerKeyNeeded A boolean true when a provider key is needed
@property {string} providerKey 	The provider key
@property {string} userLanguage The user language
@property {method} getPromiseRoute A method that start the routing
@public

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module TravelNotesData
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import Travel from '../data/Travel.js';
import { theUtilities } from '../util/Utilities.js';
import { INVALID_OBJ_ID } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class TravelNotesData
@classdesc Class used to store the data needed by TravelNotes
@see {@link theTravelNotesData} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class TravelNotesData {

	#providers = new Map ( );
	#mapObjects = new Map ( );
	#routing = Object.seal ( { provider : '', transitMode : '' } );
	#UUID = theUtilities.UUID;

	constructor ( ) {

		/**
		The Leaflet map object
		@type {object}
		@see {@link https://leafletjs.com/reference-1.6.0.html#map}
		*/

		this.map = null;

		/**
		The one and only one object Travel
		@type {Object}
		@see Travel
		*/

		this.travel = new Travel ( );

		/**
		The objId of the currently edited route or INVALID_OBJ_ID if none
		@type {!number}
		*/

		this.editedRouteObjId = INVALID_OBJ_ID;

		/**
		The POI data found in OpenStreetMap
		@type {Object[]}
		*/

		this.searchData = [];

		Object.seal ( this );
	}

	/**
	A JS map with the provider objects. Providers objects are created and added by the plugins
	@type {Map.provider}
	@see {@link module:TravelNotesData~provider}
	*/

	get providers ( ) { return this.#providers; }

	/**
	A JS map with all the Leaflet objects
	@type {Map.Object}
	*/

	get mapObjects ( ) { return this.#mapObjects; }

	/**
	An Object with the provider and transit mode used
	@type {Routing}
	@see {@link module:TravelNotesData~routing}
	*/

	get routing ( ) { return this.#routing; }

	/**
	The UUID currently used
	@type {string}
	*/

	get UUID ( ) { return this.#UUID; }
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@desc The one and only one instance of TravelNoteData class
@type {TravelNotesData}
@constant
@global

@------------------------------------------------------------------------------------------------------------------------------
*/

const theTravelNotesData = new TravelNotesData ( );

export default theTravelNotesData;

/*
--- End of TravelNotesData.js file --------------------------------------------------------------------------------------------
*/