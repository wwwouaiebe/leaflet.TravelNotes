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
Doc reviewed 20200822
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
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theEventDispatcher from '../util/EventDispatcher.js';
import { theAttributionsUI } from '../UI/AttributionsUI.js';
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import theGeoLocator from '../core/GeoLocator.js';
import Zoomer from '../core/Zoomer.js';
import { ZERO } from '../util/Constants.js';

let ourLayersToolbar = null;

let ourLayers = [
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

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnLayerButtonClick
@desc Click event listener for the layer buttons
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnLayerButtonClick ( clickEvent ) {
	clickEvent.stopPropagation ( );
	theEventDispatcher.dispatch ( 'layerchange', { layer : clickEvent.target.layer } );
	theAttributionsUI.attributions = clickEvent.target.layer.attribution;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnGeoLocationButtonClick
@desc Click event listener for the geo location button
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnGeoLocationButtonClick ( clickEvent ) {
	clickEvent.stopPropagation ( );
	theGeoLocator.switch ( );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnZoomButtonClick
@desc Click event listener for the zoom to travel button
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnZoomButtonClick ( clickEvent ) {
	clickEvent.stopPropagation ( );
	new Zoomer ( ).zoomToTravel ( );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourCreateLayerButton
@desc This method creates a layer button
@param {Layer} layer The layer for witch the button must be created
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourCreateLayerButton ( layer ) {
	theHTMLElementsFactory.create (
		'div',
		{
			className : 'TravelNotes-ViewerLayersToolbarUI-Button',
			title : layer.name,
			layer : layer,
			textContent : layer.toolbar.text,
			style : 'color:' + layer.toolbar.color + ';background-color:' + layer.toolbar.backgroundColor
		},
		ourLayersToolbar
	)
		.addEventListener ( 'click', ourOnLayerButtonClick, false );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class is the Layer Toolbar on the left of the viewer screen.
 Displays buttons to change the background maps and manages the background maps list.
 Displays also a geo location button and a zoom to travel button.
@see {@link theViewerLayersToolbarUI} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class ViewerLayersToolbarUI {

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	creates the user interface
	*/

	createUI ( ) {
		ourLayersToolbar = theHTMLElementsFactory.create (
			'div',
			{ id : 'TravelNotes-ViewerLayersToolbarUI' },
			document.body
		);

		// Don't test the https protocol. On some mobile devices with an integreted GPS
		// the geolocation is working also on http protocol
		let geoLocationButton = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-ViewerLayersToolbarUI-Button',
				title : 'My position',
				textContent : '🌐',
				style : 'color:black;background-color:white'
			},
			ourLayersToolbar
		);
		geoLocationButton.addEventListener ( 'click', ourOnGeoLocationButtonClick, false );
		let zoomButton = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-ViewerLayersToolbarUI-Button',
				title : 'Zoom on the travel',
				textContent : '🔍',
				style : 'color:black;background-color:white'
			},
			ourLayersToolbar
		);
		zoomButton.addEventListener ( 'click', ourOnZoomButtonClick, false );
		ourLayers.forEach ( ourCreateLayerButton );
	}

	/**
	Set a layer as background map. If the layer is not found, the 'OSM - Color' layer is set
	@param {string} layerName the name of the layer to set
	*/

	setLayer ( layerName ) {
		let newLayer =
			( layerName.match ( /^[0-9]$/ ) )
				?
				ourLayers [ Number.parseInt ( layerName ) ] || ourLayers [ ZERO ]
				:
				ourLayers.find ( layer => layer.name === layerName ) || ourLayers [ ZERO ];
		theEventDispatcher.dispatch ( 'layerchange', { layer : newLayer } );
		theAttributionsUI.attributions = newLayer.attribution;
	}

	/**
	Add a layer list to the list of available layers
	@param {Array.<Layer>} layers the layer list to add
	*/

	addLayers ( layers ) {
		layers.forEach (
			layer => {
				if ( ! layer.providerKeyNeeded ) {
					ourLayers.push ( layer );
				}
			}
		);
	}
}

const OUR_VIEWER_LAYERS_TOOLBAR_UI = new ViewerLayersToolbarUI ( );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of ViewerLayersToolbarUI class
	@type {ViewerLayersToolbarUI}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	OUR_VIEWER_LAYERS_TOOLBAR_UI as theViewerLayersToolbarUI
};

/*
--- End of ViewerLayersToolbarUI.js file --------------------------------------------------------------------------------------
*/