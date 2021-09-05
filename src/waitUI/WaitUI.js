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
		- Issue ♯135 : Remove innerHTML from code
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
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

@------------------------------------------------------------------------------------------------------------------------------
*/

import theHTMLElementsFactory from '../UILib/HTMLElementsFactory.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class display a Wait window on the screen with a message and an animation
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class WaitUI {

	#backgroundDiv = null;
	#messageDiv = null;

	/*
	constructor
	*/

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
		this.#backgroundDiv = theHTMLElementsFactory.create ( 'div', { className : 'TravelNotes-Background' }, document.body );
		let waitDiv = theHTMLElementsFactory.create ( 'div', { id : 'TravelNotes-WaitUI' }, this.#backgroundDiv );
		this.#messageDiv = theHTMLElementsFactory.create ( 'div', { id : 'TravelNotes-WaitUI-MessageDiv' }, waitDiv );
		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-WaitAnimationBullet'
			},
			theHTMLElementsFactory.create ( 'div', { className : 'TravelNotes-WaitAnimation' }, waitDiv ) );
	}

	/**
	Show an info in the WaitUI
	@param {string} info The info to be displayed
	*/

	showInfo ( info ) {
		this.#messageDiv.textContent = info;
	}

	/**
	Close the WaitUI
	*/

	close ( ) {
		document.body.removeChild ( this.#backgroundDiv );
		this.#backgroundDiv = null;
	}
}

export default WaitUI;

/*
--- End of WaitUI.js file -----------------------------------------------------------------------------------------------------
*/