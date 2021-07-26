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
Doc reviewed 20200818
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
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import theOsmSearchEngine from '../core/OsmSearchEngine.js';
import OsmSearchPaneDataManager from '../UI/OsmSearchPaneDataManager.js';
import { PANE_ID, ZERO, MOUSE_WHEEL_FACTORS } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewSearchPaneUI
@desc constructor for OsmSearchPaneUI objects
@return {OsmSearchPaneUI} an instance of OsmSearchPaneUI object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewOsmSearchPaneUI ( ) {
	let mySearchToolbar = null;
	let myWaitDiv = null;
	let mySearchTreeDiv = null;
	let myDeepTree = 0;

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myAddWait
	@desc show a wait animation
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

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

	/**
	@--------------------------------------------------------------------------------------------------------------------------
	@function mySelectItem
	@desc changes the isSelected property of an item in the tree dictionary and do the same for all descendants
	@private
	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function mySelectItem ( item, isSelected ) {
		item.isSelected = isSelected;
		item.items.forEach (
			subItem => {
				mySelectItem ( subItem, isSelected );
			}
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------
	@function myAddItem
	@desc add a dictionary item in the SearchTreeDiv and do the same for all descendants
	@private
	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myAddItem ( item ) {

		function myOnItemCheckboxChange ( changeEvent ) {
			mySelectItem ( changeEvent.target.parentNode.dictItem, changeEvent.target.checked );
			mySearchTreeDiv.textContent = '';
			myAddItem ( theOsmSearchEngine.dictionary );
		}

		function myOnItemArrowClick ( clickEvent ) {
			clickEvent.target.parentNode.dictItem.isExpanded = ! clickEvent.target.parentNode.dictItem.isExpanded;
			mySearchTreeDiv.textContent = '';
			myAddItem ( theOsmSearchEngine.dictionary );
		}

		myDeepTree ++;
		let itemDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-OsmSearchPaneUI-SearchItem ' +
					'TravelNotes-OsmSearchPaneUI-SearchItemMargin' + myDeepTree,
				dictItem : item
			},
			mySearchTreeDiv
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
			itemCheckbox.addEventListener ( 'change', myOnItemCheckboxChange, false );
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
			itemArrow.addEventListener ( 'click', myOnItemArrowClick, false );
		}
		theHTMLElementsFactory.create (
			'text',
			{
				value : item.name
			},
			itemDiv
		);
		if ( item.isExpanded ) {
			item.items.forEach ( myAddItem );
		}
		myDeepTree --;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myStartSearch
	@desc start the search, collapsing the search tree div and showing a wait animation
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myStartSearch ( ) {

		// tmp moved myClearPaneDataDiv ( );
		theOsmSearchEngine.dictionary.isExpanded = false;
		mySearchTreeDiv.textContent = '';
		myAddItem ( theOsmSearchEngine.dictionary );

		// tmp moved myAddWait ( );
		theOsmSearchEngine.search ( );

		// Notice: theOsmSearchEngine send a 'showsearch' event when the search is succesfully done
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myClearSearchTree
	@desc unselect an item in the search tree and do the same for alldescendants
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myClearSearchTree ( item ) {
		item.items.forEach ( myClearSearchTree );
		item.isSelected = false;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnClearButtonClick
	@desc click event listener for the clear button
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnClearButtonClick ( ) {
		myClearSearchTree ( theOsmSearchEngine.dictionary );
		mySearchTreeDiv.textContent = '';
		myAddItem ( theOsmSearchEngine.dictionary );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myExpandSearchTree
	@desc Expand an item in the search tree and do the same for all descendants
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myExpandSearchTree ( item ) {
		item.items.forEach ( myExpandSearchTree );
		item.isExpanded = true;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnExpandButtonClick
	@desc click event listener for the expand tree button
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnExpandButtonClick ( ) {
		myExpandSearchTree ( theOsmSearchEngine.dictionary );
		mySearchTreeDiv.textContent = '';
		myAddItem ( theOsmSearchEngine.dictionary );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCollapseSearchTree
	@desc Collapse an item in the tree, except the root item, and do the same for all descendants
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCollapseSearchTree ( item ) {
		item.items.forEach ( myCollapseSearchTree );
		if ( ! item.isRoot ) {
			item.isExpanded = false;
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnExpandButtonClick
	@desc click event listener for the collapse button
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnCollapseButtonClick ( ) {
		myCollapseSearchTree ( theOsmSearchEngine.dictionary );
		mySearchTreeDiv.textContent = '';
		myAddItem ( theOsmSearchEngine.dictionary );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnSearchTreeWheel
	@desc Wheel event listener for the search tree div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnSearchTreeWheel ( wheelEvent ) {
		if ( wheelEvent.deltaY ) {
			wheelEvent.target.scrollTop +=
				wheelEvent.deltaY * MOUSE_WHEEL_FACTORS [ wheelEvent.deltaMode ];
		}
		wheelEvent.stopPropagation ( );
	}

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

		#osmSearchPaneDataManager = new OsmSearchPaneDataManager ( );

		/**
		Create the controls div
		@private
		*/

		#addControls ( ) {
			mySearchToolbar = theHTMLElementsFactory.create (
				'div',
				null,
				this.paneControlDiv
			);
			theHTMLElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-UI-Button',
					title : theTranslator.getText ( 'OsmSearchPaneUI - Search OpenStreetMap' ),
					textContent : '🔎'
				},
				mySearchToolbar
			)
				.addEventListener ( 'click', myStartSearch, false );

			theHTMLElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-UI-Button',
					title : theTranslator.getText ( 'OsmSearchPaneUI - Expand tree' ),
					textContent : '▼'
				},
				mySearchToolbar
			)
				.addEventListener ( 'click', myOnExpandButtonClick, false );

			theHTMLElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-UI-Button',
					title : theTranslator.getText ( 'OsmSearchPaneUI - Collapse tree' ),
					textContent : '▶'
				},
				mySearchToolbar
			)
				.addEventListener ( 'click', myOnCollapseButtonClick, false );
			theHTMLElementsFactory.create (
				'div',
				{
					id : 'TravelNotes-OsmSearchPaneUI-ClearAllButton',
					className : 'TravelNotes-UI-Button',
					title : theTranslator.getText ( 'OsmSearchPaneUI - Clear tree' ),
					textContent : '❌'
				},
				mySearchToolbar
			)
				.addEventListener ( 'click', myOnClearButtonClick, false );
			mySearchTreeDiv = theHTMLElementsFactory.create (
				'div',
				{
					id : 'TravelNotes-OsmSearchPaneUI-SearchTree'
				},
				this.paneControlDiv
			);
			mySearchTreeDiv.addEventListener ( 'wheel', myOnSearchTreeWheel, false );

			// theOsmSearchEngine.dictionary.name = theTranslator.getText ( 'OsmSearchPaneUI - dictionary name' );
			theOsmSearchEngine.dictionary.name = '';
			myAddItem ( theOsmSearchEngine.dictionary );
		}

		/**
		Create the pane data div content
		@private
		*/

		#addData ( ) {
			this.#osmSearchPaneDataManager.addData ( this.paneDataDiv );
		}

		/**
		Clear the pane control div
		@private
		*/

		#clearPaneControlDiv ( ) {
			if ( mySearchTreeDiv ) {
				this.paneControlDiv.removeChild ( mySearchTreeDiv );
				mySearchTreeDiv = null;
			}
			if ( mySearchToolbar ) {
				this.paneControlDiv.removeChild ( mySearchToolbar );
			}
			if ( myWaitDiv ) {
				this.paneControlDiv.removeChild ( myWaitDiv );
				myWaitDiv = null;
			}
		}

		/**
		Remove all search results from the pane data div
		@private
		*/

		#clearPaneDataDiv ( ) {
			this.#osmSearchPaneDataManager.clearData ( this.paneDataDiv );
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

			// theEventDispatcher.dispatch ( 'removeobject', { objId : mySearchResultMarkerObjId } );
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

	return new OsmSearchPaneUI ( );
}

export { ourNewOsmSearchPaneUI as newOsmSearchPaneUI };

/*
--- End of OsmSearchPaneUI.js file ---------------------------------------------------------------------------------------
*/