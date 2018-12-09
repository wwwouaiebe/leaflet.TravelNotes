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
--- L.TravelNotes.js file -------------------------------------------------------------------------------------
This file contains:
	- the L.TravelNotes object
Changes:
	- v1.0.0:
		- created
	- v1.1.0:
		- Issue #26 : added confirmation message before leaving the page when data modified.
		- Issue #27 : push directly the route in the editor when starting a new travel
	- v1.3.0:
		- Improved _ReadURL method
		- Working with Promise at startup
		- Added baseDialog property
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
		- removing interface
		- moving file functions from TravelEditor to the new FileLoader
		- added loading of osmSearch

Doc reviewed 20171001
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/


( function ( ){
	
	'use strict';


	/* 
	--- TravelNotes object --------------------------------------------------------------------------------------------
	
	This object contains all you need to use TravelNotes :-)
	
	Patterns : Closure
	-------------------------------------------------------------------------------------------------------------------
	*/

	var TravelNotes = function ( ) {

		var _TravelNotesData = require ( './data/TravelNotesData' ) ( );
		if ( typeof module !== 'undefined' && module.exports ) {
			module.exports = _TravelNotesData;
		}
		
		var _LeftUserContextMenuData = [];
		var _RightUserContextMenuData = [];
		var _HaveLeftContextMenu = false;
		var _HaveRightContextMenu = false;
		
		var _Langage = null;
		
		var _TravelUrl = null;
	
		/*
		--- _ReadURL function -----------------------------------------------------------------------------------------

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
						_TravelUrl = decodeURIComponent ( escape( atob ( urlSearchSubString.substr ( 4 ) ) ) );
						newUrlSearch += ( newUrlSearch === '?' ) ? '' :  '&';
						newUrlSearch += urlSearchSubString;
					}
					else {
						var param = urlSearchSubString.split ( '=' );
						if ( 2 === param.length ) {
							if ( -1 !== param [ 0 ].indexOf ( 'ProviderKey' )  ) {
								var providerName = param [ 0 ].substr ( 0, param [ 0 ].length - 11 ).toLowerCase ( );
								var provider = _TravelNotesData.providers.get ( providerName );
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
			var stateObj = { index: "bar" };
			history.replaceState ( stateObj, "page", newUrlSearch );
			
			_TravelNotesData.providers.forEach (
				function ( provider ) {
					if ( provider.providerKeyNeeded && 0 === provider.providerKey ) {
						var providerKey = null;
						if ( require ( './util/Utilities' ) ( ).storageAvailable ( 'sessionStorage' ) ) {
							providerKey = sessionStorage.getItem ( provider.name.toLowerCase ( ) ) ;
						}
						if ( providerKey ) {
							provider.providerKey = atob ( providerKey );
						}
						else {
							_TravelNotesData.providers.delete ( provider.name.toLowerCase( ) );
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
			xmlHttpRequest.timeout = 20000;
			
			xmlHttpRequest.ontimeout = function ( event ) {
				returnOnError ( 'XMLHttpRequest TimeOut. File : ' + xmlHttpRequest.responseURL );
			};
			
			xmlHttpRequest.onreadystatechange = function ( ) {
				if ( xmlHttpRequest.readyState === 4 ) {
					if ( xmlHttpRequest.status === 200 ) {
						var response;
						try {
							response = JSON.parse ( xmlHttpRequest.responseText );
						}
						catch ( e ) {
							returnOnError ( 'JSON parsing error. File : ' + xmlHttpRequest.responseURL );
						}
						returnOnOk ( response );
					}
					else {
						returnOnError ( 'Error XMLHttpRequest - Status : ' + xmlHttpRequest.status + ' - StatusText : ' + xmlHttpRequest.statusText + ' - File : ' + xmlHttpRequest.responseURL );
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
		--- _AddControl function --------------------------------------------------------------------------------------

		This function add the control on the HTML page

		---------------------------------------------------------------------------------------------------------------
		*/

		var _AddControl = function ( map, divControlId ) {
			
			_TravelNotesData.map = map;
			_ReadURL ( );
			
			var promises = [];
			// loading config
			_XMLHttpRequestUrl = window.location.href.substr (0, window.location.href.lastIndexOf( '/') + 1 ) +'TravelNotesConfig.json';
			promises.push ( new Promise ( _StartXMLHttpRequest ) );
			// loading translations
			_XMLHttpRequestUrl = window.location.href.substr (0, window.location.href.lastIndexOf( '/') + 1 ) + 'TravelNotes' + ( _Langage || _TravelNotesData.config.language).toUpperCase ( )  + '.json';
			promises.push ( new Promise ( _StartXMLHttpRequest ) );
			// loading travel
			if ( _TravelUrl ) {
				_XMLHttpRequestUrl = _TravelUrl;
				promises.push (  new Promise ( _StartXMLHttpRequest ) );
			}
			
			Promise.all ( promises ).then ( 
				// promises succeeded
				function ( values ) {
					// config adaptation
					if ( _Langage ) {
						values [ 0 ].language = _Langage;
					}
					_TravelNotesData.config = values [ 0 ];
					
					if ( window.osmSearch ) {
						window.osmSearch.getDictionaryPromise ( _TravelNotesData.config.language )
						.then ( 
							function ( ) { console.log ( 'Dictionary loaded' ); },
							function ( error ) { console.log ( error ); }
						);
					}
					else {
						console.log ( 'osmSearch not found' );
					}

					_TravelNotesData.providers.forEach (
						function ( provider ) {
							provider.userLanguage =  _TravelNotesData.config.language;
						}
					);
					// translations adaptation
					require ( './UI/Translator' ) ( ).setTranslations ( values [ 1 ] );
					// loading new travel
					_TravelNotesData.travel = require ( './data/Travel' ) ( );
					_TravelNotesData.travel.routes.add ( require ( './data/Route' ) ( ) );
					_TravelNotesData.editedRoute = ( require ( './data/Route' ) ( ) );
					// user interface is added
					document.getElementById ( divControlId ).appendChild ( require ( './UI/UserInterface' ) ( ).UI );
					require ( './UI/TravelEditorUI' ) ( ).setRoutesList ( _TravelNotesData.travel.routes );
					require ( './core/TravelEditor' ) ( ).updateRoadBook ( true );

					if ( _TravelUrl ) {
						// loading travel...
						require ( './core/FileLoader' ) ( ).openDistantFile ( values [ 2 ] );
					}
					else {
						if ( _TravelNotesData.config.travelEditor.startupRouteEdition ) {
							require ( './core/TravelEditor' ) ( ).editRoute ( _TravelNotesData.travel.routes.first.objId );
						}
						else {
							require ( './UI/RouteEditorUI' ) ( ) .reduce ( );
						}	
					}
				}
			).catch ( 
				// promises failed
				function ( error ) {
					console.log ( error );
					//document.getElementsByTagName ( 'body' )[0].innerHTML = error;
				}
			);
		};
		
		/*
		--- End of _AddControl function ---
		*/
		
		/*
		--- _OnMapClick function --------------------------------------------------------------------------------------

		Map click event handler
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var _OnMapClick = function ( event ) {
			if ( _TravelNotesData.travel.readOnly ) {
				return;
			}
			require ( './UI/ContextMenu' ) ( 
				event, 
				require ( './core/RouteEditor' ) ( ).getMapContextMenu ( [ event.latlng.lat, event.latlng.lng ] )
				.concat ( require ( './core/NoteEditor' ) ( ).getMapContextMenu ( [ event.latlng.lat, event.latlng.lng ] ) )
				.concat ( _LeftUserContextMenuData ) 
			);
		};
		
		/*
		--- _OnMapContextMenu function --------------------------------------------------------------------------------

		Map context menu event handler
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var _OnMapContextMenu = function ( event ) {
			if ( _TravelNotesData.travel.readOnly ) {
				return;
			}
			require ( './UI/ContextMenu' ) (
				event, 
				require ( './core/RouteEditor' ) ( ).getMapContextMenu ( [ event.latlng.lat, event.latlng.lng ] )
				.concat ( require ( './core/NoteEditor' ) ( ).getMapContextMenu ( [ event.latlng.lat, event.latlng.lng ] ) )
				.concat ( require ( './core/TravelEditor' ) ( ).getMapContextMenu ( [ event.latlng.lat, event.latlng.lng ] ) )
				.concat ( _RightUserContextMenuData )
			);
		};

		return {

			/*
			--- addControl method --------------------------------------------------------------------------------------

			This method add the control on the page

			-----------------------------------------------------------------------------------------------------------
			*/

			addControl : function ( map, divControlId ) { return _AddControl ( map, divControlId );}, 
			
			/*
			--- addProvider method ------------------------------------------------------------------------------------

			This method add a provider to the providers map

			-----------------------------------------------------------------------------------------------------------
			*/
			
			addProvider : function ( provider ) { _TravelNotesData.providers.set ( provider.name.toLowerCase( ), provider ); },
			
			/*
			--- addMapContextMenu method ------------------------------------------------------------------------------

			This method add the map context menus

			-----------------------------------------------------------------------------------------------------------
			*/

			addMapContextMenu : function ( leftButton, rightButton ) {
				if ( leftButton ) {
					_TravelNotesData.map.on ( 'click', _OnMapClick );
					_HaveLeftContextMenu = true;
				}
				if ( rightButton ) {
					_TravelNotesData.map.on ( 'contextmenu', _OnMapClick );
					_HaveRightContextMenu = true;
				}
			},

			/*
			--- getters and setters -----------------------------------------------------------------------------------

			-----------------------------------------------------------------------------------------------------------
			*/

			get baseDialog ( ) { return require ( './UI/baseDialog' ) ( ); },

			get userData ( ) { return _TravelNotesData.travel.userData;},
			set userData ( userData ) { _TravelNotesData.travel.userData = userData;},
			
			get rightContextMenu ( ) { return _HaveRightContextMenu; },
			set rightContextMenu ( RightContextMenu ) { 
				if  ( ( RightContextMenu ) && ( ! _HaveRightContextMenu ) ) {
					_TravelNotesData.map.on ( 'contextmenu', _OnMapContextMenu );
					_HaveRightContextMenu = true;
				}
				else if ( ( ! RightContextMenu ) && ( _HaveRightContextMenu ) ) {
					_TravelNotesData.map.off ( 'contextmenu', _OnMapContextMenu );
					_HaveRightContextMenu = false;
				}
			},
			
			get leftContextMenu ( ) { return _HaveLeftContextMenu; },
			set leftContextMenu ( LeftContextMenu ) { 
				if  ( ( LeftContextMenu ) && ( ! _HaveLeftContextMenu ) ) {
					_TravelNotesData.map.on ( 'click', _OnMapClick );
					_HaveLeftContextMenu = true;
				}
				else if ( ( ! LeftContextMenu ) && ( _HaveLeftContextMenu ) ) {
					_TravelNotesData.map.off ( 'click', _OnMapClick );
					_HaveLeftContextMenu = false;
				}
			},
			
			get leftUserContextMenu ( ) { return _LeftUserContextMenuData; },
			set leftUserContextMenu ( LeftUserContextMenu ) {_LeftUserContextMenuData = LeftUserContextMenu; },
			
			get rightUserContextMenu ( ) { return _RightUserContextMenuData; },
			set rightUserContextMenu ( RightUserContextMenu ) {_RightUserContextMenuData = RightUserContextMenu; },
			
			get maneuver ( ) { return require ( './data/Maneuver' ) ( ); },
			
			get itineraryPoint ( ) { return require ( './data/ItineraryPoint' ) ( );},
			
			get version ( ) { return require ( './data/Version' ) ; }
		};
	};
	L.travelNotes = TravelNotes ( );
	
}());

/*
--- End of L.TravelNotes.js file --------------------------------------------------------------------------------------
*/
