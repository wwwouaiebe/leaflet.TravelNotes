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
	- v1.0.0:
		- created
	- v1.1.0:
		- Issue ♯26 : added confirmation message before leaving the page when data modified.
		- Issue ♯27 : push directly the route in the editor when starting a new travel
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
		- Issue ♯52 : when saving the travel to the file, save also the edited route.
	- v1.6.0:
		- Issue ♯65 : Time to go to ES6 modules?
		- Issue ♯69 : ContextMenu and ContextMenuFactory are unclear
		- Issue ♯63 : Find a better solution for provider keys upload
		- Issue ♯75 : Merge Maps and TravelNotes
	- v1.12.0:
		- Issue ♯120 : Review the UserInterface
	- v2.0.0:
		- Issue ♯137 : Remove html tags from json files
		- Issue ♯139 : Remove Globals
		- Issue ♯140 : Remove userData
	-v2.2.0:
		- Issue ♯129 : Add an indicator when the travel is modified and not saved
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file TravelNotes.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module main
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theConfig from '../data/Config.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import theRouteEditor from '../core/RouteEditor.js';
import theAPIKeysManager from '../core/APIKeysManager.js';
import theUI from '../UI/UI.js';
import Travel from '../data/Travel.js';
import Route from '../data/Route.js';
import ViewerFileLoader from '../core/ViewerFileLoader.js';
import { theAppVersion } from '../data/Version.js';
import theEventDispatcher from '../coreLib/EventDispatcher.js';
import MapContextMenu from '../contextMenus/MapContextMenu.js';
import theMapLayersToolbarUI from '../mapLayersToolbarUI/MapLayersToolbarUI.js';
import theMouseUI from '../mouseUI/MouseUI.js';
import theAttributionsUI from '../attributionsUI/AttributionsUI.js';
import theErrorsUI from '../errorsUI/ErrorsUI.js';
import theTranslator from '../UILib/Translator.js';
import { LAT_LNG, TWO, SAVE_STATUS, HTTP_STATUS_OK } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class TravelNotes
@classdesc This class is the entry point of the application.
@see {@link theTravelNotes} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class TravelNotes {

	/**
	Guard to avoid a second upload
	#private
	*/

	#travelNotesLoaded = false;

	/**
	Load a travel from the server
	*/

	async #loadDistantTravel ( travelUrl ) {
		let travelResponse = await fetch ( travelUrl );
		if ( HTTP_STATUS_OK === travelResponse.status && travelResponse.ok ) {
			let travelContent = await travelResponse.json ( );
			new ViewerFileLoader ( ).openDistantFile ( travelContent );
		}
		else {
			theTravelNotesData.map.setView ( [ LAT_LNG.defaultValue, LAT_LNG.defaultValue ], TWO	);
			document.title = 'Travel & Notes';
		}
	}

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	This method load TravelNotes and open a read only map passed trought the url.
	This method can only be executed once. Others call will be ignored.
	*/

	addReadOnlyMap ( map, travelUrl ) {
		if ( this.#travelNotesLoaded ) {
			return;
		}
		this.#travelNotesLoaded = true;
		if ( map ) {
			theTravelNotesData.map = map;
		}
		theAttributionsUI.createUI ( );
		theMapLayersToolbarUI.setMapLayer ( 'OSM - Color' );
		this.#loadDistantTravel ( travelUrl );
	}

	/**
	This method load TravelNotes and open an empty read and write map.
	This method can only be executed once. Others call will be ignored.
	*/

	addControl ( map, divControlId ) {
		if ( this.#travelNotesLoaded ) {
			return;
		}
		this.#travelNotesLoaded = true;
		if ( map ) {
			theTravelNotesData.map = map;
			theTravelNotesData.map.on ( 'contextmenu', contextMenuEvent => new MapContextMenu ( contextMenuEvent ) .show ( ) );
		}
		theTravelNotesData.travel = new Travel ( );
		theTravelNotesData.travel.routes.add ( new Route ( ) );
		theUI.createUI ( document.getElementById ( divControlId ) );
		theAttributionsUI.createUI ( );
		theAPIKeysManager.setKeysFromServerFile ( );
		if ( theConfig.layersToolbarUI.haveLayersToolbarUI ) {
			theMapLayersToolbarUI.createUI ( );
		}
		else {
			theMapLayersToolbarUI.setMapLayer ( 'OSM - Color' );
		}

		if ( theConfig.mouseUI.haveMouseUI ) {
			theMouseUI.createUI ( );
		}
		if ( theConfig.travelEditor.startupRouteEdition ) {
			theRouteEditor.editRoute ( theTravelNotesData.travel.routes.first.objId );
		}
		theEventDispatcher.dispatch ( 'setrouteslist' );
		theEventDispatcher.dispatch ( 'roadbookupdate' );
		theTravelNotesData.map.setView ( [ theConfig.map.center.lat, theConfig.map.center.lng ], theConfig.map.zoom );
		theErrorsUI.showHelp (
			'<p>' + theTranslator.getText ( 'Help - Continue with interface1' ) + '</p>' +
			'<p>' + theTranslator.getText ( 'Help - Continue with interface2' ) + '</p>'
		);
		document.title = 'Travel & Notes';
		theMouseUI.saveStatus = SAVE_STATUS.saved;
	}

	/**
	This method add a provider. Used by plugins.
	@param {Provider} provider The provider to add
	*/

	addProvider ( providerClass ) {
		theAPIKeysManager.addProvider ( providerClass );
	}

	/**
	Show an info, using theErrorsUI. Used by plugins.
	*/

	showInfo ( info ) {
		theErrorsUI.showInfo ( info );
	}

	/**
	get the overpassApi url
	*/

	get overpassApiUrl ( ) { return theConfig.overpassApi.url; }

	/**
	get the Leaflet map object
	*/

	get map ( ) { return theTravelNotesData.map; }

	/**
	theTravelNotes version
	*/

	get version ( ) { return theAppVersion; }
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@desc The one and only one instance of TravelNotes class
@type {TravelNotes}
@constant
@global

@------------------------------------------------------------------------------------------------------------------------------
*/

const theTravelNotes = new TravelNotes ( );

export default theTravelNotes;

/*
--- End of TravelNotes.js file ------------------------------------------------------------------------------------------------
*/