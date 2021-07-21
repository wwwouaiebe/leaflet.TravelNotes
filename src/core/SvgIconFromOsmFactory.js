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
	- v1.4.0:
		- created
	- v1.6.0:
		- Issue ♯65 : Time to go to ES6 modules?
		- Issue ♯68 : Review all existing promises.
	- v2.0.0:
		- Issue ♯135 : Remove innerHTML from code
		- Issue ♯136 : Remove html entities from js string
		- Issue ♯138 : Protect the app - control html entries done by user.
		- Issue ♯145 : Merge svg icon and knoopunt icon
Doc reviewed 20200808
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file SvgIconFromOsmFactory.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@typedef {Object} OsmNoteData
@desc An object that store the data found in osm for a svg note creation
@property {string} svg The svg definition created from the OSM map and the itinerary. This will be used as icon for the note
@property {string} tooltip A string with the drection to follow This will be used as tooltip for the note
@property {string} city A string with the city. This will be used for the note address
@property {string} place A place (Can be 'town', 'city', 'village' or 'hamlet') found in OSM.
This will be used for the note address
@property {string} streets A string with all the streets found at the note position. This will be used for the note address
@property {Array.<number>} latLng The latitude and longitude of the nearest itinerary point
@public

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module SvgIconFromOsmFactory
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theConfig from '../data/Config.js';
import theDataSearchEngine from '../data/DataSearchEngine.js';
import { theGeometry } from '../util/Geometry.js';
import { theSphericalTrigonometry } from '../util/SphericalTrigonometry.js';
import { theTranslator } from '../UI/Translator.js';
import SvgMapBuilder from '../core/SvgMapBuilder.js';
import OverpassAPIDataLoader from '../core/OverpassAPIDataLoader.js';
import { ICON_DIMENSIONS, LAT_LNG, DISTANCE, ZERO, ONE, TWO, NOT_FOUND, DEGREES } from '../util/Constants.js';

const OUR_ICON_POSITION = Object.freeze ( {
	atStart : -ONE,
	onRoute : ZERO,
	atEnd : ONE
} );

