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
	- v1.14.0:
		- Issue #133 : Outphase reading the APIKeys with the url
Doc reviewed 20200824
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file MainViewer.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module MainViewer
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theConfig } from '../data/Config.js';
import { theHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { theHttpRequestBuilder } from '../util/HttpRequestBuilder.js';
import { theTravelNotesViewer } from '../main/TravelNotesViewer.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theTranslator } from '../UI/Translator.js';
import { theViewerLayersToolbarUI } from '../UI/ViewerLayersToolbarUI.js';

import { LAT_LNG, ZERO, ONE } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewMainViewer
@desc constructor for MainViewer object
@return {MainViewer} an instance of a Main object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewMainViewer ( ) {

	let myLanguage = null;
	let myTravelUrl = null;
	let myAddLayerToolbar = false;
	let myErrorMessage = '';

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myReadURL
	@desc This function read the search part of the url
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myReadURL ( ) {
		const THREE = 3;
		const FOUR = 4;
		window.location.search.substr ( ONE ).split ( '&' )
			.forEach (
				urlSearchSubString => {
					if ( 'fil=' === urlSearchSubString.substr ( ZERO, FOUR ).toLowerCase ( ) ) {
						myTravelUrl = atob ( urlSearchSubString.substr ( FOUR ) );
					}
					else if ( 'lng=' === urlSearchSubString.substr ( ZERO, FOUR ).toLowerCase ( ) ) {
						myLanguage = urlSearchSubString.substr ( FOUR ).toLowerCase ( );
					}
					else if ( 'lay' === urlSearchSubString.substr ( ZERO, THREE ).toLowerCase ( ) ) {
						myAddLayerToolbar = true;
					}
				}
			);
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
			if ( 'wwwouaiebe.github.io' === window.location.hostname ) {
				configPromiseResult.value.note.haveBackground = true;
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

			theViewerLayersToolbarUI.addLayers ( layersPromiseResult.value );
			return '';
		}
		return 'Not possible to load the TravelNotesLayers.json file. Only the OpenStreetMap background will be available. ';

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
			theHttpRequestBuilder.getJsonPromise ( originAndPath + 'Config.json' ),
			theHttpRequestBuilder.getJsonPromise ( originAndPath +	myLanguage.toUpperCase ( ) + '.json' ),
			theHttpRequestBuilder.getJsonPromise ( originAndPath + 'Layers.json' ),
			theHttpRequestBuilder.getJsonPromise ( originAndPath + 'EN.json' )
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
		const CONFIG_FILE_INDEX = 0;
		const TRANSLATIONS_FILE_INDEX = 1;
		const LAYERS_FILE_INDEX = 2;
		const DEFAULT_TRANSLATIONS_FILE_INDEX = 3;
		myErrorMessage = myLoadConfig ( results [ CONFIG_FILE_INDEX ] );
		if ( myErrorMessage ) {
			console.log ( myErrorMessage );
			return;
		}
		myErrorMessage = myLoadTranslations (
			results [ TRANSLATIONS_FILE_INDEX ],
			results [ DEFAULT_TRANSLATIONS_FILE_INDEX ]
		);
		myErrorMessage += myLoadLayers ( results [ LAYERS_FILE_INDEX ] );
		if ( '' !== myErrorMessage ) {
			console.log ( myErrorMessage );
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

			let map = window.L.map ( 'Map', { attributionControl : false, zoomControl : false } )
				.setView ( [ LAT_LNG.defaultValue, LAT_LNG.defaultValue ], ZERO );

			theTravelNotesData.map = map;

			theTravelNotesViewer.addReadOnlyMap ( myTravelUrl, myAddLayerToolbar );
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class
	@classdesc This Class is used to configure and launch the TravelNotes viewer.
	Not possible to instanciate this class outside TravelNotes.
	@hideconstructor
	@public

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	class MainViewer {

		/**
		Launch the TravelNotes viewer.
		*/

		start ( ) {
			window.L.travelNotes = theTravelNotesViewer;
			myReadURL ( );
			myLanguage = myLanguage || theConfig.language;
			Promise.allSettled ( myGetJsonPromises ( ) )
				.then (
					results => {
						myLoadJsonFiles ( results );
						myLoadTravelNotes ( myTravelUrl );
					}
				);
		}
	}

	return Object.freeze ( new MainViewer );
}

ourNewMainViewer ( ).start ( );

/*
--- End of MainViewer file ----------------------------------------------------------------------------------------------------
*/