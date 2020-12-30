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
	- v1.6.0:
		- created
	- v1.12.0:
		- Issue #120 : Review the UserInterface
	- v2.0.0:
		- Issue #135 : Remove innerHTML from code
Doc reviewed 20200816
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file TravelNotesToolbarUI.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module TravelNotesToolbarUI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { theConfig } from '../data/Config.js';
import { theAPIKeysManager } from '../core/APIKeysManager.js';
import { theGeoLocator } from '../core/GeoLocator.js';
import { theHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { GEOLOCATION_STATUS } from '../util/Constants.js';

let ourGeoLocationButton = null;
let ourTimerId = null;
let ourButtonsDiv = null;
let ourMainDiv = null;
let ourUiIsPinned = false;

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
	ourMainDiv.classList.remove ( 'TravelNotes-UI-MainDiv-Minimize' );
	ourMainDiv.classList.add ( 'TravelNotes-UI-MainDiv-Maximize' );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnTimeOutMouseLeave
@desc Event listener for the timer on mouse leave on the UI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnTimeOutMouseLeave ( ) {
	ourMainDiv.classList.remove ( 'TravelNotes-UI-MainDiv-Maximize' );
	ourMainDiv.classList.add ( 'TravelNotes-UI-MainDiv-Minimize' );
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

@function ourCreateHomeButton
@desc This method creates the home button
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourCreateHomeButton ( ) {
	theHTMLElementsFactory.create (
		'text',
		{
			value : '🏠'
		},
		theHTMLElementsFactory.create (
			'a',
			{
				className : 'TravelNotes-UI-LinkButton',
				href : window.location.origin,
				target : '_blank'
			},
			theHTMLElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-UI-Button',
					title : 'Home'
				},
				ourButtonsDiv
			)
		)
	);
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourCreateHelpButton
@desc This method creates the help button
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourCreateHelpButton ( ) {
	theHTMLElementsFactory.create (
		'text',
		{
			value : '?'
		},
		theHTMLElementsFactory.create (
			'a',
			{
				className : 'TravelNotes-UI-LinkButton',
				href : 'https://github.com/wwwouaiebe/leaflet.TravelNotes/tree/gh-pages/TravelNotesGuides',
				target : '_blank'
			},
			theHTMLElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-UI-Button',
					title : 'Help'
				},
				ourButtonsDiv
			)
		)
	);
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourCreateContactButton
@desc This method creates the contact button
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourCreateContactButton ( ) {
	theHTMLElementsFactory.create (
		'text',
		{
			value : '@'
		},
		theHTMLElementsFactory.create (
			'a',
			{
				className : 'TravelNotes-UI-LinkButton',
				href : ( theConfig.travelNotesToolbarUI.contactMail || window.location.origin ),
				target : '_blank'
			},
			theHTMLElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-UI-Button',
					title : 'Contact'
				},
				ourButtonsDiv
			)
		)
	);
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnApiKeysButtonClick
@desc Event listener for the mouse click on the show APIKeys dialog button
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnApiKeysButtonClick ( clickEvent ) {
	clickEvent.stopPropagation ( );
	theAPIKeysManager.setKeysFromDialog ( );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourCreateApiKeysButton
@desc This method creates the show APIKeys dialog button
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourCreateApiKeysButton ( ) {
	if ( theConfig.APIKeys.showDialogButton ) {
		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-Button',
				title : theTranslator.getText ( 'TravelNotesToolbarUI - API keys' ),
				textContent : '🔑'
			},
			ourButtonsDiv
		)
			.addEventListener ( 'click', ourOnApiKeysButtonClick, false );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnGeoLocationButtonClick
@desc Event listener for the mouse click on geo location button
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnGeoLocationButtonClick ( clickEvent ) {
	clickEvent.stopPropagation ( );
	theGeoLocator.switch ( );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourCreateGeoLocationButton
@desc This method creates the geo location button
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourCreateGeoLocationButton ( ) {

	// Don't test the https protocol. On some mobile devices with an integreted GPS
	// the geolocation is working also on http protocol
	if ( GEOLOCATION_STATUS.disabled < theGeoLocator.status ) {
		ourGeoLocationButton = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-Button',
				title : theTranslator.getText ( 'TravelNotesToolbarUI - Geo location' ),
				textContent : '🌐'
			},
			ourButtonsDiv
		);
		ourGeoLocationButton.addEventListener ( 'click', ourOnGeoLocationButtonClick, false );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnPinButtonClick
@desc Event listener for the mouse click on pin button
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnPinButtonClick ( clickEvent ) {
	if ( ourUiIsPinned ) {
		clickEvent.target.textContent = '📌';
		ourMainDiv.addEventListener ( 'mouseenter', ourOnMouseEnterUI, false );
		ourMainDiv.addEventListener ( 'mouseleave', ourOnMouseLeaveUI, false );
	}
	else {
		clickEvent.target.textContent = '❌';
		ourMainDiv.removeEventListener ( 'mouseenter', ourOnMouseEnterUI, false );
		ourMainDiv.removeEventListener ( 'mouseleave', ourOnMouseLeaveUI, false );
	}
	ourUiIsPinned = ! ourUiIsPinned;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourCreatePinButton
@desc This method creates the pin UI button
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourCreatePinButton ( ) {
	let pinButton = theHTMLElementsFactory.create (
		'div',
		{
			textContent : '❌',
			className : 'TravelNotes-UI-Button TravelNotes-UI-FlexRow-RightButton'
		},
		ourButtonsDiv
	);
	pinButton.addEventListener ( 'click', ourOnPinButtonClick, false );
	if ( theConfig.travelEditor.startMinimized ) {
		pinButton.textContent = '📌';
		ourMainDiv.addEventListener ( 'mouseenter', ourOnMouseEnterUI, false );
		ourMainDiv.addEventListener ( 'mouseleave', ourOnMouseLeaveUI, false );
		ourMainDiv.classList.add ( 'TravelNotes-UI-MainDiv-Minimize' );
	}
	else {
		ourMainDiv.classList.add ( 'TravelNotes-UI-MainDiv-Maximize' );
		ourUiIsPinned = true;
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class is the Toolbar on top of the UI
@see {@link theTravelNotesToolbarUI} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class TravelNotesToolbarUI {

	/**
	creates the user interface
	@param {HTMLElement} uiMainDiv The HTML element in witch the different elements of the UI have to be created
	*/

	createUI ( uiMainDiv ) {
		ourMainDiv = uiMainDiv;
		ourButtonsDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-FlexRowDiv'
			},
			uiMainDiv
		);

		ourCreateHomeButton ( );
		ourCreateHelpButton ( );
		ourCreateContactButton ( );
		ourCreateApiKeysButton ( );
		ourCreateGeoLocationButton ( );
		ourCreatePinButton ( );
	}

	/**
	Adapt the geo location button to the geo location status
	@param {GEOLOCATION_STATUS} geoLocationStatus The new status of the geo location
	*/

	geoLocationStatusChanged ( geoLocationStatus ) {
		switch ( geoLocationStatus ) {
		case GEOLOCATION_STATUS.inactive :
			ourGeoLocationButton.classList.remove ( 'TravelNotes-TravelNotesToolbarUI-GeoLocationButton-Striked' );
			break;
		case GEOLOCATION_STATUS.active :
			ourGeoLocationButton.classList.add ( 'TravelNotes-TravelNotesToolbarUI-GeoLocationButton-Striked' );
			break;
		default :
			if ( ourGeoLocationButton ) {
				ourGeoLocationButton.parentNode.removeChild ( ourGeoLocationButton );
				ourGeoLocationButton = null;
			}
			break;
		}
	}
}

const ourTravelNotesToolbarUI = Object.freeze ( new TravelNotesToolbarUI );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of TravelNotesToolbarUI class
	@type {TravelNotesToolbarUI}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourTravelNotesToolbarUI as theTravelNotesToolbarUI
};

/*
--- End of TravelNotesToolbarUI.js file ---------------------------------------------------------------------------------------
*/