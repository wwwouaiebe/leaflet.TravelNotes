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
			require ('./UI/ContextMenu' ) ( event, _LeftUserContextMenu );
		};
		var onMapContextMenu = function ( event ) {
			require ('./UI/ContextMenu' ) ( event, _RightUserContextMenu );
		};

		var _Map;

		return {

			/* --- public methods --- */
			
			/* addControl ( ) method --- 
			
			This method add the control 
			
			Parameters :
			
			*/

			addControl : function ( map, divControlId, options ) {
				global.LeafletTravelObjId = 0;
				
				var _TravelData = require ( './Data/TravelData' ) ( );
				_TravelData.object =
				{
					name : "TravelData sample",
					routes : 
					[
						{
							name : "Chemin du Sârtê",
							wayPoints : 
							[
								{
									name : "Chemin du Sârtê 1 - Anthisnes",
									lat : 50.50881,
									lng : 5.49314,
									objId : -1,
									objType : 
									{
										name : "WayPoint",
										version : "1.0.0"
									}
								},
								{
									name : "Chemin du Sârtê 22 - Anthisnes",
									lat : 50.50937,
									lng : 5.49470,
									objId : -2,
									objType :
									{
										name : "WayPoint",
										version : "1.0.0"
									}
								}
							],
							notes : [],
							geom :
							{
								pnts : "w~xi_BwwgnIaHkLgIkUmEyTcLie@",
								precision :6,
								color : "#0000ff",
								weight : "5",
								objId : -3,
								objType :
								{
									name : "Geom",
									version : "1.0.0"
								}
							},
							objId : -4,
							objType :
							{
								name : "Route",
								version : require ( './UI/Translator' ) ( ).getText ( 'Version' )
							}
						}
					],
					notes : [],
					objId : -5,
					objType : 
					{
						name : "TravelData",
						version : "1.0.0"
					}
				};

				console.log ( _TravelData.object );


				if ( divControlId )	{
					document.getElementById ( divControlId ).appendChild ( require ( './UI/UserInterface' ) ( ).UI );
					var initialRoutes = require ( './Data/TravelData' ) ( ).routes;
					require ( './UI/RoutesListEditorUI' ) ( ).writeRoutesList ( initialRoutes );
				}	
				else {
					if ( typeof module !== 'undefined' && module.exports ) {
						map.addControl ( require ('./L.Travel.Control' ) ( options ) );
					}
				}
				_Map = map;
			},
			
			addMapContextMenu : function ( leftButton, rightButton ) {
				if ( leftButton ) {
					_Map.on ( 'click', onMapClick );
				}
				if ( rightButton ) {
					_Map.on ( 'contextmenu', onMapClick );
				}
			},
			get rightContextMenu ( ) { return _RightContextMenu; },
			
			set rightContextMenu ( RightContextMenu ) { 
				if  ( ( RightContextMenu ) && ( ! _RightContextMenu ) ) {
					_Map.on ( 'contextmenu', onMapContextMenu );
					_RightContextMenu = true;
				}
				else if ( ( ! RightContextMenu ) && ( _RightContextMenu ) ) {
					_Map.off ( 'contextmenu', onMapContextMenu );
					_RightContextMenu = false;
				}
			},
			
			get leftContextMenu ( ) { return _LeftContextMenu; },
			
			set leftContextMenu ( LeftContextMenu ) { 
				if  ( ( LeftContextMenu ) && ( ! _LeftContextMenu ) ) {
					_Map.on ( 'click', onMapClick );
					_LeftContextMenu = true;
				}
				else if ( ( ! LeftContextMenu ) && ( _LeftContextMenu ) ) {
					_Map.off ( 'click', onMapClick );
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
