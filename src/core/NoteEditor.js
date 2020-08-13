/*
Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/

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
	- v1.11.0:
		- Issue #110 : Add a command to create a SVG icon from osm for each maneuver
	- v1.12.0:
		- Issue #120 : Review the UserInterface
Doc reviewed 20200803
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file NoteEditor.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module NoteEditor
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { newNoteDialog } from '../dialogs/NoteDialog.js';
import { newNote } from '../data/Note.js';
import { theDataSearchEngine } from '../data/DataSearchEngine.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';
import { newGeometry } from '../util/Geometry.js';
import { newSvgIconFromOsmFactory } from '../core/SvgIconFromOsmFactory.js';
import { theConfig } from '../data/Config.js';
import { newWaitUI } from '../UI/WaitUI.js';
import { newTwoButtonsDialog } from '../dialogs/TwoButtonsDialog.js';
import { theErrorsUI } from '../UI/ErrorsUI.js';

import { ZERO, ONE, DISTANCE, INVALID_OBJ_ID, ICON_DIMENSIONS } from '../util/Constants.js';

let ourEventDispatcher = newEventDispatcher ( );
let ourGeometry = newGeometry ( );
let ourWaitUI = null;
let ourManeuverCounter = ZERO;
let ourManeuverLength = ZERO;

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewNoteFromOsmData
@desc This function creates a new route note with data from osm
@param {OsmNoteData} osmNoteData The osm data needed for the note
@param {Route} route The route to witch the note will be attached
@fires noteupdated
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewNoteFromOsmData ( osmNoteData, route ) {
	let note = newNote ( );
	note.iconContent = osmNoteData.svg.outerHTML;
	note.popupContent = '';
	note.iconWidth = ICON_DIMENSIONS.width;
	note.iconHeight = ICON_DIMENSIONS.height;
	note.tooltipContent = osmNoteData.tooltip;
	note.address = osmNoteData.streets;
	if ( '' !== osmNoteData.city ) {
		note.address += ' ' + theConfig.note.cityPrefix + osmNoteData.city + theConfig.note.cityPostfix;
	}
	if ( osmNoteData.place && osmNoteData.place !== osmNoteData.city ) {
		note.address += ' (' + osmNoteData.place + ')';
	}
	note.latLng = osmNoteData.latLng;
	note.iconLatLng = osmNoteData.latLng;
	note.distance = ourGeometry.getClosestLatLngDistance ( route, note.latLng ).distance;
	note.chainedDistance = route.chainedDistance;
	route.notes.add ( note );
	ourEventDispatcher.dispatch (
		'noteupdated',
		{
			removedNoteObjId : INVALID_OBJ_ID,
			addedNoteObjId : note.objId
		}
	);
	ourEventDispatcher.dispatch ( 'roadbookupdate' );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourAddAllManeuverNote
@desc This method add a note with data from osm for each maneuver of a route. This function is recursive!
@param {CollectionIterator} maneuverIterator an iterator on the maneuvers
@param {Route} route The route to witch the notes will be attached
@fires updateitinerary
@fires roadbookupdate
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourAddAllManeuverNote ( maneuverIterator, route ) {

	function endAdd ( ) {
		if ( maneuverIterator.done ) {
			route.notes.sort (
				( first, second ) => first.distance - second.distance
			);
			ourEventDispatcher.dispatch ( 'updateitinerary' );
			ourEventDispatcher.dispatch ( 'roadbookupdate' );
			ourWaitUI.close ( );
			ourWaitUI = null;
		}
		else {
			ourAddAllManeuverNote ( maneuverIterator, route );
		}
	}

	ourWaitUI.showInfo (
		theTranslator.getText (
			'NoteEditor - Creating note',
			{ noteNumber : ourManeuverCounter, notesLength : ourManeuverLength }
		)
	);
	if (
		( 'kDepartDefault' === maneuverIterator.value.iconName && ! maneuverIterator.first )
		||
		( 'kArriveDefault' === maneuverIterator.value.iconName && ! maneuverIterator.last )
	) {
		endAdd ( );
	}
	else {
		ourManeuverCounter ++;
		let latLng = route.itinerary.itineraryPoints.getAt ( maneuverIterator.value.itineraryPointObjId ).latLng;
		newSvgIconFromOsmFactory ( ).getPromiseIconAndAdress ( latLng, route.objId )
			.then (
				osmNoteData => {
					ourNewNoteFromOsmData ( osmNoteData, route );
					endAdd ( );
				}
			)
			.catch (
				err => {
					console.log ( err ? err : 'an error occurs when creating the SVG icon.' );
					endAdd ( );
				}
			);
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNoteDialog
@desc This method show the Note dialog and then add or update the note
@param {Note} note the Note to be added or updated
@param {!number} routeObjId The route objId to witch the note will be attached (= INVALID_OBJ_ID for a travel note)
@param {boolean} isNewNote when true the note will be added, otherwise updated
@fires settravelnotes
@fires setitinerary
@fires noteupdated
@fires roadbookupdate
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNoteDialog ( note, routeObjId, isNewNote ) {
	newNoteDialog ( note, routeObjId, isNewNote )
		.show ( )
		.then (
			( ) => {
				if ( isNewNote ) {
					if ( INVALID_OBJ_ID === routeObjId ) {
						theTravelNotesData.travel.notes.add ( note );
						ourEventDispatcher.dispatch ( 'settravelnotes' );
					}
					else {
						let route = theDataSearchEngine.getRoute ( routeObjId );
						route.notes.add ( note );
						note.chainedDistance = route.chainedDistance;
						route.notes.sort (
							( first, second ) => first.distance - second.distance
						);
						ourEventDispatcher.dispatch ( 'setitinerary' );
					}
				}

				ourEventDispatcher.dispatch (
					'noteupdated',
					{
						removedNoteObjId : note.objId,
						addedNoteObjId : note.objId
					}
				);
				ourEventDispatcher.dispatch ( 'roadbookupdate' );
			}
		)
		.catch ( err => console.log ( err ? err : 'An error occurs in the note dialog' ) );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewNote
@desc This method construct a new Note object
@param {Array.<number>} latLng The latitude and longitude of the note
@return {Note} A new note object with the lat and lng completed
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewNote ( latLng ) {
	let note = newNote ( );
	note.latLng = latLng;
	note.iconLatLng = latLng;
	return note;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class contains all the needed methods fot Notes creation or modifications
@see {@link theNoteEditor} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteEditor {

	/**
	This method add a note with data from osm for each maneuver of a route
	A confirmation message is showed before starting.
	@param {!number} routeObjId The Route objId
	@fires updateitinerary
	@fires noteupdated
	@fires roadbookupdate
	*/

	addAllManeuverNotes ( routeObjId ) {
		let route = theDataSearchEngine.getRoute ( routeObjId );
		let maneuverIterator = route.itinerary.maneuvers.iterator;
		ourManeuverLength = ZERO;
		while ( ! maneuverIterator.done ) {
			if (
				! ( 'kDepartDefault' === maneuverIterator.value.iconName && ! maneuverIterator.first )
				&&
				! ( 'kArriveDefault' === maneuverIterator.value.iconName && ! maneuverIterator.last )
			) {
				ourManeuverLength ++;
			}
		}

		if ( theConfig.note.maxManeuversNotes < ourManeuverLength ) {
			theErrorsUI.showError (
				theTranslator.getText ( 'NoteEditor - max maneuvers notes reached {maneuversLength}{maxManeuversNotes}',
					{ maneuversLength : ourManeuverLength, maxManeuversNotes : theConfig.note.maxManeuversNotes } )
			);
			return;
		}

		newTwoButtonsDialog (
			{
				title : theTranslator.getText ( 'NoteEditor - Add a note for each maneuver' ),
				textContent : theTranslator.getText (
					'NoteEditor - Add a note for each maneuver. Are you sure?',
					{ noteLength : ourManeuverLength }
				),
				secondButtonContent : '&#x274C'
			}
		)
			.show ( )
			.then (
				( ) => {
					maneuverIterator = route.itinerary.maneuvers.iterator;
					if ( ! maneuverIterator.done ) {
						ourWaitUI = newWaitUI ( );
						ourWaitUI.createUI ( );
						ourManeuverCounter = ONE;
						ourAddAllManeuverNote ( maneuverIterator, route );
					}
				}
			)
			.catch ( err => console.log ( err ? err : 'An error occurs in the note dialog' ) );
	}

	/**
	This method add a route note.
	@param {!number} routeObjId The Route objId
	@param {event} contextMenuEvent the event that have lauched the method
	(a context menu event on the route on the map)
	@fires setitinerary
	@fires noteupdated
	@fires roadbookupdate
	*/

	newRouteNote ( routeObjId, contextMenuEvent ) {
		let route = theDataSearchEngine.getRoute ( routeObjId );

		// the nearest point and distance on the route is searched
		let latLngDistance = ourGeometry.getClosestLatLngDistance (
			route,
			[ contextMenuEvent.latlng.lat, contextMenuEvent.latlng.lng ]
		);

		// the note is created
		let note = ourNewNote ( latLngDistance.latLng );
		note.distance = latLngDistance.distance;

		ourNoteDialog ( note, route.objId, true );
	}

	/**
	This method add a note for a searh result from osm.
	@param {Object} searchResult A search result. See osmSearch plugin for more...
	@fires settravelnotes
	@fires noteupdated
	@fires roadbookupdate
	*/

	newSearchNote ( searchResult ) {
		let note = ourNewNote ( [ searchResult.lat, searchResult.lon ] );

		note.address =
			( searchResult.tags [ 'addr:housenumber' ] ? searchResult.tags [ 'addr:housenumber' ] + ' ' : '' ) +
			( searchResult.tags [ 'addr:street' ] ? searchResult.tags [ 'addr:street' ] + ' ' : '' ) +
			( searchResult.tags [ 'addr:city' ] ? searchResult.tags [ 'addr:city' ] + ' ' : '' );

		note.url = searchResult.tags.website || '';
		note.phone = searchResult.tags.phone || '';
		note.tooltipContent = searchResult.tags.name || '';
		note.popupContent = searchResult.tags.name || '';

		ourNoteDialog ( note, INVALID_OBJ_ID, true );
	}

	/**
	This method add a note with data from osm for a maneuver
	@param {!number} maneuverObjId The objId of the maneuver
	@fires setitinerary
	@fires noteupdated
	@fires roadbookupdate
	*/

	newManeuverNote ( maneuverObjId ) {
		ourWaitUI = newWaitUI ( );
		ourWaitUI.createUI ( );
		let route = theTravelNotesData.travel.editedRoute;
		let maneuver = route.itinerary.maneuvers.getAt ( maneuverObjId );
		let latLng = route.itinerary.itineraryPoints.getAt ( maneuver.itineraryPointObjId ).latLng;
		newSvgIconFromOsmFactory ( ).getPromiseIconAndAdress ( latLng, route.objId )
			.then (
				osmNoteData => {
					ourNewNoteFromOsmData ( osmNoteData, route );
					route.notes.sort (
						( first, second ) => first.distance - second.distance
					);
					route.itinerary.maneuvers.remove ( maneuverObjId );
					ourEventDispatcher.dispatch ( 'setitinerary' );
					ourEventDispatcher.dispatch ( 'roadbookupdate' );
					ourWaitUI.close ( );
					ourWaitUI = null;
				}
			)
			.catch (
				err => {
					console.log ( err ? err : 'an error occurs when creating the SVG icon.' );
					ourWaitUI.close ( );
					ourWaitUI = null;
				}
			);
	}

	/**
	This method add a travel note
	@param {Array.<number>} latLng The latitude and longitude of the note
	@fires settravelnotes
	@fires noteupdated
	@fires roadbookupdate
	*/

	newTravelNote ( latLng ) {
		let note = ourNewNote ( latLng );
		ourNoteDialog ( note, INVALID_OBJ_ID, true );
	}

	/**
	This method start the edition of a note
	@param {!number} noteObjId The objId of the note to be edited
	@fires settravelnotes
	@fires setitinerary
	@fires noteupdated
	@fires roadbookupdate
	*/

	editNote ( noteObjId ) {
		let noteAndRoute = theDataSearchEngine.getNoteAndRoute ( noteObjId );
		let routeObjId = null === noteAndRoute.route ? INVALID_OBJ_ID : noteAndRoute.route.objId;
		ourNoteDialog ( noteAndRoute.note, routeObjId, false );
	}

	/**
	This method remove a note
	@param {!number} noteObjId The objId of the note to be removed
	@fires updateitinerary
	@fires updatetravelnotes
	@fires noteupdated
	@fires roadbookupdate
	*/

	removeNote ( noteObjId ) {

		// the note and the route are searched
		let noteAndRoute = theDataSearchEngine.getNoteAndRoute ( noteObjId );
		if ( noteAndRoute.route ) {

			// it's a route note
			noteAndRoute.route.notes.remove ( noteObjId );
			ourEventDispatcher.dispatch ( 'updateitinerary' );
		}
		else {

			// it's a travel note
			theTravelNotesData.travel.notes.remove ( noteObjId );
			ourEventDispatcher.dispatch ( 'updatetravelnotes' );
		}
		ourEventDispatcher.dispatch (
			'noteupdated',
			{
				removedNoteObjId : noteObjId,
				addedNoteObjId : INVALID_OBJ_ID
			}
		);
		ourEventDispatcher.dispatch ( 'roadbookupdate' );
	}

	/**
	This method hide all notes on the map. The notes are always visible in the roadbook and UI
	@fires removeobject
	*/

	hideNotes ( ) {
		let notesIterator = theTravelNotesData.travel.notes.iterator;
		while ( ! notesIterator.done ) {
			ourEventDispatcher.dispatch ( 'removeobject', { objId : notesIterator.value.objId } );
		}
		let routesIterator = theTravelNotesData.travel.routes.iterator;
		while ( ! routesIterator.done ) {
			notesIterator = routesIterator.value.notes.iterator;
			while ( ! notesIterator.done ) {
				ourEventDispatcher.dispatch ( 'removeobject', { objId : notesIterator.value.objId } );
			}
		}
		if ( INVALID_OBJ_ID !== theTravelNotesData.editedRouteObjId ) {
			notesIterator = theTravelNotesData.travel.editedRoute.notes.iterator;
			while ( ! notesIterator.done ) {
				ourEventDispatcher.dispatch ( 'removeobject', { objId : notesIterator.value.objId } );
			}
		}
	}

	/**
	This method show all notes on the map.
	@fires noteupdated
	@fires routeupdated
	*/

	showNotes ( ) {
		this.hideNotes ( );
		let notesIterator = theTravelNotesData.travel.notes.iterator;
		while ( ! notesIterator.done ) {
			ourEventDispatcher.dispatch (
				'noteupdated',
				{
					removedNoteObjId : INVALID_OBJ_ID,
					addedNoteObjId : notesIterator.value.objId
				}
			);
		}
		let routesIterator = theTravelNotesData.travel.routes.iterator;
		while ( ! routesIterator.done ) {
			if ( ! routesIterator.value.hidden ) {
				ourEventDispatcher.dispatch (
					'routeupdated',
					{
						removedRouteObjId : routesIterator.value.objId,
						addedRouteObjId : routesIterator.value.objId
					}
				);
			}
		}
	}

	/**
	This method transform a travel note into a route note.
	The nearest point on a route is selected for the note
	@param {!number} noteObjId The objId of the note
	@fires updateitinerary
	@fires updatetravelnotes
	@fires noteupdated
	@fires roadbookupdate
	*/

	attachNoteToRoute ( noteObjId ) {
		let noteAndRoute = theDataSearchEngine.getNoteAndRoute ( noteObjId );
		let distance = Number.MAX_VALUE;
		let selectedRoute = null;
		let newNoteLatLng = null;
		let newNoteDistance = null;
		theTravelNotesData.travel.routes.forEach (
			route => {
				let pointAndDistance = ourGeometry.getClosestLatLngDistance ( route, noteAndRoute.note.latLng );
				if ( pointAndDistance ) {
					let distanceToRoute = ourGeometry.pointsDistance (
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
			selectedRoute.notes.add ( noteAndRoute.note );
			selectedRoute.notes.sort (
				( first, second ) => first.distance - second.distance
			);

			ourEventDispatcher.dispatch (
				'noteupdated',
				{
					removedNoteObjId : noteObjId,
					addedNoteObjId : noteObjId
				}
			);
			ourEventDispatcher.dispatch ( 'updateitinerary' );
			ourEventDispatcher.dispatch ( 'updatetravelnotes' );
			ourEventDispatcher.dispatch ( 'roadbookupdate' );
		}
	}

	/**
	This method transform a route note into a travel note.
	@param {!number} noteObjId The objId of the note
	@fires updateitinerary
	@fires updatetravelnotes
	@fires roadbookupdate
	*/

	detachNoteFromRoute ( noteObjId ) {
		let noteAndRoute = theDataSearchEngine.getNoteAndRoute ( noteObjId );
		noteAndRoute.route.notes.remove ( noteObjId );
		noteAndRoute.note.distance = DISTANCE.invalid;
		noteAndRoute.note.chainedDistance = DISTANCE.defaultValue;
		theTravelNotesData.travel.notes.add ( noteAndRoute.note );

		ourEventDispatcher.dispatch ( 'updateitinerary' );
		ourEventDispatcher.dispatch ( 'updatetravelnotes' );
		ourEventDispatcher.dispatch ( 'roadbookupdate' );
	}

	/**
	This method is called when a note is dropped in the TravelNotesPaneUI and then notes reordered.
	@param {!number} draggedNoteObjId The objId of the dragged note
	@param {!number} targetNoteObjId The objId of the note on witch the drop was executed
	@param {boolean} draggedBefore when true the dragged note is moved before the target note
	when false after
	@fires updatetravelnotes
	@fires roadbookupdate
	*/

	travelNoteDropped ( draggedNoteObjId, targetNoteObjId, draggedBefore ) {
		theTravelNotesData.travel.notes.moveTo ( draggedNoteObjId, targetNoteObjId, draggedBefore );
		ourEventDispatcher.dispatch ( 'updatetravelnotes' );
		ourEventDispatcher.dispatch ( 'roadbookupdate' );
	}
}

const ourNoteEditor = Object.seal ( new NoteEditor );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of NoteEditor class
	@type {NoteEditor}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourNoteEditor as theNoteEditor
};

/*
--- End of NoteEditor.js file -------------------------------------------------------------------------------------------------
*/