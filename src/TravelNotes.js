/*
Copyright - 2017 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- TravelNotes.js file -----------------------------------------------------------------------------------------------
This file contains:
	- the travelNotesFactory function
	- global variables needed for TravelNotes
Changes:
	- v1.0.0:
		- created
	- v1.1.0:
		- Issue #26 : added confirmation message before leaving the page when data modified.
		- Issue #27 : push directly the route in the editor when starting a new travel
	- v1.3.0:
		- Improved m_ReadURL method
		- Working with Promise at startup
		- Added baseDialog property
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
		- removing interface
		- moving file functions from TravelEditor to the new FileLoader
		- added loading of osmSearch
	- v1.5.0:
		- Issue #52 : when saving the travel to the file, save also the edited route.
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
		- Issue #69 : ContextMenu and ContextMenuFactory are unclear
Doc reviewed 20191127
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

'use strict';

import { g_Translator } from './UI/Translator.js';
import { g_Config } from './data/Config.js';
import { g_TravelNotesData } from './data/TravelNotesData.js';
import { g_TravelEditor } from './core/TravelEditor.js';
import { g_MapEditor } from './core/MapEditor.js';

import { newUtilities } from './util/Utilities.js';
import { newTravel } from './data/Travel.js';
import { newRoute } from './data/Route.js';
import { gc_UI } from './UI/UI.js';
import { newFileLoader } from './core/FileLoader.js';
import { newBaseDialog } from './dialogs/BaseDialog.js';
import { newManeuver } from './data/Maneuver.js';
import { newItineraryPoint } from './data/ItineraryPoint.js';
import { currentVersion } from './data/Version.js';
import { newEventDispatcher } from './util/EventDispatcher.js';

import { newMapContextMenu } from './contextMenus/MapContextMenu.js';
import { newRoadbookUpdate } from './roadbook/RoadbookUpdate.js';

/* 
--- travelNotesFactory funtion ----------------------------------------------------------------------------------------

This function returns all you need to use TravelNotes :-)

Patterns : Closure
-----------------------------------------------------------------------------------------------------------------------
*/

