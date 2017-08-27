(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
	
	var _ObjName = 'Geom';
	var _ObjVersion = '1.0.0';

	var getGeom = function ( ) {
		
		var _Pnts ="";
		var _Precision = 6;
		var _Color = "#000000";
		var _Weight = 5;
		
		var _ObjId = require ( './ObjId' ) ( );
		
		return {

			get pnts ( ) { return _Pnts; },
			set pnts ( Pnts ) { _Pnts = Pnts; },
			
			get precision ( ) { return _Precision; },
			set precision ( Precision ) { _Precision = Precision; },
			
			get color ( ) { return _Color; },
			set color ( Color ) { _Color = Color; },
			
			get weight ( ) { return _Weight; },
			set weight ( Weight ) { _Weight = Weight; },
			
			get objId ( ) { return _ObjId; },
			get objName ( ) { return _ObjName; },
			get objVersion ( ) { return _ObjVersion; },
			
			get object ( ) {
				return {
					pnts : _Pnts,
					precision : _Precision,
					color : _Color,
					weight : _Weight,
					objId : _ObjId,
					objName : _ObjName,
					objVersion : _ObjVersion
				};
			},
			set object ( Object ) {
				if ( ! Object.objVersion ) {
					throw 'No ObjVersion for Geom';
				}
				if ( '1.0.0' !== Object.objVersion ) {
					throw 'invalid objVersion for Geom';
				}
				if ( ! Object.objName ) {
					throw 'No objName for Geom';
				}
				if ( 'Geom' !== Object.objName ) {
					throw 'Invalid objName for Geom';
				}
				_Pnts = Object.pnts || '';
				_Precision = Object.precision || 6;
				_Color = Object.color || '#000000';
				_Weight = Object.weight || 5;
				_ObjId = require ( './ObjId' ) ( );
			}
		};
	};
	
	/* --- End of getTravelData function --- */
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getGeom;
	}

} ) ( );

/* --- End of MapData.js file --- */
},{"./ObjId":5}],2:[function(require,module,exports){
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
	
	/* 
	--- HTMLElementsFactory object -----------------------------------------------------------------------------
	
	Patterns : Closure
	------------------------------------------------------------------------------------------------------------------------
	*/

	var getHTMLElementsFactory = function ( ) {

		return {
			create : function ( tagName, properties, parentNode ) {
				var element;
				if ( 'text' === tagName.toLowerCase ( ) ) {
					element = document.createTextNode ( '' );
				}
				else {
					element = document.createElement ( tagName );
				}
				if ( parentNode ) {
					parentNode.appendChild ( element );
				}
				if ( properties )
				{
					for ( var property in properties ) {
						try {
							element [ property ] = properties [ property ];
						}
						catch ( e ) {
							console.log ( "Invalid property : " + property );
						}
					}
				}
				return element;
			}
			
		};
			
	};

	/* --- End of L.Travel.ControlUI object --- */		

	var HTMLElementsFactory = function ( ) {
		return getHTMLElementsFactory ( );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = HTMLElementsFactory;
	}

}());

},{}],3:[function(require,module,exports){
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
	
	L.Travel.Control = L.Control.extend ( {
		
			options : {
				position: 'topright'
			},
			
			initialize: function ( options ) {
					L.Util.setOptions( this, options );
			},
			
			onAdd : function ( Map ) {
				return require ('./userInterface' ) ( ).UI;
			}
		}
	);

	L.travel.control = function ( options ) {
		return new L.Travel.Control ( options );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = L.travel.control;
	}

}());

},{"./userInterface":13}],4:[function(require,module,exports){
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
	
	/* 
	--- L.Travel.Interface object -----------------------------------------------------------------------------
	
	This object contains all you need to use Travel :-)
	
	Patterns : Closure
	------------------------------------------------------------------------------------------------------------------------
	*/

	L.Travel.getInterface = function ( ) {

		var _TravelData = require ( './TravelData' ) ( );
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
							objName : "WayPoint",
							objVersion : "1.0.0"
						},
						{
							name : "Chemin du Sârtê 22 - Anthisnes",
							lat : 50.50937,
							lng : 5.49470,
							objId : -2,
							objName : "WayPoint",
							objVersion : "1.0.0"
						}
					],
					geom :
					{
						pnts : "w~xi_BwwgnIaHkLgIkUmEyTcLie@",
						precision :6,
						color : "#0000ff",
						weight : "5",
						objId : -3,
						objName : "Geom",
						objVersion : "1.0.0"
					},
					objId : -4,
					objName : "Route",
					objVersion : "1.0.0"
				}
			],
			objId : -5,
			objName : "TravelData",
			objVersion : "1.0.0"
		};
		
		//_TravelData.clear ( );

