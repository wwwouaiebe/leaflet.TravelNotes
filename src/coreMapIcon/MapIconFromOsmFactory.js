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
	- v1.4.0:
		- created
	- v1.6.0:
		- Issue ♯65 : Time to go to ES6 modules?
		- Issue ♯68 : Review all existing promises.
	- v2.0.0:
		- Issue ♯135 : Remove innerHTML from code
		- Issue ♯136 : Remove html entities from js string
		- Issue ♯138 : Protect the app - control html entries done by user.
		- Issue ♯145 : Merge svg icon and knoopunt icon
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file MapIconFromOsmFactory.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@typedef {Object} OsmNoteData
@desc An object that store the data found in osm for a svg note creation
@property {string} svg The svg definition created from the OSM map and the itinerary. This will be used as icon for the note
@property {string} tooltip A string with the drection to follow This will be used as tooltip for the note
@property {string} city A string with the city. This will be used for the note address
@property {string} place A place (Can be 'town', 'city', 'village' or 'hamlet') found in OSM.
This will be used for the note address
@property {string} streets A string with all the streets found at the note position. This will be used for the note address
@property {Array.<number>} latLng The latitude and longitude of the nearest itinerary point
@public

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module coreMapIcon

@------------------------------------------------------------------------------------------------------------------------------
*/

import theConfig from '../data/Config.js';
import theDataSearchEngine from '../data/DataSearchEngine.js';
import theSphericalTrigonometry from '../coreLib/SphericalTrigonometry.js';
import SvgBuilder from '../coreMapIcon/SvgBuilder.js';
import OverpassAPIDataLoader from '../coreLib/OverpassAPIDataLoader.js';
import DataBuilder from '../coreMapIcon/DataBuilder.js';

import { ICON_DIMENSIONS, LAT_LNG, DISTANCE, INVALID_OBJ_ID, ZERO, ONE } from '../main/Constants.js';

const SEARCH_AROUND_FACTOR = 1.5;

