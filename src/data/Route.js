/*
Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/

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
Changes:
	- v1.0.0:
		- created
	-v1.1.0:
		- Issue #33: Add a command to hide a route
		- Issue #36: Add a linetype property to route
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
	- v1.5.0:
		- Issue #52 : when saving the travel to the file, save also the edited route.
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
	- v1.8.0:
		- Issue #100 : Fix circular dependancies with Collection
	- v1.12.0:
		- Issue #120 : Review the UserInterface
Doc reviewed 20200731
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

/**
@----------------------------------------------------------------------------------------------------------------------

@file Route.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License

@----------------------------------------------------------------------------------------------------------------------
*/

/* eslint no-fallthrough: ["error", { "commentPattern": "eslint break omitted intentionally" }]*/

import { theConfig } from '../data/Config.js';
import { newObjId } from '../data/ObjId.js';
import { newObjType } from '../data/ObjType.js';
import { newCollection } from '../data/Collection.js';
import { newWayPoint } from '../data/WayPoint.js';
import { newItinerary } from '../data/Itinerary.js';
import { newNote } from '../data/Note.js';
import { ROUTE_EDITION_STATUS, DISTANCE, ZERO } from '../util/Constants.js';

const ourObjType = newObjType ( 'Route' );

/**
@----------------------------------------------------------------------------------------------------------------------

@function myNewRoute
@desc Constructor for a Route object
@return {Route} an instance of a Route object
@private

@----------------------------------------------------------------------------------------------------------------------
*/

