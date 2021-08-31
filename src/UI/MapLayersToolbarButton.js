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
Doc reviewed 20210815
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file MapLayersToolbarButton.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module MapLayersToolbarButton
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import theEventDispatcher from '../util/EventDispatcher.js';
import theAttributionsUI from '../attributionsUI/AttributionsUI.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class MouseEnterLayerToolbarButtonEventListener
@classdesc mouse enter event listener for the button
@hideconstructor
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

class MouseEnterLayerToolbarButtonEventListener {

	#mapLayer = null;

	constructor ( mapLayer ) {
		this.#mapLayer = mapLayer;
	}

	/**
	Mouse enter event listener. Inverse the button color
	*/

	handleEvent ( mouseEnterEvent ) {
		mouseEnterEvent.stopPropagation ( );
		mouseEnterEvent.target.style.color = this.#mapLayer.toolbar.backgroundColor;
		mouseEnterEvent.target.style[ 'background-color' ] = this.#mapLayer.toolbar.color;
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class MouseLeaveLayerToolbarButtonEventListener
@classdesc mouse leave event listener for the button
@hideconstructor
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

class MouseLeaveLayerToolbarButtonEventListener {

	#mapLayer = null;

	constructor ( mapLayer ) {
		this.#mapLayer = mapLayer;
	}

	/**
	Mouse leave event listener. Inverse the button color
	*/

	handleEvent ( mouseLeaveEvent ) {
		mouseLeaveEvent.stopPropagation ( );
		mouseLeaveEvent.target.style.color = this.#mapLayer.toolbar.color;
		mouseLeaveEvent.target.style[ 'background-color' ] = this.#mapLayer.toolbar.backgroundColor;
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class ClickEventLayerToolbarButtonEventListener
@classdesc click event listener for the button
@hideconstructor
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

class ClickEventLayerToolbarButtonEventListener {

	#mapLayer = null;

	constructor ( mapLayer ) {
		this.#mapLayer = mapLayer;
	}

	/**
	Mouse click event listener. Change the background map
	*/

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		theEventDispatcher.dispatch ( 'layerchange', { layer : this.#mapLayer } );
		theAttributionsUI.attributions = this.#mapLayer.attribution;
		theTravelNotesData.travel.layerName = this.#mapLayer.name;
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class MapLayersToolbarButton
@classdesc Map layer button for the toolbar
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class MapLayersToolbarButton {

	/**
	The button HTMLElementsFactory
	@private
	*/

	#buttonHTMLElement = null;

	/**
	Event listeners
	@private
	*/

	#eventListeners = {
		mouseEnter : null,
		mouseLeave : null,
		click : null
	}

	/**
	A reference to the parent nodeName
	@private
	*/

	#parentNode = null;

	constructor ( mapLayer, parentNode ) {
		this.#parentNode = parentNode;
		this.#buttonHTMLElement = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-MapLayersToolbarUI-Button',
				title : mapLayer.name,
				dataset : { MapLayerName : mapLayer.name },
				textContent : mapLayer.toolbar.text,
				style : 'color:' + mapLayer.toolbar.color + ';background-color:' + mapLayer.toolbar.backgroundColor
			},
			parentNode
		);

		this.#eventListeners.mouseEnter = new MouseEnterLayerToolbarButtonEventListener ( mapLayer );
		this.#eventListeners.mouseLeave = new MouseLeaveLayerToolbarButtonEventListener ( mapLayer );
		this.#eventListeners.click = new ClickEventLayerToolbarButtonEventListener ( mapLayer );

		this.#buttonHTMLElement.addEventListener ( 'mouseenter', this.#eventListeners.mouseEnter, false );
		this.#buttonHTMLElement.addEventListener ( 'mouseleave', this.#eventListeners.mouseLeave, false );
		this.#buttonHTMLElement.addEventListener ( 'click', this.#eventListeners.click, false );
	}

	/**
	destructor. Remove event listeners and the button html element from the buttons container.
	*/

	destructor ( ) {
		this.#buttonHTMLElement.removeEventListener ( 'mouseenter', this.#eventListeners.mouseEnter, false );
		this.#buttonHTMLElement.removeEventListener ( 'mouseleave', this.#eventListeners.mouseLeave, false );
		this.#buttonHTMLElement.removeEventListener ( 'click', this.#eventListeners.click, false );

		this.#parentNode.removeChild ( this.#buttonHTMLElement );
		this.#parentNode = null;
	}

	/**
	The height of the button
	*/

	get height ( ) { return this.#buttonHTMLElement.clientHeight; }

}

export default MapLayersToolbarButton;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of MapLayersToolbarButton.js file

@------------------------------------------------------------------------------------------------------------------------------
*/