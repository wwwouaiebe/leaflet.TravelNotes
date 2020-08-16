/*
Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/

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
		- Issue #31 : Add a command to import from others maps
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
		- Issue #63 : Find a better solution for provider keys upload
		- Issue #75 : Merge Maps and TravelNotes
	- v1.12.0:
		- Issue #120 : Review the UserInterface
Doc reviewed 20200816
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file UI.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
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

import { theHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { theTravelUI } from '../UI/TravelUI.js';
import { theDataPanesUI } from '../UI/DataPanesUI.js';
import { theProvidersToolbarUI } from '../UI/ProvidersToolbarUI.js';
import { theTravelNotesToolbarUI } from '../UI/TravelNotesToolbarUI.js';

let ourMainDiv = null;

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
	ourMainDiv.addEventListener ( 'setitinerary', ( ) => theDataPanesUI.setItinerary ( ), false );
	ourMainDiv.addEventListener ( 'updateitinerary', ( ) => theDataPanesUI.updateItinerary ( ), false );
	ourMainDiv.addEventListener ( 'settravelnotes', ( ) => theDataPanesUI.setTravelNotes ( ), false );
	ourMainDiv.addEventListener ( 'updatetravelnotes', ( ) => theDataPanesUI.updateTravelNotes ( ), false );
	ourMainDiv.addEventListener ( 'setsearch', ( ) => theDataPanesUI.setSearch ( ), false );
	ourMainDiv.addEventListener ( 'updatesearch', ( ) => theDataPanesUI.updateSearch ( ), false );
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

@class
@classdesc This class is the User Interface ( UI )
@see {@link theUI} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class UI {

	/**
	creates the user interface
	@param {HTMLElement} uiDiv The HTML element in witch the UI have to be created
	*/

	createUI ( uiDiv ) {
		if ( ourMainDiv ) {
			return;
		}
		ourMainDiv = theHTMLElementsFactory.create ( 'div', { id : 'TravelNotes-UI-MainDiv' }, uiDiv );
		theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-UI-MainDiv-Title',
				innerHTML : 'Travel&nbsp;&amp;&nbsp;Notes'
			},
			ourMainDiv
		);
		theTravelNotesToolbarUI.createUI ( ourMainDiv );
		theTravelUI.createUI ( ourMainDiv );
		theDataPanesUI.createUI ( ourMainDiv );
		theProvidersToolbarUI.createUI ( ourMainDiv );
		ourAddTravelNotesEventListeners ( );
		ourAddMouseEventListeners ( );
	}
}

const ourUI = Object.freeze ( new UI );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of UI class
	@type {UI}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourUI as theUI
};

/*
--- End of UI.js file ---------------------------------------------------------------------------------------------------------
*/