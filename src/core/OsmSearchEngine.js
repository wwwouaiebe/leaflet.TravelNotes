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
	- v1.13.0:
		- Issue ♯125 : Outphase osmSearch and add it to TravelNotes
	- v2.0.0:
		- Issue ♯138 : Protect the app - control html entries done by user.
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210722
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file OsmSearchEngine.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module OsmSearchEngine
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import ObjId from '../data/ObjId.js';
import theConfig from '../data/Config.js';
import theEventDispatcher from '../util/EventDispatcher.js';
import theGeometry from '../util/Geometry.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import { theHTMLSanitizer } from '../util/HTMLSanitizer.js';
import OverpassAPIDataLoader from '../core/OverpassAPIDataLoader.js';

import { INVALID_OBJ_ID, NOT_FOUND, ZERO, ONE, LAT_LNG } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class is used to represent a branch of the dictionary tree.
@private
@------------------------------------------------------------------------------------------------------------------------------
*/

class DictionaryItem {
	constructor ( itemName, isRoot ) {
		this.name = theHTMLSanitizer.sanitizeToJsString ( itemName );
		this.items = [];
		this.filterTagsArray = [];
		this.elementTypes = [ 'node', 'way', 'relation' ];
		this.isSelected = false;
		this.isExpanded = false;
		this.isRoot = false;
		if ( isRoot ) {
			this.isExpanded = true;
			this.isRoot = true;
		}
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class manages the search dictionary, the search rectangles on the map and search the osm data
@see {@link theOsmSearchEngine} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class OsmSearchEngine	{

	#searchStarted = false;
	#previousSearchBounds = null;
	static #searchBounds = null;
	#dictionary = null;
	#filterItems = [];

	#previousSearchRectangleObjId = INVALID_OBJ_ID;

	static #nextSearchRectangleObjId = INVALID_OBJ_ID;

	/**
	Draw the previous search rectangle on the map
	@fires removeobject
	@fires addrectangle
	@private
	*/

	#drawPreviousSearchRectangle ( ) {
		if ( ! this.#previousSearchBounds ) {
			return;
		}
		if ( INVALID_OBJ_ID === this.#previousSearchRectangleObjId ) {
			this.#previousSearchRectangleObjId = ObjId.nextObjId;
		}
		else {
			theEventDispatcher.dispatch ( 'removeobject', { objId : this.#previousSearchRectangleObjId } );
		}
		theEventDispatcher.dispatch (
			'addrectangle',
			{
				objId : this.#previousSearchRectangleObjId,
				bounds : [
					[ this.#previousSearchBounds.getSouthWest ( ).lat, this.#previousSearchBounds.getSouthWest ( ).lng ],
					[ this.#previousSearchBounds.getNorthEast ( ).lat, this.#previousSearchBounds.getNorthEast ( ).lng ]
				],
				properties : theConfig.osmSearch.previousSearchLimit
			}
		);

	}

	/**
	Event listener for the map zoom and pan. Redraw the next search rectangle on the map
	@fires removeobject
	@fires addrectangle
	@listens zoom
	@listens move
	@private
	*/

	static #onMapChange ( ) {
		const SEARCH_DIMENSION = 5000;
		if ( INVALID_OBJ_ID === OsmSearchEngine.#nextSearchRectangleObjId ) {
			OsmSearchEngine.#nextSearchRectangleObjId = ObjId.nextObjId;
		}
		else {
			theEventDispatcher.dispatch ( 'removeobject', { objId : OsmSearchEngine.#nextSearchRectangleObjId } );
		}
		let mapCenter = theTravelNotesData.map.getCenter ( );
		OsmSearchEngine.#searchBounds = theTravelNotesData.map.getBounds ( );
		let maxBounds = theGeometry.getSquareBoundingBox ( [ mapCenter.lat, mapCenter.lng ], SEARCH_DIMENSION );
		OsmSearchEngine.#searchBounds.getSouthWest ( ).lat =
			Math.max ( OsmSearchEngine.#searchBounds.getSouthWest ( ).lat, maxBounds.getSouthWest ( ).lat );
		OsmSearchEngine.#searchBounds.getSouthWest ( ).lng =
			Math.max ( OsmSearchEngine.#searchBounds.getSouthWest ( ).lng, maxBounds.getSouthWest ( ).lng );
		OsmSearchEngine.#searchBounds.getNorthEast ( ).lat =
			Math.min ( OsmSearchEngine.#searchBounds.getNorthEast ( ).lat, maxBounds.getNorthEast ( ).lat );
		OsmSearchEngine.#searchBounds.getNorthEast ( ).lng =
			Math.min ( OsmSearchEngine.#searchBounds.getNorthEast ( ).lng, maxBounds.getNorthEast ( ).lng );
		theEventDispatcher.dispatch (
			'addrectangle',
			{
				objId : OsmSearchEngine.#nextSearchRectangleObjId,
				bounds : OsmSearchEngine.#searchBounds,
				properties : theConfig.osmSearch.nextSearchLimit
			}
		);
	}

	/**
	Compare the tags of the osmElement with the tags of the filterTags
	@return {boolean} true when all the tags present in the filterTags are present in the osmElement with the same value
	@private
	*/

	#filterOsmElement ( osmElement, filterTags ) {
		let isValidOsmElement = true;
		filterTags.forEach (
			filterTag => {
				let [ key, value ] = Object.entries ( filterTag ) [ ZERO ];
				isValidOsmElement =
					isValidOsmElement &&
					osmElement.tags [ key ] &&
					( ! value || osmElement.tags [ key ] === value );

			}
		);

		return isValidOsmElement;
	}

	/**
	Filter the osmElement with the list of selected DictionaryItems and add the osmElement to the map of pointsOfInterest
	if the osmElement pass the filter. Add also a description, a latitude and longitude to the osmElement
	@param {Object} osmElement the object to analyse
	@param {Map} pointsOfInterest A map with all the retained osmElements
	@private
	*/

	#addPointOfInterest ( osmElement, pointsOfInterest ) {
		this.#filterItems.forEach (
			filterItem => {
				filterItem.filterTagsArray.forEach (
					filterTags => {
						if ( this.#filterOsmElement ( osmElement, filterTags ) ) {
							osmElement.description = filterItem.name;
							pointsOfInterest.set ( osmElement.id, osmElement );
						}
					}
				);
			}
		);
	}

	/**
	Build an array of queries for calls to OSM.
	@return {Array.<string>} An array of string to use with OverpassAPIDataLoader
	@private
	*/

	#getSearchQueries ( ) {
		let searchQueries = [];
		this.#previousSearchBounds = OsmSearchEngine.#searchBounds;

		let keysMap = new Map ( );

		this.#filterItems.forEach (
			filterItem => {
				filterItem.filterTagsArray.forEach (
					filterTags => {

						let [ key, value ] = Object.entries ( filterTags [ ZERO ] ) [ ZERO ];
						let valuesElements = keysMap.get ( key );
						if ( ! valuesElements ) {
							valuesElements = { values : new Map ( ), elements : new Map ( ) };
							keysMap.set ( key, valuesElements );
						}
						valuesElements.values.set ( value, value );
						filterItem.elementTypes.forEach (
							elementType => {
								valuesElements.elements.set ( elementType, elementType );
							}
						);
					}
				);
			}
		);

		let searchBoundingBoxString = '(' +
			OsmSearchEngine.#searchBounds.getSouthWest ( ).lat.toFixed ( LAT_LNG.fixed ) +
			',' +
			OsmSearchEngine.#searchBounds.getSouthWest ( ).lng.toFixed ( LAT_LNG.fixed ) +
			',' +
			OsmSearchEngine.#searchBounds.getNorthEast ( ).lat.toFixed ( LAT_LNG.fixed ) +
			',' +
			OsmSearchEngine.#searchBounds.getNorthEast ( ).lng.toFixed ( LAT_LNG.fixed ) +
			')';

		keysMap.forEach (
			( valuesElements, key ) => {
				let queryTag = '"' + key + '"';
				if ( ONE === valuesElements.values.size ) {
					let value = valuesElements.values.values ( ).next ( ).value;
					if ( value ) {
						queryTag += '="' + value + '"';
					}
				}
				else if ( ONE < valuesElements.values.size ) {
					queryTag += '~"';
					valuesElements.values.forEach (
						value => {
							queryTag += value + '|';
						}
					);
					queryTag = queryTag.substr ( ZERO, queryTag.length - ONE ) + '"';
				}
				let queryElement =
					ONE === valuesElements.elements.size ? valuesElements.elements.values ( ).next ( ).value : 'nwr';

				searchQueries.push (
					queryElement + '[' + queryTag + ']' + searchBoundingBoxString + ';' +
					( 'node' === queryElement ? '' : '(._;>;);' ) + 'out;'
				);
			}
		);

		return searchQueries;
	}

	/**
	Search all selected items on the tree dictionary and for each selected item, add it to a list of selected items
	and add the first tag to the root tags map.
	@param {DictionaryItem} item The item from witch the search start. Recursive function. The first
	call start with this.#dictionary
	@private
	*/

	#searchFilters ( item ) {
		if ( item.isSelected && ( ZERO < item.filterTagsArray.length ) ) {
			this.#filterItems = this.#filterItems.concat ( item );
		}
		item.items.forEach ( nextItem => this.#searchFilters ( nextItem ) );
	}

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	The dictionary is a DictionaryItems tree that is used to performs search in osm
	*/

	get dictionary ( ) { return this.#dictionary; }

	/**
	Start a search into osm for the items selected in the dictionary
	*/

	async search ( ) {
		if ( this.#searchStarted ) {
			return;
		}
		this.#searchStarted = true;
		this.#filterItems = [];
		this.#searchFilters ( this.#dictionary );
		let dataLoader = new OverpassAPIDataLoader ( { searchPlaces : false } );
		await dataLoader.loadData ( this.#getSearchQueries ( ) );
		let pointsOfInterest = new Map ( );

		[ dataLoader.nodes, dataLoader.ways, dataLoader.relations ]. forEach (
			elementsMap => {
				elementsMap.forEach (
					osmElement => {
						if ( osmElement.tags ) {
							this.#addPointOfInterest ( osmElement, pointsOfInterest );
						}
					}
				);
			}
		);
		theTravelNotesData.searchData =
			Array.from ( pointsOfInterest.values ( ) ).sort (
				( obj1, obj2 ) => obj1.description > obj2.description
			);
		this.#searchStarted = false;
		theEventDispatcher.dispatch ( 'showsearch' );
	}

	/**
	Add maps event listeners and search rectangles on the map
	*/

	show ( ) {
		theTravelNotesData.map.on ( 'zoom', OsmSearchEngine.#onMapChange );
		theTravelNotesData.map.on ( 'move', OsmSearchEngine.#onMapChange );
		OsmSearchEngine.#onMapChange ( );
		this.#drawPreviousSearchRectangle ( );
	}

	/**
	Remove maps event listeners and search rectangles on the map
	*/

	hide ( ) {
		let eventDispatcher = theEventDispatcher;
		theTravelNotesData.map.off ( 'zoom', OsmSearchEngine.#onMapChange );
		theTravelNotesData.map.off ( 'move', OsmSearchEngine.#onMapChange );
		if ( INVALID_OBJ_ID !== OsmSearchEngine.#nextSearchRectangleObjId ) {
			eventDispatcher.dispatch ( 'removeobject', { objId : OsmSearchEngine.#nextSearchRectangleObjId } );
			OsmSearchEngine.#nextSearchRectangleObjId = INVALID_OBJ_ID;
		}
		if ( INVALID_OBJ_ID !== this.#previousSearchRectangleObjId ) {
			eventDispatcher.dispatch ( 'removeobject', { objId : this.#previousSearchRectangleObjId } );
			this.#previousSearchRectangleObjId = INVALID_OBJ_ID;
		}
	}

	/**
	Parse the content of the TravelNotesSearchDictionaryXX.csv and build a tree of DictionaryItems
	with this content
	*/

	parseDictionary ( dictionaryTextContent ) {
		this.#dictionary = new DictionaryItem ( 'All', true );
		let itemsArray = [ this.#dictionary.items ];
		let filterTagsArray = null;
		let currentItem = null;

		// split a line into words and add a DictionaryItem or a filterTag to the dictionary
		function parseLine ( line ) {
			let words = line.split ( ';' );
			while ( '' === words [ words.length - ONE ] ) {
				words.pop ( );
			}
			let wordPos = ZERO;
			let filterTags = null;
			words.forEach (
				word => {
					if ( '' !== word ) {
						if ( NOT_FOUND === word.indexOf ( '=' ) ) {
							currentItem = new DictionaryItem ( word );
							itemsArray [ wordPos ].push ( currentItem );
							itemsArray [ wordPos + ONE ] = currentItem.items;
							filterTagsArray = currentItem.filterTagsArray;
						}
						else {
							let keyAndValue = word.split ( '=' );
							if ( 'element' === keyAndValue [ ZERO ] ) {
								currentItem.elementTypes = [ keyAndValue [ ONE ] ];
							}
							else {
								let filterTag = {};
								filterTag [ keyAndValue [ ZERO ] ] =
									'*' === keyAndValue [ ONE ] ? null : keyAndValue [ ONE ];
								filterTags = filterTags || [];
								filterTags.push ( filterTag );
							}
						}
					}
					wordPos ++;
				}
			);
			if ( filterTags ) {
				filterTagsArray.push ( filterTags );
			}
		}

		// split the dictionary content into lines and analyse each line
		dictionaryTextContent
			.split ( /\r\n|\r|\n/ )
			.forEach (
				line => {
					if ( '' !== line ) {
						parseLine ( line );
					}
				}
			);
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@desc The one and only one instance of OsmSearchEngine class
@type {OsmSearchEngine}
@constant
@global

@------------------------------------------------------------------------------------------------------------------------------
*/

const theOsmSearchEngine = new OsmSearchEngine ( );

export default theOsmSearchEngine;

/*
--- End of OsmSearchEngine.js file --------------------------------------------------------------------------------------------
*/