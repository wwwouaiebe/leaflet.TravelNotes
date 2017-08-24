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
	
	var getTravelData = function ( ) {

		var _Routes = [ ];
	
		var _ObjId = require ( './ObjId' ) ( );
		var _ObjName = 'TravelData';
		var _ObjVersion = '1.0.0';
		
		
		return {
			getRoute : function( RouteObjId ) { return _Routes [ Indice ]; },
			addRoute : function ( Route ) { _Routes.push ( Route ); },
			removeRoute : function ( RouteObjId ) { return; },

			get objId ( ) { return _ObjId; },
			get objName ( ) { return _ObjName; },
			get objVersion ( ) { return _ObjVersion; },

			get asObject ( ) {
				var Routes = [];
				for ( var RoutesCounter = 0; RoutesCounter < _Routes.length ;RoutesCounter ++ ) {
					Routes.push ( _Routes [ RoutesCounter ].asObject );
				}
				return {
					name : _Name,
					routes : Routes,
					objId : _ObjId,
					objName : _ObjName,
					objVersion : _ObjVersion
				};
			}
		};
	};
	
	/* --- End of getTravelData function --- */
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getTravelData ( );
	}

} ) ( );

/* --- End of MapData.js file --- */