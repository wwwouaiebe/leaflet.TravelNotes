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
	- v1.13.0:
		- Issue ♯125 : Outphase osmSearch and add it to TravelNotes
	- v2.0.0:
		- Issue ♯133 : Outphase reading the APIKeys with the url
Doc reviewed 20200823
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file Main.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module Main
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theConfig from '../data/Config.js';
import { theHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { theTravelNotes } from '../main/TravelNotes.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import { theTranslator } from '../UI/Translator.js';
import { theLayersToolbarUI } from '../UI/LayersToolbarUI.js';
import { theErrorsUI } from '../UI/ErrorsUI.js';
import { theNoteDialogToolbar } from '../dialogs/NoteDialogToolbar.js';
import theOsmSearchEngine from '../core/OsmSearchEngine.js';
import { theHTMLSanitizer } from '../util/HTMLSanitizer.js';
import { LAT_LNG, ZERO, ONE, NOT_FOUND, HTTP_STATUS_OK } from '../util/Constants.js';

const OUR_DEMO_PRINT_MAX_TILES = 120;
const OUR_DEMO_MAX_MANEUVERS_NOTES = 10;

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewMain
@desc constructor for Main object
@return {Main} an instance of a Main object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourMain ( ) {

	let myLanguage = null;
	let myTravelUrl = null;
	let myErrorMessage = '';
	let myOriginAndPath = window.location.href.substr ( ZERO, window.location.href.lastIndexOf ( '/' ) + ONE ) + 'TravelNotes';

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myReadURL
	@desc This function read the search part of the url
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myReadURL ( ) {
		let docURL = new URL ( window.location );
		let strTravelUrl = docURL.searchParams.get ( 'fil' );
		if ( strTravelUrl && ZERO !== strTravelUrl.length ) {
			try {
				strTravelUrl = atob ( strTravelUrl );
				if ( strTravelUrl.match ( /[^\w-%:./]/ ) ) {
					throw new Error ( 'invalid char in the url encoded in the fil parameter' );
				}
				let travelURL = new URL ( strTravelUrl );
				if (
					docURL.protocol && travelURL.protocol && docURL.protocol === travelURL.protocol
					&&
					docURL.hostname && travelURL.hostname && docURL.hostname === travelURL.hostname
				) {
					myTravelUrl = encodeURI ( travelURL.href );
				}
				else {
					throw new Error ( 'The distant file is not on the same site than the app' );
				}
			}
			catch ( err ) {
				if ( err instanceof Error ) {
					console.error ( err );
				}
			}
		}
		let urlLng = docURL.searchParams.get ( 'lng' );
		if ( urlLng ) {
			if ( urlLng.match ( /^[A-Z,a-z]{2}$/ ) ) {
				myLanguage = urlLng.toLowerCase ( );
			}
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myLoadConfig
	@desc This function load the content of the TravelNotesConfig.json file into theConfig object
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	async function myLoadConfig ( ) {
		let configResponse = await fetch ( myOriginAndPath + 'Config.json' );

		if ( HTTP_STATUS_OK === configResponse.status && configResponse.ok ) {
			let config = await configResponse.json ( );
			config.travelNotes.language = myLanguage || config.travelNotes.language;
			if ( 'wwwouaiebe.github.io' === window.location.hostname ) {
				config.APIKeysDialog.haveUnsecureButtons = true;
				config.errorsUI.showHelp = true;
				config.layersToolbarUI.theDevil.addButton = false;
				config.note.maxManeuversNotes = OUR_DEMO_MAX_MANEUVERS_NOTES;
				config.note.haveBackground = true;
				config.noteDialog.theDevil.addButton = false;
				config.printRouteMap.maxTiles = OUR_DEMO_PRINT_MAX_TILES;
				config.route.showDragTooltip = NOT_FOUND;
			}
			theConfig.overload ( config );
			theTravelNotesData.providers.forEach (
				provider => {
					provider.userLanguage = theConfig.travelNotes.language;
				}
			);
			return true;
		}
		return false;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myLoadTranslations
	@desc This function load the content of the TravelNotesXX.json file into theTranslator object
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	async function myLoadTranslations ( translationPromiseResult, defaultTranslationPromiseResult ) {
		if (
			'fulfilled' === translationPromiseResult.status
			&&
			HTTP_STATUS_OK === translationPromiseResult.value.status
			&&
			translationPromiseResult.value.ok
		) {
			theTranslator.setTranslations ( await translationPromiseResult.value.json ( ) );
			return '';
		}
		if (
			'fulfilled' === defaultTranslationPromiseResult.status
			&&
			HTTP_STATUS_OK === defaultTranslationPromiseResult.value.status
			&&
			defaultTranslationPromiseResult.value.ok
		) {
			theTranslator.setTranslations ( await defaultTranslationPromiseResult.value.json ( ) );
			return (
				'Not possible to load the TravelNotes' +
				myLanguage.toUpperCase ( ) +
				'.json file. English will be used. '
			);
		}
		return 'Not possible to load the translations. ';
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myLoadLayers
	@desc This function load the content of the TravelNotesLayers.json file into theLayersToolbarUI object
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	async function myLoadLayers ( layersPromiseResult ) {
		if (
			'fulfilled' === layersPromiseResult.status
			&&
			HTTP_STATUS_OK === layersPromiseResult.value.status
			&&
			layersPromiseResult.value.ok
		) {
			theLayersToolbarUI.addLayers ( await layersPromiseResult.value.json ( ) );
			return '';
		}
		return 'Not possible to load the TravelNotesLayers.json file. Only the OpenStreetMap background will be available. ';
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myLoadNoteDialogConfig
	@desc This function load the content of the TravelNotesNoteDialogXX.json file into theNoteDialogToolbar object
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	async function myLoadNoteDialogConfig ( noteDialogPromiseResult, defaultNoteDialogPromiseResult ) {
		if (
			'fulfilled' === noteDialogPromiseResult.status
			&&
			HTTP_STATUS_OK === noteDialogPromiseResult.value.status
			&&
			noteDialogPromiseResult.value.ok
		) {
			let noteDialogData = await noteDialogPromiseResult.value.json ( );
			theNoteDialogToolbar.selectOptions = noteDialogData.preDefinedIconsList;
			noteDialogData.preDefinedIconsList.forEach (
				preDefinedIcon => { preDefinedIcon.name = theHTMLSanitizer.sanitizeToJsString ( preDefinedIcon.name ); }
			);
			theNoteDialogToolbar.buttons = noteDialogData.editionButtons;
			return '';
		}
		if (
			'fulfilled' === defaultNoteDialogPromiseResult.status
			&&
			HTTP_STATUS_OK === defaultNoteDialogPromiseResult.value.status
			&&
			defaultNoteDialogPromiseResult.value.ok
		) {
			let defaultNoteDialogData = await defaultNoteDialogPromiseResult.value.json ( );
			theNoteDialogToolbar.selectOptions = defaultNoteDialogData.preDefinedIconsList;
			defaultNoteDialogData.preDefinedIconsList.forEach (
				preDefinedIcon => { preDefinedIcon.name = theHTMLSanitizer.sanitizeToJsString ( preDefinedIcon.name ); }
			);
			theNoteDialogToolbar.buttons = defaultNoteDialogData.editionButtons;
			return (
				'Not possible to load the TravelNotesNoteDialog' +
				myLanguage.toUpperCase ( ) +
				'.json file. English will be used. '
			);
		}
		return 'Not possible to load the translations for the note dialog. ';
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myLoadSearchDictionary
	@desc This function load the content of the TravelNotesSearchDictionaryXX.csv file into theOsmSearchEngine object
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	async function myLoadSearchDictionary ( searchDictPromiseResult, defaultSearchDictPromiseResult ) {
		if (
			'fulfilled' === searchDictPromiseResult.status
			&&
			HTTP_STATUS_OK === searchDictPromiseResult.value.status
			&&
			searchDictPromiseResult.value.ok
		) {
			theOsmSearchEngine.parseDictionary ( await searchDictPromiseResult.value.text ( ) );
			return '';
		}
		if (
			'fulfilled' === defaultSearchDictPromiseResult.status
			&&
			HTTP_STATUS_OK === defaultSearchDictPromiseResult.value.status
			&&
			defaultSearchDictPromiseResult.value.ok
		) {
			theOsmSearchEngine.parseDictionary ( await defaultSearchDictPromiseResult.value.text ( ) );
			return (
				'Not possible to load the TravelNotesSearchDictionary' +
				myLanguage.toUpperCase ( ) +
				'.csv file. English will be used. '
			);
		}
		return 'Not possible to load the search dictionary. OSM search will not be available.';
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myLoadJsonFiles
	@desc Load the configuration files
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	async function myLoadJsonFiles ( ) {

		let results = await Promise.allSettled ( [
			fetch ( myOriginAndPath +	myLanguage.toUpperCase ( ) + '.json' ),
			fetch ( myOriginAndPath + 'EN.json' ),
			fetch ( myOriginAndPath + 'NoteDialog' + myLanguage.toUpperCase ( ) + '.json' ),
			fetch ( myOriginAndPath + 'NoteDialogEN.json' ),
			fetch ( myOriginAndPath + 'SearchDictionary' + myLanguage.toUpperCase ( ) + '.csv' ),
			fetch ( myOriginAndPath + 'SearchDictionaryEN.csv' ),
			fetch ( myOriginAndPath + 'Layers.json' )
		] );

		/* eslint-disable no-magic-numbers */
		myErrorMessage = await myLoadTranslations (
			results [ 0 ],
			results [ 1 ]
		);
		myErrorMessage += await myLoadNoteDialogConfig (
			results [ 2 ],
			results [ 3 ]
		);
		myErrorMessage += await myLoadSearchDictionary (
			results [ 4 ],
			results [ 5 ]
		);
		myErrorMessage += await myLoadLayers ( results [ 6 ] );
		/* eslint-enable no-magic-numbers */

		if ( '' !== myErrorMessage ) {
			theErrorsUI.showWarning ( myErrorMessage );
			myErrorMessage = '';
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myLoadTravelNotes
	@desc Creates the map and the div for the TravelNotes UI and then launch TravelNotes
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myLoadTravelNotes ( ) {
		if ( theConfig.travelNotes.autoLoad && '' === myErrorMessage ) {
			let mapDiv = theHTMLElementsFactory.create ( 'div', { id : 'TravelNotes-Map' }, document.body );
			theHTMLElementsFactory.create ( 'div', { id : 'TravelNotes-UI' }, document.body );

			let map = window.L.map ( 'TravelNotes-Map', { attributionControl : false, zoomControl : false } )
				.setView ( [ LAT_LNG.defaultValue, LAT_LNG.defaultValue ], ZERO );

			if ( myTravelUrl ) {
				theTravelNotes.addReadOnlyMap ( map, myTravelUrl );
			}
			else {
				theTravelNotes.addControl ( map, 'TravelNotes-UI' );
			}
			mapDiv.focus ( );
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function start
	@desc Launch TravelNotes, loading all the config files needed, depending of the language.
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	async function start ( ) {
		window.TaN = theTravelNotes;
		if ( window.L ) {

			// deprecated since v2.2.0. Must be removed a day...
			window.L.travelNotes = window.TaN;
		}
		myReadURL ( );
		if ( ! await myLoadConfig ( ) ) {
			theErrorsUI.showError ( 'Not possible to load the TravelNotesConfig.json file. ' );
			return;
		}

		myLanguage = myLanguage || theConfig.travelNotes.language || 'fr';
		theErrorsUI.createUI ( );
		await myLoadJsonFiles ( );
		myLoadTravelNotes ( myTravelUrl );
	}

	start ( );
}

ourMain ( );

/*
--- End of Main file ----------------------------------------------------------------------------------------------------------
*/