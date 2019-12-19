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
--- MapEditor.js file -------------------------------------------------------------------------------------------------
This file contains:
	- the newMapEditor function
	- the theMapEditor object
Changes:
	- v1.6.0:
		- created from MapEditor
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

/* global L  */

import { theConfig } from '../data/Config.js';
import { newDataSearchEngine } from '../data/DataSearchEngine.js';
import { newGeometry } from '../util/Geometry.js';
import { newUtilities } from '../util/Utilities.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { newHTMLViewsFactory } from '../UI/HTMLViewsFactory.js';

import { THE_CONST } from '../util/Constants.js';

/*
--- onMouseOverOrMoveOnRoute function -----------------------------------------------------------------------------

Event listener for mouse move and mouse enter on route objects event
This function updates the route tooltip with the distance

-------------------------------------------------------------------------------------------------------------------
*/

function onMouseOverOrMoveOnRoute ( mapEvent ) {
	let dataSearchEngine = newDataSearchEngine ( );
	let route = dataSearchEngine.getRoute ( mapEvent.target.objId );
	let distance = newGeometry ( ).getClosestLatLngDistance ( route, [ mapEvent.latlng.lat, mapEvent.latlng.lng ] ).distance;
	distance += route.chainedDistance;
	distance = newUtilities ( ).formatDistance ( distance );
	let polyline = theTravelNotesData.mapObjects.get ( mapEvent.target.objId );
	polyline.closeTooltip ( );
	let tooltipText = dataSearchEngine.getRoute ( mapEvent.target.objId ).name;
	if ( ! theTravelNotesData.travel.readOnly ) {
		tooltipText += ( THE_CONST.zero === tooltipText.length ? '' : ' - ' );
		tooltipText += distance;
	}
	polyline.setTooltipContent ( tooltipText );
	polyline.openTooltip ( mapEvent.latlng );
}

