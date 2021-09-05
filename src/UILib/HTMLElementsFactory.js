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
		- Issue ♯65 : Time to go to ES6 modules?
	- v1.12.0:
		- Issue ♯120 : Review the UserInterface
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
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

@module UILib
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@class HTMLElementsFactory
@classdesc ...
@see {@link theHTMLElementsFactory} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class HTMLElementsFactory {

	/**
	#addProperties
	@desc This method add the properties to the created element
	@private
	*/

	#addProperties ( element, properties ) {
		for ( let property in properties ) {
			try {
				if ( 'dataset' === property ) {
					let datasetObject = properties.dataset;
					for ( let valueName in datasetObject ) {
						element.dataset [ 'tan' + valueName ] = datasetObject [ valueName ];
					}
				}
				else {
					element [ property ] = properties [ property ];
				}
			}
			catch ( err ) {
				if ( err instanceof Error ) {
					console.error ( err );
				}
			}
		}
		if ( element.target ) {
			element.rel = 'noopener noreferrer';
		}
	}

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	Create an HTMLElement Object
	@param {string} tagName the tag of the HTMLElement to create
	@param {?object} properties An object with properties to add to the HTMLElement
	@param {?HTMLElement} parentNode The parent node to witch the HTMLElement will be attached
	@return {HTMLElement} the created HTMLElement
	*/

	create ( tagName, properties, parentNode ) {
		let element = null;
		if ( 'text' === tagName.toLowerCase ( ) ) {
			element = document.createTextNode ( properties.value || '' );
		}
		else {
			if ( 'select' === tagName.toLowerCase ( ) ) {
				element = document.createElement ( tagName );
			}
			else {
				element = Object.seal ( document.createElement ( tagName ) );
			}
			if ( properties ) {
				this.#addProperties ( element, properties );
			}
		}
		if ( parentNode ) {
			parentNode.appendChild ( element );
		}
		return element;
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@desc The one and only one instance of HTMLElementsFactory class
@type {HTMLElementsFactory}
@constant
@global

@------------------------------------------------------------------------------------------------------------------------------
*/

const theHTMLElementsFactory = new HTMLElementsFactory ( );

export default theHTMLElementsFactory;

/*
--- End of HTMLElementsFactory.js file ----------------------------------------------------------------------------------------
*/