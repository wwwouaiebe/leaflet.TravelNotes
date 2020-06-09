import { newEventDispatcher } from '../util/EventDispatcher.js';
import { theAttributionsUI } from '../UI/AttributionsUI.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { theGeoLocator } from '../core/GeoLocator.js';
import { newZoomer } from '../core/Zoomer.js';

import { ZERO } from '../util/Constants.js';

/*
--- newViewerLayersToolbarUI function ---------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newViewerLayersToolbarUI ( ) {

	let myLayersToolbar = null;

	let myEventDispatcher = newEventDispatcher ( );
	let myHTMLElementsFactory = newHTMLElementsFactory ( );

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

	/*
	--- mySetLayers function ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySetLayers ( layers ) {
		layers.forEach (
			layer => {
				if ( ! layer.providerKeyNeeded ) {
					myLayers.push ( layer );
				}
			}
		);
	}

	/*
	--- mySetLayer function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySetLayer ( layerName ) {

		let newLayer = myLayers.find ( layer => layer.name === layerName ) || myLayers [ ZERO ];
		myEventDispatcher.dispatch ( 'layerchange', { layer : newLayer } );
		theAttributionsUI.attributions = newLayer.attribution;
	}

	/*
	--- myOnClickLayerButton function ---------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnClickLayerButton ( clickEvent ) {
		myEventDispatcher.dispatch ( 'layerchange', { layer : clickEvent.target.layer } );
		theAttributionsUI.attributions = clickEvent.target.layer.attribution;
	}

	/*
	--- myCreateLayerButton function ----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateLayerButton ( layer ) {
		let layerButton = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-ViewerLayersToolbarUI-Button',
				title : layer.name,
				layer : layer,
				innerHTML : layer.toolbar.text,
				style : 'color:' + layer.toolbar.color + ';background-color:' + layer.toolbar.backgroundColor
			},
			myLayersToolbar
		);
		layerButton.addEventListener ( 'click',
			clickEvent => {
				clickEvent.stopPropagation ( );
				myOnClickLayerButton ( clickEvent );
			},
			myOnClickLayerButton,
			false );
	}

	/*
	--- myCreateLayerButton function ----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateUI ( ) {
		myLayersToolbar = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-ViewerLayersToolbarUI'
			},
			document.querySelector ( 'body' )
		);

		// Don't test the https protocol. On some mobile devices with an integreted GPS
		// the geolocation is working also on http protocol
		let geoLocationButton = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-ViewerLayersToolbarUI-Button',
				title : 'My position',
				innerHTML : '&#x1f310;',
				style : 'color:black;background-color:white'
			},
			myLayersToolbar
		);
		geoLocationButton.addEventListener ( 'click',
			clickEvent => {
				clickEvent.stopPropagation ( );
				theGeoLocator.switch ( );
			},
			false
		);
		let zoomButton = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-ViewerLayersToolbarUI-Button',
				title : 'Zoom on the travel',
				innerHTML : '&#x1f50d;',
				style : 'color:black;background-color:white'
			},
			myLayersToolbar
		);
		zoomButton.addEventListener ( 'click',
			clickEvent => {
				clickEvent.stopPropagation ( );
				newZoomer ( ).zoomToTravel ( );
			},
			false
		);

		myLayers.forEach ( myCreateLayerButton );
	}

	/*
	--- ViewerLayersToolbarUI object ----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			createUI : ( ) => myCreateUI ( ),
			setLayer : layerName => mySetLayer ( layerName ),
			setLayers : layers => mySetLayers ( layers )
		}
	);
}

const theViewerLayersToolbarUI = newViewerLayersToolbarUI ( );

export { theViewerLayersToolbarUI };