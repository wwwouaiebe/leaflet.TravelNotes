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

@file MapLayersCollection.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module data
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theAPIKeysManager from '../core/APIKeysManager.js';
import MapLayer from '../data/MapLayer.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class MapLayersCollection
@classdesc This class contains all the mapLayers
@see {@link theMapLayersCollection} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class MapLayersCollection {

	#mapLayers = new Map ( );
	#defaultMapLayer = null;
	#mapLayersAdded = false;

	/*
	constructor
	*/

	constructor ( ) {
		this.#defaultMapLayer = new MapLayer (
			{
				service : 'wmts',
				url : 'https://{s}.tile.osm.org/{z}/{x}/{y}.png',
				name : 'OSM - Color',
				toolbar :
				{
					text : 'OSM',
					color : '\u0023ff0000',
					backgroundColor : '\u0023ffffff'
				},
				providerName : 'OSM',
				providerKeyNeeded : false,
				attribution : ''
			}
		);
		this.#mapLayers.set ( this.#defaultMapLayer.name, this.#defaultMapLayer );
		Object.freeze ( this );
	}

	/**
	gives a MapLayer object
	@param {string} mapLayerName the name of the MapLayer to give
	@return {MapLayer} The asked MapLayer. If a provider key is needed and the key not available
	the defaultMapLayer is returned. If the layer is not found, the defaultMapLayer
	is returned
	*/

	getMapLayer ( mapLayerName ) {

		let theLayer = this.#mapLayers.get ( mapLayerName ) || this.#defaultMapLayer;
		if ( theLayer.providerKeyNeeded ) {
			if ( ! theAPIKeysManager.hasKey ( theLayer.providerName.toLowerCase ( ) ) ) {
				theLayer = this.#defaultMapLayer;
			}
		}

		return theLayer;
	}

	/**
	Executes a function on each MapLayer in the collection
	*/

	forEach ( fct ) { this.#mapLayers.forEach ( fct ); }

	/**
	Add a MapLayer list to the list of available MapLayers. This method can only be called once
	@param {Array.<Object>} layers the layer list to add (json object from TravelNotesLayers.json))
	*/

	addMapLayers ( jsonLayers ) {

		if ( this.#mapLayersAdded ) {
			return;
		}
		jsonLayers.forEach (
			jsonLayer => {
				let newLayer = new MapLayer ( jsonLayer );
				if ( ! this.#mapLayers.get ( newLayer.name ) ) {
					this.#mapLayers.set ( newLayer.name, newLayer );
				}
			}
		);
		this.#mapLayersAdded = true;
	}

	/**
	get the defaultMapLayer
	*/

	get defaultMapLayer ( ) { return this.#defaultMapLayer; }
}

const theMapLayersCollection = new MapLayersCollection ( );

export default theMapLayersCollection;

/*
--- End of MapLayersToolbarUI.js file -----------------------------------------------------------------------------------------
*/