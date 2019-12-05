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
	- the g_MapEditor object
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

export { g_MapEditor };

import { g_Config } from '../data/Config.js';
import { g_TravelNotesData } from '../data/TravelNotesData.js';
import { g_WayPointEditor } from '../core/WayPointEditor.js';
import { newDataSearchEngine } from '../data/DataSearchEngine.js';
import { newRouteContextMenu } from '../contextMenus/RouteContextMenu.js';
import { newNoteContextMenu } from '../contextMenus/NoteContextMenu.js';
import { newWayPointContextMenu } from '../contextMenus/WayPointContextMenu.js';
import { newUtilities } from '../util/Utilities.js';
import { newHTMLViewsFactory } from '../UI/HTMLViewsFactory.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';
import { newRoadbookUpdate } from '../roadbook/RoadbookUpdate.js';
import { newGeometry } from '../util/Geometry.js';
import { g_APIKeysManager } from '../core/APIKeysManager.js';

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
	let polyline = g_TravelNotesData.mapObjects.get ( event.target.objId );
	polyline.closeTooltip ( );
	let tooltipText = dataSearchEngine.getRoute ( event.target.objId ).name;
	if ( ! g_TravelNotesData.travel.readOnly ) {
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

	let m_DataSearchEngine  = newDataSearchEngine ( );
	let m_EventDispatcher = newEventDispatcher ( );
	let m_Geometry = newGeometry ( );
	let m_CurrentLayer = null;
	let m_GeolocationCircle = null;

	/*
	--- m_loadEvents function -----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_loadEvents ( ) {
		document.addEventListener (
			'removeroute',
			event => {
				if ( event.data ) {
					g_MapEditor.removeRoute (
						event.data.route,
						event.data.RemoveNotes,
						event.data.removeWayPoints
					)
				}
			},
			false
		);
		document.addEventListener (
			'addroute',
			event => {
				if ( event.data ) {
					g_MapEditor.addRoute (
						event.data.route,
						event.data.addNotes,
						event.data.addWayPoints,
						event.data.readOnly
					)
				}
			},
			false
		);
		document.addEventListener (
			'editroute',
			event => {
				if ( event.data ) {
					g_MapEditor.editRoute (
						event.data.route
					)
				}
			},
			false
		);
		document.addEventListener (
			'removeobject',
			event => {
				if ( event.data ) {
					g_MapEditor.removeObject (
						event.data.objId
					)
				}
			},
			false
		);
		document.addEventListener ( 'removeallobjects',	( ) => g_MapEditor.removeAllObjects ( ), false );
		document.addEventListener (
			'zoomtopoint',
			event => {
				if ( event.data ) {
					g_MapEditor.zoomToPoint (
						event.data.latLng
					)
				}
			},
			false
		);
		document.addEventListener (
			'zoomtosearchresult',
			event => {
				if ( event.data ) {
					g_MapEditor.zoomToSearchResult (
						event.data.latLng,
						event.data.geometry
					)
				}
			},
			false
		);
		document.addEventListener (
			'zoomtonote',
			event => {
				if ( event.data ) {
					g_MapEditor.zoomToNote (
						event.data.noteObjId
					)
				}
			},
			false
		);
		document.addEventListener (
			'zoomtoroute',
			event => {
				if ( event.data ) {
					g_MapEditor.zoomToRoute (
						event.data.routeObjId
					)
				}
			},
			false
		);
		document.addEventListener ( 'zoomtotravel',	( ) => g_MapEditor.zoomToTravel ( ), false );
		document.addEventListener (
			'additinerarypointmarker',
			event => {
				if ( event.data ) {
					g_MapEditor.addItineraryPointMarker (
						event.data.objId,
						event.data.latLng
					)
				}
			},
			false
		);
		document.addEventListener (
			'addsearchpointmarker',
			event => {
				if ( event.data ) {
					g_MapEditor.addSearchPointMarker (
						event.data.objId,
						event.data.latLng,
						event.data.geometry
					)
				}
			},
			false
		);
		document.addEventListener (
			'addrectangle',
			event => {
				if ( event.data ) {
					g_MapEditor.addRectangle (
						event.data.objId,
						event.data.bounds,
						event.data.properties
					)
				}
			},
			false
		);
		document.addEventListener (
			'addwaypoint',
			event => {
				if ( event.data ) {
					g_MapEditor.addWayPoint (
						event.data.wayPoint,
						event.data.letter
					)
				}
			},
			false
		);
		document.addEventListener (
			'redrawnote',
			event => {
				if ( event.data ) {
					g_MapEditor.redrawNote (
						event.data.note
					)
				}
			},
			false
		);
		document.addEventListener (
			'addnote',
			event => {
				if ( event.data ) {
					g_MapEditor.addNote (
						event.data.note,
						event.data.readOnly
					)
				}
			},
			false
		);
		document.addEventListener (
			'layerchange',
			event => {
				if ( event.data ) {
					g_MapEditor.setLayer ( event.data.layer );
				}
			}
		);
		document.addEventListener (
			'geolocationpositionchanged',
			event => {
				if ( event.data ) {
					g_MapEditor.onGeolocationPositionChanged ( event.data.position );
				}
			},
			false
		)
		document.addEventListener (
			'geolocationstatuschanged',
			event => {
				if ( event.data ) {
					g_MapEditor.onGeolocationStatusChanged ( event.data.status );
				}
			},
			false
		)
	}

	/*
	--- m_SetLayer function -------------------------------------------------------------------------------------------

	This function add a leaflet object to the leaflet map and to the JavaScript map

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_SetLayer ( layer ) {

		let url = layer.url;
		if ( layer.providerKeyNeeded ) {
			let providerKey = g_APIKeysManager.getKey ( layer.providerName.toLowerCase ( ) );
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

		if ( m_CurrentLayer ) {
			g_TravelNotesData.map.removeLayer ( m_CurrentLayer );
		}
		g_TravelNotesData.map.addLayer ( leafletLayer );
		m_CurrentLayer = leafletLayer;

		if ( g_TravelNotesData.map.getZoom ( ) < ( layer.minZoom || 0 ) ) {
			g_TravelNotesData.map.setZoom ( layer.minZoom || 0 )
		}
		g_TravelNotesData.map.setMinZoom ( layer.minZoom || 0 );
		if ( g_TravelNotesData.map.getZoom ( ) > ( layer.maxZoom || 18 ) ) {
			g_TravelNotesData.map.setZoom ( layer.maxZoom || 18 )
		}
		g_TravelNotesData.map.setMaxZoom ( layer.maxZoom || 18 );
		if ( layer.bounds ) {
			if (
				! g_TravelNotesData.map.getBounds ( ).intersects ( layer.bounds )
				||
				g_TravelNotesData.map.getBounds ( ).contains ( layer.bounds )
			) {
				g_TravelNotesData.map.setMaxBounds ( null );
				g_TravelNotesData.map.fitBounds ( layer.bounds );
				g_TravelNotesData.map.setZoom ( layer.minZoom || 0 );
			}
			g_TravelNotesData.map.setMaxBounds ( layer.bounds );
		}
		else {
			g_TravelNotesData.map.setMaxBounds ( null );
		}
		g_TravelNotesData.map.fire ( 'baselayerchange', leafletLayer );
	}

	/*
	--- m_AddTo function ----------------------------------------------------------------------------------------------

	This function add a leaflet object to the leaflet map and to the JavaScript map

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_AddTo ( objId, object ) {
		object.objId = objId;
		object.addTo ( g_TravelNotesData.map );
		g_TravelNotesData.mapObjects.set ( objId, object );
	}

	/*
	--- m_RemoveObject function ---------------------------------------------------------------------------------------

	This function remove a leaflet object from the leaflet map and from the JavaScript map

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_RemoveObject ( objId ) {
		let layer = g_TravelNotesData.mapObjects.get ( objId );
		if ( layer ) {
			L.DomEvent.off ( layer );
			g_TravelNotesData.map.removeLayer ( layer );
			g_TravelNotesData.mapObjects.delete ( objId );
		}
	}

	/*
	--- m_GetLatLngBounds function ------------------------------------------------------------------------------------

	This function build a L.latLngBounds object from an array of points

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_GetLatLngBounds ( latLngs ) {
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
	--- m_GetRouteLatLng function -------------------------------------------------------------------------------------

	This function returns an array of points from a route and the notes linked to the route

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_GetRouteLatLng ( route ) {
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
	--- m_getDashArray function ---------------------------------------------------------------------------------------

	This function returns the dashArray used for the polyline representation. See also leaflet docs

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_getDashArray ( route ) {
		if ( route.dashArray >= g_Config.route.dashChoices.length ) {
			route.dashArray = 0;
		}
		let iDashArray = g_Config.route.dashChoices [ route.dashArray ].iDashArray;
		if ( iDashArray ) {
			let dashArray = '';
			let dashCounter = 0;
			for ( dashCounter = 0; dashCounter < iDashArray.length - 1; dashCounter ++ ) {
				dashArray += ( iDashArray [ dashCounter ] * route.width ) + ',';
			}
			dashArray += iDashArray [ dashCounter ] * route.width ;

			return dashArray;
		}
		return null;
	}

	/*
	--- m_RemoveRoute function ------------------------------------------------------------------------------------

	This function remove a route and eventually the attached notes and waypoints
	from the leaflet map and the JavaScript map

	parameters:
	- route : a TravelNotes route object.
	- removeNotes : a boolean. Linked notes are removed when true
	- removeWayPoints : a boolean. Linked waypoints are removed when true

	---------------------------------------------------------------------------------------------------------------
	*/

	function m_RemoveRoute ( route, removeNotes, removeWayPoints ) {
		m_RemoveObject ( route.objId );
		if ( removeNotes ) {
			let notesIterator = route.notes.iterator;
			while ( ! notesIterator.done ) {
				m_RemoveObject ( notesIterator.value.objId );
			}
		}
		if ( removeWayPoints ) {
			let wayPointsIterator = route.wayPoints.iterator;
			while ( ! wayPointsIterator.done ) {
				m_RemoveObject ( wayPointsIterator.value.objId );
			}
		}
	}

	/*
	--- m_AddRoute function ---------------------------------------------------------------------------------------

	This function add a route and eventually the attached notes and waypoints
	to the leaflet map and the JavaScript map

	parameters:
	- route : a TravelNotes route object.
	- addNotes : a boolean. Attached notes are added when true
	- addWayPoints : a boolean. Attached waypoints are added when true
	- readOnly : a boolean. Created objects cannot be edited when true.

	---------------------------------------------------------------------------------------------------------------
	*/

	function m_AddRoute ( route, addNotes, addWayPoints, readOnly ) {

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
				dashArray : m_getDashArray ( route )
			}
		);
		m_AddTo ( route.objId, polyline );

		// tooltip and popup are created
		polyline.bindTooltip (
			route.name,
			{ sticky : true, direction : 'right' }
		);
		polyline.on ( 'mouseover', onMouseOverOrMoveOnRoute );
		polyline.on ( 'mousemove', onMouseOverOrMoveOnRoute );

		polyline.bindPopup (
			layer => {
				let route = m_DataSearchEngine.getRoute ( layer.objId );
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
				m_AddNote ( notesIterator.value, readOnly );
			}
		}

		// waypoints are added
		if ( addWayPoints ) {
			let wayPointsIterator = g_TravelNotesData.travel.editedRoute.wayPoints.iterator;
			while ( ! wayPointsIterator.done ) {
				m_AddWayPoint (
					wayPointsIterator.value,
					wayPointsIterator .first ? 'A' : ( wayPointsIterator.last ? 'B' :  wayPointsIterator.index )
				);
			}
		}
	}

	/*
	--- m_EditRoute function ------------------------------------------------------------------------------------------

	This function changes the color and width of a route

	parameters:
	- route : a TravelNotes route object.

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_EditRoute ( route ) {
		let polyline = g_TravelNotesData.mapObjects.get ( route.objId );
		polyline.setStyle ( { color : route.color, weight : route.width, dashArray : m_getDashArray ( route ) } );
	}

	/*
	--- m_RemoveAllObjects function -----------------------------------------------------------------------------------

	This function remove all the objects from the leaflet map and from the JavaScript map

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_RemoveAllObjects ( ) {
		g_TravelNotesData.mapObjects.forEach (
			travelObjectValue => {
				L.DomEvent.off ( travelObjectValue );
				g_TravelNotesData.map.removeLayer ( travelObjectValue );
			}
		);
		g_TravelNotesData.mapObjects.clear ( );
	}

	/*
	--- m_ZoomToPoint function ----------------------------------------------------------------------------------------

	This function zoom on a given point

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_ZoomToPoint ( latLng ) {
		g_TravelNotesData.map.setView ( latLng, g_Config.itineraryPointZoom );
	}

	/*
	--- m_ZoomToSearchResult function ---------------------------------------------------------------------------------

	This function zoom on a search result

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_ZoomToSearchResult ( latLng, geometry ) {
		if ( geometry ) {
			let latLngs = [];
			geometry.forEach ( geometryPart => latLngs = latLngs.concat ( geometryPart ) );
			g_TravelNotesData.map.fitBounds ( m_GetLatLngBounds ( latLngs ) );
		}
		else {
			m_ZoomToPoint ( latLng );
		}
	}

	/*
	--- m_ZoomToNote function -----------------------------------------------------------------------------------------

	This function zoom on a note

	parameters:
	- noteObjId : the TravelNotes objId of the desired note

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_ZoomToNote ( noteObjId ) {
		m_ZoomToPoint ( m_DataSearchEngine.getNoteAndRoute ( noteObjId ).note.iconLatLng );
	}

	/*
	--- m_ZoomToRoute function ----------------------------------------------------------------------------------------

	This function zoom on a route

	parameters:
	- routeObjId : the TravelNotes objId of the desired route

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_ZoomToRoute ( routeObjId ) {
		let latLngs = m_GetRouteLatLng (  m_DataSearchEngine.getRoute ( routeObjId ) );
		if ( 0 !== latLngs.length ) {
			g_TravelNotesData.map.fitBounds ( m_GetLatLngBounds ( latLngs ) );
		}
	}

	/*
	--- m_ZoomToTravel function ---------------------------------------------------------------------------------------

	This function zoom on the entire travel

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_ZoomToTravel ( ) {
		let latLngs = [];
		g_TravelNotesData.travel.routes.forEach (
			route => { latLngs = latLngs.concat ( m_GetRouteLatLng ( route ) ); }
		);
		latLngs = latLngs.concat ( m_GetRouteLatLng ( g_TravelNotesData.travel.editedRoute ) );
		g_TravelNotesData.travel.notes.forEach (
			note => {
				latLngs.push ( note.latLng );
				latLngs.push ( note.iconLatLng );
			}
		);
		if ( 0 !== latLngs.length ) {
			g_TravelNotesData.map.fitBounds ( m_GetLatLngBounds ( latLngs ) );
		}
	}

	/*
	--- m_AddItineraryPointMarker function ----------------------------------------------------------------------------

	This function add a leaflet circleMarker at a given point

	parameters:
	- objId : a unique identifier to attach to the circleMarker
	- latLng : the center of the circleMarker

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_AddItineraryPointMarker ( objId, latLng ) {
		m_AddTo (
			objId,
			L.circleMarker ( latLng, g_Config.itineraryPointMarker )
		);
	}

	/*
	--- m_AddSearchPointMarker function -------------------------------------------------------------------------------

	This function add a leaflet circleMarker at a given point

	parameters:
	- objId : a unique identifier to attach to the circleMarker
	- latLng : the center of the circleMarker

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_AddSearchPointMarker ( objId, latLng, geometry ) {

		let showGeometry = false;
		if ( geometry ) {
			let latLngs = [];
			geometry.forEach (
				geometryPart => { latLngs = latLngs.concat ( geometryPart ); }
			);
			let geometryBounds = m_GetLatLngBounds ( latLngs );
			let mapBounds = g_TravelNotesData.map.getBounds ( );
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
			m_AddTo ( objId, L.polyline ( geometry, g_Config.searchPointPolyline ) );
		}
		else {
			m_AddTo ( objId, L.circleMarker ( latLng, g_Config.searchPointMarker ) );
		}
	}

	/*
	--- m_AddRectangle method -----------------------------------------------------------------------------------------

	This method draw a rectangle on the map

	parameters:
	- objId : a unique identifier to attach to the rectangle
	- bounds : the lower left and upper right corner of the rectangle ( see leaflet docs )
	- properties : the properties of the rectangle

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_AddRectangle ( objId, bounds, properties ) {
		m_AddTo (
			objId,
			L.rectangle ( bounds, properties )
		);
	}

	/*
	--- m_AddWayPoint function ----------------------------------------------------------------------------------------

	This function add a TravelNotes waypoint object to the leaflet map

	parameters:
	- wayPoint : a TravelNotes waypoint object
	- letter : the letter to be displayed under the waypoint

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_AddWayPoint ( wayPoint, letter ) {
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
			wayPoint => { return m_DataSearchEngine.getWayPoint ( wayPoint.objId ).UIName; }
		);
		marker.getTooltip ( ).options.offset  = [ 20, -20 ];

		L.DomEvent.on (
			marker,
			'contextmenu',
			event => newWayPointContextMenu ( event ).show ( )
		);

		// ... and added to the map...
		marker.objId = wayPoint.objId;
		m_AddTo ( wayPoint.objId, marker );

		// ... and a dragend event listener is created
		L.DomEvent.on (
			marker,
			'dragend',
			event => {
				let wayPoint = g_TravelNotesData.travel.editedRoute.wayPoints.getAt ( event.target.objId );
				wayPoint.latLng = [ event.target.getLatLng ( ).lat, event.target.getLatLng ( ).lng ];
				g_WayPointEditor.wayPointDragEnd ( event.target.objId );
			}
		);
	}

	/*
	--- m_RedrawNote function -----------------------------------------------------------------------------------------

	This function redraw a note object on the leaflet map

	parameters:
	- note : a TravelNotes note object

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_RedrawNote ( note ) {
		m_RemoveObject ( note.objId );
		m_AddNote ( note );
	}

	/*
	--- m_AddNote function --------------------------------------------------------------------------------------------

	This function add a TravelNotes note object to the leaflet map

	parameters:
	- note : a TravelNotes note object
	- readOnly : a boolean. Created objects cannot be edited when true

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_AddNote ( note, readOnly ) {

		// first a marker is created at the note position. This marker is empty and transparent, so
		// not visible on the map but the marker can be dragged
		let bullet = L.marker (
			note.latLng,
			{
				icon : L.divIcon (
					{
						iconSize : [
							g_Config.note.grip.size,
							g_Config.note.grip.size
						],
						iconAnchor : [
							g_Config.note.grip.size / 2,
							g_Config.note.grip.size / 2
						],
						html : '<div></div>'
					}
				),
				zIndexOffset : -1000,
				opacity : g_Config.note.grip.opacity,
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
					let noteAndRoute = m_DataSearchEngine.getNoteAndRoute ( event.target.objId );
					let note = noteAndRoute.note;
					let route = noteAndRoute.route;

					// ... then the layerGroup is searched...
					let layerGroup = g_TravelNotesData.mapObjects.get ( event.target.objId );
					if ( null === route ) {

						// the note is not attached to a route, so the coordinates of the note can be directly changed
						note.latLng = [ event.target.getLatLng ( ).lat, event.target.getLatLng ( ).lng ];
						m_EventDispatcher.dispatch ( 'updatetravelnotes' );
					}
					else {

						// the note is attached to the route, so we have to find the nearest point on the route
						// and the distance since the start of the route
						let latLngDistance = m_Geometry.getClosestLatLngDistance (
							route,
							[ event.target.getLatLng ( ).lat, event.target.getLatLng ( ).lng ]
						);

						// coordinates and distance are changed in the note
						note.latLng = latLngDistance.latLng;
						note.distance = latLngDistance.distance;

						// notes are sorted on the distance
						route.notes.sort (
							( first, second ) => { return first.distance - second.distance; }
						);

						// the coordinates of the bullet are adapted
						layerGroup.getLayer ( layerGroup.bulletId ).setLatLng ( latLngDistance.latLng );
						m_EventDispatcher.dispatch ( 'updateitinerary' );
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
					let note = m_DataSearchEngine.getNoteAndRoute ( event.target.objId ).note;
					let layerGroup = g_TravelNotesData.mapObjects.get ( event.target.objId );
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
				popupAnchor : [ 0, - note.iconHeight / 2 ],
				html : note.iconContent,
				className : g_Config.note.style
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
				let note = m_DataSearchEngine.getNoteAndRoute ( layer.objId ).note;
				return newHTMLViewsFactory ( 'TravelNotes-' ).getNoteHTML ( note );
			}
		);

		// ... and also a tooltip
		if ( 0 !== note.tooltipContent.length ) {
			marker.bindTooltip (
				layer => { return m_DataSearchEngine.getNoteAndRoute ( layer.objId ).note.tooltipContent; }
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
					let note = m_DataSearchEngine.getNoteAndRoute ( event.target.objId ).note;

					// ... new coordinates are saved in the TravelNotes note...
					note.iconLatLng = [ event.target.getLatLng ( ).lat, event.target.getLatLng ( ).lng ];

					// ... then the layerGroup is searched...
					let layerGroup = g_TravelNotesData.mapObjects.get ( event.target.objId );

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
					let note = m_DataSearchEngine.getNoteAndRoute ( event.target.objId ).note;

					// ... then the layerGroup is searched...
					let layerGroup = g_TravelNotesData.mapObjects.get ( event.target.objId );

					// ... and finally the polyline is updated with the new coordinates
					layerGroup.getLayer ( layerGroup.polylineId )
						.setLatLngs ( [ note.latLng, [ event.latlng.lat, event.latlng.lng ] ] );
				}
			);
		}

		// Finally a polyline is created between the 2 markers
		let polyline = L.polyline ( [ note.latLng, note.iconLatLng ], g_Config.note.polyline );
		polyline.objId = note.objId;

		// The 3 objects are added to a layerGroup
		let layerGroup = L.layerGroup ( [ marker, polyline, bullet ] );
		layerGroup.markerId = L.Util.stamp ( marker );
		layerGroup.polylineId = L.Util.stamp ( polyline );
		layerGroup.bulletId = L.Util.stamp ( bullet );

		// and the layerGroup added to the leaflet map and JavaScript map
		m_AddTo ( note.objId, layerGroup );
	}

	/*
	--- m_OnGeolocationStatusChanged function -----------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnGeolocationStatusChanged ( status ) {
		if ( 2 === status ) {
			return;
		}
		if ( m_GeolocationCircle ) {
			g_TravelNotesData.map.removeLayer ( m_GeolocationCircle );
			m_GeolocationCircle = null;
		}
	}

	/*
	--- m_OnGeolocationPositionChanged function -----------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnGeolocationPositionChanged ( position ) {
		let zoomToPosition = g_Config.geoLocation.zoomToPosition;
		if ( m_GeolocationCircle ) {
			g_TravelNotesData.map.removeLayer ( m_GeolocationCircle );
			zoomToPosition = false;
		}

		m_GeolocationCircle = L.circleMarker (
			L.latLng ( position.coords.latitude, position.coords.longitude ),
			{
				radius : g_Config.geoLocation.radius,
				color : g_Config.geoLocation.color
			}
		)
			.bindTooltip (
				newUtilities ( ).formatLatLng ( [ position.coords.latitude, position.coords.longitude ] )
			)
			.addTo ( g_TravelNotesData.map );

		if ( zoomToPosition ) {
			g_TravelNotesData.map.setView (
				L.latLng ( position.coords.latitude, position.coords.longitude ),
				g_Config.geoLocation.zoomFactor
			);
		}
	}

	/*
	--- MapEditor object ----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{

			removeRoute : ( route, removeNotes, removeWayPoints ) => m_RemoveRoute ( route, removeNotes, removeWayPoints ),

			addRoute : ( route, addNotes, addWayPoints, readOnly ) => m_AddRoute ( route, addNotes, addWayPoints, readOnly ),

			editRoute : route => m_EditRoute ( route ),

			removeObject : objId => m_RemoveObject ( objId ),

			removeAllObjects : ( ) => m_RemoveAllObjects ( ),

			zoomToPoint : latLng => m_ZoomToPoint ( latLng ),

			zoomToSearchResult : ( latLng, geometry ) => m_ZoomToSearchResult ( latLng, geometry ),

			zoomToNote : noteObjId => m_ZoomToNote ( noteObjId ),

			zoomToRoute : routeObjId => m_ZoomToRoute ( routeObjId ),

			zoomToTravel : ( ) => m_ZoomToTravel ( ),

			addItineraryPointMarker : ( objId, latLng ) => m_AddItineraryPointMarker ( objId, latLng ),

			addSearchPointMarker : ( objId, latLng, geometry ) => m_AddSearchPointMarker ( objId, latLng, geometry ),

			addRectangle : ( objId, bounds, properties ) => m_AddRectangle ( objId, bounds, properties ),

			addWayPoint : ( wayPoint, letter ) => m_AddWayPoint  ( wayPoint, letter ),

			redrawNote : note => m_RedrawNote ( note ),

			addNote : ( note, readOnly ) => m_AddNote ( note, readOnly ),

			loadEvents : ( ) => m_loadEvents ( ),

			setLayer : ( layer ) => m_SetLayer ( layer ),

			onGeolocationStatusChanged : ( status ) => m_OnGeolocationStatusChanged ( status ),

			onGeolocationPositionChanged : ( position ) => m_OnGeolocationPositionChanged ( position )

		}
	);
}

/*
--- g_MapEditor object ------------------------------------------------------------------------------------------------

The one and only one mapEditor

-----------------------------------------------------------------------------------------------------------------------
*/

const g_MapEditor = newMapEditor ( );

/*
--- End of MapEditor.js file ------------------------------------------------------------------------------------------
*/