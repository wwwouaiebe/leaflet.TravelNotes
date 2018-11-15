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
--- ObjType.js file ---------------------------------------------------------------------------------------------------
This file contains:
	- the ObjType object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
Doc reviewed 20170926
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

(function() {

	'use strict';

	var ObjType = function ( name, version ) {

		// Private variables

		var _Name = name;

		var _Version = version;

		return {

			// getters and setters...

			get name ( ) { return _Name; },

			get version ( ) { return _Version; },

			get object ( ) {
				return {
					name : _Name,
					version : _Version
				};
			},

			validate : function ( object ) {
				if ( ! object.objType ) {
					throw 'No objType for ' + _Name;
				}
				if ( ! object.objType.name ) {
					throw 'No name for ' + _Name;
				}
				if ( _Name !== object.objType.name ) {
					throw 'Invalid name for ' + _Name;
				}
				if ( ! object.objType.version ) {
					throw 'No version for ' + _Name;
				}
				if ( _Version !== object.objType.version ) {
					if ( '1.0.0' === object.objType.version ) {
						//start upgrade from 1.0.0 to 1.1.0
						if ( 'Route' === object.objType.name ) {
							object.dashArray = 0;
							object.hidden = false;
						}
						object.objType.version = '1.1.0';
						//end upgrade from 1.0.0 to 1.1.0
					}
					if ( '1.1.0' === object.objType.version ) {
						object.objType.version = '1.2.0';
						//end upgrade from 1.1.0 to 1.2.0
					}
					if ( '1.2.0' === object.objType.version ) {
						object.objType.version = '1.3.0';
						//end upgrade from 1.2.0 to 1.3.0
					}
					if ( _Version !== object.objType.version ) {
						throw 'invalid version for ' + _Name;
					}
				}
				if ( ! object.objId ) {
					throw 'No objId for ' + _Name;
				}
				return object;
			}
		};
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = ObjType;
	}

} ) ( );

/*
--- End of ObjType.js file ----------------------------------------------------------------------------------------------
*/