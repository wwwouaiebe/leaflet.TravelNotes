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
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file SelectDialog.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module dialogs
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import BaseDialog from '../dialogBase/BaseDialog.js';
import theHTMLElementsFactory from '../UILib/HTMLElementsFactory.js';
import { ZERO } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class SelectDialog
@classdesc Simple dialog with a text and a select element
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class SelectDialog extends BaseDialog {

	#options = null;
	#selectHtmlElement = null;

	get #selectDiv ( ) {
		let selectDiv = theHTMLElementsFactory.create ( 'div' );
		this.#selectHtmlElement = theHTMLElementsFactory.create ( 'select', null, selectDiv );
		this.#options.selectOptionsData.forEach (
			optionData => theHTMLElementsFactory.create (
				'option',
				{
					text : optionData.text
				},
				this.#selectHtmlElement
			)
		);
		this.#selectHtmlElement.selectedIndex = ZERO;
		return selectDiv;
	}

	/*
	constructor
	*/

	constructor ( options = {} ) {
		super ( options );
		this.#options = options;
	}

	/**
	Get the title of the dialog. Can be overloaded in the derived classes
	@readonly
	*/

	get title ( ) { return this.#options.title || ''; }

	/**
	Get an array with the HTMLElements that have to be added in the content of the dialog.
	Can be overloaded in the derived classes
	@readonly
	*/

	get contentHTMLElements ( ) {
		return [
			theHTMLElementsFactory.create (
				'div',
				{
					textContent : this.#options.text || ''
				}
			),
			this.#selectDiv
		];
	}

	/**
	Overload of the BaseDialog.onOk ( ) method.
	@return the password encoded with TextEncoder
	*/

	onOk ( ) {
		super.onOk ( this.#options.selectOptionsData [ this.#selectHtmlElement.selectedIndex ].objId );
	}

}

export default SelectDialog;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of SelectDialog.js file

@------------------------------------------------------------------------------------------------------------------------------
*/