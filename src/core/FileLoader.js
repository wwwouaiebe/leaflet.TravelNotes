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
--- FileLoader.js file ----------------------------------------------------------------------------------------------
This file contains:
	- the FileLoader object
	- the module.exports implementation
Changes:
	- v1.4.0:
		- created from TravelEditor
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	var FileLoader = function ( ) {

		var _TravelNotesData = require ( '../L.TravelNotes' );
		var _MapEditor = require ( '../core/MapEditor' ) ( );
	
		var _MergeContent = false;
		var _FileName = '';
		var _IsFileReadOnly = false;
		var _FileContent = {};
		
		/*
		--- _DecompressFileContent function --------------------------------------------------------------------------------

		This function decompress the file data
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var _DecompressFileContent = function ( ) {
			
			_FileContent.routes.forEach ( 
				function ( route ) {
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
				}
			);
			
			if ( _MergeContent ) {
				_Merge ( );
			}
			else {
				_Open ( );
			}
		};
		
		/*
		--- _Merge function -------------------------------------------------------------------------------------------

		This function merge the file data with the _TravelNotesData.travel
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var _Merge = function ( ) {
			// ... and transform the data in the correct format
			var travel = require ( '../Data/Travel' ) ( );
			travel.object = _FileContent;
			
			// routes are added with their notes
			var routesIterator = travel.routes.iterator;
			while ( ! routesIterator.done ) {
				_TravelNotesData.travel.routes.add ( routesIterator.value );
			}
			// travel notes are added
			var notesIterator = travel.notes.iterator;
			while ( ! notesIterator.done ) {
				_TravelNotesData.travel.notes.add ( notesIterator.value );
			}
		
			_Display ( );
		};
		
		/*
		--- _Open function -------------------------------------------------------------------------------------------

		This function load the file data within the _TravelNotesData.travel
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var _Open = function ( ) {
			_TravelNotesData.travel.object = _FileContent;
			if ( '' !== _FileName ) {
				_TravelNotesData.travel.name = _FileName.substr ( 0, _FileName.lastIndexOf ( '.' ) ) ;
			}
			_TravelNotesData.travel.readOnly = _IsFileReadOnly;			
			
			_Display ( );
		};
		
		/*
		--- _Display function -----------------------------------------------------------------------------------------

		This function update the screen
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var _Display = function ( ) {
			
			// the map is cleaned
			_MapEditor.removeAllObjects ( );
			
			// routes are added with their notes
			var routesIterator = _TravelNotesData.travel.routes.iterator;
			while ( ! routesIterator.done ) {
				_MapEditor.addRoute ( routesIterator.value, true, false, _IsFileReadOnly );
			}
			
			// travel notes are added
			var notesIterator = _TravelNotesData.travel.notes.iterator;
			while ( ! notesIterator.done ) {
				_MapEditor.addNote ( notesIterator.value, _IsFileReadOnly );
			}
			
			// zoom on the travel
			_MapEditor.zoomToTravel ( );

			// Editors and roadbook are filled
			if ( ! _IsFileReadOnly ) {
			// Editors and HTML pages are filled
				require ( '../UI/TravelEditorUI' ) ( ). setRoutesList ( );
				require ( '../core/TravelEditor' ) ( ).updateRoadBook ( false );
			}
			else {
				// control is hidden
				document.getElementById ( 'TravelNotes-Control-MainDiv' ).classList.add ( 'TravelNotes-Control-MainDiv-Hidden' );
				document.getElementById ( 'TravelNotes-Control-MainDiv' ).classList.remove ( 'TravelNotes-Control-MainDiv-Maximize' );
				document.getElementById ( 'TravelNotes-Control-MainDiv' ).classList.remove ( 'TravelNotes-Control-MainDiv-Minimize' );
			}
			_TravelNotesData.map.fire ( 'travelnotesfileloaded', { readOnly : _IsFileReadOnly, name : _TravelNotesData.travel.name } );
		};
			
		/*
		--- _Display function -----------------------------------------------------------------------------------------

		This function open a local file
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var _OpenLocalFile = function ( ) {
			_FileName = event.target.files [ 0 ].name;
			
			var fileReader = new FileReader( );
			fileReader.onload = function ( event ) {
				try {
					_FileContent =  JSON.parse ( fileReader.result );
					_DecompressFileContent ( );
				}
				catch ( e ) {
				}
			};
			fileReader.readAsText ( event.target.files [ 0 ] );
		};
	
		/*
		--- FileLoader object -----------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return {
			openLocalFile : function ( event ) {
				_MergeContent = false;
				_IsFileReadOnly = false;
				_OpenLocalFile ( event );
			},
			mergeLocalFile : function ( event ) {
				_MergeContent = true;
				_IsFileReadOnly = false;
				_OpenLocalFile ( event );
			},
			openDistantFile : function ( fileContent ) {
				_IsFileReadOnly = true;
				_FileContent = fileContent;
				_DecompressFileContent ( );
			}
		};
		
	};
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = FileLoader;
	}

}());

/*
--- End of FileLoader.js file -----------------------------------------------------------------------------------------
*/	