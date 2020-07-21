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
--- TravelNotesToolbarUI.js file --------------------------------------------------------------------------------------
This file contains:
	- the TravelNotesToolbarUI function
	- the theTravelNotesToolbarUI object
Changes:
	- v1.6.0:
		- created
	- v1.12.0:
		- Issue #120 : Review the UserInterface
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { theConfig } from '../data/Config.js';
import { theAPIKeysManager } from '../core/APIKeysManager.js';
import { theGeoLocator } from '../core/GeoLocator.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';

import { GEOLOCATION_STATUS } from '../util/Constants.js';

/*
--- newTravelNotesToolbarUI function ----------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newTravelNotesToolbarUI ( ) {

	let myGeoLocationButton = null;
	let myHTMLElementsFactory = newHTMLElementsFactory ( );
	let myPinButton = null;
	let myTimerId = null;

	/*
	--- myOnMouseEnterUI function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnMouseEnterUI ( ) {
		if ( myTimerId ) {
			clearTimeout ( myTimerId );
			myTimerId = null;
		}
		document.getElementById ( 'TravelNotes-UI-MainDiv' )
			.classList.remove ( 'TravelNotes-UI-MainDiv-Minimize' );
		document.getElementById ( 'TravelNotes-UI-MainDiv' )
			.classList.add ( 'TravelNotes-UI-MainDiv-Maximize' );
	}

	/*
	--- myOnMouseLeaveUI function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnMouseLeaveUI ( ) {
		myTimerId = setTimeout (
			( ) => {
				document.getElementById ( 'TravelNotes-UI-MainDiv' )
					.classList.remove ( 'TravelNotes-UI-MainDiv-Maximize' );
				document.getElementById ( 'TravelNotes-UI-MainDiv' )
					.classList.add ( 'TravelNotes-UI-MainDiv-Minimize' );
			},
			theConfig.travelEditor.timeout
		);
	}

	/*
	--- myOnGeoLocationStatusChanged function -------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnGeoLocationStatusChanged ( geoLocationStatus ) {
		switch ( geoLocationStatus ) {
		case GEOLOCATION_STATUS.inactive :
			myGeoLocationButton.classList.remove ( 'TravelNotes-TravelNotesToolbarUI-GeoLocationButton-Striked' );
			break;
		case GEOLOCATION_STATUS.active :
			myGeoLocationButton.classList.add ( 'TravelNotes-TravelNotesToolbarUI-GeoLocationButton-Striked' );
			break;
		default :
			if ( myGeoLocationButton ) {
				myGeoLocationButton.parentNode.removeChild ( myGeoLocationButton );
				myGeoLocationButton = null;
			}
			break;
		}
	}

	/*
	--- myCreateHomeButton --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateHomeButton ( buttonsDiv ) {
		myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-Button',
				title : 'Home',
				innerHTML :
					'<a class="TravelNotes-UI-LinkButton" href="' +
					window.location.origin +
					'" target="_blank">&#x1f3e0;</a>'
			},
			buttonsDiv
		);
	}

	/*
	--- myCreateHelpButton --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateHelpButton ( buttonsDiv ) {
		myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-Button',
				title : 'Help',
				innerHTML :
					'<a class="TravelNotes-UI-LinkButton" ' +
					'href="https://github.com/wwwouaiebe/leaflet.TravelNotes/tree/gh-pages/TravelNotesGuides" ' +
					'target="_blank">?</a>'
			},
			buttonsDiv
		);
	}

	/*
	--- myCreateContactButton -----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateContactButton ( buttonsDiv ) {
		myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-Button',
				title : 'Contact',
				innerHTML :
					'<a class="TravelNotes-UI-LinkButton" href="' +
					( theConfig.travelNotesToolbarUI.contactMail || window.location.origin ) +
					'" target="_blank">@</a>'
			},
			buttonsDiv
		);
	}

	/*
	--- myCreateApiKeysButton -----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateApiKeysButton ( buttonsDiv ) {
		if ( theConfig.APIKeys.showDialogButton ) {

			// API keys button
			myHTMLElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-UI-Button',
					title : theTranslator.getText ( 'TravelNotesToolbarUI - API keys' ),
					innerHTML : '&#x1f511;'
				},
				buttonsDiv
			)
				.addEventListener (
					'click',
					clickEvent => {
						clickEvent.stopPropagation ( );
						theAPIKeysManager.dialog ( );
					},
					false
				);
		}
	}

	/*
	--- myCreateGeoLocationButton -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateGeoLocationButton ( buttonsDiv ) {

		// Don't test the https protocol. On some mobile devices with an integreted GPS
		// the geolocation is working also on http protocol
		if ( GEOLOCATION_STATUS.disabled < theGeoLocator.status ) {

			// GeoLocator button
			myGeoLocationButton = myHTMLElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-UI-Button',
					title : theTranslator.getText ( 'TravelNotesToolbarUI - Geo location' ),
					innerHTML : '&#x1f310;'
				},
				buttonsDiv
			);
			myGeoLocationButton.addEventListener (
				'click',
				clickEvent => {
					clickEvent.stopPropagation ( );
					theGeoLocator.switch ( );
				},
				false
			);
		}
	}

	/*
	--- myCreatePinButton ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreatePinButton ( buttonsDiv, UIDiv ) {

		// pin button
		myPinButton = myHTMLElementsFactory.create (
			'span',
			{
				innerHTML : '&#x274c;',
				className : 'TravelNotes-UI-FlexRow-RightButton'
			},
			buttonsDiv
		);
		myPinButton.addEventListener (
			'click',
			clickEvent => {
				let userInterface = document.getElementById ( 'TravelNotes-UI-MainDiv' );
				let tmp = document.createElement ( 'div' );
				tmp.innerHTML = '&#x274c;';
				if ( tmp.innerHTML === clickEvent.target.innerHTML ) {
					clickEvent.target.innerHTML = '&#x1f4cc;';
					userInterface.addEventListener ( 'mouseenter', myOnMouseEnterUI, false );
					userInterface.addEventListener ( 'mouseleave', myOnMouseLeaveUI, false );
				}
				else {
					clickEvent.target.innerHTML = '&#x274c;';
					userInterface.removeEventListener ( 'mouseenter', myOnMouseEnterUI, false );
					userInterface.removeEventListener ( 'mouseleave', myOnMouseLeaveUI, false );
				}
			},
			false
		);
		if ( theConfig.travelEditor.startMinimized ) {
			myPinButton.innerHTML = '&#x1f4cc;';
			UIDiv.addEventListener ( 'mouseenter', myOnMouseEnterUI, false );
			UIDiv.addEventListener ( 'mouseleave', myOnMouseLeaveUI, false );
			UIDiv.classList.add ( 'TravelNotes-UI-MainDiv-Minimize' );
		}
		else {
			UIDiv.classList.add ( 'TravelNotes-UI-MainDiv-Maximize' );
		}
	}

	/*
	--- myCreateUI function -------------------------------------------------------------------------------------------

	This function creates the UI

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateUI ( UIDiv ) {

		let buttonsDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-FlexRowDiv'
			},
			UIDiv
		);

		myCreateHomeButton ( buttonsDiv );
		myCreateHelpButton ( buttonsDiv );
		myCreateContactButton ( buttonsDiv );
		myCreateApiKeysButton ( buttonsDiv );
		myCreateGeoLocationButton ( buttonsDiv );
		myCreatePinButton ( buttonsDiv, UIDiv );
	}

	/*
	--- TravelNotesToolbarUI object -----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			createUI : UIDiv => myCreateUI ( UIDiv ),

			geoLocationStatusChanged : geoLocationStatus => myOnGeoLocationStatusChanged ( geoLocationStatus )

		}
	);
}

/*
--- theTravelNotesToolbarUI object ------------------------------------------------------------------------------------

The one and only one TravelNotesToolbarUI

-----------------------------------------------------------------------------------------------------------------------
*/

const theTravelNotesToolbarUI = newTravelNotesToolbarUI ( );

export { theTravelNotesToolbarUI };

/*
--- End of TravelNotesToolbarUI.js file -------------------------------------------------------------------------------
*/