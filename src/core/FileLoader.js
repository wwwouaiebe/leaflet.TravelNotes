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
--- FileLoader.js file ----------------------------------------------------------------------------------------------
This file contains:
	- the FileLoader object
	- the module.exports implementation
Changes:
	- v1.4.0:
		- created from TravelEditor
	- v1.5.0:
		- Issue #52 : when saving the travel to the file, save also the edited route.
		- Issue #61 : Disable right context menu when readonly travel.
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	/*
	--- fileLoader function -------------------------------------------------------------------------------------------

	Patterns : Closure

	-------------------------------------------------------------------------------------------------------------------
	*/
	
	var fileLoader = function ( ) {

		var g_TravelNotesData = require ( '../L.TravelNotes' );
	
		var m_Translator = require ( '../UI/Translator' ) ( );
		var m_MergeContent = false;
		var m_FileName = '';
		var m_IsFileReadOnly = false;
		var m_FileContent = {};

		/*
		--- m_DecompressRoute function --------------------------------------------------------------------------------

		This function decompress a route
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_DecompressRoute = function ( route ) {
			route.itinerary.itineraryPoints.latLngs = require ( '@mapbox/polyline' ).decode ( route.itinerary.itineraryPoints.latLngs, 6 );
			var decompressedItineraryPoints = [];
			var latLngsCounter = 0;
			route.itinerary.itineraryPoints.latLngs.forEach (
				function ( latLng ) {
					var itineraryPoint = {};
					itineraryPoint.lat = latLng [ 0 ];
					itineraryPoint.lng = latLng [ 1 ];
					itineraryPoint.distance = route.itinerary.itineraryPoints.distances [ latLngsCounter ];
					itineraryPoint.objId = route.itinerary.itineraryPoints.objIds [ latLngsCounter ];
					itineraryPoint.objType = route.itinerary.itineraryPoints.objType;
					decompressedItineraryPoints.push ( itineraryPoint );
					latLngsCounter ++;
				}
			);
			route.itinerary.itineraryPoints = decompressedItineraryPoints;
		};
		
		/*
		--- m_DecompressFileContent function --------------------------------------------------------------------------

		This function decompress the file data
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_DecompressFileContent = function ( ) {
			
			m_FileContent.routes.forEach ( m_DecompressRoute );
			if ( m_FileContent.editedRoute ) {
				// don't remove the if statment... files created with version < 1.5.0 don't have editedRoute...
				m_DecompressRoute ( m_FileContent.editedRoute );
			}
			if ( m_MergeContent ) {
				m_Merge ( );
			}
			else {
				m_Open ( );
			}
		};
		
		/*
		--- m_Merge function ------------------------------------------------------------------------------------------

		This function merge the file data with the g_TravelNotesData.travel
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Merge = function ( ) {
			// ... and transform the data in the correct format
			var travel = require ( '../Data/Travel' ) ( );
			travel.object = m_FileContent;
			
			// routes are added with their notes
			var routesIterator = travel.routes.iterator;
			while ( ! routesIterator.done ) {
				g_TravelNotesData.travel.routes.add ( routesIterator.value );
			}
			// travel notes are added
			var notesIterator = travel.notes.iterator;
			while ( ! notesIterator.done ) {
				g_TravelNotesData.travel.notes.add ( notesIterator.value );
			}
			
			require ( '../Core/RouteEditor' ) ( ).chainRoutes ( );
		
			m_Display ( );
		};
		
		/*
		--- m_Open function -------------------------------------------------------------------------------------------

		This function load the file data within the g_TravelNotesData.travel
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Open = function ( ) {
			g_TravelNotesData.travel.object = m_FileContent;
			g_TravelNotesData.editedRouteObjId = -1;

			if ( '' !== m_FileName ) {
				g_TravelNotesData.travel.name = m_FileName.substr ( 0, m_FileName.lastIndexOf ( '.' ) ) ;
			}
			g_TravelNotesData.travel.readOnly = m_IsFileReadOnly;
			g_TravelNotesData.travel.routes.forEach (
				function ( route ) {
					if ( 0 !== route.edited ) {
						g_TravelNotesData.editedRouteObjId = route.objId;
					}
				}
			);
			m_Display ( );
		};
		
		/*
		--- m_Display function -----------------------------------------------------------------------------------------

		This function update the screen
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Display = function ( ) {
			var mapEditor = require ( '../core/MapEditor' ) ( );

			// the map is cleaned
			mapEditor.removeAllObjects ( );
			// routes are added with their notes
			var routesIterator = g_TravelNotesData.travel.routes.iterator;
			while ( ! routesIterator.done ) {
				if ( 0 === routesIterator.value.edited ) {
					mapEditor.addRoute ( routesIterator.value, true, false, m_IsFileReadOnly );
				}
			}
			// edited route is added with notes and , depending of read only, waypoints
			if ( -1 !== g_TravelNotesData.editedRouteObjId ) {
				mapEditor.addRoute ( g_TravelNotesData.travel.editedRoute, true, ! m_IsFileReadOnly, m_IsFileReadOnly );
			}
			
			// travel notes are added
			var notesIterator = g_TravelNotesData.travel.notes.iterator;
			while ( ! notesIterator.done ) {
				mapEditor.addNote ( notesIterator.value, m_IsFileReadOnly );
			}
			
			// zoom on the travel
			mapEditor.zoomToTravel ( );

			// Editors and roadbook are filled
			if ( ! m_IsFileReadOnly ) {
			// Editors and HTML pages are filled
				require ( '../UI/TravelEditorUI' ) ( ). setRoutesList ( );
				if ( -1 !== g_TravelNotesData.editedRouteObjId ) {
					var providerName = g_TravelNotesData.travel.editedRoute.itinerary.provider;
					if ( providerName && ( '' !== providerName ) && ( ! g_TravelNotesData.providers.get ( providerName.toLowerCase ( ) ) ) )
					{
						require ( '../core/ErrorEditor' ) ( ).showError ( m_Translator.getText ( "FileLoader - Not possible to select as provider", {provider : providerName } ) );
					}
					else {
						// Provider and transit mode are changed in the itinerary editor
						var transitMode = g_TravelNotesData.travel.editedRoute.itinerary.transitMode;
						require ( '../UI/ProvidersToolbarUI') ( ).provider = providerName;
						
						if ( transitMode && '' !== transitMode ) {
							require ( '../UI/ProvidersToolbarUI') ( ).transitMode = transitMode;
						}
					}
					require ( '../core/RouteEditor' ) ( ).chainRoutes ( );
					var routeEditorUI = require ( '../UI/RouteEditorUI' ) ( );
					routeEditorUI .expand ( );
					routeEditorUI.setWayPointsList ( );
					require ( '../UI/DataPanesUI' ) ( ).setItinerary ( );
				}
				require ( '../core/TravelEditor' ) ( ).updateRoadBook ( false );
			}
			else {
				// control is hidden
				document.getElementById ( 'TravelNotes-Control-MainDiv' ).classList.add ( 'TravelNotes-Control-MainDiv-Hidden' );
				document.getElementById ( 'TravelNotes-Control-MainDiv' ).classList.remove ( 'TravelNotes-Control-MainDiv-Maximize' );
				document.getElementById ( 'TravelNotes-Control-MainDiv' ).classList.remove ( 'TravelNotes-Control-MainDiv-Minimize' );
			}
			g_TravelNotesData.map.fire ( 'travelnotesfileloaded', { readOnly : m_IsFileReadOnly, name : g_TravelNotesData.travel.name } );
		};
			
		/*
		--- m_OpenFile function ---------------------------------------------------------------------------------------

		This function open a local file
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_OpenFile = function ( event ) {
			m_FileName = event.target.files [ 0 ].name;
			
			var fileReader = new FileReader( );
			fileReader.onload = function ( event ) {
				try {
					m_FileContent =  JSON.parse ( fileReader.result );
					m_DecompressFileContent ( );
				}
				catch ( e ) {
					console.log ( e);
				}
			};
			fileReader.readAsText ( event.target.files [ 0 ] );
		};

		/*
		--- m_OpenLocalFile function ----------------------------------------------------------------------------------

		This function open a local file
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_OpenLocalFile = function ( event ) {
			m_MergeContent = false;
			m_IsFileReadOnly = false;
			m_OpenFile ( event );
		};
		
		/*
		--- m_MergeLocalFile function ---------------------------------------------------------------------------------

		This function open a local file
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_MergeLocalFile = function ( event ) {
			
			m_MergeContent = true;
			m_IsFileReadOnly = false;
			m_OpenFile ( event );
		};
		
		/*
		--- m_OpenDistantFile function --------------------------------------------------------------------------------

		This function open a local file
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_OpenDistantFile = function ( fileContent ) {
			L.travelNotes.rightContextMenu = false;
			m_IsFileReadOnly = true;
			m_FileContent = fileContent;
			m_DecompressFileContent ( );
		};
	
		/*
		--- FileLoader object -----------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return Object.seal (
			{
				openLocalFile : function ( event ) { m_OpenLocalFile ( event ); },
				mergeLocalFile : function ( event ) { m_MergeLocalFile ( event ); },
				openDistantFile : function ( fileContent ) { m_OpenDistantFile ( fileContent ); }
			}
		);
	};
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = fileLoader;
	}

}());

/*
--- End of FileLoader.js file -----------------------------------------------------------------------------------------
*/	