/*
--- newViewerMapEditor function ---------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newViewerMapEditor ( ) {

	let myDataSearchEngine = newDataSearchEngine ( );
	let myCurrentLayer = null;
	let myGeolocationCircle = null;

	/*
	--- myAddTo function ----------------------------------------------------------------------------------------------

	This function add a leaflet object to the leaflet map and to the JavaScript map

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddTo ( objId, object ) {
		object.objId = objId;
		object.addTo ( theTravelNotesData.map );
		theTravelNotesData.mapObjects.set ( objId, object );
	}

	/*
	--- myAddNote function --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddNote ( noteObjId ) {

		let note = myDataSearchEngine.getNoteAndRoute ( noteObjId ).note;
		let readOnly = theTravelNotesData.travel.readOnly;

		// first a marker is created at the note position. This marker is empty and transparent, so
		// not visible on the map but the marker can be dragged
		let bullet = L.marker (
			note.latLng,
			{
				icon : L.divIcon (
					{
						iconSize : [
							theConfig.note.grip.size,
							theConfig.note.grip.size
						],
						iconAnchor : [
							theConfig.note.grip.size / THE_CONST.number2,
							theConfig.note.grip.size / THE_CONST.number2
						],
						html : '<div></div>'
					}
				),
				opacity : theConfig.note.grip.opacity,
				draggable : ! readOnly
			}
		);
		bullet.objId = note.objId;

		// a second marker is now created. The icon created by the user is used for this marker
		let icon = L.divIcon (
			{
				iconSize : [ note.iconWidth, note.iconHeight ],
				iconAnchor : [ note.iconWidth / THE_CONST.number2, note.iconHeight / THE_CONST.number2 ],
				popupAnchor : [ THE_CONST.zero, -note.iconHeight / THE_CONST.number2 ],
				html : note.iconContent,
				className : 'TravelNotes-AllNotes ' + theConfig.note.style
			}
		);
		let marker = L.marker (
			note.iconLatLng,
			{
				zIndexOffset : THE_CONST.note.zIndexOffset,
				icon : icon,
				draggable : ! readOnly
			}
		);
		marker.objId = note.objId;

		// a popup is binded to the the marker...
		marker.bindPopup (
			layer => {
				let popupNote = myDataSearchEngine.getNoteAndRoute ( layer.objId ).note;
				return newHTMLViewsFactory ( 'TravelNotes-' ).getNoteHTML ( popupNote );
			}
		);

		// ... and also a tooltip
		if ( THE_CONST.zero !== note.tooltipContent.length ) {
			marker.bindTooltip (
				layer => myDataSearchEngine.getNoteAndRoute ( layer.objId ).note.tooltipContent
			);
			marker.getTooltip ( ).options.offset [ THE_CONST.zero ] = note.iconWidth / THE_CONST.number2;
		}

		// Finally a polyline is created between the 2 markers
		let polyline = L.polyline ( [ note.latLng, note.iconLatLng ], theConfig.note.polyline );
		polyline.objId = note.objId;

		// The 3 objects are added to a layerGroup
		let layerGroup = L.layerGroup ( [ marker, polyline, bullet ] );
		layerGroup.markerId = L.Util.stamp ( marker );
		layerGroup.polylineId = L.Util.stamp ( polyline );
		layerGroup.bulletId = L.Util.stamp ( bullet );

		// and the layerGroup added to the leaflet map and JavaScript map
		myAddTo ( note.objId, layerGroup );
	}

	/*
	--- myGetDashArray function ---------------------------------------------------------------------------------------

	This function returns the dashArray used for the polyline representation. See also leaflet docs

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetDashArray ( route ) {
		if ( route.dashArray >= theConfig.route.dashChoices.length ) {
			route.dashArray = THE_CONST.zero;
		}
		let iDashArray = theConfig.route.dashChoices [ route.dashArray ].iDashArray;
		if ( iDashArray ) {
			let dashArray = '';
			let dashCounter = THE_CONST.zero;
			for ( dashCounter = THE_CONST.zero; dashCounter < iDashArray.length - THE_CONST.number1; dashCounter ++ ) {
				dashArray += ( iDashArray [ dashCounter ] * route.width ) + ',';
			}
			dashArray += iDashArray [ dashCounter ] * route.width;

			return dashArray;
		}
		return null;
	}

	/*
	--- myAddRoute function -------------------------------------------------------------------------------------------

	This function add a route and eventually the attached notes
	to the leaflet map and the JavaScript map

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddRoute ( routeObjId ) {

		let route = myDataSearchEngine.getRoute ( routeObjId );

		// an array of points is created
		let latLng = [];
		let pointsIterator = route.itinerary.itineraryPoints.iterator;
		while ( ! pointsIterator.done ) {
			latLng.push ( pointsIterator.value.latLng );
		}

		// the leaflet polyline is created and added to the map
		let polyline = L.polyline (
			latLng,
			{
				color : route.color,
				weight : route.width,
				dashArray : myGetDashArray ( route )
			}
		);
		myAddTo ( route.objId, polyline );

		// tooltip and popup are created
		polyline.bindTooltip (
			route.name,
			{ sticky : true, direction : 'right' }
		);
		polyline.on ( 'mouseover', onMouseOverOrMoveOnRoute );
		polyline.on ( 'mousemove', onMouseOverOrMoveOnRoute );

		polyline.bindPopup (
			layer => {
				let popupRoute = myDataSearchEngine.getRoute ( layer.objId );
				return newHTMLViewsFactory ( 'TravelNotes-' ).getRouteHTML ( popupRoute );
			}
		);

		// left click event
		L.DomEvent.on ( polyline, 'click', clickEvent => clickEvent.target.openPopup ( clickEvent.latlng ) );

		// notes are added
		let notesIterator = route.notes.iterator;
		while ( ! notesIterator.done ) {
			myAddNote ( notesIterator.value.objId );
		}

		return route;
	}

	/*
	--- myZoomTo function ---------------------------------------------------------------------------------------------

	This function zoom on a search result

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myZoomTo ( latLng, geometry ) {
		if ( geometry ) {
			let latLngs = [];
			geometry.forEach ( geometryPart => latLngs = latLngs.concat ( geometryPart ) );
			theTravelNotesData.map.fitBounds ( newGeometry ( ).getLatLngBounds ( latLngs ) );
		}
		else {
			theTravelNotesData.map.setView ( latLng, theConfig.itineraryPointZoom );
		}
	}

	/*
	--- mySetLayer function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySetLayer ( layer ) {

		let leafletLayer = null;
		if ( 'wmts' === layer.service.toLowerCase ( ) ) {
			leafletLayer = L.tileLayer ( layer.url );
		}
		else {
			leafletLayer = L.tileLayer.wms ( layer.url, layer.wmsOptions );
		}

		if ( myCurrentLayer ) {
			theTravelNotesData.map.removeLayer ( myCurrentLayer );
		}
		theTravelNotesData.map.addLayer ( leafletLayer );
		myCurrentLayer = leafletLayer;
		if ( ! theTravelNotesData.travel.readOnly ) {

			// strange... see issue #79 ... zoom is not correct on read only file
			// when the background map have bounds...
			if ( theTravelNotesData.map.getZoom ( ) < ( layer.minZoom || THE_CONST.mapEditor.defaultMinZoom ) ) {
				theTravelNotesData.map.setZoom ( layer.minZoom || THE_CONST.mapEditor.defaultMinZoom );
			}
			theTravelNotesData.map.setMinZoom ( layer.minZoom || THE_CONST.mapEditor.defaultMinZoom );
			if ( theTravelNotesData.map.getZoom ( ) > ( layer.maxZoom || THE_CONST.mapEditor.defaultMaxZoom ) ) {
				theTravelNotesData.map.setZoom ( layer.maxZoom || THE_CONST.mapEditor.defaultMaxZoom );
			}
			theTravelNotesData.map.setMaxZoom ( layer.maxZoom || THE_CONST.mapEditor.defaultMaxZoom );
			if ( layer.bounds ) {
				if (
					! theTravelNotesData.map.getBounds ( ).intersects ( layer.bounds )
					||
					theTravelNotesData.map.getBounds ( ).contains ( layer.bounds )
				) {
					theTravelNotesData.map.setMaxBounds ( null );
					theTravelNotesData.map.fitBounds ( layer.bounds );
					theTravelNotesData.map.setZoom ( layer.minZoom || THE_CONST.mapEditor.defaultMinZoom );
				}
				theTravelNotesData.map.setMaxBounds ( layer.bounds );
			}
			else {
				theTravelNotesData.map.setMaxBounds ( null );
			}
		}
		theTravelNotesData.map.fire ( 'baselayerchange', leafletLayer );
	}

	/*
	--- myOnGeolocationStatusChanged function -----------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnGeolocationStatusChanged ( geoLocationStatus ) {
		if ( THE_CONST.geoLocation.status.active === geoLocationStatus ) {
			return;
		}
		if ( myGeolocationCircle ) {
			theTravelNotesData.map.removeLayer ( myGeolocationCircle );
			myGeolocationCircle = null;
		}
	}

	/*
	--- myOnGeolocationPositionChanged function -----------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnGeolocationPositionChanged ( position ) {
		let zoomToPosition = theConfig.geoLocation.zoomToPosition;
		if ( myGeolocationCircle ) {
			theTravelNotesData.map.removeLayer ( myGeolocationCircle );
			zoomToPosition = false;
		}

		myGeolocationCircle = L.circleMarker (
			L.latLng ( position.coords.latitude, position.coords.longitude ),
			{
				radius : theConfig.geoLocation.radius,
				color : theConfig.geoLocation.color
			}
		)
			.bindTooltip (
				newUtilities ( ).formatLatLng ( [ position.coords.latitude, position.coords.longitude ] )
			)
			.addTo ( theTravelNotesData.map );

		if ( zoomToPosition ) {
			theTravelNotesData.map.setView (
				L.latLng ( position.coords.latitude, position.coords.longitude ),
				theConfig.geoLocation.zoomFactor
			);
		}
	}

	/*
	--- ViewerMapEditor object ----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			addRoute : routeObjId => myAddRoute ( routeObjId ),

			addNote : noteObjId => myAddNote ( noteObjId ),

			getDashArray : route => myGetDashArray ( route ),

			zoomTo : ( latLng, geometry ) => myZoomTo ( latLng, geometry ),

			setLayer : layer => mySetLayer ( layer ),

			onGeolocationStatusChanged : geoLocationStatus => myOnGeolocationStatusChanged ( geoLocationStatus ),

			onGeolocationPositionChanged : position => myOnGeolocationPositionChanged ( position )

		}
	);
}

/*
--- theViewerMapEditor object -----------------------------------------------------------------------------------------

The one and only one mapViewerEditor

-----------------------------------------------------------------------------------------------------------------------
*/

const theViewerMapEditor = newViewerMapEditor ( );

export { theViewerMapEditor };

/*
--- End of ViewerMapEditor.js file ------------------------------------------------------------------------------------
*/