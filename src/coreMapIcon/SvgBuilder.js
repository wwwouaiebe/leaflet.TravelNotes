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

@file SvgBuilder.js
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
import theGeometry from '../coreLib/Geometry.js';
import { SVG_NS, ICON_DIMENSIONS, ZERO, ONE, TWO, NOT_FOUND } from '../main/Constants.js';

/**
@--------------------------------------------------------------------------------------------------------------------------

@class SvgBuilder
@classdesc This class is used to create  the svg for a map icon
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class SvgBuilder {

	#route = null;
	#overpassAPIDataLoader = null;
	#MapIconData = null;

	#svgElement = null;

	/**
	This method creates the svgElement
	@private
	*/

	#createSvg ( ) {

		const FOUR = 4;
		this.#svgElement = document.createElementNS ( SVG_NS, 'svg' );
		this.#svgElement.setAttributeNS (
			null,
			'viewBox',
			String ( ICON_DIMENSIONS.svgViewboxDim / FOUR ) + ' ' +
			( ICON_DIMENSIONS.svgViewboxDim / FOUR ) + ' ' +
			( ICON_DIMENSIONS.svgViewboxDim / TWO ) + ' ' +
			( ICON_DIMENSIONS.svgViewboxDim / TWO )
		);
		this.#svgElement.setAttributeNS ( null, 'class', 'TravelNotes-SvgIcon' );
	}

	/**
	This method create the SVG polyline for the route
	@private
	*/

	#createRoute ( ) {

		// to avoid a big svg, all points outside the svg viewBox are not added
		let index = -ONE;
		let firstPointIndex = NOT_FOUND;
		let lastPointIndex = NOT_FOUND;
		let points = [];
		this.#route.itinerary.itineraryPoints.forEach (
			itineraryPoint => {
				index ++;
				let point = theGeometry.addPoints (
					theGeometry.project ( itineraryPoint.latLng, theConfig.note.svgIcon.zoom ),
					this.#MapIconData.translation
				);
				points.push ( point );
				let pointIsInside =
					point [ ZERO ] >= ZERO && point [ ONE ] >= ZERO
					&&
					point [ ZERO ] <= ICON_DIMENSIONS.svgViewboxDim
					&&
					point [ ONE ] <= ICON_DIMENSIONS.svgViewboxDim;
				if ( pointIsInside ) {
					if ( NOT_FOUND === firstPointIndex ) {
						firstPointIndex = index;
					}
					lastPointIndex = index;
				}
			}
		);
		if ( NOT_FOUND !== firstPointIndex && NOT_FOUND !== lastPointIndex ) {
			if ( ZERO < firstPointIndex ) {
				firstPointIndex --;
			}
			if ( this.#route.itinerary.itineraryPoints.length - ONE > lastPointIndex ) {
				lastPointIndex ++;
			}
			let pointsAttribute = '';
			for ( index = firstPointIndex; index <= lastPointIndex; index ++ ) {
				pointsAttribute += points[ index ] [ ZERO ].toFixed ( ZERO ) + ',' +
					points[ index ] [ ONE ].toFixed ( ZERO ) + ' ';
			}
			let polyline = document.createElementNS ( SVG_NS, 'polyline' );
			polyline.setAttributeNS ( null, 'points', pointsAttribute );
			polyline.setAttributeNS ( null, 'class', 'TravelNotes-OSM-Itinerary' );
			polyline.setAttributeNS (
				null,
				'transform',
				'rotate(' + this.#MapIconData.rotation +
					',' + ( ICON_DIMENSIONS.svgViewboxDim / TWO ) +
					',' + ( ICON_DIMENSIONS.svgViewboxDim / TWO )
					+ ')'
			);
			this.#svgElement.appendChild ( polyline );
		}
	}

	/**
	This method creates the SVG elements for ways from OSM
	@private
	*/

	#createWays ( ) {

		// to avoid a big svg, all points outside the svg viewBox are not added
		this.#overpassAPIDataLoader.ways.forEach (
			way => {
				let firstPointIndex = NOT_FOUND;
				let lastPointIndex = NOT_FOUND;
				let index = -ONE;
				let points = [ ];
				way.nodes.forEach (
					nodeId => {
						index ++;
						let node = this.#overpassAPIDataLoader.nodes.get ( nodeId );
						let point = theGeometry.addPoints (
							theGeometry.project ( [ node.lat, node.lon ], theConfig.note.svgIcon.zoom ),
							this.#MapIconData.translation
						);
						points.push ( point );
						let pointIsInside =
							point [ ZERO ] >= ZERO
							&&
							point [ ONE ] >= ZERO
							&&
							point [ ZERO ] <= ICON_DIMENSIONS.svgViewboxDim
							&&
							point [ ONE ] <= ICON_DIMENSIONS.svgViewboxDim;
						if ( pointIsInside ) {
							if ( NOT_FOUND === firstPointIndex ) {
								firstPointIndex = index;
							}
							lastPointIndex = index;
						}
					}
				);
				if ( NOT_FOUND !== firstPointIndex && NOT_FOUND !== lastPointIndex ) {
					if ( ZERO < firstPointIndex ) {
						firstPointIndex --;
					}
					if ( way.nodes.length - ONE > lastPointIndex ) {
						lastPointIndex ++;
					}
					let pointsAttribute = '';
					for ( index = firstPointIndex; index <= lastPointIndex; index ++ ) {
						pointsAttribute +=
							points[ index ] [ ZERO ].toFixed ( ZERO ) + ',' +
							points[ index ] [ ONE ].toFixed ( ZERO ) + ' ';
					}

					let polyline = document.createElementNS ( SVG_NS, 'polyline' );
					polyline.setAttributeNS ( null, 'points', pointsAttribute );
					polyline.setAttributeNS (
						null,
						'class',
						'TravelNotes-OSM-Highway TravelNotes-OSM-Highway-' + way.tags.highway
					);
					polyline.setAttributeNS (
						null,
						'transform',
						'rotate(' + this.#MapIconData.rotation +
							',' + ( ICON_DIMENSIONS.svgViewboxDim / TWO ) +
							',' + ( ICON_DIMENSIONS.svgViewboxDim / TWO ) +
							')'
					);

					this.#svgElement.appendChild ( polyline );
				}
			}
		);
	}

	/**
	This method creates the SVG element for RcnRef from OSM
	@private
	*/

	#createRcnRef ( ) {

		const Y_TEXT = 0.6;
		if ( '' === this.#MapIconData.rcnRef ) {
			return;
		}
		let svgText = document.createElementNS ( SVG_NS, 'text' );
		svgText.textContent = this.#MapIconData.rcnRef;
		svgText.setAttributeNS ( null, 'x', String ( ICON_DIMENSIONS.svgViewboxDim / TWO ) );
		svgText.setAttributeNS ( null, 'y', String ( ICON_DIMENSIONS.svgViewboxDim * Y_TEXT ) );
		svgText.setAttributeNS ( null, 'class', 'TravelNotes-OSM-RcnRef' );
		this.#svgElement.appendChild ( svgText );
	}

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	This method build the SVG element for the icon
	@private
	*/

	buildSvg ( route, overpassAPIDataLoader, MapIconData ) {

		this.#route = route;
		this.#overpassAPIDataLoader = overpassAPIDataLoader;
		this.#MapIconData = MapIconData;

		this.#createSvg ( );
		this.#createRoute ( );
		this.#createWays ( );
		this.#createRcnRef ( );

		return this.#svgElement;
	}
}

export default SvgBuilder;

/*
--- End of SvgBuilder.js file ------------------------------------------------------------------------------------------
*/