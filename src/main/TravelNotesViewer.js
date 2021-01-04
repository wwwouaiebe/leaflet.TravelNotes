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

import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theViewerMapEditor } from '../core/ViewerMapEditor.js';
import { newViewerFileLoader } from '../core/ViewerFileLoader.js';
import { theHttpRequestBuilder } from '../util/HttpRequestBuilder.js';
import { theAttributionsUI } from '../UI/AttributionsUI.js';
import { theViewerLayersToolbarUI } from '../UI/ViewerLayersToolbarUI.js';
import { LAT_LNG, TWO } from '../util/Constants.js';

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
				theViewerMapEditor.setLayer ( layerChangeEvent.data.layer );
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

@class
@classdesc This class is the entry point of the viewer.
@see {@link theTravelNotesViewer} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class TravelNotesViewer {

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
			theHttpRequestBuilder.getJsonPromise ( travelUrl )
				.then (
					fileContent => {
						newViewerFileLoader ( ).openDistantFile ( fileContent );
					}
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
	}
}

const ourTravelNotesViewer = Object.seal ( new TravelNotesViewer );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of TravelNotesViewer class
	@type {TravelNotesViewer}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourTravelNotesViewer as theTravelNotesViewer
};

/*
--- End of TravelNotesViewer.js file ------------------------------------------------------------------------------------------
*/