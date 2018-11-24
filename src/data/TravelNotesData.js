/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/
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
--- TravelNotesData.js file -----------------------------------------------------------------------------------------------
This file contains:
	- the TravelNotesData object
	- the module.exports implementation
Changes:
	- v1.4.0:
		- created from DataManager
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

(function() {

	'use strict';

	var TravelNotesData = function ( ) {

		var _TravelNotesData = {
			config : require ( '../data/Config' ),
			map : null,
			providers : new Map ( ),
			mapObjects : new Map ( ),
			travel : require ( '../data/Travel' ) ( ),
			editedRoute : null,
			routeEdition : Object.seal ( { routeChanged : false, routeInitialObjId : -1 } ),
			routing : Object.seal ( { provider : '', transitMode : ''} ),
			UUID : require ( '../util/Utilities' ) ( ).UUID
		};
		
		return {

		/*
			--- getters and setters  ----------------------------------------------------------------------------------
			
			-----------------------------------------------------------------------------------------------------------
			*/

			get config ( ) { return _TravelNotesData.config; },
			set config ( Config ) { _TravelNotesData.config.overload ( Config ); },

			get map ( ) { return _TravelNotesData.map; },
			set map ( Map ) { _TravelNotesData.map = Map; },

			get providers ( ) { return _TravelNotesData.providers; },

			get mapObjects ( ) { return _TravelNotesData.mapObjects; },

			get travel ( ) { return _TravelNotesData.travel; },
			set travel ( Travel ) { _TravelNotesData.travel = Travel; },

			get editedRoute ( ) { return _TravelNotesData.editedRoute; },
			set editedRoute ( editedRoute ) { _TravelNotesData.editedRoute = editedRoute; },

			get routeEdition ( ) { return _TravelNotesData.routeEdition; },
			
			get routing ( ) { return _TravelNotesData.routing; },

			get UUID ( ) { return _TravelNotesData.UUID; },
		};
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = TravelNotesData;
	}

} ) ( );

/*
--- End of TravelNotesData.js file ------------------------------------------------------------------------------------
*/