/*
Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/

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
	- v1.12.0:
		- created
Doc reviewed 20200824
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file Globals.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module Globals
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theAPIKeysManager } from '../core/APIKeysManager.js';
import { theAttributionsUI } from '../UI/AttributionsUI.js';
import { theConfig } from '../data/Config.js';
import { theCurrentVersion } from '../data/Version.js';
import { theDataSearchEngine } from '../data/DataSearchEngine.js';
import { theErrorsUI } from '../UI/ErrorsUI.js';
import { theEventDispatcher } from '../util/EventDispatcher.js';
import { theGeoLocator } from '../core/GeoLocator.js';
import { theGeometry } from '../util/Geometry.js';
import { theHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { theHTMLViewsFactory } from '../UI/HTMLViewsFactory.js';
import { theHttpRequestBuilder } from '../util/HttpRequestBuilder.js';
import { theIndexedDb } from '../roadbook/IndexedDb.js';
import { theLayersToolbarUI } from '../UI/LayersToolbarUI.js';
import { theMapEditor } from '../core/MapEditor.js';
import { theMouseUI } from '../UI/MouseUI.js';
import { theNoteDialogToolbar } from '../dialogs/NoteDialogToolbar.js';
import { theNoteEditor } from '../core/NoteEditor.js';
import { thePanesManagerUI } from '../UI/PanesManagerUI.js';
import { theProfileWindowsManager } from '../core/ProfileWindowsManager.js';
import { theProvidersToolbarUI } from '../UI/ProvidersToolbarUI.js';
import { theRouteEditor } from '../core/RouteEditor.js';
import { theTranslator } from '../UI/Translator.js';
import { theTravelEditor } from '../core/TravelEditor.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theTravelNotesToolbarUI } from '../UI/TravelNotesToolbarUI.js';
import { theTravelUI } from '../UI/TravelUI.js';
import { theUI } from '../UI/UI.js';
import { theUtilities } from '../util/Utilities.js';
import { theViewerLayersToolbarUI } from '../UI/ViewerLayersToolbarUI.js';
import { theViewerMapEditor } from '../core/ViewerMapEditor.js';
import { theWayPointEditor } from '../core/WayPointEditor.js';

import { newAboutDialog } from '../dialogs/AboutDialog.js';
import { newAPIKeysDialog } from '../dialogs/APIKeysDialog.js';
import { newBaseContextMenu } from '../contextMenus/BaseContextMenu.js';
import { newBaseDialog } from '../dialogs/BaseDialog.js';
import { newCollection } from '../data/Collection.js';
import { newColorDialog } from '../dialogs/ColorDialog.js';
import { newDataEncryptor } from '../util/DataEncryptor.js';
import { newFileCompactor } from '../core/FileCompactor.js';
import { newFileLoader } from '../core/FileLoader.js';
import { newFloatWindow } from '../dialogs/FloatWindow.js';
import { newGeoCoder } from '../core/GeoCoder.js';
import { newGpxFactory } from '../core/GpxFactory.js';
import { newItinerary } from '../data/Itinerary.js';
import { newItineraryPoint } from '../data/ItineraryPoint.js';
import { newManeuver } from '../data/Maneuver.js';
import { newManeuverContextMenu } from '../contextMenus/ManeuverContextMenu.js';
import { newMapContextMenu } from '../contextMenus/MapContextMenu.js';
import { newNote } from '../data/Note.js';
import { newNoteContextMenu } from '../contextMenus/NoteContextMenu.js';
import { newNoteDialog } from '../dialogs/NoteDialog.js';
import { newObjId } from '../data/ObjId.js';
import { newObjType } from '../data/ObjType.js';
import { newOsmSearchContextMenu } from '../contextMenus/OsmSearchContextMenu.js';
import { newOsmSearchEngine } from '../core/OsmSearchEngine.js';
import { newPasswordDialog } from '../dialogs/PasswordDialog.js';
import { newPrintFactory } from '../printMap/PrintFactory.js';
import { newPrintRouteMapDialog } from '../dialogs/PrintRouteMapDialog.js';
import { newProfileFactory } from '../core/ProfileFactory.js';
import { newProfileWindow } from '../dialogs/ProfileWindow.js';
import { newRoadbookUpdate } from '../roadbook/RoadbookUpdate.js';
import { newRoute } from '../data/Route.js';
import { newRouteContextMenu } from '../contextMenus/RouteContextMenu.js';
import { newRoutePropertiesDialog } from '../dialogs/RoutePropertiesDialog.js';
import { newSvgIconFromOsmFactory } from '../core/SvgIconFromOsmFactory.js';
import { newTravel } from '../data/Travel.js';
import { newTravelNotesPaneUI } from '../UI/TravelNotesPaneUI.js';
import { newTwoButtonsDialog } from '../dialogs/TwoButtonsDialog.js';
import { newViewerFileLoader } from '../core/ViewerFileLoader.js';
import { newWaitUI } from '../UI/WaitUI.js';
import { newWayPoint } from '../data/WayPoint.js';
import { newWayPointContextMenu } from '../contextMenus/WayPointContextMenu.js';
import { newWayPointPropertiesDialog } from '../dialogs/WayPointPropertiesDialog.js';
import { newZoomer } from '../core/Zoomer.js';

class Globals {
	get newAboutDialog ( ) { return newAboutDialog; }
	get newAPIKeysDialog ( ) { return newAPIKeysDialog; }
	get newBaseContextMenu ( ) { return newBaseContextMenu; }
	get newBaseDialog ( ) { return newBaseDialog; }
	get newCollection ( ) { return newCollection; }
	get newColorDialog ( ) { return newColorDialog; }
	get newDataEncryptor ( ) { return newDataEncryptor; }
	get newFileCompactor ( ) { return newFileCompactor; }
	get newFileLoader ( ) { return newFileLoader; }
	get newFloatWindow ( ) { return newFloatWindow; }
	get newGeoCoder ( ) { return newGeoCoder; }
	get newGpxFactory ( ) { return newGpxFactory; }
	get newItinerary ( ) { return newItinerary; }
	get newItineraryPoint ( ) { return newItineraryPoint; }
	get newManeuver ( ) { return newManeuver; }
	get newManeuverContextMenu ( ) { return newManeuverContextMenu; }
	get newMapContextMenu ( ) { return newMapContextMenu; }
	get newNote ( ) { return newNote; }
	get newNoteContextMenu ( ) { return newNoteContextMenu; }
	get newNoteDialog ( ) { return newNoteDialog; }
	get newObjId ( ) { return newObjId; }
	get newObjType ( ) { return newObjType; }
	get newOsmSearchContextMenu ( ) { return newOsmSearchContextMenu; }
	get newOsmSearchEngine ( ) { return newOsmSearchEngine; }
	get newPasswordDialog ( ) { return newPasswordDialog; }
	get newPrintRouteMapDialog ( ) { return newPrintRouteMapDialog; }
	get newProfileFactory ( ) { return newProfileFactory; }
	get newPrintFactory ( ) { return newPrintFactory; }
	get newProfileWindow ( ) { return newProfileWindow; }
	get newRoadbookUpdate ( ) { return newRoadbookUpdate; }
	get newRoute ( ) { return newRoute; }
	get newRouteContextMenu ( ) { return newRouteContextMenu; }
	get newRoutePropertiesDialog ( ) { return newRoutePropertiesDialog; }
	get newSvgIconFromOsmFactory ( ) { return newSvgIconFromOsmFactory; }
	get newTravel ( ) { return newTravel; }
	get newTravelNotesPaneUI ( ) { return newTravelNotesPaneUI; }
	get newTwoButtonsDialog ( ) { return newTwoButtonsDialog; }
	get newViewerFileLoader ( ) { return newViewerFileLoader; }
	get newWaitUI ( ) { return newWaitUI; }
	get newWayPoint ( ) { return newWayPoint; }
	get newWayPointContextMenu ( ) { return newWayPointContextMenu; }
	get newWayPointPropertiesDialog ( ) { return newWayPointPropertiesDialog; }
	get newZoomer ( ) { return newZoomer; }

	get theAPIKeysManager ( ) { return theAPIKeysManager; }
	get theAttributionsUI ( ) { return theAttributionsUI; }
	get theConfig ( ) { return theConfig; }
	get theCurrentVersion ( ) { return theCurrentVersion; }
	get theDataSearchEngine ( ) { return theDataSearchEngine; }
	get theErrorsUI ( ) { return theErrorsUI; }
	get theEventDispatcher ( ) { return theEventDispatcher; }
	get theGeoLocator ( ) { return theGeoLocator; }
	get theGeometry ( ) { return theGeometry; }
	get theHTMLElementsFactory ( ) { return theHTMLElementsFactory; }
	get theHTMLViewsFactory ( ) { return theHTMLViewsFactory; }
	get theHttpRequestBuilder ( ) { return theHttpRequestBuilder; }
	get theIndexedDb ( ) { return theIndexedDb; }
	get theLayersToolbarUI ( ) { return theLayersToolbarUI; }
	get theMapEditor ( ) { return theMapEditor; }
	get theMouseUI ( ) { return theMouseUI; }
	get theNoteDialogToolbar ( ) { return theNoteDialogToolbar; }
	get theNoteEditor ( ) { return theNoteEditor; }
	get thePanesManagerUI ( ) { return thePanesManagerUI; }
	get theProfileWindowsManager ( ) { return theProfileWindowsManager; }
	get theProvidersToolbarUI ( ) { return theProvidersToolbarUI; }
	get theRouteEditor ( ) { return theRouteEditor; }
	get theTranslator ( ) { return theTranslator; }
	get theTravelEditor ( ) { return theTravelEditor; }
	get theTravelNotesData ( ) { return theTravelNotesData; }
	get theTravelNotesToolbarUI ( ) { return theTravelNotesToolbarUI; }
	get theTravelUI ( ) { return theTravelUI; }
	get theUI ( ) { return theUI; }
	get theUtilities ( ) { return theUtilities; }
	get theViewerLayersToolbarUI ( ) { return theViewerLayersToolbarUI; }
	get theViewerMapEditor ( ) { return theViewerMapEditor; }
	get theWayPointEditor ( ) { return theWayPointEditor; }
}

const ourGlobals = Object.freeze ( new Globals );

export { ourGlobals as theGlobals };