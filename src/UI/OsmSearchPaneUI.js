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

import { theTranslator } from '../UI/Translator.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import { theHTMLSanitizer } from '../util/HTMLSanitizer.js';
import ObjId from '../data/ObjId.js';
import theOsmSearchEngine from '../core/OsmSearchEngine.js';
import theEventDispatcher from '../util/EventDispatcher.js';
import { newOsmSearchContextMenu } from '../contextMenus/OsmSearchContextMenu.js';
import { theNoteDialogToolbar } from '../dialogs/NoteDialogToolbar.js';
import { LAT_LNG, PANE_ID, ZERO, MOUSE_WHEEL_FACTORS, INVALID_OBJ_ID } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewSearchPaneUI
@desc constructor for OsmSearchPaneUI objects
@return {OsmSearchPaneUI} an instance of OsmSearchPaneUI object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewOsmSearchPaneUI ( ) {
	let myPaneDataDiv = null;
	let myPaneControlDiv = null;
	let mySearchToolbar = null;
	let myWaitDiv = null;
	let mySearchTreeDiv = null;
	let	mySearchResultMarkerObjId = INVALID_OBJ_ID;
	let myDeepTree = 0;

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnSearchResultContextMenu
	@desc context menu event listener for the search result
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnSearchResultContextMenu ( contextMenuEvent ) {
		contextMenuEvent.stopPropagation ( );
		contextMenuEvent.preventDefault ( );
		let searchResultDiv = contextMenuEvent.target;
		while ( ! searchResultDiv.osmElement ) {
			searchResultDiv = searchResultDiv.parentNode;
		}
		contextMenuEvent.latlng = { lat : LAT_LNG.defaultValue, lng : LAT_LNG.defaultValue };
		contextMenuEvent.fromUI = true;
		contextMenuEvent.originalEvent =
			{
				clientX : contextMenuEvent.clientX,
				clientY : contextMenuEvent.clientY,
				latLng : [ searchResultDiv.osmElement.lat, searchResultDiv.osmElement.lon ],
				osmElement : searchResultDiv.osmElement,
				geometry : searchResultDiv.osmElement.geometry
			};
		newOsmSearchContextMenu ( contextMenuEvent, myPaneDataDiv ).show ( );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnSearchResultMouseEnter
	@desc mouse enter event listener for the search result
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnSearchResultMouseEnter ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		mySearchResultMarkerObjId = mouseEvent.target.objId;
		theEventDispatcher.dispatch (
			'addsearchpointmarker',
			{
				objId : mouseEvent.target.objId,
				latLng : [ mouseEvent.target.osmElement.lat, mouseEvent.target.osmElement.lon ],
				geometry : mouseEvent.target.osmElement.geometry
			}
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnSearchResultMouseLeave
	@desc mouse leave event listener for the search result
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnSearchResultMouseLeave ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		theEventDispatcher.dispatch ( 'removeobject', { objId : mouseEvent.target.objId } );
	}

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
			myPaneControlDiv
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

	@function myClearPaneDataDiv
	@desc Remove all search results from the pane data div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myClearPaneDataDiv ( ) {
		let searchResultsDivs = document.querySelectorAll ( '.TravelNotes-OsmSearchPaneUI-SearchResult' );
		searchResultsDivs.forEach (
			searchResultDiv => {
				searchResultDiv.removeEventListener ( 'contextmenu', myOnSearchResultContextMenu, false );
				searchResultDiv.removeEventListener ( 'mouseenter', myOnSearchResultMouseEnter, false );
				searchResultDiv.removeEventListener ( 'mouseleave', myOnSearchResultMouseLeave, false );
				myPaneDataDiv.removeChild ( searchResultDiv );
			}
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
		myClearPaneDataDiv ( );
		theOsmSearchEngine.dictionary.isExpanded = false;
		mySearchTreeDiv.textContent = '';
		myAddItem ( theOsmSearchEngine.dictionary );
		myAddWait ( );
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

	@function myClearPaneControlDiv
	@desc Clear the pane control div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myClearPaneControlDiv ( ) {
		if ( mySearchTreeDiv ) {
			myPaneControlDiv.removeChild ( mySearchTreeDiv );
			mySearchTreeDiv = null;
		}
		if ( mySearchToolbar ) {
			myPaneControlDiv.removeChild ( mySearchToolbar );
		}
		if ( myWaitDiv ) {
			myPaneControlDiv.removeChild ( myWaitDiv );
			myWaitDiv = null;
		}
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

	@function myAddControls
	@desc Create the controls div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myAddControls ( ) {
		mySearchToolbar = theHTMLElementsFactory.create (
			'div',
			null,
			myPaneControlDiv
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
			myPaneControlDiv
		);
		mySearchTreeDiv.addEventListener ( 'wheel', myOnSearchTreeWheel, false );

		// theOsmSearchEngine.dictionary.name = theTranslator.getText ( 'OsmSearchPaneUI - dictionary name' );
		theOsmSearchEngine.dictionary.name = '';
		myAddItem ( theOsmSearchEngine.dictionary );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myAddHTMLParagraphElement
	@desc Add a HTMLParagraphElement as child of another html element and add a Text to
	this  HTMLParagraphElement
	@param {HTMLElement} parentElement The parent HTML element
	@param {string} paragraphText The text to add in the HTMLParagraphElement
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myAddHTMLParagraphElement ( parentElement, paragraphText ) {
		if ( paragraphText ) {
			theHTMLElementsFactory.create (
				'div',
				{
					textContent : paragraphText
				},
				parentElement
			);
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myAddHTMLParagraphElement
	@desc Concat the house number, strret, post code and city name in one string
	@param {Object} osmElement The osm element
	@return {?string} the address or null if nothing found
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myGetAddress ( osmElement ) {
		let street =
			osmElement.tags [ 'addr:street' ]
				?
				( osmElement.tags [ 'addr:housenumber' ] ? osmElement.tags [ 'addr:housenumber' ] + ' ' : '' ) +
					osmElement.tags [ 'addr:street' ] + ' '
				:
				'';
		let city =
			osmElement.tags [ 'addr:city' ]
				?
				( osmElement.tags [ 'addr:postcode' ] ? ( osmElement.tags [ 'addr:postcode' ] + ' ' ) : '' ) +
				osmElement.tags [ 'addr:city' ]
				:
				'';
		let address = street + city;
		return '' === address ? null : address;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myAddSearchResultDiv
	@desc Create a <div> and  <p> elements with the tags found in the osmElement and add this
	<div> to to search <div>
	@param {Object} osmElement
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myAddSearchResultDiv ( osmElement ) {
		let searchResultDiv = theHTMLElementsFactory.create (
			'div',
			{
				className :	'TravelNotes-OsmSearchPaneUI-SearchResult-Row',
				osmElement : osmElement,
				objId : ObjId.nextObjId
			},
			myPaneDataDiv
		);
		let iconContent = '';
		if ( osmElement.tags.rcn_ref ) {
			iconContent =
				'<div class=\'TravelNotes-MapNote TravelNotes-MapNoteCategory-0073\'>' +
				'<svg viewBox=\'0 0 20 20\'><text class=\'\' x=10 y=14>' +
				osmElement.tags.rcn_ref +
				'</text></svg></div>';
		}
		else {
			iconContent = theNoteDialogToolbar.getIconDataFromName ( osmElement.description ) || '';
		}
		let iconCell = theHTMLElementsFactory.create (
			'div',
			{
				className :	'TravelNotes-OsmSearchPaneUI-SearchResult-IconCell'
			},
			searchResultDiv
		);
		theHTMLSanitizer.sanitizeToHtmlElement ( iconContent, iconCell );

		let searchResultCell = theHTMLElementsFactory.create (
			'div',
			{
				className :	'TravelNotes-OsmSearchPaneUI-SearchResult-Cell'
			},
			searchResultDiv
		);

		myAddHTMLParagraphElement ( searchResultCell, osmElement.description );
		myAddHTMLParagraphElement ( searchResultCell, osmElement.tags.name );
		myAddHTMLParagraphElement ( searchResultCell, osmElement.tags.rcn_ref );
		myAddHTMLParagraphElement ( searchResultCell, myGetAddress ( osmElement ) );
		if ( osmElement.tags.phone ) {
			myAddHTMLParagraphElement ( searchResultCell, '☎️ : ' + osmElement.tags.phone );
		}
		if ( osmElement.tags.email ) {
			theHTMLElementsFactory.create (
				'a',
				{
					href : 'mailto:' + osmElement.tags.email,
					textContent : osmElement.tags.email
				},
				theHTMLElementsFactory.create ( 'div', { textContent : '📧 : ' }, searchResultCell )
			);
		}
		if ( osmElement.tags.website ) {
			theHTMLElementsFactory.create (
				'a',
				{
					href : osmElement.tags.website,
					target : '_blank',
					textContent : osmElement.tags.website
				},
				theHTMLElementsFactory.create ( 'div', null, searchResultCell )
			);
		}
		searchResultDiv.title = '';
		for ( const [ KEY, VALUE ] of Object.entries ( osmElement.tags ) ) {
			searchResultDiv.title += KEY + '=' + VALUE + '\n';
		}
		searchResultDiv.addEventListener ( 'contextmenu', myOnSearchResultContextMenu, false );
		searchResultDiv.addEventListener ( 'mouseenter', myOnSearchResultMouseEnter, false );
		searchResultDiv.addEventListener ( 'mouseleave', myOnSearchResultMouseLeave, false );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myAddData
	@desc Create the pane data div content
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myAddData ( ) {
		theTravelNotesData.searchData.forEach ( myAddSearchResultDiv );
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

	class OsmSearchPaneUI {

		constructor ( ) {
			Object.freeze ( this );
		}

		/**
		This function removes all the elements from the data div and control div
		*/

		remove ( ) {
			theOsmSearchEngine.hide ( );
			myClearPaneDataDiv ( );
			myClearPaneControlDiv ( );
			theEventDispatcher.dispatch ( 'removeobject', { objId : mySearchResultMarkerObjId } );
		}

		/**
		This function add the search data to the data div and controls to the controls div
		*/

		add ( ) {
			theOsmSearchEngine.show ( );
			myAddControls ( );
			myAddData ( );
		}

		/**
		This function returns the pane id
		*/

		getId ( ) { return PANE_ID.searchPane; }

		/**
		This function returns the text to add in the pane button
		*/

		getButtonText ( ) { return theTranslator.getText ( 'PanesManagerUI - Search' ); }

		/**
		Set the pane data div and pane control div
		*/

		setPaneDivs ( paneDataDiv, paneControlDiv ) {
			myPaneDataDiv = paneDataDiv;
			myPaneControlDiv = paneControlDiv;
		}
	}

	return new OsmSearchPaneUI ( );
}

export { ourNewOsmSearchPaneUI as newOsmSearchPaneUI };

/*
--- End of OsmSearchPaneUI.js file ---------------------------------------------------------------------------------------
*/