/*
		_TravelData.object = 
		{
			name : "A",
			routes : 
			[
				{
					name : "B",
					wayPoints : 
					[
						{
							name : "C",
							lat : 0,
							lng : 0,
							objId : -1,
							objName : "WayPoint",
							objVersion : "1.0.0"
						},
						{
							name : "D",
							lat : 0,
							lng : 0,
							objId : -2,
							objName : "WayPoint",
							objVersion : "1.0.0"
						}
					],
					geom :
					{
						pnts : "E",
						precision :6,
						color : "#000000",
						weight : "5",
						objId : -3,
						objName : "Geom",
						objVersion : "1.0.0"
					},
					objId : -4,
					objName : "Route",
					objVersion : "1.0.0"
				}
			],
			objId : -5,
			objName : "TravelData",
			objVersion : "1.0.0"
		};
*/
		return {

			/* --- public methods --- */
			
			/* addControl ( ) method --- 
			
			This method add the control 
			
			Parameters :
			
			*/

			addControl : function ( map, options ) {
				if ( typeof module !== 'undefined' && module.exports ) {
					map.addControl ( require ('./L.Travel.Control' ) ( options ) );
				}
				else {
					map.addControl ( L.marker.pin.control ( options ) );
				}
			},
			
			addWayPoint : function ( WayPoint, WayPointPosition ) {
				console.log ( 'addWayPoint' );
			},
			
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

},{"./L.Travel.Control":3,"./TravelData":10}],5:[function(require,module,exports){
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

	var _ObjId = 0;
	
	var getObjId = function ( ) {
		return ++ _ObjId;
	};
	
	/* --- End of getTravelData function --- */
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getObjId;
	}

} ) ( );

/* --- End of MapData.js file --- */
},{}],6:[function(require,module,exports){
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

	var _ObjName = 'Route';
	var _ObjVersion = '1.0.0';

	var getRoute = function ( ) {
		
		var _Name = '';
		var _WayPoints = [ require ( './Waypoint' ) ( ), require ( './waypoint' ) ( )];
		var _Geom = require ( './Geom' ) ( );
		
		var _ObjId = require ( './ObjId' ) ( );
		
		return {
			get name ( ) { return _Name; },
			set name ( Name ) { _Name = Name;},
			
			addWayPoint : function ( WayPoint ) { _WayPoints.push ( WayPoint ); },
			removeWayPoint : function ( WayPointObjId ) { return; },

			get geom ( ) { return _Geom; },
			set geom ( Geom ) { _Geom = Geom; },
			
			get objId ( ) { return _ObjId; },
			get objName ( ) { return _ObjName; },
			get objVersion ( ) { return _ObjVersion; },
			
			get object ( ) {
				var wayPoints = [];
				for ( var WayPointsCounter = 0; WayPointsCounter < _WayPoints.length ;WayPointsCounter ++ ) {
					wayPoints.push ( _WayPoints [ WayPointsCounter ].object );
				}
				return {
					name : _Name,
					wayPoints : wayPoints,
					geom : _Geom.object,
					objId : _ObjId,
					objName : _ObjName,
					objVersion : _ObjVersion
				};
			},
			set object ( Object ) {
				if ( ! Object.objVersion ) {
					throw 'No ObjVersion for Route';
				}
				if ( '1.0.0' !== Object.objVersion ) {
					throw 'invalid objVersion for Route';
				}
				if ( ! Object.objName ) {
					throw 'No objName for Route';
				}
				if ( 'Route' !== Object.objName ) {
					throw 'Invalid objName for Route';
				}
				_Name = Object.name || '';
				_WayPoints.length = 0;
				for ( var wayPointsCounter = 0; wayPointsCounter < Object.wayPoints.length; wayPointsCounter ++ ) {
					var newWayPoint = require ( './WayPoint' ) ( );
					newWayPoint.object = Object.wayPoints [ wayPointsCounter ];
					_WayPoints.push ( newWayPoint );
				}
				var tmpGeom = require ( './Geom' ) ( );
				tmpGeom.object = Object.geom;
				_Geom = tmpGeom;
				_ObjId = require ( './ObjId' ) ( );
			}
		};
	};
	
	/* --- End of getTravelData function --- */
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getRoute;
	}

} ) ( );

