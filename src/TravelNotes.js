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
		- Improved myReadURL method
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
		- Issue #63 : Find a better solution for provider keys upload
		- Issue #75 : Merge Maps and TravelNotes
Doc reviewed 20191127
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from './UI/Translator.js';
import { theConfig } from './data/Config.js';
import { theTravelNotesData } from './data/TravelNotesData.js';
import { theTravelEditor } from './core/TravelEditor.js';
import { theMapEditor } from './core/MapEditor.js';
import { theAPIKeysManager } from './core/APIKeysManager.js';
import { theUI } from './UI/UI.js';

import { newTravel } from './data/Travel.js';
import { newRoute } from './data/Route.js';
import { newFileLoader } from './core/FileLoader.js';
import { newBaseDialog } from './dialogs/BaseDialog.js';
import { newManeuver } from './data/Maneuver.js';
import { newItineraryPoint } from './data/ItineraryPoint.js';
import { theCurrentVersion } from './data/Version.js';
import { newEventDispatcher } from './util/EventDispatcher.js';
import { newHttpRequestBuilder } from './util/HttpRequestBuilder.js';
import { newMapContextMenu } from './contextMenus/MapContextMenu.js';
import { newRoadbookUpdate } from './roadbook/RoadbookUpdate.js';
import { newAutoLoader } from './UI/AutoLoader.js';
import { theLayersToolbarUI } from './UI/LayersToolbarUI.js';
import { theMouseUI } from './UI/MouseUI.js';
import { theAttributionsUI } from './UI/AttributionsUI.js';
import { theErrorsUI } from './UI/ErrorsUI.js';

import { THE_CONST } from './util/Constants.js';

/*
--- travelNotesFactory funtion ----------------------------------------------------------------------------------------

This function returns all you need to use TravelNotes :-)

Patterns : Closure
-----------------------------------------------------------------------------------------------------------------------
*/

