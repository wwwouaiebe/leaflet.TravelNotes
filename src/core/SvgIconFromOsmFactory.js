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
		- Issue #65 : Time to go to ES6 modules?
		- Issue #68 : Review all existing promises.
	- v2.0.0:
		- Issue #135 : Remove innerHTML from code
		- Issue #136 : Remove html entities from js string
		- Issue #138 : Protect the app - control html entries done by user.
		- Issue #145 : Merge svg icon and knoopunt icon
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

import { theConfig } from '../data/Config.js';
import { theDataSearchEngine } from '../data/DataSearchEngine.js';
import { theGeometry } from '../util/Geometry.js';
import { theSphericalTrigonometry } from '../util/SphericalTrigonometry.js';
import { theTranslator } from '../UI/Translator.js';
import { SVG_NS, ICON_DIMENSIONS, LAT_LNG, DISTANCE, ZERO, ONE, TWO, NOT_FOUND, HTTP_STATUS_OK } from '../util/Constants.js';

let ourRequestStarted = false;
const ourQueryDistance = Math.max (
	theConfig.note.svgHamletDistance,
	theConfig.note.svgVillageDistance,
	theConfig.note.svgCityDistance,
	theConfig.note.svgTownDistance
);

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

	const DEGREE_0 = 0;
	const DEGREE_90 = 90;
	const DEGREE_180 = 180;
	const DEGREE_270 = 270;
	const DEGREE_360 = 360;

	const AT_START = -1;
	const ON_ROUTE = 0;
	const AT_END = 1;
	const MY_OSM_COUNTRY_ADMIN_LEVEL = '2';

	let myOsmCityAdminLevel = theConfig.note.osmCityAdminLevel.DEFAULT;
	let mySvgLatLngDistance = Object.seal (
		{
			latLng : [ LAT_LNG.defaultValue, LAT_LNG.defaultValue ],
			distance : DISTANCE.defaultValue
		}
	);
	let myNearestItineraryPoint = null;
	let myRoute = null;
	let myWaysMap = new Map ( );
	let myNodesMap = new Map ( );
	let myAdminNames = [];
	let myPlaces = {};
	let myPlace = null;
	let myCity = null;
	let mySvg = null;
	let myPositionOnRoute = ON_ROUTE;
	let myTranslation = [ ZERO, ZERO ];
	let myRotation = ZERO;
	let myDirection = null;
	let mySvgZoom = theConfig.note.svgZoom;
	let mySvgAngleDistance = theConfig.note.svgAngleDistance;
	let myDirectionArrow = ' ';
	let myTooltip = '';
	let myStreets = '';
	let myRcnRef = '';

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function mySetHamletAndCity
	@desc this function search the city and hamlet
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function mySetHamletAndCity ( ) {
		myCity = null;
		let adminHamlet = null;

		for ( let namesCounter = TWO; namesCounter < myAdminNames.length; namesCounter ++ ) {
			if ( 'undefined' !== typeof ( myAdminNames [ namesCounter ] ) ) {
				if ( myOsmCityAdminLevel >= namesCounter ) {
					myCity = myAdminNames [ namesCounter ];
				}
				else {
					adminHamlet = myAdminNames [ namesCounter ];
				}
			}
		}
		myPlace = null;
		let placeDistance = Number.MAX_VALUE;

		Object.values ( myPlaces ).forEach (
			place => {
				if ( place.distance < placeDistance ) {
					placeDistance = place.distance;
					myPlace = place.name;
				}
			}
		);

		myPlace = adminHamlet || myPlace;
		if ( myPlace === myCity ) {
			myPlace = null;
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateNodesAndWaysMaps
	@desc This function create the way and node JS maps from the overpassAPI response and extract city and myPlaces
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateNodesAndWaysMaps ( overpassAPIdata ) {
		myWaysMap.clear ( );
		myNodesMap.clear ( );
		myAdminNames = [];
		myPlaces = {
			hamlet : {
				name : null,
				distance : Number.MAX_VALUE,
				maxDistance : theConfig.note.svgHamletDistance
			},
			village : {
				name : null,
				distance : Number.MAX_VALUE,
				maxDistance : theConfig.note.svgVillageDistance
			},
			city : {
				name : null,
				distance : Number.MAX_VALUE,
				maxDistance : theConfig.note.svgCityDistance
			},
			town : {
				name : null,
				distance : Number.MAX_VALUE,
				maxDistance : theConfig.note.svgTownDistance
			}
		};
		const LNG = theConfig.nominatim.language;

		overpassAPIdata.elements.forEach (
			element => {
				switch ( element.type ) {
				case 'area' :
					{
						let elementName = element.tags.name;
						if ( LNG && '*' !== LNG && element.tags [ 'name:' + LNG ] ) {
							elementName = element.tags [ 'name:' + LNG ];
						}
						myAdminNames [ Number.parseInt ( element.tags.admin_level ) ] = elementName;
						if ( MY_OSM_COUNTRY_ADMIN_LEVEL === element.tags.admin_level ) {
							myOsmCityAdminLevel =
								theConfig.note.osmCityAdminLevel [ element.tags [ 'ISO3166-1' ] ] || myOsmCityAdminLevel;
						}
					}
					break;
				case 'way' :
					element.nodesIds = element.nodes;
					delete element.nodes;
					myWaysMap.set ( element.id, element );
					break;
				case 'node' :
					myNodesMap.set ( element.id, element );
					if (
						element.tags &&
						element.tags.place &&
						myPlaces [ element.tags.place ] &&
						element.tags.name
					) {
						let nodeDistance = theSphericalTrigonometry.pointsDistance (
							mySvgLatLngDistance.latLng,
							[ element.lat, element.lon ]
						);
						let place = myPlaces [ element.tags.place ];
						if ( place.maxDistance > nodeDistance && place.distance > nodeDistance ) {
							place.distance = nodeDistance;
							place.name = element.tags.name;
						}
					}
					break;
				default :
					break;
				}
			}
		);
	}

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
		myNodesMap.forEach (
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

		let iconNode = myNodesMap.get ( svgPointId );

		if ( rcnRefNode ) {
			let rcnRefDistance = theSphericalTrigonometry.pointsDistance (
				[ rcnRefNode.lat, rcnRefNode.lon ],
				[ iconNode.lat, iconNode.lon ]
			);
			if ( theConfig.note.svgRcnRefDistance > rcnRefDistance ) {
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
		myWaysMap.forEach (
			way => {
				if ( ! way.nodesIds.includes ( svgPointId ) ) {
					return;
				}

				let wayName = myGetWayName ( way );
				let haveName = '' !== wayName;

				let isIncomingStreet = way.nodesIds.includes ( incomingNodeId );
				let isOutgoingStreet = way.nodesIds.includes ( outgoingNodeId );

				// the same way can enter multiple times in the intersection!
				let streetOcurrences = way.nodesIds.filter ( nodeId => nodeId === svgPointId ).length * TWO;

				// the icon is at the begining of the street
				if ( way.nodesIds [ ZERO ] === svgPointId ) {
					streetOcurrences --;
				}

				// the icon is at end of the street
				if ( way.nodesIds [ way.nodesIds.length - ONE ] === svgPointId ) {
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

		if ( AT_START === myPositionOnRoute ) {

			// It's the start point adding a green circle to the outgoing street
			myStreets = '🟢 ' + outgoingStreet;
		}
		else if ( AT_END === myPositionOnRoute ) {

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
				DEGREE_180 / Math.PI;
			if ( ZERO > myRotation ) {
				myRotation += DEGREE_360;
			}
			myRotation -= DEGREE_270;

			// point 0,0 of the svg is the UPPER left corner
			if ( ZERO > rotationPoint [ ZERO ] - iconPoint [ ZERO ] ) {
				myRotation += DEGREE_180;
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
				DEGREE_180 / Math.PI;

			// point 0,0 of the svg is the UPPER left corner
			if ( ZERO > directionPoint [ ZERO ] - iconPoint [ ZERO ] ) {
				myDirection += DEGREE_180;
			}
			myDirection -= myRotation;

			// setting direction between 0 and 360
			while ( DEGREE_0 > myDirection ) {
				myDirection += DEGREE_360;
			}
			while ( DEGREE_360 < myDirection ) {
				myDirection -= DEGREE_360;
			}
		}
		if ( myNearestItineraryPoint.objId === myRoute.itinerary.itineraryPoints.first.objId ) {
			myRotation = -myDirection - DEGREE_90;
			myDirection = null;
			myPositionOnRoute = AT_START;
		}

		if (
			mySvgLatLngDistance.latLng [ ZERO ] === myRoute.itinerary.itineraryPoints.last.lat
			&&
			mySvgLatLngDistance.latLng [ ONE ] === myRoute.itinerary.itineraryPoints.last.lng
		) {

			// using lat & lng because last point is sometime duplicated
			myDirection = null;
			myPositionOnRoute = AT_END;
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
			if ( myDirection < theConfig.note.svgAnleMaxDirection.right ) {
				myTooltip = theTranslator.getText ( 'SvgIconFromOsmFactory - Turn right' );
				myDirectionArrow = '🢂';
			}
			else if ( myDirection < theConfig.note.svgAnleMaxDirection.slightRight ) {
				myTooltip = theTranslator.getText ( 'SvgIconFromOsmFactory - Turn slight right' );
				myDirectionArrow = '🢅';
			}
			else if ( myDirection < theConfig.note.svgAnleMaxDirection.continue ) {
				myTooltip = theTranslator.getText ( 'SvgIconFromOsmFactory - Continue' );
				myDirectionArrow = '🢁';
			}
			else if ( myDirection < theConfig.note.svgAnleMaxDirection.slightLeft ) {
				myTooltip = theTranslator.getText ( 'SvgIconFromOsmFactory - Turn slight left' );
				myDirectionArrow = '🢄';
			}
			else if ( myDirection < theConfig.note.svgAnleMaxDirection.left ) {
				myTooltip = theTranslator.getText ( 'SvgIconFromOsmFactory - Turn left' );
				myDirectionArrow = '🢀';
			}
			else if ( myDirection < theConfig.note.svgAnleMaxDirection.sharpLeft ) {
				myTooltip = theTranslator.getText ( 'SvgIconFromOsmFactory - Turn sharp left' );
				myDirectionArrow = '🢇';
			}
			else if ( myDirection < theConfig.note.svgAnleMaxDirection.sharpRight ) {
				myTooltip = theTranslator.getText ( 'SvgIconFromOsmFactory - Turn sharp right' );
				myDirectionArrow = '🢆';
			}
			else {
				myTooltip = theTranslator.getText ( 'SvgIconFromOsmFactory - Turn right' );
				myDirectionArrow = '🢂';
			}
		}

		if ( AT_START === myPositionOnRoute ) {
			myTooltip = theTranslator.getText ( 'SvgIconFromOsmFactory - Start' );
		}
		else if ( AT_END === myPositionOnRoute ) {
			myTooltip = theTranslator.getText ( 'SvgIconFromOsmFactory - Stop' );
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateRoute
	@desc This function create the SVG polyline for the route
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateRoute ( ) {

		// to avoid a big svg, all points outside the svg viewBox are not added
		let index = -ONE;
		let firstPointIndex = NOT_FOUND;
		let lastPointIndex = NOT_FOUND;
		let points = [];
		myRoute.itinerary.itineraryPoints.forEach (
			itineraryPoint => {
				index ++;
				let point = theGeometry.addPoints ( theGeometry.project ( itineraryPoint.latLng, mySvgZoom ), myTranslation );
				points.push ( point );
				let pointIsInside =
					point [ ZERO ] >= ZERO && point [ ONE ] >= ZERO
					&&
					point [ ZERO ] <= ICON_DIMENSIONS.svgViewboxDim
					&&
					point [ ONE ] <= ICON_DIMENSIONS.svgViewboxDim;
				if ( pointIsInside ) {
					if ( NOT_FOUND === firstPointIndex ) {
						firstPointIndex = index;
					}
					lastPointIndex = index;
				}
			}
		);
		if ( NOT_FOUND !== firstPointIndex && NOT_FOUND !== lastPointIndex ) {
			if ( ZERO < firstPointIndex ) {
				firstPointIndex --;
			}
			if ( myRoute.itinerary.itineraryPoints.length - ONE > lastPointIndex ) {
				lastPointIndex ++;
			}
			let pointsAttribute = '';
			for ( index = firstPointIndex; index <= lastPointIndex; index ++ ) {
				pointsAttribute += points[ index ] [ ZERO ].toFixed ( ZERO ) + ',' +
					points[ index ] [ ONE ].toFixed ( ZERO ) + ' ';
			}
			let polyline = document.createElementNS ( SVG_NS, 'polyline' );
			polyline.setAttributeNS ( null, 'points', pointsAttribute );
			polyline.setAttributeNS ( null, 'class', 'TravelNotes-OSM-Itinerary' );
			polyline.setAttributeNS (
				null,
				'transform',
				'rotate(' + myRotation +
					',' + ( ICON_DIMENSIONS.svgViewboxDim / TWO ) +
					',' + ( ICON_DIMENSIONS.svgViewboxDim / TWO )
					+ ')'
			);
			mySvg.appendChild ( polyline );
		}

	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateWays
	@desc This function creates the ways from OSM
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateWays ( ) {

		// to avoid a big svg, all points outside the svg viewBox are not added
		myWaysMap.forEach (
			way => {
				let firstPointIndex = NOT_FOUND;
				let lastPointIndex = NOT_FOUND;
				let index = -ONE;
				let points = [ ];
				way.nodesIds.forEach (
					nodeId => {
						index ++;
						let node = myNodesMap.get ( nodeId );
						let point = theGeometry.addPoints (
							theGeometry.project ( [ node.lat, node.lon ], mySvgZoom ),
							myTranslation
						);
						points.push ( point );
						let pointIsInside =
							point [ ZERO ] >= ZERO
							&&
							point [ ONE ] >= ZERO
							&&
							point [ ZERO ] <= ICON_DIMENSIONS.svgViewboxDim
							&&
							point [ ONE ] <= ICON_DIMENSIONS.svgViewboxDim;
						if ( pointIsInside ) {
							if ( NOT_FOUND === firstPointIndex ) {
								firstPointIndex = index;
							}
							lastPointIndex = index;
						}
					}
				);
				if ( NOT_FOUND !== firstPointIndex && NOT_FOUND !== lastPointIndex ) {
					if ( ZERO < firstPointIndex ) {
						firstPointIndex --;
					}
					if ( way.nodesIds.length - ONE > lastPointIndex ) {
						lastPointIndex ++;
					}
					let pointsAttribute = '';
					for ( index = firstPointIndex; index <= lastPointIndex; index ++ ) {
						pointsAttribute +=
							points[ index ] [ ZERO ].toFixed ( ZERO ) + ',' +
							points[ index ] [ ONE ].toFixed ( ZERO ) + ' ';
					}

					let polyline = document.createElementNS ( SVG_NS, 'polyline' );
					polyline.setAttributeNS ( null, 'points', pointsAttribute );
					polyline.setAttributeNS (
						null,
						'class',
						'TravelNotes-OSM-Highway TravelNotes-OSM-Highway-' + way.tags.highway
					);
					polyline.setAttributeNS (
						null,
						'transform',
						'rotate(' + myRotation +
							',' + ( ICON_DIMENSIONS.svgViewboxDim / TWO ) +
							',' + ( ICON_DIMENSIONS.svgViewboxDim / TWO ) +
							')'
					);

					mySvg.appendChild ( polyline );
				}
			}
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateRcnRef
	@desc This function creates the RcnRef from OSM
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateRcnRef ( ) {
		const Y_TEXT = 0.6;
		if ( '' === myRcnRef ) {
			return;
		}
		let svgText = document.createElementNS ( SVG_NS, 'text' );
		svgText.textContent = myRcnRef;
		svgText.setAttributeNS ( null, 'x', String ( ICON_DIMENSIONS.svgViewboxDim / TWO ) );
		svgText.setAttributeNS ( null, 'y', String ( ICON_DIMENSIONS.svgViewboxDim * Y_TEXT ) );
		svgText.setAttributeNS ( null, 'class', 'TravelNotes-OSM-RcnRef' );
		mySvg.appendChild ( svgText );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateSvg
	@desc This function creates the SVG
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateSvg ( ) {
		const FOUR = 4;
		mySvg = document.createElementNS ( SVG_NS, 'svg' );
		mySvg.setAttributeNS (
			null,
			'viewBox',
			String ( ICON_DIMENSIONS.svgViewboxDim / FOUR ) + ' ' +
			( ICON_DIMENSIONS.svgViewboxDim / FOUR ) + ' ' +
			( ICON_DIMENSIONS.svgViewboxDim / TWO ) + ' ' +
			( ICON_DIMENSIONS.svgViewboxDim / TWO )
		);
		mySvg.setAttributeNS ( null, 'class', 'TravelNotes-SvgIcon' );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myGetUrl
	@desc this function creates the full url needed to have the data fromm osm
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myGetUrl ( ) {

		/*
		Sample of request:

		https://lz4.overpass-api.de/api/interpreter?
		data=
			[out:json][timeout:40];
			way[highway](around:300,50.489312,5.501035)->.a;(.a >;.a;)->.a;.a out;
			is_in(50.644242,5.572354)->.e;area.e[admin_level][boundary="administrative"];out;
			node(around:1500,50.644242,5.572354)[place];out;
		*/

		const SEARCH_AROUND_FACTOR = 1.5;

		let requestLatLng =
			mySvgLatLngDistance.latLng [ ZERO ].toFixed ( LAT_LNG.fixed ) +
			',' +
			mySvgLatLngDistance.latLng [ ONE ].toFixed ( LAT_LNG.fixed );

		let requestUrl = theConfig.overpassApi.url +
			'?data=[out:json][timeout:' + theConfig.note.svgTimeOut + '];' +
			'way[highway](around:' +
			( ICON_DIMENSIONS.svgViewboxDim * SEARCH_AROUND_FACTOR ).toFixed ( ZERO ) +
			',' + requestLatLng + ')->.a;(.a >;.a;)->.a;.a out;' +
			'is_in(' + requestLatLng + ')->.e;area.e[admin_level][boundary="administrative"];out;' +
			'node(around:' + ourQueryDistance + ',' + requestLatLng + ')[place];out;';

		return requestUrl;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myBuildIconAndAdress
	@desc Search and build all the needed data
	@param {function} onOk The success handler passed to the Promise
	@param {function} onError The error handler passed to the Promise
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myBuildIconAndAdress ( overpassAPIdata, onOk /* , onError */ ) {
		myCreateNodesAndWaysMaps ( overpassAPIdata );
		myCreateSvg ( );
		mySetHamletAndCity ( );
		myComputeTranslation ( );
		myComputeRotationAndDirection ( );
		mySetDirectionArrowAndTooltip ( );
		mySearchPassingStreets ( );
		myCreateRoute ( );
		myCreateWays ( );
		myCreateRcnRef ( );

		ourRequestStarted = false;

		onOk (
			Object.freeze (
				{
					svg : mySvg,
					tooltip : myTooltip,
					city : myCity,
					place : myPlace,
					streets : myStreets,
					latLng : myNearestItineraryPoint.latLng
				}
			)
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myGetIconAndAdress
	@desc This is the entry point for the icon creation
	@param {function} onOk The success handler passed to the Promise
	@param {function} onError The error handler passed to the Promise
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myGetIconAndAdress ( onOk, onError ) {

		if ( ourRequestStarted ) {
			onError ( 'A request is already running' );
			return;
		}

		ourRequestStarted = true;

		mySvg = null;
		myCity = null;
		myPlace = null;
		myDirectionArrow = ' ';
		myTooltip = '';
		myStreets = '';

		mySearchNearestItineraryPoint ( );

		fetch ( myGetUrl ( ) )
			.then (
				response => {
					if ( HTTP_STATUS_OK === response.status && response.ok ) {
						response.json ( )
							. then ( overpassAPIdata => myBuildIconAndAdress ( overpassAPIdata, onOk, onError ) )
							.catch (
								err => {
									ourRequestStarted = false;
									onError ( err );
								}
							);
					}
					else {
						ourRequestStarted = false;
						onError ( new Error ( 'An error occurs when callin OverpassAPI' ) );
					}
				}
			);
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

		/**
		this function returns a Promise for the svg icon creation
		@param {array.<number>} iconLatLng The lat and lng where the icon must be createDocumentFragment
		@param {!number} routeObjId the objId of the route
		@return {Promise} A promise that fulfill with a OsmNoteData object completed
		*/

		getPromiseIconAndAdress ( iconLatLng, routeObjId ) {
			mySvgLatLngDistance.latLng = iconLatLng;
			myRoute = theDataSearchEngine.getRoute ( routeObjId );

			return new Promise ( myGetIconAndAdress );
		}
	}

	return Object.seal ( new SvgIconFromOsmFactory );
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