/* --- End of MapData.js file --- */
},{"./Geom":1,"./ObjId":5,"./WayPoint":11,"./Waypoint":12,"./waypoint":14}],7:[function(require,module,exports){
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
	
	var _TravelData = require ( './TravelData' ) ( );

	var _RoutesList = null;
	var _WayPointsList = null;

	var _WayPointsDiv = null;

	var onClickExpandButton = function ( clickEvent ) {
		
		clickEvent.target.parentNode.parentNode.childNodes[ 1 ].classList.toggle ( 'TravelControl-HiddenList' );
		clickEvent.target.parentNode.parentNode.childNodes[ 2 ].classList.toggle ( 'TravelControl-HiddenList' );
		clickEvent.target.innerHTML = clickEvent.target.parentNode.parentNode.childNodes[ 1 ].classList.contains ( 'TravelControl-HiddenList' ) ? '&#x25b6;' : '&#x25bc;';
		clickEvent.target.title = clickEvent.target.parentNode.parentNode.childNodes[ 1 ].classList.contains ( 'TravelControl-HiddenList' ) ? 'Afficher' : 'Masquer';
	};

	// Events for buttons and input on the waypoints list items
	
	var onWayPointsListDelete = function ( event ) {
		event.stopPropagation();
	};

	var onWayPointsListUpArrow = function ( event ) {
		event.stopPropagation();
	};

	var onWayPointsListDownArrow = function ( event ) {
		event.stopPropagation();
	};

	var onWayPointsListRightArrow = function ( event ) {
		event.stopPropagation();
	};

	var onWayPointslistInput = function ( event ) {
		event.stopPropagation();
	};
	
	// User interface
	
	var getRouteEditorUI = function ( ) {

		var _CreateRouteEditorUI = function ( ){ 

			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			
			// WayPoints
			_WayPointsDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-WayPointsDiv', className : 'TravelControl-Div'} );
			
			var headerWayPointsDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-WaypointsHeaderDiv', className : 'TravelControl-HeaderDiv'}, _WayPointsDiv );
			var expandWayPointsButton = htmlElementsFactory.create ( 'span', { innerHTML : '&#x25bc', id : 'TravelControl-WayPointsExpandButton', className : 'TravelControl-ExpandButton'}, headerWayPointsDiv );
			expandWayPointsButton.addEventListener ( 'click' , onClickExpandButton, false );
			htmlElementsFactory.create ( 'span', { innerHTML : 'Points de passage&nbsp;:', id : 'TravelControl-WayPointsHeaderText',className : 'TravelControl-HeaderText'}, headerWayPointsDiv );

			_WayPointsList = require ( './SortableList' ) ( 
				{
					minSize : 0,
					listStyle : 'LimitedSort',
					placeholders : [ 'Start', 'Via', 'End' ],
					indexNames : [ 'A', 'index', 'B' ],
					id : 'TravelControl-WaypointsList'
				}, 
				_WayPointsDiv
			);
			_WayPointsList.container.addEventListener ( 'SortableListDelete', onWayPointsListDelete, false );
			_WayPointsList.container.addEventListener ( 'SortableListUpArrow', onWayPointsListUpArrow, false );
			_WayPointsList.container.addEventListener ( 'SortableListDownArrow', onWayPointsListDownArrow, false );
			_WayPointsList.container.addEventListener ( 'SortableListRightArrow', onWayPointsListRightArrow, false );
			_WayPointsList.container.addEventListener ( 'SortableListInput', onWayPointslistInput, false );

			var wayPointsButtonsDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-WayPointsButtonsDiv', className : 'TravelControl-ButtonsDiv'}, _WayPointsDiv );
			var addWayPointsButton = htmlElementsFactory.create ( 
				'span', 
				{ 
					id : 'TravelControl-AddWayPointsButton',
					className: 'TravelControl-Button', 
					title : 'Ajouter un point de passage', 
					innerHTML : '+'
				},
				wayPointsButtonsDiv 
			);
			var reverseWayPointsButton = htmlElementsFactory.create ( 
				'span',
				{ 
					id : 'TravelControl-ReverseWayPointsButton', 
					className: 'TravelControl-Button', 
					title : 'Inverser les points de passage',  
					innerHTML : '&#x21C5;'
				},
				wayPointsButtonsDiv
			);
			var deleteWayPointsButton = htmlElementsFactory.create ( 
				'span', 
				{ 
					id : 'TravelControl-DeleteWayPointsButton', 
					className: 'TravelControl-Button',
					title: 'Supprimer tous les points de passage',
					innerHTML : '&#x1f5d1;'
				}, 
				wayPointsButtonsDiv
			);
		};
		if ( ! _WayPointsDiv ) {
			_CreateRouteEditorUI ( );
		}
		
		return {
			get UI ( ) { return _WayPointsDiv; }
		};
	};

	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getRouteEditorUI;
	}

}());

},{"./HTMLElementsFactory":2,"./SortableList":9,"./TravelData":10}],8:[function(require,module,exports){
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
	
	var _TravelData = require ( './TravelData' ) ( );

	var _RoutesList = null;

	var _RoutesDiv = null;

	// Events listeners for buttons under the routes list
	var onClickDeleteAllRoutesButton = function ( clickEvent ) {
		_RoutesList.removeAllItems ( );

		_TravelData.removeAllRoutes ( );	

		clickEvent.stopPropagation();
	};
	
	var onClickAddRouteButton = function ( clickEvent ) {
		var newRoute = _TravelData.addRoute ( );
		
		_RoutesList.addItem ( newRoute.name, newRoute.objId );

		clickEvent.stopPropagation();
	};
	
	var onClickExpandButton = function ( clickEvent ) {
		
		clickEvent.target.parentNode.parentNode.childNodes[ 1 ].classList.toggle ( 'TravelControl-HiddenList' );
		clickEvent.target.parentNode.parentNode.childNodes[ 2 ].classList.toggle ( 'TravelControl-HiddenList' );
		clickEvent.target.innerHTML = clickEvent.target.parentNode.parentNode.childNodes[ 1 ].classList.contains ( 'TravelControl-HiddenList' ) ? '&#x25b6;' : '&#x25bc;';
		clickEvent.target.title = clickEvent.target.parentNode.parentNode.childNodes[ 1 ].classList.contains ( 'TravelControl-HiddenList' ) ? 'Afficher' : 'Masquer';
	};
	
	// Events for buttons and input on the routes list items
	
	var onRoutesListDelete = function ( event ) {
		_TravelData.removeRoute ( event.itemNode.dataObjId );
		
		event.itemNode.parentNode.removeChild ( event.itemNode );
		
		event.stopPropagation();
	};

	var onRoutesListUpArrow = function ( event ) {
		var indexOfRoute = _TravelData.indexOfRoute ( event.itemNode.dataObjId );
		var tmpRoute = _TravelData.routes [ indexOfRoute ];
		_TravelData.routes [ indexOfRoute ] = _TravelData.routes [ indexOfRoute - 1 ];
		_TravelData.routes [ indexOfRoute - 1 ] = tmpRoute;

		event.itemNode.parentNode.insertBefore ( event.itemNode, event.itemNode.previousSibling );

		event.stopPropagation();
	};

	var onRoutesListDownArrow = function ( event ) {

		var indexOfRoute = _TravelData.indexOfRoute ( event.itemNode.dataObjId );
		var tmpRoute = _TravelData.routes [ indexOfRoute ];
		_TravelData.routes [ indexOfRoute ] = _TravelData.routes [ indexOfRoute + 1 ];
		_TravelData.routes [ indexOfRoute + 1 ] = tmpRoute;

		event.itemNode.parentNode.insertBefore ( event.itemNode.nextSibling, event.itemNode );
		
		event.stopPropagation();
	};

	var onRoutesListRightArrow = function ( event ) {
		event.stopPropagation();
		console.log ( _TravelData.object );
	};
	var onRouteslistInput = function ( event ) {
		_TravelData.routes [ _TravelData.indexOfRoute ( event.dataObjId ) ].name = event.inputValue;
		
		event.stopPropagation();
	};
	
	var getRoutesUI = function ( ) {

		var _SetTravelData = function ( ) {
			var routes = _TravelData.routes;
			for ( var routesCounter = 0; routesCounter < routes.length; routesCounter ++ ) {
				routes [ routesCounter ].uiObjId = _RoutesList.addItem ( routes [ routesCounter ].name, routes [ routesCounter ].objId );
			}
		};
		
		var _CreateRoutesUI = function ( ){ 

			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			
			// Routes
			_RoutesDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-RoutesDiv', className : 'TravelControl-Div'} );
			
			var headerRoutesDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-RoutesHeaderDiv', className : 'TravelControl-HeaderDiv'}, _RoutesDiv );
			var expandRouteButton = htmlElementsFactory.create ( 'span', { innerHTML : '&#x25bc;', id : 'TravelControl-RoutesExpandButton', className : 'TravelControl-ExpandButton'}, headerRoutesDiv );
			expandRouteButton.addEventListener ( 'click' , onClickExpandButton, false );
			htmlElementsFactory.create ( 'span', { innerHTML : 'Routes&nbsp;:', id : 'TravelControl-RoutesHeaderText', className : 'TravelControl-HeaderText'}, headerRoutesDiv );
			
			_RoutesList = require ( './SortableList' ) ( { minSize : 0, placeholders : ['Route'], id : 'TravelControl-RouteList' }, _RoutesDiv );
			_RoutesList.container.addEventListener ( 'SortableListDelete', onRoutesListDelete, false );
			_RoutesList.container.addEventListener ( 'SortableListUpArrow', onRoutesListUpArrow, false );
			_RoutesList.container.addEventListener ( 'SortableListDownArrow', onRoutesListDownArrow, false );
			_RoutesList.container.addEventListener ( 'SortableListRightArrow', onRoutesListRightArrow, false );
			_RoutesList.container.addEventListener ( 'SortableListInput', onRouteslistInput, false );
			
			var routesButtonsDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-RoutesButtonsDiv', className : 'TravelControl-ButtonsDiv' }, _RoutesDiv );
			var addRouteButton = htmlElementsFactory.create ( 'span', { id : 'TravelControl-AddRoutesButton', className: 'TravelControl-Button', title : 'Nouvelle route', innerHTML : '+'/*'&#x2719;'*/}, routesButtonsDiv );
			addRouteButton.addEventListener ( 'click' , onClickAddRouteButton, false );

			var deleteAllRoutesButton = htmlElementsFactory.create ( 
				'span',
				{ 
					id : 'TravelControl-DeleteAllRoutesButton', 
					className: 'TravelControl-Button', 
					title : 'Supprimer toutes les routes', 
					innerHTML : '&#x1f5d1;'
				},
				routesButtonsDiv
			);
			deleteAllRoutesButton.addEventListener ( 'click' , onClickDeleteAllRoutesButton, false );	
		};
		
		if ( ! _RoutesDiv ) {
			_CreateRoutesUI ( );
			_SetTravelData ( );
		}
		
		return {
			get UI ( ) { return _RoutesDiv; }
		};
	};

	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getRoutesUI;
	}

}());

},{"./HTMLElementsFactory":2,"./SortableList":9,"./TravelData":10}],9:[function(require,module,exports){
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
	
	
	var onDragStart = function  ( DragEvent ) {
		DragEvent.stopPropagation(); // needed to avoid map movements
		try {
			DragEvent.dataTransfer.setData ( 'Text', '1' );
		}
		catch ( e ) {
		}
		console.log ( 'onDragStart' );
	};
	
	var onDragOver = function ( DragEvent ) {
		DragEvent.preventDefault();
		console.log ( 'onDragOver' );
	};
	
	var onDrop = function ( DragEvent ) { 
		DragEvent.preventDefault();
		var data = DragEvent.dataTransfer.getData("Text");
		console.log ( 'onDrop' );
	};

	/*
	var onDragEnd = function ( DragEvent ) { 
		console.log ( 'onDragEnd' );
	};
	
	var onDragEnter = function ( DragEvent ) { 
		console.log ( 'onDragLeave' );
	};
	var onDragLeave = function ( DragEvent ) { 
		console.log ( 'onDragEnter' );
	};
	*/	
	
	var onDeleteButtonClick = function ( ClickEvent ) {
		var event = new Event ( 'SortableListDelete' );
		event.itemNode = ClickEvent.target.parentNode;
		ClickEvent.target.parentNode.parentNode.dispatchEvent ( event );
		ClickEvent.stopPropagation();
	};
	
	var onUpArrowButtonClick = function ( ClickEvent ) {
		var event = new Event ( 'SortableListUpArrow' );
		event.itemNode = ClickEvent.target.parentNode;
		ClickEvent.target.parentNode.parentNode.dispatchEvent ( event );
		ClickEvent.stopPropagation();
	};
	
	var onDownArrowButtonClick = function ( ClickEvent ) {
		var event = new Event ( 'SortableListDownArrow' );
		event.itemNode = ClickEvent.target.parentNode;
		ClickEvent.target.parentNode.parentNode.dispatchEvent ( event );
		ClickEvent.stopPropagation();
	};
	
	var onRightArrowButtonClick = function ( ClickEvent ) {
		var event = new Event ( 'SortableListRightArrow' );
		event.itemNode = ClickEvent.target.parentNode;
		ClickEvent.target.parentNode.parentNode.dispatchEvent ( event );
		ClickEvent.stopPropagation();
	};
	
	var onInput = function ( inputEvent ) {
		var event = new Event ( 'SortableListInput' );
		event.dataObjId = inputEvent.target.parentNode.dataObjId;
		event.inputValue = inputEvent.target.value;
		inputEvent.target.parentNode.parentNode.dispatchEvent ( event );
		inputEvent.stopPropagation();
	};

	
	/* 
	--- SortableList object --------------------------------------------------------------------------------------------------
	
	--------------------------------------------------------------------------------------------------------------------------
	*/

	var SortableList = function ( options, parentNode ) {
		
		var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
		
		this.items = [];
		
		/*
		--- removeItem method --------------------------------------------------------------------------------------------------

		This method ...

		------------------------------------------------------------------------------------------------------------------------
		*/
		
		this.removeItem = function ( ) {
		};
		
		/*
		--- removeAllItems method ----------------------------------------------------------------------------------------------

		This method ...

		------------------------------------------------------------------------------------------------------------------------
		*/

		this.removeAllItems = function ( ) {
			for ( var ItemCounter = 0; ItemCounter < this.items.length; ItemCounter ++ ) {
				this.container.removeChild ( this.items [ ItemCounter ] );
			}
			this.items.length = 0;
		};
		
		/*
		--- moveItem method ----------------------------------------------------------------------------------------------------

		This method ...

		------------------------------------------------------------------------------------------------------------------------
		*/

		this.moveItem = function ( ) {
		};
		
		/*
		--- addItem method -----------------------------------------------------------------------------------------------------

		This method ...

		------------------------------------------------------------------------------------------------------------------------
		*/

		this.addItem = function ( name, dataObjId ) {
	
			name = name || '';
			dataObjId = dataObjId || -1;
			
			var placeholder = '';
			if ( 1 === this.options.placeholders.length ) {
				placeholder = this.options.placeholders [ 0 ];
			}
			if ( 3 === this.options.placeholders.length ) {
				switch ( this.items.length ) {
					case 0:
					placeholder = this.options.placeholders [ 0 ];
					break;
					case 1:
					placeholder = this.options.placeholders [ 2 ];
					break;
					default:
					placeholder = this.options.placeholders [ 1 ];
					break;
				}
			}
			
			var indexName = '';
			if ( 1 === this.options.indexNames.length ) {
				indexName = this.options.indexNames [ 0 ];
			}
			if ( 3 === this.options.indexNames.length ) {
				switch ( this.items.length ) {
					case 0:
					indexName = this.options.indexNames [ 0 ];
					break;
					case 1:
					indexName = this.options.indexNames [ 2 ];
					break;
					default:
					indexName = this.options.indexNames [ 1 ];
					break;
				}
			}
			if ( 'index' === indexName )
			{
				indexName = this.items.length - 1;
			}
			
			var item = htmlElementsFactory.create ( 'div', { draggable : false , className : 'SortableList-Item' } );

			htmlElementsFactory.create ( 'span', { className : 'SortableList-ItemTextIndex' , innerHTML : indexName }, item );
			var inputElement = htmlElementsFactory.create ( 'input', { type : 'text', className : 'SortableList-ItemInput', placeholder : placeholder, value: name}, item );
			inputElement.addEventListener ( 'input' , onInput, false );
			var deleteButton = htmlElementsFactory.create ( 'span', { className : 'SortableList-ItemDeleteButton', title : 'Supprimer', innerHTML : '&#x1f5d1;' }, item );
			deleteButton.addEventListener ( 'click', onDeleteButtonClick, false );
			var upArrowButton = htmlElementsFactory.create ( 'span', { className : 'SortableList-ItemUpArrowButton', title : 'Déplacer vers le haut', innerHTML : String.fromCharCode( 8679 ) }, item );
			upArrowButton.addEventListener ( 'click', onUpArrowButtonClick, false );
			var downArrowButton = htmlElementsFactory.create ( 'span', { className : 'SortableList-ItemDownArrowButton', title : 'Déplacer vers le bas', innerHTML : String.fromCharCode( 8681 ) }, item );
			downArrowButton.addEventListener ( 'click', onDownArrowButtonClick, false );
			if ( 'AllSort' === this.options.listStyle ) {
				var rightArrowButton = htmlElementsFactory.create ( 'span', { className : 'SortableList-ItemRightArrowButton', title : 'Éditer', innerHTML : String.fromCharCode( 8688 ) }, item );
				rightArrowButton.addEventListener ( 'click', onRightArrowButtonClick, false );
			}
			item.dataObjId = dataObjId; 
			item.UIObjId = require ( './ObjId' ) ( );

			this.items.push ( item );
			
			var lastItem = null;
			if ( ( 'LimitedSort' === this.options.listStyle ) && ( 2 < this.items.length ) ){
				lastItem = this.items [ this.items.length - 2 ];
				this.items [ this.items.length - 2 ] = this.items [ this.items.length - 1 ];
				this.items [ this.items.length - 1 ] = lastItem;
			}
			if ( ( 'LimitedSort' !== this.options.listStyle ) || ( 2 < this.items.length ) ){
			{
				item.draggable = true;
				item.addEventListener ( 'dragstart', onDragStart, false );	
				item.classList.add ( 'SortableList-MoveCursor' );
			}
	
			}
			if ( lastItem ) {
				this.container.insertBefore ( item, lastItem );
			}
			else
			{
				this.container.appendChild ( item );
			}
		};
		
		
		/*
		--- _create method -----------------------------------------------------------------------------------------------------

		This method ...

		------------------------------------------------------------------------------------------------------------------------
		*/

		this._create = function ( options, parentNode ) {

			// options
			
			// options.listStyle = 'AllSort' : all items can be sorted or deleted
			// options.listStyle = 'LimitedSort' : all items except first and last can be sorted or deleted
			
			this.options = { minSize : 2, listStyle : 'AllSort', placeholders : [] , indexNames : [], id : 'SortableList-Container' } ;
			for ( var option in options ) {
				this.options [ option ] = options [ option ];
			}
			if ( ( 'LimitedSort' === this.options.listStyle ) && ( 2 > this.options.minSize ) )
			{
				this.options.minSize = 2;
			}
			this.container = htmlElementsFactory.create ( 'div', { id : options.id, className : 'SortableList-Container' } );
			this.container.classList.add ( this.options.listStyle );
			this.container.addEventListener ( 'dragover', onDragOver, false );
			this.container.addEventListener ( 'drop', onDrop, false );

			if ( parentNode ) {
				parentNode.appendChild ( this.container );
			}
			
			for ( var itemCounter = 0; itemCounter < this.options.minSize; itemCounter++ )
			{
				this.addItem ( );
			}
		};
		
		this._create ( options, parentNode );
		
	};

	var sortableList = function ( options, parentNode ) {
		return new SortableList ( options, parentNode );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = sortableList;
	}

}());

},{"./HTMLElementsFactory":2,"./ObjId":5}],10:[function(require,module,exports){
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
					_UndoList.push ( { timeStamp : new Date().toISOString ( ), route : _Routes [ routeCounter ].object } );
				}
				this.object = 
				{name : "",routes : [{name : "",wayPoints : [{name : "",lat : 0,lng : 0,objId : -1,objName : "WayPoint",objVersion : "1.0.0"},{name : "",lat : 0,lng : 0,objId : -1,objName : "WayPoint",objVersion : "1.0.0"}],geom :{pnts : "",precision :6,color : "#000000",weight : "5",objId : -1,objName : "Geom",objVersion : "1.0.0"},objId : -1,objName : "Route",objVersion : "1.0.0"}],objId : -1,objName : "TravelData",objVersion : "1.0.0"};
			},
			
			removeAllRoutes : function ( ) {
				for ( var routeCounter = 0; routeCounter < _Routes.length; routeCounter ++ ) {
					_UndoList.push ( { timeStamp : new Date().toISOString ( ), route : _Routes [ routeCounter ].object } );
				}
				_Routes.length = 0;
			},
			
			removeRoute : function ( routeObjId ) {
				console.log ( new Date().toISOString ( ) );
				_UndoList.push ( { timeStamp : new Date().toISOString ( ), route : _Routes.splice ( this.indexOfRoute ( routeObjId ), 1 ) [0].object } );
			},
			
			addRoute : function ( ) {
				var newRoute = require ( './Route' ) ( );
				_Routes.push ( newRoute ) ;
				return newRoute;
			},
			
			indexOfRoute : function ( routeObjId ) {
				function haveObjId ( element ) {
					return element.objId === routeObjId;
				}
				return _Routes.findIndex ( haveObjId );
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
					routes : routes,
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
					var newRoute = require ( './Route' ) ( );
					newRoute.object = Object.routes [ routesCounter ];
					_Routes.push ( newRoute );
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
},{"./ObjId":5,"./Route":6}],11:[function(require,module,exports){
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
	
	var _ObjName = 'WayPoint';
	var _ObjVersion = '1.0.0';

	var getWayPoint = function ( ) {
		
		var _Name = '';
		var _Lat = 0;
		var _Lng = 0;
		
		var _ObjId = require ( './ObjId' ) ( );
		
		return {
			get name ( ) { return _Name; },
			set name ( Name ) { _Name = Name;},
			
			get lat ( ) { return _Lat;},
			set lat ( Lat ) { _Lat = Lat; },
			
			get lng ( ) { return _Lng;},
			set lng ( Lng ) { _Lng = Lng; },
			
			get latLng ( ) { return [ _Lat, _Lng ];},
			set latLng ( LatLng ) { _Lat = LatLng [ 0 ]; _Lng = LatLng [ 1 ]; },

			get objId ( ) { return _ObjId; },
			get objName ( ) { return _ObjName; },
			get objVersion ( ) { return _ObjVersion; },
			
			get object ( ) {
				return {
					name : _Name,
					lat : _Lat,
					lng : _Lng,
					objId : _ObjId,
					objName : _ObjName,
					objVersion : _ObjVersion
				};
			},
			set object ( Object ) {
				if ( ! Object.objVersion ) {
					throw 'No ObjVersion for WayPoint';
				}
				if ( '1.0.0' !== Object.objVersion ) {
					throw 'invalid objVersion for WayPoint';
				}
				if ( ! Object.objName ) {
					throw 'No objName for WayPoint';
				}
				if ( 'WayPoint' !== Object.objName ) {
					throw 'Invalid objName for WayPoint';
				}
				_Name = Object.name || '';
				_Lat = Object.lat || 0;
				_Lng = Object.lng || 0;
				_ObjId = require ( './ObjId' ) ( );
			}
		};
	};
	
	/* --- End of getTravelData function --- */
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getWayPoint;
	}

} ) ( );

