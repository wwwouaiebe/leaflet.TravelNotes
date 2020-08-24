/*
Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/

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
	- v1.12.0:
		- Issue #120 : Review the UserInterface
Doc reviewed 20200824
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file TravelNotes.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module TravelNotes
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theConfig } from '../data/Config.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theRouteEditor } from '../core/RouteEditor.js';
import { theMapEditor } from '../core/MapEditor.js';
import { theViewerMapEditor } from '../core/ViewerMapEditor.js';
import { theAPIKeysManager } from '../core/APIKeysManager.js';
import { theUI } from '../UI/UI.js';
import { newTravel } from '../data/Travel.js';
import { newRoute } from '../data/Route.js';
import { newViewerFileLoader } from '../core/ViewerFileLoader.js';
import { newBaseDialog } from '../dialogs/BaseDialog.js';
import { newManeuver } from '../data/Maneuver.js';
import { newItineraryPoint } from '../data/ItineraryPoint.js';
import { theCurrentVersion } from '../data/Version.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';
import { newHttpRequestBuilder } from '../util/HttpRequestBuilder.js';
import { newMapContextMenu } from '../contextMenus/MapContextMenu.js';
import { newRoadbookUpdate } from '../roadbook/RoadbookUpdate.js';
import { theLayersToolbarUI } from '../UI/LayersToolbarUI.js';
import { theMouseUI } from '../UI/MouseUI.js';
import { theAttributionsUI } from '../UI/AttributionsUI.js';
import { theErrorsUI } from '../UI/ErrorsUI.js';
import { theIndexedDb } from '../roadbook/IndexedDB.js';
import { theProfileWindowsManager } from '../core/ProfileWindowsManager.js';
import { theTranslator } from '../UI/Translator.js';
import { LAT_LNG, TWO } from '../util/Constants.js';
import { theGlobals } from '../main/Globals.js';

let ourEventDispatcher = newEventDispatcher ( );
let ourTravelNotesLoaded = false;

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourAddEventsListeners
@desc This method add the document events listeners
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourAddEventsListeners ( ) {
	document.addEventListener (
		'routeupdated',
		updateRouteEvent => {
			if ( updateRouteEvent.data ) {
				theMapEditor.updateRoute (
					updateRouteEvent.data.removedRouteObjId,
					updateRouteEvent.data.addedRouteObjId
				);
			}
		},
		false
	);
	document.addEventListener (
		'routepropertiesupdated',
		updateRoutePropertiesEvent => {
			if ( updateRoutePropertiesEvent.data ) {
				theMapEditor.updateRouteProperties (
					updateRoutePropertiesEvent.data.routeObjId
				);
			}
		},
		false
	);
	document.addEventListener (
		'noteupdated',
		updateNoteEvent => {
			if ( updateNoteEvent.data ) {
				theMapEditor.updateNote (
					updateNoteEvent.data.removedNoteObjId,
					updateNoteEvent.data.addedNoteObjId
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
		'zoomto',
		zoomToEvent => {
			if ( zoomToEvent.data ) {
				theViewerMapEditor.zoomTo (
					zoomToEvent.data.latLng,
					zoomToEvent.data.geometry
				);
			}
		},
		false
	);
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
				theViewerMapEditor.onGeolocationPositionChanged ( geoLocationPositionChangedEvent.data.position );
			}
		},
		false
	);
	document.addEventListener (
		'geolocationstatuschanged',
		geoLocationStatusChangedEvent => {
			if ( geoLocationStatusChangedEvent.data ) {
				theViewerMapEditor.onGeolocationStatusChanged ( geoLocationStatusChangedEvent.data.status );
			}
		},
		false
	);
	document.addEventListener (
		'roadbookupdate',
		( ) => newRoadbookUpdate ( ),
		false
	);
	document.addEventListener (
		'profileclosed',
		profileClosedEvent => {
			if ( profileClosedEvent.data ) {
				theProfileWindowsManager.onProfileClosed ( profileClosedEvent.data.objId );
			}
		},
		false
	);
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourAddUnloadEventsListeners
@desc This method add the document events listeners for read/write travels, having a warning before unload and using storage.
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourAddUnloadEventsListeners ( ) {
	window.addEventListener (
		'unload',
		( ) => {
			localStorage.removeItem ( theTravelNotesData.UUID );
		}
	);
	window.addEventListener (
		'beforeunload',
		beforeUnloadEvent => {
			theIndexedDb.closeDb ( theTravelNotesData.UUID );
			beforeUnloadEvent.returnValue = 'x';
			return 'x';
		}
	);
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnMapContextMenu
@desc context menu event listener for the map
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnMapContextMenu ( contextMenuEvent ) {
	if ( ! theTravelNotesData.travel.readOnly ) {
		newMapContextMenu ( contextMenuEvent ).show ( );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class is the entry point of the application.
@see {@link theTravelNotes} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class TravelNotes {

	/**
	This method load TravelNotes and open a read only map passed trought the url.
	This method can only be executed once. Others call will be ignored.
	*/

	addReadOnlyMap ( map, travelUrl ) {
		if ( ourTravelNotesLoaded ) {
			return;
		}
		ourTravelNotesLoaded = true;
		ourAddEventsListeners ( );
		if ( map ) {
			theTravelNotesData.map = map;
		}
		theAttributionsUI.createUI ( );
		theLayersToolbarUI.setLayer ( 'OSM - Color' );
		newHttpRequestBuilder ( ).getJsonPromise ( travelUrl )
			.then (
				newViewerFileLoader ( ).openDistantFile
			)
			.catch (
				err => {
					console.log ( err ? err : 'Not possible to load the .trv file' );
					theTravelNotesData.map.setView (
						[ LAT_LNG.defaultValue, LAT_LNG.defaultValue ],
						TWO
					);
				}
			);
	}

	/**
	This method load TravelNotes and open an empty read and write map.
	This method can only be executed once. Others call will be ignored.
	*/

	addControl ( map, divControlId ) {
		if ( ourTravelNotesLoaded ) {
			return;
		}
		ourTravelNotesLoaded = true;
		ourAddEventsListeners ( );
		ourAddUnloadEventsListeners ( );
		if ( map ) {
			theTravelNotesData.map = map;
			theTravelNotesData.map.on ( 'contextmenu', ourOnMapContextMenu );
		}
		theTravelNotesData.travel = newTravel ( );
		theTravelNotesData.travel.routes.add ( newRoute ( ) );
		theUI.createUI ( document.getElementById ( divControlId ) );
		theAttributionsUI.createUI ( );
		theAPIKeysManager.setKeysFromServerFile ( );
		if ( theConfig.layersToolbarUI.haveLayersToolbarUI ) {
			theLayersToolbarUI.createUI ( );
		}
		if ( theConfig.mouseUI.haveMouseUI ) {
			theMouseUI.createUI ( );
		}
		if ( theConfig.travelEditor.startupRouteEdition ) {
			theRouteEditor.editRoute ( theTravelNotesData.travel.routes.first.objId );
		}
		ourEventDispatcher.dispatch ( 'setrouteslist' );
		ourEventDispatcher.dispatch ( 'roadbookupdate' );
		theTravelNotesData.map.setView ( [ theConfig.map.center.lat, theConfig.map.center.lng ], theConfig.map.zoom );
		theErrorsUI.showHelp ( theTranslator.getText ( 'Help - Continue with interface' ) );
	}

	/**
	This method add a provider. Used by plugins.
	@param {Provider} provider The provider to add
	*/

	addProvider ( provider ) {
		theAPIKeysManager.addProvider ( provider );
	}

	/**
	Show an info, using theErrorsUI. Used by plugins.
	*/

	showInfo ( info ) {
		theErrorsUI.showInfo ( info );
	}

	/**
	get a new BaseDialog object. Used by plugins.
	*/

	get baseDialog ( ) { return newBaseDialog ( ); }

	/**
	Free data that are added to the TravelNotes file. Must follow the JSON rules.
	*/

	get userData ( ) { return theTravelNotesData.travel.userData; }
	set userData ( userData ) { theTravelNotesData.travel.userData = userData; }

	/**
	get the Leaflet map object
	*/

	get map ( ) { return theTravelNotesData.map; }

	/**
	get a new Maneuver object. Used by plugins.
	*/

	get maneuver ( ) { return newManeuver ( ); }

	/**
	get a new ItineraryPoint object. Used by plugins.
	*/

	get itineraryPoint ( ) { return newItineraryPoint ( ); }

	/**
	theTravelNotes version
	*/

	get version ( ) { return theCurrentVersion; }

	/**
	*/

	get globals ( ) {
		if ( theConfig.haveGlobals ) {
			return theGlobals;
		}

		return null;

	}
}

const ourTravelNotes = Object.seal ( new TravelNotes );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of TravelNotes class
	@type {TravelNotes}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourTravelNotes as theTravelNotes
};

/*
--- End of TravelNotes.js file ------------------------------------------------------------------------------------------------
*/