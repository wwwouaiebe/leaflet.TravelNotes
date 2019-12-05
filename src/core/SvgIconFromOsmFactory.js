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

export { newSvgIconFromOsmFactory };

import { g_Config } from '../data/Config.js';

import { newDataSearchEngine } from '../data/DataSearchEngine.js';
import { newItineraryPoint } from '../data/ItineraryPoint.js';
import { newGeometry } from '../util/Geometry.js';
import { newHttpRequestBuilder } from '../util/HttpRequestBuilder.js';

var s_RequestStarted = false;

/*
--- newSvgIconFromOsmFactory function ---------------------------------------------------------------------------------


-----------------------------------------------------------------------------------------------------------------------
*/

function newSvgIconFromOsmFactory ( ) {

	let m_Geometry = newGeometry ( );
	
	let m_IconLatLngDistance = newItineraryPoint ( );
	
	let m_IconItineraryPoint = null;
	
	let m_Route = null; // the TravelNotes route object
	
	let m_Response = {}; // the xmlHttpRequest parsed
	
	let m_WaysMap = new Map ( );
	let m_NodesMap = new Map ( );
	let m_Places = [];
	let m_Place = null;
	let m_City = null;
	
	let m_Svg = null; // the svg element
	let m_StartStop = 0; // a flag to indicates where is the icon : -1 on the first node, 1 on the end node, 0 on an intermediate node
	
	let m_Translation = [ 0, 0 ];
	let m_Rotation = 0;
	let m_Direction = null;
	
	let m_SvgIconSize = g_Config.note.svgIconWidth;
	let m_SvgZoom = g_Config.note.svgZoom;
	let m_SvgAngleDistance = g_Config.note.svgAngleDistance;
	
	let m_IncomingPoint = null;
	let m_OutgoingPoint = null;
	let m_PassingStreets = [];
			
	/*
	--- m_CreateNodesAndWaysMaps function -----------------------------------------------------------------------------

	This function create the way and node maps from the XmlHttpRequest response

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateNodesAndWaysMaps ( ) {
		m_WaysMap.clear ( );
		m_NodesMap.clear ( );
		// Elements are pushed in 2 maps: 1 for nodes and 1 for ways
		m_Response.elements.forEach (
			element => {
				switch ( element.type ) {
					case 'area' :
						if ( element.tags && element.tags.boundary && element.tags.name ) {
							m_City = element.tags.name;
						}
						break;
					case 'way' :
						// replacing the nodes property with the nodesId property to 
						// avoid confusion between nodes and nodesId. The element.nodes contains nodesIds!!
						element.nodesIds = element.nodes;
						delete element.nodes;
						m_WaysMap.set ( element.id, element );
						break;
					case 'node' :
						m_NodesMap.set ( element.id, element );
						if ( element.tags && element.tags.place && [ 'town', 'city', 'village', 'hamlet' ].includes ( element.tags.place ) ) {
							m_Places.push ( element );
						}
						break;
					default:
						break;
				}
			}
		);
	}
	
	/*
	--- End of m_CreateNodesAndWaysMaps function ---
	*/

	function m_LatLngCompare ( itineraryPoint ) {
		let isntWayPoint = true;
		m_Route.wayPoints.forEach ( 
			wayPoint => {
				if ( ( Math.abs ( itineraryPoint.lat - wayPoint.lat ) < 0.00001 ) && ( Math.abs ( itineraryPoint.lng - wayPoint.lng ) < 0.00001 ) ) {
					isntWayPoint = false;
				}
			}
		);
		return  isntWayPoint && ( m_IconItineraryPoint.lat !== itineraryPoint.lat || m_IconItineraryPoint.lng !== itineraryPoint.lng );
	}

	/*
	--- m_SearchItineraryPoints function ------------------------------------------------------------------------------

	This function search the nearest route point from the icon and compute the distance from the begining of the route

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_SearchItineraryPoints ( ) {
		// Searching the nearest itinerary point
		let minDistance = Number.MAX_VALUE;
		let distance = 0;
		
		// Iteration on the points...
		m_Route.itinerary.itineraryPoints.forEach ( 
			itineraryPoint => {
				let pointDistance = m_Geometry.pointsDistance ( m_IconLatLngDistance.latLng, itineraryPoint.latLng  );
				if ( minDistance > pointDistance ) {
					minDistance = pointDistance;
					m_IconItineraryPoint = itineraryPoint;
					m_IconLatLngDistance.distance = distance;
				}
				distance += itineraryPoint.distance;
			}
		);
		
		// The coordinates of the nearest point are used as position of the icon
		m_IconLatLngDistance.latLng = m_IconItineraryPoint.latLng;
		
		m_IncomingPoint = m_Route.itinerary.itineraryPoints.previous ( m_IconItineraryPoint.objId, m_LatLngCompare );
		m_OutgoingPoint = m_Route.itinerary.itineraryPoints.next ( m_IconItineraryPoint.objId, m_LatLngCompare );
	}
	
	/*
	--- End of m_SearchItineraryPoints function ---
	*/
	
	/*
	--- m_SearchHamlet function ---------------------------------------------------------------------------------------

	This function 

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_SearchHamlet ( ) {
		let minDistance = Number.MAX_VALUE;
		m_Places.forEach (
			place => {
			let placeDistance = m_Geometry.pointsDistance ( m_IconItineraryPoint.latLng, [ place.lat, place.lon ] );
				if ( minDistance > placeDistance ) {
					minDistance = placeDistance;
					m_Place = place.tags.name;
				}
			}
		);
	}
	
	/*
	--- End of m_SearchHamlet function ---
	*/

	/*
	--- m_SearchPassingStreets function -------------------------------------------------------------------------------

	This function 

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_SearchPassingStreets ( ) {

		let iconPointId = -1;
		let incomingPointId = -1;
		let outgoingPointId = -1;
		let iconPointDistance = Number.MAX_VALUE;
		let incomingPointDistance = Number.MAX_VALUE;
		let outgoingPointDistance = Number.MAX_VALUE;
		let pointDistance = 0;
		m_NodesMap.forEach (
			node => {
				if ( m_IconItineraryPoint ) {
					pointDistance =  m_Geometry.pointsDistance ( [ node.lat, node.lon ], m_IconItineraryPoint.latLng );
					if ( pointDistance < iconPointDistance ) {
						iconPointId = node.id;
						iconPointDistance = pointDistance;
					}
				}
				if ( m_IncomingPoint ) {
					pointDistance = m_Geometry.pointsDistance ( [ node.lat, node.lon ], m_IncomingPoint.latLng );
					if ( pointDistance < incomingPointDistance ) {
						incomingPointId = node.id;
						incomingPointDistance = pointDistance;
					}
				}
				if ( m_OutgoingPoint   ) {
					pointDistance = m_Geometry.pointsDistance ( [ node.lat, node.lon ], m_OutgoingPoint.latLng );
					if ( pointDistance < outgoingPointDistance ) {
						outgoingPointId = node.id;
						outgoingPointDistance = pointDistance;
					}
				}
			}
		);
		let incomingStreet = '';
		let outgoingStreet = '';
		m_WaysMap.forEach ( 
			way => {
				let name = ( way.tags.name ? way.tags.name : '' ) + ( way.tags.name && way.tags.ref ? ' '  : '' ) + ( way.tags.ref ? '[' + way.tags.ref + ']' : '' );
				if ( way.nodesIds.includes ( iconPointId ) ) {
					let isClosed = way.nodesIds [ 0 ] === way.nodesIds [ way.nodesIds.length - 1 ];
					let isInOutStreet = ( 0 !== way.nodesIds.indexOf ( iconPointId ) ) && ( way.nodesIds.length - 1 !== way.nodesIds.lastIndexOf ( iconPointId ) );
					let isIncomingStreet = way.nodesIds.includes ( incomingPointId );
					let isOutgoingStreet = way.nodesIds.includes ( outgoingPointId );
					let isSimpleStreet = ! isInOutStreet && ! isIncomingStreet && ! isOutgoingStreet;
					let haveName = name!== '';
					
					if ( isSimpleStreet && haveName )  {
						m_PassingStreets.push ( name );
					}
					if ( ( isInOutStreet && haveName ) || ( isClosed && haveName ) )  {
						if ( ! isIncomingStreet && ! isOutgoingStreet ) {
							m_PassingStreets.push ( name );
							m_PassingStreets.push ( name );
						}
						else if ( ( isIncomingStreet && ! isOutgoingStreet ) || ( ! isIncomingStreet && isOutgoingStreet ) ) {
							m_PassingStreets.push ( name );
						}
					}
					if ( isIncomingStreet )  {
						incomingStreet = haveName ? name : '???';
					}
					if ( isOutgoingStreet )  {
						outgoingStreet =  haveName ? name : '???';
					}
				}
			}
		);
		m_PassingStreets.unshift ( incomingStreet );
		m_PassingStreets.push ( outgoingStreet );
	}

	/*
	--- End of m_SearchPassingStreets function ---
	*/

	/*
	--- m_ComputeTranslation function ---------------------------------------------------------------------------------

	This function compute the needed translation to have the icon at the center point of the SVG

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_ComputeTranslation ( ) {
		m_Translation = m_Geometry.subtrackPoints ( [ m_SvgIconSize / 2, m_SvgIconSize / 2 ], m_Geometry.project ( m_IconLatLngDistance.latLng, m_SvgZoom ) );
	}
	
	/*
	--- End of m_ComputeTranslation function ---
	*/

	/*
	--- m_ComputeRotationAndDirection function ------------------------------------------------------------------------

	This function compute the rotation needed to have the SVG oriented on the itinerary and the direction to take after the icon

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_ComputeRotationAndDirection ( ) {
		// searching points at least at 10 m ( m_SvgAngleDistance ) from the icon point, one for rotation and one for direction
		let distance = 0;
		let rotationItineraryPoint = m_Route.itinerary.itineraryPoints.first;
		let directionItineraryPoint = m_Route.itinerary.itineraryPoints.last;
		let directionPointReached = false;

		m_Route.itinerary.itineraryPoints.forEach ( 
			itineraryPoint => {
				if ( m_IconLatLngDistance.distance - distance > m_SvgAngleDistance ) {
					rotationItineraryPoint = itineraryPoint;
				}
				if ( distance - m_IconLatLngDistance.distance > m_SvgAngleDistance && ! directionPointReached ) {
					directionItineraryPoint = itineraryPoint;
					directionPointReached = true;
				}
				distance += itineraryPoint.distance;
			}
		);
		
		let iconPoint = m_Geometry.addPoints ( m_Geometry.project ( m_IconLatLngDistance.latLng, m_SvgZoom ), m_Translation );
		// computing rotation... if possible
		if ( m_IconItineraryPoint.objId !== m_Route.itinerary.itineraryPoints.first.objId  ) {
			let rotationPoint = m_Geometry.addPoints ( m_Geometry.project ( rotationItineraryPoint.latLng, m_SvgZoom ), m_Translation );
			m_Rotation = Math.atan (  ( iconPoint [ 1 ] - rotationPoint [ 1 ] ) / ( rotationPoint [ 0 ] - iconPoint [ 0 ] ) ) * 180 / Math.PI;
			if ( 0 > m_Rotation ) {
				m_Rotation += 360;
			}
			m_Rotation -= 270;
			
			// point 0,0 of the svg is the UPPER left corner
			if ( 0 > rotationPoint [ 0 ] - iconPoint [ 0 ] ) {
				m_Rotation += 180;
			}
		}
		//computing direction ... if possible

		if ( m_IconItineraryPoint.objId !== m_Route.itinerary.itineraryPoints.last.objId  ) {
			let directionPoint = m_Geometry.addPoints ( m_Geometry.project ( directionItineraryPoint.latLng, m_SvgZoom ), m_Translation );
			m_Direction = Math.atan (  ( iconPoint [ 1 ] - directionPoint [ 1 ] ) / ( directionPoint [ 0 ] - iconPoint [ 0 ] ) ) * 180 / Math.PI;
			// point 0,0 of the svg is the UPPER left corner
			if ( 0 > directionPoint [ 0 ] - iconPoint [ 0 ] ) {
				m_Direction += 180;
			}
			m_Direction -= m_Rotation;
			// setting direction between 0 and 360
			while ( 0 > m_Direction ) {
				m_Direction += 360;
			}
			while ( 360 < m_Direction ) {
				m_Direction -= 360;
			}
		}
		if ( m_IconItineraryPoint.objId === m_Route.itinerary.itineraryPoints.first.objId  ) {
			m_Rotation = - m_Direction - 90;
			m_Direction = null;
			m_StartStop = -1;
		}
		
		if ( m_IconLatLngDistance.lat === m_Route.itinerary.itineraryPoints.last.lat  && m_IconLatLngDistance.lng === m_Route.itinerary.itineraryPoints.last.lng ) { //using lat & lng because last point is sometime duplicated
			m_Direction = null;
			m_StartStop = 1;
		}
	}

	/*
	--- End of m_ComputeRotationAndDirection function ---
	*/

	/*
	--- m_CreateRoute function ----------------------------------------------------------------------------------------

	This function create the SVG polyline for the route

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateRoute ( ) {
		// to avoid a big svg, all points outside the svg viewBox are not added
		let index = -1;
		let firstPointIndex = -1;
		let lastPointIndex = -1;
		let points = [];
		m_Route.itinerary.itineraryPoints.forEach ( 
			itineraryPoint => {
				index++;
				let point = m_Geometry.addPoints ( m_Geometry.project ( itineraryPoint.latLng, m_SvgZoom ), m_Translation );
				points.push ( point );
				let pointIsInside = point [ 0 ] >= 0 && point [ 1 ] >= 0 && point [ 0 ] <=  m_SvgIconSize && point [ 1 ] <= m_SvgIconSize;
				if ( pointIsInside ) {
					if ( -1 === firstPointIndex )  {
						firstPointIndex = index;
					}
					lastPointIndex = index;
				}
			}
		);
		if ( -1 !== firstPointIndex && -1 !== lastPointIndex ) {
			if ( 0 < firstPointIndex ) {
				firstPointIndex --;
			}
			if ( m_Route.itinerary.itineraryPoints.length -1 > lastPointIndex ) {
				lastPointIndex ++;
			}
			let pointsAttribute = '';
			for ( index = firstPointIndex; index <= lastPointIndex; index ++ ) {
					pointsAttribute += points[ index ] [ 0 ].toFixed ( 0 ) + ',' + points[ index ] [ 1 ].toFixed ( 0 ) + ' ';
			}
			let polyline = document.createElementNS ( "http://www.w3.org/2000/svg", "polyline" );
			polyline.setAttributeNS ( null, "points", pointsAttribute );
			polyline.setAttributeNS ( null, "class", "TravelNotes-OSM-Itinerary" );
			polyline.setAttributeNS ( null, "transform",  "rotate(" + m_Rotation + "," + m_SvgIconSize / 2 + "," + m_SvgIconSize / 2 + ")" );
			m_Svg.appendChild ( polyline );
		}
		
	}

	/*
	--- End of m_CreateRoute function ---
	*/

	/*
	--- m_CreateWays function -----------------------------------------------------------------------------------------

	This function creates the ways from OSM

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateWays ( ) {
		// to avoid a big svg, all points outside the svg viewBox are not added
		m_WaysMap.forEach ( 
			way => {
				let firstPointIndex = -1;
				let lastPointIndex = -1;
				let index = -1;
				let points = [ ];
				way.nodesIds.forEach (
					nodeId => {
						index ++;
						let node = m_NodesMap.get ( nodeId );
						let point = m_Geometry.addPoints ( m_Geometry.project ( [ node.lat, node.lon ], m_SvgZoom ), m_Translation );
						points.push ( point );
						let pointIsInside = point [ 0 ] >= 0 && point [ 1 ] >= 0 && point [ 0 ] <=  m_SvgIconSize && point [ 1 ] <= m_SvgIconSize;
						if ( pointIsInside ) {
							if ( -1 === firstPointIndex )  {
								firstPointIndex = index;
							}
							lastPointIndex = index;
						}
					}
				);
				if ( -1 !== firstPointIndex && -1 !== lastPointIndex ) {
					if ( 0 < firstPointIndex ) {
						firstPointIndex --;
					}
					if ( way.nodesIds.length -1 > lastPointIndex ) {
						lastPointIndex ++;
					}
					let pointsAttribute = '';
					for ( index = firstPointIndex; index <= lastPointIndex; index ++ ) {
							pointsAttribute += points[ index ] [ 0 ].toFixed ( 0 ) + ',' + points[ index ] [ 1 ].toFixed ( 0 ) + ' ';
					}

					let polyline = document.createElementNS ( "http://www.w3.org/2000/svg", "polyline" );
					polyline.setAttributeNS ( null, "points", pointsAttribute );
					polyline.setAttributeNS ( null, "class", "TravelNotes-OSM-Highway TravelNotes-OSM-Highway-" + way.tags.highway );
					polyline.setAttributeNS ( null, "transform", "rotate(" + m_Rotation + "," + m_SvgIconSize / 2 + "," + m_SvgIconSize / 2 + ")" );
					
					m_Svg.appendChild ( polyline );
				}
			}
		);		
	}

	/*
	--- End of m_CreateWays function ---
	*/

	/*
	--- m_createSvg function ------------------------------------------------------------------------------------------

	This function creates the SVG

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_createSvg ( ) {
		m_CreateNodesAndWaysMaps ( );

		m_Svg = document.createElementNS ( "http://www.w3.org/2000/svg", "svg" );
		m_Svg.setAttributeNS ( null, "viewBox", "" + m_SvgIconSize / 4 + " " + m_SvgIconSize / 4 + " " + m_SvgIconSize / 2 + " " + m_SvgIconSize / 2 );
		m_Svg.setAttributeNS ( null, "class", "TravelNotes-SvgIcon" );
		
		m_SearchItineraryPoints ( );
		m_SearchPassingStreets ( );
		m_SearchHamlet ( );
		m_ComputeTranslation ( );
		m_ComputeRotationAndDirection ( );
		m_CreateRoute ( );
		m_CreateWays ( );
	}
	
	/*
	--- End of m_createSvg function ---
	*/

	/*
	--- m_GetUrl function ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/
		
	function m_GetUrl ( ) {
		let requestLatLng = m_IconLatLngDistance.lat.toFixed ( 6 ) + ',' + m_IconLatLngDistance.lng.toFixed ( 6 );

		let requestUrl = g_Config.overpassApiUrl + 
			'?data=[out:json][timeout:' + 
			g_Config.note.svgTimeOut + '];' +
			'way[highway](around:' + 
			( g_Config.note.svgIconWidth * 1.5 ).toFixed ( 0 ) + 
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
			'(node(area.i)[place="village"];node(area.i)[place="hamlet"];node(area.i)[place="city"];node(area.i)[place="town"];)->.k;' +
			'( ' +
			'node(around:' + 
			g_Config.note.svgHamletDistance + 
			',' + 
			requestLatLng + 
			')[place="hamlet"];' +
			'node(around:' + 
			g_Config.note.svgVillageDistance + 
			',' + 
			requestLatLng + 
			')[place="village"];' +
			'node(around:' + 
			g_Config.note.svgCityDistance + 
			',' + 
			requestLatLng + 
			')[place="city"];' +
			'node(around:' + 
			g_Config.note.svgTownDistance + 
			',' + 
			requestLatLng + 
			')[place="town"];' +
			')->.l;' +
			'node.k.l->.m;' +
			'.m out;';
			
		return requestUrl;
	}

	/*
	--- m_GetIconAndAdress function -----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_GetIconAndAdress ( onOk, onError ) {
	
		function BuildIconAndAdress ( response ) {
			m_Response = response;
			m_createSvg ( );
			s_RequestStarted = false;

			onOk ( 
				{ 
					svg : m_Svg, 
					direction : m_Direction, 
					startStop: m_StartStop, 
					city : m_City, 
					place: m_Place, 
					streets: m_PassingStreets, 
					latLng : m_IconItineraryPoint.latLng
				} 
			);
		}
	
		if ( s_RequestStarted ) {
			onError ( 'A request is already running' );
			return;
		}
		s_RequestStarted = true;
		

		m_Response = {};
		m_Svg = null;
		m_City = null;
		
		newHttpRequestBuilder ( ).getJsonPromise ( m_GetUrl ( ) )
		.then ( BuildIconAndAdress  )
		.catch ( 
			err => { 
				s_RequestStarted = false;
				onError (err );
			}
		);
	}

	/*
	--- m_GetPromiseIconAndAdress function ----------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_GetPromiseIconAndAdress ( iconLatLng, routeObjId ) {

		m_IconLatLngDistance.latLng = iconLatLng;
		m_Route = newDataSearchEngine ( ).getRoute ( routeObjId );
		
		return new Promise ( m_GetIconAndAdress );
	}
	
	/*
	--- svgIconFromOsmFactory object ----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			getPromiseIconAndAdress : ( iconLatLng, routeObjId ) => m_GetPromiseIconAndAdress ( iconLatLng, routeObjId )
		}
	);
}

/*
--- End of svgIconFromOsmFactory.js file ------------------------------------------------------------------------------
*/