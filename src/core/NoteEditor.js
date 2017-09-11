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
	
	var getNoteEditor = function ( ) {
		
		return {	
			newNote : function ( latLng ) {
				var note = require ( '../data/Note' ) ( );
				note.latLng = latLng;
				note.iconLatLng = latLng;
				
				return note;
			},
			
			newRouteNote : function ( routeObjId, event ) {
				var latLngDistance = _TravelUtilities.getClosestLatLngDistance ( routeObjId , [ event.latlng.lat, event.latlng.lng ] );
				var note = this.newNote ( latLngDistance.latLng );
				note.distance = latLngDistance.distance;
				require ( '../UI/NoteDialog' ) ( note, routeObjId );
			},
			
			newTravelNote : function ( latLng ) {
				var note = this.newNote ( latLng );
				require ( '../UI/NoteDialog' ) ( note, -1 );
			},
			
			endNoteDialog : function ( note, routeObjId ) {
				if ( _DataManager.getNoteAndRoute ( note.objId ).note ) {
					require ( '../core/MapEditor' ) ( ).editNote ( note );
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
					_DataManager.travel.routes.getAt ( routeObjId ).notes.add ( note );
				}
				require ( '../core/MapEditor' ) ( ).addNote ( note );
			},

			editNote : function ( noteObjId ) {
				var noteAndRoute = _DataManager.getNoteAndRoute ( noteObjId );
				require ( '../UI/NoteDialog' ) ( noteAndRoute.note, null === noteAndRoute.route ? -1 : noteAndRoute.route.objId );
			},

			removeNote : function ( noteObjId ) {
				var noteAndRoute = _DataManager.getNoteAndRoute ( noteObjId );
				require ( '../core/MapEditor' ) ( ).removeObject ( noteObjId );
				if ( ! noteAndRoute.route ) {
					_DataManager.travel.notes.remove ( noteObjId );
				}
				else {
					_DataManager.notes.remove ( noteObjId );
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
				
				return contextMenu;
			},
			
			getNoteContextMenu :function ( noteObjId ) {
				var contextMenu = [];
				var noteAndRoute = _DataManager.getNoteAndRoute ( noteObjId );
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
						action : ! noteAndRoute.route ? this.removeNote : null,
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
