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
--- NoteEditor.js file -------------------------------------------------------------------------------------------------
This file contains:
	- the NoteEditor object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
		- added newSearchNote method and modified endNoteDialog for update of the travel note pane
		- addedattachNoteToRoute and detachNoteFromRoute methods
Doc reviewed 20181218
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	var g_TravelNotesData = require ( '../L.TravelNotes' );
	
	var NoteEditor = function ( ) {
		
		var m_Translator = require ( '../UI/Translator' ) ( );
		var m_DataSearchEngine  = require ( '../Data/DataSearchEngine' ) ( );
	
		/*
		--- m_AttachNoteToRoute function ------------------------------------------------------------------------------

		This function transform a travel note into a route note ( when possible )
		
		parameters:
		- noteObjId : the objId of the note to transform

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_AttachNoteToRoute = function ( noteObjId ) {
			var noteAndRoute = m_DataSearchEngine.getNoteAndRoute ( noteObjId );
			var distance = 999999999;
			var selectedRoute = null;
			var attachPoint = null;
			
			g_TravelNotesData.travel.routes.forEach ( 
				function ( route ) {
					var pointAndDistance = require ( '../core/RouteEditor' ) ( ).getClosestLatLngDistance ( route, noteAndRoute.note.latLng );
					if ( pointAndDistance ) {
						var distanceToRoute = L.latLng ( noteAndRoute.note.latLng ).distanceTo ( L.latLng ( pointAndDistance.latLng ) );
						if ( distanceToRoute < distance ) {
							distance = distanceToRoute;
							selectedRoute = route;
							attachPoint = pointAndDistance.latLng;
						}
					}
				}
			);
			
			if ( selectedRoute ) {
				g_TravelNotesData.travel.notes.remove (  noteObjId );
				noteAndRoute.note.distance = distance;
				noteAndRoute.note.latLng = attachPoint;
				noteAndRoute.note.chainedDistance = selectedRoute.chainedDistance;

				// ... the chainedDistance is adapted...
				selectedRoute.notes.add ( noteAndRoute.note );
				// and the notes sorted
				selectedRoute.notes.sort ( function ( a, b ) { return a.distance - b.distance; } );

				require ( '../core/MapEditor' ) ( ).redrawNote ( noteAndRoute.note );
				require ( '../UI/DataPanesUI' ) ( ).updateItinerary ( );
				require ( '../UI/DataPanesUI' ) ( ).updateTravelNotes ( );
				// and the HTML page is adapted
				require ( '../core/TravelEditor' ) ( ).updateRoadBook ( );
			}
		};

		/*
		--- m_DetachNoteFromRoute function ----------------------------------------------------------------------------

		This function transform a route note into a travel note
		
		parameters:
		- noteObjId : the objId of the note to transform

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_DetachNoteFromRoute = function ( noteObjId ) {
			// the note and the route are searched
			var noteAndRoute = m_DataSearchEngine.getNoteAndRoute ( noteObjId );
			noteAndRoute.route.notes.remove ( noteObjId );
			noteAndRoute.note.distance = -1;
			noteAndRoute.note.chainedDistance = 0;
			g_TravelNotesData.travel.notes.add ( noteAndRoute.note );
			
			require ( '../UI/DataPanesUI' ) ( ).updateItinerary ( );
			require ( '../UI/DataPanesUI' ) ( ).updateTravelNotes ( );
			// and the HTML page is adapted
			require ( '../core/TravelEditor' ) ( ).updateRoadBook ( );
		};

		/*
		--- m_NewNote function ----------------------------------------------------------------------------------------

		This function create a new TravelNotes note object
		
		parameters:
		- latLng : the coordinates of the new note

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_NewNote = function ( latLng ) {
			var note = require ( '../data/Note' ) ( );
			note.latLng = latLng;
			note.iconLatLng = latLng;
			
			return note;
		};
		
		/*
		--- m_NewRouteNote function -----------------------------------------------------------------------------------

		This function start the creation of a TravelNotes note object linked with a route
		
		parameters:
		- routeObjId : the objId of the route to witch the note will be linked
		- event : the event that have triggered the method ( a right click on the 
		route polyline and then a choice in a context menu)

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_NewRouteNote = function ( routeObjId, event ) {
			// the nearest point and distance on the route is searched
			var latLngDistance = require ( '../core/RouteEditor' ) ( ).getClosestLatLngDistance ( 
				m_DataSearchEngine.getRoute ( routeObjId ),
				[ event.latlng.lat, event.latlng.lng ] 
			);
			
			// the note is created
			var note = m_NewNote ( latLngDistance.latLng );
			note.distance = latLngDistance.distance;
			
			// and displayed in a dialog box
			require ( '../UI/NoteDialog' ) ( note, routeObjId, true );
		};
		
		/*
		--- m_NewSearchNote function ----------------------------------------------------------------------------------

		This function start the creation of a TravelNotes note object linked to a search
		
		parameters:
		- searchResult : the search results with witch the note will be created

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_NewSearchNote = function ( searchResult ) {
			var note = m_NewNote ( [ searchResult.lat, searchResult.lon ] );
			
			note.address = ( searchResult.tags [ 'addr:housenumber' ] ? searchResult.tags [ 'addr:housenumber' ] + ' ' : '' ) +
				( searchResult.tags [ 'addr:street' ] ? searchResult.tags [ 'addr:street' ] + ' ' : '' ) +
				( searchResult.tags [ 'addr:city' ] ? searchResult.tags [ 'addr:city' ] + ' ' : '' );
			
			note.url = searchResult.tags.website || '';
			note.phone = searchResult.tags.phone || '';
			note.tooltipContent = searchResult.tags.name || '';
			note.popupContent = searchResult.tags.name || '';
			
			require ( '../UI/NoteDialog' ) ( note, -1, true );
		};
		
		/*
		--- m_NewManeuverNote function --------------------------------------------------------------------------------

		This function start the creation of a TravelNotes note object linked to a maneuver
		
		parameters:
		- maneuverObjId : the objId of the maneuver
		- latLng : the coordinates of the maneuver

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_NewManeuverNote = function ( maneuverObjId, latLng ) {
			// the nearest point and distance on the route is searched
			var latLngDistance = require ( '../core/RouteEditor' ) ( ).getClosestLatLngDistance ( 
				g_TravelNotesData.editedRoute,
				latLng
			);
			// the maneuver is searched
			var maneuver = g_TravelNotesData.editedRoute.itinerary.maneuvers.getAt ( maneuverObjId );

			// the note is created
			var note = m_NewNote ( latLng );
			note.distance = latLngDistance.distance;
			note.iconContent = "<div class='TravelNotes-ManeuverNote TravelNotes-ManeuverNote-" + maneuver.iconName + "'></div>";
			note.popupContent = maneuver.instruction;
			note.width = 40;
			note.height = 40;

			// and displayed in a dialog box
			require ( '../UI/NoteDialog' ) ( note, g_TravelNotesData.editedRoute.objId, true );
		};

		/*
		--- m_NewTravelNote function ----------------------------------------------------------------------------------

		This function start the creation f a TravelNotes note object
		
		parameters:
		- latLng : the coordinates of the new note

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_NewTravelNote = function ( latLng ) {
			// the note is created
			var note = m_NewNote ( latLng );

			// and displayed in a dialog box
			require ( '../UI/NoteDialog' ) ( note, -1, true );
		};

		/*
		--- m_AfterNoteDialog function --------------------------------------------------------------------------------

		This function is called when the user push on the ok button of the note dialog
		
		parameters:
		- note : the note modified in the dialog box
		- routeObjId : the TravelNotes route objId passed to the note dialog box

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_AfterNoteDialog = function ( note, routeObjId ) {
			var noteAndRoute = m_DataSearchEngine.getNoteAndRoute ( note.objId );
			if ( noteAndRoute.note ) {
				// it's an existing note. The note is changed on the map
				require ( '../core/MapEditor' ) ( ).editNote ( note );
				if ( ! noteAndRoute.route ) {
					// it's a travel note. UI is also adapted
					require ( '../UI/DataPanesUI' ) ( ).setTravelNotes ( );
				}
			}
			else {
				// it's a new note
				if ( -1 === routeObjId ) {
					// it's a global note
					g_TravelNotesData.travel.notes.add ( note );
					require ( '../UI/DataPanesUI' ) ( ).setTravelNotes ( );
				}
				else {
					// the note is linked with a route, so...
					var route = m_DataSearchEngine.getRoute ( routeObjId );
					route.notes.add ( note );
					// ... the chainedDistance is adapted...
					note.chainedDistance = route.chainedDistance;
					// and the notes sorted
					route.notes.sort ( function ( a, b ) { return a.distance - b.distance; } );
					// and in the itinerary is adapted...
					require ( '../UI/DataPanesUI' ) ( ).setItinerary ( );
				}
				// the note is added to the leaflet map
				require ( '../core/MapEditor' ) ( ).addNote ( note );
			}
			// and the HTML page is adapted
			require ( '../core/TravelEditor' ) ( ).updateRoadBook ( );
		};
		
		/*
		--- m_EditNote function ---------------------------------------------------------------------------------------

		This function start the modification of a note
		
		parameters:
		- noteObjId : the objId of the edited note

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_EditNote = function ( noteObjId ) {
			var noteAndRoute = m_DataSearchEngine.getNoteAndRoute ( noteObjId );
			require ( '../UI/NoteDialog' ) ( noteAndRoute.note, null === noteAndRoute.route ? -1 : noteAndRoute.route.objId, false );
		};

		/*
		--- m_RemoveNote function -------------------------------------------------------------------------------------

		This function removes a note
		
		parameters:
		- noteObjId : the objId of the note to remove

		-----------------------------------------------------------------------------------------------------------
		*/

		var m_RemoveNote = function ( noteObjId ) {
			// the note is removed from the leaflet map
			require ( '../core/MapEditor' ) ( ).removeObject ( noteObjId );
			// the note and the route are searched
			var noteAndRoute = m_DataSearchEngine.getNoteAndRoute ( noteObjId );
			if ( noteAndRoute.route ) {
				// it's a route note
				noteAndRoute.route.notes.remove ( noteObjId );
				require ( '../UI/DataPanesUI' ) ( ).updateItinerary ( );
			}
			else {
				// it's a travel note
				g_TravelNotesData.travel.notes.remove ( noteObjId );
				require ( '../UI/DataPanesUI' ) ( ).updateTravelNotes( );
			}
			// and the HTML page is adapted
			require ( '../core/TravelEditor' ) ( ).updateRoadBook ( );
		};
		
		/*
		--- m_HideNotes function --------------------------------------------------------------------------------------

		This function hide the notes on the map
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_HideNotes = function ( ) {
			var notesIterator = g_TravelNotesData.travel.notes.iterator;
			while ( ! notesIterator.done ) {
				require ( '../core/MapEditor' ) ( ).removeObject ( notesIterator.value.objId );
			}
			var routesIterator = g_TravelNotesData.travel.routes.iterator;
			while ( ! routesIterator.done ) {
				notesIterator = routesIterator.value.notes.iterator;
				while ( ! notesIterator.done ) {
					require ( '../core/MapEditor' ) ( ).removeObject ( notesIterator.value.objId );					
				}
			}
		};
			
		/*
		--- m_ShowNotes function --------------------------------------------------------------------------------------

		This function show the notes on the map
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_ShowNotes = function ( ) {
			m_HideNotes ( );
			var notesIterator = g_TravelNotesData.travel.notes.iterator;
			while ( ! notesIterator.done ) {
				require ( '../core/MapEditor' ) ( ).addNote ( notesIterator.value );
			}
			var routesIterator = g_TravelNotesData.travel.routes.iterator;
			while ( ! routesIterator.done ) {
				notesIterator = routesIterator.value.notes.iterator;
				while ( ! notesIterator.done ) {
					require ( '../core/MapEditor' ) ( ).addNote ( notesIterator.value );					
				}
			}
		};
			
		/*
		--- m_ZoomToNote function -------------------------------------------------------------------------------------

		This function zoom to a given note
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_ZoomToNote = function ( noteObjId ) {
			require ( '../core/MapEditor' ) ( ).zoomToPoint ( m_DataSearchEngine.getNoteAndRoute ( noteObjId).note.latLng );
		};
		
		/*
		--- m_NoteDropped function ------------------------------------------------------------------------------------

		This function changes the position of a note after a drag and drop
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_NoteDropped = function(  draggedNoteObjId, targetNoteObjId, draggedBefore ) {
			g_TravelNotesData.travel.notes.moveTo ( draggedNoteObjId, targetNoteObjId, draggedBefore );
			require ( '../UI/DataPanesUI' ) ( ).updateTravelNotes( );
			require ( '../core/TravelEditor' ) ( ).updateRoadBook ( );
		};
			
		/*
		--- m_GetNoteHTML function --------------------------------------------------------------------------------------

		This function returns an HTML string with the note contents. This string will be used in the
		note popup and on the roadbook page
		
		parameters:
		- note : the TravelNotes object
		- classNamePrefix : a string that will be added to all the HTML classes

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_GetNoteHTML = function ( note, classNamePrefix ) {
		
			var noteText = '';
			if ( 0 !== note.tooltipContent.length ) {
				noteText += '<div class="' + classNamePrefix + 'NoteHtml-TooltipContent">' + note.tooltipContent + '</div>';
			}
			if ( 0 !== note.popupContent.length ) {
				noteText += '<div class="' + classNamePrefix + 'NoteHtml-PopupContent">' + note.popupContent + '</div>';
			}
			if ( 0 !== note.address.length ) {
				noteText += '<div class="' + classNamePrefix + 'NoteHtml-Address">' + m_Translator.getText ( 'NoteEditor - Address' )  + note.address + '</div>';
			}
			if ( 0 !== note.phone.length ) {
				noteText += '<div class="' + classNamePrefix + 'NoteHtml-Phone">' + m_Translator.getText ( 'NoteEditor - Phone' )  + note.phone + '</div>';
			}
			if ( 0 !== note.url.length ) {
				noteText += '<div class="' + classNamePrefix + 'NoteHtml-Url">' + m_Translator.getText ( 'NoteEditor - Link' ) + '<a href="' + note.url + '" target="_blank">' + note.url.substr ( 0, 40 ) + '...' +'</a></div>';
			}
			var utilities = require ( '../util/Utilities' ) ( );
			noteText += '<div class="' + classNamePrefix + 'NoteHtml-LatLng">' + 
				m_Translator.getText ( 
					'NoteEditor - Latitude Longitude',
					{ 
						lat : utilities.formatLat ( note.lat ),
						lng : utilities.formatLng ( note.lng )
					}
				) + '</div>';
				
			if ( -1 !== note.distance ) {
				noteText += '<div class="' + classNamePrefix + 'NoteHtml-Distance">' +
					m_Translator.getText ( 
						'NoteEditor - Distance', 
						{ 
							distance: utilities.formatDistance ( note.chainedDistance + note.distance )
						}
					) + '</div>';
			}
			
			return noteText;
		};
				
		/*
		--- noteEditor object -----------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return Object.seal (
			{	
			
				newRouteNote : function ( routeObjId, event ) { m_NewRouteNote ( routeObjId, event ); },
				
				newSearchNote : function ( searchResult ) { m_NewSearchNote ( searchResult ); },
			
				newManeuverNote : function ( maneuverObjId, latLng ) { m_NewManeuverNote ( maneuverObjId, latLng ); },
			
				newTravelNote : function ( latLng ) { m_NewTravelNote ( latLng ); },
			
				afterNoteDialog : function ( note, routeObjId ) { m_AfterNoteDialog ( note, routeObjId ); },	
			
				editNote : function ( noteObjId ) {	m_EditNote ( noteObjId ); },
			
				removeNote : function ( noteObjId ) { m_RemoveNote ( noteObjId ); },
			
				hideNotes : function ( ) { m_HideNotes ( ); },
				
				showNotes : function ( ) { m_ShowNotes ( ); },
				
				zoomToNote : function ( noteObjId ) { m_ZoomToNote ( noteObjId ); },
							
				attachNoteToRoute : function ( noteObjId ) { m_AttachNoteToRoute ( noteObjId ); },
				
				detachNoteFromRoute : function ( noteObjId ) { m_DetachNoteFromRoute ( noteObjId ); },
				
				noteDropped : function ( draggedNoteObjId, targetNoteObjId, draggedBefore ) { m_NoteDropped (  draggedNoteObjId, targetNoteObjId, draggedBefore ); },
				
				getNoteHTML : function ( note, classNamePrefix ) { return m_GetNoteHTML ( note, classNamePrefix ); }		
			}
		);
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = NoteEditor;
	}

}());

/*
--- End of NoteEditor.js file -----------------------------------------------------------------------------------------
*/