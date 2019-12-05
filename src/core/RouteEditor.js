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
		- Issue #66 : Work with promises for dialogs
		- Issue #70 : Put the get...HTML functions outside of the editors
		- Issue #68 : Review all existing promises.
Doc reviewed 20191122
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

export { g_RouteEditor };

import { g_Config } from '../data/Config.js';
import { g_TravelNotesData } from '../data/TravelNotesData.js';
import { gc_ErrorsUI } from '../UI/ErrorsUI.js';
import { newRoadbookUpdate } from '../roadbook/RoadbookUpdate.js';
import { newDataSearchEngine } from '../data/DataSearchEngine.js';
import { newRoute } from '../data/Route.js';
import { newItineraryPoint } from '../data/ItineraryPoint.js';
import { newUtilities } from '../util/Utilities.js';
import { newRoutePropertiesDialog } from '../dialogs/RoutePropertiesDialog.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';
import { newGeometry } from '../util/Geometry.js';

var s_ZoomToRoute = false;
var s_RequestStarted = false;

	
/*
--- newRouteEditor function -------------------------------------------------------------------------------------------

Patterns : Closure and Singleton

-----------------------------------------------------------------------------------------------------------------------
*/

function newRouteEditor ( ) {
	
	let m_DataSearchEngine  = newDataSearchEngine ( );
	let m_Utilities = newUtilities ( );
	let m_EventDispatcher = newEventDispatcher ( );
	let m_Geometry = newGeometry ( );

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
		let cuttingPointLatLngDistance = m_Geometry.getClosestLatLngDistance ( route, latLng );

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
				let removedDistance = m_Geometry.pointsDistance ( cuttingPointLatLngDistance.latLng, itineraryPointIterator.value.latLng );
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
			previousItineraryPoint.distance = m_Geometry.pointsDistance ( previousItineraryPoint.latLng, itineraryPointsIterator.value.latLng );
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
		while ( ! wayPointsIterator.done ) {
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
	--- m_HaveValidWayPoints function ---------------------------------------------------------------------------------

	This function verify that the waypoints have coordinates

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_HaveValidWayPoints ( ) {
		return g_TravelNotesData.travel.editedRoute.wayPoints.forEach ( 
			function ( wayPoint, result ) {
				if ( null === result ) { 
					result = true;
				}
				result &= ( ( 0 !== wayPoint.lat ) &&  ( 0 !== wayPoint.lng ) );
				return result;
			}
		);
	}
	
	/*
	--- m_EndError function -------------------------------------------------------------------------------------------

	This function ...

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_EndError ( err ) {

		s_RequestStarted = false;

		gc_ErrorsUI.showError ( err );
		
		console.log ( err ? err : 'An error occurs when asking the route to the provider' ) 
	}

	/*
	--- m_StartRouting function ---------------------------------------------------------------------------------------

		This function start the routing :-)

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_StartRouting ( ) {

		if ( ! g_Config.routing.auto ) {
			return;
		}

		// We verify that another request is not loaded
		if ( s_RequestStarted ) {
			return false;
		}
		
		// Control of the wayPoints
		if ( ! m_HaveValidWayPoints ( ) ) {
			return false;
		}

		s_ZoomToRoute = 0 === g_TravelNotesData.travel.editedRoute.itinerary.itineraryPoints.length;
		s_RequestStarted = true;

		// Choosing the correct route provider
		let routeProvider = g_TravelNotesData.providers.get ( g_TravelNotesData.routing.provider.toLowerCase ( ) );

		// provider name and transit mode are added to the road
		g_TravelNotesData.travel.editedRoute.itinerary.provider = routeProvider.name;
		g_TravelNotesData.travel.editedRoute.itinerary.transitMode = g_TravelNotesData.routing.transitMode;

		routeProvider.getPromiseRoute ( g_TravelNotesData.travel.editedRoute, null ).then (  m_EndRoutingOk, m_EndError  ).catch ( m_EndError );

		return true;
	}
		
	/*
	--- m_EndRoutingOk function -----------------------------------------------------------------------------------------

	This function is called by the router when a routing operation is successfully finished
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_EndRoutingOk ( ) {

		s_RequestStarted = false;
		
		g_RouteEditor.computeRouteDistances ( g_TravelNotesData.travel.editedRoute );

		// Placing the waypoints on the itinerary
		let wayPointsIterator = g_TravelNotesData.travel.editedRoute.wayPoints.iterator;
		while ( ! wayPointsIterator.done ) {
			if ( wayPointsIterator.first ) {
				wayPointsIterator.value.latLng = g_TravelNotesData.travel.editedRoute.itinerary.itineraryPoints.first.latLng;
			}
			else if ( wayPointsIterator.last ) {
				wayPointsIterator.value.latLng = g_TravelNotesData.travel.editedRoute.itinerary.itineraryPoints.last.latLng;
			}
			else{
				wayPointsIterator.value.latLng = newGeometry ( ).getClosestLatLngDistance ( g_TravelNotesData.travel.editedRoute, wayPointsIterator.value.latLng ).latLng;
			}
		}	
		
		// the previous route is removed from the leaflet map
		m_EventDispatcher.dispatch ( 
			'removeroute', 
			{ 
				route: g_TravelNotesData.travel.editedRoute,
				removeNotes: true, 
				removeWayPoints : true
			}
		);
		
		// the position of the notes linked to the route is recomputed
		let notesIterator = g_TravelNotesData.travel.editedRoute.notes.iterator;
		while ( ! notesIterator.done ) {
			let latLngDistance = m_Geometry.getClosestLatLngDistance ( g_TravelNotesData.travel.editedRoute, notesIterator.value.latLng );
			notesIterator.value.latLng = latLngDistance.latLng;
			notesIterator.value.distance = latLngDistance.distance;
		}
		
		// and the notes sorted
		g_TravelNotesData.travel.editedRoute.notes.sort ( ( a, b ) => { return a.distance - b.distance; } );
		
		// the new route is added to the map
		m_EventDispatcher.dispatch ( 
			'addroute', 
			{
				route : g_TravelNotesData.travel.editedRoute,
				addNotes : true,
				addWayPoints : true,
				readOnly : false
			}
		);
		if ( s_ZoomToRoute ) {
			m_ZoomToRoute ( g_TravelNotesData.travel.editedRoute.objId );
		}
		
		// and the itinerary and waypoints are displayed
		m_EventDispatcher.dispatch ( 'setitinerary' );
		m_EventDispatcher.dispatch ( 'setwaypointslist' );
		// the HTML page is adapted ( depending of the config.... )
		m_ChainRoutes ( );
		newRoadbookUpdate ( );
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
		m_EventDispatcher.dispatch ( 
			'removeroute', 
			{ 
				route: g_TravelNotesData.travel.editedRoute,
				removeNotes: true, 
				removeWayPoints : true
			}
		);
		if ( -1 !== g_TravelNotesData.editedRouteObjId ) {
			let editedRoute = m_DataSearchEngine.getRoute ( g_TravelNotesData.editedRouteObjId );
			editedRoute.edited = 0;
			m_EventDispatcher.dispatch ( 
				'addroute', 
				{
					route : editedRoute,
					addNotes : true,
					addWayPoints : false,
					readOnly : false
				}
			);
		}

		g_TravelNotesData.travel.editedRoute = newRoute ( );
		g_TravelNotesData.editedRouteObjId = -1;
		m_EventDispatcher.dispatch ( 'setrouteslist' );
		m_EventDispatcher.dispatch ( 'setwaypointslist' );
		m_EventDispatcher.dispatch ( 'reducerouteui' );
		m_EventDispatcher.dispatch ( 'setitinerary' );
		m_ChainRoutes ( );
		newRoadbookUpdate ( );
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
		let routePropertiesDialog = newRoutePropertiesDialog ( route );
		
		routePropertiesDialog.show ( ).then ( 
			route => {
				m_EventDispatcher.dispatch ( 
					'editroute', 
					{ 
						route: route
					}
				);
				g_RouteEditor.chainRoutes ( );
				m_EventDispatcher.dispatch ( 'setrouteslist' );
				newRoadbookUpdate ( );			
			}		
		).catch ( err => console.log ( err ? err : 'An error occurs in the dialog' )  );
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
			m_EventDispatcher.dispatch ( 
				'removeroute', 
				{ 
					route: route,
					removeNotes: true, 
					removeWayPoints : true
				}
			);
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
				m_EventDispatcher.dispatch ( 
					'addroute', 
					{
						route : routesIterator.value,
						addNotes : true,
						addWayPoints : true,
						readOnly : false
					}
				);
			}
		}
	}
	
	/*
	--- m_ShowRoutes function -----------------------------------------------------------------------------------------

	This function zoom on a route
	
	-------------------------------------------------------------------------------------------------------------------
	*/
	
	function m_ZoomToRoute ( routeObjId ) {
		m_EventDispatcher.dispatch ( 
			'zoomtoroute', 
			{ 
				routeObjId : routeObjId
			}
		);
	}

	/*
	--- routeEditor object --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			
			cutRoute : ( route, latLng ) => { return m_CutRoute ( route, latLng ); },
			
			computeRouteDistances : route => m_ComputeRouteDistances ( route ),

			saveGpx : ( ) => m_SaveGpx ( ),
			
			chainRoutes : ( ) => m_ChainRoutes ( ),
			
			startRouting : ( ) => m_StartRouting ( ),
			
			saveEdition : ( ) => m_SaveEdition ( ),
			
			cancelEdition : ( ) => m_CancelEdition ( ),
			
			routeProperties : routeObjId => m_RouteProperties ( routeObjId ),
		
			hideRoute : routeObjId => m_HideRoute ( routeObjId ),

			showRoutes : ( ) => m_ShowRoutes ( ),

			zoomToRoute : routeObjId => m_ZoomToRoute ( routeObjId )
			
		}
	);
}

/* 
--- g_RouteEditor object ----------------------------------------------------------------------------------------------

The one and only one routeEditor

-----------------------------------------------------------------------------------------------------------------------
*/

const g_RouteEditor = newRouteEditor ( );

/*
--- End of RouteEditor.js file ----------------------------------------------------------------------------------------
*/