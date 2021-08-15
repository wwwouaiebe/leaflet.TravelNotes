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
Doc reviewed ...
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file OsmSearchTreeUI.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module OsmSearchTreeUI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import theOsmSearchEngine from '../core/OsmSearchEngine.js';
import OsmSearchTreeUIEventListeners from '../UI/OsmSearchTreeUIEventListeners.js';
import OsmSearchToolbarUI from '../UI/OsmSearchToolbarUI.js';
import { ZERO } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class OsmSearchTreeUI
@classdesc This class build the search tree and contains also methods to modify this tree

@------------------------------------------------------------------------------------------------------------------------------
*/

class OsmSearchTreeUI {

	/**
	A reference to the tree HTMLElement
	*/

	#treeHTMLElement = null;

	/**
	Recursivity counter for the #addItem method
	*/

	#deepTree = ZERO;

	/**
	Add a dictionary item in the SearchTree and do the same for all descendants
	@private
	*/

	#addItem ( item ) {

		this.#deepTree ++;
		let itemDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-OsmSearchPaneUI-SearchItem ' +
					'TravelNotes-OsmSearchPaneUI-SearchItemMargin' + this.#deepTree,
				dictItem : item
			},
			this.#treeHTMLElement
		);
		if ( ! item.isRoot ) {
			let itemCheckbox = theHTMLElementsFactory.create (
				'input',
				{
					type : 'checkbox',
					checked : item.isSelected
				},
				itemDiv
			);
			itemCheckbox.addEventListener ( 'change', OsmSearchTreeUIEventListeners.onCheckboxChange, false );
		}
		if ( ZERO === item.filterTagsArray.length ) {
			let itemArrow = theHTMLElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-UI-Button TravelNotes-OsmSearchPaneUI-TreeArrow',
					textContent : item.isExpanded ? '▼' : '▶'
				},
				itemDiv
			);
			itemArrow.addEventListener ( 'click', OsmSearchTreeUIEventListeners.onArrowClick, false );
		}
		theHTMLElementsFactory.create (
			'text',
			{
				value : item.name
			},
			itemDiv
		);
		if ( item.isExpanded ) {
			item.items.forEach ( tmpItem => this.#addItem ( tmpItem ) );
		}
		this.#deepTree --;
	}

	constructor ( ) {
		this.#treeHTMLElement = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-OsmSearchPaneUI-SearchTree'
			}
		);
		this.#treeHTMLElement.addEventListener ( 'wheel', OsmSearchTreeUIEventListeners.onWheel, false );

		// theOsmSearchEngine.dictionary.name = theTranslator.getText ( 'OsmSearchPaneUI - dictionary name' );
		theOsmSearchEngine.dictionary.name = '';
		this.#addItem ( theOsmSearchEngine.dictionary );

		OsmSearchToolbarUI.osmSearchTreeUI = this;
		OsmSearchTreeUIEventListeners.osmSearchTreeUI = this;
	}

	/**
	rebuild the complete tree
	*/

	redraw ( ) {

		this.#treeHTMLElement.textContent = '';
		this.#addItem ( theOsmSearchEngine.dictionary );
	}

	/**
	Expand the complete tree
	*/

	expandSearchTree ( item ) {
		item.items.forEach (
			tmpItem => { this.expandSearchTree ( tmpItem ); }
		);
		item.isExpanded = true;
	}

	/**
	Collapse the complete tree
	*/

	collapseSearchTree ( item ) {
		item.items.forEach (
			tmpItem => { this.collapseSearchTree ( tmpItem ); }
		);
		if ( ! item.isRoot ) {
			item.isExpanded = false;
		}
	}

	/**
	Unselect all the items in the tree
	*/

	clearSearchTree ( item ) {
		item.items.forEach (
			tmpItem => { this.clearSearchTree ( tmpItem ); }
		);
		item.isSelected = false;
	}

	get treeHTMLElement ( ) { return this.#treeHTMLElement; }
}

export default OsmSearchTreeUI;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of OsmSearchTreeUI.js file

@------------------------------------------------------------------------------------------------------------------------------
*/