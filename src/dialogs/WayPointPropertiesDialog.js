/*
Copyright - 2020 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- WayPointPropertiesDialog.js file -------------------------------------------------------------------------------------
This file contains:
	- the newWayPointPropertiesDialog function
Changes:
	- v1.12.0:
		- created
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { newBaseDialog } from '../dialogs/BaseDialog.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { theTranslator } from '../UI/Translator.js';
import { newGeoCoder } from '../core/GeoCoder.js';
import { theConfig } from '../data/Config.js';

function newWayPointPropertiesDialog ( wayPoint ) {

	let myHTMLElementsFactory = newHTMLElementsFactory ( );
	let myWayPointPropertiesDialog = null;
	let myWayPointDataDiv = null;
	let myNameInput = null;
	let myAddressInput = null;

	/*
	--- myOnOkButtonClick function ------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnOkButtonClick ( ) {

		wayPoint.name = myNameInput.value;
		wayPoint.address = myAddressInput.value;

		return wayPoint;
	}

	/*
	--- myOnResetAddressButtonClick function --------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnResetAddressButtonClick ( clickEvent ) {
		clickEvent.stopPropagation ( );
		if ( ! theConfig.wayPoint.reverseGeocoding ) {
			return;
		}

		let geoCoder = newGeoCoder ( );
		geoCoder.getPromiseAddress ( wayPoint.latLng )
			.then (
				geoCoderData => {
					let response = geoCoder.parseResponse ( geoCoderData );
					let address = response.street;
					if ( '' !== response.city ) {
						address += ' ' + response.city;
					}
					myAddressInput.value = address;
				}
			)
			.catch ( err => console.log ( err ? err : 'An error occurs in the geoCoder' ) );

	}

	/*
	--- myCreateDialog function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateDialog ( ) {

		// the dialog base is created
		myWayPointPropertiesDialog = newBaseDialog ( );
		myWayPointPropertiesDialog.title = theTranslator.getText ( 'WayPointPropertiesDialog - Waypoint properties' );

		myWayPointPropertiesDialog.okButtonListener = myOnOkButtonClick;

		myWayPointDataDiv = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-WayPointPropertiesDialog-DataDiv'
			},
			myWayPointPropertiesDialog.content );
	}

	/*
	--- myCreateNameDiv function --------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateNameDiv ( ) {
		myHTMLElementsFactory.create (
			'div',
			{
				innerHTML : theTranslator.getText ( 'WayPointPropertiesDialog - Name' )
			},
			myWayPointDataDiv
		);
		myNameInput = myHTMLElementsFactory.create (
			'input',
			{
				type : 'text',
				value : wayPoint.name,
				className : 'TravelNotes-WayPointPropertiesDialog-Input'
			},
			myHTMLElementsFactory.create ( 'div', null, myWayPointDataDiv )
		);
	}

	/*
	--- myCreateAddressDiv function -----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateAddressDiv ( ) {

		let addressHeader = myHTMLElementsFactory.create ( 'div', null, myWayPointDataDiv );
		myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-Button',
				title : theTranslator.getText ( 'WayPointPropertiesDialog - Reset address' ),
				innerHTML : '&#x1f504;'
			},
			addressHeader
		)
			.addEventListener (
				'click',
				myOnResetAddressButtonClick,
				false
			);
		myHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'WayPointPropertiesDialog - Address' )
			},
			addressHeader
		);

		myAddressInput = myHTMLElementsFactory.create (
			'input',
			{
				type : 'text',
				value : wayPoint.address,
				className : 'TravelNotes-WayPointPropertiesDialog-Input'
			},
			myHTMLElementsFactory.create ( 'div', null, myWayPointDataDiv )
		);
	}

	/*
	--- main ----------------------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	myCreateDialog ( );
	myCreateNameDiv ( );
	myCreateAddressDiv ( );

	return myWayPointPropertiesDialog;
}

export { newWayPointPropertiesDialog };

/*
--- End of NoteDialog.js file -----------------------------------------------------------------------------------------
*/