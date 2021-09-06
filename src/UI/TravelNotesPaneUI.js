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
Doc reviewed 20210901
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

@module travelNotesPaneUI

@------------------------------------------------------------------------------------------------------------------------------
*/

import PaneUI from '../UI/PaneUI.js';
import theTranslator from '../UILib/Translator.js';
import theNoteHTMLViewsFactory from '../viewsFactories/NoteHTMLViewsFactory.js';
import theNoteEditor from '../core/NoteEditor.js';
import NoteContextMenu from '../contextMenus/NoteContextMenu.js';
import { PANE_ID } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class TravelNoteDragStartEL
@classdesc dragstart event listener for the travel notes

@------------------------------------------------------------------------------------------------------------------------------
*/

class TravelNoteDragStartEL {

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	handleEvent ( dragEvent ) {
		dragEvent.stopPropagation ( );
		try {
			dragEvent.dataTransfer.setData ( 'ObjId', dragEvent.target.dataset.tanObjId );
			dragEvent.dataTransfer.dropEffect = 'move';
		}
		catch ( err ) {
			if ( err instanceof Error ) {
				console.error ( err );
			}
		}
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class TravelNoteDragOverEL
@classdesc dragover event listener for the travel notes

@------------------------------------------------------------------------------------------------------------------------------
*/

class TravelNoteDragOverEL {

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	handleEvent ( dragEvent ) {
		dragEvent.preventDefault ( );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class TravelNoteDropEL
@classdesc drop event listener for the travel notes

@------------------------------------------------------------------------------------------------------------------------------
*/

class TravelNoteDropEL {

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	handleEvent ( dropEvent ) {
		dropEvent.preventDefault ( );
		let element = dropEvent.currentTarget;
		let clientRect = element.getBoundingClientRect ( );

		theNoteEditor.travelNoteDropped (
			Number.parseInt ( dropEvent.dataTransfer.getData ( 'ObjId' ) ),
			Number.parseInt ( element.dataset.tanObjId ),
			dropEvent.clientY - clientRect.top < clientRect.bottom - dropEvent.clientY
		);
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class TravelNoteContextMenuEL
@classdesc contextmenu event listener for the travel notes

@------------------------------------------------------------------------------------------------------------------------------
*/

class TravelNoteContextMenuEL {

	#paneData = null;

	/*
	constructor
	*/

	constructor ( paneData ) {
		Object.freeze ( this );
		this.#paneData = paneData;
	}

	handleEvent ( contextMenuEvent ) {
		contextMenuEvent.stopPropagation ( );
		contextMenuEvent.preventDefault ( );
		new NoteContextMenu ( contextMenuEvent, this.#paneData ).show ( );
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

	#eventListeners = {
		onDragStart : null,
		onDragOver : null,
		onDrop : null,
		onContextMenu : null
	};

	/*
	constructor
	*/

	constructor ( paneData, paneControl ) {
		super ( paneData, paneControl );
		this.#eventListeners.onDragStart = new TravelNoteDragStartEL ( );
		this.#eventListeners.onDragOver = new TravelNoteDragOverEL ( );
		this.#eventListeners.onDrop = new TravelNoteDropEL ( );
		this.#eventListeners.onContextMenu = new TravelNoteContextMenuEL ( paneData );
	}

	/**
	This method removes all the elements from the data div and control div
	*/

	remove ( ) {
		if ( this.#travelNotesDiv ) {
			this.#travelNotesDiv.childNodes.forEach (
				childNode => {
					childNode.removeEventListener ( 'contextmenu', this.#eventListeners.onContextMenu, false );
					childNode.removeEventListener ( 'dragstart', this.#eventListeners.onDragStart, false );
					childNode.removeEventListener ( 'drop', this.#eventListeners.onDrop, false );
				}
			);
			this.paneData.removeChild ( this.#travelNotesDiv );
		}
		this.#travelNotesDiv = null;
	}

	/**
	This method add the travel notes to the data div
	*/

	add ( ) {
		this.#travelNotesDiv = theNoteHTMLViewsFactory.getTravelNotesHTML ( 'TravelNotes-TravelNotesPaneUI-' );
		this.#travelNotesDiv.addEventListener ( 'dragover', this.#eventListeners.onDragOver, false );
		this.paneData.appendChild ( this.#travelNotesDiv );
		this.#travelNotesDiv.childNodes.forEach (
			childNode => {
				childNode.draggable = true;
				childNode.addEventListener ( 'contextmenu', this.#eventListeners.onContextMenu, false );
				childNode.addEventListener ( 'dragstart', this.#eventListeners.onDragStart, false );
				childNode.addEventListener ( 'drop', this.#eventListeners.onDrop, false );
				childNode.classList.add ( 'TravelNotes-UI-MoveCursor' );
			}
		);
	}

	/**
	This method returns the pane id
	*/

	getPaneId ( ) { return PANE_ID.travelNotesPane; }

	/**
	This method returns the text to add in the pane button
	*/

	getButtonText ( ) { return theTranslator.getText ( 'PanesManagerUI - Travel notes' ); }

}

export default TravelNotesPaneUI;

/*
--- End of TravelNotesPaneUI.js file ------------------------------------------------------------------------------------------
*/