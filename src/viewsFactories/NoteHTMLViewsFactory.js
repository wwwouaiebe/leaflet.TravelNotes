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

@file NoteHTMLViewsFactory.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module viewsFactories

@------------------------------------------------------------------------------------------------------------------------------
*/

import theHTMLElementsFactory from '../UILib/HTMLElementsFactory.js';
import theHTMLSanitizer from '../coreLib/HTMLSanitizer.js';
import theTranslator from '../UILib/Translator.js';
import theUtilities from '../UILib/Utilities.js';
import theConfig from '../data/Config.js';
import theTravelNotesData from '../data/TravelNotesData.js';

import { ICON_DIMENSIONS, ZERO, ONE } from '../main/Constants.js';

const OUR_LINKS_MAX_LENGTH = 40;
const OUR_MIN_NOTES_DISTANCE = 9;

/**
@------------------------------------------------------------------------------------------------------------------------------

@class NoteHTMLViewsFactory
@classdesc coming soon...
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteHTMLViewsFactory {

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	Gives an HTMLElement with the note icon and sames values than the this.getNoteTextHTML method
	@param {string} classPrefix A string that will be added to all the className of the created HTMLElement
	@param {NoteAndRoute} noteAndRoute A NoteAndRoute object with the note and the route to witch the note is attached
	@return {HTMLElement}
	*/

	getNoteTextAndIconHTML ( classPrefix, noteAndRoute ) {
		let NoteTextAndIconHTML = theHTMLElementsFactory.create (
			'div',
			{
				dataset : { ObjId : noteAndRoute.note.objId }
			}
		);
		let iconHTML = theHTMLElementsFactory.create (
			'div',
			{
				className : classPrefix + ( noteAndRoute.route ? 'Route-ManeuversAndNotes-IconCell' : 'Travel-Notes-IconCell' )
			},
			NoteTextAndIconHTML
		);
		let dimCoeficient = ONE;
		theHTMLSanitizer.sanitizeToHtmlElement ( noteAndRoute.note.iconContent, iconHTML );
		if ( 'TravelNotes-Roadbook-' === classPrefix && iconHTML.firstChild ) {
			if ( 'svg' === iconHTML.firstChild.tagName ) {
				iconHTML.firstChild.setAttributeNS (
					null,
					'viewBox',
					'0 0 ' + ICON_DIMENSIONS.svgViewboxDim + ' ' + ICON_DIMENSIONS.svgViewboxDim
				);
				dimCoeficient = theConfig.note.svgIcon.roadbookFactor;
			}
			else if ( iconHTML.firstChild.classList.contains ( 'TravelNotes-MapNoteCategory-0073' ) ) {
				dimCoeficient = theConfig.note.svgIcon.roadbookFactor;
			}
			iconHTML.setAttribute (
				'tanwidth', String ( noteAndRoute.note.iconWidth * dimCoeficient ) + 'px'
			);
			iconHTML.setAttribute (
				'tanheight', String ( noteAndRoute.note.iconWidth * dimCoeficient ) + 'px'
			);
		}
		else {
			iconHTML.style.width = String ( noteAndRoute.note.iconWidth ) + 'px';
			iconHTML.style.height = String ( noteAndRoute.note.iconHeight ) + 'px';
		}

		let noteTextHTMLElement = this.getNoteTextHTML ( classPrefix, noteAndRoute );
		noteTextHTMLElement.className =
			classPrefix +
			( noteAndRoute.route ? 'Route-ManeuversAndNotes-Cell' : 'Travel-Notes-Cell' );
		NoteTextAndIconHTML.appendChild ( noteTextHTMLElement );

		return NoteTextAndIconHTML;
	}

	/**
	Gives an HTMLElement with the tooltipContent (if any), popupContent (if any) address (if any), phone (if any),
	url (if any), latitude, longitude, distance since the start of the travel (if the note is attached to a chained node),
	distance since the start of the route (if the note is a route note) and distance till the next note(if the note
	is a route note)
	@param {string} classPrefix A string that will be added to all the className of the created HTMLElements
	@param {NoteAndRoute} noteAndRoute A NoteAndRoute object with the note and the route to witch the note is attached
	@return {HTMLElement} an HTMLElement
	*/

	getNoteTextHTML ( classPrefix, noteAndRoute ) {
		let note = noteAndRoute.note;
		let noteHTMLElement = theHTMLElementsFactory.create ( 'div' );
		if ( ZERO !== note.tooltipContent.length ) {
			theHTMLSanitizer.sanitizeToHtmlElement (
				note.tooltipContent,
				theHTMLElementsFactory.create (
					'div',
					{
						className : classPrefix + 'NoteHtml-TooltipContent'
					},
					noteHTMLElement
				)
			);
		}

		if ( ZERO !== note.popupContent.length ) {
			theHTMLSanitizer.sanitizeToHtmlElement (
				note.popupContent,
				theHTMLElementsFactory.create (
					'div',
					{
						className : classPrefix + 'NoteHtml-PopupContent'
					},
					noteHTMLElement
				)
			);
		}

		if ( ZERO !== note.address.length ) {
			theHTMLSanitizer.sanitizeToHtmlElement (
				'<span>' + theTranslator.getText ( 'NoteHTMLViewsFactory - Address' ) + '</span>' +
				'\u00a0:\u00a0' + note.address,
				theHTMLElementsFactory.create (
					'div',
					{
						className : classPrefix + 'NoteHtml-Address'
					},
					noteHTMLElement
				)
			);
		}

		if ( ZERO !== note.url.length ) {
			theHTMLSanitizer.sanitizeToHtmlElement (
				'<span>' + theTranslator.getText ( 'NoteHTMLViewsFactory - Link' ) +
					'</span><a href=' +
					note.url +
					' target="_blank" >' +
					note.url.substr ( ZERO, OUR_LINKS_MAX_LENGTH ) +
					'...</a>',
				theHTMLElementsFactory.create ( 'div', { className : classPrefix + 'NoteHtml-Url' }, noteHTMLElement )
			);
		}

		if ( ZERO !== note.phone.length ) {
			let phoneText = note.phone;
			if ( note.phone.match ( /^\+[0-9, ,*,\u0023]*$/ ) ) {
				let phoneNumber = note.phone.replaceAll ( /\u0020/g, '' );
				let phoneNumberDisplay = note.phone.replaceAll ( /\u0020/g, '\u00a0' );
				phoneText =
					theTranslator.getText ( 'NoteHTMLViewsFactory - Phone' ) + '\u00a0:\u00a0' +
					theTranslator.getText ( 'NoteHTMLViewsFactory - call' ) +
					'<a target="_blank" href="tel:' + phoneNumber + '" >' + phoneNumberDisplay + '</a>' +
					theTranslator.getText ( 'NoteHTMLViewsFactory - Send a sms to' ) +
					'<a target="_blank" href="sms:' + phoneNumber + '" >' + phoneNumberDisplay + '</a>';
			}
			else {
				phoneText = theTranslator.getText ( 'NoteHTMLViewsFactory - Phone' ) + '\u00a0:\u00a0' + note.phone;
			}
			theHTMLSanitizer.sanitizeToHtmlElement (
				phoneText,
				theHTMLElementsFactory.create (
					'div',
					{
						className : classPrefix + 'NoteHtml-Phone'
					},
					noteHTMLElement
				)
			);
		}

		theHTMLSanitizer.sanitizeToHtmlElement (
			theUtilities.formatLatLng ( note.latLng ),
			theHTMLElementsFactory.create (
				'div',
				{
					className : classPrefix + 'NoteHtml-LatLng'
				},
				noteHTMLElement
			)
		);

		if ( noteAndRoute.route ) {
			if ( noteAndRoute.route.chain ) {
				theHTMLSanitizer.sanitizeToHtmlElement (
					'<span>' +
					theTranslator.getText ( 'NoteHTMLViewsFactory - Distance from start of travel' ) +
					'</span>\u00a0:\u00a0' +
					theUtilities.formatDistance ( note.chainedDistance + note.distance ),
					theHTMLElementsFactory.create (
						'div',
						{
							className : classPrefix + 'NoteHtml-Distance'
						},
						noteHTMLElement
					)
				);
			}

			theHTMLSanitizer.sanitizeToHtmlElement (
				'<span>' +
				theTranslator.getText ( 'NoteHTMLViewsFactory - Distance from start of route' ) +
				'</span>\u00a0:\u00a0' +
				theUtilities.formatDistance ( note.distance ),
				theHTMLElementsFactory.create (
					'div',
					{
						className : classPrefix + 'NoteHtml-Distance'
					},
					noteHTMLElement
				)
			);

			let nextNote = noteAndRoute.route.notes.next ( note.objId );
			if ( nextNote ) {
				let nextDistance = nextNote.distance - note.distance;
				if ( OUR_MIN_NOTES_DISTANCE < nextDistance ) {
					theHTMLSanitizer.sanitizeToHtmlElement (
						'<span>' +
						theTranslator.getText ( 'NoteHTMLViewsFactory - Next note after' ) +
						'</span>\u00a0:\u00a0' +
						theUtilities.formatDistance ( nextDistance ),
						theHTMLElementsFactory.create (
							'div',
							{
								className : classPrefix + 'NoteHtml-NextDistance'
							},
							noteHTMLElement
						)
					);
				}
			}
		}
		return noteHTMLElement;
	}

	/**
	Gives an HTMLElement with all the travel notes
	@param {string} classPrefix A string that will be added to all the className of the created HTMLElements
	@return {HTMLElement}
	*/

	getTravelNotesHTML ( classPrefix ) {
		let travelNotesHTML = theHTMLElementsFactory.create ( 'div', { className : classPrefix + 'Travel-Notes' } );
		let travelNotesIterator = theTravelNotesData.travel.notes.iterator;
		while ( ! travelNotesIterator.done ) {
			let noteTextAndIconHTML = this.getNoteTextAndIconHTML (
				classPrefix,
				{ note : travelNotesIterator.value, route : null }
			);
			noteTextAndIconHTML.className = classPrefix + 'Travel-Notes-Row';
			travelNotesHTML.appendChild ( noteTextAndIconHTML );
		}
		return travelNotesHTML;
	}

}

const theNoteHTMLViewsFactory = new NoteHTMLViewsFactory ( );

export default theNoteHTMLViewsFactory;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of NoteHTMLViewsFactory.js file

@------------------------------------------------------------------------------------------------------------------------------
*/