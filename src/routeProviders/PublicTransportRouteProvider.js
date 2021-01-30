/*
Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/

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
Changes:
	- v2.1.0:
		- issue #150 : Merge travelNotes and plugins
Doc reviewed ...
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file PublicTransportRouteProvider.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module PublicTransportRouteProvider
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { ZERO, ONE, TWO, LAT_LNG, HTTP_STATUS_OK } from '../util/Constants.js';
import { theSphericalTrigonometry } from '../util/SphericalTrigonometry.js';

/*

Building a line that follow a public transport relation version 2 is in theory very simple.
It's only line segments that we have to join in a single polyline. That's the theory.

In practice OpenStreetMap data are plenty of mistakes:

- line segments are not ordered, so we have to reorder and join

- some line segments are missing. In this case we try to join the segments
  with a new one, but we don't follow anymore the track.

- we can find nodes with 3 segments arriving or starting from the node.
  Yes, that can be. A train comes in a station then restart for a short distance
  on the same track that he was coming . In this case, the shortest path is arbitrary duplicated
  and joined to the two others segments so we have only one polyline with
  some duplicate nodes

  What's we have in th OSM data (the train go from A to C then from C to B, using the same track):
  A----------------------------------+----------------------------------B
									 |
									 |
									 C

  And what we need to draw only one polyline:
  A---------------------------------+ +---------------------------------B
									| |
									| |
									+-+
									 C

- we can find nodes with more than 3 segments arriving or starting from the node.
  This case is the hell and currently I don't have a solution.

- stop position are not always on the track.

- stop position are missing

- stop position are present, but the station is missing

- ....

And also we have to look at this:

- we can have more than one relation between the stations given by the user

- and finally we have to cut the polyline, because the departure or the final destination of
  the train is in another station than the station given by the user

*/

const INVALID_ID = -1;
const THREE = 3;

let ourUserLanguage = 'fr';
let ourRoute = null;

