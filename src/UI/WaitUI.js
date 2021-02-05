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
	- v1.11.0:
		- created
	- v2.0.0:
		- Issue #135 : Remove innerHTML from code
Doc reviewed 20200822
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file WaitUI.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module WaitUI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theHTMLElementsFactory } from '../util/HTMLElementsFactory.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewWaitUI
@desc Constructor for a WaitUI object. Notice that, even if you can construct more than one WaitUI, only one
can be displayed on the screen
@return {WaitUI} an instance of a WaitUI object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewWaitUI ( ) {

	let myBackgroundDiv = null;
	let myMessageDiv = null;

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class
	@classdesc This class display a Wait window on the screen with a message and an animation
	@see {@link newWaitUI} for constructor
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	class WaitUI {

		constructor ( ) {
			Object.freeze ( this );
		}

		/**
		creates the user interface
		*/

		createUI ( ) {
			if ( document.getElementById ( 'TravelNotes-WaitUI' ) ) {
				return;
			}
			myBackgroundDiv = theHTMLElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-Background'
				},
				document.querySelector ( 'body' )
			);
			let waitDiv = theHTMLElementsFactory.create (
				'div',
				{
					id : 'TravelNotes-WaitUI'
				},
				myBackgroundDiv
			);
			myMessageDiv = theHTMLElementsFactory.create (
				'div',
				{
					id : 'TravelNotes-WaitUI-MessageDiv'
				},
				waitDiv
			);
			theHTMLElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-WaitAnimationBullet'
				},
				theHTMLElementsFactory.create (
					'div',
					{
						className : 'TravelNotes-WaitAnimation'
					},
					waitDiv
				)
			);
		}

		/**
		Show an info in the WaitUI
		@param {string} info The info to be displayed
		*/

		showInfo ( info ) {
			myMessageDiv.textContent = info;
		}

		/**
		Close the WaitUI
		*/

		close ( ) {
			document.querySelector ( 'body' ).removeChild ( myBackgroundDiv );
			myBackgroundDiv = null;
		}
	}

	return new WaitUI ( );
}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newWaitUI
	@desc Constructor for a WaitUI object. Notice that, even if you can construct more than one WaitUI, only one
	can be displayed on the screen
	@return {WaitUI} an instance of a WaitUI object
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourNewWaitUI as newWaitUI
};

/*
--- End of WaitUI.js file ---------------------------------------------------------------------------------------------
*/