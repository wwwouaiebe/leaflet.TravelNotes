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
	- v1.13.0:
		- Issue #128 : Unify osmSearch and notes icons and data
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
import { theEventDispatcher } from '../util/EventDispatcher.js';
import { theGeometry } from '../util/Geometry.js';
import { newSvgIconFromOsmFactory } from '../core/SvgIconFromOsmFactory.js';
import { theConfig } from '../data/Config.js';
import { newWaitUI } from '../UI/WaitUI.js';
import { newTwoButtonsDialog } from '../dialogs/TwoButtonsDialog.js';
import { theErrorsUI } from '../UI/ErrorsUI.js';
import { theNoteDialogToolbar } from '../dialogs/NoteDialogToolbar.js';

import { ZERO, ONE, DISTANCE, INVALID_OBJ_ID, ICON_DIMENSIONS } from '../util/Constants.js';

let ourWaitUI = null;
let ourManeuverCounter = ZERO;
let ourManeuverLength = ZERO;
let ourOsmSearchNoteDialog = theConfig.note.osmSearchNoteDialog;

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
	note.distance = theGeometry.getClosestLatLngDistance ( route, note.latLng ).distance;
	note.chainedDistance = route.chainedDistance;
	route.notes.add ( note );
	theEventDispatcher.dispatch (
		'noteupdated',
		{
			removedNoteObjId : INVALID_OBJ_ID,
			addedNoteObjId : note.objId
		}
	);
	theEventDispatcher.dispatch ( 'roadbookupdate' );
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
			theEventDispatcher.dispatch ( 'updateitinerary' );
			theEventDispatcher.dispatch ( 'roadbookupdate' );
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

