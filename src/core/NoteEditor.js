/*
Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/

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
		- Issue ♯52 : when saving the travel to the file, save also the edited route.
	- v1.6.0:
		- Issue ♯65 : Time to go to ES6 modules?
		- Issue ♯66 : Work with promises for dialogs
		- Issue ♯70 : Put the get...HTML functions outside of the editors
		- Issue ♯68 : Review all existing promises.
	- v1.11.0:
		- Issue ♯110 : Add a command to create a SVG icon from osm for each maneuver
	- v1.12.0:
		- Issue ♯120 : Review the UserInterface
	- v1.13.0:
		- Issue ♯128 : Unify osmSearch and notes icons and data
	- v2.0.0:
		- Issue ♯135 : Remove innerHTML from code
		- Issue ♯138 : Protect the app - control html entries done by user.
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests 20210902
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file NoteEditor.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module core
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theTranslator from '../UILib/Translator.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import NoteDialog from '../dialogNotes/NoteDialog.js';
import Note from '../data/Note.js';
import theDataSearchEngine from '../data/DataSearchEngine.js';
import theEventDispatcher from '../coreLib/EventDispatcher.js';
import theGeometry from '../coreLib/Geometry.js';
import theConfig from '../data/Config.js';
import WaitUI from '../waitUI/WaitUI.js';
import theErrorsUI from '../errorsUI/ErrorsUI.js';
import theNoteDialogToolbarData from '../dialogNotes/NoteDialogToolbarData.js';
import GeoCoder from '../coreLib/GeoCoder.js';

import { ZERO, DISTANCE, INVALID_OBJ_ID, ICON_DIMENSIONS } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class NoteEditor
@classdesc This class contains all the needed methods fot Notes creation or modifications
@see {@link theNoteEditor} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteEditor {

	#waitUI = null;

	#showSearchNoteDialog = null;

	#maneuverCounter = ZERO;

	/**
	This method add or update a note to theTravelNotesData and to the map
	@param {Note} note the note to add
	@param {Route} route The route to witch the notes will be attached
	@param {boolean} isNewNote true when the note is a new note
	@fires updateitinerary
	@fires roadbookupdate
	@private
	*/

	#addNote ( note, routeObjId, isNewNote ) {
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
	This method show the Note dialog and then add or update the note
	@param {Note} note the Note to be added or updated
	@param {!number} routeObjId The route objId to witch the note will be attached (= INVALID_OBJ_ID for a travel note)
	@param {boolean} isNewNote when true the note will be added, otherwise updated
	@fires showtravelnotes
	@fires showitinerary
	@fires noteupdated
	@fires roadbookupdate
	@private
	*/

	#noteDialog ( note, routeObjId, isNewNote ) {
		new NoteDialog ( note, routeObjId, isNewNote )
			.show ( )
			.then ( ( ) => this.#addNote ( note, routeObjId, isNewNote ) )
			.catch (
				err => {
					console.error ( err );
				}
			);
	}

	/**
	This method construct a new Note object
	@param {Array.<number>} latLng The latitude and longitude of the note
	@return {Note} A new note object with the lat and lng completed
	@private
	*/

	#newNote ( latLng ) {
		let note = new Note ( );
		note.latLng = latLng;
		note.iconLatLng = latLng;
		return note;
	}

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	/*
	get the status of the osmSearchNoteDialog flag
	*/

	get osmSearchNoteDialog ( ) {
		if ( null === this.#showSearchNoteDialog ) {
			this.#showSearchNoteDialog = theConfig.osmSearch.showSearchNoteDialog;
		}
		return this.#showSearchNoteDialog;
	}

	/*
	change the status of the osmSearchNoteDialog flag
	*/

	changeOsmSearchNoteDialog ( ) {
		this.#showSearchNoteDialog = ! this.osmSearchNoteDialog;
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
		let note = this.#newNote ( latLngDistance.latLng );
		note.distance = latLngDistance.distance;

		this.#noteDialog ( note, route.objId, true );
	}

	/**
	This method add a note for a searh result from osm.
	@param {Object} searchResult A search result. See osmSearch plugin for more...
	@fires showtravelnotes
	@fires noteupdated
	@fires roadbookupdate
	*/

	async newSearchNote ( data ) {
		let routeObjId = INVALID_OBJ_ID;
		let note = new Note ( );
		if ( data.isTravelNote ) {
			note.latLng = [ data.osmElement.lat, data.osmElement.lon ];
		}
		else {
			let nearestRouteData = theDataSearchEngine.getNearestRouteData ( [ data.osmElement.lat, data.osmElement.lon ] );
			if ( ! nearestRouteData.route ) {
				theErrorsUI.showError ( theTranslator.getText ( 'NoteEditor - No route was found' ) );
				return;
			}
			note.latLng = nearestRouteData.latLngOnRoute;
			note.distance = nearestRouteData.distanceOnRoute;
			routeObjId = nearestRouteData.route.objId;
		}
		note.iconLatLng = [ data.osmElement.lat, data.osmElement.lon ];
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
			note.iconContent = theNoteDialogToolbarData.getIconContentFromName ( data.osmElement.description );
		}
		note.url = data.osmElement.tags.website || '';
		note.phone = data.osmElement.tags.phone || '';
		note.tooltipContent = data.osmElement.description || '';
		note.popupContent = data.osmElement.tags.name || '';
		if (
			! data.osmElement.tags [ 'addr:street' ]
			||
			! data.osmElement.tags [ 'addr:city' ]
		) {
			this.#waitUI = new WaitUI ( );
			this.#waitUI.createUI ( );
			this.#waitUI.showInfo ( 'Creating address' );
			let geoCoderData = null;
			try {
				geoCoderData = await new GeoCoder ( ).getAddressAsync ( [ data.osmElement.lat, data.osmElement.lon ] );
			}
			catch ( err ) {
				console.error ( err );
			}
			this.#waitUI.close ( );
			if ( geoCoderData.statusOk ) {
				note.address = geoCoderData.street;
				if ( '' !== geoCoderData.city ) {
					note.address +=
						' <span class="TravelNotes-NoteHtml-Address-City">' + geoCoderData.city + '</span>';
				}
			}
		}
		else {
			note.address =
				( data.osmElement.tags [ 'addr:housenumber' ] ? data.osmElement.tags [ 'addr:housenumber' ] + ' ' : '' ) +
				data.osmElement.tags [ 'addr:street' ] +
				' <span class="TravelNotes-NoteHtml-Address-City">' + data.osmElement.tags [ 'addr:city' ] + '</span>';
		}
		if ( this.osmSearchNoteDialog || '' === note.iconContent ) {
			this.#noteDialog ( note, routeObjId, true );
		}
		else {
			this.#addNote ( note, routeObjId, true );
		}
	}

	/**
	This method add a travel note
	@param {Array.<number>} latLng The latitude and longitude of the note
	@fires showtravelnotes
	@fires noteupdated
	@fires roadbookupdate
	*/

	newTravelNote ( latLng ) {
		let note = this.#newNote ( latLng );
		this.#noteDialog ( note, INVALID_OBJ_ID, true );
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
		this.#noteDialog ( noteAndRoute.note, routeObjId, false );
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
		let note = theDataSearchEngine.getNoteAndRoute ( noteObjId ).note;
		let nearestRouteData = theDataSearchEngine.getNearestRouteData ( note.latLng );

		if ( nearestRouteData.route ) {
			theTravelNotesData.travel.notes.remove ( noteObjId );
			note.distance = nearestRouteData.distance;
			note.latLng = nearestRouteData.latLngOnRoute;
			note.chainedDistance = nearestRouteData.route.chainedDistance;
			nearestRouteData.route.notes.add ( note );
			nearestRouteData.route.notes.sort (
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

/**
@------------------------------------------------------------------------------------------------------------------------------

@desc The one and only one instance of NoteEditor class
@type {NoteEditor}
@constant
@global

@------------------------------------------------------------------------------------------------------------------------------
*/

const theNoteEditor = new NoteEditor ( );

export default theNoteEditor;

/*
--- End of NoteEditor.js file -------------------------------------------------------------------------------------------------
*/