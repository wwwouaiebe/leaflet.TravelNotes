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
--- DataSearchEngine.js file -----------------------------------------------------------------------------------------------
This file contains:
	- the DataSearchEngine object
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
	
	var DataSearchEngine = function ( ) {

		var _TravelNotesData = require ( '../L.TravelNotes' );
		
		/*
		--- getRoute function -------------------------------------------------------------------------------------

		This function returns a route when giving the routeObjId
		
		-----------------------------------------------------------------------------------------------------------
		*/

		var _GetRoute = function ( routeObjId ) {
			var route = null;
			route = _TravelNotesData.travel.routes.getAt ( routeObjId );
			if ( ! route ) {
				if ( routeObjId === _TravelNotesData.editedRoute.objId ) {
					route = _TravelNotesData.editedRoute;
				}
			}
			if ( ! route ) {
				console.log ( 'Invalid noteObjId ' + routeObjId + ' for function DataSearchEngine.getRoute ( )' );
			}

			return route;
		};

		/*
		--- _GetNoteAndRoute method --------------------------------------------------------------------------------

		This function returns a note and a route ( when the note is linked to a route ) from the noteObjId
		
		-----------------------------------------------------------------------------------------------------------
		*/

		var _GetNoteAndRoute = function ( noteObjId ) {
			var note = null;
			note = _TravelNotesData.travel.notes.getAt ( noteObjId );
			if ( note ) {
				return { note : note, route : null };
			}
			var routeIterator = _TravelNotesData.travel.routes.iterator;
			while ( ! routeIterator.done ) {
				note = routeIterator.value.notes.getAt ( noteObjId );
				if ( note ) {
					return { note : note, route : routeIterator.value };
				}
			}
			note = _TravelNotesData.editedRoute.notes.getAt ( noteObjId );
			if ( ! note ) {
				console.log ( 'Invalid noteObjId ' + noteObjId + ' for function DataSearchEngine.getNote ( )' );
				return { note : null, route : null };
			}

			return { note : note, route : _TravelNotesData.editedRoute };
		};
		
		/*
		--- _GetWayPoint method -----------------------------------------------------------------------------------

		This function returns a wayPoint from the wayPointObjId
		
		-----------------------------------------------------------------------------------------------------------
		*/

		var _GetWayPoint = function ( wayPointObjId ) {
			var wayPoint = null;
			var routeIterator = _TravelNotesData.travel.routes.iterator;
			while ( ! routeIterator.done ) {
				wayPoint = routeIterator.value.wayPoints.getAt ( wayPointObjId );
				if ( wayPoint ) {
					return wayPoint;
				}
			}
			wayPoint = _TravelNotesData.editedRoute.wayPoints.getAt ( wayPointObjId );
			if ( ! wayPoint ) {
				console.log ( 'Invalid wayPointObjId ' + wayPointObjId + ' for function DataSearchEngine.getWayPoint ( )' );
				return null;
			}
			return wayPoint;
		};

		/* 
		--- DataSearchEngine object -----------------------------------------------------------------------------------
		
		---------------------------------------------------------------------------------------------------------------
		*/
		
		return {
			getRoute : function ( routeObjId ) { return _GetRoute ( routeObjId ); },
			getNoteAndRoute : function ( noteObjId ) { return _GetNoteAndRoute ( noteObjId ); },
			getWayPoint : function ( wayPointObjId ) { return _GetWayPoint ( wayPointObjId ); }
		};
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = DataSearchEngine;
	}

} ) ( );

/*
--- End of DataSearchEngine.js file ----------------------------------------------------------------------------------------
*/