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
Doc reviewed 20170927
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	var _Translator = require ( '../UI/Translator' ) ( );
	var _TravelNotesData = require ( '../L.TravelNotes' );
	var _DataSearchEngine  = require ( '../Data/DataSearchEngine' ) ( );
	var _Utilities = require ( '../util/Utilities' ) ( );
	
	var NoteEditor = function ( ) {
		
		/*
		--- _AttachNoteToRoute function -------------------------------------------------------------------------------

		This function transform a travel note into a route note ( when possible )
		
		parameters:
		- noteObjId : the objId of the note to transform

		---------------------------------------------------------------------------------------------------------------
		*/

		var _AttachNoteToRoute = function ( noteObjId ) {
			var noteAndRoute = _DataSearchEngine.getNoteAndRoute ( noteObjId );
			var distance = 999999999;
			var selectedRoute = null;
			var attachPoint = null;
			
			_TravelNotesData.travel.routes.forEach ( 
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
				_TravelNotesData.travel.notes.remove (  noteObjId );
				noteAndRoute.note.distance = distance;
				noteAndRoute.note.latLng = attachPoint;
				noteAndRoute.note.chainedDistance = selectedRoute.chainedDistance;

				// ... the chainedDistance is adapted...
				selectedRoute.notes.add ( noteAndRoute.note );
				// and the notes sorted
				selectedRoute.notes.sort ( function ( a, b ) { return a.distance - b.distance; } );

				require ( '../core/MapEditor' ) ( ).redrawNote ( noteAndRoute.note );
				require ( '../core/ItineraryEditor' ) ( ).updateItinerary ( );
				require ( '../core/ItineraryEditor' ) ( ).updateTravelNotes ( );
				// and the HTML page is adapted
				require ( '../core/TravelEditor' ) ( ).updateRoadBook ( );
			}
		};

		/*
		--- _DetachNoteFromRoute function -----------------------------------------------------------------------------

		This function transform a route note into a travel note
		
		parameters:
		- noteObjId : the objId of the note to transform

		---------------------------------------------------------------------------------------------------------------
		*/

		var _DetachNoteFromRoute = function ( noteObjId ) {
			// the note and the route are searched
			var noteAndRoute = _DataSearchEngine.getNoteAndRoute ( noteObjId );
			noteAndRoute.route.notes.remove ( noteObjId );
			noteAndRoute.note.distance = -1;
			noteAndRoute.note.chainedDistance = 0;
			_TravelNotesData.travel.notes.add ( noteAndRoute.note );
			
			require ( '../core/ItineraryEditor' ) ( ).updateItinerary ( );
			require ( '../core/ItineraryEditor' ) ( ).updateTravelNotes ( );
			// and the HTML page is adapted
			require ( '../core/TravelEditor' ) ( ).updateRoadBook ( );
		};
		
		return {	
		
			/*
			--- newNote method ----------------------------------------------------------------------------------------

			This method create a new TravelNotes note object
			
			parameters:
			- latLng : the coordinates of the new note

			-----------------------------------------------------------------------------------------------------------
			*/

			newNote : function ( latLng ) {
				var note = require ( '../data/Note' ) ( );
				note.latLng = latLng;
				note.iconLatLng = latLng;
				
				return note;
			},
		
			/*
			--- newRouteNote method -----------------------------------------------------------------------------------

			This method start the creation of a TravelNotes note object linked with a route
			
			parameters:
			- routeObjId : the objId of the route to witch the note will be linked
			- event : the event that have triggered the method ( a right click on the 
			route polyline and then a choice in a context menu)

			-----------------------------------------------------------------------------------------------------------
			*/

			newRouteNote : function ( routeObjId, event ) {
				// the nearest point and distance on the route is searched
				var latLngDistance = require ( '../core/RouteEditor' ) ( ).getClosestLatLngDistance ( 
					_DataSearchEngine.getRoute ( routeObjId ),
					[ event.latlng.lat, event.latlng.lng ] 
				);
				
				// the note is created
				var note = this.newNote ( latLngDistance.latLng );
				note.distance = latLngDistance.distance;
				
				// and displayed in a dialog box
				require ( '../UI/NoteDialog' ) ( note, routeObjId, true );
			},
			
			/*
			--- newSearchNote method --------------------------------------------------------------------------------

			This method start the creation of a TravelNotes note object linked to a maneuver
			
			parameters:
			- searchResult : the search results with witch the note will be created

			-----------------------------------------------------------------------------------------------------------
			*/

			newSearchNote : function ( searchResult ) {
				var note = this.newNote ( [ searchResult.lat, searchResult.lon ] );
				
				note.address = ( '' !== searchResult.housenumber ? searchResult.housenumber + ' ' : '' ) +
					( '' !== searchResult.street ? searchResult.street + ' ' : '' ) +
					searchResult.city;
				
				note.url = searchResult.website;
				note.phone = searchResult.phone;
				note.tooltipContent = searchResult.name;
				note.popupContent = searchResult.name;
				
				require ( '../UI/NoteDialog' ) ( note, -1, true );
			},
		
			/*
			--- newManeuverNote method --------------------------------------------------------------------------------

			This method start the creation of a TravelNotes note object linked to a maneuver
			
			parameters:
			- maneuverObjId : the objId of the maneuver
			- latLng : the coordinates of the maneuver

			-----------------------------------------------------------------------------------------------------------
			*/

			newManeuverNote : function ( maneuverObjId, latLng ) {
				// the nearest point and distance on the route is searched
				var latLngDistance = require ( '../core/RouteEditor' ) ( ).getClosestLatLngDistance ( 
					_TravelNotesData.editedRoute,
					latLng
				);
				// the maneuver is searched
				var maneuver = _TravelNotesData.editedRoute.itinerary.maneuvers.getAt ( maneuverObjId );

				// the note is created
				var note = this.newNote ( latLng );
				note.distance = latLngDistance.distance;
				note.iconContent = "<div class='TravelNotes-ManeuverNote TravelNotes-ManeuverNote-" + maneuver.iconName + "'></div>";
				note.popupContent = maneuver.instruction;
				note.width = 40;
				note.height = 40;

				// and displayed in a dialog box
				require ( '../UI/NoteDialog' ) ( note, _TravelNotesData.editedRoute.objId, true );
			},
		
			/*
			--- newTravelNote method ----------------------------------------------------------------------------------

			This method start the creation f a TravelNotes note object
			
			parameters:
			- latLng : the coordinates of the new note

			-----------------------------------------------------------------------------------------------------------
			*/

			newTravelNote : function ( latLng ) {
				// the note is created
				var note = this.newNote ( latLng );

				// and displayed in a dialog box
				require ( '../UI/NoteDialog' ) ( note, -1, true );
			},
		
			/*
			--- endNoteDialog method ----------------------------------------------------------------------------------

			This method is called when the user push on the ok button of the note dialog
			
			parameters:
			- note : the note modified in the dialog box
			- routeObjId : the TravelNotes route objId passed to the note dialog box

			-----------------------------------------------------------------------------------------------------------
			*/

			endNoteDialog : function ( note, routeObjId ) {
				var noteAndRoute = _DataSearchEngine.getNoteAndRoute ( note.objId );
				if ( noteAndRoute.note ) {
					// it's an existing note. The note is changed on the map
					require ( '../core/MapEditor' ) ( ).editNote ( note );
					if ( ! noteAndRoute.route ) {
						// it's a travel note. UI is also adapted
						require ( '../UI/ItineraryEditorUI' ) ( ).setTravelNotes ( );
					}
				}
				else {
					// it's a new note
					if ( -1 === routeObjId ) {
						// it's a global note
						_TravelNotesData.travel.notes.add ( note );
						require ( '../UI/ItineraryEditorUI' ) ( ).setTravelNotes ( );
					}
					else {
						// the note is linked with a route, so...
						var route = _DataSearchEngine.getRoute ( routeObjId );
						route.notes.add ( note );
						// ... the chainedDistance is adapted...
						note.chainedDistance = route.chainedDistance;
						// and the notes sorted
						route.notes.sort ( function ( a, b ) { return a.distance - b.distance; } );
						// and in the itinerary is adapted...
						require ( '../core/ItineraryEditor' ) ( ).setItinerary ( );
					}
					// the note is added to the leaflet map
					require ( '../core/MapEditor' ) ( ).addNote ( note );
				}
				// and the HTML page is adapted
				require ( '../core/TravelEditor' ) ( ).updateRoadBook ( );
			},	
		
			/*
			--- editNote method ---------------------------------------------------------------------------------------

			This method start the modification of a note
			
			parameters:
			- noteObjId : the objId of the edited note

			-----------------------------------------------------------------------------------------------------------
			*/

			editNote : function ( noteObjId ) {
				var noteAndRoute = _DataSearchEngine.getNoteAndRoute ( noteObjId );
				require ( '../UI/NoteDialog' ) ( noteAndRoute.note, null === noteAndRoute.route ? -1 : noteAndRoute.route.objId, false );
			},
		
			/*
			--- removeNote method -------------------------------------------------------------------------------------

			This method removes a note
			
			parameters:
			- noteObjId : the objId of the note to remove

			-----------------------------------------------------------------------------------------------------------
			*/

			removeNote : function ( noteObjId ) {
				// the note is removed from the leaflet map
				require ( '../core/MapEditor' ) ( ).removeObject ( noteObjId );
				// the note and the route are searched
				var noteAndRoute = _DataSearchEngine.getNoteAndRoute ( noteObjId );
				if ( noteAndRoute.route ) {
					// it's a route note
					noteAndRoute.route.notes.remove ( noteObjId );
					require ( '../core/ItineraryEditor' ) ( ).setItinerary ( );
				}
				else {
					// it's a travel note
					_TravelNotesData.travel.notes.remove ( noteObjId );
				}
				// and the HTML page is adapted
				require ( '../core/TravelEditor' ) ( ).updateRoadBook ( );
			},
		
			/*
			--- hideNotes method -------------------------------------------------------------------------------------

			This method hide the notes on the map
			
			-----------------------------------------------------------------------------------------------------------
			*/

			hideNotes : function ( ) {
				var notesIterator = _TravelNotesData.travel.notes.iterator;
				while ( ! notesIterator.done ) {
					require ( '../core/MapEditor' ) ( ).removeObject ( notesIterator.value.objId );
				}
				var routesIterator = _TravelNotesData.travel.routes.iterator;
				while ( ! routesIterator.done ) {
					notesIterator = routesIterator.value.notes.iterator;
					while ( ! notesIterator.done ) {
						require ( '../core/MapEditor' ) ( ).removeObject ( notesIterator.value.objId );					
					}
				}
			},
			
			/*
			--- showNotes method -------------------------------------------------------------------------------------

			This method show the notes on the map
			
			-----------------------------------------------------------------------------------------------------------
			*/

			showNotes : function ( ) {
				this.hideNotes ( );
				var notesIterator = _TravelNotesData.travel.notes.iterator;
				while ( ! notesIterator.done ) {
					require ( '../core/MapEditor' ) ( ).addNote ( notesIterator.value );
				}
				var routesIterator = _TravelNotesData.travel.routes.iterator;
				while ( ! routesIterator.done ) {
					notesIterator = routesIterator.value.notes.iterator;
					while ( ! notesIterator.done ) {
						require ( '../core/MapEditor' ) ( ).addNote ( notesIterator.value );					
					}
				}
			},
			
			/*
			--- zoomToNote method -------------------------------------------------------------------------------------

			This method zoom to a given note
			
			-----------------------------------------------------------------------------------------------------------
			*/

			zoomToNote : function ( noteObjId ) {
				require ( '../core/MapEditor' ) ( ).zoomToPoint ( _DataSearchEngine.getNoteAndRoute ( noteObjId).note.latLng );
			},
			
			/*
			--- getMapContextMenu method ------------------------------------------------------------------------------

			This method gives the note part of the map context menu
			
			parameters:
			- latLng : the coordinates where the map was clicked

			-----------------------------------------------------------------------------------------------------------
			*/

			getMapContextMenu :function ( latLng ) {
				
				var contextMenu = [];
				contextMenu.push ( 
					{ 
						context : this, 
						name : _Translator.getText ( "NoteEditor - New travel note" ), 
						action : this.newTravelNote,
						param : latLng
					} 
				);
				contextMenu.push ( 
					{ 
						context : this, 
						name : _Translator.getText ( "NoteEditor - Hide notes" ), 
						action : this.hideNotes
					} 
				);
				contextMenu.push ( 
					{ 
						context : this, 
						name : _Translator.getText ( "NoteEditor - Show notes" ), 
						action : this.showNotes
					} 
				);
				
				return contextMenu;
			},
		
			/*
			--- getNoteContextMenu method -----------------------------------------------------------------------------

			This method gives the note context menu
			
			parameters:
			- noteObjId : the note objId that was clicked

			-----------------------------------------------------------------------------------------------------------
			*/

			getNoteContextMenu :function ( noteObjId ) {
				var contextMenu = [];
				contextMenu.push ( 
					{ 
						context : this, 
						name : _Translator.getText ( "NoteEditor - Edit this note" ), 
						action : this.editNote,
						param : noteObjId
					} 
				);
				contextMenu.push ( 
					{ 
						context : this, 
						name : _Translator.getText ( "NoteEditor - Delete this note" ), 
						action : this.removeNote,
						param : noteObjId
					} 
				);
				contextMenu.push ( 
					{ 
						context : this, 
						name : _Translator.getText ( "NoteEditor - Zoom to note" ), 
						action : this.zoomToNote,
						param : noteObjId
					} 
				);
				
				var route = _DataSearchEngine.getNoteAndRoute ( noteObjId ).route;
				contextMenu.push ( 
					{ 
						context : this, 
						name : route ?  _Translator.getText ( "NoteEditor - Detach note from route" ) : _Translator.getText ( "NoteEditor - Attach note to route" ), 
						action : ( ( -1 === _TravelNotesData.routeEdition.routeInitialObjId ) ? ( route ? this.detachNoteFromRoute : this.attachNoteToRoute ) : null ),
						param : noteObjId
					} 
				);
				
				return contextMenu;
			},
			
			attachNoteToRoute : function ( noteObjId ) { _AttachNoteToRoute ( noteObjId ); },
			
			detachNoteFromRoute : function ( noteObjId ) { _DetachNoteFromRoute ( noteObjId ); },
			
			/*
			--- getNoteHTML method ------------------------------------------------------------------------------------

			This method returns an HTML string with the note contents. This string will be used in the
			note popup and on the roadbook page
			
			parameters:
			- note : the TravelNotes object
			- classNamePrefix : a string that will be added to all the HTML classes

			-----------------------------------------------------------------------------------------------------------
			*/

			getNoteHTML : function ( note, classNamePrefix ) {
			
			var noteText = '';
				if ( 0 !== note.tooltipContent.length ) {
					noteText += '<div class="' + classNamePrefix + 'NoteHtml-TooltipContent">' + note.tooltipContent + '</div>';
				}
				if ( 0 !== note.popupContent.length ) {
					noteText += '<div class="' + classNamePrefix + 'NoteHtml-PopupContent">' + note.popupContent + '</div>';
				}
				if ( 0 !== note.address.length ) {
					noteText += '<div class="' + classNamePrefix + 'NoteHtml-Address">' + _Translator.getText ( 'NoteEditor - Address' )  + note.address + '</div>';
				}
				if ( 0 !== note.phone.length ) {
					noteText += '<div class="' + classNamePrefix + 'NoteHtml-Phone">' + _Translator.getText ( 'NoteEditor - Phone' )  + note.phone + '</div>';
				}
				if ( 0 !== note.url.length ) {
					noteText += '<div class="' + classNamePrefix + 'NoteHtml-Url">' + _Translator.getText ( 'NoteEditor - Link' ) + '<a href="' + note.url + '" target="_blank">' + note.url.substr ( 0, 40 ) + '...' +'</a></div>';
				}
				noteText += '<div class="' + classNamePrefix + 'NoteHtml-LatLng">' + 
					_Translator.getText ( 
						'NoteEditor - Latitude Longitude',
						{ 
							lat : _Utilities.formatLat ( note.lat ),
							lng : _Utilities.formatLng ( note.lng )
						}
					) + '</div>';
					
				if ( -1 !== note.distance ) {
					noteText += '<div class="' + classNamePrefix + 'NoteHtml-Distance">' +
						_Translator.getText ( 
							'NoteEditor - Distance', 
							{ 
								distance: _Utilities.formatDistance ( note.chainedDistance + note.distance )
							}
						) + '</div>';
				}
				
				return noteText;
			}		
		};
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