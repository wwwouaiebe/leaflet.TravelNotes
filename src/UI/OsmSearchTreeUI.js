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

@file OsmSearchTreeUI.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module osmSearchPaneUI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theHTMLElementsFactory from '../UILib/HTMLElementsFactory.js';
import theOsmSearchDictionary from '../coreOsmSearch/OsmSearchDictionary.js';
import { ZERO, MOUSE_WHEEL_FACTORS } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class TreeCheckboxChangeEL
@classdesc change event listener for the tree checkboxes

@------------------------------------------------------------------------------------------------------------------------------
*/

class TreeCheckboxChangeEL {

	#osmSearchTreeUI = null;

	/*
	constructor
	*/

	constructor ( osmSearchTreeUI ) {
		Object.freeze ( this );
		this.#osmSearchTreeUI = osmSearchTreeUI;
	}

	handleEvent ( changeEvent ) {
		changeEvent.stopPropagation ( );
		theOsmSearchDictionary.selectItemObjId (
			Number.parseInt ( changeEvent.target.parentNode.dataset.tanObjId ),
			changeEvent.target.checked
		);

		this.#osmSearchTreeUI.redraw ( );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class TreeWheelEL
@classdesc wheel event listener

@------------------------------------------------------------------------------------------------------------------------------
*/

class TreeWheelEL {

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	handleEvent ( wheelEvent ) {
		wheelEvent.stopPropagation ( );
		if ( wheelEvent.deltaY ) {
			wheelEvent.target.scrollTop +=
				wheelEvent.deltaY * MOUSE_WHEEL_FACTORS [ wheelEvent.deltaMode ];
		}
		wheelEvent.stopPropagation ( );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class TreeArrowClickEL
@classdesc cick event listener for the tree arrows

@------------------------------------------------------------------------------------------------------------------------------
*/

class TreeArrowClickEL {

	#osmSearchTreeUI = null;

	/*
	constructor
	*/

	constructor ( osmSearchTreeUI ) {
		Object.freeze ( this );
		this.#osmSearchTreeUI = osmSearchTreeUI;
	}

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		theOsmSearchDictionary.changeExpanded ( Number.parseInt ( clickEvent.target.parentNode.dataset.tanObjId ) );
		this.#osmSearchTreeUI.redraw ( );
	}

}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class OsmSearchTreeUI
@classdesc This class build the search tree and contains also methods to modify this tree
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class OsmSearchTreeUI {

	/**
	A reference to the tree HTMLElement
	@private
	*/

	#treeHTMLElement = null;

	/**
	Event listeners
	@private
	*/

	#eventListeners = {
		onClickArrow : null,
		onChangeCheckbox : null
	}

	/**
	Recursivity counter for the #addItem method
	@private
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
				dataset : { ObjId : item.objId }
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
			itemCheckbox.addEventListener ( 'change', this.#eventListeners.onChangeCheckbox, false );
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
			itemArrow.addEventListener ( 'click', this.#eventListeners.onClickArrow, false );
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

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );

		this.#eventListeners.onChangeCheckbox = new TreeCheckboxChangeEL ( this );
		this.#eventListeners.onClickArrow = new TreeArrowClickEL ( this );

		this.#treeHTMLElement = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-OsmSearchPaneUI-SearchTree'
			}
		);
		this.#treeHTMLElement.addEventListener ( 'wheel', new TreeWheelEL ( ), false );

		theOsmSearchDictionary.dictionary.name = '';
		this.#addItem ( theOsmSearchDictionary.dictionary );
	}

	/**
	rebuild the complete tree
	*/

	redraw ( ) {
		this.#treeHTMLElement.textContent = '';
		this.#addItem ( theOsmSearchDictionary.dictionary );
	}

	/**
	tree HTML element getter
	*/

	get treeHTMLElement ( ) { return this.#treeHTMLElement; }
}

export default OsmSearchTreeUI;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of OsmSearchTreeUI.js file

@------------------------------------------------------------------------------------------------------------------------------
*/