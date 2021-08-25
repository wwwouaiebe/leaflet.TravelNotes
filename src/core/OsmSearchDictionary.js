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
Doc reviewed ...
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

@module OsmSearchDictionary
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import OsmSearchDictionaryItem from '../core/OsmSearchDictionaryItem.js';
import { NOT_FOUND, ZERO, ONE } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class OsmSearchDictionary
@classdesc coming soon...
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class OsmSearchDictionary {

	#dictionary = null;
	#itemsMap = null;
	#itemsArray = [ ];
	#filterTagsArray = null;
	#currentItem = null;

	constructor ( ) {
		this.#itemsMap = new Map ( );
		this.#dictionary = new OsmSearchDictionaryItem ( 'All', true );
		this.#itemsMap.set ( this.#dictionary.objId, this.#dictionary );
		this.#itemsArray = [ this.#dictionary.items ];
	}

	// split a line into words and add a OsmSearchDictionaryItem or a filterTag to the dictionary
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
						this.#currentItem = new OsmSearchDictionaryItem ( word );
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

	/**
	Parse the content of the TravelNotesSearchDictionaryXX.csv and build a tree of DictionaryItems
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
	*/

	selectItemObjId ( itemObjId, isSelected ) {
		let item = this.#itemsMap.get ( itemObjId );
		this.#selectItem ( item, isSelected );
	}

	#selectItem ( item, isSelected ) {
		item.isSelected = isSelected;
		item.items.forEach (
			subItem => { this.#selectItem ( subItem, isSelected ); }
		);
	}

	changeExpanded ( itemObjId ) {
		let item = this.#itemsMap.get ( itemObjId );
		item.isExpanded = ! item.isExpanded;
	}

	/**
	Expand the complete tree
	*/

	expandBranch ( item ) {
		item.items.forEach (
			tmpItem => { this.expandBranch ( tmpItem ); }
		);
		item.isExpanded = true;
	}

	/**
	Collapse the complete tree
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
	Unselect all the items in the tree
	*/

	clearBranch ( item ) {
		item.items.forEach (
			tmpItem => { this.clearBranch ( tmpItem ); }
		);
		item.isSelected = false;
	}

	/**
	The dictionary is a DictionaryItems tree that is used to performs search in osm
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