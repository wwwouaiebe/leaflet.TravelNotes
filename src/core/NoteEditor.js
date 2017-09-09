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
	
	var getNoteEditor = function ( ) {
		
		return {			
			newNote :function ( latLng ) {
				var note = require ( '../data/Note' ) ( );
				//note.object = JSON.parse ( '{"iconHeight":"42","iconWidth":"42","iconContent":"iconContent","popupContent":"popupContent","tooltipContent":"tooltipContent","phone":"phone","url":"link","address":"address","categoryId":"","iconLat":0,"iconLng":0,"lat":0,"lng":0,"objId":13,"objType":{"name":"Note","version":"1.0.0"}}' );
				note.latLng = latLng;
				note.iconContent = '<div class="TravelNotes-MapNote TravelNotes-MapNoteCategory-0001"></div>';
				require ( '../UI/NoteDialog' ) ( note );
			},
			
			endNoteDialog : function ( note ) {
				try {
					global.travelData.notes.getAt ( note.objId );
					require ( '../core/MapEditor' ) ( ).editNote ( note );
				}
				catch ( e ) {
					this.addNote ( note );
				}
			},	
			
			addNote : function ( note ) {
				global.travelData.notes.add ( note );
				require ( '../core/MapEditor' ) ( ).addTravelNote ( note );
			},
			
			editNote : function ( noteObjId ) {
				require ( '../UI/NoteDialog' ) ( global.travelData.notes.getAt ( noteObjId ) );
			},
			
			removeNote : function ( noteObjId ) {
				console.log ( noteObjId );
			},
			
			getMapContextMenu :function ( latLng ) {
				var contextMenu = [];
				contextMenu.push ( 
					{ 
						context : this, 
						name : _Translator.getText ( "NoteEditor - new note" ), 
						action : this.newNote,
						param : latLng
					} 
				);
				
				return contextMenu;
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
