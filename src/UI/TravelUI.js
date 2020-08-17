/*
Copyright - 2017 - wwwouaiebe - Contact: http//www.ouaie.be/

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
		- Issue #26 : added confirmation message before leaving the page when data modified.
		- Issue #31 : Add a command to import from others maps
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
		- moving file functions from TravelEditor to the new FileLoader
		- modified event listener for cancel travel button ( issue #45 )
	- v1.5.0:
		- Issue #52 : when saving the travel to the file, save also the edited route.
		- Issue #60 : Add translations for roadbook
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
		- Issue #63 : Find a better solution for provider keys upload
		- Issue #75 : Merge Maps and TravelNotes
	- v1.7.0:
		- Issue #90 : Open profiles are not closed when opening a travel or when starting a new travel
	- v1.12.0:
		- Issue #120 : Review the UserInterface
Doc reviewed 20200817
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file TravelUI.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
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

import { theTranslator } from '../UI/Translator.js';
import { theConfig } from '../data/Config.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theErrorsUI } from '../UI/ErrorsUI.js';
import { theTravelEditor } from '../core/TravelEditor.js';
import { theHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { newFileLoader } from '../core/FileLoader.js';
import { newRouteContextMenu } from '../contextMenus/RouteContextMenu.js';
import { theRouteEditor } from '../core/RouteEditor.js';
import { LAT_LNG, INVALID_OBJ_ID, ZERO, MOUSE_WHEEL_FACTORS } from '../util/Constants.js';

let ourRoutesList = null;
let ourTravelNameInput = null;
let ourUIMainDiv = null;
let ourDraggedRouteObjId = ZERO;
let ourButtonsDiv = null;
let ourOpenTravelInput = null;
let ourImportTravelInput = null;
let ourRoutesHeaderDiv = null;

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
	theTravelNotesData.travel.name = changeEvent.target.value;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourCreateTravelNameDiv
@desc This method creates the travel name div
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourCreateTravelNameDiv ( ) {
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
			innerHTML : theTranslator.getText ( 'TravelUI - Travel' )
		},
		travelNameDiv
	);
	ourTravelNameInput = theHTMLElementsFactory.create (
		'input',
		{
			id : 'TravelNotes-TravelUI-InputTravelName',
			type : 'text',
			placeholder : 'TravelNotes',
			value : theTravelNotesData.travel.name
		},
		travelNameDiv
	);
	ourTravelNameInput.addEventListener ( 'change', ourOnTravelNameInputChange, false );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnCancelTravelButtonClick
@desc click event listener for the cancel travel button
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnCancelTravelButtonClick ( clickEvent ) {
	clickEvent.stopPropagation ();
	theTravelEditor.clear ( );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourCreateCancelTravelButton
@desc This method creates the cancel travel button
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourCreateCancelTravelButton ( ) {
	theHTMLElementsFactory.create (
		'div',
		{
			className : 'TravelNotes-UI-Button',
			title : theTranslator.getText ( 'TravelUI - Cancel travel' ),
			innerHTML : '&#x274c;' // 274c = ❌
		},
		ourButtonsDiv
	)
		.addEventListener ( 'click', ourOnCancelTravelButtonClick, false );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnSaveTravelButtonClick
@desc click event listener for the save travel button
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnSaveTravelButtonClick ( clickEvent ) {
	clickEvent.stopPropagation ( );
	theTravelEditor.saveTravel ( );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourCreateSaveTravelButton
@desc This method creates the save travel button
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourCreateSaveTravelButton ( ) {
	theHTMLElementsFactory.create (
		'div',
		{
			className : 'TravelNotes-UI-Button',
			title : theTranslator.getText ( 'TravelUI - Save travel' ),
			innerHTML : '&#x1f4be;' // 1f4be = 💾
		},
		ourButtonsDiv
	)
		.addEventListener ( 'click', ourOnSaveTravelButtonClick, false );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnOpenTravelInputChange
@desc change event listener for the open travel input element
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnOpenTravelInputChange ( changeEvent ) {
	changeEvent.stopPropagation ( );
	newFileLoader ( ).openLocalFile ( changeEvent );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnOpenTravelButtonClick
@desc click event listener for the open travel button
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnOpenTravelButtonClick ( ) {
	if (
		! window.confirm (
			theTranslator.getText ( 'TravelEditor - This page ask to close; data are perhaps not saved.' )
		)
	) {
		return;
	}
	ourOpenTravelInput.click ( );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourCreateOpenTravelButton
@desc This method creates the open travel button
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourCreateOpenTravelButton ( ) {

	ourOpenTravelInput = theHTMLElementsFactory.create (
		'input',
		{
			className : 'TravelNotes-TravelUI-OpenFileInput',
			type : 'file',
			accept : '.trv'
		},
		ourButtonsDiv
	);
	ourOpenTravelInput.addEventListener ( 'change', ourOnOpenTravelInputChange, false );

	theHTMLElementsFactory.create (
		'div',
		{
			className : 'TravelNotes-UI-Button',
			title : theTranslator.getText ( 'TravelUI - Open travel' ),
			innerHTML : '&#x1F4C2;' // 1F4C2 = 📂
		},
		ourButtonsDiv
	)
		.addEventListener ( 'click', ourOnOpenTravelButtonClick, false );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnImportTravelInputChange
@desc change event listener for the import travel input element
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnImportTravelInputChange ( changeEvent ) {
	changeEvent.stopPropagation ( );
	newFileLoader ( ).mergeLocalFile ( changeEvent );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnImportTravelButtonClick
@desc click event listener for the import travel button
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnImportTravelButtonClick ( ) {
	if ( INVALID_OBJ_ID === theTravelNotesData.editedRouteObjId ) {
		ourImportTravelInput.click ( );
	}
	else {
		theErrorsUI.showError (
			theTranslator.getText ( 'TravelUI - Not possible to merge a travel when a route is edited' )
		);
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourCreateImportTravelButton
@desc This method creates the import travel button
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourCreateImportTravelButton ( ) {
	ourImportTravelInput = theHTMLElementsFactory.create (
		'input',
		{
			className : 'TravelNotes-TravelUI-OpenFileInput',
			type : 'file',
			accept : '.trv,.map'
		},
		ourButtonsDiv
	);
	ourImportTravelInput.addEventListener ( 'change', ourOnImportTravelInputChange, false );
	theHTMLElementsFactory.create (
		'div',
		{
			className : 'TravelNotes-UI-Button',
			title : theTranslator.getText ( 'TravelUI - Import travel' ),
			innerHTML : '&#x1F30F;' // 1F30F = 🌏
		},
		ourButtonsDiv
	)
		.addEventListener ( 'click', ourOnImportTravelButtonClick, false );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourCreateRoadbookButton
@desc This method creates the roadbook button
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourCreateRoadbookButton ( ) {
	theHTMLElementsFactory.create (
		'div',
		{
			className : 'TravelNotes-UI-Button',
			title : theTranslator.getText ( 'TravelUI - Open travel roadbook' ),
			innerHTML :
				'<a class="TravelNotes-UI-LinkButton" href="TravelNotesRoadbook.html?lng=' +
				theConfig.language +
				'&page=' +
				theTravelNotesData.UUID +
				'" target="_blank">&#x1F4CB;</a>' // 1F4CB = 📋
		},
		ourButtonsDiv
	);
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourCreateButtonsDiv
@desc This method creates the buttons div
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourCreateButtonsDiv ( ) {
	ourButtonsDiv = theHTMLElementsFactory.create (
		'div',
		{
			className : 'TravelNotes-UI-FlexRowDiv'
		},
		ourUIMainDiv
	);

	ourCreateCancelTravelButton ( );
	ourCreateSaveTravelButton ( );
	ourCreateOpenTravelButton ( );
	ourCreateImportTravelButton ( );
	ourCreateRoadbookButton ( );
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
	ourRoutesList.classList.toggle ( 'TravelNotes-TravelUI-HiddenRouteList' );
	let hiddenList = ourRoutesList.classList.contains ( 'TravelNotes-TravelUI-HiddenRouteList' );
	clickEvent.target.innerHTML =
		hiddenList ? '&#x25b6;' : '&#x25bc;'; // 25b6 = ▶  25bc = ▼
	clickEvent.target.title =
		hiddenList
			?
			theTranslator.getText ( 'TravelUI - Show' )
			:
			theTranslator.getText ( 'TravelUI - Hide' );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourCreateExpandRoutesButton
@desc This method creates the expand routes list button
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourCreateExpandRoutesButton ( ) {
	theHTMLElementsFactory.create (
		'div',
		{
			innerHTML : '&#x25bc;', // 25bc = ▼
			className : 'TravelNotes-TravelUI-RouteList-ExpandButton'
		},
		ourRoutesHeaderDiv
	)
		.addEventListener ( 'click', ourOnExpandRoutesButtonClick, false );
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

@function ourCreateAddRouteButton
@desc This method creates the add route button
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourCreateAddRouteButton ( ) {
	theHTMLElementsFactory.create (
		'div',
		{
			className : 'TravelNotes-UI-Button TravelNotes-UI-FlexRow-RightButton',
			title : theTranslator.getText ( 'TravelUI - Add a route' ),
			innerHTML : '+'
		},
		ourRoutesHeaderDiv
	)
		.addEventListener ( 'click', ourOnAddRouteButtonClick, false );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourCreateRoutesListHeaderDiv
@desc This method creates the routes list header div
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourCreateRoutesListHeaderDiv ( ) {
	ourRoutesHeaderDiv = theHTMLElementsFactory.create (
		'div',
		{
			className : 'TravelNotes-UI-FlexRowDiv'
		},
		ourUIMainDiv
	);
	ourCreateExpandRoutesButton ( ourRoutesHeaderDiv );
	theHTMLElementsFactory.create (
		'span',
		{
			innerHTML : theTranslator.getText ( 'TravelUI - Travel routes' )
		},
		ourRoutesHeaderDiv
	);
	ourCreateAddRouteButton ( ourRoutesHeaderDiv );
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
		console.log ( err );
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

@function ourCreateRoutesListHeaderDiv
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

	/**
	creates the user interface
	@param {HTMLElement} uiMainDiv the main element in witch the UI is created
	*/

	createUI ( uiMainDiv ) {
		if ( ourUIMainDiv ) {
			return;
		}
		ourUIMainDiv = uiMainDiv;
		ourCreateTravelNameDiv ( );
		ourCreateButtonsDiv ( );
		ourCreateRoutesListHeaderDiv ( );
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
				( routesIterator.value.objId === theTravelNotesData.editedRouteObjId ? '&#x1f534;&nbsp;' : '' ) +
				( route.chain ? '&#x26d3;&nbsp;' : '' ) +
				( route.computedName ); // 1f534 = 🔴 26d3 = ⛓

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
					innerHTML : routeName
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

const ourTravelUI = Object.freeze ( new TravelUI );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of TravelUI class
	@type {TravelUI}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourTravelUI as theTravelUI
};

/*
--- End of TravelUI.js file -------------------------------------------------------------------------------------------
*/