function travelNotesFactory ( ) {

	let myLeftUserContextMenuData = [];
	let myRightUserContextMenuData = [];
	let myHaveLeftContextMenu = false;
	let myHaveRightContextMenu = false;

	let myLangage = null;

	let myTravelUrl = null;

	let myEventDispatcher = newEventDispatcher ( );

	window.addEventListener (
		'unload',
		( ) => localStorage.removeItem ( theTravelNotesData.UUID + '-TravelNotesHTML' )
	);

	window.addEventListener (
		'beforeunload',
		beforeUnloadEvent => {
			beforeUnloadEvent.returnValue = 'x';
			return 'x';
		}
	);

	/*
	--- myReadURL function --------------------------------------------------------------------------------------------

	This function extract the route providers API key from the url

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myReadURL ( ) {
		let newUrlSearch = '?';
		( decodeURI ( window.location.search ).substr ( THE_CONST.number1 )
			.split ( '&' ) )
			.forEach (
				urlSearchSubString => {
					if ( THE_CONST.notFound === urlSearchSubString.indexOf ( 'ProviderKey' ) ) {
						if ( 'fil=' === urlSearchSubString.substr ( THE_CONST.zero, THE_CONST.number4 ).toLowerCase ( ) ) {
							myTravelUrl = decodeURIComponent (
								escape ( atob ( urlSearchSubString.substr ( THE_CONST.number4 ) ) ) );
						}
						else if ( 'lng=' === urlSearchSubString.substr ( THE_CONST.zero, THE_CONST.number4 ).toLowerCase ( ) ) {
							myLangage = urlSearchSubString.substr ( THE_CONST.number4 ).toLowerCase ( );
						}
						newUrlSearch += ( '?' === newUrlSearch ) ? '' : '&';
						newUrlSearch += urlSearchSubString;
					}
					else {
						theAPIKeysManager.fromUrl ( urlSearchSubString );
					}
				}
			);
		let stateObj = { index : 'bar' };
		history.replaceState ( stateObj, 'page', newUrlSearch );
	}

	/*
	--- End of myReadURL function ---
	*/

	/*
	--- myAddControl function -----------------------------------------------------------------------------------------

	This function add the control on the HTML page

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddControl ( map, divControlId ) {

		theTravelNotesData.map = map;

		myReadURL ( );

		document.addEventListener (
			'removeroute',
			removeRouteEvent => {
				if ( removeRouteEvent.data ) {
					theMapEditor.removeRoute (
						removeRouteEvent.data.route,
						removeRouteEvent.data.RemoveNotes,
						removeRouteEvent.data.removeWayPoints
					);
				}
			},
			false
		);
		document.addEventListener (
			'addroute',
			addRouteEvent => {
				if ( addRouteEvent.data ) {
					theMapEditor.addRoute (
						addRouteEvent.data.route,
						addRouteEvent.data.addNotes,
						addRouteEvent.data.addWayPoints,
						addRouteEvent.data.readOnly
					);
				}
			},
			false
		);
		document.addEventListener (
			'editroute',
			editRouteEvent => {
				if ( editRouteEvent.data ) {
					theMapEditor.editRoute (
						editRouteEvent.data.route
					);
				}
			},
			false
		);
		document.addEventListener (
			'removeobject',
			removeObjectEvent => {
				if ( removeObjectEvent.data ) {
					theMapEditor.removeObject (
						removeObjectEvent.data.objId
					);
				}
			},
			false
		);
		document.addEventListener ( 'removeallobjects',	( ) => theMapEditor.removeAllObjects ( ), false );
		document.addEventListener (
			'zoomtopoint',
			zoomToPointEvent => {
				if ( zoomToPointEvent.data ) {
					theMapEditor.zoomToPoint (
						zoomToPointEvent.data.latLng
					);
				}
			},
			false
		);
		document.addEventListener (
			'zoomtosearchresult',
			zoomToSearchResultEvent => {
				if ( zoomToSearchResultEvent.data ) {
					theMapEditor.zoomToSearchResult (
						zoomToSearchResultEvent.data.latLng,
						zoomToSearchResultEvent.data.geometry
					);
				}
			},
			false
		);
		document.addEventListener (
			'zoomtonote',
			zoomToNoteEvent => {
				if ( zoomToNoteEvent.data ) {
					theMapEditor.zoomToNote (
						zoomToNoteEvent.data.noteObjId
					);
				}
			},
			false
		);
		document.addEventListener (
			'zoomtoroute',
			zoomToRouteEvent => {
				if ( zoomToRouteEvent.data ) {
					theMapEditor.zoomToRoute (
						zoomToRouteEvent.data.routeObjId
					);
				}
			},
			false
		);
		document.addEventListener ( 'zoomtotravel',	( ) => theMapEditor.zoomToTravel ( ), false );
		document.addEventListener (
			'additinerarypointmarker',
			addItineraryPointMarkerEvent => {
				if ( addItineraryPointMarkerEvent.data ) {
					theMapEditor.addItineraryPointMarker (
						addItineraryPointMarkerEvent.data.objId,
						addItineraryPointMarkerEvent.data.latLng
					);
				}
			},
			false
		);
		document.addEventListener (
			'addsearchpointmarker',
			addSearchPointMarkerEvent => {
				if ( addSearchPointMarkerEvent.data ) {
					theMapEditor.addSearchPointMarker (
						addSearchPointMarkerEvent.data.objId,
						addSearchPointMarkerEvent.data.latLng,
						addSearchPointMarkerEvent.data.geometry
					);
				}
			},
			false
		);
		document.addEventListener (
			'addrectangle',
			addRectangleEvent => {
				if ( addRectangleEvent.data ) {
					theMapEditor.addRectangle (
						addRectangleEvent.data.objId,
						addRectangleEvent.data.bounds,
						addRectangleEvent.data.properties
					);
				}
			},
			false
		);
		document.addEventListener (
			'addwaypoint',
			addWayPointEvent => {
				if ( addWayPointEvent.data ) {
					theMapEditor.addWayPoint (
						addWayPointEvent.data.wayPoint,
						addWayPointEvent.data.letter
					);
				}
			},
			false
		);
		document.addEventListener (
			'redrawnote',
			redrawNoteEvent => {
				if ( redrawNoteEvent.data ) {
					theMapEditor.redrawNote (
						redrawNoteEvent.data.note
					);
				}
			},
			false
		);
		document.addEventListener (
			'addnote',
			addNoteEvent => {
				if ( addNoteEvent.data ) {
					theMapEditor.addNote (
						addNoteEvent.data.note,
						addNoteEvent.data.readOnly
					);
				}
			},
			false
		);
		document.addEventListener (
			'layerchange',
			layerChangeEvent => {
				if ( layerChangeEvent.data ) {
					theMapEditor.setLayer ( layerChangeEvent.data.layer );
				}
			}
		);
		document.addEventListener (
			'geolocationpositionchanged',
			geoLocationPositionChangedEvent => {
				if ( geoLocationPositionChangedEvent.data ) {
					theMapEditor.onGeolocationPositionChanged ( geoLocationPositionChangedEvent.data.position );
				}
			},
			false
		);
		document.addEventListener (
			'geolocationstatuschanged',
			geoLocationStatusChangedEvent => {
				if ( geoLocationStatusChangedEvent.data ) {
					theMapEditor.onGeolocationStatusChanged ( geoLocationStatusChangedEvent.data.status );
				}
			},
			false
		);

		let requestBuilder = newHttpRequestBuilder ( );
		let promises = [
			requestBuilder.getJsonPromise (
				window.location.href.substr ( THE_CONST.zero, window.location.href.lastIndexOf ( '/' ) + THE_CONST.number1 ) +
				'TravelNotesConfig.json'
			),
			requestBuilder.getJsonPromise (
				window.location.href.substr ( THE_CONST.zero, window.location.href.lastIndexOf ( '/' ) + THE_CONST.number1 ) +
				'TravelNotes' +
				( myLangage || theConfig.language ).toUpperCase ( ) +
				'.json'
			)
		];
		if ( myTravelUrl ) {
			promises.push ( requestBuilder.getJsonPromise ( myTravelUrl ) );
		}

		Promise.all ( promises ).then (

			// promises succeeded
			values => {

				// config adaptation
				if ( myLangage ) {
					values [ THE_CONST.zero ].language = myLangage;
				}

				// theConfig.overload ( values [ THE_CONST.zero ] );

				// translations adaptation
				theTranslator.setTranslations ( values [ THE_CONST.number1 ] );
				theTravelNotesData.providers.forEach (
					provider => {
						provider.userLanguage = theConfig.language;
					}
				);

				// osmSearch
				if ( window.osmSearch ) {
					window.osmSearch.getDictionaryPromise ( theConfig.language, 'travelNotes' )
						.then (
							( ) => console.log ( 'osmSearch dictionary loaded' ),
							err => console.log ( err ? err : 'An error occurs when loading the osmSearch dictionary' )
						);
				}
				else {
					console.log ( 'osmSearch not found' );
				}

				// loading new travel
				theTravelNotesData.travel = newTravel ( );
				theTravelNotesData.travel.routes.add ( newRoute ( ) );

				// user interface is added
				theUI.createUI ( document.getElementById ( divControlId ) );

				myEventDispatcher.dispatch ( 'setrouteslist' );
				newRoadbookUpdate ( );

				theAttributionsUI.createUI ( );
				theErrorsUI.createUI ( );

				if ( myTravelUrl ) {

					// loading travel...
					newFileLoader ( ).openDistantFile ( values [ THE_CONST.number2 ] );
				}
				else {
					theAPIKeysManager.fromServerFile ( );
					if ( theConfig.layersToolbarUI.haveLayersToolbarUI ) {
						theLayersToolbarUI.createUI ( );
					}
					if ( theConfig.mouseUI.haveMouseUI ) {
						theMouseUI.createUI ( );
					}
					if ( theConfig.travelEditor.startupRouteEdition ) {
						theTravelEditor.editRoute ( theTravelNotesData.travel.routes.first.objId );
					}
					else {
						myEventDispatcher.dispatch ( 'reducerouteui' );
					}
				}
			}
		)
			.catch (
				err => console.log ( err ? err : 'An error occurs when loading translations or config' )
			);
	}

	/*
	--- End of myAddControl function ---
	*/

	/*
	--- myOnMapClick function ------------------------------------------------------------------------------------------

	Map click event handler

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnMapClick ( ) {
		if ( ! theTravelNotesData.travel.readOnly ) {
			newMapContextMenu ( event ).show ( );
		}
	}

	/*
	--- myOnMapContextMenu function ------------------------------------------------------------------------------------

	Map context menu event handler

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnMapContextMenu ( contextMenuEvent ) {
		if ( ! theTravelNotesData.travel.readOnly ) {
			newMapContextMenu ( contextMenuEvent ).show ( );
		}
	}

	/*
	--- myAddProvider function ----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddProvider ( provider ) {
		theAPIKeysManager.addProvider ( provider );
	}

	return {

		/*
		--- addControl method ------------------------------------------------------------------------------------------

		This method add the control on the page

		---------------------------------------------------------------------------------------------------------------
		*/

		addControl : ( map, divControlId ) => myAddControl ( map, divControlId ),

		/*
		--- addProvider method ----------------------------------------------------------------------------------------

		This method add a provider to the providers map

		---------------------------------------------------------------------------------------------------------------
		*/

		addProvider : provider => myAddProvider ( provider ),

		/*
		--- addMapContextMenu method ----------------------------------------------------------------------------------

		This method add the map context menus

		---------------------------------------------------------------------------------------------------------------
		*/

		addMapContextMenu : ( leftButton, rightButton ) => {
			if ( leftButton ) {
				theTravelNotesData.map.on ( 'click', myOnMapClick );
				myHaveLeftContextMenu = true;
			}
			if ( rightButton ) {
				theTravelNotesData.map.on ( 'contextmenu', myOnMapClick );
				myHaveRightContextMenu = true;
			}
		},

		/*
		--- getters and setters ---------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		get baseDialog ( ) { return newBaseDialog ( ); },

		get userData ( ) { return theTravelNotesData.travel.userData; },
		set userData ( userData ) { theTravelNotesData.travel.userData = userData; },

		get rightContextMenu ( ) { return myHaveRightContextMenu; },
		set rightContextMenu ( RightContextMenu ) {
			if ( ( RightContextMenu ) && ( ! myHaveRightContextMenu ) ) {
				theTravelNotesData.map.on ( 'contextmenu', myOnMapContextMenu );
				myHaveRightContextMenu = true;
			}
			else if ( ( ! RightContextMenu ) && ( myHaveRightContextMenu ) ) {
				theTravelNotesData.map.off ( 'contextmenu', myOnMapContextMenu );
				myHaveRightContextMenu = false;
			}
		},

		get leftContextMenu ( ) { return myHaveLeftContextMenu; },
		set leftContextMenu ( LeftContextMenu ) {
			if ( ( LeftContextMenu ) && ( ! myHaveLeftContextMenu ) ) {
				theTravelNotesData.map.on ( 'click', myOnMapClick );
				myHaveLeftContextMenu = true;
			}
			else if ( ( ! LeftContextMenu ) && ( myHaveLeftContextMenu ) ) {
				theTravelNotesData.map.off ( 'click', myOnMapClick );
				myHaveLeftContextMenu = false;
			}
		},

		get leftUserContextMenu ( ) { return myLeftUserContextMenuData; },
		set leftUserContextMenu ( LeftUserContextMenu ) { myLeftUserContextMenuData = LeftUserContextMenu; },

		get rightUserContextMenu ( ) { return myRightUserContextMenuData; },
		set rightUserContextMenu ( RightUserContextMenu ) { myRightUserContextMenuData = RightUserContextMenu; },

		get maneuver ( ) { return newManeuver ( ); },

		get itineraryPoint ( ) { return newItineraryPoint ( ); },

		get version ( ) { return theCurrentVersion; }
	};
}

try {
	window.L.travelNotes = travelNotesFactory ( );
}
catch ( err ) {
	console.log ( err ? err : 'An error occurs when loading TravelNotes' );
}

newHttpRequestBuilder ( ).getJsonPromise (
	window.location.href.substr ( THE_CONST.zero, window.location.href.lastIndexOf ( '/' ) + THE_CONST.number1 ) +
	'TravelNotesConfig.json'
)
	.then (
		config => {
			theConfig.overload ( config );
			newAutoLoader ( );
		}
	);

/*
--- End of TravelNotes.js file ----------------------------------------------------------------------------------------
*/