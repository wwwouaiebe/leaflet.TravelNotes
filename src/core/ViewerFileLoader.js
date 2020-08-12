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

@file ViewerFileLoader.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module ViewerFileLoader
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theTravelNotesData } from '../data/TravelNotesData.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';
import { newFileCompactor } from '../core/FileCompactor.js';
import { newZoomer } from '../core/Zoomer.js';
import { ROUTE_EDITION_STATUS, INVALID_OBJ_ID } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewViewerFileLoader
@desc constructor for ViewerFileLoader objects
@return {ViewerFileLoader} an instance of ViewerFileLoader object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewViewerFileLoader ( ) {

	let myEventDispatcher = newEventDispatcher ( );

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class ViewerFileLoader
	@classdesc This class load a file from a web server and display the travel
	@see {@link newViewerFileLoader} for constructor
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	class ViewerFileLoader {

		/**
		Open a distant file from a web server and display the content of the file
		@param {Object} fileContent
		*/

		openDistantFile ( fileContent ) {
			newFileCompactor ( ).decompress ( fileContent );
			theTravelNotesData.travel.readOnly = true;
			this.display ( );
		}

		/**
		Display the current travel on the map
		@fires routeupdated
		@fires noteupdated
		@fires zoomto
		*/

		display ( ) {
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
			if ( INVALID_OBJ_ID !== theTravelNotesData.editedRouteObjId ) {
				myEventDispatcher.dispatch (
					'routeupdated',
					{
						removedRouteObjId : INVALID_OBJ_ID,
						addedRouteObjId : theTravelNotesData.travel.editedRoute.objId
					}
				);
			}
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
		}
	}

	return Object.seal ( new ViewerFileLoader );
}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newViewerFileLoader
	@desc constructor for ViewerFileLoader objects
	@return {ViewerFileLoader} an instance of ViewerFileLoader object
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourNewViewerFileLoader as newViewerFileLoader
};

/*
--- End of ViewerFileLoader.js file -------------------------------------------------------------------------------------------
*/