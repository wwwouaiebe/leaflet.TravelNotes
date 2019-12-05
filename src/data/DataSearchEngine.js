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
--- DataSearchEngine.js file ------------------------------------------------------------------------------------------
This file contains:
	- the newDataSearchEngine function
Changes:
	- v1.4.0:
		- created from DataManager
	- v1.5.0:
		- Issue #52 : when saving the travel to the file, save also the edited route.
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed 20191122
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

export { newDataSearchEngine };

import { g_TravelNotesData } from '../data/TravelNotesData.js';

function newDataSearchEngine ( ) {

	/*
	--- m_getRoute function -------------------------------------------------------------------------------------------

	This function returns a route when giving the routeObjId

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_GetRoute ( routeObjId ) {
		let route = null;
		route = g_TravelNotesData.travel.routes.getAt ( routeObjId );
		if ( ! route ) {
			if ( routeObjId === g_TravelNotesData.travel.editedRoute.objId ) {
				route = g_TravelNotesData.travel.editedRoute;
			}
		}

		return route;
	}

	/*
	--- m_GetNoteAndRoute method --------------------------------------------------------------------------------------

	This function returns a note and a route ( when the note is linked to a route ) from the noteObjId

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_GetNoteAndRoute ( noteObjId ) {
		let note = null;
		note = g_TravelNotesData.travel.notes.getAt ( noteObjId );
		if ( note ) {
			return { note : note, route : null };
		}
		let routeIterator = g_TravelNotesData.travel.routes.iterator;
		while ( ! routeIterator.done ) {
			note = routeIterator.value.notes.getAt ( noteObjId );
			if ( note ) {
				return { note : note, route : routeIterator.value };
			}
		}
		note = g_TravelNotesData.travel.editedRoute.notes.getAt ( noteObjId );
		if ( ! note ) {
			return { note : null, route : null };
		}

		return { note : note, route : g_TravelNotesData.travel.editedRoute };
	}

	/*
	--- m_GetWayPoint method ------------------------------------------------------------------------------------------

	This function returns a wayPoint from the wayPointObjId

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_GetWayPoint ( wayPointObjId ) {
		let wayPoint = null;
		let routeIterator = g_TravelNotesData.travel.routes.iterator;
		while ( ! routeIterator.done ) {
			wayPoint = routeIterator.value.wayPoints.getAt ( wayPointObjId );
			if ( wayPoint ) {
				return wayPoint;
			}
		}
		wayPoint = g_TravelNotesData.travel.editedRoute.wayPoints.getAt ( wayPointObjId );
		if ( ! wayPoint ) {
			return null;
		}
		return wayPoint;
	}

	/*
	--- dataSearchEngine object ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			getRoute : routeObjId => { return m_GetRoute ( routeObjId ); },
			getNoteAndRoute : noteObjId => { return m_GetNoteAndRoute ( noteObjId ); },
			getWayPoint : wayPointObjId => { return m_GetWayPoint ( wayPointObjId ); }
		}
	);
}

/*
--- End of DataSearchEngine.js file -----------------------------------------------------------------------------------
*/