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
	- v2.0.0:
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

import { LAT_LNG, ZERO } from '../util/Constants.js';

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
					console.log ( 'The distant file is not on the same site than the app' );
				}
			}
			catch ( err ) {
				console.log ( err.message );
			}
		}
		let urlLng = docURL.searchParams.get ( 'lng' );
		if ( urlLng ) {
			if ( urlLng.match ( /^[A-Z,a-z]{2}$/ ) ) {
				myLanguage = urlLng.toLowerCase ( );
			}
			else {
				console.log ( 'invalid lng parameter' );
			}
		}
		if ( '' === docURL.searchParams.get ( 'lay' ) ) {
			myAddLayerToolbar = true;
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
		const DEFAULT_ZOOM = 2;
		if ( '' === myErrorMessage ) {
			theHTMLElementsFactory.create (
				'div',
				{ id : 'Map' },
				document.querySelector ( 'body' )
			);

			let map = window.L.map ( 'Map', { attributionControl : false, zoomControl : false } )
				.setView ( [ LAT_LNG.defaultValue, LAT_LNG.defaultValue ], DEFAULT_ZOOM );

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

			myReadURL ( );
			myLanguage = myLanguage || theConfig.language;
			let originAndPath = window.location.origin + window.location.pathname + 'TravelNotes';
			theHttpRequestBuilder.getJsonPromise ( originAndPath + 'Config.json' )
				.then (
					result => {
						result.language = myLanguage;
						if ( 'wwwouaiebe.github.io' === window.location.hostname ) {
							result.note.haveBackground = true;
						}
						theConfig.overload ( result );
						return theHttpRequestBuilder.getJsonPromise ( originAndPath +	myLanguage.toUpperCase ( ) + '.json' );
					}
				)
				.then (
					result => {
						theTranslator.setTranslations ( result );
						return theHttpRequestBuilder.getJsonPromise ( originAndPath + 'Layers.json' );
					}
				)
				.then (
					result => {
						theViewerLayersToolbarUI.addLayers ( result );
						myLoadTravelNotes ( myTravelUrl );
					}
				)
				.catch ( ( ) => { document.body.textContent = 'An error occurs when loading the configuration '; } );

		}
	}

	return Object.freeze ( new MainViewer );
}

ourNewMainViewer ( ).start ( );

/*
--- End of MainViewer file ----------------------------------------------------------------------------------------------------
*/