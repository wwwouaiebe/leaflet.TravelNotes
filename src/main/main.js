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
	- v1.13.0:
		- Issue #125 : Outphase osmSearch and add it to TravelNotes
Doc reviewed 20200823
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file Main.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
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

import { theConfig } from '../data/Config.js';
import { theHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { theHttpRequestBuilder } from '../util/HttpRequestBuilder.js';
import { theTravelNotes } from '../main/TravelNotes.js';
import { theAPIKeysManager } from '../core/APIKeysManager.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theTranslator } from '../UI/Translator.js';
import { theLayersToolbarUI } from '../UI/LayersToolbarUI.js';
import { theErrorsUI } from '../UI/ErrorsUI.js';
import { theNoteDialogToolbar } from '../dialogs/NoteDialogToolbar.js';
import { theOsmSearchEngine } from '../core/OsmSearchEngine.js';

import { LAT_LNG, ZERO, ONE, NOT_FOUND } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewMain
@desc constructor for Main object
@return {Main} an instance of a Main object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewMain ( ) {

	let myLanguage = null;
	let myTravelUrl = null;
	let myErrorMessage = '';
	let myHaveCrypto = false;

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myReadURL
	@desc This function read the search part of the url
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myReadURL ( ) {
		const FOUR = 4;
		let newUrlSearch = '?';
		( decodeURI ( window.location.search ).substr ( ONE )
			.split ( '&' ) )
			.forEach (
				urlSearchSubString => {
					if ( NOT_FOUND === urlSearchSubString.indexOf ( 'ProviderKey' ) ) {
						if ( 'fil=' === urlSearchSubString.substr ( ZERO, FOUR ).toLowerCase ( ) ) {
							myTravelUrl = decodeURIComponent (
								escape ( atob ( urlSearchSubString.substr ( FOUR ) ) ) );
						}
						else if ( 'lng=' === urlSearchSubString.substr ( ZERO, FOUR ).toLowerCase ( ) ) {
							myLanguage = urlSearchSubString.substr ( FOUR ).toLowerCase ( );
						}
						newUrlSearch += ( '?' === newUrlSearch ) ? '' : '&';
						newUrlSearch += urlSearchSubString;
					}
					else {
						theAPIKeysManager.setKeyFromUrl ( urlSearchSubString );
					}
				}
			);
		let stateObj = { index : 'bar' };
		history.replaceState ( stateObj, 'page', newUrlSearch );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myTestCrypto
	@desc This function test the crypto functions and the scure context
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myTestCrypto ( ) {
		if ( window.crypto && window.crypto.subtle && window.crypto.subtle.importKey && window.isSecureContext ) {
			return window.crypto.subtle.importKey (
				'raw',
				new window.TextEncoder ( ).encode ( 'hoho' ),
				{ name : 'PBKDF2' },
				false,
				[ 'deriveKey' ]
			);
		}
		return Promise.reject ( new Error ( 'Invalid crypto functions or unsecure context' ) );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myLoadConfig
	@desc This function load the content of the TravelNotesConfig.json file into theConfig object
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myLoadConfig ( configPromiseResult ) {
		if ( 'fulfilled' === configPromiseResult.status ) {
			configPromiseResult.value.language = myLanguage;
			configPromiseResult.value.haveCrypto = myHaveCrypto;
			if ( 'wwwouaiebe.github.io' === window.location.hostname ) {
				configPromiseResult.value.layersToolbarUI.theDevil.addButton = false;
				configPromiseResult.value.errorUI.showHelp = true;
				const PRINT_MAX_TILES = 120;
				configPromiseResult.value.printRouteMap.maxTiles = PRINT_MAX_TILES;
				const MAX_MANEUVERS_NOTES = 10;
				configPromiseResult.value.note.maxManeuversNotes = MAX_MANEUVERS_NOTES;
				configPromiseResult.value.note.haveBackground = true;
				configPromiseResult.value.APIKeys.dialogHaveUnsecureButtons = true;
			}
			theConfig.overload ( configPromiseResult.value );
			return '';
		}
		return 'Not possible to load the TravelNotesConfig.json file. ';
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myLoadTranslations
	@desc This function load the content of the TravelNotesXX.json file into theTranslator object
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myLoadTranslations ( translationPromiseResult, defaultTranslationPromiseResult ) {
		if ( 'fulfilled' === translationPromiseResult.status ) {
			theTranslator.setTranslations ( translationPromiseResult.value );
			return '';
		}
		if ( 'fulfilled' === defaultTranslationPromiseResult.status ) {
			theTranslator.setTranslations ( defaultTranslationPromiseResult.value );
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

	function myLoadLayers ( layersPromiseResult ) {
		if ( 'fulfilled' === layersPromiseResult.status ) {
			theLayersToolbarUI.addLayers ( layersPromiseResult.value );
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

	function myLoadNoteDialogConfig ( noteDialogPromiseResult, defaultNoteDialogPromiseResult ) {
		if ( 'fulfilled' === noteDialogPromiseResult.status ) {
			theNoteDialogToolbar.selectOptions = noteDialogPromiseResult.value.preDefinedIconsList;
			theNoteDialogToolbar.buttons = noteDialogPromiseResult.value.editionButtons;
			return '';
		}
		if ( 'fulfilled' === defaultNoteDialogPromiseResult.status ) {
			theNoteDialogToolbar.selectOptions = defaultNoteDialogPromiseResult.value.preDefinedIconsList;
			theNoteDialogToolbar.buttons = defaultNoteDialogPromiseResult.value.editionButtons;
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

	function myLoadSearchDictionary ( searchDictPromiseResult, defaultSearchDictPromiseResult ) {
		if ( 'fulfilled' === searchDictPromiseResult.status ) {
			theOsmSearchEngine.parseDictionary ( searchDictPromiseResult.value );
			return '';
		}
		if ( 'fulfilled' === defaultSearchDictPromiseResult.status ) {
			theOsmSearchEngine.parseDictionary ( defaultSearchDictPromiseResult.value );
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

	@function myGetJsonPromises
	@desc This function gives the Promises list needed to load all the configuration files
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myGetJsonPromises ( ) {
		let originAndPath = window.location.origin + window.location.pathname + 'TravelNotes';
		return [
			myTestCrypto ( ),
			theHttpRequestBuilder.getJsonPromise ( originAndPath + 'Config.json' ),
			theHttpRequestBuilder.getJsonPromise ( originAndPath +	myLanguage.toUpperCase ( ) + '.json' ),
			theHttpRequestBuilder.getJsonPromise ( originAndPath + 'Layers.json' ),
			theHttpRequestBuilder.getJsonPromise ( originAndPath + 'NoteDialog' + myLanguage.toUpperCase ( ) + '.json' ),
			theHttpRequestBuilder.getJsonPromise ( originAndPath + 'EN.json' ),
			theHttpRequestBuilder.getJsonPromise ( originAndPath + 'NoteDialogEN.json' ),
			theHttpRequestBuilder.getTextPromise ( originAndPath + 'SearchDictionary' + myLanguage.toUpperCase ( ) + '.csv' ),
			theHttpRequestBuilder.getTextPromise ( originAndPath + 'SearchDictionaryEN.csv' )
		];
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myLoadJsonFiles
	@desc Load the configuration files
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myLoadJsonFiles ( results ) {
		const CONFIG_FILE_INDEX = 1;
		const TRANSLATIONS_FILE_INDEX = 2;
		const LAYERS_FILE_INDEX = 3;
		const NOTE_CONFIG_FILE_INDEX = 4;
		const DEFAULT_TRANSLATIONS_FILE_INDEX = 5;
		const DEFAULT_NOTE_CONFIG_FILE_INDEX = 6;
		const SEARCH_DICTIONARY_FILE_INDEX = 7;
		const DEFAULT_SEARCH_DICTIONARY_FILE_INDEX = 8;
		if ( 'fulfilled' === results [ ZERO ].status ) {
			myHaveCrypto = true;
		}
		myErrorMessage = myLoadConfig ( results [ CONFIG_FILE_INDEX ] );
		if ( myErrorMessage ) {
			theErrorsUI.showError ( myErrorMessage );
			return;
		}
		theTravelNotesData.providers.forEach (
			provider => {
				provider.userLanguage = theConfig.language;
			}
		);
		myErrorMessage = myLoadTranslations (
			results [ TRANSLATIONS_FILE_INDEX ],
			results [ DEFAULT_TRANSLATIONS_FILE_INDEX ]
		);
		myErrorMessage += myLoadNoteDialogConfig (
			results [ NOTE_CONFIG_FILE_INDEX ],
			results [ DEFAULT_NOTE_CONFIG_FILE_INDEX ]
		);
		myErrorMessage += myLoadLayers ( results [ LAYERS_FILE_INDEX ] );
		myErrorMessage += myLoadSearchDictionary (
			results [ SEARCH_DICTIONARY_FILE_INDEX ],
			results [ DEFAULT_SEARCH_DICTIONARY_FILE_INDEX ]
		);

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
		if ( theConfig.autoLoad && '' === myErrorMessage ) {
			theHTMLElementsFactory.create (
				'div',
				{ id : 'Map' },
				document.querySelector ( 'body' )
			);
			theHTMLElementsFactory.create (
				'div',
				{ id : 'TravelNotes' },
				document.querySelector ( 'body' )
			);

			let map = window.L.map ( 'Map', { attributionControl : false, zoomControl : false } )
				.setView ( [ LAT_LNG.defaultValue, LAT_LNG.defaultValue ], ZERO );

			if ( myTravelUrl ) {
				theTravelNotes.addReadOnlyMap ( map, myTravelUrl );
			}
			else {
				theTravelNotes.addControl ( map, 'TravelNotes' );
			}
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class
	@classdesc This Class is used to configure and launch TravelNotes.
	Not possible to instanciate this class outside TravelNotes.
	@hideconstructor
	@public

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	class Main {

		/**
		Launch TravelNotes.
		*/

		start ( ) {
			window.L.travelNotes = theTravelNotes;
			myReadURL ( );
			myLanguage = myLanguage || theConfig.language;
			theErrorsUI.createUI ( );

			Promise.allSettled ( myGetJsonPromises ( ) )
				.then (
					results => {
						myLoadJsonFiles ( results );
						myLoadTravelNotes ( myTravelUrl );
					}
				);
		}
	}

	return Object.freeze ( new Main );
}

ourNewMain ( ).start ( );

/*
--- End of Main file ----------------------------------------------------------------------------------------------------------
*/