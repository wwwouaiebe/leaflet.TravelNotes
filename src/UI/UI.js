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
	- v1.0.0:
		- created
	- v1.1.0:
		- Issue ♯31 : Add a command to import from others maps
	- v1.6.0:
		- Issue ♯65 : Time to go to ES6 modules?
		- Issue ♯63 : Find a better solution for provider keys upload
		- Issue ♯75 : Merge Maps and TravelNotes
	- v1.12.0:
		- Issue ♯120 : Review the UserInterface
	- v1.13.0:
		- Issue ♯125 : Outphase osmSearch and add it to TravelNotes
	- v2.0.0:
		- Issue ♯135 : Remove innerHTML from code
Doc reviewed 20200816
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file UI.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module UI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theConfig from '../data/Config.js';
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import { theTravelUI } from '../UI/TravelUI.js';
import { thePanesManagerUI } from '../UI/PanesManagerUI.js';
import { theProvidersToolbarUI } from '../UI/ProvidersToolbarUI.js';
import { theTravelNotesToolbarUI } from '../UI/TravelNotesToolbarUI.js';
import { newItineraryPaneUI } from '../UI/ItineraryPaneUI.js';
import { newTravelNotesPaneUI } from '../UI/TravelNotesPaneUI.js';
import { newOsmSearchPaneUI } from '../UI/OsmSearchPaneUI.js';
import { PANE_ID } from '../util/Constants.js';

