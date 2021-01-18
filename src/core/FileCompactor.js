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
	- v1.7.0:
		- issue #89 : Add elevation graph
Doc reviewed 20200801
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file FileCompactor.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module FileCompactor
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { thePolylineEncoder } from '../util/PolylineEncoder.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { newTravel } from '../data/Travel.js';
import { ROUTE_EDITION_STATUS, ELEV, ZERO, ONE, INVALID_OBJ_ID, LAT_LNG } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewFileCompactor
@desc constructor for FileCompactor objects
@return {FileCompactor} an instance of FileCompactor object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewFileCompactor ( ) {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCompressRoute
	@desc Compress a route
	@param {Object} routeObject the route to compress. routeObject is not a Route instance!
	It's an Object created with Route.jsonObject ( ).
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCompressRoute ( routeObject ) {
		let objType = {};
		if ( ZERO !== routeObject.itinerary.itineraryPoints.length ) {
			objType = routeObject.itinerary.itineraryPoints [ ZERO ].objType;
		}
		let compressedItineraryPoints = { latLngs : [], distances : [], elevs : [], objIds : [], objType : objType };
		routeObject.itinerary.itineraryPoints.forEach (
			itineraryPoint => {
				compressedItineraryPoints.latLngs.push ( [ itineraryPoint.lat, itineraryPoint.lng ] );
				compressedItineraryPoints.distances.push ( itineraryPoint.distance );
				compressedItineraryPoints.elevs.push ( itineraryPoint.elev );
				compressedItineraryPoints.objIds.push ( itineraryPoint.objId );
			}
		);
		compressedItineraryPoints.latLngs =
			thePolylineEncoder.encode ( compressedItineraryPoints.latLngs, LAT_LNG.fixed );
		routeObject.itinerary.itineraryPoints = compressedItineraryPoints;

		// routeObject.itinerary.maneuvers = [];
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myDecompressRoute
	@desc Decompress a route
	@param {Object} routeObject the compressed route. routeObject is not a Route instance!
	It's an Object created with JSON.parse ( ).
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myDecompressRoute ( routeObject ) {
		routeObject.itinerary.itineraryPoints.latLngs =
			thePolylineEncoder.decode ( routeObject.itinerary.itineraryPoints.latLngs, [ LAT_LNG.fixed, LAT_LNG.fixed ] );
		let decompressedItineraryPoints = [];
		let latLngsCounter = ZERO;
		routeObject.itinerary.itineraryPoints.latLngs.forEach (
			latLng => {
				let itineraryPoint = {};
				itineraryPoint.lat = latLng [ ZERO ];
				itineraryPoint.lng = latLng [ ONE ];
				itineraryPoint.distance = routeObject.itinerary.itineraryPoints.distances [ latLngsCounter ];
				if ( routeObject.itinerary.itineraryPoints.elevs ) {
					itineraryPoint.elev = routeObject.itinerary.itineraryPoints.elevs [ latLngsCounter ];
				}
				else {
					itineraryPoint.elev = ELEV.defaultValue;
				}
				itineraryPoint.objId = routeObject.itinerary.itineraryPoints.objIds [ latLngsCounter ];
				itineraryPoint.objType = routeObject.itinerary.itineraryPoints.objType;
				decompressedItineraryPoints.push ( itineraryPoint );
				latLngsCounter ++;
			}
		);
		routeObject.itinerary.itineraryPoints = decompressedItineraryPoints;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myDecompressTravel
	@desc Decompress a travel
	@param {Object} travelObject the compressed travel. travelObject is not a Travel instance!
	It's an Object created with JSON.parse ( ).
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myDecompressTravel ( travelObject ) {
		travelObject.routes.forEach ( myDecompressRoute );
		if ( travelObject.editedRoute ) {

			// don't remove the if statment... files created with version < 1.5.0 don't have editedRoute...
			myDecompressRoute ( travelObject.editedRoute );
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class FileCompactor
	@classdesc This class compress the travel to reduce the size of the file when saved to a file or decompress the
	travel when reading from a file. Each route of a compressed file have the ItineraryPoints in only one object
	and the lat and lng of	the ItineraryPoints are encoded with the polyline.encode algorithm
	@see {@link newFileCompactor} for constructor
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	class FileCompactor {

		/**
		Decompress a file
		@param {Object} travelObject the compressed travel as read from the file. travelObject is not a Travel instance!
		It's an Object created with JSON.parse ( ).
		*/

		decompress ( travelObject ) {
			myDecompressTravel ( travelObject );
			theTravelNotesData.travel.jsonObject = travelObject;

			theTravelNotesData.editedRouteObjId = INVALID_OBJ_ID;

			theTravelNotesData.travel.routes.forEach (
				route => {
					if ( ROUTE_EDITION_STATUS.notEdited !== route.editionStatus ) {
						theTravelNotesData.editedRouteObjId = route.objId;
					}
				}
			);
		}

		/**
		Decompress a file and merge this travel with the currently edited travel
		@param {Object} travelObject the compressed travel as read from the file. travelObject is not a Travel instance!
		It's an Object created with JSON.parse ( ).
		*/

		decompressMerge ( travelObject ) {
			myDecompressTravel ( travelObject );
			let mergedTravel = newTravel ( );
			mergedTravel.jsonObject = travelObject;

			// routes are added with their notes
			let routesIterator = mergedTravel.routes.iterator;
			while ( ! routesIterator.done ) {
				theTravelNotesData.travel.routes.add ( routesIterator.value );
			}

			// travel notes are added
			let notesIterator = mergedTravel.notes.iterator;
			while ( ! notesIterator.done ) {
				theTravelNotesData.travel.notes.add ( notesIterator.value );
			}
		}

		/**
		Compress the currently edited travel
		@return a copy of the currently edited travel compressed and ready to be written in a file
		*/

		compress ( ) {
			let compressedTravelObject = theTravelNotesData.travel.jsonObject;
			compressedTravelObject.routes.forEach ( myCompressRoute );
			myCompressRoute ( compressedTravelObject.editedRoute );

			return compressedTravelObject;
		}
	}

	return Object.seal ( new FileCompactor );
}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newFileCompactor
	@desc constructor for FileCompactor objects
	@return {FileCompactor} an instance of FileCompactor object
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourNewFileCompactor as newFileCompactor
};

/*
--- End of FileCompactor.js file ----------------------------------------------------------------------------------------------
*/