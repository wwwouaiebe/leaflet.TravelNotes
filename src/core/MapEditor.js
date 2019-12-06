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

export { theMapEditor };

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
import { newRoadbookUpdate } from '../roadbook/RoadbookUpdate.js';
import { newGeometry } from '../util/Geometry.js';
import { theAPIKeysManager } from '../core/APIKeysManager.js';

/*
--- onMouseOverOrMoveOnRoute function -----------------------------------------------------------------------------

Event listener for mouse move and mouse enter on route objects event
This function updates the route tooltip with the distance

-------------------------------------------------------------------------------------------------------------------
*/

function onMouseOverOrMoveOnRoute ( event ) {
	let dataSearchEngine  = newDataSearchEngine ( );
	let route = dataSearchEngine.getRoute (  event.target.objId );
	let distance = newGeometry ( ).getClosestLatLngDistance ( route, [ event.latlng.lat, event.latlng.lng ] ).distance;
	distance += route.chainedDistance;
	distance = newUtilities ( ).formatDistance ( distance );
	let polyline = theTravelNotesData.mapObjects.get ( event.target.objId );
	polyline.closeTooltip ( );
	let tooltipText = dataSearchEngine.getRoute ( event.target.objId ).name;
	if ( ! theTravelNotesData.travel.readOnly ) {
		tooltipText += ( 0 === tooltipText.length ? '' : ' - ' );
		tooltipText += distance;
	}
	polyline.setTooltipContent ( tooltipText );
	polyline.openTooltip (  event.latlng );
}

/*
--- newMapEditor function ---------------------------------------------------------------------------------------------

Patterns : Closure and Singleton

-----------------------------------------------------------------------------------------------------------------------
*/

