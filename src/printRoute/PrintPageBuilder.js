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

@file PrintPageBuilder.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module PrintRoute
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theHTMLElementsFactory from '../UILib/HTMLElementsFactory.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import theConfig from '../data/Config.js';
import theTranslator from '../UILib/Translator.js';
import theMapLayersCollection from '../data/MapLayersCollection.js';
import theAPIKeysManager from '../core/APIKeysManager.js';
import theHTMLSanitizer from '../coreLib/HTMLSanitizer.js';

import { ZERO, TWO } from '../main/Constants.js';

const OUR_NOTE_Z_INDEX_OFFSET = 100;

/**
@--------------------------------------------------------------------------------------------------------------------------

@class PrintEL
@classdesc click event listener for the print button
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class PrintEL {

	handleEvent ( ) {
		window.print ( );
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class AfterPrintEL
@classdesc afterprint Event listener the document
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class AfterPrintEL {

	#printPageBuilder = null;
	constructor ( printPageBuilder ) {
		this.#printPageBuilder = printPageBuilder;
	}

	handleEvent ( ) {
		this.#printPageBuilder.onAfterPrint ( );
		this.#printPageBuilder = null;
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class PrintPageBuilder
@classdesc Build the html page for print
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class PrintPageBuilder {

	#printData = null;
	#route = null;
	#views = [];
	#printToolbar = null;
	#printButton = null;
	#cancelButton = null;
	#viewsCounter = ZERO;
	#viewsDiv = [];
	#routePolyline = null;
	#eventsListeners = {
		onPrint : null,
		onAfterPrint : null
	}

	/**
	Remove the print views and restore the map and user interface after printing
	@private
	*/

	onAfterPrint ( ) {
		this.#viewsDiv.forEach ( viewDiv => document.body.removeChild ( viewDiv ) );
		this.#viewsDiv.length = ZERO;
		this.#printButton.removeEventListener (	'click', this.#eventsListeners.onPrint, false );
		this.#cancelButton.removeEventListener ( 'click', this.#eventsListeners.onAfterPrint, false );
		document.body.removeChild ( this.#printToolbar );

		let childrens = document.body.children;
		for ( let counter = 0; counter < childrens.length; counter ++ ) {
			childrens.item ( counter ).classList.remove ( 'TravelNotes-Hidden' );
		}

		theTravelNotesData.map.invalidateSize ( false );
		document.title =
			'Travel & Notes' +
			( '' === theTravelNotesData.travel.name ? '' : ' - ' + theTravelNotesData.travel.name );

		window.removeEventListener ( 'afterprint', this.#eventsListeners.onAfterPrint, true );
		this.#eventsListeners.onAfterPrint = null;
		this.#eventsListeners.onPrint = null;
	}

	/**
	Creates a leaflet layer with the same map that the main map
	@private
	*/

	#getMapLayer ( ) {
		let layer = theMapLayersCollection.getMapLayer ( theTravelNotesData.travel.layerName );
		let url = theAPIKeysManager.getUrl ( layer );
		let leafletLayer = null;
		if ( 'wmts' === layer.service.toLowerCase ( ) ) {
			leafletLayer = window.L.tileLayer ( url );
		}
		else {
			leafletLayer = window.L.tileLayer.wms ( url, layer.wmsOptions );
		}

		leafletLayer.options.attribution = theHTMLSanitizer.sanitizeToHtmlString (
			' © <a href="https://www.openstreetmap.org/copyright" target="_blank" ' +
			'title="OpenStreetMap contributors">OpenStreetMap contributors</a> ' +
			layer.attribution +
			'| © <a href="https://github.com/wwwouaiebe" target="_blank" ' +
			'title="https://github.com/wwwouaiebe">Travel & Notes</a> '
		).htmlString;

		return leafletLayer;
	}

	/**
	Creates markers for notes
	@private
	*/

	#getNotesMarkers ( ) {
		let notesMarkers = [];
		this.#route.notes.forEach (
			note => {
				let icon = window.L.divIcon (
					{
						iconSize : [ note.iconWidth, note.iconHeight ],
						iconAnchor : [ note.iconWidth / TWO, note.iconHeight / TWO ],
						popupAnchor : [ ZERO, -note.iconHeight / TWO ],
						html : note.iconContent,
						className : 'TravelNotes-Map-AllNotes '
					}
				);

				let marker = window.L.marker (
					note.iconLatLng,
					{
						zIndexOffset : OUR_NOTE_Z_INDEX_OFFSET,
						icon : icon,
						draggable : true
					}
				);
				notesMarkers.push ( marker );
			}
		);
		return notesMarkers;
	}

	/**
	Creates a print view
	@private
	*/

	#createViewOnPage ( view ) {
		this.#viewsCounter ++;
		let viewId = 'TravelNotes-RouteViewDiv' + this.#viewsCounter;

		// viewDiv is used by leaflet. We cannot seal viewDiv with theHTMLElementsFactory
		let viewDiv = document.createElement ( 'div' );
		viewDiv.className = 'TravelNotes-routeViewDiv';
		viewDiv.id = viewId;
		document.body.appendChild ( viewDiv );
		this.#viewsDiv.push ( viewDiv );

		if ( this.#printData.pageBreak ) {
			viewDiv.classList.add ( 'TravelNotes-PrintPageBreak' );
		}

		// setting the size given by the user in mm
		viewDiv.style.width = String ( this.#printData.paperWidth ) + 'mm';
		viewDiv.style.height = String ( this.#printData.paperHeight ) + 'mm';

		// creating markers for notes
		let layers = this.#printData.printNotes ? this.#getNotesMarkers ( ) : [];

		// adding the leaflet map layer
		layers.push ( this.#getMapLayer ( ) );

		// adding entry point and exit point markers
		layers.push (
			window.L.circleMarker (
				[ view.entryPoint.lat, view.entryPoint.lng ],
				theConfig.printRouteMap.entryPointMarker
			)
		);
		layers.push (
			window.L.circleMarker (
				[ view.exitPoint.lat, view.exitPoint.lng ],
				theConfig.printRouteMap.exitPointMarker
			)
		);

		// adding the route
		layers.push ( this.#routePolyline );

		// creating the map
		window.L.map (
			viewId,
			{
				attributionControl : true,
				zoomControl : false,
				center : [
					( view.bottomLeft.lat + view.upperRight.lat ) / TWO,
					( view.bottomLeft.lng + view.upperRight.lng ) / TWO
				],
				zoom : this.#printData.zoomFactor,
				minZoom : this.#printData.zoomFactor,
				maxZoom : this.#printData.zoomFactor,
				layers : layers
			}
		);
	}

	/**
	creates the toolbar with the print and cancel button
	@private
	*/

	#createToolbar ( ) {
		this.#printToolbar = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-PrintToolbar'
			},
			document.body
		);

		this.#printButton = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-Button',
				title : theTranslator.getText ( 'PrintPageBuilder - Print' ),
				textContent : '🖨️'
			},
			this.#printToolbar
		);
		this.#printButton.addEventListener ( 'click', this.#eventsListeners.onPrint, false );

		this.#cancelButton = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-Button',
				title : theTranslator.getText ( 'PrintPageBuilder - Cancel print' ),
				textContent : '❌'
			},
			this.#printToolbar
		);
		this.#cancelButton.addEventListener (	'click', this.#eventsListeners.onAfterPrint, false );
	}

	/*
	constructor
	*/

	constructor ( route, views, printData ) {
		this.#route = route;
		this.#views = views;
		this.#printData = printData;
		this.#eventsListeners.onPrint = new PrintEL ( );
		this.#eventsListeners.onAfterPrint = new AfterPrintEL ( this );
		Object.freeze ( this );
	}

	/**
	Hide existing HTMLElements, add the toolbar and prepare the polyline and add the views to the html page
	@private
	*/

	preparePage ( ) {

		// adding classes to the body, so all existing elements are hidden

		let childrens = document.body.children;
		for ( let counter = 0; counter < childrens.length; counter ++ ) {
			childrens.item ( counter ).classList.add ( 'TravelNotes-Hidden' );
		}

		// modify the document title with the travel name and route name
		document.title =
			'' === theTravelNotesData.travel.name
				?
				'maps'
				:
				theTravelNotesData.travel.name + ' - ' + this.#route.computedName + ' - maps';
		this.#createToolbar ( );

		// Adding afterprint event listener to the document
		window.addEventListener ( 'afterprint', this.#eventsListeners.onAfterPrint, true );

		// creating the polyline for the route
		// why we can create the polyline only once and we have to create markers and layers for each view?
		let latLng = [];
		let pointsIterator = this.#route.itinerary.itineraryPoints.iterator;
		while ( ! pointsIterator.done ) {
			latLng.push ( pointsIterator.value.latLng );
		}
		this.#routePolyline = window.L.polyline (
			latLng,
			{
				color : this.#route.color,
				weight : this.#route.width
			}
		);

		// adding views
		this.#viewsCounter = ZERO;
		this.#views.forEach ( view => this.#createViewOnPage ( view ) );
	}
}

export default PrintPageBuilder;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of PrintPageBuilder.js file

@------------------------------------------------------------------------------------------------------------------------------
*/