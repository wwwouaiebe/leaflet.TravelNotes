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
	- v1.8.0:
		- issue #97 : Improve adding a new waypoint to a route
	- v1.12.0:
		- Issue #120 : Review the UserInterface
Doc reviewed 20191121
Tests ...

-----------------------------------------------------------------------------------------------------------------------
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

const WAY_POINT_ICON_SIZE = 40;

let ourWayPointMarker = null;
let ourWayPointInitialLatLng = null;
let ourShowDragTooltip = 1;

/*
--- onDragEndWayPointMarker function ---------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function onDragEndWayPointMarker ( dragEndEvent ) {
	theWayPointEditor.addWayPointOnRoute (
		ourWayPointInitialLatLng,
		[ dragEndEvent.target.getLatLng ( ).lat, dragEndEvent.target.getLatLng ( ).lng ]
	);
	if ( ourWayPointMarker ) {
		L.DomEvent.off ( ourWayPointMarker );
		theTravelNotesData.map.removeLayer ( ourWayPointMarker );
		ourWayPointMarker = null;
	}
}

/*
--- onMouseOutWayPointMarker function ---------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function onMouseOutWayPointMarker ( ) {
	if ( ourWayPointMarker ) {
		L.DomEvent.off ( ourWayPointMarker );
		theTravelNotesData.map.removeLayer ( ourWayPointMarker );
		ourWayPointMarker = null;
	}
}

/*
--- onContextMenuWayPointMarker function ---------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function onContextMenuWayPointMarker ( contextMenuEvent ) {
	contextMenuEvent.latlng.lat = ourWayPointInitialLatLng [ ZERO ];
	contextMenuEvent.latlng.lng = ourWayPointInitialLatLng [ ONE ];
	contextMenuEvent.target.objId = theTravelNotesData.travel.editedRoute.objId;
	newRouteContextMenu ( contextMenuEvent ).show ( );
}

/*
--- onMouseOverEditedRoute function -----------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function onMouseOverEditedRoute ( mapEvent ) {
	let route = theDataSearchEngine.getRoute ( mapEvent.target.objId );
	if ( ROUTE_EDITION_STATUS.notEdited !== route.editionStatus ) {
		ourWayPointInitialLatLng = [ mapEvent.latlng.lat, mapEvent.latlng.lng ];
		if ( ourWayPointMarker ) {
			ourWayPointMarker.setLatLng ( mapEvent.latlng );
		}
		else {

			// a HTML element is created, with different class name, depending of the waypont position. See also WayPoints.css
			let iconHtml = '<div class="TravelNotes-WayPoint TravelNotes-WayPointTmp' +
			'"></div><div class="TravelNotes-WayPointText">?</div>';

			// a leaflet marker is created...
			ourWayPointMarker = L.marker (
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
			if ( NOT_FOUND === theConfig.route.showDragTooltip || ourShowDragTooltip <= theConfig.route.showDragTooltip ) {
				ourShowDragTooltip ++;
				ourWayPointMarker.bindTooltip (	theTranslator.getText ( 'MapEditor - Drag and drop to add a waypoint' ) );
				ourWayPointMarker.getTooltip ( ).options.offset = [	ZERO, ZERO ];

			}
			ourWayPointMarker.addTo ( theTravelNotesData.map );
			ourWayPointMarker.on ( 'mouseout', onMouseOutWayPointMarker );
			ourWayPointMarker.on ( 'dragstart', ( ) => ourWayPointMarker.off ( 'mouseout', onMouseOutWayPointMarker ) );
			ourWayPointMarker.on ( 'dragend', onDragEndWayPointMarker );
			ourWayPointMarker.on ( 'contextmenu', onContextMenuWayPointMarker );
		}
	}
}

/*
--- newMapEditor function ---------------------------------------------------------------------------------------------

Patterns : Closure and Singleton

-----------------------------------------------------------------------------------------------------------------------
*/

