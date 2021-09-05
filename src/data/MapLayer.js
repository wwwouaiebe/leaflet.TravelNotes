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
	- v2.0.0:
		- created
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file MapLayer.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------
@typedef {Object} LayerToolbarButton
@desc A layers toolbar button properties
@property {string} text The text to display in the toolbar button
@property {string} color The foreground color of the toolbar button
@property {string} backgroundColor The background color of the toolbar button
@public

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module data
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theHTMLSanitizer from '../coreLib/HTMLSanitizer.js';
import { ZERO, ONE } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class MapLayer
@classdesc This class represent a background map
@desc A background map with all the properties
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class MapLayer	{

	#name = null;
	#service = null;
	#url = null;
	#wmsOptions = null;
	#bounds = null;
	#minZoom = null;
	#maxZoom = null;
	#toolbar = null;
	#providerName = null;
	#providerKeyNeeded = false;
	#attribution = null;
	#getCapabilitiesUrl = null;

	/*
	constructor
	*/

	/* eslint-disable-next-line complexity, max-statements */
	constructor ( jsonLayer ) {
		if ( jsonLayer.name && 'string' === typeof ( jsonLayer.name ) ) {
			this.#name = theHTMLSanitizer.sanitizeToJsString ( jsonLayer.name );
		}
		else {
			throw new Error ( 'invalid name for layer' );
		}
		if ( jsonLayer.service && ( 'wms' === jsonLayer.service || 'wmts' === jsonLayer.service ) ) {
			this.#service = jsonLayer.service;
		}
		else {
			throw new Error ( 'invalid service for layer ' + this.#name );
		}
		if ( jsonLayer.url && 'string' === typeof ( jsonLayer.url ) ) {
			this.#url = jsonLayer.url;
		}
		else {
			throw new Error ( 'invalid url for layer ' + this.#name );
		}
		if ( 'wms' === this.#service ) {
			if (
				jsonLayer.wmsOptions
				&&
				jsonLayer.wmsOptions.layers && 'string' === typeof ( jsonLayer.wmsOptions.layers )
				&&
				jsonLayer.wmsOptions.format && 'string' === typeof ( jsonLayer.wmsOptions.format )
				&&
				jsonLayer.wmsOptions.transparent && 'boolean' === typeof ( jsonLayer.wmsOptions.transparent )
			) {
				this.#wmsOptions = jsonLayer.wmsOptions;
				this.#wmsOptions.layers = theHTMLSanitizer.sanitizeToJsString ( this.#wmsOptions.layers );
				this.#wmsOptions.format = theHTMLSanitizer.sanitizeToJsString ( this.#wmsOptions.format );
			}
			else {
				throw new Error ( 'invalid wmsOptions for layer ' + this.#name );
			}
		}
		try {
			if (
				jsonLayer.bounds
				&&
				'number' === typeof jsonLayer.bounds [ ZERO ] [ ZERO ]
				&&
				'number' === typeof jsonLayer.bounds [ ZERO ] [ ONE ]
				&&
				'number' === typeof jsonLayer.bounds [ ONE ] [ ZERO ]
				&&
				'number' === typeof jsonLayer.bounds [ ONE ] [ ONE ]
			) {
				this.#bounds = jsonLayer.bounds;
			}
		}
		catch ( err ) {
			throw new Error ( 'invalid bounds for layer ' + this.#name );
		}
		if ( jsonLayer.minZoom && 'number' === typeof ( jsonLayer.minZoom ) ) {
			this.#minZoom = jsonLayer.minZoom;
		}
		if ( jsonLayer.maxZoom && 'number' === typeof ( jsonLayer.maxZoom ) ) {
			this.#maxZoom = jsonLayer.maxZoom;
		}
		if (
			jsonLayer.toolbar
			&&
			jsonLayer.toolbar.text && 'string' === typeof ( jsonLayer.toolbar.text )
			&&
			jsonLayer.toolbar.color && 'string' === typeof ( jsonLayer.toolbar.color )
			&&
			jsonLayer.toolbar.backgroundColor && 'string' === typeof ( jsonLayer.toolbar.backgroundColor )
		) {
			this.#toolbar = jsonLayer.toolbar;
			this.#toolbar.text = theHTMLSanitizer.sanitizeToJsString ( this.#toolbar.text );
			this.#toolbar.color =
				theHTMLSanitizer.sanitizeToColor ( this.#toolbar.color ) || '\u0023000000';
			this.#toolbar.backgroundColor =
				theHTMLSanitizer.sanitizeToColor ( this.#toolbar.backgroundColor ) || '\u0023ffffff';
		}
		else {
			throw new Error ( 'invalid toolbar for layer ' + this.#name );
		}
		if ( jsonLayer.providerName && 'string' === typeof ( jsonLayer.providerName ) ) {
			this.#providerName = theHTMLSanitizer.sanitizeToJsString ( jsonLayer.providerName );
		}
		else {
			throw new Error ( 'invalid providerName for layer ' + this.#name );
		}
		if ( 'boolean' === typeof ( jsonLayer.providerKeyNeeded ) ) {
			this.#providerKeyNeeded = jsonLayer.providerKeyNeeded;
		}
		else {
			throw new Error ( 'invalid providerKeyNeeded for layer ' + this.#name );
		}
		if ( '' === jsonLayer.attribution ) {
			this.#attribution = '';
		}
		else if ( jsonLayer.attribution && 'string' === typeof ( jsonLayer.attribution ) ) {
			this.#attribution = theHTMLSanitizer.sanitizeToHtmlString ( jsonLayer.attribution ).htmlString;
		}
		else {
			throw new Error ( 'invalid attribution for map layer ' + this.#name );
		}
		if ( jsonLayer.getCapabilitiesUrl && 'string' === typeof ( jsonLayer.getCapabilitiesUrl ) ) {

			this.#getCapabilitiesUrl = theHTMLSanitizer.sanitizeToUrl ( jsonLayer.getCapabilitiesUrl ).url;
			if ( '' === this.#getCapabilitiesUrl ) {
				throw new Error ( 'invalid getCapabilitiesUrl for map layer ' + this.#name );
			}
		}

		Object.freeze ( this );
	}

	/**
	The name of the map
	@type {string}
	*/

	get name ( ) { return this.#name; }

	/**
	The type of service: wms or wmts
	@type {string}
	*/

	get service ( ) { return this.#service; }

	/**
	The url to use to get the map
	@type {string}
	*/

	get url ( ) { return this.#url; }

	/**
	The wmsOptiond for this mapLayer
	See the Leaflet TileLayer.WMS documentation
	@type {object}
	*/

	get wmsOptions ( ) { return this.#wmsOptions; }

	/**
	The lower left and upper right corner of the mapLayer
	@type {Array.<number>}
	*/

	get bounds ( ) { return this.#bounds; }

	/**
	The smallest possible zoom for this mapLayer
	@type {number}
	*/

	get minZoom ( ) { return this.#minZoom; }

	/**
	The largest possible zoom for this mapLayer
	@type {number}
	*/

	get maxZoom ( ) { return this.#maxZoom; }

	/**
	An object with text, color and backgroundColor properties used to create the button in the toolbar
	@type {LayerToolbarButton}
	*/

	get toolbar ( ) { return this.#toolbar; }

	/**
	The name of the service provider. This name will be used to find the access key to the service.
	@type {string}
	*/

	get providerName ( ) { return this.#providerName; }

	/**
	When true, an access key is required to get the map.
	@type {boolean}
	*/

	get providerKeyNeeded ( ) { return this.#providerKeyNeeded; }

	/**
	The map attributions. For maps based on OpenStreetMap, it is not necessary to add
	the attributions of OpenStreetMap because they are always present in Travel & Notes.
	@type {string}
	*/

	get attribution ( ) { return this.#attribution; }

	/**
	The url of the getCapabilities file when it is known.
	@type {string}
	*/

	get getCapabilitiesUrl ( ) { return this.#getCapabilitiesUrl; }

}

export default MapLayer;

/**
--- End of MapLayer.js file ---------------------------------------------------------------------------------------------------
*/