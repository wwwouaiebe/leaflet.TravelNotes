/*
Copyright - 2019 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- LayersToolbarUI.js file -------------------------------------------------------------------------------------------
This file contains:
	- the newLayersToolbarUI function
	- the gc_LayersToolbarUI object
Changes:
	- v1.6.0:
		- created
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

export { gc_LayersToolbarUI };

import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { newHttpRequestBuilder } from '../util/HttpRequestBuilder.js';
import { g_Translator } from '../UI/Translator.js';
import { g_Config } from '../data/Config.js';
import { g_TravelNotesData } from '../data/TravelNotesData.js';
import { g_APIKeysManager } from '../core/APIKeysManager.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';
import { gc_AttributionsUI } from '../UI/AttributionsUI.js';

let s_Layers = [
	{
		service:"wmts",
		url:"https://{s}.tile.osm.org/{z}/{x}/{y}.png",
		name:"OSM - Color",
		toolbar:
		{
			text:"OSM",
			color:"red",
			backgroundColor:"white"
		},
		providerName:"OSM",
		providerKeyNeeded:false,
		attribution:"| &copy; <a href='http://www.openstreetmap.org/copyright' target='_blank' title='OpenStreetMap contributors'>OpenStreetMap contributors</a> "
	}
];

let s_TimerId = null;

/*
--- newLayersToolbarUI function ---------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newLayersToolbarUI ( ) {

	let m_LayersToolbar = null;
	let m_LayersToolbarButtonsDiv = null;
	let m_HtmlElementsFactory = newHTMLElementsFactory ( );
	let m_EventDispatcher = newEventDispatcher ( );
	let m_MarginTop = 0;
	let m_ButtonHeight = 0;
	let m_ButtonsHeight = 0;
	let m_ButtonTop = 0;

	/*
	--- m_OnMouseEnterLayerButton function ----------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnMouseEnterLayerButton ( event ) {
		event.target.setAttribute ( 'style', "color:" + event.target.layer.toolbar.backgroundColor + ";background-color:" + event.target.layer.toolbar.color ); 
	}
	
	/*
	--- m_OnMouseLeaveLayerButton function ----------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnMouseLeaveLayerButton ( event ) {
		event.target.setAttribute ( 'style', "color:" + event.target.layer.toolbar.color + ";background-color:" + event.target.layer.toolbar.backgroundColor ); 
	}
	
	function m_OnMouseEnterLinkButton ( event ) {
		event.target.classList.add ( 'TravelNotes-LayersToolbarUI-LinkButton-Enter' );
		event.target.classList.remove ( 'TravelNotes-LayersToolbarUI-LinkButton-Leave' );
	}
	function m_OnMouseLeaveLinkButton ( event ) {
		event.target.classList.add ( 'TravelNotes-LayersToolbarUI-LinkButton-Leave' );
		event.target.classList.remove ( 'TravelNotes-LayersToolbarUI-LinkButton-Enter' );
	}
	/*
	--- m_OnClickLayerButton function ---------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnClickLayerButton ( event ) {
		m_EventDispatcher.dispatch ( 'layerchange', { layer : event.target.layer } );
		gc_AttributionsUI.attributions = event.target.layer.attribution;
	}
	
	/*
	--- m_CreateLayerButton function ----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/
 
	function m_CreateLayerButton ( layer ) {
		if ( layer.providerKeyNeeded && ! g_APIKeysManager.getKey ( layer.providerName.toLowerCase ( ) ) ) {
			return;
		}
		let layerButton = m_HtmlElementsFactory.create ( 
			'div',
			{
				type: 'layer',
				className : 'TravelNotes-LayersToolbarUI-Button',
				title : layer.name,
				layer : layer,
				innerHTML : layer.toolbar.text,
				style : "color:" + layer.toolbar.color + ";background-color:" + layer.toolbar.backgroundColor
			},
			m_LayersToolbarButtonsDiv
		);
		layerButton.addEventListener ( 'mouseenter', m_OnMouseEnterLayerButton, false );
		layerButton.addEventListener ( 'mouseleave', m_OnMouseLeaveLayerButton, false );
		layerButton.addEventListener ( 'click', m_OnClickLayerButton, false );
		m_ButtonHeight = layerButton.clientHeight;
		m_ButtonsHeight += m_ButtonHeight;
	}
	
	/*
	--- m_CreateLinkButton function -----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/
	
	function m_CreateLinkButton ( href, title, text ) {
		let linkButton = m_HtmlElementsFactory.create ( 
			'div',
			{
				type : 'link',
				className : 'TravelNotes-LayersToolbarUI-Button TravelNotes-LayersToolbarUI-LinkButton-Leave',
				innerHTML : '<a href="' + href + '" title="' + title + '" target="_blank">' + text + '</a>'
			},
			m_LayersToolbarButtonsDiv
		);
		linkButton.addEventListener ( 'mouseenter', m_OnMouseEnterLinkButton, false );
		linkButton.addEventListener ( 'mouseleave', m_OnMouseLeaveLinkButton, false );
		m_ButtonsHeight += linkButton.clientHeight;
	}
	
	/*
	--- m_OnTimeOutToolbar function -----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnTimeOutToolbar ( ) {
		let buttons = m_LayersToolbarButtonsDiv.childNodes;
		for ( let counter = 0; counter < buttons.length; counter++ ) {
			if ( 'layer' === buttons [ counter ].type ) {
				buttons [ counter ].removeEventListener ( 'mouseenter', m_OnMouseEnterLayerButton, false ); 
				buttons [ counter ].removeEventListener ( 'mouseleave', m_OnMouseLeaveLayerButton, false );
				buttons [ counter ].removeEventListener ( 'click', m_OnClickLayerButton, false );
			}
			else {
				buttons [ counter ].removeEventListener ( 'mouseenter', m_OnMouseEnterLinkButton, false );
				buttons [ counter ].removeEventListener ( 'mouseleave', m_OnMouseEnterLinkButton, false );
			}
		}
		m_LayersToolbarButtonsDiv.removeEventListener ( 'wheel', m_OnWheelToolbar, false );
		m_LayersToolbar.removeChild ( m_LayersToolbarButtonsDiv );
		s_TimerId = null;
	}

	/*
	--- m_OnWheelToolbar function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnWheelToolbar ( wheelEvent ) {
		if ( wheelEvent.deltaY ) {
			m_MarginTop -= wheelEvent.deltaY * 10;
			m_MarginTop = m_MarginTop > m_ButtonTop ? m_ButtonTop : m_MarginTop;
			m_MarginTop = m_MarginTop < m_ButtonTop - m_ButtonsHeight + 3 * m_ButtonHeight ? m_ButtonTop - m_ButtonsHeight + 3 * m_ButtonHeight : m_MarginTop;
			m_LayersToolbarButtonsDiv.style.marginTop = '' + m_MarginTop + 'px';
		}
		wheelEvent.stopPropagation ( );
	} 

	/*
	--- m_OnMouseEnterToolbar function --------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnMouseEnterToolbar ( ) {
		if ( s_TimerId ) {
			clearTimeout ( s_TimerId );
			s_TimerId = null;
			return;
		}
		m_LayersToolbarButtonsDiv = m_HtmlElementsFactory.create ( 
			'div',
			{
				id : 'TravelNotes-LayersToolbarUI-Buttons'
			},
			m_LayersToolbar
		);
		m_ButtonTop = m_LayersToolbar.clientHeight;
		m_ButtonsHeight = 0;
		s_Layers.forEach ( layer => m_CreateLayerButton ( layer ) );
		
		if ( g_Config.layersToolbarUI.theDevil && g_Config.layersToolbarUI.theDevil.addButton ) {
			m_CreateLinkButton ( 
				'https://www.google.com/maps/@' + 
					g_TravelNotesData.map.getCenter ( ).lat + 
					',' +
					g_TravelNotesData.map.getCenter ( ).lng + 
					',' + 
					g_TravelNotesData.map.getZoom ( ) + 
					'z', 
				g_Config.layersToolbarUI.theDevil.title, 
				g_Config.layersToolbarUI.theDevil.text
			);
		}

		m_ButtonTop += m_ButtonHeight;
		m_MarginTop = m_ButtonTop;
		m_LayersToolbarButtonsDiv.style.marginTop = '' + m_MarginTop + 'px';

		m_LayersToolbarButtonsDiv.addEventListener ( 
			'wheel',
			m_OnWheelToolbar,
			false 
		);
	}
	
	/*
	--- m_CreateLayersToolbar function --------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateLayersToolbar ( ) {
		m_LayersToolbar = m_HtmlElementsFactory.create ( 
			'div',
			{
				id : 'TravelNotes-LayersToolbarUI'
			},
			document.getElementsByTagName ( 'body' ) [ 0 ]
		);
		m_HtmlElementsFactory.create ( 
			'div',
			{
				id : 'TravelNotes-LayersToolbarUI-Header',
				innerHTML : g_Translator.getText ( 'LayersToolbarUI - Layers' )
			},
			m_LayersToolbar
		);
		m_LayersToolbar.addEventListener (
			'mouseenter',
			m_OnMouseEnterToolbar,
			false
		);
		m_LayersToolbar.addEventListener (
			'mouseleave',
			( ) => { s_TimerId = setTimeout ( m_OnTimeOutToolbar, g_Config.layersToolbarUI.toolbarTimeOut || 1500 ); },
			false
		);
		
		m_EventDispatcher.dispatch ( 'layerchange', { layer : s_Layers [ 0 ] } );
		gc_AttributionsUI.attributions = s_Layers [ 0 ].attribution;

	}
	
	/*
	--- m_CreateUI function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateUI ( ) {
		
		newHttpRequestBuilder ( ).getJsonPromise ( 
			window.location.href.substr (0, window.location.href.lastIndexOf ( '/') + 1 ) +
			'TravelNotesLayers.json' 
		)
			.then ( layers => { s_Layers = s_Layers.concat (layers ); } )
			.catch ( err => console.log ( err? err : 'An error occurs when loading TravelNotesLayers.json' ) )
			.finally ( m_CreateLayersToolbar );
	}
	
	/*
	--- LayersToolbarUI object ----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			createUI : ( ) => m_CreateUI ( )
		}
	);
}

const gc_LayersToolbarUI = newLayersToolbarUI ( );

	
/*
--- End of LayersToolbarUI.js file ------------------------------------------------------------------------------------
*/		