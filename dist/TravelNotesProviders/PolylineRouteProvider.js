(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/*
Copyright - 2017 - wwwouaiebe - Contact: http//www.ouaie.be/

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

	var getPolylineRouteProvider = function ( ) {

		var _ProviderKey = '';
		var _UserLanguage = 'fr';
		var _Options;
		var _Route;
		var _Response = '';

		var instructionsList = 
		{
			en : { kStart : "Start", kContinue : "Continue", kEnd : "Stop" },
			fr : { kStart : "Départ", kContinue : "Continuer", kEnd : "Arrivée" }
		};
		
		/*
		--- _ParseResponse function ------------------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var _ParseResponse = function ( returnOnOk, returnOnError ) {
			
			_Route.itinerary.itineraryPoints.removeAll ( );
			_Route.itinerary.maneuvers.removeAll ( );
			var wayPointsIterator = _Route.wayPoints.iterator;
			var done = wayPointsIterator.done;
			var iconName = "kDepartDefault";
			var instruction = instructionsList [ _UserLanguage ] ? instructionsList [ _UserLanguage ].kStart : instructionsList.en.kStart;
			while ( ! done ) {
				var itineraryPoint = L.travelNotes.itineraryPoint;
				itineraryPoint.latLng = wayPointsIterator.value.latLng;
				itineraryPoint.distance = 0;
				_Route.itinerary.itineraryPoints.add ( itineraryPoint );
				
				var maneuver = L.travelNotes.maneuver;
				maneuver.iconName = iconName;
				maneuver.instruction = instruction;
				maneuver.duration = 0;
				maneuver.itineraryPointObjId = itineraryPoint.objId;
				done = wayPointsIterator.done;
				if ( ! done ) {
					maneuver.distance = L.latLng ( itineraryPoint.latLng ).distanceTo ( L.latLng ( wayPointsIterator.value.latLng ));
				}
				else {
					maneuver.iconName = "kArriveDefault";
					maneuver.instruction = instructionsList [ _UserLanguage ] ? instructionsList [ _UserLanguage ].kEnd : instructionsList.en.kEnd;
				}
				_Route.itinerary.maneuvers.add ( maneuver );
				iconName = "kContinueStraight";
				instruction = instructionsList [ _UserLanguage ] ? instructionsList [ _UserLanguage ].kContinue : instructionsList.en.kContinue;
				
			}
			
			returnOnOk ( '' );
		};
		
		/*
		--- End of _ParseResponse function ---
		*/

		/*
		--- _GetPromiseRoute function ---------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var _GetPromiseRoute = function ( route, options ) {
			_Route = route;
			_Options = options;
			_Response = '';
			return new Promise ( _ParseResponse );
		};
		
		/*
		--- End of _GetPromiseRoute function ---
		*/

		return {
			
			getPromiseRoute : function ( route, options ) {
				return _GetPromiseRoute ( route, options );
			},
			get icon ( ) {
				return 'iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAIAAAC0Ujn1AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4ggaBh8z7ov/KQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAqElEQVRIx9VW0Q6AIAgU5v//sr1Us0I6EGy5HnLR3XnAhFprJWdxSVuJ0FX7SLS/uEzDVJ8cMdAuOJfXCBPR/gSn8cHNMz+7DLEa3ccf5QSo7itPpBzoYAOuCHTbdvEMqQBb5hoGp1G0RbIYg9bFvqXaUnxKPiURHNDfg8PxLMrYNHYabe5GxI2eUqWvHj3YgTjJjWXX7vS18u2wEDT0rJlDoie0fw5mG+C/L0HylIYKAAAAAElFTkSuQmCC';
			},
			get name ( ) { return 'Polyline';},
			get transitModes ( ) { return { car : true, bike : true, pedestrian : true, train : true}; },
			get providerKeyNeeded ( ) { return false; },
			
			//get providerKey ( ) { return 0 < _ProviderKey.length; },
			get providerKey ( ) { return _ProviderKey.length; },
			set providerKey ( ProviderKey ) { if ( '' === _ProviderKey ) { _ProviderKey = ProviderKey;}},
			
			get userLanguage ( ) { return _UserLanguage; },
			set userLanguage ( UserLanguage ) { _UserLanguage = UserLanguage; }
			
		};
	};
	
	L.travelNotes.addProvider ( getPolylineRouteProvider ( ) );

}());

},{}]},{},[1]);
