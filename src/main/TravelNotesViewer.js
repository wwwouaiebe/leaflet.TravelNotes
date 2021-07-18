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
Doc reviewed 20200824
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

@module TravelNotesViewer
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theTravelNotesData from '../data/TravelNotesData.js';
import ViewerMapEditor from '../core/ViewerMapEditor.js';
import { newViewerFileLoader } from '../core/ViewerFileLoader.js';
import { theAttributionsUI } from '../UI/AttributionsUI.js';
import { theViewerLayersToolbarUI } from '../UI/ViewerLayersToolbarUI.js';
import theGeoLocator from '../core/GeoLocator.js';
import { newZoomer } from '../core/Zoomer.js';
import { ZERO, TWO, LAT_LNG, HTTP_STATUS_OK } from '../util/Constants.js';

const theViewerMapEditor = new ViewerMapEditor ( );

let ourTravelNotesLoaded = false;

function ourOnKeyDown ( keyBoardEvent ) {
	if ( 'Z' === keyBoardEvent.key || 'z' === keyBoardEvent.key ) {
		newZoomer ( ).zoomToTravel ( );
	}
	else if ( 'G' === keyBoardEvent.key || 'g' === keyBoardEvent.key ) {
		theGeoLocator.switch ( );
	}
	else {
		let charCode = keyBoardEvent.key.charCodeAt ( ZERO );
		/* eslint-disable-next-line no-magic-numbers */
		if ( 47 < charCode && 58 > charCode ) {
			theViewerLayersToolbarUI.setLayer ( keyBoardEvent.key );
		}
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourAddEventsListeners
@desc This method add the document events listeners
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourAddEventsListeners ( ) {
	document.addEventListener ( 'keydown', ourOnKeyDown, true );
	document.addEventListener (
		'routeupdated',
		updateRouteEvent => {
			if ( updateRouteEvent.data ) {
				theViewerMapEditor.addRoute (
					updateRouteEvent.data.addedRouteObjId
				);
			}
		},
		false
	);
	document.addEventListener (
		'noteupdated',
		updateNoteEvent => {
			if ( updateNoteEvent.data ) {
				theViewerMapEditor.addNote (
					updateNoteEvent.data.addedNoteObjId
				);
			}
		},
		false
	);
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
		'layerchange',
		layerChangeEvent => {
			if ( layerChangeEvent.data ) {
				theViewerMapEditor.setLayer ( layerChangeEvent.data.layer, layerChangeEvent.data.layer.url );
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
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourLoadDistantTravel
@desc This method load a travel from a server file
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

async function ourLoadDistantTravel ( travelUrl ) {
	let travelResponse = await fetch ( travelUrl );
	if ( HTTP_STATUS_OK === travelResponse.status && travelResponse.ok ) {
		let travelContent = await travelResponse.json ( );
		newViewerFileLoader ( ).openDistantFile ( travelContent );
	}
	else {
		theTravelNotesData.map.setView ( [ LAT_LNG.defaultValue, LAT_LNG.defaultValue ], TWO );
		document.title = 'Travel & Notes';
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class is the entry point of the viewer.
@see {@link theTravelNotesViewer} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class TravelNotesViewer {

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	This method load the TravelNotes viewer and open a read only map passed trought the url.
	This method can only be executed once. Others call will be ignored.
	*/

	addReadOnlyMap ( travelUrl, addLayerToolbar ) {
		if ( ourTravelNotesLoaded ) {
			return;
		}
		ourTravelNotesLoaded = true;
		ourAddEventsListeners ( );
		theAttributionsUI.createUI ( );
		if ( addLayerToolbar ) {
			theViewerLayersToolbarUI.createUI ( );
		}
		theViewerLayersToolbarUI.setLayer ( 'OSM - Color' );
		if ( travelUrl ) {
			ourLoadDistantTravel ( travelUrl );
		}
	}
}

const OUR_TRAVEL_NOTES_VIEWER = new TravelNotesViewer ( );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of TravelNotesViewer class
	@type {TravelNotesViewer}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	OUR_TRAVEL_NOTES_VIEWER as theTravelNotesViewer
};

/*
--- End of TravelNotesViewer.js file ------------------------------------------------------------------------------------------
*/