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
Doc reviewed 20210726
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

@module OsmSearchDataUI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theTravelNotesData from '../data/TravelNotesData.js';
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import theHTMLSanitizer from '../util/HTMLSanitizer.js';
import theNoteDialogToolbarData from '../dialogs/NoteDialogToolbarData.js';
import OsmSearchContextMenu from '../contextMenus/OsmSearchContextMenu.js';
import theEventDispatcher from '../util/EventDispatcher.js';
import ObjId from '../data/ObjId.js';

import { LAT_LNG } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class SearchResultEventListeners
@classdesc This class contains the event listeners for the search results
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

class SearchResultEventListeners {

	/**
	context menu event listener
	*/

	static onContextMenu ( contextMenuEvent ) {
		contextMenuEvent.stopPropagation ( );
		contextMenuEvent.preventDefault ( );
		let searchResultDiv = contextMenuEvent.target;
		while ( ! searchResultDiv.osmElement ) {
			searchResultDiv = searchResultDiv.parentNode;
		}
		contextMenuEvent.latlng = { lat : LAT_LNG.defaultValue, lng : LAT_LNG.defaultValue };
		contextMenuEvent.originalEvent =
			{
				clientX : contextMenuEvent.clientX,
				clientY : contextMenuEvent.clientY,
				latLng : [ searchResultDiv.osmElement.lat, searchResultDiv.osmElement.lon ],
				osmElement : searchResultDiv.osmElement,
				geometry : searchResultDiv.osmElement.geometry
			};
		new OsmSearchContextMenu ( contextMenuEvent, this.paneDataDiv ).show ( );
	}

	/**
	mouse enter event listener
	*/

