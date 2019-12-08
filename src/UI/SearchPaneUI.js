/*
Copyright - 2017 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- SearchPaneUI.js file ----------------------------------------------------------------------------------------------
This file contains:
	-
Changes:
	- v1.4.0:
		- created
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed 20191125
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theNoteEditor } from '../core/NoteEditor.js';

import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { newObjId } from '../data/ObjId.js';
import { newOsmSearchEngine } from '../core/OsmSearchEngine.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';

import { THE_CONST } from '../util/Constants.js';

/*
--- newSearchPaneUI function ------------------------------------------------------------------------------------------

This function returns the searchPaneUI object

-----------------------------------------------------------------------------------------------------------------------
*/

function newSearchPaneUI ( ) {

	let myOsmSearchEngine = newOsmSearchEngine ( );
	let mySearchInputValue = '';

	let myHTMLElementsFactory = newHTMLElementsFactory ( );
	let myEventDispatcher = newEventDispatcher ( );

	/*
	--- myOnSearchResultClick function --------------------------------------------------------------------------------

	click event listener for the search

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnSearchResultClick ( clickEvent ) {
		clickEvent.stopPropagation ( );
		let element = clickEvent.target;
		while ( ! element.latLng ) {
			element = element.parentNode;
		}
		myEventDispatcher.dispatch (
			'zoomtosearchresult',
			{
				latLng : element.latLng,
				geometry : element.geometry
			}
		);
	}

	/*
	--- myOnSearchResultContextMenu function --------------------------------------------------------------------------

	contextmenu event listener for the search

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnSearchResultContextMenu ( clickEvent ) {
		clickEvent.stopPropagation ( );
		clickEvent.preventDefault ( );
		let element = clickEvent.target;
		while ( ! element.latLng ) {
			element = element.parentNode;
		}
		theNoteEditor.newSearchNote ( element.searchResult );
	}

	/*
	--- myOnSearchResultMouseEnter function ---------------------------------------------------------------------------

	mouseenter event listener for the search

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnSearchResultMouseEnter ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		myEventDispatcher.dispatch (
			'addsearchpointmarker',
			{
				objId : mouseEvent.target.objId,
				latLng : mouseEvent.target.latLng,
				geometry : mouseEvent.target.geometry
			}
		);
	}

	/*
	--- myOnSearchResultMouseLeave function ---------------------------------------------------------------------------

	mouseleave event listener for the search

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnSearchResultMouseLeave ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		myEventDispatcher.dispatch ( 'removeobject', { objId : mouseEvent.target.objId } );
	}

	/*
	--- myOnSearchInputChange function --------------------------------------------------------------------------------

	change event listener for the search input

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnSearchInputChange ( ) {

		// saving the search phrase
		mySearchInputValue = document.getElementById ( 'TravelNotes-Control-SearchInput' ).value;

		let searchDiv = document.getElementById ( 'TravelNotes-Control-SearchDiv' );

		// removing previous search results
		let searchResultsElements = document.getElementsByClassName ( 'TravelNotes-Control-SearchResult' );
		while ( THE_CONST.zero !== searchResultsElements.length ) {

			// cannot use forEach because searchResultsElements is directly updated when removing an element!!!
			searchResultsElements [ THE_CONST.zero ].removeEventListener ( 'click', myOnSearchResultClick, false );
			searchResultsElements [ THE_CONST.zero ].removeEventListener ( 'contextmenu', myOnSearchResultContextMenu, false );
			searchResultsElements [ THE_CONST.zero ].removeEventListener ( 'mouseenter', myOnSearchResultMouseEnter, false );
			searchResultsElements [ THE_CONST.zero ].removeEventListener ( 'mouseleave', myOnSearchResultMouseLeave, false );
			searchDiv.removeChild ( searchResultsElements [ THE_CONST.zero ] );
		}
		if ( ! document.getElementById ( 'TravelNotes-Control-SearchWaitBullet' ) ) {

			// adding wait animation
			let htmlElementsFactory = newHTMLElementsFactory ( );
			htmlElementsFactory.create (
				'div',
				{
					id : 'TravelNotes-Control-SearchWaitBullet'
				},
				htmlElementsFactory.create (
					'div',
					{ id : 'TravelNotes-Control-SearchWait' },
					searchDiv
				)
			);
		}

		// search...
		myOsmSearchEngine.search ( );
	}

	/*
	--- myRemove function ---------------------------------------------------------------------------------------------

	This function removes the content

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myRemove ( ) {

		let dataDiv = document.getElementById ( 'TravelNotes-Control-DataPanesDiv' );
		if ( ! dataDiv ) {
			return;
		}

		myOsmSearchEngine.hide ( );

		let searchButton = document.getElementById ( 'TravelNotes-Control-SearchButton' );
		if ( searchButton ) {
			searchButton.removeEventListener ( 'click', myOnSearchInputChange, false );
		}

		let searchInputElement = document.getElementById ( 'TravelNotes-Control-SearchInput' );
		if ( searchInputElement ) {
			searchInputElement.removeEventListener ( 'change', myOnSearchInputChange, false );
		}
		let searchDiv = document.getElementById ( 'TravelNotes-Control-SearchDiv' );

		let searchResultsElements = document.getElementsByClassName ( 'TravelNotes-Control-SearchResult' );

		Array.prototype.forEach.call (
			searchResultsElements,
			searchResultsElement => {
				searchResultsElement.removeEventListener ( 'click', myOnSearchResultClick, false );
				searchResultsElement.removeEventListener ( 'contextmenu', myOnSearchResultContextMenu, false );
				searchResultsElement.removeEventListener ( 'mouseenter', myOnSearchResultMouseEnter, false );
				searchResultsElement.removeEventListener ( 'mouseleave', myOnSearchResultMouseLeave, false );
			}
		);

		if ( searchDiv ) {
			dataDiv.removeChild ( searchDiv );
		}
	}

	/*
	--- myAdd function ------------------------------------------------------------------------------------------------

	This function adds the content

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAdd ( ) {

		document.getElementById ( 'TravelNotes-Control-ItineraryPaneButton' )
			.classList.remove ( 'TravelNotes-Control-ActivePaneButton' );
		document.getElementById ( 'TravelNotes-Control-TravelNotesPaneButton' )
			.classList.remove ( 'TravelNotes-Control-ActivePaneButton' );
		document.getElementById ( 'TravelNotes-Control-SearchPaneButton' )
			.classList.add ( 'TravelNotes-Control-ActivePaneButton' );

		let dataDiv = document.getElementById ( 'TravelNotes-Control-DataPanesDiv' );
		if ( ! dataDiv ) {
			return;
		}

		myOsmSearchEngine.show ( );
		let searchDiv = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-SearchDiv'
			},
			dataDiv
		);
		let searchButton = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-SearchButton',
				className : 'TravelNotes-Control-Button',
				title : theTranslator.getText ( 'SearchPaneUI - Search OpenStreetMap' ),
				innerHTML : '&#x1f50e'
			},
			searchDiv
		);
		searchButton.addEventListener ( 'click', myOnSearchInputChange, false );

		let searchInput = myHTMLElementsFactory.create (
			'input',
			{
				type : 'text',
				id : 'TravelNotes-Control-SearchInput',
				placeholder : theTranslator.getText ( 'SearchPaneUI - Search phrase' ),
				value : mySearchInputValue
			},
			searchDiv
		);
		searchInput.addEventListener ( 'change', myOnSearchInputChange, false );
		searchInput.addEventListener (
			'keydown',
			keyBoardEvent => {
				if ( 'Enter' === keyBoardEvent.key ) {
					myOnSearchInputChange ( keyBoardEvent );
				}
			},
			false );
		searchInput.focus ( );
		let resultsCounter = THE_CONST.zero;
		theTravelNotesData.searchData.forEach (
			searchResult => {
				let searchResultDiv = myHTMLElementsFactory.create (
					'div',
					{
						id : 'TravelNotes-Control-SearchResult' + ( resultsCounter ++ ),
						className :	'TravelNotes-Control-SearchResult',
						innerHTML :
							(
								'' === searchResult.description
									?
									''
									:
									'<p class="TravelNotes-Control-SearchResultDescription">' +
									searchResult.description +
									'</p>'
							) +
							(
								searchResult.tags.name
									?
									'<p>' +
									searchResult.tags.name +
									'</p>'
									:
									''
							) +
							(
								searchResult.tags [ 'addr:street' ]
									?
									'<p>' +
									searchResult.tags [ 'addr:street' ] +
									' ' +
									(
										searchResult.tags [ 'addr:housenumber' ]
											?
											searchResult.tags [ 'addr:housenumber' ]
											:
											''
									) +
									'</p>'
									:
									''
							) +
							(
								searchResult.tags [ 'addr:city' ]
									?
									'<p>' +
									(
										searchResult.tags [ 'addr:postcode' ]
											?
											searchResult.tags [ 'addr:postcode' ] +
											' '
											:
											''
									) +
									searchResult.tags [ 'addr:city' ] +
									'</p>'
									:
									''
							) +
							(
								searchResult.tags.phone
									?
									'<p>' +
									searchResult.tags.phone +
									'</p>'
									:
									''
							) +
							(
								searchResult.tags.email
									?
									'<p><a href="mailto:' +
									searchResult.tags.email +
									'">' +
									searchResult.tags.email +
									'</a></p>'
									:
									''
							) +
							(
								searchResult.tags.website
									?
									'<p><a href="' +
									searchResult.tags.website +
									'" target="_blank">' +
									searchResult.tags.website +
									'</a></p>'
									:
									''
							) +
							(
								searchResult.ranking
									?
									'<p>&#x26ab;' +
									searchResult.ranking +
									'</p>'
									:
									''
							)
					},
					searchDiv
				);
				searchResultDiv.searchResult = searchResult;
				searchResultDiv.objId = newObjId ( );
				searchResultDiv.osmId = searchResult.id;
				searchResultDiv.latLng = [ searchResult.lat, searchResult.lon ];
				searchResultDiv.geometry = searchResult.geometry;
				searchResultDiv.addEventListener ( 'click', myOnSearchResultClick, false );
				searchResultDiv.addEventListener ( 'contextmenu', myOnSearchResultContextMenu, false );
				searchResultDiv.addEventListener ( 'mouseenter', myOnSearchResultMouseEnter, false );
				searchResultDiv.addEventListener ( 'mouseleave', myOnSearchResultMouseLeave, false );
			}
		);
	}

	/*
	--- SearchPaneUI object -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			remove : ( ) => myRemove ( ),
			add : ( ) => myAdd ( )
		}
	);
}

export { newSearchPaneUI };

/*
--- End of SearchPaneUI.js file ---------------------------------------------------------------------------------------
*/