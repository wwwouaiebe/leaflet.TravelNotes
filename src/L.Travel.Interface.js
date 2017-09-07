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
	
	
	
	L.Travel = L.Travel || {};
	L.travel = L.travel || {};
	
	var _LeftUserContextMenu = [];
	var _RightUserContextMenu = [];
	var _RightContextMenu = false;
	var _LeftContextMenu = false;

	
	/* 
	--- L.Travel.Interface object -----------------------------------------------------------------------------
	
	This object contains all you need to use Travel :-)
	
	Patterns : Closure
	------------------------------------------------------------------------------------------------------------------------
	*/

	L.Travel.getInterface = function ( ) {


		var onMapClick = function ( event ) {
			require ('./UI/ContextMenu' ) ( event, require ( './core/RouteEditor' ) ( ).getMapContextMenu ( [ event.latlng.lat, event.latlng.lng ] ).concat ( _LeftUserContextMenu ) );
		};
		var onMapContextMenu = function ( event ) {
			require ('./UI/ContextMenu' ) ( event, require ( './core/RouteEditor' ) ( ).getMapContextMenu ( [ event.latlng.lat, event.latlng.lng ] ).concat ( _RightUserContextMenu ) );
		};

		return {

			/* --- public methods --- */
			
			/* addControl ( ) method --- 
			
			This method add the control 
			
			Parameters :
			
			*/

			addControl : function ( map, divControlId, options ) {
				
				global.travelObjId = 0;
				global.editedRoute = require ( './Data/Route') ( );
				global.editedRoute.routeChanged = false;
				global.editedRoute.routeInitialObjId = -1;
				global.travelData = require ( './Data/TravelData' ) ( );
				
				require ( './util/Utilities' ) ( ).readURL ( );
				
				if ( divControlId )	{
					document.getElementById ( divControlId ).appendChild ( require ( './UI/UserInterface' ) ( ).UI );
				}	
				else {
					if ( typeof module !== 'undefined' && module.exports ) {
						map.addControl ( require ('./L.Travel.Control' ) ( options ) );
					}
				}
				
				require ( './UI/TravelEditorUI' ) ( ).setRoutesList ( global.travelData.routes );
				
				global.map = map;
				global.map.travelObjects = new Map ( );
			},
			
			addMapContextMenu : function ( leftButton, rightButton ) {
				if ( leftButton ) {
					global.map.on ( 'click', onMapClick );
				}
				if ( rightButton ) {
					global.map.on ( 'contextmenu', onMapClick );
				}
			},
			get rightContextMenu ( ) { return _RightContextMenu; },
			
			set rightContextMenu ( RightContextMenu ) { 
				if  ( ( RightContextMenu ) && ( ! _RightContextMenu ) ) {
					global.map.on ( 'contextmenu', onMapContextMenu );
					_RightContextMenu = true;
				}
				else if ( ( ! RightContextMenu ) && ( _RightContextMenu ) ) {
					global.map.off ( 'contextmenu', onMapContextMenu );
					_RightContextMenu = false;
				}
			},
			
			get leftContextMenu ( ) { return _LeftContextMenu; },
			
			set leftContextMenu ( LeftContextMenu ) { 
				if  ( ( LeftContextMenu ) && ( ! _LeftContextMenu ) ) {
					global.map.on ( 'click', onMapClick );
					_LeftContextMenu = true;
				}
				else if ( ( ! LeftContextMenu ) && ( _LeftContextMenu ) ) {
					global.map.off ( 'click', onMapClick );
					_LeftContextMenu = false;
				}
			},
			
			get leftUserContextMenu ( ) { return _LeftUserContextMenu; },
			
			set leftUserContextMenu ( LeftUserContextMenu ) {_LeftUserContextMenu = LeftUserContextMenu; },
			
			get rightUserContextMenu ( ) { return _RightUserContextMenu; },
			
			set rightUserContextMenu ( RightUserContextMenu ) {_RightUserContextMenu = RightUserContextMenu; },
			
			get version ( ) { return '1.0.0'; }
		};
	};
	
	/* --- End of L.Travel.Interface object --- */		

	L.travel.interface = function ( ) {
		return L.Travel.getInterface ( );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = L.travel.interface;
	}

}());
