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
--- TravelUI.js file --------------------------------------------------------------------------------------------------
This file contains:
	- the newTravelUI function
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
		- Issue #120 : Review the control
Doc reviewed 20191125
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { theConfig } from '../data/Config.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theErrorsUI } from '../UI/ErrorsUI.js';
import { theTravelEditor } from '../core/TravelEditor.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { newFileLoader } from '../core/FileLoader.js';
import { newRouteContextMenu } from '../contextMenus/RouteContextMenu.js';
import { LAT_LNG, INVALID_OBJ_ID, ZERO, ONE, MOUSE_WHEEL_FACTORS } from '../util/Constants.js';

/*
--- newTravelUI function ----------------------------------------------------------------------------------------------

This function creates the UI

-----------------------------------------------------------------------------------------------------------------------
*/

function newTravelUI ( ) {

	let myRoutesList = null;
	let myTravelNameInput = null;
	let myHTMLElementsFactory = newHTMLElementsFactory ( );
	let myControlDiv = null;
	let myDataObjId = ZERO;

	/*
	--- myOnDragStart function ----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnDragStart ( dragEvent ) {
		dragEvent.stopPropagation ( );
		try {
			dragEvent.dataTransfer.setData ( 'Text', dragEvent.target.objId );
			dragEvent.dataTransfer.dropEffect = 'move';
		}
		catch ( err ) {
			console.log ( err );
		}

		// for this #@!& MS Edge... don't remove - ONE otherwise crasy things comes in FF
		// MS Edge know the dataTransfer object, but the objects linked to the event are
		// different in the drag event and the drop event
		myDataObjId = dragEvent.target.objId - ONE;
	}

	/*
	--- myOnDragOver function -----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnDragOver ( dragEvent ) {
		dragEvent.preventDefault ( );
	}

	/*
	--- myOnDrop function ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnDrop ( dragEvent ) {
		dragEvent.preventDefault ( );
		let element = dragEvent.target;
		while ( ! element.objId ) {
			element = element.parentElement;
		}
		let clientRect = element.getBoundingClientRect ( );
		let sortableListDropEvent = new Event ( 'SortableListDrop' );

		// for this #@!& MS Edge... don't remove + ONE otherwise crasy things comes in FF
		// event.draggedObjId = parseInt ( dragEvent.dataTransfer.getData("Text") );
		sortableListDropEvent.draggedObjId = myDataObjId + ONE;

		sortableListDropEvent.targetObjId = element.objId;
		sortableListDropEvent.draggedBefore = ( dragEvent.clientY - clientRect.top < clientRect.bottom - dragEvent.clientY );
		element.parentNode.dispatchEvent ( sortableListDropEvent );
	}

	/*
	--- myOnWheel function --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnWheel ( wheelEvent ) {
		if ( wheelEvent.deltaY ) {
			wheelEvent.target.scrollTop +=
				wheelEvent.deltaY * MOUSE_WHEEL_FACTORS [ wheelEvent.deltaMode ];
		}
		wheelEvent.stopPropagation ( );
	}

	/*
	--- myCreateTravelDiv function ------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateTravelNameDiv ( ) {
		let travelNameDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-Control-FlexRow'
			},
			myControlDiv
		);
		myHTMLElementsFactory.create (
			'span',
			{
				innerHTML : theTranslator.getText ( 'TravelUI - Travel' )
			},
			travelNameDiv
		);
		myTravelNameInput = myHTMLElementsFactory.create (
			'input',
			{
				id : 'TravelNotes-Control-InputTravelName',
				type : 'text',
				placeholder : 'TravelNotes',
				value : theTravelNotesData.travel.name
			},
			travelNameDiv
		);
		myTravelNameInput.addEventListener (
			'change',
			changeEvent => theTravelNotesData.travel.name = changeEvent.target.value,
			false
		);
	}

	/*
	--- myCreateCancelTravelButton function ---------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateCancelTravelButton ( buttonsDiv ) {
		myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-Control-Button',
				title : theTranslator.getText ( 'TravelUI - Cancel travel' ),
				innerHTML : '&#x274c'
			},
			buttonsDiv
		)
			.addEventListener (
				'click',
				clickEvent => {
					clickEvent.stopPropagation ();
					theTravelEditor.clear ( );
				},
				false
			);
	}

	/*
	--- myCreateSaveTravelButton function -----------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateSaveTravelButton ( buttonsDiv ) {
		myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-Control-Button',
				title : theTranslator.getText ( 'TravelUI - Save travel' ),
				innerHTML : '&#x1f4be;'
			},
			buttonsDiv
		)
			.addEventListener (
				'click',
				clickEvent => {
					clickEvent.stopPropagation ( );
					theTravelEditor.saveTravel ( );
				},
				false
			);
	}

	/*
	--- myCreateOpenTravelButton function -----------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateOpenTravelButton ( buttonsDiv ) {

		// open travel button with the well know hack....
		// See also UI.js. Click events are first going to the interface div...
		let openTravelDiv = myHTMLElementsFactory.create ( 'div', null, buttonsDiv );
		myHTMLElementsFactory.create (
			'input',
			{
				id : 'TravelNotes-Control-OpenTravelInput',
				className : 'TravelNotes-Control-OpenFileInput',
				type : 'file',
				accept : '.trv'
			},
			openTravelDiv
		)
			.addEventListener (
				'change',
				changeEvent => {
					changeEvent.stopPropagation ( );
					newFileLoader ( ).openLocalFile ( changeEvent );
				},
				false
			);
		let openTravelFakeDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-Control-OpenFileFakeDiv'
			},
			openTravelDiv
		);
		myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-OpenTravelButton',
				className : 'TravelNotes-Control-Button',
				title : theTranslator.getText ( 'TravelUI - Open travel' ),
				innerHTML : '&#x1F4C2;'
			},
			openTravelFakeDiv
		)
			.addEventListener (
				'click',
				( ) => {
					if ( ! window.confirm (
						theTranslator.getText ( 'TravelEditor - This page ask to close; data are perhaps not saved.' )
					)
					) {
						return;
					}
					document.getElementById ( 'TravelNotes-Control-OpenTravelInput' ).click ( );
				},
				false
			);
	}

	/*
	--- myCreateImportTravelButton function ---------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateImportTravelButton ( buttonsDiv ) {

		// import travel button with the well know hack....
		let importTravelDiv = myHTMLElementsFactory.create ( 'div', null, buttonsDiv );
		myHTMLElementsFactory.create (
			'input',
			{
				id : 'TravelNotes-Control-ImportTravelInput',
				className : 'TravelNotes-Control-OpenFileInput',
				type : 'file',
				accept : '.trv,.map'
			},
			importTravelDiv
		)
			.addEventListener (
				'change',
				clickEvent => {
					clickEvent.stopPropagation ( );
					newFileLoader ( ).mergeLocalFile ( clickEvent );
				},
				false
			);
		let importTravelFakeDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-Control-OpenFileFakeDiv'
			},
			importTravelDiv
		);
		myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-ImportTravelButton',
				className : 'TravelNotes-Control-Button',
				title : theTranslator.getText ( 'TravelUI - Import travel' ),
				innerHTML : '&#x1F30F;'
			},
			importTravelFakeDiv
		)
			.addEventListener (
				'click',
				( ) => {
					if ( INVALID_OBJ_ID === theTravelNotesData.editedRouteObjId ) {
						document.getElementById ( 'TravelNotes-Control-ImportTravelInput' ).click ( );
					}
					else {
						theErrorsUI.showError (
							theTranslator.getText ( 'TravelUI - Not possible to merge a travel when a route is edited' )
						);
					}
				},
				false
			);
	}

	/*
	--- myCreateRoadbookButton function -------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateRoadbookButton ( buttonsDiv ) {

		// roadbook button
		myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-Control-Button',
				title : theTranslator.getText ( 'TravelUI - Open travel roadbook' ),
				innerHTML :
					'<a class="TravelNotes-Control-LinkButton" href="TravelNotesRoadbook.html?lng=' +
					theConfig.language +
					'&page=' +
					theTravelNotesData.UUID +
					'" target="_blank">&#x1F4CB;</a>'
			},
			buttonsDiv
		);
	}

	/*
	--- myCreateButtonsDiv function -----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateButtonsDiv ( ) {
		let buttonsDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-Control-FlexRow'
			},
			myControlDiv
		);

		myCreateCancelTravelButton ( buttonsDiv );
		myCreateSaveTravelButton ( buttonsDiv );
		myCreateOpenTravelButton ( buttonsDiv );
		myCreateImportTravelButton ( buttonsDiv );
		myCreateRoadbookButton ( buttonsDiv );
	}

	/*
	--- myCreateExpandRoutesButton function ---------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateExpandRoutesButton ( routesHeaderDiv ) {
		myHTMLElementsFactory.create (
			'span',
			{
				innerHTML : '&#x25bc;',
				id : 'TravelNotes-ControlTravelExpandButton',
				className : 'TravelNotes-Control-ExpandButton'
			},
			routesHeaderDiv
		)
			.addEventListener (
				'click',
				clickEvent => {
					clickEvent.stopPropagation ( );
					let dataDiv = document.getElementById ( 'TravelNotes-Control-RoutesListDiv' );
					dataDiv.classList.toggle ( 'TravelNotes-Control-HiddenList' );
					let hiddenList = dataDiv.classList.contains ( 'TravelNotes-Control-HiddenList' );
					document.getElementById ( 'TravelNotes-ControlTravelExpandButton' ).innerHTML =
						hiddenList ? '&#x25b6;' : '&#x25bc;';
					document.getElementById ( 'TravelNotes-ControlTravelExpandButton' ).title =
						hiddenList
							?
							theTranslator.getText ( 'TravelUI - Show' )
							:
							theTranslator.getText ( 'TravelUI - Hide' );
					clickEvent.stopPropagation ( );
				},
				false
			);
	}

	/*
	--- myCreateAddRouteButton function -------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateAddRouteButton ( routesHeaderDiv ) {

		// add route button
		myHTMLElementsFactory.create (
			'span',
			{
				className : 'TravelNotes-Control-Button TravelNotes-Control-FlexRow-RightButton',
				title : theTranslator.getText ( 'TravelUI - New route' ),
				innerHTML : '+'
			},
			routesHeaderDiv
		)
			.addEventListener (
				'click',
				clickEvent => {
					clickEvent.stopPropagation ();
					theTravelEditor.addRoute ( );
				},
				false
			);
	}

	/*
	--- myCreateRouteHeaderDiv function ------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateRoutesHeaderDiv ( ) {
		let routesHeaderDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-Control-FlexRow'
			},
			myControlDiv
		);

		myCreateExpandRoutesButton ( routesHeaderDiv );

		// title
		myHTMLElementsFactory.create (
			'span',
			{
				innerHTML : theTranslator.getText ( 'TravelUI - Travel routes' )
			},
			routesHeaderDiv
		);

		myCreateAddRouteButton ( routesHeaderDiv );
	}

	/*
	--- myCreateRouteListDiv function ---------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateRouteListDiv ( ) {
		myRoutesList = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-RoutesListDiv',
				className : 'TravelNotes-Control-RoutesListDiv'
			},
			myControlDiv
		);

		myRoutesList.addEventListener ( 'drop', myOnDrop, false );
		myRoutesList.addEventListener ( 'dragover', myOnDragOver, false );
		myRoutesList.addEventListener ( 'wheel', myOnWheel, false );

		myRoutesList.addEventListener (
			'SortableListDrop',
			sortableListDropEvent => {
				sortableListDropEvent.stopPropagation ( );
				theTravelEditor.routeDropped (
					sortableListDropEvent.draggedObjId,
					sortableListDropEvent.targetObjId,
					sortableListDropEvent.draggedBefore
				);
			},
			false
		);
	}

	/*
	--- myOnContextMenuRoute function ---------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnContextMenuRoute ( contextMenuEvent ) {
		contextMenuEvent.stopPropagation ( );
		contextMenuEvent.preventDefault ( );
		contextMenuEvent.latlng = { lat : LAT_LNG.defaultValue, lng : LAT_LNG.defaultValue };
		contextMenuEvent.fromUI = true;
		contextMenuEvent.originalEvent =
			{
				clientX : contextMenuEvent.clientX,
				clientY : contextMenuEvent.clientY
			};
		newRouteContextMenu ( contextMenuEvent, myControlDiv ).show ( );
	}

	/*
	--- mySetRoutesList function --------------------------------------------------------------------------------------

	This function fill the routes list

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySetRoutesList ( ) {

		while ( myRoutesList.firstChild ) {
			myRoutesList.removeChild ( myRoutesList.firstChild );
		}

		let routesIterator = theTravelNotesData.travel.routes.iterator;
		while ( ! routesIterator.done ) {

			let routeName =
				( routesIterator.value.objId === theTravelNotesData.editedRouteObjId ? '&#x1f534;&nbsp;' : '' ) +
				( routesIterator.value.chain ? '&#x26d3;&nbsp;' : '' ) +
				( '' === routesIterator.value.name ? '???' : routesIterator.value.name );

			let routeDiv = myHTMLElementsFactory.create (
				'div',
				{
					draggable : true,
					className :
						'TravelNotes-Control-RoutesList-Item TravelNotes-MoveCursor' +
						( routesIterator.value.hidden ? ' TravelNotes-Control-RoutesList-HiddenItem' : '' ),
					objId :
						routesIterator.value.objId === theTravelNotesData.editedRouteObjId
							?
							theTravelNotesData.travel.editedRoute.objId
							:
							routesIterator.value.objId,
					canDrag : true,
					innerHTML : routeName
				},
				myRoutesList
			);

			routeDiv.addEventListener ( 'dragstart', myOnDragStart, false );

			routeDiv.addEventListener ( 'contextmenu', myOnContextMenuRoute, false );
		}
	}

	/*
	--- myCreateUI function -------------------------------------------------------------------------------------------

	This function creates the UI

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateUI ( controlDiv ) {

		if ( document.getElementById ( 'TravelNotes-Control-RoutesListDiv' ) ) {
			return;
		}

		myControlDiv = controlDiv;

		myCreateTravelNameDiv ( );

		myCreateButtonsDiv ( );

		myCreateRoutesHeaderDiv ( );

		myCreateRouteListDiv ( );
	}

	/*
	--- mySetTraveName function ---------------------------------------------------------------------------------------

	This function fill the routes list

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySetTraveName ( ) {
		myTravelNameInput.value = theTravelNotesData.travel.name;
	}

	/*
	--- travelUI object -----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			createUI : controlDiv => myCreateUI ( controlDiv ),

			setRoutesList : ( ) => mySetRoutesList ( ),

			setTravelName : ( ) => mySetTraveName ( )
		}
	);
}

/*
--- theTravelUI object ------------------------------------------------------------------------------------------------

The one and only one travelUI

-----------------------------------------------------------------------------------------------------------------------
*/

const theTravelUI = newTravelUI ( );

export { theTravelUI };

/*
--- End of TravelUI.js file -------------------------------------------------------------------------------------------
*/