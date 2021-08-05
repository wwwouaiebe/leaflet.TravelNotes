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
	- v1.3.0:
		- added train button
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
	- v1.6.0:
		- Issue ♯65 : Time to go to ES6 modules?
	- v1.12.0:
		- Issue ♯120 : Review the UserInterface
	- v2.0.0:
		- Issue ♯135 : Remove innerHTML from code
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210725
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file PanesManagerUI.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module PanesManagerUI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import { MOUSE_WHEEL_FACTORS, PANE_ID } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class PaneButtonsEventListeners
@classdesc This class contains the event listeners for the Pane buttons
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

class PaneButtonsEventListeners {

	/* eslint-disable no-use-before-define */
	static onClick ( clickEvent ) {
		thePanesManagerUI.showPane ( clickEvent.target.objId );
	}
	/* eslint-enable no-use-before-define */

}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class PaneDataDivEventListeners
@classdesc This class contains the event listeners for the PaneDataDiv
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

class PaneDataDivEventListeners {

	static onWheel ( wheelEvent ) {
		if ( wheelEvent.deltaY ) {
			wheelEvent.target.scrollTop +=
				wheelEvent.deltaY * MOUSE_WHEEL_FACTORS [ wheelEvent.deltaMode ];
		}
		wheelEvent.stopPropagation ( );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class manages the differents panes on the UI
@see {@link thePanesManagerUI} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class PanesManagerUI {

	#activePaneObjId = PANE_ID.invalidPane;
	#panes = new Map ( );
	#paneDataDiv = null;
	#paneControlDiv = null;

	/**
	This method remove the content of the Data Pane Div
	@private
	*/

	#removeActivePane ( ) {
		if ( PANE_ID.invalidPane !== this.#activePaneObjId ) {
			this.#panes.get ( this.#activePaneObjId ).remove ( );
			this.#paneDataDiv.textContent = '';
		}
	}

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	creates the data panes on the user interface
	@param {HTMLElement} uiMainDiv The HTML element in witch the different elements of the UI have to be created
	*/

	createUI ( uiMainDiv ) {
		if ( this.#paneDataDiv ) {
			return;
		}
		let headerDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-FlexRowDiv'
			},
			uiMainDiv
		);

		this.#paneControlDiv = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-PanesManagerUI-PaneControlsDiv'
			},
			uiMainDiv
		);

		this.#paneDataDiv = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-PanesManagerUI-PaneDataDiv'
			},
			uiMainDiv
		);
		this.#paneDataDiv.addEventListener ( 'wheel', PaneDataDivEventListeners.onWheel, false );
		this.#panes.forEach (
			pane => {
				theHTMLElementsFactory.create (
					'div',
					{
						textContent : pane.getButtonText ( ),
						className : 'TravelNotes-PanesManagerUI-PaneButton',
						objId : pane.getId ( )
					},
					headerDiv
				).addEventListener ( 'click', PaneButtonsEventListeners.onClick, false );
				pane.setPaneDivs ( this.#paneDataDiv, this.#paneControlDiv );
			}
		);
	}

	/**
	add a pane to the PanesManagerUI
	@param {PaneUI} paneUI The pane to add
	*/

	addPane ( paneUI ) {
		this.#panes.set ( paneUI.getId ( ), paneUI );
	}

	/**
	show a pane to the PanesManagerUI
	@param {string|number} pane id of the pane to be displayed
	*/

	showPane ( objId ) {
		this.#removeActivePane ( );
		this.#activePaneObjId = objId;
		this.#panes.get ( this.#activePaneObjId ).add ( );
		document.querySelectorAll ( '.TravelNotes-PanesManagerUI-PaneButton' ).forEach (
			paneButton => {
				if ( paneButton.objId === this.#activePaneObjId ) {
					paneButton.classList.add ( 'TravelNotes-PanesManagerUI-ActivePaneButton' );
				}
				else {
					paneButton.classList.remove ( 'TravelNotes-PanesManagerUI-ActivePaneButton' );
				}
			}
		);
	}

	/**
	Update a pane ( = show the pane only if the pane is the active pane )
	@param {string|number} pane id of the pane to be displayed
	*/

	updatePane ( objId ) {
		if ( objId === this.#activePaneObjId ) {
			this.showPane ( objId );
		}
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@desc The one and only one instance of PanesManagerUI class
@type {PanesManagerUI}
@constant
@global

@------------------------------------------------------------------------------------------------------------------------------
*/

const thePanesManagerUI = new PanesManagerUI ( );

export default thePanesManagerUI;

/*
--- End of dataPanesUI.js file ------------------------------------------------------------------------------------------------
*/