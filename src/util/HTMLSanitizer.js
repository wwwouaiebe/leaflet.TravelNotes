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
	- v2.0.0:
		- created
Doc reviewed ...
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file HTMLSanitizer.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@typedef {Object} UrlValidationReult
@desc An object returned by the sanitizeToUrl function
@property {String} url the validated url or an empty string if the url is invalid
@property {String} errorsString an empty string or an error description if the url is invalid
@public

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@typedef {Object} HtmlStringValidationReult
@desc An object returned by the sanitizeToHtmlString function
@property {String} htmlString the validated string
@property {String} errorsString an empty string or an error description if the url is invalid
@public

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module HTMLSanitizer
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { SVG_NS, NOT_FOUND, ZERO } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc Coming soon...
@see {@link theHTMLSanitizer} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

let ourValidityMap = new Map ( );

/*
WARNING :

	never put script as valid tag !!!

	never put event handler starting with on... as valid attribute !!!

*/

ourValidityMap.set ( 'a', [ 'href', 'target' ] );
ourValidityMap.set ( 'br', [ ] );
ourValidityMap.set ( 'div', [ ] );
ourValidityMap.set ( 'del', [ ] );
ourValidityMap.set ( 'em', [ ] );
ourValidityMap.set ( 'figcaption', [ ] );
ourValidityMap.set ( 'figure', [ ] );
ourValidityMap.set ( 'h1', [ ] );
ourValidityMap.set ( 'h2', [ ] );
ourValidityMap.set ( 'h3', [ ] );
ourValidityMap.set ( 'h4', [ ] );
ourValidityMap.set ( 'h5', [ ] );
ourValidityMap.set ( 'h6', [ ] );
ourValidityMap.set ( 'hr', [ ] );
ourValidityMap.set ( 'img', [ 'src', 'alt' ] );
ourValidityMap.set ( 'ins', [ ] );
ourValidityMap.set ( 'li', [ ] );
ourValidityMap.set ( 'mark', [ ] );
ourValidityMap.set ( 'ol', [ ] );
ourValidityMap.set ( 'p', [ ] );
ourValidityMap.set ( 's', [ ] );
ourValidityMap.set ( 'small', [ ] );
ourValidityMap.set ( 'strong', [ ] );
ourValidityMap.set ( 'span', [ ] );
ourValidityMap.set ( 'sub', [ ] );
ourValidityMap.set ( 'sup', [ ] );
ourValidityMap.set ( 'ul', [ ] );

ourValidityMap.set ( 'svg', [ 'xmlns', 'viewBox', 'class' ] );
ourValidityMap.set ( 'text', [ 'x', 'y', 'text-anchor' ] );
ourValidityMap.set ( 'polyline', [ 'points', 'class', 'transform' ] );

