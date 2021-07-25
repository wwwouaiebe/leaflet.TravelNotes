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
		- moving file functions from TravelEditor to the new FileLoader
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
Doc reviewed 20200817
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

@module TravelUI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theTranslator from '../UI/Translator.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import theTravelEditor from '../core/TravelEditor.js';
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import { newRouteContextMenu } from '../contextMenus/RouteContextMenu.js';
import theRouteEditor from '../core/RouteEditor.js';
import theEventDispatcher from '../util/EventDispatcher.js';
import theHTMLSanitizer from '../util/HTMLSanitizer.js';
import theTravelToolbarUI from '../UI/TravelToolbarUI.js';

import { LAT_LNG, ZERO, MOUSE_WHEEL_FACTORS } from '../util/Constants.js';

let ourRoutesList = null;
let ourTravelNameInput = null;
let ourUIMainDiv = null;
let ourDraggedRouteObjId = ZERO;
let this.#routesHeaderDiv = null;

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnRouteListWheel
@desc wheel event listener for the route list element
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnRouteListWheel ( wheelEvent ) {
	if ( wheelEvent.deltaY ) {
		wheelEvent.target.scrollTop +=
			wheelEvent.deltaY * MOUSE_WHEEL_FACTORS [ wheelEvent.deltaMode ];
	}
	wheelEvent.stopPropagation ( );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnTravelNameInputChange
@desc change event listener for the travel name input element
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnTravelNameInputChange ( changeEvent ) {
	theTravelNotesData.travel.name = theHTMLSanitizer.sanitizeToJsString ( changeEvent.target.value );
	document.title =
		'Travel & Notes' +
		( '' === theTravelNotesData.travel.name ? '' : ' - ' + theTravelNotesData.travel.name );
	theEventDispatcher.dispatch ( 'roadbookupdate' );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnExpandRoutesButtonClick
@desc click event listener for the expand routes list button
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnExpandRoutesButtonClick ( clickEvent ) {
	clickEvent.stopPropagation ( );
	ourRoutesList.classList.toggle ( 'TravelNotes-Hidden' );
	let hiddenList = ourRoutesList.classList.contains ( 'TravelNotes-Hidden' );
	clickEvent.target.textContent =
		hiddenList ? '▶' : '▼'; // 25b6 = '▶'  25bc = ▼
	clickEvent.target.title =
		hiddenList
			?
			theTranslator.getText ( 'TravelUI - Show' )
			:
			theTranslator.getText ( 'TravelUI - Hide' );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnExpandRoutesButtonClick
@desc click event listener for the add route button
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnAddRouteButtonClick ( clickEvent ) {
	clickEvent.stopPropagation ( );
	theRouteEditor.addRoute ( );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnRouteDragStart
@desc dragstart event listener for a route dragged in the route list
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnRouteDragStart ( dragEvent ) {
	dragEvent.stopPropagation ( );
	try {
		dragEvent.dataTransfer.setData ( 'Text', dragEvent.target.objId );
		dragEvent.dataTransfer.dropEffect = 'move';
		dragEvent.dataTransfer.routeObjId = dragEvent.target.objId;
	}
	catch ( err ) {
		if ( err instanceof Error ) {
			console.error ( err );
		}
	}
	ourDraggedRouteObjId = dragEvent.target.objId;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnRouteListDragOver
@desc dragover event listener for the route list element
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnRouteListDragOver ( dragEvent ) {
	dragEvent.preventDefault ( );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnRouteDrop
@desc drop event listener for a route dragged in the route list element
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnRouteDrop ( dropEvent ) {
	dropEvent.preventDefault ( );
	let element = dropEvent.target;
	while ( ! element.objId ) {
		element = element.parentElement;
	}
	let clientRect = element.getBoundingClientRect ( );
	theTravelEditor.routeDropped (
		ourDraggedRouteObjId,
		element.objId,
		( dropEvent.clientY - clientRect.top < clientRect.bottom - dropEvent.clientY )
	);
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourCreateRouteListDiv
@desc This method creates the routes list header div
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourCreateRouteListDiv ( ) {
	ourRoutesList = theHTMLElementsFactory.create (
		'div',
		{
			className : 'TravelNotes-TravelUI-RoutesListDiv'
		},
		ourUIMainDiv
	);
	ourRoutesList.addEventListener ( 'drop', ourOnRouteDrop, false );
	ourRoutesList.addEventListener ( 'dragover', ourOnRouteListDragOver, false );
	ourRoutesList.addEventListener ( 'wheel', ourOnRouteListWheel, false );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnRouteContextMenu
@desc context menu event listener for a route
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnRouteContextMenu ( contextMenuEvent ) {
	contextMenuEvent.stopPropagation ( );
	contextMenuEvent.preventDefault ( );
	contextMenuEvent.latlng = { lat : LAT_LNG.defaultValue, lng : LAT_LNG.defaultValue };
	contextMenuEvent.fromUI = true;
	contextMenuEvent.originalEvent =
		{
			clientX : contextMenuEvent.clientX,
			clientY : contextMenuEvent.clientY
		};
	newRouteContextMenu ( contextMenuEvent, ourUIMainDiv ).show ( );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class is the Travel part of the UI
@see {@link theTravelUI} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class TravelUI {

	#routesHeaderDiv = null;

	/**
	This method creates the travel name div
	@private
	*/

	#createTravelNameDiv ( ) {
		let travelNameDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-FlexRowDiv'
			},
			ourUIMainDiv
		);
		theHTMLElementsFactory.create (
			'span',
			{
				textContent : theTranslator.getText ( 'TravelUI - Travel' )
			},
			travelNameDiv
		);
		ourTravelNameInput = theHTMLElementsFactory.create (
			'input',
			{
				id : 'TravelNotes-TravelUI-InputTravelName',
				type : 'text',
				value : theTravelNotesData.travel.name
			},
			travelNameDiv
		);
		ourTravelNameInput.addEventListener ( 'change', ourOnTravelNameInputChange, false );
	}
	

	/**
	This method creates the expand routes list button
	@private
	*/

	#createExpandRoutesButton ( ) {
		theHTMLElementsFactory.create (
			'div',
			{
				textContent : '▼',
				className : 'TravelNotes-TravelUI-RouteList-ExpandButton'
			},
			this.#routesHeaderDiv
		)
			.addEventListener ( 'click', ourOnExpandRoutesButtonClick, false );
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
			.addEventListener ( 'click', ourOnAddRouteButtonClick, false );
	}

	/**
	This method creates the routes list header div
	@private
	*/

	#createRoutesListHeaderDiv ( ) {
		this.#routesHeaderDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-FlexRowDiv'
			},
			ourUIMainDiv
		);
		
		this.#createExpandRoutesButton ( this.#routesHeaderDiv );
		
		theHTMLElementsFactory.create (
			'span',
			{
				textContent : theTranslator.getText ( 'TravelUI - Travel routes' )
			},
			this.#routesHeaderDiv
		);
		
		this.#createAddRouteButton ( this.#routesHeaderDiv );
	}
	

	/**
	creates the user interface
	@param {HTMLElement} uiMainDiv The HTML element in witch the different elements of the UI have to be created
	*/

	createUI ( uiMainDiv ) {
		if ( ourUIMainDiv ) {
			return;
		}
		ourUIMainDiv = uiMainDiv;
		this.#createTravelNameDiv ( );
		theTravelToolbarUI.createUI ( uiMainDiv );
		this.#createRoutesListHeaderDiv ( );
		ourCreateRouteListDiv ( );
	}

	/**
	Removes all routes from the routes list and add the routes that are in the TravelNotesData.travel object
	*/

	setRoutesList ( ) {
		while ( ourRoutesList.firstChild ) {
			ourRoutesList.firstChild.removeEventListener ( 'dragstart', ourOnRouteDragStart, false );
			ourRoutesList.firstChild.removeEventListener ( 'contextmenu', ourOnRouteContextMenu, false );
			ourRoutesList.removeChild ( ourRoutesList.firstChild );
		}

		let routesIterator = theTravelNotesData.travel.routes.iterator;
		while ( ! routesIterator.done ) {
			let route = routesIterator.value.objId === theTravelNotesData.editedRouteObjId
				?
				theTravelNotesData.travel.editedRoute
				:
				routesIterator.value;
			let routeName =
				( routesIterator.value.objId === theTravelNotesData.editedRouteObjId ? '🔴\u00a0' : '' ) +
				( route.chain ? '⛓\u00a0' : '' ) +
				(
					routesIterator.value.objId === theTravelNotesData.editedRouteObjId ?
						theTravelNotesData.travel.editedRoute.computedName :
						route.computedName
				);
			let routeDiv = theHTMLElementsFactory.create (
				'div',
				{
					draggable : true,
					className :
						'TravelNotes-TravelUI-RoutesList-Item TravelNotes-UI-MoveCursor' +
						( routesIterator.value.hidden ? ' TravelNotes-TravelUI-RoutesList-HiddenItem' : '' ),
					objId :
						routesIterator.value.objId === theTravelNotesData.editedRouteObjId
							?
							theTravelNotesData.travel.editedRoute.objId
							:
							routesIterator.value.objId,
					canDrag : true,
					textContent : routeName
				},
				ourRoutesList
			);

			routeDiv.addEventListener ( 'dragstart', ourOnRouteDragStart, false );
			routeDiv.addEventListener ( 'contextmenu', ourOnRouteContextMenu, false );
		}
	}

	/**
	Set the travel name in the travel name input
	*/

	setTravelName ( ) {
		ourTravelNameInput.value = theTravelNotesData.travel.name;
	}
}

const OUR_TRAVEL_UI = new TravelUI ( );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of TravelUI class
	@type {TravelUI}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	OUR_TRAVEL_UI as theTravelUI
};

/*
--- End of TravelUI.js file -------------------------------------------------------------------------------------------
*/