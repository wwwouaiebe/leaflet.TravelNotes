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
import { theLayersToolbarUI } from '../UI/LayersToolbarUI.js';
import { theAttributionsUI } from '../UI/AttributionsUI.js';
import { theErrorsUI } from '../UI/ErrorsUI.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';

import { THE_CONST } from '../util/Constants.js';

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

	function myAddReadOnlyMap ( travelUrl ) {

		myAddEventsListeners ( );
		theAttributionsUI.createUI ( );

		let newLayer =
		{
			service : 'wmts',
			url : 'https://{s}.tile.osm.org/{z}/{x}/{y}.png',
			name : 'OSM - Color',
			toolbar :
			{
				text : 'OSM',
				color : 'red',
				backgroundColor : 'white'
			},
			providerName : 'OSM',
			providerKeyNeeded : false,
			attribution : '| &copy; <a href="http://www.openstreetmap.org/copyright" ' +
				'target="_blank" title="OpenStreetMap contributors">OpenStreetMap contributors</a> '
		};

		newEventDispatcher ( ).dispatch ( 'layerchange', { layer : newLayer } );

		newHttpRequestBuilder ( ).getJsonPromise ( travelUrl )
			.then (
				newViewerFileLoader ( ).openDistantFile
			)
			.catch (
				err => {
					console.log ( err ? err : 'Not possible to load the .trv file' );
					theTravelNotesData.map.setView (
						[ THE_CONST.latLng.defaultValue, THE_CONST.latLng.defaultValue ],
						THE_CONST.number2
					);
					theErrorsUI.createUI ( );
					theLayersToolbarUI.setLayer ( 'OSM - Color' );
					theErrorsUI.showError ( 'Not possible to load the file ' + travelUrl );
				}
			);
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

			addReadOnlyMap : ( map, travelUrl ) => myAddReadOnlyMap ( map, travelUrl )
		}
	);
}

const theTravelNotesViewer = newTravelNotesViewer ( );

export { theTravelNotesViewer };

/*
--- End of TravelNotesViewer.js file ----------------------------------------------------------------------------------
*/