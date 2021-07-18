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
	-v1.1.0:
		- Issue ♯29 : added tooltip to startpoint, waypoints and endpoint
		- Issue ♯30: Add a context menu with delete command to the waypoints
		- Issue ♯36: Add a linetype property to route
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
		- added redrawNote, zoomToNote, addRectangle and addSearchPointMarker methods
		- removed partial distance in the tooltip when readOnly
	- v1.5.0:
		- Issue ♯52 : when saving the travel to the file, save also the edited route.
	- v1.6.0:
		- Issue ♯65 : Time to go to ES6 modules?
		- Issue ♯69 : ContextMenu and ContextMenuFactory are unclear
		- Issue ♯70 : Put the get...HTML functions outside of the editors
		- Issue ♯75 : Merge Maps and TravelNotes
	- v1.8.0:
		- Issue ♯97 : Improve adding a new waypoint to a route
	- v1.12.0:
		- Issue ♯120 : Review the UserInterface
	- v2.0.0:
		- Issue ♯142 : Transform the typedef layer to a class as specified in the layersToolbarUI.js
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210715
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file MapEditor.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
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

import theConfig from '../data/Config.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import { theWayPointEditor } from '../core/WayPointEditor.js';
import theDataSearchEngine from '../data/DataSearchEngine.js';
import { newRouteContextMenu } from '../contextMenus/RouteContextMenu.js';
import { newNoteContextMenu } from '../contextMenus/NoteContextMenu.js';
import { newWayPointContextMenu } from '../contextMenus/WayPointContextMenu.js';
import { theEventDispatcher } from '../util/EventDispatcher.js';
import { theGeometry } from '../util/Geometry.js';
import theAPIKeysManager from '../core/APIKeysManager.js';
import ViewerMapEditor from '../core/ViewerMapEditor.js';
import { theTranslator } from '../UI/Translator.js';

import { ROUTE_EDITION_STATUS, LAT_LNG, NOT_FOUND, INVALID_OBJ_ID, ZERO, ONE, TWO } from '../util/Constants.js';

const OUR_MARKER_BOUNDS_PRECISION = 0.01;
const OUR_WAY_POINT_ICON_SIZE = 20;

