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
--- TravelNotesData.js file -------------------------------------------------------------------------------------------
This file contains:
	- the newTravelNotesData function
	- the g_TravelNotesData object
Changes:
	- v1.4.0:
		- created from DataManager
		- added searchData
	- v1.5.0:
		- Issue #52 : when saving the travel to the file, save also the edited route.
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed 20191121
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

export { g_TravelNotesData };

import { newTravel } from '../data/Travel.js';
import { newUtilities } from '../util/Utilities.js';

/*
--- newTravelNotesData funtion ----------------------------------------------------------------------------------------

This function returns a travelNotesData object

Patterns : Closure and singleton
-----------------------------------------------------------------------------------------------------------------------
*/

function newTravelNotesData ( ) {

	let m_TravelNotesData = {
		map : null,
		providers : new Map ( ),
		mapObjects : new Map ( ),
		travel : newTravel ( ),
		editedRouteObjId : -1,
		routing : Object.seal ( { provider : '', transitMode : '' } ),
		searchData : [],
		UUID : newUtilities ( ).UUID
	};

	/*
	--- travelNotesData object ----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{

			get map ( ) { return m_TravelNotesData.map; },
			set map ( Map ) { m_TravelNotesData.map = Map; },

			get providers ( ) { return m_TravelNotesData.providers; },

			get mapObjects ( ) { return m_TravelNotesData.mapObjects; },

			get travel ( ) { return m_TravelNotesData.travel; },
			set travel ( Travel ) { m_TravelNotesData.travel = Travel; },

			get editedRouteObjId ( ) { return m_TravelNotesData.editedRouteObjId; },
			set editedRouteObjId ( EditedRouteObjId ) { m_TravelNotesData.editedRouteObjId = EditedRouteObjId; },

			get routeEdition ( ) { return m_TravelNotesData.routeEdition; },

			get routing ( ) { return m_TravelNotesData.routing; },

			get searchData ( ) { return m_TravelNotesData.searchData; },
			set searchData ( SearchData ) { m_TravelNotesData.searchData = SearchData; },

			get translations ( ) { return m_TravelNotesData.translations; },

			get UUID ( ) { return m_TravelNotesData.UUID; }
		}
	);
}

/*
--- g_TravelNotesData object ------------------------------------------------------------------------------------------

The one and only one translator

-----------------------------------------------------------------------------------------------------------------------
*/

const g_TravelNotesData = newTravelNotesData ( );

/*
--- End of TravelNotesData.js file ------------------------------------------------------------------------------------
*/