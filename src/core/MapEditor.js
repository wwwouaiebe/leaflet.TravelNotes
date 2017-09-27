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
--- GeoCoder.js file --------------------------------------------------------------------------------------------------
This file contains:
	- the MapEditor object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
Doc reviewed 20170927
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/
( function ( ){
	
	'use strict';
	
	var _DataManager = require ( '../Data/DataManager' ) ( );

	var MapEditor = function ( ) {
		
		/*
		--- _AddTo function -------------------------------------------------------------------------------------------

		This function add a leaflet object to the leaflet map and to the JavaScript map

		---------------------------------------------------------------------------------------------------------------
		*/

		var _AddTo = function ( objId, object ) {
			object.objId = objId;
			object.addTo ( _DataManager.map );
			_DataManager.mapObjects.set ( objId, object );
		};
		
		/*
		--- _RemoveFrom function --------------------------------------------------------------------------------------

		This function remove a leaflet object from the leaflet map and from the JavaScript map

		---------------------------------------------------------------------------------------------------------------
		*/

		var _RemoveFrom = function ( objId ) {
			var layer = _DataManager.mapObjects.get ( objId );
			if ( layer ) {
				L.DomEvent.off ( layer );
				_DataManager.map.removeLayer ( layer );
				_DataManager.mapObjects.delete ( objId );
			}
		};
		
		/*
		--- _GetLatLngBounds function ---------------------------------------------------------------------------------

		This function build a L.latLngBounds object from an array of points

		---------------------------------------------------------------------------------------------------------------
		*/

		var _GetLatLngBounds = function ( latLngs ) {
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
		--- _GetRouteLatLng function ----------------------------------------------------------------------------------

		This function returns an array of points from a route and the notes linked to the route

		---------------------------------------------------------------------------------------------------------------
		*/

		var _GetRouteLatLng = function ( route ) {
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
		--- MapEditor object ------------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return {
			
			/*
			--- removeRoute method ------------------------------------------------------------------------------------

			This method remove a route and eventually the attached notes and waypoints 
			from the leaflet map and the JavaScript map
			
			parameters:
			- route : a TravelNotes route object.
			- removeNotes : a boolean. Linked notes are removed when true
			- removeWayPoints : a boolean. Linked waypoints are removed when true

			-----------------------------------------------------------------------------------------------------------
			*/
			
			removeRoute : function ( route, removeNotes, removeWayPoints ) {
				this.removeObject ( route.objId );
				if ( removeNotes ) {
					var notesIterator = route.notes.iterator;
					while ( ! notesIterator.done ) {
						this.removeObject ( notesIterator.value.objId );
					}
				}
				if ( removeWayPoints ) {
					var wayPointsIterator = route.wayPoints.iterator;
					while ( ! wayPointsIterator.done ) {
						this.removeObject ( wayPointsIterator.value.objId );
					}
				}
			},
			
			/*
			--- addRoute method ---------------------------------------------------------------------------------------

			This method add a route and eventually the attached notes and waypoints 
			to the leaflet map and the JavaScript map

			parameters:
			- route : a TravelNotes route object.
			- addNotes : a boolean. Attached notes are added when true
			- addWayPoints : a boolean. Attached waypoints are added when true
			- readOnly : a boolean. Created objects cannot be edited when true.

			-----------------------------------------------------------------------------------------------------------
			*/

			addRoute : function ( route, addNotes, addWayPoints, readOnly ) {
				readOnly = readOnly || false;
				
				// an array of points is created
				var latLng = [];
				var pointsIterator = route.itinerary.itineraryPoints.iterator;
				while ( ! pointsIterator.done ) {
					latLng.push ( pointsIterator.value.latLng );
				}
				
				// the leaflet polyline is created and added to the map
				var polyline = L.polyline ( latLng, { color : route.color, weight : route.width } );
				_AddTo ( route.objId, polyline );
				
				// tooltip and popup are created
				polyline.bindTooltip ( function ( layer ) { return _DataManager.getRoute ( layer.objId ).name; } );
				polyline.bindPopup ( 
					function ( layer ) {
						var route = _DataManager.getRoute ( layer.objId );
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
							require ('../UI/ContextMenu' ) ( event, require ( '../core/RouteEditor' )( ).getRouteContextMenu ( event.target.objId ) );
						}
					);
				}
				
				// notes are added
				if ( addNotes ) {
					var notesIterator = route.notes.iterator;
					while ( ! notesIterator.done ) {
						this.addNote ( notesIterator.value, readOnly );
					}
				}

				// waypoints are added
				if ( addWayPoints ) {
					var wayPointsIterator = _DataManager.editedRoute.wayPoints.iterator;
					while ( ! wayPointsIterator.done ) {
						this.addWayPoint ( wayPointsIterator.value, wayPointsIterator .first ? 'A' : ( wayPointsIterator.last ? 'B' :  wayPointsIterator.index ) );
					}
				}
			},
			
			/*
			--- editRoute method --------------------------------------------------------------------------------------

			This method changes the color and width of a route

			parameters:
			- route : a TravelNotes route object.

			-----------------------------------------------------------------------------------------------------------
			*/

			editRoute : function ( route ) {
				var polyline = _DataManager.mapObjects.get ( route.objId );
				polyline.setStyle( { color : route.color, weight : route.width } );
			},
			
			/*
			--- removeObject method -----------------------------------------------------------------------------------

			This method remove an object from the leaflet map and from the JavaScript map

			parameters:
			- objId : the TravelNotes objId of the object to remove

			-----------------------------------------------------------------------------------------------------------
			*/

			removeObject : function ( objId ) {
				_RemoveFrom ( objId );
			},
			
			
			/*
			--- removeAllObjects method -------------------------------------------------------------------------------

			This method remove all the objects from the leaflet map and from the JavaScript map

			-----------------------------------------------------------------------------------------------------------
			*/

			removeAllObjects : function ( ) {
				_DataManager.mapObjects.forEach ( 
					function ( travelObjectValue, travelObjectKey, travelObjects ) {
						L.DomEvent.off ( travelObjectValue );
						_DataManager.map.removeLayer ( travelObjectValue );
					}
				);
				_DataManager.mapObjects.clear ( );
			},
			
			
			/*
			--- zoomToPoint method ------------------------------------------------------------------------------------

			This method zoom on a given point

			-----------------------------------------------------------------------------------------------------------
			*/

			zoomToPoint : function ( latLng ) {
				map.setView ( latLng, _DataManager.config.itineraryPointZoom );
			},
			
			
			/*
			--- zoomToRoute method ------------------------------------------------------------------------------------

			This method zoom on a route

			parameters:
			- routeObjId : the TravelNotes objId of the desired route

			-----------------------------------------------------------------------------------------------------------
			*/

			zoomToRoute : function ( routeObjId ) {
				var latLngs = _GetRouteLatLng (  _DataManager.getRoute ( routeObjId ) );
				if ( 0 !== latLngs.length ) {
					_DataManager.map.fitBounds ( _GetLatLngBounds ( latLngs ) );
				}
			},
			
			/*
			--- zoomToTravel method -----------------------------------------------------------------------------------

			This method zoom on the entire travel

			-----------------------------------------------------------------------------------------------------------
			*/

			zoomToTravel : function ( ) {				
				var latLngs = [];
				_DataManager.travel.routes.forEach (
					function ( route ) {
						latLngs = latLngs.concat ( _GetRouteLatLng ( route ) );
					}
				);
				travel.notes.forEach (
					function ( note ) {
						latLngs.push ( note.latLng );
						latLngs.push ( note.iconLatLng );
					}
				);
				if ( 0 !== latLngs.length ) {
					_DataManager.map.fitBounds ( _GetLatLngBounds ( latLngs ) );
				}
			},
			
			
			/*
			--- addItineraryPointMarker method ------------------------------------------------------------------------

			This method add a leaflet circleMarker at a given point
			
			parameters:
			- objId : a unique identifier to attach to the circleMarker
			- latLng : the center of the circleMarker

			-----------------------------------------------------------------------------------------------------------
			*/

			addItineraryPointMarker : function ( objId, latLng ) {
				_AddTo ( 
					objId,
					L.circleMarker ( latLng, _DataManager.config.itineraryPointMarker )
				);
			},
			
			
			/*
			--- addWayPoint method ------------------------------------------------------------------------------------

			This method ...

			-----------------------------------------------------------------------------------------------------------
			*/

			addWayPoint : function ( wayPoint, letter ) {
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
				
				// ... and added to the map...
				marker.objId = wayPoint.objId;
				_AddTo ( wayPoint.objId, marker );
				
				// ... and a dragend event listener is created
				L.DomEvent.on (
					marker,
					'dragend', 
					function ( event ) {
						var wayPoint = _DataManager.editedRoute.wayPoints.getAt ( event.target.objId );
						wayPoint.latLng = [ event.target.getLatLng ( ).lat, event.target.getLatLng ( ).lng ];
						require ( '../core/RouteEditor' )( ).wayPointDragEnd ( event.target.objId );
					}
				);
			},
			
			
			/*
			--- addNote method ----------------------------------------------------------------------------------------

			This method ...

			-----------------------------------------------------------------------------------------------------------
			*/

			addNote : function ( note, readOnly ) {
				readOnly = readOnly || false;
				var bullet = L.marker ( 
					note.latLng,
					{ 
						icon : L.divIcon ( 
							{ 
								iconSize: [ 
									_DataManager.config.note.grip.size , 
									_DataManager.config.note.grip.size
								], 
								iconAnchor: [ 
									_DataManager.config.note.grip.size / 2,
									_DataManager.config.note.grip.size / 2 
								],
								html : '<div></div>'
							}
						),
						zIndexOffset : -1000 ,
						opacity : _DataManager.config.note.grip.opacity,
						draggable : ! readOnly
					} 
				);	
				bullet.objId = note.objId;
				if ( ! readOnly ) {
					L.DomEvent.on ( 
						bullet, 
						'dragend', 
						function ( event ) {
							var noteAndRoute = _DataManager.getNoteAndRoute ( event.target.objId );
							var note = noteAndRoute.note;
							var route = noteAndRoute.route;
							var layerGroup = _DataManager.mapObjects.get ( event.target.objId );
							if ( null != route ) {
								var latLngDistance = require ( '../util/TravelUtilities' ) ( ).getClosestLatLngDistance ( route, [ event.target.getLatLng ( ).lat, event.target.getLatLng ( ).lng] );
								note.latLng = latLngDistance.latLng;
								note.distance = latLngDistance.distance;
								layerGroup.getLayer ( layerGroup.bulletId ).setLatLng ( latLngDistance.latLng );
								route.notes.sort ( function ( a, b ) { return a.distance - b.distance; } );
							}
							else {
								note.latLng = [ event.target.getLatLng ( ).lat, event.target.getLatLng ( ).lng ];
							}
							layerGroup.getLayer ( layerGroup.polylineId ).setLatLngs ( [ note.latLng, note.iconLatLng ] );
							require ( '../core/TravelEditor' ) ( ).changeTravelHTML ( );
						}
 					);
					L.DomEvent.on ( 
						bullet, 
						'drag', 
						function ( event ) {
							var note = _DataManager.getNoteAndRoute ( event.target.objId ).note;
							var layerGroup = _DataManager.mapObjects.get ( event.target.objId );
							layerGroup.getLayer ( layerGroup.polylineId ).setLatLngs ( [ [ event.latlng.lat, event.latlng.lng ], note.iconLatLng ] );
						}
					);
				}
				var icon = L.divIcon (
					{ 
						iconSize: [ note.iconWidth, note.iconHeight ], 
						iconAnchor: [note.iconWidth / 2, note.iconHeight / 2 ],
						popupAnchor: [ 0, - note.iconHeight / 2 ], 
						html : note.iconContent,
						className : _DataManager.config.note.style
					}
				);
				var marker = L.marker ( 
					note.iconLatLng,
					{
						icon : icon,
						draggable : ! readOnly
					}
				);	
				marker.bindPopup (
					function ( layer ) {
						var note = _DataManager.getNoteAndRoute ( layer.objId ).note;
						return require ( '../core/NoteEditor' )( ).getNoteHTML ( note, 'TravelNotes-' );
					}			
				);
				if ( 0 !== note.tooltipContent.length ) {
					marker.bindTooltip ( function ( layer ) { return _DataManager.getNoteAndRoute ( layer.objId ).note.tooltipContent; } );
					marker.getTooltip ( ).options.offset [ 0 ] = note.iconWidth / 2;
				}
				marker.objId = note.objId;
				var polyline = L.polyline ( [ note.latLng, note.iconLatLng ], _DataManager.config.note.polyline );
				polyline.objId = note.objId;
				var layerGroup = L.layerGroup ( [ marker, polyline, bullet ] );
				layerGroup.markerId = L.Util.stamp ( marker );
				layerGroup.polylineId = L.Util.stamp ( polyline );
				layerGroup.bulletId = L.Util.stamp ( bullet );
				_AddTo ( note.objId, layerGroup );
				if ( ! readOnly ) {
					L.DomEvent.on ( 
						marker, 
						'contextmenu', 
						function ( event ) { 
							require ('../UI/ContextMenu' ) ( event, require ( './NoteEditor' ) ( ).getNoteContextMenu ( event.target.objId ) );	
						}
					);
					L.DomEvent.on ( 
						marker, 
						'dragend',
						function ( event ) {
							var note = _DataManager.getNoteAndRoute ( event.target.objId ).note;
							note.iconLatLng = [ event.target.getLatLng ( ).lat, event.target.getLatLng ( ).lng ];
							var layerGroup = _DataManager.mapObjects.get ( event.target.objId );
							layerGroup.getLayer ( layerGroup.polylineId ).setLatLngs ( [ note.latLng, note.iconLatLng ] );
						}
					);
					L.DomEvent.on ( 
						marker, 
						'drag',
						function ( event ) {
							var note = _DataManager.getNoteAndRoute ( event.target.objId ).note;
							var layerGroup = _DataManager.mapObjects.get ( event.target.objId );
							layerGroup.getLayer ( layerGroup.polylineId ).setLatLngs ( [ note.latLng, [ event.latlng.lat, event.latlng.lng ] ] );
						}
					);
				}
			},			
			
			/*
			--- editNote method ---------------------------------------------------------------------------------------

			This method ...

			-----------------------------------------------------------------------------------------------------------
			*/

			editNote : function ( note ) {
				var icon = L.divIcon (
					{ 
						iconSize: [ note.iconWidth, note.iconHeight ], 
						iconAnchor: [note.iconWidth / 2, note.iconHeight / 2 ],
						popupAnchor: [ 0, -note.iconHeight / 2 ], 
						html : note.iconContent,
						className : _DataManager.config.note.style
					}
				);
				var layerGroup = _DataManager.mapObjects.get ( note.objId );
				var marker = layerGroup.getLayer ( layerGroup.markerId );
				marker.setIcon ( icon );
				marker.unbindTooltip ( );
				if ( 0 !== note.tooltipContent.length ) {
					marker.bindTooltip ( function ( layer ) { return _DataManager.getNoteAndRoute ( layer.objId ).note.tooltipContent; } );
					marker.getTooltip ( ).options.offset [ 0 ] = note.iconWidth / 2;
				}
			}
		};
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