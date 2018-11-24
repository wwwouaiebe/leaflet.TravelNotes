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
--- Travel.js file ----------------------------------------------------------------------------------------------------
This file contains:
	- the Travel object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
Doc reviewed 20170926
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

(function() {

	'use strict';

	var _ObjType = require ( '../data/ObjType' ) ( 'Travel', require ( './Version' ) );

	var Travel = function ( ) {

		// Private variables

		var _Name = 'TravelNotes';

		var _Routes = require ( '../data/Collection' ) ( 'Route' );

		var _Notes = require ( '../data/Collection' ) ( 'Note' );

		var _ObjId = require ( '../data/ObjId' ) ( );
		
		var _UserData = {};

		return {

			// getters and setters...

			get routes ( ) { return _Routes; },

			get notes ( ) { return _Notes; },

			get name ( ) { return _Name; },
			set name ( Name ) { _Name = Name;},

			get userData ( ) { return _UserData; },
			set userData ( UserData ) { _UserData = UserData;},

			get objId ( ) { return _ObjId; },

			get objType ( ) { return _ObjType; },

			get object ( ) {
				return {
					name : _Name,
					routes : _Routes.object,
					notes : _Notes.object,
					userData : _UserData,
					objId : _ObjId,
					objType : _ObjType.object
				};
			},
			set object ( Object ) {
				Object = _ObjType.validate ( Object );
				_Name = Object.name || '';
				_UserData = Object.userData || {};
				_Routes.object = Object.routes || [];
				_Notes.object = Object.notes || [];
				_ObjId = require ( '../data/ObjId' ) ( );
			}
		};
	};
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = Travel;
	}

} ) ( );

/*
--- End of Travel.js file ---------------------------------------------------------------------------------------------
*/