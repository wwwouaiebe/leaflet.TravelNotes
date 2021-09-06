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

@file OsmSearchDataUI.js
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

import theTravelNotesData from '../data/TravelNotesData.js';
import theHTMLElementsFactory from '../UILib/HTMLElementsFactory.js';
import theHTMLSanitizer from '../coreLib/HTMLSanitizer.js';
import theNoteDialogToolbarData from '../dialogNotes/NoteDialogToolbarData.js';
import OsmSearchContextMenu from '../contextMenus/OsmSearchContextMenu.js';
import theEventDispatcher from '../coreLib/EventDispatcher.js';
import ObjId from '../data/ObjId.js';

import { ZERO } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class SearchResultContextMenuEL
@classdesc contextmenu event listener for search result

@------------------------------------------------------------------------------------------------------------------------------
*/

class SearchResultContextMenuEL {

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	handleEvent ( contextMenuEvent ) {
		contextMenuEvent.stopPropagation ( );
		contextMenuEvent.preventDefault ( );
		new OsmSearchContextMenu ( contextMenuEvent, this.paneDataDiv ).show ( );
	}

}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class SearchResultMouseEnterEL
@classdesc mouseenter event listener for search result

@------------------------------------------------------------------------------------------------------------------------------
*/

class SearchResultMouseEnterEL {

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	handleEvent ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		let osmElement = theTravelNotesData.searchData [ Number.parseInt ( mouseEvent.target.dataset.tanElementIndex ) ];
		theEventDispatcher.dispatch (
			'addsearchpointmarker',
			{
				objId : Number.parseInt ( mouseEvent.target.dataset.tanObjId ),
				latLng : [ osmElement.lat, osmElement.lon ],
				geometry : osmElement.geometry
			}
		);
	}

}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class SearchResultMouseLeaveEL
@classdesc mouseenter event listener for search result

@------------------------------------------------------------------------------------------------------------------------------
*/

