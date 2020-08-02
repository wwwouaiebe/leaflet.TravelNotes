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
	- v1.8.0:
		- issue #97 : Improve adding a new waypoint to a route
	- v1.12.0:
		- Issue #120 : Review the UserInterface
Doc reviewed 20200802
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file MapEditor.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module MapEditor
@private

@------------------------------------------------------------------------------------------------------------------------------
*/
/* global L  */

import { theConfig } from '../data/Config.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theWayPointEditor } from '../core/WayPointEditor.js';
import { theDataSearchEngine } from '../data/DataSearchEngine.js';
import { newRouteContextMenu } from '../contextMenus/RouteContextMenu.js';
import { newNoteContextMenu } from '../contextMenus/NoteContextMenu.js';
import { newWayPointContextMenu } from '../contextMenus/WayPointContextMenu.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';
import { newGeometry } from '../util/Geometry.js';
import { theAPIKeysManager } from '../core/APIKeysManager.js';
import { theViewerMapEditor } from '../core/ViewerMapEditor.js';
import { theTranslator } from '../UI/Translator.js';

import { ROUTE_EDITION_STATUS, LAT_LNG, NOT_FOUND, INVALID_OBJ_ID, ZERO, ONE, TWO } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function myNewMapEditor
@desc constructor of theMapEditor object
@return {APIKeysManager} an instance of APIKeysManager object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function myNewMapEditor ( ) {

	const MARKER_BOUNDS_PRECISION = 0.01;
	const WAY_POINT_ICON_SIZE = 40;

	let myTempWayPointMarker = null;
	let myTempWayPointInitialLatLng = null;
	let myTempWayPointShowDragTooltip = 1;

	let myEventDispatcher = newEventDispatcher ( );
	let myGeometry = newGeometry ( );

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnTempWayPointMarkerMouseOut
	@desc Event listener for myTempWayPointMarker
	@listens mouseout
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnTempWayPointMarkerMouseOut ( ) {
		if ( myTempWayPointMarker ) {
			L.DomEvent.off ( myTempWayPointMarker );
			theTravelNotesData.map.removeLayer ( myTempWayPointMarker );
			myTempWayPointMarker = null;
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnTempWayPointMarkerDragStart
	@desc Event listener for myTempWayPointMarker
	@listens dragstart
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnTempWayPointMarkerDragStart ( ) {
		myTempWayPointMarker.off ( 'mouseout', myOnTempWayPointMarkerMouseOut );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnTempWayPointMarkerDragEnd
	@desc Event listener for myTempWayPointMarker
	@listens dragend
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnTempWayPointMarkerDragEnd ( dragEndEvent ) {
		theWayPointEditor.addWayPointOnRoute (
			myTempWayPointInitialLatLng,
			[ dragEndEvent.target.getLatLng ( ).lat, dragEndEvent.target.getLatLng ( ).lng ]
		);
		if ( myTempWayPointMarker ) {
			L.DomEvent.off ( myTempWayPointMarker );
			theTravelNotesData.map.removeLayer ( myTempWayPointMarker );
			myTempWayPointMarker = null;
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnTempWayPointMarkerContextMenu
	@desc Event listener for myTempWayPointMarker
	@listens contextmenu
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnTempWayPointMarkerContextMenu ( contextMenuEvent ) {
		contextMenuEvent.latlng.lat = myTempWayPointInitialLatLng [ ZERO ];
		contextMenuEvent.latlng.lng = myTempWayPointInitialLatLng [ ONE ];
		contextMenuEvent.target.objId = theTravelNotesData.travel.editedRoute.objId;
		newRouteContextMenu ( contextMenuEvent ).show ( );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnNoteBulletDragEnd
	@desc Event listener for Note bullets
	@listens dragend
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnNoteBulletDragEnd ( dragEndEvent ) {

		// the TravelNotes note and route are searched...
		let noteAndRoute = theDataSearchEngine.getNoteAndRoute ( dragEndEvent.target.objId );
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

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnNoteBulletDrag
	@desc Event listener for Note bullets
	@listens drag
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnNoteBulletDrag ( dragEvent ) {
		let draggedNote = theDataSearchEngine.getNoteAndRoute ( dragEvent.target.objId ).note;
		let draggedLayerGroup = theTravelNotesData.mapObjects.get ( dragEvent.target.objId );
		draggedLayerGroup.getLayer ( draggedLayerGroup.polylineId )
			.setLatLngs ( [ [ dragEvent.latlng.lat, dragEvent.latlng.lng ], draggedNote.iconLatLng ] );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnNoteMarkerContextMenu
	@desc Event listener for Note markers
	@listens contextmenu
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnNoteMarkerContextMenu ( contextMenuEvent ) {
		newNoteContextMenu ( contextMenuEvent ).show ( );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnNoteMarkerDragEnd
	@desc Event listener for Note markers
	@listens dragend
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnNoteMarkerDragEnd ( dragEndEvent ) {

		// The TravelNotes note linked to the marker is searched...
		let draggedNote = theDataSearchEngine.getNoteAndRoute ( dragEndEvent.target.objId ).note;

		// ... new coordinates are saved in the TravelNotes note...
		draggedNote.iconLatLng = [ dragEndEvent.target.getLatLng ( ).lat, dragEndEvent.target.getLatLng ( ).lng ];

		// ... then the layerGroup is searched...
		let draggedLayerGroup = theTravelNotesData.mapObjects.get ( dragEndEvent.target.objId );

		// ... and finally the polyline is updated with the new coordinates
		draggedLayerGroup.getLayer (
			draggedLayerGroup.polylineId
		)
			.setLatLngs (
				[ draggedNote.latLng, draggedNote.iconLatLng ]
			);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnNoteMarkerDrag
	@desc Event listener for Note markers
	@listens drag
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnNoteMarkerDrag ( dragEvent ) {

		// The TravelNotes note linked to the marker is searched...
		let draggedNote = theDataSearchEngine.getNoteAndRoute ( dragEvent.target.objId ).note;

		// ... then the layerGroup is searched...
		let draggedLayerGroup = theTravelNotesData.mapObjects.get ( dragEvent.target.objId );

		// ... and finally the polyline is updated with the new coordinates
		draggedLayerGroup.getLayer ( draggedLayerGroup.polylineId )
			.setLatLngs ( [ draggedNote.latLng, [ dragEvent.latlng.lat, dragEvent.latlng.lng ] ] );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnEditedRouteMouseOver
	@desc Event listener for the edited route
	@listens mouseover
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnEditedRouteMouseOver ( mapEvent ) {
		let route = theDataSearchEngine.getRoute ( mapEvent.target.objId );
		if ( ROUTE_EDITION_STATUS.notEdited !== route.editionStatus ) {
			myTempWayPointInitialLatLng = [ mapEvent.latlng.lat, mapEvent.latlng.lng ];
			if ( myTempWayPointMarker ) {
				myTempWayPointMarker.setLatLng ( mapEvent.latlng );
			}
			else {

				// a HTML element is created, with different class name, depending of the waypont position.
				// See also WayPoints.css
				let iconHtml = '<div class="TravelNotes-WayPoint TravelNotes-WayPointTmp' +
				'"></div><div class="TravelNotes-WayPointText">?</div>';

				// a leaflet marker is created...
				myTempWayPointMarker = L.marker (
					mapEvent.latlng,
					{
						icon : L.divIcon (
							{
								iconSize : [ WAY_POINT_ICON_SIZE, WAY_POINT_ICON_SIZE ],
								iconAnchor : [
									WAY_POINT_ICON_SIZE / TWO,
									WAY_POINT_ICON_SIZE
								],
								html : iconHtml,
								className : 'TravelNotes-WayPointStyle'
							}
						),
						draggable : true
					}
				);
				if (
					NOT_FOUND === theConfig.route.showDragTooltip
					||
					myTempWayPointShowDragTooltip <= theConfig.route.showDragTooltip
				) {
					myTempWayPointShowDragTooltip ++;
					myTempWayPointMarker.bindTooltip (
						theTranslator.getText ( 'MapEditor - Drag and drop to add a waypoint' )
					);
					myTempWayPointMarker.getTooltip ( ).options.offset = [	ZERO, ZERO ];

				}
				myTempWayPointMarker.addTo ( theTravelNotesData.map );
				L.DomEvent.on ( myTempWayPointMarker, 'mouseout', myOnTempWayPointMarkerMouseOut );
				L.DomEvent.on ( myTempWayPointMarker, 'dragstart', myOnTempWayPointMarkerDragStart );
				L.DomEvent.on ( myTempWayPointMarker, 'dragend', myOnTempWayPointMarkerDragEnd );
				L.DomEvent.on ( myTempWayPointMarker, 'contextmenu', myOnTempWayPointMarkerContextMenu );
			}
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnRouteContextMenu
	@desc Event listener for Route
	@listens contextmenu
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnRouteContextMenu ( contextMenuEvent ) {
		newRouteContextMenu ( contextMenuEvent ).show ( );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnWayPointContextMenu
	@desc Event listener for WayPoint
	@listens contextmenu
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnWayPointContextMenu ( contextMenuEvent ) {
		newWayPointContextMenu ( contextMenuEvent ).show ( );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnWayPointDragEnd
	@desc Event listener for WayPoint
	@listens dragend
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnWayPointDragEnd ( dragEndEvent ) {
		let draggedWayPoint = theTravelNotesData.travel.editedRoute.wayPoints.getAt ( dragEndEvent.target.objId );
		draggedWayPoint.latLng = [ dragEndEvent.target.getLatLng ( ).lat, dragEndEvent.target.getLatLng ( ).lng ];
		theWayPointEditor.wayPointDragEnd ( dragEndEvent.target.objId );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myAddTo
	@desc Add a Leaflet object to the map
	@param {!number} objId The objId to use
	@param {Object} leafletObject The Leaflet object to add
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myAddTo ( objId, leafletObject ) {
		leafletObject.objId = objId;
		leafletObject.addTo ( theTravelNotesData.map );
		theTravelNotesData.mapObjects.set ( objId, leafletObject );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myRemoveObject
	@desc Remove a Leaflet object from the map
	@param {!number} objId The objId of the object to remove
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myRemoveObject ( objId ) {
		let layer = theTravelNotesData.mapObjects.get ( objId );
		if ( layer ) {
			L.DomEvent.off ( layer );
			theTravelNotesData.map.removeLayer ( layer );
			theTravelNotesData.mapObjects.delete ( objId );
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myAddNote
	@desc Add a Note to the map
	@param {!number} objId The objId of the note to add
	@param {boolean} isPopupOpen When true, the popup of the note is opened
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myAddNote ( noteObjId, isPopupOpen ) {

		let noteObjects = theViewerMapEditor.addNote ( noteObjId );
		if ( isPopupOpen ) {
			noteObjects.marker.openPopup ( );
		}
		if ( ! theTravelNotesData.travel.readOnly ) {
			L.DomEvent.on ( noteObjects.bullet, 'dragend', myOnNoteBulletDragEnd );
			L.DomEvent.on ( noteObjects.bullet, 'drag',	myOnNoteBulletDrag );
			L.DomEvent.on ( noteObjects.marker, 'contextmenu', myOnNoteMarkerContextMenu );
			L.DomEvent.on ( noteObjects.marker, 'dragend', myOnNoteMarkerDragEnd );
			L.DomEvent.on ( noteObjects.marker, 'drag', myOnNoteMarkerDrag );
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myAddWayPoint
	@desc Add a WayPoint to the map
	@param {WayPoint} wayPoint The WayPoint to add
	@param {string|number} letter The letter or number to show with the WayPoint
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myAddWayPoint ( wayPoint, letter ) {
		if ( ( LAT_LNG.defaultValue === wayPoint.lat ) && ( LAT_LNG.defaultValue === wayPoint.lng ) ) {
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
						iconSize : [ WAY_POINT_ICON_SIZE, WAY_POINT_ICON_SIZE ],
						iconAnchor : [
							WAY_POINT_ICON_SIZE / TWO,
							WAY_POINT_ICON_SIZE
						],
						html : iconHtml,
						className : 'TravelNotes-WayPointStyle'
					}
				),
				draggable : true
			}
		);

		marker.bindTooltip (
			tooltipWayPoint => theDataSearchEngine.getWayPoint ( tooltipWayPoint.objId ).fullName
		);
		marker.getTooltip ( ).options.offset = [
			WAY_POINT_ICON_SIZE / TWO,
			-WAY_POINT_ICON_SIZE / TWO
		];

		L.DomEvent.on ( marker, 'contextmenu', myOnWayPointContextMenu );

		// ... and added to the map...
		marker.objId = wayPoint.objId;
		myAddTo ( wayPoint.objId, marker );

		// ... and a dragend event listener is created
		L.DomEvent.on ( marker, 'dragend', myOnWayPointDragEnd );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myAddRoute
	@desc Add a Route to the map
	@param {!number} routeObjId The objId of the Route to add
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myAddRoute ( routeObjId ) {

		let route = theViewerMapEditor.addRoute ( routeObjId );
		let polyline = theTravelNotesData.mapObjects.get ( routeObjId );

		if ( ! theTravelNotesData.travel.readOnly ) {
			L.DomEvent.on ( polyline, 'contextmenu', myOnRouteContextMenu );
			L.DomEvent.on ( polyline, 'mouseover', myOnEditedRouteMouseOver );

			let notesIterator = route.notes.iterator;
			while ( ! notesIterator.done ) {
				let layerGroup = theTravelNotesData.mapObjects.get ( notesIterator.value.objId );
				let marker = layerGroup.getLayer ( layerGroup.markerId );
				let bullet = layerGroup.getLayer ( layerGroup.bulletId );
				L.DomEvent.on ( bullet, 'dragend', myOnNoteBulletDragEnd );
				L.DomEvent.on ( bullet, 'drag',	myOnNoteBulletDrag );
				L.DomEvent.on ( marker, 'contextmenu', myOnNoteMarkerContextMenu );
				L.DomEvent.on ( marker, 'dragend', myOnNoteMarkerDragEnd );
				L.DomEvent.on ( marker, 'drag', myOnNoteMarkerDrag );
			}
		}

		// waypoints are added
		if ( ! theTravelNotesData.travel.readOnly && ROUTE_EDITION_STATUS.notEdited !== route.editionStatus ) {
			let wayPointsIterator = theTravelNotesData.travel.editedRoute.wayPoints.iterator;
			while ( ! wayPointsIterator.done ) {
				myAddWayPoint (
					wayPointsIterator.value,
					wayPointsIterator .first ? 'A' : ( wayPointsIterator.last ? 'B' : wayPointsIterator.index )
				);
			}
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myRemoveRoute
	@desc Remove a route from the map. All the Route Notes and WayPoints are also removed
	@param {!number} routeObjId The objId of the route to remove
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myRemoveRoute ( routeObjId ) {

		let route = theDataSearchEngine.getRoute ( routeObjId );
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

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class
	@classdesc This class performs all the read/write updates on the map
	@see {@link theMapEditor} for the one and only one instance of this class
	@see {@link theViewerMapEditor} for readonly updates on the map
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	class MapEditor	{

		/**
		This method update a route on the map.
		This method is also used for removing a route with the addedRouteObjId = INVALID_OBJ_ID.
		This method is also used for adding a route with the removedRouteObjId = INVALID_OBJ_ID.
		This method is called by the 'routeupdated' event listener.
		@param {!number} removedRouteObjId The objId of the route to remove
		@param {!number} addedRouteObjId The objId of the route to add
		@listens routeupdated
		*/

		updateRoute ( removedRouteObjId, addedRouteObjId ) {
			if ( INVALID_OBJ_ID !== removedRouteObjId ) {
				myRemoveRoute ( removedRouteObjId );
			}
			if ( INVALID_OBJ_ID !== addedRouteObjId ) {
				myAddRoute ( addedRouteObjId );
			}
		}

		/**
		This method update the properties of a route on the map
		This method is called by the 'routepropertiesupdated' event listener.
		@param {!number} routeObjId The objId of the route to update
		@listens routepropertiesupdated
		*/

		updateRouteProperties ( routeObjId ) {
			let route = theDataSearchEngine.getRoute ( routeObjId );
			let polyline = theTravelNotesData.mapObjects.get ( route.objId );
			polyline.setStyle (
				{
					color : route.color,
					weight : route.width,
					dashArray : theViewerMapEditor.getDashArray ( route )
				}
			);
		}

		/**
		This method update a note on the map.
		This method is also used for removing a note with the addedNoteObjId = INVALID_OBJ_ID.
		This method is also used for adding a note with the removedNoteObjId = INVALID_OBJ_ID.
		This method is called by the 'noteupdated' event listener.
		@param {!number} removedNoteObjId The objId of the note to remove
		@param {!number} addedNoteObjId The objId of the note to add
		@listens noteupdated
		*/

		updateNote ( removedNoteObjId, addedNoteObjId ) {
			let isPopupOpen = false;
			if ( INVALID_OBJ_ID !== removedNoteObjId ) {
				let layerGroup = theTravelNotesData.mapObjects.get ( removedNoteObjId );
				if ( layerGroup ) {
					isPopupOpen = layerGroup.getLayer ( layerGroup.markerId ).isPopupOpen ( );
				}
				myRemoveObject ( removedNoteObjId );
			}
			if ( INVALID_OBJ_ID !== addedNoteObjId ) {
				myAddNote ( addedNoteObjId, isPopupOpen );
			}
		}

		/**
		This method removes an object from the map.
		This method is called by the 'removeobject' event listener
		@param {!number} objId The objId of the object to remove
		@listens removeobject
		*/

		removeObject ( objId ) { myRemoveObject ( objId ); }

		/**
		This method removes all objects from the map.
		This method is called by the 'removeallobjects' event listener
		@listens removeallobjects
		*/

		removeAllObjects ( ) {
			theTravelNotesData.mapObjects.forEach (
				mapObject => {
					L.DomEvent.off ( mapObject );
					theTravelNotesData.map.removeLayer ( mapObject );
				}
			);
			theTravelNotesData.mapObjects.clear ( );
		}

		/**
		This method add a WayPoint to the map.
		This method is called by the 'addwaypoint' event listener.
		@param {WayPoint} wayPoint The wayPoint to add
		@param {string|number} letter The letter or number to show with the WayPoint
		@listens addwaypoint
		*/

		addWayPoint ( wayPoint, letter ) { myAddWayPoint ( wayPoint, letter ); }

		/**
		This method add an itinerary point marker to the map (= a leaflet.circleMarker object).
		This method is called by the 'additinerarypointmarker' event listener.
		@param {!number} objId A unique identifier to attach to the circleMarker
		@param {Array.<number>} latLng The latitude and longitude of the itinerary point marker
		@listens additinerarypointmarker
		*/

		addItineraryPointMarker ( objId, latLng ) {
			myAddTo (
				objId,
				L.circleMarker ( latLng, theConfig.itineraryPointMarker )
			);
		}

		/**
		This method add an search point marker to the map
		(= a leaflet.circleMarker object or a polyline, depending of the zoom and the geometry parameter).
		This method is called by the 'addsearchpointmarker' event listener.
		@param {!number} objId A unique identifier to attach to the circleMarker
		@param {Array.<number>} latLng The latitude and longitude of the search point marker
		@param {?Array.<Array.<number>>} geometry The latitudes and longitudes of the search point marker when a polyline
		can be showed
		@listens addsearchpointmarker
		*/

		addSearchPointMarker ( objId, latLng, geometry ) {
			let showGeometry = false;
			if ( geometry ) {
				let latLngs = [];
				geometry.forEach (
					geometryPart => { latLngs = latLngs.concat ( geometryPart ); }
				);
				let geometryBounds = myGeometry.getLatLngBounds ( latLngs );
				let mapBounds = theTravelNotesData.map.getBounds ( );
				showGeometry =
					(
						( geometryBounds.getEast ( ) - geometryBounds.getWest ( ) )
						/
						( mapBounds.getEast ( ) - mapBounds.getWest ( ) )
					) > MARKER_BOUNDS_PRECISION
					&&
					(
						( geometryBounds.getNorth ( ) - geometryBounds.getSouth ( ) )
						/
						( mapBounds.getNorth ( ) - mapBounds.getSouth ( ) )
					) > MARKER_BOUNDS_PRECISION;
			}
			if ( showGeometry ) {
				myAddTo ( objId, L.polyline ( geometry, theConfig.searchPointPolyline ) );
			}
			else {
				myAddTo ( objId, L.circleMarker ( latLng, theConfig.searchPointMarker ) );
			}
		}

		/**
		This method add a rectangle to the map.
		This method is called by the 'addrectangle' event listener.
		@param {!number} objId A unique identifier to attach to the rectangle
		@param {Array.<Array.<number>>} bounds The lower left and upper right corner of the rectangle
		@param {Object} properties The Leaflet properties of the rectangle
		@listens addrectangle
		*/

		addRectangle ( objId, bounds, properties ) {
			myAddTo (
				objId,
				L.rectangle ( bounds, properties )
			);
		}

		/**
		This method changes the background map.
		This method is called by the 'layerchange' event listener.
		@param {Layer} layer The layer to set
		@listens layerchange
		*/

		setLayer ( layer ) {
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
			layer.url = url;

			theViewerMapEditor.setLayer ( layer );
		}
	}

	return Object.seal ( new MapEditor );
}

const myMapEditor = myNewMapEditor ( );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of MapEditor class
	@type {MapEditor}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	myMapEditor as theMapEditor
};

/*
--- End of MapEditor.js file --------------------------------------------------------------------------------------------------
*/