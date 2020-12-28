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
	- v1.14.0:
		- created
Doc reviewed ...
Tests ...
*/

import { SVG_NS } from '../util/Constants.js';

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

let ourValidityMap = new Map ( );
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
						}
					}
					else if ( currentNode.hasAttribute ( validAttributeName ) ) {
						newChildNode.setAttribute ( validAttributeName, currentNode.getAttribute ( validAttributeName ) );
					}
				}
			);
			targetNode.appendChild ( newChildNode );
			ourCloneNode ( currentNode, newChildNode );
		}
		else if ( '#text' === nodeName ) {
			targetNode.appendChild ( document.createTextNode ( currentNode.nodeValue ) );
		}
	}
}

class HTMLParserSerializer {

	parse ( htmlString, targetNode ) {
		let result =
			new DOMParser ( ).parseFromString ( '<div>' + htmlString + '</div>', 'text/html' )
				.querySelector ( 'body' ).firstChild;
		ourCloneNode ( result, targetNode );
	}

	stringify ( /* node*/ ) {
	}

	verify ( /* htmlString*/ ) {
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