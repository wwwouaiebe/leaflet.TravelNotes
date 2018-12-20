/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

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
--- ProvidersToolbarUI.js file -----------------------------------------------------------------------------------------
This file contains:
	- the providersToolbarUI object
	- the module.exports implementation
Changes:
	- v1.4.0:
		- created
Doc reviewed 20181220
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';
	
	var g_TravelNotesData = require ( '../L.TravelNotes' );
	
	/*
	--- onProviderButtonClick function --------------------------------------------------------------------------------

	click event listener for the providers button

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onProviderButtonClick = function ( clickEvent ) {
		
		clickEvent.stopPropagation ( );

		g_TravelNotesData.routing.provider = clickEvent.target.provider;

		document.getElementsByClassName ( 'TravelNotes-Control-ActiveProviderImgButton' ) [ 0 ].classList.remove ( 'TravelNotes-Control-ActiveProviderImgButton' );
		clickEvent.target.classList.add ( 'TravelNotes-Control-ActiveProviderImgButton' ); 

		// activating the transit mode buttons, depending of the capabilities of the provider
		var provider = g_TravelNotesData.providers.get ( clickEvent.target.provider );
		if ( provider.transitModes.car ) {
			document.getElementById ( 'TravelNotes-Control-carImgButton' ).classList.remove ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
		}
		else {
			document.getElementById ( 'TravelNotes-Control-carImgButton' ).classList.add ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
		}
		if ( provider.transitModes.bike ) {
			document.getElementById ( 'TravelNotes-Control-bikeImgButton' ).classList.remove ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
		}
		else {
			document.getElementById ( 'TravelNotes-Control-bikeImgButton' ).classList.add ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
		}
		if ( provider.transitModes.pedestrian ) {
			document.getElementById ( 'TravelNotes-Control-pedestrianImgButton' ).classList.remove ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
		}
		else {
			document.getElementById ( 'TravelNotes-Control-pedestrianImgButton' ).classList.add ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
		}
		if ( provider.transitModes.train ) {
			document.getElementById ( 'TravelNotes-Control-trainImgButton' ).classList.remove ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
		}
		else {
			document.getElementById ( 'TravelNotes-Control-trainImgButton' ).classList.add ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
		}
		
		if ( ! g_TravelNotesData.providers.get ( clickEvent.target.provider ).transitModes [ g_TravelNotesData.routing.transitMode ] ) {
			if ( provider.transitModes.bike ) {
				document.getElementById ( 'TravelNotes-Control-bikeImgButton' ).click ( );
			}
			else if ( provider.transitModes.pedestrian )  {
				document.getElementById ( 'TravelNotes-Control-pedestrianImgButton' ).click ( );
			}
			else if ( provider.transitModes.car )  {
				document.getElementById ( 'TravelNotes-Control-carImgButton' ).click ( );
			}
			else if ( provider.transitModes.train )  {
				document.getElementById ( 'TravelNotes-Control-trainImgButton' ).click ( );
			}
		}
		
		require ( '../core/RouteEditor' ) ( ).startRouting ( );
	};

	/*
	--- onClickTransitModeButton function -----------------------------------------------------------------------------

	click event listener  for the transit modes buttons

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onClickTransitModeButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );

		g_TravelNotesData.routing.transitMode = clickEvent.target.transitMode;

		document.getElementsByClassName ( 'TravelNotes-Control-ActiveTransitModeImgButton' ) [ 0 ].classList.remove ( 'TravelNotes-Control-ActiveTransitModeImgButton' );
		clickEvent.target.classList.add ( 'TravelNotes-Control-ActiveTransitModeImgButton' );

		require ( '../core/RouteEditor' ) ( ).startRouting ( );
	};
	
	/*
	--- providersToolbarUI function -----------------------------------------------------------------------------------

	This function returns the providersToolbarUI object

	-------------------------------------------------------------------------------------------------------------------
	*/

	var providersToolbarUI = function ( ) {
		
		var m_ButtonsDiv = null;
		var m_HtmlElementsFactory = require ( '../UI/HtmlElementsFactory' ) ( );
		var m_activeButton = false;
		var m_BikeButton = null;
		var m_PedestrianButton = null;
		var m_CarButton = null;
		var m_TrainButton = null;
		
		/*
		--- m_createProviderButton function -------------------------------------------------------------------------

		This function creates a provider button

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_createProviderButton = function ( provider ) {
			
			var providerButton = m_HtmlElementsFactory.create (
				'img',
					{ 
						src : "data:image/png;base64," + provider.icon,
						id : 'TravelNotes-Control-'+ provider.name + 'ImgButton', 
						className : 'TravelNotes-Control-ImgButton',
						title : provider.name
					},
				m_ButtonsDiv
			);
			providerButton.provider = provider.name.toLowerCase ( );
			providerButton.addEventListener ( 'click', onProviderButtonClick, false );
			// when loading the control, the first provider will be the active provider
			if ( ! m_activeButton ) {
				providerButton.classList.add ( 'TravelNotes-Control-ActiveProviderImgButton' );
				g_TravelNotesData.routing.provider = providerButton.provider;
				m_activeButton = true;
				
				// ... and the first possible transit mode will be the active transit mode
				if ( provider.transitModes.bike ) {
					m_BikeButton.classList.add ( 'TravelNotes-Control-ActiveTransitModeImgButton' );
					g_TravelNotesData.routing.transitMode = 'bike';
				} else if ( provider.transitModes.pedestrian ) {
					m_PedestrianButton.classList.add ( 'TravelNotes-Control-ActiveTransitModeImgButton' );
					g_TravelNotesData.routing.transitMode = 'pedestrian';
				} else if ( provider.transitModes.car ) {
					m_CarButton.classList.add ( 'TravelNotes-Control-ActiveTransitModeImgButton' );
					g_TravelNotesData.routing.transitMode = 'car';
				} else if ( provider.transitModes.train ) {
					m_TrainButton.classList.add ( 'TravelNotes-Control-ActiveTransitModeImgButton' );
					g_TravelNotesData.routing.transitMode = 'train';
				} 
				
				// deactivating transit mode buttons if not supported by the provider
				if ( ! provider.transitModes.car ) {
					m_CarButton.classList.add ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
				}
				if ( ! provider.transitModes.pedestrian ) {
					m_PedestrianButton.classList.add ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
				}
				if ( ! provider.transitModes.bike ) {
					m_BikeButton.classList.add ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
				}
				if ( ! provider.transitModes.train ) {
					m_TrainButton.classList.add ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
				}
			}
		};


		/*
		--- m_createProvidersButtons function -------------------------------------------------------------------------

		This function creates the providers buttons

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_createProvidersButtons = function ( ) {
			if ( g_TravelNotesData.providers ) {
				m_activeButton = false;
				g_TravelNotesData.providers.forEach ( m_createProviderButton );
			}
		};
		
		/*
		--- m_createTransitModesButtons function ----------------------------------------------------------------------

		This function creates the transit modes buttons

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_createTransitModesButtons = function ( ) {
			m_BikeButton = m_HtmlElementsFactory.create (
				'img',
					{ 
						src : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AoaESkaC0SxrgAABMdJREFUSMfNl1loVGcYhp//n+WcZmbiJE4WjVKVaLWOGxglilFTSmYUF1ILKiIILSjplQiKS65EXG4UvBGrQvVCUAdjoRrEGmtwjQbtWKlpEsTGGDMxkzKTzHr+XiRucbK4ts/lOd/5X853vuU9gj4YN+48Dx58DUBOzrmhnZ0qXykWJBKqKJlkYjyusgAsFtFqMnHPbBa/CcEvaWnir5YWT1vvM3ojUl2cPv1XamqK8fv/MBcWPtwfDhuLlWKYUvSLECAEzTabPHP16uc/uN1fJp6fNShhpRROZ+WSzk7jVDyuTLwDFotIpqXJb4LBkgohRP/Cbvc5/H6krhsnolFVOtAbDoQQoGnCF4nIb91uDL/f8+KefDXQ70e6XOpIJPL+ot2Zg0hElbpc6ojf/7qWBPB6q1FKoevqRCBgrOYDEwgYq3VdnVBK4fVWd2cjL6+SpqYSnM5zi4PBZAUfEafTtCQY9JzJy6tENjWVsH79ZWs4bJziIxMOG6fWr79sbWoq6S4uTTt7MBo1vuMToGnyx2jU+71ITz/rCoWM3w2D3AFKBUj0NIL5nYWl5IndLidJw2CsUgOJwtSp6SQSC7h5czZO50vhIUPMTJrkYMIEO8OHa4Op9FzDYKyUEs9gWqelJUpbm8GcOdcJBmOAARjEYgZFRUOoqZnNyJGDEkZKPOZIRM0bTIricUU8blBePhaQKAXJZBzDUMyYkcnly21cvx7sPRpSEomoeWZgQv9hSUAxYoSD8+efsmdPIxkZVgBMJrDZTKxdO4YLF56Sm/sZT5509jzX76SdYI7FurdMKoqKMti8eQyZmVakFOTkaGzaFGP79gZCoSSaJpk82UFl5VN2727k+PEpxGIGHR0Jdu5s4Natf1KeG4uprD7Lc86cDPbuHc/y5Xd4/DhKa+tXNDZ2cfJkC9euFXLw4EMMA6ZNG8KOHfUcPjyZKVPSWbnyNg0NEXy+aaxadYcbN1KLS6tVtKZK75YtY1ix4i51dZ0sWpTF3bshurqSZGdruN3VLFyYS3HxUEKhJAsXZpGbq1Faeovt28dz716IpUtvs21bfs+neh2rVbSagftAVu+edTotdHUl0XVJdraV+fOvcejQJPLzbSj1lHXr/GiapL09gc83lWg0ycyZDk6ffozNZiIUSpKdbe3p/ze4LzVNVKVIBJcuteHxuOjqSrJvXyNpaSaKi134fM2AoL6+C6/Xxf79X7Bx45/Y7RZ27XpIeXkdoVCcuXMzuXIldZVrmqgSdvvZwnDYuNK7l9PTzVRVzUAIQV1dmLlzh7Jhw32OHm16ZY0r8vPTSCQUXm8WW7fmc/p0C263g5wcK7NmXePZs/gbO9pmk7MGGJkJvN5cRo9O4+efW3j0KNKXaQEMJk50sGzZMOrrwxw79nfKlno+MgexJFR/Lumt458vCQlQVmYvs1hEgj79oHiLNdB3vMUiEmVl9rL/3gh4vdW0t5ec0XXp+1iiui597e0lZ7zeal4YgZecky6XOvKhfZfLJX8KBMQa8BgpXabbjREIiDW6LnxCvL+gEKDrwhcIiDVuN8b/wtCnXJ4FBRfp6PBU1NaO0h0OeUBKmgeTASFASpodDnmgtnaU3tHhqSgouDj4f6dP8dP2L6C7Ld6Z4dDBAAAAAElFTkSuQmCC",
						id : 'TravelNotes-Control-bikeImgButton', 
						className : 'TravelNotes-Control-ImgButton'
					},
				m_ButtonsDiv
			);
			m_BikeButton.transitMode = 'bike';
			m_BikeButton.addEventListener ( 'click', onClickTransitModeButton, false );
			
			m_PedestrianButton = m_HtmlElementsFactory.create (
				'img',
					{ 
						src : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AoaESo7bADyMwAABNlJREFUSMe1V19oU1cY/52Te5Ob3DR/SfzTNNCufxRXxmarONCnPbi+ykYrFdRSkeJLX5ykZcKcFfG5oIJ2Y2sVFZQ+iPoiUhC128OIiJrUlgQTm9o0t23SJufmnj2k2ura5syx7ynknu/7nd93vr8E6wghBJxzAEAgAEsmc3pToWD1y3L6M8NQfABA6eIUY54xs3kh5Xb3JONx5D/WXdX2Wh9crkPIZAbAOVBRcbpvYaHuO87lDZyTCs7lFaochDAQwucANmmzRa7PzfWECFm2IQTsdrdiZuYqHI5quVg80J7P113WdR+AIsTEBEmagsUSOayq539PpVLM5WpFJnO1POOtW+GMRH4dKRa9jZxTABz/TggIMSDLU+Fg8NDuaBTaxyfoux8ORxsAwG7vrI5Ehl7pur+Rc/IJoCX3c05QKGxsnJgYemW3d1avxPgH42AQzkRi6JWuOz3ljReX7k3KnpQkLb158/6aWGyZOS0F0kF4vX45mRwY0XV3WdCGBhsePvwa3d1BAEZZYF13e5LJgRGv1y87nQdLjCmlMAwDqvrj4Wx2x6XyDAw8eLADe/b4AQCqehu5nJj7bbYnHbncT5cppaCGYYBzIJ+vu7TiydcNnP7+GBKJRQwPJ5HL6YLvTlEo1F3iHDAMo4Rkt5/qK6UMFwK+du0NurvDePt2EQ0NdkE9Dl33wW4/1QcApKoKltevrz01DLVWNGKbmhwYHd1dCrEiR0vLY9y7Ny0UaJRmo5WV339OZ2b6NgGyXzRRVFXC4OCXKwwBd+/uRH//VkHmsn9mpm8TZUzxcU4comzb2zciEFCg6yWQZ8/mcOJEGF1dNaivV8tb4MTBmOKjkpSuLdXe8lJZacb5819g374/QEiphJpMBGfPvlxiTwSAZUjSdC0tdZnyCiYTwfBwMx49SuPOnSkA7P3/7/QZM4SC0zCsPkn0bX0+GU+eTCMUGgNAcO7cGEwmCbOzFITI2Lv3ESYmFsWruar2tmWzu4bEjhtLxY4jn/8G2ayByck8mpsfY36+CPEAfbif6ronSggTLgKAgQsXtmF+nuLIkTC2bHGhpcUj3EwIYdB1b5TK8uIUIXxW9LbBoBXt7VW4ciWOGzeSuHnzNQYHvxJ3MeGzZvPiFHW7Q0mApcTUiujtrYHVChw79hyAjOPHX6JYJLh4cZtQwyCEpVyuUJLG48hbrS+uA6aySvX1Kjo7q9HV9fS9a6PRHG7dSqCtLYBAwFp2OlGUF9fjceRJKbcAWf6N67p3zbciBBgZ2Ym6OjsaGh4gk1luDmYzQT7/LUKhZzhzZnyN0kkgSdNg7AAhBKCUUhACWCyRjvVc1dxcgV273Dh58jkymQ+DsVAwcPToX1AUsm5GmM2RjiXQ0tVcroMAbsvZ7Nk/GdvYuNoF/H4ZGzZYEA7PrcpIUSgoBXI5Y9VskOU3Yafzh+2MtTBN++W/jD7iIklauqpqf834+Eejz7tBLBaDpij3myRJS4sNBeXzXpK0tKLcbxofh+Z0tq0/3tbWwhmLDYww5vv/x9vlDaIV0Sg0jye03WYbPSxJ0xBJtQ8H+mlus412eDwntkej0Fyu1k9dYX7uW1ioX3OFoZQB4HOEsEmr9RNXmLWWtspKWDRt9aVN1z1jsryQcjh6komE2NL2N0SHF0QJfjNNAAAAAElFTkSuQmCC",
						id : 'TravelNotes-Control-pedestrianImgButton', 
						className : 'TravelNotes-Control-ImgButton'
					},
				m_ButtonsDiv
			);
			m_PedestrianButton.transitMode = 'pedestrian';
			m_PedestrianButton.addEventListener ( 'click', onClickTransitModeButton, false );
			
			m_CarButton = m_HtmlElementsFactory.create (
				'img',
					{ 
						src : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AoaESgBmDpJAwAABQBJREFUSMe9V09MFFcY/703szOz7PLP2WVBV6rtdm21HqhG2wiCh8bL2jWhsl71IhqJJ4oHL4RIxKP1HzESLh4MEGPkoAeNYRWtGkPShGRF+aeFld2psd0BZnZmXg+LW4SdrW3EX/Iub775fe/7977vEdigrCyMmZnrAABZbvGoavkGSh0hy3LtNAzuS57nZAAwTVPhOHOEUnXAstL9Ltd0TFFOJ5dyLAXJtSnLMhRFwaNHoDt3nj2v66vDjHHljDkAsIXf2CKKzB4haRBixgVh6vrAwNEj27bB8ng8SCaTH6aYMcDtPh3StM/6DKNIACz8N1Dw/J+6KI7Xp1It/YTkkliEwsJmnD8PIopdvbOzX90wDPf/UAoAFgzDLczOfn1Dkrp6T5wAKSpqtre4tRXk5MkLV3W9ch8+IgRhsqel5XCkrS0bn4xiWZaRTCqQpK5eTfPVYwUgiq/75ucP/uT1ZmJOvd4wFEWBy9UR0nXPiigFAF331LtcHaFkMomysnDG4mgUdNeuq3OZmK4ceD6lP34ccVZVwSIZN5y9qGlfHLJPJAa/X4LbzeUlnp21MDk5Z1csAChE8XmnpjU1Eln+2fPmzXe/WZZYbkcoyxympn6AaaahKCrIkvpgjKGkpACSJCAQuI2JibR9oVEtXlz862ZeVSs2MMaV57NkzRoHBIFi06aHGB5+m/XC4sIIBAoxMrILfr+YVzFjXPncXPkGSikfytxIeapyIQKHDlUAAIJBN3p7t+Lata0IBt0AGBobVy/IsrxcjDlACL+Htyx3zT+nz3GnEqCyUkJ39wSOHYvh7t1vUVvrz37fu3cNotHfUVs7BElywO+XAKj5VIMxdw01TS5onwwWHjzYjp6ebaiokFBdXYJUSl8mNT9voq6uBH6/hO7uLXjy5HtQamsKTJMLUo7j5NwWMxw44Mf27TIKCnjs3u1DNFqDVGq5bDJp4M6dHQiHV6OggMeWLaU4enQt7Hg5jltF88WjqIjPNo13aGj4fJnc/v3r32swAFBcnD9vqGmaSm5XE5w58xINDYMgBKiru4ebN+NIpxlGR1WMjWXW6KgKTbMwOKigunoAhACHDz/CqVNjsOM1TVPhBOHHsGG4KnOfK41z577BunWFcDgscByDzyfh9u04Xr5UMTmZWT6fhFevVAQCBaiqKkVpKYfLl6fzNI3UEE9pKgr4duSOB0EqZQAAVNXAyIiKp0/fgudJ1qWEAJcujYEQAll2LMiaiwaG5ZyEpKK8ZRn9hKSPM8bnul3R1TWJUGgtLlyYwtDQX3njtn69E01NQVy58gqMEZvyTIMxo586ndMxQsy4Hdn4eBr37ycwPj6/YIH9mprScO9eAs+eaXnuBTPudE7HFprELxc1LZCnSVhLh5W804e9LIUgPO/U9aZGAgDDw6CbN1+dM82VbYscl9JjsYgzEIBFy8rC2LgRlihO1BNirphSQkyI4nh9IAArOwh4vV7MzCQ+7egDAIlEAoQAra0H9wnCRM/HVioIEz2trQf3EYLsjP1eFrS3N7Pjx49ERPF138dwe8a9r/va2o5E2tub2QcO9B0hTVv3aQb6d/B4ZKhqS/+tWxGnJL3opFSLE2IsOifJcXYCQgxQqsUl6UXn4GDEqaot/V6v58PfTpmECyORWPpo4/dYlrvGMLggz3OrFh5tf1BqPuO4VNSyjBsuVzymKB3/+mj7G1dPIltjqpC6AAAAAElFTkSuQmCC",
						id : 'TravelNotes-Control-carImgButton', 
						className : 'TravelNotes-Control-ImgButton'
					},
				m_ButtonsDiv
			);
			m_CarButton.transitMode = 'car';
			m_CarButton.addEventListener ( 'click', onClickTransitModeButton, false );
			
			m_TrainButton = m_HtmlElementsFactory.create (
				'img',
					{ 
						src : "data:image/png;base64,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",
						id : 'TravelNotes-Control-trainImgButton', 
						className : 'TravelNotes-Control-ImgButton'
					},
				m_ButtonsDiv
			);
			m_TrainButton.transitMode = 'train';
			m_TrainButton.addEventListener ( 'click', onClickTransitModeButton, false );

		};

		/*
		--- m_CreateUI function ---------------------------------------------------------------------------------------

		This function creates the UI

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_CreateUI = function ( controlDiv ) {

			m_ButtonsDiv = m_HtmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-ItineraryButtonsDiv', className : 'TravelNotes-Control-ButtonsDiv' }, controlDiv );

			m_createTransitModesButtons ( );
			m_createProvidersButtons ( );
		
		};
		
		/*
		--- m_SetProvider function ------------------------------------------------------------------------------------

		This function set the provider

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_SetProvider = function ( providerName ) {
			 var button = document.getElementById ( 'TravelNotes-Control-'+ providerName + 'ImgButton' );
			 if ( button ) {
				 button.click ( );
			 }
		
		};
		
		/*
		--- m_SetProvider function ------------------------------------------------------------------------------------

		This function set the transit mode

		---------------------------------------------------------------------------------------------------------------
		*/
		var m_SetTransitMode = function ( transitMode ) {
			var button = document.getElementById ( 'TravelNotes-Control-' + transitMode + 'ImgButton' );
			 if ( button ) {
				 button.click ( );
			 }
		};
		
		/* 
		--- providersToolbarUI object ---------------------------------------------------------------------------------
		
		---------------------------------------------------------------------------------------------------------------
		*/
		
		return Object.seal (
			{
				
				createUI : function ( controlDiv ) { m_CreateUI ( controlDiv ); },
				
				get provider ( ) { return g_TravelNotesData.routing.provider; },
				set provider ( providerName ) { m_SetProvider ( providerName ); },
				
				get transitMode ( ) { return g_TravelNotesData.routing.transitMode; },
				set transitMode ( transitMode ) { m_SetTransitMode ( transitMode ); }
			}
		);
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = providersToolbarUI;
	}

}());

/*
--- End of ProvidersToolbarUI.js file ---------------------------------------------------------------------------------
*/	