function travelNotesFactory ( ) {

	let m_LeftUserContextMenuData = [];
	let m_RightUserContextMenuData = [];
	let m_HaveLeftContextMenu = false;
	let m_HaveRightContextMenu = false;
	
	let m_Langage = null;
	
	let m_TravelUrl = null;
	
	let m_EventDispatcher = newEventDispatcher ( );

	let m_XMLHttpRequestUrl = '';

	
	window.addEventListener( 
		'unload', 
		( ) => localStorage.removeItem ( g_TravelNotesData.UUID + "-TravelNotesHTML" )
	);

	window.addEventListener( 
		'beforeunload', 
		event => {
			event.returnValue = 'x';
			return 'x'; 
		}
	);

	/*
	--- m_ReadURL function --------------------------------------------------------------------------------------------

	This function extract the route providers API key from the url

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_ReadURL ( ) {
		let newUrlSearch = '?' ;
		( decodeURI ( window.location.search ).substr ( 1 ).split ( '&' ) ).forEach ( 
			urlSearchSubString =>{
				if ( 'fil=' === urlSearchSubString.substr ( 0, 4 ).toLowerCase ( ) ) {
					// Needed to first extract the file name because the file name 
					// can contains some = chars (see base64 specs)
					m_TravelUrl = decodeURIComponent ( escape( atob ( urlSearchSubString.substr ( 4 ) ) ) );
					newUrlSearch += ( newUrlSearch === '?' ) ? '' :  '&';
					newUrlSearch += urlSearchSubString;
				}
				else {
					let param = urlSearchSubString.split ( '=' );
					if ( 2 === param.length ) {
						if ( -1 !== param [ 0 ].indexOf ( 'ProviderKey' )  ) {
							let providerName = param [ 0 ].substr ( 0, param [ 0 ].length - 11 ).toLowerCase ( );
							let provider = g_TravelNotesData.providers.get ( providerName );
							if ( provider && provider.providerKeyNeeded ) {
								provider.providerKey = param [ 1 ];
							}
							sessionStorage.setItem ( providerName, btoa ( param [ 1 ] ) );
						}
						else {
							newUrlSearch += ( newUrlSearch === '?' ) ? '' :  '&';
							newUrlSearch += urlSearchSubString;
							if ( 'lng' === param [ 0 ].toLowerCase ( ) ) {
								m_Langage = param [ 1 ].toLowerCase ( );
							}
						}
					}
				}
			}
		);
		let stateObj = { index: "bar" };
		history.replaceState ( stateObj, "page", newUrlSearch );
		
		g_TravelNotesData.providers.forEach (
			provider => {
				if ( provider.providerKeyNeeded && 0 === provider.providerKey ) {
					let providerKey = null;
					if ( newUtilities ( ).storageAvailable ( 'sessionStorage' ) ) {
						providerKey = sessionStorage.getItem ( provider.name.toLowerCase ( ) ) ;
					}
					if ( providerKey ) {
						provider.providerKey = atob ( providerKey );
					}
					else {
						g_TravelNotesData.providers.delete ( provider.name.toLowerCase( ) );
					}
				}
			}
		);
	}

	/*
	--- End of m_ReadURL function ---
	*/
	
	/*
	--- m_StartXMLHttpRequest function --------------------------------------------------------------------------------

	This function ...

	-------------------------------------------------------------------------------------------------------------------
	*/
	
	function m_StartXMLHttpRequest ( returnOnOk, returnOnError ) {
		
		let xmlHttpRequest = new XMLHttpRequest ( );
		xmlHttpRequest.timeout = 20000;
		
		xmlHttpRequest.ontimeout = function ( ) {
			returnOnError ( 'XMLHttpRequest TimeOut. File : ' + xmlHttpRequest.responseURL );
		};
		
		xmlHttpRequest.onreadystatechange = function ( ) {
			if ( xmlHttpRequest.readyState === 4 ) {
				if ( xmlHttpRequest.status === 200 ) {
					let response;
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
		
		xmlHttpRequest.open ( "GET", m_XMLHttpRequestUrl, true );
		xmlHttpRequest.overrideMimeType ( 'application/json' );
		xmlHttpRequest.send ( null );
		
	}
	
	/*
	--- End of m_StartXMLHttpRequest function ---
	*/

	/*
	--- m_AddControl function -----------------------------------------------------------------------------------------

	This function add the control on the HTML page

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_AddControl ( map, divControlId ) {
		
		g_TravelNotesData.map = map;
		
		m_ReadURL ( );
		
		g_MapEditor.loadEvents ( );
		
		let promises = [];
		// loading config
		m_XMLHttpRequestUrl = window.location.href.substr (0, window.location.href.lastIndexOf( '/') + 1 ) +'TravelNotesConfig.json';
		promises.push ( new Promise ( m_StartXMLHttpRequest ) );
		// loading translations
		m_XMLHttpRequestUrl = window.location.href.substr (0, window.location.href.lastIndexOf( '/') + 1 ) + 'TravelNotes' + ( m_Langage || g_Config.language).toUpperCase ( )  + '.json';
		promises.push ( new Promise ( m_StartXMLHttpRequest ) );
		// loading travel
		if ( m_TravelUrl ) {
			m_XMLHttpRequestUrl = m_TravelUrl;
			promises.push (  new Promise ( m_StartXMLHttpRequest ) );
		}
		
		Promise.all ( promises ).then ( 
			// promises succeeded
			values => {
				// config adaptation
				if ( m_Langage ) {
					values [ 0 ].language = m_Langage;
				}
				g_Config.overload ( values [ 0 ] );
				
				if ( window.osmSearch ) {
					window.osmSearch.getDictionaryPromise ( g_Config.language, 'travelNotes' )
					.then ( 
						( ) => console.log ( 'osmSearch dictionary loaded' ),
						err => console.log ( err ? err : 'An error occurs when loading the osmSearch dictionary' )
					);
				}
				else {
					console.log ( 'osmSearch not found' );
				}

				g_TravelNotesData.providers.forEach (
					provider => {
						provider.userLanguage =  g_Config.language;
					}
				);
				
				// translations adaptation
				g_Translator.setTranslations ( values [ 1 ] );
				// loading new travel
				g_TravelNotesData.travel = newTravel ( );
				g_TravelNotesData.travel.routes.add ( newRoute ( ) );
				// user interface is added
				gc_UI.createUI ( document.getElementById ( divControlId ) );
				m_EventDispatcher.dispatch ( 'setrouteslist' );
				newRoadbookUpdate ( );

				if ( m_TravelUrl ) {
					// loading travel...
					newFileLoader ( ).openDistantFile ( values [ 2 ] );
				}
				else {
					if ( g_Config.travelEditor.startupRouteEdition ) {
						g_TravelEditor.editRoute ( g_TravelNotesData.travel.routes.first.objId );
					}
					else {
						m_EventDispatcher.dispatch ( 'reducerouteui' );
					}	
				}
			}
		).catch ( 
			err => console.log ( err ? err : 'An error occurs when loading translations or config' )
		);
	}
	
	/*
	--- End of m_AddControl function ---
	*/
	
	/*
	--- m_OnMapClick function ------------------------------------------------------------------------------------------

	Map click event handler
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnMapClick ( ) {
		if ( ! g_TravelNotesData.travel.readOnly ) {
			newMapContextMenu ( event ).show ( );
		}
	}
	
	/*
	--- m_OnMapContextMenu function ------------------------------------------------------------------------------------

	Map context menu event handler
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnMapContextMenu ( event ) {
		if ( ! g_TravelNotesData.travel.readOnly ) {
			newMapContextMenu ( event ).show ( );
		}
	}

	return {

		/*
		--- addControl method ------------------------------------------------------------------------------------------

		This method add the control on the page

		---------------------------------------------------------------------------------------------------------------
		*/

		addControl : ( map, divControlId ) => { return m_AddControl ( map, divControlId );}, 
		
		/*
		--- addProvider method ----------------------------------------------------------------------------------------

		This method add a provider to the providers map

		---------------------------------------------------------------------------------------------------------------
		*/
		
		addProvider : provider => g_TravelNotesData.providers.set ( provider.name.toLowerCase( ), provider ),
		
		/*
		--- addMapContextMenu method ----------------------------------------------------------------------------------

		This method add the map context menus

		---------------------------------------------------------------------------------------------------------------
		*/

		addMapContextMenu : ( leftButton, rightButton ) => {
			if ( leftButton ) {
				g_TravelNotesData.map.on ( 'click', m_OnMapClick );
				m_HaveLeftContextMenu = true;
			}
			if ( rightButton ) {
				g_TravelNotesData.map.on ( 'contextmenu', m_OnMapClick );
				m_HaveRightContextMenu = true;
			}
		},

		/*
		--- getters and setters ---------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		get baseDialog ( ) { return newBaseDialog ( ); },

		get userData ( ) { return g_TravelNotesData.travel.userData;},
		set userData ( userData ) { g_TravelNotesData.travel.userData = userData;},
		
		get rightContextMenu ( ) { return m_HaveRightContextMenu; },
		set rightContextMenu ( RightContextMenu ) { 
			if  ( ( RightContextMenu ) && ( ! m_HaveRightContextMenu ) ) {
				g_TravelNotesData.map.on ( 'contextmenu', m_OnMapContextMenu );
				m_HaveRightContextMenu = true;
			}
			else if ( ( ! RightContextMenu ) && ( m_HaveRightContextMenu ) ) {
				g_TravelNotesData.map.off ( 'contextmenu', m_OnMapContextMenu );
				m_HaveRightContextMenu = false;
			}
		},
		
		get leftContextMenu ( ) { return m_HaveLeftContextMenu; },
		set leftContextMenu ( LeftContextMenu ) { 
			if  ( ( LeftContextMenu ) && ( ! m_HaveLeftContextMenu ) ) {
				g_TravelNotesData.map.on ( 'click', m_OnMapClick );
				m_HaveLeftContextMenu = true;
			}
			else if ( ( ! LeftContextMenu ) && ( m_HaveLeftContextMenu ) ) {
				g_TravelNotesData.map.off ( 'click', m_OnMapClick );
				m_HaveLeftContextMenu = false;
			}
		},
		
		get leftUserContextMenu ( ) { return m_LeftUserContextMenuData; },
		set leftUserContextMenu ( LeftUserContextMenu ) {m_LeftUserContextMenuData = LeftUserContextMenu; },
		
		get rightUserContextMenu ( ) { return m_RightUserContextMenuData; },
		set rightUserContextMenu ( RightUserContextMenu ) {m_RightUserContextMenuData = RightUserContextMenu; },
		
		get maneuver ( ) { return newManeuver ( ); },
		
		get itineraryPoint ( ) { return newItineraryPoint ( );},
		
		get version ( ) { return currentVersion; }
	};
}

try {
	window.L.travelNotes = travelNotesFactory ( );
}
catch ( err ) {
	console.log ( err ? err : 'An error occurs when loading TravelNotes' );
}

/*
--- End of TravelNotes.js file ----------------------------------------------------------------------------------------
*/
