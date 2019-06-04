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
		var m_Callback = null;
		
		var m_Response = {};
		var m_NextPromise = 0;
		var m_Promises = [];
		var m_XMLHttpRequestUrl = '';
		
		var m_WaysMap = new Map ( );
		var m_NodesMap = new Map ( );
		var m_Svg = null;
		
		var m_Delta = L.point ( 0, 0 );
		var m_Points = '';
		var m_Rotation = 0;
		var m_Direction = 0;
		
		var m_SvgIconSize = require ( '../L.TravelNotes' ).config.note.svgIconWidth;
		
		var m_DataSearchEngine  = require ( '../Data/DataSearchEngine' ) ( );
		
		/*
		--- m_EndError function ---------------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_EndError = function ( message ) {

			s_RequestStarted = false;
		};
	
		/*
		--- End of m_EndError function ---
		*/

		/*
		--- m_EndOk function -----------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_EndOk = function ( message ) {

			s_RequestStarted = false;
			m_Callback ( { svg : m_Svg.outerHTML, direction : m_Direction } );
		};

		/*
		--- End of m_EndOk function ---
		*/

		/*
		--- m_CreateMaps function -----------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_CreateMaps = function ( )
		{
			m_WaysMap.clear ( );
			m_NodesMap.clear ( );
			
			// Elements are pushed in 2 maps: 1 for nodes and 1 for ways
			m_Response.elements.forEach (
				function ( element ) {
					switch ( element.type ) {
						case 'way' :
							// replacing the nodes property with the nodesId property to 
							// avoid confusion between nodes and nodesId. the element.nodes contains nodesIds!!
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
		--- End of m_CreateMaps function ---
		*/
		

		/*
		--- m_CreateWays function -------------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_CreateWays = function ( ) {
			
			m_WaysMap.forEach ( 
				function ( way ) {
					var points = '';
					way.nodesIds.forEach (
						function ( nodeId ) {
							var node = m_NodesMap.get ( nodeId );
							var point = g_TravelNotesData.map.project ( L.latLng ( node.lat, node.lon ), 17 ).add ( m_Delta );
							points += point.x.toFixed ( 0 ) + ',' + point.y.toFixed ( 0 ) + ' ';
						}
					);
					var polyline = document.createElementNS ( "http://www.w3.org/2000/svg", "polyline" );
					polyline.setAttributeNS ( null, "points", points );
					polyline.setAttributeNS ( null, "class", "TravelNotes-OSM-Highway TravelNotes-OSM-Highway-" + way.tags.highway );
					polyline.setAttributeNS ( null, "transform", "rotate(" + m_Rotation + "," + m_SvgIconSize / 2 + "," + m_SvgIconSize / 2 + ")" );
					
					m_Svg.appendChild ( polyline );
				}
			);
			
		};

		/*
		--- End of m_CreateWays function ---
		*/

		/*
		--- m_CreateRoute function ------------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_CreateRoute = function ( ) {
			
			var polyline = document.createElementNS ( "http://www.w3.org/2000/svg", "polyline" );
			polyline.setAttributeNS ( null, "points", m_Points );
			polyline.setAttributeNS ( null, "fill", "none" );
			polyline.setAttributeNS ( null, "stroke", "red" );
			polyline.setAttributeNS ( null, "stroke-width", "6" );
			polyline.setAttributeNS ( null, "transform",  "rotate(" + m_Rotation + "," + m_SvgIconSize / 2 + "," + m_SvgIconSize / 2 + ")" );
			m_Svg.appendChild ( polyline );
		};

		/*
		--- End of m_CreateRoute function ---
		*/

		/*
		--- m_ParseResponse function ----------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_ParseResponse = function ( returnOnOk, returnOnError ) {
			
			m_CreateMaps ( );

			m_Svg = document.createElementNS ( "http://www.w3.org/2000/svg", "svg" );
			m_Svg.setAttributeNS ( null, "viewBox", "" + m_SvgIconSize / 4 + " " + m_SvgIconSize / 4 + " " + m_SvgIconSize / 2 + " " + m_SvgIconSize / 2 );
			var backgroundRect = document.createElementNS ( "http://www.w3.org/2000/svg", "rect" );
			backgroundRect.setAttributeNS ( null, "class", "TravelNotes-SvgIcon-Background" );
			backgroundRect.setAttributeNS ( null, "width", m_SvgIconSize.toFixed ( 0 ) );
			backgroundRect.setAttributeNS ( null, "height", m_SvgIconSize.toFixed ( 0 ) );
			m_Svg.appendChild ( backgroundRect );
			
			m_CreateRoute ( );
			
			m_CreateWays ( );
			
			var foregroundRect = document.createElementNS ( "http://www.w3.org/2000/svg", "rect" );
			foregroundRect.setAttributeNS ( null, "class", "TravelNotes-SvgIcon-Foreground" );
			foregroundRect.setAttributeNS ( null, "width", m_SvgIconSize.toFixed ( 0 ) );
			foregroundRect.setAttributeNS ( null, "height", m_SvgIconSize.toFixed ( 0 ) );
			m_Svg.appendChild ( foregroundRect );
			
			returnOnOk ( '' );
		};
		
		/*
		--- End of m_ParseResponse function ---
		*/
		
		/*
		--- m_StartXMLHttpRequest function -----------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_StartXMLHttpRequest = function ( returnOnOk, returnOnError ) {

			var xmlHttpRequest = new XMLHttpRequest ( );
			xmlHttpRequest.timeout = 5000;
			
			xmlHttpRequest.ontimeout = function ( event ) {
				returnOnError ( 'TimeOut error' );
			};
			
			xmlHttpRequest.onreadystatechange = function ( ) {
				if ( xmlHttpRequest.readyState === 4 ) {
					if ( xmlHttpRequest.status === 200 ) {
						try {
							m_Response = JSON.parse ( xmlHttpRequest.responseText );
						}
						catch ( e ) {
							returnOnError ( 'JSON parsing error' );
						}
						returnOnOk ( new Promise ( m_Promises [ m_NextPromise ++ ] ) );
					}
					else {
						returnOnError ( 'Status : ' + this.status + ' statusText : ' + this.statusText );
					}
				}
			};
			
			xmlHttpRequest.open ( "GET", m_XMLHttpRequestUrl, true );
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
			var route = m_DataSearchEngine.getRoute ( m_RouteObjId );

			if ( ! route ) {
				// Route not found...
				return;
			}
			
			// Searching the nearest itinerary point
			var minDistance = Number.MAX_VALUE;
			var nearestPointIndex = - 1;
			var index = 0;
			
			// Iteration on the points. The collection is transformed to an array....
			var itineraryPoints = route.itinerary.itineraryPoints.object;
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
			m_Delta = L.point ( m_SvgIconSize / 2, m_SvgIconSize / 2 ).subtract ( g_TravelNotesData.map.project ( m_IconLatLng, 17 ) );
			
			// Searching the itinerary points with a least 100 m and 10 m from the nearest point...
			// First in the direction of the beginning and 100 m
			index = nearestPointIndex - 1;
			var distance = 0;
			while ( ( 0 <= index ) && ( 100 > distance ) ) {
				distance += itineraryPoints [ index ].distance;
				index --;
			}
			var startPointIndex = index;
			
			// then  in the direction of the beginning and 10 m...
			index = nearestPointIndex - 1;
			distance = 0;
			while ( ( 0 <= index ) && ( 10 > distance ) ) {
				distance += itineraryPoints [ index ].distance;
				index --;
			}
	
			// ...the rotation is computed
			var rotationPointIndex = index;
			var nearestPoint = g_TravelNotesData.map.project ( L.latLng ( itineraryPoints [ nearestPointIndex ].lat, itineraryPoints [ nearestPointIndex ].lng ), 17 ).add ( m_Delta );
			var rotationPoint = g_TravelNotesData.map.project ( L.latLng ( itineraryPoints [ rotationPointIndex ].lat, itineraryPoints [ rotationPointIndex ].lng ), 17 ).add ( m_Delta );
			m_Rotation = Math.atan (  ( nearestPoint.y - rotationPoint.y ) / ( rotationPoint.x - nearestPoint.x ) ) * 180 / Math.PI;
			if ( 0 > m_Rotation ) {
				m_Rotation += 360;
			}
			m_Rotation -= 270;
			
			if ( 0 > rotationPoint.x - nearestPoint.x ) {
				m_Rotation += 180;
			}

			// ... then  in the direction of the end and 100 m
			index = nearestPointIndex;
			distance = 0;
			while ( ( index < nearestPointIndex + 1 ) || ( ( index < itineraryPoints.length ) && ( 100 > distance ) ) ) {
				distance += itineraryPoints [ index ].distance;
				index ++;
			}
			var endPointIndex = index;

			// ... then  in the direction of the end and 10 m
			index = nearestPointIndex;
			distance = 0;
			while ( ( index < nearestPointIndex + 1 ) || ( ( index < itineraryPoints.length ) && ( 10 > distance ) ) ) {
				distance += itineraryPoints [ index ].distance;
				index ++;
			}
			var directionPointIndex = index;
			
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
console.log ( 'm_direction = ' + m_Direction );
			// ... points for the SVG are created
			m_Points = '';
			for ( index = startPointIndex; index <= endPointIndex; index ++ ) {
				var point = g_TravelNotesData.map.project ( L.latLng ( itineraryPoints [ index ].lat, itineraryPoints [ index ].lng ), 17 ).add ( m_Delta );
				m_Points += point.x.toFixed ( 0 ) + ',' + point.y.toFixed ( 0 ) + ' ';
			}

		};
				
		/*
		--- End of m_ComputeRoute function ---
		*/
		
		/*
		--- m_GetSvgIcon function -------------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/
		
		var m_GetSvgIcon = function ( iconLatLng, routeObjId, callback ) {
			
			// We verify that another request is not loaded
			if ( s_RequestStarted ) {
				return false;
			}
			s_RequestStarted = true;
			
			m_IconLatLng = L.latLng ( iconLatLng );
			
			m_RouteObjId = routeObjId;


			m_Callback = callback;

			m_Response = {};
			m_Svg = null;
			
			m_ComputeRoute ( );
			
			m_XMLHttpRequestUrl = 'https://lz4.overpass-api.de/api/interpreter?data=[out:json];way[highway](around:' + 
			m_SvgIconSize + ',' + m_IconLatLng.lat.toFixed ( 6 ) + ',' + m_IconLatLng.lng.toFixed ( 6 ) + 
			')->.a;(.a >;.a;);out;';
			
			m_NextPromise = 0;
			m_Promises = [];
			
			m_Promises.push ( m_StartXMLHttpRequest );
			m_Promises.push ( m_ParseResponse );
			
			new Promise ( m_Promises [ m_NextPromise ++ ] ).then (  m_EndOk, m_EndError  );
		};
		
		/*
		--- End of m_GetSvgIcon function ---
		*/
		
		/*
		--- svgIconFromOsmFactory object ------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return Object.seal (
			{
				getSvgIcon : function ( iconLatLng, routeObjId, callback ) { return m_GetSvgIcon ( iconLatLng, routeObjId, callback ); }				
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