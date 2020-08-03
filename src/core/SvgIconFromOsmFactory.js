/*
Copyright - 2019 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- SvgIconFromOsmFactory.js file -------------------------------------------------------------------------------------
This file contains:
	- the newSvgIconFromOsmFactory function
Changes:
	- v1.4.0:
		- created
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
		- Issue #68 : Review all existing promises.
Doc reviewed 20191122
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file SvgIconFromOsmFactory.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@typedef {Object} OsmNoteData
@desc An object to store the data found in osm
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
import { newGeometry } from '../util/Geometry.js';
import { newHttpRequestBuilder } from '../util/HttpRequestBuilder.js';
import { theTranslator } from '../UI/Translator.js';

import { LAT_LNG, DISTANCE, ZERO, ONE, TWO, NOT_FOUND } from '../util/Constants.js';

let ourRequestStarted = false;

/*
--- newSvgIconFromOsmFactory function ---------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newSvgIconFromOsmFactory ( ) {

	const DEGREE_0 = 0;
	const DEGREE_90 = 90;
	const DEGREE_180 = 180;
	const DEGREE_270 = 270;
	const DEGREE_360 = 360;

	const AT_START = -1;
	const ON_ROUTE = 0;
	const AT_END = 1;

	let myGeometry = newGeometry ( );

	let mySvgLatLngDistance = {
		latLng : [ LAT_LNG.defaultValue, LAT_LNG.defaultValue ],
		distance : DISTANCE.defaultValue
	};
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

	/*
	--- myCreateNodesAndWaysMaps function -----------------------------------------------------------------------------

	This function create the way and node maps from the XmlHttpRequest response

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateNodesAndWaysMaps ( ) {
		myWaysMap.clear ( );
		myNodesMap.clear ( );

		// Elements are pushed in 2 maps: 1 for nodes and 1 for ways
		myResponse.elements.forEach (
			element => {
				switch ( element.type ) {
				case 'area' :
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
						myPlaces.push ( element );
					}
					break;
				default :
					break;
				}
			}
		);
	}

	/*
	--- mySearchItineraryPoints function ------------------------------------------------------------------------------

	This function search the nearest route point from the icon and compute the distance from the begining of the route

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySearchNearestItineraryPoint ( ) {

		// Searching the nearest itinerary point
		let minDistance = Number.MAX_VALUE;
		let distance = DISTANCE.defaultValue;

		// Iteration on the points...
		myRoute.itinerary.itineraryPoints.forEach (
			itineraryPoint => {
				let itineraryPointDistance = myGeometry.pointsDistance ( mySvgLatLngDistance.latLng, itineraryPoint.latLng );
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

	/*
	--- mySearchHamlet function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySearchHamlet ( ) {
		let minDistance = Number.MAX_VALUE;
		myPlaces.forEach (
			place => {
				let placeDistance = myGeometry.pointsDistance ( myNearestItineraryPoint.latLng, [ place.lat, place.lon ] );
				if ( minDistance > placeDistance ) {
					minDistance = placeDistance;
					myPlace = place.tags.name;
				}
			}
		);
	}

	/*
	--- myLatLngCompare function --------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
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
		let returnValue =
			! isWayPoint
			&&
			( myNearestItineraryPoint.lat !== itineraryPoint.lat || myNearestItineraryPoint.lng !== itineraryPoint.lng );

		return returnValue;
	}

	/*
	--- myGetWayName function -----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetWayName ( way ) {
		return ( way.tags.name ? way.tags.name : '' ) +
			( way.tags.name && way.tags.ref ? ' ' : '' ) +
			( way.tags.ref ? '[' + way.tags.ref + ']' : '' );
	}

	/*
	--- mySearchPassingStreets function -------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySearchPassingStreets ( ) {

		let incomingItineraryPoint =
			myRoute.itinerary.itineraryPoints.previous ( myNearestItineraryPoint.objId, myLatLngCompare );
		let outgoingItineraryPoint =
			myRoute.itinerary.itineraryPoints.next ( myNearestItineraryPoint.objId, myLatLngCompare );

		let svgPointId = -1;
		let incomingPointId = -1;
		let outgoingPointId = -1;

		let svgPointDistance = Number.MAX_VALUE;
		let incomingPointDistance = Number.MAX_VALUE;
		let outgoingPointDistance = Number.MAX_VALUE;
		let pointDistance = DISTANCE.defaultValue;

		myNodesMap.forEach (
			node => {
				if ( myNearestItineraryPoint ) {
					pointDistance = myGeometry.pointsDistance ( [ node.lat, node.lon ], myNearestItineraryPoint.latLng );
					if ( pointDistance < svgPointDistance ) {
						svgPointId = node.id;
						svgPointDistance = pointDistance;
					}
				}
				if ( incomingItineraryPoint ) {
					pointDistance = myGeometry.pointsDistance ( [ node.lat, node.lon ], incomingItineraryPoint.latLng );
					if ( pointDistance < incomingPointDistance ) {
						incomingPointId = node.id;
						incomingPointDistance = pointDistance;
					}
				}
				if ( outgoingItineraryPoint ) {
					pointDistance = myGeometry.pointsDistance ( [ node.lat, node.lon ], outgoingItineraryPoint.latLng );
					if ( pointDistance < outgoingPointDistance ) {
						outgoingPointId = node.id;
						outgoingPointDistance = pointDistance;
					}
				}
			}
		);

		let iconNode = myNodesMap.get ( svgPointId );
		let miniRoundaboutTooltip =
			( iconNode && iconNode.tags && iconNode.tags.highway && 'mini_roundabout' === iconNode.tags.highway )
				?
				theTranslator.getText ( 'SvgIconFromOsmFactory - at the small roundabout on the ground' )
				:
				null;

		let incomingStreet = '';
		let outgoingStreet = '';

		let isRoundaboutEntry = false;
		let isRoundaboutExit = false;

		myWaysMap.forEach (
			way => {
				if ( ! way.nodesIds.includes ( svgPointId ) ) {
					return;
				}

				let wayName = myGetWayName ( way );
				let haveName = '' !== wayName;

				let isIncomingStreet = way.nodesIds.includes ( incomingPointId );
				let isOutgoingStreet = way.nodesIds.includes ( outgoingPointId );

				let streetOcurrences = way.nodesIds.filter ( nodeId => nodeId === svgPointId ).length * TWO;
				if ( way.nodesIds [ ZERO ] === svgPointId ) {
					streetOcurrences --;
				}
				if ( way.nodesIds [ way.nodesIds.length - ONE ] === svgPointId ) {
					streetOcurrences --;
				}
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
				while ( ZERO !== streetOcurrences ) {
					myStreets = '' === myStreets ? wayName : myStreets + ' &#x2AA5; ' + wayName;
					streetOcurrences --;
				}
			}
		);

		if ( '' === incomingStreet ) {
			myDirectionArrow = '&#x1F7E2;';
		}

		if ( AT_START === myPositionOnRoute ) {
			myStreets = '&#x1F7E2; ' + outgoingStreet;
		}
		else if ( AT_END === myPositionOnRoute ) {
			myStreets = incomingStreet + ' &#x1F534;';
		}
		else {
			myStreets =
				incomingStreet +
				( '' === myStreets ? '' : ' &#x2AA5; ' + myStreets ) +
				' ' + myDirectionArrow + ' ' +
				outgoingStreet;
		}

		if ( isRoundaboutEntry && ! isRoundaboutExit ) {
			myTooltip += theTranslator.getText ( 'SvgIconFromOsmFactory - entry roundabout' );
		}
		else if ( ! isRoundaboutEntry && isRoundaboutExit ) {
			myTooltip += theTranslator.getText ( 'SvgIconFromOsmFactory - exit roundabout' );
		}
		else if ( isRoundaboutEntry && isRoundaboutExit ) {
			myTooltip += theTranslator.getText ( 'SvgIconFromOsmFactory - continue roundabout' );
		}
		if ( miniRoundaboutTooltip ) {
			myTooltip += miniRoundaboutTooltip;
		}
	}

	/*
	--- myComputeTranslation function ---------------------------------------------------------------------------------

	This function compute the needed translation to have the icon at the center point of the SVG

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myComputeTranslation ( ) {
		myTranslation = myGeometry.subtrackPoints (
			[ theConfig.note.svgIconWidth / TWO, theConfig.note.svgIconWidth / TWO ],
			myGeometry.project ( mySvgLatLngDistance.latLng, mySvgZoom )
		);
	}

	/*
	--- myComputeRotationAndDirection function ------------------------------------------------------------------------

	This function compute the rotation needed to have the SVG oriented on the itinerary
	and the direction to take after the icon

	-------------------------------------------------------------------------------------------------------------------
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

		let iconPoint = myGeometry.addPoints (
			myGeometry.project ( mySvgLatLngDistance.latLng, mySvgZoom ),
			myTranslation
		);

		// computing rotation... if possible
		if ( myNearestItineraryPoint.objId !== myRoute.itinerary.itineraryPoints.first.objId ) {
			let rotationPoint = myGeometry.addPoints (
				myGeometry.project ( rotationItineraryPoint.latLng, mySvgZoom ),
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
			let directionPoint = myGeometry.addPoints (
				myGeometry.project ( directionItineraryPoint.latLng, mySvgZoom ),
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

	/*
	--- mySetDirectionArrowAndTooltip function ------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySetDirectionArrowAndTooltip ( ) {

		if ( null !== myDirection ) {
			if ( myDirection < theConfig.note.svgAnleMaxDirection.right ) {
				myTooltip = theTranslator.getText ( 'SvgIconFromOsmFactory - Turn right' );
				myDirectionArrow = '&#x1f882;';
			}
			else if ( myDirection < theConfig.note.svgAnleMaxDirection.slightRight ) {
				myTooltip = theTranslator.getText ( 'SvgIconFromOsmFactory - Turn slight right' );
				myDirectionArrow = '&#x1f885;';
			}
			else if ( myDirection < theConfig.note.svgAnleMaxDirection.continue ) {
				myTooltip = theTranslator.getText ( 'SvgIconFromOsmFactory - Continue' );
				myDirectionArrow = '&#x1f881;';
			}
			else if ( myDirection < theConfig.note.svgAnleMaxDirection.slightLeft ) {
				myTooltip = theTranslator.getText ( 'SvgIconFromOsmFactory - Turn slight left' );
				myDirectionArrow = '&#x1f884;';
			}
			else if ( myDirection < theConfig.note.svgAnleMaxDirection.left ) {
				myTooltip = theTranslator.getText ( 'SvgIconFromOsmFactory - Turn left' );
				myDirectionArrow = '&#x1f880;';
			}
			else if ( myDirection < theConfig.note.svgAnleMaxDirection.sharpLeft ) {
				myTooltip = theTranslator.getText ( 'SvgIconFromOsmFactory - Turn sharp left' );
				myDirectionArrow = '&#x1f887;';
			}
			else if ( myDirection < theConfig.note.svgAnleMaxDirection.sharpRight ) {
				myTooltip = theTranslator.getText ( 'SvgIconFromOsmFactory - Turn sharp right' );
				myDirectionArrow = '&#x1f886;';
			}
			else {
				myTooltip = theTranslator.getText ( 'SvgIconFromOsmFactory - Turn right' );
				myDirectionArrow = '&#x1f882;';
			}
		}

		if ( AT_START === myPositionOnRoute ) {
			myTooltip = theTranslator.getText ( 'SvgIconFromOsmFactory - Start' );
		}
		else if ( AT_END === myPositionOnRoute ) {
			myTooltip = theTranslator.getText ( 'SvgIconFromOsmFactory - Stop' );
		}
	}

	/*
	--- myCreateRoute function ----------------------------------------------------------------------------------------

	This function create the SVG polyline for the route

	-------------------------------------------------------------------------------------------------------------------
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
				let point = myGeometry.addPoints ( myGeometry.project ( itineraryPoint.latLng, mySvgZoom ), myTranslation );
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
			let polyline = document.createElementNS ( 'http://www.w3.org/2000/svg', 'polyline' );
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

	/*
	--- myCreateWays function -----------------------------------------------------------------------------------------

	This function creates the ways from OSM

	-------------------------------------------------------------------------------------------------------------------
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
						let point = myGeometry.addPoints (
							myGeometry.project ( [ node.lat, node.lon ], mySvgZoom ),
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

					let polyline = document.createElementNS ( 'http://www.w3.org/2000/svg', 'polyline' );
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

	/*
	--- myCreateSvg function ------------------------------------------------------------------------------------------

	This function creates the SVG

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateSvg ( ) {
		const FOUR = 4;
		mySvg = document.createElementNS ( 'http://www.w3.org/2000/svg', 'svg' );
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

	/*
	--- myGetUrl function ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetUrl ( ) {

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

	/*
	--- myGetIconAndAdress function -----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
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
				Object.seal (
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

		newHttpRequestBuilder ( ).getJsonPromise ( myGetUrl ( ) )
			.then ( BuildIconAndAdress )
			.catch (
				err => {
					ourRequestStarted = false;
					onError ( err );
				}
			);
	}

	/*
	--- myGetPromiseIconAndAdress function ----------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetPromiseIconAndAdress ( iconLatLng, routeObjId ) {

		mySvgLatLngDistance.latLng = iconLatLng;
		myRoute = theDataSearchEngine.getRoute ( routeObjId );

		return new Promise ( myGetIconAndAdress );
	}

	/*
	--- svgIconFromOsmFactory object ----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			getPromiseIconAndAdress : ( iconLatLng, routeObjId ) => myGetPromiseIconAndAdress ( iconLatLng, routeObjId )
		}
	);
}

export { newSvgIconFromOsmFactory };

/*
--- End of svgIconFromOsmFactory.js file ------------------------------------------------------------------------------
*/