let ourTempWayPointMarker = null;
let ourTempWayPointInitialLatLng = null;
let ourTempWayPointShowDragTooltip = 1;

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class contains the event listeners for the temp waypoint
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class TempWayPointMarkerEvents {

	/**
	mouseout event listener
	@listens mouseout
	*/

	static onMouseOut ( ) {
		if ( ourTempWayPointMarker ) {
			window.L.DomEvent.off ( ourTempWayPointMarker );
			theTravelNotesData.map.removeLayer ( ourTempWayPointMarker );
			ourTempWayPointMarker = null;
		}
	}

	/**
	dragstart event listener
	@listens dragstart
	*/

	static onDragStart ( ) {
		window.L.DomEvent.off ( ourTempWayPointMarker, 'mouseout', TempWayPointMarkerEvents.onMouseOut );
	}

	/**
	contextmenu event listener
	@listens contextmenu
	*/

	static onContextMenu ( contextMenuEvent ) {
		contextMenuEvent.latlng.lat = ourTempWayPointInitialLatLng [ ZERO ];
		contextMenuEvent.latlng.lng = ourTempWayPointInitialLatLng [ ONE ];
		contextMenuEvent.target.objId = theTravelNotesData.travel.editedRoute.objId;
		newRouteContextMenu ( contextMenuEvent ).show ( );
	}

	/**
	dragend event listener
	@listens dragend
	@private
	*/

	static onDragEnd ( dragEndEvent ) {
		theWayPointEditor.addWayPointOnRoute (
			ourTempWayPointInitialLatLng,
			[ dragEndEvent.target.getLatLng ( ).lat, dragEndEvent.target.getLatLng ( ).lng ]
		);
		if ( ourTempWayPointMarker ) {
			window.L.DomEvent.off ( ourTempWayPointMarker, 'dragstart', TempWayPointMarkerEvents.onDragStart );
			window.L.DomEvent.off ( ourTempWayPointMarker, 'dragend', TempWayPointMarkerEvents.onDragEnd );
			window.L.DomEvent.off ( ourTempWayPointMarker, 'contextmenu', TempWayPointMarkerEvents.onContextMenu );
			theTravelNotesData.map.removeLayer ( ourTempWayPointMarker );
			ourTempWayPointMarker = null;
		}
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class contains the event listeners for the waypoints
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class WayPointEvents {

	/**
	contextmenu event listener
	@listens contextmenu
	*/

	static onContextMenu ( contextMenuEvent ) {
		newWayPointContextMenu ( contextMenuEvent ).show ( );
	}

	/**
	dragend event listener
	@listens dragend
	*/

	static onDragEnd ( dragEndEvent ) {
		let draggedWayPoint = theTravelNotesData.travel.editedRoute.wayPoints.getAt ( dragEndEvent.target.objId );
		draggedWayPoint.latLng = [ dragEndEvent.target.getLatLng ( ).lat, dragEndEvent.target.getLatLng ( ).lng ];
		theWayPointEditor.wayPointDragEnd ( dragEndEvent.target.objId );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class contains the event listeners for the notes bullets
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteBulletEvents {

	/**
	dragend event listener
	@listens dragend
	*/

	static onDragEnd ( dragEndEvent ) {

		// the TravelNotes note and route are searched...
		let noteAndRoute = theDataSearchEngine.getNoteAndRoute ( dragEndEvent.target.objId );
		let draggedNote = noteAndRoute.note;
		let route = noteAndRoute.route;

		// ... then the layerGroup is searched...
		let draggedLayerGroup = theTravelNotesData.mapObjects.get ( dragEndEvent.target.objId );
		if ( null === route ) {

			// the note is not attached to a route, so the coordinates of the note can be directly changed
			draggedNote.latLng = [ dragEndEvent.target.getLatLng ( ).lat, dragEndEvent.target.getLatLng ( ).lng ];
			theEventDispatcher.dispatch ( 'updatetravelnotes' );
		}
		else {

			// the note is attached to the route, so we have to find the nearest point on the route
			// and the distance since the start of the route
			let latLngDistance = theGeometry.getClosestLatLngDistance (
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
			theEventDispatcher.dispatch ( 'updateitinerary' );
		}

		// in all cases, the polyline is updated
		draggedLayerGroup.getLayer ( draggedLayerGroup.polylineId )
			.setLatLngs ( [ draggedNote.latLng, draggedNote.iconLatLng ] );

		// and the HTML page is adapted
		theEventDispatcher.dispatch ( 'roadbookupdate' );
	}

	/**
	drag event listener
	@listens drag
	*/

	static onDrag ( dragEvent ) {
		let draggedNote = theDataSearchEngine.getNoteAndRoute ( dragEvent.target.objId ).note;
		let draggedLayerGroup = theTravelNotesData.mapObjects.get ( dragEvent.target.objId );
		draggedLayerGroup.getLayer ( draggedLayerGroup.polylineId )
			.setLatLngs ( [ [ dragEvent.latlng.lat, dragEvent.latlng.lng ], draggedNote.iconLatLng ] );
	}

	/**
	mouseenter event listener
	@listens mouseenter
	*/

	static onMouseEnter ( mouseEnterEvent ) {
		mouseEnterEvent.originalEvent.target.style.opacity = theConfig.note.grip.moveOpacity;
	}

	/**
	mouseleave event listener
	@listens mouseleave
	*/

	static onMouseLeave ( mouseLeaveEvent ) {
		mouseLeaveEvent.originalEvent.target.style.opacity = theConfig.note.grip.opacity;
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class contains the event listeners for the notes markers
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteMarkerEvents {

	/**
	contextmenu event listener
	@listens contextmenu
	*/

	static onContextMenu ( contextMenuEvent ) {
		newNoteContextMenu ( contextMenuEvent ).show ( );
	}

	/**
	dragend event listener
	@listens dragend
	*/

	static onDragEnd ( dragEndEvent ) {

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
	drag event listener
	@listens drag
	*/

	static onDrag ( dragEvent ) {

		// The TravelNotes note linked to the marker is searched...
		let draggedNote = theDataSearchEngine.getNoteAndRoute ( dragEvent.target.objId ).note;

		// ... then the layerGroup is searched...
		let draggedLayerGroup = theTravelNotesData.mapObjects.get ( dragEvent.target.objId );

		// ... and finally the polyline is updated with the new coordinates
		draggedLayerGroup.getLayer ( draggedLayerGroup.polylineId )
			.setLatLngs ( [ draggedNote.latLng, [ dragEvent.latlng.lat, dragEvent.latlng.lng ] ] );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class contains the event listeners for the edited route
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class EditedRouteEvents {

	/**
	mouseover event listener
	@listens mouseover
	*/

	static onMouseOver ( mapEvent ) {
		let route = theDataSearchEngine.getRoute ( mapEvent.target.objId );
		if ( ROUTE_EDITION_STATUS.notEdited !== route.editionStatus ) {
			ourTempWayPointInitialLatLng = [ mapEvent.latlng.lat, mapEvent.latlng.lng ];
			if ( ourTempWayPointMarker ) {
				ourTempWayPointMarker.setLatLng ( mapEvent.latlng );
			}
			else {

				// a HTML element is created, with different class name, depending of the waypont position.
				// See also WayPoints.css
				let iconHtml = '<div class="TravelNotes-Map-WayPoint TravelNotes-Map-WayPointTmp' +
				'"></div><div class="TravelNotes-Map-WayPointText">?</div>';

				// a leaflet marker is created...
				ourTempWayPointMarker = window.L.marker (
					mapEvent.latlng,
					{
						icon : window.L.divIcon (
							{
								iconSize : [ OUR_WAY_POINT_ICON_SIZE, OUR_WAY_POINT_ICON_SIZE ],
								iconAnchor : [
									OUR_WAY_POINT_ICON_SIZE / TWO,
									OUR_WAY_POINT_ICON_SIZE
								],
								html : iconHtml,
								className : 'TravelNotes-Map-WayPointStyle'
							}
						),
						draggable : true
					}
				);
				if (
					NOT_FOUND === theConfig.route.showDragTooltip
					||
					ourTempWayPointShowDragTooltip <= theConfig.route.showDragTooltip
				) {
					ourTempWayPointShowDragTooltip ++;
					ourTempWayPointMarker.bindTooltip (
						theTranslator.getText ( 'MapEditor - Drag and drop to add a waypoint' )
					);
					ourTempWayPointMarker.getTooltip ( ).options.offset = [	ZERO, ZERO ];

				}
				ourTempWayPointMarker.addTo ( theTravelNotesData.map );
				window.L.DomEvent.on ( ourTempWayPointMarker, 'mouseout', TempWayPointMarkerEvents.onMouseOut );
				window.L.DomEvent.on ( ourTempWayPointMarker, 'dragstart', TempWayPointMarkerEvents.onDragStart );
				window.L.DomEvent.on ( ourTempWayPointMarker, 'dragend', TempWayPointMarkerEvents.onDragEnd );
				window.L.DomEvent.on ( ourTempWayPointMarker, 'contextmenu', TempWayPointMarkerEvents.onContextMenu );
			}
		}
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class contains the event listeners for the routes
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class RouteEvents {

	/**
	contextmenu event listener
	@listens contextmenu
	*/

	static onContextMenu ( contextMenuEvent ) {
		window.L.DomEvent.stopPropagation ( contextMenuEvent );
		newRouteContextMenu ( contextMenuEvent ).show ( );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class performs all the read/write updates on the map
@extends ViewerMapEditor
@inheritdoc
@see {@link theMapEditor} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class MapEditor	extends ViewerMapEditor {

	/**
	Remove a Leaflet object from the map
	@param {!number} objId The objId of the object to remove
	@private
	*/

	#RemoveFromMap ( objId ) {
		let layer = theTravelNotesData.mapObjects.get ( objId );
		if ( layer ) {
			window.L.DomEvent.off ( layer );
			theTravelNotesData.map.removeLayer ( layer );
			theTravelNotesData.mapObjects.delete ( objId );
		}
	}

	constructor ( ) {
		super ( );
		Object.freeze ( this );
	}

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
			let route = theDataSearchEngine.getRoute ( removedRouteObjId );
			this.#RemoveFromMap ( route.objId );

			let notesIterator = route.notes.iterator;
			while ( ! notesIterator.done ) {
				this.#RemoveFromMap ( notesIterator.value.objId );
			}

			let wayPointsIterator = route.wayPoints.iterator;
			while ( ! wayPointsIterator.done ) {
				this.#RemoveFromMap ( wayPointsIterator.value.objId );
			}
		}
		if ( INVALID_OBJ_ID !== addedRouteObjId ) {
			let route = this.addRoute ( addedRouteObjId );
			let polyline = theTravelNotesData.mapObjects.get ( addedRouteObjId );

			if ( ! theTravelNotesData.travel.readOnly ) {
				window.L.DomEvent.on ( polyline, 'contextmenu', RouteEvents.onContextMenu );
				window.L.DomEvent.on ( polyline, 'mouseover', EditedRouteEvents.onMouseOver );

				let notesIterator = route.notes.iterator;
				while ( ! notesIterator.done ) {
					let layerGroup = theTravelNotesData.mapObjects.get ( notesIterator.value.objId );
					let marker = layerGroup.getLayer ( layerGroup.markerId );
					let bullet = layerGroup.getLayer ( layerGroup.bulletId );
					window.L.DomEvent.on ( bullet, 'dragend', NoteBulletEvents.onDragEnd );
					window.L.DomEvent.on ( bullet, 'drag',	NoteBulletEvents.onDrag );
					window.L.DomEvent.on ( bullet, 'mouseenter', NoteBulletEvents.onMouseEnter );
					window.L.DomEvent.on ( bullet, 'mouseleave', NoteBulletEvents.onMouseLeave );
					window.L.DomEvent.on ( marker, 'contextmenu', NoteMarkerEvents.onContextMenu );
					window.L.DomEvent.on ( marker, 'dragend', NoteMarkerEvents.onDragEnd );
					window.L.DomEvent.on ( marker, 'drag', NoteMarkerEvents.onDrag );
				}
			}

			// waypoints are added
			if ( ! theTravelNotesData.travel.readOnly && ROUTE_EDITION_STATUS.notEdited !== route.editionStatus ) {
				let wayPointsIterator = theTravelNotesData.travel.editedRoute.wayPoints.iterator;
				while ( ! wayPointsIterator.done ) {
					this.addWayPoint (
						wayPointsIterator.value,
						wayPointsIterator .first ? 'A' : ( wayPointsIterator.last ? 'B' : wayPointsIterator.index )
					);
				}
			}
		}
	}

	/**
	This method update the properties of a route on the map
	This method is called by the 'routepropertiesupdated' event listener.
	@param {!number} routeObjId The objId of the route to update
	@listens routepropertiesupdated
	*/

	updateRouteProperties ( routeObjId ) {
		let polyline = theTravelNotesData.mapObjects.get ( routeObjId );
		let route = theDataSearchEngine.getRoute ( routeObjId );
		polyline.setStyle (
			{
				color : route.color,
				weight : route.width,
				dashArray : this.getDashArray ( route )
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
			this.#RemoveFromMap ( removedNoteObjId );
		}
		if ( INVALID_OBJ_ID !== addedNoteObjId ) {
			let noteObjects = this.addNote ( addedNoteObjId );
			if ( isPopupOpen ) {
				noteObjects.marker.openPopup ( );
			}
			if ( ! theTravelNotesData.travel.readOnly ) {
				window.L.DomEvent.on ( noteObjects.bullet, 'dragend', NoteBulletEvents.onDragEnd );
				window.L.DomEvent.on ( noteObjects.bullet, 'drag',	NoteBulletEvents.onDrag );
				window.L.DomEvent.on ( noteObjects.bullet, 'mouseenter',	NoteBulletEvents.onMouseEnter );
				window.L.DomEvent.on ( noteObjects.bullet, 'mouseleave',	NoteBulletEvents.onMouseLeave );
				window.L.DomEvent.on ( noteObjects.marker, 'contextmenu', NoteMarkerEvents.onContextMenu );
				window.L.DomEvent.on ( noteObjects.marker, 'dragend', NoteMarkerEvents.onDragEnd );
				window.L.DomEvent.on ( noteObjects.marker, 'drag', NoteMarkerEvents.onDrag );
			}
		}
	}

	/**
	This method removes an object from the map.
	This method is called by the 'removeobject' event listener
	@param {!number} objId The objId of the object to remove
	@listens removeobject
	*/

	removeObject ( objId ) { this.#RemoveFromMap ( objId ); }

	/**
	This method removes all objects from the map.
	This method is called by the 'removeallobjects' event listener
	@listens removeallobjects
	*/

	removeAllObjects ( ) {
		theTravelNotesData.mapObjects.forEach (
			mapObject => {
				window.L.DomEvent.off ( mapObject );
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

	addWayPoint ( wayPoint, letter ) {
		if ( ( LAT_LNG.defaultValue === wayPoint.lat ) && ( LAT_LNG.defaultValue === wayPoint.lng ) ) {
			return;
		}

		// a HTML element is created, with different class name, depending of the waypont position. See also WayPoints.css
		let iconHtml = '<div class="TravelNotes-Map-WayPoint TravelNotes-Map-WayPoint' +
		( 'A' === letter ? 'Start' : ( 'B' === letter ? 'End' : 'Via' ) ) +
		'"></div><div class="TravelNotes-Map-WayPointText">' + letter + '</div>';

		// a leaflet marker is created...
		let marker = window.L.marker (
			wayPoint.latLng,
			{
				icon : window.L.divIcon (
					{
						iconSize : [ OUR_WAY_POINT_ICON_SIZE, OUR_WAY_POINT_ICON_SIZE ],
						iconAnchor : [
							OUR_WAY_POINT_ICON_SIZE / TWO,
							OUR_WAY_POINT_ICON_SIZE
						],
						html : iconHtml,
						className : 'TravelNotes-Map-WayPointStyle'
					}
				),
				draggable : true
			}
		);

		marker.bindTooltip (
			tooltipWayPoint => theDataSearchEngine.getWayPoint ( tooltipWayPoint.objId ).fullName
		);
		marker.getTooltip ( ).options.offset = [
			OUR_WAY_POINT_ICON_SIZE / TWO,
			-OUR_WAY_POINT_ICON_SIZE / TWO
		];

		window.L.DomEvent.on ( marker, 'contextmenu', WayPointEvents.onContextMenu );

		// ... and added to the map...
		marker.objId = wayPoint.objId;
		this.addToMap ( wayPoint.objId, marker );

		// ... and a dragend event listener is created
		window.L.DomEvent.on ( marker, 'dragend', WayPointEvents.onDragEnd );
	}

	/**
	This method add an itinerary point marker to the map (= a leaflet.circleMarker object).
	This method is called by the 'additinerarypointmarker' event listener.
	@param {!number} objId A unique identifier to attach to the circleMarker
	@param {Array.<number>} latLng The latitude and longitude of the itinerary point marker
	@listens additinerarypointmarker
	*/

	addItineraryPointMarker ( objId, latLng ) {
		this.addToMap (
			objId,
			window.L.circleMarker ( latLng, theConfig.itineraryPoint.marker )
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
			let geometryBounds = theGeometry.getLatLngBounds ( latLngs );
			let mapBounds = theTravelNotesData.map.getBounds ( );
			showGeometry =
				(
					( geometryBounds.getEast ( ) - geometryBounds.getWest ( ) )
					/
					( mapBounds.getEast ( ) - mapBounds.getWest ( ) )
				) > OUR_MARKER_BOUNDS_PRECISION
				&&
				(
					( geometryBounds.getNorth ( ) - geometryBounds.getSouth ( ) )
					/
					( mapBounds.getNorth ( ) - mapBounds.getSouth ( ) )
				) > OUR_MARKER_BOUNDS_PRECISION;
		}
		if ( showGeometry ) {
			this.addToMap ( objId, window.L.polyline ( geometry, theConfig.osmSearch.searchPointPolyline ) );
		}
		else {
			this.addToMap ( objId, window.L.circleMarker ( latLng, theConfig.osmSearch.searchPointMarker ) );
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
		this.addToMap (
			objId,
			window.L.rectangle ( bounds, properties )
		);
	}

	/**
	This method changes the background map.
	This method is called by the 'layerchange' event listener.
	@param {Layer} layer The layer to set
	@listens layerchange
	*/

	setLayer ( layer ) {
		let url = theAPIKeysManager.getUrl ( layer );
		if ( ! url ) {
			return;
		}

		super.setLayer ( layer, url );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@desc The one and only one instance of MapEditor class
@type {MapEditor}
@constant
@global

@------------------------------------------------------------------------------------------------------------------------------
*/

const theMapEditor = new MapEditor ( );

export default theMapEditor;

/*
--- End of MapEditor.js file --------------------------------------------------------------------------------------------------
*/