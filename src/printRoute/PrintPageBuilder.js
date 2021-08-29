import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import theConfig from '../data/Config.js';
import theTranslator from '../UI/Translator.js';
import theMapLayersCollection from '../data/MapLayersCollection.js';
import theAPIKeysManager from '../core/APIKeysManager.js';
import theHTMLSanitizer from '../util/HTMLSanitizer.js';

import { ZERO, TWO } from '../util/Constants.js';

const OUR_NOTE_Z_INDEX_OFFSET = 100;

class PrintEventListener {

	handleEvent ( ) {
		window.print ( );
	}
}

class AfterPrintEventListener {

	#printPageBuilder = null;
	constructor ( printPageBuilder ) {
		this.#printPageBuilder = printPageBuilder;
	}

	handleEvent ( ) {
		this.#printPageBuilder.onAfterPrint ( );
		this.#printPageBuilder = null;
	}
}

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

	constructor ( route, views, printData ) {
		this.#route = route;
		this.#views = views;
		this.#printData = printData;
		this.#eventsListeners.onPrint = new PrintEventListener ( );
		this.#eventsListeners.onAfterPrint = new AfterPrintEventListener ( this );
		Object.seal ( this );
	}
}

export default PrintPageBuilder;