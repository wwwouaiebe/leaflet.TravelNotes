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
/*
--- FileCompactor.js file ---------------------------------------------------------------------------------------------
This file contains:
	- the newFileCompactor function
Changes:
	- v1.6.0:
		- created
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { polyline } from '../polyline/Polyline.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { newTravel } from '../data/Travel.js';

import { THE_CONST } from '../util/Constants.js';

/*
--- newFileCompactor function -----------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/

function newFileCompactor ( ) {

	/*
	--- myCompressRoute function --------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCompressRoute ( route ) {
		let objType = {};
		if ( THE_CONST.zero !== route.itinerary.itineraryPoints.length ) {
			objType = route.itinerary.itineraryPoints [ THE_CONST.zero ].objType;
		}
		let compressedItineraryPoints = { latLngs : [], distances : [], objIds : [], objType : objType };
		route.itinerary.itineraryPoints.forEach (
			itineraryPoint => {
				compressedItineraryPoints.latLngs.push ( [ itineraryPoint.lat, itineraryPoint.lng ] );
				compressedItineraryPoints.distances.push ( itineraryPoint.distance );
				compressedItineraryPoints.objIds.push ( itineraryPoint.objId );
			}
		);
		compressedItineraryPoints.latLngs =
			polyline.encode ( compressedItineraryPoints.latLngs, THE_CONST.polylinePrecision );
		route.itinerary.itineraryPoints = compressedItineraryPoints;
	}

	/*
	--- myCompress function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCompress ( ) {
		let compressedTravel = theTravelNotesData.travel.object;
		compressedTravel.routes.forEach ( myCompressRoute );
		myCompressRoute ( compressedTravel.editedRoute );

		return compressedTravel;
	}

	/*
	--- myDecompressRoute function ------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myDecompressRoute ( route ) {
		route.itinerary.itineraryPoints.latLngs =
			polyline.decode ( route.itinerary.itineraryPoints.latLngs, THE_CONST.polylinePrecision );
		let decompressedItineraryPoints = [];
		let latLngsCounter = THE_CONST.zero;
		route.itinerary.itineraryPoints.latLngs.forEach (
			latLng => {
				let itineraryPoint = {};
				itineraryPoint.lat = latLng [ THE_CONST.zero ];
				itineraryPoint.lng = latLng [ THE_CONST.number1 ];
				itineraryPoint.distance = route.itinerary.itineraryPoints.distances [ latLngsCounter ];
				itineraryPoint.objId = route.itinerary.itineraryPoints.objIds [ latLngsCounter ];
				itineraryPoint.objType = route.itinerary.itineraryPoints.objType;
				decompressedItineraryPoints.push ( itineraryPoint );
				latLngsCounter ++;
			}
		);
		route.itinerary.itineraryPoints = decompressedItineraryPoints;
	}

	/*
	--- myDecompressFileContent function ------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myDecompressTravel ( compressedTravel ) {

		let decompressedTravel = compressedTravel;

		decompressedTravel.routes.forEach ( myDecompressRoute );
		if ( decompressedTravel.editedRoute ) {

			// don't remove the if statment... files created with version < 1.5.0 don't have editedRoute...
			myDecompressRoute ( decompressedTravel.editedRoute );
		}

		return decompressedTravel;
	}

	/*
	--- myDecompress function -----------------------------------------------------------------------------------------

	This function decompress the file data

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myDecompress ( compressedTravel ) {

		theTravelNotesData.travel.object = myDecompressTravel ( compressedTravel );

		theTravelNotesData.editedRouteObjId = THE_CONST.invalidObjId;

		theTravelNotesData.travel.routes.forEach (
			route => {
				if ( THE_CONST.route.edited.notEdited !== route.edited ) {
					theTravelNotesData.editedRouteObjId = route.objId;
				}
			}
		);
	}

	/*
	--- myDecompressMerge function ------------------------------------------------------------------------------------

	This function decompress the file data

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myDecompressMerge ( compressedTravel ) {

		let travel = newTravel ( );
		travel.object = myDecompressTravel ( compressedTravel );

		// routes are added with their notes
		let routesIterator = travel.routes.iterator;
		while ( ! routesIterator.done ) {
			theTravelNotesData.travel.routes.add ( routesIterator.value );
		}

		// travel notes are added
		let notesIterator = travel.notes.iterator;
		while ( ! notesIterator.done ) {
			theTravelNotesData.travel.notes.add ( notesIterator.value );
		}
	}

	/*
	--- FileCompactor object ------------------------------------------------------------------------------------------

	This function decompress the file data

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			decompress : compressedTravel => myDecompress ( compressedTravel ),
			decompressMerge : compressedTravel => myDecompressMerge ( compressedTravel ),
			compress : ( ) => myCompress ( )
		}
	);
}

export { newFileCompactor };

/*
--- End of FileCompactor.js file --------------------------------------------------------------------------------------
*/