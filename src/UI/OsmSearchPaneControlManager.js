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
Doc reviewed 20210726
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file OsmSearchPaneControlManager.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module OsmSearchPaneControlManager
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theTranslator from '../UI/Translator.js';
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import theOsmSearchEngine from '../core/OsmSearchEngine.js';
import theEventDispatcher from '../util/EventDispatcher.js';
import theTravelNotesData from '../data/TravelNotesData.js';

import { ZERO, MOUSE_WHEEL_FACTORS } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class OsmSearchTreeEventListeners
@classdesc This class contains the event listeners for the tree
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

class OsmSearchTreeEventListeners {

	/**
	A reference to the OsmSearchTree object
	*/

	static osmSearchTree = null;

	/**
	Helper function to select or unselected all the items childrens of a given item
	*/

	static selectItem ( item, isSelected ) {
		item.isSelected = isSelected;
		item.items.forEach (
			subItem => { OsmSearchTreeEventListeners.selectItem ( subItem, isSelected ); }
		);
	}

	/**
	change event listener for the tree checkboxes
	*/

	static onCheckboxChange ( changeEvent ) {
		OsmSearchTreeEventListeners.selectItem ( changeEvent.target.parentNode.dictItem, changeEvent.target.checked );
		OsmSearchTreeEventListeners.osmSearchTree.redraw ( );
	}

	/**
	wheel event listener for the tree
	*/

	static onWheel ( wheelEvent ) {
		if ( wheelEvent.deltaY ) {
			wheelEvent.target.scrollTop +=
				wheelEvent.deltaY * MOUSE_WHEEL_FACTORS [ wheelEvent.deltaMode ];
		}
		wheelEvent.stopPropagation ( );
	}

	/**
	click event listener for tree arrows
	*/

	static onArrowClick ( clickEvent ) {
		clickEvent.target.parentNode.dictItem.isExpanded = ! clickEvent.target.parentNode.dictItem.isExpanded;
		OsmSearchTreeEventListeners.osmSearchTree.redraw ( );
	}

}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class OsmSearchToolbar
@classdesc This class build the search toolbar and contains also the event listeners for the toolbar
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

class OsmSearchToolbar {

	/**
	A reference to the OsmSearchTree object
	*/

	static osmSearchTree = null;

	/**
	A reference to the toolbar htmlElement
	*/

	#toolbarHTMLElement = null;

	/**
	click event listener for the search button
	*/

	static onSearchClick ( ) {

		// tmp moved myClearPaneDataDiv ( );
		theOsmSearchEngine.dictionary.isExpanded = false;
		OsmSearchToolbar.osmSearchTree.redraw ( );
		theTravelNotesData.searchData.length = ZERO;
		theEventDispatcher.dispatch ( 'showsearch' );

		// tmp moved myAddWait ( );
		theOsmSearchEngine.search ( );

		// Notice: theOsmSearchEngine send a 'showsearch' event when the search is succesfully done
	}

	/**
	click event listener for the expand button
	*/

	static onExpandButtonClick ( ) {
		OsmSearchToolbar.osmSearchTree.expandSearchTree ( theOsmSearchEngine.dictionary );
		OsmSearchToolbar.osmSearchTree.redraw ( );
	}

	/**
	click event listener for the collapse button
	*/

	static onCollapseButtonClick ( ) {
		OsmSearchToolbar.osmSearchTree.collapseSearchTree ( theOsmSearchEngine.dictionary );
		OsmSearchToolbar.osmSearchTree.redraw ( );
	}

	/**
	click event listener for the clear button
	*/

	static onClearButtonClick ( ) {
		OsmSearchToolbar.osmSearchTree.clearSearchTree ( theOsmSearchEngine.dictionary );
		OsmSearchToolbar.osmSearchTree.redraw ( );
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
			.addEventListener ( 'click', OsmSearchToolbar.onSearchClick, false );

		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-Button',
				title : theTranslator.getText ( 'OsmSearchPaneUI - Expand tree' ),
				textContent : '▼'
			},
			this.#toolbarHTMLElement
		)
			.addEventListener ( 'click', OsmSearchToolbar.onExpandButtonClick, false );

		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-Button',
				title : theTranslator.getText ( 'OsmSearchPaneUI - Collapse tree' ),
				textContent : '▶'
			},
			this.#toolbarHTMLElement
		)
			.addEventListener ( 'click', OsmSearchToolbar.onCollapseButtonClick, false );
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
			.addEventListener ( 'click', OsmSearchToolbar.onClearButtonClick, false );

	}

	/**
	toolbar htmlElement getter
	*/

	get toolbarHTMLElement ( ) { return this.#toolbarHTMLElement; }

}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class OsmSearchTree
@classdesc This class build the search tree and contains also methods to modify this tree
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

class OsmSearchTree {