function newMapEditor ( ) {

	const MARKER_BOUNDS_PRECISION = 0.01;

	let myEventDispatcher = newEventDispatcher ( );
	let myGeometry = newGeometry ( );

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
	--- myRemoveRoute function ------------------------------------------------------------------------------------

	---------------------------------------------------------------------------------------------------------------
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

	/*
	--- myAddNoteEvents function --------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddNoteEvents ( noteObjId, noteObjects ) {

		// event listener for the dragend event
		L.DomEvent.on (
			noteObjects.bullet,
			'dragend',
			dragEndEvent => {

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
		);

		// event listener for the drag event
		L.DomEvent.on (
			noteObjects.bullet,
			'drag',
			dragEvent => {
				let draggedNote = theDataSearchEngine.getNoteAndRoute ( dragEvent.target.objId ).note;
				let draggedLayerGroup = theTravelNotesData.mapObjects.get ( dragEvent.target.objId );
				draggedLayerGroup.getLayer ( draggedLayerGroup.polylineId )
					.setLatLngs ( [ [ dragEvent.latlng.lat, dragEvent.latlng.lng ], draggedNote.iconLatLng ] );
			}
		);

		// event listener for the contextmenu event
		L.DomEvent.on (
			noteObjects.marker,
			'contextmenu',
			contextMenuEvent => newNoteContextMenu ( contextMenuEvent ).show ( )
		);

		// event listener for the dragend event
		L.DomEvent.on (
			noteObjects.marker,
			'dragend',
			dragEndEvent => {

				// The TravelNotes note linked to the marker is searched...
				let draggedNote = theDataSearchEngine.getNoteAndRoute ( dragEndEvent.target.objId ).note;

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
			noteObjects.marker,
			'drag',
			dragEvent => {

				// The TravelNotes note linked to the marker is searched...
				let draggedNote = theDataSearchEngine.getNoteAndRoute ( dragEvent.target.objId ).note;

				// ... then the layerGroup is searched...
				let draggedLayerGroup = theTravelNotesData.mapObjects.get ( dragEvent.target.objId );

				// ... and finally the polyline is updated with the new coordinates
				draggedLayerGroup.getLayer ( draggedLayerGroup.polylineId )
					.setLatLngs ( [ draggedNote.latLng, [ dragEvent.latlng.lat, dragEvent.latlng.lng ] ] );
			}
		);
	}

	/*
	--- myAddNote function --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddNote ( noteObjId, isPopupOpen ) {

		let noteObjects = theViewerMapEditor.addNote ( noteObjId );
		if ( isPopupOpen ) {
			noteObjects.marker.openPopup ( );
		}

		if ( ! theTravelNotesData.travel.readOnly ) {
			myAddNoteEvents ( noteObjId, noteObjects );
		}
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

		let route = theViewerMapEditor.addRoute ( routeObjId );

		let polyline = theTravelNotesData.mapObjects.get ( routeObjId );

		// right click events
		if ( ! theTravelNotesData.travel.readOnly ) {
			L.DomEvent.on (
				polyline,
				'contextmenu',
				contextMenuEvent => newRouteContextMenu ( contextMenuEvent ).show ( )
			);
			polyline.on ( 'mouseover', onMouseOverEditedRoute );

			let notesIterator = route.notes.iterator;
			while ( ! notesIterator.done ) {
				let layerGroup = theTravelNotesData.mapObjects.get ( notesIterator.value.objId );
				myAddNoteEvents (
					notesIterator.value.objId,
					{
						marker : layerGroup.getLayer ( layerGroup.markerId ),
						polyline : layerGroup.getLayer ( layerGroup.polylineId ),
						bullet : layerGroup.getLayer ( layerGroup.bulletId )
					}
				);
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
	--- myUpdateRoute function ----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myUpdateRoute ( removedRouteObjId, addedRouteObjId ) {
		if ( INVALID_OBJ_ID !== removedRouteObjId ) {
			myRemoveRoute ( removedRouteObjId );
		}
		if ( INVALID_OBJ_ID !== addedRouteObjId ) {
			myAddRoute ( addedRouteObjId );
		}
	}

	/*
	--- myUpdateRouteProperties function ------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myUpdateRouteProperties ( routeObjId ) {
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

	/*
	--- myUpdateNote function -----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myUpdateNote ( removedNoteObjId, addedNoteObjId ) {
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
		layer.url = url;

		theViewerMapEditor.setLayer ( layer );
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

			addItineraryPointMarker : ( objId, latLng ) => myAddItineraryPointMarker ( objId, latLng ),

			addSearchPointMarker : ( objId, latLng, geometry ) => myAddSearchPointMarker ( objId, latLng, geometry ),

			addRectangle : ( objId, bounds, properties ) => myAddRectangle ( objId, bounds, properties ),

			addWayPoint : ( wayPoint, letter ) => myAddWayPoint ( wayPoint, letter ),

			setLayer : layer => mySetLayer ( layer )

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