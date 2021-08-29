/*
Copyright - 2020 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- printFactory.js file ----------------------------------------------------------------------------------------------
This file contains:
	-
Changes:
	- v1.9.0:
		- created
	- v1.10.0
		- Issue ♯106 : Profiles are not hidden when printing the route maps
	- v1.12.0:
		- Issue ♯120 : Review the UserInterface
	- v2.0.0:
		- Issue ♯134 : Remove node.setAttribute ( 'style', blablabla) in the code
		- Issue ♯135 : Remove innerHTML from code
		- Issue ♯136 : Remove html entities from js string
		- Issue ♯146 : Add the travel name in the document title...
Doc reviewed 20200508
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file PrintFactory.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module PrintFactory
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theErrorsUI from '../UI/ErrorsUI.js';
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import theDataSearchEngine from '../data/DataSearchEngine.js';
import theGeometry from '../util/Geometry.js';
import theConfig from '../data/Config.js';
import theTranslator from '../UI/Translator.js';
import PrintViewsFactory from '../printMap/PrintViewsFactory.js';
import PrintPageBuilder from '../printMap/PrintPageBuilder.js';

import { ZERO, TWO, LAT, LNG } from '../util/Constants.js';

const OUR_TILE_SIZE = 256;

/**
@--------------------------------------------------------------------------------------------------------------------------

@class PrintFactory
@classdesc This class manages the print of a route
@see {@link newPrintFactory} for constructor
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class PrintFactory {

	#printData = null;
	#route = null;
	#printSize = null;
	#views = [];

	#tilesPage = ZERO;

	/**
	Compute the print size in lat and lng transforming the dimension given in mm by the user.
	@private
	*/

	#computePrintSize ( ) {

		let dummyDiv = theHTMLElementsFactory.create ( 'div', { }, document.body );
		dummyDiv.style.position = 'absolute';
		dummyDiv.style.top = '0';
		dummyDiv.style.left = '0';
		dummyDiv.style.width = String ( this.#printData.paperWidth - ( TWO * this.#printData.borderWidth ) ) + 'mm';
		dummyDiv.style.height = String ( this.#printData.paperHeight - ( TWO * this.#printData.borderWidth ) ) + 'mm';
		this.#tilesPage =
			Math.ceil ( dummyDiv.clientWidth / OUR_TILE_SIZE ) *
			Math.ceil ( dummyDiv.clientHeight / OUR_TILE_SIZE );
		let topLeftScreen = theGeometry.screenCoordToLatLng ( ZERO, ZERO );
		let bottomRightScreen = theGeometry.screenCoordToLatLng (
			dummyDiv.clientWidth,
			dummyDiv.clientHeight
		);
		document.body.removeChild ( dummyDiv );

		let scale = theTravelNotesData.map.getZoomScale ( theTravelNotesData.map.getZoom ( ), this.#printData.zoomFactor );
		this.#printSize = [
			Math.abs ( topLeftScreen [ LAT ] - bottomRightScreen [ LAT ] ) * scale,
			Math.abs ( topLeftScreen [ LNG ] - bottomRightScreen [ LNG ] ) * scale
		];
	}

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	Hide the map and user interface, prepares the print views and add a toolbar on top of the screen
	@param {PrintRouteMapOptions} printData the print options returned by the PrintRouteMapDialog
	@param {!number} routeObjId The objId of the route to print
	*/

	print ( printData, routeObjId ) {
		this.#route = theDataSearchEngine.getRoute ( routeObjId );
		if ( ! this.#route ) {
			return;
		}
		this.#printData = printData;
		this.#computePrintSize ( );

		let printViewsFactory = new PrintViewsFactory ( this.#route, this.#printSize );
		this.#views = printViewsFactory.views;

		/*
		// Remain for debugging
		this.#views.forEach (
			view => window.L.rectangle ( [ view.bottomLeft, view.upperRight ] ).addTo ( theTravelNotesData.map )
		);
		console.log ( 'views :' + this.#views.length );
		*/

		if ( theConfig.printRouteMap.maxTiles < this.#views.length * this.#tilesPage ) {
			theErrorsUI.showError ( theTranslator.getText ( 'PrintFactory - The maximum of allowed pages is reached.' ) );
			return;
		}

		let printPageBuilder = new PrintPageBuilder (
			this.#route,
			printViewsFactory.views,
			printData
		);
		printPageBuilder.printViews ( );
	}
}

export default PrintFactory;

/*
--- End of PrintFactory.js file -----------------------------------------------------------------------------------------------

*/