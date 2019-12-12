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
	- v1.0.0:
		- created
	-v1.1.0:
		- Issue #29 : added tooltip to startpoint, waypoints and endpoint
		- Issue #30: Add a context menu with delete command to the waypoints
		- Issue #36: Add a linetype property to route
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
		- added redrawNote, zoomToNote, addRectangle and addSearchPointMarker methods
		- removed partial distance in the tooltip when readOnly
	- v1.5.0:
		- Issue #52 : when saving the travel to the file, save also the edited route.
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
		- Issue #69 : ContextMenu and ContextMenuFactory are unclear
		- Issue #70 : Put the get...HTML functions outside of the editors
		- Issue #75 : Merge Maps and TravelNotes
Doc reviewed 20191121
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

/* global L  */

import { theConfig } from '../data/Config.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theWayPointEditor } from '../core/WayPointEditor.js';
import { newDataSearchEngine } from '../data/DataSearchEngine.js';
import { newRouteContextMenu } from '../contextMenus/RouteContextMenu.js';
import { newNoteContextMenu } from '../contextMenus/NoteContextMenu.js';
import { newWayPointContextMenu } from '../contextMenus/WayPointContextMenu.js';
import { newUtilities } from '../util/Utilities.js';
import { newHTMLViewsFactory } from '../UI/HTMLViewsFactory.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';
import { newGeometry } from '../util/Geometry.js';
import { theAPIKeysManager } from '../core/APIKeysManager.js';

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
--- newMapEditor function ---------------------------------------------------------------------------------------------

Patterns : Closure and Singleton

-----------------------------------------------------------------------------------------------------------------------
*/

