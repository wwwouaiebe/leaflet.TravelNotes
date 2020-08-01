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
--- main.js file ------------------------------------------------------------------------------------------------------
This file contains:
	-
	Changes:
	- v1.6.0:
		- created
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theConfig } from '../data/Config.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { newHttpRequestBuilder } from '../util/HttpRequestBuilder.js';
import { theTravelNotes } from '../main/TravelNotes.js';
import { theAPIKeysManager } from '../core/APIKeysManager.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theTranslator } from '../UI/Translator.js';
import { theLayersToolbarUI } from '../UI/LayersToolbarUI.js';
import { theNoteDialogToolbar } from '../dialogs/NoteDialogToolbar.js';

import { LAT_LNG, ZERO, ONE, NOT_FOUND } from '../util/Constants.js';

function startup ( ) {

	let myLangage = null;
	let myTravelUrl = null;

	/*
	--- myReadURL function --------------------------------------------------------------------------------------------

	This function extract the route providers API key from the url

	-------------------------------------------------------------------------------------------------------------------
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
							myLangage = urlSearchSubString.substr ( FOUR ).toLowerCase ( );
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

	/*
	--- myTestCryptoPromise function ----------------------------------------------------------------------------------

	This function extract the route providers API key from the url

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myTestCryptoPromise ( ) {

		// MS Edge @#?£$ don't know Promise.allSettled, so we need to always
		// return Promise.resolve...
		if ( ! window.crypto || ! window.crypto.subtle || ! window.crypto.subtle.importKey ) {
			return Promise.resolve ( false );
		}

		if ( window.isSecureContext	) {
			try {
				return window.crypto.subtle.importKey (
					'raw',
					new window.TextEncoder ( ).encode ( 'hoho' ),
					{ name : 'PBKDF2' },
					false,
					[ 'deriveKey' ]
				);
			}
			catch ( err ) {
				return Promise.resolve ( false );
			}
		}
		else {
			return Promise.resolve ( false );
		}

	}

	myReadURL ( );

	window.L.travelNotes = theTravelNotes;

	// osmSearch
	if ( window.osmSearch ) {
		window.osmSearch.getDictionaryPromise ( theConfig.language, 'travelNotes' )
			.then (
				( ) => console.log ( 'osmSearch dictionary loaded' ),
				err => console.log ( err ? err : 'An error occurs when loading the osmSearch dictionary' )
			);
	}
	else {
		console.log ( 'osmSearch not found' );
	}

	let requestBuilder = newHttpRequestBuilder ( );
	let promises = [
		requestBuilder.getJsonPromise (
			window.location.href.substr ( ZERO, window.location.href.lastIndexOf ( '/' ) + ONE ) +
			'TravelNotesConfig.json'
		),
		requestBuilder.getJsonPromise (
			window.location.href.substr ( ZERO, window.location.href.lastIndexOf ( '/' ) + ONE ) +
			'TravelNotes' +
			( myLangage || theConfig.language ).toUpperCase ( ) +
			'.json'
		),
		requestBuilder.getJsonPromise (
			window.location.href.substr ( ZERO, window.location.href.lastIndexOf ( '/' ) + ONE ) +
			'TravelNotesLayers.json'
		),
		requestBuilder.getJsonPromise (
			window.location.href.substr ( ZERO, window.location.href.lastIndexOf ( '/' ) + ONE ) +
			'TravelNotesNoteDialog' +
			( myLangage || theConfig.language ).toUpperCase ( ) +
			'.json'
		),
		myTestCryptoPromise ( )
	];

	// MS Edge @#?£$ don't know Promise.allSettled ...
	Promise.all ( promises )
		.then (

			// promises succeeded
			values => {
				const TRAVEL_NOTES_CFG_POS = 0;
				const TRANSLATIONS_POS = 1;
				const LAYERS_CFG_POS = 2;
				const NOTES_DIALOG_CFG_POS = 3;
				const TEST_CRYPTO_PROMISE_POS = 4;

				// config adaptation
				if ( myLangage ) {
					values [ TRAVEL_NOTES_CFG_POS ].language = myLangage;
				}
				if ( values [ TEST_CRYPTO_PROMISE_POS ] ) {
					values [ TRAVEL_NOTES_CFG_POS ].haveCrypto = true;
				}
				if ( 'wwwouaiebe.github.io' === window.location.hostname ) {
					values [ TRAVEL_NOTES_CFG_POS ].layersToolbarUI.theDevil.addButton = false;
					values [ TRAVEL_NOTES_CFG_POS ].errorUI.showHelp = true;
					const PRINT_MAX_TILES = 120;
					values [ TRAVEL_NOTES_CFG_POS ].printRouteMap.maxTiles = PRINT_MAX_TILES;
				}
				theConfig.overload ( values [ TRAVEL_NOTES_CFG_POS ] );

				theTravelNotesData.providers.forEach (
					provider => {
						provider.userLanguage = theConfig.language;
					}
				);

				// translations adaptation
				theTranslator.setTranslations ( values [ TRANSLATIONS_POS ] );

				// layers adaptation
				theLayersToolbarUI.setLayers ( values [ LAYERS_CFG_POS ] );

				theNoteDialogToolbar.selectOptions = values [ NOTES_DIALOG_CFG_POS ].preDefinedIconsList;
				theNoteDialogToolbar.buttons = values [ NOTES_DIALOG_CFG_POS ].editionButtons;

				if ( theConfig.autoLoad ) {
					newHTMLElementsFactory ( ).create (
						'div',
						{ id : 'Map' },
						document.querySelector ( 'body' )
					);
					newHTMLElementsFactory ( ).create (
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
						theTravelNotes.rightContextMenu = true;
					}
				}
			}
		)
		.catch ( err => console.log ( err ? err : 'An error occurs when downloading the json configuration files' ) );
}

startup ( );

/*
--- End of Main file --------------------------------------------------------------------------------------------------
*/