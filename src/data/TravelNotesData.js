/*
Copyright - 2017 - wwwouaiebe - Contact: http//www.ouaie.be/
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
		- added searchData
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

(function() {

	'use strict';

	/*
	--- travelNotesData function --------------------------------------------------------------------------------------

	Patterns : Closure

	-------------------------------------------------------------------------------------------------------------------
	*/

	var travelNotesData = function ( ) {

		var m_TravelNotesData = {
			config : require ( '../data/Config' ),
			map : null,
			providers : new Map ( ),
			mapObjects : new Map ( ),
			travel : require ( '../data/Travel' ) ( ),
			editedRoute : null,
			routeEdition : Object.seal ( { routeChanged : false, routeInitialObjId : -1 } ),
			routing : Object.seal ( { provider : '', transitMode : ''} ),
			searchData : [],
			UUID : require ( '../util/Utilities' ) ( ).UUID
		};
		
		/*
		--- travelNotesData object ------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return Object.seal (
			{

				get config ( ) { return m_TravelNotesData.config; },
				set config ( Config ) { m_TravelNotesData.config.overload ( Config ); },

				get map ( ) { return m_TravelNotesData.map; },
				set map ( Map ) { m_TravelNotesData.map = Map; },

				get providers ( ) { return m_TravelNotesData.providers; },

				get mapObjects ( ) { return m_TravelNotesData.mapObjects; },

				get travel ( ) { return m_TravelNotesData.travel; },
				set travel ( Travel ) { m_TravelNotesData.travel = Travel; },

				get editedRoute ( ) { return m_TravelNotesData.editedRoute; },
				set editedRoute ( editedRoute ) { m_TravelNotesData.editedRoute = editedRoute; },

				get routeEdition ( ) { return m_TravelNotesData.routeEdition; },
				
				get routing ( ) { return m_TravelNotesData.routing; },
				
				get searchData ( ) { return m_TravelNotesData.searchData; },
				set searchData ( SearchData ) { m_TravelNotesData.searchData = SearchData; },

				get UUID ( ) { return m_TravelNotesData.UUID; }
			}
		);
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = travelNotesData;
	}

} ) ( );

/*
--- End of TravelNotesData.js file ------------------------------------------------------------------------------------
*/