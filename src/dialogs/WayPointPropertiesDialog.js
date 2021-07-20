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
	- v1.12.0:
		- created
	- v2.0.0:
		- Issue ♯135 : Remove innerHTML from code
		- Issue ♯138 : Protect the app - control html entries done by user.
	- v2.2.0:
		- Issue ♯64 : Improve geocoding
Doc reviewed 20200816
Tests ...
*/
/**
@------------------------------------------------------------------------------------------------------------------------------

@file WayPointPropertiesDialog.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module WayPointPropertiesDialog
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { newBaseDialog } from '../dialogs/BaseDialog.js';
import { theHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { theTranslator } from '../UI/Translator.js';
import GeoCoder from '../core/GeoCoder.js';
import theConfig from '../data/Config.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewWayPointPropertiesDialog
@desc constructor for WayPointPropertiesDialog objects
@param {WayPoint} wayPoint The wayPoint for wich the properties have to be edited
@return {WayPointPropertiesDialog} an instance of WayPointPropertiesDialog object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewWayPointPropertiesDialog ( wayPoint ) {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class WayPointPropertiesDialog
	@classdesc A BaseDialog object completed for edition of WayPoint properties
	Create an instance of the dialog, then execute the show ( ) method. The edited WayPoint is given as parameter of the
	succes handler of the Promise returned by the show ( ) method.
	@example
	newWayPointPropertiesDialog ( wayPoint )
		.show ( )
		.then ( wayPoint => doSomethingWithTheWayPoint )
		.catch ( error => doSomethingWithTheError );
	@see {@link newWayPointPropertiesDialog} for constructor
	@augments BaseDialog
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	let myWayPointPropertiesDialog = null;
	let myWayPointDataDiv = null;
	let myNameInput = null;
	let myAddressInput = null;

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnOkButtonClick
	@desc Event listener for the ok button
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnOkButtonClick ( ) {

		wayPoint.name = myNameInput.value;
		wayPoint.address = myAddressInput.value;
		wayPoint.validateData ( );

		return wayPoint;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnResetAddressButtonClick
	@desc Event listener for the reset address button
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	async function myOnResetAddressButtonClick ( clickEvent ) {
		clickEvent.stopPropagation ( );
		if ( ! theConfig.wayPoint.reverseGeocoding ) {
			return;
		}

		myWayPointPropertiesDialog.okButton.classList.add ( 'TravelNotes-Hidden' );
		let geoCoder = new GeoCoder ( );
		let address = await geoCoder.getAddress ( wayPoint.latLng );
		myWayPointPropertiesDialog.okButton.classList.remove ( 'TravelNotes-Hidden' );
		if ( address.statusOk ) {
			if ( theConfig.wayPoint.geocodingIncludeName ) {
				myNameInput.value = address.name;
			}
			let addressString = address.street;
			if ( '' !== address.city ) {
				addressString += ' ' + address.city;
			}
			myAddressInput.value = addressString;
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateDialog
	@desc This method creates the dialog
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateDialog ( ) {
		myWayPointPropertiesDialog = newBaseDialog ( );
		myWayPointPropertiesDialog.title = theTranslator.getText ( 'WayPointPropertiesDialog - Waypoint properties' );
		myWayPointPropertiesDialog.okButtonListener = myOnOkButtonClick;
		myWayPointDataDiv = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-WayPointPropertiesDialog-DataDiv'
			},
			myWayPointPropertiesDialog.content );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateNameDiv
	@desc This method creates the name div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateNameDiv ( ) {
		theHTMLElementsFactory.create (
			'div',
			{
				textContent : theTranslator.getText ( 'WayPointPropertiesDialog - Name' )
			},
			myWayPointDataDiv
		);
		myNameInput = theHTMLElementsFactory.create (
			'input',
			{
				type : 'text',
				value : wayPoint.name,
				className : 'TravelNotes-WayPointPropertiesDialog-Input'
			},
			theHTMLElementsFactory.create ( 'div', null, myWayPointDataDiv )
		);
	}

	function myCreateResetButton ( ) {
		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-Button',
				title : theTranslator.getText ( 'WayPointPropertiesDialog - Reset address' ),
				textContent : '🔄'
			},
			theHTMLElementsFactory.create ( 'div', null, myWayPointDataDiv )
		)
			.addEventListener (
				'click',
				myOnResetAddressButtonClick,
				false
			);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateAddressDiv
	@desc This method creates the name div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateAddressDiv ( ) {

		theHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'WayPointPropertiesDialog - Address' )
			},
			theHTMLElementsFactory.create ( 'div', null, myWayPointDataDiv )
		);

		myAddressInput = theHTMLElementsFactory.create (
			'input',
			{
				type : 'text',
				value : wayPoint.address,
				className : 'TravelNotes-WayPointPropertiesDialog-Input'
			},
			theHTMLElementsFactory.create ( 'div', null, myWayPointDataDiv )
		);
	}

	myCreateDialog ( );
	myCreateResetButton ( );
	myCreateNameDiv ( );
	myCreateAddressDiv ( );

	return myWayPointPropertiesDialog;
}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newWayPointPropertiesDialog
	@desc constructor for WayPointPropertiesDialog objects
	@param {WayPoint} wayPoint The wayPoint for wich the properties have to be edited
	@return {WayPointPropertiesDialog} an instance of WayPointPropertiesDialog object
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourNewWayPointPropertiesDialog as newWayPointPropertiesDialog
};

/*
--- End of NoteDialog.js file -------------------------------------------------------------------------------------------------
*/