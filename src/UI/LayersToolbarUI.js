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
	- v1.9.0:
		- issue #101 : Add a print command for a route
		- issue #103 : Review the attributions
	- v2.0.0:
		- Issue #134 : Remove node.setAttribute ( 'style', blablabla) in the code
		- Issue #135 : Remove innerHTML from code
		- Issue #142 : Transform the typedef layer to a class as specified in the layersToolbarUI.js
Doc reviewed 20200821
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file LayersToolbarUI.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

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
import { theEventDispatcher } from '../util/EventDispatcher.js';
import { theAttributionsUI } from '../UI/AttributionsUI.js';
import { newLayer } from '../data/Layer.js';

import { MOUSE_WHEEL_FACTORS, ZERO } from '../util/Constants.js';
const OUR_MIN_BUTTONS_VISIBLE = 3;

let ourLayers = [

	newLayer (
		{
			service : 'wmts',
			url : 'https://{s}.tile.osm.org/{z}/{x}/{y}.png',
			name : 'OSM - Color',
			toolbar :
			{
				text : 'OSM',
				color : '#ff0000',
				backgroundColor : '#ffffff'
			},
			providerName : 'OSM',
			providerKeyNeeded : false,
			attribution : ''
		}
	)

];

let ourTimerId = null;
let ourLayersToolbar = null;
let ourLayersToolbarButtonsDiv = null;
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

	mouseEnterEvent.target.style.color = mouseEnterEvent.target.layer.toolbar.backgroundColor;
	mouseEnterEvent.target.style[ 'background-color' ] = mouseEnterEvent.target.layer.toolbar.color;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnMouseLeaveLayerButton
@desc Event listener for the mouse leave on a layer button. Inverse the button color
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnMouseLeaveLayerButton ( mouseLeaveEvent ) {
	mouseLeaveEvent.target.style.color = mouseLeaveEvent.target.layer.toolbar.color;
	mouseLeaveEvent.target.style[ 'background-color' ] = mouseLeaveEvent.target.layer.toolbar.backgroundColor;
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
	theEventDispatcher.dispatch ( 'layerchange', { layer : clickEvent.target.layer } );
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
	if ( wheelEvent.deltaY ) {
		ourMarginTop -= wheelEvent.deltaY * MOUSE_WHEEL_FACTORS [ wheelEvent.deltaMode ];
		ourMarginTop = ourMarginTop > ourButtonTop ? ourButtonTop : ourMarginTop;
		ourMarginTop =
			ourMarginTop < ourButtonTop - ourButtonsHeight +
			( OUR_MIN_BUTTONS_VISIBLE * ourButtonHeight )
				?
				ourButtonTop - ourButtonsHeight + ( OUR_MIN_BUTTONS_VISIBLE * ourButtonHeight )
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
	if ( layer.providerKeyNeeded && ! theAPIKeysManager.hasKey ( layer.providerName.toLowerCase ( ) ) ) {
		return;
	}
	let layerButton = theHTMLElementsFactory.create (
		'div',
		{
			type : 'layer',
			className : 'TravelNotes-LayersToolbarUI-Button',
			title : layer.name,
			layer : layer,
			textContent : layer.toolbar.text,
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

function ourCreateLinkButton ( href, title, textContent ) {
	let linkButton = theHTMLElementsFactory.create (
		'div',
		{
			type : 'link',
			className : 'TravelNotes-LayersToolbarUI-Button TravelNotes-LayersToolbarUI-LinkButton-Leave'
		},
		ourLayersToolbarButtonsDiv
	);
	theHTMLElementsFactory.create (
		'a',
		{
			href : href,
			title : title,
			textContent : textContent,
			target : '_blank'
		},
		linkButton
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
			'Reminder! The devil will know everything about you',
			'👿'
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

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	creates the user interface
	*/

	createUI ( ) {
		ourLayersToolbar = theHTMLElementsFactory.create ( 'div', { id : 'TravelNotes-LayersToolbarUI' }, document.body );
		theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-LayersToolbarUI-Header',
				textContent : theTranslator.getText ( 'LayersToolbarUI - Layers' )
			},
			ourLayersToolbar
		);
		ourLayersToolbar.addEventListener ( 'mouseenter', ourOnMouseEnterToolbar, false );
		ourLayersToolbar.addEventListener ( 'mouseleave', ourOnMouseLeaveToolbar, false );
		theEventDispatcher.dispatch ( 'layerchange', { layer : ourLayers [ ZERO ] } );
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
		let theLayer = ourLayers.find ( layer => layer.name === layerName ) || ourLayers [ ZERO ];
		if ( theLayer.providerKeyNeeded ) {
			if ( ! theAPIKeysManager.hasKey ( theLayer.providerName.toLowerCase ( ) ) ) {
				theLayer = ourLayers [ ZERO ];
			}
		}
		return theLayer;
	}

	/**
	Set a layer as background map. If a provider key is needed and the key not available
	the 'OSM - Color' layer is set. If the layer is not found, the 'OSM - Color' layer
	is set
	@param {string} layerName the name of the layer to set
	*/

	setLayer ( layerName ) {
		let theLayer = ourLayers.find ( layer => layer.name === layerName ) || ourLayers [ ZERO ];
		if ( theLayer.providerKeyNeeded ) {
			if ( ! theAPIKeysManager.hasKey ( theLayer.providerName.toLowerCase ( ) ) ) {
				theLayer = ourLayers [ ZERO ];
			}
		}
		theEventDispatcher.dispatch ( 'layerchange', { layer : theLayer } );
		theAttributionsUI.attributions = theLayer.attribution;
		theTravelNotesData.travel.layerName = theLayer.name;
	}

	/**
	Add a layer list to the list of available layers
	@param {Array.<Layer>} layers the layer list to add
	*/

	addLayers ( jsonLayers ) {
		jsonLayers.forEach (
			jsonLayer => { ourLayers.push ( newLayer ( jsonLayer ) ); }
		);
	}
}

const OUR_LAYERS_TOOLBAR_UI = new LayersToolbarUI ( );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of LayersToolbarUI class
	@type {LayersToolbarUI}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	OUR_LAYERS_TOOLBAR_UI as theLayersToolbarUI
};

/*
--- End of LayersToolbarUI.js file --------------------------------------------------------------------------------------------
*/