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

@file ItineraryControlUI.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module itineraryPaneUI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theHTMLElementsFactory from '../UILib/HTMLElementsFactory.js';
import theRouteHTMLViewsFactory from '../viewsFactories/RouteHTMLViewsFactory.js';
import theTranslator from '../UILib/Translator.js';
import theConfig from '../data/Config.js';
import theTravelNotesData from '../data/TravelNotesData.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class NotesCheckboxInputEL
@classdesc input event listener for the show notes checkbox

@------------------------------------------------------------------------------------------------------------------------------
*/

class NotesCheckboxInputEL {

	#itineraryDataUI = null;

	/*
	constructor
	*/

	constructor ( itineraryDataUI ) {
		Object.freeze ( this );
		this.#itineraryDataUI = itineraryDataUI;
	}

	handleEvent ( inputEvent ) {
		inputEvent.stopPropagation ( );
		this.#itineraryDataUI.toggleNotes ( );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class ManeuverCheckboxInputEL
@classdesc input event listener for the show maneuver checkbox

@------------------------------------------------------------------------------------------------------------------------------
*/

class ManeuverCheckboxInputEL {

	#itineraryDataUI = null;

	/*
	constructor
	*/

	constructor ( itineraryDataUI ) {
		Object.freeze ( this );
		this.#itineraryDataUI = itineraryDataUI;
	}

	handleEvent ( inputEvent ) {
		inputEvent.stopPropagation ( );
		this.#itineraryDataUI.toggleManeuvers ( );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class ItineraryControlUI
@classdesc This class manages the controlPane for the itineraries
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class ItineraryControlUI {

	/**
	HTMLElements of the paneControl
	@private
	*/

	#routeHeaderHTMLElement = null;
	#checkBoxesHTMLElement = null;
	#showNotesCheckBoxHTMLElement = null;
	#showManeuversCheckBoxHTMLElement = null;

	#showNotes = theConfig.itineraryPaneUI.showNotes;
	#showManeuvers = theConfig.itineraryPaneUI.showManeuvers;

	/**
	Event listeners
	@private
	*/

	#eventListeners = {
		onInputNotesCheckbox : null,
		onInputManeuverCheckbox : null
	};

	/**
	A reference to the paneControl
	@private
	*/

	#paneControl = null;

	/**
	A referebce to the DataPane manager
	*/

	#itineraryDataUI = null;

	/*
	constructor
	*/

	constructor ( paneControl, itineraryDataUI ) {
		this.#paneControl = paneControl;
		this.#eventListeners.onInputNotesCheckbox = new NotesCheckboxInputEL ( itineraryDataUI );
		this.#eventListeners.onInputManeuverCheckbox = new ManeuverCheckboxInputEL ( itineraryDataUI );
		this.#itineraryDataUI = itineraryDataUI;
	}

	/**
	Add the HTMLElements to the controlPane
	*/

	addControl ( ) {
		this.#checkBoxesHTMLElement = theHTMLElementsFactory.create ( 'div', null, this.#paneControl );
		theHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'ItineraryPaneUI - Show notes' )
			},
			this.#checkBoxesHTMLElement
		);
		this.#showNotesCheckBoxHTMLElement = theHTMLElementsFactory.create (
			'input',
			{
				type : 'checkbox',
				id : 'TravelNotes-ItineraryPane-ShowNotesInput',
				checked : this.#showNotes
			},
			this.#checkBoxesHTMLElement
		);
		this.#showNotesCheckBoxHTMLElement.addEventListener ( 'click', this.#eventListeners.onInputNotesCheckbox );
		theHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'ItineraryPaneUI - Show maneuvers' )
			},
			this.#checkBoxesHTMLElement
		);
		this.#showManeuversCheckBoxHTMLElement = theHTMLElementsFactory.create (
			'input',
			{
				type : 'checkbox',
				id : 'TravelNotes-ItineraryPane-ShowManeuversInput',
				checked : this.#showManeuvers
			},
			this.#checkBoxesHTMLElement
		);
		this.#showManeuversCheckBoxHTMLElement.addEventListener ( 'click', this.#eventListeners.onInputManeuverCheckbox );
		this.#routeHeaderHTMLElement = theRouteHTMLViewsFactory.getRouteHeaderHTML (
			'TravelNotes-ItineraryPaneUI-',
			theTravelNotesData.travel.editedRoute
		);
		this.#paneControl.appendChild ( this.#routeHeaderHTMLElement );
		if ( ! this.#showManeuvers ) {
			this.#itineraryDataUI.toggleManeuvers ( );
		}
		if ( ! this.#showNotes ) {
			this.#itineraryDataUI.toggleNotes ( );
		}
	}

	/**
	remove the HTMLElements from the controlPane
	*/

	clearControl ( ) {
		if ( this.#checkBoxesHTMLElement ) {
			if ( this.#showManeuversCheckBoxHTMLElement ) {
				this.#showManeuvers = this.#showManeuversCheckBoxHTMLElement.checked;
				this.#showManeuversCheckBoxHTMLElement.removeEventListener (
					'click',
					this.#eventListeners.onInputManeuverCheckbox
				);
				this.#checkBoxesHTMLElement.removeChild ( this.#showManeuversCheckBoxHTMLElement );
				this.#showManeuversCheckBoxHTMLElement = null;
			}
			if ( this.#showNotesCheckBoxHTMLElement ) {
				this.#showNotes = this.#showNotesCheckBoxHTMLElement.checked;
				this.#showNotesCheckBoxHTMLElement.addEventListener ( 'click', this.#eventListeners.onInputNotesCheckbox );
				this.#checkBoxesHTMLElement.removeChild ( this.#showNotesCheckBoxHTMLElement );
				this.#showNotesCheckBoxHTMLElement = null;
			}
			this.#paneControl.removeChild ( this.#checkBoxesHTMLElement );
			this.#checkBoxesHTMLElement = null;
		}
		if ( this.#routeHeaderHTMLElement ) {
			this.#paneControl.removeChild ( this.#routeHeaderHTMLElement );
			this.#routeHeaderHTMLElement = null;
		}
	}
}

export default ItineraryControlUI;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of ItineraryControlUI.js file

@------------------------------------------------------------------------------------------------------------------------------
*/