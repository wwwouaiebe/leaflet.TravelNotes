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

	
	var getCollection = function ( objName ) {
		
		var _Array = [];
		var _ObjName = objName;
		
		var _IndexOfObjId = function ( objId ) {
			function haveObjId ( element ) {
				return element.objId === objId;
			}
			return _Array.findIndex ( haveObjId );
		};
		
		var _Add = function ( object ) {
			if ( ( ! object.objName ) || ( object.objName !== _ObjName ) ) {
				throw 'invalid object name for add function';
			}
			_Array.push ( object );

			return;
		};
		
		var _GetAt = function ( objId ) {
			var index = _IndexOfObjId ( objId );
			if ( -1 === index ) {
				throw 'invalid objId for getAt function';
			}
			return _Array [ index ];
		};
		
		var _Reverse = function ( ) {
			_Array.reverse ( );
		};
		
		var _Remove = function ( objId ) {
			var index = _IndexOfObjId ( objId );
			if ( -1 === index ) {
				throw 'invalid objId for remove function';
			}
			_Array.splice ( _IndexOfObjId ( objId ), 1 );
		};
		
		var _Replace = function ( oldObjId, object ) {
			var index = _IndexOfObjId ( oldObjId );
			if ( -1 === index ) {
				throw 'invalid objId for replace function';
			}
			_Array [ index ] = object;
		};
		
		var _RemoveAll = function ( ExceptFirstLast ) {
			if ( ExceptFirstLast ) {
				_Array.splice ( 1, _Array.length - 2 );
			}
			else {
				_Array.length = 0;
			}
		};
		
		var _Swap = function ( objId, swapUp ) {
			var index = _IndexOfObjId ( objId );
			if ( ( -1 === index ) || ( ( 0 === index ) && swapUp ) || ( ( _Array.length - 1 === index ) && ( ! swapUp ) ) ) {
				throw 'invalid objId for swap function';
			}
			var tmp = _Array [ index ];
			_Array [ index ] = _Array [ index + ( swapUp ? -1 : 1  ) ];
			_Array [ index + ( swapUp ? -1 : 1  ) ] = tmp;	
		};
		
		var _Iterator = function ( ) {
			var nextIndex = -1;   
			return {
			   get value ( ) { return nextIndex < _Array.length ?  _Array [ nextIndex ] : null; },
			   get done ( ) { return ++ nextIndex  >= _Array.length; },
			   get first ( ) { return 0 === nextIndex; },
			   get last ( ) { return nextIndex  >= _Array.length - 1; }
			};
		};
		
		var _First = function ( ) {
			return _Array [ 0 ];
		};

		var _Last = function ( ) {
			return _Array [ _Array.length - 1 ];
		};

		return {
			add : function ( object ) { 
				_Add ( object );
			},
			getAt : function ( objId ) {
				return _GetAt ( objId );
			},
			reverse : function ( ) {
				_Reverse ( );
			},
			remove : function ( objId ) {
				_Remove ( objId );
			},
			replace : function ( oldObjId, object ) {
				_Replace ( oldObjId, object ); 
			},
			removeAll : function ( ExceptFirstLast ) {
				_RemoveAll ( ExceptFirstLast );
			},
			swap : function ( objId, swapUp ) {
				_Swap ( objId, swapUp );
			},
			get iterator ( ) { 
				return _Iterator ( ); 
			},
			get first ( ) {
				return _First ( );
			},
			get last ( ) {
				return _Last ( );
			}
			
		};
	};
	
	/* --- End of getTravelData function --- */
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getCollection;
	}

} ) ( );


},{}],2:[function(require,module,exports){
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
	
	var _MenuItems = [];
	var _ContextMenuContainer = null;
	var _OriginalEvent = null;
	var _FocusIsOnItem = 0;
	
	var onCloseMenu = function ( ) {
		document.removeEventListener ( 'keydown', onKeyDown, true );
		document.removeEventListener ( 'keypress', onKeyPress, true );
		document.removeEventListener ( 'keyup', onKeyUp, true );
		var childNodes = _ContextMenuContainer.childNodes;
		childNodes [ 0 ].firstChild.removeEventListener ( 'click', onCloseMenu, false );
		for ( var childNodesCounter = 1; childNodesCounter < childNodes.length; childNodesCounter ++ ) {
			childNodes [ childNodesCounter ].firstChild.removeEventListener ( 'click', onCloseMenu, false );
		}
		
		document.getElementsByTagName('body') [0].removeChild ( _ContextMenuContainer );
		_ContextMenuContainer = null;
	};
	
	var onKeyDown = function ( keyBoardEvent ) {
		if ( _ContextMenuContainer ) {
			keyBoardEvent.preventDefault ( );
			keyBoardEvent.stopPropagation ( );
		}
		if ( 'Escape' === keyBoardEvent.key || 'Esc' === keyBoardEvent.key ) {
			onCloseMenu ( );
		}
		if ( 'ArrowDown' === keyBoardEvent.key  || 'ArrowRight' === keyBoardEvent.key  ||  'Tab' === keyBoardEvent.key ){
			_FocusIsOnItem ++;
			if ( _FocusIsOnItem > _MenuItems.length ) {
				_FocusIsOnItem = 1;
			}
			_ContextMenuContainer.childNodes [ _FocusIsOnItem ].firstChild.focus( );
		}
		if ( 'ArrowUp' === keyBoardEvent.key  || 'ArrowLeft' === keyBoardEvent.key ){
			_FocusIsOnItem --;
			if ( _FocusIsOnItem < 1 ) {
				_FocusIsOnItem = _MenuItems.length;
			}
			_ContextMenuContainer.childNodes [ _FocusIsOnItem ].firstChild.focus( );
		}
		if ( 'Home' === keyBoardEvent.key ) {
			_FocusIsOnItem = 1;
			_ContextMenuContainer.childNodes [ _FocusIsOnItem ].firstChild.focus( );
		}
		if ( 'End' === keyBoardEvent.key ) {
			_FocusIsOnItem = _MenuItems.length;
			_ContextMenuContainer.childNodes [ _FocusIsOnItem ].firstChild.focus( );
		}
		if ( ( 'Enter' === keyBoardEvent.key )  && ( _FocusIsOnItem > 0 ) && ( _MenuItems[ _FocusIsOnItem - 1 ].action ) ) {
			_MenuItems[ _FocusIsOnItem - 1 ].action ( );
			onCloseMenu ( );
		}
			
	};
	
	var onKeyPress = function ( keyBoardEvent ) {
		keyBoardEvent.preventDefault ( );
		keyBoardEvent.stopPropagation ( );
	};
	
	var onKeyUp = function ( keyBoardEvent ) {
		keyBoardEvent.preventDefault ( );
		keyBoardEvent.stopPropagation ( );
	};

	var onClickItem = function ( event ) {
		event.stopPropagation ( );
		_MenuItems[ event.target.menuItem ].action.call ( 
			_MenuItems[ event.target.menuItem ].context,
			_OriginalEvent
		);
		onCloseMenu ( );
	};
	
	var getContextMenu = function ( event, userMenu ) {

		_OriginalEvent = event; 
		
		if ( _ContextMenuContainer ) {
			onCloseMenu ( );
			return;
		}
		_MenuItems.length = 0;
		
		_MenuItems = require ( './RouteEditor' ) ( ).contextMenu.concat ( userMenu );
		
		//ContextMenu-Container
		var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
		
		var body = document.getElementsByTagName('body') [0];
		var tmpDiv = htmlElementsFactory.create ( 'div', { className : 'ContextMenu-Panel'} , body );
		var screenWidth = tmpDiv.clientWidth;
		var screenHeight = tmpDiv.clientHeight;
		body.removeChild ( tmpDiv );
		
		_ContextMenuContainer = htmlElementsFactory.create ( 'div', { id : 'ContextMenu-Container',className : 'ContextMenu-Container'}, body );
		
		var closeButton = htmlElementsFactory.create ( 'div', { innerHTML: '&#x274c', className : 'ContextMenu-CloseButton'},_ContextMenuContainer);
		closeButton.addEventListener ( 'click', onCloseMenu, false );
		
		for ( var menuItemCounter = 0; menuItemCounter < _MenuItems.length; menuItemCounter ++ ) {
			var itemContainer = htmlElementsFactory.create ( 'div', { className : 'ContextMenu-ItemContainer'},_ContextMenuContainer);
			var item = htmlElementsFactory.create ( 
				'button', 
				{ 
					innerHTML : _MenuItems [ menuItemCounter ].name,
					id : 'ContextMenu-Item' + menuItemCounter,
					className : _MenuItems [ menuItemCounter ].action ? 'ContextMenu-Item' : 'ContextMenu-Item ContextMenu-ItemDisabled'
				},
				itemContainer
			);
			if ( _MenuItems [ menuItemCounter ].action ) {
				item.addEventListener ( 'click', onClickItem, false );
			}
			item.menuItem = menuItemCounter;
		}
		
		var menuTop = Math.min ( event.originalEvent.clientY, screenHeight - _ContextMenuContainer.clientHeight - 20 );
		var menuLeft = Math.min ( event.originalEvent.clientX, screenWidth - _ContextMenuContainer.clientWidth - 20 );
		_ContextMenuContainer.setAttribute ( "style", "top:" + menuTop + "px;left:" + menuLeft +"px;" );
		document.addEventListener ( 'keydown', onKeyDown, true );
		document.addEventListener ( 'keypress', onKeyPress, true );
		document.addEventListener ( 'keyup', onKeyUp, true );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getContextMenu;
	}

}());

},{"./HTMLElementsFactory":6,"./RouteEditor":11}],3:[function(require,module,exports){
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

	var getErrorEditor = function ( ) {

		return {
			
			showError : function ( error ) {
				var header = '<span class="TravelControl-Error">';
				var footer = '</span>';
				require ( './ErrorEditorUI' ) ( ).message = header + error + footer;
				require ( './ErrorEditorUI' ) ( ).expand ( );
			},

			clear : function ( routeObjId ) {
				require ( './ErrorEditorUI' ) ( ).message = '';
			}
		};
	};

	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getErrorEditor;
	}

}());

},{"./ErrorEditorUI":4}],4:[function(require,module,exports){
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

	var onClickExpandButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		if ( ! _ErrorDiv.childNodes[ 0 ].innerHTML.length ) {
			return;
		}	
		clickEvent.target.parentNode.parentNode.childNodes[ 0 ].classList.toggle ( 'TravelControl-HiddenList' );
		clickEvent.target.innerHTML = clickEvent.target.parentNode.parentNode.childNodes[ 0 ].classList.contains ( 'TravelControl-HiddenList' ) ? '&#x25b6;' : '&#x25b2;';
		clickEvent.target.title = clickEvent.target.parentNode.parentNode.childNodes[ 0 ].classList.contains ( 'TravelControl-HiddenList' ) ? 'Afficher' : 'Masquer';
	};

	// User interface

	var _ErrorDiv = null;
	var _ErrorDataDiv = null;
	
	var getErrorEditorUI = function ( ) {
				
		var _CreateErrorUI = function ( ){ 

			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			
			_ErrorDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-ErrorDiv', className : 'TravelControl-Div'} );
			_ErrorDataDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-ErrorDataDiv', className : 'TravelControl-DataDiv'}, _ErrorDiv );
			var headerErrorDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-ErrorHeaderDiv', className : 'TravelControl-HeaderDiv'}, _ErrorDiv );
			var expandErrorButton = htmlElementsFactory.create ( 'span', { innerHTML : '&#x25b2;', id : 'TravelControl-ErrorExpandButton', className : 'TravelControl-ExpandButton'}, headerErrorDiv );
			expandErrorButton.addEventListener ( 'click' , onClickExpandButton, false );
			htmlElementsFactory.create ( 'span', { innerHTML : 'Erreurs&nbsp;:', id : 'TravelControl-ErrorHeaderText', className : 'TravelControl-HeaderText'}, headerErrorDiv );
		};

		var _ExpandEditorUI = function ( ) {
			_ErrorDiv.childNodes[ 1 ].firstChild.innerHTML = '&#x25b2;';
			_ErrorDiv.childNodes[ 1 ].firstChild.title = 'Masquer';
			_ErrorDiv.childNodes[ 0 ].classList.remove ( 'TravelControl-HiddenList' );
		};
		
		var _ReduceEditorUI = function ( ) {
			_ErrorDiv.childNodes[ 1 ].firstChild.innerHTML = '&#x25b6;';
			_ErrorDiv.childNodes[ 1 ].firstChild.title = 'Afficher';
			_ErrorDiv.childNodes[ 0 ].classList.add ( 'TravelControl-HiddenList' );
		};

		if ( ! _ErrorDiv ) {
			_CreateErrorUI ( );
			_ReduceEditorUI ( );
		}
		
		
		return {
			get UI ( ) { return _ErrorDiv; },
	
			expand : function ( ) {
				_ExpandEditorUI ( );
			},
			
			reduce : function ( ) {
				_ReduceEditorUI ( );
			},
			set message ( Message ) { _ErrorDataDiv.innerHTML = Message; },
			get message (  ) { return _ErrorDataDiv.innerHTML; }
		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getErrorEditorUI;
	}

}());

},{"./HTMLElementsFactory":6}],5:[function(require,module,exports){
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
},{"./ObjId":9}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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
				var controlElement = require ( './userInterface' ) ( ).UI;
				var initialRoutes = require ( './TravelData' ) ( ).routes;
				require ( './RoutesListEditorUI' ) ( ).writeRoutesList ( initialRoutes );
				
				return controlElement; 
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

},{"./RoutesListEditorUI":14,"./TravelData":16,"./userInterface":19}],8:[function(require,module,exports){
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

		var onMapClick = function ( event ) {
			require ('./ContextMenu' ) ( event, _LeftUserContextMenu );
		};
		var onMapContextMenu = function ( event ) {
			require ('./ContextMenu' ) ( event, _RightUserContextMenu );
		};

		var _Map;
		return {

			/* --- public methods --- */
			
			/* addControl ( ) method --- 
			
			This method add the control 
			
			Parameters :
			
			*/

			addControl : function ( map, divControlId, options ) {
				if ( divControlId )	{
					document.getElementById ( divControlId ).appendChild ( require ( './userInterface' ) ( ).UI );
					var initialRoutes = require ( './TravelData' ) ( ).routes;
					require ( './RoutesListEditorUI' ) ( ).writeRoutesList ( initialRoutes );
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
			
			set rightUserContextMenu ( RightUserContextMenu ) {_RightUserContextMenu = RightUserContextMenu; }
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

},{"./ContextMenu":2,"./L.Travel.Control":7,"./RoutesListEditorUI":14,"./TravelData":16,"./userInterface":19}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
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
		var _WayPoints = require ( './Collection' ) ( 'WayPoint' );
		_WayPoints.add ( require ( './Waypoint' ) ( ) );
		_WayPoints.add ( require ( './Waypoint' ) ( ) );

		var _Geom = require ( './Geom' ) ( );
		
		var _ObjId = require ( './ObjId' ) ( );
		
		return {
			get name ( ) { return _Name; },
			set name ( Name ) { _Name = Name;},
			
			get wayPoints ( ) { return _WayPoints; },

			get geom ( ) { return _Geom; },
			set geom ( Geom ) { _Geom = Geom; },
			
			get objId ( ) { return _ObjId; },
			get objName ( ) { return _ObjName; },
			get objVersion ( ) { return _ObjVersion; },
			
			get object ( ) {
				var wayPoints = [];
				var iterator = this.wayPoints.iterator;
				while ( ! iterator.done ) {
					wayPoints.push ( iterator.value.object );
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
				_WayPoints.removeAll ( );
				for ( var wayPointsCounter = 0; wayPointsCounter < Object.wayPoints.length; wayPointsCounter ++ ) {
					var newWayPoint = require ( './WayPoint' ) ( );
					newWayPoint.object = Object.wayPoints [ wayPointsCounter ];
					_WayPoints.add ( newWayPoint );
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
},{"./Collection":1,"./Geom":5,"./ObjId":9,"./WayPoint":17,"./Waypoint":18}],11:[function(require,module,exports){
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

	var _Route = require ( './Route' ) ( );
	var _RouteInitialObjId = -1;
	var _RouteChanged = false;
	
	var getRouteEditor = function ( ) {

		var _RouteEditorUI = require ( './RouteEditorUI' ) ( );
	
		return {
			
			saveEdition : function ( ) {
				var travelData = require ( './TravelData' ) ( );
				travelData.routes.replace ( _RouteInitialObjId, _Route );
				_RouteChanged = false;
				// It's needed to rewrite the route list due to objId's changes
				require ( './RoutesListEditorUI') ( ).writeRoutesList ( travelData.routes );
				this.editRoute ( _Route.objId );
			},
			
			cancelEdition : function ( ) {
				_RouteChanged = false;
				this.editRoute ( _RouteInitialObjId );
			},
			
			editRoute : function ( routeObjId ) { 
				console.log ( 'a' );
				if ( _RouteChanged ) {
				console.log ( 'b' );
					require ( './ErrorEditor' ) ( ).showError ( "Il n'est pas possible d'éditer une route sans sauver ou abandonner les modifications" );
					return;
				}
				console.log ( 'C' );
				_Route = require ( './Route' ) ( );
				var route = require ( './TravelData' ) ( ).routes.getAt ( routeObjId );
				_RouteInitialObjId = route.objId;
				// Route is cloned, so we can have a cancel button in the editor
				_Route.object = route.object;
				_RouteEditorUI .expand ( );
				_RouteEditorUI.writeWayPointsList ( _Route.wayPoints );
			},
			
			addWayPoint : function ( latLng ) {
				_RouteChanged = true;
				var newWayPoint = require ( './Waypoint.js' ) ( );
				if ( latLng ) {
					newWayPoint.latLng = latLng;
				}
				_Route.wayPoints.add ( newWayPoint );
				_Route.wayPoints.swap ( newWayPoint.objId, true );
				_RouteEditorUI.writeWayPointsList ( _Route.wayPoints );
			},
			
			reverseWayPoints : function ( ) {
				_RouteChanged = true;
				_Route.wayPoints.reverse ( );
				_RouteEditorUI.writeWayPointsList ( _Route.wayPoints );
			},
			
			removeAllWayPoints : function ( ) {
				_RouteChanged = true;
				_Route.wayPoints.removeAll ( true );
				_RouteEditorUI.writeWayPointsList ( _Route.wayPoints );
			},
			
			removeWayPoint : function ( wayPointObjId ) {
				_RouteChanged = true;
				_Route.wayPoints.remove ( wayPointObjId );
				_RouteEditorUI.writeWayPointsList ( _Route.wayPoints );
			},
			
			renameWayPoint : function ( wayPointObjId, wayPointName ) {
				_RouteChanged = true;
				_Route.wayPoints.getAt ( wayPointObjId ).name = wayPointName;
				_RouteEditorUI.writeWayPointsList ( _Route.wayPoints );
			},
			
			swapWayPoints : function ( wayPointObjId, swapUp ) {
				_RouteChanged = true;
				_Route.wayPoints.swap ( wayPointObjId, swapUp );
				_RouteEditorUI.writeWayPointsList ( _Route.wayPoints );
			},
			
			get contextMenu ( ) {
				var contextMenu = [];
				contextMenu.push ( 
					{ 
						context : this, name : "Sélectionner cet endroit comme point de départ", 
						action : ( -1 !== _RouteInitialObjId ) ? this.setStartPointFromContextMenu : null
					} 
				);
				contextMenu.push ( 
					{
						context : this, name : "Sélectionner cet endroit comme point intermédiaire", 
						action : ( -1 !== _RouteInitialObjId ) ? this.addPointFromContextMenu : null
					}
				);
				contextMenu.push (
					{ 
						context : this, name : "Sélectionner cet endroit comme point de fin", 
						action : ( -1 !== _RouteInitialObjId ) ? this.setEndPointFromContextMenu : null
					}
				);
				return contextMenu;
			},
			
			setStartPoint : function ( latLng ) {
				_RouteChanged = true;
				_Route.wayPoints.first.latLng = latLng;
				_RouteEditorUI.writeWayPointsList ( _Route.wayPoints );
			},
			
			setEndPoint : function ( latLng ) {
				_RouteChanged = true;
				_Route.wayPoints.last.latLng = latLng;
				_RouteEditorUI.writeWayPointsList ( _Route.wayPoints );
			},
			
			setStartPointFromContextMenu : function ( mapClickEvent ) {
				this.setStartPoint ( [ mapClickEvent.latlng.lat, mapClickEvent.latlng.lng ] );
			},
			
			setEndPointFromContextMenu : function ( mapClickEvent ) {
				this.setEndPoint ( [ mapClickEvent.latlng.lat, mapClickEvent.latlng.lng ] );
			},
			
			addPointFromContextMenu : function ( mapClickEvent ) {
				this.addWayPoint ( [ mapClickEvent.latlng.lat, mapClickEvent.latlng.lng ] );
			}
		};
	};

	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getRouteEditor;
	}

}());

},{"./ErrorEditor":3,"./Route":10,"./RouteEditorUI":12,"./RoutesListEditorUI":14,"./TravelData":16,"./Waypoint.js":18}],12:[function(require,module,exports){
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

	var onAddWayPointButton = function ( event ) {
		event.stopPropagation ( );
		var newWayPoints = require ( './RouteEditor' ) ( ).addWayPoint ( );
	};
	
	var onReverseWayPointsButton = function ( event )
	{
		event.stopPropagation ( );
		var newWayPoints = require ( './RouteEditor' ) ( ).reverseWayPoints ( );
	};
	
	var onRemoveAllWayPointsButton = function ( event )
	{
		event.stopPropagation ( );
		var newWayPoints = require ( './RouteEditor' ) ( ).removeAllWayPoints ( );
	};
	
	// Events for buttons and input on the waypoints list items
	
	var onWayPointsListDelete = function ( event ) {
		event.stopPropagation ( );
		var newWayPoints = require ( './RouteEditor' ) ( ).removeWayPoint ( event.itemNode.dataObjId );
	};

	var onWayPointsListUpArrow = function ( event ) {
		event.stopPropagation ( );
		var newWayPoints = require ( './RouteEditor' ) ( ).swapWayPoints ( event.itemNode.dataObjId, true );
	};

	var onWayPointsListDownArrow = function ( event ) {
		event.stopPropagation ( );
		var newWayPoints = require ( './RouteEditor' ) ( ).swapWayPoints ( event.itemNode.dataObjId, false );
	};

	var onWayPointsListRightArrow = function ( event ) {
		event.stopPropagation ( );
	};

	var onWayPointslistChange = function ( event ) {
		event.stopPropagation ( );
		require ( './RouteEditor' ) ( ).renameWayPoint ( event.dataObjId, event.changeValue );
	};

	var onSaveRouteButton = function ( event ) {
		event.stopPropagation ( );
		require ( './RouteEditor' ) ( ).saveEdition ( );
	};
	
	var onCancelRouteButton = function ( event ) {
		event.stopPropagation ( );
		require ( './RouteEditor' ) ( ).cancelEdition ( );
	};
	
	var onClickExpandButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		clickEvent.target.parentNode.classList.toggle ( 'TravelControl-SmallHeader' );
		clickEvent.target.parentNode.parentNode.classList.toggle ( 'TravelControl-SmallHeader' );
		clickEvent.target.parentNode.parentNode.childNodes[ 1 ].classList.toggle ( 'TravelControl-HiddenList' );
		clickEvent.target.parentNode.parentNode.childNodes[ 2 ].classList.toggle ( 'TravelControl-HiddenList' );
		clickEvent.target.innerHTML = clickEvent.target.parentNode.parentNode.childNodes[ 1 ].classList.contains ( 'TravelControl-HiddenList' ) ? '&#x25b6;' : '&#x25bc;';
		clickEvent.target.title = clickEvent.target.parentNode.parentNode.childNodes[ 1 ].classList.contains ( 'TravelControl-HiddenList' ) ? 'Afficher' : 'Masquer';
	};
	
	// User interface
	
	var _WayPointsList = null;

	var _WayPointsDiv = null;

	
	var getRouteEditorUI = function ( ) {
				
		var _CreateRouteEditorUI = function ( ){ 

			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			
			// WayPoints
			_WayPointsDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-WayPointsDiv', className : 'TravelControl-Div'} );
			
			var headerWayPointsDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-WaypointsHeaderDiv', className : 'TravelControl-HeaderDiv'}, _WayPointsDiv );
			var expandWayPointsButton = htmlElementsFactory.create ( 'span', { innerHTML : '&#x25bc;', id : 'TravelControl-WayPointsExpandButton', className : 'TravelControl-ExpandButton'}, headerWayPointsDiv );
			expandWayPointsButton.addEventListener ( 'click' , onClickExpandButton, false );
			htmlElementsFactory.create ( 'span', { innerHTML : 'Points de passage&nbsp;:', id : 'TravelControl-WayPointsHeaderText',className : 'TravelControl-HeaderText'}, headerWayPointsDiv );
			var dataWayPointsDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-WaypointsDataDiv', className : 'TravelControl-DataDiv'}, _WayPointsDiv );
			_WayPointsList = require ( './SortableList' ) ( 
				{
					minSize : 0,
					listStyle : 'LimitedSort',
					placeholders : [ 'Start', 'Via', 'End' ],
					indexNames : [ 'A', 'index', 'B' ],
					id : 'TravelControl-WaypointsList'
				}, 
				dataWayPointsDiv
			);
			_WayPointsList.container.addEventListener ( 'SortableListDelete', onWayPointsListDelete, false );
			_WayPointsList.container.addEventListener ( 'SortableListUpArrow', onWayPointsListUpArrow, false );
			_WayPointsList.container.addEventListener ( 'SortableListDownArrow', onWayPointsListDownArrow, false );
			_WayPointsList.container.addEventListener ( 'SortableListChange', onWayPointslistChange, false );

			var wayPointsButtonsDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-WayPointsButtonsDiv', className : 'TravelControl-ButtonsDiv'}, _WayPointsDiv );
			
			var saveRouteButton = htmlElementsFactory.create (
				'span', 
				{ 
					id : 'TravelControl-SaveRouteButton',
					className: 'TravelControl-Button', 
					title : 'Sauver les modifications', 
					innerHTML : '&#x1f4be;'
				},
				wayPointsButtonsDiv 
			);
			saveRouteButton.addEventListener ( 'click', onSaveRouteButton, false );
			var cancelRouteButton = htmlElementsFactory.create (
				'span', 
				{ 
					id : 'TravelControl-CancelRouteButton',
					className: 'TravelControl-Button', 
					title : 'Abandonner les modifications', 
					innerHTML : '&#x274c'
				},
				wayPointsButtonsDiv 
			);
			cancelRouteButton.addEventListener ( 'click', onCancelRouteButton, false );
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
			reverseWayPointsButton.addEventListener ( 'click' , onReverseWayPointsButton, false );
			var addWayPointButton = htmlElementsFactory.create ( 
				'span', 
				{ 
					id : 'TravelControl-AddWayPointButton',
					className: 'TravelControl-Button', 
					title : 'Ajouter un point de passage', 
					innerHTML : '+'
				},
				wayPointsButtonsDiv 
			);
			addWayPointButton.addEventListener ( 'click', onAddWayPointButton, false );
			var removeAllWayPointsButton = htmlElementsFactory.create ( 
				'span', 
				{ 
					id : 'TravelControl-RemoveAllWayPointsButton', 
					className: 'TravelControl-Button',
					title: 'Supprimer tous les points de passage',
					innerHTML : '&#x267b;'
				}, 
				wayPointsButtonsDiv
			);
			removeAllWayPointsButton.addEventListener ( 'click' , onRemoveAllWayPointsButton, false );

		};
	
		var _ExpandEditorUI = function ( ) {
			_WayPointsDiv.childNodes[ 0 ].firstChild.innerHTML = '&#x25bc;';
			_WayPointsDiv.childNodes[ 0 ].firstChild.title = 'Masquer';
			_WayPointsDiv.childNodes[ 1 ].classList.remove ( 'TravelControl-HiddenList' );
			_WayPointsDiv.childNodes[ 2 ].classList.remove ( 'TravelControl-HiddenList' );
		};
		
		var _ReduceEditorUI = function ( ) {
			_WayPointsDiv.childNodes[ 0 ].firstChild.innerHTML = '&#x25b6;';
			_WayPointsDiv.childNodes[ 0 ].firstChild.title = 'Afficher';
			_WayPointsDiv.childNodes[ 1 ].classList.add ( 'TravelControl-HiddenList' );
			_WayPointsDiv.childNodes[ 2 ].classList.add ( 'TravelControl-HiddenList' );
		};

		if ( ! _WayPointsDiv ) {
			_CreateRouteEditorUI ( );
			//_ReduceEditorUI ( );
		}
		
		return {
			get UI ( ) { return _WayPointsDiv; },
	
			expand : function ( ) {
				_ExpandEditorUI ( );
			},
			
			reduce : function ( ) {
				_ReduceEditorUI ( );
			},

			writeWayPointsList : function ( newWayPoints ) {
				_WayPointsList.removeAllItems ( );
				
				var iterator = newWayPoints.iterator;
				while ( ! iterator.done ) {
					_WayPointsList.addItem ( iterator.value.UIName, iterator.value.objId, iterator.last );
				}
			}
		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getRouteEditorUI;
	}

}());

},{"./HTMLElementsFactory":6,"./RouteEditor":11,"./SortableList":15}],13:[function(require,module,exports){
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
	var _RoutesListChanged = false;
	
	var getRoutesListEditor = function ( ) {

		var _RoutesListEditorUI = require ( './RoutesListEditorUI' ) ( );

		return {
			
			addRoute : function ( ) {
				_RoutesListChanged = true;
				var newRoute = require ( './Route' ) ( );
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

},{"./Route":10,"./RouteEditor":11,"./RoutesListEditorUI":14,"./TravelData":16}],14:[function(require,module,exports){
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
	
	var onClickExpandButton = function ( clickEvent ) {
		
		clickEvent.target.parentNode.classList.toggle ( 'TravelControl-SmallHeader' );
		clickEvent.target.parentNode.parentNode.classList.toggle ( 'TravelControl-SmallHeader' );
		clickEvent.target.parentNode.parentNode.childNodes[ 1 ].classList.toggle ( 'TravelControl-HiddenList' );
		clickEvent.target.parentNode.parentNode.childNodes[ 2 ].classList.toggle ( 'TravelControl-HiddenList' );
		clickEvent.target.innerHTML = clickEvent.target.parentNode.parentNode.childNodes[ 1 ].classList.contains ( 'TravelControl-HiddenList' ) ? '&#x25b6;' : '&#x25bc;';
		clickEvent.target.title = clickEvent.target.parentNode.parentNode.childNodes[ 1 ].classList.contains ( 'TravelControl-HiddenList' ) ? 'Afficher' : 'Masquer';

		clickEvent.stopPropagation ( );
	};
	
	
	// Events listeners for buttons under the routes list
	var onClickDeleteAllRoutesButton = function ( clickEvent ) {
		clickEvent.stopPropagation();
		require ( './RoutesListEditor' ) ( ).removeAllRoutes ( );
	};

	var onClickAddRouteButton = function ( event ) {
		event.stopPropagation();
		require ( './RoutesListEditor' ) ( ).addRoute ( );
	};
	
	// Events for buttons and input on the routes list items
	var onRoutesListDelete = function ( event ) {
		event.stopPropagation ( );
		require ( './RoutesListEditor' ) ( ).removeRoute ( event.itemNode.dataObjId );
	};

	var onRoutesListUpArrow = function ( event ) {
		event.stopPropagation ( );
		require ( './RoutesListEditor' ) ( ).swapRoute ( event.itemNode.dataObjId, true );
	};

	var onRoutesListDownArrow = function ( event ) {
		event.stopPropagation ( );
		require ( './RoutesListEditor' ) ( ).swapRoute ( event.itemNode.dataObjId, false );
	};

	var onRoutesListRightArrow = function ( event ) {
		event.stopPropagation ( );
		require ( './RoutesListEditor' ) ( ).editRoute ( event.itemNode.dataObjId );
	};
	
	var onRouteslistChange = function ( event ) {
		event.stopPropagation();
		require ( './RoutesListEditor' ) ( ).renameRoute ( event.dataObjId, event.changeValue );
	};
	
	// User interface

	var _RoutesDiv = null;
	var _RoutesList = null;
	
	var getRoutesListEditorUI = function ( ) {

		
		var _CreateRoutesListEditorUI = function ( ){ 

			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			
			// Routes
			_RoutesDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-RoutesDiv', className : 'TravelControl-Div'} );
			
			var headerRoutesDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-RoutesHeaderDiv', className : 'TravelControl-HeaderDiv'}, _RoutesDiv );
			var expandRouteButton = htmlElementsFactory.create ( 'span', { innerHTML : '&#x25bc;', id : 'TravelControl-RoutesExpandButton', className : 'TravelControl-ExpandButton'}, headerRoutesDiv );
			expandRouteButton.addEventListener ( 'click' , onClickExpandButton, false );
			htmlElementsFactory.create ( 'span', { innerHTML : 'Routes&nbsp;:', id : 'TravelControl-RoutesHeaderText', className : 'TravelControl-HeaderText'}, headerRoutesDiv );
			var routesDataDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControlRoutesDataDiv', className : 'TravelControl-DataDiv'}, _RoutesDiv );
			
			_RoutesList = require ( './SortableList' ) ( { minSize : 0, placeholders : ['Route'], id : 'TravelControl-RouteList' }, routesDataDiv );
			_RoutesList.container.addEventListener ( 'SortableListDelete', onRoutesListDelete, false );
			_RoutesList.container.addEventListener ( 'SortableListUpArrow', onRoutesListUpArrow, false );
			_RoutesList.container.addEventListener ( 'SortableListDownArrow', onRoutesListDownArrow, false );
			_RoutesList.container.addEventListener ( 'SortableListRightArrow', onRoutesListRightArrow, false );
			_RoutesList.container.addEventListener ( 'SortableListChange', onRouteslistChange, false );
			
			var routesButtonsDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-RoutesButtonsDiv', className : 'TravelControl-ButtonsDiv' }, _RoutesDiv );
			var addRouteButton = htmlElementsFactory.create ( 'span', { id : 'TravelControl-AddRoutesButton', className: 'TravelControl-Button', title : 'Nouvelle route', innerHTML : '+'/*'&#x2719;'*/}, routesButtonsDiv );
			addRouteButton.addEventListener ( 'click' , onClickAddRouteButton, false );

			var deleteAllRoutesButton = htmlElementsFactory.create ( 
				'span',
				{ 
					id : 'TravelControl-DeleteAllRoutesButton', 
					className: 'TravelControl-Button', 
					title : 'Supprimer toutes les routes', 
					innerHTML : '&#x267b;'
				},
				routesButtonsDiv
			);
			deleteAllRoutesButton.addEventListener ( 'click' , onClickDeleteAllRoutesButton, false );	
		};
		
		if ( ! _RoutesDiv ) {
			_CreateRoutesListEditorUI ( );
		}
		
		return {
			get UI ( ) { return _RoutesDiv; },
			
			writeRoutesList : function ( newRoutes ) {
				_RoutesList.removeAllItems ( );
				var iterator = newRoutes.iterator;
				while ( ! iterator.done ) {
					_RoutesList.addItem ( iterator.value.name, iterator.value.objId, false );
				}
			}
		};
	};

	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getRoutesListEditorUI;
	}

}());

},{"./HTMLElementsFactory":6,"./RoutesListEditor":13,"./SortableList":15}],15:[function(require,module,exports){
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
	
	var onChange = function ( changeEvent ) {
		console.log ( 'onChange' );
		var event = new Event ( 'SortableListChange' );
		event.dataObjId = changeEvent.target.parentNode.dataObjId;
		event.changeValue = changeEvent.target.value;
		changeEvent.target.parentNode.parentNode.dispatchEvent ( event );
		changeEvent.stopPropagation();
	};
	
	/* 
	--- SortableList object --------------------------------------------------------------------------------------------------
	
	--------------------------------------------------------------------------------------------------------------------------
	*/

	var SortableList = function ( options, parentNode ) {
		
		var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
		
		this.items = [];
		
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
		--- addItem method -----------------------------------------------------------------------------------------------------

		This method ...

		------------------------------------------------------------------------------------------------------------------------
		*/

		this.addItem = function ( name, dataObjId, isLastItem ) {
	
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
					default:
					placeholder = this.options.placeholders [ 1 ];
					break;
				}
				if ( isLastItem ) {
					placeholder = this.options.placeholders [ 2 ];
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
					default:
					indexName = this.options.indexNames [ 1 ];
					break;
				}
				if ( isLastItem ) {
					indexName = this.options.indexNames [ 2 ];
				}
			}
			if ( 'index' === indexName )
			{
				indexName = this.items.length;
			}
			
			var item = htmlElementsFactory.create ( 'div', { draggable : false , className : 'SortableList-Item' } );

			htmlElementsFactory.create ( 'div', { className : 'SortableList-ItemTextIndex' , innerHTML : indexName }, item );
			var inputElement = htmlElementsFactory.create ( 'input', { type : 'text', className : 'SortableList-ItemInput', placeholder : placeholder, value: name}, item );
			inputElement.addEventListener ( 'change' , onChange, false );
			var upArrowButton = htmlElementsFactory.create ( 'div', { className : 'SortableList-ItemUpArrowButton', title : 'Déplacer vers le haut', innerHTML : String.fromCharCode( 8679 ) }, item );
			upArrowButton.addEventListener ( 'click', onUpArrowButtonClick, false );
			var downArrowButton = htmlElementsFactory.create ( 'div', { className : 'SortableList-ItemDownArrowButton', title : 'Déplacer vers le bas', innerHTML : String.fromCharCode( 8681 ) }, item );
			downArrowButton.addEventListener ( 'click', onDownArrowButtonClick, false );
			var rightArrowButton = htmlElementsFactory.create ( 'div', { className : 'SortableList-ItemRightArrowButton', title : 'Éditer', innerHTML : String.fromCharCode( 8688 ) }, item );
			if ( 'AllSort' === this.options.listStyle ) {
				rightArrowButton.addEventListener ( 'click', onRightArrowButtonClick, false );
			}
			var deleteButton = htmlElementsFactory.create ( 'div', { className : 'SortableList-ItemDeleteButton', title : 'Supprimer', innerHTML : '&#x267b;' }, item );
			deleteButton.addEventListener ( 'click', onDeleteButtonClick, false );
			item.dataObjId = dataObjId; 
			item.UIObjId = require ( './ObjId' ) ( );

			this.items.push ( item );

			if ( ( ( 'LimitedSort' !== this.options.listStyle ) || ( 1 < this.items.length ) ) && ( ! isLastItem  ) ){
				item.draggable = true;
				item.addEventListener ( 'dragstart', onDragStart, false );	
				item.classList.add ( 'SortableList-MoveCursor' );
			}
	
			this.container.appendChild ( item );
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
				this.options.minSize = 0;
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

},{"./HTMLElementsFactory":6,"./ObjId":9}],16:[function(require,module,exports){
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
	var _Routes = require ( './Collection' ) ( 'Route' );
	var _ObjId = -1;

	var getTravelData = function ( ) {
		
		return {
			get routes ( ) { return _Routes; },
			
			get objId ( ) { return _ObjId; },
			
			get objName ( ) { return _ObjName; },
			
			get objVersion ( ) { return _ObjVersion; },
			
			get object ( ) {
				var routes = [];
				var iterator = this.routes.iterator;
				while ( ! iterator.done ) {
					routes.push ( iterator.value.object );
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
				_Routes.removeAll ( );
				for ( var routesCounter = 0; routesCounter < Object.routes.length; routesCounter ++ ) {
					var newRoute = require ( './Route' ) ( );
					newRoute.object = Object.routes [ routesCounter ];
					_Routes.add ( newRoute );
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
},{"./Collection":1,"./ObjId":9,"./Route":10}],17:[function(require,module,exports){
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
			
			get UIName ( ) {
				if ( '' !== _Name ) {
					return _Name;
				}
				console.log ( _Lat );
				if ( ( 0 !== _Lat ) && ( 0 !== _Lng ) ) {
					return _Lat.toFixed ( 5 ) + ( 0 < _Lat ? ' N - ' : ' S - ' ) + _Lng.toFixed ( 5 )  + ( 0 < _Lng ? ' E' : ' W' );
				}
				return '';
			},
			
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
},{"./ObjId":9}],18:[function(require,module,exports){
arguments[4][17][0].apply(exports,arguments)
},{"./ObjId":9,"dup":17}],19:[function(require,module,exports){
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
			
			_MainDiv.appendChild ( require ( './RoutesListEditorUI' ) ( ).UI ); 

			_MainDiv.appendChild ( require ( './RouteEditorUI' ) ( ).UI ); 
			// Itinerary
			//var itineraryDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-ItineraryDiv', className : 'TravelControl-Div'}, _MainDiv );

			//htmlElementsFactory.create ( 'span', { innerHTML : 'Itinéraire&nbsp;:', id : 'TravelControl-ItineraryHeaderText',className : 'TravelControl-HeaderText' }, itineraryDiv );
			
			// Errors
			_MainDiv.appendChild ( require ( './ErrorEditorUI' ) ( ).UI ); 
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

},{"./ErrorEditorUI":4,"./HTMLElementsFactory":6,"./RouteEditorUI":12,"./RoutesListEditorUI":14}]},{},[8]);
