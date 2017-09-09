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
	var _DataManager = require ( '../Data/DataManager' ) ( );


	var getNoteTooltipText = function ( layer ) {
		var note = _DataManager.getNote ( layer.objId ).note;
		
		return ( note ? note.tooltipContent : '');
	};
	
	var getNotePopUpText = function ( layer ) {
		var note = _DataManager.getNote ( layer.objId ).note;
		var notePopupText = '';
		if ( 0 !== note.tooltipContent.length ) {
			notePopupText += '<div class="TravelNotes-PopupMapTooltipContent">' + note.tooltipContent + '</div>';
		}
		if ( 0 !== note.popupContent.length ) {
			notePopupText += '<div class="TravelNotes-PopupContent">' + note.popupContent + '</div>';
		}
		if ( 0 !== note.address.length ) {
			notePopupText += '<div class="TravelNotes-PopupAddress">' + _Translator.getText ( 'MapEditor - popup address' )  + note.address + '</div>';
		}
		if ( 0 !== note.phone.length ) {
			notePopupText += '<div class="TravelNotes-PopupPhone">' + _Translator.getText ( 'MapEditor - popup phone' )  + note.phone + '</div>';
		}
		if ( 0 !== note.url.length ) {
			notePopupText += '<div class="TravelNotes-PopupUrl">' + _Translator.getText ( 'MapEditor - popup url' ) + '<a href="' + note.url + '" target="_blank">' + note.url +'</a></div>';
		}
		notePopupText += '<div class="TravelNotes-PopupLatLng"><span>' + _Translator.getText ( 'MapEditor - popup lat' ) + '</span>' + note.lat.toFixed ( 6 ) + 
			'<span>' + _Translator.getText ( 'MapEditor - popup lng' ) + '</span>' + note.lng.toFixed ( 6 ) + '</div>';
			
		return notePopupText;
	};
	
	var getRouteTooltipText = function ( layer ) {
		var route = _DataManager.getRoute ( layer.objId );

		return ( route ? route.name : '');
	};

	var getRoutePopupText = function ( layer ) {
		var route = _DataManager.getRoute ( layer.objId );
	
		var distance = 0;
		var duration = 0;

		var maneuverIterator = route.itinerary.maneuvers.iterator;
		while ( ! maneuverIterator.done ) {
			distance += maneuverIterator.value.distance;
			duration += maneuverIterator.value.duration;
		}
		distance = require ( '../util/Utilities' ) ( ).formatDistance ( distance );
		duration = require ( '../util/Utilities' ) ( ).formatTime ( duration );

		return '<div class="RoutePopup-Header">' +
			route.name + '</div><div class="RoutePopup-Distance">' +
			_Translator.getText ( 'MapEditor - Distance' ) + distance + '</div><div class="RoutePopup-Duration">' +
			_Translator.getText ( 'MapEditor - Duration' ) + duration + '</div>';
	};
	
	var onRouteClick = function ( event ) {
		event.target.openPopup ( event.latlng );		
	};
	
	var onRouteContextMenu = function ( event ) {
		require ('../UI/ContextMenu' ) ( event, require ( './RouteEditor' ) ( ).getRouteContextMenu ( event.target.objId ) );
	};

	var onTravelNoteContextMenu = function ( event ) {
		require ('../UI/ContextMenu' ) ( event, require ( './NoteEditor' ) ( ).getNoteContextMenu ( event.target.objId ) );
	};
	
	var getMapEditor = function ( ) {
		
		var _AddTo = function ( objId, object ) {
			object.objId = objId;
			object.addTo ( global.map );
			//global.map.addLayer ( object );
			global.map.travelObjects.set ( objId, object );
		};
		var _RemoveFrom = function ( objId ) {
			var layer = global.map.travelObjects.get ( objId );
			if ( layer ) {
				L.DomEvent.off ( layer );
				global.map.removeLayer ( layer );
				global.map.travelObjects.delete ( objId );
			}
			else {
				console.log ( 'Object not found for deletion : ' + objId );
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
			
			removeAllObjects : function ( ) {
				global.map.travelObjects.forEach ( 
					function ( travelObjectValue, travelObjectKey, travelObjects ) {
						L.DomEvent.off ( travelObjectValue );
						global.map.removeLayer ( travelObjectValue );
					}
				);
				global.map.travelObjects.clear ( );
			},
			
			addRoutes : function ( ) {
				var routesIterator = global.travelData.routes.iterator;
				while ( ! routesIterator.done ) {
					this.addRoute ( routesIterator.value );
				}
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
			},
			
			addTravelNote : function ( note ) {
				console.log ( 'addTravelNote' );
				var icon = L.divIcon (
					{ 
						iconSize: [ note.iconWidth, note.iconHeight ], 
						iconAnchor: [ note.iconWidth / 2, note.iconHeight / 2 ],
						popupAnchor: [ 0, -note.iconHeight / 2 ], 
						html : note.iconContent
					}
				);
				var marker = L.marker ( 
					note.latLng,
					{
						icon : icon,
						draggable : true,
					}
				);	
				marker.bindPopup ( getNotePopUpText );
				marker.bindTooltip ( getNoteTooltipText );
				marker.getTooltip ( ).options.offset [ 0 ] = note.iconWidth / 2;
				_AddTo ( note.objId, marker );
				L.DomEvent.on ( marker, 'contextmenu', onTravelNoteContextMenu );
			},
			
			editNote : function ( note ) {
				var icon = L.divIcon (
					{ 
						iconSize: [ note.iconWidth, note.iconHeight ], 
						iconAnchor: [note.iconWidth / 2, note.iconHeight / 2 ],
						popupAnchor: [ 0, -note.iconHeight / 2 ], 
						html : note.iconContent
					}
				);
				var marker = global.map.travelObjects.get ( note.objId );
				marker.setIcon ( icon );
				marker.getTooltip ( ).options.offset [ 0 ] = note.iconWidth / 2;
			}
		};
	};

	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getMapEditor;
	}

}());
