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
Doc reviewed 20210830
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file StreetFinder.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module coreMapIcon
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theConfig from '../data/Config.js';
import theSphericalTrigonometry from '../util/SphericalTrigonometry.js';
import theTranslator from '../UI/Translator.js';

import { DISTANCE, INVALID_OBJ_ID, ZERO, ONE, TWO, NOT_FOUND, ICON_POSITION } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class StreetFinder
@classdesc coming soon...
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class StreetFinder {

	#overpassAPIDataLoader = null;
	#computeData = null;
	#mapIconData = null;

	/**
	Return the name of a way
	@param {Object} way  A way found in the request result
	@return the concatenation of the way.ref and way.name if any
	@private
	*/

	#getWayName ( way ) {
		return ( way.tags.name ? way.tags.name : '' ) +
			( way.tags.name && way.tags.ref ? ' ' : '' ) +
			( way.tags.ref ? '[' + way.tags.ref + ']' : '' );
	}

	/**
	This method compare the lat and lng of the parameter with the lat and lng of the route waypoints
	@param {ItineraryPoint} itineraryPoint the itineraryPoint to test
	@return {boolean} true when the itineraryPoint is not at the same position than a WayPoint and not at the
	same position than the icon point
	@private
	*/

	#latLngCompare ( itineraryPoint ) {

		const COMPARE_PRECISION = 0.000005;

		let isWayPoint = false;
		this.#computeData.route.wayPoints.forEach (
			wayPoint => {
				if (
					( Math.abs ( itineraryPoint.lat - wayPoint.lat ) < COMPARE_PRECISION )
					&&
					( Math.abs ( itineraryPoint.lng - wayPoint.lng ) < COMPARE_PRECISION )
				) {
					isWayPoint = true;
				}
			}
		);
		return (
			! isWayPoint
			&&
			(
				this.#computeData.mapIconPosition.latLng [ ZERO ] !== itineraryPoint.lat
				||
				this.#computeData.mapIconPosition.latLng [ ONE ] !== itineraryPoint.lng
			)
		);
	}

	/**
	this method search all the streets passing trough the nearest itinerary point
	@private
	*/

	/* eslint-disable-next-line complexity */
	#findStreets ( ) {

		// searching the previous and next point on the itinerary
		let incomingItineraryPoint = this.#computeData.route.itinerary.itineraryPoints.previous (
			this.#computeData.mapIconPosition.nearestItineraryPointObjId,
			itineraryPoint => this.#latLngCompare ( itineraryPoint )
		);
		let outgoingItineraryPoint = this.#computeData.route.itinerary.itineraryPoints.next (
			this.#computeData.mapIconPosition.nearestItineraryPointObjId,
			itineraryPoint => this.#latLngCompare ( itineraryPoint )
		);

		let svgPointId = NOT_FOUND;
		let incomingNodeId = NOT_FOUND;
		let outgoingNodeId = NOT_FOUND;

		let svgNodeDistance = Number.MAX_VALUE;
		let incomingNodeDistance = Number.MAX_VALUE;
		let outgoingNodeDistance = Number.MAX_VALUE;
		let nodeDistance = DISTANCE.defaultValue;
		let rcnRefNode = null;

		// searching in the nodes JS map the incoming, outgoing and icon nodes
		this.#overpassAPIDataLoader.nodes.forEach (
			node => {
				if ( 'bike' === this.#computeData.route.itinerary.transitMode && node.tags && node.tags.rcn_ref ) {
					rcnRefNode = node;
				}
				if ( INVALID_OBJ_ID !== this.#computeData.mapIconPosition.nearestItineraryPointObjId ) {
					nodeDistance = theSphericalTrigonometry.pointsDistance (
						[ node.lat, node.lon ],
						this.#computeData.mapIconPosition.latLng
					);
					if ( nodeDistance < svgNodeDistance ) {
						svgPointId = node.id;
						svgNodeDistance = nodeDistance;
					}
				}
				if ( incomingItineraryPoint ) {
					nodeDistance =
						theSphericalTrigonometry.pointsDistance ( [ node.lat, node.lon ], incomingItineraryPoint.latLng );
					if ( nodeDistance < incomingNodeDistance ) {
						incomingNodeId = node.id;
						incomingNodeDistance = nodeDistance;
					}
				}
				if ( outgoingItineraryPoint ) {
					nodeDistance =
						theSphericalTrigonometry.pointsDistance ( [ node.lat, node.lon ], outgoingItineraryPoint.latLng );
					if ( nodeDistance < outgoingNodeDistance ) {
						outgoingNodeId = node.id;
						outgoingNodeDistance = nodeDistance;
					}
				}
			}
		);

		let iconNode = this.#overpassAPIDataLoader.nodes.get ( svgPointId );

		if ( rcnRefNode ) {
			let rcnRefDistance = theSphericalTrigonometry.pointsDistance (
				[ rcnRefNode.lat, rcnRefNode.lon ],
				[ iconNode.lat, iconNode.lon ]
			);
			if ( theConfig.note.svgIcon.rcnRefDistance > rcnRefDistance ) {
				iconNode = rcnRefNode;
			}
		}

		// searching a mini roundabout at the icon node
		let isMiniRoundabout =
			( iconNode && iconNode.tags && iconNode.tags.highway && 'mini_roundabout' === iconNode.tags.highway );

		if (
			'bike' === this.#computeData.route.itinerary.transitMode
			&&
			iconNode && iconNode.tags && iconNode.tags.rcn_ref
			&&
			iconNode.tags [ 'network:type' ] && 'node_network' === iconNode.tags [ 'network:type' ]
		) {
			this.#mapIconData.rcnRef = iconNode.tags.rcn_ref;
			this.#mapIconData.tooltip +=
				theTranslator.getText ( 'MapIconDataBuilder - rcnRef', { rcnRef : this.#mapIconData.rcnRef } );
		}

		let incomingStreet = '';
		let outgoingStreet = '';

		let isRoundaboutEntry = false;
		let isRoundaboutExit = false;

		// Searching  passing streets names, incoming and outgoing streets names, roundabout entry and exit
		this.#overpassAPIDataLoader.ways.forEach (
			way => {
				if ( ! way.nodes.includes ( svgPointId ) ) {
					return;
				}

				let wayName = this.#getWayName ( way );
				let haveName = '' !== wayName;

				let isIncomingStreet = way.nodes.includes ( incomingNodeId );
				let isOutgoingStreet = way.nodes.includes ( outgoingNodeId );

				// the same way can enter multiple times in the intersection!
				let streetOcurrences = way.nodes.filter ( nodeId => nodeId === svgPointId ).length * TWO;

				// the icon is at the begining of the street
				if ( way.nodes [ ZERO ] === svgPointId ) {
					streetOcurrences --;
				}

				// the icon is at end of the street
				if ( way.nodes [ way.nodes.length - ONE ] === svgPointId ) {
					streetOcurrences --;
				}

				// it's the incoming street ...saving name  and eventually the roundabout exit
				if ( isIncomingStreet ) {
					incomingStreet = haveName ? wayName : '???';
					streetOcurrences --;
					if ( way.tags.junction && 'roundabout' === way.tags.junction ) {
						isRoundaboutExit = true;
					}
				}
				if ( ZERO === streetOcurrences ) {
					return;
				}

				// it's the outgoing street ...saving name  and eventually the roundabout exit
				if ( isOutgoingStreet ) {
					outgoingStreet = haveName ? wayName : '???';
					streetOcurrences --;
					if ( way.tags.junction && 'roundabout' === way.tags.junction ) {
						isRoundaboutEntry = true;
					}
				}
				if ( ZERO === streetOcurrences || ! haveName ) {
					return;
				}

				// It's a passing street ... saving name...
				while ( ZERO !== streetOcurrences ) {
					this.#mapIconData.streets =
						'' === this.#mapIconData.streets ? wayName : this.#mapIconData.streets + ' ⪥  ' + wayName; // ⪥  = ><
					streetOcurrences --;
				}
			}
		);

		if ( ICON_POSITION.atStart === this.#computeData.positionOnRoute ) {

			// It's the start point adding a green circle to the outgoing street
			this.#mapIconData.streets = '🟢 ' + outgoingStreet;
		}
		else if ( ICON_POSITION.atEnd === this.#computeData.positionOnRoute ) {

			// It's the end point adding a red circle to the incoming street
			this.#mapIconData.streets = incomingStreet + ' 🔴 ';
		}
		else {

			// Adiing the incoming and outgoing streets and direction arrow
			this.#mapIconData.streets =
				incomingStreet +
				( '' === this.#mapIconData.streets ? '' : ' ⪥  ' + this.#mapIconData.streets ) + // ⪥ = ><
				' ' + this.#computeData.directionArrow + ' ' +
				outgoingStreet;
		}

		// adding roundabout info
		if ( isRoundaboutEntry && ! isRoundaboutExit ) {
			this.#mapIconData.tooltip += theTranslator.getText ( 'MapIconDataBuilder - entry roundabout' );
		}
		else if ( ! isRoundaboutEntry && isRoundaboutExit ) {
			this.#mapIconData.tooltip += theTranslator.getText ( 'MapIconDataBuilder - exit roundabout' );
		}
		else if ( isRoundaboutEntry && isRoundaboutExit ) {
			this.#mapIconData.tooltip +=
				theTranslator.getText ( 'MapIconDataBuilder - continue roundabout' ); // strange but correct
		}
		if ( isMiniRoundabout ) {
			this.#mapIconData.tooltip +=
				theTranslator.getText ( 'MapIconDataBuilder - at the small roundabout on the ground' );
		}
	}

	constructor ( overpassAPIDataLoader, computeData, mapIconData ) {
		this.#overpassAPIDataLoader = overpassAPIDataLoader;
		this.#computeData = computeData;
		this.#mapIconData = mapIconData;
	}

	findStreets ( ) {
		this.#findStreets ( );
	}
}

export default StreetFinder;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of ArrowAndTooltipFinder.js file

@------------------------------------------------------------------------------------------------------------------------------
*/