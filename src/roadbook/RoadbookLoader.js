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
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210828
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file RoadbookLoader.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module RoadbookLoader
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theTranslator from '../UI/Translator.js';
import theIndexedDb from '../roadbook/IndexedDb.js';
import theRoadbookUpdater from '../roadbook/RoadbookUpdater.js';
import { ZERO, ONE, HTTP_STATUS_OK } from '../util/Constants.js';

/**
@--------------------------------------------------------------------------------------------------------------------------

@class ShowTravelNotesChangeEventListener
@classdesc change event listener for the show travel notes checkbox
@hideconstructor
@private

@--------------------------------------------------------------------------------------------------------------------------
*/

class ShowTravelNotesChangeEventListener {

	handleEvent ( changeEvent ) {
		changeEvent.stopPropagation ( );
		theRoadbookUpdater.showTravelNotes = changeEvent.target.checked;
		theRoadbookUpdater.toggleTravelNotes ( );
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class ShowRouteNotesChangeEventListener
@classdesc change event listener for the show route notes checkbox
@hideconstructor
@private

@--------------------------------------------------------------------------------------------------------------------------
*/

class ShowRouteNotesChangeEventListener {

	handleEvent ( changeEvent ) {
		changeEvent.stopPropagation ( );
		theRoadbookUpdater.showRouteNotes = changeEvent.target.checked;
		theRoadbookUpdater.toggleRouteNotes ( );
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class ShowManeuverNotesChangeEventListener
@classdesc change event listener for the show maneuver notes checkbox
@hideconstructor
@private

@--------------------------------------------------------------------------------------------------------------------------
*/

class ShowManeuverNotesChangeEventListener {

	handleEvent ( changeEvent ) {
		changeEvent.stopPropagation ( );
		theRoadbookUpdater.showManeuversNotes = changeEvent.target.checked;
		theRoadbookUpdater.toggleManeuversNotes ( );
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class StorageEventListener
@classdesc storage event listener
@hideconstructor
@private

@--------------------------------------------------------------------------------------------------------------------------
*/

class StorageEventListener {
	#UUID = null;

	constructor ( UUID ) {
		this.#UUID = UUID;
	}

	handleEvent ( ) {
		theIndexedDb.getReadPromise ( this.#UUID )
			.then (
				pageContent => {
					if ( pageContent ) {
						theRoadbookUpdater.updateRoadbook ( pageContent );
					}
					else {
						theRoadbookUpdater.updateRoadbook ( '' );
					}
				}
			)
			.catch (
				err => {
					if ( err instanceof Error ) {
						console.error ( err );
					}
				}
			);
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class SaveButtonClickEventListener
@classdesc click event listener for the save button
@hideconstructor
@private

@--------------------------------------------------------------------------------------------------------------------------
*/

class SaveButtonClickEventListener {

	handleEvent ( ) {
		try {
			let fileName = document.querySelector ( '.TravelNotes-Roadbook-Travel-Header-Name' ).textContent + '-Roadbook.html';
			let menu = document.getElementById ( 'TravelNotes-Roadbook-Menu' );
			let saveDiv = menu.removeChild ( document.getElementById ( 'TravelNotes-SaveDiv' ) );

			let mapFile = window.URL.createObjectURL (
				new File (
					[ '<!DOCTYPE html>', document.documentElement.outerHTML ],
					fileName,
					{ type : 'text/plain' }
				)
			);
			let anchorElement = document.createElement ( 'a' );
			anchorElement.setAttribute ( 'href', mapFile );
			anchorElement.setAttribute ( 'download', fileName );
			anchorElement.style.display = 'none';
			anchorElement.click ( );
			window.URL.revokeObjectURL ( mapFile );
			menu.appendChild ( saveDiv );
		}
		catch ( err ) {
			if ( err instanceof Error ) {
				console.error ( err );
			}
		}
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class RoadbookLoader
@classdesc This class load the roadbook,
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class RoadbookLoader {

	/**
	UUID of the page
	@private
	*/

	#UUID = null;

	/**
	The user language
	@private
	*/

	#language = 'fr';

	/**
	A reference to the save button
	@private
	*/

	#saveButton = null;

	/**
	checkboxes init
	@private
	*/

	#initCheckboxes ( ) {
		document.getElementById ( 'TravelNotes-Travel-ShowNotes' ).checked = theRoadbookUpdater.showTravelNotes;
		document.getElementById ( 'TravelNotes-Routes-ShowNotes' ).checked = theRoadbookUpdater.showRouteNotes;
		document.getElementById ( 'TravelNotes-Routes-ShowManeuvers' ).checked = theRoadbookUpdater.showManeuversNotes;
	}

	/**
	Adding event listeners
	@private
	*/

	#addEventListeners ( ) {
		document.getElementById ( 'TravelNotes-Travel-ShowNotes' )
			.addEventListener ( 'change', new ShowTravelNotesChangeEventListener ( ) );
		document.getElementById ( 'TravelNotes-Routes-ShowNotes' )
			.addEventListener ( 'change', new ShowRouteNotesChangeEventListener ( ) );
		document.getElementById ( 'TravelNotes-Routes-ShowManeuvers' )
			.addEventListener ( 'change', new ShowManeuverNotesChangeEventListener ( ) );
	}

	/**
	Adding save button
	@private
	*/

	#addSaveButton ( ) {
		this.#saveButton = document.createElement ( 'button' );
		this.#saveButton.id = 'TravelNotes-SaveButton';
		this.#saveButton.addEventListener ( 'click', new SaveButtonClickEventListener ( ) );
		let saveDiv = document.createElement ( 'div' );
		saveDiv.id = 'TravelNotes-SaveDiv';
		saveDiv.appendChild ( this.#saveButton );
		document.getElementById ( 'TravelNotes-Roadbook-Menu' ).appendChild ( saveDiv );
	}

	/**
	Opening the indexed db
	@private
	*/

	#openIndexedDb ( ) {
		theIndexedDb.getOpenPromise ( )
			.then ( ( ) => theIndexedDb.getReadPromise ( this.#UUID ) )
			.then ( pageContent => theRoadbookUpdater.updateRoadbook ( pageContent ) )
			.catch (
				err => {
					if ( err instanceof Error ) {
						console.error ( err );
					}
				}
			);
		window.addEventListener ( 'storage', new StorageEventListener ( this.#UUID ) );
		window.addEventListener ( 'unload', ( ) => theIndexedDb.closeDb ( )	);
	}

	/**
	Loading translations from server
	@private
	*/

	#loadTranslations ( ) {
		fetch (
			window.location.href.substr ( ZERO, window.location.href.lastIndexOf ( '/' ) + ONE ) +
			'TravelNotes' +
			this.#language.toUpperCase ( ) +
			'.json'
		)
			.then (
				response => {
					if ( HTTP_STATUS_OK === response.status && response.ok ) {
						response.json ( )
							.then ( translations => theTranslator.setTranslations ( translations ) )
							.then ( ( ) => this.#translatePage ( ) )
							.catch (
								err => {
									if ( err instanceof Error ) {
										console.error ( err );
									}
								}
							);
					}
				}
			);
	}

	/**
	Translating the page
	@private
	*/

	#translatePage ( ) {
		document.getElementById ( 'TravelNotes-Travel-ShowNotesLabel' ).textContent =
		theTranslator.getText ( 'Roadbook - show travel notes' );
		document.getElementById ( 'TravelNotes-Routes-ShowManeuversLabel' ).textContent =
		theTranslator.getText ( 'Roadbook - show maneuver' );
		document.getElementById ( 'TravelNotes-Routes-ShowNotesLabel' ).textContent =
		theTranslator.getText ( 'Roadbook - show routes notes' );
		if ( this.#saveButton ) {
			this.#saveButton.textContent = theTranslator.getText ( 'Roadbook - Save' );
		}
	}

	constructor ( ) {
		let params = new URLSearchParams ( document.location.search.substring ( ONE ) );
		this.#UUID = params.get ( 'page' );
		this.#language = params.get ( 'lng' ) || 'fr';
	}

	/**
	Loading the roadbook
	*/

	loadRoadbook ( ) {
		this.#initCheckboxes ( );
		this.#addEventListeners ( );
		if ( this.#UUID ) {
			this.#addSaveButton ( );
			this.#openIndexedDb ( );
			this.#loadTranslations ( );
		}
		else {
			theRoadbookUpdater.updateIcons ( );
		}
		theRoadbookUpdater.toggleNotes ( );
	}
}

export default RoadbookLoader;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of RoadbookLoader.js file

@------------------------------------------------------------------------------------------------------------------------------
*/