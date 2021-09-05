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
import theSphericalTrigonometry from '../coreLib/SphericalTrigonometry.js';
import theTranslator from '../UILib/Translator.js';

import { DISTANCE, INVALID_OBJ_ID, ZERO, ONE, TWO, NOT_FOUND, ICON_POSITION } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class StreetFinder
@classdesc Search:
- the rcn ref number at the icon position
- roundabout info at the icon position
- street names at the icon position
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class StreetFinder {

	#overpassAPIDataLoader = null;
	#computeData = null;
	#mapIconData = null;

	#rcnRefNode = null;
	#svgPointId = NOT_FOUND;
	#incomingNodeId = NOT_FOUND;
	#outgoingNodeId = NOT_FOUND;
	#iconNode = null;

	#incomingStreet = '';
	#outgoingStreet = '';

	#roundabout = {
		isMini : false,
		isEntry : false,
		isExit : false
	}

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
	Searching incoming node and outgoing node ( nodes before and after the icon node on the route )
	and the rcnRef node ( bike only )
	@private
	*/

	#findNodes ( ) {

		// searching the previous and next point on the itinerary
		let incomingItineraryPoint = this.#computeData.route.itinerary.itineraryPoints.previous (
			this.#computeData.mapIconPosition.nearestItineraryPointObjId,
			itineraryPoint => this.#latLngCompare ( itineraryPoint )
		);
		let outgoingItineraryPoint = this.#computeData.route.itinerary.itineraryPoints.next (
			this.#computeData.mapIconPosition.nearestItineraryPointObjId,
			itineraryPoint => this.#latLngCompare ( itineraryPoint )
		);

		let svgNodeDistance = Number.MAX_VALUE;
		let incomingNodeDistance = Number.MAX_VALUE;
		let outgoingNodeDistance = Number.MAX_VALUE;
		let nodeDistance = DISTANCE.defaultValue;

		// searching in the nodes JS map the incoming, outgoing and icon nodes
		this.#overpassAPIDataLoader.nodes.forEach (
			node => {
				if ( 'bike' === this.#computeData.route.itinerary.transitMode && node.tags && node.tags.rcn_ref ) {
					this.#rcnRefNode = node;
				}
				if ( INVALID_OBJ_ID !== this.#computeData.mapIconPosition.nearestItineraryPointObjId ) {
					nodeDistance = theSphericalTrigonometry.pointsDistance (
						[ node.lat, node.lon ],
						this.#computeData.mapIconPosition.latLng
					);
					if ( nodeDistance < svgNodeDistance ) {
						this.#svgPointId = node.id;
						svgNodeDistance = nodeDistance;
					}
				}
				if ( incomingItineraryPoint ) {
					nodeDistance =
						theSphericalTrigonometry.pointsDistance ( [ node.lat, node.lon ], incomingItineraryPoint.latLng );
					if ( nodeDistance < incomingNodeDistance ) {
						this.#incomingNodeId = node.id;
						incomingNodeDistance = nodeDistance;
					}
				}
				if ( outgoingItineraryPoint ) {
					nodeDistance =
						theSphericalTrigonometry.pointsDistance ( [ node.lat, node.lon ], outgoingItineraryPoint.latLng );
					if ( nodeDistance < outgoingNodeDistance ) {
						this.#outgoingNodeId = node.id;
						outgoingNodeDistance = nodeDistance;
					}
				}
			}
		);
		this.#iconNode = this.#overpassAPIDataLoader.nodes.get ( this.#svgPointId );
	}

	/**
	Moving the icon to the rcnref node if icnRef node is near the icon node (only bike routing have rcnRef)
	@private
	*/

	#moveIconToRcnRef ( ) {

		if ( this.#rcnRefNode ) {
			let rcnRefDistance = theSphericalTrigonometry.pointsDistance (
				[ this.#rcnRefNode.lat, this.#rcnRefNode.lon ],
				[ this.#iconNode.lat, this.#iconNode.lon ]
			);
			if ( theConfig.note.svgIcon.rcnRefDistance > rcnRefDistance ) {
				this.#iconNode = this.#rcnRefNode;
			}
		}
	}

	/**
	Searching a mini roundabout at the icon node
	@private
	*/

	#findMiniRoundabout ( ) {
		this.#roundabout.isMini = (
			this.#iconNode
			&&
			this.#iconNode.tags
			&&
			this.#iconNode.tags.highway
			&&
			'mini_roundabout' === this.#iconNode.tags.highway
		);
	}

	/**
	Adding the rcnRef number to the tooltip
	@private
	*/

	#addRcnRefNumber ( ) {
		if (
			'bike' === this.#computeData.route.itinerary.transitMode
			&&
			this.#iconNode && this.#iconNode.tags && this.#iconNode.tags.rcn_ref
			&&
			this.#iconNode.tags [ 'network:type' ] && 'node_network' === this.#iconNode.tags [ 'network:type' ]
		) {
			this.#mapIconData.rcnRef = this.#iconNode.tags.rcn_ref;
			this.#mapIconData.tooltip +=
				theTranslator.getText ( 'MapIconDataBuilder - rcnRef', { rcnRef : this.#mapIconData.rcnRef } );
		}
	}

	/**
	Searching  passing streets names, incoming and outgoing streets names, roundabout entry and exit
	@private
	*/

	#findStreets ( ) {
		this.#overpassAPIDataLoader.ways.forEach (
			way => {
				if ( ! way.nodes.includes ( this.#svgPointId ) ) {
					return;
				}

				let wayName = this.#getWayName ( way );
				let haveName = '' !== wayName;

				let isIncomingStreet = way.nodes.includes ( this.#incomingNodeId );
				let isOutgoingStreet = way.nodes.includes ( this.#outgoingNodeId );

				// the same way can enter multiple times in the intersection!
				let streetOcurrences = way.nodes.filter ( nodeId => nodeId === this.#svgPointId ).length * TWO;

				// the icon is at the begining of the street
				if ( way.nodes [ ZERO ] === this.#svgPointId ) {
					streetOcurrences --;
				}

				// the icon is at end of the street
				if ( way.nodes [ way.nodes.length - ONE ] === this.#svgPointId ) {
					streetOcurrences --;
				}

				// it's the incoming street ...saving name  and eventually the roundabout exit
				if ( isIncomingStreet ) {
					this.#incomingStreet = haveName ? wayName : '???';
					streetOcurrences --;
					if ( way.tags.junction && 'roundabout' === way.tags.junction ) {
						this.#roundabout.isExit = true;
					}
				}
				if ( ZERO === streetOcurrences ) {
					return;
				}

				// it's the outgoing street ...saving name  and eventually the roundabout exit
				if ( isOutgoingStreet ) {
					this.#outgoingStreet = haveName ? wayName : '???';
					streetOcurrences --;
					if ( way.tags.junction && 'roundabout' === way.tags.junction ) {
						this.#roundabout.isEntry = true;
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
	}

	/**
	Adding street name
	@private
	*/

	#addStreetInfo ( ) {

		if ( ICON_POSITION.atStart === this.#computeData.positionOnRoute ) {

			// It's the start point adding a green circle to the outgoing street
			this.#mapIconData.streets = '🟢 ' + this.#outgoingStreet;
		}
		else if ( ICON_POSITION.atEnd === this.#computeData.positionOnRoute ) {

			// It's the end point adding a red circle to the incoming street
			this.#mapIconData.streets = this.#incomingStreet + ' 🔴 ';
		}
		else {

			// Adiing the incoming and outgoing streets and direction arrow
			this.#mapIconData.streets =
				this.#incomingStreet +
				( '' === this.#mapIconData.streets ? '' : ' ⪥  ' + this.#mapIconData.streets ) + // ⪥ = ><
				' ' + this.#computeData.directionArrow + ' ' +
				this.#outgoingStreet;
		}
	}

	/**
	Adding roundabout info
	@private
	*/

	#addRoundaboutInfo ( ) {
		if ( this.#roundabout.isEntry && ! this.#roundabout.isExit ) {
			this.#mapIconData.tooltip += theTranslator.getText ( 'MapIconDataBuilder - entry roundabout' );
		}
		else if ( ! this.#roundabout.isEntry && this.#roundabout.isExit ) {
			this.#mapIconData.tooltip += theTranslator.getText ( 'MapIconDataBuilder - exit roundabout' );
		}
		else if ( this.#roundabout.isEntry && this.#roundabout.isExit ) {
			this.#mapIconData.tooltip +=
				theTranslator.getText ( 'MapIconDataBuilder - continue roundabout' ); // strange but correct
		}
		if ( this.#roundabout.isMini ) {
			this.#mapIconData.tooltip +=
				theTranslator.getText ( 'MapIconDataBuilder - at the small roundabout on the ground' );
		}
	}

	/*
	constructor
	*/

	constructor ( overpassAPIDataLoader, computeData, mapIconData ) {
		this.#overpassAPIDataLoader = overpassAPIDataLoader;
		this.#computeData = computeData;
		this.#mapIconData = mapIconData;
		Object.freeze ( this );
	}

	/**
	Find street info: street names, roundabout info, rcnRef info ...
	*/

	findData ( ) {
		this.#findNodes ( );
		this.#moveIconToRcnRef ( );
		this.#findMiniRoundabout ( );
		this.#addRcnRefNumber ( );
		this.#findStreets ( );
		this.#addStreetInfo ( );
		this.#addRoundaboutInfo ( );
	}
}

export default StreetFinder;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of ArrowAndTooltipFinder.js file

@------------------------------------------------------------------------------------------------------------------------------
*/