function newMapEditor ( ) {

	let myDataSearchEngine  = newDataSearchEngine ( );
	let myEventDispatcher = newEventDispatcher ( );
	let myGeometry = newGeometry ( );
	let myCurrentLayer = null;
	let myGeolocationCircle = null;

	/*
	--- myLoadEvents function -----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myLoadEvents ( ) {
		document.addEventListener (
			'removeroute',
			event => {
				if ( event.data ) {
					theMapEditor.removeRoute (
						event.data.route,
						event.data.RemoveNotes,
						event.data.removeWayPoints
					);
				}
			},
			false
		);
		document.addEventListener (
			'addroute',
			event => {
				if ( event.data ) {
					theMapEditor.addRoute (
						event.data.route,
						event.data.addNotes,
						event.data.addWayPoints,
						event.data.readOnly
					);
				}
			},
			false
		);
		document.addEventListener (
			'editroute',
			event => {
				if ( event.data ) {
					theMapEditor.editRoute (
						event.data.route
					);
				}
			},
			false
		);
		document.addEventListener (
			'removeobject',
			event => {
				if ( event.data ) {
					theMapEditor.removeObject (
						event.data.objId
					);
				}
			},
			false
		);
		document.addEventListener ( 'removeallobjects',	( ) => theMapEditor.removeAllObjects ( ), false );
		document.addEventListener (
			'zoomtopoint',
			event => {
				if ( event.data ) {
					theMapEditor.zoomToPoint (
						event.data.latLng
					);
				}
			},
			false
		);
		document.addEventListener (
			'zoomtosearchresult',
			event => {
				if ( event.data ) {
					theMapEditor.zoomToSearchResult (
						event.data.latLng,
						event.data.geometry
					);
				}
			},
			false
		);
		document.addEventListener (
			'zoomtonote',
			event => {
				if ( event.data ) {
					theMapEditor.zoomToNote (
						event.data.noteObjId
					);
				}
			},
			false
		);
		document.addEventListener (
			'zoomtoroute',
			event => {
				if ( event.data ) {
					theMapEditor.zoomToRoute (
						event.data.routeObjId
					);
				}
			},
			false
		);
		document.addEventListener ( 'zoomtotravel',	( ) => theMapEditor.zoomToTravel ( ), false );
		document.addEventListener (
			'additinerarypointmarker',
			event => {
				if ( event.data ) {
					theMapEditor.addItineraryPointMarker (
						event.data.objId,
						event.data.latLng
					);
				}
			},
			false
		);
		document.addEventListener (
			'addsearchpointmarker',
			event => {
				if ( event.data ) {
					theMapEditor.addSearchPointMarker (
						event.data.objId,
						event.data.latLng,
						event.data.geometry
					);
				}
			},
			false
		);
		document.addEventListener (
			'addrectangle',
			event => {
				if ( event.data ) {
					theMapEditor.addRectangle (
						event.data.objId,
						event.data.bounds,
						event.data.properties
					);
				}
			},
			false
		);
		document.addEventListener (
			'addwaypoint',
			event => {
				if ( event.data ) {
					theMapEditor.addWayPoint (
						event.data.wayPoint,
						event.data.letter
					);
				}
			},
			false
		);
		document.addEventListener (
			'redrawnote',
			event => {
				if ( event.data ) {
					theMapEditor.redrawNote (
						event.data.note
					);
				}
			},
			false
		);
		document.addEventListener (
			'addnote',
			event => {
				if ( event.data ) {
					theMapEditor.addNote (
						event.data.note,
						event.data.readOnly
					);
				}
			},
			false
		);
		document.addEventListener (
			'layerchange',
			event => {
				if ( event.data ) {
					theMapEditor.setLayer ( event.data.layer );
				}
			}
		);
		document.addEventListener (
			'geolocationpositionchanged',
			event => {
				if ( event.data ) {
					theMapEditor.onGeolocationPositionChanged ( event.data.position );
				}
			},
			false
		);
		document.addEventListener (
			'geolocationstatuschanged',
			event => {
				if ( event.data ) {
					theMapEditor.onGeolocationStatusChanged ( event.data.status );
				}
			},
			false
		);
	}

	/*
	--- mySetLayer function -------------------------------------------------------------------------------------------

	This function add a leaflet object to the leaflet map and to the JavaScript map

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

		if ( theTravelNotesData.map.getZoom ( ) < ( layer.minZoom || 0 ) ) {
			theTravelNotesData.map.setZoom ( layer.minZoom || 0 );
		}
		theTravelNotesData.map.setMinZoom ( layer.minZoom || 0 );
		if ( theTravelNotesData.map.getZoom ( ) > ( layer.maxZoom || 18 ) ) {
			theTravelNotesData.map.setZoom ( layer.maxZoom || 18 );
		}
		theTravelNotesData.map.setMaxZoom ( layer.maxZoom || 18 );
		if ( layer.bounds ) {
			if (
				! theTravelNotesData.map.getBounds ( ).intersects ( layer.bounds )
				||
				theTravelNotesData.map.getBounds ( ).contains ( layer.bounds )
			) {
				theTravelNotesData.map.setMaxBounds ( null );
				theTravelNotesData.map.fitBounds ( layer.bounds );
				theTravelNotesData.map.setZoom ( layer.minZoom || 0 );
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
		let sw = L.latLng ( [ 90, 180 ] );
		let ne = L.latLng ( [ -90, -180 ] );
		latLngs.forEach (
			latLng => {
				sw.lat = Math.min ( sw.lat, latLng [ 0 ] );
				sw.lng = Math.min ( sw.lng, latLng [ 1 ] );
				ne.lat = Math.max ( ne.lat, latLng [ 0 ] );
				ne.lng = Math.max ( ne.lng, latLng [ 1 ] );
			}
		);
		return L.latLngBounds ( sw, ne );
	}

	/*
	--- myGetRouteLatLng function -------------------------------------------------------------------------------------

	This function returns an array of points from a route and the notes linked to the route

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetRouteLatLng ( route ) {
		let latLngs = [];
		route.itinerary.itineraryPoints.forEach ( itineraryPoint => latLngs.push ( itineraryPoint.latLng ) );
		route.notes.forEach (
			note => {
				latLngs.push ( note.latLng );
				latLngs.push ( note.iconLatLng );
			}
		);
		return latLngs;
	}

	/*
	--- myGetDashArray function ---------------------------------------------------------------------------------------

	This function returns the dashArray used for the polyline representation. See also leaflet docs

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetDashArray ( route ) {
		if ( route.dashArray >= theConfig.route.dashChoices.length ) {
			route.dashArray = 0;
		}
		let iDashArray = theConfig.route.dashChoices [ route.dashArray ].iDashArray;
		if ( iDashArray ) {
			let dashArray = '';
			let dashCounter = 0;
			for ( dashCounter = 0; dashCounter < iDashArray.length - 1; dashCounter ++ ) {
				dashArray += ( iDashArray [ dashCounter ] * route.width ) + ',';
			}
			dashArray += iDashArray [ dashCounter ] * route.width;

			return dashArray;
		}
		return null;
	}

	/*
	--- myRemoveRoute function ------------------------------------------------------------------------------------

	This function remove a route and eventually the attached notes and waypoints
	from the leaflet map and the JavaScript map

	parameters:
	- route : a TravelNotes route object.
	- removeNotes : a boolean. Linked notes are removed when true
	- removeWayPoints : a boolean. Linked waypoints are removed when true

	---------------------------------------------------------------------------------------------------------------
	*/

	function myRemoveRoute ( route, removeNotes, removeWayPoints ) {
		myRemoveObject ( route.objId );
		if ( removeNotes ) {
			let notesIterator = route.notes.iterator;
			while ( ! notesIterator.done ) {
				myRemoveObject ( notesIterator.value.objId );
			}
		}
		if ( removeWayPoints ) {
			let wayPointsIterator = route.wayPoints.iterator;
			while ( ! wayPointsIterator.done ) {
				myRemoveObject ( wayPointsIterator.value.objId );
			}
		}
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

	function myAddRoute ( route, addNotes, addWayPoints, readOnly ) {

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
				let route = myDataSearchEngine.getRoute ( layer.objId );
				return newHTMLViewsFactory ( 'TravelNotes-' ).getRouteHTML ( route );
			}
		);

		// left click event
		L.DomEvent.on ( polyline, 'click', event => event.target.openPopup ( event.latlng ) );

		// right click event
		if ( ! readOnly ) {
			L.DomEvent.on (
				polyline,
				'contextmenu',
				event => newRouteContextMenu ( event ).show ( )
			);
		}

		// notes are added
		if ( addNotes ) {
			let notesIterator = route.notes.iterator;
			while ( ! notesIterator.done ) {
				myAddNote ( notesIterator.value, readOnly );
			}
		}

		// waypoints are added
		if ( addWayPoints ) {
			let wayPointsIterator = theTravelNotesData.travel.editedRoute.wayPoints.iterator;
			while ( ! wayPointsIterator.done ) {
				myAddWayPoint (
					wayPointsIterator.value,
					wayPointsIterator .first ? 'A' : ( wayPointsIterator.last ? 'B' :  wayPointsIterator.index )
				);
			}
		}
	}

	/*
	--- myEditRoute function ------------------------------------------------------------------------------------------

	This function changes the color and width of a route

	parameters:
	- route : a TravelNotes route object.

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myEditRoute ( route ) {
		let polyline = theTravelNotesData.mapObjects.get ( route.objId );
		polyline.setStyle ( { color : route.color, weight : route.width, dashArray : myGetDashArray ( route ) } );
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
	--- myZoomToPoint function ----------------------------------------------------------------------------------------

	This function zoom on a given point

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myZoomToPoint ( latLng ) {
		theTravelNotesData.map.setView ( latLng, theConfig.itineraryPointZoom );
	}

	/*
	--- myZoomToSearchResult function ---------------------------------------------------------------------------------

	This function zoom on a search result

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myZoomToSearchResult ( latLng, geometry ) {
		if ( geometry ) {
			let latLngs = [];
			geometry.forEach ( geometryPart => latLngs = latLngs.concat ( geometryPart ) );
			theTravelNotesData.map.fitBounds ( myGetLatLngBounds ( latLngs ) );
		}
		else {
			myZoomToPoint ( latLng );
		}
	}

	/*
	--- myZoomToNote function -----------------------------------------------------------------------------------------

	This function zoom on a note

	parameters:
	- noteObjId : the TravelNotes objId of the desired note

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myZoomToNote ( noteObjId ) {
		myZoomToPoint ( myDataSearchEngine.getNoteAndRoute ( noteObjId ).note.iconLatLng );
	}

	/*
	--- myZoomToRoute function ----------------------------------------------------------------------------------------

	This function zoom on a route

	parameters:
	- routeObjId : the TravelNotes objId of the desired route

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myZoomToRoute ( routeObjId ) {
		let latLngs = myGetRouteLatLng (  myDataSearchEngine.getRoute ( routeObjId ) );
		if ( 0 !== latLngs.length ) {
			theTravelNotesData.map.fitBounds ( myGetLatLngBounds ( latLngs ) );
		}
	}

	/*
	--- myZoomToTravel function ---------------------------------------------------------------------------------------

	This function zoom on the entire travel

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myZoomToTravel ( ) {
		let latLngs = [];
		theTravelNotesData.travel.routes.forEach (
			route => { latLngs = latLngs.concat ( myGetRouteLatLng ( route ) ); }
		);
		latLngs = latLngs.concat ( myGetRouteLatLng ( theTravelNotesData.travel.editedRoute ) );
		theTravelNotesData.travel.notes.forEach (
			note => {
				latLngs.push ( note.latLng );
				latLngs.push ( note.iconLatLng );
			}
		);
		if ( 0 !== latLngs.length ) {
			theTravelNotesData.map.fitBounds ( myGetLatLngBounds ( latLngs ) );
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
				) > 0.01
				&&
				(
					( geometryBounds.getNorth ( ) - geometryBounds.getSouth ( ) )
					/
					( mapBounds.getNorth ( ) - mapBounds.getSouth ( ) )
				) > 0.01;
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
	--- myAddWayPoint function ----------------------------------------------------------------------------------------

	This function add a TravelNotes waypoint object to the leaflet map

	parameters:
	- wayPoint : a TravelNotes waypoint object
	- letter : the letter to be displayed under the waypoint

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddWayPoint ( wayPoint, letter ) {
		if ( ( 0 === wayPoint.lat ) && ( 0 === wayPoint.lng  ) ) {
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
						iconSize : [ 40, 40 ],
						iconAnchor : [ 20, 40 ],
						html : iconHtml,
						className : 'TravelNotes-WayPointStyle'
					}
				),
				draggable : true
			}
		);

		marker.bindTooltip (
			wayPoint => myDataSearchEngine.getWayPoint ( wayPoint.objId ).UIName
		);
		marker.getTooltip ( ).options.offset  = [ 20, -20 ];

		L.DomEvent.on (
			marker,
			'contextmenu',
			event => newWayPointContextMenu ( event ).show ( )
		);

		// ... and added to the map...
		marker.objId = wayPoint.objId;
		myAddTo ( wayPoint.objId, marker );

		// ... and a dragend event listener is created
		L.DomEvent.on (
			marker,
			'dragend',
			event => {
				let wayPoint = theTravelNotesData.travel.editedRoute.wayPoints.getAt ( event.target.objId );
				wayPoint.latLng = [ event.target.getLatLng ( ).lat, event.target.getLatLng ( ).lng ];
				theWayPointEditor.wayPointDragEnd ( event.target.objId );
			}
		);
	}

	/*
	--- myRedrawNote function -----------------------------------------------------------------------------------------

	This function redraw a note object on the leaflet map

	parameters:
	- note : a TravelNotes note object

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myRedrawNote ( note ) {
		myRemoveObject ( note.objId );
		myAddNote ( note );
	}

	/*
	--- myAddNote function --------------------------------------------------------------------------------------------

	This function add a TravelNotes note object to the leaflet map

	parameters:
	- note : a TravelNotes note object
	- readOnly : a boolean. Created objects cannot be edited when true

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddNote ( note, readOnly ) {

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
							theConfig.note.grip.size / 2,
							theConfig.note.grip.size / 2
						],
						html : '<div></div>'
					}
				),
				zIndexOffset : -1000,
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
				event => {

					// the TravelNotes note and route are searched...
					let noteAndRoute = myDataSearchEngine.getNoteAndRoute ( event.target.objId );
					let note = noteAndRoute.note;
					let route = noteAndRoute.route;

					// ... then the layerGroup is searched...
					let layerGroup = theTravelNotesData.mapObjects.get ( event.target.objId );
					if ( null === route ) {

						// the note is not attached to a route, so the coordinates of the note can be directly changed
						note.latLng = [ event.target.getLatLng ( ).lat, event.target.getLatLng ( ).lng ];
						myEventDispatcher.dispatch ( 'updatetravelnotes' );
					}
					else {

						// the note is attached to the route, so we have to find the nearest point on the route
						// and the distance since the start of the route
						let latLngDistance = myGeometry.getClosestLatLngDistance (
							route,
							[ event.target.getLatLng ( ).lat, event.target.getLatLng ( ).lng ]
						);

						// coordinates and distance are changed in the note
						note.latLng = latLngDistance.latLng;
						note.distance = latLngDistance.distance;

						// notes are sorted on the distance
						route.notes.sort (
							( first, second ) => first.distance - second.distance
						);

						// the coordinates of the bullet are adapted
						layerGroup.getLayer ( layerGroup.bulletId ).setLatLng ( latLngDistance.latLng );
						myEventDispatcher.dispatch ( 'updateitinerary' );
					}

					// in all cases, the polyline is updated
					layerGroup.getLayer ( layerGroup.polylineId ).setLatLngs ( [ note.latLng, note.iconLatLng ] );

					// and the HTML page is adapted
					newRoadbookUpdate ( );
				}
			);

			// event listener for the drag event
			L.DomEvent.on (
				bullet,
				'drag',
				event => {
					let note = myDataSearchEngine.getNoteAndRoute ( event.target.objId ).note;
					let layerGroup = theTravelNotesData.mapObjects.get ( event.target.objId );
					layerGroup.getLayer ( layerGroup.polylineId )
						.setLatLngs ( [ [ event.latlng.lat, event.latlng.lng ], note.iconLatLng ] );
				}
			);
		}

		// a second marker is now created. The icon created by the user is used for this marker
		let icon = L.divIcon (
			{
				iconSize : [ note.iconWidth, note.iconHeight ],
				iconAnchor : [ note.iconWidth / 2, note.iconHeight / 2 ],
				popupAnchor : [ 0, -note.iconHeight / 2 ],
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
				let note = myDataSearchEngine.getNoteAndRoute ( layer.objId ).note;
				return newHTMLViewsFactory ( 'TravelNotes-' ).getNoteHTML ( note );
			}
		);

		// ... and also a tooltip
		if ( 0 !== note.tooltipContent.length ) {
			marker.bindTooltip (
				layer => myDataSearchEngine.getNoteAndRoute ( layer.objId ).note.tooltipContent
			);
			marker.getTooltip ( ).options.offset [ 0 ] = note.iconWidth / 2;
		}
		if ( ! readOnly ) {

			// event listener for the contextmenu event
			L.DomEvent.on (
				marker,
				'contextmenu',
				event => newNoteContextMenu ( event ).show ( )
			);

			// event listener for the dragend event
			L.DomEvent.on (
				marker,
				'dragend',
				event => {

					// The TravelNotes note linked to the marker is searched...
					let note = myDataSearchEngine.getNoteAndRoute ( event.target.objId ).note;

					// ... new coordinates are saved in the TravelNotes note...
					note.iconLatLng = [ event.target.getLatLng ( ).lat, event.target.getLatLng ( ).lng ];

					// ... then the layerGroup is searched...
					let layerGroup = theTravelNotesData.mapObjects.get ( event.target.objId );

					// ... and finally the polyline is updated with the new coordinates
					layerGroup.getLayer ( layerGroup.polylineId ).setLatLngs ( [ note.latLng, note.iconLatLng ] );
				}
			);

			// event listener for the drag event
			L.DomEvent.on (
				marker,
				'drag',
				event => {

					// The TravelNotes note linked to the marker is searched...
					let note = myDataSearchEngine.getNoteAndRoute ( event.target.objId ).note;

					// ... then the layerGroup is searched...
					let layerGroup = theTravelNotesData.mapObjects.get ( event.target.objId );

					// ... and finally the polyline is updated with the new coordinates
					layerGroup.getLayer ( layerGroup.polylineId )
						.setLatLngs ( [ note.latLng, [ event.latlng.lat, event.latlng.lng ] ] );
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
	--- myOnGeolocationStatusChanged function -----------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnGeolocationStatusChanged ( status ) {
		if ( 2 === status ) {
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
	--- MapEditor object ----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{

			removeRoute : ( route, removeNotes, removeWayPoints ) => myRemoveRoute ( route, removeNotes, removeWayPoints ),

			addRoute : ( route, addNotes, addWayPoints, readOnly ) => myAddRoute ( route, addNotes, addWayPoints, readOnly ),

			editRoute : route => myEditRoute ( route ),

			removeObject : objId => myRemoveObject ( objId ),

			removeAllObjects : ( ) => myRemoveAllObjects ( ),

			zoomToPoint : latLng => myZoomToPoint ( latLng ),

			zoomToSearchResult : ( latLng, geometry ) => myZoomToSearchResult ( latLng, geometry ),

			zoomToNote : noteObjId => myZoomToNote ( noteObjId ),

			zoomToRoute : routeObjId => myZoomToRoute ( routeObjId ),

			zoomToTravel : ( ) => myZoomToTravel ( ),

			addItineraryPointMarker : ( objId, latLng ) => myAddItineraryPointMarker ( objId, latLng ),

			addSearchPointMarker : ( objId, latLng, geometry ) => myAddSearchPointMarker ( objId, latLng, geometry ),

			addRectangle : ( objId, bounds, properties ) => myAddRectangle ( objId, bounds, properties ),

			addWayPoint : ( wayPoint, letter ) => myAddWayPoint  ( wayPoint, letter ),

			redrawNote : note => myRedrawNote ( note ),

			addNote : ( note, readOnly ) => myAddNote ( note, readOnly ),

			loadEvents : ( ) => myLoadEvents ( ),

			setLayer : layer => mySetLayer ( layer ),

			onGeolocationStatusChanged : status => myOnGeolocationStatusChanged ( status ),

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

/*
--- End of MapEditor.js file ------------------------------------------------------------------------------------------
*/