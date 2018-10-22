(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

	var getPublicTransportRouteProvider = function ( ) {

		var _WayPoints;
		var _TransitMode;
		var _ProviderKey;
		var _UserLanguage;
		var _Options;

		var _SelectedRelation = -1;

		var _ParseResponse = function ( requestResponse, route, userLanguage ) {
			route.itinerary.itineraryPoints.removeAll ( );
			route.itinerary.maneuvers.removeAll ( );
			
			return false;
		};
		
		var _GetRelationsUrl = function ( ) {

			return 'https://lz4.overpass-api.de/api/interpreter?data=[out:json];(node["railway"="station"](around:150.0,' +
				_WayPoints.first.lat.toFixed ( 6 ) +
				',' +
				_WayPoints.first.lng.toFixed ( 6 ) +
				');node["railway"="halt"](around:150.0,' +
				_WayPoints.first.lat.toFixed ( 6 ) +
				',' +
				_WayPoints.first.lng.toFixed ( 6 ) +
				');)->.s;node["public_transport"="stop_position"]["train"="yes"](around.s:150.0)->.s;rel(bn.s)->.s;(node["railway"="station"](around:150.0,' +
				_WayPoints.last.lat.toFixed ( 6 ) +
				',' +
				_WayPoints.last.lng.toFixed ( 6 ) +
				');node["railway"="halt"](around:150.0,' +
				_WayPoints.last.lat.toFixed ( 6 ) +
				',' +
				_WayPoints.last.lng.toFixed ( 6 ) +
				');)->.e;node["public_transport"="stop_position"]["train"="yes"](around.e:150.0)->.e;rel(bn.e)->.e;rel.e.s;out tags;';	
		};
		
		var _GetRouteList = function ( result ) {
			var routeList = [];
			result [ 0 ].elements.forEach (
				function ( element ) {
					if ( element.tags.name ) {
						routeList.push ( element.tags.name );
					}
					else {
						routeList.push ( 'Unnamed route' );
					}
				}
			);
			return routeList;
		};		
		
		var _SetSelectedRelation = function ( responses ) {
			_SelectedRelation = responses [ 0 ].elements [ responses [ 1 ].index ].id;
		};
		
		var _GetWayNodesUrl = function ( ) {
			return 'https://lz4.overpass-api.de/api/interpreter?data=[out:json];rel(' +
				_SelectedRelation.toFixed ( 0 ) + 
				');way(r)->.e;way.e["railway"="rail"];(._;>;);out skel;';
		};
		
		return {
			get icon ( ) {
				return 'iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAB3RJTUUH4goTCi4V9AmY6AAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAEc0lEQVRIx8VXTUhbWxD+zr0ag77Gqo1/RazRYjcBaxAVoxXFhQtRXLgt2iJUaAl9FBFcPBdtceeuBXGr4uaCq67rz0IaaUtFBcXAq1WjVkhiTm6u3u8tXs1TG6NVyxuYzZy5fHNm5s58R5Ak/gdJOs+htbUVNpsNLpcLZWVlcDqdyMrKujoyE8j4+DhVVaXH42FdXR2tVisBxNTlcnF2dpaXEfyKcyAQIAD29vZydHSUdrudT58+/b3AUkru7OywoaGBdrudpmnyKiLOa67d3V3U19fjy5cvJ+ylpaVwOp3IyMhAWloa7HY7Kioq4HK5kJmZebUaR6NRKooSq6mqqlRVlUKIE7U+ra9fv75aqvPy8giARUVF9Pv91HWduq5TSkmv18v+/n5WVVXFBX/48OHlgFtaWgiA6enpF6pZNBplMBjk3t4e9/b2uL+/T5/P92vA79+/j0Xu9Xov3UBSSn79+jXu2U8DxOfzoa6uDgDw9u1blJeXAwAGBgYwMzODcDgMALBarbh58yZyc3NRXFyMe/fuIT8/H6qqIhKJ4ODgALdu3UJycvL5zfXp06fYTYeGhmL2tra2hM10nj569OjsVGuaRgAUQnBycpIkubi4yOzs7CuBHunu7u7PwD09PQTA27dvMxQKUUrJZ8+eXQvgkTocjpPAhYWFBMCBgQGS5PLy8rUCHtdAIBADVhwOB46GV3V1NQKBwG9bhY2Njf+txa6uLrS3t0PTNFRWVib8sLS0FG63G2VlZSguLsaNGzcQiUTw/ft3bGxs4Nu3b/D7/QgGgwiHw5BSQkoJXdcRjUYRDAah6zpSUlKQpGkapZQCAEKhEFRVxf3791FbW8uGhgbcuXMH+fn5sNvtiWISp3+WODb8SDcsFgvE58+fabPZoKoqsrOzYbFYfivz2NraQk5ODpKcTmfc6C5KiYQQP92YJMWPg9P2w8NDmKYJVdO0v3w+Hw4ODqDrOhRFQWpqKsQFxePxiOnpaUxNTUFRFBQWFuI06NbWFtbX17G9vS0cDoeQUgokJSXFbf2Ojg6+e/eOm5ubjEajZ87j42szIyMjrs/Q0NCJ2W8YBkHSnJubY0lJiXkqCPO4ulwuU9M0U0ppGoZhHsns7KwJgCkpKSwoKCBJmqfoid/vZ15eHm02m7mysmJGIhHzxKw2DIMLCwt0u91nDgFFUWixWHj37l0ODg5yfn6eh4eHCXma1+vl2NgYnzx5QgAMhULx1+LIyAhfvnzJpaUl1tTUXOv06uzsTEwE5ubmaLVa2dTUxImJCb558+ZagI+yk5D66LrO5uZmAmB5eTmXl5c5Pj7OBw8e/DJgZmYm19bWLs4yAWB4eBjd3d0AgL6+Prx69QoAMD8/j48fP2J1dRXb29sIh8MwDANCCITDYZimiZycHHR2dsLtdl+cZR6XnZ0dOhyOWIN9+PDhTN/p6Wl6PB62trYSAGtrazk1NUXDMC73kiDJx4+7KMS/6Xv+3EPD0M/07evrpc32x4mUv3jxJ9fX/+Y/YWHR4vXjhpgAAAAASUVORK5CYII=';
			},
			getTasks : function ( wayPoints, transitMode, providerKey, userLanguage, options ) {
				
				_WayPoints = wayPoints;
				_TransitMode = transitMode;
				_ProviderKey = providerKey;
				_UserLanguage = userLanguage;
				_Options = options;
				
				return [
					{
						task: 'loadJsonFile',
						context : null,
						func : _GetRelationsUrl
					},
					{	
						task: 'wait'
					},
					{	
						task: 'run',
						context : null,
						func : _GetRouteList,
						useResponses : [ 0 ]
					},
					{	
						task: 'showDialog',
						func : L.travelNotes.interface ( ).selectDialog,
						context : null,
						useResponses : [ 2 ]
					},
					{	
						task: 'wait'
					},
					{	
						task: 'run',
						context : null,
						func : _SetSelectedRelation,
						useResponses : [ 0, 3 ]
					},
					{
						task: 'loadJsonFile',
						context : null,
						func : _GetWayNodesUrl
					},
					{	
						task: 'wait'
					},
				];
			},
			
			parseResponse : function ( requestResponse, route, userLanguage ) {
				return _ParseResponse ( requestResponse, route, userLanguage );
			},
			
			get name ( ) { return 'PublicTransport';},
			
			get transitModes ( ) { return { car : false, bike : false, pedestrian : false, train : true}; },
			
			get providerKeyNeeded ( ) { return false; }
		};
	};
	
	L.travelNotes.interface ( ).addProvider ( getPublicTransportRouteProvider ( ) );

}());

},{}]},{},[1]);
