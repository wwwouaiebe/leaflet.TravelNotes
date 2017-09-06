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
	
	var _Translator = require ( '../UI/Translator' ) ( );
	var _Config = require ( '../util/Config' ) ( );

	var getRouteTooltipText = function ( layer ) {
		var route = null;
		try {
			route = global.travelData.routes.getAt ( layer.objId );
		}
		catch ( e ) {
			if ( layer.objId === global.editedRoute.objId ) {
				route = global.editedRoute;
			}
		}
		return ( route ? route.name : '');
	};
	
	var getRoutePopupText = function ( layer ) {
		var route = null;
		try {
			route = global.travelData.routes.getAt ( layer.objId );
		}
		catch ( e ) {
			if ( layer.objId === global.editedRoute.objId ) {
				route = global.editedRoute;
			}
		}
		var distance = 0;
		var duration = 0;
		if ( route ) {
			var maneuverIterator = route.itinerary.maneuvers.iterator;
			while ( ! maneuverIterator.done ) {
				distance += maneuverIterator.value.distance;
				duration += maneuverIterator.value.duration;
			}
			distance = require ( '../util/Utilities' ) ( ).formatDistance ( distance );
			duration = require ( '../util/Utilities' ) ( ).formatTime ( duration );
		}
		var returnValue = '';
		if ( route ) {
			returnValue = '<div class="RoutePopup-Header">' +
			route.name + '</div><div class="RoutePopup-Distance">' +
			_Translator.getText ( 'MapEditor - Distance' ) + distance + '</div><div class="RoutePopup-Duration">' +
			_Translator.getText ( 'MapEditor - Duration' ) + duration + '</div>';
		}
		return returnValue;
	};
	
	var onRouteClick = function ( event ) {
		event.target.openPopup ( event.latlng );		
	};
	
	var onRouteContextMenu = function ( event ) {
		require ('../UI/ContextMenu' ) ( event, require ( './RouteEditor' ) ( ).routeContextMenu );
	};
	
	var getMapEditor = function ( ) {
		
		var _AddTo = function ( objId, object ) {
			object.objId = objId;
			global.map.addLayer ( object );
			global.map.travelObjects.set ( objId, object );
		};
		var _RemoveFrom = function ( objId ) {
			var layer = global.map.travelObjects.get ( objId );
			if ( layer ) {
				L.DomEvent.off ( layer );
				global.map.removeLayer ( layer );
				global.map.travelObjects.delete ( objId );
			}
		};
		
		return {
			addRoute : function ( route ) {
				var latLng = [];
				var pointsIterator = route.itinerary.itineraryPoints.iterator;
				while ( ! pointsIterator.done ) {
					latLng.push ( pointsIterator.value.latLng );
				}
				var polyline = L.polyline ( 
					latLng,
					{
						color : route.geom.color,
						weight : route.geom.weight
					}
				);
				_AddTo ( route.objId, polyline );
				polyline.addTo ( global.map );
				polyline.bindTooltip ( getRouteTooltipText );
				polyline.bindPopup ( getRoutePopupText );
				L.DomEvent.on ( polyline, 'click', onRouteClick );
				L.DomEvent.on ( polyline, 'contextmenu', onRouteContextMenu );
			},
			removeObject : function ( objId ) {
				_RemoveFrom ( objId );
			},
			zoomToItineraryPoint : function ( itineraryPointObjId ) {
				map.setView ( 
					global.editedRoute.itinerary.itineraryPoints.getAt ( itineraryPointObjId ).latLng,
					_Config.itineraryPointZoom 
				);
			},
			addItineraryPointMarker : function ( itineraryPointObjId ) {
				_AddTo ( 
					itineraryPointObjId,
					L.circle ( global.editedRoute.itinerary.itineraryPoints.getAt ( itineraryPointObjId ).latLng, _Config.itineraryPointMarker )
				);
			}
		};
	};

	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getMapEditor;
	}

}());