@function ourAddNote
@desc This method add or update a note to theTravelNotesData and to the map
@param {Note} note the note to add
@param {Route} route The route to witch the notes will be attached
@param {boolean} isNewNote true when the note is a new note
@fires updateitinerary
@fires roadbookupdate
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourAddNote ( note, routeObjId, isNewNote ) {
	if ( isNewNote ) {
		if ( INVALID_OBJ_ID === routeObjId ) {
			theTravelNotesData.travel.notes.add ( note );
			theEventDispatcher.dispatch ( 'showtravelnotes' );
		}
		else {
			let route = theDataSearchEngine.getRoute ( routeObjId );
			route.notes.add ( note );
			note.chainedDistance = route.chainedDistance;
			route.notes.sort (
				( first, second ) => first.distance - second.distance
			);
			theEventDispatcher.dispatch ( 'showitinerary' );
		}
	}
	else if ( INVALID_OBJ_ID === routeObjId ) {
		theEventDispatcher.dispatch ( 'updatetravelnotes' );
	}
	else {
		theEventDispatcher.dispatch ( 'updateitinerary' );
	}
	theEventDispatcher.dispatch (
		'noteupdated',
		{
			removedNoteObjId : note.objId,
			addedNoteObjId : note.objId
		}
	);
	theEventDispatcher.dispatch ( 'roadbookupdate' );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNoteDialog
@desc This method show the Note dialog and then add or update the note
@param {Note} note the Note to be added or updated
@param {!number} routeObjId The route objId to witch the note will be attached (= INVALID_OBJ_ID for a travel note)
@param {boolean} isNewNote when true the note will be added, otherwise updated
@fires showtravelnotes
@fires showitinerary
@fires noteupdated
@fires roadbookupdate
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNoteDialog ( note, routeObjId, isNewNote ) {
	newNoteDialog ( note, routeObjId, isNewNote )
		.show ( )
		.then ( ( ) => { ourAddNote ( note, routeObjId, isNewNote ); } )
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

	/*
	get the status of the osmSearchNoteDialog flag
	*/

	get osmSearchNoteDialog ( ) { return ourOsmSearchNoteDialog; }

	/*
	change the status of the osmSearchNoteDialog flag
	*/

	changeOsmSearchNoteDialog ( ) {
		ourOsmSearchNoteDialog = ! ourOsmSearchNoteDialog;
	}

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
	@fires showitinerary
	@fires noteupdated
	@fires roadbookupdate
	*/

	newRouteNote ( data ) {
		let route = theDataSearchEngine.getRoute ( data.routeObjId );

		// the nearest point and distance on the route is searched
		let latLngDistance = theGeometry.getClosestLatLngDistance (
			route,
			[ data.lat, data.lng ]
		);

		// the note is created
		let note = ourNewNote ( latLngDistance.latLng );
		note.distance = latLngDistance.distance;

		ourNoteDialog ( note, route.objId, true );
	}

	/**
	This method add a note for a searh result from osm.
	@param {Object} searchResult A search result. See osmSearch plugin for more...
	@fires showtravelnotes
	@fires noteupdated
	@fires roadbookupdate
	*/

	newSearchNote ( data ) {

		let noteLatLng = [ data.osmElement.lat, data.osmElement.lon ];
		let newNoteLatLng = [ data.osmElement.lat, data.osmElement.lon ];
		let routeObjId = INVALID_OBJ_ID;
		let distance = Number.MAX_VALUE;

		function selectRoute ( route ) {
			if ( route.objId !== theTravelNotesData.editedRouteObjId ) {
				let pointAndDistance = theGeometry.getClosestLatLngDistance ( route, noteLatLng );
				if ( pointAndDistance ) {
					let distanceToRoute = theGeometry.pointsDistance (
						noteLatLng,
						pointAndDistance.latLng
					);
					if ( distanceToRoute < distance ) {
						routeObjId = route.objId;
						distance = distanceToRoute;
						newNoteLatLng = pointAndDistance.latLng;
					}
				}
			}
		}

		if ( ! data.isTravelNote ) {
			theTravelNotesData.travel.routes.forEach ( selectRoute );
			if ( INVALID_OBJ_ID !== theTravelNotesData.editedRouteObjId ) {
				selectRoute ( theTravelNotesData.travel.editedRoute );
			}
		}

		let note = newNote ( );
		note.latLng = newNoteLatLng;
		note.iconLatLng = noteLatLng;
		note.iconHeight = ICON_DIMENSIONS.height;
		note.iconWidth = ICON_DIMENSIONS.width;

		if ( data.osmElement.tags.rcn_ref ) {
			note.iconContent =
				'<div class=\'TravelNotes-MapNote TravelNotes-MapNoteCategory-0073\'>' +
				'<svg viewBox=\'0 0 20 20\'><text x=\'10\' y=\'14\'>' +
				data.osmElement.tags.rcn_ref +
				'</text></svg></div>';
		}
		else {
			note.iconContent = theNoteDialogToolbar.getIconDataFromName ( data.osmElement.description ) || '';
		}
		note.address =
			( data.osmElement.tags [ 'addr:housenumber' ] ? data.osmElement.tags [ 'addr:housenumber' ] + ' ' : '' ) +
			( data.osmElement.tags [ 'addr:street' ] ? data.osmElement.tags [ 'addr:street' ] + ' ' : '' ) +
			( data.osmElement.tags [ 'addr:postcode' ] ? data.osmElement.tags [ 'addr:postcode' ] + ' ' : '' ) +
			( data.osmElement.tags [ 'addr:city' ] ? data.osmElement.tags [ 'addr:city' ] + ' ' : '' );

		note.url = data.osmElement.tags.website || '';
		note.phone = data.osmElement.tags.phone || '';
		note.tooltipContent = data.osmElement.description || '';
		note.popupContent = data.osmElement.tags.name || '';

		if ( ! data.isTravelNote && INVALID_OBJ_ID === routeObjId ) {
			theErrorsUI.showError ( theTranslator.getText ( 'NoteEditor - No route was found' ) );
		}
		else if ( ourOsmSearchNoteDialog || '' === note.iconContent ) {
			ourNoteDialog ( note, routeObjId, true );
		}
		else {
			ourAddNote ( note, routeObjId, true );
		}
	}

	/**
	This method add a note with data from osm for a maneuver
	@param {!number} maneuverObjId The objId of the maneuver
	@fires showitinerary
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
					theEventDispatcher.dispatch ( 'showitinerary' );
					theEventDispatcher.dispatch ( 'roadbookupdate' );
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
	@fires showtravelnotes
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
	@fires showtravelnotes
	@fires showitinerary
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
			theEventDispatcher.dispatch ( 'updateitinerary' );
		}
		else {

			// it's a travel note
			theTravelNotesData.travel.notes.remove ( noteObjId );
			theEventDispatcher.dispatch ( 'updatetravelnotes' );
		}
		theEventDispatcher.dispatch (
			'noteupdated',
			{
				removedNoteObjId : noteObjId,
				addedNoteObjId : INVALID_OBJ_ID
			}
		);
		theEventDispatcher.dispatch ( 'roadbookupdate' );
	}

	/**
	This method hide all notes on the map. The notes are always visible in the roadbook and UI
	@fires removeobject
	*/

	hideNotes ( ) {
		let notesIterator = theTravelNotesData.travel.notes.iterator;
		while ( ! notesIterator.done ) {
			theEventDispatcher.dispatch ( 'removeobject', { objId : notesIterator.value.objId } );
		}
		let routesIterator = theTravelNotesData.travel.routes.iterator;
		while ( ! routesIterator.done ) {
			notesIterator = routesIterator.value.notes.iterator;
			while ( ! notesIterator.done ) {
				theEventDispatcher.dispatch ( 'removeobject', { objId : notesIterator.value.objId } );
			}
		}
		if ( INVALID_OBJ_ID !== theTravelNotesData.editedRouteObjId ) {
			notesIterator = theTravelNotesData.travel.editedRoute.notes.iterator;
			while ( ! notesIterator.done ) {
				theEventDispatcher.dispatch ( 'removeobject', { objId : notesIterator.value.objId } );
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
			theEventDispatcher.dispatch (
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
				theEventDispatcher.dispatch (
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
				let pointAndDistance = theGeometry.getClosestLatLngDistance ( route, noteAndRoute.note.latLng );
				if ( pointAndDistance ) {
					let distanceToRoute = theGeometry.pointsDistance (
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

			theEventDispatcher.dispatch (
				'noteupdated',
				{
					removedNoteObjId : noteObjId,
					addedNoteObjId : noteObjId
				}
			);
			theEventDispatcher.dispatch ( 'updateitinerary' );
			theEventDispatcher.dispatch ( 'updatetravelnotes' );
			theEventDispatcher.dispatch ( 'roadbookupdate' );
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

		theEventDispatcher.dispatch ( 'updateitinerary' );
		theEventDispatcher.dispatch ( 'updatetravelnotes' );
		theEventDispatcher.dispatch ( 'roadbookupdate' );
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
		theEventDispatcher.dispatch ( 'updatetravelnotes' );
		theEventDispatcher.dispatch ( 'roadbookupdate' );
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