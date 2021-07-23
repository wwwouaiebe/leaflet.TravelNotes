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
Doc reviewed 20210722
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file MapIconDataBuilder.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@typedef {Object} MapIconData
@desc an object with the data needed to build the note and icon
@property {Array.<Number>} translation The translation to use for the svg
@property {Number} rotation The rotation to use for the svg
@property {string} rcnRef Thr RCN_REF found at the icon position or an empty string
@property {string} tooltip A string to be used for the icon tooltip
@property {string} streets A string with the street names found at the icon position

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module MapIconDataBuilder
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theConfig from '../data/Config.js';
import theGeometry from '../util/Geometry.js';
import { theSphericalTrigonometry } from '../util/SphericalTrigonometry.js';
import { theTranslator } from '../UI/Translator.js';

import { ICON_DIMENSIONS, DISTANCE, INVALID_OBJ_ID, ZERO, ONE, TWO, NOT_FOUND, DEGREES } from '../util/Constants.js';

const SVG_ZOOM = theConfig.note.svgIcon.zoom;
const SVG_ANGLE_DISTANCE = theConfig.note.svgIcon.angleDistance;
const ICON_POSITION = Object.freeze ( {
	atStart : -ONE,
	onRoute : ZERO,
	atEnd : ONE
} );

/**
@--------------------------------------------------------------------------------------------------------------------------

@class MapIconDataBuilder
@classdesc This class is used to search the data needed for the map icon creation
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class MapIconDataBuilder {

	static #route = null;
	#overpassAPIDataLoader = null;
	static #mapIconPosition = null;

	#mapIconData = Object.seal (
		{
			translation : [ ZERO, ZERO ],
			rotation : ZERO,
			rcnRef : '',
			tooltip : '',
			streets : ''
		}
	);

	#positionOnRoute = ICON_POSITION.onRoute;
	#direction = null;
	#directionArrow = ' ';

	/**
	This method compare the lat and lng of the parameter with the lat and lng of the route waypoints
	@param {ItineraryPoint} itineraryPoint the itineraryPoint to test
	@return {boolean} true when the itineraryPoint is not at the same position than a WayPoint and not at the
	same position than the icon point
	@private
	*/

	static #latLngCompare ( itineraryPoint ) {

		const COMPARE_PRECISION = 0.000005;

		let isWayPoint = false;
		MapIconDataBuilder.#route.wayPoints.forEach (
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
				MapIconDataBuilder.#mapIconPosition.latLng [ ZERO ] !== itineraryPoint.lat
				||
				MapIconDataBuilder.#mapIconPosition.latLng [ ONE ] !== itineraryPoint.lng
			)
		);
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
	This method compute the translation needed to have the itinerary point in the middle of the svg
	@private
	*/

	#computeTranslation ( ) {
		this.#mapIconData.translation = theGeometry.subtrackPoints (
			[ ICON_DIMENSIONS.svgViewboxDim / TWO, ICON_DIMENSIONS.svgViewboxDim / TWO ],
			theGeometry.project ( MapIconDataBuilder.#mapIconPosition.latLng, SVG_ZOOM )
		);
	}

	/**
	this method compute the rotation needed to have the SVG oriented on the itinerary
	and compute also the direction to take after the icon
	@private
	*/

	#computeRotationAndDirection ( ) {

		// searching points at least at 10 m ( SVG_ANGLE_DISTANCE ) from the icon point,
		// one for rotation and one for direction
		let distance = DISTANCE.defaultValue;
		let rotationItineraryPoint = MapIconDataBuilder.#route.itinerary.itineraryPoints.first;
		let directionItineraryPoint = MapIconDataBuilder.#route.itinerary.itineraryPoints.last;
		let directionPointReached = false;

		MapIconDataBuilder.#route.itinerary.itineraryPoints.forEach (
			itineraryPoint => {
				if ( MapIconDataBuilder.#mapIconPosition.distance - distance > SVG_ANGLE_DISTANCE ) {
					rotationItineraryPoint = itineraryPoint;
				}
				if (
					distance - MapIconDataBuilder.#mapIconPosition.distance
					>
					SVG_ANGLE_DISTANCE && ! directionPointReached
				) {
					directionItineraryPoint = itineraryPoint;
					directionPointReached = true;
				}
				distance += itineraryPoint.distance;
			}
		);

		let iconPoint = theGeometry.addPoints (
			theGeometry.project ( MapIconDataBuilder.#mapIconPosition.latLng, SVG_ZOOM ),
			this.#mapIconData.translation
		);

		// computing rotation... if possible
		if (
			MapIconDataBuilder.#mapIconPosition.nearestItineraryPointObjId
			!==
			MapIconDataBuilder.#route.itinerary.itineraryPoints.first.objId
		) {
			let rotationPoint = theGeometry.addPoints (
				theGeometry.project ( rotationItineraryPoint.latLng, SVG_ZOOM ),
				this.#mapIconData.translation
			);
			this.#mapIconData.rotation =
				Math.atan (
					( iconPoint [ ONE ] - rotationPoint [ ONE ] )
					/
					( rotationPoint [ ZERO ] - iconPoint [ ZERO ] )
				)
				*
				DEGREES.d180 / Math.PI;
			if ( ZERO > this.#mapIconData.rotation ) {
				this.#mapIconData.rotation += DEGREES.d360;
			}
			this.#mapIconData.rotation -= DEGREES.d270;

			// point 0,0 of the svg is the UPPER left corner
			if ( ZERO > rotationPoint [ ZERO ] - iconPoint [ ZERO ] ) {
				this.#mapIconData.rotation += DEGREES.d180;
			}
		}

		// computing direction ... if possible

		if (
			MapIconDataBuilder.#mapIconPosition.nearestItineraryPointObjId
			!==
			MapIconDataBuilder.#route.itinerary.itineraryPoints.last.objId
		) {
			let directionPoint = theGeometry.addPoints (
				theGeometry.project ( directionItineraryPoint.latLng, SVG_ZOOM ),
				this.#mapIconData.translation
			);
			this.#direction = Math.atan (
				( iconPoint [ ONE ] - directionPoint [ ONE ] )
				/
				( directionPoint [ ZERO ] - iconPoint [ ZERO ] )
			)
				*
				DEGREES.d180 / Math.PI;

			// point 0,0 of the svg is the UPPER left corner
			if ( ZERO > directionPoint [ ZERO ] - iconPoint [ ZERO ] ) {
				this.#direction += DEGREES.d180;
			}
			this.#direction -= this.#mapIconData.rotation;

			// setting direction between 0 and 360
			while ( DEGREES.d0 > this.#direction ) {
				this.#direction += DEGREES.d360;
			}
			while ( DEGREES.d360 < this.#direction ) {
				this.#direction -= DEGREES.d360;
			}
		}
		if (
			MapIconDataBuilder.#mapIconPosition.nearestItineraryPointObjId
			===
			MapIconDataBuilder.#route.itinerary.itineraryPoints.first.objId
		) {
			this.#mapIconData.rotation = -this.#direction - DEGREES.d90;
			this.#direction = null;
			this.#positionOnRoute = ICON_POSITION.atStart;
		}

		if (
			MapIconDataBuilder.#mapIconPosition.latLng [ ZERO ] === MapIconDataBuilder.#route.itinerary.itineraryPoints.last.lat
			&&
			MapIconDataBuilder.#mapIconPosition.latLng [ ONE ] === MapIconDataBuilder.#route.itinerary.itineraryPoints.last.lng
		) {

			// using lat & lng because last point is sometime duplicated
			this.#direction = null;
			this.#positionOnRoute = ICON_POSITION.atEnd;
		}
	}

	/**
	This method set the direction arrow and tooltip
	@private
	*/

	#setDirectionArrowAndTooltip ( ) {
		if ( null !== this.#direction ) {
			if ( this.#direction < theConfig.note.svgIcon.angleDirection.right ) {
				this.#mapIconData.tooltip = theTranslator.getText ( 'MapIconDataBuilder - Turn right' );
				this.#directionArrow = '🢂';
			}
			else if ( this.#direction < theConfig.note.svgIcon.angleDirection.slightRight ) {
				this.#mapIconData.tooltip = theTranslator.getText ( 'MapIconDataBuilder - Turn slight right' );
				this.#directionArrow = '🢅';
			}
			else if ( this.#direction < theConfig.note.svgIcon.angleDirection.continue ) {
				this.#mapIconData.tooltip = theTranslator.getText ( 'MapIconDataBuilder - Continue' );
				this.#directionArrow = '🢁';
			}
			else if ( this.#direction < theConfig.note.svgIcon.angleDirection.slightLeft ) {
				this.#mapIconData.tooltip = theTranslator.getText ( 'MapIconDataBuilder - Turn slight left' );
				this.#directionArrow = '🢄';
			}
			else if ( this.#direction < theConfig.note.svgIcon.angleDirection.left ) {
				this.#mapIconData.tooltip = theTranslator.getText ( 'MapIconDataBuilder - Turn left' );
				this.#directionArrow = '🢀';
			}
			else if ( this.#direction < theConfig.note.svgIcon.angleDirection.sharpLeft ) {
				this.#mapIconData.tooltip = theTranslator.getText ( 'MapIconDataBuilder - Turn sharp left' );
				this.#directionArrow = '🢇';
			}
			else if ( this.#direction < theConfig.note.svgIcon.angleDirection.sharpRight ) {
				this.#mapIconData.tooltip = theTranslator.getText ( 'MapIconDataBuilder - Turn sharp right' );
				this.#directionArrow = '🢆';
			}
			else {
				this.#mapIconData.tooltip = theTranslator.getText ( 'MapIconDataBuilder - Turn right' );
				this.#directionArrow = '🢂';
			}
		}

		if ( ICON_POSITION.atStart === this.#positionOnRoute ) {
			this.#mapIconData.tooltip = theTranslator.getText ( 'MapIconDataBuilder - Start' );
		}
		else if ( ICON_POSITION.atEnd === this.#positionOnRoute ) {
			this.#mapIconData.tooltip = theTranslator.getText ( 'MapIconDataBuilder - Stop' );
		}
	}

	/**
	this method search all the streets passing trough the nearest itinerary point
	@private
	*/

	/* eslint-disable-next-line complexity */
	#searchPassingStreets ( ) {

		// searching the previous and next point on the itinerary
		let incomingItineraryPoint = MapIconDataBuilder.#route.itinerary.itineraryPoints.previous (
			MapIconDataBuilder.#mapIconPosition.nearestItineraryPointObjId,
			MapIconDataBuilder.#latLngCompare
		);
		let outgoingItineraryPoint = MapIconDataBuilder.#route.itinerary.itineraryPoints.next (
			MapIconDataBuilder.#mapIconPosition.nearestItineraryPointObjId,
			MapIconDataBuilder.#latLngCompare
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
				if ( 'bike' === MapIconDataBuilder.#route.itinerary.transitMode && node.tags && node.tags.rcn_ref ) {
					rcnRefNode = node;
				}
				if ( INVALID_OBJ_ID !== MapIconDataBuilder.#mapIconPosition.nearestItineraryPointObjId ) {
					nodeDistance = theSphericalTrigonometry.pointsDistance (
						[ node.lat, node.lon ],
						MapIconDataBuilder.#mapIconPosition.latLng
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
			'bike' === MapIconDataBuilder.#route.itinerary.transitMode
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

		if ( ICON_POSITION.atStart === this.#positionOnRoute ) {

			// It's the start point adding a green circle to the outgoing street
			this.#mapIconData.streets = '🟢 ' + outgoingStreet;
		}
		else if ( ICON_POSITION.atEnd === this.#positionOnRoute ) {

			// It's the end point adding a red circle to the incoming street
			this.#mapIconData.streets = incomingStreet + ' 🔴 ';
		}
		else {

			// Adiing the incoming and outgoing streets and direction arrow
			this.#mapIconData.streets =
				incomingStreet +
				( '' === this.#mapIconData.streets ? '' : ' ⪥  ' + this.#mapIconData.streets ) + // ⪥ = ><
				' ' + this.#directionArrow + ' ' +
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

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	This method compute all the data needed for the map icon.
	@param {route} route The route for witch the icon must be builded
	@param {OverpassAPIDataLoader} overpassAPIDataLoader The overpassAPIDataLoader object used for query the data
	@param {Object} mapIconPosition
	@return {MapIconData} an object with the data needed to build the icon.
	*/

	buildData ( route, overpassAPIDataLoader, mapIconPosition ) {
		MapIconDataBuilder.#route = route;
		this.#overpassAPIDataLoader = overpassAPIDataLoader;
		MapIconDataBuilder.#mapIconPosition = mapIconPosition;

		this.#mapIconData.translation = [ ZERO, ZERO ];
		this.#mapIconData.rotation = ZERO;
		this.#mapIconData.rcnRef = '';
		this.#mapIconData.tooltip = '';
		this.#mapIconData.streets = '';

		this.#positionOnRoute = ICON_POSITION.onRoute;
		this.#direction = null;
		this.#directionArrow = ' ';

		this.#computeTranslation ( );
		this.#computeRotationAndDirection ( );
		this.#setDirectionArrowAndTooltip ( );
		this.#searchPassingStreets ( );

		return this.#mapIconData;
	}

}

export default MapIconDataBuilder;

/*
--- End of MapIconDataBuilder.js file -----------------------------------------------------------------------------------------
*/