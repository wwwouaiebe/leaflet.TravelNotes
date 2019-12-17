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
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { newEventDispatcher } from '../util/EventDispatcher.js';
import { newDataSearchEngine } from '../data/DataSearchEngine.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';

import { THE_CONST } from '../util/Constants.js';

/*
--- newZoomer function ------------------------------------------------------------------------------------------------

This function zoom to a given note

-----------------------------------------------------------------------------------------------------------------------
*/

function newZoomer ( ) {

	let myEventDispatcher = newEventDispatcher ( );
	let myDataSearchEngine = newDataSearchEngine ( );

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
	--- myZoomToNote function -----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myZoomToNote ( noteObjId ) {
		myEventDispatcher.dispatch (
			'zoomto',
			{
				latLng : myDataSearchEngine.getNoteAndRoute ( noteObjId ).note.latLng
			}
		);
	}

	/*
	--- myZoomToRoute function ----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myZoomToRoute ( routeObjId ) {
		myGeometry = [];

		myPushRouteGeometry ( myDataSearchEngine.getRoute ( routeObjId ) );

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

		if ( THE_CONST.invalidObjId !== theTravelNotesData.travel.editedRouteObjId ) {
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
	--- Zoomer object function ----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			zoomToNote : noteObjId => myZoomToNote ( noteObjId ),

			zoomToRoute : routeObjId => myZoomToRoute ( routeObjId ),

			zoomToTravel : ( ) => myZoomToTravel ( )
		}
	);
}

export { newZoomer };

/*
--- End of Zoomer.js file ---------------------------------------------------------------------------------------------
*/