let ourMainDiv = null;
let ourUiIsPinned = false;
let ourTimerId = null;
let ourTitleDiv = null;

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourAddTravelNotesEventListeners
@desc This method add the TravelNotes events listeners
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourAddTravelNotesEventListeners ( ) {
	ourMainDiv.addEventListener ( 'travelnameupdated', ( ) => theTravelUI.setTravelName ( ), false );
	ourMainDiv.addEventListener ( 'setrouteslist', ( ) => theTravelUI.setRoutesList ( ), false );
	ourMainDiv.addEventListener ( 'showitinerary', ( ) => thePanesManagerUI.showPane ( PANE_ID.itineraryPane ), false );
	ourMainDiv.addEventListener (
		'updateitinerary',
		( ) => thePanesManagerUI.updatePane ( PANE_ID.itineraryPane ),
		false
	);
	ourMainDiv.addEventListener (
		'showtravelnotes',
		( ) => thePanesManagerUI.showPane ( PANE_ID.travelNotesPane ),
		false
	);
	ourMainDiv.addEventListener (
		'updatetravelnotes',
		( ) => thePanesManagerUI.updatePane ( PANE_ID.travelNotesPane ),
		false
	);
	ourMainDiv.addEventListener ( 'showsearch', ( ) => thePanesManagerUI.showPane ( PANE_ID.searchPane ), false );
	ourMainDiv.addEventListener ( 'updatesearch', ( ) => thePanesManagerUI.updatePane ( PANE_ID.searchPane ), false );
	ourMainDiv.addEventListener ( 'providersadded', ( ) => theProvidersToolbarUI.providersAdded ( ), false );
	ourMainDiv.addEventListener (
		'setprovider',
		setProviderEvent => {
			if ( setProviderEvent.data && setProviderEvent.data.provider ) {
				theProvidersToolbarUI.provider = setProviderEvent.data.provider;
			}
		},
		false
	);
	ourMainDiv.addEventListener (
		'settransitmode',
		setTransitModeEvent => {
			if ( setTransitModeEvent.data && setTransitModeEvent.data.provider ) {
				theProvidersToolbarUI.transitMode = setTransitModeEvent.data.transitMode;
			}
		},
		false
	);
	document.addEventListener (
		'geolocationstatuschanged',
		geoLocationStatusChangedEvent => {
			theTravelNotesToolbarUI.geoLocationStatusChanged ( geoLocationStatusChangedEvent.data.status );
		},
		false
	);
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourAddMouseEventListeners
@desc This method add the mouse events listeners
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourAddMouseEventListeners ( ) {
	ourMainDiv.addEventListener (
		'click',
		clickEvent => {
			if ( clickEvent.target.id && 'TravelNotes-UI-MainDiv' === clickEvent.target.id ) {
				clickEvent.stopPropagation ( );
				clickEvent.preventDefault ( );
			}
		},
		false
	);

	ourMainDiv.addEventListener (
		'dblclick',
		dblClickEvent => {
			dblClickEvent.stopPropagation ( );
			dblClickEvent.preventDefault ( );
		},
		false
	);

	ourMainDiv.addEventListener (
		'contextmenu',
		conextMenuEvent => {
			conextMenuEvent.stopPropagation ( );
			conextMenuEvent.preventDefault ( );
		},
		false
	);

	ourMainDiv.addEventListener (
		'wheel',
		wheelEvent => {
			wheelEvent.stopPropagation ( );
			wheelEvent.preventDefault ( );
		},
		false
	);
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnMouseEnterUI
@desc Event listener for the mouse enter on the UI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnMouseEnterUI ( ) {
	if ( ourTimerId ) {
		clearTimeout ( ourTimerId );
		ourTimerId = null;
	}
	ourMainDiv.classList.remove ( 'TravelNotes-UI-Minimized' );

	ourTitleDiv.classList.add ( 'TravelNotes-Hidden' );
	let children = ourMainDiv.childNodes;
	for ( let childrenCounter = 1; childrenCounter < children.length; childrenCounter ++ ) {
		children[ childrenCounter ].classList.remove ( 'TravelNotes-Hidden' );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnTimeOutMouseLeave
@desc Event listener for the timer on mouse leave on the UI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnTimeOutMouseLeave ( ) {
	ourMainDiv.classList.add ( 'TravelNotes-UI-Minimized' );

	ourTitleDiv.classList.remove ( 'TravelNotes-Hidden' );
	let children = ourMainDiv.childNodes;
	for ( let childrenCounter = 1; childrenCounter < children.length; childrenCounter ++ ) {
		children[ childrenCounter ].classList.add ( 'TravelNotes-Hidden' );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnMouseLeaveUI
@desc Event listener for the mouse leave on the UI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnMouseLeaveUI ( ) {
	ourTimerId = setTimeout ( ourOnTimeOutMouseLeave, theConfig.travelEditor.timeout );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourPinUI
@desc this function switch the pin status of the UI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourPinUI ( ) {
	if ( ourUiIsPinned ) {
		ourMainDiv.addEventListener ( 'mouseenter', ourOnMouseEnterUI, false );
		ourMainDiv.addEventListener ( 'mouseleave', ourOnMouseLeaveUI, false );
	}
	else {
		ourMainDiv.removeEventListener ( 'mouseenter', ourOnMouseEnterUI, false );
		ourMainDiv.removeEventListener ( 'mouseleave', ourOnMouseLeaveUI, false );
	}
	ourUiIsPinned = ! ourUiIsPinned;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class is the User Interface ( UI )
@see {@link theUI} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class UI {

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	creates the user interface
	@param {HTMLElement} uiDiv The HTML element in witch the UI have to be created
	*/

	createUI ( uiDiv ) {
		if ( ourMainDiv ) {
			return;
		}
		ourMainDiv = theHTMLElementsFactory.create ( 'div', { id : 'TravelNotes-UI-MainDiv' }, uiDiv );
		ourMainDiv.pin = ourPinUI;

		ourTitleDiv = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-UI-MainDiv-Title',
				textContent : 'Travel\u00A0\u0026\u00A0Notes'
			},
			ourMainDiv
		);

		theTravelNotesToolbarUI.createUI ( ourMainDiv );
		theTravelUI.createUI ( ourMainDiv );
		thePanesManagerUI.addPane ( newItineraryPaneUI ( ) );
		thePanesManagerUI.addPane ( newTravelNotesPaneUI ( ) );
		thePanesManagerUI.addPane ( newOsmSearchPaneUI ( ) );
		thePanesManagerUI.createUI ( ourMainDiv );
		theProvidersToolbarUI.createUI ( ourMainDiv );

		if ( theConfig.travelEditor.startMinimized ) {
			ourMainDiv.addEventListener ( 'mouseenter', ourOnMouseEnterUI, false );
			ourMainDiv.addEventListener ( 'mouseleave', ourOnMouseLeaveUI, false );
			ourMainDiv.classList.add ( 'TravelNotes-UI-Minimized' );
			let children = ourMainDiv.childNodes;
			for ( let childrenCounter = 1; childrenCounter < children.length; childrenCounter ++ ) {
				children[ childrenCounter ].classList.add ( 'TravelNotes-Hidden' );
			}
		}
		else {
			ourTitleDiv.classList.add ( 'TravelNotes-Hidden' );
			ourUiIsPinned = true;
		}

		ourAddTravelNotesEventListeners ( );
		ourAddMouseEventListeners ( );
	}
}

const OUR_UI = new UI ( );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of UI class
	@type {UI}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	OUR_UI as theUI
};

/*
--- End of UI.js file ---------------------------------------------------------------------------------------------------------
*/