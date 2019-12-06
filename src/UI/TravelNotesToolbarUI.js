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
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { theConfig } from '../data/Config.js';
import { theAPIKeysManager } from '../core/APIKeysManager.js';
import { theGeoLocator } from '../core/GeoLocator.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';

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
	--- myOnMouseEnterControl function --------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnMouseEnterControl ( ) {
		if ( myTimerId ) {
			clearTimeout ( myTimerId );
			myTimerId = null;
		}
		document.getElementById ( 'TravelNotes-Control-MainDiv' )
			.classList.remove ( 'TravelNotes-Control-MainDiv-Minimize' );
		document.getElementById ( 'TravelNotes-Control-MainDiv' )
			.classList.add ( 'TravelNotes-Control-MainDiv-Maximize' );
	}

	/*
	--- myOnMouseLeaveControlfunction ---------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnMouseLeaveControl ( ) {
		myTimerId = setTimeout (
			( ) => {
				document.getElementById ( 'TravelNotes-Control-MainDiv' )
					.classList.remove ( 'TravelNotes-Control-MainDiv-Maximize' );
				document.getElementById ( 'TravelNotes-Control-MainDiv' )
					.classList.add ( 'TravelNotes-Control-MainDiv-Minimize' );
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
		case 1 :
			myGeoLocationButton.classList.remove ( 'TravelNotes-Control-GeoLocationButton-Striked' );
			break;
		case 2 :
			myGeoLocationButton.classList.add ( 'TravelNotes-Control-GeoLocationButton-Striked' );
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
	--- myCreateUI function -------------------------------------------------------------------------------------------

	This function creates the UI

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateUI ( controlDiv ) {

		if ( document.getElementById ( 'TravelNotes-Control-TravelNotesToolbarDiv' ) ) {
			return;
		}

		let buttonsDiv = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-TravelNotesToolbarDiv',
				className : 'TravelNotes-Control-ButtonsDiv'
			},
			controlDiv
		);

		myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-HomeButton',
				className : 'TravelNotes-Control-Button',
				title : 'Help',
				innerHTML :
					'<a class="TravelNotes-Control-LinkButton" href="' +
					window.location.origin +
					'" target="_blank">&#x1f3e0;</a>'
			},
			buttonsDiv
		);
		myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-HelpButton',
				className : 'TravelNotes-Control-Button',
				title : 'Help',
				innerHTML :
					'<a class="TravelNotes-Control-LinkButton" ' +
					'href="https://github.com/wwwouaiebe/leaflet.TravelNotes/tree/gh-pages/TravelNotesGuides" ' +
					'target="_blank">?</a>'
			},
			buttonsDiv
		);
		myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-ContactButton',
				className : 'TravelNotes-Control-Button',
				title : 'Contact',
				innerHTML :
					'<a class="TravelNotes-Control-LinkButton" href="' +
					( theConfig.travelNotesToolbarUI.contactMail || window.location.origin ) +
					'" target="_blank">@</a>'
			},
			buttonsDiv
		);
		if ( theConfig.APIKeys.showDialogButton ) {

			// API keys button
			myHTMLElementsFactory.create (
				'div',
				{
					id : 'TravelNotes-Control-ApiKeysButton',
					className : 'TravelNotes-Control-Button',
					title : theTranslator.getText ( 'TravelEditorUI - API keys' ),
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
		if ( 0 < theGeoLocator.status ) {

			// GeoLocator button
			myGeoLocationButton = myHTMLElementsFactory.create (
				'div',
				{
					id : 'TravelNotes-Control-GeoLocatorButton',
					className : 'TravelNotes-Control-Button',
					title : theTranslator.getText ( 'TravelEditorUI - Geo location' ),
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

		// pin button
		myPinButton = myHTMLElementsFactory.create (
			'span',
			{
				innerHTML : '&#x274c;',
				id : 'TravelNotes-Control-PinButton'
			},
			buttonsDiv
		);
		myPinButton.addEventListener (
			'click',
			clickEvent => {
				let control = document.getElementById ( 'TravelNotes-Control-MainDiv' );
				if ( 10060 === clickEvent.target.innerHTML.charCodeAt ( 0 ) ) {
					clickEvent.target.innerHTML = '&#x1f4cc;';
					control.addEventListener ( 'mouseenter', myOnMouseEnterControl, false );
					control.addEventListener ( 'mouseleave', myOnMouseLeaveControl, false );
				}
				else {
					clickEvent.target.innerHTML = '&#x274c;';
					control.removeEventListener ( 'mouseenter', myOnMouseEnterControl, false );
					control.removeEventListener ( 'mouseleave', myOnMouseLeaveControl, false );
				}
			},
			false
		);
		if ( theConfig.travelEditor.startMinimized ) {
			myPinButton.innerHTML = '&#x1f4cc;';
			controlDiv.addEventListener ( 'mouseenter', myOnMouseEnterControl, false );
			controlDiv.addEventListener ( 'mouseleave', myOnMouseLeaveControl, false );
			controlDiv.classList.add ( 'TravelNotes-Control-MainDiv-Minimize' );
		}
		else {
			controlDiv.classList.add ( 'TravelNotes-Control-MainDiv-Maximize' );
		}
	}

	/*
	--- TravelNotesToolbarUI object -----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			createUI : controlDiv => myCreateUI ( controlDiv ),

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