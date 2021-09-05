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

@file OsmSearchDictionary.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module coreOsmSearch
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import DictionaryItem from '../coreOsmSearch/DictionaryItem.js';
import { NOT_FOUND, ZERO, ONE } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class OsmSearchDictionary
@classdesc This class contains the OsmSearch dictionary and methods to perform changes in the dictionary
@see {@link DictionaryItem} for dictionary items
@see {@link theOsmSearchDictionary} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class OsmSearchDictionary {

	/**
	the root item of the dictionary
	@private
	*/

	#dictionary = null;

	/**
	A map with the dictionary items
	@private
	*/

	#itemsMap = null;

	/**
	Variables used for the conversion of the .csv file
	*/

	#itemsArray = [ ];
	#filterTagsArray = null;
	#currentItem = null;

	/**
	Split a line from the csv file into words and add a DictionaryItem or a filterTag to the dictionary
	@private
	*/

	#parseLine ( line ) {
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
						this.#currentItem = new DictionaryItem ( word );
						this.#itemsMap.set ( this.#currentItem.objId, this.#currentItem );
						this.#itemsArray [ wordPos ].push ( this.#currentItem );
						this.#itemsArray [ wordPos + ONE ] = this.#currentItem.items;
						this.#filterTagsArray = this.#currentItem.filterTagsArray;
					}
					else {
						let keyAndValue = word.split ( '=' );
						if ( 'element' === keyAndValue [ ZERO ] ) {
							this.#currentItem.elementTypes = [ keyAndValue [ ONE ] ];
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
			this.#filterTagsArray.push ( filterTags );
		}
	}

	/*
	constructor
	*/

	constructor ( ) {
		this.#itemsMap = new Map ( );
		this.#dictionary = new DictionaryItem ( 'All', true );
		this.#itemsMap.set ( this.#dictionary.objId, this.#dictionary );
		this.#itemsArray = [ this.#dictionary.items ];
		Object.freeze ( this );
	}

	/**
	Parse the content of the TravelNotesSearchDictionaryXX.csv and build a tree of DictionaryItem
	with this content
	*/

	parseDictionary ( dictionaryTextContent ) {

		// split the dictionary content into lines and analyse each line
		dictionaryTextContent.split ( /\r\n|\r|\n/ ).forEach (
			line => {
				if ( '' !== line ) {
					this.#parseLine ( line );
				}
			}
		);
	}

	/**
	Helper method to select or unselected all the items childrens of a given item
	@private
	*/

	#selectItem ( item, isSelected ) {
		item.isSelected = isSelected;
		item.items.forEach (
			subItem => { this.#selectItem ( subItem, isSelected ); }
		);
	}

	/**
	Mark as selected/not selected an item identified by it's objId and all the chidrens of this item
	*/

	selectItemObjId ( itemObjId, isSelected ) {
		let item = this.#itemsMap.get ( itemObjId );
		this.#selectItem ( item, isSelected );
	}

	/**
	Mark as expanded an item identified by it's objId
	*/

	changeExpanded ( itemObjId ) {
		let item = this.#itemsMap.get ( itemObjId );
		item.isExpanded = ! item.isExpanded;
	}

	/**
	Mark as expanded an item and all the childrens
	*/

	expandBranch ( item ) {
		item.items.forEach (
			tmpItem => { this.expandBranch ( tmpItem ); }
		);
		item.isExpanded = true;
	}

	/**
	Mark as not expanded an item and all the childrens
	*/

	collapseBranch ( item ) {
		item.items.forEach (
			tmpItem => { this.collapseBranch ( tmpItem ); }
		);
		if ( ! item.isRoot ) {
			item.isExpanded = false;
		}
	}

	/**
	Unselect an item and all the childrens
	*/

	clearBranch ( item ) {
		item.items.forEach (
			tmpItem => { this.clearBranch ( tmpItem ); }
		);
		item.isSelected = false;
	}

	/**
	get the dictionary
	*/

	get dictionary ( ) { return this.#dictionary; }

}

const theOsmSearchDictionary = new OsmSearchDictionary ( );

export default theOsmSearchDictionary;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of OsmSearchDictionary.js file

@------------------------------------------------------------------------------------------------------------------------------
*/