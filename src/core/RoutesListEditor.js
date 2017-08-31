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

	var _TravelData = require ( '../Data/TravelData' ) ( );
	var _RoutesListChanged = false;
	
	var getRoutesListEditor = function ( ) {

		var _RoutesListEditorUI = require ( '../UI/RoutesListEditorUI' ) ( );

		return {
			
			addRoute : function ( ) {
				_RoutesListChanged = true;
				var newRoute = require ( '../Data/Route' ) ( );
				_TravelData.routes.add ( newRoute );
				_RoutesListEditorUI.writeRoutesList ( _TravelData.routes );
			},

			editRoute : function ( routeObjId ) {
				_RoutesListChanged = true;
				require ( './RouteEditor' ) ( ).editRoute ( routeObjId );
			},

			removeRoute : function ( routeObjId ) {
				_RoutesListChanged = true;
				_TravelData.routes.remove ( routeObjId );
				_RoutesListEditorUI.writeRoutesList ( _TravelData.routes );
			},

			removeAllRoutes : function ( routeObjId ) {
				_RoutesListChanged = true;
				_TravelData.routes.removeAll ( );
				_RoutesListEditorUI.writeRoutesList ( _TravelData.routes );
			},

			renameRoute : function ( routeObjId, routeName ) {
				_RoutesListChanged = true;
				_TravelData.routes.getAt ( routeObjId ).name = routeName;
				_RoutesListEditorUI.writeRoutesList ( _TravelData.routes );
			},

			swapRoute : function ( routeObjId, swapUp ) {
				_RoutesListChanged = true;
				_TravelData.routes.swap ( routeObjId, swapUp );
				_RoutesListEditorUI.writeRoutesList ( _TravelData.routes );
			}
		};
	};

	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getRoutesListEditor;
	}

}());
