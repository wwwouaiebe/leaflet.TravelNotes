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
	- v1.12.0:
		- Issue #120 : Review the UserInterface
Doc reviewed 20191125
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { theTravelUI } from '../UI/TravelUI.js';
import { theDataPanesUI } from '../UI/DataPanesUI.js';
import { theProvidersToolbarUI } from '../UI/ProvidersToolbarUI.js';
import { theTravelNotesToolbarUI } from '../UI/TravelNotesToolbarUI.js';
import { INVALID_OBJ_ID } from '../util/Constants.js';

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

	function myCreateUI ( uiDiv ) {
		if ( document.getElementById ( 'TravelNotes-UI-MainDiv' ) ) {
			return;
		}
		let htmlElementsFactory = newHTMLElementsFactory ( );
		myMainDiv = htmlElementsFactory.create ( 'div', { id : 'TravelNotes-UI-MainDiv' }, uiDiv );
		htmlElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-UI-MainDiv-Title',
				innerHTML : 'Travel&nbsp;&amp;&nbsp;Notes'
			},
			myMainDiv
		);

		theTravelNotesToolbarUI.createUI ( myMainDiv );
		theTravelUI.createUI ( myMainDiv );
		theDataPanesUI.createUI ( myMainDiv );

		theProvidersToolbarUI.createUI ( myMainDiv );

		myMainDiv.addEventListener ( 'travelnameupdated', ( ) => theTravelUI.setTravelName ( ), false );
		myMainDiv.addEventListener ( 'setrouteslist', ( ) => theTravelUI.setRoutesList ( ), false );
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
				if ( clickEvent.target.classList.contains ( 'TravelNotes-UI-LinkButton' ) ) {
					return;
				}
				if (
					clickEvent.target.id &&
				INVALID_OBJ_ID !==
					[
						'TravelNotes-ItineraryPane-ShowNotesInput',
						'TravelNotes-ItineraryPane-ShowManeuversInput',
						'TravelNotes-TravelUI-OpenTravelInput',
						'TravelNotes-TravelUI-OpenTravelButton',
						'TravelNotes-TravelUI-ImportTravelInput',
						'TravelNotes-TravelUI-ImportTravelButton'
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
		createUI : uiDiv => myCreateUI ( uiDiv )
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