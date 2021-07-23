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
	-v2.2.0:
		- Issue ♯129 : Add an indicator when the travel is modified and not saved
Doc reviewed 20200825
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file RoadbookUpdate.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theHTMLViewsFactory } from '../UI/HTMLViewsFactory.js';
import theUtilities from '../util/Utilities.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import { theIndexedDb } from '../roadbook/IndexedDb.js';
import { theMouseUI } from '../UI/MouseUI.js';
import { SAVE_STATUS } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function newRoadbookUpdate
@desc This function update the indexedDb with the roadbook content and then update the localStorage.
The localStorage send and event to the TravelNotesRoadbook.html page (see roadbook.js) and this page
read the new roadbbok content in the indexedDb and update
@public

@------------------------------------------------------------------------------------------------------------------------------
*/

function newRoadbookUpdate ( ) {

	theMouseUI.saveStatus = SAVE_STATUS.modified;

	if ( theUtilities.storageAvailable ( 'localStorage' ) ) {
		theIndexedDb.getOpenPromise ( )
			.then ( ( ) => {
				theIndexedDb.getWritePromise (
					theTravelNotesData.UUID,
					theHTMLViewsFactory.getTravelHTML ( 'TravelNotes-Roadbook-' ).outerHTML
				);
			} )
			.then ( ( ) => localStorage.setItem ( theTravelNotesData.UUID, Date.now ( ) ) )
			.catch ( err => {
				if ( err instanceof Error ) {
					console.error ( err );
				}
			}
			);
	}
}

export { newRoadbookUpdate };

/*
--- End of RoadbookUpdate.js file ---------------------------------------------------------------------------------------------
*/