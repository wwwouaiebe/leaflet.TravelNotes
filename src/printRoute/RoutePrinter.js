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
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file RoutePrinter.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module PrintRoute

@------------------------------------------------------------------------------------------------------------------------------
*/

import theErrorsUI from '../errorsUI/ErrorsUI.js';
import theHTMLElementsFactory from '../UILib/HTMLElementsFactory.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import theDataSearchEngine from '../data/DataSearchEngine.js';
import theGeometry from '../coreLib/Geometry.js';
import theConfig from '../data/Config.js';
import theTranslator from '../UILib/Translator.js';
import PrintViewsFactory from '../printRoute/PrintViewsFactory.js';
import PrintPageBuilder from '../printRoute/PrintPageBuilder.js';

import { ZERO, TWO, LAT, LNG } from '../main/Constants.js';

const OUR_TILE_SIZE = 256;

/**
@--------------------------------------------------------------------------------------------------------------------------

@class RoutePrinter
@classdesc This class manages the print of a route
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class RoutePrinter {

	#tilesPerPage = ZERO;

	/**
	Compute the view size in lat and lng transforming the dimension given in mm by the user.
	@private
	*/

	#computeViewSize ( printData ) {

		let dummyDiv = theHTMLElementsFactory.create ( 'div', { }, document.body );
		dummyDiv.style.position = 'absolute';
		dummyDiv.style.top = '0';
		dummyDiv.style.left = '0';
		dummyDiv.style.width = String ( printData.paperWidth - ( TWO * printData.borderWidth ) ) + 'mm';
		dummyDiv.style.height = String ( printData.paperHeight - ( TWO * printData.borderWidth ) ) + 'mm';
		this.#tilesPerPage =
			Math.ceil ( dummyDiv.clientWidth / OUR_TILE_SIZE ) *
			Math.ceil ( dummyDiv.clientHeight / OUR_TILE_SIZE );
		let topLeftScreen = theGeometry.screenCoordToLatLng ( ZERO, ZERO );
		let bottomRightScreen = theGeometry.screenCoordToLatLng (
			dummyDiv.clientWidth,
			dummyDiv.clientHeight
		);
		document.body.removeChild ( dummyDiv );

		let scale = theTravelNotesData.map.getZoomScale ( theTravelNotesData.map.getZoom ( ), printData.zoomFactor );
		return [
			Math.abs ( topLeftScreen [ LAT ] - bottomRightScreen [ LAT ] ) * scale,
			Math.abs ( topLeftScreen [ LNG ] - bottomRightScreen [ LNG ] ) * scale
		];
	}

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	Modify the main page, creating views on the page, so the page can be printed easily
	@param {PrintRouteMapOptions} printData the print options returned by the PrintRouteMapDialog
	@param {!number} routeObjId The objId of the route to print
	*/

	print ( printData, routeObjId ) {
		let route = theDataSearchEngine.getRoute ( routeObjId );
		if ( ! route ) {
			return;
		}

		// Computing the needed views
		let printViewsFactory = new PrintViewsFactory (
			route,
			this.#computeViewSize ( printData )
		);

		// Remain for debugging
		/*
		printViewsFactory.views.forEach (
			view => window.L.rectangle ( [ view.bottomLeft, view.upperRight ] ).addTo ( theTravelNotesData.map )
		);
		console.log ( 'views :' + printViewsFactory.views.length );
		*/

		// Verify the tiles needed and stop the command if too mutch tiles needed
		if ( theConfig.printRouteMap.maxTiles < printViewsFactory.views.length * this.#tilesPerPage ) {
			theErrorsUI.showError ( theTranslator.getText ( 'RoutePrinter - The maximum of allowed pages is reached.' ) );
			return;
		}

		// Prepare the main page, for printing, hidding the map, adding the views and a print toolbar
		let printPageBuilder = new PrintPageBuilder (
			route,
			printViewsFactory.views,
			printData
		);
		printPageBuilder.preparePage ( );
	}
}

export default RoutePrinter;

/*
--- End of RoutePrinter.js file -----------------------------------------------------------------------------------------------

*/