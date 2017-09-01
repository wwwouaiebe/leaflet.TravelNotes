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


(function() {
	
	'use strict';
	
	var _ObjType = require ( './ObjType' ) ( 'TravelData', '1.0.0' );
	
	// one and only one object TravelData is possible
	
	var _Name = '';
	var _Routes = require ( './Collection' ) ( 'Route' );
	var _Notes = require ( './Collection' ) ( 'Note' );
	var _ObjId = -1;

	var getTravelData = function ( ) {
		
		return {
			get routes ( ) { return _Routes; },
			
			get notes ( ) { return _Notes; },
			
			get objId ( ) { return _ObjId; },
			get objType ( ) { return _ObjType; },
			
			get object ( ) {
				var routes = [ ];
				var routeIterator = this.routes.iterator;
				while ( ! routeIterator.done ) {
					routes.push ( routeIterator.value.object );
				}
				var notes = [ ];
				var notesIterator = this.notes.iterator;
				while ( ! notesIterator.done ) {
					notes.push ( notesIterator.value.object );
				}
				return {
					name : _Name,
					routes : routes,
					notes : notes,
					objId : _ObjId,
					objType : _ObjType
				};
			},
			
			set object ( Object ) {
				Object = _ObjType.validate ( Object );
				_Name = Object.name || '';
				_Routes.removeAll ( );
				for ( var routesCounter = 0; routesCounter < Object.routes.length; routesCounter ++ ) {
					var newRoute = require ( './Route' ) ( );
					newRoute.object = Object.routes [ routesCounter ];
					_Routes.add ( newRoute );
				}
				_Notes.removeAll ( );
				for ( var notesCounter = 0; notesCounter < Object.notes.length; notesCounter ++ ) {
					var newNote = require ( './Note' ) ( );
					newNote.object = Object.notes [ notesCounter ];
					_Notes.add ( newNote );
				}
				_ObjId = require ( './ObjId' ) ( );
			}
		};
	};
	
	/* --- End of getTravelData function --- */
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getTravelData;
	}

} ) ( );

/* --- End of MapData.js file --- */