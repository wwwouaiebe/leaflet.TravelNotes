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
--- TravelNotesViewer.js file -----------------------------------------------------------------------------------------
This file contains:
	- the travelNotesFactory function
	- global variables needed for TravelNotes
Changes:
	- v1.6.0:
		- created
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theViewerMapEditor } from '../core/ViewerMapEditor.js';
import { newViewerFileLoader } from '../core/ViewerFileLoader.js';
import { newHttpRequestBuilder } from '../util/HttpRequestBuilder.js';
import { newRoadbookUpdate } from '../roadbook/RoadbookUpdate.js';
import { theAttributionsUI } from '../UI/AttributionsUI.js';
import { theViewerLayersToolbarUI } from '../UI/ViewerLayersToolbarUI.js';

import { LAT_LNG, TWO } from '../util/Constants.js';

/*
--- newTravelNotesViewer funtion --------------------------------------------------------------------------------------

Patterns : Closure
-----------------------------------------------------------------------------------------------------------------------
*/

function newTravelNotesViewer ( ) {

	/*
	--- myAddEventsListeners function ---------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddEventsListeners ( ) {

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
					newRoadbookUpdate ( );
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

	/*
	--- myAddReadOnlyMap function -------------------------------------------------------------------------------------

	This function load a read only map

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddReadOnlyMap ( travelUrl, addLayerToolbar ) {

		myAddEventsListeners ( );
		theAttributionsUI.createUI ( );

		if ( addLayerToolbar ) {
			theViewerLayersToolbarUI.createUI ( );
		}

		theViewerLayersToolbarUI.setLayer ( 'OSM - Color' );

		if ( travelUrl ) {
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
	}

	/*
	--- TravelNotes object --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{

			/*
			--- addReadOnlyMap method ---------------------------------------------------------------------------------

			This method add the control on the page

			-----------------------------------------------------------------------------------------------------------
			*/

			addReadOnlyMap : ( travelUrl, addLayerToolbar ) => myAddReadOnlyMap ( travelUrl, addLayerToolbar )
		}
	);
}

const theTravelNotesViewer = newTravelNotesViewer ( );

export { theTravelNotesViewer };

/*
--- End of TravelNotesViewer.js file ----------------------------------------------------------------------------------
*/