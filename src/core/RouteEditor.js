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
	- v1.1.0:
		- Issue #28 : Disable "select this point as start point " and "select this point as end point" when a start point or end point is already present
		- Issue #30 : Add a context menu with delete command to the waypoints
		- Issue #33 : Add a command to hide a route
		- Issue #34 : Add a command to show all routes
	- v1.3.0:
		- added cutRoute method (not tested...)
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
		- modified getClosestLatLngDistance to avoid crash on empty routes
		- fixed issue #45
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	var g_TravelNotesData = require ( '../L.TravelNotes' );
	
	var s_ZoomToRoute = false;

		
	/*
	--- routeEditor function ------------------------------------------------------------------------------------------

	Patterns : Closure

	-------------------------------------------------------------------------------------------------------------------
	*/

	var routeEditor = function ( ) {
		
		var m_DataSearchEngine  = require ( '../Data/DataSearchEngine' ) ( );
		var m_Translator = require ( '../UI/Translator' ) ( );
		var m_NoteEditor = require ( '../core/NoteEditor' ) ( );
		var m_MapEditor = require ( '../core/MapEditor' ) ( );
		var m_RouteEditorUI = require ( '../UI/RouteEditorUI' ) ( );

		/*
		--- m_CutRoute function ---------------------------------------------------------------------------------------

		This function cut a route at a given point
		Warning: not tested, not used!!!
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_CutRoute = function ( route, latLng ) {

			// an array is created with 2 clones of the route
			var routes = [ require ( '../data/Route' ) ( ), require ( '../data/Route' ) ( ) ];
			routes [ 0 ].object = route.object;
			routes [ 1 ].object = route.object;
			
			// and the itineraryPoints are removed
			routes [ 0 ].itinerary.itineraryPoints.removeAll ( );
			routes [ 1 ].itinerary.itineraryPoints.removeAll ( );
			
			// the distance between the origin and the cutting point is computed
			var cuttingPointLatLngDistance = m_GetClosestLatLngDistance ( route, latLng );

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
		};

		/*
		--- m_ComputeRouteDistances function -----------------------------------------------------------------------

		This function compute the route, itineraryPoints and maneuvers distances
		
		parameters:
		- route : the TravelNotes route object to be used

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_ComputeRouteDistances = function ( route ) {
			// Computing the distance between itineraryPoints
			var itineraryPointsIterator = route.itinerary.itineraryPoints.iterator;
			var maneuverIterator = route.itinerary.maneuvers.iterator;
			var dummy = itineraryPointsIterator.done;
			dummy = maneuverIterator.done;
			var previousItineraryPoint = itineraryPointsIterator.value;
			var previousManeuver = maneuverIterator.value;
			previousManeuver.distance = 0;
			dummy = maneuverIterator.done;
			route.distance = 0;
			route.duration = 0;
			while ( ! itineraryPointsIterator.done ) {
				previousItineraryPoint.distance = L.latLng ( previousItineraryPoint.latLng ).distanceTo ( L.latLng ( itineraryPointsIterator.value.latLng ));
				if (  maneuverIterator.value.itineraryPointObjId === itineraryPointsIterator.value.objId ) {
					route.duration += previousManeuver.duration;
					previousManeuver =  maneuverIterator.value;
					maneuverIterator.value.distance = 0;
					dummy = maneuverIterator.done;
				}
				route.distance += previousItineraryPoint.distance;
				previousManeuver.distance += previousItineraryPoint.distance;
				previousItineraryPoint = itineraryPointsIterator.value;
			}
		};

		/*
		--- m_GetClosestLatLngDistance function -----------------------------------------------------------------------

		This function search the nearest point on a route from a given point and compute the distance
		between the beginning of the route and the nearest point
		
		parameters:
		- route : the TravelNotes route object to be used
		- latLng : the coordinates of the point

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_GetClosestLatLngDistance = function ( route, latLng ) {
			
			if ( 0 === route.itinerary.itineraryPoints.length ) {
				return null;
			}
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
		};
	
		/*
		--- m_SaveGpx function ----------------------------------------------------------------------------------------

		This function save the currently edited route to a GPX file
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_SaveGpx = function ( ) {
			// initializations...
			var tab0 = "\n";
			var tab1 = "\n\t";
			var tab2 = "\n\t\t";
			var tab3 = "\n\t\t\t";
			var timeStamp = "time='" + new Date ( ).toISOString ( ) + "' ";
			
			// header
			var gpxString = "<?xml version='1.0'?>" + tab0;
			gpxString += "<gpx xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xsi:schemaLocation='http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd' version='1.1' creator='leaflet.TravelNotes'>";

			// waypoints
			var wayPointsIterator = g_TravelNotesData.editedRoute.wayPoints.iterator;
			while ( ! wayPointsIterator.done )
			{
				gpxString += 
					tab1 + "<wpt lat='" + wayPointsIterator.value.lat + "' lon='" + wayPointsIterator.value.lng + "' " +
					timeStamp + "/>";
				
			}
			
			// route
			gpxString += tab1 + "<rte>";
			var maneuverIterator = g_TravelNotesData.editedRoute.itinerary.maneuvers.iterator;
			while ( ! maneuverIterator.done ) {
				var wayPoint = g_TravelNotesData.editedRoute.itinerary.itineraryPoints.getAt ( maneuverIterator.value.itineraryPointObjId );
				var instruction = maneuverIterator.value.instruction.replace ( '&', '&amp;' ).replace ( '\'', '&apos;' ).replace ('\"', '&quote;').replace ( '>', '&gt;' ).replace ( '<', '&lt;');
				gpxString +=
					tab2 + "<rtept lat='" + wayPoint.lat + "' lon='" + wayPoint.lng +"' " + timeStamp + "desc='" + instruction + "' />" ;
			}
			gpxString += tab1 + "</rte>";
			
			// track
			gpxString += tab1 + "<trk>";
			gpxString += tab2 + "<trkseg>";
			var itineraryPointsIterator = g_TravelNotesData.editedRoute.itinerary.itineraryPoints.iterator;
			while ( ! itineraryPointsIterator.done ) {
				gpxString +=
					tab3 + "<trkpt lat='" + itineraryPointsIterator.value.lat + "' lon='" + itineraryPointsIterator.value.lng + "' " + timeStamp + " />";
			}
			gpxString += tab2 + "</trkseg>";				
			gpxString += tab1 + "</trk>";
			
			// eof
			gpxString += tab0 + "</gpx>";
			
			// file is saved
			var fileName = g_TravelNotesData.editedRoute.name;
			if ( '' === fileName ) {
				fileName = 'TravelNote';
			}
			fileName += '.gpx';
			require ( '../util/Utilities' ) ( ).saveFile ( fileName, gpxString );
		};
		
		/*
		--- m_GetRouteHTML function -----------------------------------------------------------------------------------

		This function returns an HTML string with the route contents. This string will be used in the
		route popup and on the roadbook page
		
		parameters:
		- route : the TravelNotes route object
		- classNamePrefix : a string that will be added to all the HTML classes

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_GetRouteHTML = function ( route, classNamePrefix ) {
			
			var utilities = require ( '../util/Utilities' ) ( );

			var returnValue = '<div class="' + classNamePrefix + 'Route-Header-Name">' +
				route.name + 
				'</div>';
			if (0 !== route.distance ) {
				returnValue += '<div class="' + classNamePrefix + 'Route-Header-Distance">' +
					m_Translator.getText ( 'RouteEditor - Distance', { distance : utilities.formatDistance ( route.distance ) } ) + '</div>' +
					'<div class="' + classNamePrefix + 'Route-Header-Duration">' +
					m_Translator.getText ( 'RouteEditor - Duration', { duration : utilities.formatTime ( route.duration ) } ) + '</div>';
			}
			
			return returnValue;
		};
			
		/*
		--- m_ChainRoutes function ------------------------------------------------------------------------------------

		This function recompute the distances when routes are chained
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_ChainRoutes = function ( ) {
			var routesIterator = g_TravelNotesData.travel.routes.iterator;
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
		};
			
		/*
		--- m_StartRouting function -----------------------------------------------------------------------------------

		This function start the router
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_StartRouting = function ( ) {
			if ( ! g_TravelNotesData.config.routing.auto ) {
				return;
			}
			s_ZoomToRoute = 0 === g_TravelNotesData.editedRoute.itinerary.itineraryPoints.length;
			require ( '../core/Router' ) ( ).startRouting ( g_TravelNotesData.editedRoute );
		};
			
			
		/*
		--- m_EndRouting function -------------------------------------------------------------------------------------

		This function is called by the router when a routing operation is successfully finished
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_EndRouting = function ( ) {
			// the previous route is removed from the leaflet map
			m_MapEditor.removeRoute ( g_TravelNotesData.editedRoute, true, true );
			
			// the position of the notes linked to the route is recomputed
			var notesIterator = g_TravelNotesData.editedRoute.notes.iterator;
			while ( ! notesIterator.done ) {
				var latLngDistance = m_GetClosestLatLngDistance ( g_TravelNotesData.editedRoute, notesIterator.value.latLng );
				notesIterator.value.latLng = latLngDistance.latLng;
				notesIterator.value.distance = latLngDistance.distance;
			}
			
			// and the notes sorted
			g_TravelNotesData.editedRoute.notes.sort ( function ( a, b ) { return a.distance - b.distance; } );
			
			// the new route is added to the map
			m_MapEditor.addRoute ( g_TravelNotesData.editedRoute, true, true );
			if ( s_ZoomToRoute ) {
				m_MapEditor.zoomToRoute ( g_TravelNotesData.editedRoute.objId );
			}
			
			// and the itinerary and waypoints are displayed
			require ( '../UI/DataPanesUI' ) ( ).setItinerary ( );
			m_RouteEditorUI.setWayPointsList ( );
			
			// the HTML page is adapted ( depending of the config.... )
			m_ChainRoutes ( );
			require ( '../core/TravelEditor' ) ( ).updateRoadBook ( );
		};

		/*
		--- m_SaveEdition function ------------------------------------------------------------------------------------

		This function save the current edited route
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_SaveEdition = function ( ) {
			// the edited route is cloned
			var clonedRoute = require ( '../data/Route' ) ( );
			clonedRoute.object = g_TravelNotesData.editedRoute.object;
			// and the initial route replaced with the clone
			g_TravelNotesData.travel.routes.replace ( g_TravelNotesData.routeEdition.routeInitialObjId, clonedRoute );
			g_TravelNotesData.routeEdition.routeInitialObjId = clonedRoute.objId;
			m_CancelEdition ( );
		};
			
		/*
		--- m_CancelEdition function ----------------------------------------------------------------------------------

		This function cancel the current edited route
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_CancelEdition = function ( ) {
			m_MapEditor.removeRoute ( g_TravelNotesData.editedRoute, true, true );
			if ( -1 !== g_TravelNotesData.routeEdition.routeInitialObjId ) {
				m_MapEditor.addRoute ( m_DataSearchEngine.getRoute ( g_TravelNotesData.routeEdition.routeInitialObjId ), true, false );
			}

			g_TravelNotesData.editedRoute = require ( '../data/Route' ) ( );
			g_TravelNotesData.routeEdition.routeChanged = false;
			g_TravelNotesData.routeEdition.routeInitialObjId = -1;
			require ( '../UI/TravelEditorUI' ) ( ).setRoutesList ( );
			m_RouteEditorUI.setWayPointsList ( );
			m_RouteEditorUI .reduce ( );
			require ( '../UI/DataPanesUI' ) ( ).setItinerary ( );
			m_ChainRoutes ( );
			require ( '../core/TravelEditor' ) ( ).updateRoadBook ( );
		};
		
		/*
		--- m_RouteProperties function --------------------------------------------------------------------------------

		This function opens the RouteProperties dialog
		
		parameters:
		- routeObjId : 

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_RouteProperties = function ( routeObjId ) {
			var route = m_DataSearchEngine.getRoute ( routeObjId );
			require ( '../UI/RoutePropertiesDialog' ) ( route );
		};
			
		/*
		--- m_HideRoute function --------------------------------------------------------------------------------------

		This function hide a route on the map
		
		parameters:
		- routeObjId : the route objId that was clicked

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_HideRoute = function ( routeObjId ) {
			var route = m_DataSearchEngine.getRoute ( routeObjId );
			if ( route ) {
				m_MapEditor.removeRoute ( route, true, true );
				route.hidden = true;
			}
		};
			
		/*
		--- m_ShowRoutes function -------------------------------------------------------------------------------------

		This function show all the hidden routes
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_ShowRoutes = function ( ) {
			var routesIterator = g_TravelNotesData.travel.routes.iterator;
			while ( ! routesIterator.done ) {
				if ( routesIterator.value.hidden ) {
					m_MapEditor.addRoute ( routesIterator.value, true, true, false );
				}
			}
		};

		/*
		--- routeEditor object ----------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return Object.seal (
			{
				
				cutRoute : function ( route, latLng ) { return m_CutRoute ( route, latLng ); },
				
				computeRouteDistances : function ( route ) { m_ComputeRouteDistances ( route ); },

				getClosestLatLngDistance : function ( route, latLng ) { return m_GetClosestLatLngDistance ( route, latLng ); },

				saveGpx : function ( ) { m_SaveGpx ( ); },
				
				getRouteHTML : function ( route, classNamePrefix ) { return m_GetRouteHTML ( route, classNamePrefix ); },

				chainRoutes : function ( ) { m_ChainRoutes ( ); },
				
				startRouting : function ( ) { m_StartRouting ( ); },
				
				endRouting : function ( ) { m_EndRouting ( ); },

				saveEdition : function ( ) { m_SaveEdition ( ); },
				
				cancelEdition : function ( ) { m_CancelEdition ( ); },
				
				routeProperties : function ( routeObjId ) { m_RouteProperties ( routeObjId ); },
			
				hideRoute : function ( routeObjId ) { m_HideRoute ( routeObjId ); },

				showRoutes : function ( ) { m_ShowRoutes ( ); },
			}
		);
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = routeEditor;
	}

}());

/*
--- End of RouteEditor.js file ----------------------------------------------------------------------------------------
*/