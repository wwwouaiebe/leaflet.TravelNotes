/*
Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/

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
	- v1.9.0:
		- issue #101 : Add a print command for a route
		- issue #103 : Review the attributions
Doc reviewed 20200821
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file LayersToolbarUI.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
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

@typedef {Object} Layer
@todo Creates a class for this and do some verifications on the data. They are coming
from a file given by the user! After verification freeze the object.
@desc A background map with all the properties
@property {string} service The type of service: wms or wmts
@property {string} url The url to use to get the map
@property {Object} wmsOptions See the Leaflet TileLayer.WMS documentation
@property {Array.<number>} bounds The lower left and upper right corner of the map
@property {number} minZoom The smallest possible zoom for this map
@property {number} maxZoom The largest possible zoom for this map
@property {string} name The name of the map
@property {LayerToolbarButton} toolbar An object with text, color and backgroundColor properties used to create
the button in the toolbar
@property {string} providerName The name of the service provider. This name will be used to find the access key to the service.
@property {booolean} providerKeyNeeded When true, an access key is required to get the map.
@property {string} attribution The map attributions. For maps based on OpenStreetMap, it is not necessary to add
the attributions of OpenStreetMap because they are always present in Travel & Notes.
@property {string} getCapabilitiesUrl The url of the getCapabilities file when it is known.
@public

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module LayersToolbarUI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { theTranslator } from '../UI/Translator.js';
import { theConfig } from '../data/Config.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theAPIKeysManager } from '../core/APIKeysManager.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';
import { theAttributionsUI } from '../UI/AttributionsUI.js';

import { MOUSE_WHEEL_FACTORS, ZERO } from '../util/Constants.js';

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

let ourTimerId = null;
let ourLayersToolbar = null;
let ourLayersToolbarButtonsDiv = null;
let ourEventDispatcher = newEventDispatcher ( );
let ourMarginTop = ZERO;
let ourButtonHeight = ZERO;
let ourButtonsHeight = ZERO;
let ourButtonTop = ZERO;

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnMouseEnterLayerButton
@desc Event listener for the mouse enter on a layer button. Inverse the button color
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnMouseEnterLayerButton ( mouseEnterEvent ) {
	mouseEnterEvent.target.setAttribute (
		'style',
		'color:' +
			mouseEnterEvent.target.layer.toolbar.backgroundColor +
			';background-color:' +
			mouseEnterEvent.target.layer.toolbar.color
	);
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnMouseLeaveLayerButton
@desc Event listener for the mouse leave on a layer button. Inverse the button color
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnMouseLeaveLayerButton ( mouseLeaveEvent ) {
	mouseLeaveEvent.target.setAttribute (
		'style',
		'color:' +
			mouseLeaveEvent.target.layer.toolbar.color +
			';background-color:' +
			mouseLeaveEvent.target.layer.toolbar.backgroundColor
	);
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnMouseEnterLinkButton
@desc Event listener for the mouse enter on a link button. Inverse the button color
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnMouseEnterLinkButton ( mouseEnterEvent ) {
	mouseEnterEvent.target.classList.add ( 'TravelNotes-LayersToolbarUI-LinkButton-Enter' );
	mouseEnterEvent.target.classList.remove ( 'TravelNotes-LayersToolbarUI-LinkButton-Leave' );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnClickLayerButton
@desc Event listener for the mouse click on a link button. change the background map to this layer
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnClickLayerButton ( clickEvent ) {
	ourEventDispatcher.dispatch ( 'layerchange', { layer : clickEvent.target.layer } );
	theAttributionsUI.attributions = clickEvent.target.layer.attribution;
	theTravelNotesData.travel.layerName = clickEvent.target.layer.name;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnMouseLeaveLinkButton
@desc Event listener for the mouse leave on a link button. Inverse the button color
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnMouseLeaveLinkButton ( mouseLeaveEvent ) {
	mouseLeaveEvent.target.classList.add ( 'TravelNotes-LayersToolbarUI-LinkButton-Leave' );
	mouseLeaveEvent.target.classList.remove ( 'TravelNotes-LayersToolbarUI-LinkButton-Enter' );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnMouseLeaveLinkButton
@desc Event listener for the mouse wheel on the toolbar. Scroll the toolbar
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnWheelToolbar ( wheelEvent ) {
	const MIN_BUTTONS_VISIBLE = 3;
	if ( wheelEvent.deltaY ) {
		ourMarginTop -= wheelEvent.deltaY * MOUSE_WHEEL_FACTORS [ wheelEvent.deltaMode ];
		ourMarginTop = ourMarginTop > ourButtonTop ? ourButtonTop : ourMarginTop;
		ourMarginTop =
			ourMarginTop < ourButtonTop - ourButtonsHeight +
			( MIN_BUTTONS_VISIBLE * ourButtonHeight )
				?
				ourButtonTop - ourButtonsHeight + ( MIN_BUTTONS_VISIBLE * ourButtonHeight )
				:
				ourMarginTop;
		ourLayersToolbarButtonsDiv.style.marginTop = String ( ourMarginTop ) + 'px';
	}
	wheelEvent.stopPropagation ( );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnMouseLeaveLinkButton
@desc Event listener on the timeout after a mouse leave the toolbar. Hide the toolbar
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnTimeOutToolbar ( ) {
	let buttons = ourLayersToolbarButtonsDiv.childNodes;
	for ( let counter = 0; counter < buttons.length; counter ++ ) {
		if ( 'layer' === buttons [ counter ].type ) {
			buttons [ counter ].removeEventListener ( 'mouseenter', ourOnMouseEnterLayerButton, false );
			buttons [ counter ].removeEventListener ( 'mouseleave', ourOnMouseLeaveLayerButton, false );
			buttons [ counter ].removeEventListener ( 'click', ourOnClickLayerButton, false );
		}
		else {
			buttons [ counter ].removeEventListener ( 'mouseenter', ourOnMouseEnterLinkButton, false );
			buttons [ counter ].removeEventListener ( 'mouseleave', ourOnMouseEnterLinkButton, false );
		}
	}
	ourLayersToolbarButtonsDiv.removeEventListener ( 'wheel', ourOnWheelToolbar, false );
	ourLayersToolbar.removeChild ( ourLayersToolbarButtonsDiv );
	ourTimerId = null;
}

function ourOnMouseLeaveToolbar ( ) {
	ourTimerId = setTimeout ( ourOnTimeOutToolbar, theConfig.layersToolbarUI.toolbarTimeOut );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourCreateLayerButton
@desc Create a button for a layer on the toolbar
@param {Layer} layer The layer for witch the button must be created
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourCreateLayerButton ( layer ) {
	if ( layer.providerKeyNeeded && ! theAPIKeysManager.getKey ( layer.providerName.toLowerCase ( ) ) ) {
		return;
	}
	let layerButton = theHTMLElementsFactory.create (
		'div',
		{
			type : 'layer',
			className : 'TravelNotes-LayersToolbarUI-Button',
			title : layer.name,
			layer : layer,
			innerHTML : layer.toolbar.text,
			style : 'color:' + layer.toolbar.color + ';background-color:' + layer.toolbar.backgroundColor
		},
		ourLayersToolbarButtonsDiv
	);
	layerButton.addEventListener ( 'mouseenter', ourOnMouseEnterLayerButton, false );
	layerButton.addEventListener ( 'mouseleave', ourOnMouseLeaveLayerButton, false );
	layerButton.addEventListener ( 'click', ourOnClickLayerButton, false );
	ourButtonHeight = layerButton.clientHeight;
	ourButtonsHeight += ourButtonHeight;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourCreateLinkButton
@desc Create a button for a link (the devil) on the toolbar
@param {string} href The href of the link to add in the button
@param {string} title The title of the link to add in the button
@param {string} text The text to be displayed in the button
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourCreateLinkButton ( href, title, text ) {
	let linkButton = theHTMLElementsFactory.create (
		'div',
		{
			type : 'link',
			className : 'TravelNotes-LayersToolbarUI-Button TravelNotes-LayersToolbarUI-LinkButton-Leave',
			innerHTML : '<a href="' + href + '" title="' + title + '" target="_blank">' + text + '</a>'
		},
		ourLayersToolbarButtonsDiv
	);
	linkButton.addEventListener ( 'mouseenter', ourOnMouseEnterLinkButton, false );
	linkButton.addEventListener ( 'mouseleave', ourOnMouseLeaveLinkButton, false );
	ourButtonsHeight += linkButton.clientHeight;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnMouseEnterToolbar
@desc Event listener on the mouse enter on the toolbar. Creates and show the buttons
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnMouseEnterToolbar ( ) {
	if ( ourTimerId ) {
		clearTimeout ( ourTimerId );
		ourTimerId = null;
		return;
	}
	ourLayersToolbarButtonsDiv = theHTMLElementsFactory.create (
		'div',
		{
			id : 'TravelNotes-LayersToolbarUI-Buttons'
		},
		ourLayersToolbar
	);
	ourButtonTop = ourLayersToolbar.clientHeight;
	ourButtonsHeight = ZERO;
	ourLayers.forEach ( layer => ourCreateLayerButton ( layer ) );
	if ( theConfig.layersToolbarUI.theDevil && theConfig.layersToolbarUI.theDevil.addButton ) {
		ourCreateLinkButton (
			'https://www.google.com/maps/@' +
				theTravelNotesData.map.getCenter ( ).lat +
				',' +
				theTravelNotesData.map.getCenter ( ).lng +
				',' +
				theTravelNotesData.map.getZoom ( ) +
				'z',
			theConfig.layersToolbarUI.theDevil.title,
			theConfig.layersToolbarUI.theDevil.text
		);
	}
	ourButtonTop += ourButtonHeight;
	ourMarginTop = ourButtonTop;
	ourLayersToolbarButtonsDiv.style.marginTop = String ( ourMarginTop ) + 'px';
	ourLayersToolbarButtonsDiv.addEventListener ( 'wheel', ourOnWheelToolbar, false );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class is the Layer Toolbar on the left of the screen.
Displays buttons to change the background maps and manages the background maps list
@see {@link theLayersToolbarUI} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class LayersToolbarUI {

	/**
	creates the user interface
	*/

	createUI ( ) {
		ourLayersToolbar = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-LayersToolbarUI'
			},
			document.querySelector ( 'body' )
		);
		theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-LayersToolbarUI-Header',
				innerHTML : theTranslator.getText ( 'LayersToolbarUI - Layers' )
			},
			ourLayersToolbar
		);
		ourLayersToolbar.addEventListener ( 'mouseenter', ourOnMouseEnterToolbar, false );
		ourLayersToolbar.addEventListener ( 'mouseleave', ourOnMouseLeaveToolbar, false );
		ourEventDispatcher.dispatch ( 'layerchange', { layer : ourLayers [ ZERO ] } );
		theAttributionsUI.attributions = ourLayers [ ZERO ].attribution;
	}

	/**
	gives a layer object
	@param {string} layerName the name of the layer to given
	@return {Layer} The asked layer. If a provider key is needed and the key not available
	the 'OSM - Color' layer is returned. If the layer is not found, the 'OSM - Color' layer
	is returned
	*/

	getLayer ( layerName ) {
		let newLayer = ourLayers.find ( layer => layer.name === layerName ) || ourLayers [ ZERO ];
		if ( newLayer.providerKeyNeeded ) {
			let providerKey = theAPIKeysManager.getKey ( newLayer.providerName.toLowerCase ( ) );
			if ( ! providerKey ) {
				newLayer = ourLayers [ ZERO ];
			}
		}
		return newLayer;
	}

	/**
	Set a layer as background map. If a provider key is needed and the key not available
	the 'OSM - Color' layer is set. If the layer is not found, the 'OSM - Color' layer
	is set
	@param {string} layerName the name of the layer to set
	*/

	setLayer ( layerName ) {
		let newLayer = ourLayers.find ( layer => layer.name === layerName ) || ourLayers [ ZERO ];
		if ( newLayer.providerKeyNeeded ) {
			let providerKey = theAPIKeysManager.getKey ( newLayer.providerName.toLowerCase ( ) );
			if ( ! providerKey ) {
				newLayer = ourLayers [ ZERO ];
			}
		}
		ourEventDispatcher.dispatch ( 'layerchange', { layer : newLayer } );
		theAttributionsUI.attributions = newLayer.attribution;
		theTravelNotesData.travel.layerName = newLayer.name;
	}

	/**
	Add a layer list to the list of available layers
	@param {Array.<Layer>} layers the layer list to add
	*/

	addLayers ( layers ) {
		ourLayers = ourLayers.concat ( layers );
	}
}

const ourLayersToolbarUI = Object.freeze ( new LayersToolbarUI );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of LayersToolbarUI class
	@type {LayersToolbarUI}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourLayersToolbarUI as theLayersToolbarUI
};

/*
--- End of LayersToolbarUI.js file --------------------------------------------------------------------------------------------
*/