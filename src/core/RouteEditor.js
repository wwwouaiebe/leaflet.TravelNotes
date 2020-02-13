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

import { theConfig } from '../data/Config.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theErrorsUI } from '../UI/ErrorsUI.js';
import { newDataSearchEngine } from '../data/DataSearchEngine.js';
import { newRoute } from '../data/Route.js';
import { newUtilities } from '../util/Utilities.js';
import { newRoutePropertiesDialog } from '../dialogs/RoutePropertiesDialog.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';
import { newRoadbookUpdate } from '../roadbook/RoadbookUpdate.js';
import { newGeometry } from '../util/Geometry.js';
import { newZoomer } from '../core/Zoomer.js';
import { theProfileWindowsManager } from '../core/ProfileWindowsManager.js';

import { ROUTE_EDITION_STATUS, DISTANCE, LAT_LNG, ZERO, INVALID_OBJ_ID } from '../util/Constants.js';

/*
--- newRouteEditor function -------------------------------------------------------------------------------------------

Patterns : Closure and Singleton

-----------------------------------------------------------------------------------------------------------------------
*/

function newRouteEditor ( ) {

	let myMustZoomToRoute = false;
	let myRequestStarted = false;
	let myDataSearchEngine = newDataSearchEngine ( );
	let myUtilities = newUtilities ( );
	let myEventDispatcher = newEventDispatcher ( );
	let myGeometry = newGeometry ( );

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
		previousManeuver.distance = DISTANCE.defaultValue;
		maneuverIterator.done;
		route.distance = DISTANCE.defaultValue;
		route.duration = DISTANCE.defaultValue;
		while ( ! itineraryPointsIterator.done ) {
			previousItineraryPoint.distance = myGeometry.pointsDistance (
				previousItineraryPoint.latLng,
				itineraryPointsIterator.value.latLng
			);
			if ( maneuverIterator.value.itineraryPointObjId === itineraryPointsIterator.value.objId ) {
				route.duration += previousManeuver.duration;
				previousManeuver = maneuverIterator.value;
				maneuverIterator.value.distance = DISTANCE.defaultValue;
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
				.replace ( '"', '&quote;' )
				.replace ( '>', '&gt;' )
				.replace ( '<', '&lt;' );
			gpxString +=
				tab2 +
				'<rtept lat="' +
				wayPoint.lat +
				'" lon="' +
				wayPoint.lng +
				'" ' +
				timeStamp +
				'desc="' +
				instruction + '" />';
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
		let chainedDistance = DISTANCE.defaultValue;
		while ( ! routesIterator.done ) {
			if ( routesIterator.value.chain ) {
				routesIterator.value.chainedDistance = chainedDistance;
				chainedDistance += routesIterator.value.distance;
			}
			else {
				routesIterator.value.chainedDistance = DISTANCE.defaultValue;
			}
			let notesIterator = routesIterator.value.notes.iterator;
			while ( ! notesIterator.done ) {
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

		let haveValidWayPoints = true;
		theTravelNotesData.travel.editedRoute.wayPoints.forEach (
			wayPoint => {
				haveValidWayPoints =
					haveValidWayPoints
					&&
					LAT_LNG.defaultValue !== wayPoint.lat
					&&
					LAT_LNG.defaultValue !== wayPoint.lng;
			}
		);

		return haveValidWayPoints;
	}

	/*
	--- myEndRoutingError function ------------------------------------------------------------------------------------

	This function ...

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myEndRoutingError ( err ) {

		myRequestStarted = false;

		theErrorsUI.showError ( err );

		console.log ( err ? err : 'An error occurs when asking the route to the provider' );
	}

	/*
	--- myEndRoutingOk function -----------------------------------------------------------------------------------------

	This function is called by the router when a routing operation is successfully finished

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myEndRoutingOk ( ) {

		myRequestStarted = false;

		myComputeRouteDistances ( theTravelNotesData.travel.editedRoute );

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

		myChainRoutes ( );

		// and the notes sorted
		theTravelNotesData.travel.editedRoute.notes.sort (
			( first, second ) => first.distance - second.distance
		);

		if ( myMustZoomToRoute ) {
			newZoomer ( ).zoomToRoute ( theTravelNotesData.travel.editedRoute.objId );
		}

		theProfileWindowsManager.createProfile ( theTravelNotesData.travel.editedRoute );

		myEventDispatcher.dispatch (
			'routeupdated',
			{
				removedRouteObjId : theTravelNotesData.travel.editedRoute.objId,
				addedRouteObjId : theTravelNotesData.travel.editedRoute.objId
			}
		);

		newRoadbookUpdate ( );

		// and the itinerary and waypoints are displayed
		myEventDispatcher.dispatch ( 'setitinerary' );
		myEventDispatcher.dispatch ( 'setwaypointslist' );
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

		myMustZoomToRoute = ZERO === theTravelNotesData.travel.editedRoute.itinerary.itineraryPoints.length;
		myRequestStarted = true;

		// Choosing the correct route provider
		let routeProvider = theTravelNotesData.providers.get ( theTravelNotesData.routing.provider.toLowerCase ( ) );

		// provider name and transit mode are added to the road
		theTravelNotesData.travel.editedRoute.itinerary.provider = routeProvider.name;
		theTravelNotesData.travel.editedRoute.itinerary.transitMode = theTravelNotesData.routing.transitMode;

		routeProvider.getPromiseRoute ( theTravelNotesData.travel.editedRoute, null )
			.then ( myEndRoutingOk, myEndRoutingError )
			.catch ( myEndRoutingError );

		return true;
	}

	/*
	--- myCancelEdition function --------------------------------------------------------------------------------------

	This function cancel the current edited route

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCancelEdition ( ) {

		// !!! order is important!!!
		let editedRoute = myDataSearchEngine.getRoute ( theTravelNotesData.editedRouteObjId );
		editedRoute.edited = ROUTE_EDITION_STATUS.notEdited;

		theProfileWindowsManager.updateProfile (
			theTravelNotesData.travel.editedRoute.objId,
			editedRoute
		);

		myEventDispatcher.dispatch (
			'routeupdated',
			{
				removedRouteObjId : theTravelNotesData.travel.editedRoute.objId,
				addedRouteObjId : theTravelNotesData.editedRouteObjId
			}
		);

		theTravelNotesData.editedRouteObjId = INVALID_OBJ_ID;
		theTravelNotesData.travel.editedRoute = newRoute ( );
		myChainRoutes ( );

		newRoadbookUpdate ( );
		myEventDispatcher.dispatch ( 'setrouteslist' );
		myEventDispatcher.dispatch ( 'setwaypointslist' );
		myEventDispatcher.dispatch ( 'reducerouteui' );
		myEventDispatcher.dispatch ( 'setitinerary' );

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
			( ) => {
				myChainRoutes ( );
				myEventDispatcher.dispatch (
					'routepropertiesupdated',
					{
						routeObjId : route.objId
					}
				);
				myEventDispatcher.dispatch ( 'setrouteslist' );
			}
		)
			.catch ( err => console.log ( err ? err : 'An error occurs in the route properties dialog' ) );
	}

	/*
	--- myHideRoute function ------------------------------------------------------------------------------------------

	This function hide a route on the map

	parameters:
	- routeObjId : the route objId that was clicked

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myHideRoute ( routeObjId ) {

		myEventDispatcher.dispatch (
			'routeupdated',
			{
				removedRouteObjId : routeObjId,
				addedRouteObjId : INVALID_OBJ_ID
			}
		);
		myDataSearchEngine.getRoute ( routeObjId ).hidden = true;
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
					'routeupdated',
					{
						removedRouteObjId : INVALID_OBJ_ID,
						addedRouteObjId : routesIterator.value.objId
					}
				);
			}
		}
	}

	/*
	--- routeEditor object --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			saveGpx : ( ) => mySaveGpx ( ),

			chainRoutes : ( ) => myChainRoutes ( ),

			startRouting : ( ) => myStartRouting ( ),

			saveEdition : ( ) => mySaveEdition ( ),

			cancelEdition : ( ) => myCancelEdition ( ),

			routeProperties : routeObjId => myRouteProperties ( routeObjId ),

			hideRoute : routeObjId => myHideRoute ( routeObjId ),

			showRoutes : ( ) => myShowRoutes ( )

		}
	);
}

/*
--- theRouteEditor object ----------------------------------------------------------------------------------------------

The one and only one routeEditor

-----------------------------------------------------------------------------------------------------------------------
*/

const theRouteEditor = newRouteEditor ( );

export { theRouteEditor };

/*
--- End of RouteEditor.js file ----------------------------------------------------------------------------------------
*/