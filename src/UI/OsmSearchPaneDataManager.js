import theTravelNotesData from '../data/TravelNotesData.js';
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import theHTMLSanitizer from '../util/HTMLSanitizer.js';
import { theNoteDialogToolbar } from '../dialogs/NoteDialogToolbar.js';
import { newOsmSearchContextMenu } from '../contextMenus/OsmSearchContextMenu.js';
import theEventDispatcher from '../util/EventDispatcher.js';
import { LAT_LNG } from '../util/Constants.js';

import ObjId from '../data/ObjId.js';

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
		contextMenuEvent.fromUI = true;
		contextMenuEvent.originalEvent =
			{
				clientX : contextMenuEvent.clientX,
				clientY : contextMenuEvent.clientY,
				latLng : [ searchResultDiv.osmElement.lat, searchResultDiv.osmElement.lon ],
				osmElement : searchResultDiv.osmElement,
				geometry : searchResultDiv.osmElement.geometry
			};
		newOsmSearchContextMenu ( contextMenuEvent, this.paneDataDiv ).show ( );
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

class OsmSearchPaneDataManager {

	#searchResultCell = null;

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
			iconContent = theNoteDialogToolbar.getIconDataFromName ( htmlElement.osmElement.description ) || '';
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

	#addOsmTag ( osmTagValue ) {
		if ( osmTagValue ) {
			theHTMLElementsFactory.create ( 'div', { textContent : osmTagValue }, this.#searchResultCell	);
		}
	}

	#addAddress ( htmlElement ) {
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
			this.#addOsmTag ( address );
		}
	}

	#addPhone ( htmlElement ) {
		if ( htmlElement.osmElement.tags.phone ) {
			this.#addOsmTag ( '☎️ : ' + htmlElement.osmElement.tags.phone );
		}
	}

	#addMail ( htmlElement ) {
		if ( htmlElement.osmElement.tags.email ) {
			theHTMLElementsFactory.create (
				'a',
				{
					href : 'mailto:' + htmlElement.osmElement.tags.email,
					textContent : htmlElement.osmElement.tags.email
				},
				theHTMLElementsFactory.create ( 'div', { textContent : '📧 : ' }, this.#searchResultCell )
			);
		}
	}

	#addWebSite ( htmlElement ) {
		if ( htmlElement.osmElement.tags.website ) {
			theHTMLElementsFactory.create (
				'a',
				{
					href : htmlElement.osmElement.tags.website,
					target : '_blank',
					textContent : htmlElement.osmElement.tags.website
				},
				theHTMLElementsFactory.create ( 'div', null, this.#searchResultCell )
			);
		}
	}

	#addOsmData ( htmlElement ) {
		this.#searchResultCell = theHTMLElementsFactory.create (
			'div',
			{ className :	'TravelNotes-OsmSearchPaneUI-SearchResult-Cell'	},
			htmlElement
		);

		this.#addOsmTag ( htmlElement.osmElement.description );
		this.#addOsmTag ( htmlElement.osmElement.tags.name );
		this.#addOsmTag ( htmlElement.osmElement.tags.rcn_ref );
		this.#addAddress ( htmlElement );
		this.#addPhone ( htmlElement );
		this.#addMail ( htmlElement );
		this.#addWebSite ( htmlElement );

	}

	#addTitle ( htmlElement ) {
		for ( const [ KEY, VALUE ] of Object.entries ( htmlElement.osmElement.tags ) ) {
			htmlElement.title += KEY + '=' + VALUE + '\n';
		}

	}

	#addEventListeners ( htmlElement ) {
		htmlElement.addEventListener ( 'contextmenu', SearchResultEventListeners.onContextMenu, false );
		htmlElement.addEventListener ( 'mouseenter', SearchResultEventListeners.onMouseEnter, false );
		htmlElement.addEventListener ( 'mouseleave', SearchResultEventListeners.onMouseLeave, false );
	}

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

	constructor ( ) {
	}

	addData ( dataDiv ) {
		theTravelNotesData.searchData.forEach (
			osmElement => {
				dataDiv.appendChild ( this.#buildHtmlElement ( osmElement ) );
			}
		);
	}

	clearData ( dataDiv ) {

		while ( dataDiv.firstChild ) {
			dataDiv.firstChild.removeEventListener ( 'contextmenu', SearchResultEventListeners.onContextMenu, false );
			dataDiv.firstChild.removeEventListener ( 'mouseenter', SearchResultEventListeners.onMouseEnter, false );
			dataDiv.firstChild.removeEventListener ( 'mouseleave', SearchResultEventListeners.onMouseLeave, false );
			dataDiv.removeChild ( dataDiv.firstChild );
		}
	}
}

export default OsmSearchPaneDataManager;