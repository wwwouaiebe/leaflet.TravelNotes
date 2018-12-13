/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

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

Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	var g_TravelNotesData = require ( '../L.TravelNotes' );
	var s_OsmSearchStarted = false;
	var s_SearchParameters = { searchPhrase : '', bbox : null };
	var s_PreviousSearchRectangleObjId = -1;
	var s_NextSearchRectangleObjId = -1;
	var s_SearchLimits = ( window.osmSearch ) ? window.osmSearch.searchLimits : null;
	
	/*
	--- s_DrawSearchRectangle function --------------------------------------------------------------------------------

	This function draw the search limits on the map

	-------------------------------------------------------------------------------------------------------------------
	*/
	
	var s_DrawSearchRectangle = function ( ) {
		if ( ! s_SearchParameters.bbox ) {
			return;
		}
		if ( -1 !== s_PreviousSearchRectangleObjId ) {
			require ( '../core/MapEditor' ) ( ).removeObject ( s_PreviousSearchRectangleObjId );
		}
		else {
			s_PreviousSearchRectangleObjId = require ( '../data/ObjId' ) ( );
		}
		require ( '../core/MapEditor' ) ( ).addRectangle ( 
			s_PreviousSearchRectangleObjId, 
			L.latLngBounds ( s_SearchParameters.bbox.southWest, s_SearchParameters.bbox.northEast ) , 
			g_TravelNotesData.config.previousSearchLimit 
		);
	};
	
	/*
	--- onSearchSuccess function --------------------------------------------------------------------------------------

	Promise success function for osmSearch

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onSearchSuccess = function ( searchData ) {
		g_TravelNotesData.searchData = searchData;
		s_OsmSearchStarted = false;
		s_DrawSearchRectangle ( );
		require ( '../UI/DataPanesUI' ) ( ).updateSearch ( );
	};
	
	/*
	--- onSearchError function ----------------------------------------------------------------------------------------

	Promise error function for osmSearch

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onSearchError = function ( error ) {
		console.log ( error );
		s_OsmSearchStarted = false;
	};
	
	/*
	--- onSearchInputChange function ----------------------------------------------------------------------------------

	change event listener for the search input

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onSearchInputChange = function ( event ) {
		if ( s_OsmSearchStarted ) {
			return;
		}
		s_OsmSearchStarted = true;
		var mapBounds =  g_TravelNotesData.map.getBounds ( );
		s_SearchParameters = {
			bbox : { southWest : mapBounds.getSouthWest ( ), northEast : mapBounds.getNorthEast ( ) },
			searchPhrase : document.getElementById ( 'TravelNotes-Control-SearchInput' ).value
		};
		g_TravelNotesData.searchData = [];
		window.osmSearch.getSearchPromise ( s_SearchParameters ).then (  onSearchSuccess, onSearchError  );
	};
	
	/*
	--- onMapChange function ------------------------------------------------------------------------------------------

	change event listener for the map

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onMapChange = function ( event ) {
		var mapCenter = g_TravelNotesData.map.getCenter ( );
		if ( -1 !== s_NextSearchRectangleObjId ) {
			require ( '../core/MapEditor' ) ( ).removeObject ( s_NextSearchRectangleObjId );
		}
		else {
			s_NextSearchRectangleObjId = require ( '../data/ObjId' ) ( );
		}
		require ( '../core/MapEditor' ) ( ).addRectangle ( 
			s_NextSearchRectangleObjId, 
			L.latLngBounds ( L.latLng ( mapCenter.lat - s_SearchLimits.lat, mapCenter.lng - s_SearchLimits.lng ), L.latLng (  mapCenter.lat + s_SearchLimits.lat, mapCenter.lng + s_SearchLimits.lng ) ), 
			g_TravelNotesData.config.nextSearchLimit );
	};

	/*
	--- onSearchClick function ----------------------------------------------------------------------------------------

	click event listener for the search

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onSearchClick = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		var element = clickEvent.target;
		while ( ! element.latLng ) {
			element = element.parentNode;
		}
		require ( '../core/MapEditor' ) ( ).zoomToPoint ( element.latLng );
	};
	
	/*
	--- onSearchContextMenu function ----------------------------------------------------------------------------------

	contextmenu event listener for the search

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onSearchContextMenu = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		clickEvent.preventDefault ( );
		var element = clickEvent.target;
		while ( ! element.latLng ) {
			element = element.parentNode;
		}
		require ( '../core/NoteEditor' ) ( ).newSearchNote ( element.searchResult );
	};
	
	/*
	--- onSearchMouseEnter function -----------------------------------------------------------------------------------

	mouseenter event listener for the search

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onSearchMouseEnter = function ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		require ( '../core/MapEditor' ) ( ).addSearchPointMarker ( mouseEvent.target.objId, mouseEvent.target.latLng  );
	};
	
	/*
	--- onSearchMouseLeave function -----------------------------------------------------------------------------------

	mouseleave event listener for the search

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onSearchMouseLeave = function ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		require ( '../core/MapEditor' ) ( ).removeObject ( mouseEvent.target.objId );
	};

	/*
	--- searchPaneUI function -----------------------------------------------------------------------------------------

	This function returns the searchPaneUI object

	-------------------------------------------------------------------------------------------------------------------
	*/

	var searchPaneUI = function ( ) {

		/*
		--- m_Remove function -----------------------------------------------------------------------------------------

		This function removes the content

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Remove = function ( ) {
			
			g_TravelNotesData.map.off ( 'zoom', onMapChange );
			g_TravelNotesData.map.off ( 'move', onMapChange );
			if ( -1 !== s_NextSearchRectangleObjId ) {
				require ( '../core/MapEditor' ) ( ).removeObject ( s_NextSearchRectangleObjId );
				s_NextSearchRectangleObjId = -1;
			}
			if ( -1 !== s_PreviousSearchRectangleObjId ) {
				require ( '../core/MapEditor' ) ( ).removeObject ( s_PreviousSearchRectangleObjId );
				s_PreviousSearchRectangleObjId = -1;
			}
			var dataDiv = document.getElementById ( 'TravelNotes-Control-ItineraryDataDiv' );
			if ( ! dataDiv ) {
				return;
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
					searchResultsElement.removeEventListener ( 'click' , onSearchClick );
					searchResultsElement.removeEventListener ( 'contextmenu' , onSearchContextMenu, false );
					searchResultsElement.removeEventListener ( 'mouseenter' , onSearchMouseEnter, false );
					searchResultsElement.removeEventListener ( 'mouseleave' , onSearchMouseLeave, false );
				}
			);
			
			if ( searchDiv ) {
				dataDiv.removeChild ( searchDiv );
			}
		};
		
		/*
		--- m_Add function ---------------------------------------------------------------------------------------------

		This function adds the content

		---------------------------------------------------------------------------------------------------------------
		*/
		
		var m_Add = function ( ) {
			
			document.getElementById ( 'TravelNotes-Control-ItineraryPaneButton' ).classList.remove ( 'TravelNotes-Control-ActivePaneButton' );
			document.getElementById ( 'TravelNotes-Control-TravelNotesPaneButton' ).classList.remove ( 'TravelNotes-Control-ActivePaneButton' );
			document.getElementById ( 'TravelNotes-Control-SearchPaneButton' ).classList.add ( 'TravelNotes-Control-ActivePaneButton' );

			g_TravelNotesData.map.on ( 'zoom', onMapChange );
			g_TravelNotesData.map.on ( 'move', onMapChange );
			onMapChange ( );
			s_DrawSearchRectangle ( );
			var dataDiv = document.getElementById ( 'TravelNotes-Control-ItineraryDataDiv' );
			if ( ! dataDiv ) {
				return;
			}
			
			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			var searchDiv = htmlElementsFactory.create (
				'div',
				{
					id : 'TravelNotes-Control-SearchDiv'
				},
				dataDiv
			);
			var searchButton = htmlElementsFactory.create (
				'div', 
				{ 
					id : 'TravelNotes-Control-SearchButton',
					className: 'TravelNotes-Control-Button', 
					title : require ( './Translator' ) ( ).getText ( 'SearchPaneUI - Search OpenStreetMap' ), 
					innerHTML : '&#x1f50e'
				},
				searchDiv 
			);
			searchButton.addEventListener ( 'click', onSearchInputChange, false );

			var searchInput = htmlElementsFactory.create ( 
				'input', 
				{ 
					type : 'text', 
					id : 'TravelNotes-Control-SearchInput', 
					placeholder : require ( './Translator' ) ( ).getText ( 'SearchPaneUI - Search phrase' ),
					value: s_SearchParameters.searchPhrase
				},
				searchDiv 
			);
			searchInput.addEventListener ( 'change', onSearchInputChange, false );
			searchInput.focus ( );
			var resultsCounter = 0;
			g_TravelNotesData.searchData.forEach ( 
				function ( searchResult ) {
					var searchResultDiv = htmlElementsFactory.create (
						'div',
						{
							id : 'TravelNotes-Control-SearchResult'+ (resultsCounter ++ ),
							className :	'TravelNotes-Control-SearchResult',
							innerHTML : ( searchResult.description != '' ? '<p class=\'TravelNotes-Control-SearchResultDescription\'>' + searchResult.description + '</p>' : '' ) +
								( searchResult.name != '' ?  '<p>' + searchResult.name + '</p>' : '' ) +
								( searchResult.street != '' ? '<p>' + searchResult.street + ' ' + searchResult.housenumber +'</p>' : '' ) +
								( searchResult.city != '' ? '<p>' + searchResult.postcode + ' ' + searchResult.city +'</p>' : '' ) +
								( searchResult.phone != '' ? '<p>' + searchResult.phone + '</p>' : '' ) +
								( searchResult.email != '' ? '<p><a href=\'mailto:' + searchResult.email + '\'>' + searchResult.email + '</a></p>' : '' ) +
								( searchResult.website != '' ? '<p><a href=\''+ searchResult.website +'\' target=\'_blank\'>' + searchResult.website + '</a></p>' : '' ) +
								( searchResult.ranking ? '<p>&#x26ab;' + searchResult.ranking + '</p>' : '' )
						},
						searchDiv
					);
					searchResultDiv.searchResult = searchResult;
					searchResultDiv.objId = require ( '../data/ObjId' ) ( );
					searchResultDiv.osmId = searchResult.id;
					searchResultDiv.latLng = L.latLng ( [ searchResult.lat, searchResult.lon ] );
					searchResultDiv.addEventListener ( 'click' , onSearchClick, false );
					searchResultDiv.addEventListener ( 'contextmenu' , onSearchContextMenu, false );
					searchResultDiv.addEventListener ( 'mouseenter' , onSearchMouseEnter, false );
					searchResultDiv.addEventListener ( 'mouseleave' , onSearchMouseLeave, false );
				}
			);	
		};
	
		return {
			remove : function ( ) { m_Remove ( ); },
			add : function ( ) { m_Add ( ); }
		};
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = searchPaneUI;
	}

}());

/*
--- End of SearchPaneUI.js file ---------------------------------------------------------------------------------------
*/		