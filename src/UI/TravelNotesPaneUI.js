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
	- v1.4.0:
		- created
	- v1.6.0:
		- Issue ♯65 : Time to go to ES6 modules?
	- v1.12.0:
		- Issue ♯120 : Review the UserInterface
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210725
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file TravelNotesPaneUI.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module TravelNotesPaneUI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import PaneUI from '../UI/PaneUI.js';
import theTranslator from '../UI/Translator.js';
import theNoteHTMLViewsFactory from '../UI/NoteHTMLViewsFactory.js';
import theNoteEditor from '../core/NoteEditor.js';
import { newNoteContextMenu } from '../contextMenus/NoteContextMenu.js';
import { LAT_LNG, ZERO, PANE_ID } from '../util/Constants.js';

class travelNotesDivDragEventListeners {

	static #noteObjId = ZERO;

	static onDragStart ( dragEvent ) {
		dragEvent.stopPropagation ( );
		try {
			dragEvent.dataTransfer.setData ( 'Text', dragEvent.target.dataObjId );
			dragEvent.dataTransfer.dropEffect = 'move';
		}
		catch ( err ) {
			if ( err instanceof Error ) {
				console.error ( err );
			}
		}

		travelNotesDivDragEventListeners.#noteObjId = dragEvent.target.noteObjId;
	}

	static onDragOver ( dragEvent ) {
		dragEvent.preventDefault ( );
	}

	static onDrop ( dragEvent ) {
		dragEvent.preventDefault ( );
		let element = dragEvent.target;

		while ( ! element.noteObjId ) {
			element = element.parentElement;
		}
		let clientRect = element.getBoundingClientRect ( );

		theNoteEditor.travelNoteDropped (
			travelNotesDivDragEventListeners.#noteObjId,
			element.noteObjId,
			dragEvent.clientY - clientRect.top < clientRect.bottom - dragEvent.clientY
		);
	}
}

class NotesEventsListeners {

	/**
	@private
	*/

	static onContextMenu ( contextMenuEvent ) {
		contextMenuEvent.stopPropagation ( );
		contextMenuEvent.preventDefault ( );
		let element = contextMenuEvent.target;
		while ( ! element.noteObjId ) {
			element = element.parentNode;
		}
		contextMenuEvent.latlng = { lat : LAT_LNG.defaultValue, lng : LAT_LNG.defaultValue };
		contextMenuEvent.fromUI = true;
		contextMenuEvent.originalEvent =
			{
				clientX : contextMenuEvent.clientX,
				clientY : contextMenuEvent.clientY,
				latLng : element.latLng
			};
		if ( element.noteObjId ) {
			contextMenuEvent.noteObjId = element.noteObjId;
			newNoteContextMenu ( contextMenuEvent, this.paneDataDiv.parentNode ).show ( );
		}
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class TravelNotesPaneUI
@classdesc This class manages the travel notes pane UI
@see {@link PanesManagerUI} for pane UI management
@extends PaneUI
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class TravelNotesPaneUI extends PaneUI {

	#travelNotesDiv = null;

	constructor ( ) {
		super ( );
		Object.seal ( this );
	}

	/**
	This method removes all the elements from the data div and control div
	*/

	remove ( ) {
		if ( this.#travelNotesDiv ) {
			this.#travelNotesDiv.childNodes.forEach (
				childNode => {
					childNode.removeEventListener ( 'contextmenu', NotesEventsListeners.onContextMenu, false );
					childNode.removeEventListener ( 'dragstart', travelNotesDivDragEventListeners.onDragStart, false );
				}
			);
			this.paneDataDiv.removeChild ( this.#travelNotesDiv );
		}
		this.#travelNotesDiv = null;
	}

	/**
	This method add the travel notes to the data div
	*/

	add ( ) {
		this.#travelNotesDiv = theNoteHTMLViewsFactory.getTravelNotesHTML ( 'TravelNotes-TravelNotesPaneUI-' );
		this.#travelNotesDiv.addEventListener ( 'drop', travelNotesDivDragEventListeners.onDrop, false );
		this.#travelNotesDiv.addEventListener ( 'dragover', travelNotesDivDragEventListeners.onDragOver, false );
		this.paneDataDiv.appendChild ( this.#travelNotesDiv );
		this.#travelNotesDiv.childNodes.forEach (
			childNode => {
				childNode.draggable = true;
				childNode.addEventListener ( 'contextmenu', NotesEventsListeners.onContextMenu, false );
				childNode.addEventListener ( 'dragstart', travelNotesDivDragEventListeners.onDragStart, false );
				childNode.classList.add ( 'TravelNotes-UI-MoveCursor' );
			}
		);
	}

	/**
	This method returns the pane id
	*/

	getId ( ) { return PANE_ID.travelNotesPane; }

	/**
	This method returns the text to add in the pane button
	*/

	getButtonText ( ) { return theTranslator.getText ( 'PanesManagerUI - Travel notes' ); }

}

export default TravelNotesPaneUI;

/*
--- End of TravelNotesPaneUI.js file ------------------------------------------------------------------------------------------
*/