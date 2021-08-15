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
Doc reviewed ...
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file OsmSearchToolbarUI.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module OsmSearchToolbarUI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import theOsmSearchEngine from '../core/OsmSearchEngine.js';
import theTranslator from '../UI/Translator.js';
import theEventDispatcher from '../util/EventDispatcher.js';
import theTravelNotesData from '../data/TravelNotesData.js';

import { ZERO } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class OsmSearchToolbarUI
@classdesc This class build the search toolbar and contains also the event listeners for the toolbar
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

class OsmSearchToolbarUI {

	/**
	A reference to the OsmSearchTreeUI object
	*/

	static osmSearchTreeUI = null;

	static osmSearchWaitUI = null;

	/**
	A reference to the toolbar htmlElement
	*/

	#toolbarHTMLElement = null;

	/**
	click event listener for the search button
	*/

	static onSearchClick ( ) {

		theOsmSearchEngine.dictionary.isExpanded = false;
		OsmSearchToolbarUI.osmSearchTreeUI.redraw ( );
		theTravelNotesData.searchData.length = ZERO;
		theEventDispatcher.dispatch ( 'showsearch' );

		OsmSearchToolbarUI.osmSearchWaitUI.showWait ( );

		theOsmSearchEngine.search ( );

		// Notice: theOsmSearchEngine send a 'showsearch' event when the search is succesfully done
	}

	/**
	click event listener for the expand button
	*/

	static onExpandButtonClick ( ) {
		OsmSearchToolbarUI.osmSearchTreeUI.expandSearchTree ( theOsmSearchEngine.dictionary );
		OsmSearchToolbarUI.osmSearchTreeUI.redraw ( );
	}

	/**
	click event listener for the collapse button
	*/

	static onCollapseButtonClick ( ) {
		OsmSearchToolbarUI.osmSearchTreeUI.collapseSearchTree ( theOsmSearchEngine.dictionary );
		OsmSearchToolbarUI.osmSearchTreeUI.redraw ( );
	}

	/**
	click event listener for the clear button
	*/

	static onClearButtonClick ( ) {
		OsmSearchToolbarUI.osmSearchTreeUI.clearSearchTree ( theOsmSearchEngine.dictionary );
		OsmSearchToolbarUI.osmSearchTreeUI.redraw ( );
	}

	constructor ( ) {

		this.#toolbarHTMLElement = theHTMLElementsFactory.create (
			'div'
		);
		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-Button',
				title : theTranslator.getText ( 'OsmSearchPaneUI - Search OpenStreetMap' ),
				textContent : '🔎'
			},
			this.#toolbarHTMLElement
		)
			.addEventListener ( 'click', OsmSearchToolbarUI.onSearchClick, false );

		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-Button',
				title : theTranslator.getText ( 'OsmSearchPaneUI - Expand tree' ),
				textContent : '▼'
			},
			this.#toolbarHTMLElement
		)
			.addEventListener ( 'click', OsmSearchToolbarUI.onExpandButtonClick, false );

		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-Button',
				title : theTranslator.getText ( 'OsmSearchPaneUI - Collapse tree' ),
				textContent : '▶'
			},
			this.#toolbarHTMLElement
		)
			.addEventListener ( 'click', OsmSearchToolbarUI.onCollapseButtonClick, false );
		theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-OsmSearchPaneUI-ClearAllButton',
				className : 'TravelNotes-UI-Button',
				title : theTranslator.getText ( 'OsmSearchPaneUI - Clear tree' ),
				textContent : '❌'
			},
			this.#toolbarHTMLElement
		)
			.addEventListener ( 'click', OsmSearchToolbarUI.onClearButtonClick, false );

	}

	/**
	toolbar htmlElement getter
	*/

	get toolbarHTMLElement ( ) { return this.#toolbarHTMLElement; }

}

export default OsmSearchToolbarUI;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of OsmSearchToolbarUI.js file

@------------------------------------------------------------------------------------------------------------------------------
*/