/**
@--------------------------------------------------------------------------------------------------------------------------

@class MapIconFromOsmFactory
@classdesc This class is used to create  an svg icon for a route note
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class MapIconFromOsmFactory {

	#route = null;
	#overpassAPIDataLoader = new OverpassAPIDataLoader ( { searchRelations : false, setGeometry : false } );

	#mapIconPosition = Object.seal (
		{
			latLng : [ LAT_LNG.defaultValue, LAT_LNG.defaultValue ], // = latLng of the nearest ItineraryPoint
			distance : DISTANCE.defaultValue, // = the distance between the nearest itineraryPoint and the beginning of route
			nearestItineraryPointObjId : INVALID_OBJ_ID // the nearest itineraryPoint objId
		}
	);

	#queryDistance = Math.max (
		theConfig.geoCoder.distances.hamlet,
		theConfig.geoCoder.distances.village,
		theConfig.geoCoder.distances.city,
		theConfig.geoCoder.distances.town
	);

	#requestStarted = false;

	/**
	This method search the nearest itinerary point from the point given by the user
	@private
	*/

	#searchNearestItineraryPoint ( ) {

		let nearestItineraryPoint = null;

		// Searching the nearest itinerary point
		let minDistance = Number.MAX_VALUE;
		let distance = DISTANCE.defaultValue;

		// Iteration on the points...
		this.#route.itinerary.itineraryPoints.forEach (
			itineraryPoint => {
				let itineraryPointDistance =
					theSphericalTrigonometry.pointsDistance ( this.#mapIconPosition.latLng, itineraryPoint.latLng );
				if ( minDistance > itineraryPointDistance ) {
					minDistance = itineraryPointDistance;
					nearestItineraryPoint = itineraryPoint;
					this.#mapIconPosition.distance = distance;
				}
				distance += itineraryPoint.distance;
			}
		);

		// The coordinates of the nearest point are used as position of the SVG
		this.#mapIconPosition.latLng = nearestItineraryPoint.latLng;
		this.#mapIconPosition.nearestItineraryPointObjId = nearestItineraryPoint.objId;
	}

	/**
	Search and build all the needed data
	@param {function} onOk The success handler passed to the Promise
	@param {function} onError The error handler passed to the Promise
	@private
	*/

	#buildIconAndAdress ( ) {

		let mapIconData = new DataBuilder ( ).buildData (
			this.#route,
			this.#overpassAPIDataLoader,
			this.#mapIconPosition
		);

		let svgElement = new SvgBuilder ( ).buildSvg (
			this.#route,
			this.#overpassAPIDataLoader,
			mapIconData
		);

		this.#requestStarted = false;

		let address = mapIconData.streets;
		if ( '' !== this.#overpassAPIDataLoader.city ) {
			address += ' <span class="TravelNotes-NoteHtml-Address-City">' + this.#overpassAPIDataLoader.city + '</span>';
		}
		if ( this.#overpassAPIDataLoader.place && this.#overpassAPIDataLoader.place !== this.#overpassAPIDataLoader.city ) {
			address += ' (' + this.#overpassAPIDataLoader.place + ')';
		}

		return Object.freeze (
			{
				statusOk : true,
				noteData : {
					iconContent : svgElement.outerHTML,
					tooltipContent : mapIconData.tooltip,
					address : address,
					iconWidth : ICON_DIMENSIONS.width,
					iconHeight : ICON_DIMENSIONS.height,
					latLng : this.#mapIconPosition.latLng
				}
			}
		);
	}

	async #exeGetIconAndAdress ( ) {
		if ( this.#requestStarted ) {
			return Object.freeze (
				{
					statusOk : false,
					noteData : null
				}
			);
		}

		this.#requestStarted = true;

		this.#searchNearestItineraryPoint ( );

		let queryLatLng =
			this.#mapIconPosition.latLng [ ZERO ].toFixed ( LAT_LNG.fixed ) +
			',' +
			this.#mapIconPosition.latLng [ ONE ].toFixed ( LAT_LNG.fixed );

		/*
		Sample of query:
			way[highway](around:300,50.489312,5.501035)->.a;(.a >;.a;)->.a;.a out;
			is_in(50.644242,5.572354)->.e;area.e[admin_level][boundary="administrative"];out;
			node(around:1500,50.644242,5.572354)[place];out;
		*/

		let queries = [
			'way[highway](around:' +
			( ICON_DIMENSIONS.svgViewboxDim * SEARCH_AROUND_FACTOR ).toFixed ( ZERO ) +
			',' + queryLatLng + ')->.a;(.a >;.a;)->.a;.a out;' +
			'is_in(' + queryLatLng + ')->.e;area.e[admin_level][boundary="administrative"];out;' +
			'node(around:' + this.#queryDistance + ',' + queryLatLng + ')[place];out;'
		];

		await this.#overpassAPIDataLoader.loadData ( queries, this.#mapIconPosition.latLng );
		if ( this.#overpassAPIDataLoader.statusOk ) {
			return this.#buildIconAndAdress ( );
		}
		return Object.freeze (
			{
				statusOk : false
			}
		);
	}

	async #exeGetIconAndAdressWithPromise ( onOk, onError ) {
		let result = await this.#exeGetIconAndAdress ( );

		if ( result.statusOk ) {
			onOk ( result );
		}
		else {
			onError ( 'An error occurs...' );
		}
	}

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	get the svg and the data needed for creating the icon, using an async function
	@param {Array.<number>} iconLatLng The latitude and longitude of the icon
	@param {!number} routeObjId The objId of the route to witch the icon will be attached.
	@return {OsmNoteData} An object with the svg and data
	*/

	async getIconAndAdressAsync ( iconLatLng, routeObjId ) {
		this.#mapIconPosition.latLng = iconLatLng;
		this.#route = theDataSearchEngine.getRoute ( routeObjId );

		return this.#exeGetIconAndAdress ( );
	}

	/**
	get the svg and the data needed for creating the icon, using a promise
	@param {Array.<number>} iconLatLng The latitude and longitude of the icon
	@param {!number} routeObjId The objId of the route to witch the icon will be attached.
	@return {Promise} A Promise fullfilled with the svg data
	*/

	getIconAndAdressWithPromise ( iconLatLng, routeObjId ) {
		this.#mapIconPosition.latLng = iconLatLng;
		this.#route = theDataSearchEngine.getRoute ( routeObjId );

		return new Promise ( ( onOk, onError ) => this.#exeGetIconAndAdressWithPromise ( onOk, onError ) );
	}

}

export default MapIconFromOsmFactory;

/*
--- End of MapIconFromOsmFactory.js file --------------------------------------------------------------------------------------
*/