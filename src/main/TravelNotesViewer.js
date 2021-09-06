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
	- v1.6.0:
		- created
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file TravelNotesViewer.js
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

import theTravelNotesData from '../data/TravelNotesData.js';
import ViewerFileLoader from '../core/ViewerFileLoader.js';
import theAttributionsUI from '../attributionsUI/AttributionsUI.js';
import theViewerLayersToolbarUI from '../viewerLayersToolbarUI/ViewerLayersToolbarUI.js';
import { TWO, LAT_LNG, HTTP_STATUS_OK } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class is the entry point of the viewer.
@see {@link theTravelNotesViewer} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class TravelNotesViewer {

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
			theTravelNotesData.map.setView ( [ LAT_LNG.defaultValue, LAT_LNG.defaultValue ], TWO );
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
	This method load the TravelNotes viewer and open a read only map passed trought the url.
	This method can only be executed once. Others call will be ignored.
	*/

	addReadOnlyMap ( travelUrl, addLayerToolbar ) {
		if ( this.#travelNotesLoaded ) {
			return;
		}
		this.#travelNotesLoaded = true;

		theAttributionsUI.createUI ( );
		if ( addLayerToolbar ) {
			theViewerLayersToolbarUI.createUI ( );
		}

		theViewerLayersToolbarUI.setMapLayer ( 'OSM - Color' );
		if ( travelUrl ) {
			this.#loadDistantTravel ( travelUrl );
		}
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@desc The one and only one instance of theTravelNotesViewer class
@type {theTravelNotesViewer}
@constant
@global

@------------------------------------------------------------------------------------------------------------------------------
*/

const theTravelNotesViewer = new TravelNotesViewer ( );

export default theTravelNotesViewer;

/*
--- End of TravelNotesViewer.js file ------------------------------------------------------------------------------------------
*/