let ourSelectedRelationId = INVALID_ID;
let ourWaysMap = new Map ( );
let ourNodesMap = new Map ( );
let ourStopsMap = new Map ( );
let ourNewId = INVALID_ID;
let ourNodes3WaysCounter = ZERO;
let	ourNodes3Ways = [];

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourFirstOf
@desc coming soon...
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourFirstOf ( array ) {
	return array [ ZERO ];
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourLastOf
@desc coming soon...
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourLastOf ( array ) {
	return array [ array.length - ONE ];
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourRemoveFrom
@desc coming soon...
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourRemoveFrom ( array, value ) {
	array.splice ( array.indexOf ( value ), ONE );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourReverseWay
@desc coming soon...
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourReverseWay ( way ) {

	let oldStartNode = ourNodesMap.get ( ourFirstOf ( way.nodesIds ) );
	let oldEndNode = ourNodesMap.get ( ourLastOf ( way.nodesIds ) );

	ourRemoveFrom ( oldStartNode.startingWaysIds, way.id );
	oldStartNode.endingWaysIds.push ( way.id );

	ourRemoveFrom ( oldEndNode.endingWaysIds, way.id );
	oldEndNode.startingWaysIds.push ( way.id );

	way.nodesIds.reverse ( );

}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourMergeWays
@desc coming soon...
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourMergeWays ( waysId1, waysId2 ) {

	let way1 = ourWaysMap.get ( waysId1 );
	let way2 = ourWaysMap.get ( waysId2 );

	// reversing some ways, so :
	// - the 2 ways have the same direction
	// - the starting node of the merged way is the starting node of way1
	// - the ending node of the merged way is the ending node of way2
	// - the removed node is the ending node of way1

	if ( ourLastOf ( way1.nodesIds ) === ourLastOf ( way2.nodesIds ) ) {
		ourReverseWay ( way2 );
	}
	else if ( ourFirstOf ( way1.nodesIds ) === ourFirstOf ( way2.nodesIds ) ) {
		ourReverseWay ( way1 );
	}
	else if ( ourFirstOf ( way1.nodesIds ) === ourLastOf ( way2.nodesIds ) ) {
		ourReverseWay ( way1 );
		ourReverseWay ( way2 );

	}

	// removing the node at the merging node and all the starting or ending ways of the node
	let mergedNode = ourNodesMap.get ( way1.nodesIds.pop ( ) );
	mergedNode.startingWaysIds = [];
	mergedNode.endingWaysIds = [];

	// and then merging the 2 ways
	way1.nodesIds = way1.nodesIds.concat ( way2.nodesIds );
	way1.distance += way2.distance;

	// and changing the ending ways in the last node
	let endNode = ourNodesMap.get ( ourLastOf ( way1.nodesIds ) );
	ourRemoveFrom ( endNode.endingWaysIds, way2.id );
	endNode.endingWaysIds.push ( way1.id );

	// finally we remove the second way from the ways map
	ourWaysMap.delete ( way2.id );

	return way1.id;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourCloneNode
@desc coming soon...
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourCloneNode ( nodeId ) {

	let node = ourNodesMap.get ( nodeId );

	let clonedNode = {
		id : ourNewId --,
		lat : node.lat,
		lon : node.lon,
		type : 'node',
		startingWaysIds : [],
		endingWaysIds : [],
		isNode3Ways : node.isNode3Ways
	};

	ourNodesMap.set ( clonedNode.id, clonedNode );

	return clonedNode.id;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourCloneWay
@desc coming soon...
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourCloneWay ( wayId ) {

	let way = ourWaysMap.get ( wayId );

	let clonedWay = {
		id : ourNewId --,
		type : 'way',
		nodesIds : [],
		distance : way.distance
	};

	way.nodesIds.forEach ( nodeId => clonedWay.nodesIds.push ( ourCloneNode ( nodeId ) ) );

	ourNodesMap.get ( ourFirstOf ( clonedWay.nodesIds ) ).startingWaysIds.push ( clonedWay.id );
	ourNodesMap.get ( ourLastOf ( clonedWay.nodesIds ) ).endingWaysIds.push ( clonedWay.id );

	ourWaysMap.set ( clonedWay.id, clonedWay );

	return clonedWay.id;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourCreateMaps
@desc coming soon...
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourCreateMaps ( elements ) {

	ourWaysMap.clear ( );
	ourNodesMap.clear ( );
	ourStopsMap.clear ( );

	// Elements are pushed in 2 maps: 1 for nodes and 1 for ways
	elements.forEach (
		element => {
			switch ( element.type ) {
			case 'way' :

				// replacing the nodes property with the nodesId property to
				// avoid confusion between nodes and nodesId. the element.nodes contains nodesIds!!
				element.nodesIds = element.nodes;
				delete element.nodes;
				if ( TWO <= element.nodesIds.length ) {
					element.distance = ZERO;
					ourWaysMap.set ( element.id, element );
				}
				break;
			case 'node' :
				element.startingWaysIds = [];
				element.endingWaysIds = [];
				element.isNode3Ways = false;
				ourNodesMap.set ( element.id, element );
				break;
			case 'relation' :
				element.members.forEach (
					member => {

						// extracting all nodes with role 'stop'
						if ( 'node' === member.type && member.role && 'stop' === member.role ) {
							ourStopsMap.set ( member.ref, member.ref );
						}
					}
				);
				break;
			default :
				break;
			}
		}
	);

	// The stop map contain only the nodeId
	// we replace the nodeId with the node when possible
	ourStopsMap.forEach (
		nodeId => {
			let node = ourNodesMap.get ( nodeId );
			if ( node ) {
				ourStopsMap.set ( nodeId, node );
			}
			else {
				window.TaN.showInfo (
					'the relation ' +
					ourSelectedRelationId +
					' have nodes not positionned on the railway ( node ' +
					nodeId +
					').' );
				ourStopsMap.delete ( nodeId );
			}
		}
	);

	// Starting and ending ways are added to each node and length computed
	ourWaysMap.forEach (
		way => {
			ourNodesMap.get ( ourFirstOf ( way.nodesIds ) ).startingWaysIds.push ( way.id );
			ourNodesMap.get ( ourLastOf ( way.nodesIds ) ).endingWaysIds.push ( way.id );
			let previousNode = null;
			way.nodesIds.forEach (
				nodeId => {
					let node = ourNodesMap.get ( nodeId );
					if ( previousNode ) {
						way.distance += theSphericalTrigonometry.pointsDistance (
							[ node.lat, node.lon ], [ previousNode.lat, previousNode.lon ]
						);
					}
					previousNode = node;
				}
			);
		}
	);
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourRemoveHoles
@desc coming soon...
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourRemoveHoles ( ) {

	// for every start node or end node of each way we compute the distance
	// to the start node and end node of all others ways

	let distancesBetweenWays = [];

	function computeDistances ( node1, node2 ) {
		if ( node1.isNode3Ways || node2.isNode3Ways ) {
			return;
		}
		distancesBetweenWays.push (
			{
				distance : theSphericalTrigonometry.pointsDistance ( [ node1.lat, node1.lon ], [ node2.lat, node2.lon ] ),
				nodesId : [ node1.id, node2.id ]
			}
		);
	}

	let waysArray = Array.from ( ourWaysMap.values ( ) );
	let loopCounter = ONE;
	waysArray.forEach (
		way => {
			for ( let wayCounter = loopCounter; wayCounter < waysArray.length; wayCounter ++ ) {
				let nodesIds = [];
				nodesIds.push ( ourNodesMap.get ( ourFirstOf ( way.nodesIds ) ) );
				nodesIds.push ( ourNodesMap.get ( ourLastOf ( way.nodesIds ) ) );
				nodesIds.push ( ourNodesMap.get ( ourFirstOf ( waysArray [ wayCounter ].nodesIds ) ) );
				nodesIds.push ( ourNodesMap.get ( ourLastOf ( waysArray [ wayCounter ].nodesIds ) ) );

				computeDistances ( nodesIds [ ZERO ], nodesIds [ TWO ] );
				computeDistances ( nodesIds [ ZERO ], nodesIds [ THREE ] );
				computeDistances ( nodesIds [ ONE ], nodesIds [ TWO ] );
				computeDistances ( nodesIds [ ONE ], nodesIds [ THREE ] );
			}
			loopCounter ++;
		}
	);

	// the shortest distance is searched
	let minDistance = distancesBetweenWays [ ZERO ];
	distancesBetweenWays.forEach (
		distanceBetwwenWays => {
			if ( distanceBetwwenWays.distance < minDistance.distance ) {
				minDistance = distanceBetwwenWays;
			}
		}
	);

	// a new way is created and added to the way map, using the shortest distance
	let newWay = {
		id : ourNewId --,
		type : 'way',
		nodesIds : minDistance.nodesId,
		distance : minDistance.distance
	};
	ourWaysMap.set ( newWay.id, newWay );

	// start and end node are is adapted
	let startNode = ourNodesMap.get ( minDistance.nodesId [ ZERO ] );
	let wayIdAtStart = startNode.startingWaysIds.concat ( startNode.endingWaysIds ) [ ZERO ];
	startNode.startingWaysIds.push ( newWay.id );
	let endNode = ourNodesMap.get ( minDistance.nodesId [ ONE ] );
	let wayIdAtEnd = endNode.startingWaysIds.concat ( endNode.endingWaysIds ) [ ZERO ];
	endNode.endingWaysIds.push ( newWay.id );

	// and the two ways merged with the new one
	ourMergeWays ( ourMergeWays ( newWay.id, wayIdAtStart ), wayIdAtEnd );

	// and we restart recursively till all the possible ways are joined
	if ( ourWaysMap.size > ( ( ourNodes3WaysCounter * TWO ) + ONE ) ) {
		ourRemoveHoles ( );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourMerge3WaysNodes
@desc coming soon...
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourMerge3WaysNodes ( ) {

	ourNodes3Ways.forEach (
		node => {

			// searching the shortest way starting or ending in the node
			let shortestWaydistance = Number.MAX_VALUE;
			let shortestWay = null;
			let linkedWaysId = node.startingWaysIds.concat ( node.endingWaysIds );
			linkedWaysId.forEach (
				wayId => {
					let way = ourWaysMap.get ( wayId );
					if ( way.distance < shortestWaydistance ) {
						shortestWaydistance = way.distance;
						shortestWay = way;
					}
				}
			);

			// the shortest way is removed of the list of linked ways
			ourRemoveFrom ( linkedWaysId, shortestWay.id );

			// cloning the shortest way
			let clonedWay = ourWaysMap.get ( ourCloneWay ( shortestWay.id ) );

			// and adapting the nodes in the cloned way...
			let tmpNodeId = null;
			if ( ourFirstOf ( shortestWay.nodesIds ) === node.id ) {
				clonedWay.nodesIds.pop ( );
				clonedWay.nodesIds.push ( ourLastOf ( shortestWay.nodesIds ) );
				tmpNodeId = ourFirstOf ( clonedWay.nodesIds );
			}
			else {
				clonedWay.nodesIds.shift ( );
				clonedWay.nodesIds.unshift ( ourFirstOf ( shortestWay.nodesIds ) );
				tmpNodeId = ourLastOf ( clonedWay.nodesIds );
			}

			// and in the last linked way
			let lastWay = ourWaysMap.get ( linkedWaysId [ ONE ] );
			lastWay.nodesIds [ lastWay.nodesIds.indexOf ( node.id ) ] = tmpNodeId;

			// merging the 4 ways
			ourMergeWays (
				ourMergeWays (
					ourMergeWays (
						shortestWay.id,
						clonedWay.id
					),
					linkedWaysId [ ZERO ]
				),
				lastWay.id );
		}
	);
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourCreateRoute
@desc coming soon...
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourCreateRoute ( route ) {

	// Searching the nearest stops from the start and end WayPoints given by user.
	let startStop = null;
	let endStop = null;
	let startStopDistance = Number.MAX_VALUE;
	let endStopDistance = Number.MAX_VALUE;

	ourStopsMap.forEach (
		stopPoint => {
			let distance = theSphericalTrigonometry.pointsDistance (
				[ stopPoint.lat, stopPoint.lon ],
				ourRoute.wayPoints.first.latLng
			);
			if ( distance < startStopDistance ) {
				startStopDistance = distance;
				startStop = stopPoint;
			}
			distance = theSphericalTrigonometry.pointsDistance (
				[ stopPoint.lat, stopPoint.lon ],
				ourRoute.wayPoints.last.latLng
			);
			if ( distance < endStopDistance ) {
				endStopDistance = distance;
				endStop = stopPoint;
			}
		}
	);

	// the route is created. All existing itineraryPoints and maneuvers are removed
	route.itinerary.itineraryPoints.removeAll ( );
	route.itinerary.maneuvers.removeAll ( );
	route.itinerary.hasProfile = false;
	route.itinerary.ascent = ZERO;
	route.itinerary.descent = ZERO;

	// adding the new itinerary points. We use the nodes linked to the first way
	// ( and normally it's the only way !)
	// only nodes from the start stop to the end stop are added

	const NO_POINT_ADDED = 0;
	const FIRST_POINT_REACHED = 1;
	const OTHERS_POINTS_REACHED = 2;
	const LAST_POINT_REACHED = 3;
	const ALL_POINTS_ADDED = 4;

	// values : 0 : the point must not be added
	//			1 : first point is reached
	//			2 : others points are reached
	//			3 : last point is reached
	//			4 : all points are added
	let addPoint = NO_POINT_ADDED;
	let reversePoints = false; // the relation is not ordered, so it's possible we have to reverse
	Array.from ( ourWaysMap.values ( ) )[ ZERO ].nodesIds.forEach (
		nodeId => {
			if ( NO_POINT_ADDED === addPoint && ( nodeId === startStop.id || nodeId === endStop.id ) ) {

				// start stop or end stop is reached
				addPoint = FIRST_POINT_REACHED;
				reversePoints = ( nodeId === endStop.id );
			}
			else if ( OTHERS_POINTS_REACHED === addPoint && ( nodeId === startStop.id || nodeId === endStop.id ) ) {

				// the second stop is reached
				addPoint = LAST_POINT_REACHED;
			}
			if ( NO_POINT_ADDED < addPoint && ALL_POINTS_ADDED > addPoint ) {

				// an itinerary point is created from the node and is added to the itinerary
				let itineraryPoint = window.TaN.itineraryPoint;
				let node = ourNodesMap.get ( nodeId );
				itineraryPoint.latLng = [ node.lat, node.lon ];
				route.itinerary.itineraryPoints.add ( itineraryPoint );

				// we verify that the node is not a stop, otherwise we add a maneuver.
				let stopNode = ourStopsMap.get ( nodeId );
				if ( stopNode ) {

					let maneuver = window.TaN.maneuver;
					let stopName = null;
					if ( stopNode.tags && stopNode.tags.name ) {
						stopName = stopNode.tags.name;
						maneuver.instruction = stopName + '&nbsp;:&nbsp;';
					}
					if ( stopNode.id === startStop.id ) {
						if ( stopName ) {
							route.wayPoints.first.name = stopName;
						}
						maneuver.iconName = 'kTrainStart';
						maneuver.instruction += 'Monter dans le train';
					}
					else if ( stopNode.id === endStop.id ) {
						if ( stopName ) {
							route.wayPoints.last.name = stopName;
						}
						maneuver.iconName = 'kTrainEnd';
						maneuver.instruction += 'Descendre du train';
					}
					else {
						maneuver.iconName = 'kTrainContinue';
						maneuver.instruction += 'Rester dans le train';
					}
					maneuver.distance = ZERO;
					maneuver.duration = ZERO;
					maneuver.itineraryPointObjId = itineraryPoint.objId;

					route.itinerary.maneuvers.add ( maneuver );
				}
			}
			if ( FIRST_POINT_REACHED === addPoint ) {

				// start stop or end stop was reached at the beginning of the loop
				addPoint = OTHERS_POINTS_REACHED;
			}
			if ( LAST_POINT_REACHED === addPoint ) {

				// the second stop was reached at the beginning of the loop
				addPoint = ALL_POINTS_ADDED;
			}
		}
	);

	// reversing points if needed
	if ( reversePoints ) {
		route.itinerary.itineraryPoints.reverse ( );
		route.itinerary.maneuvers.reverse ( );
	}

	// computing distances
	route.distance = ZERO;

	let maneuversIterator = route.itinerary.maneuvers.iterator;
	maneuversIterator.done;
	let previousManeuver = maneuversIterator.value;
	maneuversIterator.done;

	let itineraryPointsIterator = route.itinerary.itineraryPoints.iterator;
	itineraryPointsIterator.done;
	let previousPoint = itineraryPointsIterator.value;

	while ( ! itineraryPointsIterator.done ) {
		itineraryPointsIterator.value.distance = ZERO;
		previousPoint.distance = theSphericalTrigonometry.pointsDistance (
			previousPoint.latLng,
			itineraryPointsIterator.value.latLng
		);
		route.distance += previousPoint.distance;
		previousManeuver.distance += previousPoint.distance;
		if ( maneuversIterator.value.itineraryPointObjId === itineraryPointsIterator.value.objId ) {

			previousManeuver = maneuversIterator.value;
			previousManeuver.distance = ZERO;

			maneuversIterator.done;
		}
		previousPoint = itineraryPointsIterator.value;
	}

}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourParseResponse
@desc coming soon...
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourParseResponse ( response, onOk, onError ) {

	// resetting variables
	ourNewId = INVALID_ID;
	ourNodes3Ways = [];
	ourNodes3WaysCounter = ZERO;

	// maps creation
	ourCreateMaps ( response.elements );

	// Searching all nodes where a way can start or end

	// analysing the ways at each node
	let nodeWithMoreThan3WaysFound = false;
	ourNodesMap.forEach (
		node => {
			let waysIds = node.startingWaysIds.concat ( node.endingWaysIds );
			switch ( waysIds.length ) {
			case ZERO :

				// it's a 'transit node'
				break;
			case ONE :

				// it's a start or end node
				break;
			case TWO :

				// ways are merged
				ourMergeWays ( waysIds [ ZERO ], waysIds [ ONE ] );
				break;
			case THREE :
				node.isNode3Ways = true;
				ourNodes3Ways.push ( node );
				ourNodes3WaysCounter ++;
				break;
			default :
				nodeWithMoreThan3WaysFound = true;
				window.TaN.showInfo (
					'A node with more than 3 ways is found : ' +
					node.id +
					' - the relation ' +
					ourSelectedRelationId +
					' - ways '
					+ node.startingWaysIds.concat ( node.endingWaysIds )
				);
				break;
			}
		}
	);

	if ( nodeWithMoreThan3WaysFound ) {

		onError ( new Error (
			'A node with more than 3 ways was found in the relation.See the console for more infos'
		) );
	}

	// removing holes
	if ( ourWaysMap.size > ( ( ourNodes3WaysCounter * TWO ) + ONE ) ) {
		ourRemoveHoles ( );
		window.TaN.showInfo (
			'Holes found in the OSM relation number ' +
			ourSelectedRelationId +
			'. Try to correct OSM data.'
		);
	}

	// merging paths at nodes with 3 ways
	if ( ZERO < ourNodes3WaysCounter ) {
		ourMerge3WaysNodes ( );
	}

	// route creation
	ourCreateRoute ( ourRoute );

	onOk ( ourRoute );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourGetRelationsUrl
@desc coming soon...
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourGetRelationsUrl ( ) {
	return 'https://lz4.overpass-api.de/api/interpreter?' +
		'data=[out:json];node["public_transport"="stop_position"]["train"="yes"](around:400.0,' +
		ourRoute.wayPoints.first.lat.toFixed ( LAT_LNG.fixed ) +
		',' +
		ourRoute.wayPoints.first.lng.toFixed ( LAT_LNG.fixed ) +
		')->.s;rel(bn.s)->.s;node["public_transport"="stop_position"]["train"="yes"](around:400.0,' +
		ourRoute.wayPoints.last.lat.toFixed ( LAT_LNG.fixed ) +
		',' +
		ourRoute.wayPoints.last.lng.toFixed ( LAT_LNG.fixed ) +
		')->.e;rel(bn.e)->.e;rel.e.s;out tags;';
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourGetWayNodesUrl
@desc coming soon...
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourGetWayNodesUrl ( ) {
	return 'https://lz4.overpass-api.de/api/interpreter?data=[out:json];rel(' +
		ourSelectedRelationId.toFixed ( ZERO ) +
		');way(r)->.e;way.e["railway"="rail"];(._;>;rel(' +
		ourSelectedRelationId.toFixed ( ZERO ) +
		'););out;';
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourGetDialogPromise
@desc coming soon...
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourGetDialogPromise ( response ) {

	if ( ZERO === response.elements.length ) {
		return Promise.reject ( new Error ( 'No relations found' ) );
	}

	let baseDialog = window.TaN.baseDialog;

	let selectDiv = document.createElement ( 'div' );
	selectDiv.id = 'TravelNotes-SelectDialog-SelectDiv';
	baseDialog.content.appendChild ( selectDiv );

	let selectElement =	document.createElement ( 'select' );
	selectElement.id = 'TravelNotes-SelectDialog-SelectElement';
	selectDiv.appendChild ( selectElement );

	function onOkButtonClick ( ) {
		return ourSelectedRelationId = response.elements [ selectElement.selectedIndex ].id;
	}

	baseDialog.okButtonListener = onOkButtonClick;

	response.elements.forEach (
		dataElement => {
			let optionElement = document.createElement ( 'option' );
			optionElement.text = dataElement.tags.name;
			selectElement.appendChild ( optionElement );
		}
	);
	selectElement.selectedIndex = ZERO;

	// baseDialog.show ( ) return a Promise...
	return baseDialog.show ( );

}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourGetRoute
@desc call the provider, wait for the response and then parse the provider response. Notice that we have two calls to the
Provider: one for the relation list and one for the ways and nodes. Notice also the dialog box between the 2 calls.
@param {function} onOk a function to pass to the ourParseResponse
@param {function} onError a function to pass to ourParseResponse or to call when an error occurs
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourGetRoute ( onOk, onError ) {

	fetch ( ourGetRelationsUrl ( ) )
		.then (
			responseRelations => {
				if ( HTTP_STATUS_OK === responseRelations.status && responseRelations.ok ) {
					responseRelations.json ( )
						.then ( ourGetDialogPromise )
						.then ( ( ) => fetch ( ourGetWayNodesUrl ( ) ) )
						.then (
							responseWayNodes => {
								if ( HTTP_STATUS_OK === responseWayNodes.status && responseWayNodes.ok ) {
									responseWayNodes.json ( )
										.then ( wayNodes => ourParseResponse ( wayNodes, onOk, onError ) );
								}
								else {
									onError ( new Error ( 'An error occurs...' ) );
								}
							}
						)
						.catch ( ( ) => onError ( new Error ( 'An error occurs...' ) ) );
				}
				else {
					onError ( new Error ( 'An error occurs...' ) );
				}
			}
		);
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourGetPromiseRoute
@desc call the provider, wait for the response and then parse the provider response into the route itinerary object
@param {route} route a Route object with at least two WayPoints completed
@return a Promise completed with a function that call the provider, wait the response and then will parse the response
in the route itinerary
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourGetPromiseRoute ( route ) {
	ourRoute = route;
	return new Promise ( ourGetRoute );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class PublicTransportRouteProvider
@classdesc This class implements the Provider interface for PublicTransport. It's not possible to instanciate
this class because the class is not exported from the module. Only one instance is created and added to the list
of Providers of TravelNotes
@see Provider for a description of methods
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class PublicTransportRouteProvider {

	constructor ( ) {
		Object.freeze ( this );
	}

	getPromiseRoute ( route ) { return ourGetPromiseRoute ( route ); }

	get icon ( ) {
		return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWX\
				MAAA7EAAAOxAGVKw4bAAAAB3RJTUUH4goTCi4V9AmY6AAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAA\
				AEc0lEQVRIx8VXTUhbWxD+zr0ag77Gqo1/RazRYjcBaxAVoxXFhQtRXLgt2iJUaAl9FBFcPBdtceeuBXGr4uaCq67rz0IaaUtFBc\
				XAq1WjVkhiTm6u3u8tXs1TG6NVyxuYzZy5fHNm5s58R5Ak/gdJOs+htbUVNpsNLpcLZWVlcDqdyMrKujoyE8j4+DhVVaXH42FdXR\
				2tVisBxNTlcnF2dpaXEfyKcyAQIAD29vZydHSUdrudT58+/b3AUkru7OywoaGBdrudpmnyKiLOa67d3V3U19fjy5cvJ+ylpaVwOp\
				3IyMhAWloa7HY7Kioq4HK5kJmZebUaR6NRKooSq6mqqlRVlUKIE7U+ra9fv75aqvPy8giARUVF9Pv91HWduq5TSkmv18v+/n5WVV\
				XFBX/48OHlgFtaWgiA6enpF6pZNBplMBjk3t4e9/b2uL+/T5/P92vA79+/j0Xu9Xov3UBSSn79+jXu2U8DxOfzoa6uDgDw9u1blJ\
				eXAwAGBgYwMzODcDgMALBarbh58yZyc3NRXFyMe/fuIT8/H6qqIhKJ4ODgALdu3UJycvL5zfXp06fYTYeGhmL2tra2hM10nj569O\
				jsVGuaRgAUQnBycpIkubi4yOzs7CuBHunu7u7PwD09PQTA27dvMxQKUUrJZ8+eXQvgkTocjpPAhYWFBMCBgQGS5PLy8rUCHtdAIB\
				ADVhwOB46GV3V1NQKBwG9bhY2Njf+txa6uLrS3t0PTNFRWVib8sLS0FG63G2VlZSguLsaNGzcQiUTw/ft3bGxs4Nu3b/D7/QgGgw\
				iHw5BSQkoJXdcRjUYRDAah6zpSUlKQpGkapZQCAEKhEFRVxf3791FbW8uGhgbcuXMH+fn5sNvtiWISp3+WODb8SDcsFgvE58+fab\
				PZoKoqsrOzYbFYfivz2NraQk5ODpKcTmfc6C5KiYQQP92YJMWPg9P2w8NDmKYJVdO0v3w+Hw4ODqDrOhRFQWpqKsQFxePxiOnpaU\
				xNTUFRFBQWFuI06NbWFtbX17G9vS0cDoeQUgokJSXFbf2Ojg6+e/eOm5ubjEajZ87j42szIyMjrs/Q0NCJ2W8YBkHSnJubY0lJiX\
				kqCPO4ulwuU9M0U0ppGoZhHsns7KwJgCkpKSwoKCBJmqfoid/vZ15eHm02m7mysmJGIhHzxKw2DIMLCwt0u91nDgFFUWixWHj37l\
				0ODg5yfn6eh4eHCXma1+vl2NgYnzx5QgAMhULx1+LIyAhfvnzJpaUl1tTUXOv06uzsTEwE5ubmaLVa2dTUxImJCb558+ZagI+yk5\
				D66LrO5uZmAmB5eTmXl5c5Pj7OBw8e/DJgZmYm19bWLs4yAWB4eBjd3d0AgL6+Prx69QoAMD8/j48fP2J1dRXb29sIh8MwDANCCI\
				TDYZimiZycHHR2dsLtdl+cZR6XnZ0dOhyOWIN9+PDhTN/p6Wl6PB62trYSAGtrazk1NUXDMC73kiDJx4+7KMS/6Xv+3EPD0M/07e\
				vrpc32x4mUv3jxJ9fX/+Y/YWHR4vXjhpgAAAAASUVORK5CYII=';
	}

	get name ( ) { return 'leaflet.TravelNotesPublicTransport & OpenStreetMap'; }

	get transitModes ( ) { return { car : false, bike : false, pedestrian : false, train : true }; }

	get providerKeyNeeded ( ) { return false; }

	get providerKey ( ) { return ONE; }
	set providerKey ( ProviderKey ) { }

	get userLanguage ( ) { return ourUserLanguage; }
	set userLanguage ( UserLanguage ) { ourUserLanguage = UserLanguage; }
}

window.TaN.addProvider ( new PublicTransportRouteProvider ( ) );

/*
--- End of PublicTransportRouteProvider.js file -------------------------------------------------------------------------------
*/