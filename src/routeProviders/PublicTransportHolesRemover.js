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
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file PublicTransportHolesRemover.js
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

import { ZERO, ONE, TWO, THREE } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class PublicTransportHolesRemover
@classdesc coming soon...
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class PublicTransportHolesRemover {

	#publicTransportData = null;

	#computeDistances ( node1, node2, distancesBetweenWays ) {
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

	/**
	@private
	*/

	#removeHoles ( ) {

		// for every start node or end node of each way we compute the distance
		// to the start node and end node of all others ways

		let distancesBetweenWays = [];
		let waysArray = Array.from ( this.#publicTransportData.waysMap.values ( ) );
		let loopCounter = ONE;

		waysArray.forEach (
			way => {
				for ( let wayCounter = loopCounter; wayCounter < waysArray.length; wayCounter ++ ) {
					let nodesIds = [];
					nodesIds.push ( this.#publicTransportData.nodesMap.get (
						this.#publicTransportData.firstOf ( way.nodesIds ) )
					);
					nodesIds.push ( this.#publicTransportData.nodesMap.get (
						this.#publicTransportData.lastOf ( way.nodesIds ) )
					);
					nodesIds.push ( this.#publicTransportData.nodesMap.get (
						this.#publicTransportData.firstOf ( waysArray [ wayCounter ].nodesIds ) )
					);
					nodesIds.push ( this.#publicTransportData.nodesMap.get (
						this.#publicTransportData.lastOf ( waysArray [ wayCounter ].nodesIds ) )
					);

					this.#computeDistances ( nodesIds [ ZERO ], nodesIds [ TWO ], distancesBetweenWays );
					this.#computeDistances ( nodesIds [ ZERO ], nodesIds [ THREE ], distancesBetweenWays );
					this.#computeDistances ( nodesIds [ ONE ], nodesIds [ TWO ], distancesBetweenWays );
					this.#computeDistances ( nodesIds [ ONE ], nodesIds [ THREE ], distancesBetweenWays );
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
			id : this.#publicTransportData.newId,
			type : 'way',
			nodesIds : minDistance.nodesId,
			distance : minDistance.distance
		};
		this.#publicTransportData.waysMap.set ( newWay.id, newWay );

		// start and end node are is adapted
		let startNode = this.#publicTransportData.nodesMap.get ( minDistance.nodesId [ ZERO ] );
		let wayIdAtStart = startNode.startingWaysIds.concat ( startNode.endingWaysIds ) [ ZERO ];
		startNode.startingWaysIds.push ( newWay.id );
		let endNode = this.#publicTransportData.nodesMap.get ( minDistance.nodesId [ ONE ] );
		let wayIdAtEnd = endNode.startingWaysIds.concat ( endNode.endingWaysIds ) [ ZERO ];
		endNode.endingWaysIds.push ( newWay.id );

		// and the two ways merged with the new one
		this.#publicTransportData.mergeWays ( this.#publicTransportData.mergeWays ( newWay.id, wayIdAtStart ), wayIdAtEnd );

		// and we restart recursively till all the possible ways are joined
		if ( this.#publicTransportData.waysMap.size > ( ( this.#publicTransportData.nodes3WaysCounter * TWO ) + ONE ) ) {
			this.#removeHoles ( );
		}
	}

	/*
	constructor
	*/

	constructor ( publicTransportData ) {
		Object.freeze ( this );
		this.#publicTransportData = publicTransportData;
	}

	removeHoles ( ) {
		this.#removeHoles ( );
	}

}

export default PublicTransportHolesRemover;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of PublicTransportHolesRemover.js file

@------------------------------------------------------------------------------------------------------------------------------
*/