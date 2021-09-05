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
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
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

@module routeProviders
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theSphericalTrigonometry from '../coreLib/SphericalTrigonometry.js';
import ItineraryPoint from '../data/ItineraryPoint.js';
import Maneuver from '../data/Maneuver.js';
import publicTransportData from '../routeProviders/PublicTransportData.js';
import PublicTransportHolesRemover from '../routeProviders/PublicTransportHolesRemover.js';

import { ZERO, INVALID_OBJ_ID, ONE, TWO, THREE } from '../main/Constants.js';

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

	#selectedRelationId = INVALID_OBJ_ID;
	#nodes3Ways = [];
	#route = null;
	#publicTransportData = null;

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
						let way = this.#publicTransportData.waysMap.get ( wayId );
						if ( way.distance < shortestWaydistance ) {
							shortestWaydistance = way.distance;
							shortestWay = way;
						}
					}
				);

				// the shortest way is removed of the list of linked ways
				this.#publicTransportData.removeFrom ( linkedWaysId, shortestWay.id );

				// cloning the shortest way
				let clonedWay = this.#publicTransportData.waysMap.get (
					this.#publicTransportData.cloneWay ( shortestWay.id )
				);

				// and adapting the nodes in the cloned way...
				let tmpNodeId = null;
				if ( this.#publicTransportData.firstOf ( shortestWay.nodesIds ) === node.id ) {
					clonedWay.nodesIds.pop ( );
					clonedWay.nodesIds.push ( this.#publicTransportData.lastOf ( shortestWay.nodesIds ) );
					tmpNodeId = this.#publicTransportData.firstOf ( clonedWay.nodesIds );
				}
				else {
					clonedWay.nodesIds.shift ( );
					clonedWay.nodesIds.unshift ( this.#publicTransportData.firstOf ( shortestWay.nodesIds ) );
					tmpNodeId = this.#publicTransportData.lastOf ( clonedWay.nodesIds );
				}

				// and in the last linked way
				let lastWay = this.#publicTransportData.waysMap.get ( linkedWaysId [ ONE ] );
				lastWay.nodesIds [ lastWay.nodesIds.indexOf ( node.id ) ] = tmpNodeId;

				// merging the 4 ways
				this.#publicTransportData.mergeWays (
					this.#publicTransportData.mergeWays (
						this.#publicTransportData.mergeWays (
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

		this.#publicTransportData.stopsMap.forEach (
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
		Array.from ( this.#publicTransportData.waysMap.values ( ) )[ ZERO ].nodesIds.forEach (
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
					let node = this.#publicTransportData.nodesMap.get ( nodeId );
					itineraryPoint.latLng = [ node.lat, node.lon ];
					route.itinerary.itineraryPoints.add ( itineraryPoint );

					// we verify that the node is not a stop, otherwise we add a maneuver.
					let stopNode = this.#publicTransportData.stopsMap.get ( nodeId );
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

	/*
	constructor
	*/

	constructor ( route, selectedRelationId ) {
		Object.freeze ( this );
		this.#route = route;
		this.#selectedRelationId = selectedRelationId;
		this.#publicTransportData = new publicTransportData ( selectedRelationId );
	}

	buildRoute ( response, onOk, onError ) {

		// resetting variables
		this.#nodes3Ways = [];
		this.#publicTransportData.nodes3WaysCounter = ZERO;

		// maps creation
		this.#publicTransportData.createMaps ( response.elements );

		// Searching all nodes where a way can start or end

		// analysing the ways at each node
		let nodeWithMoreThan3WaysFound = false;
		this.#publicTransportData.nodesMap.forEach (
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
					this.#publicTransportData.mergeWays ( waysIds [ ZERO ], waysIds [ ONE ] );
					break;
				case THREE :
					node.isNode3Ways = true;
					this.#nodes3Ways.push ( node );
					this.#publicTransportData.nodes3WaysCounter ++;
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

			onError ( new Error ( 'A node with more than 3 ways was found in the relation.See the console for more infos' ) );
			return;
		}

		// removing holes
		if ( this.#publicTransportData.waysMap.size > ( ( this.#publicTransportData.nodes3WaysCounter * TWO ) + ONE ) ) {
			new PublicTransportHolesRemover ( this.#publicTransportData ). removeHoles ( );
			window.TaN.showInfo (
				'Holes found in the OSM relation number ' + this.#selectedRelationId + '. Try to correct OSM data.'
			);
		}

		// merging paths at nodes with 3 ways
		if ( ZERO < this.#publicTransportData.nodes3WaysCounter ) {
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