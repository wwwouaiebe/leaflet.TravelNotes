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

( function ( ){
	
	'use strict';

	var getTravelEditor = function ( ) {

		var _TravelEditorUI = require ( '../UI/TravelEditorUI' ) ( );

		return {
			
			addRoute : function ( ) {
				global.travelData.routes.add ( require ( '../Data/Route' ) ( ) );
				_TravelEditorUI.setRoutesList ( );
			},

			editRoute : function ( routeObjId ) {
				require ( './RouteEditor' ) ( ).editRoute ( routeObjId );
			},

			removeRoute : function ( routeObjId ) {
				global.travelData.routes.remove ( routeObjId );
				_TravelEditorUI.setRoutesList ( );
			},

			removeAllRoutes : function ( routeObjId ) {
				global.travelData.routes.removeAll ( );
				global.travelData.routes.add ( require ( '../Data/Route' ) ( ) );
				_TravelEditorUI.setRoutesList (  );
			},

			renameRoute : function ( routeObjId, routeName ) {
				global.travelData.routes.getAt ( routeObjId ).name = routeName;
				_TravelEditorUI.setRoutesList ( );
				if ( routeObjId === global.editedRoute.routeInitialObjId ) {
					global.editedRoute.name = routeName;
				}
			},

			swapRoute : function ( routeObjId, swapUp ) {
				global.travelData.routes.swap ( routeObjId, swapUp );
				_TravelEditorUI.setRoutesList ( );
			}
		};
	};

	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getTravelEditor;
	}

}());
