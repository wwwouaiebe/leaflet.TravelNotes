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
		- Issue ♯120 : Review the UserInterface
	- v2.0.0:
		- Issue ♯135 : Remove innerHTML from code
		- Issue ♯138 : Protect the app - control html entries done by user.
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
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

@module travelNotesToolbarUI

@------------------------------------------------------------------------------------------------------------------------------
*/

import theTranslator from '../UILib/Translator.js';
import theConfig from '../data/Config.js';
import theAPIKeysManager from '../core/APIKeysManager.js';
import theGeoLocator from '../core/GeoLocator.js';
import theHTMLElementsFactory from '../UILib/HTMLElementsFactory.js';
import theEventDispatcher from '../coreLib/EventDispatcher.js';
import { GEOLOCATION_STATUS } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class ApiKeysButtonClickEL
@classdesc click on ApiKeys button event listeners
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class ApiKeysButtonClickEL {

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		theAPIKeysManager.setKeysFromDialog ( );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class GeoLocatorButtonClickEL
@classdesc GeoLocator button event listeners
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class GeoLocatorButtonClickEL {

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		theGeoLocator.switch ( );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class PinButtonClickEL
@classdesc GeoLocator button event listeners
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class PinButtonClickEL {

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	handleEvent ( clickEvent ) {
		clickEvent.target.textContent = '📌' === clickEvent.target.textContent ? '❌' : '📌';
		theEventDispatcher.dispatch ( 'uipinned' );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class is the Toolbar on top of the UI
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class TravelNotesToolbarUI {

	#geoLocationButton = null;
	#buttonsDiv = null;

	/**
	This method creates the home button
	@private
	*/

	#createHomeButton ( ) {
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
					this.#buttonsDiv
				)
			)
		);
	}

	/**
	This method creates the help button
	@private
	*/

	#createHelpButton ( ) {
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
					this.#buttonsDiv
				)
			)
		);
	}

	/**
	This method creates the contact button
	@private
	*/

	#createContactButton ( ) {
		theHTMLElementsFactory.create (
			'text',
			{
				value : '@'
			},
			theHTMLElementsFactory.create (
				'a',
				{
					className : 'TravelNotes-UI-LinkButton',
					href : ( theConfig.travelNotesToolbarUI.contactMail.url || window.location.origin ),
					target : '_blank'
				},
				theHTMLElementsFactory.create (
					'div',
					{
						className : 'TravelNotes-UI-Button',
						title : 'Contact'
					},
					this.#buttonsDiv
				)
			)
		);
	}

	/**
	This method creates the show APIKeys dialog button
	@private
	*/

	#createApiKeysButton ( ) {
		if ( theConfig.APIKeysDialog.showButton ) {
			theHTMLElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-UI-Button',
					title : theTranslator.getText ( 'TravelNotesToolbarUI - API keys' ),
					textContent : '🔑'
				},
				this.#buttonsDiv
			)
				.addEventListener ( 'click', new ApiKeysButtonClickEL ( ), false );
		}
	}

	/**
	This method creates the geo location button
	@private
	*/

	#createGeoLocationButton ( ) {

		// Don't test the https protocol. On some mobile devices with an integreted GPS
		// the geolocation is working also on http protocol
		if ( GEOLOCATION_STATUS.disabled < theGeoLocator.status ) {
			this.#geoLocationButton = theHTMLElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-UI-Button',
					title : theTranslator.getText ( 'TravelNotesToolbarUI - Geo location' ),
					textContent : '🌐'
				},
				this.#buttonsDiv
			);
			this.#geoLocationButton.addEventListener ( 'click', new GeoLocatorButtonClickEL ( ), false );
		}
	}

	/**
	This method creates the pin UI button
	@private
	*/

	#createPinButton ( ) {
		let pinButton = theHTMLElementsFactory.create (
			'div',
			{
				textContent : theConfig.travelEditor.startMinimized ? '📌' : '❌',
				className : 'TravelNotes-UI-Button TravelNotes-UI-FlexRow-RightButton'
			},
			this.#buttonsDiv
		);
		pinButton.addEventListener ( 'click', new PinButtonClickEL ( ), false );
	}

	/*
	constructor
	*/

	constructor ( uiMainDiv ) {
		Object.freeze ( this );
		this.#buttonsDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-FlexRowDiv'
			},
			uiMainDiv
		);
		this.#createHomeButton ( );
		this.#createHelpButton ( );
		this.#createContactButton ( );
		this.#createApiKeysButton ( );
		this.#createGeoLocationButton ( );
		this.#createPinButton ( );
	}

	/**
	Adapt the geo location button to the geo location status
	@param {GEOLOCATION_STATUS} geoLocationStatus The new status of the geo location
	*/

	geoLocationStatusChanged ( geoLocationStatus ) {
		switch ( geoLocationStatus ) {
		case GEOLOCATION_STATUS.inactive :
			this.#geoLocationButton.classList.remove ( 'TravelNotes-TravelNotesToolbarUI-GeoLocationButton-Striked' );
			break;
		case GEOLOCATION_STATUS.active :
			this.#geoLocationButton.classList.add ( 'TravelNotes-TravelNotesToolbarUI-GeoLocationButton-Striked' );
			break;
		default :
			if ( this.#geoLocationButton ) {
				this.#geoLocationButton.parentNode.removeChild ( this.#geoLocationButton );
				this.#geoLocationButton = null;
			}
			break;
		}
	}
}

export default TravelNotesToolbarUI;

/*
--- End of TravelNotesToolbarUI.js file ---------------------------------------------------------------------------------------
*/