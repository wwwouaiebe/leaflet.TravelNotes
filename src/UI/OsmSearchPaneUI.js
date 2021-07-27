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
	- v1.13.0:
		- Issue ♯125 : Outphase osmSearch and add it to TravelNotes
		- Issue ♯126 : Add a command "select as start/end/intermediate point" in the osmSearch context menu
		- Issue ♯128 : Unify osmSearch and notes icons and data
	- v2.0.0:
		- Issue ♯135 : Remove innerHTML from code
		- Issue ♯138 : Protect the app - control html entries done by user.
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210726
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file OsmSearchPaneUI.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module OsmSearchPaneUI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import PaneUI from '../UI/PaneUI.js';
import theTranslator from '../UI/Translator.js';
import theOsmSearchEngine from '../core/OsmSearchEngine.js';
import OsmSearchDataUI from '../UI/OsmSearchDataUI.js';
import OsmSearchControlUI from '../UI/OsmSearchControlUI.js';

import { PANE_ID } from '../util/Constants.js';

/**
@--------------------------------------------------------------------------------------------------------------------------

@function myAddWait
@desc show a wait animation
@private

@--------------------------------------------------------------------------------------------------------------------------
*/
/*
function myAddWait ( ) {
	myWaitDiv = theHTMLElementsFactory.create (
		'div',
		{ className : 'TravelNotes-WaitAnimation' },
		this.paneControlDiv
	);
	theHTMLElementsFactory.create (
		'div',
		{
			className : 'TravelNotes-WaitAnimationBullet'
		},
		myWaitDiv
	);
}
*/

/**
@--------------------------------------------------------------------------------------------------------------------------

@class OsmSearchPaneUI
@classdesc This class manages the search pane UI
@see {@link newOsmSearchPaneUI} for constructor
@see {@link PanesManagerUI} for pane UI management
@implements {PaneUI}
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class OsmSearchPaneUI extends PaneUI {

	#osmSearchDataUI = new OsmSearchDataUI ( );
	#osmSearchControlUI = new OsmSearchControlUI ( );

	/**
	Create the controls div
	@private
	*/

	#addControls ( ) {
		this.#osmSearchControlUI.addControl ( this.paneControlDiv );
	}

	/**
	Create the pane data div content
	@private
	*/

	#addData ( ) {
		this.#osmSearchDataUI.addData ( this.paneDataDiv );
	}

	/**
	Clear the pane control div
	@private
	*/

	#clearPaneControlDiv ( ) {
		this.#osmSearchControlUI.clearControl ( this.paneControlDiv );
	}

	/**
	Remove all search results from the pane data div
	@private
	*/

	#clearPaneDataDiv ( ) {
		this.#osmSearchDataUI.clearData ( this.paneDataDiv );
	}

	constructor ( ) {
		super ( );
		Object.seal ( this );
	}

	/**
	This function removes all the elements from the data div and control div
	*/

	remove ( ) {
		theOsmSearchEngine.hide ( );
		this.#clearPaneDataDiv ( );
		this.#clearPaneControlDiv ( );
	}

	/**
	This function add the search data to the data div and controls to the controls div
	*/

	add ( ) {
		theOsmSearchEngine.show ( );
		this.#addControls ( );
		this.#addData ( );
	}

	/**
	This function returns the pane id
	*/

	getId ( ) { return PANE_ID.searchPane; }

	/**
	This function returns the text to add in the pane button
	*/

	getButtonText ( ) { return theTranslator.getText ( 'PanesManagerUI - Search' ); }

}

export default OsmSearchPaneUI;

/*
--- End of OsmSearchPaneUI.js file ---------------------------------------------------------------------------------------
*/