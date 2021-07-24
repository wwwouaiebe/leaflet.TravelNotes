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
		- Issue ♯101 : Add a print command for a route
		- Issue ♯103 : Review the attributions
	- v2.0.0:
		- Issue ♯134 : Remove node.setAttribute ( 'style', blablabla) in the code
		- Issue ♯135 : Remove innerHTML from code
		- Issue ♯142 : Transform the typedef layer to a class as specified in the layersToolbarUI.js
Doc reviewed 20200821
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file MapLayersToolbarUI.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module MapLayersToolbarUI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import { theTranslator } from '../UI/Translator.js';
import theConfig from '../data/Config.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import theAPIKeysManager from '../core/APIKeysManager.js';
import theEventDispatcher from '../util/EventDispatcher.js';
import theAttributionsUI from '../UI/AttributionsUI.js';
import theMapLayersCollection from '../data/MapLayersCollection.js';

import { MOUSE_WHEEL_FACTORS, ZERO } from '../util/Constants.js';

const OUR_MIN_BUTTONS_VISIBLE = 3;

/**
@------------------------------------------------------------------------------------------------------------------------------

@class LayerButtonEventListeners
@classdesc This class contains the event listeners for the layer buttons
@hideconstructor
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

class LayerButtonEventListeners {

	/**
	Mouse enter event listener. Inverse the button color
	*/

	static onMouseEnter ( mouseEnterEvent ) {

		mouseEnterEvent.target.style.color = mouseEnterEvent.target.layer.toolbar.backgroundColor;
		mouseEnterEvent.target.style[ 'background-color' ] = mouseEnterEvent.target.layer.toolbar.color;
	}

	/**
	Mouse leave event listener. Inverse the button color
	*/

	static onMouseLeave ( mouseLeaveEvent ) {
		mouseLeaveEvent.target.style.color = mouseLeaveEvent.target.layer.toolbar.color;
		mouseLeaveEvent.target.style[ 'background-color' ] = mouseLeaveEvent.target.layer.toolbar.backgroundColor;
	}

	/**
	Mouse click event listener. Change the background map
	*/

	static onClick ( clickEvent ) {
		theEventDispatcher.dispatch ( 'layerchange', { layer : clickEvent.target.layer } );
		theAttributionsUI.attributions = clickEvent.target.layer.attribution;
		theTravelNotesData.travel.layerName = clickEvent.target.layer.name;
	}

}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class LinkButtonEventListeners
@classdesc This class contains the event listeners for the link buttons
@hideconstructor
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

class LinkButtonEventListeners {

	/**
	Mouse enter event listener. Inverse the button color
	*/

	static onMouseEnter ( mouseEnterEvent ) {
		mouseEnterEvent.target.classList.add ( 'TravelNotes-MapLayersToolbarUI-LinkButton-Enter' );
		mouseEnterEvent.target.classList.remove ( 'TravelNotes-MapLayersToolbarUI-LinkButton-Leave' );
	}

	/**
	Mouse leave event listener. Inverse the button color
	*/

	static onMouseLeave ( mouseLeaveEvent ) {
		mouseLeaveEvent.target.classList.add ( 'TravelNotes-MapLayersToolbarUI-LinkButton-Leave' );
		mouseLeaveEvent.target.classList.remove ( 'TravelNotes-MapLayersToolbarUI-LinkButton-Enter' );
	}

}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class ToolbarEventListeners
@classdesc This class contains the event listeners for the toolbar
@hideconstructor
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

class ToolbarEventListeners {

	static #marginTop = ZERO;
	static #buttonHeight = ZERO;
	static #buttonsHeight = ZERO;
	static #buttonTop = ZERO;
	static #timerId = null;
	static #layersToolbarButtonsDiv = null;

	static #getMapLayersToolbar ( ) { return document.getElementById ( 'TravelNotes-MapLayersToolbarUI' ); }

	/**
	Create a button for a layer on the toolbar
	@param {Layer} layer The layer for witch the button must be created
	@private
	*/

