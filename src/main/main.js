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

import { THE_CONST } from '../util/Constants.js';

function startup ( ) {

	let myLangage = null;
	let myTravelUrl = null;

	/*
	--- myReadURL function --------------------------------------------------------------------------------------------

	This function extract the route providers API key from the url

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myReadURL ( ) {
		let newUrlSearch = '?';
		( decodeURI ( window.location.search ).substr ( THE_CONST.number1 )
			.split ( '&' ) )
			.forEach (
				urlSearchSubString => {
					if ( THE_CONST.notFound === urlSearchSubString.indexOf ( 'ProviderKey' ) ) {
						if ( 'fil=' === urlSearchSubString.substr ( THE_CONST.zero, THE_CONST.number4 ).toLowerCase ( ) ) {
							myTravelUrl = decodeURIComponent (
								escape ( atob ( urlSearchSubString.substr ( THE_CONST.number4 ) ) ) );
						}
						else if ( 'lng=' === urlSearchSubString.substr ( THE_CONST.zero, THE_CONST.number4 ).toLowerCase ( ) ) {
							myLangage = urlSearchSubString.substr ( THE_CONST.number4 ).toLowerCase ( );
						}
						newUrlSearch += ( '?' === newUrlSearch ) ? '' : '&';
						newUrlSearch += urlSearchSubString;
					}
					else {
						theAPIKeysManager.fromUrl ( urlSearchSubString );
					}
				}
			);
		let stateObj = { index : 'bar' };
		history.replaceState ( stateObj, 'page', newUrlSearch );
	}

	function myTestCryptoPromise ( ) {
		if ( ! window.crypto || ! window.crypto.subtle || ! window.crypto.subtle.importKey ) {
			return Promise.reject ( new Error ( 'Crypto.subtle not available' ) );
		}

		return	window.crypto.subtle.importKey (
			'raw',
			new window.TextEncoder ( ).encode ( 'hoho' ),
			{ name : 'PBKDF2' },
			false,
			[ 'deriveKey' ]
		);

	}

	/*
	--- End of myReadURL function ---
	*/

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
			window.location.href.substr ( THE_CONST.zero, window.location.href.lastIndexOf ( '/' ) + THE_CONST.number1 ) +
			'TravelNotesConfig.json'
		),
		requestBuilder.getJsonPromise (
			window.location.href.substr ( THE_CONST.zero, window.location.href.lastIndexOf ( '/' ) + THE_CONST.number1 ) +
			'TravelNotes' +
			( myLangage || theConfig.language ).toUpperCase ( ) +
			'.json'
		),
		requestBuilder.getJsonPromise (
			window.location.href.substr ( THE_CONST.zero, window.location.href.lastIndexOf ( '/' ) + THE_CONST.number1 ) +
			'TravelNotesLayers.json'
		),
		requestBuilder.getJsonPromise (
			window.location.href.substr ( THE_CONST.zero, window.location.href.lastIndexOf ( '/' ) + THE_CONST.number1 ) +
			'TravelNotesNoteDialog' +
			( myLangage || theConfig.language ).toUpperCase ( ) +
			'.json'
		),
		myTestCryptoPromise ( )
	];

	Promise.allSettled ( promises )
		.then (

			// promises succeeded
			results => {
				for (
					let promisesCounter = THE_CONST.zero;
					promisesCounter <= THE_CONST.number3;
					promisesCounter ++
				) {
					if ( 'rejected' === results [ promisesCounter ].status ) {
						throw new Error ( results [ promisesCounter ].reason );
					}
				}

				// config adaptation
				if ( myLangage ) {
					results [ THE_CONST.zero ].value.language = myLangage;
				}
				results [ THE_CONST.zero ].value.haveCrypto =
					'fulfilled' === results [ THE_CONST.number4 ].status;

				theConfig.overload ( results [ THE_CONST.zero ].value );

				theTravelNotesData.providers.forEach (
					provider => {
						provider.userLanguage = theConfig.language;
					}
				);

				// translations adaptation
				theTranslator.setTranslations ( results [ THE_CONST.number1 ].value );

				// layers adaptation
				theLayersToolbarUI.setLayers ( results [ THE_CONST.number2 ].value );

				theNoteDialogToolbar.selectOptions = results [ THE_CONST.number3 ].value.preDefinedIconsList;
				theNoteDialogToolbar.buttons = results [ THE_CONST.number3 ].value.editionButtons;

				if ( theConfig.autoLoad ) {
					newHTMLElementsFactory ( ).create (
						'div',
						{ id : 'Map' },
						document.getElementsByTagName ( 'body' ) [ THE_CONST.zero ]
					);
					newHTMLElementsFactory ( ).create (
						'div',
						{ id : 'TravelNotes' },
						document.getElementsByTagName ( 'body' ) [ THE_CONST.zero ]
					);

					let map = window.L.map ( 'Map', { attributionControl : false, zoomControl : false } )
						.setView ( [ THE_CONST.latLng.defaultValue, THE_CONST.latLng.defaultValue ], THE_CONST.zero );

					theTravelNotesData.map = map;

					if ( myTravelUrl ) {
						theTravelNotes.addReadOnlyMap ( myTravelUrl );
					}
					else {
						theTravelNotes.addControl ( 'TravelNotes' );
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