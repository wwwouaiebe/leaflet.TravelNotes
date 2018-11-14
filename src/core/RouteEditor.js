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
--- RouteEditor.js file -------------------------------------------------------------------------------------------------
This file contains:
	- the RouteEditor object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	-v1.1.0:
		- Issue #28 : Disable "select this point as start point " and "select this point as end point" when a start point or end point is already present
		- Issue #30 : Add a context menu with delete command to the waypoints
		- Issue #33 : Add a command to hide a route
		- Issue #34 : Add a command to show all routes
Doc reviewed 20170928
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	var _DataManager = require ( '../Data/DataManager' ) ( );
	var _Translator = require ( '../UI/Translator' ) ( );
	var _NoteEditor = require ( '../core/NoteEditor' ) ( );
	var _MapEditor = require ( '../core/MapEditor' ) ( );
	var _RouteEditorUI = require ( '../UI/RouteEditorUI' ) ( );
	var _ItineraryEditor = require ( '../core/ItineraryEditor' ) ( );
	var _Utilities = require ( '../util/Utilities' ) ( );
		
	var RouteEditor = function ( ) {
		
		/*
		--- RouteEditor object ----------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return {
			cutRoute : function ( route, latLng ) {

				// an array is created with 2 clones of the route
				var routes = [ require ( '../data/Route' ) ( ), require ( '../data/Route' ) ( ) ];
				routes [ 0 ].object = route.object;
				routes [ 1 ].object = route.object;
				
				// and the itineraryPoints are removed
				routes [ 0 ].itinerary.itineraryPoints.removeAll ( );
				routes [ 1 ].itinerary.itineraryPoints.removeAll ( );
				
				// the distance between the origin and the cutting point is computed
				var cuttingPointLatLngDistance = this.getClosestLatLngDistance ( route, latLng );

				// iteration on the itineraryPoints
				var itineraryPointIterator = route.itinerary.itineraryPoints.iterator;
				var iterationDistance = 0;
				var itineraryPoint;
				var previousItineraryPoint = null;
				
				var routeCounter = 0;
				while ( ! itineraryPointIterator.done ) {
					itineraryPoint = require ( '../data/ItineraryPoint' ) ( );
					itineraryPoint.object = itineraryPointIterator.value.object;
					if ( 0 === routeCounter && 0 != iterationDistance && iterationDistance > cuttingPointLatLngDistance.distance ) {
						// we have passed the cutting point...
						var removedDistance = L.latLng ( cuttingPointLatLngDistance.latLng ).distanceTo ( L.latLng ( itineraryPointIterator.value.latLng ) );
						// a new point is created at the cutting point position and added to the first route.
						var cuttingPoint = require ( '../data/ItineraryPoint' ) ( );
						cuttingPoint.latLng = cuttingPointLatLngDistance.latLng;
						routes [ 0 ].itinerary.itineraryPoints.add ( cuttingPoint );
						routes [ 0 ].distance = iterationDistance - removedDistance;
						if ( previousItineraryPoint ) {
							previousItineraryPoint.distance -= removedDistance;
						}

						routeCounter = 1;
						
						// a new point is created at the cutting point position and added to the second route.
						cuttingPoint = require ( '../data/ItineraryPoint' ) ( );
						cuttingPoint.latLng = cuttingPointLatLngDistance.latLng;
						cuttingPoint.distance = removedDistance;
						routes [ 1 ].itinerary.itineraryPoints.add ( cuttingPoint );
						iterationDistance = removedDistance;
					}
					routes [ routeCounter ].itinerary.itineraryPoints.add ( itineraryPoint );
					iterationDistance +=itineraryPointIterator.value.distance;
					previousItineraryPoint = itineraryPoint;
				}
				routes [ routeCounter ].distance = iterationDistance;

				return routes;
			},

			/*
			--- getClosestLatLngDistance method -----------------------------------------------------------------------

			This method search the nearest point on a route from a given point and compute the distance
			between the beginning of the route and the nearest point
			
			parameters:
			- route : the TravelNotes route object to be used
			- latLng : the coordinates of the point

			-----------------------------------------------------------------------------------------------------------
			*/

			getClosestLatLngDistance : function ( route, latLng ) {
				
				// an iterator on the route points is created...
				var itineraryPointIterator = route.itinerary.itineraryPoints.iterator;
				// ... and placed on the first point
				var dummy = itineraryPointIterator.done;
				// the smallest distance is initialized ...
				var minDistance = Number.MAX_VALUE;
				// projections of points are made
				var point = L.Projection.SphericalMercator.project ( L.latLng ( latLng [ 0 ], latLng [ 1 ] ) );
				var point1 = L.Projection.SphericalMercator.project ( L.latLng ( itineraryPointIterator.value.lat, itineraryPointIterator.value.lng ) );
				// variables initialization
				var closestLatLng = null;
				var closestDistance = 0;
				var endSegmentDistance = itineraryPointIterator.value.distance;
				// iteration on the route points
				while ( ! itineraryPointIterator.done ) {
					// projection of the second point...
					var point2 = L.Projection.SphericalMercator.project ( L.latLng ( itineraryPointIterator.value.lat, itineraryPointIterator.value.lng ) );
					// and distance is computed
					var distance = L.LineUtil.pointToSegmentDistance ( point, point1, point2 );
					if ( distance < minDistance )
					{
						// we have found the smallest distance ... till now :-)
						minDistance = distance;
						// the nearest point is computed
						closestLatLng = L.Projection.SphericalMercator.unproject ( L.LineUtil.closestPointOnSegment ( point, point1, point2 ) );
						// and the distance also
						closestDistance = endSegmentDistance - closestLatLng.distanceTo ( L.latLng ( itineraryPointIterator.value.lat, itineraryPointIterator.value.lng ) );
					}
					// we prepare the iteration for the next point...
					endSegmentDistance += itineraryPointIterator.value.distance;
					point1 = point2;
				}
				
				return { latLng : [ closestLatLng.lat, closestLatLng.lng ], distance : closestDistance };
			},

			/*
			--- saveGpx method ----------------------------------------------------------------------------------------

			This method save the currently edited route to a GPX file
			
			-----------------------------------------------------------------------------------------------------------
			*/

			saveGpx : function ( ) {
				// initializations...
				var tab0 = "\n";
				var tab1 = "\n\t";
				var tab2 = "\n\t\t";
				var tab3 = "\n\t\t\t";
				var timeStamp = "time='" + new Date ( ).toISOString ( ) + "' ";
				
				// header
				var gpxString = "<?xml version='1.0'?>" + tab0;
				gpxString += "<gpx xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xsi:schemaLocation='http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd' version='1.1' creator='Leaflet-Routing-Gpx'>";

				// waypoints
				var wayPointsIterator = _DataManager.editedRoute.wayPoints.iterator;
				while ( ! wayPointsIterator.done )
				{
					gpxString += 
						tab1 + "<wpt lat='" + wayPointsIterator.value.lat + "' lon='" + wayPointsIterator.value.lng + "' " +
						timeStamp + "/>";
					
				}
				
				// route
				gpxString += tab1 + "<rte>";
				var maneuverIterator = _DataManager.editedRoute.itinerary.maneuvers.iterator;
				while ( ! maneuverIterator.done ) {
					var wayPoint = _DataManager.editedRoute.itinerary.itineraryPoints.getAt ( maneuverIterator.value.itineraryPointObjId );
					var instruction = maneuverIterator.value.instruction.replace ( '&', '&amp;' ).replace ( '\'', '&apos;' ).replace ('\"', '&quote;').replace ( '>', '&gt;' ).replace ( '<', '&lt;');
					gpxString +=
						tab2 + "<rtept lat='" + wayPoint.lat + "' lon='" + wayPoint.lng +"' " + timeStamp + "desc='" + instruction + "' />" ;
				}
				gpxString += tab1 + "</rte>";
				
				// track
				gpxString += tab1 + "<trk>";
				gpxString += tab2 + "<trkseg>";
				var itineraryPointsIterator = _DataManager.editedRoute.itinerary.itineraryPoints.iterator;
				while ( ! itineraryPointsIterator.done ) {
					gpxString +=
						tab3 + "<trkpt lat='" + itineraryPointsIterator.value.lat + "' lon='" + itineraryPointsIterator.value.lng + "' " + timeStamp + " />";
				}
				gpxString += tab2 + "</trkseg>";				
				gpxString += tab1 + "</trk>";
				
				// eof
				gpxString += tab0 + "</gpx>";
				
				// file is saved
				var fileName = _DataManager.editedRoute.name;
				if ( '' === fileName ) {
					fileName = 'TravelNote';
				}
				fileName += '.gpx';
				require ( '../util/Utilities' ) ( ).saveFile ( fileName, gpxString );
			},
			
			/*
			--- getRouteHTML method -----------------------------------------------------------------------------------

			This method returns an HTML string with the route contents. This string will be used in the
			route popup and on the HTML page
			
			parameters:
			- route : the TravelNotes route object
			- classNamePrefix : a string that will be added to all the HTML classes

			-----------------------------------------------------------------------------------------------------------
			*/

			getRouteHTML : function ( route, classNamePrefix ) {
				var returnValue = '<div class="' + classNamePrefix + 'Route-Header-Name">' +
					route.name + 
					'</div>';
				if (0 !== route.distance ) {
					returnValue += '<div class="' + classNamePrefix + 'Route-Header-Distance">' +
						_Translator.getText ( 'RouteEditor - Distance', { distance : _Utilities.formatDistance ( route.distance ) } ) + '</div>' +
						'<div class="' + classNamePrefix + 'Route-Header-Duration">' +
						_Translator.getText ( 'RouteEditor - Duration', { duration : _Utilities.formatTime ( route.duration ) } ) + '</div>';
				}
				
				return returnValue;
			},
			
			/*
			--- chainRoutes method ------------------------------------------------------------------------------------

			This method recompute the distances when routes are chained
			
			-----------------------------------------------------------------------------------------------------------
			*/

			chainRoutes : function ( ) {
				var routesIterator = _DataManager.travel.routes.iterator;
				var chainedDistance = 0;
				while ( ! routesIterator.done ) {
					if ( routesIterator.value.chain ) {
						routesIterator.value.chainedDistance = chainedDistance;
						chainedDistance += routesIterator.value.distance;
					}
					else {
						routesIterator.value.chainedDistance = 0;
					}
					var notesIterator = routesIterator.value.notes.iterator;
					while (! notesIterator.done ) {
						notesIterator.value.chainedDistance = routesIterator.value.chainedDistance;
					}
				}
			},
			
			/*
			--- startRouting method -----------------------------------------------------------------------------------

			This method start the router
			
			-----------------------------------------------------------------------------------------------------------
			*/

			startRouting : function ( ) {
				if ( ! _DataManager.config.routing.auto ) {
					return;
				}
				_DataManager.editedRoute.haveItinerary = ( 0 !== _DataManager.editedRoute.itinerary.itineraryPoints.length );
				require ( '../core/Router' ) ( ).startRouting ( _DataManager.editedRoute );
			},
			
			/*
			--- endRouting method -------------------------------------------------------------------------------------

			This method is called by the router when a routing operation is successfully finished
			
			-----------------------------------------------------------------------------------------------------------
			*/

			endRouting : function ( ) {
				// the previous route is removed from the leaflet map
				_MapEditor.removeRoute ( _DataManager.editedRoute, true, true );
				
				// the position of the notes linked to the route is recomputed
				var notesIterator = _DataManager.editedRoute.notes.iterator;
				while ( ! notesIterator.done ) {
					var latLngDistance = this.getClosestLatLngDistance ( _DataManager.editedRoute, notesIterator.value.latLng );
					notesIterator.value.latLng = latLngDistance.latLng;
					notesIterator.value.distance = latLngDistance.distance;
				}
				
				// and the notes sorted
				_DataManager.editedRoute.notes.sort ( function ( a, b ) { return a.distance - b.distance; } );
				
				// the new route is added to the map
				_MapEditor.addRoute ( _DataManager.editedRoute, true, true );
				if ( ! _DataManager.editedRoute.haveItinerary ) {
					_MapEditor.zoomToRoute ( _DataManager.editedRoute.objId );
				}
				_DataManager.editedRoute.haveItinerary = ( 0 !== _DataManager.editedRoute.itinerary.itineraryPoints.length );
				
				// and the itinerary and waypoints are displayed
				_ItineraryEditor.setItinerary ( );
				_RouteEditorUI.setWayPointsList ( );
				
				// the HTML page is adapted ( depending of the config.... )
				this.chainRoutes ( );
				require ( '../core/TravelEditor' ) ( ).changeTravelHTML ( );
			},
			
			/*
			--- saveEdition method ------------------------------------------------------------------------------------

			This method save the current edited route
			
			-----------------------------------------------------------------------------------------------------------
			*/

			saveEdition : function ( ) {
				// the edited route is cloned
				var clonedRoute = require ( '../data/Route' ) ( );
				clonedRoute.object = _DataManager.editedRoute.object;
				// and the initial route replaced with the clone
				_DataManager.travel.routes.replace ( _DataManager.editedRoute.routeInitialObjId, clonedRoute );
				_DataManager.editedRoute.routeInitialObjId = clonedRoute.objId;
				this.clear ( );
			},
			
			/*
			--- cancelEdition method ----------------------------------------------------------------------------------

			This method cancel the current edited route
			
			-----------------------------------------------------------------------------------------------------------
			*/

			cancelEdition : function ( ) {
				this.clear ( );
			},
			
			/*
			--- clear method ------------------------------------------------------------------------------------------

			This method clean the editors and the HTML page after a save or cancel
			
			-----------------------------------------------------------------------------------------------------------
			*/

			clear : function ( ) {
				_MapEditor.removeRoute ( _DataManager.editedRoute, true, true );
				_MapEditor.addRoute ( _DataManager.getRoute ( _DataManager.editedRoute.routeInitialObjId ), true, false );

				_DataManager.editedRoute = require ( '../data/Route' ) ( );
				_DataManager.editedRoute.routeChanged = false;
				_DataManager.editedRoute.routeInitialObjId = -1;
				require ( '../UI/TravelEditorUI' ) ( ).setRoutesList ( );
				_RouteEditorUI.setWayPointsList ( );
				_RouteEditorUI .reduce ( );
				_ItineraryEditor.setItinerary ( );
				// the HTML page is adapted ( depending of the config.... )
				this.chainRoutes ( );
				require ( '../core/TravelEditor' ) ( ).changeTravelHTML ( );
			},
			
			/*
			--- editRoute method --------------------------------------------------------------------------------------

			This method start the edition of a route
			
			parameters:
			- routeObjId : the TravelNotes route objId to edit

			-----------------------------------------------------------------------------------------------------------
			*/

			editRoute : function ( routeObjId ) { 
				if ( _DataManager.editedRoute.routeChanged ) {
					// not possible to edit - the current edited route is not saved or cancelled
					require ( '../core/ErrorEditor' ) ( ).showError ( _Translator.getText ( "RouteEditor - Not possible to edit a route without a save or cancel" ) );
					return;
				}
				if ( -1 !== _DataManager.editedRoute.routeInitialObjId ) {
					// the current edited route is not changed. Cleaning the editors
					this.clear ( );
				}
				
				// We verify that the provider  for this route is available
				var initialRoute = _DataManager.getRoute ( routeObjId );
				var providerName = initialRoute.itinerary.provider;
				if ( providerName && ( '' !== providerName ) && ( ! _DataManager.providers.get ( providerName.toLowerCase ( ) ) ) )
				{
					require ( '../core/ErrorEditor' ) ( ).showError ( _Translator.getText ( "RouteEditor - Not possible to edit a route created with this provider", {provider : providerName } ) );
					return;
				}
				// Provider and transit mode are changed in the itinerary editor
				_ItineraryEditor.setProvider ( providerName );
				var transitMode = initialRoute.itinerary.transitMode;
				if ( transitMode && '' !== transitMode ) {
					_ItineraryEditor.setTransitMode ( transitMode );
				}
				// The edited route is pushed in the editors
				_DataManager.editedRoute = require ( '../data/Route' ) ( );
				// Route is cloned, so we can have a cancel button in the editor
				_DataManager.editedRoute.object = initialRoute.object;
				_DataManager.editedRoute.routeInitialObjId = initialRoute.objId;
				_DataManager.editedRoute.haveItinerary = ( 0 !== _DataManager.editedRoute.itinerary.itineraryPoints.length );
				_DataManager.editedRoute.hidden = false;
				initialRoute.hidden = false;
				_MapEditor.removeRoute ( initialRoute, true, false );
				_MapEditor.addRoute ( _DataManager.editedRoute, true, true );
				this.chainRoutes ( );
				_RouteEditorUI .expand ( );
				_RouteEditorUI.setWayPointsList ( );
				_ItineraryEditor.setItinerary ( );
			},
			
			/*
			--- routeProperties method --------------------------------------------------------------------------------

			This method opens the RouteProperties dialog
			
			parameters:
			- routeObjId : 

			-----------------------------------------------------------------------------------------------------------
			*/

			routeProperties : function ( routeObjId ) {
				var route = _DataManager.getRoute ( routeObjId );
				require ( '../UI/RoutePropertiesDialog' ) ( route );
			},
			
			/*
			--- addWayPoint method ------------------------------------------------------------------------------------

			This method add a waypoint
			
			parameters:
			- latLng : 

			-----------------------------------------------------------------------------------------------------------
			*/

			addWayPoint : function ( latLng, event, distance ) {
				_DataManager.editedRoute.routeChanged = true;
				var newWayPoint = require ( '../data/Waypoint.js' ) ( );
				if ( latLng ) {
					newWayPoint.latLng = latLng;
					if ( _DataManager.config.wayPoint.reverseGeocoding ) {
						require ( '../core/GeoCoder' ) ( ).getAddress ( latLng [ 0 ], latLng [ 1 ], this.renameWayPoint, this, newWayPoint.objId );
					}
				}
				_DataManager.editedRoute.wayPoints.add ( newWayPoint );
				_MapEditor.addWayPoint ( _DataManager.editedRoute.wayPoints.last, _DataManager.editedRoute.wayPoints.length - 2 );
				if ( distance ) {
					var wayPointsIterator = _DataManager.editedRoute.wayPoints.iterator;
					while ( ! wayPointsIterator.done ) {
						var latLngDistance = this.getClosestLatLngDistance ( 
							_DataManager.editedRoute,
							wayPointsIterator.value.latLng 
						);
						if ( distance < latLngDistance.distance ) {
							_DataManager.editedRoute.wayPoints.moveTo ( newWayPoint.objId, wayPointsIterator.value.objId, true );
							break;
						}
					}
				}
				else {
					_DataManager.editedRoute.wayPoints.swap ( newWayPoint.objId, true );
				}
				_RouteEditorUI.setWayPointsList ( );
				this.startRouting ( );
			},
			
			/*
			--- addWayPoint method ------------------------------------------------------------------------------------

			This method add a waypoint at a given position on the edited route
			
			parameters:
			- latLng : 
			- event :

			-----------------------------------------------------------------------------------------------------------
			*/

			addWayPointOnRoute : function ( routeObjId, event ) {
				var latLngDistance = this.getClosestLatLngDistance ( 
					_DataManager.getRoute ( routeObjId ),
					[ event.latlng.lat, event.latlng.lng ] 
				);
				this.addWayPoint ( latLngDistance.latLng, null, latLngDistance.distance );
			},
			
			/*
			--- reverseWayPoints method -------------------------------------------------------------------------------

			This method reverse the waypoints order
			
			-----------------------------------------------------------------------------------------------------------
			*/

			reverseWayPoints : function ( ) {
				_DataManager.editedRoute.routeChanged = true;
				var wayPointsIterator = _DataManager.editedRoute.wayPoints.iterator;
				while ( ! wayPointsIterator.done ) {
					_MapEditor.removeObject ( wayPointsIterator.value.objId );
				}
				_DataManager.editedRoute.wayPoints.reverse ( );
				wayPointsIterator = _DataManager.editedRoute.wayPoints.iterator;
				while ( ! wayPointsIterator.done ) {
					_MapEditor.addWayPoint ( wayPointsIterator.value, wayPointsIterator .first ? 'A' : ( wayPointsIterator.last ? 'B' : wayPointsIterator.index ) );
				}
				_RouteEditorUI.setWayPointsList ( );
				this.startRouting ( );
			},
			
			/*
			--- removeAllWayPoints method -----------------------------------------------------------------------------

			This method remove all waypoints except the first and last ( see Collection to understand...)
			
			-----------------------------------------------------------------------------------------------------------
			*/

			removeAllWayPoints : function ( ) {
				_DataManager.editedRoute.routeChanged = true;
				var wayPointsIterator = _DataManager.editedRoute.wayPoints.iterator;
				while ( ! wayPointsIterator.done ) {
					_MapEditor.removeObject ( wayPointsIterator.value.objId );
				}
				_DataManager.editedRoute.wayPoints.removeAll ( true );
				_RouteEditorUI.setWayPointsList ( );
				this.startRouting ( );
			},
			
			/*
			--- removeWayPoint method ---------------------------------------------------------------------------------

			This method remove a waypoint
			
			parameters:
			- wayPointObjId : the waypoint objId to remove

			-----------------------------------------------------------------------------------------------------------
			*/

			removeWayPoint : function ( wayPointObjId ) {
				_DataManager.editedRoute.routeChanged = true;
				_MapEditor.removeObject ( wayPointObjId );
				_DataManager.editedRoute.wayPoints.remove ( wayPointObjId );
				_RouteEditorUI.setWayPointsList ( );
				this.startRouting ( );
			},
			
			/*
			--- renameWayPoint method ---------------------------------------------------------------------------------

			This method rename a wayPoint
			
			parameters:
			- wayPointObjId : the waypoint objId to rename
			- wayPointName : the new name

			-----------------------------------------------------------------------------------------------------------
			*/

			renameWayPoint : function ( wayPointName, wayPointObjId ) {
				_DataManager.editedRoute.routeChanged = true;
				_DataManager.editedRoute.wayPoints.getAt ( wayPointObjId ).name = wayPointName;
				_RouteEditorUI.setWayPointsList ( );
			},
			
			/*
			--- swapWayPoints method ----------------------------------------------------------------------------------

			This method change the order of two waypoints
			
			parameters:
			- wayPointObjId : the waypoint objId to swap
			- swapUp : when true the waypoint is swapped with the previous one, otherwise with the next

			-----------------------------------------------------------------------------------------------------------
			*/

			swapWayPoints : function ( wayPointObjId, swapUp ) {
				_DataManager.editedRoute.routeChanged = true;
				_DataManager.editedRoute.wayPoints.swap ( wayPointObjId, swapUp );
				_RouteEditorUI.setWayPointsList (  );
				this.startRouting ( );
			},
			
			/*
			--- setStartPoint method ----------------------------------------------------------------------------------

			This method set the start waypoint
			
			parameters:
			- latLng : the coordinates of the start waypoint

			-----------------------------------------------------------------------------------------------------------
			*/

			setStartPoint : function ( latLng ) {
				_DataManager.editedRoute.routeChanged = true;
				if ( 0 !== _DataManager.editedRoute.wayPoints.first.lat ) {
					_MapEditor.removeObject ( _DataManager.editedRoute.wayPoints.first.objId );
				}
				_DataManager.editedRoute.wayPoints.first.latLng = latLng;
				if ( _DataManager.config.wayPoint.reverseGeocoding ) {
					require ( '../core/GeoCoder' ) ( ).getAddress ( latLng [ 0 ], latLng [ 1 ], this.renameWayPoint, this, _DataManager.editedRoute.wayPoints.first.objId );
				}
				_MapEditor.addWayPoint ( _DataManager.editedRoute.wayPoints.first, 'A' );
				_RouteEditorUI.setWayPointsList ( );
				this.startRouting ( );
			},
			
			/*
			--- setEndPoint method ------------------------------------------------------------------------------------

			This method set the end waypoint
			
			parameters:
			- latLng : the coordinates of the end waypoint


			-----------------------------------------------------------------------------------------------------------
			*/

			setEndPoint : function ( latLng ) {
				_DataManager.editedRoute.routeChanged = true;
				if ( 0 !== _DataManager.editedRoute.wayPoints.last.lat ) {
					_MapEditor.removeObject ( _DataManager.editedRoute.wayPoints.last.objId );
				}
				_DataManager.editedRoute.wayPoints.last.latLng = latLng;
				if ( _DataManager.config.wayPoint.reverseGeocoding ) {
					require ( '../core/GeoCoder' ) ( ).getAddress ( latLng [ 0 ], latLng [ 1 ], this.renameWayPoint, this, _DataManager.editedRoute.wayPoints.last.objId );
				}
				_MapEditor.addWayPoint ( _DataManager.editedRoute.wayPoints.last, 'B' );
				_RouteEditorUI.setWayPointsList ( );
				this.startRouting ( );
			},
			
			/*
			--- wayPointDragEnd method --------------------------------------------------------------------------------

			This method is called when the dragend event is fired on a waypoint
			
			parameters:
			- wayPointObjId : the TravelNotes waypoint objId

			-----------------------------------------------------------------------------------------------------------
			*/

			wayPointDragEnd : function ( wayPointObjId ) {
				_DataManager.editedRoute.routeChanged = true;
				if ( _DataManager.config.wayPoint.reverseGeocoding ) {
					var latLng = _DataManager.editedRoute.wayPoints.getAt ( wayPointObjId ).latLng;
					require ( '../core/GeoCoder' ) ( ).getAddress ( latLng [ 0 ], latLng [ 1 ], this.renameWayPoint, this, wayPointObjId );
				}
				_RouteEditorUI.setWayPointsList ( );
				this.startRouting ( );
			},
			
			/*
			--- wayPointDropped method --------------------------------------------------------------------------------

			This method is called when the drop event is fired on a waypoint
			
			-----------------------------------------------------------------------------------------------------------
			*/

			wayPointDropped : function ( draggedWayPointObjId, targetWayPointObjId, draggedBefore ) {
				_DataManager.editedRoute.routeChanged = true;
				if ( targetWayPointObjId === _DataManager.editedRoute.wayPoints.first.objId && draggedBefore ) {
					return;
				}
				if ( targetWayPointObjId === _DataManager.editedRoute.wayPoints.last.objId && ( ! draggedBefore ) )	{
					return;
				}
				_DataManager.editedRoute.wayPoints.moveTo ( draggedWayPointObjId, targetWayPointObjId, draggedBefore );
				_RouteEditorUI.setWayPointsList ( );
				var wayPointsIterator = _DataManager.editedRoute.wayPoints.iterator;
				while ( ! wayPointsIterator.done ) {
						_MapEditor.removeObject ( wayPointsIterator.value.objId );
						_MapEditor.addWayPoint ( wayPointsIterator.value, wayPointsIterator.first ? 'A' : ( wayPointsIterator.last ? 'B' :  wayPointsIterator.index ) );
				}
				this.startRouting ( );
			},
			
			/*
			--- hideRoute method --------------------------------------------------------------------------------------

			This method hide a route on the map
			
			parameters:
			- routeObjId : the route objId that was clicked

			-----------------------------------------------------------------------------------------------------------
			*/

			hideRoute : function ( routeObjId ) {
				var route = _DataManager.getRoute ( routeObjId );
				if ( route ) {
					_MapEditor.removeRoute ( route, true, true );
					route.hidden = true;
				}
			},
			
			/*
			--- showRoutes method -------------------------------------------------------------------------------------

			This method show all the hidden routes
			
			-----------------------------------------------------------------------------------------------------------
			*/

			showRoutes : function ( ) {
				var routesIterator = _DataManager.travel.routes.iterator;
				while ( ! routesIterator.done ) {
					if ( routesIterator.value.hidden ) {
						_MapEditor.addRoute ( routesIterator.value, true, true, false );
					}
				}
			},

			/*
			--- getMapContextMenu method ------------------------------------------------------------------------------

			This method gives the route part of the map context menu
			
			parameters:
			- latLng : the coordinates where the map was clicked

			-----------------------------------------------------------------------------------------------------------
			*/

			getMapContextMenu :function ( latLng ) {
				var contextMenu = [];
				contextMenu.push ( 
					{ 
						context : this, 
						name : _Translator.getText ( "RouteEditor - Select this point as start point" ), 
						action : ( -1 !== _DataManager.editedRoute.routeInitialObjId ) && ( 0 === _DataManager.editedRoute.wayPoints.first.lat ) ? this.setStartPoint : null,
						param : latLng
					} 
				);
				contextMenu.push ( 
					{
						context : this, 
						name : _Translator.getText ( "RouteEditor - Select this point as way point" ), 
						action : ( -1 !== _DataManager.editedRoute.routeInitialObjId ) ? this.addWayPoint : null,
						param : latLng
					}
				);
				contextMenu.push (
					{ 
						context : this, 
						name : _Translator.getText ( "RouteEditor - Select this point as end point" ), 
						action : ( -1 !== _DataManager.editedRoute.routeInitialObjId ) && ( 0 === _DataManager.editedRoute.wayPoints.last.lat ) ? this.setEndPoint : null,
						param : latLng
					}
				);
				return contextMenu;
			},

			/*
			--- getWayPointContextMenu method --------------------------------------------------------------------------

			This method gives the wayPoint context menu
			
			parameters:
			- wayPointObjId : the wayPoint objId that was clicked

			-----------------------------------------------------------------------------------------------------------
			*/

			getWayPointContextMenu : function ( wayPointObjId ) {
				var contextMenu = [];
				contextMenu.push ( 
					{ 
						context : this, 
						name : _Translator.getText ( "RouteEditor - Delete this waypoint" ), 
						action : ( ( _DataManager.editedRoute.wayPoints.first.objId !== wayPointObjId ) && ( _DataManager.editedRoute.wayPoints.last.objId !== wayPointObjId ) ) ? this.removeWayPoint : null,
						param: wayPointObjId
					} 
				);
				return contextMenu;
			},

			/*
			--- getRouteContextMenu method ----------------------------------------------------------------------------

			This method gives the route context menu
			
			parameters:
			- routeObjId : the route objId that was clicked

			-----------------------------------------------------------------------------------------------------------
			*/

			getRouteContextMenu : function ( routeObjId ) {
				var contextMenu = [];
				var travelEditor = require ( '../core/TravelEditor' ) ( );
				contextMenu.push ( 
					{ 
						context : this, 
						name : _Translator.getText ( "RouteEditor - Edit this route" ), 
						action : ( ( _DataManager.editedRoute.routeInitialObjId !== routeObjId ) && ( ! _DataManager.editedRoute.routeChanged ) ) ? this.editRoute : null,
						param: routeObjId
					} 
				);
				contextMenu.push ( 
					{
						context : travelEditor, 
						name : _Translator.getText ( "RouteEditor - Delete this route" ), 
						action : ( ( _DataManager.editedRoute.routeInitialObjId !== routeObjId ) && ( ! _DataManager.editedRoute.routeChanged ) ) ? travelEditor.removeRoute : null,
						param: routeObjId
					}
				);
				contextMenu.push ( 
					{
						context : travelEditor, 
						name : _Translator.getText ( "RouteEditor - Hide this route" ), 
						action : ( _DataManager.editedRoute.objId !== routeObjId ) ? this.hideRoute : null,
						param: routeObjId
					}
				);
				contextMenu.push ( 
					{
						context : this, 
						name : _Translator.getText ( "RouteEditor - Add a waypoint on the route" ), 
						action : ( -1 !== _DataManager.editedRoute.routeInitialObjId ) ? this.addWayPointOnRoute : null,
						param: routeObjId
					}
				);
				contextMenu.push ( 
					{
						context : _NoteEditor, 
						name : _Translator.getText ( "RouteEditor - Add a note on the route" ), 
						action : _NoteEditor.newRouteNote,
						param: routeObjId
					}
				);
				contextMenu.push ( 
					{
						context : this, 
						name : _Translator.getText ( "RouteEditor - Properties" ), 
						action : this.routeProperties,
						param: routeObjId
					}
				);
				contextMenu.push ( 
					{
						context : _MapEditor, 
						name : _Translator.getText ( "RouteEditor - Zoom to route" ), 
						action : _MapEditor.zoomToRoute,
						param: routeObjId
					}
				);
				contextMenu.push (
					{ 
						context : this, 
						name : _Translator.getText ( "RouteEditor - Save modifications on this route" ), 
						action : ( _DataManager.editedRoute.objId === routeObjId ) ? this.saveEdition : null,
					}
				);
				contextMenu.push (
					{ 
						context : this, 
						name : _Translator.getText ( "RouteEditor - Cancel modifications on this route" ), 
						action : ( _DataManager.editedRoute.objId === routeObjId ) ? this.cancelEdition : null
					}
				);
				return contextMenu;
			}
		};
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = RouteEditor;
	}

}());

/*
--- End of RouteEditor.js file ----------------------------------------------------------------------------------------
*/