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
	- v1.12.0:
		- Issue ♯120 : Review the UserInterface
	- v2.0.0:
		- Issue ♯135 : Remove innerHTML from code
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file ViewerLayersToolbarUI.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module ViewerLayersToolbarUI

@------------------------------------------------------------------------------------------------------------------------------
*/

import theEventDispatcher from '../coreLib/EventDispatcher.js';
import theAttributionsUI from '../attributionsUI/AttributionsUI.js';
import theHTMLElementsFactory from '../UILib/HTMLElementsFactory.js';
import theGeoLocator from '../core/GeoLocator.js';
import Zoomer from '../core/Zoomer.js';
import { ZERO } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class MapLayerButtonClickEL
@classdesc Click event listener for the map layer buttons
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class MapLayerButtonClickEL {

	#mapLayers = null;

	/*
	constructor
	*/

	constructor ( mapLayers ) {
		Object.freeze ( this );
		this.#mapLayers = mapLayers;
	}

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		let mapLayer = this.#mapLayers [ Number.parseInt ( clickEvent.target.dataset.tanMapLayerId ) ];
		theEventDispatcher.dispatch ( 'layerchange', { layer : mapLayer } );
		theAttributionsUI.attributions = mapLayer.attribution;
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class GeoLocationButtonClickEL
@classdesc Click event listener for the geo location button
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class GeoLocationButtonClickEL {

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		theGeoLocator.switch ( );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class ZoomButtonClickEL
@classdesc Click event listener for the zoom to travel button
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class ZoomButtonClickEL {

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		new Zoomer ( ).zoomToTravel ( );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class ViewerLayersToolbarUI
@classdesc This class is the Layer Toolbar on the left of the viewer screen.
 Displays buttons to change the background maps and manages the background maps list.
 Displays also a geo location button and a zoom to travel button.
@see {@link theViewerLayersToolbarUI} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class ViewerLayersToolbarUI {

	#mapLayersToolbar = null;

	#mapLayers = [
		{
			service : 'wmts',
			url : 'https://{s}.tile.osm.org/{z}/{x}/{y}.png',
			name : 'OSM - Color',
			toolbar :
			{
				text : 'OSM',
				color : 'red',
				backgroundColor : 'white'
			},
			providerName : 'OSM',
			providerKeyNeeded : false,
			attribution : ''
		}
	];

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	creates the user interface
	*/

	createUI ( ) {
		this.#mapLayersToolbar = theHTMLElementsFactory.create (
			'div',
			{ id : 'TravelNotes-ViewerLayersToolbarUI' },
			document.body
		);

		// Don't test the https protocol. On some mobile devices with an integreted GPS
		// the geolocation is working also on http protocol
		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-ViewerLayersToolbarUI-Button',
				title : 'My position',
				textContent : '🌐',
				style : 'color:black;background-color:white'
			},
			this.#mapLayersToolbar
		).addEventListener ( 'click', new GeoLocationButtonClickEL ( ), false );

		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-ViewerLayersToolbarUI-Button',
				title : 'Zoom on the travel',
				textContent : '🔍',
				style : 'color:black;background-color:white'
			},
			this.#mapLayersToolbar
		).addEventListener ( 'click', new ZoomButtonClickEL ( ), false );

		let clickMapLayerButtonEventListener = new MapLayerButtonClickEL ( this.#mapLayers );
		for ( let mapLayerCounter = 0; mapLayerCounter < this.#mapLayers.length; mapLayerCounter ++ ) {
			let mapLayer = this.#mapLayers [ mapLayerCounter ];
			theHTMLElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-ViewerLayersToolbarUI-Button',
					title : mapLayer.name,
					dataset : { MapLayerId : mapLayerCounter },
					textContent : mapLayer.toolbar.text,
					style : 'color:' + mapLayer.toolbar.color + ';background-color:' + mapLayer.toolbar.backgroundColor
				},
				this.#mapLayersToolbar
			).addEventListener ( 'click', clickMapLayerButtonEventListener, false );
		}
	}

	/**
	Set a layer as background map. If the layer is not found, the 'OSM - Color' layer is set
	@param {string} layerName the name of the layer to set
	*/

	setMapLayer ( layerName ) {
		let newLayer =
			( layerName.match ( /^[0-9]$/ ) )
				?
				this.#mapLayers [ Number.parseInt ( layerName ) ] || this.#mapLayers [ ZERO ]
				:
				this.#mapLayers.find ( layer => layer.name === layerName ) || this.#mapLayers [ ZERO ];
		theEventDispatcher.dispatch ( 'layerchange', { layer : newLayer } );
		theAttributionsUI.attributions = newLayer.attribution;
	}

	/**
	Add a layer list to the list of available layers
	@param {Array.<Layer>} layers the layer list to add
	*/

	addMapLayers ( mapLayers ) {
		mapLayers.forEach (
			mapLayer => {
				if ( ! mapLayer.providerKeyNeeded ) {
					this.#mapLayers.push ( mapLayer );
				}
			}
		);
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@desc The one and only one instance of ViewerLayersToolbarUI class
@type {ViewerLayersToolbarUI}
@constant
@global

@------------------------------------------------------------------------------------------------------------------------------
*/

const theViewerLayersToolbarUI = new ViewerLayersToolbarUI ( );

export default theViewerLayersToolbarUI;

/*
--- End of ViewerLayersToolbarUI.js file --------------------------------------------------------------------------------------
*/