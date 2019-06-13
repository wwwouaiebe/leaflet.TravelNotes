/*
Copyright - 2019 - Christian Guyette - Contact: http//www.ouaie.be/

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
	-
Changes:
	- v1.4.0:
		- created
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/


( function ( ){
	
	'use strict';

	var g_TravelNotesData = require ( '../L.TravelNotes' );

	var s_RequestStarted = false;

	var svgIconFromOsmFactory = function ( ) {

		var m_IconLatLng = L.latLng ( 0, 0);
		var m_RouteObjId = 0;
		
		var m_Response = {};
		
		var m_WaysMap = new Map ( );
		var m_NodesMap = new Map ( );
		var m_Svg = null;
		
		var m_Delta = L.point ( 0, 0 );
		var m_Points = '';
		var m_Rotation = 0;
		var m_Direction = null;
		
		var m_SvgIconSize = require ( '../L.TravelNotes' ).config.note.svgIconWidth;
				
		/*
		--- m_CreateNodesAndWaysMaps function -------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_CreateNodesAndWaysMaps = function ( )
		{
			m_WaysMap.clear ( );
			m_NodesMap.clear ( );
			
			// Elements are pushed in 2 maps: 1 for nodes and 1 for ways
			m_Response.elements.forEach (
				function ( element ) {
					switch ( element.type ) {
						case 'way' :
							// replacing the nodes property with the nodesId property to 
							// avoid confusion between nodes and nodesId. The element.nodes contains nodesIds!!
							element.nodesIds = element.nodes;
							delete element.nodes;
							m_WaysMap.set ( element.id, element );
							break;
						case 'node' :
							m_NodesMap.set ( element.id, element );
							break;
						default:
							break;
					}
				}
			);
		};
		
		/*
		--- End of m_CreateNodesAndWaysMaps function ---
		*/
		/*
		--- m_CreateWays function -------------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_CreateWays = function ( ) {
			
			m_WaysMap.forEach ( 
				function ( way ) {
					var firstPointIndex = -1;
					var lastPointIndex = -1;
					var index = -1;
					var points = [ ];
					way.nodesIds.forEach (
						function ( nodeId ) {
							index ++;
							var node = m_NodesMap.get ( nodeId );
							var point = g_TravelNotesData.map.project ( L.latLng ( node.lat, node.lon ), 17 ).add ( m_Delta );
							points.push ( point );
							var pointIsInside = point.x >= 0 && point.y >= 0 && point.x <=  m_SvgIconSize && point.y <= m_SvgIconSize;
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
						var pointsAttribute = '';
						for ( index = firstPointIndex; index <= lastPointIndex; index ++ ) {
								pointsAttribute += points[ index ].x.toFixed ( 0 ) + ',' + points[ index ].y.toFixed ( 0 ) + ' ';
						}

						var polyline = document.createElementNS ( "http://www.w3.org/2000/svg", "polyline" );
						polyline.setAttributeNS ( null, "points", pointsAttribute );
						polyline.setAttributeNS ( null, "class", "TravelNotes-OSM-Highway TravelNotes-OSM-Highway-" + way.tags.highway );
						polyline.setAttributeNS ( null, "transform", "rotate(" + m_Rotation + "," + m_SvgIconSize / 2 + "," + m_SvgIconSize / 2 + ")" );
						
						m_Svg.appendChild ( polyline );
					}
				}
			);
			
		};

		/*
		--- End of m_CreateWays function ---
		*/

		/*
		--- m_createSvg function ----------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_createSvg = function ( returnOnOk, returnOnError ) {

			m_CreateNodesAndWaysMaps ( );

			m_Svg = document.createElementNS ( "http://www.w3.org/2000/svg", "svg" );
			m_Svg.setAttributeNS ( null, "viewBox", "" + m_SvgIconSize / 4 + " " + m_SvgIconSize / 4 + " " + m_SvgIconSize / 2 + " " + m_SvgIconSize / 2 );
			m_Svg.setAttributeNS ( null, "class", "TravelNotes-SvgIcon" );
			
			m_ComputeRoute ( );
			
			m_CreateWays ( );
		};
		
		/*
		--- End of m_createSvg function ---
		*/
		
		/*
		--- m_StartXMLHttpRequest function -----------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_StartXMLHttpRequest = function ( returnOnOk, returnOnError ) {

			var xmlHttpRequest = new XMLHttpRequest ( );
			xmlHttpRequest.timeout = 15000;
			
			xmlHttpRequest.ontimeout = function ( event ) {
				returnOnError ( 'TimeOut error' );
			};
			
			xmlHttpRequest.onreadystatechange = function ( ) {
				if ( xmlHttpRequest.readyState === 4 ) {
					if ( xmlHttpRequest.status === 200 ) {
						try {
							m_Response = JSON.parse ( xmlHttpRequest.responseText );
							m_createSvg ( );
						}
						catch ( e ) {
							returnOnError ( );
						}
						returnOnOk ( { svg : m_Svg.outerHTML, direction : m_Direction } );
					}
					else {
						returnOnError ( 'Status : ' + this.status + ' statusText : ' + this.statusText );
					}
				}
			};
			
			xmlHttpRequest.open ( 
				"GET", 
				require ( '../L.TravelNotes' ).config.overpassApiUrl + '?data=[out:json];way[highway](around:' + 
					( m_SvgIconSize * 1.5 ).toFixed ( 0 ) + ',' + m_IconLatLng.lat.toFixed ( 6 ) + ',' + m_IconLatLng.lng.toFixed ( 6 ) + 
					')->.a;(.a >;.a;);out;',
				true
			);
			xmlHttpRequest.overrideMimeType ( 'application/json' );
			xmlHttpRequest.send ( null );
		
		};
		
		/*
		--- End of _StartXMLHttpRequest function ---
		*/
		
		/*
		--- m_ComputeRoute function -------------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/
		
		var m_ComputeRoute = function ( ) {
			var route = require ( '../Data/DataSearchEngine' ) ( ).getRoute ( m_RouteObjId );

			// Searching the nearest itinerary point
			var minDistance = Number.MAX_VALUE;
			var nearestPointIndex = - 1;
			var index = 0;
			
			// The collection is transformed to an array....
			var itineraryPoints = route.itinerary.itineraryPoints.object;
			// Iteration on the points...
			itineraryPoints.forEach ( 
				function ( itineraryPoint ) {
					var pointDistance = m_IconLatLng.distanceTo ( L.latLng ( itineraryPoint.lat, itineraryPoint.lng ) );
					if ( minDistance > pointDistance ) {
						minDistance = pointDistance;
						nearestPointIndex = index;
					}
					index ++;
				}
			);
			
			// The coordinates of the nearest point are used as center of the SVG
			m_IconLatLng = L.latLng ( route.itinerary.itineraryPoints.getAt ( itineraryPoints [ nearestPointIndex ].objId ).latLng );

			// and a delta computed for all points
			m_Delta = L.point ( m_SvgIconSize / 2, m_SvgIconSize / 2 ).subtract ( g_TravelNotesData.map.project ( m_IconLatLng, 17 ) );
			
			var nearestPoint = g_TravelNotesData.map.project ( L.latLng ( itineraryPoints [ nearestPointIndex ].lat, itineraryPoints [ nearestPointIndex ].lng ), 17 ).add ( m_Delta );
			
			// Searching in the itinerary a point with a least a distance of 100 m of the nearest point in the origin direction.
			// This point will be used to draw the itinerary in the SVG
			index = nearestPointIndex;
			var distance = 0;
			while ( ( 0 <  index -- ) && ( 150 > distance ) ) {
				distance += itineraryPoints [ index ].distance;
			}
			var startPointIndex = index;
			
			if ( 0 > startPointIndex ) {
				// no point found. We use the first point
				startPointIndex = 0;
			}
			

			// Searching in the itinerary a point with a least a distance of 10 m of the nearest point in the origin direction.
			// This point will be used to compute the rotation of the SVG
			index = nearestPointIndex ;
			distance = 0;
			while ( ( 0 < index -- ) && ( 10 > distance ) ) {
				distance += itineraryPoints [ index ].distance;
			}
			var rotationPointIndex = index;

			if ( 0 <= rotationPointIndex ) {
				// A point for rotation was found. The rotation is computed. 
				// Reminder: 
				// - the upper left corner is the 0, 0 point
				// - the rotation point must be in the bottom of the SVG
				// - rotation must be in degree
				var rotationPoint = g_TravelNotesData.map.project ( L.latLng ( itineraryPoints [ rotationPointIndex ].lat, itineraryPoints [ rotationPointIndex ].lng ), 17 ).add ( m_Delta );
				m_Rotation = Math.atan (  ( nearestPoint.y - rotationPoint.y ) / ( rotationPoint.x - nearestPoint.x ) ) * 180 / Math.PI;
				if ( 0 > m_Rotation ) {
					m_Rotation += 360;
				}
				m_Rotation -= 270;
				
				if ( 0 > rotationPoint.x - nearestPoint.x ) {
					m_Rotation += 180;
				}
			}
			// Searching in the itinerary a point with a least a distance of 100 m of the nearest point in the end direction.
			// This point will be used to draw the itinerary in the SVG
			index = nearestPointIndex;
			distance = 0;
			while ( ( index < nearestPointIndex + 1 ) || ( ( index < itineraryPoints.length ) && ( 150 > distance ) ) ) {
				distance += itineraryPoints [ index ].distance;
				index ++;
			}
			var endPointIndex = index;
			if ( endPointIndex >= itineraryPoints.length ) {
				// no point found. We use the last point.
				endPointIndex = itineraryPoints.length - 1;
			}

			// Searching in the itinerary a point with a least a distance of 10 m of the nearest point in the end direction.
			// This point will be used to compute the direction to follow (left or right)
			index = nearestPointIndex;
			distance = 0;
			while ( ( index < nearestPointIndex + 1 ) || ( ( index < itineraryPoints.length ) && ( 10 > distance ) ) ) {
				distance += itineraryPoints [ index ].distance;
				index ++;
			}
			var directionPointIndex = index;
			
			if ( directionPointIndex < itineraryPoints.length ) {
				// A point for direction was found. The direction is computed. 
				var directionPoint = g_TravelNotesData.map.project ( L.latLng ( itineraryPoints [ directionPointIndex ].lat, itineraryPoints [ directionPointIndex ].lng ), 17 ).add ( m_Delta );
				m_Direction = Math.atan (  ( nearestPoint.y - directionPoint.y ) / ( directionPoint.x - nearestPoint.x ) ) * 180 / Math.PI;
				if ( 0 > directionPoint.x - nearestPoint.x ) {
					m_Direction += 180;
				}
				m_Direction -= m_Rotation;
				while ( 0 > m_Direction ) {
					m_Direction += 360;
				}
				while ( 360 < m_Direction ) {
					m_Direction -= 360;
				}
				if ( 0 > rotationPointIndex ) {
					// a rotation point was not found. We use  direction as rotation and put the direction to null
					m_Rotation = - m_Direction - 90;
					m_Direction = null;
				}
			}
			else {
				m_Direction = null;
			}

			// ... points for the SVG are created
			m_Points = '';
			for ( index = startPointIndex; index <= endPointIndex; index ++ ) {
				var point = g_TravelNotesData.map.project ( L.latLng ( itineraryPoints [ index ].lat, itineraryPoints [ index ].lng ), 17 ).add ( m_Delta );
				m_Points += point.x.toFixed ( 0 ) + ',' + point.y.toFixed ( 0 ) + ' ';
			}
			var polyline = document.createElementNS ( "http://www.w3.org/2000/svg", "polyline" );
			polyline.setAttributeNS ( null, "points", m_Points );
			polyline.setAttributeNS ( null, "class", "TravelNotes-OSM-Itinerary" );
			polyline.setAttributeNS ( null, "transform",  "rotate(" + m_Rotation + "," + m_SvgIconSize / 2 + "," + m_SvgIconSize / 2 + ")" );
			m_Svg.appendChild ( polyline );
		};
				
		/*
		--- End of m_ComputeRoute function ---
		*/
		
		/*
		--- m_GetPromiseSvgIcon function ------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/
		
		var m_GetPromiseSvgIcon = function ( iconLatLng, routeObjId ) {
			
			// We verify that another request is not loaded
			if ( s_RequestStarted ) {
				return Promise.reject ( );
			}
			s_RequestStarted = true;
			
			m_IconLatLng = L.latLng ( iconLatLng );
			m_RouteObjId = routeObjId;
			m_Response = {};
			m_Svg = null;
			
			return new Promise ( m_StartXMLHttpRequest );
		};
		
		/*
		--- End of m_GetPromiseSvgIcon function ---
		*/
		
		/*
		--- svgIconFromOsmFactory object ------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return Object.seal (
			{
				getPromiseSvgIcon : function ( iconLatLng, routeObjId ) { return m_GetPromiseSvgIcon ( iconLatLng, routeObjId ); }				
			}
		);
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = svgIconFromOsmFactory;
	}

}());

/*
--- End of svgIconFromOsmFactory.js file ------------------------------------------------------------------------------
*/