/* --- End of MapData.js file --- */
},{"./ObjId":5}],12:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"./ObjId":5,"dup":11}],13:[function(require,module,exports){
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
	
	var _MainDiv = null;

	// User interface
	
	var getControlUI = function ( ) {

		var _CreateUI = function ( ){ 

			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			
			_MainDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-MainDiv' } );
			
			_MainDiv.appendChild ( require ( './RoutesUI' ) ( ).UI ); 

			_MainDiv.appendChild ( require ( './RouteEditorUI' ) ( ).UI ); 
			// Itinerary
			var itineraryDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-ItineraryDiv', className : 'TravelControl-Div'}, _MainDiv );

			htmlElementsFactory.create ( 'span', { innerHTML : 'Itinéraire&nbsp;:', id : 'TravelControl-ItineraryHeaderText',className : 'TravelControl-HeaderText' }, itineraryDiv );
			
			// Errors
			var errorDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-ItineraryDiv', className : 'TravelControl-Div'}, _MainDiv );
		};
		if ( ! _MainDiv ) {
			_CreateUI ( );
		}
		
		return {
			get UI ( ) { return _MainDiv; }
		};
	};

	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getControlUI;
	}

}());

},{"./HTMLElementsFactory":2,"./RouteEditorUI":7,"./RoutesUI":8}],14:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"./ObjId":5,"dup":11}]},{},[4]);