	static onMouseEnter ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		theEventDispatcher.dispatch (
			'addsearchpointmarker',
			{
				objId : mouseEvent.target.objId,
				latLng : [ mouseEvent.target.osmElement.lat, mouseEvent.target.osmElement.lon ],
				geometry : mouseEvent.target.osmElement.geometry
			}
		);
	}

	/**
	mouse leave event listener
	*/

	static onMouseLeave ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		theEventDispatcher.dispatch ( 'removeobject', { objId : mouseEvent.target.objId } );
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

	/**
	Icon builder
	@private
	*/

	#buildIcon ( htmlElement ) {
		let iconContent = '';
		if ( htmlElement.osmElement.tags.rcn_ref ) {
			iconContent =
				'<div class=\'TravelNotes-MapNote TravelNotes-MapNoteCategory-0073\'>' +
				'<svg viewBox=\'0 0 20 20\'><text class=\'\' x=10 y=14>' +
				htmlElement.osmElement.tags.rcn_ref +
				'</text></svg></div>';
		}
		else {
			iconContent = theNoteDialogToolbarData.getIconContentFromName ( htmlElement.osmElement.description ) || '';
		}
		let iconCell = theHTMLElementsFactory.create (
			'div',
			{
				className :	'TravelNotes-OsmSearchPaneUI-SearchResult-IconCell'
			},
			htmlElement
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

	#addAddress ( htmlElement, searchResultCell ) {
		let street =
			htmlElement.osmElement.tags [ 'addr:street' ]
				?
				(
					htmlElement.osmElement.tags [ 'addr:housenumber' ]
						?
						htmlElement.osmElement.tags [ 'addr:housenumber' ] + ' '
						:
						''
				) +
				htmlElement.osmElement.tags [ 'addr:street' ] + ' '
				:
				'';
		let city =
			htmlElement.osmElement.tags [ 'addr:city' ]
				?
				(
					htmlElement.osmElement.tags [ 'addr:postcode' ]
						?
						( htmlElement.osmElement.tags [ 'addr:postcode' ] + ' ' )
						:
						''
				) +
				htmlElement.osmElement.tags [ 'addr:city' ]
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

	#addPhone ( htmlElement, searchResultCell ) {
		if ( htmlElement.osmElement.tags.phone ) {
			this.#addOsmTag ( '☎️ : ' + htmlElement.osmElement.tags.phone, searchResultCell );
		}
	}

	/**
	Mail builder
	@private
	*/

	#addMail ( htmlElement, searchResultCell ) {
		if ( htmlElement.osmElement.tags.email ) {
			theHTMLElementsFactory.create (
				'a',
				{
					href : 'mailto:' + htmlElement.osmElement.tags.email,
					textContent : htmlElement.osmElement.tags.email
				},
				theHTMLElementsFactory.create ( 'div', { textContent : '📧 : ' }, searchResultCell )
			);
		}
	}

	/**
	Web site builder
	@private
	*/

	#addWebSite ( htmlElement, searchResultCell ) {
		if ( htmlElement.osmElement.tags.website ) {
			theHTMLElementsFactory.create (
				'a',
				{
					href : htmlElement.osmElement.tags.website,
					target : '_blank',
					textContent : htmlElement.osmElement.tags.website
				},
				theHTMLElementsFactory.create ( 'div', null, searchResultCell )
			);
		}
	}

	/**
	@private
	*/

	#addOsmData ( htmlElement ) {
		let searchResultCell = theHTMLElementsFactory.create (
			'div',
			{ className :	'TravelNotes-OsmSearchPaneUI-SearchResult-Cell'	},
			htmlElement
		);

		this.#addOsmTag ( htmlElement.osmElement.description, searchResultCell );
		this.#addOsmTag ( htmlElement.osmElement.tags.name, searchResultCell );
		this.#addOsmTag ( htmlElement.osmElement.tags.rcn_ref, searchResultCell );
		this.#addAddress ( htmlElement, searchResultCell );
		this.#addPhone ( htmlElement, searchResultCell );
		this.#addMail ( htmlElement, searchResultCell );
		this.#addWebSite ( htmlElement, searchResultCell );

	}

	/**
	Title builder
	@private
	*/

	#addTitle ( htmlElement ) {
		for ( const [ KEY, VALUE ] of Object.entries ( htmlElement.osmElement.tags ) ) {
			htmlElement.title += KEY + '=' + VALUE + '\n';
		}

	}

	/**
	event listeners
	@private
	*/

	#addEventListeners ( htmlElement ) {
		htmlElement.addEventListener ( 'contextmenu', SearchResultEventListeners.onContextMenu, false );
		htmlElement.addEventListener ( 'mouseenter', SearchResultEventListeners.onMouseEnter, false );
		htmlElement.addEventListener ( 'mouseleave', SearchResultEventListeners.onMouseLeave, false );
	}

	/**
	Element builder
	@private
	*/

	#buildHtmlElement ( osmElement ) {
		let htmlElement = theHTMLElementsFactory.create (
			'div',
			{
				className :	'TravelNotes-OsmSearchPaneUI-SearchResult-Row',
				osmElement : osmElement,
				objId : ObjId.nextObjId
			}
		);
		this.#buildIcon ( htmlElement );
		this.#addOsmData ( htmlElement );
		this.#addTitle ( htmlElement );
		this.#addEventListeners ( htmlElement );
		return htmlElement;
	}

	constructor ( paneData ) {
		this.#paneData = paneData;
	}

	/**
	Add data to the pane data
	*/

	addData ( ) {
		theTravelNotesData.searchData.forEach (
			osmElement => {
				this.#paneData.appendChild ( this.#buildHtmlElement ( osmElement ) );
			}
		);
	}

	/**
	Remove data from the pane data
	*/

	clearData ( ) {

		while ( this.#paneData.firstChild ) {
			this.#paneData.firstChild.removeEventListener ( 'contextmenu', SearchResultEventListeners.onContextMenu, false );
			this.#paneData.firstChild.removeEventListener ( 'mouseenter', SearchResultEventListeners.onMouseEnter, false );
			this.#paneData.firstChild.removeEventListener ( 'mouseleave', SearchResultEventListeners.onMouseLeave, false );
			this.#paneData.removeChild ( this.#paneData.firstChild );
		}
	}
}

export default OsmSearchDataUI;

/*
--- End of OsmSearchDataUI.js file --------------------------------------------------------------------------------------------
*/