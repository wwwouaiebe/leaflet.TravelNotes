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
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests 20210903
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file AllManeuverNotesBuilder.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module core

@------------------------------------------------------------------------------------------------------------------------------
*/

import WaitUI from '../waitUI/WaitUI.js';
import MapIconFromOsmFactory from '../coreMapIcon/MapIconFromOsmFactory.js';
import Note from '../data/Note.js';
import theGeometry from '../coreLib/Geometry.js';
import theEventDispatcher from '../coreLib/EventDispatcher.js';
import theErrorsUI from '../errorsUI/ErrorsUI.js';
import theConfig from '../data/Config.js';
import theTranslator from '../UILib/Translator.js';
import TwoButtonsDialog from '../dialogs/TwoButtonsDialog.js';
import theDataSearchEngine from '../data/DataSearchEngine.js';

import { ZERO, ONE, INVALID_OBJ_ID } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class AllManeuverNotesBuilder
@classdesc coming soon...
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class AllManeuverNotesBuilder {

	#waitUI = null;

	/**
	This method creates a new route note with data from osm
	@param {OsmNoteData} osmNoteData The osm data needed for the note
	@param {Route} route The route to witch the note will be attached
	@fires noteupdated
	@private
	*/

	#newNoteFromOsmData ( noteData, route ) {
		let note = new Note ( );
		for ( const property in noteData ) {
			note [ property ] = noteData [ property ];
		}

		note.iconLatLng = note.latLng;
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
	This method add a note with data from osm for each maneuver of a route.
	@param {Route} route The route to witch the notes will be attached
	@param {maneuverLength} The number of maneuver to proceed !== route.itinerary.maneuvers.length
	@fires updateitinerary
	@fires roadbookupdate
	@private
	*/

	async #addAllManeuverNotes ( route, maneuverLength ) {
		this.#waitUI = new WaitUI ( );
		this.#waitUI.createUI ( );
		let maneuverIterator = route.itinerary.maneuvers.iterator;
		while ( ! maneuverIterator.done ) {
			this.#waitUI.showInfo (
				theTranslator.getText (
					'NoteEditor - Creating note',
					{ noteNumber : maneuverIterator.index + ONE, notesLength : maneuverLength }
				)
			);

			let latLng = route.itinerary.itineraryPoints.getAt ( maneuverIterator.value.itineraryPointObjId ).latLng;
			let svgIconData = await new MapIconFromOsmFactory ( ).getIconAndAdressAsync ( latLng, route.objId );
			if ( svgIconData.statusOk ) {
				this.#newNoteFromOsmData ( svgIconData.noteData, route );
			}
			else {
				console.error ( 'An error occurs when creating the svg icon ' + maneuverIterator.index );
			}
		}
		route.notes.sort ( ( first, second ) => first.distance - second.distance );
		theEventDispatcher.dispatch ( 'updateitinerary' );
		theEventDispatcher.dispatch ( 'roadbookupdate' );
		this.#waitUI.close ( );
		this.#waitUI = null;
	}

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
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
		let maneuverLength = ZERO;
		while ( ! maneuverIterator.done ) {
			if (
				! ( 'kDepartDefault' === maneuverIterator.value.iconName && ! maneuverIterator.first )
				&&
				! ( 'kArriveDefault' === maneuverIterator.value.iconName && ! maneuverIterator.last )
			) {
				maneuverLength ++;
			}
		}

		if ( theConfig.note.maxManeuversNotes < maneuverLength ) {
			theErrorsUI.showError (
				theTranslator.getText ( 'NoteEditor - max maneuvers notes reached {maneuversLength}{maxManeuversNotes}',
					{ maneuversLength : maneuverLength, maxManeuversNotes : theConfig.note.maxManeuversNotes } )
			);
			return;
		}

		new TwoButtonsDialog (
			{
				title : theTranslator.getText ( 'NoteEditor - Add a note for each maneuver' ),
				text : theTranslator.getText (
					'NoteEditor - Add a note for each maneuver. Are you sure?',
					{ noteLength : maneuverLength }
				),
				secondButtonText : '❌'
			}
		)
			.show ( )
			.then ( ( ) => this.#addAllManeuverNotes ( route, maneuverLength ) )
			.catch (
				err => {
					if ( err instanceof Error ) {
						console.error ( err );
					}
				}
			);
	}
}

export default AllManeuverNotesBuilder;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of AllManeuverNotesBuilder.js file

@------------------------------------------------------------------------------------------------------------------------------
*/