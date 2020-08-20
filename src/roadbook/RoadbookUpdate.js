/*
Copyright - 2019 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- RoadbookUpdate.js file --------------------------------------------------------------------------------------------
This file contains:
	- the newRoadbookUpdate function
Changes:
	- v1.6.0:
		- created
Doc reviewed 20191125
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theHTMLViewsFactory } from '../UI/HTMLViewsFactory.js';
import { newUtilities } from '../util/Utilities.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theIndexedDb } from '../roadbook/IndexedDB.js';

/*
--- newRoadbookUpdate function ----------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newRoadbookUpdate ( ) {

	if ( newUtilities ( ).storageAvailable ( 'localStorage' ) ) {
		theIndexedDb.getOpenPromise ( )
			.then ( ( ) => {
				theIndexedDb.getWritePromise (
					theTravelNotesData.UUID,
					theHTMLViewsFactory.getTravelHTML ( 'TravelNotes-Roadbook-' ).outerHTML
				);
			} )
			.then ( ( ) => localStorage.setItem ( theTravelNotesData.UUID, Date.now ( ) ) )
			.catch ( err => console.log ( err ? err : 'An error occurs when writing the content' ) );
	}
}

export { newRoadbookUpdate };

/*
--- End of RoadbookUpdate.js file -------------------------------------------------------------------------------------
*/