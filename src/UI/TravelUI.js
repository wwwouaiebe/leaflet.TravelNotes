/*
Copyright - 2017 2021 - wwwouaiebe - Contact: http//www.ouaie.be/

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
		- Issue ♯26 : added confirmation message before leaving the page when data modified.
		- Issue ♯31 : Add a command to import from others maps
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
		- moving file fcts from TravelEditor to the new FileLoader
		- modified event listener for cancel travel button ( Issue ♯45 )
	- v1.5.0:
		- Issue ♯52 : when saving the travel to the file, save also the edited route.
		- Issue ♯60 : Add translations for roadbook
	- v1.6.0:
		- Issue ♯65 : Time to go to ES6 modules?
		- Issue ♯63 : Find a better solution for provider keys upload
		- Issue ♯75 : Merge Maps and TravelNotes
	- v1.7.0:
		- Issue ♯90 : Open profiles are not closed when opening a travel or when starting a new travel
	- v1.12.0:
		- Issue ♯120 : Review the UserInterface
	- v2.0.0:
		- Issue ♯135 : Remove innerHTML from code
		- Issue ♯138 : Protect the app - control html entries done by user.
		- Issue ♯146 : Add the travel name in the document title...
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file TravelUI.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module travelUI

@------------------------------------------------------------------------------------------------------------------------------
*/

import theTranslator from '../UILib/Translator.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import theHTMLElementsFactory from '../UILib/HTMLElementsFactory.js';
import theRouteEditor from '../core/RouteEditor.js';
import theEventDispatcher from '../coreLib/EventDispatcher.js';
import theHTMLSanitizer from '../coreLib/HTMLSanitizer.js';
import TravelToolbarUI from '../UI/TravelToolbarUI.js';
import RoutesListUI from '../UI/RoutesListUI.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class TravelNameChangeEL
@classdesc change event listener for the TravelName input

@------------------------------------------------------------------------------------------------------------------------------
*/

class TravelNameChangeEL {

	handleEvent ( changeEvent ) {
		changeEvent.stopPropagation ( );
		theTravelNotesData.travel.name = theHTMLSanitizer.sanitizeToJsString ( changeEvent.target.value );
		document.title =
			'Travel & Notes' +
			( '' === theTravelNotesData.travel.name ? '' : ' - ' + theTravelNotesData.travel.name );
		theEventDispatcher.dispatch ( 'roadbookupdate' );
	}

}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class ExpandButtonClickEL
@classdesc click event listener for the ExpandRoutes button

@------------------------------------------------------------------------------------------------------------------------------
*/

class ExpandButtonClickEL {

	#routesListUI = null;
	constructor ( routesListUI ) {
		this.#routesListUI = routesListUI;
	}

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		let hiddenList = this.#routesListUI.toogleExpand ( );
		clickEvent.target.textContent =
			hiddenList ? '▶' : '▼'; // 25b6 = '▶'  25bc = ▼
		clickEvent.target.title =
			hiddenList
				?
				theTranslator.getText ( 'TravelUI - Show' )
				:
				theTranslator.getText ( 'TravelUI - Hide' );
	}

}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class AddRouteButtonClickEL
@classdesc click event listener for the addRoute button

@------------------------------------------------------------------------------------------------------------------------------
*/

class AddRouteButtonClickEL {

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		theRouteEditor.addRoute ( );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class TravelUI
@classdesc This class is the Travel part of the UI
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class TravelUI {

	#routesHeaderDiv = null;
	#travelNameInput = null;
	#routesListUI = null;
	#expandRoutesButton = null;

	/**
	This method creates the travel name div
	@private
	*/

	#createTravelNameDiv ( uiMainDiv ) {
		let travelNameDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-FlexRowDiv'
			},
			uiMainDiv
		);
		theHTMLElementsFactory.create (
			'span',
			{
				textContent : theTranslator.getText ( 'TravelUI - Travel' )
			},
			travelNameDiv
		);
		this.#travelNameInput = theHTMLElementsFactory.create (
			'input',
			{
				id : 'TravelNotes-TravelUI-InputTravelName',
				type : 'text',
				value : theTravelNotesData.travel.name
			},
			travelNameDiv
		);
		this.#travelNameInput.addEventListener ( 'change', new TravelNameChangeEL ( ), false );
	}

	/**
	This method creates the add route button
	@private
	*/

	#createAddRouteButton ( ) {
		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-Button TravelNotes-UI-FlexRow-RightButton',
				title : theTranslator.getText ( 'TravelUI - Add a route' ),
				textContent : '+'
			},
			this.#routesHeaderDiv
		)
			.addEventListener ( 'click', new AddRouteButtonClickEL ( ), false );
	}

	/**
	This method creates the routes list header div
	@private
	*/

	#createRoutesListHeaderDiv ( uiMainDiv ) {
		this.#routesHeaderDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-FlexRowDiv'
			},
			uiMainDiv
		);

		this.#expandRoutesButton = theHTMLElementsFactory.create (
			'div',
			{
				textContent : '▼',
				className : 'TravelNotes-TravelUI-RouteList-ExpandButton'
			},
			this.#routesHeaderDiv
		);

		theHTMLElementsFactory.create (
			'span',
			{
				textContent : theTranslator.getText ( 'TravelUI - Travel routes' )
			},
			this.#routesHeaderDiv
		);

		this.#createAddRouteButton ( this.#routesHeaderDiv );
	}

	/*
	constructor
	*/

	constructor ( uiMainDiv ) {
		Object.freeze ( this );
		this.#createTravelNameDiv ( uiMainDiv );
		new TravelToolbarUI ( uiMainDiv );
		this.#createRoutesListHeaderDiv ( uiMainDiv );
		this.#routesListUI = new RoutesListUI ( uiMainDiv );
		this.#expandRoutesButton.addEventListener (
			'click',
			new ExpandButtonClickEL ( this.#routesListUI ),
			false
		);
	}

	/**
	Set the travel name in the travel name input
	*/

	setTravelName ( ) {
		this.#travelNameInput.value = theTravelNotesData.travel.name;
	}

	get routesListUI ( ) { return this.#routesListUI; }
}

export default TravelUI;

/*
--- End of TravelUI.js file ---------------------------------------------------------------------------------------------------
*/