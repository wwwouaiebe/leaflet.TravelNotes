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
--- NoteEditor.js file ------------------------------------------------------------------------------------------------
This file contains:
	- the newNoteEditor function
	- the theNoteEditor object
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
		- added newSearchNote method and modified endNoteDialog for update of the travel note pane
		- added attachNoteToRoute and detachNoteFromRoute methods
	- v1.5.0:
		- Issue #52 : when saving the travel to the file, save also the edited route.
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
		- Issue #66 : Work with promises for dialogs
		- Issue #70 : Put the get...HTML functions outside of the editors
		- Issue #68 : Review all existing promises.
Doc reviewed 20191121
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theTravelNotesData } from '../data/TravelNotesData.js';
import { newNoteDialog } from '../dialogs/NoteDialog.js';
import { newNote } from '../data/Note.js';
import { newDataSearchEngine } from '../data/DataSearchEngine.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';
import { newGeometry } from '../util/Geometry.js';

import { THE_CONST } from '../util/Constants.js';

/*
--- newNoteEditor function --------------------------------------------------------------------------------------------

Patterns : Closure and Singleton

-----------------------------------------------------------------------------------------------------------------------
*/

function newNoteEditor ( ) {

	let myDataSearchEngine = newDataSearchEngine ( );
	let myEventDispatcher = newEventDispatcher ( );
	let myGeometry = newGeometry ( );

	/*
	--- myAttachNoteToRoute function ----------------------------------------------------------------------------------

	This function transform a travel note into a route note ( when possible )

	parameters:
	- noteObjId : the objId of the note to transform

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAttachNoteToRoute ( noteObjId ) {
		let noteAndRoute = myDataSearchEngine.getNoteAndRoute ( noteObjId );
		let distance = Number.MAX_VALUE;
		let selectedRoute = null;
		let newNoteLatLng = null;
		let newNoteDistance = null;

		theTravelNotesData.travel.routes.forEach (
			route => {
				let pointAndDistance = myGeometry.getClosestLatLngDistance ( route, noteAndRoute.note.latLng );
				if ( pointAndDistance ) {
					let distanceToRoute = myGeometry.pointsDistance (
						noteAndRoute.note.latLng,
						pointAndDistance.latLng
					);
					if ( distanceToRoute < distance ) {
						distance = distanceToRoute;
						selectedRoute = route;
						newNoteLatLng = pointAndDistance.latLng;
						newNoteDistance = pointAndDistance.distance;
					}
				}
			}
		);

		if ( selectedRoute ) {
			theTravelNotesData.travel.notes.remove ( noteObjId );
			noteAndRoute.note.distance = newNoteDistance;
			noteAndRoute.note.latLng = newNoteLatLng;
			noteAndRoute.note.chainedDistance = selectedRoute.chainedDistance;

			// ... the chainedDistance is adapted...
			selectedRoute.notes.add ( noteAndRoute.note );

			// and the notes sorted
			selectedRoute.notes.sort (
				( first, second ) => first.distance - second.distance
			);

			myEventDispatcher.dispatch (
				'noteupdated',
				{
					removedNoteObjId : noteObjId,
					addedNoteObjId : noteObjId
				}
			);
			myEventDispatcher.dispatch ( 'updateitinerary' );
			myEventDispatcher.dispatch ( 'updatetravelnotes' );
		}
	}

	/*
	--- myDetachNoteFromRoute function --------------------------------------------------------------------------------

	This function transform a route note into a travel note

	parameters:
	- noteObjId : the objId of the note to transform

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myDetachNoteFromRoute ( noteObjId ) {

		// the note and the route are searched
		let noteAndRoute = myDataSearchEngine.getNoteAndRoute ( noteObjId );
		noteAndRoute.route.notes.remove ( noteObjId );
		noteAndRoute.note.distance = THE_CONST.distance.invalid;
		noteAndRoute.note.chainedDistance = THE_CONST.distance.defaultValue;
		theTravelNotesData.travel.notes.add ( noteAndRoute.note );

		myEventDispatcher.dispatch ( 'updateitinerary' );
		myEventDispatcher.dispatch ( 'updatetravelnotes' );
		myEventDispatcher.dispatch ( 'roadbookupdate' );
	}

	/*
	--- myNoteDialog function -----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myNoteDialog ( note, routeObjId, isNewNote ) {
		newNoteDialog ( note, routeObjId, isNewNote )
			.show ( )
			.then (
				( ) => {
					if ( isNewNote ) {
						if ( THE_CONST.invalidObjId === routeObjId ) {
							theTravelNotesData.travel.notes.add ( note );
						}
						else {
							let route = myDataSearchEngine.getRoute ( routeObjId );
							route.notes.add ( note );
							note.chainedDistance = route.chainedDistance;
							route.notes.sort (
								( first, second ) => first.distance - second.distance
							);
						}
					}
					if ( THE_CONST.invalidObjId === routeObjId ) {
						myEventDispatcher.dispatch ( 'settravelnotes' );
					}
					else {
						myEventDispatcher.dispatch ( 'setitinerary' );
					}
					myEventDispatcher.dispatch (
						'noteupdated',
						{
							removedNoteObjId : note.objId,
							addedNoteObjId : note.objId
						}
					);
				}
			)
			.catch ( err => console.log ( err ? err : 'An error occurs in the note dialog' ) );

	}

	/*
	--- myNewNote function --------------------------------------------------------------------------------------------

	This function create a new TravelNotes note object

	parameters:
	- latLng : the coordinates of the new note

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myNewNote ( latLng ) {
		let note = newNote ( );
		note.latLng = latLng;
		note.iconLatLng = latLng;

		return note;
	}

	/*
	--- myNewRouteNote function ---------------------------------------------------------------------------------------

	This function start the creation of a TravelNotes note object linked with a route

	parameters:
	- routeObjId : the objId of the route to witch the note will be linked
	- event : the event that have triggered the method ( a right click on the
	route polyline and then a choice in a context menu)

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myNewRouteNote ( routeObjId, contextMenuEvent ) {

		let route = myDataSearchEngine.getRoute ( routeObjId );

		// the nearest point and distance on the route is searched
		let latLngDistance = myGeometry.getClosestLatLngDistance (
			route,
			[ contextMenuEvent.latlng.lat, contextMenuEvent.latlng.lng ]
		);

		// the note is created
		let note = myNewNote ( latLngDistance.latLng );
		note.distance = latLngDistance.distance;

		myNoteDialog ( note, route.objId, true );
	}

	/*
	--- myNewSearchNote function --------------------------------------------------------------------------------------

	This function start the creation of a TravelNotes note object linked to a search

	parameters:
	- searchResult : the search results with witch the note will be created

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myNewSearchNote ( searchResult ) {
		let note = myNewNote ( [ searchResult.lat, searchResult.lon ] );

		note.address =
			( searchResult.tags [ 'addr:housenumber' ] ? searchResult.tags [ 'addr:housenumber' ] + ' ' : '' ) +
			( searchResult.tags [ 'addr:street' ] ? searchResult.tags [ 'addr:street' ] + ' ' : '' ) +
			( searchResult.tags [ 'addr:city' ] ? searchResult.tags [ 'addr:city' ] + ' ' : '' );

		note.url = searchResult.tags.website || '';
		note.phone = searchResult.tags.phone || '';
		note.tooltipContent = searchResult.tags.name || '';
		note.popupContent = searchResult.tags.name || '';

		myNoteDialog ( note, THE_CONST.invalidObjId, true );
	}

	/*
	--- myNewManeuverNote function ------------------------------------------------------------------------------------

	This function start the creation of a TravelNotes note object linked to a maneuver

	parameters:
	- maneuverObjId : the objId of the maneuver
	- latLng : the coordinates of the maneuver

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myNewManeuverNote ( maneuverObjId, latLng ) {

		// the nearest point and distance on the route is searched
		let latLngDistance = myGeometry.getClosestLatLngDistance (
			theTravelNotesData.travel.editedRoute,
			latLng
		);

		// the maneuver is searched
		let maneuver = theTravelNotesData.travel.editedRoute.itinerary.maneuvers.getAt ( maneuverObjId );

		// the note is created
		let note = myNewNote ( latLng );
		note.distance = latLngDistance.distance;
		note.iconContent =
			'<div class="TravelNotes-ManeuverNote TravelNotes-ManeuverNote-' +
			maneuver.iconName + '"></div>';
		note.popupContent = maneuver.instruction;

		myNoteDialog ( note, theTravelNotesData.travel.editedRoute.objId, true );
	}

	/*
	--- myNewTravelNote function --------------------------------------------------------------------------------------

	This function start the creation f a TravelNotes note object

	parameters:
	- latLng : the coordinates of the new note

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myNewTravelNote ( latLng ) {

		// the note is created
		let note = myNewNote ( latLng );

		myNoteDialog ( note, THE_CONST.invalidObjId, true );
	}

	/*
	--- myEditNote function -------------------------------------------------------------------------------------------

	This function start the modification of a note

	parameters:
	- noteObjId : the objId of the edited note

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myEditNote ( noteObjId ) {
		let noteAndRoute = myDataSearchEngine.getNoteAndRoute ( noteObjId );
		let routeObjId = null === noteAndRoute.route ? THE_CONST.invalidObjId : noteAndRoute.route.objId;

		myNoteDialog ( noteAndRoute.note, routeObjId, false );
	}

	/*
	--- myRemoveNote function -----------------------------------------------------------------------------------------

	This function removes a note

	parameters:
	- noteObjId : the objId of the note to remove

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myRemoveNote ( noteObjId ) {

		// the note and the route are searched
		let noteAndRoute = myDataSearchEngine.getNoteAndRoute ( noteObjId );
		if ( noteAndRoute.route ) {

			// it's a route note
			noteAndRoute.route.notes.remove ( noteObjId );
			myEventDispatcher.dispatch ( 'updateitinerary' );
		}
		else {

			// it's a travel note
			theTravelNotesData.travel.notes.remove ( noteObjId );
			myEventDispatcher.dispatch ( 'updatetravelnotes' );
		}
		myEventDispatcher.dispatch (
			'noteupdated',
			{
				removedNoteObjId : noteObjId,
				addedNoteObjId : THE_CONST.invalidObjId
			}
		);

	}

	/*
	--- myHideNotes function ------------------------------------------------------------------------------------------

	This function hide the notes on the map

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myHideNotes ( ) {
		let notesIterator = theTravelNotesData.travel.notes.iterator;
		while ( ! notesIterator.done ) {
			myEventDispatcher.dispatch ( 'removeobject', { objId : notesIterator.value.objId } );
		}
		let routesIterator = theTravelNotesData.travel.routes.iterator;
		while ( ! routesIterator.done ) {
			notesIterator = routesIterator.value.notes.iterator;
			while ( ! notesIterator.done ) {
				myEventDispatcher.dispatch ( 'removeobject', { objId : notesIterator.value.objId } );
			}
		}
		if ( THE_CONST.invalidObjId !== theTravelNotesData.editedRouteObjId ) {
			notesIterator = theTravelNotesData.travel.editedRoute.notes.iterator;
			while ( ! notesIterator.done ) {
				myEventDispatcher.dispatch ( 'removeobject', { objId : notesIterator.value.objId } );
			}
		}
	}

	/*
	--- myShowNotes function ------------------------------------------------------------------------------------------

	This function show the notes on the map

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myShowNotes ( ) {
		myHideNotes ( );
		let notesIterator = theTravelNotesData.travel.notes.iterator;
		while ( ! notesIterator.done ) {
			myEventDispatcher.dispatch (
				'noteupdated',
				{
					removedNoteObjId : THE_CONST.invalidObjId,
					addedNoteObjId : notesIterator.value.objId
				}
			);
		}
		let routesIterator = theTravelNotesData.travel.routes.iterator;
		while ( ! routesIterator.done ) {
			notesIterator = routesIterator.value.notes.iterator;
			while ( ! notesIterator.done ) {
				myEventDispatcher.dispatch (
					'noteupdated',
					{
						removedNoteObjId : THE_CONST.invalidObjId,
						addedNoteObjId : notesIterator.value.objId
					}
				);
			}
		}
	}

	/*
	--- myZoomToNote function -----------------------------------------------------------------------------------------

	This function zoom to a given note

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
	--- myNoteDropped function ----------------------------------------------------------------------------------------

	This function changes the position of a note after a drag and drop

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myNoteDropped ( draggedNoteObjId, targetNoteObjId, draggedBefore ) {
		theTravelNotesData.travel.notes.moveTo ( draggedNoteObjId, targetNoteObjId, draggedBefore );
		myEventDispatcher.dispatch ( 'updatetravelnotes' );
		myEventDispatcher.dispatch ( 'roadbookupdate' );
	}

	/*
	--- noteEditor object ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			newRouteNote : ( routeObjId, contextMenuEvent ) => myNewRouteNote ( routeObjId, contextMenuEvent ),

			newSearchNote : searchResult => myNewSearchNote ( searchResult ),

			newManeuverNote : ( maneuverObjId, latLng ) => myNewManeuverNote ( maneuverObjId, latLng ),

			newTravelNote : latLng => myNewTravelNote ( latLng ),

			editNote : noteObjId =>	myEditNote ( noteObjId ),

			removeNote : noteObjId => myRemoveNote ( noteObjId ),

			hideNotes : ( ) => myHideNotes ( ),

			showNotes : ( ) => myShowNotes ( ),

			zoomToNote : noteObjId => myZoomToNote ( noteObjId ),

			attachNoteToRoute : noteObjId => myAttachNoteToRoute ( noteObjId ),

			detachNoteFromRoute : noteObjId => myDetachNoteFromRoute ( noteObjId ),

			noteDropped : ( draggedNoteObjId, targetNoteObjId, draggedBefore ) => myNoteDropped (
				draggedNoteObjId,
				targetNoteObjId,
				draggedBefore
			)
		}
	);
}

/*
--- theNoteEditor object -----------------------------------------------------------------------------------------------

The one and only one noteEditor

-----------------------------------------------------------------------------------------------------------------------
*/

const theNoteEditor = newNoteEditor ( );

export { theNoteEditor };

/*
--- End of NoteEditor.js file -----------------------------------------------------------------------------------------
*/