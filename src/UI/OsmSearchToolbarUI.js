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
Doc reviewed 20210825
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
import theOsmSearchDictionary from '../core/OsmSearchDictionary.js';
import theTranslator from '../UI/Translator.js';
import theEventDispatcher from '../util/EventDispatcher.js';
import theTravelNotesData from '../data/TravelNotesData.js';

import { ZERO } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class ClickSearchButtonEventListener
@classdesc click event listener for the search button
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

class ClickSearchButtonEventListener {

	#osmSearchTreeUI = null;
	#osmSearchWaitUI = null;

	constructor ( osmSearchTreeUI, osmSearchWaitUI ) {
		this.#osmSearchTreeUI = osmSearchTreeUI;
		this.#osmSearchWaitUI = osmSearchWaitUI;
	}

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		theOsmSearchDictionary.dictionary.isExpanded = false;
		this.#osmSearchTreeUI.redraw ( );
		theTravelNotesData.searchData.length = ZERO;
		theEventDispatcher.dispatch ( 'showsearch' );
		this.#osmSearchWaitUI.showWait ( );
		theOsmSearchEngine.search ( );

		// Notice: theOsmSearchEngine send a 'showsearch' event when the search is succesfully done
	}

}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class ClickExpandButtonEventListener
@classdesc click event listener for the expand tree button
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

class ClickExpandButtonEventListener {

	#osmSearchTreeUI = null;

	constructor ( osmSearchTreeUI ) {
		this.#osmSearchTreeUI = osmSearchTreeUI;
	}

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		theOsmSearchDictionary.expandBranch ( theOsmSearchDictionary.dictionary );
		this.#osmSearchTreeUI.redraw ( );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class ClickCollapseButtonEventListener
@classdesc click event listener for the collapse tree button
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

class ClickCollapseButtonEventListener {

	#osmSearchTreeUI = null;

	constructor ( osmSearchTreeUI ) {
		this.#osmSearchTreeUI = osmSearchTreeUI;
	}

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		theOsmSearchDictionary.collapseBranch ( theOsmSearchDictionary.dictionary );
		this.#osmSearchTreeUI.redraw ( );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class ClickClearButtonEventListener
@classdesc click event listener for the clear tree button
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

class ClickClearButtonEventListener {

	#osmSearchTreeUI = null;

	constructor ( osmSearchTreeUI ) {
		this.#osmSearchTreeUI = osmSearchTreeUI;
	}

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		theOsmSearchDictionary.clearBranch ( theOsmSearchDictionary.dictionary );
		this.#osmSearchTreeUI.redraw ( );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class OsmSearchToolbarUI
@classdesc This class build the search toolbar and contains also the event listeners for the toolbar
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

class OsmSearchToolbarUI {

	#toolbarHTMLElement = null;

	constructor ( osmSearchTreeUI, osmSearchWaitUI ) {

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
			.addEventListener ( 'click', new ClickSearchButtonEventListener ( osmSearchTreeUI, osmSearchWaitUI ), false );

		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-Button',
				title : theTranslator.getText ( 'OsmSearchPaneUI - Expand tree' ),
				textContent : '▼'
			},
			this.#toolbarHTMLElement
		)
			.addEventListener ( 'click', new ClickExpandButtonEventListener ( osmSearchTreeUI ), false );

		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-Button',
				title : theTranslator.getText ( 'OsmSearchPaneUI - Collapse tree' ),
				textContent : '▶'
			},
			this.#toolbarHTMLElement
		)
			.addEventListener ( 'click', new ClickCollapseButtonEventListener ( osmSearchTreeUI ), false );

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
			.addEventListener ( 'click', new ClickClearButtonEventListener ( osmSearchTreeUI ), false );

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