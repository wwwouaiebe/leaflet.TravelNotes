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
	- the theTravelNotesData object
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

import { newTravel } from '../data/Travel.js';
import { newUtilities } from '../util/Utilities.js';

import { THE_CONST } from '../util/Constants.js';

/*
--- newTravelNotesData funtion ----------------------------------------------------------------------------------------

This function returns a travelNotesData object

Patterns : Closure and singleton
-----------------------------------------------------------------------------------------------------------------------
*/

function newTravelNotesData ( ) {

	let myTravelNotesData = {
		map : null,
		providers : new Map ( ),
		mapObjects : new Map ( ),
		travel : newTravel ( ),
		editedRouteObjId : THE_CONST.invalidObjId,
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

			get map ( ) { return myTravelNotesData.map; },
			set map ( newMap ) { myTravelNotesData.map = newMap; },

			get providers ( ) { return myTravelNotesData.providers; },

			get mapObjects ( ) { return myTravelNotesData.mapObjects; },

			get travel ( ) { return myTravelNotesData.travel; },
			set travel ( Travel ) { myTravelNotesData.travel = Travel; },

			get editedRouteObjId ( ) { return myTravelNotesData.editedRouteObjId; },
			set editedRouteObjId ( EditedRouteObjId ) { myTravelNotesData.editedRouteObjId = EditedRouteObjId; },

			get routeEdition ( ) { return myTravelNotesData.routeEdition; },

			get routing ( ) { return myTravelNotesData.routing; },

			get searchData ( ) { return myTravelNotesData.searchData; },
			set searchData ( SearchData ) { myTravelNotesData.searchData = SearchData; },

			get translations ( ) { return myTravelNotesData.translations; },

			get UUID ( ) { return myTravelNotesData.UUID; }
		}
	);
}

/*
--- theTravelNotesData object ------------------------------------------------------------------------------------------

The one and only one translator

-----------------------------------------------------------------------------------------------------------------------
*/

const theTravelNotesData = newTravelNotesData ( );

export { theTravelNotesData };

/*
--- End of TravelNotesData.js file ------------------------------------------------------------------------------------
*/