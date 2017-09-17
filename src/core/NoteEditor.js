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
To do: translations
*/

( function ( ){
	
	'use strict';

	var _Translator = require ( '../UI/Translator' ) ( );
	var _DataManager = require ( '../Data/DataManager' ) ( );
	var _TravelUtilities = require ( '../util/TravelUtilities' ) ( );
	var _MapEditor = require ( '../core/MapEditor' ) ( );
	var _Utilities = require ( '../util/Utilities' ) ( );
	
	var getNoteEditor = function ( ) {
		
		return {	
			newNote : function ( latLng ) {
				var note = require ( '../data/Note' ) ( );
				note.latLng = latLng;
				note.iconLatLng = latLng;
				
				return note;
			},
			
			newRouteNote : function ( routeObjId, event ) {
				var latLngDistance = _TravelUtilities.getClosestLatLngDistance ( 
					_DataManager.getRoute ( routeObjId ),
					[ event.latlng.lat, event.latlng.lng ] 
				);
				var note = this.newNote ( latLngDistance.latLng );
				note.distance = latLngDistance.distance;
				require ( '../UI/NoteDialog' ) ( note, routeObjId );
			},
			
			newManeuverNote : function ( maneuverObjId, itineraryPointObjId ) {
				var latLng = _DataManager.editedRoute.itinerary.itineraryPoints.getAt (  itineraryPointObjId ).latLng;
				var latLngDistance = _TravelUtilities.getClosestLatLngDistance ( 
					_DataManager.editedRoute,
					latLng
				);
				var maneuver = _DataManager.editedRoute.itinerary.maneuvers.getAt ( maneuverObjId );
				var note = this.newNote ( latLng );
				note.distance = latLngDistance.distance;
				note.iconContent = "<div class='TravelNotes-ManeuverNote TravelNotes-ManeuverNote-" + maneuver.iconName + "'></div>";
				note.popupContent = maneuver.instruction;
				note.width = 40;
				note.height = 40;
				require ( '../UI/NoteDialog' ) ( note, _DataManager.editedRoute.objId );
			},
			
			newTravelNote : function ( latLng ) {
				var note = this.newNote ( latLng );
				require ( '../UI/NoteDialog' ) ( note, -1 );
			},
			
			endNoteDialog : function ( note, routeObjId ) {
				if ( _DataManager.getNoteAndRoute ( note.objId ).note ) {
					_MapEditor.editNote ( note );
					require ( '../UI/ItineraryEditorUI' ) ( ).setItinerary ( );
				}
				else {
					this.addNote ( note, routeObjId );
				}
			},	

			addNote : function ( note, routeObjId ) {
				if ( -1 === note.distance ) {
					_DataManager.travel.notes.add ( note );
				}
				else {
					var notes = _DataManager.getRoute ( routeObjId ).notes;
					notes.add ( note );
					notes.sort ( function ( a, b ) { return a.distance - b.distance; } );
					require ( '../UI/ItineraryEditorUI' ) ( ).setItinerary ( );
				}
				_MapEditor.addNote ( note );
			},

			editNote : function ( noteObjId ) {
				var noteAndRoute = _DataManager.getNoteAndRoute ( noteObjId );
				require ( '../UI/NoteDialog' ) ( noteAndRoute.note, null === noteAndRoute.route ? -1 : noteAndRoute.route.objId );
			},

			removeNote : function ( noteObjId ) {
				var noteAndRoute = _DataManager.getNoteAndRoute ( noteObjId );
				_MapEditor.removeObject ( noteObjId );
				if ( ! noteAndRoute.route ) {
					_DataManager.travel.notes.remove ( noteObjId );
				}
				else {
					noteAndRoute.route.notes.remove ( noteObjId );
					require ( '../UI/ItineraryEditorUI' ) ( ).setItinerary ( );
				}
			},
			
			getMapContextMenu :function ( latLng ) {
				var contextMenu = [];
				contextMenu.push ( 
					{ 
						context : this, 
						name : _Translator.getText ( "NoteEditor - new travel note" ), 
						action : this.newTravelNote,
						param : latLng
					} 
				);
				contextMenu.push ( 
					{ 
						context : _MapEditor, 
						name : _Translator.getText ( "NoteEditor - zoom to travel" ), 
						action : _MapEditor.zoomToTravel
					} 
				);
				contextMenu.push ( 
					{ 
						context : null,
						name : _Translator.getText ( "NoteEditor - About" ), 
						action : require ( '../UI/AboutDialog' )
					} 
				);
				
				return contextMenu;
			},
			
			getNoteHTML : function ( note, classNamePrefix ) {

			var noteText = '';
				if ( 0 !== note.tooltipContent.length ) {
					noteText += '<div class="' + classNamePrefix + 'NoteHtml-TooltipContent">' + note.tooltipContent + '</div>';
				}
					if ( 0 !== note.popupContent.length ) {
					noteText += '<div class="' + classNamePrefix + 'NoteHtml-PopupContent">' + note.popupContent + '</div>';
				}
				if ( 0 !== note.address.length ) {
					noteText += '<div class="' + classNamePrefix + 'NoteHtml-Address">' + _Translator.getText ( 'NoteEditor - address' )  + note.address + '</div>';
				}
				if ( 0 !== note.phone.length ) {
					noteText += '<div class="' + classNamePrefix + 'NoteHtml-Phone">' + _Translator.getText ( 'NoteEditor - phone' )  + note.phone + '</div>';
				}
				if ( 0 !== note.url.length ) {
					noteText += '<div class="' + classNamePrefix + 'NoteHtml-Url">' + _Translator.getText ( 'NoteEditor - url' ) + '<a href="' + note.url + '" target="_blank">' + note.url +'</a></div>';
				}
				noteText += '<div class="' + classNamePrefix + 'NoteHtml-LatLng">' + 
					_Translator.getText ( 
						'NoteEditor - latlng',
						{ 
							lat : _Utilities.formatLat ( note.lat ),
							lng : _Utilities.formatLng ( note.lng )
						}
					) + '</div>';
					
				if ( -1 !== note.distance ) {
					noteText += '<div class="' + classNamePrefix + 'NoteHtml-Distance">' +
						_Translator.getText ( 
							'NoteEditor - distance', 
							{ 
								distance: _Utilities.formatDistance ( note.distance )
							}
						) + '</div>';
				}
				
				return noteText;
			},
			
			getNoteContextMenu :function ( noteObjId ) {
				var contextMenu = [];
				contextMenu.push ( 
					{ 
						context : this, 
						name : _Translator.getText ( "NoteEditor - edit note" ), 
						action : this.editNote,
						param : noteObjId
					} 
				);
				contextMenu.push ( 
					{ 
						context : this, 
						name : _Translator.getText ( "NoteEditor - delete note" ), 
						action : this.removeNote,
						param : noteObjId
					} 
				);
				
				return contextMenu;
			}
		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getNoteEditor;
	}

}());
