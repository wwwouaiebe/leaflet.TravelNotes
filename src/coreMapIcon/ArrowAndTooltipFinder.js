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

@file ArrowAndTooltipFinder.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module coreMapIcon
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theConfig from '../data/Config.js';
import theTranslator from '../UILib/Translator.js';

import { ICON_POSITION } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class ArrowAndTooltipFinder
@classdesc Search:
- the arrow to use for the direction to follow
- the tooltip content
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class ArrowAndTooltipFinder {

	#computeData = null;
	#mapIconData = null;

	/*
	constructor
	*/

	constructor ( computeData, mapIconData ) {
		this.#computeData = computeData;
		this.#mapIconData = mapIconData;
		Object.freeze ( this );
	}

	/**
	This method set the direction arrow and tooltip
	*/

	findData ( ) {
		if ( null !== this.#computeData.direction ) {
			if ( this.#computeData.direction < theConfig.note.svgIcon.angleDirection.right ) {
				this.#mapIconData.tooltip = theTranslator.getText ( 'MapIconDataBuilder - Turn right' );
				this.#computeData.directionArrow = '🢂';
			}
			else if ( this.#computeData.direction < theConfig.note.svgIcon.angleDirection.slightRight ) {
				this.#mapIconData.tooltip = theTranslator.getText ( 'MapIconDataBuilder - Turn slight right' );
				this.#computeData.directionArrow = '🢅';
			}
			else if ( this.#computeData.direction < theConfig.note.svgIcon.angleDirection.continue ) {
				this.#mapIconData.tooltip = theTranslator.getText ( 'MapIconDataBuilder - Continue' );
				this.#computeData.directionArrow = '🢁';
			}
			else if ( this.#computeData.direction < theConfig.note.svgIcon.angleDirection.slightLeft ) {
				this.#mapIconData.tooltip = theTranslator.getText ( 'MapIconDataBuilder - Turn slight left' );
				this.#computeData.directionArrow = '🢄';
			}
			else if ( this.#computeData.direction < theConfig.note.svgIcon.angleDirection.left ) {
				this.#mapIconData.tooltip = theTranslator.getText ( 'MapIconDataBuilder - Turn left' );
				this.#computeData.directionArrow = '🢀';
			}
			else if ( this.#computeData.direction < theConfig.note.svgIcon.angleDirection.sharpLeft ) {
				this.#mapIconData.tooltip = theTranslator.getText ( 'MapIconDataBuilder - Turn sharp left' );
				this.#computeData.directionArrow = '🢇';
			}
			else if ( this.#computeData.direction < theConfig.note.svgIcon.angleDirection.sharpRight ) {
				this.#mapIconData.tooltip = theTranslator.getText ( 'MapIconDataBuilder - Turn sharp right' );
				this.#computeData.directionArrow = '🢆';
			}
			else {
				this.#mapIconData.tooltip = theTranslator.getText ( 'MapIconDataBuilder - Turn right' );
				this.#computeData.directionArrow = '🢂';
			}
		}

		if ( ICON_POSITION.atStart === this.#computeData.positionOnRoute ) {
			this.#mapIconData.tooltip = theTranslator.getText ( 'MapIconDataBuilder - Start' );
		}
		else if ( ICON_POSITION.atEnd === this.#computeData.positionOnRoute ) {
			this.#mapIconData.tooltip = theTranslator.getText ( 'MapIconDataBuilder - Stop' );
		}
	}
}

export default ArrowAndTooltipFinder;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of ArrowAndTooltipFinder.js file

@------------------------------------------------------------------------------------------------------------------------------
*/