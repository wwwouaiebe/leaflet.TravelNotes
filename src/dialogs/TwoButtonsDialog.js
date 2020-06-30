/*
Copyright - 2019 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- TwoButtonsDialog.js file ------------------------------------------------------------------------------------------
This file contains:
	- the newTwoButtonsDialog function
Changes:
	- v1.11.0:
		- created
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { newBaseDialog } from '../dialogs/BaseDialog.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';

/*
--- newTwoButtonsDialog function --------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newTwoButtonsDialog ( content ) {

	let myHTMLElementsFactory = newHTMLElementsFactory ( );
	let myTwoButtonsDialog = null;

	/*
	--- myCreateDialog function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateDialog ( ) {

		myTwoButtonsDialog = newBaseDialog ( );
		myTwoButtonsDialog.title = content.title || '';
		if ( content.okButtonContent ) {
			myTwoButtonsDialog.okButton.innerHTML = content.okButtonContent;
		}
		myTwoButtonsDialog.okButton.classList.add ( 'TravelNotes-TwoButtonsDialog-InlineButton' );
		if ( content.secondButtonContent ) {
			let secondButton = myHTMLElementsFactory.create (
				'div',
				{
					innerHTML : content.secondButtonContent,
					className :
						'TravelNotes-BaseDialog-Button TravelNotes-TwoButtonsDialog-InlineButton'
				},
				myTwoButtonsDialog.footer
			);
			secondButton.addEventListener (
				'click',
				( ) => myTwoButtonsDialog.cancelButton.click ( ),
				true
			);
		}
		if ( content.textContent ) {
			myHTMLElementsFactory.create (
				'div',
				{
					id : 'TravelNotes-TwoButtonsDialog-MessageDiv',
					innerHTML : content.textContent
				},
				myTwoButtonsDialog.content
			);
		}
	}

	/*
	--- main function -------------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	myCreateDialog ( );

	return myTwoButtonsDialog;
}

export { newTwoButtonsDialog };

/*
--- End of TwoButtonsDialog.js file -----------------------------------------------------------------------------------
*/