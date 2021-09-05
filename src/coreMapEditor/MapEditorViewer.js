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
	- v1.6.0:
		- created from MapEditor
	- v1.8.0:
		- Issue ♯97 : Improve adding a new waypoint to a route
	- v1.12.0:
		- Issue ♯120 : Review the UserInterface
	- v2.0.0:
		- Issue ♯142 : Transform the typedef layer to a class as specified in the layersToolbarUI.js
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file MapEditorViewer.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@typedef {Object} NoteLeafletObjects
@desc An object with all the Leaflet objects for a note
@property {Object} marker The marker of the note
@property {Object} polyline The polyline of the note
@property {Object} bullet The bullet of the note (= a Leaflet marker)

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module coreMapEditor
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theConfig from '../data/Config.js';
import theDataSearchEngine from '../data/DataSearchEngine.js';
import theGeometry from '../coreLib/Geometry.js';
import theUtilities from '../UILib/Utilities.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import theRouteHTMLViewsFactory from '../viewsFactories/RouteHTMLViewsFactory.js';
import theNoteHTMLViewsFactory from '../viewsFactories/NoteHTMLViewsFactory.js';
import { RouteMouseOverOrMoveEL } from '../coreMapEditor/RouteEventListeners.js';
import theHTMLSanitizer from '../coreLib/HTMLSanitizer.js';

import { GEOLOCATION_STATUS, ROUTE_EDITION_STATUS, ZERO, ONE, TWO } from '../main/Constants.js';

