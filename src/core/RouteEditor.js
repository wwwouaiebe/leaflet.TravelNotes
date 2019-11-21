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
--- RouteEditor.js file -------------------------------------------------------------------------------------------------
This file contains:
	- the newRouteEditor function
	- the g_RouteEditor object
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
	- v1.5.0:
		- Issue #52 : when saving the travel to the file, save also the edited route.
		- Issue #62 : Remove time from route popup when readonly travel.
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed ...
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

'use strict';

/* global L */

export { g_RouteEditor };
import { g_TravelEditor } from '../core/TravelEditor.js';

import { g_Config } from '../data/Config.js';
import { g_Translator } from '../UI/Translator.js';
import { g_TravelNotesData } from '../data/TravelNotesData.js';
import { g_MapEditor } from '../core/MapEditor.js';

import { newDataSearchEngine } from '../data/DataSearchEngine.js';
import { newRouteEditorUI } from '../UI/RouteEditorUI.js';
import { newRoute } from '../data/Route.js';
import { newItineraryPoint } from '../data/ItineraryPoint.js';
import { newUtilities } from '../util/Utilities.js';
import { newRouter } from '../core/Router.js';
import { newDataPanesUI } from '../UI/DataPanesUI.js';
import { newTravelEditorUI } from '../UI/TravelEditorUI.js';
import { newRoutePropertiesDialog } from '../UI/RoutePropertiesDialog.js';

let s_ZoomToRoute = false;
	
/*
--- newRouteEditor function -------------------------------------------------------------------------------------------

Patterns : Closure and Singleton

-----------------------------------------------------------------------------------------------------------------------
*/

