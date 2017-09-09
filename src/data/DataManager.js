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
	
	var getDataManager = function ( ) {

		return {
			getNote : function ( noteObjId ) {
				var note = null;
				note = global.travelData.notes.getAt ( noteObjId );
				if ( note ) {
					return { note : note, route : null };
				}
				var routeIterator = global.travelData.routes.iterator;
				while ( ! routeIterator.done ) {
					note = routeIterator.value.notes.getAt ( noteObjId );
					if ( note ) {
						return { note : note, route : routeIterator.value };
					}
				}
				note = global.editedRoute.notes.getAt (noteObjId );
				if ( ! note ) {
					console.log ( 'Invalid noteObjId ' + noteObjId + ' for function DataManager.getNote ( )' );
				}
				
				return { note : note, route : global.editedRoute };
			},
			
			getRoute : function ( routeObjId ) {
				var route = null;
				route = global.travelData.routes.getAt ( layer.objId );
				if ( ! route ) {
					if ( layer.objId === global.editedRoute.objId ) {
						route = global.editedRoute;
					}
				}
				if ( ! route ) {
					console.log ( 'Invalid noteObjId ' + routeObjId + ' for function DataManager.getRoute ( )' );
				}
				
				return route;
			}
			
		};
	};
	
	/* --- End of getTravelData function --- */
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getDataManager;
	}

} ) ( );
