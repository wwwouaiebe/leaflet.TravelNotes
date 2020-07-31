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
--- ViewerFileLoader.js file ------------------------------------------------------------------------------------------
This file contains:
	- the newViewerFileLoader function
Changes:
	- v1.6.0:
		- created
	- v1.12.0:
		- Issue #120 : Review the UserInterface
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theTravelNotesData } from '../data/TravelNotesData.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';
import { newFileCompactor } from '../core/FileCompactor.js';
import { newZoomer } from '../core/Zoomer.js';

import { ROUTE_EDITION_STATUS, INVALID_OBJ_ID } from '../util/Constants.js';

/*
--- newViewerFileLoader function --------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/

function newViewerFileLoader ( ) {

	let myEventDispatcher = newEventDispatcher ( );

	/*
	--- myDisplay function --------------------------------------------------------------------------------------------

	This function update the screen

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myDisplay ( ) {

		// routes are added with their notes
		let routesIterator = theTravelNotesData.travel.routes.iterator;
		while ( ! routesIterator.done ) {
			if ( ROUTE_EDITION_STATUS.notEdited === routesIterator.value.editionStatus ) {
				myEventDispatcher.dispatch (
					'routeupdated',
					{
						removedRouteObjId : INVALID_OBJ_ID,
						addedRouteObjId : routesIterator.value.objId
					}
				);
			}
		}

		// edited route is added with notes and , depending of read only, waypoints
		if ( INVALID_OBJ_ID !== theTravelNotesData.editedRouteObjId ) {
			myEventDispatcher.dispatch (
				'routeupdated',
				{
					removedRouteObjId : INVALID_OBJ_ID,
					addedRouteObjId : theTravelNotesData.travel.editedRoute.objId
				}
			);
		}

		// travel notes are added
		let notesIterator = theTravelNotesData.travel.notes.iterator;
		while ( ! notesIterator.done ) {
			myEventDispatcher.dispatch (
				'noteupdated',
				{
					removedNoteObjId : INVALID_OBJ_ID,
					addedNoteObjId : notesIterator.value.objId
				}
			);
		}

		newZoomer ( ).zoomToTravel ( );

		myEventDispatcher.dispatch ( 'travelnotesfileloaded' );
	}

	/*
	--- myOpenDistantFile function ------------------------------------------------------------------------------------

	This function open a local file

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOpenDistantFile ( fileContent ) {

		newFileCompactor ( ).decompress ( fileContent );
		theTravelNotesData.travel.readOnly = true;
		myDisplay ( );
	}

	/*
	--- ViewerFileLoader object ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			openDistantFile : fileContent => myOpenDistantFile ( fileContent ),
			display : ( ) => myDisplay ( )
		}
	);
}

export { newViewerFileLoader };

/*
--- End of ViewerFileLoader.js file -----------------------------------------------------------------------------------
*/