const OUR_SEARCH_AROUND_FACTOR = 1.5;

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewSvgIconFromOsmFactory
@desc constructor of SvgIconFromOsmFactory object
@return {SvgIconFromOsmFactory} an instance of SvgIconFromOsmFactory object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/* eslint-disable-next-line max-statements */
function ourNewSvgIconFromOsmFactory ( ) {

	let mySvgLatLngDistance = Object.seal (
		{
			latLng : [ LAT_LNG.defaultValue, LAT_LNG.defaultValue ],
			distance : DISTANCE.defaultValue
		}
	);
	let myNearestItineraryPoint = null;
	let myRoute = null;

	let myPositionOnRoute = OUR_ICON_POSITION.onRoute;
	let myTranslation = [ ZERO, ZERO ];
	let myRotation = ZERO;
	let myDirection = null;
	let mySvgZoom = theConfig.note.svgIcon.zoom;
	let mySvgAngleDistance = theConfig.note.svgIcon.angleDistance;
	let myDirectionArrow = ' ';
	let myTooltip = '';
	let myStreets = '';
	let myRcnRef = '';

	let myOverpassAPIDataLoader = new OverpassAPIDataLoader ( { searchRelations : false } );

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function mySearchNearestItineraryPoint
	@desc this function search the nearest itinerary point from the point given by the user
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function mySearchNearestItineraryPoint ( ) {

		// Searching the nearest itinerary point
		let minDistance = Number.MAX_VALUE;
		let distance = DISTANCE.defaultValue;

		// Iteration on the points...
		myRoute.itinerary.itineraryPoints.forEach (
			itineraryPoint => {
				let itineraryPointDistance =
					theSphericalTrigonometry.pointsDistance ( mySvgLatLngDistance.latLng, itineraryPoint.latLng );
				if ( minDistance > itineraryPointDistance ) {
					minDistance = itineraryPointDistance;
					myNearestItineraryPoint = itineraryPoint;
					mySvgLatLngDistance.distance = distance;
				}
				distance += itineraryPoint.distance;
			}
		);

		// The coordinates of the nearest point are used as position of the SVG
		mySvgLatLngDistance.latLng = myNearestItineraryPoint.latLng;

	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myLatLngCompare
	@desc this function compare the lat and lng of the parameter with the lat and lng of the route waypoints
	@param {ItineraryPoint} itineraryPoint the itineraryPoint to test
	@return {boolean} true when the itineraryPoint is not at the same position than a WayPoint and not at the
	same position than the icon point
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myLatLngCompare ( itineraryPoint ) {

		const COMPARE_PRECISION = 0.000005;

		let isWayPoint = false;
		myRoute.wayPoints.forEach (
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
			( myNearestItineraryPoint.lat !== itineraryPoint.lat || myNearestItineraryPoint.lng !== itineraryPoint.lng ) );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myGetWayName
	@desc return the name of a way
	@param {Object} way  A way found in the request result
	@return the concatenation of the way.tag and way.name if any
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myGetWayName ( way ) {
		return ( way.tags.name ? way.tags.name : '' ) +
			( way.tags.name && way.tags.ref ? ' ' : '' ) +
			( way.tags.ref ? '[' + way.tags.ref + ']' : '' );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function mySearchPassingStreets
	@desc this function search all the streets passing trough the nearest itinerary point
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	/* eslint-disable-next-line complexity */
	function mySearchPassingStreets ( ) {

		// searching the previous and next point on the itinerary
		let incomingItineraryPoint =
			myRoute.itinerary.itineraryPoints.previous ( myNearestItineraryPoint.objId, myLatLngCompare );
		let outgoingItineraryPoint =
			myRoute.itinerary.itineraryPoints.next ( myNearestItineraryPoint.objId, myLatLngCompare );

		let svgPointId = NOT_FOUND;
		let incomingNodeId = NOT_FOUND;
		let outgoingNodeId = NOT_FOUND;

		let svgNodeDistance = Number.MAX_VALUE;
		let incomingNodeDistance = Number.MAX_VALUE;
		let outgoingNodeDistance = Number.MAX_VALUE;
		let nodeDistance = DISTANCE.defaultValue;
		let rcnRefNode = null;

		// searching in the nodes JS map the incoming, outgoing and icon nodes
		myOverpassAPIDataLoader.nodes.forEach (
			node => {
				if ( 'bike' === myRoute.itinerary.transitMode && node.tags && node.tags.rcn_ref ) {
					rcnRefNode = node;
				}
				if ( myNearestItineraryPoint ) {
					nodeDistance =
						theSphericalTrigonometry.pointsDistance ( [ node.lat, node.lon ], myNearestItineraryPoint.latLng );
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

		let iconNode = myOverpassAPIDataLoader.nodes.get ( svgPointId );

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
			'bike' === myRoute.itinerary.transitMode
			&&
			iconNode && iconNode.tags && iconNode.tags.rcn_ref
			&&
			iconNode.tags [ 'network:type' ] && 'node_network' === iconNode.tags [ 'network:type' ]
		) {
			myRcnRef = iconNode.tags.rcn_ref;
			myTooltip += theTranslator.getText ( 'SvgIconFromOsmFactory - rcnRef', { rcnRef : myRcnRef } );
		}

		let incomingStreet = '';
		let outgoingStreet = '';

		let isRoundaboutEntry = false;
		let isRoundaboutExit = false;

		// Searching  passing streets names, incoming and outgoing streets names, roundabout entry and exit
		myOverpassAPIDataLoader.ways.forEach (
			way => {
				if ( ! way.nodes.includes ( svgPointId ) ) {
					return;
				}

				let wayName = myGetWayName ( way );
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
					myStreets = '' === myStreets ? wayName : myStreets + ' ⪥  ' + wayName; // ⪥  = ><
					streetOcurrences --;
				}
			}
		);

		if ( OUR_ICON_POSITION.atStart === myPositionOnRoute ) {

			// It's the start point adding a green circle to the outgoing street
			myStreets = '🟢 ' + outgoingStreet;
		}
		else if ( OUR_ICON_POSITION.atEnd === myPositionOnRoute ) {

			// It's the end point adding a red circle to the incoming street
			myStreets = incomingStreet + ' 🔴 ';
		}
		else {

			// Adiing the incoming and outgoing streets and direction arrow
			myStreets =
				incomingStreet +
				( '' === myStreets ? '' : ' ⪥  ' + myStreets ) + // ⪥ = ><
				' ' + myDirectionArrow + ' ' +
				outgoingStreet;
		}

		// adding roundabout info
		if ( isRoundaboutEntry && ! isRoundaboutExit ) {
			myTooltip += theTranslator.getText ( 'SvgIconFromOsmFactory - entry roundabout' );
		}
		else if ( ! isRoundaboutEntry && isRoundaboutExit ) {
			myTooltip += theTranslator.getText ( 'SvgIconFromOsmFactory - exit roundabout' );
		}
		else if ( isRoundaboutEntry && isRoundaboutExit ) {
			myTooltip += theTranslator.getText ( 'SvgIconFromOsmFactory - continue roundabout' ); // strange but correct
		}
		if ( isMiniRoundabout ) {
			myTooltip += theTranslator.getText ( 'SvgIconFromOsmFactory - at the small roundabout on the ground' );
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myComputeTranslation
	@desc this function compute the translation needed to have the itinerary point in the middle of the svg
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myComputeTranslation ( ) {
		myTranslation = theGeometry.subtrackPoints (
			[ ICON_DIMENSIONS.svgViewboxDim / TWO, ICON_DIMENSIONS.svgViewboxDim / TWO ],
			theGeometry.project ( mySvgLatLngDistance.latLng, mySvgZoom )
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myComputeRotationAndDirection
	@desc This function compute the rotation needed to have the SVG oriented on the itinerary
	and compute also the direction to take after the icon
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myComputeRotationAndDirection ( ) {

		// searching points at least at 10 m ( mySvgAngleDistance ) from the icon point,
		// one for rotation and one for direction
		let distance = DISTANCE.defaultValue;
		let rotationItineraryPoint = myRoute.itinerary.itineraryPoints.first;
		let directionItineraryPoint = myRoute.itinerary.itineraryPoints.last;
		let directionPointReached = false;

		myRoute.itinerary.itineraryPoints.forEach (
			itineraryPoint => {
				if ( mySvgLatLngDistance.distance - distance > mySvgAngleDistance ) {
					rotationItineraryPoint = itineraryPoint;
				}
				if ( distance - mySvgLatLngDistance.distance > mySvgAngleDistance && ! directionPointReached ) {
					directionItineraryPoint = itineraryPoint;
					directionPointReached = true;
				}
				distance += itineraryPoint.distance;
			}
		);

		let iconPoint = theGeometry.addPoints (
			theGeometry.project ( mySvgLatLngDistance.latLng, mySvgZoom ),
			myTranslation
		);

		// computing rotation... if possible
		if ( myNearestItineraryPoint.objId !== myRoute.itinerary.itineraryPoints.first.objId ) {
			let rotationPoint = theGeometry.addPoints (
				theGeometry.project ( rotationItineraryPoint.latLng, mySvgZoom ),
				myTranslation
			);
			myRotation =
				Math.atan (
					( iconPoint [ ONE ] - rotationPoint [ ONE ] )
					/
					( rotationPoint [ ZERO ] - iconPoint [ ZERO ] )
				)
				*
				DEGREES.d180 / Math.PI;
			if ( ZERO > myRotation ) {
				myRotation += DEGREES.d360;
			}
			myRotation -= DEGREES.d270;

			// point 0,0 of the svg is the UPPER left corner
			if ( ZERO > rotationPoint [ ZERO ] - iconPoint [ ZERO ] ) {
				myRotation += DEGREES.d180;
			}
		}

		// computing direction ... if possible

		if ( myNearestItineraryPoint.objId !== myRoute.itinerary.itineraryPoints.last.objId ) {
			let directionPoint = theGeometry.addPoints (
				theGeometry.project ( directionItineraryPoint.latLng, mySvgZoom ),
				myTranslation
			);
			myDirection = Math.atan (
				( iconPoint [ ONE ] - directionPoint [ ONE ] )
				/
				( directionPoint [ ZERO ] - iconPoint [ ZERO ] )
			)
				*
				DEGREES.d180 / Math.PI;

			// point 0,0 of the svg is the UPPER left corner
			if ( ZERO > directionPoint [ ZERO ] - iconPoint [ ZERO ] ) {
				myDirection += DEGREES.d180;
			}
			myDirection -= myRotation;

			// setting direction between 0 and 360
			while ( DEGREES.d0 > myDirection ) {
				myDirection += DEGREES.d360;
			}
			while ( DEGREES.d360 < myDirection ) {
				myDirection -= DEGREES.d360;
			}
		}
		if ( myNearestItineraryPoint.objId === myRoute.itinerary.itineraryPoints.first.objId ) {
			myRotation = -myDirection - DEGREES.d90;
			myDirection = null;
			myPositionOnRoute = OUR_ICON_POSITION.atStart;
		}

		if (
			mySvgLatLngDistance.latLng [ ZERO ] === myRoute.itinerary.itineraryPoints.last.lat
			&&
			mySvgLatLngDistance.latLng [ ONE ] === myRoute.itinerary.itineraryPoints.last.lng
		) {

			// using lat & lng because last point is sometime duplicated
			myDirection = null;
			myPositionOnRoute = OUR_ICON_POSITION.atEnd;
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function mySetDirectionArrowAndTooltip
	@desc this function set the direction arrow and tooltip
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function mySetDirectionArrowAndTooltip ( ) {

		if ( null !== myDirection ) {
			if ( myDirection < theConfig.note.svgIcon.angleDirection.right ) {
				myTooltip = theTranslator.getText ( 'SvgIconFromOsmFactory - Turn right' );
				myDirectionArrow = '🢂';
			}
			else if ( myDirection < theConfig.note.svgIcon.angleDirection.slightRight ) {
				myTooltip = theTranslator.getText ( 'SvgIconFromOsmFactory - Turn slight right' );
				myDirectionArrow = '🢅';
			}
			else if ( myDirection < theConfig.note.svgIcon.angleDirection.continue ) {
				myTooltip = theTranslator.getText ( 'SvgIconFromOsmFactory - Continue' );
				myDirectionArrow = '🢁';
			}
			else if ( myDirection < theConfig.note.svgIcon.angleDirection.slightLeft ) {
				myTooltip = theTranslator.getText ( 'SvgIconFromOsmFactory - Turn slight left' );
				myDirectionArrow = '🢄';
			}
			else if ( myDirection < theConfig.note.svgIcon.angleDirection.left ) {
				myTooltip = theTranslator.getText ( 'SvgIconFromOsmFactory - Turn left' );
				myDirectionArrow = '🢀';
			}
			else if ( myDirection < theConfig.note.svgIcon.angleDirection.sharpLeft ) {
				myTooltip = theTranslator.getText ( 'SvgIconFromOsmFactory - Turn sharp left' );
				myDirectionArrow = '🢇';
			}
			else if ( myDirection < theConfig.note.svgIcon.angleDirection.sharpRight ) {
				myTooltip = theTranslator.getText ( 'SvgIconFromOsmFactory - Turn sharp right' );
				myDirectionArrow = '🢆';
			}
			else {
				myTooltip = theTranslator.getText ( 'SvgIconFromOsmFactory - Turn right' );
				myDirectionArrow = '🢂';
			}
		}

		if ( OUR_ICON_POSITION.atStart === myPositionOnRoute ) {
			myTooltip = theTranslator.getText ( 'SvgIconFromOsmFactory - Start' );
		}
		else if ( OUR_ICON_POSITION.atEnd === myPositionOnRoute ) {
			myTooltip = theTranslator.getText ( 'SvgIconFromOsmFactory - Stop' );
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class
	@classdesc This class is used to create  an svg icon for a route note
	@see {@link newSvgIconFromOsmFactory} for constructor
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	class SvgIconFromOsmFactory {

		#queryDistance = Math.max (
			theConfig.geoCoder.distances.hamlet,
			theConfig.geoCoder.distances.village,
			theConfig.geoCoder.distances.city,
			theConfig.geoCoder.distances.town
		);

		#requestStarted = false;

		/**
		Search and build all the needed data
		@param {function} onOk The success handler passed to the Promise
		@param {function} onError The error handler passed to the Promise
		@private
		*/

		#buildIconAndAdress ( ) {
			myComputeTranslation ( );
			myComputeRotationAndDirection ( );
			mySetDirectionArrowAndTooltip ( );
			mySearchPassingStreets ( );

			let MapIconData = {
				translation : myTranslation,
				rotation : myRotation,
				rcnRef : myRcnRef
			};
			let svgMapBuilder = new SvgMapBuilder ( );
			let svgElement = svgMapBuilder.buildSvg ( myRoute, myOverpassAPIDataLoader, MapIconData );

			this.#requestStarted = false;

			return Object.freeze (
				{
					statusOk : true,
					svg : svgElement,
					tooltip : myTooltip,
					city : myOverpassAPIDataLoader.city,
					place : myOverpassAPIDataLoader.place,
					streets : myStreets,
					latLng : myNearestItineraryPoint.latLng
				}
			);
		}

		constructor ( ) {
			Object.freeze ( this );
		}

		async getIconAndAdress ( iconLatLng, routeObjId ) {
			mySvgLatLngDistance.latLng = iconLatLng;
			myRoute = theDataSearchEngine.getRoute ( routeObjId );

			if ( this.#requestStarted ) {
				return Object.freeze (
					{
						statusOk : false
					}
				);
			}

			this.#requestStarted = true;
			myDirectionArrow = ' ';
			myTooltip = '';
			myStreets = '';

			mySearchNearestItineraryPoint ( );

			let queryLatLng =
				mySvgLatLngDistance.latLng [ ZERO ].toFixed ( LAT_LNG.fixed ) +
				',' +
				mySvgLatLngDistance.latLng [ ONE ].toFixed ( LAT_LNG.fixed );

			/*
			Sample of query:
				way[highway](around:300,50.489312,5.501035)->.a;(.a >;.a;)->.a;.a out;
				is_in(50.644242,5.572354)->.e;area.e[admin_level][boundary="administrative"];out;
				node(around:1500,50.644242,5.572354)[place];out;
			*/

			let queries = [
				'way[highway](around:' +
				( ICON_DIMENSIONS.svgViewboxDim * OUR_SEARCH_AROUND_FACTOR ).toFixed ( ZERO ) +
				',' + queryLatLng + ')->.a;(.a >;.a;)->.a;.a out;' +
				'is_in(' + queryLatLng + ')->.e;area.e[admin_level][boundary="administrative"];out;' +
				'node(around:' + this.#queryDistance + ',' + queryLatLng + ')[place];out;'
			];

			await myOverpassAPIDataLoader.loadData ( queries, mySvgLatLngDistance.latLng );
			if ( myOverpassAPIDataLoader.statusOk ) {
				return this.#buildIconAndAdress ( );
			}
			return Object.freeze (
				{
					statusOk : false
				}
			);
		}
	}

	return new SvgIconFromOsmFactory ( );
}

/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newSvgIconFromOsmFactory
	@desc constructor of SvgIconFromOsmFactory object
	@return {SvgIconFromOsmFactory} an instance of SvgIconFromOsmFactory object
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

export {
	ourNewSvgIconFromOsmFactory as newSvgIconFromOsmFactory
};

/*
--- End of svgIconFromOsmFactory.js file --------------------------------------------------------------------------------------
*/