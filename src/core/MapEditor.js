/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

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
	- the MapEditor object
	- the module.exports implementation
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
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';
	
	var g_TravelNotesData = require ( '../L.TravelNotes' );

	var MapEditor = function ( ) {

		var m_DataSearchEngine  = require ( '../Data/DataSearchEngine' ) ( );

		/*
		--- m_UpdateRouteTooltip function -----------------------------------------------------------------------------

		This function updates the route tooltip with the distance when the mouse move on the polyline

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_UpdateRouteTooltip = function ( event ) { 
			var route = m_DataSearchEngine.getRoute (  event.target.objId );
			var distance = require ( '../core/RouteEditor' ) ( ).getClosestLatLngDistance ( route, [ event.latlng.lat, event.latlng.lng ] ).distance;
			distance += route.chainedDistance;
			distance = require ( '../util/Utilities' ) ( ).formatDistance ( distance );
			var polyline = g_TravelNotesData.mapObjects.get ( event.target.objId );
			polyline.closeTooltip ( );
			var tooltipText = m_DataSearchEngine.getRoute ( event.target.objId ).name;
			if ( ! g_TravelNotesData.travel.readOnly ) {
				tooltipText += ( 0 === tooltipText.length ? '' : ' - ' );
				tooltipText += distance;
			}
			polyline.setTooltipContent ( tooltipText );
			polyline.openTooltip (  event.latlng );
		};
	
		/*
		--- m_AddTo function ------------------------------------------------------------------------------------------

		This function add a leaflet object to the leaflet map and to the JavaScript map

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_AddTo = function ( objId, object ) {
			object.objId = objId;
			object.addTo ( g_TravelNotesData.map );
			g_TravelNotesData.mapObjects.set ( objId, object );
		};
		
		/*
		--- m_RemoveObject function -----------------------------------------------------------------------------------

		This function remove a leaflet object from the leaflet map and from the JavaScript map

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_RemoveObject = function ( objId ) {
			var layer = g_TravelNotesData.mapObjects.get ( objId );
			if ( layer ) {
				L.DomEvent.off ( layer );
				g_TravelNotesData.map.removeLayer ( layer );
				g_TravelNotesData.mapObjects.delete ( objId );
			}
		};
		
		/*
		--- m_GetLatLngBounds function --------------------------------------------------------------------------------

		This function build a L.latLngBounds object from an array of points

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_GetLatLngBounds = function ( latLngs ) {
			var sw = L.latLng ( [ 90, 180] );
			var ne = L.latLng ( [ -90, -180 ] );
			latLngs.forEach ( 
				function ( latLng ) {
					sw.lat = Math.min ( sw.lat, latLng [ 0 ] );
					sw.lng = Math.min ( sw.lng, latLng [ 1 ] );
					ne.lat = Math.max ( ne.lat, latLng [ 0 ] );
					ne.lng = Math.max ( ne.lng, latLng [ 1 ] );
				}
			);
			return L.latLngBounds( sw, ne );
		};
		
		/*
		--- m_GetRouteLatLng function ---------------------------------------------------------------------------------

		This function returns an array of points from a route and the notes linked to the route

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_GetRouteLatLng = function ( route ) {
			var latLngs = [];
			route.itinerary.itineraryPoints.forEach ( 
				function ( itineraryPoint ) {
					latLngs.push ( itineraryPoint.latLng );
				}
			);
			route.notes.forEach ( 
				function ( note ) {
					latLngs.push ( note.latLng );
					latLngs.push ( note.iconLatLng );
				}
			);
			return latLngs;
		};
		
		/*
		--- m_getDashArray function -----------------------------------------------------------------------------------

		This function returns the dashArray used for the polyline representation. See also leaflet docs

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_getDashArray = function ( route ) {
			if ( route.dashArray >= g_TravelNotesData.config.route.dashChoices.length ) {
				route.dashArray = 0;
			}
			var iDashArray = g_TravelNotesData.config.route.dashChoices [ route.dashArray ].iDashArray;
			if ( iDashArray ) {
				var dashArray = '';
				var dashCounter = 0;
				for ( dashCounter = 0; dashCounter < iDashArray.length - 1; dashCounter ++ ) {
					dashArray += iDashArray [ dashCounter ] * route.width + ',';
				}
				dashArray += iDashArray [ dashCounter ] * route.width ;
				
				return dashArray;
			}
			return null;
		};

		/*
		--- m_RemoveRoute function --------------------------------------------------------------------------------

		This function remove a route and eventually the attached notes and waypoints 
		from the leaflet map and the JavaScript map
		
		parameters:
		- route : a TravelNotes route object.
		- removeNotes : a boolean. Linked notes are removed when true
		- removeWayPoints : a boolean. Linked waypoints are removed when true

		-----------------------------------------------------------------------------------------------------------
		*/
		
		var m_RemoveRoute = function ( route, removeNotes, removeWayPoints ) {
			m_RemoveObject ( route.objId );
			if ( removeNotes ) {
				var notesIterator = route.notes.iterator;
				while ( ! notesIterator.done ) {
					m_RemoveObject ( notesIterator.value.objId );
				}
			}
			if ( removeWayPoints ) {
				var wayPointsIterator = route.wayPoints.iterator;
				while ( ! wayPointsIterator.done ) {
					m_RemoveObject ( wayPointsIterator.value.objId );
				}
			}
		};
				
		/*
		--- m_AddRoute function -----------------------------------------------------------------------------------

		This function add a route and eventually the attached notes and waypoints 
		to the leaflet map and the JavaScript map

		parameters:
		- route : a TravelNotes route object.
		- addNotes : a boolean. Attached notes are added when true
		- addWayPoints : a boolean. Attached waypoints are added when true
		- readOnly : a boolean. Created objects cannot be edited when true.

		-----------------------------------------------------------------------------------------------------------
		*/

		var m_AddRoute = function ( route, addNotes, addWayPoints, readOnly ) {
			readOnly = readOnly || false;
			
			// an array of points is created
			var latLng = [];
			var pointsIterator = route.itinerary.itineraryPoints.iterator;
			while ( ! pointsIterator.done ) {
				latLng.push ( pointsIterator.value.latLng );
			}
			
			// the leaflet polyline is created and added to the map
			var polyline = L.polyline ( latLng, { color : route.color, weight : route.width, dashArray : m_getDashArray ( route ) } );
			m_AddTo ( route.objId, polyline );
			// tooltip and popup are created
			polyline.bindTooltip ( 
				 route.name,
				{ sticky : true, direction : 'right' }
			);
			polyline.on ( 'mouseover' , m_UpdateRouteTooltip	);
			polyline.on ( 'mousemove' , m_UpdateRouteTooltip );
			
			polyline.bindPopup ( 
				function ( layer ) {
					var route = m_DataSearchEngine.getRoute ( layer.objId );
					return require ( '../core/RouteEditor' )( ).getRouteHTML ( route, 'TravelNotes-' );
				}
			);
			
			// left click event
			L.DomEvent.on ( polyline, 'click', function ( event ) { event.target.openPopup ( event.latlng ); } );
			// right click event
			if ( ! readOnly ) {
				L.DomEvent.on ( 
					polyline, 
					'contextmenu', 
					function ( event ) {
						require ( '../UI/ContextMenu' ) ( event, require ( '../UI/ContextMenuFactory' )( ).getRouteContextMenu ( event.target.objId ) );
					}
				);
			}
			
			// notes are added
			if ( addNotes ) {
				var notesIterator = route.notes.iterator;
				while ( ! notesIterator.done ) {
					m_AddNote ( notesIterator.value, readOnly );
				}
			}

			// waypoints are added
			if ( addWayPoints ) {
				var wayPointsIterator = g_TravelNotesData.editedRoute.wayPoints.iterator;
				while ( ! wayPointsIterator.done ) {
					m_AddWayPoint ( wayPointsIterator.value, wayPointsIterator .first ? 'A' : ( wayPointsIterator.last ? 'B' :  wayPointsIterator.index ) );
				}
			}
		};
			
		/*
		--- m_EditRoute function --------------------------------------------------------------------------------------

		This function changes the color and width of a route

		parameters:
		- route : a TravelNotes route object.

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_EditRoute = function ( route ) {
			var polyline = g_TravelNotesData.mapObjects.get ( route.objId );
			polyline.setStyle( { color : route.color, weight : route.width, dashArray : m_getDashArray ( route ) } );
		};
			
		/*
		--- m_RemoveAllObjects function ---------------------------------------------------------------------------

		This function remove all the objects from the leaflet map and from the JavaScript map

		-----------------------------------------------------------------------------------------------------------
		*/

		var m_RemoveAllObjects = function ( ) {
			g_TravelNotesData.mapObjects.forEach ( 
				function ( travelObjectValue, travelObjectKey, travelObjects ) {
					L.DomEvent.off ( travelObjectValue );
					g_TravelNotesData.map.removeLayer ( travelObjectValue );
				}
			);
			g_TravelNotesData.mapObjects.clear ( );
		};
		
		/*
		--- m_ZoomToPoint function ------------------------------------------------------------------------------------

		This function zoom on a given point

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_ZoomToPoint = function ( latLng ) {
			g_TravelNotesData.map.setView ( latLng, g_TravelNotesData.config.itineraryPointZoom );
		};

		/*
		--- m_ZoomToSearchResult function -----------------------------------------------------------------------------

		This function zoom on a search result

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_ZoomToSearchResult = function ( latLng, geometry ) {
			if ( geometry ) {
				var latLngs = [];
				geometry.forEach ( 
					function ( geometryPart ) {
						latLngs = latLngs.concat ( geometryPart );
					}
				);
				g_TravelNotesData.map.fitBounds ( m_GetLatLngBounds ( latLngs ) );
			}
			else
			{
				m_ZoomToPoint ( latLng );
			}
		};
		
		/*
		--- m_ZoomToNote function ------------------------------------------------------------------------------------

		This function zoom on a note

		parameters:
		- noteObjId : the TravelNotes objId of the desired note

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_ZoomToNote = function ( noteObjId ) {
			m_ZoomToPoint ( m_DataSearchEngine.getNoteAndRoute ( noteObjId ).note.iconLatLng );
		};
			
		/*
		--- m_ZoomToRoute function ------------------------------------------------------------------------------------

		This function zoom on a route

		parameters:
		- routeObjId : the TravelNotes objId of the desired route

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_ZoomToRoute = function ( routeObjId ) {
			var latLngs = m_GetRouteLatLng (  m_DataSearchEngine.getRoute ( routeObjId ) );
			if ( 0 !== latLngs.length ) {
				g_TravelNotesData.map.fitBounds ( m_GetLatLngBounds ( latLngs ) );
			}
		};

		/*
		--- m_ZoomToTravel function -----------------------------------------------------------------------------------

		This function zoom on the entire travel

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_ZoomToTravel = function ( ) {				
			var latLngs = [];
			g_TravelNotesData.travel.routes.forEach (
				function ( route ) {
					latLngs = latLngs.concat ( m_GetRouteLatLng ( route ) );
				}
			);
			g_TravelNotesData.travel.notes.forEach (
				function ( note ) {
					latLngs.push ( note.latLng );
					latLngs.push ( note.iconLatLng );
				}
			);
			if ( 0 !== latLngs.length ) {
				g_TravelNotesData.map.fitBounds ( m_GetLatLngBounds ( latLngs ) );
			}
		};
			
		/*
		--- m_AddItineraryPointMarker function ------------------------------------------------------------------------

		This function add a leaflet circleMarker at a given point
		
		parameters:
		- objId : a unique identifier to attach to the circleMarker
		- latLng : the center of the circleMarker

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_AddItineraryPointMarker = function ( objId, latLng ) {
			m_AddTo ( 
				objId,
				L.circleMarker ( latLng, g_TravelNotesData.config.itineraryPointMarker )
			);
		};

		/*
		--- m_AddSearchPointMarker function ---------------------------------------------------------------------------

		This function add a leaflet circleMarker at a given point
		
		parameters:
		- objId : a unique identifier to attach to the circleMarker
		- latLng : the center of the circleMarker

		---------------------------------------------------------------------------------------------------------------
		*/
		
		var m_AddSearchPointMarker = function ( objId, latLng, geometry ) {

			var showGeometry = false;
			if ( geometry ) {
				var latLngs = [];
				geometry.forEach ( 
					function ( geometryPart ) {
						latLngs = latLngs.concat ( geometryPart );
					}
				);
				var geometryBounds = m_GetLatLngBounds ( latLngs );
				var mapBounds = g_TravelNotesData.map.getBounds ( );
				showGeometry = ( ( geometryBounds.getEast ( ) - geometryBounds.getWest ( ) ) / (  mapBounds.getEast ( ) - mapBounds.getWest ( ) ) ) > 0.01 &&
					( ( geometryBounds.getNorth ( ) - geometryBounds.getSouth ( ) ) / (  mapBounds.getNorth ( ) - mapBounds.getSouth ( ) ) ) > 0.01;
			}
			if ( showGeometry ) {
				m_AddTo ( objId, L.polyline ( geometry, g_TravelNotesData.config.searchPointPolyline ) );
			}
			else {
				m_AddTo ( objId, L.circleMarker ( latLng, g_TravelNotesData.config.searchPointMarker ) );
			}
		};
			
		/*
		--- m_AddRectangle method -----------------------------------------------------------------------------------

		This method draw a rectangle on the map
		
		parameters:
		- objId : a unique identifier to attach to the rectangle
		- bounds : the lower left and upper right corner of the rectangle ( see leaflet docs )
		- properties : the properties of the rectangle 

		-----------------------------------------------------------------------------------------------------------
		*/

		var m_AddRectangle = function ( objId, bounds, properties ) {
			m_AddTo (
				objId,
				L.rectangle ( bounds, properties )
			);
		};
		
		/*
		--- m_AddWayPoint function ------------------------------------------------------------------------------------

		This function add a TravelNotes waypoint object to the leaflet map

		parameters:
		- wayPoint : a TravelNotes waypoint object
		- letter : the letter to be displayed under the waypoint

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_AddWayPoint = function ( wayPoint, letter ) {
			if ( ( 0 === wayPoint.lat ) && ( 0 === wayPoint.lng  ) ) {
				return;
			}
			
			// a HTML element is created, with different class name, depending of the waypont position. See also WayPoints.css
			var iconHtml = '<div class="TravelNotes-WayPoint TravelNotes-WayPoint' + 
			( 'A' === letter ? 'Start' : ( 'B' === letter ? 'End' : 'Via' ) ) + 
			'"></div><div class="TravelNotes-WayPointText">' + letter + '</div>';
			
			// a leaflet marker is created...
			var marker = L.marker ( 
				wayPoint.latLng,
				{ 
					icon : L.divIcon ( { iconSize: [ 40 , 40 ], iconAnchor: [ 20, 40 ], html : iconHtml, className : 'TravelNotes-WayPointStyle' } ),
					draggable : true
				} 
			);	

			marker.bindTooltip ( function ( wayPoint ) { return m_DataSearchEngine.getWayPoint ( wayPoint.objId ).UIName; } );
			marker.getTooltip ( ).options.offset  = [ 20, -20 ];

			L.DomEvent.on ( 
				marker, 
				'contextmenu', 
				function ( event ) { 
					require ( '../UI/ContextMenu' ) ( event, require ( '../UI/ContextMenuFactory' ) ( ).getWayPointContextMenu ( event.target.objId ) );	
				}
			);
			
			// ... and added to the map...
			marker.objId = wayPoint.objId;
			m_AddTo ( wayPoint.objId, marker );
			
			// ... and a dragend event listener is created
			L.DomEvent.on (
				marker,
				'dragend', 
				function ( event ) {
					var wayPoint = g_TravelNotesData.editedRoute.wayPoints.getAt ( event.target.objId );
					wayPoint.latLng = [ event.target.getLatLng ( ).lat, event.target.getLatLng ( ).lng ];
					require ( '../core/WaypointEditor' )( ).wayPointDragEnd ( event.target.objId );
				}
			);
		};

		/*
		--- m_RedrawNote function -------------------------------------------------------------------------------------

		This function redraw a note object on the leaflet map

		parameters:
		- note : a TravelNotes note object

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_RedrawNote = function  ( note ) {
			m_RemoveObject ( note.objId );
			m_AddNote ( note );
		};
			
		/*
		--- m_AddNote function ----------------------------------------------------------------------------------------

		This function add a TravelNotes note object to the leaflet map

		parameters:
		- note : a TravelNotes note object
		- readOnly : a boolean. Created objects cannot be edited when true

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_AddNote = function ( note, readOnly ) {
			
			readOnly = readOnly || false;
			
			// first a marker is created at the note position. This marker is empty and transparent, so 
			// not visible on the map but the marker can be dragged
			var bullet = L.marker ( 
				note.latLng,
				{ 
					icon : L.divIcon ( 
						{ 
							iconSize: [ 
								g_TravelNotesData.config.note.grip.size , 
								g_TravelNotesData.config.note.grip.size
							], 
							iconAnchor: [ 
								g_TravelNotesData.config.note.grip.size / 2,
								g_TravelNotesData.config.note.grip.size / 2 
							],
							html : '<div></div>'
						}
					),
					zIndexOffset : -1000 ,
					opacity : g_TravelNotesData.config.note.grip.opacity,
					draggable : ! readOnly
				} 
			);	
			bullet.objId = note.objId;
			
			if ( ! readOnly ) {
				// event listener for the dragend event
				L.DomEvent.on ( 
					bullet, 
					'dragend', 
					function ( event ) {
						// the TravelNotes note and route are searched...
						var noteAndRoute = m_DataSearchEngine.getNoteAndRoute ( event.target.objId );
						var note = noteAndRoute.note;
						var route = noteAndRoute.route;
						// ... then the layerGroup is searched...
						var layerGroup = g_TravelNotesData.mapObjects.get ( event.target.objId );
						if ( null != route ) {
							// the note is attached to the route, so we have to find the nearest point on the route and the distance since the start of the route
							var latLngDistance = require ( '../core/RouteEditor' ) ( ).getClosestLatLngDistance ( route, [ event.target.getLatLng ( ).lat, event.target.getLatLng ( ).lng] );
							// coordinates and distance are changed in the note
							note.latLng = latLngDistance.latLng;
							note.distance = latLngDistance.distance;
							// notes are sorted on the distance
							route.notes.sort ( function ( a, b ) { return a.distance - b.distance; } );
							// the coordinates of the bullet are adapted
							layerGroup.getLayer ( layerGroup.bulletId ).setLatLng ( latLngDistance.latLng );
							require ( '../UI/DataPanesUI' ) ( ).updateItinerary ( );
						}
						else {
							// the note is not attached to a route, so the coordinates of the note can be directly changed
							note.latLng = [ event.target.getLatLng ( ).lat, event.target.getLatLng ( ).lng ];
							require ( '../UI/DataPanesUI' ) ( ).updateTravelNotes ( );
						}
						// in all cases, the polyline is updated
						layerGroup.getLayer ( layerGroup.polylineId ).setLatLngs ( [ note.latLng, note.iconLatLng ] );
						// and the HTML page is adapted
						require ( '../core/TravelEditor' ) ( ).updateRoadBook ( );
					}
				);
				// event listener for the drag event
				L.DomEvent.on ( 
					bullet, 
					'drag', 
					function ( event ) {
						var note = m_DataSearchEngine.getNoteAndRoute ( event.target.objId ).note;
						var layerGroup = g_TravelNotesData.mapObjects.get ( event.target.objId );
						layerGroup.getLayer ( layerGroup.polylineId ).setLatLngs ( [ [ event.latlng.lat, event.latlng.lng ], note.iconLatLng ] );
					}
				);
			}
			
			// a second marker is now created. The icon created by the user is used for this marker
			var icon = L.divIcon (
				{ 
					iconSize: [ note.iconWidth, note.iconHeight ], 
					iconAnchor: [note.iconWidth / 2, note.iconHeight / 2 ],
					popupAnchor: [ 0, - note.iconHeight / 2 ], 
					html : note.iconContent,
					className : g_TravelNotesData.config.note.style
				}
			);
			var marker = L.marker ( 
				note.iconLatLng,
				{
					icon : icon,
					draggable : ! readOnly
				}
			);	
			marker.objId = note.objId;
			
			// a popup is binded to the the marker...
			marker.bindPopup (
				function ( layer ) {
					var note = m_DataSearchEngine.getNoteAndRoute ( layer.objId ).note;
					return require ( '../core/NoteEditor' )( ).getNoteHTML ( note, 'TravelNotes-' );
				}			
			);
			
			// ... and also a tooltip
			if ( 0 !== note.tooltipContent.length ) {
				marker.bindTooltip ( function ( layer ) { return m_DataSearchEngine.getNoteAndRoute ( layer.objId ).note.tooltipContent; } );
				marker.getTooltip ( ).options.offset [ 0 ] = note.iconWidth / 2;
			}
			if ( ! readOnly ) {
				// event listener for the contextmenu event
				L.DomEvent.on ( 
					marker, 
					'contextmenu', 
					function ( event ) { 
						require ( '../UI/ContextMenu' ) ( event, require ( '../UI/ContextMenuFactory' ) ( ).getNoteContextMenu ( event.target.objId ) );	
					}
				);
				// event listener for the dragend event
				L.DomEvent.on ( 
					marker, 
					'dragend',
					function ( event ) {
						// The TravelNotes note linked to the marker is searched...
						var note = m_DataSearchEngine.getNoteAndRoute ( event.target.objId ).note;
						// ... new coordinates are saved in the TravelNotes note...
						note.iconLatLng = [ event.target.getLatLng ( ).lat, event.target.getLatLng ( ).lng ];
						// ... then the layerGroup is searched...
						var layerGroup = g_TravelNotesData.mapObjects.get ( event.target.objId );
						// ... and finally the polyline is updated with the new coordinates
						layerGroup.getLayer ( layerGroup.polylineId ).setLatLngs ( [ note.latLng, note.iconLatLng ] );
					}
				);
				// event listener for the drag event
				L.DomEvent.on ( 
					marker, 
					'drag',
					function ( event ) {
						// The TravelNotes note linked to the marker is searched...
						var note = m_DataSearchEngine.getNoteAndRoute ( event.target.objId ).note;
						// ... then the layerGroup is searched...
						var layerGroup = g_TravelNotesData.mapObjects.get ( event.target.objId );
						// ... and finally the polyline is updated with the new coordinates
						layerGroup.getLayer ( layerGroup.polylineId ).setLatLngs ( [ note.latLng, [ event.latlng.lat, event.latlng.lng ] ] );
					}
				);
			}
			
			// Finally a polyline is created between the 2 markers
			var polyline = L.polyline ( [ note.latLng, note.iconLatLng ], g_TravelNotesData.config.note.polyline );
			polyline.objId = note.objId;
			
			// The 3 objects are added to a layerGroup
			var layerGroup = L.layerGroup ( [ marker, polyline, bullet ] );
			layerGroup.markerId = L.Util.stamp ( marker );
			layerGroup.polylineId = L.Util.stamp ( polyline );
			layerGroup.bulletId = L.Util.stamp ( bullet );
			
			// and the layerGroup added to the leaflet map and JavaScript map
			m_AddTo ( note.objId, layerGroup );
		};

		/*
		--- m_EditNote function ---------------------------------------------------------------------------------------

		This function changes a note after edition by the user

		parameters:
		- note : the TravelNotes note object modified by the user
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_EditNote = function ( note ) {
			
			// a new icon is created
			var icon = L.divIcon (
				{ 
					iconSize: [ note.iconWidth, note.iconHeight ], 
					iconAnchor: [note.iconWidth / 2, note.iconHeight / 2 ],
					popupAnchor: [ 0, -note.iconHeight / 2 ], 
					html : note.iconContent,
					className : g_TravelNotesData.config.note.style
				}
			);
			// and the marker icon replaced by the new one
			var layerGroup = g_TravelNotesData.mapObjects.get ( note.objId );
			var marker = layerGroup.getLayer ( layerGroup.markerId );
			marker.setIcon ( icon );
			
			// then, the tooltip is changed
			marker.unbindTooltip ( );
			if ( 0 !== note.tooltipContent.length ) {
				marker.bindTooltip ( function ( layer ) { return m_DataSearchEngine.getNoteAndRoute ( layer.objId ).note.tooltipContent; } );
				marker.getTooltip ( ).options.offset [ 0 ] = note.iconWidth / 2;
			}
			if ( marker.isPopupOpen( ) ) {
				marker.closePopup ( );
				marker.openPopup ( );
			}
		};
		
		/*
		--- MapEditor object ------------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return Object.seal (
			{
				
				removeRoute : function ( route, removeNotes, removeWayPoints ) { m_RemoveRoute ( route, removeNotes, removeWayPoints ); },
				
				addRoute : function ( route, addNotes, addWayPoints, readOnly ) { m_AddRoute ( route, addNotes, addWayPoints, readOnly ); },
				
				editRoute : function ( route ) { m_EditRoute ( route ); },
				
				removeObject : function ( objId ) { m_RemoveObject ( objId ); },
				
				removeAllObjects : function ( ) { m_RemoveAllObjects ( ); },
				
				zoomToPoint : function ( latLng ) { m_ZoomToPoint ( latLng ); },
				
				zoomToSearchResult : function ( latLng, geometry ) { m_ZoomToSearchResult ( latLng, geometry ); },
				
				zoomToNote : function ( noteObjId ) { m_ZoomToNote ( noteObjId ); },
				
				zoomToRoute : function ( routeObjId ) { m_ZoomToRoute ( routeObjId );  },
				
				zoomToTravel : function ( ) { m_ZoomToTravel ( ); },

				addItineraryPointMarker : function ( objId, latLng ) { m_AddItineraryPointMarker ( objId, latLng ); },
				
				addSearchPointMarker : function ( objId, latLng, geometry ) { m_AddSearchPointMarker ( objId, latLng, geometry ); },

				addRectangle : function ( objId, bounds, properties ) { m_AddRectangle ( objId, bounds, properties ); },
				
				addWayPoint : function ( wayPoint, letter ) { m_AddWayPoint  ( wayPoint, letter ); },

				redrawNote : function  ( note ) { m_RedrawNote ( note ); },
				
				addNote : function ( note, readOnly ) { m_AddNote ( note, readOnly ); },			
				
				editNote : function ( note ) { m_EditNote ( note ); }
			}
		);
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = MapEditor;
	}

}());

/*
--- End of MapEditor.js file ------------------------------------------------------------------------------------------
*/