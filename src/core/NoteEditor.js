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
	
	var getNoteEditor = function ( ) {
		
		return {			
			newTravelNote :function ( latLng ) {
				var note = require ( '../data/Note' ) ( );
				note.latLng = latLng;
				note.iconLatLng = latLng;
				note.iconContent = '<div class="TravelNotes-MapNote TravelNotes-MapNoteCategory-0001"></div>';
				require ( '../UI/NoteDialog' ) ( note );
			},
			
			endNoteDialog : function ( note ) {
				try {
					_DataManager.travel.notes.getAt ( note.objId );
					require ( '../core/MapEditor' ) ( ).editNote ( note );
				}
				catch ( e ) {
					this.addTravelNote ( note );
				}
			},	
			
			addTravelNote : function ( note ) {
				_DataManager.travel.notes.add ( note );
				require ( '../core/MapEditor' ) ( ).addTravelNote ( note );
			},
			
			editNote : function ( noteObjId ) {
				var noteAndRoute = _DataManager.getNoteAndRoute ( noteObjId );
				require ( '../UI/NoteDialog' ) ( noteAndRoute.note );
			},

			removeNote : function ( noteObjId ) {
				var noteAndRoute = _DataManager.getNoteAndRoute ( noteObjId );
				if ( ! noteAndRoute.route ) {
					require ( '../core/MapEditor' ) ( ).removeObject ( noteObjId );
					_DataManager.travel.notes.remove ( noteObjId );
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
