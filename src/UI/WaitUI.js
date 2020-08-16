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
--- WaitUI.js file ----------------------------------------------------------------------------------------------------
This file contains:
	- the newWaitUI function
Changes:
	- v1.11.0:
		- created
Doc reviewed
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theHTMLElementsFactory } from '../util/HTMLElementsFactory.js';

/*
--- newWaitUI function ------------------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newWaitUI ( ) {

	let myBackgroundDiv = null;
	let myWaitDiv = null;
	let myMessageDiv = null;

	/*
	--- myCreateUI function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateUI ( ) {
		if ( document.getElementById ( 'TravelNotes-WaitUI' ) ) {
			return;
		}

		myBackgroundDiv = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-WaitUI-Background'
			},
			document.querySelector ( 'body' )
		);

		myWaitDiv = theHTMLElementsFactory.create (
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
			myWaitDiv
		);
		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-WaitUI-WaitBullet'
			},
			theHTMLElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-WaitUI-Wait'
				},
				myWaitDiv
			)
		);

	}

	/*
	--- myShowInfo function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myShowInfo ( info ) {
		myMessageDiv.innerHTML = info;
	}

	/*
	--- myClose function ----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myClose ( ) {
		document.querySelector ( 'body' ).removeChild ( myBackgroundDiv );
		myBackgroundDiv = null;
	}

	/*
	--- WaitUI object -------------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return {

		createUI : ( ) => myCreateUI ( ),

		showInfo : info => myShowInfo ( info ),

		close : () => myClose ( )

	};
}

export { newWaitUI };

/*
--- End of WaitUI.js file ---------------------------------------------------------------------------------------------
*/