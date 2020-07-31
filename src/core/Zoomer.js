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
--- Zoomer.js file ----------------------------------------------------------------------------------------------------
This file contains:
	- the newZoomer function
Changes:
	- v1.6.0:
		- created
	- v1.12.0:
		- Issue #120 : Review the UserInterface
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { newEventDispatcher } from '../util/EventDispatcher.js';
import { theDataSearchEngine } from '../data/DataSearchEngine.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';

import { INVALID_OBJ_ID } from '../util/Constants.js';

/*
--- newZoomer function ------------------------------------------------------------------------------------------------

This function zoom to a given note

-----------------------------------------------------------------------------------------------------------------------
*/

function newZoomer ( ) {

	let myEventDispatcher = newEventDispatcher ( );

	let myGeometry = [];

	/*
	--- myPushNoteGeometry function -----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myPushNoteGeometry ( note ) {
		myGeometry.push ( note.latLng );
		myGeometry.push ( note.iconLatLng );
	}

	/*
	--- myPushRouteGeometry function ----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myPushRouteGeometry ( route ) {
		route.itinerary.itineraryPoints.forEach ( itineraryPoint => myGeometry.push ( itineraryPoint.latLng ) );
		route.notes.forEach (
			note => myPushNoteGeometry ( note )
		);
	}

	/*
	--- myZoomToManeuver function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myZoomToManeuver ( maneuverObjId ) {
		let itineraryPointObjId =
			theTravelNotesData.travel.editedRoute.itinerary.maneuvers.getAt ( maneuverObjId ).itineraryPointObjId;
		let latLng =
			theTravelNotesData.travel.editedRoute.itinerary.itineraryPoints.getAt ( itineraryPointObjId ).latLng;
		myEventDispatcher.dispatch ( 'zoomto', { latLng : latLng } );
	}

	/*
	--- myZoomToNote function -----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myZoomToNote ( noteObjId ) {
		myEventDispatcher.dispatch (
			'zoomto',
			{
				latLng : theDataSearchEngine.getNoteAndRoute ( noteObjId ).note.latLng
			}
		);
	}

	/*
	--- myZoomToRoute function ----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myZoomToRoute ( routeObjId ) {
		myGeometry = [];

		myPushRouteGeometry ( theDataSearchEngine.getRoute ( routeObjId ) );

		myEventDispatcher.dispatch (
			'zoomto',
			{
				geometry : [ myGeometry ]
			}
		);
	}

	/*
	--- myZoomToTravel function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myZoomToTravel ( ) {

		myGeometry = [];

		theTravelNotesData.travel.routes.forEach (
			route => myPushRouteGeometry ( route )
		);

		if ( INVALID_OBJ_ID !== theTravelNotesData.travel.editedRouteObjId ) {
			myPushRouteGeometry ( theTravelNotesData.travel.editedRoute );
		}

		theTravelNotesData.travel.notes.forEach (
			note => myPushNoteGeometry ( note )
		);

		myEventDispatcher.dispatch (
			'zoomto',
			{
				geometry : [ myGeometry ]
			}
		);
	}

	/*
	--- myZoomToTravel function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myZoomToPoi ( poi ) {
		myEventDispatcher.dispatch ( 'zoomto', poi );

	}

	/*
	--- Zoomer object function ----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			zoomToManeuver : maneuverObjId => myZoomToManeuver ( maneuverObjId ),

			zoomToNote : noteObjId => myZoomToNote ( noteObjId ),

			zoomToRoute : routeObjId => myZoomToRoute ( routeObjId ),

			zoomToTravel : ( ) => myZoomToTravel ( ),

			zoomToPoi : poi => myZoomToPoi ( poi )
		}
	);
}

export { newZoomer };

/*
--- End of Zoomer.js file ---------------------------------------------------------------------------------------------
*/