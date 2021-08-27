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
Doc reviewed ...
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file PublicTransportRouteBuilder.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module PublicTransportRouteBuilder
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theSphericalTrigonometry from '../util/SphericalTrigonometry.js';
import ItineraryPoint from '../data/ItineraryPoint.js';
import Maneuver from '../data/Maneuver.js';

import { ZERO, INVALID_OBJ_ID, ONE, TWO, THREE } from '../util/Constants.js';

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

/**
@------------------------------------------------------------------------------------------------------------------------------

@class PublicTransportRouteBuilder
@classdesc coming soon...
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class PublicTransportRouteBuilder {

	#newId = INVALID_OBJ_ID;
	#nodes3WaysCounter = ZERO;
	#nodes3Ways = [];
	#waysMap = new Map ( );
	#nodesMap = new Map ( );
	#stopsMap = new Map ( );
	#selectedRelationId = INVALID_OBJ_ID;
	#route = null;

	/**
	@private
	*/

	#firstOf ( array ) {
		return array [ ZERO ];
	}

	/**
	@private
	*/

	#lastOf ( array ) {
		return array [ array.length - ONE ];
	}

	/**
	@private
	*/

	#removeFrom ( array, value ) {
		array.splice ( array.indexOf ( value ), ONE );
	}

	/**
	@private
	*/

	#reverseWay ( way ) {

		let oldStartNode = this.#nodesMap.get ( this.#firstOf ( way.nodesIds ) );
		let oldEndNode = this.#nodesMap.get ( this.#lastOf ( way.nodesIds ) );

		this.#removeFrom ( oldStartNode.startingWaysIds, way.id );
		oldStartNode.endingWaysIds.push ( way.id );

		this.#removeFrom ( oldEndNode.endingWaysIds, way.id );
		oldEndNode.startingWaysIds.push ( way.id );

		way.nodesIds.reverse ( );

	}

	/**
	@private
	*/

	#mergeWays ( waysId1, waysId2 ) {

		let way1 = this.#waysMap.get ( waysId1 );
		let way2 = this.#waysMap.get ( waysId2 );

		// reversing some ways, so :
		// - the 2 ways have the same direction
		// - the starting node of the merged way is the starting node of way1
		// - the ending node of the merged way is the ending node of way2
		// - the removed node is the ending node of way1

		if ( this.#lastOf ( way1.nodesIds ) === this.#lastOf ( way2.nodesIds ) ) {
			this.#reverseWay ( way2 );
		}
		else if ( this.#firstOf ( way1.nodesIds ) === this.#firstOf ( way2.nodesIds ) ) {
			this.#reverseWay ( way1 );
		}
		else if ( this.#firstOf ( way1.nodesIds ) === this.#lastOf ( way2.nodesIds ) ) {
			this.#reverseWay ( way1 );
			this.#reverseWay ( way2 );

		}

		// removing the node at the merging node and all the starting or ending ways of the node
		let mergedNode = this.#nodesMap.get ( way1.nodesIds.pop ( ) );
		mergedNode.startingWaysIds = [];
		mergedNode.endingWaysIds = [];

		// and then merging the 2 ways
		way1.nodesIds = way1.nodesIds.concat ( way2.nodesIds );
		way1.distance += way2.distance;

		// and changing the ending ways in the last node
		let endNode = this.#nodesMap.get ( this.#lastOf ( way1.nodesIds ) );
		this.#removeFrom ( endNode.endingWaysIds, way2.id );
		endNode.endingWaysIds.push ( way1.id );

		// finally we remove the second way from the ways map
		this.#waysMap.delete ( way2.id );

		return way1.id;
	}

	/**
	@private
	*/

	#removeHoles ( ) {

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

		let waysArray = Array.from ( this.#waysMap.values ( ) );
		let loopCounter = ONE;
		waysArray.forEach (
			way => {
				for ( let wayCounter = loopCounter; wayCounter < waysArray.length; wayCounter ++ ) {
					let nodesIds = [];
					nodesIds.push ( this.#nodesMap.get ( this.#firstOf ( way.nodesIds ) ) );
					nodesIds.push ( this.#nodesMap.get ( this.#lastOf ( way.nodesIds ) ) );
					nodesIds.push ( this.#nodesMap.get ( this.#firstOf ( waysArray [ wayCounter ].nodesIds ) ) );
					nodesIds.push ( this.#nodesMap.get ( this.#lastOf ( waysArray [ wayCounter ].nodesIds ) ) );

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
			id : this.#newId --,
			type : 'way',
			nodesIds : minDistance.nodesId,
			distance : minDistance.distance
		};
		this.#waysMap.set ( newWay.id, newWay );

		// start and end node are is adapted
		let startNode = this.#nodesMap.get ( minDistance.nodesId [ ZERO ] );
		let wayIdAtStart = startNode.startingWaysIds.concat ( startNode.endingWaysIds ) [ ZERO ];
		startNode.startingWaysIds.push ( newWay.id );
		let endNode = this.#nodesMap.get ( minDistance.nodesId [ ONE ] );
		let wayIdAtEnd = endNode.startingWaysIds.concat ( endNode.endingWaysIds ) [ ZERO ];
		endNode.endingWaysIds.push ( newWay.id );

		// and the two ways merged with the new one
		this.#mergeWays ( this.#mergeWays ( newWay.id, wayIdAtStart ), wayIdAtEnd );

		// and we restart recursively till all the possible ways are joined
		if ( this.#waysMap.size > ( ( this.#nodes3WaysCounter * TWO ) + ONE ) ) {
			this.#removeHoles ( );
		}
	}

	/**
	@private
	*/

	#cloneNode ( nodeId ) {

		let node = this.#nodesMap.get ( nodeId );

		let clonedNode = {
			id : this.#newId --,
			lat : node.lat,
			lon : node.lon,
			type : 'node',
			startingWaysIds : [],
			endingWaysIds : [],
			isNode3Ways : node.isNode3Ways
		};

		this.#nodesMap.set ( clonedNode.id, clonedNode );

		return clonedNode.id;
	}

	/**
	@private
	*/

	#cloneWay ( wayId ) {

		let way = this.#waysMap.get ( wayId );

		let clonedWay = {
			id : this.#newId --,
			type : 'way',
			nodesIds : [],
			distance : way.distance
		};

		way.nodesIds.forEach ( nodeId => clonedWay.nodesIds.push ( this.#cloneNode ( nodeId ) ) );

		this.#nodesMap.get ( this.#firstOf ( clonedWay.nodesIds ) ).startingWaysIds.push ( clonedWay.id );
		this.#nodesMap.get ( this.#lastOf ( clonedWay.nodesIds ) ).endingWaysIds.push ( clonedWay.id );

		this.#waysMap.set ( clonedWay.id, clonedWay );

		return clonedWay.id;
	}

	/**
	@private
	*/

	#merge3WaysNodes ( ) {

		this.#nodes3Ways.forEach (
			node => {

				// searching the shortest way starting or ending in the node
				let shortestWaydistance = Number.MAX_VALUE;
				let shortestWay = null;
				let linkedWaysId = node.startingWaysIds.concat ( node.endingWaysIds );
				linkedWaysId.forEach (
					wayId => {
						let way = this.#waysMap.get ( wayId );
						if ( way.distance < shortestWaydistance ) {
							shortestWaydistance = way.distance;
							shortestWay = way;
						}
					}
				);

				// the shortest way is removed of the list of linked ways
				this.#removeFrom ( linkedWaysId, shortestWay.id );

				// cloning the shortest way
				let clonedWay = this.#waysMap.get ( this.#cloneWay ( shortestWay.id ) );

				// and adapting the nodes in the cloned way...
				let tmpNodeId = null;
				if ( this.#firstOf ( shortestWay.nodesIds ) === node.id ) {
					clonedWay.nodesIds.pop ( );
					clonedWay.nodesIds.push ( this.#lastOf ( shortestWay.nodesIds ) );
					tmpNodeId = this.#firstOf ( clonedWay.nodesIds );
				}
				else {
					clonedWay.nodesIds.shift ( );
					clonedWay.nodesIds.unshift ( this.#firstOf ( shortestWay.nodesIds ) );
					tmpNodeId = this.#lastOf ( clonedWay.nodesIds );
				}

				// and in the last linked way
				let lastWay = this.#waysMap.get ( linkedWaysId [ ONE ] );
				lastWay.nodesIds [ lastWay.nodesIds.indexOf ( node.id ) ] = tmpNodeId;

				// merging the 4 ways
				this.#mergeWays (
					this.#mergeWays (
						this.#mergeWays (
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
	@private
	*/

	#createRoute ( route ) {

		// Searching the nearest stops from the start and end WayPoints given by user.
		let startStop = null;
		let endStop = null;
		let startStopDistance = Number.MAX_VALUE;
		let endStopDistance = Number.MAX_VALUE;

		this.#stopsMap.forEach (
			stopPoint => {
				let distance = theSphericalTrigonometry.pointsDistance (
					[ stopPoint.lat, stopPoint.lon ],
					this.#route.wayPoints.first.latLng
				);
				if ( distance < startStopDistance ) {
					startStopDistance = distance;
					startStop = stopPoint;
				}
				distance = theSphericalTrigonometry.pointsDistance (
					[ stopPoint.lat, stopPoint.lon ],
					this.#route.wayPoints.last.latLng
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

		let addPoint = NO_POINT_ADDED;
		let reversePoints = false; // the relation is not ordered, so it's possible we have to reverse
		Array.from ( this.#waysMap.values ( ) )[ ZERO ].nodesIds.forEach (
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
					let itineraryPoint = new ItineraryPoint ( );
					let node = this.#nodesMap.get ( nodeId );
					itineraryPoint.latLng = [ node.lat, node.lon ];
					route.itinerary.itineraryPoints.add ( itineraryPoint );

					// we verify that the node is not a stop, otherwise we add a maneuver.
					let stopNode = this.#stopsMap.get ( nodeId );
					if ( stopNode ) {

						let maneuver = new Maneuver ( );
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
	@private
	*/

	#createMaps ( elements ) {

		this.#waysMap.clear ( );
		this.#nodesMap.clear ( );
		this.#stopsMap.clear ( );

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
						this.#waysMap.set ( element.id, element );
					}
					break;
				case 'node' :
					element.startingWaysIds = [];
					element.endingWaysIds = [];
					element.isNode3Ways = false;
					this.#nodesMap.set ( element.id, element );
					break;
				case 'relation' :
					element.members.forEach (
						member => {

							// extracting all nodes with role 'stop'
							if ( 'node' === member.type && member.role && 'stop' === member.role ) {
								this.#stopsMap.set ( member.ref, member.ref );
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
		this.#stopsMap.forEach (
			nodeId => {
				let node = this.#nodesMap.get ( nodeId );
				if ( node ) {
					this.#stopsMap.set ( nodeId, node );
				}
				else {
					window.TaN.showInfo (
						'the relation ' +
						this.#selectedRelationId +
						' have nodes not positionned on the railway ( node ' +
						nodeId +
						').' );
					this.#stopsMap.delete ( nodeId );
				}
			}
		);

		// Starting and ending ways are added to each node and length computed
		this.#waysMap.forEach (
			way => {
				this.#nodesMap.get ( this.#firstOf ( way.nodesIds ) ).startingWaysIds.push ( way.id );
				this.#nodesMap.get ( this.#lastOf ( way.nodesIds ) ).endingWaysIds.push ( way.id );
				let previousNode = null;
				way.nodesIds.forEach (
					nodeId => {
						let node = this.#nodesMap.get ( nodeId );
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

	constructor ( route, selectedRelationId ) {
		this.#route = route;
		this.#selectedRelationId = selectedRelationId;
	}

	buildRoute ( response, onOk, onError ) {

		// resetting variables
		this.#newId = INVALID_OBJ_ID;
		this.#nodes3Ways = [];
		this.#nodes3WaysCounter = ZERO;

		// maps creation
		this.#createMaps ( response.elements );

		// Searching all nodes where a way can start or end

		// analysing the ways at each node
		let nodeWithMoreThan3WaysFound = false;
		this.#nodesMap.forEach (
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
					this.#mergeWays ( waysIds [ ZERO ], waysIds [ ONE ] );
					break;
				case THREE :
					node.isNode3Ways = true;
					this.#nodes3Ways.push ( node );
					this.#nodes3WaysCounter ++;
					break;
				default :
					nodeWithMoreThan3WaysFound = true;
					window.TaN.showInfo (
						'A node with more than 3 ways is found : ' +
						node.id +
						' - the relation ' +
						this.#selectedRelationId +
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
			return;
		}

		// removing holes
		if ( this.#waysMap.size > ( ( this.#nodes3WaysCounter * TWO ) + ONE ) ) {
			this.#removeHoles ( );
			window.TaN.showInfo (
				'Holes found in the OSM relation number ' +
				this.#selectedRelationId +
				'. Try to correct OSM data.'
			);
		}

		// merging paths at nodes with 3 ways
		if ( ZERO < this.#nodes3WaysCounter ) {
			this.#merge3WaysNodes ( );
		}

		// route creation
		this.#createRoute ( this.#route );

		onOk ( this.#route );

	}

}

export default PublicTransportRouteBuilder;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of PublicTransportRouteBuilder.js file

@------------------------------------------------------------------------------------------------------------------------------
*/