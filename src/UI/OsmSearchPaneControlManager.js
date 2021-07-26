import theTranslator from '../UI/Translator.js';
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import theOsmSearchEngine from '../core/OsmSearchEngine.js';

import { ZERO, MOUSE_WHEEL_FACTORS } from '../util/Constants.js';

class OsmSearchTreeEventListeners {

	static osmSearchTree = null;

	static selectItem ( item, isSelected ) {
		item.isSelected = isSelected;
		item.items.forEach (
			subItem => { OsmSearchTreeEventListeners.selectItem ( subItem, isSelected ); }
		);
	}

	static onCheckboxChange ( changeEvent ) {
		OsmSearchTreeEventListeners.selectItem ( changeEvent.target.parentNode.dictItem, changeEvent.target.checked );
		OsmSearchTreeEventListeners.osmSearchTree.redraw ( );
	}

	static onWheel ( wheelEvent ) {
		if ( wheelEvent.deltaY ) {
			wheelEvent.target.scrollTop +=
				wheelEvent.deltaY * MOUSE_WHEEL_FACTORS [ wheelEvent.deltaMode ];
		}
		wheelEvent.stopPropagation ( );
	}

	static onArrowClick ( clickEvent ) {
		clickEvent.target.parentNode.dictItem.isExpanded = ! clickEvent.target.parentNode.dictItem.isExpanded;
		OsmSearchTreeEventListeners.osmSearchTree.redraw ( );
	}


}

class OsmSearchToolbar {

	static osmSearchTree = null;

	static onSearchClick ( ) {

		// tmp moved myClearPaneDataDiv ( );
		theOsmSearchEngine.dictionary.isExpanded = false;
		OsmSearchToolbar.osmSearchTree.redraw ( );
		// tmp moved myAddWait ( );
		theOsmSearchEngine.search ( );
		// Notice: theOsmSearchEngine send a 'showsearch' event when the search is succesfully done
	}

	static onExpandButtonClick ( ) {
		OsmSearchToolbar.osmSearchTree.expandSearchTree ( theOsmSearchEngine.dictionary );
		OsmSearchToolbar.osmSearchTree.redraw ( );
	}

	static onCollapseButtonClick ( ) {
		OsmSearchToolbar.osmSearchTree.collapseSearchTree ( theOsmSearchEngine.dictionary );
		OsmSearchToolbar.osmSearchTree.redraw ( );
	}

	static onClearButtonClick ( ) {
		OsmSearchToolbar.osmSearchTree.clearSearchTree ( theOsmSearchEngine.dictionary );
		OsmSearchToolbar.osmSearchTree.redraw ( );
	}

	#osmSearchToolbar = null;

	constructor ( ) {
		this.#osmSearchToolbar = theHTMLElementsFactory.create (
			'div'
		);
		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-Button',
				title : theTranslator.getText ( 'OsmSearchPaneUI - Search OpenStreetMap' ),
				textContent : '🔎'
			},
			this.#osmSearchToolbar
		)
			.addEventListener ( 'click', OsmSearchToolbar.onSearchClick, false );

		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-Button',
				title : theTranslator.getText ( 'OsmSearchPaneUI - Expand tree' ),
				textContent : '▼'
			},
			this.#osmSearchToolbar
		)
			.addEventListener ( 'click', OsmSearchToolbar.onExpandButtonClick, false );

		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-Button',
				title : theTranslator.getText ( 'OsmSearchPaneUI - Collapse tree' ),
				textContent : '▶'
			},
			this.#osmSearchToolbar
		)
			.addEventListener ( 'click', OsmSearchToolbar.onCollapseButtonClick, false );
		theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-OsmSearchPaneUI-ClearAllButton',
				className : 'TravelNotes-UI-Button',
				title : theTranslator.getText ( 'OsmSearchPaneUI - Clear tree' ),
				textContent : '❌'
			},
			this.#osmSearchToolbar
		)
			.addEventListener ( 'click', OsmSearchToolbar.onClearButtonClick, false );

	}

	get toolbar ( ) { return this.#osmSearchToolbar; }

}

class OsmSearchTree {

	#osmSearchTree = null;
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
			this.#osmSearchTree
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
			itemCheckbox.addEventListener ( 'change', OsmSearchTreeEventListeners.onCheckboxChange, false );
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
			itemArrow.addEventListener ( 'click', OsmSearchTreeEventListeners.onArrowClick, false );
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
		this.#osmSearchTree = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-OsmSearchPaneUI-SearchTree'
			}
		);
		this.#osmSearchTree.addEventListener ( 'wheel', OsmSearchTreeEventListeners.onWheel, false );

		// theOsmSearchEngine.dictionary.name = theTranslator.getText ( 'OsmSearchPaneUI - dictionary name' );
		theOsmSearchEngine.dictionary.name = '';
		this.#addItem ( theOsmSearchEngine.dictionary );

		OsmSearchToolbar.osmSearchTree = this;
		OsmSearchTreeEventListeners.osmSearchTree = this;
	}

	redraw ( ) {

		// theOsmSearchEngine.dictionary.isExpanded = false;
		this.#osmSearchTree.textContent = '';
		this.#addItem ( theOsmSearchEngine.dictionary );
	}

	expandSearchTree ( item ) {
		item.items.forEach (
			tmpItem => { this.expandSearchTree ( tmpItem ); }
		);
		item.isExpanded = true;
	}

	collapseSearchTree ( item ) {
		item.items.forEach (
			tmpItem => { this.collapseSearchTree ( tmpItem ); }
		);
		if ( ! item.isRoot ) {
			item.isExpanded = false;
		}
	}

	clearSearchTree ( item ) {
		item.items.forEach (
			tmpItem => { this.clearSearchTree ( tmpItem ); }
		);
		item.isSelected = false;
	}

	get tree ( ) { return this.#osmSearchTree; }
}

class OsmSearchPaneControlManager {

	#osmSearchTree = null;
	#toolbar = null;

	constructor ( ) {
		this.#toolbar = new OsmSearchToolbar ( );
		this.#osmSearchTree = new OsmSearchTree ( );
	}

	addTree ( paneControl ) {
		paneControl.appendChild ( this.#osmSearchTree.tree );
	}

	removeTree ( paneControl ) {
		paneControl.removeChild ( this.#osmSearchTree.tree );
	}

	addToolbar ( paneControl ) {
		paneControl.appendChild ( this.#toolbar.toolbar );
	}

	removeToolbar ( paneControl ) {
		paneControl.removeChild ( this.#toolbar.toolbar );
	}
}

export default OsmSearchPaneControlManager;