function newRouteEditor ( ) {
	
	let m_DataSearchEngine  = newDataSearchEngine ( );
	let m_RouteEditorUI = newRouteEditorUI ( );
	let m_Utilities = newUtilities ( );
	let m_DataPanesUI = newDataPanesUI ( );

	/*
	--- m_CutRoute function -------------------------------------------------------------------------------------------

	This function cut a route at a given point
	Warning: not tested, not used!!!
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CutRoute ( route, latLng ) {

		// an array is created with 2 clones of the route
		let routes = [ newRoute ( ), newRoute ( ) ];
		routes [ 0 ].object = route.object;
		routes [ 1 ].object = route.object;
		
		// and the itineraryPoints are removed
		routes [ 0 ].itinerary.itineraryPoints.removeAll ( );
		routes [ 1 ].itinerary.itineraryPoints.removeAll ( );
		
		// the distance between the origin and the cutting point is computed
		let cuttingPointLatLngDistance = m_GetClosestLatLngDistance ( route, latLng );

		// iteration on the itineraryPoints
		let itineraryPointIterator = route.itinerary.itineraryPoints.iterator;
		let iterationDistance = 0;
		let itineraryPoint;
		let previousItineraryPoint = null;
		
		let routeCounter = 0;
		while ( ! itineraryPointIterator.done ) {
			itineraryPoint = newItineraryPoint ( );
			itineraryPoint.object = itineraryPointIterator.value.object;
			if ( 0 === routeCounter && 0 != iterationDistance && iterationDistance > cuttingPointLatLngDistance.distance ) {
				// we have passed the cutting point...
				let removedDistance = L.latLng ( cuttingPointLatLngDistance.latLng ).distanceTo ( L.latLng ( itineraryPointIterator.value.latLng ) );
				// a new point is created at the cutting point position and added to the first route.
				let cuttingPoint = newItineraryPoint ( );
				cuttingPoint.latLng = cuttingPointLatLngDistance.latLng;
				routes [ 0 ].itinerary.itineraryPoints.add ( cuttingPoint );
				routes [ 0 ].distance = iterationDistance - removedDistance;
				if ( previousItineraryPoint ) {
					previousItineraryPoint.distance -= removedDistance;
				}

				routeCounter = 1;
				
				// a new point is created at the cutting point position and added to the second route.
				cuttingPoint = newItineraryPoint ( );
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
	}

	/*
	--- m_ComputeRouteDistances function ------------------------------------------------------------------------------

	This function compute the route, itineraryPoints and maneuvers distances
	
	parameters:
	- route : the TravelNotes route object to be used

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_ComputeRouteDistances ( route ) {
		// Computing the distance between itineraryPoints
		let itineraryPointsIterator = route.itinerary.itineraryPoints.iterator;
		let maneuverIterator = route.itinerary.maneuvers.iterator;
		itineraryPointsIterator.done;
		maneuverIterator.done;
		let previousItineraryPoint = itineraryPointsIterator.value;
		let previousManeuver = maneuverIterator.value;
		previousManeuver.distance = 0;
		maneuverIterator.done;
		route.distance = 0;
		route.duration = 0;
		while ( ! itineraryPointsIterator.done ) {
			previousItineraryPoint.distance = L.latLng ( previousItineraryPoint.latLng ).distanceTo ( L.latLng ( itineraryPointsIterator.value.latLng ));
			if (  maneuverIterator.value.itineraryPointObjId === itineraryPointsIterator.value.objId ) {
				route.duration += previousManeuver.duration;
				previousManeuver =  maneuverIterator.value;
				maneuverIterator.value.distance = 0;
				maneuverIterator.done;
			}
			route.distance += previousItineraryPoint.distance;
			previousManeuver.distance += previousItineraryPoint.distance;
			previousItineraryPoint = itineraryPointsIterator.value;
		}
	}

	/*
	--- m_GetClosestLatLngDistance function ---------------------------------------------------------------------------

	This function search the nearest point on a route from a given point and compute the distance
	between the beginning of the route and the nearest point
	
	parameters:
	- route : the TravelNotes route object to be used
	- latLng : the coordinates of the point

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_GetClosestLatLngDistance ( route, latLng ) {
		
		if ( 0 === route.itinerary.itineraryPoints.length ) {
			return null;
		}
		// an iterator on the route points is created...
		let itineraryPointIterator = route.itinerary.itineraryPoints.iterator;
		// ... and placed on the first point
		itineraryPointIterator.done;
		// the smallest distance is initialized ...
		let minDistance = Number.MAX_VALUE;
		// projections of points are made
		let point = L.Projection.SphericalMercator.project ( L.latLng ( latLng [ 0 ], latLng [ 1 ] ) );
		let point1 = L.Projection.SphericalMercator.project ( L.latLng ( itineraryPointIterator.value.lat, itineraryPointIterator.value.lng ) );
		// variables initialization
		let closestLatLng = null;
		let closestDistance = 0;
		let endSegmentDistance = itineraryPointIterator.value.distance;
		// iteration on the route points
		while ( ! itineraryPointIterator.done ) {
			// projection of the second point...
			let point2 = L.Projection.SphericalMercator.project ( L.latLng ( itineraryPointIterator.value.lat, itineraryPointIterator.value.lng ) );
			// and distance is computed
			let distance = L.LineUtil.pointToSegmentDistance ( point, point1, point2 );
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
	}

	/*
	--- m_SaveGpx function --------------------------------------------------------------------------------------------

	This function save the currently edited route to a GPX file
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_SaveGpx ( ) {
		// initializations...
		let tab0 = "\n";
		let tab1 = "\n\t";
		let tab2 = "\n\t\t";
		let tab3 = "\n\t\t\t";
		let timeStamp = "time='" + new Date ( ).toISOString ( ) + "' ";
		
		// header
		let gpxString = "<?xml version='1.0'?>" + tab0;
		gpxString += "<gpx xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xsi:schemaLocation='http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd' version='1.1' creator='leaflet.TravelNotes'>";

		// waypoints
		let wayPointsIterator = g_TravelNotesData.travel.editedRoute.wayPoints.iterator;
		while ( ! wayPointsIterator.done )
		{
			gpxString += 
				tab1 + "<wpt lat='" + wayPointsIterator.value.lat + "' lon='" + wayPointsIterator.value.lng + "' " +
				timeStamp + "/>";
			
		}
		
		// route
		gpxString += tab1 + "<rte>";
		let maneuverIterator = g_TravelNotesData.travel.editedRoute.itinerary.maneuvers.iterator;
		while ( ! maneuverIterator.done ) {
			let wayPoint = g_TravelNotesData.travel.editedRoute.itinerary.itineraryPoints.getAt ( maneuverIterator.value.itineraryPointObjId );
			let instruction = maneuverIterator.value.instruction.replace ( '&', '&amp;' ).replace ( '\'', '&apos;' ).replace ('"', '&quote;').replace ( '>', '&gt;' ).replace ( '<', '&lt;');
			gpxString +=
				tab2 + "<rtept lat='" + wayPoint.lat + "' lon='" + wayPoint.lng +"' " + timeStamp + "desc='" + instruction + "' />" ;
		}
		gpxString += tab1 + "</rte>";
		
		// track
		gpxString += tab1 + "<trk>";
		gpxString += tab2 + "<trkseg>";
		let itineraryPointsIterator = g_TravelNotesData.travel.editedRoute.itinerary.itineraryPoints.iterator;
		while ( ! itineraryPointsIterator.done ) {
			gpxString +=
				tab3 + "<trkpt lat='" + itineraryPointsIterator.value.lat + "' lon='" + itineraryPointsIterator.value.lng + "' " + timeStamp + " />";
		}
		gpxString += tab2 + "</trkseg>";				
		gpxString += tab1 + "</trk>";
		
		// eof
		gpxString += tab0 + "</gpx>";
		
		// file is saved
		let fileName = g_TravelNotesData.travel.editedRoute.name;
		if ( '' === fileName ) {
			fileName = 'TravelNote';
		}
		fileName += '.gpx';
		m_Utilities.saveFile ( fileName, gpxString );
	}
	
	/*
	--- m_GetRouteHTML function ---------------------------------------------------------------------------------------

	This function returns an HTML string with the route contents. This string will be used in the
	route popup and on the roadbook page
	
	parameters:
	- route : the TravelNotes route object
	- classNamePrefix : a string that will be added to all the HTML classes

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_GetRouteHTML ( route, classNamePrefix ) {
		
		let returnValue = '<div class="' + classNamePrefix + 'Route-Header-Name">' +
			route.name + 
			'</div>';
		if ( 0 !== route.distance ) {
			returnValue += '<div class="' + classNamePrefix + 'Route-Header-Distance">' +
				g_Translator.getText ( 'RouteEditor - Distance', { distance : m_Utilities.formatDistance ( route.distance ) } ) + '</div>';
		}
		if ( ! g_TravelNotesData.travel.readOnly ) {
			returnValue += '<div class="' + classNamePrefix + 'Route-Header-Duration">' +
				g_Translator.getText ( 'RouteEditor - Duration', { duration : m_Utilities.formatTime ( route.duration ) } ) + '</div>';
		}
		
		return returnValue;
	}
		
	/*
	--- m_ChainRoutes function ----------------------------------------------------------------------------------------

	This function recompute the distances when routes are chained
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_ChainRoutes ( ) {
		let routesIterator = g_TravelNotesData.travel.routes.iterator;
		let chainedDistance = 0;
		while ( ! routesIterator.done ) {
			if ( routesIterator.value.chain ) {
				routesIterator.value.chainedDistance = chainedDistance;
				chainedDistance += routesIterator.value.distance;
			}
			else {
				routesIterator.value.chainedDistance = 0;
			}
			let notesIterator = routesIterator.value.notes.iterator;
			while (! notesIterator.done ) {
				notesIterator.value.chainedDistance = routesIterator.value.chainedDistance;
			}
		}
	}
		
	/*
	--- m_StartRouting function ---------------------------------------------------------------------------------------

	This function start the router
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_StartRouting ( ) {
		if ( ! g_Config.routing.auto ) {
			return;
		}
		s_ZoomToRoute = 0 === g_TravelNotesData.travel.editedRoute.itinerary.itineraryPoints.length;
		newRouter ( ).startRouting ( g_TravelNotesData.travel.editedRoute );
	}
		
		
	/*
	--- m_EndRouting function -----------------------------------------------------------------------------------------

	This function is called by the router when a routing operation is successfully finished
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_EndRouting ( ) {
		// the previous route is removed from the leaflet map
		g_MapEditor.removeRoute ( g_TravelNotesData.travel.editedRoute, true, true );
		
		// the position of the notes linked to the route is recomputed
		let notesIterator = g_TravelNotesData.travel.editedRoute.notes.iterator;
		while ( ! notesIterator.done ) {
			let latLngDistance = m_GetClosestLatLngDistance ( g_TravelNotesData.travel.editedRoute, notesIterator.value.latLng );
			notesIterator.value.latLng = latLngDistance.latLng;
			notesIterator.value.distance = latLngDistance.distance;
		}
		
		// and the notes sorted
		g_TravelNotesData.travel.editedRoute.notes.sort ( ( a, b ) => { return a.distance - b.distance; } );
		
		// the new route is added to the map
		g_MapEditor.addRoute ( g_TravelNotesData.travel.editedRoute, true, true );
		if ( s_ZoomToRoute ) {
			g_MapEditor.zoomToRoute ( g_TravelNotesData.travel.editedRoute.objId );
		}
		
		// and the itinerary and waypoints are displayed
		m_DataPanesUI.setItinerary ( );
		m_RouteEditorUI.setWayPointsList ( );
		
		// the HTML page is adapted ( depending of the config.... )
		m_ChainRoutes ( );
		g_TravelEditor.updateRoadBook ( );
	}

	/*
	--- m_SaveEdition function ----------------------------------------------------------------------------------------

	This function save the current edited route
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_SaveEdition ( ) {
		// the edited route is cloned
		let clonedRoute = newRoute ( );
		clonedRoute.object = g_TravelNotesData.travel.editedRoute.object;
		// and the initial route replaced with the clone
		g_TravelNotesData.travel.routes.replace ( g_TravelNotesData.editedRouteObjId, clonedRoute );
		g_TravelNotesData.editedRouteObjId = clonedRoute.objId;
		m_CancelEdition ( );
	}
		
	/*
	--- m_CancelEdition function --------------------------------------------------------------------------------------

	This function cancel the current edited route
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CancelEdition ( ) {
		g_MapEditor.removeRoute ( g_TravelNotesData.travel.editedRoute, true, true );
		if ( -1 !== g_TravelNotesData.editedRouteObjId ) {
			let editedRoute = m_DataSearchEngine.getRoute ( g_TravelNotesData.editedRouteObjId );
			editedRoute.edited = 0;
			g_MapEditor.addRoute ( editedRoute , true, false );
		}

		g_TravelNotesData.travel.editedRoute = newRoute ( );
		g_TravelNotesData.editedRouteObjId = -1;
		newTravelEditorUI ( ).setRoutesList ( );
		m_RouteEditorUI.setWayPointsList ( );
		m_RouteEditorUI .reduce ( );
		m_DataPanesUI.setItinerary ( );
		m_ChainRoutes ( );
		g_TravelEditor.updateRoadBook ( );
	}
	
	/*
	--- m_RouteProperties function ------------------------------------------------------------------------------------

	This function opens the RouteProperties dialog
	
	parameters:
	- routeObjId : 

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_RouteProperties ( routeObjId ) {
		let route = m_DataSearchEngine.getRoute ( routeObjId );
		newRoutePropertiesDialog ( route );
	}
		
	/*
	--- m_HideRoute function ------------------------------------------------------------------------------------------

	This function hide a route on the map
	
	parameters:
	- routeObjId : the route objId that was clicked

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_HideRoute ( routeObjId ) {
		let route = m_DataSearchEngine.getRoute ( routeObjId );
		if ( route ) {
			g_MapEditor.removeRoute ( route, true, true );
			route.hidden = true;
		}
	}
		
	/*
	--- m_ShowRoutes function -----------------------------------------------------------------------------------------

	This function show all the hidden routes
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_ShowRoutes ( ) {
		let routesIterator = g_TravelNotesData.travel.routes.iterator;
		while ( ! routesIterator.done ) {
			if ( routesIterator.value.hidden ) {
				g_MapEditor.addRoute ( routesIterator.value, true, true, false );
			}
		}
	}

	/*
	--- routeEditor object --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			
			cutRoute : ( route, latLng ) => { return m_CutRoute ( route, latLng ); },
			
			computeRouteDistances : route => m_ComputeRouteDistances ( route ),

			getClosestLatLngDistance : ( route, latLng ) => { return m_GetClosestLatLngDistance ( route, latLng ); },

			saveGpx : ( ) => m_SaveGpx ( ),
			
			getRouteHTML : ( route, classNamePrefix ) => { return m_GetRouteHTML ( route, classNamePrefix ); },

			chainRoutes : ( ) => m_ChainRoutes ( ),
			
			startRouting : ( ) => m_StartRouting ( ),
			
			endRouting : ( ) => m_EndRouting ( ),

			saveEdition : ( ) => m_SaveEdition ( ),
			
			cancelEdition : ( ) => m_CancelEdition ( ),
			
			routeProperties : routeObjId => m_RouteProperties ( routeObjId ),
		
			hideRoute : routeObjId => m_HideRoute ( routeObjId ),

			showRoutes : ( ) => m_ShowRoutes ( ),
		}
	);
}

/* 
--- g_RouteEditor object ----------------------------------------------------------------------------------------------

The one and only one routeEditor

-----------------------------------------------------------------------------------------------------------------------
*/

let g_RouteEditor = newRouteEditor ( );

/*
--- End of RouteEditor.js file ----------------------------------------------------------------------------------------
*/