class SearchResultMouseLeaveEL {

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	handleEvent ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		theEventDispatcher.dispatch ( 'removeobject', { objId : Number.parseInt ( mouseEvent.target.dataset.tanObjId ) } );
	}

}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class OsmSearchDataUI
@classdesc This class add or remove the search data on the pane data
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class OsmSearchDataUI {

	#paneData = null;
	#currentOsmElement = null;
	#currentHtmlElement = null;
	#elementIndex = ZERO;
	#eventListeners = {
		onContextMenu : null,
		onMouseEnter : null,
		onMouseLeave : null
	};

	/**
	Icon builder
	@private
	*/

	#buildIcon ( ) {
		let iconContent = '';
		if ( this.#currentOsmElement.tags.rcn_ref ) {
			iconContent =
				'<div class=\'TravelNotes-MapNote TravelNotes-MapNoteCategory-0073\'>' +
				'<svg viewBox=\'0 0 20 20\'><text class=\'\' x=10 y=14>' +
				this.#currentOsmElement.tags.rcn_ref +
				'</text></svg></div>';
		}
		else {
			iconContent = theNoteDialogToolbarData.getIconContentFromName ( this.#currentOsmElement.description ) || '';
		}
		let iconCell = theHTMLElementsFactory.create (
			'div',
			{
				className :	'TravelNotes-OsmSearchPaneUI-SearchResult-IconCell'
			},
			this.#currentHtmlElement
		);
		theHTMLSanitizer.sanitizeToHtmlElement ( iconContent, iconCell );
	}

	/**
	generic builder
	@private
	*/

	#addOsmTag ( osmTagValue, searchResultCell ) {
		if ( osmTagValue ) {
			theHTMLElementsFactory.create ( 'div', { textContent : osmTagValue }, searchResultCell	);
		}
	}

	/**
	Address builder
	@private
	*/

	#addAddress ( searchResultCell ) {
		let street =
			this.#currentOsmElement.tags [ 'addr:street' ]
				?
				(
					this.#currentOsmElement.tags [ 'addr:housenumber' ]
						?
						this.#currentOsmElement.tags [ 'addr:housenumber' ] + ' '
						:
						''
				) +
				this.#currentOsmElement.tags [ 'addr:street' ] + ' '
				:
				'';
		let city =
			this.#currentOsmElement.tags [ 'addr:city' ]
				?
				(
					this.#currentOsmElement.tags [ 'addr:postcode' ]
						?
						( this.#currentOsmElement.tags [ 'addr:postcode' ] + ' ' )
						:
						''
				) +
				this.#currentOsmElement.tags [ 'addr:city' ]
				:
				'';
		let address = street + city;
		if ( '' !== address ) {
			this.#addOsmTag ( address, searchResultCell );
		}
	}

	/**
	Phone builder
	@private
	*/

	#addPhone ( searchResultCell ) {
		if ( this.#currentOsmElement.tags.phone ) {
			this.#addOsmTag ( '☎️ : ' + this.#currentOsmElement.tags.phone, searchResultCell );
		}
	}

	/**
	Mail builder
	@private
	*/

	#addMail ( searchResultCell ) {
		if ( this.#currentOsmElement.tags.email ) {
			theHTMLElementsFactory.create (
				'a',
				{
					href : 'mailto:' + this.#currentOsmElement.tags.email,
					textContent : this.#currentOsmElement.tags.email
				},
				theHTMLElementsFactory.create ( 'div', { textContent : '📧 : ' }, searchResultCell )
			);
		}
	}

	/**
	Web site builder
	@private
	*/

	#addWebSite ( searchResultCell ) {
		if ( this.#currentOsmElement.tags.website ) {
			theHTMLElementsFactory.create (
				'a',
				{
					href : this.#currentOsmElement.tags.website,
					target : '_blank',
					textContent : this.#currentOsmElement.tags.website
				},
				theHTMLElementsFactory.create ( 'div', null, searchResultCell )
			);
		}
	}

	/**
	Add all osm data
	@private
	*/

	#addOsmData ( ) {
		let searchResultCell = theHTMLElementsFactory.create (
			'div',
			{ className :	'TravelNotes-OsmSearchPaneUI-SearchResult-Cell'	},
			this.#currentHtmlElement
		);

		this.#addOsmTag ( this.#currentOsmElement.description, searchResultCell );
		this.#addOsmTag ( this.#currentOsmElement.tags.name, searchResultCell );
		this.#addOsmTag ( this.#currentOsmElement.tags.rcn_ref, searchResultCell );
		this.#addAddress ( searchResultCell );
		this.#addPhone ( searchResultCell );
		this.#addMail ( searchResultCell );
		this.#addWebSite ( searchResultCell );

	}

	/**
	Title builder
	@private
	*/

	#addTitle ( ) {
		for ( const [ KEY, VALUE ] of Object.entries ( this.#currentOsmElement.tags ) ) {
			this.#currentHtmlElement.title += KEY + '=' + VALUE + '\n';
		}

	}

	/**
	Add event listeners
	@private
	*/

	#addEventListeners ( ) {
		this.#currentHtmlElement.addEventListener ( 'contextmenu', this.#eventListeners.onContextMenu, false );
		this.#currentHtmlElement.addEventListener ( 'mouseenter', this.#eventListeners.onMouseEnter, false );
		this.#currentHtmlElement.addEventListener ( 'mouseleave', this.#eventListeners.onMouseLeave, false );
	}

	/**
	Element builder
	@private
	*/

	#buildHtmlElement ( parentNode ) {
		this.#currentHtmlElement = theHTMLElementsFactory.create (
			'div',
			{
				className :	'TravelNotes-OsmSearchPaneUI-SearchResult-Row',
				dataset : { ObjId : ObjId.nextObjId, ElementIndex : this.#elementIndex ++ }
			},
			parentNode
		);
		this.#buildIcon ( );
		this.#addOsmData ( );
		this.#addTitle ( );
		this.#addEventListeners ( );
	}

	/*
	constructor
	*/

	constructor ( paneData ) {
		this.#paneData = paneData;
		this.#eventListeners.onContextMenu = new SearchResultContextMenuEL ( );
		this.#eventListeners.onMouseEnter = new SearchResultMouseEnterEL ( );
		this.#eventListeners.onMouseLeave = new SearchResultMouseLeaveEL ( );
	}

	/**
	Add data to the pane data
	*/

	addData ( ) {
		this.#currentOsmElement = null;
		this.#currentHtmlElement = null;
		this.#elementIndex = ZERO;
		theTravelNotesData.searchData.forEach (
			osmElement => {
				this.#currentOsmElement = osmElement;
				this.#buildHtmlElement ( this.#paneData );
			}
		);
	}

	/**
	Remove data from the pane data
	*/

	clearData ( ) {
		while ( this.#paneData.firstChild ) {
			this.#paneData.firstChild.removeEventListener ( 'contextmenu', this.#eventListeners.onContextMenu, false );
			this.#paneData.firstChild.removeEventListener ( 'mouseenter', this.#eventListeners.onMouseEnter, false );
			this.#paneData.firstChild.removeEventListener ( 'mouseleave', this.#eventListeners.onMouseLeave, false );
			theEventDispatcher.dispatch (
				'removeobject',
				{ objId : Number.parseInt ( this.#paneData.firstChild.dataset.tanObjId ) }
			);
			this.#paneData.removeChild ( this.#paneData.firstChild );
		}
	}
}

export default OsmSearchDataUI;

/*
--- End of OsmSearchDataUI.js file --------------------------------------------------------------------------------------------
*/