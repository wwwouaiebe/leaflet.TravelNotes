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
	- the theRouteEditor object
Changes:
	- v1.0.0:
		- created
	- v1.1.0:
		- Issue #28 : Disable "select this point as start point " and "select this point as end point"
			when a start point or end point is already present
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

export { theRouteEditor };

import { theConfig } from '../data/Config.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theErrorsUI } from '../UI/ErrorsUI.js';
import { newRoadbookUpdate } from '../roadbook/RoadbookUpdate.js';
import { newDataSearchEngine } from '../data/DataSearchEngine.js';
import { newRoute } from '../data/Route.js';
import { newItineraryPoint } from '../data/ItineraryPoint.js';
import { newUtilities } from '../util/Utilities.js';
import { newRoutePropertiesDialog } from '../dialogs/RoutePropertiesDialog.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';
import { newGeometry } from '../util/Geometry.js';

/*
--- newRouteEditor function -------------------------------------------------------------------------------------------

Patterns : Closure and Singleton

-----------------------------------------------------------------------------------------------------------------------
*/

function newRouteEditor ( ) {

	let myMustZoomToRoute = false;
	let myRequestStarted = false;
	let myDataSearchEngine  = newDataSearchEngine ( );
	let myUtilities = newUtilities ( );
	let myEventDispatcher = newEventDispatcher ( );
	let myGeometry = newGeometry ( );

	/*
	--- myCutRoute function -------------------------------------------------------------------------------------------

	This function cut a route at a given point
	Warning: not tested, not used!!!

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCutRoute ( route, latLng ) {

		// an array is created with 2 clones of the route
		let routes = [ newRoute ( ), newRoute ( ) ];
		routes [ 0 ].object = route.object;
		routes [ 1 ].object = route.object;

		// and the itineraryPoints are removed
		routes [ 0 ].itinerary.itineraryPoints.removeAll ( );
		routes [ 1 ].itinerary.itineraryPoints.removeAll ( );

		// the distance between the origin and the cutting point is computed
		let cuttingPointLatLngDistance = myGeometry.getClosestLatLngDistance ( route, latLng );

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
				let removedDistance = myGeometry.pointsDistance (
					cuttingPointLatLngDistance.latLng,
					itineraryPointIterator.value.latLng
				);

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
	--- myComputeRouteDistances function ------------------------------------------------------------------------------

	This function compute the route, itineraryPoints and maneuvers distances

	parameters:
	- route : the TravelNotes route object to be used

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myComputeRouteDistances ( route ) {

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
			previousItineraryPoint.distance = myGeometry.pointsDistance (
				previousItineraryPoint.latLng,
				itineraryPointsIterator.value.latLng
			);
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
	--- mySaveGpx function --------------------------------------------------------------------------------------------

	This function save the currently edited route to a GPX file

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySaveGpx ( ) {

		// initializations...
		let tab0 = '\n';
		let tab1 = '\n\t';
		let tab2 = '\n\t\t';
		let tab3 = '\n\t\t\t';
		let timeStamp = 'time="' + new Date ( ).toISOString ( ) + '" ';

		// header
		let gpxString = '<?xml version="1.0"?>' + tab0;
		gpxString += '<gpx xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
		'xmlns:xsd="http://www.w3.org/2001/XMLSchema" ' +
		'xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" ' +
		'version="1.1" creator="leaflet.TravelNotes">';

		// waypoints
		let wayPointsIterator = theTravelNotesData.travel.editedRoute.wayPoints.iterator;
		while ( ! wayPointsIterator.done ) {
			gpxString +=
				tab1 + '<wpt lat="' + wayPointsIterator.value.lat + '" lon="' + wayPointsIterator.value.lng + '" ' +
				timeStamp + '/>';

		}

		// route
		gpxString += tab1 + '<rte>';
		let maneuverIterator = theTravelNotesData.travel.editedRoute.itinerary.maneuvers.iterator;
		while ( ! maneuverIterator.done ) {
			let wayPoint = theTravelNotesData.travel.editedRoute.itinerary.itineraryPoints.getAt (
				maneuverIterator.value.itineraryPointObjId
			);
			let instruction = maneuverIterator.value.instruction
				.replace ( '&', '&amp;' )
				.replace ( '"', '&apos;' )
				.replace ('"', '&quote;')
				.replace ( '>', '&gt;' )
				.replace ( '<', '&lt;');
			gpxString +=
				tab2 +
				'<rtept lat="' +
				wayPoint.lat +
				'" lon="' +
				wayPoint.lng +
				'" ' +
				timeStamp +
				'desc="' +
				instruction + '" />' ;
		}
		gpxString += tab1 + '</rte>';

		// track
		gpxString += tab1 + '<trk>';
		gpxString += tab2 + '<trkseg>';
		let itineraryPointsIterator = theTravelNotesData.travel.editedRoute.itinerary.itineraryPoints.iterator;
		while ( ! itineraryPointsIterator.done ) {
			gpxString +=
				tab3 +
				'<trkpt lat="' + itineraryPointsIterator.value.lat +
				'" lon="' +
				itineraryPointsIterator.value.lng +
				'" ' +
				timeStamp +
				' />';
		}
		gpxString += tab2 + '</trkseg>';
		gpxString += tab1 + '</trk>';

		// eof
		gpxString += tab0 + '</gpx>';

		// file is saved
		let fileName = theTravelNotesData.travel.editedRoute.name;
		if ( '' === fileName ) {
			fileName = 'TravelNote';
		}
		fileName += '.gpx';
		myUtilities.saveFile ( fileName, gpxString );
	}

	/*
	--- myChainRoutes function ----------------------------------------------------------------------------------------

	This function recompute the distances when routes are chained

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myChainRoutes ( ) {
		let routesIterator = theTravelNotesData.travel.routes.iterator;
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
	--- myHaveValidWayPoints function ---------------------------------------------------------------------------------

	This function verify that the waypoints have coordinates

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myHaveValidWayPoints ( ) {
		return theTravelNotesData.travel.editedRoute.wayPoints.forEach (
			( wayPoint, result ) => {
				if ( null === result ) {
					result = true;
				}
				result = result && ( ( 0 !== wayPoint.lat ) &&  ( 0 !== wayPoint.lng ) );
				return result;
			}
		);
	}

	/*
	--- myEndError function -------------------------------------------------------------------------------------------

	This function ...

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myEndError ( err ) {

		myRequestStarted = false;

		theErrorsUI.showError ( err );

		console.log ( err ? err : 'An error occurs when asking the route to the provider' )
	}

	/*
	--- myStartRouting function ---------------------------------------------------------------------------------------

		This function start the routing :-)

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myStartRouting ( ) {

		if ( ! theConfig.routing.auto ) {
			return;
		}

		// We verify that another request is not loaded
		if ( myRequestStarted ) {
			return false;
		}

		// Control of the wayPoints
		if ( ! myHaveValidWayPoints ( ) ) {
			return false;
		}

		myMustZoomToRoute = 0 === theTravelNotesData.travel.editedRoute.itinerary.itineraryPoints.length;
		myRequestStarted = true;

		// Choosing the correct route provider
		let routeProvider = theTravelNotesData.providers.get ( theTravelNotesData.routing.provider.toLowerCase ( ) );

		// provider name and transit mode are added to the road
		theTravelNotesData.travel.editedRoute.itinerary.provider = routeProvider.name;
		theTravelNotesData.travel.editedRoute.itinerary.transitMode = theTravelNotesData.routing.transitMode;

		routeProvider.getPromiseRoute ( theTravelNotesData.travel.editedRoute, null )
			.then (  myEndRoutingOk, myEndError  )
			.catch ( myEndError );

		return true;
	}

	/*
	--- myEndRoutingOk function -----------------------------------------------------------------------------------------

	This function is called by the router when a routing operation is successfully finished

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myEndRoutingOk ( ) {

		myRequestStarted = false;

		theRouteEditor.computeRouteDistances ( theTravelNotesData.travel.editedRoute );

		// Placing the waypoints on the itinerary
		let wayPointsIterator = theTravelNotesData.travel.editedRoute.wayPoints.iterator;
		while ( ! wayPointsIterator.done ) {
			if ( wayPointsIterator.first ) {
				wayPointsIterator.value.latLng = theTravelNotesData.travel.editedRoute.itinerary.itineraryPoints.first.latLng;
			}
			else if ( wayPointsIterator.last ) {
				wayPointsIterator.value.latLng = theTravelNotesData.travel.editedRoute.itinerary.itineraryPoints.last.latLng;
			}
			else {
				wayPointsIterator.value.latLng = newGeometry ( ).getClosestLatLngDistance (
					theTravelNotesData.travel.editedRoute,
					wayPointsIterator.value.latLng
				).latLng;
			}
		}

		// the previous route is removed from the leaflet map
		myEventDispatcher.dispatch (
			'removeroute',
			{
				route : theTravelNotesData.travel.editedRoute,
				removeNotes : true,
				removeWayPoints : true
			}
		);

		// the position of the notes linked to the route is recomputed
		let notesIterator = theTravelNotesData.travel.editedRoute.notes.iterator;
		while ( ! notesIterator.done ) {
			let latLngDistance = myGeometry.getClosestLatLngDistance (
				theTravelNotesData.travel.editedRoute,
				notesIterator.value.latLng
			);
			notesIterator.value.latLng = latLngDistance.latLng;
			notesIterator.value.distance = latLngDistance.distance;
		}

		// and the notes sorted
		theTravelNotesData.travel.editedRoute.notes.sort (
			( first, second ) => { return first.distance - second.distance; }
		);

		// the new route is added to the map
		myEventDispatcher.dispatch (
			'addroute',
			{
				route : theTravelNotesData.travel.editedRoute,
				addNotes : true,
				addWayPoints : true,
				readOnly : false
			}
		);
		if ( myMustZoomToRoute ) {
			myZoomToRoute ( theTravelNotesData.travel.editedRoute.objId );
		}

		// and the itinerary and waypoints are displayed
		myEventDispatcher.dispatch ( 'setitinerary' );
		myEventDispatcher.dispatch ( 'setwaypointslist' );

		// the HTML page is adapted ( depending of the config.... )
		myChainRoutes ( );
		newRoadbookUpdate ( );
	}

	/*
	--- mySaveEdition function ----------------------------------------------------------------------------------------

	This function save the current edited route

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySaveEdition ( ) {

		// the edited route is cloned
		let clonedRoute = newRoute ( );
		clonedRoute.object = theTravelNotesData.travel.editedRoute.object;

		// and the initial route replaced with the clone
		theTravelNotesData.travel.routes.replace ( theTravelNotesData.editedRouteObjId, clonedRoute );
		theTravelNotesData.editedRouteObjId = clonedRoute.objId;
		myCancelEdition ( );
	}

	/*
	--- myCancelEdition function --------------------------------------------------------------------------------------

	This function cancel the current edited route

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCancelEdition ( ) {
		myEventDispatcher.dispatch (
			'removeroute',
			{
				route : theTravelNotesData.travel.editedRoute,
				removeNotes : true,
				removeWayPoints : true
			}
		);
		if ( -1 !== theTravelNotesData.editedRouteObjId ) {
			let editedRoute = myDataSearchEngine.getRoute ( theTravelNotesData.editedRouteObjId );
			editedRoute.edited = 0;
			myEventDispatcher.dispatch (
				'addroute',
				{
					route : editedRoute,
					addNotes : true,
					addWayPoints : false,
					readOnly : false
				}
			);
		}

		theTravelNotesData.travel.editedRoute = newRoute ( );
		theTravelNotesData.editedRouteObjId = -1;
		myEventDispatcher.dispatch ( 'setrouteslist' );
		myEventDispatcher.dispatch ( 'setwaypointslist' );
		myEventDispatcher.dispatch ( 'reducerouteui' );
		myEventDispatcher.dispatch ( 'setitinerary' );
		myChainRoutes ( );
		newRoadbookUpdate ( );
	}

	/*
	--- myRouteProperties function ------------------------------------------------------------------------------------

	This function opens the RouteProperties dialog

	parameters:
	- routeObjId :

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myRouteProperties ( routeObjId ) {
		let route = myDataSearchEngine.getRoute ( routeObjId );
		let routePropertiesDialog = newRoutePropertiesDialog ( route );

		routePropertiesDialog.show ( ).then (
			route => {
				myEventDispatcher.dispatch (
					'editroute',
					{
						route : route
					}
				);
				theRouteEditor.chainRoutes ( );
				myEventDispatcher.dispatch ( 'setrouteslist' );
				newRoadbookUpdate ( );
			}
		)
			.catch ( err => console.log ( err ? err : 'An error occurs in the dialog' )  );
	}

	/*
	--- myHideRoute function ------------------------------------------------------------------------------------------

	This function hide a route on the map

	parameters:
	- routeObjId : the route objId that was clicked

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myHideRoute ( routeObjId ) {
		let route = myDataSearchEngine.getRoute ( routeObjId );
		if ( route ) {
			myEventDispatcher.dispatch (
				'removeroute',
				{
					route : route,
					removeNotes : true,
					removeWayPoints : true
				}
			);
			route.hidden = true;
		}
	}

	/*
	--- myShowRoutes function -----------------------------------------------------------------------------------------

	This function show all the hidden routes

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myShowRoutes ( ) {
		let routesIterator = theTravelNotesData.travel.routes.iterator;
		while ( ! routesIterator.done ) {
			if ( routesIterator.value.hidden ) {
				myEventDispatcher.dispatch (
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
	--- myShowRoutes function -----------------------------------------------------------------------------------------

	This function zoom on a route

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myZoomToRoute ( routeObjId ) {
		myEventDispatcher.dispatch (
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

			cutRoute : ( route, latLng ) => { return myCutRoute ( route, latLng ); },

			computeRouteDistances : route => myComputeRouteDistances ( route ),

			saveGpx : ( ) => mySaveGpx ( ),

			chainRoutes : ( ) => myChainRoutes ( ),

			startRouting : ( ) => myStartRouting ( ),

			saveEdition : ( ) => mySaveEdition ( ),

			cancelEdition : ( ) => myCancelEdition ( ),

			routeProperties : routeObjId => myRouteProperties ( routeObjId ),

			hideRoute : routeObjId => myHideRoute ( routeObjId ),

			showRoutes : ( ) => myShowRoutes ( ),

			zoomToRoute : routeObjId => myZoomToRoute ( routeObjId )

		}
	);
}

/*
--- theRouteEditor object ----------------------------------------------------------------------------------------------

The one and only one routeEditor

-----------------------------------------------------------------------------------------------------------------------
*/

const theRouteEditor = newRouteEditor ( );

/*
--- End of RouteEditor.js file ----------------------------------------------------------------------------------------
*/