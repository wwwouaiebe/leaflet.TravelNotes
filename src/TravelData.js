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
	
	var _ObjName = 'TravelData';
	var _ObjVersion = '1.0.0';
	
	// one and only one object TravelData is possible
	
	var _Name = '';
	var _Routes = [ ];
	var _ObjId = -1;
	var _UndoList = [];

	var getTravelData = function ( ) {
		
		return {
			clear : function ( ) {
				for ( var routeCounter = 0; routeCounter < _Routes.length; routeCounter ++ ) {
					_UndoList.push ( _Routes [ routeCounter ] );
				}
				this.object = 
				{name : "",routes : [{name : "",wayPoints : [{name : "",lat : 0,lng : 0,objId : -1,objName : "WayPoint",objVersion : "1.0.0"},{name : "",lat : 0,lng : 0,objId : -1,objName : "WayPoint",objVersion : "1.0.0"}],geom :{pnts : "",precision :6,color : "#000000",weight : "5",objId : -1,objName : "Geom",objVersion : "1.0.0"},objId : -1,objName : "Route",objVersion : "1.0.0"}],objId : -1,objName : "TravelData",objVersion : "1.0.0"};
			},
			
			removeAllRoutes : function ( ) {
				for ( var routeCounter = 0; routeCounter < _Routes.length; routeCounter ++ ) {
					_UndoList.push ( _Routes [ routeCounter ] );
				}
				_Routes.length = 0;
				console.log ( _UndoList );
			},
			addRoute : function ( uiObjId ) {
				var newRoute = require ( './Route' )( );
				newRoute.uiObjId = uiObjId;

				console.log ( uiObjId );
				console.log ( newRoute.uiObjId );

				_Routes.push ( newRoute );
				console.log ( _Routes );
			},
			get routes ( ) { return _Routes; },
			get objId ( ) { return _ObjId; },
			get objName ( ) { return _ObjName; },
			get objVersion ( ) { return _ObjVersion; },

			get object ( ) {
				var routes = [];
				for ( var RoutesCounter = 0; RoutesCounter < _Routes.length ;RoutesCounter ++ ) {
					routes.push ( _Routes [ RoutesCounter ].object );
				}
				return {
					name : _Name,
					routes : _Routes,
					objId : _ObjId,
					objName : _ObjName,
					objVersion : _ObjVersion
				};
			},
			set object ( Object ) {
				if ( ! Object.objVersion ) {
					throw 'No ObjVersion for TravelData';
				}
				if ( '1.0.0' !== Object.objVersion ) {
					throw 'invalid objVersion for TravelData';
				}
				if ( ! Object.objName ) {
					throw 'No objName for TravelData';
				}
				if ( 'TravelData' !== Object.objName ) {
					throw 'Invalid objName for TravelData';
				}
				_Name = Object.name || '';
				_Routes.length = 0;
				for ( var routesCounter = 0; routesCounter < Object.routes.length; routesCounter ++ ) {
					var tmpRoute = require ( './Route' ) ( );
					tmpRoute.object = Object.routes [ routesCounter ];
					_Routes.push ( tmpRoute );
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