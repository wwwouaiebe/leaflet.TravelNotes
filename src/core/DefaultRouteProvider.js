/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

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

( function ( ){
	
	'use strict';

	var getDefaultRouteProvider = function ( ) {

		var _ProviderOptions = 
		{
			url : 'https://router.project-osrm.org/',
		};
		
		var _ParseResponse = function ( requestResponse, itinerary ) {
			
			var response = JSON.parse( requestResponse );
			console.log ( response );

			if ( "Ok" !== response.code )
			{
				return itinerary;
			}
			
			if ( 0 === response.routes.length )
			{
				return itinerary;
			}

			var osrmTextInstructions = require('osrm-text-instructions')('v5');

			var language = 'fr';
			response.routes[0].legs.forEach (
				function(leg) {
					leg.steps.forEach ( 
						function(step) { 
							step.instruction = osrmTextInstructions.compile ( language, step );
						}
					);
				}
			);			
		
			var decodeRouteGeometry = function ( route ) {
				var decodeLegGeometry = function ( leg ) {
					var decodeStepGeometry = function ( step ) {
						step.geometry = require ( 'polyline' ).decode ( step.geometry, 6 );
					};
					leg.steps.forEach ( decodeStepGeometry );
				};
				route.geometry = require ( 'polyline' ).decode ( route.geometry, 6 );
				route.legs.forEach ( decodeLegGeometry );
			};
			response.routes [ 0 ] ( decodeRouteGeometry );
			
			var lastPointWithDistance = 0;
			var addItineraryPoint = function ( leg ) {
				var geometryCounter = 0;
				var addStepGeometry = function ( step ) {
					for ( ; geometryCounter < step.geometry.length ; geometryCounter ++ ) {
						var itineraryPoint = require ( '../data/ItineraryPoint' ) ( );
						itineraryPoint.latLng = [ step.geometry [ geometryCounter ] [ 0 ], step.geometry [ geometryCounter ] [ 1 ] ];
						itineraryPoint.distance = leg.annotation.distance [ lastPointWithDistance ] ? leg.annotation.distance [ lastPointWithDistance ] : 0;
						lastPointWithDistance++;
						itinerary.itineraryPoints.add ( itineraryPoint );
					}
					geometryCounter = 1;
				};
				leg.steps.forEach ( addStepGeometry );
			};
			
			response.routes [ 0 ].legs.forEach ( addItineraryPoint );
			
			
			console.log ( itinerary.object );
			return itinerary;
		};
		
		var _GetUrl = function ( wayPoints) {
			
			var wayPointsToString = function ( wayPoint, result )  {
				if ( null === result ) {
					result = '';
				}
				result += wayPoint.lng.toFixed ( 6 ) + ',' + wayPoint.lat.toFixed ( 6 ) + ';' ;
				return result;
			};
			var wayPointsString = wayPoints.forEach ( wayPointsToString );

			return _ProviderOptions.url +
				'route/v1/driving/' +
				 wayPointsString.substr ( 0, wayPointsString.length - 1 ) +
				'?geometries=polyline6&overview=full&steps=true&annotations=distance';
		};
		
		return {
			getUrl : function ( wayPoints ) {
				return _GetUrl ( wayPoints );
			},
			parseResponse : function ( requestResponse, itinerary ) {
				_ParseResponse ( requestResponse, itinerary );
			}
		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getDefaultRouteProvider;
	}

}());
