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
		- Issue #125 : Outphase osmSearch and add it to TravelNotes
	- v2.0.0:
		- Issue #138 : Protect the app - control html entries done by user.
Doc reviewed 20200901
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
import { theEventDispatcher } from '../util/EventDispatcher.js';
import { theGeometry } from '../util/Geometry.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import { INVALID_OBJ_ID, NOT_FOUND, ZERO, ONE, LAT_LNG, HTTP_STATUS_OK } from '../util/Constants.js';
import { theHTMLSanitizer } from '../util/HTMLSanitizer.js';

let ourPreviousSearchRectangleObjId = INVALID_OBJ_ID;
let ourNextSearchRectangleObjId = INVALID_OBJ_ID;
let ourSearchStarted = false;

const OUR_SEARCH_DIM = 5000;
let ourPreviousSearchBounds = null;
let ourSearchBounds = null;
let ourDictionary = null;
let ourFilterItems = [];

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class is used to represent a branch of the dictionary tree.
@public
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

@function ourDrawPreviousSearchRectangle
@desc Draw the previous search rectangle on the map
@fires removeobject
@fires addrectangle
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourDrawPreviousSearchRectangle ( ) {
	if ( ! ourPreviousSearchBounds ) {
		return;
	}
	if ( INVALID_OBJ_ID === ourPreviousSearchRectangleObjId ) {
		ourPreviousSearchRectangleObjId = ObjId.nextObjId;
	}
	else {
		theEventDispatcher.dispatch ( 'removeobject', { objId : ourPreviousSearchRectangleObjId } );
	}
	theEventDispatcher.dispatch (
		'addrectangle',
		{
			objId : ourPreviousSearchRectangleObjId,
			bounds : [
				[ ourPreviousSearchBounds.getSouthWest ( ).lat, ourPreviousSearchBounds.getSouthWest ( ).lng ],
				[ ourPreviousSearchBounds.getNorthEast ( ).lat, ourPreviousSearchBounds.getNorthEast ( ).lng ]
			],
			properties : theConfig.osmSearch.previousSearchLimit
		}
	);

}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnMapChange
@desc event listener for the map zoom and pan. Redraw the next search rectangle on the map
@fires removeobject
@fires addrectangle
@listens zoom
@listens move
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnMapChange ( ) {
	if ( INVALID_OBJ_ID === ourNextSearchRectangleObjId ) {
		ourNextSearchRectangleObjId = ObjId.nextObjId;
	}
	else {
		theEventDispatcher.dispatch ( 'removeobject', { objId : ourNextSearchRectangleObjId } );
	}
	let mapCenter = theTravelNotesData.map.getCenter ( );
	ourSearchBounds = theTravelNotesData.map.getBounds ( );
	let maxBounds = theGeometry.getSquareBoundingBox ( [ mapCenter.lat, mapCenter.lng ], OUR_SEARCH_DIM );
	ourSearchBounds.getSouthWest ( ).lat = Math.max ( ourSearchBounds.getSouthWest ( ).lat, maxBounds.getSouthWest ( ).lat );
	ourSearchBounds.getSouthWest ( ).lng = Math.max ( ourSearchBounds.getSouthWest ( ).lng, maxBounds.getSouthWest ( ).lng );
	ourSearchBounds.getNorthEast ( ).lat = Math.min ( ourSearchBounds.getNorthEast ( ).lat, maxBounds.getNorthEast ( ).lat );
	ourSearchBounds.getNorthEast ( ).lng = Math.min ( ourSearchBounds.getNorthEast ( ).lng, maxBounds.getNorthEast ( ).lng );
	theEventDispatcher.dispatch (
		'addrectangle',
		{
			objId : ourNextSearchRectangleObjId,
			bounds : ourSearchBounds,
			properties : theConfig.osmSearch.nextSearchLimit
		}
	);
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourSearchFilters
@desc search all selected items on the tree dictionary and for each selected item, add it to a list of selected items
and add the first tag to the root tags map.
@param {DictionaryItem} item The item from witch the search start. Recursive function. The first call start with ourDictionary
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourSearchFilters ( item ) {
	if ( item.isSelected && ( ZERO < item.filterTagsArray.length ) ) {
		ourFilterItems = ourFilterItems.concat ( item );
	}
	item.items.forEach ( ourSearchFilters );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourGetSearchPromises
@desc Build an array of Promises for calls to OSM.
@return {Array.<Promise>} An array of Promise to use with Promise.allSettled ( )
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourGetSearchPromises ( ) {
	let searchPromises = [];
	ourPreviousSearchBounds = ourSearchBounds;

	let keysMap = new Map ( );

	ourFilterItems.forEach (
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
		ourSearchBounds.getSouthWest ( ).lat.toFixed ( LAT_LNG.fixed ) +
		',' +
		ourSearchBounds.getSouthWest ( ).lng.toFixed ( LAT_LNG.fixed ) +
		',' +
		ourSearchBounds.getNorthEast ( ).lat.toFixed ( LAT_LNG.fixed ) +
		',' +
		ourSearchBounds.getNorthEast ( ).lng.toFixed ( LAT_LNG.fixed ) +
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
			let queryElement = ONE === valuesElements.elements.size ? valuesElements.elements.values ( ).next ( ).value : 'nwr';

			let url = theConfig.overpassApi.url + '?data=[out:json][timeout:' + theConfig.overpassApi.timeOut + '];' +
				queryElement + '[' + queryTag + ']' + searchBoundingBoxString + ';' +
				( 'node' === queryElement ? '' : '(._;>;);' ) + 'out;';

			searchPromises.push ( fetch ( url ) );
		}
	);

	return searchPromises;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourFilterOsmElement
@desc Compare the tags of the osmElement with the tags of the filterTags
@return {boolean} true when all the tags present in the filterTags are present in the osmElement with the same value
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourFilterOsmElement ( osmElement, filterTags ) {
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
@------------------------------------------------------------------------------------------------------------------------------

@function ourAddPointOfInterest
@desc Filter the osmElement with the list of selected DictionaryItems and add the osmElement to the map of pointsOfInterest
if the osmElement pass the filter. Add also a description, a latitude and longitude to the osmElement
@param {Object} osmElement the object to analyse
@param {Map} pointsOfInterest A map with all the retained osmElements
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourAddPointOfInterest ( osmElement, pointsOfInterest ) {
	ourFilterItems.forEach (
		filterItem => {
			filterItem.filterTagsArray.forEach (
				filterTags => {
					if ( ourFilterOsmElement ( osmElement, filterTags ) ) {
						osmElement.description = filterItem.name;
						pointsOfInterest.set ( osmElement.id, osmElement );
					}
				}
			);
		}
	);
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourParseOsmElements
@desc parse the osm responses, creating elements that can be used by TravelNotesData
@param {Array.<Objects>} osmElements an array of Objects Element coming from osm
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourParseOsmElements ( osmElements ) {
	let pointsOfInterest = new Map ( );
	let nodes = new Map ( );
	let ways = new Map ( );
	let relations = new Map ( );

	function setWayGeometry ( way ) {
		way.geometry = [ [ ] ];
		way.lat = LAT_LNG.defaultValue;
		way.lon = LAT_LNG.defaultValue;
		let nodesCounter = ZERO;
		way.nodes.forEach (
			nodeId => {
				let node = nodes.get ( nodeId );
				way.geometry [ ZERO ].push ( [ node.lat, node.lon ] );
				way.lat += node.lat;
				way.lon += node.lon;
				nodesCounter ++;
			}
		);
		if ( ZERO !== nodesCounter ) {
			way.lat /= nodesCounter;
			way.lon /= nodesCounter;
		}
	}

	function setRelationGeometry ( relation ) {
		relation.geometry = [ [ ] ];
		relation.lat = LAT_LNG.defaultValue;
		relation.lon = LAT_LNG.defaultValue;
		let membersCounter = ZERO;
		relation.members.forEach (
			member => {
				if ( 'way' === member.type ) {
					let way = ways.get ( member.ref );
					setWayGeometry ( way );
					relation.geometry.push ( way.geometry [ ZERO ] );
					relation.lat += way.lat;
					relation.lon += way.lon;
					membersCounter ++;
				}
			}
		);
		if ( ZERO !== membersCounter ) {
			relation.lat /= membersCounter;
			relation.lon /= membersCounter;
		}
	}

	osmElements.forEach (
		osmElement => {
			switch ( osmElement.type ) {
			case 'node' :
				nodes.set ( osmElement.id, osmElement );
				break;
			case 'way' :
				ways.set ( osmElement.id, osmElement );
				break;
			case 'relation' :
				relations.set ( osmElement.id, osmElement );
				break;
			default :
				break;
			}
			if ( osmElement.tags ) {
				ourAddPointOfInterest ( osmElement, pointsOfInterest );
			}
		}
	);

	pointsOfInterest.forEach (
		pointOfInterest => {
			switch ( pointOfInterest.type ) {
			case 'way' :
				setWayGeometry ( pointOfInterest );
				break;
			case 'relation' :
				setRelationGeometry ( pointOfInterest );
				break;
			default :
				break;
			}
		}
	);
	theTravelNotesData.searchData =
		Array.from ( pointsOfInterest.values ( ) ).sort (
			( obj1, obj2 ) => obj1.description > obj2.description
				?
				ONE
				:
				( obj1.description < obj2.description ? NOT_FOUND : ZERO )
		);
	ourSearchStarted = false;
	theEventDispatcher.dispatch ( 'showsearch' );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourParseSearchResult
@desc read each response in the array returned by the call to Promise.allSettled ( ) and push all osmElements in an array
@param {Array.<Object>} results The array given by the call to Promise.allSettled ( )
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

async function ourParseSearchResult ( results ) {
	let osmElements = [];
	for ( let counter = ZERO; counter < results.length; counter ++ ) {
		if (
			'fulfilled' === results[ counter ].status
			&&
			HTTP_STATUS_OK === results[ counter ].value.status
			&&
			results[ counter ].value.ok
		) {
			let response = await results[ counter ].value.json ( );
			osmElements = osmElements.concat ( response.elements );
		}
	}
	ourParseOsmElements ( osmElements );
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

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	The dictionary is a DictionaryItems tree that is used to performs search in osm
	*/

	get dictionary ( ) { return ourDictionary; }

	/**
	Start a search into osm for the items selected in the dictionary
	*/

	search ( ) {
		if ( ourSearchStarted ) {
			return;
		}
		ourSearchStarted = true;
		ourFilterItems = [];
		ourSearchFilters ( ourDictionary );
		Promise.allSettled ( ourGetSearchPromises ( ) )
			.then ( ourParseSearchResult );
	}

	/**
	Add maps event listeners and search rectangles on the map
	*/

	show ( ) {
		theTravelNotesData.map.on ( 'zoom', ourOnMapChange );
		theTravelNotesData.map.on ( 'move', ourOnMapChange );
		ourOnMapChange ( );
		ourDrawPreviousSearchRectangle ( );
	}

	/**
	Remove maps event listeners and search rectangles on the map
	*/

	hide ( ) {
		let eventDispatcher = theEventDispatcher;
		theTravelNotesData.map.off ( 'zoom', ourOnMapChange );
		theTravelNotesData.map.off ( 'move', ourOnMapChange );
		if ( INVALID_OBJ_ID !== ourNextSearchRectangleObjId ) {
			eventDispatcher.dispatch ( 'removeobject', { objId : ourNextSearchRectangleObjId } );
			ourNextSearchRectangleObjId = INVALID_OBJ_ID;
		}
		if ( INVALID_OBJ_ID !== ourPreviousSearchRectangleObjId ) {
			eventDispatcher.dispatch ( 'removeobject', { objId : ourPreviousSearchRectangleObjId } );
			ourPreviousSearchRectangleObjId = INVALID_OBJ_ID;
		}
	}

	/**
	Parse the content of the TravelNotesSearchDictionaryXX.csv and build a tree of DictionaryItems
	with this content
	*/

	parseDictionary ( dictionaryTextContent ) {
		ourDictionary = new DictionaryItem ( 'All', true );
		let itemsArray = [ ourDictionary.items ];
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

const OUR_OSM_SEARCH_ENGINE = new OsmSearchEngine ( );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of OsmSearchEngine class
	@type {OsmSearchEngine}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	OUR_OSM_SEARCH_ENGINE as theOsmSearchEngine
};

/*
--- End of OsmSearchEngine.js file --------------------------------------------------------------------------------------------
*/