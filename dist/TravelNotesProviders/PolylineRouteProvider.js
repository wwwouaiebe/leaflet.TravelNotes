(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

	var getPolylineRouteProvider = function ( ) {

		var instructionsList = 
		{
			en : { kStart : "Start", kContinue : "Continue", kEnd : "Stop" },
			fr : { kStart : "Départ", kContinue : "Continuer", kEnd : "Arrivée" }
		};
		
		var _ParseResponse = function ( requestResponse, route, userLanguage ) {
			route.itinerary.itineraryPoints.removeAll ( );
			route.itinerary.maneuvers.removeAll ( );
			var wayPointsIterator = route.wayPoints.iterator;
			var done = wayPointsIterator.done;
			var iconName = "kDepartDefault";
			var instruction = instructionsList [ userLanguage ] ? instructionsList [ userLanguage ].kStart : instructionsList.en.kStart;
			while ( ! done ) {
				var itineraryPoint = L.travelNotes.interface ( ).itineraryPoint;
				itineraryPoint.latLng = wayPointsIterator.value.latLng;
				itineraryPoint.distance = 0;
				route.itinerary.itineraryPoints.add ( itineraryPoint );
				
				var maneuver = L.travelNotes.interface ( ).maneuver;
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
					maneuver.instruction = instructionsList [ userLanguage ] ? instructionsList [ userLanguage ].kEnd : instructionsList.en.kEnd;
				}
				route.itinerary.maneuvers.add ( maneuver );
				iconName = "kContinueStraight";
				instruction = instructionsList [ userLanguage ] ? instructionsList [ userLanguage ].kContinue : instructionsList.en.kContinue;
				
			}
			
			return true;
		};
		
		var _GetUrl = function ( wayPoints, transitMode, providerKey, userLanguage, options ) {
			
			return null;
		};
		
		return {
			get icon ( ) {
				return 'iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAIAAAC0Ujn1AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4ggaBh8z7ov/KQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAqElEQVRIx9VW0Q6AIAgU5v//sr1Us0I6EGy5HnLR3XnAhFprJWdxSVuJ0FX7SLS/uEzDVJ8cMdAuOJfXCBPR/gSn8cHNMz+7DLEa3ccf5QSo7itPpBzoYAOuCHTbdvEMqQBb5hoGp1G0RbIYg9bFvqXaUnxKPiURHNDfg8PxLMrYNHYabe5GxI2eUqWvHj3YgTjJjWXX7vS18u2wEDT0rJlDoie0fw5mG+C/L0HylIYKAAAAAElFTkSuQmCC';
			},
			getUrl : function ( wayPoints, transitMode, providerKey, userLanguage, options ) {
				return _GetUrl ( wayPoints, transitMode, providerKey, userLanguage, options );
			},
			parseResponse : function ( requestResponse, route, userLanguage ) {
				return _ParseResponse ( requestResponse, route, userLanguage );
			},
			get name ( ) { return 'Polyline';},
			get transitModes ( ) { return { car : true, bike : true, pedestrian : true}; },
			get providerKeyNeeded ( ) { return false; }
		};
	};
	
	L.travelNotes.interface ( ).addProvider ( getPolylineRouteProvider ( ) );

}());

},{}]},{},[1]);
