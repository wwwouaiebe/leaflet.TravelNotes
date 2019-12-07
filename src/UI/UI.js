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
--- UserInterface.js file ---------------------------------------------------------------------------------------------
This file contains:
	- the newUserInterface function
Changes:
	- v1.0.0:
		- created
	- v1.1.0:
		- Issue #31 : Add a command to import from others maps
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
		- Issue #63 : Find a better solution for provider keys upload
		- Issue #75 : Merge Maps and TravelNotes
Doc reviewed 20191125
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { theTravelEditorUI } from '../UI/TravelEditorUI.js';
import { theRouteEditorUI } from '../UI/RouteEditorUI.js';
import { theDataPanesUI } from '../UI/DataPanesUI.js';
import { theProvidersToolbarUI } from '../UI/ProvidersToolbarUI.js';
import { theTravelNotesToolbarUI } from '../UI/TravelNotesToolbarUI.js';
import  { OUR_CONST } from '../util/Constants.js';

/*
--- newUserInterface function -----------------------------------------------------------------------------------------

This function returns the UserInterface object

-----------------------------------------------------------------------------------------------------------------------
*/

function newUI ( ) {

	let myMainDiv = null;

	/*
	--- myCreateUI function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateUI ( controlDiv ) {
		if ( document.getElementById ( 'TravelNotes-Control-MainDiv' ) ) {
			return;
		}
		let htmlElementsFactory = newHTMLElementsFactory ( );
		myMainDiv = htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-MainDiv' }, controlDiv );
		htmlElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-MainDiv-Title',
				innerHTML : 'Travel&nbsp;&amp;&nbsp;Notes'
			},
			myMainDiv
		);

		theTravelNotesToolbarUI.createUI ( myMainDiv );
		theTravelEditorUI.createUI ( myMainDiv );
		theRouteEditorUI.createUI ( myMainDiv );
		theDataPanesUI.createUI ( myMainDiv );

		theProvidersToolbarUI.createUI ( myMainDiv );

		myMainDiv.addEventListener ( 'setrouteslist', ( ) => theTravelEditorUI.setRoutesList ( ), false );

		myMainDiv.addEventListener ( 'expandrouteui', ( ) => theRouteEditorUI.expandUI ( ), false );
		myMainDiv.addEventListener ( 'reducerouteui', ( ) => theRouteEditorUI.reduceUI ( ), false );
		myMainDiv.addEventListener ( 'setwaypointslist', ( ) => theRouteEditorUI.setWayPointsList ( ), false );

		myMainDiv.addEventListener ( 'setitinerary', ( ) => theDataPanesUI.setItinerary ( ), false );
		myMainDiv.addEventListener ( 'updateitinerary', ( ) => theDataPanesUI.updateItinerary ( ), false );
		myMainDiv.addEventListener ( 'settravelnotes', ( ) => theDataPanesUI.setTravelNotes ( ), false );
		myMainDiv.addEventListener ( 'updatetravelnotes', ( ) => theDataPanesUI.updateTravelNotes ( ), false );
		myMainDiv.addEventListener ( 'setsearch', ( ) => theDataPanesUI.setSearch ( ), false );
		myMainDiv.addEventListener ( 'updatesearch', ( ) => theDataPanesUI.updateSearch ( ), false );
		myMainDiv.addEventListener ( 'providersadded', ( ) => theProvidersToolbarUI.providersAdded ( ), false );

		myMainDiv.addEventListener (
			'setprovider',
			setProviderEvent => {
				if ( setProviderEvent.data && setProviderEvent.data.provider ) {
					theProvidersToolbarUI.provider = setProviderEvent.data.provider;
				}
			},
			false
		);
		myMainDiv.addEventListener (
			'settransitmode',
			setTransitModeEvent => {
				if ( setTransitModeEvent.data && setTransitModeEvent.data.provider ) {
					theProvidersToolbarUI.transitMode = setTransitModeEvent.data.transitMode;
				}
			},
			false
		);

		myMainDiv.addEventListener (
			'click',
			clickEvent => {
				if  ( clickEvent.target.classList.contains (  'TravelNotes-SortableList-ItemInput' ) ) {
					return;
				}
				if  ( clickEvent.target.classList.contains (  'TravelNotes-Control-LinkButton' ) ) {
					return;
				}
				if (
					clickEvent.target.id &&
				OUR_CONST.invalidObjId !==
					[
						'TravelNotes-Control-OpenTravelInput',
						'TravelNotes-Control-OpenTravelButton',
						'TravelNotes-Control-ImportTravelInput',
						'TravelNotes-Control-ImportTravelButton'
					].indexOf ( clickEvent.target.id )
				) {
					return;
				}
				clickEvent.stopPropagation ( );
				clickEvent.preventDefault ( );
			},
			false
		);

		myMainDiv.addEventListener (
			'dblclick',
			dblClickEvent => {
				dblClickEvent.stopPropagation ( );
				dblClickEvent.preventDefault ( );
			},
			false
		);

		myMainDiv.addEventListener (
			'wheel',
			wheelEvent => {
				wheelEvent.stopPropagation ( );
				wheelEvent.preventDefault ( );
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

	if ( ! myMainDiv ) {
		myCreateUI ( );
	}

	/*
	--- UI object -----------------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return {
		createUI : controlDiv => myCreateUI ( controlDiv )
	};
}

/*
--- theUI object ------------------------------------------------------------------------------------------------------

The one and only one UI object

-----------------------------------------------------------------------------------------------------------------------
*/

const theUI = newUI ( );

export { theUI };

/*
--- End of UserInterface.js file --------------------------------------------------------------------------------------
*/