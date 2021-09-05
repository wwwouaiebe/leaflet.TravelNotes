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
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
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

@module mapLayersToolbarUI

@------------------------------------------------------------------------------------------------------------------------------
*/

import theHTMLElementsFactory from '../UILib/HTMLElementsFactory.js';
import theTranslator from '../UILib/Translator.js';
import theConfig from '../data/Config.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import theEventDispatcher from '../coreLib/EventDispatcher.js';
import theAttributionsUI from '../attributionsUI/AttributionsUI.js';
import theMapLayersCollection from '../data/MapLayersCollection.js';
import MapLayersToolbarButton from '../mapLayersToolbarUI/MapLayersToolbarButton.js';
import MapLayersToolbarLink from '../mapLayersToolbarUI/MapLayersToolbarLink.js';
import theAPIKeysManager from '../core/APIKeysManager.js';

import { MOUSE_WHEEL_FACTORS, ZERO } from '../main/Constants.js';

const OUR_MIN_BUTTONS_VISIBLE = 3;

/**
@------------------------------------------------------------------------------------------------------------------------------

@class ButtonsContainerWheelEL
@classdesc Wheel event listeners on the map layer buttons. Scroll the buttons
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class ButtonsContainerWheelEL {

	#mapLayersToolbarUI = null;

	#wheelEventData = null;

	/*
	constructor
	*/

	constructor ( mapLayersToolbarUI, wheelEventData ) {
		Object.freeze ( this );
		this.#mapLayersToolbarUI = mapLayersToolbarUI;
		this.#wheelEventData = wheelEventData;
	}

	handleEvent ( wheelEvent ) {
		wheelEvent.stopPropagation ( );
		if ( wheelEvent.deltaY ) {
			this.#wheelEventData.marginTop -= wheelEvent.deltaY * MOUSE_WHEEL_FACTORS [ wheelEvent.deltaMode ];
			this.#wheelEventData.marginTop =
				this.#wheelEventData.marginTop > this.#wheelEventData.buttonTop
					?
					this.#wheelEventData.buttonTop
					:
					this.#wheelEventData.marginTop;
			this.#wheelEventData.marginTop =
				this.#wheelEventData.marginTop < this.#wheelEventData.buttonTop - this.#wheelEventData.buttonsHeight +
				( OUR_MIN_BUTTONS_VISIBLE * this.#wheelEventData.buttonHeight )
					?
					(
						this.#wheelEventData.buttonTop -
						this.#wheelEventData.buttonsHeight +
						( OUR_MIN_BUTTONS_VISIBLE * this.#wheelEventData.buttonHeight )
					)
					:
					this.#wheelEventData.marginTop;
			this.#mapLayersToolbarUI.buttonsHTMLElement.style.marginTop = String ( this.#wheelEventData.marginTop ) + 'px';
		}
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class MapLayersToolbarUI
@classdesc This class is the Layer Toolbar on the left of the screen.
Displays buttons to change the background maps and manages the background maps list
@see {@link theMapLayersToolbarUI} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class MapLayersToolbarUI {

	/**
	The main HTMLElement of the UI
	@private
	*/

	#mainHTMLElement = null;

	/**
	The HTML element that contains the map layer buttons
	@private
	*/

	#buttonsHTMLElement = null;

	/**
	An array with the map layer buttons and links
	@private
	*/

	#buttonsAndLinks = [];

	/**
	Data for the wheel event listener
	@private
	*/

	#wheelEventData = {
		marginTop : ZERO,
		buttonHeight : ZERO,
		buttonsHeight : ZERO,
		buttonTop : ZERO
	}

	/**
	Timer id for the mouse leave event
	@private
	*/

	#timerId = null;

	/**
	The wheel eveny listener
	@private
	*/

	#onWheelButtonsEventListener = null;

	/**
	Show the map layer buttons. Called by the mouseenter event
	@private
	*/

	#show ( ) {

		// cleaning the timer if needed. The buttons are always visible and we can stop.
		if ( this.#timerId ) {
			clearTimeout ( this.#timerId );
			this.#timerId = null;
			return;
		}

		// container for the button
		this.#buttonsHTMLElement = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-MapLayersToolbarUI-Buttons'
			},
			this.#mainHTMLElement
		);

		// wheel event data computation
		this.#wheelEventData.buttonTop = this.#mainHTMLElement.clientHeight;
		this.#wheelEventData.buttonsHeight = ZERO;

		// adding map layer buttons
		theMapLayersCollection.forEach (
			mapLayer => {
				if (
					( mapLayer.providerKeyNeeded && theAPIKeysManager.hasKey ( mapLayer.providerName.toLowerCase ( ) ) )
					|| ! mapLayer.providerKeyNeeded
				) {
					let mapLayerButton =
						new MapLayersToolbarButton ( mapLayer, this.#buttonsHTMLElement );
					this.#wheelEventData.buttonHeight = mapLayerButton.height;
					this.#wheelEventData.buttonsHeight += mapLayerButton.height;
					this.#buttonsAndLinks.push ( mapLayerButton );
				}
			}
		);

		// Adding link buttons
		if ( theConfig.layersToolbarUI.theDevil && theConfig.layersToolbarUI.theDevil.addButton ) {
			let theDevilButton = new MapLayersToolbarLink (
				{
					href : 'https://www.google.com/maps/@' +
						theTravelNotesData.map.getCenter ( ).lat +
						',' +
						theTravelNotesData.map.getCenter ( ).lng +
						',' +
						theTravelNotesData.map.getZoom ( ) +
						'z',
					title : 'Reminder! The devil will know everything about you',
					textContent : '👿',
					target : '_blank'
				},
				this.#buttonsHTMLElement
			);
			this.#wheelEventData.buttonsHeight += theDevilButton.height;
			this.#buttonsAndLinks.push ( theDevilButton );
		}

		// wheel event data computation
		this.#wheelEventData.buttonTop += this.#wheelEventData.buttonHeight;
		this.#wheelEventData.marginTop = this.#wheelEventData.buttonTop;
		this.#buttonsHTMLElement.style.marginTop = String ( this.#wheelEventData.marginTop ) + 'px';

		// adding wheel event
		this.#buttonsHTMLElement.addEventListener ( 'wheel', this.#onWheelButtonsEventListener, false );
	}

	/**
	Hide the toolbar
	@private
	*/

	#hide ( ) {

		// Removing map layer buttons and links
		this.#buttonsAndLinks.forEach ( buttonOrLink => buttonOrLink.destructor ( ) );
		this.#buttonsAndLinks.length = ZERO;

		// Removing wheel event listener
		this.#buttonsHTMLElement.removeEventListener ( 'wheel', this.#onWheelButtonsEventListener, false );

		// removing buttons container
		this.#mainHTMLElement.removeChild ( this.#buttonsHTMLElement );
		this.#timerId = null;
	}

	/**
	The mouseleave event listener. Start a timer
	@private
	*/

	#onMouseLeave ( ) {
		this.#timerId = setTimeout ( ( ) => this.#hide ( ), theConfig.layersToolbarUI.toolbarTimeOut );
	}

	/*
	constructor
	*/

	constructor ( ) {
		this.#onWheelButtonsEventListener = new ButtonsContainerWheelEL ( this, this.#wheelEventData );
		Object.freeze ( this );
	}

	/**
	creates the user interface
	*/

	createUI ( ) {
		this.#mainHTMLElement =
			theHTMLElementsFactory.create ( 'div', { id : 'TravelNotes-MapLayersToolbarUI' }, document.body );
		theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-MapLayersToolbarUI-Header',
				textContent : theTranslator.getText ( 'MapLayersToolbarUI - Layers' )
			},
			this.#mainHTMLElement
		);
		this.#mainHTMLElement.addEventListener ( 'mouseenter', ( ) => this.#show ( ), false );
		this.#mainHTMLElement.addEventListener ( 'mouseleave', ( ) => this.#onMouseLeave ( ), false );
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

	/**
	The map layer buttons container
	@readonly
	*/

	get buttonsHTMLElement ( ) { return this.#buttonsHTMLElement; }
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