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
	- v1.6.0:
		- created
	- v1.12.0:
		- Issue #120 : Review the UserInterface
Doc reviewed 20200810
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file Zoomer.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module Zoomer
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theEventDispatcher } from '../util/EventDispatcher.js';
import { theDataSearchEngine } from '../data/DataSearchEngine.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { INVALID_OBJ_ID } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewZoomer
@desc constructor for Zoomer objects
@return {Zoomer} an instance of Zoomer object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewZoomer ( ) {

	let myGeometry = [];

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myPushNoteGeometry
	@desc This method push the latitude and longitude of a note in the myGeometry array
	@param {Note} note the note to push
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myPushNoteGeometry ( note ) {
		myGeometry.push ( note.latLng );
		myGeometry.push ( note.iconLatLng );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myPushRouteGeometry
	@desc This method push the latitude and longitude of a route in the myGeometry array
	@param {Route} route the route to push
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myPushRouteGeometry ( route ) {
		route.itinerary.itineraryPoints.forEach ( itineraryPoint => myGeometry.push ( itineraryPoint.latLng ) );
		route.notes.forEach (
			note => myPushNoteGeometry ( note )
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class Zoomer
	@classdesc This class implements a zoom command on multiple objects
	@see {@link newZoomer} for constructor
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	class Zoomer {

		/**
		Performs a zoom on a maneuver
		@param {!number} maneuverObjId the objId of the maneuver on witch the zoom must be performed
		@fires zoomto
		*/

		zoomToManeuver ( maneuverObjId ) {
			let itineraryPointObjId =
				theTravelNotesData.travel.editedRoute.itinerary.maneuvers.getAt ( maneuverObjId ).itineraryPointObjId;
			let latLng =
				theTravelNotesData.travel.editedRoute.itinerary.itineraryPoints.getAt ( itineraryPointObjId ).latLng;
			theEventDispatcher.dispatch ( 'zoomto', { latLng : latLng } );
		}

		/**
		Performs a zoom on a note
		@param {!number} noteObjId the objId of the note on witch the zoom must be performed
		@fires zoomto
		*/

		zoomToNote ( noteObjId ) {
			myGeometry = [];
			myPushNoteGeometry ( theDataSearchEngine.getNoteAndRoute ( noteObjId ).note );
			theEventDispatcher.dispatch (
				'zoomto',
				{
					geometry : [ myGeometry ]
				}
			);
		}

		/**
		Performs a zoom on a route
		@param {!number} routeObjId the objId of the route on witch the zoom must be performed
		@fires zoomto
		*/

		zoomToRoute ( routeObjId ) {
			myGeometry = [];

			myPushRouteGeometry ( theDataSearchEngine.getRoute ( routeObjId ) );

			theEventDispatcher.dispatch (
				'zoomto',
				{
					geometry : [ myGeometry ]
				}
			);
		}

		/**
		Performs a zoom on a complete travel
		@fires zoomto
		*/

		zoomToTravel ( ) {
			myGeometry = [];
			theTravelNotesData.travel.routes.forEach (
				route => myPushRouteGeometry ( route )
			);
			if ( INVALID_OBJ_ID !== theTravelNotesData.travel.editedRouteObjId ) {
				myPushRouteGeometry ( theTravelNotesData.travel.editedRoute );
			}
			theTravelNotesData.travel.notes.forEach (
				note => myPushNoteGeometry ( note )
			);
			theEventDispatcher.dispatch (
				'zoomto',
				{
					geometry : [ myGeometry ]
				}
			);
		}

		/**
		Performs a zoom on a poi (point of interest = a search result from osm)
		@param {Object} poi Poi on witch the zoom must be performed
		@fires zoomto
		*/

		zoomToPoi ( poi ) {
			theEventDispatcher.dispatch ( 'zoomto', poi );
		}
	}

	return Object.seal ( new Zoomer );
}

export {

	/**
@------------------------------------------------------------------------------------------------------------------------------

@function newZoomer
@desc constructor for Zoomer objects
@return {Zoomer} an instance of Zoomer object
@global

@------------------------------------------------------------------------------------------------------------------------------
*/

	ourNewZoomer as newZoomer
};

/*
--- End of Zoomer.js file -----------------------------------------------------------------------------------------------------
*/