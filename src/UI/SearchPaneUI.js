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
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

'use strict';

/* global L */

export { newSearchPaneUI };

import { g_Translator } from '../UI/Translator.js';
import { g_TravelNotesData } from '../data/TravelNotesData.js';
import { g_MapEditor } from '../core/MapEditor.js';
import { g_NoteEditor } from '../core/NoteEditor.js';

import { newHTMLElementsFactory } from '../UI/HTMLElementsFactory.js';
import { newObjId } from '../data/ObjId.js';
import { newOsmSearchEngine } from '../core/OsmSearchEngine.js';

var s_OsmSearchEngine = newOsmSearchEngine ( );
var s_SearchInputValue = '';

var onKeyDownInputChange = function ( keyBoardEvent ) {
	if ( 'Enter' === keyBoardEvent.key ) {
		onSearchInputChange ( keyBoardEvent );
	}
};

/*
--- onSearchInputChange function ----------------------------------------------------------------------------------

change event listener for the search input

-------------------------------------------------------------------------------------------------------------------
*/

var onSearchInputChange = function ( ) {
	// saving the search phrase
	s_SearchInputValue = document.getElementById ( 'TravelNotes-Control-SearchInput' ).value;

	var searchDiv = document.getElementById ( 'TravelNotes-Control-SearchDiv' );
	// removing previous search results
	var searchResultsElements = document.getElementsByClassName ( 'TravelNotes-Control-SearchResult' );
	while ( 0 !== searchResultsElements.length ) {
		// cannot use forEach because searchResultsElements is directly updated when removing an element!!!
		searchResultsElements [ 0 ].removeEventListener ( 'click' , onSearchResultClick, false );
		searchResultsElements [ 0 ].removeEventListener ( 'contextmenu' , onSearchResultContextMenu, false );
		searchResultsElements [ 0 ].removeEventListener ( 'mouseenter' , onSearchResultMouseEnter, false );
		searchResultsElements [ 0 ].removeEventListener ( 'mouseleave' , onSearchResultMouseLeave, false );
		searchDiv.removeChild ( searchResultsElements [ 0 ] );
	}
	if ( ! document.getElementById ( 'TravelNotes-Control-SearchWaitBullet' ) ) {
		// adding wait animation
		var htmlElementsFactory = newHTMLElementsFactory ( );
		htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-SearchWaitBullet' }, htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-SearchWait' }, searchDiv ) );
	}
	// search...
	s_OsmSearchEngine.search ( );
};

/*
--- onSearchResultClick function --------------------------------------------------------------------------------------

click event listener for the search

-----------------------------------------------------------------------------------------------------------------------
*/

var onSearchResultClick = function ( clickEvent ) {
	clickEvent.stopPropagation ( );
	var element = clickEvent.target;
	while ( ! element.latLng ) {
		element = element.parentNode;
	}
	g_MapEditor.zoomToSearchResult ( element.latLng, element.geometry );
};

/*
--- onSearchResultContextMenu function --------------------------------------------------------------------------------

contextmenu event listener for the search

-----------------------------------------------------------------------------------------------------------------------
*/

var onSearchResultContextMenu = function ( clickEvent ) {
	clickEvent.stopPropagation ( );
	clickEvent.preventDefault ( );
	var element = clickEvent.target;
	while ( ! element.latLng ) {
		element = element.parentNode;
	}
	g_NoteEditor.newSearchNote ( element.searchResult );
};

/*
--- onSearchResultMouseEnter function ---------------------------------------------------------------------------------

mouseenter event listener for the search

-----------------------------------------------------------------------------------------------------------------------
*/

var onSearchResultMouseEnter = function ( mouseEvent ) {
	mouseEvent.stopPropagation ( );
	g_MapEditor.addSearchPointMarker ( mouseEvent.target.objId, mouseEvent.target.latLng, mouseEvent.target.geometry );
};

/*
--- onSearchResultMouseLeave function ---------------------------------------------------------------------------------

mouseleave event listener for the search

-----------------------------------------------------------------------------------------------------------------------
*/

var onSearchResultMouseLeave = function ( mouseEvent ) {
	mouseEvent.stopPropagation ( );
	g_MapEditor.removeObject ( mouseEvent.target.objId );
};

/*
--- searchPaneUI function ---------------------------------------------------------------------------------------------

This function returns the searchPaneUI object

-----------------------------------------------------------------------------------------------------------------------
*/

