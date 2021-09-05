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
Doc reviewed 20210901
Tests 20210902
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

@module coreMapEditor

@------------------------------------------------------------------------------------------------------------------------------
*/

import theConfig from '../data/Config.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import theDataSearchEngine from '../data/DataSearchEngine.js';
import theGeometry from '../coreLib/Geometry.js';
import theAPIKeysManager from '../core/APIKeysManager.js';
import MapEditorViewer from '../coreMapEditor/MapEditorViewer.js';
import EditedRouteMouseOverEL from '../coreMapEditor/EditedRouteEventListeners.js';
import {
	NoteBulletDragEndEL,
	NoteBulletDragEL,
	NoteBulletMouseEnterEL,
	NoteBulletMouseLeaveEL
} from '../coreMapEditor/NoteBulletEventListeners.js';
import {
	NoteMarkerContextMenuEL,
	NoteMarkerDragEndEL,
	NoteMarkerDragEL
} from '../coreMapEditor/NoteMarkerEventListeners.js';
import { WayPointContextMenuEL, WayPointDragEndEL } from '../coreMapEditor/WayPointEventListeners.js';
import { RouteContextMenuEL } from '../coreMapEditor/RouteEventListeners.js';
import { ROUTE_EDITION_STATUS, LAT_LNG, INVALID_OBJ_ID, TWO, WAY_POINT_ICON_SIZE } from '../main/Constants.js';

const OUR_MARKER_BOUNDS_PRECISION = 0.01;

/**
@------------------------------------------------------------------------------------------------------------------------------

@class MapEditor
@classdesc This class performs all the read/write updates on the map
@extends MapEditorViewer
@inheritdoc
@see {@link theMapEditor} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class MapEditor	extends MapEditorViewer {

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

	/*
	constructor
	*/

	constructor ( ) {
		super ( );
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
				window.L.DomEvent.on ( polyline, 'contextmenu', RouteContextMenuEL.handleEvent );
				window.L.DomEvent.on ( polyline, 'mouseover', EditedRouteMouseOverEL.handleEvent );

				let notesIterator = route.notes.iterator;
				while ( ! notesIterator.done ) {
					let layerGroup = theTravelNotesData.mapObjects.get ( notesIterator.value.objId );
					let marker = layerGroup.getLayer ( layerGroup.markerId );
					let bullet = layerGroup.getLayer ( layerGroup.bulletId );
					window.L.DomEvent.on ( bullet, 'dragend', NoteBulletDragEndEL.handleEvent );
					window.L.DomEvent.on ( bullet, 'drag',	NoteBulletDragEL.handleEvent );
					window.L.DomEvent.on ( bullet, 'mouseenter', NoteBulletMouseEnterEL.handleEvent );
					window.L.DomEvent.on ( bullet, 'mouseleave', NoteBulletMouseLeaveEL.handleEvent );
					window.L.DomEvent.on ( marker, 'contextmenu', NoteMarkerContextMenuEL.handleEvent );
					window.L.DomEvent.on ( marker, 'dragend', NoteMarkerDragEndEL.handleEvent );
					window.L.DomEvent.on ( marker, 'drag', NoteMarkerDragEL.handleEvent );
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
				window.L.DomEvent.on ( noteObjects.bullet, 'dragend', NoteBulletDragEndEL.handleEvent );
				window.L.DomEvent.on ( noteObjects.bullet, 'drag',	NoteBulletDragEL.handleEvent );
				window.L.DomEvent.on ( noteObjects.bullet, 'mouseenter',	NoteBulletMouseEnterEL.handleEvent );
				window.L.DomEvent.on ( noteObjects.bullet, 'mouseleave',	NoteBulletMouseLeaveEL.handleEvent );
				window.L.DomEvent.on ( noteObjects.marker, 'contextmenu', NoteMarkerContextMenuEL.handleEvent );
				window.L.DomEvent.on ( noteObjects.marker, 'dragend', NoteMarkerDragEndEL.handleEvent );
				window.L.DomEvent.on ( noteObjects.marker, 'drag', NoteMarkerDragEL.handleEvent );
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
						iconSize : [ WAY_POINT_ICON_SIZE, WAY_POINT_ICON_SIZE ],
						iconAnchor : [
							WAY_POINT_ICON_SIZE / TWO,
							WAY_POINT_ICON_SIZE
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
			WAY_POINT_ICON_SIZE / TWO,
			-WAY_POINT_ICON_SIZE / TWO
		];

		window.L.DomEvent.on ( marker, 'contextmenu', WayPointContextMenuEL.handleEvent );

		// ... and added to the map...
		marker.objId = wayPoint.objId;
		this.addToMap ( wayPoint.objId, marker );

		// ... and a dragend event listener is created
		window.L.DomEvent.on ( marker, 'dragend', WayPointDragEndEL.handleEvent );
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