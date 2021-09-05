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
		- Issue ♯52 : when saving the travel to the file, save also the edited route.
		- Issue ♯61 : Disable right context menu when readonly travel.
	- v1.6.0:
		- Issue ♯65 : Time to go to ES6 modules?
	- v1.7.0:
		- Issue ♯90 : Open profiles are not closed when opening a travel or when starting a new travel
	- v1.12.0:
		- Issue ♯120 : Review the UserInterface
	-v2.2.0:
		- Issue ♯129 : Add an indicator when the travel is modified and not saved
	-v2.3.0:
		- Issue ♯171 : Add a warning when opening a file with invalid version
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests 20210903
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

@module core
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theTranslator from '../UILib/Translator.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import theErrorsUI from '../errorsUI/ErrorsUI.js';
import theMouseUI from '../mouseUI/MouseUI.js';
import theMapLayersToolbarUI from '../mapLayersToolbarUI/MapLayersToolbarUI.js';
import theRouteEditor from '../core/RouteEditor.js';
import FileCompactor from '../coreLib/FileCompactor.js';
import theEventDispatcher from '../coreLib/EventDispatcher.js';
import theProfileWindowsManager from '../core/ProfileWindowsManager.js';
import Zoomer from '../core/Zoomer.js';

import { INVALID_OBJ_ID, ROUTE_EDITION_STATUS, SAVE_STATUS } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class FileLoader
@classdesc This class load a file from the computer disk and display the travel
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class FileLoader {

	/**
	Display the travel and fires event for updating the map and the UI
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
	*/

	#display ( ) {

		// the map is cleaned
		theEventDispatcher.dispatch ( 'removeallobjects' );

		document.title =
			'Travel & Notes' +
			( '' === theTravelNotesData.travel.name ? '' : ' - ' + theTravelNotesData.travel.name );
		let routesIterator = theTravelNotesData.travel.routes.iterator;
		while ( ! routesIterator.done ) {
			if ( ROUTE_EDITION_STATUS.notEdited === routesIterator.value.editionStatus ) {
				theEventDispatcher.dispatch (
					'routeupdated',
					{
						removedRouteObjId : INVALID_OBJ_ID,
						addedRouteObjId : routesIterator.value.objId
					}
				);
			}
		}
		if ( INVALID_OBJ_ID !== theTravelNotesData.editedRouteObjId ) {
			theEventDispatcher.dispatch (
				'routeupdated',
				{
					removedRouteObjId : INVALID_OBJ_ID,
					addedRouteObjId : theTravelNotesData.travel.editedRoute.objId
				}
			);
		}
		let notesIterator = theTravelNotesData.travel.notes.iterator;
		while ( ! notesIterator.done ) {
			theEventDispatcher.dispatch (
				'noteupdated',
				{
					removedNoteObjId : INVALID_OBJ_ID,
					addedNoteObjId : notesIterator.value.objId
				}
			);
		}
		new Zoomer ( ).zoomToTravel ( );

		theMapLayersToolbarUI.setMapLayer ( theTravelNotesData.travel.layerName );

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
	Open a file, set or merge it's content in theTravelNotesData and then display the file
	@param {event} changeEvent the changeEvent that have started the process
	@param {boolean} mustMerge the method merge the content when true
	@private
	*/

	#openFile ( fileContent, mustMerge ) {
		try {
			if ( mustMerge ) {
				new FileCompactor ( ).decompressMerge ( fileContent );
			}
			else {
				theProfileWindowsManager.deleteAllProfiles ( );
				new FileCompactor ( ).decompress ( fileContent );
			}
			this.#display ( );
			if ( ! mustMerge ) {
				theMouseUI.saveStatus = SAVE_STATUS.saved;
			}
		}
		catch ( err ) {
			theErrorsUI.showError ( 'An error occurs when reading the file : ' + err.message );
		}
	}

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

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

	openLocalFile ( fileContent ) { this.#openFile ( fileContent, false ); }

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

	mergeLocalFile ( fileContent ) { this.#openFile ( fileContent, true ); }
}

export default FileLoader;

/*
--- End of FileLoader.js file -------------------------------------------------------------------------------------------------
*/