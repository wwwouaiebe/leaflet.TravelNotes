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
		- Issue ♯133 : Outphase reading the APIKeys with the url
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

import theConfig from '../data/Config.js';
import ConfigOverloader from '../data/ConfigOverloader.js';
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import { theTravelNotesViewer } from '../main/TravelNotesViewer.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import theTranslator from '../UI/Translator.js';
import theViewerLayersToolbarUI from '../UI/ViewerLayersToolbarUI.js';
import { LAT_LNG, ZERO, ONE, HTTP_STATUS_OK } from '../util/Constants.js';

const OUR_VIEWER_DEFAULT_ZOOM = 2;

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewMainViewer
@desc constructor for MainViewer object
@return {MainViewer} an instance of a Main object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourMainViewer ( ) {

	let myLanguage = null;
	let myTravelUrl = null;
	let myAddLayerToolbar = false;
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
		if ( '' === docURL.searchParams.get ( 'lay' ) ) {
			myAddLayerToolbar = true;
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
				config.note.haveBackground = true;
			}
			new ConfigOverloader ( ).overload ( config );
			return true;
		}
		return false;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myLoadLanguage
	@desc This function load the content of the TravelNotesXX.json file into theTranslator object
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	async function myLoadLanguage ( ) {
		let languageResponse = await fetch ( myOriginAndPath +	myLanguage.toUpperCase ( ) + '.json' );
		if ( HTTP_STATUS_OK === languageResponse.status && languageResponse.ok ) {
			theTranslator.setTranslations ( await languageResponse.json ( ) );
			return true;
		}
		return false;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myLoadLayers
	@desc This function load the content of the TravelNotesLayers.json file into theViewerLayersToolbarUI object
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	async function myLoadLayers ( ) {
		let layersResponse = await fetch ( myOriginAndPath +	'Layers.json' );
		if ( HTTP_STATUS_OK === layersResponse.status && layersResponse.ok ) {
			theViewerLayersToolbarUI.addMapLayers ( await layersResponse.json ( ) );
			return true;
		}
		return false;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myLoadTravelNotes
	@desc Creates the map and the div for the TravelNotes UI and then launch TravelNotes
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myLoadTravelNotes ( ) {
		theHTMLElementsFactory.create ( 'div', { id : 'TravelNotes-Map' }, document.body );

		let map = window.L.map ( 'TravelNotes-Map', { attributionControl : false, zoomControl : false } )
			.setView ( [ LAT_LNG.defaultValue, LAT_LNG.defaultValue ], OUR_VIEWER_DEFAULT_ZOOM );

		theTravelNotesData.map = map;

		theTravelNotesViewer.addReadOnlyMap ( myTravelUrl, myAddLayerToolbar );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function start
	@desc Launch the TravelNotes viewer , loading all the config files needed, depending of the language.
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	async function start ( ) {
		myReadURL ( );
		if ( ! await myLoadConfig ( ) ) {
			document.body.textContent = 'Not possible to load the TravelNotesConfig.json file. ';
			return;
		}
		myLanguage = myLanguage || theConfig.travelNotes.language;
		if ( ! await myLoadLanguage ( ) ) {
			document.body.textContent =
				'Not possible to load the TravelNotesConfig' + myLanguage.toUpperCase ( ) + '.json file. ';
			return;
		}
		if ( ! await myLoadLayers ( ) ) {
			document.body.textContent = 'Not possible to load the TravelNotesLayers.json file. ';
			return;
		}
		myLoadTravelNotes ( );
	}

	start ( );
}

ourMainViewer ( );

/*
--- End of MainViewer file ----------------------------------------------------------------------------------------------------
*/