var newSearchPaneUI = function ( ) {
	
	var m_HtmlElementsFactory = newHTMLElementsFactory ( ) ;
	
	/*
	--- m_Remove function ---------------------------------------------------------------------------------------------

	This function removes the content

	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_Remove = function ( ) {
		
		var dataDiv = document.getElementById ( 'TravelNotes-Control-ItineraryDataDiv' );
		if ( ! dataDiv ) {
			return;
		}
		
		s_OsmSearchEngine.hide ( );
		
		var searchButton = document.getElementById ( 'TravelNotes-Control-SearchButton' );
		if ( searchButton ) {
			searchButton.removeEventListener ( 'click', onSearchInputChange, false );
		}
		
		var searchInputElement = document.getElementById ( 'TravelNotes-Control-SearchInput' );
		if ( searchInputElement ) {
			searchInputElement.removeEventListener ( 'change', onSearchInputChange, false );
		}
		var searchDiv = document.getElementById ( 'TravelNotes-Control-SearchDiv' );
		
		var searchResultsElements = document.getElementsByClassName ( 'TravelNotes-Control-SearchResult' );
		
		Array.prototype.forEach.call ( 
			searchResultsElements,
			function ( searchResultsElement ) {
				searchResultsElement.removeEventListener ( 'click' , onSearchResultClick, false );
				searchResultsElement.removeEventListener ( 'contextmenu' , onSearchResultContextMenu, false );
				searchResultsElement.removeEventListener ( 'mouseenter' , onSearchResultMouseEnter, false );
				searchResultsElement.removeEventListener ( 'mouseleave' , onSearchResultMouseLeave, false );
			}
		);
		
		if ( searchDiv ) {
			dataDiv.removeChild ( searchDiv );
		}
	};
	
	/*
	--- m_Add function ------------------------------------------------------------------------------------------------

	This function adds the content

	-------------------------------------------------------------------------------------------------------------------
	*/
	
	var m_Add = function ( ) {
		
		document.getElementById ( 'TravelNotes-Control-ItineraryPaneButton' ).classList.remove ( 'TravelNotes-Control-ActivePaneButton' );
		document.getElementById ( 'TravelNotes-Control-TravelNotesPaneButton' ).classList.remove ( 'TravelNotes-Control-ActivePaneButton' );
		document.getElementById ( 'TravelNotes-Control-SearchPaneButton' ).classList.add ( 'TravelNotes-Control-ActivePaneButton' );

		var dataDiv = document.getElementById ( 'TravelNotes-Control-ItineraryDataDiv' );
		if ( ! dataDiv ) {
			return;
		}
		
		s_OsmSearchEngine.show ( );
		
		var searchDiv = m_HtmlElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-SearchDiv'
			},
			dataDiv
		);
		var searchButton = m_HtmlElementsFactory.create (
			'div', 
			{ 
				id : 'TravelNotes-Control-SearchButton',
				className: 'TravelNotes-Control-Button', 
				title : g_Translator.getText ( 'SearchPaneUI - Search OpenStreetMap' ), 
				innerHTML : '&#x1f50e'
			},
			searchDiv 
		);
		searchButton.addEventListener ( 'click', onSearchInputChange, false );

		var searchInput = m_HtmlElementsFactory.create ( 
			'input', 
			{ 
				type : 'text', 
				id : 'TravelNotes-Control-SearchInput', 
				placeholder : g_Translator.getText ( 'SearchPaneUI - Search phrase' ),
				value: s_SearchInputValue
			},
			searchDiv 
		);
		searchInput.addEventListener ( 'change', onSearchInputChange, false );
		searchInput.addEventListener ( 'keydown', onKeyDownInputChange, false );
		searchInput.focus ( );
		var resultsCounter = 0;
		g_TravelNotesData.searchData.forEach ( 
			function ( searchResult ) {
				var searchResultDiv = m_HtmlElementsFactory.create (
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
				searchResultDiv.latLng = L.latLng ( [ searchResult.lat, searchResult.lon ] );
				searchResultDiv.geometry = searchResult.geometry;
				searchResultDiv.addEventListener ( 'click' , onSearchResultClick, false );
				searchResultDiv.addEventListener ( 'contextmenu' , onSearchResultContextMenu, false );
				searchResultDiv.addEventListener ( 'mouseenter' , onSearchResultMouseEnter, false );
				searchResultDiv.addEventListener ( 'mouseleave' , onSearchResultMouseLeave, false );
			}
		);	
	};

	/*
	--- SearcgPaneUI object -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal ( 
		{
			remove : function ( ) { m_Remove ( ); },
			add : function ( ) { m_Add ( ); },
		}
	);
};
	
/*
--- End of SearchPaneUI.js file ---------------------------------------------------------------------------------------
*/		