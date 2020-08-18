/*
Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/

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
		- Issue #65 : Time to go to ES6 modules?
	- v1.12.0:
		- Issue #120 : Review the UserInterface
Doc reviewed 20200818
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file SearchPaneUI.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module SearchPaneUI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';

import { theHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { newObjId } from '../data/ObjId.js';
import { newOsmSearchEngine } from '../core/OsmSearchEngine.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';
import { newOsmSearchContextMenu } from '../contextMenus/OsmSearchContextMenu.js';

import { LAT_LNG, DATA_PANE_ID } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewSearchPaneUI
@desc constructor for SearchPaneUI objects
@return {SearchPaneUI} an instance of SearchPaneUI object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewSearchPaneUI ( ) {
	const MIN_RANKING = 1536;
	let myOsmSearchEngine = newOsmSearchEngine ( );
	let myEventDispatcher = newEventDispatcher ( );
	let mySearchInputValue = '';
	let mySearchButton = null;
	let mySearchInput = null;
	let myDataDiv = null;
	let myControlsDiv = null;
	let mySearchDiv = null;

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
		let element = contextMenuEvent.target;
		while ( ! element.searchResult ) {
			element = element.parentNode;
		}
		contextMenuEvent.latlng = { lat : LAT_LNG.defaultValue, lng : LAT_LNG.defaultValue };
		contextMenuEvent.fromUI = true;
		contextMenuEvent.originalEvent =
			{
				clientX : contextMenuEvent.clientX,
				clientY : contextMenuEvent.clientY,
				latLng : [ element.searchResult.lat, element.searchResult.lon ],
				searchResult : element.searchResult,
				geometry : element.searchResult.geometry
			};
		newOsmSearchContextMenu ( contextMenuEvent, myDataDiv ).show ( );
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
		myEventDispatcher.dispatch (
			'addsearchpointmarker',
			{
				objId : mouseEvent.target.objId,
				latLng : [ mouseEvent.target.searchResult.lat, mouseEvent.target.searchResult.lon ],
				geometry : mouseEvent.target.searchResult.geometry
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
		myEventDispatcher.dispatch ( 'removeobject', { objId : mouseEvent.target.objId } );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myClearSearchDiv
	@desc Remove all search results from the search div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myClearSearchDiv ( ) {
		let searchResultsDivs = document.querySelectorAll ( '.TravelNotes-SearchPaneUI-SearchResult' );
		searchResultsDivs.forEach (
			searchResultDiv => {
				searchResultDiv.removeEventListener ( 'contextmenu', myOnSearchResultContextMenu, false );
				searchResultDiv.removeEventListener ( 'mouseenter', myOnSearchResultMouseEnter, false );
				searchResultDiv.removeEventListener ( 'mouseleave', myOnSearchResultMouseLeave, false );
				mySearchDiv.removeChild ( searchResultDiv );
			}
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myAddWait
	@desc show a wait animation
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myAddWait ( ) {
		theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-SearchPaneUI-SearchWaitBullet'
			},
			theHTMLElementsFactory.create (
				'div',
				{ id : 'TravelNotes-SearchPaneUI-SearchWait' },
				myControlsDiv
			)
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myStartSearch
	@desc start the search
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myStartSearch ( ) {
		myClearSearchDiv ( );
		myAddWait ( );
		myOsmSearchEngine.search ( mySearchInput.value );

		// Notice: myOsmSearchEngine send a 'showsearch' event when the search is succesfully done
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnSearchInputKeyDown
	@desc key down event listener for the search input
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnSearchInputKeyDown ( keyDownEvent ) {
		if ( 'Enter' === keyDownEvent.key ) {
			myStartSearch ( );
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myAddControlsDiv
	@desc Create the controls div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myAddControlsDiv ( ) {
		myControlsDiv = theHTMLElementsFactory.create ( 'div', null, myDataDiv );
		mySearchButton = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-SearchPaneUI-SearchButton',
				className : 'TravelNotes-UI-Button',
				title : theTranslator.getText ( 'SearchPaneUI - Search OpenStreetMap' ),
				innerHTML : '&#x1f50e'
			},
			myControlsDiv
		);
		mySearchButton.addEventListener ( 'click', myStartSearch, false );
		mySearchInput = theHTMLElementsFactory.create (
			'input',
			{
				type : 'text',
				id : 'TravelNotes-SearchPaneUI-SearchInput',
				placeholder : theTranslator.getText ( 'SearchPaneUI - Search phrase' ),
				value : mySearchInputValue
			},
			myControlsDiv
		);

		mySearchInput.addEventListener ( 'keydown', myOnSearchInputKeyDown, false );
		mySearchInput.focus ( );
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
				'p',
				{
					innerText : paragraphText
				},
				parentElement
			);
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myConcatStreetAndHouse
	@desc Add the street and the house number found in a search result in one string
	@param {Object} searchResult
	@return {?string} the street and house number in one string or null if the street was not found
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myConcatStreetAndHouse ( searchResult ) {
		return (
			searchResult.tags [ 'addr:street' ]
				?
				searchResult.tags [ 'addr:street' ] +
			( searchResult.tags [ 'addr:housenumber' ] ? ' ' + searchResult.tags [ 'addr:housenumber' ] : '' )
				:
				null
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myConcatPostCodeAndCity
	@desc Add the post code and the city found in a search result in one string
	@param {Object} searchResult
	@return {?string} the post code and city in one string or null if the city was not found
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myConcatPostCodeAndCity ( searchResult ) {
		return (
			searchResult.tags [ 'addr:city' ]
				?
				( searchResult.tags [ 'addr:postcode' ] ? ( searchResult.tags [ 'addr:postcode' ] + ' ' ) : '' ) +
			searchResult.tags [ 'addr:city' ]
				:
				null
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myAddSearchResultDiv
	@desc Create a <div> and  <p> elements with the tags found in the searchResult and add this
	<div> to to search <div>
	@param {Object} searchResult
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myAddSearchResultDiv ( searchResult ) {
		let searchResultDiv = theHTMLElementsFactory.create (
			'div',
			{
				className :	'TravelNotes-SearchPaneUI-SearchResult',
				searchResult : searchResult,
				objId : newObjId ( )
			},
			mySearchDiv
		);
		myAddHTMLParagraphElement ( searchResultDiv, searchResult.description );
		myAddHTMLParagraphElement ( searchResultDiv, searchResult.tags.name );
		myAddHTMLParagraphElement ( searchResultDiv, myConcatStreetAndHouse ( searchResult ) );
		myAddHTMLParagraphElement ( searchResultDiv, myConcatPostCodeAndCity ( searchResult ) );
		myAddHTMLParagraphElement ( searchResultDiv, searchResult.tags.phone );
		if ( searchResult.tags.email ) {
			theHTMLElementsFactory.create (
				'a',
				{
					href : 'mailto:' + searchResult.tags.email,
					innerText : searchResult.tags.email
				},
				theHTMLElementsFactory.create ( 'p', null, searchResultDiv )
			);
		}
		if ( searchResult.tags.website ) {
			theHTMLElementsFactory.create (
				'a',
				{
					href : searchResult.tags.website,
					target : '_blank',
					innerText : searchResult.tags.website
				},
				theHTMLElementsFactory.create ( 'p', null, searchResultDiv )
			);
		}
		myAddHTMLParagraphElement (
			searchResultDiv,
			( MIN_RANKING <= searchResult.ranking ? '📈' : ' 📉' ) + searchResult.ranking
		);
		searchResultDiv.addEventListener ( 'contextmenu', myOnSearchResultContextMenu, false );
		searchResultDiv.addEventListener ( 'mouseenter', myOnSearchResultMouseEnter, false );
		searchResultDiv.addEventListener ( 'mouseleave', myOnSearchResultMouseLeave, false );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myAddSearchDiv
	@desc Create the search div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myAddSearchDiv ( ) {
		mySearchDiv = theHTMLElementsFactory.create ( 'div', null, myDataDiv );
		theTravelNotesData.searchData.forEach ( myAddSearchResultDiv );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class SearchPaneUI
	@classdesc This class manages the search pane UI
	@see {@link newSearchPaneUI} for constructor
	@see {@link DataPanesUI} for pane UI management
	@implements {PaneUI}
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	class SearchPaneUI {

		/**
		This function removes all the elements from the data div
		*/

		remove ( dataDiv ) {
			myDataDiv = dataDiv;
			myOsmSearchEngine.hide ( );
			myClearSearchDiv ( );
			myDataDiv.removeChild ( mySearchDiv );
			myDataDiv.removeChild ( myControlsDiv );
		}

		/**
		This function add the search data to the data div
		*/

		add ( dataDiv ) {
			myDataDiv = dataDiv;
			myOsmSearchEngine.show ( );
			myAddControlsDiv ( );
			myAddSearchDiv ( );
		}

		/**
		This function returns the pane id
		*/

		getId ( ) { return DATA_PANE_ID.searchPane; }

		/**
		This function returns the text to add in the pane button
		*/

		getButtonText ( ) { return theTranslator.getText ( 'DataPanesUI - Search' ); }
	}

	return Object.freeze ( new SearchPaneUI );
}

export { ourNewSearchPaneUI as newSearchPaneUI };

/*
--- End of SearchPaneUI.js file ---------------------------------------------------------------------------------------
*/