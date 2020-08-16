/*
Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/

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
Doc reviewed 20200816
Tests ...
*/
/**
@------------------------------------------------------------------------------------------------------------------------------

@file WayPointPropertiesDialog.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
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
import { newGeoCoder } from '../core/GeoCoder.js';
import { theConfig } from '../data/Config.js';

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

		return wayPoint;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnResetAddressButtonClick
	@desc Event listener for the reset address button
	@private

	@--------------------------------------------------------------------------------------------------------------------------
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
				innerHTML : theTranslator.getText ( 'WayPointPropertiesDialog - Name' )
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

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateAddressDiv
	@desc This method creates the name div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateAddressDiv ( ) {

		let addressHeader = theHTMLElementsFactory.create ( 'div', null, myWayPointDataDiv );
		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-Button',
				title : theTranslator.getText ( 'WayPointPropertiesDialog - Reset address' ),
				innerHTML : '&#x1f504;' // 1f504 = 🔄
			},
			addressHeader
		)
			.addEventListener (
				'click',
				myOnResetAddressButtonClick,
				false
			);
		theHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'WayPointPropertiesDialog - Address' )
			},
			addressHeader
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