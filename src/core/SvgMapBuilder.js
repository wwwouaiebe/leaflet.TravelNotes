import theConfig from '../data/Config.js';
import { theGeometry } from '../util/Geometry.js';
import { SVG_NS, ICON_DIMENSIONS, ZERO, ONE, TWO, NOT_FOUND } from '../util/Constants.js';

class SvgMapBuilder {
	#route = null;
	#svgElement = null;
	#svgZoom = theConfig.note.svgIcon.zoom;
	#overpassAPIDataLoader = null;
	#MapIconData = null;

	/**
	This function creates the SVG
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
					theGeometry.project ( itineraryPoint.latLng, this.#svgZoom ),
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
	This method creates the ways from OSM
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
							theGeometry.project ( [ node.lat, node.lon ], this.#svgZoom ),
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
	This method creates the RcnRef from OSM
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

	constructor ( ) {
		Object.freeze ( this );
	}

	buildSvg ( route, overpassAPIDataLoader, MapIconData ) {
		this.#overpassAPIDataLoader = overpassAPIDataLoader;
		this.#route = route;
		this.#MapIconData = MapIconData;
		this.#createSvg ( );
		this.#createRoute ( );
		this.#createWays ( );
		this.#createRcnRef ( );

		return this.#svgElement;
	}
}

export default SvgMapBuilder;