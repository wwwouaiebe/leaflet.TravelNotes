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
--- L.TravelNotes.Interface.js file -------------------------------------------------------------------------------------
This file contains:
	- the L.TravelNotes.Interface object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	-v1.1.0:
		- Issue #26 : added confirmation message before leaving the page when data modified.
		- Issue #27 : push directly the route in the editor when starting a new travel
Doc reviewed 20171001
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';
	
	
	L = L || {};
	L.TravelNotes = L.TravelNotes || {};
	L.travelNotes = L.travelNotes || {};
	
	var _LeftUserContextMenu = [];
	var _RightUserContextMenu = [];
	var _LeftContextMenu = false;
	var _RightContextMenu = false;
	
	var _Langage = '';
	var _LoadedTravel = null;
	var _DataManager = require ( './data/DataManager' ) ( );
	var _Utilities = require ( './util/Utilities' ) ( );

	
	/* 
	--- L.TravelNotes.Interface object -----------------------------------------------------------------------------
	
	This object contains all you need to use TravelNotes :-)
	
	Patterns : Closure
	------------------------------------------------------------------------------------------------------------------------
	*/

	L.TravelNotes.Interface = function ( ) {
	
		/*
		--- _ReadURL function -------------------------------------------------------------------------------------------

		This function extract the route providers API key from the url

		---------------------------------------------------------------------------------------------------------------
		*/

		var _ReadURL = function ( ) {
			var newUrlSearch = '?' ;
			( decodeURI ( window.location.search ).substr ( 1 ).split ( '&' ) ).forEach ( 
				function ( urlSearchSubString ){
					if ( 'fil=' === urlSearchSubString.substr ( 0, 4 ).toLowerCase ( ) ) {
						// Needed to first extract the file name because the file name 
						// can contains some = chars (see base64 specs)
						_LoadedTravel = decodeURIComponent ( escape( atob ( urlSearchSubString.substr ( 4 ) ) ) );
						newUrlSearch += ( newUrlSearch === '?' ) ? '' :  '&';
						newUrlSearch += urlSearchSubString;
					}
					else {
						var param = urlSearchSubString.split ( '=' );
						if ( 2 === param.length ) {
							if ( -1 !== param [ 0 ].indexOf ( 'ProviderKey' )  ) {
								var providerName = param [ 0 ].substr ( 0, param [ 0 ].length - 11 ).toLowerCase ( );
								var provider = _DataManager.providers.get ( providerName );
								if ( provider && provider.providerKeyNeeded ) {
									provider.providerKey = param [ 1 ];
								}
								sessionStorage.setItem ( providerName, btoa ( param [ 1 ] ) );
							}
							else {
								newUrlSearch += ( newUrlSearch === '?' ) ? '' :  '&';
								newUrlSearch += urlSearchSubString;
								if ( 'lng' === param [ 0 ].toLowerCase ( ) ) {
									_Langage = param [ 1 ].toLowerCase ( );
								}
							}
						}
					}
				}
			);
			if ( '' === _Langage ) {
				_Langage = 'fr'
			}
			var stateObj = { index: "bar" };
			history.replaceState ( stateObj, "page", newUrlSearch );
			
			_DataManager.providers.forEach (
				function ( provider ) {
					provider.userLanguage =  _Langage;
					if ( provider.providerKeyNeeded && 0 === provider.providerKey ) {
						var providerKey = null;
						if ( _Utilities.storageAvailable ( 'sessionStorage' ) ) {
							providerKey = sessionStorage.getItem ( provider.name.toLowerCase ( ) ) ;
						}
						if ( providerKey ) {
							provider.providerKey = atob ( providerKey );
						}
						else {
							_DataManager.providers.delete ( provider.name.toLowerCase( ) );
						}
					}
				}
			);
		};

		/*
		--- End of _ReadURL function ---
		*/
		
		/*
		--- _StartXMLHttpRequest function -----------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/
		
		var _XMLHttpRequestUrl = '';


		var _StartXMLHttpRequest = function ( returnOnOk, returnOnError ) {
			
			var xmlHttpRequest = new XMLHttpRequest ( );
			xmlHttpRequest.timeout = 5000;
			
			xmlHttpRequest.ontimeout = function ( event ) {
				returnOnError ( 'TimeOut error' );
			};
			
			xmlHttpRequest.onreadystatechange = function ( ) {
				if ( xmlHttpRequest.readyState === 4 ) {
					if ( xmlHttpRequest.status === 200 ) {
						var response;
						try {
							response = JSON.parse ( xmlHttpRequest.responseText );
						}
						catch ( e ) {
							returnOnError ( 'JSON parsing error' );
						}
						returnOnOk ( response );
					}
					else {
						returnOnError ( 'Status : ' + this.status + ' statusText : ' + this.statusText );
					}
				}
			};
			
			xmlHttpRequest.open ( "GET", _XMLHttpRequestUrl, true );
			xmlHttpRequest.overrideMimeType ( 'application/json' );
			xmlHttpRequest.send ( null );
			
		};
		
		/*
		--- End of _StartXMLHttpRequest function ---
		*/

		/*
		--- onMapClick function ---------------------------------------------------------------------------------------

		Map click event handler
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var onMapClick = function ( event ) {
			if ( _DataManager.travel.readOnly ) {
				return;
			}
			require ('./UI/ContextMenu' ) ( 
				event, 
				require ( './core/RouteEditor' ) ( ).getMapContextMenu ( [ event.latlng.lat, event.latlng.lng ] )
				.concat ( require ( './core/NoteEditor' ) ( ).getMapContextMenu ( [ event.latlng.lat, event.latlng.lng ] ) )
				.concat ( _LeftUserContextMenu ) 
			);
		};
		
		/*
		--- onMapContextMenu function ---------------------------------------------------------------------------------

		Map context menu event handler
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var onMapContextMenu = function ( event ) {
			if ( _DataManager.travel.readOnly ) {
				return;
			}
			require ('./UI/ContextMenu' ) (
				event, 
				require ( './core/RouteEditor' ) ( ).getMapContextMenu ( [ event.latlng.lat, event.latlng.lng ] )
				.concat ( require ( './core/NoteEditor' ) ( ).getMapContextMenu ( [ event.latlng.lat, event.latlng.lng ] ) )
				.concat ( require ( './core/TravelEditor' ) ( ).getMapContextMenu ( [ event.latlng.lat, event.latlng.lng ] ) )
				.concat ( _RightUserContextMenu )
			);
		};

		return {

			/*
			--- addControl method --------------------------------------------------------------------------------------

			This method add the control on the page

			-----------------------------------------------------------------------------------------------------------
			*/

			addControl : function ( map, divControlId, options ) {
				_DataManager.init ( map );
				_ReadURL ( );
				
				var promises = [];
				_XMLHttpRequestUrl = window.location.href.substr (0, window.location.href.lastIndexOf( '/') + 1 ) +'TravelNotesConfig.json';
				promises.push ( new Promise ( _StartXMLHttpRequest ) );
				_XMLHttpRequestUrl = window.location.href.substr (0, window.location.href.lastIndexOf( '/') + 1 ) + 'TravelNotes' + _DataManager.config.language.toUpperCase ( ) + '.json';
				promises.push ( new Promise ( _StartXMLHttpRequest ) );
				if ( _LoadedTravel ) {
					_XMLHttpRequestUrl = _LoadedTravel;
					promises.push (  new Promise ( _StartXMLHttpRequest ) );
				}
				Promise.all ( promises ).then ( 
					function ( values ) {
						_DataManager.config = values [ 0 ];
						if ( '' !== _Langage ) {
							_DataManager.config.language = _Langage;
						}
						_DataManager.travel = require ( './data/Travel' ) ( );
						require ( './UI/Translator' ) ( ).setTranslations ( values [ 1 ] );
						if ( divControlId )	{
							document.getElementById ( divControlId ).appendChild ( require ( './UI/UserInterface' ) ( ).UI );
						}	
						else {
							map.addControl ( require ('./L.TravelNotes.Control' ) ( options ) );
						}
						require ( './UI/TravelEditorUI' ) ( ).setRoutesList ( _DataManager.travel.routes );
						if ( _LoadedTravel ) {
							require ( './core/TravelEditor' ) ( ).openServerTravel ( _LoadedTravel );
						}
						require ( './core/TravelEditor' ) ( ).changeTravelHTML ( true );
						if ( _DataManager.config.travelEditor.startupRouteEdition ) {
							require ( './core/TravelEditor' ) ( ).editRoute ( _DataManager.travel.routes.first.objId );
						}
						else {
							require ( './UI/RouteEditorUI' ) ( ) .reduce ( );
						}	
					}
				);
				
			},
			
			/*
			--- addProvider method ------------------------------------------------------------------------------------

			This method add a provider to the providers map

			-----------------------------------------------------------------------------------------------------------
			*/
			
			addProvider : function ( provider ) { 
				if ( ! global.providers ) {
					global.providers = new Map ( );
				}
				global.providers.set ( provider.name.toLowerCase( ), provider );
			},
			
			/*
			--- addMapContextMenu method ------------------------------------------------------------------------------

			This method add the map context menus

			-----------------------------------------------------------------------------------------------------------
			*/

			addMapContextMenu : function ( leftButton, rightButton ) {
				if ( leftButton ) {
					_DataManager.map.on ( 'click', onMapClick );
					_LeftContextMenu = true;
				}
				if ( rightButton ) {
					_DataManager.map.on ( 'contextmenu', onMapClick );
					_RightContextMenu = true;
				}
			},

			/*
			--- getProviderKey method ---------------------------------------------------------------------------------

			This method returns a provider key

			-----------------------------------------------------------------------------------------------------------
			*/

			
			getProviderKey : function ( providerName ) {
				var providerKey = '';
				if ( require ( './util/Utilities' ) ( ).storageAvailable ( 'sessionStorage' ) ) {
					var encodedProviderKey = sessionStorage.getItem ( providerName.toLowerCase ( ) );
					if ( encodedProviderKey ) {
						providerKey = atob ( encodedProviderKey );
					}
				}
				
				return providerKey;
			},
			

			/*
			--- getters and setters -----------------------------------------------------------------------------------

			-----------------------------------------------------------------------------------------------------------
			*/

			get baseDialog ( ) {
				return require ( './UI/baseDialog' ) ( );
			},

			get userData ( ) { 
				if ( _DataManager.travel.userData ) { 
					return _DataManager.travel.userData;
				}
				return {};
			},
			set userData ( userData ) {
				 _DataManager.travel.userData = userData;
			},
			
			get rightContextMenu ( ) { return _RightContextMenu; },
			set rightContextMenu ( RightContextMenu ) { 
				if  ( ( RightContextMenu ) && ( ! _RightContextMenu ) ) {
					_DataManager.map.on ( 'contextmenu', onMapContextMenu );
					_RightContextMenu = true;
				}
				else if ( ( ! RightContextMenu ) && ( _RightContextMenu ) ) {
					_DataManager.map.off ( 'contextmenu', onMapContextMenu );
					_RightContextMenu = false;
				}
			},
			
			get leftContextMenu ( ) { return _LeftContextMenu; },
			set leftContextMenu ( LeftContextMenu ) { 
				if  ( ( LeftContextMenu ) && ( ! _LeftContextMenu ) ) {
					_DataManager.map.on ( 'click', onMapClick );
					_LeftContextMenu = true;
				}
				else if ( ( ! LeftContextMenu ) && ( _LeftContextMenu ) ) {
					_DataManager.map.off ( 'click', onMapClick );
					_LeftContextMenu = false;
				}
			},
			
			get leftUserContextMenu ( ) { return _LeftUserContextMenu; },
			set leftUserContextMenu ( LeftUserContextMenu ) {_LeftUserContextMenu = LeftUserContextMenu; },
			
			get rightUserContextMenu ( ) { return _RightUserContextMenu; },
			set rightUserContextMenu ( RightUserContextMenu ) {_RightUserContextMenu = RightUserContextMenu; },
			
			get maneuver ( ) { return require ( './data/Maneuver' ) ( ); },
			
			get itineraryPoint ( ) { return require ( './data/ItineraryPoint' ) ( );},
			
			get version ( ) { return require ( './data/DataManager' ) ( ).version; }
		};
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	L.travelNotes.interface = function ( ) {
		return L.TravelNotes.Interface ( );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = L.travelNotes.interface;
	}

}());

/*
--- End of L.TravelNotes.Interface.js file ------------------------------------------------------------------------------
*/
