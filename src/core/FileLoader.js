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
	- v1.4.0:
		- created from TravelEditor
	- v1.5.0:
		- Issue #52 : when saving the travel to the file, save also the edited route.
		- Issue #61 : Disable right context menu when readonly travel.
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
	- v1.7.0:
		- Issue #90 : Open profiles are not closed when opening a travel or when starting a new travel
	- v1.12.0:
		- Issue #120 : Review the UserInterface
	-v2.2.0:
		- Issue #129 : Add an indicator when the travel is modified and not saved
Doc reviewed 20200801
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file FileLoader.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module FileLoader
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theErrorsUI } from '../UI/ErrorsUI.js';
import { theMouseUI } from '../UI/MouseUI.js';
import { theLayersToolbarUI } from '../UI/LayersToolbarUI.js';
import { theRouteEditor } from '../core/RouteEditor.js';
import { newViewerFileLoader } from '../core/ViewerFileLoader.js';
import { newFileCompactor } from '../core/FileCompactor.js';
import { theEventDispatcher } from '../util/EventDispatcher.js';
import { theProfileWindowsManager } from '../core/ProfileWindowsManager.js';
import { ZERO, INVALID_OBJ_ID, SAVE_STATUS } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewFileLoader
@desc constructor for FileLoader objects
@return {FileLoader} an instance of FileLoader object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewFileLoader ( ) {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myDisplay
	@desc display the travel and fires event for updating the map and the UI
	@fires removeallobjects
	@fires routeupdated
	@fires noteupdated
	@fires travelnameupdated
	@fires layerchange
	@fires setrouteslist
	@fires setprovider
	@fires settransitmode
	@fires showitinerary
	@fires roadbookupdate
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myDisplay ( ) {

		// the map is cleaned
		theEventDispatcher.dispatch ( 'removeallobjects' );

		newViewerFileLoader ( ).display ( );

		theLayersToolbarUI.setLayer ( theTravelNotesData.travel.layerName );

		// Editors and HTML pages are filled
		theEventDispatcher.dispatch ( 'setrouteslist' );
		if ( INVALID_OBJ_ID !== theTravelNotesData.editedRouteObjId ) {
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
				theEventDispatcher.dispatch ( 'setprovider', { provider : providerName } );

				if ( transitMode && '' !== transitMode ) {
					theEventDispatcher.dispatch ( 'settransitmode', { transitMode : transitMode } );
				}
			}
		}
		theRouteEditor.chainRoutes ( );

		theEventDispatcher.dispatch ( 'travelnameupdated' );
		theEventDispatcher.dispatch ( 'showitinerary' );
		theEventDispatcher.dispatch ( 'roadbookupdate' );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOpenFile
	@desc open a file, set or merge it's content in theTravelNotesData and then display the file
	@param {event} changeEvent the changeEvent that have started the process
	@param {boolean} mustMerge the function merge the content when true
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOpenFile ( changeEvent, mustMerge ) {
		let fileReader = new FileReader ( );
		fileReader.onload = function ( ) {
			let fileContent = {};
			try {
				fileContent = JSON.parse ( fileReader.result );
			}
			catch ( err ) {
				if ( err instanceof Error ) {
					console.error ( err );
				}
				return;
			}
			if ( mustMerge ) {
				newFileCompactor ( ).decompressMerge ( fileContent );
			}
			else {
				theProfileWindowsManager.deleteAllProfiles ( );
				newFileCompactor ( ).decompress ( fileContent );
			}

			myDisplay ( );
			if ( ! mustMerge ) {
				theMouseUI.saveStatus = SAVE_STATUS.saved;
			}

		};
		fileReader.readAsText ( changeEvent.target.files [ ZERO ] );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class FileLoader
	@classdesc This class load a file from the computer disk and display the travel
	@see {@link newFileLoader} for constructor
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	class FileLoader {

		/**
		Open a local file and display the content of the file
		@param {event} changeEvent the changeEvent that have started the process
		@fires removeallobjects
		@fires routeupdated
		@fires noteupdated
		@fires travelnameupdated
		@fires layerchange
		@fires setrouteslist
		@fires setprovider
		@fires settransitmode
		@fires showitinerary
		@fires roadbookupdate
		*/

		openLocalFile ( changeEvent ) { myOpenFile ( changeEvent, false ); }

		/**
		Open a local file and merge the content of the file with the current travel
		@param {event} changeEvent the changeEvent that have started the process
		@fires removeallobjects
		@fires routeupdated
		@fires noteupdated
		@fires travelnameupdated
		@fires layerchange
		@fires setrouteslist
		@fires setprovider
		@fires settransitmode
		@fires showitinerary
		@fires roadbookupdate
		*/

		mergeLocalFile ( changeEvent ) { myOpenFile ( changeEvent, true ); }
	}

	return Object.seal ( new FileLoader	);
}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newFileLoader
	@desc constructor for FileLoader objects
	@return {FileLoader} an instance of FileLoader object
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourNewFileLoader as newFileLoader
};

/*
--- End of FileLoader.js file -------------------------------------------------------------------------------------------------
*/