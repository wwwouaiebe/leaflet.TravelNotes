/*
Copyright - 2019 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- LayersToolbarUI.js file -------------------------------------------------------------------------------------------
This file contains:
	- the newLayersToolbarUI function
	- the theLayersToolbarUI object
Changes:
	- v1.6.0:
		- created
	- v1.9.0:
		- issue #101 : Add a print command for a route
		- issue #103 : Review the attributions
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { theTranslator } from '../UI/Translator.js';
import { theConfig } from '../data/Config.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theAPIKeysManager } from '../core/APIKeysManager.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';
import { theAttributionsUI } from '../UI/AttributionsUI.js';

import { MOUSE_WHEEL_FACTORS, ZERO } from '../util/Constants.js';

/*
--- newLayersToolbarUI function ---------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newLayersToolbarUI ( ) {

	let myLayers = [
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

	let myTimerId = null;
	let myLayersToolbar = null;
	let myLayersToolbarButtonsDiv = null;
	let myHTMLElementsFactory = newHTMLElementsFactory ( );
	let myEventDispatcher = newEventDispatcher ( );
	let myMarginTop = ZERO;
	let myButtonHeight = ZERO;
	let myButtonsHeight = ZERO;
	let myButtonTop = ZERO;

	/*
	--- myOnMouseEnterLayerButton function ----------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnMouseEnterLayerButton ( mouseEnterEvent ) {
		mouseEnterEvent.target.setAttribute (
			'style',
			'color:' +
				mouseEnterEvent.target.layer.toolbar.backgroundColor +
				';background-color:' +
				mouseEnterEvent.target.layer.toolbar.color
		);
	}

	/*
	--- myOnMouseLeaveLayerButton function ----------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnMouseLeaveLayerButton ( mouseLeaveEvent ) {
		mouseLeaveEvent.target.setAttribute (
			'style',
			'color:' +
				mouseLeaveEvent.target.layer.toolbar.color +
				';background-color:' +
				mouseLeaveEvent.target.layer.toolbar.backgroundColor
		);
	}

	/*
	--- myOnMouseEnterLinkButton function -----------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnMouseEnterLinkButton ( mouseEnterEvent ) {
		mouseEnterEvent.target.classList.add ( 'TravelNotes-LayersToolbarUI-LinkButton-Enter' );
		mouseEnterEvent.target.classList.remove ( 'TravelNotes-LayersToolbarUI-LinkButton-Leave' );
	}

	/*
	--- myOnMouseLeaveLinkButton function -----------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnMouseLeaveLinkButton ( mouseLeaveEvent ) {
		mouseLeaveEvent.target.classList.add ( 'TravelNotes-LayersToolbarUI-LinkButton-Leave' );
		mouseLeaveEvent.target.classList.remove ( 'TravelNotes-LayersToolbarUI-LinkButton-Enter' );
	}

	/*
	--- myOnClickLayerButton function ---------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnClickLayerButton ( clickEvent ) {
		myEventDispatcher.dispatch ( 'layerchange', { layer : clickEvent.target.layer } );
		theAttributionsUI.attributions = clickEvent.target.layer.attribution;
		theTravelNotesData.travel.layerName = clickEvent.target.layer.name;
	}

	/*
	--- myCreateLayerButton function ----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateLayerButton ( layer ) {
		if ( layer.providerKeyNeeded && ! theAPIKeysManager.getKey ( layer.providerName.toLowerCase ( ) ) ) {
			return;
		}
		let layerButton = myHTMLElementsFactory.create (
			'div',
			{
				type : 'layer',
				className : 'TravelNotes-LayersToolbarUI-Button',
				title : layer.name,
				layer : layer,
				innerHTML : layer.toolbar.text,
				style : 'color:' + layer.toolbar.color + ';background-color:' + layer.toolbar.backgroundColor
			},
			myLayersToolbarButtonsDiv
		);
		layerButton.addEventListener ( 'mouseenter', myOnMouseEnterLayerButton, false );
		layerButton.addEventListener ( 'mouseleave', myOnMouseLeaveLayerButton, false );
		layerButton.addEventListener ( 'click', myOnClickLayerButton, false );
		myButtonHeight = layerButton.clientHeight;
		myButtonsHeight += myButtonHeight;
	}

	/*
	--- myCreateLinkButton function -----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateLinkButton ( href, title, text ) {
		let linkButton = myHTMLElementsFactory.create (
			'div',
			{
				type : 'link',
				className : 'TravelNotes-LayersToolbarUI-Button TravelNotes-LayersToolbarUI-LinkButton-Leave',
				innerHTML : '<a href="' + href + '" title="' + title + '" target="_blank">' + text + '</a>'
			},
			myLayersToolbarButtonsDiv
		);
		linkButton.addEventListener ( 'mouseenter', myOnMouseEnterLinkButton, false );
		linkButton.addEventListener ( 'mouseleave', myOnMouseLeaveLinkButton, false );
		myButtonsHeight += linkButton.clientHeight;
	}

	/*
	--- myOnWheelToolbar function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnWheelToolbar ( wheelEvent ) {
		const MIN_BUTTONS = 3;
		if ( wheelEvent.deltaY ) {
			myMarginTop -= wheelEvent.deltaY * MOUSE_WHEEL_FACTORS [ wheelEvent.deltaMode ];
			myMarginTop = myMarginTop > myButtonTop ? myButtonTop : myMarginTop;
			myMarginTop =
				myMarginTop < myButtonTop - myButtonsHeight +
				( MIN_BUTTONS * myButtonHeight )
					?
					myButtonTop - myButtonsHeight + ( MIN_BUTTONS * myButtonHeight )
					:
					myMarginTop;
			myLayersToolbarButtonsDiv.style.marginTop = String ( myMarginTop ) + 'px';
		}
		wheelEvent.stopPropagation ( );
	}

	/*
	--- myOnTimeOutToolbar function -----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnTimeOutToolbar ( ) {
		let buttons = myLayersToolbarButtonsDiv.childNodes;
		for ( let counter = 0; counter < buttons.length; counter ++ ) {
			if ( 'layer' === buttons [ counter ].type ) {
				buttons [ counter ].removeEventListener ( 'mouseenter', myOnMouseEnterLayerButton, false );
				buttons [ counter ].removeEventListener ( 'mouseleave', myOnMouseLeaveLayerButton, false );
				buttons [ counter ].removeEventListener ( 'click', myOnClickLayerButton, false );
			}
			else {
				buttons [ counter ].removeEventListener ( 'mouseenter', myOnMouseEnterLinkButton, false );
				buttons [ counter ].removeEventListener ( 'mouseleave', myOnMouseEnterLinkButton, false );
			}
		}
		myLayersToolbarButtonsDiv.removeEventListener ( 'wheel', myOnWheelToolbar, false );
		myLayersToolbar.removeChild ( myLayersToolbarButtonsDiv );
		myTimerId = null;
	}

	/*
	--- myOnMouseEnterToolbar function --------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnMouseEnterToolbar ( ) {
		if ( myTimerId ) {
			clearTimeout ( myTimerId );
			myTimerId = null;
			return;
		}
		myLayersToolbarButtonsDiv = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-LayersToolbarUI-Buttons'
			},
			myLayersToolbar
		);
		myButtonTop = myLayersToolbar.clientHeight;
		myButtonsHeight = ZERO;

		myLayers.forEach ( layer => myCreateLayerButton ( layer ) );

		if ( theConfig.layersToolbarUI.theDevil && theConfig.layersToolbarUI.theDevil.addButton ) {
			myCreateLinkButton (
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

		myButtonTop += myButtonHeight;
		myMarginTop = myButtonTop;
		myLayersToolbarButtonsDiv.style.marginTop = String ( myMarginTop ) + 'px';

		myLayersToolbarButtonsDiv.addEventListener (
			'wheel',
			myOnWheelToolbar,
			false
		);
	}

	/*
	--- myCreateLayersToolbar function --------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateLayersToolbar ( ) {
		myLayersToolbar = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-LayersToolbarUI'
			},
			document.getElementsByTagName ( 'body' ) [ ZERO ]
		);
		myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-LayersToolbarUI-Header',
				innerHTML : theTranslator.getText ( 'LayersToolbarUI - Layers' )
			},
			myLayersToolbar
		);
		myLayersToolbar.addEventListener (
			'mouseenter',
			myOnMouseEnterToolbar,
			false
		);
		myLayersToolbar.addEventListener (
			'mouseleave',
			( ) => {
				myTimerId = setTimeout (
					myOnTimeOutToolbar,
					theConfig.layersToolbarUI.toolbarTimeOut );
			},
			false
		);

		myEventDispatcher.dispatch ( 'layerchange', { layer : myLayers [ ZERO ] } );
		theAttributionsUI.attributions = myLayers [ ZERO ].attribution;

	}

	/*
	--- myGetLayer function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetLayer ( layerName ) {

		let newLayer = myLayers.find ( layer => layer.name === layerName ) || myLayers [ ZERO ];
		if ( newLayer.providerKeyNeeded ) {
			let providerKey = theAPIKeysManager.getKey ( newLayer.providerName.toLowerCase ( ) );
			if ( ! providerKey ) {
				newLayer = myLayers [ ZERO ];
			}
		}
		return newLayer;
	}

	/*
	--- mySetLayer function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySetLayer ( layerName ) {

		let newLayer = myLayers.find ( layer => layer.name === layerName ) || myLayers [ ZERO ];
		if ( newLayer.providerKeyNeeded ) {
			let providerKey = theAPIKeysManager.getKey ( newLayer.providerName.toLowerCase ( ) );
			if ( ! providerKey ) {
				newLayer = myLayers [ ZERO ];
			}
		}
		myEventDispatcher.dispatch ( 'layerchange', { layer : newLayer } );
		theAttributionsUI.attributions = newLayer.attribution;
		theTravelNotesData.travel.layerName = newLayer.name;
	}

	/*
	--- mySetLayers function ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySetLayers ( layers ) {
		myLayers = myLayers.concat ( layers );
	}

	/*
	--- myCreateUI function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateUI ( ) {

		myCreateLayersToolbar ( );
	}

	/*
	--- LayersToolbarUI object ----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			createUI : ( ) => myCreateUI ( ),
			getLayer : layerName => myGetLayer ( layerName ),
			setLayer : layerName => mySetLayer ( layerName ),
			setLayers : layers => mySetLayers ( layers )
		}
	);
}

const theLayersToolbarUI = newLayersToolbarUI ( );

export { theLayersToolbarUI };

/*
--- End of LayersToolbarUI.js file ------------------------------------------------------------------------------------
*/