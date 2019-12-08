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

import { theConfig } from '../data/Config.js';

import { newDataSearchEngine } from '../data/DataSearchEngine.js';
import { newItineraryPoint } from '../data/ItineraryPoint.js';
import { newGeometry } from '../util/Geometry.js';
import { newHttpRequestBuilder } from '../util/HttpRequestBuilder.js';

import  { THE_CONST } from '../util/Constants.js';

let ourRequestStarted = false;

/*
--- newSvgIconFromOsmFactory function ---------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newSvgIconFromOsmFactory ( ) {

	let myGeometry = newGeometry ( );

	let myIconLatLngDistance = newItineraryPoint ( );

	let myIconItineraryPoint = null;

	let myRoute = null; // the TravelNotes route object

	let myResponse = {}; // the xmlHttpRequest parsed

	let myWaysMap = new Map ( );
	let myNodesMap = new Map ( );
	let myPlaces = [];
	let myPlace = null;
	let myCity = null;

	let mySvg = null; // the svg element

	let myPositionOnRoute = THE_CONST.svgIcon.positionOnRoute.onRoute;

	let myTranslation = [ THE_CONST.zero, THE_CONST.zero ];
	let myRotation = THE_CONST.zero;
	let myDirection = null;
	let mySvgZoom = theConfig.note.svgZoom;
	let mySvgAngleDistance = theConfig.note.svgAngleDistance;

	let myIncomingPoint = null;
	let myOutgoingPoint = null;
	let myPassingStreets = [ ];

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
	--- End of myCreateNodesAndWaysMaps function ---
	*/

	/*
	--- myLatLngCompare function --------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myLatLngCompare ( itineraryPoint ) {
		let isntWayPoint = true;
		myRoute.wayPoints.forEach (
			wayPoint => {
				if (
					( Math.abs ( itineraryPoint.lat - wayPoint.lat ) < THE_CONST.svgIconFromOsmFactory.comparePrecision )
					&&
					( Math.abs ( itineraryPoint.lng - wayPoint.lng ) < THE_CONST.svgIconFromOsmFactory.comparePrecision )
				) {
					isntWayPoint = false;
				}
			}
		);
		let returnValue =
			isntWayPoint
			&&
			( myIconItineraryPoint.lat !== itineraryPoint.lat || myIconItineraryPoint.lng !== itineraryPoint.lng );

		return returnValue;
	}

	/*
	--- mySearchItineraryPoints function ------------------------------------------------------------------------------

	This function search the nearest route point from the icon and compute the distance from the begining of the route

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySearchItineraryPoints ( ) {

		// Searching the nearest itinerary point
		let minDistance = Number.MAX_VALUE;
		let distance = THE_CONST.distance.defaultValue;

		// Iteration on the points...
		myRoute.itinerary.itineraryPoints.forEach (
			itineraryPoint => {
				let pointDistance = myGeometry.pointsDistance ( myIconLatLngDistance.latLng, itineraryPoint.latLng  );
				if ( minDistance > pointDistance ) {
					minDistance = pointDistance;
					myIconItineraryPoint = itineraryPoint;
					myIconLatLngDistance.distance = distance;
				}
				distance += itineraryPoint.distance;
			}
		);

		// The coordinates of the nearest point are used as position of the icon
		myIconLatLngDistance.latLng = myIconItineraryPoint.latLng;

		myIncomingPoint = myRoute.itinerary.itineraryPoints.previous ( myIconItineraryPoint.objId, myLatLngCompare );
		myOutgoingPoint = myRoute.itinerary.itineraryPoints.next ( myIconItineraryPoint.objId, myLatLngCompare );
	}

	/*
	--- End of mySearchItineraryPoints function ---
	*/

	/*
	--- mySearchHamlet function ---------------------------------------------------------------------------------------

	This function

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySearchHamlet ( ) {
		let minDistance = Number.MAX_VALUE;
		myPlaces.forEach (
			place => {
				let placeDistance = myGeometry.pointsDistance ( myIconItineraryPoint.latLng, [ place.lat, place.lon ] );
				if ( minDistance > placeDistance ) {
					minDistance = placeDistance;
					myPlace = place.tags.name;
				}
			}
		);
	}

	/*
	--- End of mySearchHamlet function ---
	*/

	/*
	--- mySearchPassingStreets function -------------------------------------------------------------------------------

	This function

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySearchPassingStreets ( ) {

		let iconPointId = -1;
		let incomingPointId = -1;
		let outgoingPointId = -1;
		let iconPointDistance = Number.MAX_VALUE;
		let incomingPointDistance = Number.MAX_VALUE;
		let outgoingPointDistance = Number.MAX_VALUE;
		let pointDistance = THE_CONST.distance.defaultValue;
		myNodesMap.forEach (
			node => {
				if ( myIconItineraryPoint ) {
					pointDistance =  myGeometry.pointsDistance ( [ node.lat, node.lon ], myIconItineraryPoint.latLng );
					if ( pointDistance < iconPointDistance ) {
						iconPointId = node.id;
						iconPointDistance = pointDistance;
					}
				}
				if ( myIncomingPoint ) {
					pointDistance = myGeometry.pointsDistance ( [ node.lat, node.lon ], myIncomingPoint.latLng );
					if ( pointDistance < incomingPointDistance ) {
						incomingPointId = node.id;
						incomingPointDistance = pointDistance;
					}
				}
				if ( myOutgoingPoint   ) {
					pointDistance = myGeometry.pointsDistance ( [ node.lat, node.lon ], myOutgoingPoint.latLng );
					if ( pointDistance < outgoingPointDistance ) {
						outgoingPointId = node.id;
						outgoingPointDistance = pointDistance;
					}
				}
			}
		);
		let incomingStreet = '';
		let outgoingStreet = '';
		myWaysMap.forEach (
			way => {
				let wayName =
					( way.tags.wayName ? way.tags.wayName : '' ) +
					( way.tags.wayName && way.tags.ref ? ' '  : '' ) +
					( way.tags.ref ? '[' + way.tags.ref + ']' : '' );
				if ( way.nodesIds.includes ( iconPointId ) ) {
					let isClosed = way.nodesIds [ THE_CONST.zero ] === way.nodesIds [ way.nodesIds.length - THE_CONST.number1 ];
					let isInOutStreet =
						( THE_CONST.zero !== way.nodesIds.indexOf ( iconPointId ) )
						&&
						( way.nodesIds.length - THE_CONST.number1 !== way.nodesIds.lastIndexOf ( iconPointId ) );
					let isIncomingStreet = way.nodesIds.includes ( incomingPointId );
					let isOutgoingStreet = way.nodesIds.includes ( outgoingPointId );
					let isSimpleStreet = ! isInOutStreet && ! isIncomingStreet && ! isOutgoingStreet;
					let haveName = wayName !== '';

					if ( isSimpleStreet && haveName )  {
						myPassingStreets.push ( wayName );
					}
					if ( ( isInOutStreet && haveName ) || ( isClosed && haveName ) )  {
						if ( ! isIncomingStreet && ! isOutgoingStreet ) {
							myPassingStreets.push ( wayName );
							myPassingStreets.push ( wayName );
						}
						else if (
							( isIncomingStreet && ! isOutgoingStreet )
							||
							( ! isIncomingStreet && isOutgoingStreet )
						) {
							myPassingStreets.push ( wayName );
						}
					}
					if ( isIncomingStreet )  {
						incomingStreet = haveName ? wayName : '???';
					}
					if ( isOutgoingStreet )  {
						outgoingStreet =  haveName ? wayName : '???';
					}
				}
			}
		);
		myPassingStreets.unshift ( incomingStreet );
		myPassingStreets.push ( outgoingStreet );
	}

	/*
	--- End of mySearchPassingStreets function ---
	*/

	/*
	--- myComputeTranslation function ---------------------------------------------------------------------------------

	This function compute the needed translation to have the icon at the center point of the SVG

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myComputeTranslation ( ) {
		myTranslation = myGeometry.subtrackPoints (
			[ theConfig.note.svgIconWidth / THE_CONST.number2, theConfig.note.svgIconWidth / THE_CONST.number2 ],
			myGeometry.project ( myIconLatLngDistance.latLng, mySvgZoom )
		);
	}

	/*
	--- End of myComputeTranslation function ---
	*/

	/*
	--- myComputeRotationAndDirection function ------------------------------------------------------------------------

	This function compute the rotation needed to have the SVG oriented on the itinerary
	and the direction to take after the icon

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myComputeRotationAndDirection ( ) {

		// searching points at least at 10 m ( mySvgAngleDistance ) from the icon point,
		// one for rotation and one for direction
		let distance = THE_CONST.distance.defaultValue;
		let rotationItineraryPoint = myRoute.itinerary.itineraryPoints.first;
		let directionItineraryPoint = myRoute.itinerary.itineraryPoints.last;
		let directionPointReached = false;

		myRoute.itinerary.itineraryPoints.forEach (
			itineraryPoint => {
				if ( myIconLatLngDistance.distance - distance > mySvgAngleDistance ) {
					rotationItineraryPoint = itineraryPoint;
				}
				if ( distance - myIconLatLngDistance.distance > mySvgAngleDistance && ! directionPointReached ) {
					directionItineraryPoint = itineraryPoint;
					directionPointReached = true;
				}
				distance += itineraryPoint.distance;
			}
		);

		let iconPoint = myGeometry.addPoints (
			myGeometry.project ( myIconLatLngDistance.latLng, mySvgZoom ),
			myTranslation
		);

		// computing rotation... if possible
		if ( myIconItineraryPoint.objId !== myRoute.itinerary.itineraryPoints.first.objId  ) {
			let rotationPoint = myGeometry.addPoints (
				myGeometry.project ( rotationItineraryPoint.latLng, mySvgZoom ),
				myTranslation
			);
			myRotation =
				Math.atan (
					( iconPoint [ THE_CONST.number1 ] - rotationPoint [ THE_CONST.number1 ] )
					/
					( rotationPoint [ THE_CONST.zero ] - iconPoint [ THE_CONST.zero ] )
				)
				*
				THE_CONST.angle.degree180 / Math.PI;
			if ( THE_CONST.zero > myRotation ) {
				myRotation += THE_CONST.angle.degree360;
			}
			myRotation -= THE_CONST.angle.degree270;

			// point 0,0 of the svg is the UPPER left corner
			if ( THE_CONST.zero > rotationPoint [ THE_CONST.zero ] - iconPoint [ THE_CONST.zero ] ) {
				myRotation += THE_CONST.angle.degree180;
			}
		}

		// computing direction ... if possible

		if ( myIconItineraryPoint.objId !== myRoute.itinerary.itineraryPoints.last.objId  ) {
			let directionPoint = myGeometry.addPoints (
				myGeometry.project ( directionItineraryPoint.latLng, mySvgZoom ),
				myTranslation
			);
			myDirection = Math.atan (
				( iconPoint [ THE_CONST.number1 ] - directionPoint [ THE_CONST.number1 ] )
				/
				( directionPoint [ THE_CONST.zero ] - iconPoint [ THE_CONST.zero ] )
			)
				*
				THE_CONST.angle.degree180 / Math.PI;

			// point 0,0 of the svg is the UPPER left corner
			if ( THE_CONST.zero > directionPoint [ THE_CONST.zero ] - iconPoint [ THE_CONST.zero ] ) {
				myDirection += THE_CONST.angle.degree180;
			}
			myDirection -= myRotation;

			// setting direction between 0 and 360
			while ( THE_CONST.angle.degree0 > myDirection ) {
				myDirection += THE_CONST.angle.degree360;
			}
			while ( THE_CONST.angle.degree360 < myDirection ) {
				myDirection -= THE_CONST.angle.degree360;
			}
		}
		if ( myIconItineraryPoint.objId === myRoute.itinerary.itineraryPoints.first.objId  ) {
			myRotation = -myDirection - THE_CONST.angle.degree90;
			myDirection = null;
			myPositionOnRoute = THE_CONST.svgIcon.positionOnRoute.atStart;
		}

		if (
			myIconLatLngDistance.lat === myRoute.itinerary.itineraryPoints.last.lat
			&&
			myIconLatLngDistance.lng === myRoute.itinerary.itineraryPoints.last.lng
		) {

			// using lat & lng because last point is sometime duplicated
			myDirection = null;
			myPositionOnRoute = THE_CONST.svgIcon.positionOnRoute.atEnd;
		}
	}

	/*
	--- End of myComputeRotationAndDirection function ---
	*/

	/*
	--- myCreateRoute function ----------------------------------------------------------------------------------------

	This function create the SVG polyline for the route

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateRoute ( ) {

		// to avoid a big svg, all points outside the svg viewBox are not added
		let index = THE_CONST.numberMinus1;
		let firstPointIndex = THE_CONST.notFound;
		let lastPointIndex = THE_CONST.notFound;
		let points = [];
		myRoute.itinerary.itineraryPoints.forEach (
			itineraryPoint => {
				index ++;
				let point = myGeometry.addPoints ( myGeometry.project ( itineraryPoint.latLng, mySvgZoom ), myTranslation );
				points.push ( point );
				let pointIsInside =
					point [ THE_CONST.zero ] >= THE_CONST.zero && point [ THE_CONST.number1 ] >= THE_CONST.zero
					&&
					point [ THE_CONST.zero ] <=  theConfig.note.svgIconWidth
					&&
					point [ THE_CONST.number1 ] <= theConfig.note.svgIconWidth;
				if ( pointIsInside ) {
					if ( THE_CONST.notFound === firstPointIndex )  {
						firstPointIndex = index;
					}
					lastPointIndex = index;
				}
			}
		);
		if ( THE_CONST.notFound !== firstPointIndex && THE_CONST.notFound !== lastPointIndex ) {
			if ( THE_CONST.zero < firstPointIndex ) {
				firstPointIndex --;
			}
			if ( myRoute.itinerary.itineraryPoints.length - THE_CONST.number1 > lastPointIndex ) {
				lastPointIndex ++;
			}
			let pointsAttribute = '';
			for ( index = firstPointIndex; index <= lastPointIndex; index ++ ) {
				pointsAttribute += points[ index ] [ THE_CONST.zero ].toFixed ( THE_CONST.zero ) + ',' +
					points[ index ] [ THE_CONST.number1 ].toFixed ( THE_CONST.zero ) + ' ';
			}
			let polyline = document.createElementNS ( 'http://www.w3.org/2000/svg', 'polyline' );
			polyline.setAttributeNS ( null, 'points', pointsAttribute );
			polyline.setAttributeNS ( null, 'class', 'TravelNotes-OSM-Itinerary' );
			polyline.setAttributeNS (
				null,
				'transform',
				'rotate(' + myRotation +
					',' + ( theConfig.note.svgIconWidth / THE_CONST.number2 ) +
					',' + ( theConfig.note.svgIconWidth / THE_CONST.number2 )
					+ ')'
			);
			mySvg.appendChild ( polyline );
		}

	}

	/*
	--- End of myCreateRoute function ---
	*/

	/*
	--- myCreateWays function -----------------------------------------------------------------------------------------

	This function creates the ways from OSM

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateWays ( ) {

		// to avoid a big svg, all points outside the svg viewBox are not added
		myWaysMap.forEach (
			way => {
				let firstPointIndex = THE_CONST.notFound;
				let lastPointIndex = THE_CONST.notFound;
				let index = THE_CONST.numberMinus1;
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
							point [ THE_CONST.zero ] >= THE_CONST.zero
							&&
							point [ THE_CONST.number1 ] >= THE_CONST.zero
							&&
							point [ THE_CONST.zero ] <= theConfig.note.svgIconWidth
							&&
							point [ THE_CONST.number1 ] <= theConfig.note.svgIconWidth;
						if ( pointIsInside ) {
							if ( THE_CONST.notFound === firstPointIndex )  {
								firstPointIndex = index;
							}
							lastPointIndex = index;
						}
					}
				);
				if ( THE_CONST.notFound !== firstPointIndex && THE_CONST.notFound !== lastPointIndex ) {
					if ( THE_CONST.zero < firstPointIndex ) {
						firstPointIndex --;
					}
					if ( way.nodesIds.length - THE_CONST.number1 > lastPointIndex ) {
						lastPointIndex ++;
					}
					let pointsAttribute = '';
					for ( index = firstPointIndex; index <= lastPointIndex; index ++ ) {
						pointsAttribute +=
							points[ index ] [ THE_CONST.zero ].toFixed ( THE_CONST.zero ) + ',' +
							points[ index ] [ THE_CONST.number1 ].toFixed ( THE_CONST.zero ) + ' ';
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
							',' + ( theConfig.note.svgIconWidth / THE_CONST.number2 ) +
							',' + ( theConfig.note.svgIconWidth / THE_CONST.number2 ) +
							')'
					);

					mySvg.appendChild ( polyline );
				}
			}
		);
	}

	/*
	--- End of myCreateWays function ---
	*/

	/*
	--- myCreateSvg function ------------------------------------------------------------------------------------------

	This function creates the SVG

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateSvg ( ) {
		myCreateNodesAndWaysMaps ( );

		mySvg = document.createElementNS ( 'http://www.w3.org/2000/svg', 'svg' );
		mySvg.setAttributeNS (
			null,
			'viewBox',
			String ( theConfig.note.svgIconWidth / THE_CONST.number4 ) + ' ' +
			( theConfig.note.svgIconWidth / THE_CONST.number4 ) + ' ' +
			( theConfig.note.svgIconWidth / THE_CONST.number2 ) + ' ' +
			( theConfig.note.svgIconWidth / THE_CONST.number2 )
		);
		mySvg.setAttributeNS ( null, 'class', 'TravelNotes-SvgIcon' );

		mySearchItineraryPoints ( );
		mySearchPassingStreets ( );
		mySearchHamlet ( );
		myComputeTranslation ( );
		myComputeRotationAndDirection ( );
		myCreateRoute ( );
		myCreateWays ( );
	}

	/*
	--- End of myCreateSvg function ---
	*/

	/*
	--- myGetUrl function ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetUrl ( ) {
		let requestLatLng =
			myIconLatLngDistance.lat.toFixed ( THE_CONST.latLng.fixed ) +
			',' +
			myIconLatLngDistance.lng.toFixed ( THE_CONST.latLng.fixed );

		let requestUrl = theConfig.overpassApiUrl +
			'?data=[out:json][timeout:' +
			theConfig.note.svgTimeOut + '];' +
			'way[highway](around:' +
			( theConfig.note.svgIconWidth * THE_CONST.svgIconFromOsmFactory.searchAroundFactor ).toFixed ( THE_CONST.zero ) +
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
			myCreateSvg ( );
			ourRequestStarted = false;

			onOk (
				{
					svg : mySvg,
					direction : myDirection,
					positionOnRoute : myPositionOnRoute,
					city : myCity,
					place : myPlace,
					streets : myPassingStreets,
					latLng : myIconItineraryPoint.latLng
				}
			);
		}

		if ( ourRequestStarted ) {
			onError ( 'A request is already running' );
			return;
		}
		ourRequestStarted = true;

		myResponse = {};
		mySvg = null;
		myCity = null;

		newHttpRequestBuilder ( ).getJsonPromise ( myGetUrl ( ) )
			.then ( BuildIconAndAdress  )
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

		myIconLatLngDistance.latLng = iconLatLng;
		myRoute = newDataSearchEngine ( ).getRoute ( routeObjId );

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