function myNewRoute ( ) {

	let myName = '';
	let myWayPoints = newCollection ( newWayPoint );
	myWayPoints.add ( newWayPoint ( ) );
	myWayPoints.add ( newWayPoint ( ) );
	let myNotes = newCollection ( newNote );
	let myItinerary = newItinerary ( );
	let myWidth = theConfig.route.width;
	let myColor = theConfig.route.color;
	let myDashArray = theConfig.route.dashArray;
	let myChain = false;
	let myChainedDistance = DISTANCE.defaultValue;
	let myDistance = DISTANCE.defaultValue;
	let myDuration = DISTANCE.defaultValue;
	let myEditionStatus = ROUTE_EDITION_STATUS.notEdited;
	let myHidden = false;
	let myObjId = newObjId ( );

	/**
	@------------------------------------------------------------------------------------------------------------------

	@function myValidate
	@desc verify that the parameter can be transformed to a Route and performs the upgrate if needed
	@param {Object} something an object to validate
	@return {Object} the validated object
	@throws {Error} when the parameter is invalid
	@private

	@------------------------------------------------------------------------------------------------------------------
	*/

	function myValidate ( something ) {
		if ( ! Object.getOwnPropertyNames ( something ).includes ( 'objType' ) ) {
			throw new Error ( 'No objType for ' + ourObjType.name );
		}
		ourObjType.validate ( something.objType );
		if ( ourObjType.version !== something.objType.version ) {
			switch ( something.objType.version ) {
			case '1.0.0' :
				something.dashArray = ZERO;
				something.hidden = false;
				// eslint break omitted intentionally
			case '1.1.0' :
			case '1.2.0' :
			case '1.3.0' :
			case '1.4.0' :
				something.edited = ROUTE_EDITION_STATUS.notEdited;
				// eslint break omitted intentionally
			case '1.5.0' :
			case '1.6.0' :
			case '1.7.0' :
			case '1.7.1' :
			case '1.8.0' :
			case '1.9.0' :
			case '1.10.0' :
			case '1.11.0' :
				something.editionStatus = something.edited;
				something.objType.version = '1.12.0';
				break;
			default :
				throw new Error ( 'invalid version for ' + ourObjType.name );
			}
		}
		let properties = Object.getOwnPropertyNames ( something );
		[
			'name',
			'wayPoints',
			'notes',
			'itinerary',
			'width',
			'color',
			'dashArray',
			'chain',
			'distance',
			'duration',
			'editionStatus',
			'hidden',
			'chainedDistance',
			'objId'
		].forEach (
			property => {
				if ( ! properties.includes ( property ) ) {
					throw new Error ( 'No ' + property + ' for ' + ourObjType.name );
				}
			}
		);
		return something;
	}

	/**
	@------------------------------------------------------------------------------------------------------------------

	@class Route
	@classdesc This class represent a route
	@see {@link newRoute} for constructor
	@hideconstructor

	@------------------------------------------------------------------------------------------------------------------
	*/

	class Route	{

		/**
		a Collection of WayPoints
		@type {Collection.WayPoint}
		@readonly
		*/

		get wayPoints ( ) { return myWayPoints; }

		/**
		the Route Itinerary
		@type {Itinerary}
		*/

		get itinerary ( ) { return myItinerary; }

		/**
		a Collection of Notes
		@type {Collection.Note}
		@readonly
		*/

		get notes ( ) { return myNotes; }

		/**
		the name of the Route
		@type {string}
		*/

		get name ( ) { return myName; }
		set name ( Name ) { myName = Name; }

		/**
		A name computed from the starting WayPoint and ending WayPoint names and addresses
		@type {string}
		@readonly
		*/

		get computedName ( ) {
			let computedName = myName;
			if ( '' === computedName ) {
				computedName =
					( '' === myWayPoints.first.fullName ? '???' : myWayPoints.first.fullName ) +
					' ⮞ ' +
					( '' === myWayPoints.last.fullName ? '???' : myWayPoints.last.fullName );
			}

			return computedName;
		}

		/**
		the width of the Leaflet polyline used to represent the Route on the map
		@type {!number}
		*/

		get width ( ) { return myWidth; }
		set width ( Width ) { myWidth = Width; }

		/**
		the color of the Leaflet polyline used to represent the Route on the map
		using the css format '#rrggbb'
		@type {string}
		*/

		get color ( ) { return myColor; }
		set color ( Color ) { myColor = Color; }

		/**
		the dash of the Leaflet polyline used to represent the Route on the map.
		It's the index of the dash in the array Config.route.dashChoices
		@type {!number}
		*/

		get dashArray ( ) { return myDashArray; }
		set dashArray ( DashArray ) { myDashArray = DashArray; }

		/**
		boolean indicates if the route is chained
		@type {boolean}
		*/

		get chain ( ) { return myChain; }
		set chain ( Chain ) { myChain = Chain; }

		/**
		the distance betwween the starting point of the traval and the starting point
		of the route if the route is chained, otherwise DISTANCE.defaultValue
		@type {!number}
		*/

		get chainedDistance ( ) { return myChainedDistance; }
		set chainedDistance ( ChainedDistance ) { myChainedDistance = ChainedDistance; }

		/**
		the length of the route or DISTANCE.defaultValue if the Itinerary is not anymore computed
		@type {number}
		*/

		get distance ( ) { return myDistance; }
		set distance ( Distance ) { myDistance = Distance; }

		/**
		the duration of the route or DISTANCE.defaultValue if the Itinerary is not anymore computed
		@type {number}
		*/

		get duration ( ) { return myDuration; }
		set duration ( Duration ) { myDuration = Duration; }

		/**
		A number indicating the status of the route.
		See ROUTE_EDITION_STATUS for possible values
		@type {!number}
		*/

		get editionStatus ( ) { return myEditionStatus; }
		set editionStatus ( editionStatus ) {
			if (
				'number' !== typeof editionStatus
				||
				ROUTE_EDITION_STATUS.notEdited > editionStatus
				||
				ROUTE_EDITION_STATUS.editedChanged < editionStatus
			) {
				throw new Error ( 'Invalid value for Route.edited : ' + editionStatus );
			}
			else {
				myEditionStatus = editionStatus;
			}
		}

		/**
		a boolean set to true when the route is hidden on the map
		@type {boolean}
		*/

		get hidden ( ) { return myHidden; }
		set hidden ( Hidden ) { myHidden = Hidden; }

		/**
		the objId of the Route. objId are unique identifier given by the code
		@readonly
		@type {!number}
		*/

		get objId ( ) { return myObjId; }

		/**
		the ObjType of the Route.
		@type {ObjType}
		@readonly
		*/

		get objType ( ) { return ourObjType; }

		/**
		An object literal with the WayPoint properties and without any methods.
		This object can be used with the JSON object
		@type {Object}
		*/

		get jsonObject ( ) {
			return {
				name : myName,
				wayPoints : myWayPoints.jsonObject,
				notes : myNotes.jsonObject,
				itinerary : myItinerary.jsonObject,
				width : myWidth,
				color : myColor,
				dashArray : myDashArray,
				chain : myChain,
				distance : parseFloat ( myDistance.toFixed ( DISTANCE.fixed ) ),
				duration : myDuration,
				editionStatus : myEditionStatus,
				hidden : myHidden,
				chainedDistance : parseFloat ( myChainedDistance.toFixed ( DISTANCE.fixed ) ),
				objId : myObjId,
				objType : ourObjType.jsonObject
			};
		}
		set jsonObject ( something ) {
			let otherthing = myValidate ( something );
			myName = otherthing.name || '';
			myWayPoints.jsonObject = otherthing.wayPoints || [];
			myNotes.jsonObject = otherthing.notes || [];
			myItinerary.jsonObject = otherthing.itinerary || newItinerary ( ).jsonObject;
			myWidth = otherthing.width || theConfig.route.width;
			myColor = otherthing.color || '#000000';
			myDashArray = otherthing.dashArray || ZERO;
			myChain = otherthing.chain || false;
			myDistance = otherthing.distance;
			myDuration = otherthing.duration;
			myEditionStatus = otherthing.editionStatus || ROUTE_EDITION_STATUS.notEdited;
			myHidden = otherthing.hidden || false;
			myChainedDistance = otherthing.chainedDistance;
			myObjId = newObjId ( );
		}
	}

	return Object.seal ( new Route );
}

export {

	/**
	@----------------------------------------------------------------------------------------------------------------------

	@function newRoute
	@desc Constructor for a Route object
	@return {Route} an instance of a Route object
	@global

	@----------------------------------------------------------------------------------------------------------------------
	*/

	myNewRoute as newRoute
};

/*
--- End of Route.js file ----------------------------------------------------------------------------------------------
*/