const ourProtocol = window.location.protocol;
const ourParser = new DOMParser ( );

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourAddHtmlEntities
@desc replace < >' " and nbsp chars with htmlEntities
@param {string} htmlString the string to transform
@return {string} a string with htmlEntities
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourAddHtmlEntities ( htmlString ) {
	let newHtmlString = htmlString
		.replaceAll ( /</g, '&lt;' )
		.replaceAll ( />/g, '&gt;' )
		.replaceAll ( /"/g, '&quot;' )
		.replaceAll ( /\u0027/g, '&apos;' )
		.replaceAll ( /\u0a00/g, '&nbsp;' );

	return newHtmlString;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourRemoveHtmlEntities
@desc replace htmlEntities with < >' " and nbsp chars
@param {string} htmlString the string to transform
@return {string} a string with htmlEntities replaced
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourRemoveHtmlEntities ( htmlString ) {
	let newHtmlString = htmlString
		.replaceAll ( /&lt;/g, '<' )
		.replaceAll ( /&gt;/g, '>' )
		.replaceAll ( /&amp;/g, '&' )
		.replaceAll ( /&quot;/g, '"' )
		.replaceAll ( /&apos;/g, '\u0027' )
		.replaceAll ( /&nbsp;/g, '\u0a00' );

	return newHtmlString;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourReplaceHtmlEntities
@desc replace htmlEntities and < > ' " and nbsp chars with others similar unicode chars
@param {string} htmlString the string to transform
@return {string} a string with htmlEntities and < >' " and nbsp chars replaced
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourReplaceHtmlEntities ( htmlString ) {
	let newHtmlString = htmlString
		.replaceAll ( /</g, '\u227a' )
		.replaceAll ( />/g, '\u227b' )
		.replaceAll ( /"/g, '\u2033' )
		.replaceAll ( /\u0027/g, '\u2032' )
		.replaceAll ( /&lt;/g, '\u227a' )
		.replaceAll ( /&gt;/g, '\u227b' )
		.replaceAll ( /&quot;/g, '\u2033' )
		.replaceAll ( /&apos;/g, '\u2032' );

	return newHtmlString;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourSanitizeToJsString
@desc remove all html tags and replace htmlEntities and < > ' " and nbsp chars with others similar unicode chars
@param {string} stringToSanitize the string to transform
@return {string} a string with html tags removed and htmlEntities and < >' " and nbsp chars replaced
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourSanitizeToJsString ( stringToSanitize ) {
	let result =
			ourParser.parseFromString ( '<div>' + ourRemoveHtmlEntities ( stringToSanitize ) + '</div>', 'text/html' )
				.querySelector ( 'body' ).firstChild;
	let sanitizedString = '';
	for ( let nodeCounter = 0; nodeCounter < result.childNodes.length; nodeCounter ++ ) {
		if ( '#text' === result.childNodes [ nodeCounter ].nodeName ) {
			sanitizedString += result.childNodes [ nodeCounter ].nodeValue;
		}
	}
	sanitizedString = ourReplaceHtmlEntities ( sanitizedString );

	return sanitizedString;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourSanitizeUrl
@desc this function validate an URL. A valid url must not contains html tags or html entities or invalid characters
and must start with a valid protocol
Valid protocols are for href attribute http:, https: and mailto: and for src attribute https, mailto:
and http (only if the protocol of Travel & Notes is http:)
@param {urlString} the url to validate
@param {attributeName} the attribute name in witch the url will be placed. must be 'src' or
null (in this case 'href' is used as default)
@return {object} a UrlValidationReult with the result of the validation
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourSanitizeUrl ( urlString, attributeName = 'href' ) {
	let result =
			ourParser.parseFromString ( '<div>' + ourRemoveHtmlEntities ( urlString ) + '</div>', 'text/html' )
				.querySelector ( 'body' ).firstChild;
	let newUrlString = '';
	for ( let nodeCounter = 0; nodeCounter < result.childNodes.length; nodeCounter ++ ) {
		if ( '#text' === result.childNodes [ nodeCounter ].nodeName ) {
			newUrlString += result.childNodes [ nodeCounter ].nodeValue;
		}
	}
	if ( newUrlString !== urlString ) {
		return { url : '', errorsString : 'tags found in the url' };
	}
	let validProtocols = [ 'https:' ];
	if ( 'http:' === ourProtocol || 'href' === attributeName ) {
		validProtocols.push ( 'http:' );
	}
	if ( 'href' === attributeName ) {
		validProtocols.push ( 'mailto:' );
		let urlHash = newUrlString.match ( /^#\w*/ );
		if ( urlHash && newUrlString === urlHash [ ZERO ] ) {
			return { url : newUrlString, errorsString : '' };
		}
	}
	let url = null;
	try {
		url = new URL ( newUrlString );
	}
	catch ( err ) {
		return { url : '', errorsString : 'Invalid url string' };
	}
	if ( NOT_FOUND === validProtocols.indexOf ( url.protocol ) ) {
		return { url : '', errorsString : 'Invalid protocol ' + url.protocol };
	}
	try {
		encodeURIComponent ( url.href );
	}
	catch ( err ) {
		return { url : '', errorsString : 'Invalid character in url' };
	}
	if ( NOT_FOUND !== url.href.search ( /[()\u0027*]/g ) ) {
		return { url : '', errorsString : 'Invalid character in url' };
	}

	return { url : url.href, errorsString : '' };
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourSanitizeToHtmlElement
@desc This function transform a string containing html and svg tags into html and svg elements and copy these elements
as child nodes of the targetNode. Only tags and attributes present in the ourValidityMap variable
are copied in the targetNode. Url in the href and src attributes must be valid url (see ourSanitizeUrl method)
@param {string} htmlString the string to transform
@param targetNode {HTMLElement} the node in witch the created elements are placed
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourSanitizeToHtmlElement ( htmlString, targetNode ) {

	function cloneNode ( clonedNode, newNode ) {
		let childs = clonedNode.childNodes;
		for ( let nodeCounter = 0; nodeCounter < childs.length; nodeCounter ++ ) {
			let currentNode = clonedNode.childNodes [ nodeCounter ];
			let nodeName = currentNode.nodeName.toLowerCase ( );
			let validAttributesNames = ourValidityMap.get ( nodeName );
			if ( validAttributesNames ) {
				validAttributesNames = validAttributesNames.concat ( [ 'id', 'class', 'dir', 'title' ] );
				let isSvg = ( 'svg' === nodeName || 'text' === nodeName || 'polyline' === nodeName );
				let newChildNode = isSvg ? document.createElementNS ( SVG_NS, nodeName ) : document.createElement ( nodeName );
				validAttributesNames.forEach (
					validAttributeName => {
						if ( isSvg ) {
							if ( currentNode.hasAttributeNS ( null, validAttributeName ) ) {
								newChildNode.setAttributeNS (
									null,
									validAttributeName,
									currentNode.getAttribute ( validAttributeName )
								);
								currentNode.removeAttributeNS ( null, validAttributeName );
							}
						}
						else if ( currentNode.hasAttribute ( validAttributeName ) ) {
							if ( 'href' === validAttributeName || 'src' === validAttributeName ) {
								let attributeValue = ourSanitizeUrl (
									currentNode.getAttribute ( validAttributeName ),
									validAttributeName
								).url;
								if ( '' !== attributeValue ) {
									newChildNode.setAttribute ( validAttributeName, attributeValue );
								}
							}
							else {
								newChildNode.setAttribute (
									validAttributeName,
									currentNode.getAttribute ( validAttributeName ) );
							}
							currentNode.removeAttribute ( validAttributeName );
						}
					}
				);
				newNode.appendChild ( newChildNode );
				cloneNode ( currentNode, newChildNode );
			}
			else if ( '#text' === nodeName ) {
				newNode.appendChild ( document.createTextNode ( currentNode.nodeValue ) );
			}
		}
	}

	let result =
		ourParser.parseFromString ( '<div>' + htmlString + '</div>', 'text/html' )
			.querySelector ( 'body' ).firstChild;
	cloneNode ( result, targetNode );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourSanitizeToHtmlString
@desc This function transform a string containing html and svg tags. Tags and attributes not present in the ourValidityMap
variable are removed. Invalid Url in the href and src attributes are also removed (see ourSanitizeUrl method)
@param {string} htmlString the string to transform
@return {object} a HtmlStringValidationReult with the result of the validation
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourSanitizeToHtmlString ( htmlString ) {

	let targetString = '';
	let errorsString = '';

	function ourStringify ( sourceNode ) {
		let childs = sourceNode.childNodes;
		for ( let nodeCounter = 0; nodeCounter < childs.length; nodeCounter ++ ) {
			let currentNode = sourceNode.childNodes [ nodeCounter ];
			let nodeName = currentNode.nodeName.toLowerCase ( );
			let validAttributesNames = ourValidityMap.get ( nodeName );
			if ( validAttributesNames ) {
				validAttributesNames = validAttributesNames.concat ( [ 'id', 'class', 'dir', 'title' ] );
				let isSvg = ( 'svg' === nodeName || 'text' === nodeName || 'polyline' === nodeName );
				targetString += '<' + nodeName;
				validAttributesNames.forEach (
					validAttributeName => {
						if ( isSvg ) {
							if ( currentNode.hasAttributeNS ( null, validAttributeName ) ) {
								targetString += ' ' + validAttributeName + '="' +
									ourAddHtmlEntities ( currentNode.getAttribute ( validAttributeName ) ) +
									'"';
								currentNode.removeAttribute ( validAttributeName );
							}
						}
						else if ( currentNode.hasAttribute ( validAttributeName ) ) {
							if ( 'href' === validAttributeName || 'src' === validAttributeName ) {
								let attributeValue = ourSanitizeUrl (
									currentNode.getAttribute ( validAttributeName ),
									validAttributeName
								).url;
								if ( '' === attributeValue ) {
									errorsString +=
										'\nAn invalid url (' +
										currentNode.getAttribute ( validAttributeName ) +
										') was removed from a ' +
										validAttributeName +
										' attribute';
								}
								else {
									targetString += ' ' + validAttributeName + '="' + attributeValue + '"';
								}
								currentNode.removeAttribute ( validAttributeName );
							}
							else {
								targetString += ' ' + validAttributeName + '="' +
								ourAddHtmlEntities ( currentNode.getAttribute ( validAttributeName ) ) +
								'"';
								currentNode.removeAttribute ( validAttributeName );
							}
						}
					}
				);
				targetString += '>';
				ourStringify ( currentNode );
				targetString += '</' + nodeName + '>';
			}
			else if ( '#text' === nodeName ) {
				targetString += ourAddHtmlEntities ( currentNode.nodeValue );
			}
			else {
				errorsString += '\nAn invalid tag ' + nodeName + ' was removed';
			}
			if ( currentNode.hasAttributes ) {
				for ( let attCounter = ZERO; attCounter < currentNode.attributes.length; attCounter ++ ) {
					errorsString +=
						'\nAn unsecure attribute ' +
						currentNode.attributes [ attCounter ].name +
						'="' +
						currentNode.attributes [ attCounter ].value +
						'" was removed.';
				}
			}

		}
	}

	let result =
		ourParser.parseFromString ( '<div>' + htmlString.replace ( '&nbsp;', '\u0a00' ) + '</div>', 'text/html' )
			.querySelector ( 'body' ).firstChild;
	ourStringify ( result );
	return { htmlString : targetString, errorsString : errorsString };
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class contains methods to sanitize url and string, filtering html tags and attributes
present in the string.
@see {@link theHTMLSanitizer} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class HTMLSanitizer {

	/**
	This method verify that a string describe a css color. A valid css color must start with a # followed by 6 hex numbers
	@param {string} colorString the string to test
	@return {string} the verified color or null if the given color is invalid
	*/

	sanitizeToColor ( colorString ) {
		let newColor = colorString.match ( /^#[0-9,A-F,a-f]{6}$/ );
		if ( newColor ) {
			return newColor [ ZERO ];
		}
		return null;
	}

	/**
	This method verify that a string contains a valid url.
	A valid url must not contains html tags or html entities or invalid characters
	and must start with a valid protocol
	Valid protocols are http:, https: and mailto:.
	@param {string} urlString the url to validate
	@return {object} a UrlValidationReult with the result of the validation
	*/

	sanitizeToUrl ( urlString ) {
		return ourSanitizeUrl ( urlString );
	}

	/**
	Remove all html tags from a string and replace htmlEntities and < > ' " and nbsp chars with others similar unicode chars
	@param {string} stringToSanitize the string to transform
	@return {string} a string with html tags removed and htmlEntities and < >' " and nbsp chars replaced
	*/

	sanitizeToJsString ( stringToSanitize ) {
		return ourSanitizeToJsString ( stringToSanitize );
	}

	/**
	This function transform a string containing html and svg tags into html and svg elements and copy these elements
	as child nodes of the targetNode. Only tags and attributes present in the ourValidityMap variable
	are copied in the targetNode. Url in the href and src attributes must be valid url (see ourSanitizeUrl method)
	@param {string} htmlString the string to transform
	@param targetNode {HTMLElement} the node in witch the created elements are placed
	*/

	sanitizeToHtmlElement ( htmlString, targetNode ) { ourSanitizeToHtmlElement ( htmlString, targetNode );	}

	/**
	This function transform a string containing html and svg tags. Tags and attributes not present in the ourValidityMap
	variable are removed. Invalid Url in the href and src attributes are also removed (see ourSanitizeUrl method)
	@param {string} htmlString the string to transform
	@return {object} a HtmlStringValidationReult with the result of the validation
	*/

	sanitizeToHtmlString ( htmlString ) { return ourSanitizeToHtmlString ( htmlString ); }
}

const ourHTMLSanitizer = Object.freeze ( new HTMLSanitizer );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of HTMLSanitizer class
	@type {HTMLSanitizer}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourHTMLSanitizer as theHTMLSanitizer
};

/*
--- End of HTMLSanitizer.js file ----------------------------------------------------------------------------------------------
*/