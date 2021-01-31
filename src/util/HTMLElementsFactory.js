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
	- v1.0.0:
		- created
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
	- v1.12.0:
		- Issue #120 : Review the UserInterface
Doc reviewed 20200846
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file HTMLElementsFactory.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module HTMLElementsFactory
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourAddProperties
@desc This method add the properties to the created element
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourAddProperties ( element, properties ) {
	for ( let property in properties ) {
		try {
			element [ property ] = properties [ property ];
		}
		catch ( err ) {
			if ( err instanceof Error ) {
				console.error ( err );
			}
		}
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc Wrapper for function for creation of html elements
@see {@link theHTMLElementsFactory} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class HTMLElementsFactory {
	constructor ( ) {
		Object.freeze ( this );
	}

	create ( tagName, properties, parentNode ) {
		let element = null;
		if ( 'text' === tagName.toLowerCase ( ) ) {
			element = document.createTextNode ( properties.value || '' );
		}
		else {
			element = document.createElement ( tagName );
			if ( properties ) {
				ourAddProperties ( element, properties );
			}
		}
		if ( parentNode ) {
			parentNode.appendChild ( element );
		}
		return element;
	}
}

const OUR_HTML_ELEMENTS_FACTORY = new HTMLElementsFactory ( );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of HTMLElementsFactory class
	@type {HTMLElementsFactory}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	OUR_HTML_ELEMENTS_FACTORY as theHTMLElementsFactory
};

/*
--- End of HTMLElementsFactory.js file ----------------------------------------------------------------------------------------
*/