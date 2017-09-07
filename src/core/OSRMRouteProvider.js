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
	
		var _IconList = 
		{
			"turn": {
				"default": "kUndefined",
				"sharp left": "kTurnSharpLeft",
				"left": "kTurnLeft",
				"slight left": "kTurnSlightLeft",
				"straight": "kTurnStraight",
				"slight right": "kTurnSlightRight",
				"right": "kTurnRight",
				"sharp right": "kTurnSharpRight",
				"uturn": "kTurnUturn"
			},
			"new name": {
				"default": "kUndefined",
				"sharp left": "kNewNameSharpLeft",
				"left": "kNewNameLeft",
				"slight left": "kNewNameSlightLeft",
				"straight": "kNewNameStraight",
				"slight right": "kNewNameSlightRight",
				"right": "kNewNameRight",
				"sharp right": "kNewNameSharpRight"
			},
			"depart": {
				"default": "kDepartDefault",
				"sharp left": "kDepartLeft",
				"left": "kDepartLeft",
				"slight left": "kDepartLeft",
				"straight": "kDepartDefault",
				"slight right": "kDepartRight",
				"right": "kDepartRight",
				"sharp right": "kDepartRight"
			},
			"arrive": {
				"default": "kArriveDefault",
				"sharp left": "kArriveLeft",
				"left": "kArriveLeft",
				"slight left": "kArriveLeft",
				"straight": "kArriveDefault",
				"slight right": "kArriveRight",
				"right": "kArriveRight",
				"sharp right": "kArriveRight"
			},
			"merge": {
				"default": "kMergeDefault",
				"sharp left": "kMergeLeft",
				"left": "kMergeLeft",
				"slight left": "kMergeLeft",
				"straight": "kMergeDefault",
				"slight right": "kMergeRight",
				"right": "kMergeRight",
				"sharp right": "kMergeRight"
			},
			"on ramp": {
				"default": "kUndefined",
				"sharp left": "kOnRampLeft",
				"left": "kOnRampLeft",
				"slight left": "kOnRampLeft",
				"slight right": "kOnRampRight",
				"right": "kOnRampRight",
				"sharp right": "kOnRampRight"
			},
			"off ramp": {
				"default": "kUndefined",
				"sharp left": "kOffRampLeft",
				"left": "kOffRampLeft",
				"slight left": "kOffRampLeft",
				"slight right": "kOffRampRight",
				"right": "kOffRampRight",
				"sharp right": "kOffRampRight"
			},
			"fork": {
				"default": "kUndefined",
				"sharp left": "kForkLeft",
				"left": "kForkLeft",
				"slight left": "kForkLeft",
				"slight right": "kForkRight",
				"right": "kForkRight",
				"sharp right": "kForkRight"
			},
			"end of road": {
				"default": "kUndefined",
				"sharp left": "kEndOfRoadLeft",
				"left": "kEndOfRoadLeft",
				"slight left": "kEndOfRoadLeft",
				"slight right": "kEndOfRoadRight",
				"right": "kEndOfRoadRight",
				"sharp right": "kEndOfRoadRight"
			},
			"continue": {
				"default": "kUndefined",
				"sharp left": "kContinueSharpLeft",
				"left": "kContinueLeft",
				"slight left": "SkContinuelightLeft",
				"straight": "kContinueStraight",
				"slight right": "kContinueSlightRight",
				"right": "kContinueRight",
				"sharp right": "kContinueSharpRight"
			},
			"roundabout": {
				"default": "kUndefined",
				"sharp left": "kRoundaboutLeft",
				"left": "kRoundaboutLeft",
				"slight left": "kRoundaboutLeft",
				"slight right": "kRoundaboutRight",
				"right": "kRoundaboutRight",
				"sharp right": "kRoundaboutRight"
			},
			"rotary": {
				"default": "kUndefined",
				"sharp left": "kRotaryLeft",
				"left": "kRotaryLeft",
				"slight left": "kRotaryLeft",
				"slight right": "kRotaryRight",
				"right": "kRotaryRight",
				"sharp right": "kRotaryRight"
			},
			"roundabout turn": {
				"default": "kUndefined",
				"sharp left": "kRoundaboutTurnSharpLeft",
				"left": "kRoundaboutTurnLeft",
				"slight left": "kRoundaboutTurnSlightLeft",
				"straight": "kRoundaboutTurnStraight",
				"slight right": "kRoundaboutTurnSlightRight",
				"right": "kRoundaboutTurnRight",
				"sharp right": "kRoundaboutTurnSharpRight"
			},
			"notification": {
				"default": "kUndefined"
			},
			"default" : {
				"default" : "kUndefined"
			}
		};
		
		var _DegreeToCompass = function ( degree ) {
			if ( null === degree ) {
				return '';
			} 
			else if ( degree >= 0 && degree <= 22 ) {
				return 'N.';
			} 
			else if ( degree > 22 && degree < 68 ) {
				return 'N.E.';
			} 
			else if ( degree >= 68 && degree <= 112 ) {
				return 'E.';
			} 
			else if ( degree > 112 && degree < 158 ) {
				return 'S.E.';
			} 
			else if ( degree >= 158 && degree <= 202 ) {
				return 'S.';
			} 
			else if ( degree > 202 && degree < 248 ) {
				return 'S.W.';
			} 
			else if ( degree >= 248 && degree <= 292 ) {
				return 'W.';
			} 
			else if ( degree > 292 && degree < 338 ) {
				return 'N.W.';
			} 
			else if ( degree >= 338 && degree <= 360 ) {
				return 'N.';
			} 
			else {
				return '';
			}
		};

		var _ProviderOptions = 
		{
			url : 'https://router.project-osrm.org/',
		};
		
		var _ParseResponse = function ( requestResponse, route ) {
			
			var response = JSON.parse( requestResponse );

			if ( "Ok" !== response.code )
			{
				return {};
			}
			
			if ( 0 === response.routes.length )
			{
				return {};
			}

			route.itinerary.itineraryPoints.removeAll ( );
			route.itinerary.maneuvers.removeAll ( );
			
			response.routes [ 0 ].geometry = require ( 'polyline' ).decode ( response.routes [ 0 ].geometry, 6 );

			var options = {};
			options.hooks= {};
			options.hooks.tokenizedInstruction = function ( instruction ) {
				if ( 'Rouler vers {direction}' === instruction ) {
					instruction = 'Départ';
				}
				return instruction;
			};

			var osrmTextInstructions = require('osrm-text-instructions')('v5', options );
			var language = 'fr';
			var lastPointWithDistance = 0;
			
			
			response.routes [ 0 ].legs.forEach ( 
				function ( leg ) {
					leg.steps.forEach ( 
						function ( step ) {
							step.geometry = require ( 'polyline' ).decode ( step.geometry, 6 );

							var maneuver = require ( '../data/Maneuver' ) ( );
							maneuver.iconName = _IconList [ step.maneuver.type ] ? _IconList [  step.maneuver.type ] [  step.maneuver.modifier ] || _IconList [  step.maneuver.type ] [ "default" ] : _IconList [ "default" ] [ "default" ];
							maneuver.instruction = osrmTextInstructions.compile ( language, step );
							maneuver.streetName = step.name;
							maneuver.direction = _DegreeToCompass ( step.maneuver.bearing_after );
							step.name = '';
							maneuver.simplifiedInstruction = osrmTextInstructions.compile ( language, step );
							maneuver.duration = step.duration;
							var distance = 0;
							for ( var geometryCounter = 0; ( 1 === step.geometry.length ) ? ( geometryCounter < 1 ) : ( geometryCounter < step.geometry.length )  ; geometryCounter ++ ) {
								var itineraryPoint = require ( '../data/ItineraryPoint' ) ( );
								itineraryPoint.latLng = [ step.geometry [ geometryCounter ] [ 0 ], step.geometry [ geometryCounter ] [ 1 ] ];
								itineraryPoint.distance = leg.annotation.distance [ lastPointWithDistance ] ? leg.annotation.distance [ lastPointWithDistance ] : 0;
								route.itinerary.itineraryPoints.add ( itineraryPoint );
								if (geometryCounter !== step.geometry.length - 1 ) {
									distance += itineraryPoint.distance;
									lastPointWithDistance++;
								}
								if ( 0 === geometryCounter ) {
									maneuver.itineraryPointObjId = itineraryPoint.objId;
									itineraryPoint.maneuverObjId = maneuver.objId;
								}
							}
							maneuver.distance = distance;
							route.itinerary.maneuvers.add ( maneuver );
						}
					);
				}
			);
			
			var wayPointsIterator = route.wayPoints.iterator;
			response.waypoints.forEach ( 
				function ( wayPoint ) {
					if ( ! wayPointsIterator.done ) {
						wayPointsIterator.value.latLng = [ wayPoint.location [ 1 ] , wayPoint.location [ 0 ] ];
					}
				}
			);

			return ;
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