	/**
	A reference to the tree HTMLElementsFactory
	*/

	#treeHTMLElement = null;

	/**
	Recursivity counter for the #addItem method
	*/

	#deepTree = ZERO;

	/**
	Add a dictionary item in the SearchTree and do the same for all descendants
	@private
	*/

	#addItem ( item ) {

		this.#deepTree ++;
		let itemDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-OsmSearchPaneUI-SearchItem ' +
					'TravelNotes-OsmSearchPaneUI-SearchItemMargin' + this.#deepTree,
				dictItem : item
			},
			this.#treeHTMLElement
		);
		if ( ! item.isRoot ) {
			let itemCheckbox = theHTMLElementsFactory.create (
				'input',
				{
					type : 'checkbox',
					checked : item.isSelected
				},
				itemDiv
			);
			itemCheckbox.addEventListener ( 'change', OsmSearchTreeEventListeners.onCheckboxChange, false );
		}
		if ( ZERO === item.filterTagsArray.length ) {
			let itemArrow = theHTMLElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-UI-Button TravelNotes-OsmSearchPaneUI-TreeArrow',
					textContent : item.isExpanded ? '▼' : '▶'
				},
				itemDiv
			);
			itemArrow.addEventListener ( 'click', OsmSearchTreeEventListeners.onArrowClick, false );
		}
		theHTMLElementsFactory.create (
			'text',
			{
				value : item.name
			},
			itemDiv
		);
		if ( item.isExpanded ) {
			item.items.forEach ( tmpItem => this.#addItem ( tmpItem ) );
		}
		this.#deepTree --;
	}

	constructor ( ) {
		this.#treeHTMLElement = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-OsmSearchPaneUI-SearchTree'
			}
		);
		this.#treeHTMLElement.addEventListener ( 'wheel', OsmSearchTreeEventListeners.onWheel, false );

		// theOsmSearchEngine.dictionary.name = theTranslator.getText ( 'OsmSearchPaneUI - dictionary name' );
		theOsmSearchEngine.dictionary.name = '';
		this.#addItem ( theOsmSearchEngine.dictionary );

		OsmSearchToolbar.osmSearchTree = this;
		OsmSearchTreeEventListeners.osmSearchTree = this;
	}

	/**
	rebuild completely the #treeHTMLElement
	*/

	redraw ( ) {

		// theOsmSearchEngine.dictionary.isExpanded = false;
		this.#treeHTMLElement.textContent = '';
		this.#addItem ( theOsmSearchEngine.dictionary );
	}

	/**
	Expand the complete tree
	*/

	expandSearchTree ( item ) {
		item.items.forEach (
			tmpItem => { this.expandSearchTree ( tmpItem ); }
		);
		item.isExpanded = true;
	}

	/**
	Collapse the complete tree
	*/

	collapseSearchTree ( item ) {
		item.items.forEach (
			tmpItem => { this.collapseSearchTree ( tmpItem ); }
		);
		if ( ! item.isRoot ) {
			item.isExpanded = false;
		}
	}

	/**
	Unselect all the items in the tree
	*/

	clearSearchTree ( item ) {
		item.items.forEach (
			tmpItem => { this.clearSearchTree ( tmpItem ); }
		);
		item.isSelected = false;
	}

	get treeHTMLElement ( ) { return this.#treeHTMLElement; }
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class OsmSearchPaneControlManager
@classdesc This class add or remove the search toolbar and search tree on the pane control
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class OsmSearchPaneControlManager {

	/**
	A reference to the OsmSearchTree object
	*/

	#osmSearchTree = null;

	/**
	A reference to the OsmSearchToolbar object
	*/

	#osmSearchToolbar = null;

	constructor ( ) {
		this.#osmSearchToolbar = new OsmSearchToolbar ( );
		this.#osmSearchTree = new OsmSearchTree ( );
	}

	/**
	Add the treeHTMLElement to the paneControl
	*/

	addTree ( paneControl ) {
		paneControl.appendChild ( this.#osmSearchTree.treeHTMLElement );
	}

	/**
	Remove thetreeHTMLElement from the paneControl
	*/

	removeTree ( paneControl ) {
		paneControl.removeChild ( this.#osmSearchTree.treeHTMLElement );
	}

	/**
	Add the toolbarHTMLElement to the paneControl
	*/

	addToolbar ( paneControl ) {
		paneControl.appendChild ( this.#osmSearchToolbar.toolbarHTMLElement );
	}

	/**
	remove the toolbarHTMLElement from the paneControl
	*/

	removeToolbar ( paneControl ) {
		paneControl.removeChild ( this.#osmSearchToolbar.toolbarHTMLElement );
	}
}

export default OsmSearchPaneControlManager;

/*
--- End of OsmSearchPaneControlManager.js file --------------------------------------------------------------------------------
*/