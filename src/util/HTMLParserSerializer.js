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

import { SVG_NS, NOT_FOUND, ZERO } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@module HTMLParserSerializer
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc Coming soon...
@see {@link theHTMLParserSerializer} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

// also see HTML Sanitizer API

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

function ourValidateUrl ( urlString, attributeName ) {
	let url = null;
	try {
		url = new URL ( urlString );
	}
	catch ( err ) {
		return '';
	}
	let validProtocols = [ 'https:' ];
	if ( 'http:' === ourProtocol ) {
		validProtocols.push ( 'http:' );
	}
	if ( 'href' === attributeName ) {
		validProtocols.push ( 'mailto:' );
	}
	if ( NOT_FOUND !== validProtocols.indexOf ( url.protocol ) ) {
		return url.href;
	}
	return '';
}

function ourCloneNode ( clonedNode, targetNode ) {
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
							let attributeValue = ourValidateUrl (
								currentNode.getAttribute ( validAttributeName ),
								validAttributeName
							);
							if ( '' === attributeValue ) {
								let errorString =
									'An invalid url (' +
									currentNode.getAttribute ( validAttributeName ) +
									')was removed from a ' +
									validAttributeName +
									' attribute';
								console.log ( errorString );
							}
							else {
								newChildNode.setAttribute ( validAttributeName, attributeValue );
							}
						}
						else {
							newChildNode.setAttribute ( validAttributeName, currentNode.getAttribute ( validAttributeName ) );
						}
						currentNode.removeAttribute ( validAttributeName );
					}
				}
			);
			targetNode.appendChild ( newChildNode );
			ourCloneNode ( currentNode, newChildNode );
		}
		else if ( '#text' === nodeName ) {
			targetNode.appendChild ( document.createTextNode ( currentNode.nodeValue ) );
		}
		else {
			console.log ( 'An invalid tag <' + nodeName + '> was removed' );
		}
		if ( currentNode.hasAttributes ) {
			for ( let attCounter = ZERO; attCounter < currentNode.attributes.length; attCounter ++ ) {
				console.log (
					'An unsecure attribute ' +
					currentNode.attributes [ attCounter ].name +
					' 🢂 ' +
					currentNode.attributes [ attCounter ].value +
					' was removed.' );
			}
		}
	}
}

function ourAddHtmlEntities ( htmlString ) {
	let newHtmlString = htmlString
		.replaceAll ( /</g, '&lt;' )
		.replaceAll ( />/g, '&gt;' )
		.replaceAll ( /"/g, '&quot;' )
		.replaceAll ( /\u0027/g, '&apos;' )
		.replaceAll ( /\u0a00/g, '&nbsp;' );

	return newHtmlString;
}

class HTMLParserSerializer {

	validateUrl ( urlString ) {
		return ourValidateUrl ( urlString );
	}

	parse ( htmlString, targetNode ) {
		let result =
			new DOMParser ( ).parseFromString ( '<div>' + htmlString + '</div>', 'text/html' )
				.querySelector ( 'body' ).firstChild;
		ourCloneNode ( result, targetNode );
	}

	verify ( htmlString ) {

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
									let attributeValue = ourValidateUrl (
										currentNode.getAttribute ( validAttributeName ),
										validAttributeName
									);
									if ( '' === attributeValue ) {
										let errorString =
											'An invalid url (' +
											currentNode.getAttribute ( validAttributeName ) +
											')was removed from a ' +
											validAttributeName +
											' attribute';
										console.log ( errorString );
										errorsString += '<p>' + errorString + '</p>';
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
					let errorString = 'An invalid tag ' + nodeName + ' was removed';
					console.log ( errorString );
					errorsString += '<p>' + errorString + '</p>';
				}
				if ( currentNode.hasAttributes ) {
					for ( let attCounter = ZERO; attCounter < currentNode.attributes.length; attCounter ++ ) {
						let errorString =
							'An unsecure attribute ' +
							currentNode.attributes [ attCounter ].name +
							'="' +
							currentNode.attributes [ attCounter ].value +
							'" was removed.';
						console.log ( errorString );
						errorsString += '<p>' + errorString + '</p>';
					}
				}

			}
		}

		let result =
			new DOMParser ( ).parseFromString ( '<div>' + htmlString.replace ( '&nbsp;', '\u0a00' ) + '</div>', 'text/html' )
				.querySelector ( 'body' ).firstChild;
		ourStringify ( result );
		return { htmlString : targetString, errorsString : errorsString };
	}
}

const ourHTMLParserSerializer = Object.freeze ( new HTMLParserSerializer );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of HTMLParserSerializer class
	@type {HTMLParserSerializer}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourHTMLParserSerializer as theHTMLParserSerializer
};

/*
--- End of HTMLParserSerializer.js file ---------------------------------------------------------------------------------------
*/