function newMapEditor ( ) {

	let myDataSearchEngine = newDataSearchEngine ( );
	let myEventDispatcher = newEventDispatcher ( );
	let myGeometry = newGeometry ( );
	let myCurrentLayer = null;
	let myGeolocationCircle = null;

	/*
	--- mySetLayer function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySetLayer ( layer ) {

		let url = layer.url;
		if ( layer.providerKeyNeeded ) {
			let providerKey = theAPIKeysManager.getKey ( layer.providerName.toLowerCase ( ) );
			if ( providerKey ) {
				url = url.replace ( '{providerKey}', providerKey );
			}
			else {
				return;
			}
		}

		let leafletLayer = null;
		if ( 'wmts' === layer.service.toLowerCase ( ) ) {
			leafletLayer = L.tileLayer ( url );
		}
		else {
			leafletLayer = L.tileLayer.wms ( url, layer.wmsOptions );
		}

		if ( myCurrentLayer ) {
			theTravelNotesData.map.removeLayer ( myCurrentLayer );
		}
		theTravelNotesData.map.addLayer ( leafletLayer );
		myCurrentLayer = leafletLayer;

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
		theTravelNotesData.map.fire ( 'baselayerchange', leafletLayer );
	}

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
	--- myRemoveObject function ---------------------------------------------------------------------------------------

	This function remove a leaflet object from the leaflet map and from the JavaScript map

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myRemoveObject ( objId ) {
		let layer = theTravelNotesData.mapObjects.get ( objId );
		if ( layer ) {
			L.DomEvent.off ( layer );
			theTravelNotesData.map.removeLayer ( layer );
			theTravelNotesData.mapObjects.delete ( objId );
		}
	}

	/*
	--- myGetLatLngBounds function ------------------------------------------------------------------------------------

	This function build a L.latLngBounds object from an array of points

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetLatLngBounds ( latLngs ) {
		let sw = L.latLng ( [ THE_CONST.latLng.maxLat, THE_CONST.latLng.maxLng ] );
		let ne = L.latLng ( [ THE_CONST.latLng.minLat, THE_CONST.latLng.minLng ] );
		latLngs.forEach (
			latLng => {
				sw.lat = Math.min ( sw.lat, latLng [ THE_CONST.zero ] );
				sw.lng = Math.min ( sw.lng, latLng [ THE_CONST.number1 ] );
				ne.lat = Math.max ( ne.lat, latLng [ THE_CONST.zero ] );
				ne.lng = Math.max ( ne.lng, latLng [ THE_CONST.number1 ] );
			}
		);
		return L.latLngBounds ( sw, ne );
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
	--- myRemoveRoute function ------------------------------------------------------------------------------------

	---------------------------------------------------------------------------------------------------------------
	*/

	function myRemoveRoute ( routeObjId ) {

		let route = myDataSearchEngine.getRoute ( routeObjId );
		myRemoveObject ( route.objId );

		let notesIterator = route.notes.iterator;
		while ( ! notesIterator.done ) {
			myRemoveObject ( notesIterator.value.objId );
		}

		let wayPointsIterator = route.wayPoints.iterator;
		while ( ! wayPointsIterator.done ) {
			myRemoveObject ( wayPointsIterator.value.objId );
		}
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

		if ( ! readOnly ) {

			// event listener for the dragend event
			L.DomEvent.on (
				bullet,
				'dragend',
				dragEndEvent => {

					// the TravelNotes note and route are searched...
					let noteAndRoute = myDataSearchEngine.getNoteAndRoute ( dragEndEvent.target.objId );
					let draggedNote = noteAndRoute.note;
					let route = noteAndRoute.route;

					// ... then the layerGroup is searched...
					let draggedLayerGroup = theTravelNotesData.mapObjects.get ( dragEndEvent.target.objId );
					if ( null === route ) {

						// the note is not attached to a route, so the coordinates of the note can be directly changed
						draggedNote.latLng = [ dragEndEvent.target.getLatLng ( ).lat, dragEndEvent.target.getLatLng ( ).lng ];
						myEventDispatcher.dispatch ( 'updatetravelnotes' );
					}
					else {

						// the note is attached to the route, so we have to find the nearest point on the route
						// and the distance since the start of the route
						let latLngDistance = myGeometry.getClosestLatLngDistance (
							route,
							[ dragEndEvent.target.getLatLng ( ).lat, dragEndEvent.target.getLatLng ( ).lng ]
						);

						// coordinates and distance are changed in the note
						draggedNote.latLng = latLngDistance.latLng;
						draggedNote.distance = latLngDistance.distance;

						// notes are sorted on the distance
						route.notes.sort (
							( first, second ) => first.distance - second.distance
						);

						// the coordinates of the bullet are adapted
						draggedLayerGroup.getLayer ( draggedLayerGroup.bulletId )
							.setLatLng ( latLngDistance.latLng );
						myEventDispatcher.dispatch ( 'updateitinerary' );
					}

					// in all cases, the polyline is updated
					draggedLayerGroup.getLayer ( draggedLayerGroup.polylineId )
						.setLatLngs ( [ draggedNote.latLng, draggedNote.iconLatLng ] );

					// and the HTML page is adapted
					myEventDispatcher.dispatch ( 'roadbookupdate' );
				}
			);

			// event listener for the drag event
			L.DomEvent.on (
				bullet,
				'drag',
				dragEvent => {
					let draggedNote = myDataSearchEngine.getNoteAndRoute ( dragEvent.target.objId ).note;
					let draggedLayerGroup = theTravelNotesData.mapObjects.get ( dragEvent.target.objId );
					draggedLayerGroup.getLayer ( draggedLayerGroup.polylineId )
						.setLatLngs ( [ [ dragEvent.latlng.lat, dragEvent.latlng.lng ], draggedNote.iconLatLng ] );
				}
			);
		}

		// a second marker is now created. The icon created by the user is used for this marker
		let icon = L.divIcon (
			{
				iconSize : [ note.iconWidth, note.iconHeight ],
				iconAnchor : [ note.iconWidth / THE_CONST.number2, note.iconHeight / THE_CONST.number2 ],
				popupAnchor : [ THE_CONST.zero, -note.iconHeight / THE_CONST.number2 ],
				html : note.iconContent,
				className : theConfig.note.style
			}
		);
		let marker = L.marker (
			note.iconLatLng,
			{
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
		if ( ! readOnly ) {

			// event listener for the contextmenu event
			L.DomEvent.on (
				marker,
				'contextmenu',
				contextMenuEvent => newNoteContextMenu ( contextMenuEvent ).show ( )
			);

			// event listener for the dragend event
			L.DomEvent.on (
				marker,
				'dragend',
				dragEndEvent => {

					// The TravelNotes note linked to the marker is searched...
					let draggedNote = myDataSearchEngine.getNoteAndRoute ( dragEndEvent.target.objId ).note;

					// ... new coordinates are saved in the TravelNotes note...
					draggedNote.iconLatLng = [ dragEndEvent.target.getLatLng ( ).lat, dragEndEvent.target.getLatLng ( ).lng ];

					// ... then the layerGroup is searched...
					let draggedLayerGroup = theTravelNotesData.mapObjects.get ( dragEndEvent.target.objId );

					// ... and finally the polyline is updated with the new coordinates
					draggedLayerGroup.getLayer (
						draggedLayerGroup.polylineId
					).setLatLngs (
						[ draggedNote.latLng, draggedNote.iconLatLng ]
					);
				}
			);

			// event listener for the drag event
			L.DomEvent.on (
				marker,
				'drag',
				dragEvent => {

					// The TravelNotes note linked to the marker is searched...
					let draggedNote = myDataSearchEngine.getNoteAndRoute ( dragEvent.target.objId ).note;

					// ... then the layerGroup is searched...
					let draggedLayerGroup = theTravelNotesData.mapObjects.get ( dragEvent.target.objId );

					// ... and finally the polyline is updated with the new coordinates
					draggedLayerGroup.getLayer ( draggedLayerGroup.polylineId )
						.setLatLngs ( [ draggedNote.latLng, [ dragEvent.latlng.lat, dragEvent.latlng.lng ] ] );
				}
			);
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
	--- myAddWayPoint function ----------------------------------------------------------------------------------------

	This function add a TravelNotes waypoint object to the leaflet map

	parameters:
	- wayPoint : a TravelNotes waypoint object
	- letter : the letter to be displayed under the waypoint

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddWayPoint ( wayPoint, letter ) {
		if ( ( THE_CONST.latLng.defaultValue === wayPoint.lat ) && ( THE_CONST.latLng.defaultValue === wayPoint.lng ) ) {
			return;
		}

		// a HTML element is created, with different class name, depending of the waypont position. See also WayPoints.css
		let iconHtml = '<div class="TravelNotes-WayPoint TravelNotes-WayPoint' +
		( 'A' === letter ? 'Start' : ( 'B' === letter ? 'End' : 'Via' ) ) +
		'"></div><div class="TravelNotes-WayPointText">' + letter + '</div>';

		// a leaflet marker is created...
		let marker = L.marker (
			wayPoint.latLng,
			{
				icon : L.divIcon (
					{
						iconSize : [ THE_CONST.mapEditor.wayPointIconSize, THE_CONST.mapEditor.wayPointIconSize ],
						iconAnchor : [
							THE_CONST.mapEditor.wayPointIconSize / THE_CONST.number2,
							THE_CONST.mapEditor.wayPointIconSize
						],
						html : iconHtml,
						className : 'TravelNotes-WayPointStyle'
					}
				),
				draggable : true
			}
		);

		marker.bindTooltip (
			tooltipWayPoint => newUtilities ( ).formatLatLng (
				myDataSearchEngine.getWayPoint ( tooltipWayPoint.objId ).latLng
			)
		);
		marker.getTooltip ( ).options.offset = [
			THE_CONST.mapEditor.wayPointIconSize / THE_CONST.number2,
			-THE_CONST.mapEditor.wayPointIconSize / THE_CONST.number2
		];

		L.DomEvent.on (
			marker,
			'contextmenu',
			contextMenuEvent => newWayPointContextMenu ( contextMenuEvent ).show ( )
		);

		// ... and added to the map...
		marker.objId = wayPoint.objId;
		myAddTo ( wayPoint.objId, marker );

		// ... and a dragend event listener is created
		L.DomEvent.on (
			marker,
			'dragend',
			dragEndEvent => {
				let draggedWayPoint = theTravelNotesData.travel.editedRoute.wayPoints.getAt ( dragEndEvent.target.objId );
				draggedWayPoint.latLng = [ dragEndEvent.target.getLatLng ( ).lat, dragEndEvent.target.getLatLng ( ).lng ];
				theWayPointEditor.wayPointDragEnd ( dragEndEvent.target.objId );
			}
		);
	}

	/*
	--- myAddRoute function ---------------------------------------------------------------------------------------

	This function add a route and eventually the attached notes and waypoints
	to the leaflet map and the JavaScript map

	parameters:
	- route : a TravelNotes route object.
	- addNotes : a boolean. Attached notes are added when true
	- addWayPoints : a boolean. Attached waypoints are added when true
	- readOnly : a boolean. Created objects cannot be edited when true.

	---------------------------------------------------------------------------------------------------------------
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

		// right click event
		if ( ! theTravelNotesData.travel.readOnly ) {
			L.DomEvent.on (
				polyline,
				'contextmenu',
				contextMenuEvent => newRouteContextMenu ( contextMenuEvent ).show ( )
			);
		}

		// notes are added
		let notesIterator = route.notes.iterator;
		while ( ! notesIterator.done ) {
			myAddNote ( notesIterator.value.objId );
		}

		// waypoints are added
		if ( ! theTravelNotesData.travel.readOnly && THE_CONST.route.edited.notEdited !== route.edited ) {
			let wayPointsIterator = theTravelNotesData.travel.editedRoute.wayPoints.iterator;
			while ( ! wayPointsIterator.done ) {
				myAddWayPoint (
					wayPointsIterator.value,
					wayPointsIterator .first ? 'A' : ( wayPointsIterator.last ? 'B' : wayPointsIterator.index )
				);
			}
		}
	}

	/*
	--- myRemoveAllObjects function -----------------------------------------------------------------------------------

	This function remove all the objects from the leaflet map and from the JavaScript map

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myRemoveAllObjects ( ) {
		theTravelNotesData.mapObjects.forEach (
			travelObjectValue => {
				L.DomEvent.off ( travelObjectValue );
				theTravelNotesData.map.removeLayer ( travelObjectValue );
			}
		);
		theTravelNotesData.mapObjects.clear ( );
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
			theTravelNotesData.map.fitBounds ( myGetLatLngBounds ( latLngs ) );
		}
		else {
			theTravelNotesData.map.setView ( latLng, theConfig.itineraryPointZoom );
		}
	}

	/*
	--- myAddItineraryPointMarker function ----------------------------------------------------------------------------

	This function add a leaflet circleMarker at a given point

	parameters:
	- objId : a unique identifier to attach to the circleMarker
	- latLng : the center of the circleMarker

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddItineraryPointMarker ( objId, latLng ) {
		myAddTo (
			objId,
			L.circleMarker ( latLng, theConfig.itineraryPointMarker )
		);
	}

	/*
	--- myAddSearchPointMarker function -------------------------------------------------------------------------------

	This function add a leaflet circleMarker at a given point

	parameters:
	- objId : a unique identifier to attach to the circleMarker
	- latLng : the center of the circleMarker

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddSearchPointMarker ( objId, latLng, geometry ) {

		let showGeometry = false;
		if ( geometry ) {
			let latLngs = [];
			geometry.forEach (
				geometryPart => { latLngs = latLngs.concat ( geometryPart ); }
			);
			let geometryBounds = myGetLatLngBounds ( latLngs );
			let mapBounds = theTravelNotesData.map.getBounds ( );
			showGeometry =
				(
					( geometryBounds.getEast ( ) - geometryBounds.getWest ( ) )
					/
					( mapBounds.getEast ( ) - mapBounds.getWest ( ) )
				) > THE_CONST.mapEditor.markerBoundsPrecision
				&&
				(
					( geometryBounds.getNorth ( ) - geometryBounds.getSouth ( ) )
					/
					( mapBounds.getNorth ( ) - mapBounds.getSouth ( ) )
				) > THE_CONST.mapEditor.markerBoundsPrecision;
		}
		if ( showGeometry ) {
			myAddTo ( objId, L.polyline ( geometry, theConfig.searchPointPolyline ) );
		}
		else {
			myAddTo ( objId, L.circleMarker ( latLng, theConfig.searchPointMarker ) );
		}
	}

	/*
	--- myAddRectangle method -----------------------------------------------------------------------------------------

	This method draw a rectangle on the map

	parameters:
	- objId : a unique identifier to attach to the rectangle
	- bounds : the lower left and upper right corner of the rectangle ( see leaflet docs )
	- properties : the properties of the rectangle

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddRectangle ( objId, bounds, properties ) {
		myAddTo (
			objId,
			L.rectangle ( bounds, properties )
		);
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
	--- myUpdateRoute function ----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myUpdateRoute ( removedRouteObjId, addedRouteObjId ) {
		if ( THE_CONST.invalidObjId !== removedRouteObjId ) {
			myRemoveRoute ( removedRouteObjId );
		}
		if ( THE_CONST.invalidObjId !== addedRouteObjId ) {
			myAddRoute ( addedRouteObjId );
		}
	}

	/*
	--- myUpdateRouteProperties function ------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myUpdateRouteProperties ( routeObjId ) {
		let route = myDataSearchEngine.getRoute ( routeObjId );
		let polyline = theTravelNotesData.mapObjects.get ( route.objId );
		polyline.setStyle ( { color : route.color, weight : route.width, dashArray : myGetDashArray ( route ) } );
	}

	/*
	--- myUpdateNote function -----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myUpdateNote ( removedNoteObjId, addedNoteObjId ) {
		if ( THE_CONST.invalidObjId !== removedNoteObjId ) {
			myRemoveObject ( removedNoteObjId );
		}
		if ( THE_CONST.invalidObjId !== addedNoteObjId ) {
			myAddNote ( addedNoteObjId );
		}
	}

	/*
	--- MapEditor object ----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			updateRoute : ( removedRouteObjId, addedRouteObjId ) => myUpdateRoute ( removedRouteObjId, addedRouteObjId ),

			updateRouteProperties : routeObjId => myUpdateRouteProperties ( routeObjId ),

			updateNote : ( removedNoteObjId, addedNoteObjId ) => myUpdateNote ( removedNoteObjId, addedNoteObjId ),

			removeObject : objId => myRemoveObject ( objId ),

			removeAllObjects : ( ) => myRemoveAllObjects ( ),

			zoomTo : ( latLng, geometry ) => myZoomTo ( latLng, geometry ),

			addItineraryPointMarker : ( objId, latLng ) => myAddItineraryPointMarker ( objId, latLng ),

			addSearchPointMarker : ( objId, latLng, geometry ) => myAddSearchPointMarker ( objId, latLng, geometry ),

			addRectangle : ( objId, bounds, properties ) => myAddRectangle ( objId, bounds, properties ),

			addWayPoint : ( wayPoint, letter ) => myAddWayPoint ( wayPoint, letter ),

			setLayer : layer => mySetLayer ( layer ),

			onGeolocationStatusChanged : geoLocationStatus => myOnGeolocationStatusChanged ( geoLocationStatus ),

			onGeolocationPositionChanged : position => myOnGeolocationPositionChanged ( position )

		}
	);
}

/*
--- theMapEditor object ------------------------------------------------------------------------------------------------

The one and only one mapEditor

-----------------------------------------------------------------------------------------------------------------------
*/

const theMapEditor = newMapEditor ( );

export { theMapEditor };

/*
--- End of MapEditor.js file ------------------------------------------------------------------------------------------
*/