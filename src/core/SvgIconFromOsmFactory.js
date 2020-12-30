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
	- v1.14.0:
		- Issue #135 : Remove innerHTML from code
		- Issue #136 : Remove html entities from js string
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
import { theHttpRequestBuilder } from '../util/HttpRequestBuilder.js';
import { theTranslator } from '../UI/Translator.js';
import { SVG_NS, LAT_LNG, DISTANCE, ZERO, ONE, TWO, NOT_FOUND } from '../util/Constants.js';

let ourRequestStarted = false;

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewSvgIconFromOsmFactory
@desc constructor of SvgIconFromOsmFactory object
@return {SvgIconFromOsmFactory} an instance of SvgIconFromOsmFactory object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewSvgIconFromOsmFactory ( ) {

	const DEGREE_0 = 0;
	const DEGREE_90 = 90;
	const DEGREE_180 = 180;
	const DEGREE_270 = 270;
	const DEGREE_360 = 360;

	const AT_START = -1;
	const ON_ROUTE = 0;
	const AT_END = 1;

	let mySvgLatLngDistance = Object.seal (
		{
			latLng : [ LAT_LNG.defaultValue, LAT_LNG.defaultValue ],
			distance : DISTANCE.defaultValue
		}
	);
	let myNearestItineraryPoint = null;
	let myRoute = null; // the TravelNotes route object
	let myResponse = {}; // the xmlHttpRequest response parsed
	let myWaysMap = new Map ( );
	let myNodesMap = new Map ( );
	let myPlaces = [];
	let myPlace = null;
	let myCity = '';
	let mySvg = null; // the svg element
	let myPositionOnRoute = ON_ROUTE;
	let myTranslation = [ ZERO, ZERO ];
	let myRotation = ZERO;
	let myDirection = null;
	let mySvgZoom = theConfig.note.svgZoom;
	let mySvgAngleDistance = theConfig.note.svgAngleDistance;
	let myDirectionArrow = ' ';
	let myTooltip = '';
	let myStreets = '';

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateNodesAndWaysMaps
	@desc This function create the way and node JS maps from the XmlHttpRequest response and extract city and places
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateNodesAndWaysMaps ( ) {
		myWaysMap.clear ( );
		myNodesMap.clear ( );

		// Elements are pushed in 2 maps: 1 for nodes and 1 for ways
		myResponse.elements.forEach (
			element => {
				switch ( element.type ) {
				case 'area' :

					// the only area in the response is the city
					if ( element.tags && element.tags.boundary && element.tags.name ) {
						myCity = element.tags.name;
					}
					break;
				case 'way' :

					// replacing the nodes property with the nodesId property to
					// avoid confusion between nodes and nodesId. The element.nodes contains nodesIds!!
					element.nodesIds = element.nodes;
					delete element.nodes;
					myWaysMap.set ( element.id, element );
					break;
				case 'node' :

					myNodesMap.set ( element.id, element );
					if (
						element.tags && element.tags.place
						&&
						[ 'town', 'city', 'village', 'hamlet' ].includes ( element.tags.place )
					) {

						// a place is found in the response
						myPlaces.push ( element );
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
				let itineraryPointDistance = theGeometry.pointsDistance ( mySvgLatLngDistance.latLng, itineraryPoint.latLng );
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

	@function mySearchHamlet
	@desc this function search the nearest place from the nearest itinerary point
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function mySearchHamlet ( ) {
		let minDistance = Number.MAX_VALUE;
		myPlaces.forEach (
			place => {
				let placeDistance = theGeometry.pointsDistance ( myNearestItineraryPoint.latLng, [ place.lat, place.lon ] );
				if ( minDistance > placeDistance ) {
					minDistance = placeDistance;
					myPlace = place.tags.name;
				}
			}
		);
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

		const COMPARE_PRECISION = 0.00001;

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

		// searching in the nodes JS map the incoming, outgoing and icon nodes
		myNodesMap.forEach (
			node => {
				if ( myNearestItineraryPoint ) {
					nodeDistance = theGeometry.pointsDistance ( [ node.lat, node.lon ], myNearestItineraryPoint.latLng );
					if ( nodeDistance < svgNodeDistance ) {
						svgPointId = node.id;
						svgNodeDistance = nodeDistance;
					}
				}
				if ( incomingItineraryPoint ) {
					nodeDistance = theGeometry.pointsDistance ( [ node.lat, node.lon ], incomingItineraryPoint.latLng );
					if ( nodeDistance < incomingNodeDistance ) {
						incomingNodeId = node.id;
						incomingNodeDistance = nodeDistance;
					}
				}
				if ( outgoingItineraryPoint ) {
					nodeDistance = theGeometry.pointsDistance ( [ node.lat, node.lon ], outgoingItineraryPoint.latLng );
					if ( nodeDistance < outgoingNodeDistance ) {
						outgoingNodeId = node.id;
						outgoingNodeDistance = nodeDistance;
					}
				}
			}
		);

		let iconNode = myNodesMap.get ( svgPointId );

		// searching a mini roundabout at the icon node
		let isMiniRoundabout =
			( iconNode && iconNode.tags && iconNode.tags.highway && 'mini_roundabout' === iconNode.tags.highway );

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
			[ theConfig.note.svgIconWidth / TWO, theConfig.note.svgIconWidth / TWO ],
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
					point [ ZERO ] <= theConfig.note.svgIconWidth
					&&
					point [ ONE ] <= theConfig.note.svgIconWidth;
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
					',' + ( theConfig.note.svgIconWidth / TWO ) +
					',' + ( theConfig.note.svgIconWidth / TWO )
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
							point [ ZERO ] <= theConfig.note.svgIconWidth
							&&
							point [ ONE ] <= theConfig.note.svgIconWidth;
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
							',' + ( theConfig.note.svgIconWidth / TWO ) +
							',' + ( theConfig.note.svgIconWidth / TWO ) +
							')'
					);

					mySvg.appendChild ( polyline );
				}
			}
		);
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
			String ( theConfig.note.svgIconWidth / FOUR ) + ' ' +
			( theConfig.note.svgIconWidth / FOUR ) + ' ' +
			( theConfig.note.svgIconWidth / TWO ) + ' ' +
			( theConfig.note.svgIconWidth / TWO )
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
			[out:json][timeout:15000];															=> format, timeout

			way[highway](around:300,50.489312,5.501035)->.a;(.a >;.a;)->.a;.a out;				=> Searching streets

			is_in(50.489312,5.501035)->.e;														=> Searching city limit
			area.e[admin_level="2"][name="United Kingdom"]->.f;
			area.e[admin_level="8"]->.g;
			area.e[admin_level="10"]->.h;
			if(f.count(deriveds)==0){
				.g->.i;																			Normally admin_level = 8
			}
			else{																				but in the UK nothing is as
				if(h.count(deriveds)==0){														in the others countries...
					.g->.i;																		So we have to search first
				}																				with admin_level = 10
				else{																			and if nothing found,
					.h->.i;																		search with admin_level = 8
				}
			}
			.i out;

			(
				node(area.i)[place="village"];													=> Searching places in the
				node(area.i)[place="hamlet"];													city area
				node(area.i)[place="city"];
				node(area.i)[place="town"];
			)->.k;

			( 																					=> Searching places near the
				node(around:200,50.489312,5.501035)[place="hamlet"];							icon point
				node(around:400,50.489312,5.501035)[place="village"];
				node(around:1200,50.489312,5.501035)[place="city"];
				node(around:1500,50.489312,5.501035)[place="town"];
			)->.l;
			node.k.l->.m;
			.m out;
		*/

		const SEARCH_AROUND_FACTOR = 1.5;

		let requestLatLng =
			mySvgLatLngDistance.latLng [ ZERO ].toFixed ( LAT_LNG.fixed ) +
			',' +
			mySvgLatLngDistance.latLng [ ONE ].toFixed ( LAT_LNG.fixed );

		let requestUrl = theConfig.overpassApiUrl +
			'?data=[out:json][timeout:' +
			theConfig.note.svgTimeOut + '];' +
			'way[highway](around:' +
			( theConfig.note.svgIconWidth * SEARCH_AROUND_FACTOR ).toFixed ( ZERO ) +
			',' +
			requestLatLng +
			')->.a;(.a >;.a;)->.a;.a out;' +
			'is_in(' +
			requestLatLng +
			')->.e;' +
			'area.e[admin_level="2"][name="United Kingdom"]->.f;' +
			'area.e[admin_level="8"]->.g;' +
			'area.e[admin_level="10"]->.h;' +
			'if(f.count(deriveds)==0){.g->.i;}else{if(h.count(deriveds)==0){.g->.i;}else{.h->.i;}}.i out;' +
			'(node(area.i)[place="village"];' +
			'node(area.i)[place="hamlet"];' +
			'node(area.i)[place="city"];' +
			'node(area.i)[place="town"];)->.k;' +
			'( ' +
			'node(around:' +
			theConfig.note.svgHamletDistance +
			',' +
			requestLatLng +
			')[place="hamlet"];' +
			'node(around:' +
			theConfig.note.svgVillageDistance +
			',' +
			requestLatLng +
			')[place="village"];' +
			'node(around:' +
			theConfig.note.svgCityDistance +
			',' +
			requestLatLng +
			')[place="city"];' +
			'node(around:' +
			theConfig.note.svgTownDistance +
			',' +
			requestLatLng +
			')[place="town"];' +
			')->.l;' +
			'node.k.l->.m;' +
			'.m out;';
		return requestUrl;
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

		function BuildIconAndAdress ( response ) {
			myResponse = response;

			myCreateNodesAndWaysMaps ( );
			myCreateSvg ( );
			mySearchHamlet ( );
			myComputeTranslation ( );
			myComputeRotationAndDirection ( );
			mySetDirectionArrowAndTooltip ( );
			mySearchPassingStreets ( );
			myCreateRoute ( );
			myCreateWays ( );

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

		if ( ourRequestStarted ) {
			onError ( 'A request is already running' );
			return;
		}

		ourRequestStarted = true;

		myResponse = {};
		mySvg = null;
		myCity = '';
		myDirectionArrow = ' ';
		myTooltip = '';
		myStreets = '';

		mySearchNearestItineraryPoint ( );

		theHttpRequestBuilder.getJsonPromise ( myGetUrl ( ) )
			.then ( BuildIconAndAdress )
			.catch (
				err => {
					ourRequestStarted = false;
					onError ( err );
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