	static #createLayerButton ( layer ) {
		if ( layer.providerKeyNeeded && ! theAPIKeysManager.hasKey ( layer.providerName.toLowerCase ( ) ) ) {
			return;
		}
		let layerButton = theHTMLElementsFactory.create (
			'div',
			{
				type : 'layer',
				className : 'TravelNotes-MapLayersToolbarUI-Button',
				title : layer.name,
				layer : layer,
				textContent : layer.toolbar.text,
				style : 'color:' + layer.toolbar.color + ';background-color:' + layer.toolbar.backgroundColor
			},
			ToolbarEventListeners.#layersToolbarButtonsDiv
		);
		layerButton.addEventListener ( 'mouseenter', LayerButtonEventListeners.onMouseEnter, false );
		layerButton.addEventListener ( 'mouseleave', LayerButtonEventListeners.onMouseLeave, false );
		layerButton.addEventListener ( 'click', LayerButtonEventListeners.onClick, false );
		ToolbarEventListeners.#buttonHeight = layerButton.clientHeight;
		ToolbarEventListeners.#buttonsHeight += ToolbarEventListeners.#buttonHeight;
	}

	/**
	Create a button for a link (the devil) on the toolbar
	@param {string} href The href of the link to add in the button
	@param {string} title The title of the link to add in the button
	@param {string} text The text to be displayed in the button
	@private
	*/

	static #createLinkButton ( href, title, textContent ) {
		let linkButton = theHTMLElementsFactory.create (
			'div',
			{
				type : 'link',
				className : 'TravelNotes-MapLayersToolbarUI-Button TravelNotes-MapLayersToolbarUI-LinkButton-Leave'
			},
			ToolbarEventListeners.#layersToolbarButtonsDiv
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

		linkButton.addEventListener ( 'mouseenter', LinkButtonEventListeners.onMouseEnter, false );
		linkButton.addEventListener ( 'mouseleave', LinkButtonEventListeners.onMouseLeave, false );
		ToolbarEventListeners.#buttonsHeight += linkButton.clientHeight;
	}

	/**
	Mouse wheel event listener. Scroll the toolbar
	*/

	static onWheel ( wheelEvent ) {
		if ( wheelEvent.deltaY ) {
			ToolbarEventListeners.#marginTop -= wheelEvent.deltaY * MOUSE_WHEEL_FACTORS [ wheelEvent.deltaMode ];
			ToolbarEventListeners.#marginTop =
				ToolbarEventListeners.#marginTop > ToolbarEventListeners.#buttonTop
					?
					ToolbarEventListeners.#buttonTop
					:
					ToolbarEventListeners.#marginTop;
			ToolbarEventListeners.#marginTop =
				ToolbarEventListeners.#marginTop < ToolbarEventListeners.#buttonTop - ToolbarEventListeners.#buttonsHeight +
				( OUR_MIN_BUTTONS_VISIBLE * ToolbarEventListeners.#buttonHeight )
					?
					(
						ToolbarEventListeners.#buttonTop -
						ToolbarEventListeners.#buttonsHeight +
						( OUR_MIN_BUTTONS_VISIBLE * ToolbarEventListeners.#buttonHeight )
					)
					:
					ToolbarEventListeners.#marginTop;
			ToolbarEventListeners.#layersToolbarButtonsDiv.style.marginTop = String ( ToolbarEventListeners.#marginTop ) + 'px';
		}
		wheelEvent.stopPropagation ( );
	}

	/**
	Mouse enter event listener. Creates and show the buttons
	*/

	static onMouseEnter ( ) {
		if ( ToolbarEventListeners.#timerId ) {
			clearTimeout ( ToolbarEventListeners.#timerId );
			ToolbarEventListeners.#timerId = null;
			return;
		}
		ToolbarEventListeners.#layersToolbarButtonsDiv = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-MapLayersToolbarUI-Buttons'
			},
			ToolbarEventListeners.#getMapLayersToolbar ( )
		);
		ToolbarEventListeners.#buttonTop = ToolbarEventListeners.#getMapLayersToolbar ( ).clientHeight;
		ToolbarEventListeners.#buttonsHeight = ZERO;
		theMapLayersCollection.forEach ( layer => ToolbarEventListeners.#createLayerButton ( layer ) );
		if ( theConfig.layersToolbarUI.theDevil && theConfig.layersToolbarUI.theDevil.addButton ) {
			ToolbarEventListeners.#createLinkButton (
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
		ToolbarEventListeners.#buttonTop += ToolbarEventListeners.#buttonHeight;
		ToolbarEventListeners.#marginTop = ToolbarEventListeners.#buttonTop;
		ToolbarEventListeners.#layersToolbarButtonsDiv.style.marginTop = String ( ToolbarEventListeners.#marginTop ) + 'px';
		ToolbarEventListeners.#layersToolbarButtonsDiv.addEventListener ( 'wheel', ToolbarEventListeners.onWheel, false );
	}

	/**
	Timeout event listener. Hide the toolbar
	*/

	static onTimeout ( ) {
		let buttons = ToolbarEventListeners.#layersToolbarButtonsDiv.childNodes;
		for ( let counter = 0; counter < buttons.length; counter ++ ) {
			if ( 'layer' === buttons [ counter ].type ) {
				buttons [ counter ].removeEventListener ( 'mouseenter', LayerButtonEventListeners.onMouseEnter, false );
				buttons [ counter ].removeEventListener ( 'mouseleave', LayerButtonEventListeners.onMouseLeave, false );
				buttons [ counter ].removeEventListener ( 'click', LayerButtonEventListeners.onClick, false );
			}
			else {
				buttons [ counter ].removeEventListener ( 'mouseenter', LinkButtonEventListeners.onMouseEnter, false );
				buttons [ counter ].removeEventListener ( 'mouseleave', LinkButtonEventListeners.onMouseEnter, false );
			}
		}
		ToolbarEventListeners.#layersToolbarButtonsDiv.removeEventListener ( 'wheel', ToolbarEventListeners.onWheel, false );
		ToolbarEventListeners.#getMapLayersToolbar ( ).removeChild ( ToolbarEventListeners.#layersToolbarButtonsDiv );
		ToolbarEventListeners.#timerId = null;
	}

	/**
	Mouse leave event listener. Start the timer.
	*/

	static onMouseLeave ( ) {
		ToolbarEventListeners.#timerId =
			setTimeout ( ToolbarEventListeners.onTimeout, theConfig.layersToolbarUI.toolbarTimeOut );
	}

}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class is the Layer Toolbar on the left of the screen.
Displays buttons to change the background maps and manages the background maps list
@see {@link theMapLayersToolbarUI} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class MapLayersToolbarUI {

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	creates the user interface
	*/

	createUI ( ) {
		let layersToolbar = theHTMLElementsFactory.create ( 'div', { id : 'TravelNotes-MapLayersToolbarUI' }, document.body );
		theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-MapLayersToolbarUI-Header',
				textContent : theTranslator.getText ( 'MapLayersToolbarUI - Layers' )
			},
			layersToolbar
		);
		layersToolbar.addEventListener ( 'mouseenter', ToolbarEventListeners.onMouseEnter, false );
		layersToolbar.addEventListener ( 'mouseleave', ToolbarEventListeners.onMouseLeave, false );
		theEventDispatcher.dispatch ( 'layerchange', { layer : theMapLayersCollection.defaultMapLayer } );
		theAttributionsUI.attributions = theMapLayersCollection.defaultMapLayer.attribution;
	}

	/**
	Set a mapLayer as background map. If a provider key is needed and the key not available
	the 'OSM - Color' mapLayer is set. If the mapLayer is not found, the 'OSM - Color' mapLayer
	is set
	@param {string} mapLayerName the name of the mapLayer to set
	*/

	setMapLayer ( mapLayerName ) {
		let theLayer = theMapLayersCollection.getMapLayer ( mapLayerName );
		theEventDispatcher.dispatch ( 'layerchange', { layer : theLayer } );
		theAttributionsUI.attributions = theLayer.attribution;
		theTravelNotesData.travel.layerName = theLayer.name;
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@desc The one and only one instance of MapLayersToolbarUI class
@type {MapLayersToolbarUI}
@constant
@global

@------------------------------------------------------------------------------------------------------------------------------
*/

const theMapLayersToolbarUI = new MapLayersToolbarUI ( );

export default theMapLayersToolbarUI;

/*
--- End of MapLayersToolbarUI.js file -----------------------------------------------------------------------------------------
*/