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
	
	var _ObjType = require ( './ObjType' ) ( 'Travel', require ( '../UI/Translator' ) ( ).getText ( 'Version' ) );
	
	// one and only one object Travel is possible
	
	var _Name = 'TravelNotes.trv';
	var _Routes = require ( './Collection' ) ( 'Route' );
	_Routes.add ( require ( './Route' ) ( ) );

	var _Notes = require ( './Collection' ) ( 'Note' );
	var _ObjId = -1;

	var getTravel = function ( ) {
		
		return {
			
			get name ( ) { return _Name; },
			
			set name ( Name ) { _Name = Name;},
			
			get routes ( ) { return _Routes; },
			
			get notes ( ) { return _Notes; },
			
			get objId ( ) { return _ObjId; },
			
			get objType ( ) { return _ObjType; },
			
			get object ( ) {
				return {
					name : _Name,
					routes : _Routes.object,
					notes : _Notes.object,
					objId : _ObjId,
					objType : _ObjType.object
				};
			},
			
			set object ( Object ) {
				Object = _ObjType.validate ( Object );
				_Name = Object.name || '';
				_Routes.object = Object.routes || [];
				_Notes.object = Object.notes || [];
				_ObjId = require ( './ObjId' ) ( );
			},
			toString : function ( ) { return this.object; }
		};
	};
	
	/* --- End of getTravel function --- */
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getTravel;
	}

} ) ( );

/* --- End of Travel.js file --- */