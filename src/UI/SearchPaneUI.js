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

export { newSearchPaneUI };

import { g_Translator } from '../UI/Translator.js';
import { g_TravelNotesData } from '../data/TravelNotesData.js';
import { g_NoteEditor } from '../core/NoteEditor.js';

import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { newObjId } from '../data/ObjId.js';
import { newOsmSearchEngine } from '../core/OsmSearchEngine.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';

let s_OsmSearchEngine = newOsmSearchEngine ( );
let s_SearchInputValue = '';

/*
--- newSearchPaneUI function ------------------------------------------------------------------------------------------

This function returns the searchPaneUI object

-----------------------------------------------------------------------------------------------------------------------
*/

function newSearchPaneUI ( ) {
	
	let m_HtmlElementsFactory = newHTMLElementsFactory ( ) ;
	let m_EventDispatcher = newEventDispatcher ( );
	
	/*
	--- m_OnSearchInputChange function --------------------------------------------------------------------------------

	change event listener for the search input

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnSearchInputChange ( ) {
		// saving the search phrase
		s_SearchInputValue = document.getElementById ( 'TravelNotes-Control-SearchInput' ).value;

		let searchDiv = document.getElementById ( 'TravelNotes-Control-SearchDiv' );
		// removing previous search results
		let searchResultsElements = document.getElementsByClassName ( 'TravelNotes-Control-SearchResult' );
		while ( 0 !== searchResultsElements.length ) {
			// cannot use forEach because searchResultsElements is directly updated when removing an element!!!
			searchResultsElements [ 0 ].removeEventListener ( 'click' , m_OnSearchResultClick, false );
			searchResultsElements [ 0 ].removeEventListener ( 'contextmenu' , m_OnSearchResultContextMenu, false );
			searchResultsElements [ 0 ].removeEventListener ( 'mouseenter' , m_OnSearchResultMouseEnter, false );
			searchResultsElements [ 0 ].removeEventListener ( 'mouseleave' , m_OnSearchResultMouseLeave, false );
			searchDiv.removeChild ( searchResultsElements [ 0 ] );
		}
		if ( ! document.getElementById ( 'TravelNotes-Control-SearchWaitBullet' ) ) {
			// adding wait animation
			let htmlElementsFactory = newHTMLElementsFactory ( );
			htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-SearchWaitBullet' }, htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-SearchWait' }, searchDiv ) );
		}
		// search...
		s_OsmSearchEngine.search ( );
	}

	/*
	--- m_OnSearchResultClick function --------------------------------------------------------------------------------

	click event listener for the search

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnSearchResultClick ( clickEvent ) {
		clickEvent.stopPropagation ( );
		let element = clickEvent.target;
		while ( ! element.latLng ) {
			element = element.parentNode;
		}
		m_EventDispatcher.dispatch ( 
			'zoomtosearchresult', 
			{ 
				latLng : element.latLng,
				geometry : element.geometry
			}
		);
	}

	/*
	--- m_OnSearchResultContextMenu function --------------------------------------------------------------------------

	contextmenu event listener for the search

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnSearchResultContextMenu ( clickEvent ) {
		clickEvent.stopPropagation ( );
		clickEvent.preventDefault ( );
		let element = clickEvent.target;
		while ( ! element.latLng ) {
			element = element.parentNode;
		}
		g_NoteEditor.newSearchNote ( element.searchResult );
	}

	/*
	--- m_OnSearchResultMouseEnter function ---------------------------------------------------------------------------

	mouseenter event listener for the search

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnSearchResultMouseEnter ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		m_EventDispatcher.dispatch ( 
			'addsearchpointmarker', 
			{ 
				objId : mouseEvent.target.objId,
				latLng : mouseEvent.target.latLng,
				geometry : mouseEvent.target.geometry
			}
		);
	}

	/*
	--- m_OnSearchResultMouseLeave function ---------------------------------------------------------------------------

	mouseleave event listener for the search

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnSearchResultMouseLeave ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		m_EventDispatcher.dispatch ( 'removeobject', { objId: mouseEvent.target.objId } );
	}

	/*
	--- m_Remove function ---------------------------------------------------------------------------------------------

	This function removes the content

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_Remove ( ) {
		
		let dataDiv = document.getElementById ( 'TravelNotes-Control-DataPanesDiv' );
		if ( ! dataDiv ) {
			return;
		}
		
		s_OsmSearchEngine.hide ( );
		
		let searchButton = document.getElementById ( 'TravelNotes-Control-SearchButton' );
		if ( searchButton ) {
			searchButton.removeEventListener ( 'click', m_OnSearchInputChange, false );
		}
		
		let searchInputElement = document.getElementById ( 'TravelNotes-Control-SearchInput' );
		if ( searchInputElement ) {
			searchInputElement.removeEventListener ( 'change', m_OnSearchInputChange, false );
		}
		let searchDiv = document.getElementById ( 'TravelNotes-Control-SearchDiv' );
		
		let searchResultsElements = document.getElementsByClassName ( 'TravelNotes-Control-SearchResult' );
		
		Array.prototype.forEach.call ( 
			searchResultsElements,
			searchResultsElement => {
				searchResultsElement.removeEventListener ( 'click' , m_OnSearchResultClick, false );
				searchResultsElement.removeEventListener ( 'contextmenu' , m_OnSearchResultContextMenu, false );
				searchResultsElement.removeEventListener ( 'mouseenter' , m_OnSearchResultMouseEnter, false );
				searchResultsElement.removeEventListener ( 'mouseleave' , m_OnSearchResultMouseLeave, false );
			}
		);
		
		if ( searchDiv ) {
			dataDiv.removeChild ( searchDiv );
		}
	}
	
	/*
	--- m_Add function ------------------------------------------------------------------------------------------------

	This function adds the content

	-------------------------------------------------------------------------------------------------------------------
	*/
	
	function m_Add ( ) {
		
		document.getElementById ( 'TravelNotes-Control-ItineraryPaneButton' ).classList.remove ( 'TravelNotes-Control-ActivePaneButton' );
		document.getElementById ( 'TravelNotes-Control-TravelNotesPaneButton' ).classList.remove ( 'TravelNotes-Control-ActivePaneButton' );
		document.getElementById ( 'TravelNotes-Control-SearchPaneButton' ).classList.add ( 'TravelNotes-Control-ActivePaneButton' );

		let dataDiv = document.getElementById ( 'TravelNotes-Control-DataPanesDiv' );
		if ( ! dataDiv ) {
			return;
		}
		
		s_OsmSearchEngine.show ( );
		let searchDiv = m_HtmlElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-SearchDiv'
			},
			dataDiv
		);
		let searchButton = m_HtmlElementsFactory.create (
			'div', 
			{ 
				id : 'TravelNotes-Control-SearchButton',
				className: 'TravelNotes-Control-Button', 
				title : g_Translator.getText ( 'SearchPaneUI - Search OpenStreetMap' ), 
				innerHTML : '&#x1f50e'
			},
			searchDiv 
		);
		searchButton.addEventListener ( 'click', m_OnSearchInputChange, false );

		let searchInput = m_HtmlElementsFactory.create ( 
			'input', 
			{ 
				type : 'text', 
				id : 'TravelNotes-Control-SearchInput', 
				placeholder : g_Translator.getText ( 'SearchPaneUI - Search phrase' ),
				value: s_SearchInputValue
			},
			searchDiv 
		);
		searchInput.addEventListener ( 'change', m_OnSearchInputChange, false );
		searchInput.addEventListener ( 
			'keydown', 
			keyBoardEvent => {
				if ( 'Enter' === keyBoardEvent.key ) {
					m_OnSearchInputChange ( keyBoardEvent );
				} 
			},
			false );
		searchInput.focus ( );
		let resultsCounter = 0;
		g_TravelNotesData.searchData.forEach ( 
			searchResult => {
				let searchResultDiv = m_HtmlElementsFactory.create (
					'div',
					{
						id : 'TravelNotes-Control-SearchResult'+ (resultsCounter ++ ),
						className :	'TravelNotes-Control-SearchResult',
						innerHTML : ( searchResult.description != '' ? '<p class=\'TravelNotes-Control-SearchResultDescription\'>' + searchResult.description + '</p>' : '' ) +
							( searchResult.tags.name ?  '<p>' + searchResult.tags.name + '</p>' : '' ) +
							( searchResult.tags [ 'addr:street' ] ? '<p>' + searchResult.tags [ 'addr:street' ] + ' ' + ( searchResult.tags [ 'addr:housenumber' ] ? searchResult.tags [ 'addr:housenumber' ] : '' ) +'</p>' : '' ) +
							( searchResult.tags [ 'addr:city' ] ? '<p>' + ( searchResult.tags [ 'addr:postcode' ] ? searchResult.tags [ 'addr:postcode' ] + ' ' : '' ) + searchResult.tags [ 'addr:city' ] + '</p>' : '' ) +
							( searchResult.tags.phone ? '<p>' + searchResult.tags.phone + '</p>' : '' ) +
							( searchResult.tags.email ? '<p><a href=\'mailto:' + searchResult.tags.email + '\'>' + searchResult.tags.email + '</a></p>' : '' ) +
							( searchResult.tags.website ? '<p><a href=\''+ searchResult.tags.website +'\' target=\'_blank\'>' + searchResult.tags.website + '</a></p>' : '' ) +
							( searchResult.ranking ? '<p>&#x26ab;' + searchResult.ranking + '</p>' : '' )
					},
					searchDiv
				);
				searchResultDiv.searchResult = searchResult;
				searchResultDiv.objId = newObjId ( );
				searchResultDiv.osmId = searchResult.id;
				searchResultDiv.latLng = [ searchResult.lat, searchResult.lon ];
				searchResultDiv.geometry = searchResult.geometry;
				searchResultDiv.addEventListener ( 'click' , m_OnSearchResultClick, false );
				searchResultDiv.addEventListener ( 'contextmenu' , m_OnSearchResultContextMenu, false );
				searchResultDiv.addEventListener ( 'mouseenter' , m_OnSearchResultMouseEnter, false );
				searchResultDiv.addEventListener ( 'mouseleave' , m_OnSearchResultMouseLeave, false );
			}
		);	
	}

	/*
	--- SearchPaneUI object -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal ( 
		{
			remove : ( ) => m_Remove ( ),
			add : ( ) => m_Add ( )
		}
	);
}
	
/*
--- End of SearchPaneUI.js file ---------------------------------------------------------------------------------------
*/		