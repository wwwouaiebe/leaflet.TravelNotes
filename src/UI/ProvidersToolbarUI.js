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
	- v1.4.0:
		- created
	- v1.5.0:
		- code review
	- v1.6.0:
		- Issue ♯65 : Time to go to ES6 modules?
		- Issue ♯63 : Find a better solution for provider keys upload
	- v1.7.0:
		- added line and circle icons
		- modified bike, pedestrian and car icons
	- v1.6.0:
		- Issue ♯102 : Sometime the provider toolbar is incomplete at startup
	- v1.12.0:
		- Issue ♯120 : Review the UserInterface
Doc reviewed 20200820
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file ProvidersToolbarUI.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module ProvidersToolbarUI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import { theRouteEditor } from '../core/RouteEditor.js';
import { theHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { ZERO } from '../util/Constants.js';

const OUR_TRANSIT_MODES = [ 'bike', 'pedestrian', 'car', 'train', 'line', 'circle' ];

const OUR_TRANSIT_MODE_IMG = {
	bike :
		'data:image/svg+xml;utf8,<svg viewBox="0 0 20 20" xmlns=' +
		'"http://www.w3.org/2000/svg" > <path fill="rgb(0,0,191)" d="m 11.25,3.125 v 1.09375 l 1.5625,0.9765625 V 6.5625' +
		'H 7.4999999 V 5.625 h 0.625 c 1.25,0 1.25,-1.25 0,-1.25 h -2.5 c -1.25,0 -1.25,1.25 0,1.25 h 0.625 V 6.5625 L 5' +
		'.0781249,8.75 c -0.026125,-5.821e-4 -0.0519,0 -0.078125,0 -2.0153538,0 -3.75,1.734646 -3.75,3.75 0,2.015354 1.7' +
		'346462,3.75 3.75,3.75 2.0153537,0 3.75,-1.734646 3.75,-3.75 0,-0.432461 -0.089462,-0.858226 -0.234375,-1.25 h 0' +
		'.546875 c 0.9375,0 1.1534331,-0.567495 1.4843751,-0.898437 L 12.773438,7.8125 13.4375,9.1015625 C 12.159328,9.7' +
		'073948 11.25,11.031094 11.25,12.5 c 0,2.015354 1.734646,3.75 3.75,3.75 2.015354,0 3.75,-1.734646 3.75,-3.75 0,-' +
		'2.015354 -1.734646,-3.75 -3.75,-3.75 -0.03934,0 -0.07808,-0.00131 -0.117187,0 L 13.75,6.5625 V 4.5703125 Z M 7.' +
		'2265624,7.8125 H 11.132813 L 9.1796874,10 h -1.40625 c -0.0231,0 -0.054487,0.0026 -0.078125,0 C 7.3660586,9.646' +
		'3159 6.9994024,9.3504739 6.5624999,9.140625 6.5471874,9.1173375 6.5373874,9.0856825 6.5234374,9.0625 Z M 4.9999' +
		'999,10 c 1.2571387,0 2.5,1.242862 2.5,2.5 0,1.257139 -1.2428613,2.5 -2.5,2.5 -1.2571388,0 -2.5,-1.242861 -2.5,-' +
		'2.5 0,-1.257138 1.2428612,-2.5 2.5,-2.5 z M 15,10 c 1.257137,0 2.5,1.242862 2.5,2.5 0,1.257139 -1.242863,2.5 -2' +
		'.5,2.5 -1.257139,0 -2.5,-1.242861 -2.5,-2.5 0,-1.257138 1.242861,-2.5 2.5,-2.5 z" /></svg>',
	pedestrian :
		'data:image/svg+xml;utf8,<svg viewBox="0 0 20 20"  xmlns="http://www.w3.org/2000/svg"> <g fill="rgb(0,0,191)" t' +
		'ransform="matrix(0.15866777,0,0,0.12627988,148.47251,-116.69398)"> <path d="m -875.5,962.4 c 2,-1.5 4.6,-2.3 7.' +
		'4,-2.2 3.6,0.3 6.7,2.5 8.4,5.2 l 10.7,21.2 14.5,10.1 c 1.2,1 2,2.5 1.9,4.2 -0.1,2.6 -2.5,4.6 -5.2,4.3 -0.7,0 -1' +
		'.5,-0.3 -2.2,-0.7 l -15.6,-10.7 c -0.4,-0.4 -0.9,-0.9 -1.2,-1.5 l -4.1,-7.9 -4.8,21.1 18.9,22.3 c 0.4,0.7 0.7,1' +
		'.5 0.9,2.2 l 5.1,26.9 c 0,0.6 0,1 0,1.5 -0.3,4.1 -3.8,6.8 -7.7,6.7 -3.2,-0.3 -5.7,-2.6 -6.5,-5.7 l -4.8,-25.1 -' +
		'15.3,-17 -3.6,16.3 c -0.1,0.7 -1.2,2.3 -1.5,2.9 l -14.6,24.9 c -1.5,2.2 -3.9,3.8 -6.7,3.4 -4.1,-0.3 -7,-3.8 -6.' +
		'7,-7.7 0.1,-1.2 0.6,-2.2 1,-3.1 l 13.7,-22.8 11.4,-50.4 -7.4,6 -4.1,18 c -0.4,2.2 -2.6,4.2 -5.1,4.1 -2.6,-0.1 -' +
		'4.6,-2.5 -4.5,-5.2 0,-0.1 0,-0.4 0.1,-0.6 l 4.6,-20.9 c 0.3,-0.9 0.7,-1.6 1.5,-2.2 z" /> <path d="m -884.5,943.' +
		'5 c 1.3,8.6 8.7,15.3 17.8,15.3 5.7,0 10.2,-4.6 10.2,-10.2 0,-5.6 -4.6,-10.2 -10.2,-10.2 -3.9,0 -7.2,2 -8.9,5.2 ' +
		'-0.2,0.4 -0.5,0.7 -0.8,1 -2,2 -5.3,2 -7.3,0 -0.4,-0.4 -0.6,-0.7 -0.8,-1.1 z" /></g></svg>',
	car :
		'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" > <g fill="rgb(0,0,191)"><' +
		'path d="m 2,13 a 1.7142857,1.7142857 0 0 0 1.7142857,1.714286 H 16.285714 A 1.7142857,1.7142857 0 0 0 18,13 V 9' +
		'.5714286 A 1.7142857,1.7142857 0 0 0 16.285714,7.8571429 H 3.7142857 A 1.7142857,1.7142857 0 0 0 2,9.5714286 Z ' +
		'm 1.8285714,-2.285714 a 1.0285714,1.0285714 0 1 1 0,0.01143 z m 10.2857146,0 a 1.0285714,1.0285714 0 1 1 0,0.01' +
		'143 z" /> <path d="M 4.2857143,7.8571429 V 5 A 1.7142857,1.7142857 0 0 1 6,3.2857143 h 8 A 1.7142857,1.7142857 ' +
		'0 0 1 15.714286,5 V 7.8571429 H 14 V 6.1428571 A 1.1428571,1.1428571 0 0 0 12.857143,5 H 7.1428571 A 1.1428571,' +
		'1.1428571 0 0 0 6,6.1428571 v 1.7142858 z" /> <g transform="matrix(1.1428571,0,0,1.1428571,2,2.1428571)"><rect ' +
		'x="1" y="10" width="2" height="3" /><rect x="11" y="10" width="2" height="3" /></g></g></svg>',
	train :
		'data:image/svg+xml;utf8,<svg viewBox="-3 -3 20 20" xmlns="http://www.w3.org/2000/svg"> <g fill="rgb(0,0,191)">' +
		'<path d="M 5,0 C 3.025911,-0.0084 1,3 1,7 l 0,2 c 0,1 1,2 2,2 l 8,0 c 1,0 2,-1 2,-2 L 13,7 C 13,3 11,0 9,0 z m ' +
		'-1,3 6,0 c 0,0 1,1 1,3 L 3.03125,6 C 2.994661,3.9916 4,3 4,3 z M 3,8 6,8 6,9 3,9 z m 5,0 3,0 0,1 -3,0 z m -6,4 ' +
		'-1,2 3,0 1,-2 z m 7,0 1,2 3,0 -1,-2 z"/></g></svg>',
	line :
		'data:image/svg+xml;utf8,<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" > <line x1="5" y1="17" x2=' +
		'"11" y2="2" stroke="rgb(0,0,0)" /> <line x1="3" y1="6" x2="17" y2="9" stroke="rgb(191,0,0)" /> <line x1="3" y1=' +
		'"16" x2="17" y2="5" stroke="rgb(255,204,0)" /> </svg>',
	circle :
		'data:image/svg+xml;utf8,<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" > <g fill="transparent"> <' +
		'circle cx="8" cy="6" r="5" stroke="rgb(0,0,0)" /> <circle cx="12" cy="12" r="4" stroke="rgb(255,204,0)" /> <cir' +
		'cle cx="14" cy="8" r="3" stroke="rgb(191,0,0)" /> </g> </svg>'
};
let ourButtonsDiv = null;
let ourHaveActiveButton = false;
let ourTransitModeButtons = {
	bike : null,
	pedestrian : null,
	car : null,
	train : null,
	line : null,
	circle : null
};

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourSetTransitMode
@desc This method set the transitMode
@param {string} transitMode The transitMode to set. Must be 'bike', 'pedestrian, 'car', 'train', 'line' or 'circle'
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourSetTransitMode ( transitMode ) {
	theTravelNotesData.routing.transitMode = transitMode;
	let activeTransitModeButton =
			document.querySelector ( '.TravelNotes-ProvidersToolbarUI-ActiveTransitModeImgButton' );
	if ( activeTransitModeButton ) {
		activeTransitModeButton.classList.remove ( 'TravelNotes-ProvidersToolbarUI-ActiveTransitModeImgButton' );
	}
	document.querySelector ( '#TravelNotes-ProvidersToolbarUI-' + transitMode + 'ImgButton' )
		.classList.add ( 'TravelNotes-ProvidersToolbarUI-ActiveTransitModeImgButton' );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnTransitModeButtonClick
@desc click event listener on transitMode buttons
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnTransitModeButtonClick ( clickEvent ) {
	clickEvent.stopPropagation ( );
	ourSetTransitMode ( clickEvent.target.transitMode );
	theRouteEditor.startRouting ( );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourSetProvider
@desc This method set the provider
@param {string} providerName The provider name to set.
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourSetProvider ( providerName ) {
	theTravelNotesData.routing.provider = providerName;
	let activeProviderButton = document.querySelector ( '.TravelNotes-ProvidersToolbarUI-ActiveProviderImgButton' );
	if ( activeProviderButton ) {
		activeProviderButton.classList.remove ( 'TravelNotes-ProvidersToolbarUI-ActiveProviderImgButton' );
	}
	document.querySelector ( '#TravelNotes-ProvidersToolbarUI-' + providerName + 'ImgButton' )
		.classList.add ( 'TravelNotes-ProvidersToolbarUI-ActiveProviderImgButton' );

	// activating the transit mode buttons, depending of the capabilities of the provider
	let provider = theTravelNotesData.providers.get ( providerName.toLowerCase ( ) );
	OUR_TRANSIT_MODES.forEach (
		transitMode => {
			if ( provider.transitModes [ transitMode ] ) {
				ourTransitModeButtons [ transitMode ].classList.remove ( 'TravelNotes-ProvidersToolbarUI-InactiveImgButton' );
			}
			else {
				ourTransitModeButtons [ transitMode ].classList.add ( 'TravelNotes-ProvidersToolbarUI-InactiveImgButton' );
			}
		}
	);

	// changing the transitMode if the provider don't have the active transit mode
	if ( ! provider.transitModes [ theTravelNotesData.routing.transitMode ] ) {
		let firstTransitMode = null;
		OUR_TRANSIT_MODES.forEach (
			transitMode => {
				if ( provider.transitModes[ transitMode ] ) {
					firstTransitMode = firstTransitMode || transitMode;
				}
			}
		);
		ourSetTransitMode ( firstTransitMode );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnProviderButtonClick
@desc click event listener on provider buttons
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnProviderButtonClick ( clickEvent ) {
	clickEvent.stopPropagation ( );
	ourSetProvider ( clickEvent.target.provider );
	theRouteEditor.startRouting ( );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourCreateProviderButton
@desc This method create a provider button
@param {Provider} provider The provider for witch the button will be created
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourCreateProviderButton ( provider ) {
	if ( ZERO === provider.providerKey ) {
		return;
	}
	let providerButton = theHTMLElementsFactory.create (
		'img',
		{
			src : provider.icon,
			id : 'TravelNotes-ProvidersToolbarUI-' + provider.name + 'ImgButton',
			className : 'TravelNotes-ProvidersToolbarUI-ImgButton',
			title : provider.title || provider.name,
			provider : provider.name
		},
		ourButtonsDiv
	);
	providerButton.addEventListener ( 'click', ourOnProviderButtonClick, false );

	// when loading the UI, the first provider will be the active provider
	if ( ! ourHaveActiveButton ) {
		providerButton.classList.add ( 'TravelNotes-ProvidersToolbarUI-ActiveProviderImgButton' );
		theTravelNotesData.routing.provider = providerButton.provider;
		ourHaveActiveButton = true;

		// ... and the first possible transit mode will be the active transit mode
		let firstTransitMode = null;
		OUR_TRANSIT_MODES.forEach (
			transitMode => {
				if ( provider.transitModes[ transitMode ] ) {
					firstTransitMode = firstTransitMode || transitMode;
				}
			}
		);
		ourTransitModeButtons [ firstTransitMode ].classList.add (
			'TravelNotes-ProvidersToolbarUI-ActiveTransitModeImgButton'
		);
		theTravelNotesData.routing.transitMode = firstTransitMode;
		OUR_TRANSIT_MODES.forEach (
			transitMode => {
				if ( ! provider.transitModes[ transitMode ] ) {
					ourTransitModeButtons [ transitMode ].classList.add ( 'TravelNotes-ProvidersToolbarUI-InactiveImgButton' );
				}
			}
		);
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourCreateProvidersButtons
@desc This method create the provider buttons
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourCreateProvidersButtons ( ) {
	if ( theTravelNotesData.providers ) {
		ourHaveActiveButton = false;
		theTravelNotesData.providers.forEach ( ourCreateProviderButton );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourCreateTransitModesButtons
@desc This method create the transitModes buttons
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourCreateTransitModesButtons ( ) {
	OUR_TRANSIT_MODES.forEach (
		transitMode => {
			ourTransitModeButtons [ transitMode ] = theHTMLElementsFactory.create (
				'img',
				{
					src : OUR_TRANSIT_MODE_IMG [ transitMode ],
					id : 'TravelNotes-ProvidersToolbarUI-' + transitMode + 'ImgButton',
					className : 'TravelNotes-ProvidersToolbarUI-ImgButton',
					title : theTranslator.getText ( 'ProvidersToolbarUI - ' + transitMode ),
					transitMode : transitMode
				},
				ourButtonsDiv
			);
			ourTransitModeButtons [ transitMode ].addEventListener ( 'click', ourOnTransitModeButtonClick, false );
		}
	);
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class is the provider and transitModes toolbar at the bottom of the UI
@see {@link theProvidersToolbarUI} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class ProvidersToolbarUI {

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	creates the user interface
	@param {HTMLElement} uiMainDiv The HTML element in witch the different elements of the UI have to be created
	*/

	createUI ( uiMainDiv ) {
		ourButtonsDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-FlexRowDiv TravelNotes-ProvidersToolbarUI-ImgButtonsDiv'
			},
			uiMainDiv
		);
		ourCreateTransitModesButtons ( );
		ourCreateProvidersButtons ( );
	}

	/**
	set a provider as the active provider
	@param {string} providerName The name of the provider to activate
	*/

	set provider ( providerName ) {
		ourSetProvider ( providerName );
	}

	/**
	set a transit mode as the active transit mode
	@param {string} transitMode The transit mode to activate
	*/

	set transitMode ( transitMode ) {
		ourSetTransitMode ( transitMode );
	}

	/**
	This method redraw completely the toolbar when a provider is added
	*/

	providersAdded ( ) {
		while ( ourButtonsDiv.firstChild ) {
			ourButtonsDiv.removeChild ( ourButtonsDiv.firstChild );
		}
		ourCreateTransitModesButtons ( );
		ourCreateProvidersButtons ( );
	}
}

const OUR_PROVIDERS_TOOLBAR_UI = new ProvidersToolbarUI ( );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of ProvidersToolbarUI class
	@type {ProvidersToolbarUI}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	OUR_PROVIDERS_TOOLBAR_UI as theProvidersToolbarUI
};

/*
--- End of ProvidersToolbarUI.js file -----------------------------------------------------------------------------------------
*/