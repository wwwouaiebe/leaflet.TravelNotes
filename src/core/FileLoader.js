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
--- FileLoader.js file ------------------------------------------------------------------------------------------------
This file contains:
	- the newFileLoader function
Changes:
	- v1.4.0:
		- created from TravelEditor
	- v1.5.0:
		- Issue #52 : when saving the travel to the file, save also the edited route.
		- Issue #61 : Disable right context menu when readonly travel.
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed 20191122
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theErrorsUI } from '../UI/ErrorsUI.js';
import { theLayersToolbarUI } from '../UI/LayersToolbarUI.js';
import { theRouteEditor } from '../core/RouteEditor.js';
import { newViewerFileLoader } from '../core/ViewerFileLoader.js';
import { newFileCompactor } from '../core/FileCompactor.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';

import { THE_CONST } from '../util/Constants.js';

/*
--- fileLoader function -----------------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/

function newFileLoader ( ) {

	let myEventDispatcher = newEventDispatcher ( );

	/*
	--- myDisplay function --------------------------------------------------------------------------------------------

	This function update the screen

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myDisplay ( ) {

		// the map is cleaned
		myEventDispatcher.dispatch ( 'removeallobjects' );

		newViewerFileLoader ( ).display ( );

		theLayersToolbarUI.setLayer ( theTravelNotesData.travel.layerName );

		// Editors and roadbook are filled

		theRouteEditor.chainRoutes ( );

		// Editors and HTML pages are filled
		myEventDispatcher.dispatch ( 'setrouteslist' );
		if ( THE_CONST.invalidObjId === theTravelNotesData.editedRouteObjId ) {
			myEventDispatcher.dispatch ( 'reducerouteui' );
		}
		else {

			let providerName = theTravelNotesData.travel.editedRoute.itinerary.provider;
			if (
				providerName
				&&
				( '' !== providerName )
				&&
				! theTravelNotesData.providers.get ( providerName.toLowerCase ( ) )
			) {
				theErrorsUI.showError (
					theTranslator.getText (
						'FileLoader - Not possible to select as provider',
						{ provider : providerName }
					)
				);
			}
			else {

				// Provider and transit mode are changed in the itinerary editor
				let transitMode = theTravelNotesData.travel.editedRoute.itinerary.transitMode;
				myEventDispatcher.dispatch ( 'setprovider', { provider : providerName } );

				if ( transitMode && '' !== transitMode ) {
					myEventDispatcher.dispatch ( 'settransitmode', { transitMode : transitMode } );
				}
			}
			theRouteEditor.chainRoutes ( );
			myEventDispatcher.dispatch ( 'expandrouteui' );
		}
		myEventDispatcher.dispatch ( 'setwaypointslist' );
		myEventDispatcher.dispatch ( 'setitinerary' );
		myEventDispatcher.dispatch ( 'roadbookupdate' );
		myEventDispatcher.dispatch ( 'travelnotesfileloaded', { name : theTravelNotesData.travel.name } );

	}

	/*
	--- myOpenFile function -------------------------------------------------------------------------------------------

	This function open a local file

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOpenFile ( changeEvent, mustMerge ) {
		let fileName = changeEvent.target.files [ THE_CONST.zero ].name;

		let fileReader = new FileReader ( );
		fileReader.onload = function ( ) {
			let fileContent = {};
			try {
				fileContent = JSON.parse ( fileReader.result );
			}
			catch ( err ) {
				console.log ( err ? err : 'An error occurs when reading the file' );
			}
			if ( mustMerge ) {
				newFileCompactor ( ).decompressMerge ( fileContent );
			}
			else {
				newFileCompactor ( ).decompress ( fileContent );
				theTravelNotesData.travel.name =
					fileName.substr ( THE_CONST.zero, fileName.lastIndexOf ( '.' ) );
			}

			myDisplay ( );

		};
		fileReader.readAsText ( changeEvent.target.files [ THE_CONST.zero ] );
	}

	/*
	--- FileLoader object ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			openLocalFile : changeEvent => myOpenFile ( changeEvent, false ),
			mergeLocalFile : changeEvent => myOpenFile ( changeEvent, true )
		}
	);
}

export { newFileLoader };

/*
--- End of FileLoader.js file -----------------------------------------------------------------------------------------
*/