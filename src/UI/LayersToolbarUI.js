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
Changes:
	- v1.6.0:
		- created
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

export { newLayersToolbarUI };

//import { g_Config } from '../data/Config.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { newHttpRequestBuilder } from '../util/HttpRequestBuilder.js';
import { g_Translator } from '../UI/Translator.js';
import { g_Config } from '../data/Config.js';
import { g_APIKeysManager } from '../core/APIKeysManager.js';

/*
--- newLayersToolbarUI function ---------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

let s_Layers = [
	{
		service:"wmts",
		url:"https://{s}.tile.osm.org/{z}/{x}/{y}.png",
		name:"OSM - Color",
		maxZoom:19,
		toolbar:
		{
			text:"OSM",
			color:"black",
			backgroundColor:"white"
		},
		providerName:"OSM",
		providerKeyNeeded:false,
		attribution:"| &copy; <a href='http://www.openstreetmap.org/copyright' target='_blank' title='OpenStreetMap contributors'>OpenStreetMap contributors</a> "
	},
];

let s_TimerId = null;

function newLayersToolbarUI ( ) {

	let m_LayersToolbar = null;
	let m_LayersToolbarButtonsDiv = null;
	let m_HtmlElementsFactory = newHTMLElementsFactory ( );
	
 
	function m_CreateLayerButton ( layer ) {
		if ( layer.providerKeyNeeded && ! g_APIKeysManager.getKey ( layer.providerName.toLowerCase ( ) ) ) {
			return;
		}
		m_HtmlElementsFactory.create ( 
			'div',
			{
				className : 'TravelNotes-LayersToolbar-Button',
				title : layer.name,
				name : layer.name,
				innerHTML : layer.toolbar.text,
				style : "color:" + layer.toolbar.color + ";background-color:" + layer.toolbar.backgroundColor
			},
			m_LayersToolbarButtonsDiv
		);
	}
	
	function m_CreateLayersToolbar ( ) {
		m_LayersToolbar = m_HtmlElementsFactory.create ( 
			'div',
			{
				id : 'TravelNotes-LayersToolbar'
			},
			document.getElementsByTagName ( 'body' ) [ 0 ]
		);
		m_HtmlElementsFactory.create ( 
			'div',
			{
				id : 'TravelNotes-LayersToolbar-Header',
				innerHTML : g_Translator.getText ( 'LayersToolbarUI - Layers' )
			},
			m_LayersToolbar
		);
		
		m_LayersToolbar.addEventListener (
			'mouseenter',
			( ) => {
				if ( s_TimerId ) {
					clearTimeout ( s_TimerId );
					s_TimerId = null;
					return;
				}
				m_LayersToolbarButtonsDiv = m_HtmlElementsFactory.create ( 
					'div',
					{
						id : 'TravelNotes-LayersToolbar-Buttons'
					},
					m_LayersToolbar
				);
				s_Layers.forEach ( layer => m_CreateLayerButton ( layer ) );
			},
			false
		);
		m_LayersToolbar.addEventListener (
			'mouseleave',
			( ) => {
				s_TimerId = setTimeout (
					( ) => {
						m_LayersToolbar.removeChild ( m_LayersToolbarButtonsDiv );
						s_TimerId = null;
					},
					g_Config.layersToolbarUI.toolbarTimeOut || 1500
				);
			},
			false
		);
		
		
	}
	
	function m_CreateUI ( ) {
		
		newHttpRequestBuilder ( ).getJsonPromise ( 
			window.location.href.substr (0, window.location.href.lastIndexOf( '/') + 1 ) +
			'TravelNotesLayers.json' 
		)
		.then ( layers => { s_Layers = s_Layers.concat (layers ); } )
		.catch ( err => console.log ( err? err : 'An error occurs when loading TravelNotesLayers.json' ) )
		.finally ( m_CreateLayersToolbar );
	}
	
	return Object.seal (
		{
			createUI : ( ) => m_CreateUI ( )
		}
	);
}

	
/*
--- End of LayersToolbarUI.js file ------------------------------------------------------------------------------------
*/		