const OUR_DEFAULT_MAX_ZOOM = 18;
const OUR_DEFAULT_MIN_ZOOM = 0;
const OUR_NOTE_Z_INDEX_OFFSET = 100;

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class performs all the readonly updates on the map
@see {@link theMapEditor} for read/write updates on the map
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class MapEditorViewer {

	#currentLayer = null;

	#geolocationCircle = null;

	/**
	This method compute the dashArray to use for a route
	@param {Route} route The route for witch the dashArray must be computed
	@return {string} the dashArray to use for the route
	@private
	*/

	#getDashArray ( route ) {
		if ( route.dashArray >= theConfig.route.dashChoices.length ) {
			route.dashArray = ZERO;
		}
		let iDashArray = theConfig.route.dashChoices [ route.dashArray ].iDashArray;
		if ( iDashArray ) {
			let dashArray = '';
			let dashCounter = ZERO;
			for ( dashCounter = ZERO; dashCounter < iDashArray.length - ONE; dashCounter ++ ) {
				dashArray += ( iDashArray [ dashCounter ] * route.width ) + ',';
			}
			dashArray += iDashArray [ dashCounter ] * route.width;

			return dashArray;
		}
		return null;
	}

	/**
	Add a Note to the map
	@param {!number} objId The objId of the note to add
	@return {NoteLeafletObjects} An object with a reference to the Leaflet objects of the note
	@private
	*/

	#addNote ( noteObjId ) {

		let note = theDataSearchEngine.getNoteAndRoute ( noteObjId ).note;

		// first a marker is created at the note position. This marker is empty and transparent, so
		// not visible on the map but the marker can be dragged
		let bullet = window.L.marker (
			note.latLng,
			{
				icon : window.L.divIcon (
					{
						iconSize : [ theConfig.note.grip.size, theConfig.note.grip.size ],
						iconAnchor : [ theConfig.note.grip.size / TWO, theConfig.note.grip.size / TWO ],
						html : '<div></div>',
						className : 'TravelNotes-Map-Note-Bullet'
					}
				),
				opacity : theConfig.note.grip.opacity,
				draggable : ! theTravelNotesData.travel.readOnly
			}
		);
		bullet.objId = note.objId;

		// a second marker is now created. The icon created by the user is used for this marker
		let icon = window.L.divIcon (
			{
				iconSize : [ note.iconWidth, note.iconHeight ],
				iconAnchor : [ note.iconWidth / TWO, note.iconHeight / TWO ],
				popupAnchor : [ ZERO, -note.iconHeight / TWO ],
				html : note.iconContent,
				className : 'TravelNotes-Map-AllNotes '
			}
		);

		let marker = window.L.marker (
			note.iconLatLng,
			{
				zIndexOffset : OUR_NOTE_Z_INDEX_OFFSET,
				icon : icon,
				draggable : ! theTravelNotesData.travel.readOnly
			}
		);
		marker.objId = note.objId;

		// a popup is binded to the the marker...
		marker.bindPopup (
			layer => theHTMLSanitizer.clone (
				theNoteHTMLViewsFactory.getNoteTextHTML (
					'TravelNotes-Map-',
					theDataSearchEngine.getNoteAndRoute ( layer.objId )
				)
			)
		);

		// ... and also a tooltip
		if ( ZERO !== note.tooltipContent.length ) {
			marker.bindTooltip (
				layer => theDataSearchEngine.getNoteAndRoute ( layer.objId ).note.tooltipContent
			);
			marker.getTooltip ( ).options.offset [ ZERO ] = note.iconWidth / TWO;
		}

		// Finally a polyline is created between the 2 markers
		let polyline = window.L.polyline ( [ note.latLng, note.iconLatLng ], theConfig.note.polyline );
		polyline.objId = note.objId;

		// The 3 objects are added to a layerGroup
		let layerGroup = window.L.layerGroup ( [ marker, polyline, bullet ] );
		layerGroup.markerId = window.L.Util.stamp ( marker );
		layerGroup.polylineId = window.L.Util.stamp ( polyline );
		layerGroup.bulletId = window.L.Util.stamp ( bullet );

		// and the layerGroup added to the leaflet map and JavaScript map
		this.addToMap ( note.objId, layerGroup );

		if ( theConfig.note.haveBackground ) {
			document.querySelectorAll ( '.TravelNotes-MapNote,.TravelNotes-SvgIcon' ).forEach (
				noteIcon => noteIcon.classList.add ( 'TravelNotes-Map-Note-Background' )
			);
		}
		return Object.freeze ( { marker : marker, polyline : polyline, bullet : bullet } );
	}

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	Add a Leaflet object to the map
	@param {!number} objId The objId to use
	@param {Object} leafletObject The Leaflet object to add
	@private
	*/

	addToMap ( objId, leafletObject ) {
		leafletObject.objId = objId;
		leafletObject.addTo ( theTravelNotesData.map );
		theTravelNotesData.mapObjects.set ( objId, leafletObject );
	}

	/**
	This method add a route on the map
	This method is called by the 'routeupdated' event listener of the viewer
	and by the MapEditor.updateRoute( ) method
	@param {!number} routeObjId The objId of the route to add
	@return {Route} the added Route
	@listens routeupdated
	*/

	addRoute ( routeObjId ) {
		let route = theDataSearchEngine.getRoute ( routeObjId );

		// an array of points is created
		let latLng = [];
		let pointsIterator = route.itinerary.itineraryPoints.iterator;
		while ( ! pointsIterator.done ) {
			latLng.push ( pointsIterator.value.latLng );
		}

		// the leaflet polyline is created and added to the map
		let polyline = window.L.polyline (
			latLng,
			{
				color : route.color,
				weight : route.width,
				dashArray : this.#getDashArray ( route )
			}
		);
		this.addToMap ( route.objId, polyline );

		// tooltip and popup are created
		if ( ROUTE_EDITION_STATUS.notEdited === route.editionStatus ) {
			polyline.bindTooltip (
				route.computedName,
				{ sticky : true, direction : 'right' }
			);
			window.L.DomEvent.on ( polyline, 'mouseover', RouteMouseOverOrMoveEL.handleEvent );
			window.L.DomEvent.on ( polyline, 'mousemove', RouteMouseOverOrMoveEL.handleEvent );
		}

		polyline.bindPopup (
			layer => theHTMLSanitizer.clone (
				theRouteHTMLViewsFactory.getRouteHeaderHTML (
					'TravelNotes-Map-',
					theDataSearchEngine.getRoute ( layer.objId )
				)
			)
		);

		// left click event
		window.L.DomEvent.on ( polyline, 'click', clickEvent => clickEvent.target.openPopup ( clickEvent.latlng ) );

		// notes are added
		let notesIterator = route.notes.iterator;
		while ( ! notesIterator.done ) {
			this.#addNote ( notesIterator.value.objId );
		}

		return route;
	}

	/**
	This method add a note on the map
	This method is called by the 'noteupdated' event listener of the viewer
	and indirectly by the MapEditor.updateNote( ) method
	@param {!number} noteObjId The objId of the note to add
	@return {NoteLeafletObjects} An object with a reference to the Leaflet objects of the note
	@listens noteupdated
	*/

	addNote ( noteObjId ) { return this.#addNote ( noteObjId ); }

	/**
	This method compute the dashArray to use for a route
	@param {Route} route The route for witch the dashArray must be computed
	@return {string} the dashArray to use for the route
	*/

	getDashArray ( route ) { return this.#getDashArray ( route ); }

	/**
	This method zoom to a point or an array of points
	@param {Array.<number>} latLng the point
	@param {Array.<Array.<Array.<number>>>} geometry the array of points...
	@listens zoomto
	*/

	zoomTo ( latLng, geometry ) {
		if ( geometry ) {
			let latLngs = [];
			geometry.forEach ( geometryPart => latLngs = latLngs.concat ( geometryPart ) );
			theTravelNotesData.map.fitBounds ( theGeometry.getLatLngBounds ( latLngs ) );
		}
		else {
			theTravelNotesData.map.setView ( latLng, theConfig.itineraryPoint.zoomFactor );
		}
	}

	/**
	This method changes the background map.
	This method is called by the 'layerchange' event listener of the viewer
	and by the MapEditor.setLayer( ) method
	@param {Layer} layer The layer to set
	@param {string} url The url to use for this layer (reminder: url !== layer.url !!! See MapEditor.setLayer)
	@listens layerchange
	*/

	setLayer ( layer, url ) {
		let leafletLayer = null;
		if ( 'wmts' === layer.service.toLowerCase ( ) ) {
			leafletLayer = window.L.tileLayer ( url );
		}
		else {
			leafletLayer = window.L.tileLayer.wms ( url, layer.wmsOptions );
		}

		if ( this.#currentLayer ) {
			theTravelNotesData.map.removeLayer ( this.#currentLayer );
		}
		theTravelNotesData.map.addLayer ( leafletLayer );
		this.#currentLayer = leafletLayer;
		if ( ! theTravelNotesData.travel.readOnly ) {

			// strange... see Issue ♯79 ... zoom is not correct on read only file
			// when the background map have bounds...
			if ( theTravelNotesData.map.getZoom ( ) < ( layer.minZoom || OUR_DEFAULT_MIN_ZOOM ) ) {
				theTravelNotesData.map.setZoom ( layer.minZoom || OUR_DEFAULT_MIN_ZOOM );
			}
			theTravelNotesData.map.setMinZoom ( layer.minZoom || OUR_DEFAULT_MIN_ZOOM );
			if ( theTravelNotesData.map.getZoom ( ) > ( layer.maxZoom || OUR_DEFAULT_MAX_ZOOM ) ) {
				theTravelNotesData.map.setZoom ( layer.maxZoom || OUR_DEFAULT_MAX_ZOOM );
			}
			theTravelNotesData.map.setMaxZoom ( layer.maxZoom || OUR_DEFAULT_MAX_ZOOM );
			if ( layer.bounds ) {
				if (
					! theTravelNotesData.map.getBounds ( ).intersects ( layer.bounds )
					||
					theTravelNotesData.map.getBounds ( ).contains ( layer.bounds )
				) {
					theTravelNotesData.map.setMaxBounds ( null );
					theTravelNotesData.map.fitBounds ( layer.bounds );
					theTravelNotesData.map.setZoom ( layer.minZoom || OUR_DEFAULT_MIN_ZOOM );
				}
				theTravelNotesData.map.setMaxBounds ( layer.bounds );
			}
			else {
				theTravelNotesData.map.setMaxBounds ( null );
			}
		}
		theTravelNotesData.map.fire ( 'baselayerchange', leafletLayer );
	}

	/**
	This method is called when the geolocation status is changed
	@param {GEOLOCATION_STATUS} geoLocationStatus The geolocation status
	@listens geolocationstatuschanged
	*/

	onGeolocationStatusChanged ( geoLocationStatus ) {
		if ( GEOLOCATION_STATUS.active === geoLocationStatus ) {
			return;
		}
		if ( this.#geolocationCircle ) {
			theTravelNotesData.map.removeLayer ( this.#geolocationCircle );
			this.#geolocationCircle = null;
		}
	}

	/**
	This method is called when the geolocation position is changed
	@param {GeolocationPosition} position a JS GeolocationPosition object
	@listens geolocationpositionchanged
	*/

	onGeolocationPositionChanged ( position ) {
		let zoomToPosition = theConfig.geoLocation.zoomToPosition;
		if ( this.#geolocationCircle ) {
			theTravelNotesData.map.removeLayer ( this.#geolocationCircle );
			zoomToPosition = false;
		}

		this.#geolocationCircle = window.L.circleMarker (
			window.L.latLng ( position.coords.latitude, position.coords.longitude ),
			theConfig.geoLocation.marker
		)
			.bindTooltip (
				theUtilities.formatLatLng ( [ position.coords.latitude, position.coords.longitude ] )
			)
			.addTo ( theTravelNotesData.map );

		if ( zoomToPosition ) {
			theTravelNotesData.map.setView (
				window.L.latLng ( position.coords.latitude, position.coords.longitude ),
				theConfig.geoLocation.zoomFactor
			);
		}
	}

}

export default MapEditorViewer;

/*
--- End of MapEditorViewer.js file --------------------------------------------------------------------------------------------
*/