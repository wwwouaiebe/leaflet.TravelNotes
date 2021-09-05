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
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file AppLoaderViewer.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module main
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theConfig from '../data/Config.js';
import ConfigOverloader from '../data/ConfigOverloader.js';
import theTravelNotesViewer from '../main/TravelNotesViewer.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import theTranslator from '../UILib/Translator.js';
import theViewerLayersToolbarUI from '../viewerLayersToolbarUI/ViewerLayersToolbarUI.js';
import MapEditorViewer from '../coreMapEditor/MapEditorViewer.js';
import theGeoLocator from '../core/GeoLocator.js';
import Zoomer from '../core/Zoomer.js';

import { LAT_LNG, ZERO, ONE, HTTP_STATUS_OK } from '../main/Constants.js';

const OUR_VIEWER_DEFAULT_ZOOM = 2;

/**
@------------------------------------------------------------------------------------------------------------------------------

@class KeydownEventListener
@classdesc keydown event listener
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

class KeydownEventListener {

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	handleEvent ( keyBoardEvent ) {
		keyBoardEvent.stopPropagation ( );
		if ( 'Z' === keyBoardEvent.key || 'z' === keyBoardEvent.key ) {
			new Zoomer ( ).zoomToTravel ( );
		}
		else if ( 'G' === keyBoardEvent.key || 'g' === keyBoardEvent.key ) {
			theGeoLocator.switch ( );
		}
		else {
			let charCode = keyBoardEvent.key.charCodeAt ( ZERO );
			/* eslint-disable-next-line no-magic-numbers */
			if ( 47 < charCode && 58 > charCode ) {
				theViewerLayersToolbarUI.setMapLayer ( keyBoardEvent.key );
			}
		}
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class AppLoaderViewer
@classdesc Loader for the app.Load all the json files needed (config, translations, map layers...) and add event listeners.
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class AppLoaderViewer {

	#travelUrl = null;
	#language = null;
	#addLayerToolbar = false;
	#originAndPath = window.location.href.substr ( ZERO, window.location.href.lastIndexOf ( '/' ) + ONE ) + 'TravelNotes';

	static #mapEditorViewer = new MapEditorViewer ( );

	/**
	Loading event listeners
	@private
	*/

	#addEventsListeners ( ) {
		document.addEventListener ( 'keydown', new KeydownEventListener ( ), true );
		document.addEventListener (
			'routeupdated',
			updateRouteEvent => {
				if ( updateRouteEvent.data ) {
					AppLoaderViewer.#mapEditorViewer.addRoute (
						updateRouteEvent.data.addedRouteObjId
					);
				}
			},
			false
		);
		document.addEventListener (
			'noteupdated',
			updateNoteEvent => {
				if ( updateNoteEvent.data ) {
					AppLoaderViewer.#mapEditorViewer.addNote (
						updateNoteEvent.data.addedNoteObjId
					);
				}
			},
			false
		);
		document.addEventListener (
			'zoomto',
			zoomToEvent => {
				if ( zoomToEvent.data ) {
					AppLoaderViewer.#mapEditorViewer.zoomTo (
						zoomToEvent.data.latLng,
						zoomToEvent.data.geometry
					);
				}
			},
			false
		);
		document.addEventListener (
			'layerchange',
			layerChangeEvent => {
				if ( layerChangeEvent.data ) {
					AppLoaderViewer.#mapEditorViewer.setLayer ( layerChangeEvent.data.layer, layerChangeEvent.data.layer.url );
				}
			}
		);
		document.addEventListener (
			'geolocationpositionchanged',
			geoLocationPositionChangedEvent => {
				if ( geoLocationPositionChangedEvent.data ) {
					AppLoaderViewer.#mapEditorViewer.onGeolocationPositionChanged (
						geoLocationPositionChangedEvent.data.position
					);
				}
			},
			false
		);
		document.addEventListener (
			'geolocationstatuschanged',
			geoLocationStatusChangedEvent => {
				if ( geoLocationStatusChangedEvent.data ) {
					AppLoaderViewer.#mapEditorViewer.onGeolocationStatusChanged ( geoLocationStatusChangedEvent.data.status );
				}
			},
			false
		);
	}

	/**
	Read the url. Search a 'fil' parameter, a 'lng' parameter and a 'lay' in the url.
	@private
	*/

	#readURL ( ) {
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
					this.#travelUrl = encodeURI ( travelURL.href );
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
				this.#language = urlLng.toLowerCase ( );
			}
		}
		if ( '' === docURL.searchParams.get ( 'lay' ) ) {
			this.#addLayerToolbar = true;
		}
	}

	/**
	Loading the config.json file from the server
	*/

	async #loadConfig ( ) {
		let configResponse = await fetch ( this.#originAndPath + 'Config.json' );
		if ( HTTP_STATUS_OK === configResponse.status && configResponse.ok ) {
			let config = await configResponse.json ( );
			config.travelNotes.language = this.#language || config.travelNotes.language;
			if ( 'wwwouaiebe.github.io' === window.location.hostname ) {
				config.note.haveBackground = true;
			}
			new ConfigOverloader ( ).overload ( config );
			return true;
		}
		return false;
	}

	/**
	Loading translations
	@private
	*/

	async #loadTranslations ( ) {
		let languageResponse = await fetch ( this.#originAndPath +	this.#language.toUpperCase ( ) + '.json' );
		if ( HTTP_STATUS_OK === languageResponse.status && languageResponse.ok ) {
			theTranslator.setTranslations ( await languageResponse.json ( ) );
			return true;
		}
		return false;
	}

	/**
	Loading map layers
	@private
	*/

	async #loadMapLayers ( ) {
		let layersResponse = await fetch ( this.#originAndPath +	'Layers.json' );
		if ( HTTP_STATUS_OK === layersResponse.status && layersResponse.ok ) {
			theViewerLayersToolbarUI.addMapLayers ( await layersResponse.json ( ) );
			return true;
		}
		return false;
	}

	/**
	Loading theTravelNotesViewer
	@readonly
	*/

	#loadTravelNotesViewer ( ) {

		// mapDiv must be extensible for leaflet
		let mapDiv = document.createElement ( 'div' );
		mapDiv.id = 'TravelNotes-Map';
		document.body.appendChild ( mapDiv );

		theTravelNotesData.map =
			window.L.map ( 'TravelNotes-Map', { attributionControl : false, zoomControl : false } );
		theTravelNotesData.map.setView ( [ LAT_LNG.defaultValue, LAT_LNG.defaultValue ], OUR_VIEWER_DEFAULT_ZOOM );

		theTravelNotesViewer.addReadOnlyMap ( this.#travelUrl, this.#addLayerToolbar );
	}

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	Load the complete app
	*/

	async loadApp ( ) {
		this.#readURL ( );
		if ( ! await this.#loadConfig ( ) ) {
			document.body.textContent = 'Not possible to load the TravelNotesConfig.json file. ';
			return;
		}
		this.#language = this.#language || theConfig.travelNotes.language;
		if ( ! await this.#loadTranslations ( ) ) {
			document.body.textContent =
				'Not possible to load the TravelNotesConfig' + this.#language.toUpperCase ( ) + '.json file. ';
			return;
		}
		if ( ! await this.#loadMapLayers ( ) ) {
			document.body.textContent = 'Not possible to load the TravelNotesLayers.json file. ';
			return;
		}
		this.#addEventsListeners ( );
		this.#loadTravelNotesViewer ( );
	}
}

export default AppLoaderViewer;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of AppLoaderViewer.js file

@------------------------------------------------------------------------------------------------------------------------------
*/