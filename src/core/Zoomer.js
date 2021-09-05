/*
Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/

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
		- Issue ♯120 : Review the UserInterface
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests 20210902
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file Zoomer.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module core
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theEventDispatcher from '../coreLib/EventDispatcher.js';
import theDataSearchEngine from '../data/DataSearchEngine.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import { INVALID_OBJ_ID } from '../main/Constants.js';

/**
@--------------------------------------------------------------------------------------------------------------------------

@class Zoomer
@classdesc This class implements a zoom command on multiple objects
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class Zoomer {

	#geometry = [];

	/**
	This method push the latitude and longitude of a note in the #geometry array
	@param {Note} note the note to push
	*/

	#pushNoteGeometry ( note ) {
		this.#geometry.push ( note.latLng );
		this.#geometry.push ( note.iconLatLng );
	}

	/**
	This method push the latitude and longitude of a route in the #geometry array
	@param {Route} route the route to push
	@private
	*/

	#pushRouteGeometry ( route ) {
		route.itinerary.itineraryPoints.forEach ( itineraryPoint => this.#geometry.push ( itineraryPoint.latLng ) );
		route.notes.forEach (
			note => this.#pushNoteGeometry ( note )
		);
	}

	/*
	constructor
	*/

	constructor ( ) {
		Object.seal ( this );
	}

	/**
	Performs a zoom on a point
	@param {Array.<number>} latLng The latitude and longitude of the point
	@fires zoomto
	*/

	zoomToLatLng ( latLng ) {
		theEventDispatcher.dispatch ( 'zoomto', { latLng : latLng } );
	}

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
		this.#geometry = [];
		this.#pushNoteGeometry ( theDataSearchEngine.getNoteAndRoute ( noteObjId ).note );
		theEventDispatcher.dispatch (
			'zoomto',
			{
				geometry : [ this.#geometry ]
			}
		);
	}

	/**
	Performs a zoom on a route
	@param {!number} routeObjId the objId of the route on witch the zoom must be performed
	@fires zoomto
	*/

	zoomToRoute ( routeObjId ) {
		this.#geometry = [];

		this.#pushRouteGeometry ( theDataSearchEngine.getRoute ( routeObjId ) );

		theEventDispatcher.dispatch (
			'zoomto',
			{
				geometry : [ this.#geometry ]
			}
		);
	}

	/**
	Performs a zoom on a complete travel
	@fires zoomto
	*/

	zoomToTravel ( ) {
		this.#geometry = [];
		theTravelNotesData.travel.routes.forEach (
			route => this.#pushRouteGeometry ( route )
		);
		if ( INVALID_OBJ_ID !== theTravelNotesData.travel.editedRouteObjId ) {
			this.#pushRouteGeometry ( theTravelNotesData.travel.editedRoute );
		}
		theTravelNotesData.travel.notes.forEach (
			note => this.#pushNoteGeometry ( note )
		);
		theEventDispatcher.dispatch (
			'zoomto',
			{
				geometry : [ this.#geometry ]
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

export default Zoomer;

/*
--- End of Zoomer.js file -----------------------------------------------------------------------------------------------------
*/