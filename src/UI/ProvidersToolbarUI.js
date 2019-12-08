/*
Copyright - 2017 - wwwouaiebe - Contact: http//www.ouaie.be/

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
	- the newProvidersToolbarUI function
Changes:
	- v1.4.0:
		- created
	- v1.5.0:
		- code review
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
		- Issue #63 : Find a better solution for provider keys upload
Doc reviewed 20191125
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theRouteEditor } from '../core/RouteEditor.js';

import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';

import  { THE_CONST } from '../util/Constants.js';

/*
--- providersToolbarUI function ---------------------------------------------------------------------------------------

This function returns the providersToolbarUI object

-----------------------------------------------------------------------------------------------------------------------
*/

function newProvidersToolbarUI ( ) {

	let myButtonsDiv = null;
	let myHTMLElementsFactory = newHTMLElementsFactory ( );
	let myActiveButton = false;
	let myBikeButton = null;
	let myPedestrianButton = null;
	let myCarButton = null;
	let myTrainButton = null;
	let myParentDiv = null;

	/*
	--- mySetTransitMode function -------------------------------------------------------------------------------------

	This function set the transit mode

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySetTransitMode ( transitMode ) {

		theTravelNotesData.routing.transitMode = transitMode;
		document.getElementsByClassName ( 'TravelNotes-Control-ActiveTransitModeImgButton' ) [ THE_CONST.zero ]
			.classList.remove ( 'TravelNotes-Control-ActiveTransitModeImgButton' );
		document.getElementById ( 'TravelNotes-Control-' + transitMode + 'ImgButton' )
			.classList.add ( 'TravelNotes-Control-ActiveTransitModeImgButton' );
	}

	/*
	--- myOnClickTransitModeButton function ---------------------------------------------------------------------------

	click event listener  for the transit modes buttons

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnClickTransitModeButton ( clickEvent ) {
		clickEvent.stopPropagation ( );
		mySetTransitMode ( clickEvent.target.transitMode );
		theRouteEditor.startRouting ( );
	}

	/*
	--- mySetProvider function ----------------------------------------------------------------------------------------

	This function set the provider

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySetProvider ( providerName ) {
		theTravelNotesData.routing.provider = providerName;
		document.getElementsByClassName ( 'TravelNotes-Control-ActiveProviderImgButton' ) [ THE_CONST.zero ]
			.classList.remove ( 'TravelNotes-Control-ActiveProviderImgButton' );
		document.getElementById ( 'TravelNotes-Control-' + providerName + 'ImgButton' )
			.classList.add ( 'TravelNotes-Control-ActiveProviderImgButton' );

		// activating the transit mode buttons, depending of the capabilities of the provider
		let provider = theTravelNotesData.providers.get ( providerName.toLowerCase ( ) );
		if ( provider.transitModes.car ) {
			document.getElementById ( 'TravelNotes-Control-carImgButton' )
				.classList.remove ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
		}
		else {
			document.getElementById ( 'TravelNotes-Control-carImgButton' )
				.classList.add ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
		}
		if ( provider.transitModes.bike ) {
			document.getElementById ( 'TravelNotes-Control-bikeImgButton' )
				.classList.remove ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
		}
		else {
			document.getElementById ( 'TravelNotes-Control-bikeImgButton' )
				.classList.add ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
		}
		if ( provider.transitModes.pedestrian ) {
			document.getElementById ( 'TravelNotes-Control-pedestrianImgButton' )
				.classList.remove ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
		}
		else {
			document.getElementById ( 'TravelNotes-Control-pedestrianImgButton' )
				.classList.add ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
		}
		if ( provider.transitModes.train ) {
			document.getElementById ( 'TravelNotes-Control-trainImgButton' )
				.classList.remove ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
		}
		else {
			document.getElementById ( 'TravelNotes-Control-trainImgButton' )
				.classList.add ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
		}

		// changing the transitMode if the provider don't have the active transit mode
		if ( ! theTravelNotesData.providers.get (
			providerName.toLowerCase ( ) ).transitModes [ theTravelNotesData.routing.transitMode ] ) {
			if ( provider.transitModes.bike ) {
				mySetTransitMode ( 'bike' );
			}
			else if ( provider.transitModes.pedestrian )  {
				mySetTransitMode ( 'pedestrian' );
			}
			else if ( provider.transitModes.car )  {
				mySetTransitMode ( 'car' );
			}
			else if ( provider.transitModes.train )  {
				mySetTransitMode ( 'train' );
			}
		}
	}

	/*
	--- myCreateProviderButton function -------------------------------------------------------------------------------

	This function creates a provider button

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateProviderButton ( provider ) {

		if ( THE_CONST.zero === provider.providerKey ) {
			return;
		}

		let providerButton = myHTMLElementsFactory.create (
			'img',
			{
				src : 'data:image/png;base64,' + provider.icon,
				id : 'TravelNotes-Control-' + provider.name + 'ImgButton',
				className : 'TravelNotes-Control-ImgButton',
				title : provider.name
			},
			myButtonsDiv
		);
		providerButton.provider = provider.name;
		providerButton.addEventListener (
			'click',
			clickEvent => {
				clickEvent.stopPropagation ( );
				mySetProvider ( clickEvent.target.provider );
				theRouteEditor.startRouting ( );
			},
			false );

		// when loading the control, the first provider will be the active provider
		if ( ! myActiveButton ) {
			providerButton.classList.add ( 'TravelNotes-Control-ActiveProviderImgButton' );
			theTravelNotesData.routing.provider = providerButton.provider;
			myActiveButton = true;

			// ... and the first possible transit mode will be the active transit mode
			if ( provider.transitModes.bike ) {
				myBikeButton.classList.add ( 'TravelNotes-Control-ActiveTransitModeImgButton' );
				theTravelNotesData.routing.transitMode = 'bike';
			}
			else if ( provider.transitModes.pedestrian ) {
				myPedestrianButton.classList.add ( 'TravelNotes-Control-ActiveTransitModeImgButton' );
				theTravelNotesData.routing.transitMode = 'pedestrian';
			}
			else if ( provider.transitModes.car ) {
				myCarButton.classList.add ( 'TravelNotes-Control-ActiveTransitModeImgButton' );
				theTravelNotesData.routing.transitMode = 'car';
			}
			else if ( provider.transitModes.train ) {
				myTrainButton.classList.add ( 'TravelNotes-Control-ActiveTransitModeImgButton' );
				theTravelNotesData.routing.transitMode = 'train';
			}

			// deactivating transit mode buttons if not supported by the provider
			if ( ! provider.transitModes.car ) {
				myCarButton.classList.add ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
			}
			if ( ! provider.transitModes.pedestrian ) {
				myPedestrianButton.classList.add ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
			}
			if ( ! provider.transitModes.bike ) {
				myBikeButton.classList.add ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
			}
			if ( ! provider.transitModes.train ) {
				myTrainButton.classList.add ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
			}
		}
	}

	/*
	--- myCreateProvidersButtons function -----------------------------------------------------------------------------

	This function creates the providers buttons

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateProvidersButtons ( ) {
		if ( theTravelNotesData.providers ) {
			myActiveButton = false;
			theTravelNotesData.providers.forEach ( myCreateProviderButton );
		}
	}

	/*
	--- myCreateTransitModesButtons function ----------------------------------------------------------------------

	This function creates the transit modes buttons

	---------------------------------------------------------------------------------------------------------------
	*/

	function myCreateTransitModesButtons ( ) {
		myBikeButton = myHTMLElementsFactory.create (
			'img',
			{
				src :
					'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWX\
					MAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AoaESkaC0SxrgAABMdJREFUSMfNl1loVGcYhp//n+WcZmbiJE4WjVKVaLWOGxglilFTSm\
					YUF1ILKiIILSjplQiKS65EXG4UvBGrQvVCUAdjoRrEGmtwjQbtWKlpEsTGGDMxkzKTzHr+XiRucbK4ts/lOd/5X853vuU9gj4YN+\
					48Dx58DUBOzrmhnZ0qXykWJBKqKJlkYjyusgAsFtFqMnHPbBa/CcEvaWnir5YWT1vvM3ojUl2cPv1XamqK8fv/MBcWPtwfDhuLlW\
					KYUvSLECAEzTabPHP16uc/uN1fJp6fNShhpRROZ+WSzk7jVDyuTLwDFotIpqXJb4LBkgohRP/Cbvc5/H6krhsnolFVOtAbDoQQoG\
					nCF4nIb91uDL/f8+KefDXQ70e6XOpIJPL+ot2Zg0hElbpc6ojf/7qWBPB6q1FKoevqRCBgrOYDEwgYq3VdnVBK4fVWd2cjL6+Spq\
					YSnM5zi4PBZAUfEafTtCQY9JzJy6tENjWVsH79ZWs4bJziIxMOG6fWr79sbWoq6S4uTTt7MBo1vuMToGnyx2jU+71ITz/rCoWM3w\
					2D3AFKBUj0NIL5nYWl5IndLidJw2CsUgOJwtSp6SQSC7h5czZO50vhIUPMTJrkYMIEO8OHa4Op9FzDYKyUEs9gWqelJUpbm8GcOd\
					cJBmOAARjEYgZFRUOoqZnNyJGDEkZKPOZIRM0bTIricUU8blBePhaQKAXJZBzDUMyYkcnly21cvx7sPRpSEomoeWZgQv9hSUAxYo\
					SD8+efsmdPIxkZVgBMJrDZTKxdO4YLF56Sm/sZT5509jzX76SdYI7FurdMKoqKMti8eQyZmVakFOTkaGzaFGP79gZCoSSaJpk82U\
					Fl5VN2727k+PEpxGIGHR0Jdu5s4Natf1KeG4uprD7Lc86cDPbuHc/y5Xd4/DhKa+tXNDZ2cfJkC9euFXLw4EMMA6ZNG8KOHfUcPj\
					yZKVPSWbnyNg0NEXy+aaxadYcbN1KLS6tVtKZK75YtY1ix4i51dZ0sWpTF3bshurqSZGdruN3VLFyYS3HxUEKhJAsXZpGbq1Faeo\
					vt28dz716IpUtvs21bfs+neh2rVbSagftAVu+edTotdHUl0XVJdraV+fOvcejQJPLzbSj1lHXr/GiapL09gc83lWg0ycyZDk6ffo\
					zNZiIUSpKdbe3p/ze4LzVNVKVIBJcuteHxuOjqSrJvXyNpaSaKi134fM2AoL6+C6/Xxf79X7Bx45/Y7RZ27XpIeXkdoVCcuXMzuX\
					IldZVrmqgSdvvZwnDYuNK7l9PTzVRVzUAIQV1dmLlzh7Jhw32OHm16ZY0r8vPTSCQUXm8WW7fmc/p0C263g5wcK7NmXePZs/gbO9\
					pmk7MGGJkJvN5cRo9O4+efW3j0KNKXaQEMJk50sGzZMOrrwxw79nfKlno+MgexJFR/Lumt458vCQlQVmYvs1hEgj79oHiLNdB3vM\
					UiEmVl9rL/3gh4vdW0t5ec0XXp+1iiui597e0lZ7zeal4YgZecky6XOvKhfZfLJX8KBMQa8BgpXabbjREIiDW6LnxCvL+gEKDrwh\
					cIiDVuN8b/wtCnXJ4FBRfp6PBU1NaO0h0OeUBKmgeTASFASpodDnmgtnaU3tHhqSgouDj4f6dP8dP2L6C7Ld6Z4dDBAAAAAElFTk\
					SuQmCC',
				id : 'TravelNotes-Control-bikeImgButton',
				className : 'TravelNotes-Control-ImgButton'
			},
			myButtonsDiv
		);
		myBikeButton.transitMode = 'bike';
		myBikeButton.addEventListener ( 'click', myOnClickTransitModeButton, false );

		myPedestrianButton = myHTMLElementsFactory.create (
			'img',
			{
				src :
					'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWX\
					MAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AoaESo7bADyMwAABNlJREFUSMe1V19oU1cY/52Te5Ob3DR/SfzTNNCufxRXxmarONCnPb\
					i+ykYrFdRSkeJLX5ykZcKcFfG5oIJ2Y2sVFZQ+iPoiUhC128OIiJrUlgQTm9o0t23SJufmnj2k2ura5syx7ynknu/7nd93vr8E6w\
					ghBJxzAEAgAEsmc3pToWD1y3L6M8NQfABA6eIUY54xs3kh5Xb3JONx5D/WXdX2Wh9crkPIZAbAOVBRcbpvYaHuO87lDZyTCs7lFa\
					ochDAQwucANmmzRa7PzfWECFm2IQTsdrdiZuYqHI5quVg80J7P113WdR+AIsTEBEmagsUSOayq539PpVLM5WpFJnO1POOtW+GMRH\
					4dKRa9jZxTABz/TggIMSDLU+Fg8NDuaBTaxyfoux8ORxsAwG7vrI5Ehl7pur+Rc/IJoCX3c05QKGxsnJgYemW3d1avxPgH42AQzk\
					Ri6JWuOz3ljReX7k3KnpQkLb158/6aWGyZOS0F0kF4vX45mRwY0XV3WdCGBhsePvwa3d1BAEZZYF13e5LJgRGv1y87nQdLjCmlMA\
					wDqvrj4Wx2x6XyDAw8eLADe/b4AQCqehu5nJj7bbYnHbncT5cppaCGYYBzIJ+vu7TiydcNnP7+GBKJRQwPJ5HL6YLvTlEo1F3iHD\
					AMo4Rkt5/qK6UMFwK+du0NurvDePt2EQ0NdkE9Dl33wW4/1QcApKoKltevrz01DLVWNGKbmhwYHd1dCrEiR0vLY9y7Ny0UaJRmo5\
					WV339OZ2b6NgGyXzRRVFXC4OCXKwwBd+/uRH//VkHmsn9mpm8TZUzxcU4comzb2zciEFCg6yWQZ8/mcOJEGF1dNaivV8tb4MTBmO\
					KjkpSuLdXe8lJZacb5819g374/QEiphJpMBGfPvlxiTwSAZUjSdC0tdZnyCiYTwfBwMx49SuPOnSkA7P3/7/QZM4SC0zCsPkn0bX\
					0+GU+eTCMUGgNAcO7cGEwmCbOzFITI2Lv3ESYmFsWruar2tmWzu4bEjhtLxY4jn/8G2ayByck8mpsfY36+CPEAfbif6ronSggTLg\
					KAgQsXtmF+nuLIkTC2bHGhpcUj3EwIYdB1b5TK8uIUIXxW9LbBoBXt7VW4ciWOGzeSuHnzNQYHvxJ3MeGzZvPiFHW7Q0mApcTUiu\
					jtrYHVChw79hyAjOPHX6JYJLh4cZtQwyCEpVyuUJLG48hbrS+uA6aySvX1Kjo7q9HV9fS9a6PRHG7dSqCtLYBAwFp2OlGUF9fjce\
					RJKbcAWf6N67p3zbciBBgZ2Ym6OjsaGh4gk1luDmYzQT7/LUKhZzhzZnyN0kkgSdNg7AAhBKCUUhACWCyRjvVc1dxcgV273Dh58j\
					kymQ+DsVAwcPToX1AUsm5GmM2RjiXQ0tVcroMAbsvZ7Nk/GdvYuNoF/H4ZGzZYEA7PrcpIUSgoBXI5Y9VskOU3Yafzh+2MtTBN++\
					W/jD7iIklauqpqf834+Eejz7tBLBaDpij3myRJS4sNBeXzXpK0tKLcbxofh+Z0tq0/3tbWwhmLDYww5vv/x9vlDaIV0Sg0jye03W\
					YbPSxJ0xBJtQ8H+mlus412eDwntkej0Fyu1k9dYX7uW1ioX3OFoZQB4HOEsEmr9RNXmLWWtspKWDRt9aVN1z1jsryQcjh6komE2N\
					L2N0SHF0QJfjNNAAAAAElFTkSuQmCC',
				id : 'TravelNotes-Control-pedestrianImgButton',
				className : 'TravelNotes-Control-ImgButton'
			},
			myButtonsDiv
		);
		myPedestrianButton.transitMode = 'pedestrian';
		myPedestrianButton.addEventListener ( 'click', myOnClickTransitModeButton, false );

		myCarButton = myHTMLElementsFactory.create (
			'img',
			{
				src :
					'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWX\
					MAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AoaESgBmDpJAwAABQBJREFUSMe9V09MFFcY/703szOz7PLP2WVBV6rtdm21HqhG2wiCh8\
					bL2jWhsl71IhqJJ4oHL4RIxKP1HzESLh4MEGPkoAeNYRWtGkPShGRF+aeFld2psd0BZnZmXg+LW4SdrW3EX/Iub775fe/7977vEd\
					igrCyMmZnrAABZbvGoavkGSh0hy3LtNAzuS57nZAAwTVPhOHOEUnXAstL9Ltd0TFFOJ5dyLAXJtSnLMhRFwaNHoDt3nj2v66vDjH\
					HljDkAsIXf2CKKzB4haRBixgVh6vrAwNEj27bB8ng8SCaTH6aYMcDtPh3StM/6DKNIACz8N1Dw/J+6KI7Xp1It/YTkkliEwsJmnD\
					8PIopdvbOzX90wDPf/UAoAFgzDLczOfn1Dkrp6T5wAKSpqtre4tRXk5MkLV3W9ch8+IgRhsqel5XCkrS0bn4xiWZaRTCqQpK5eTf\
					PVYwUgiq/75ucP/uT1ZmJOvd4wFEWBy9UR0nXPiigFAF331LtcHaFkMomysnDG4mgUdNeuq3OZmK4ceD6lP34ccVZVwSIZN5y9qG\
					lfHLJPJAa/X4LbzeUlnp21MDk5Z1csAChE8XmnpjU1Eln+2fPmzXe/WZZYbkcoyxympn6AaaahKCrIkvpgjKGkpACSJCAQuI2Jib\
					R9oVEtXlz862ZeVSs2MMaV57NkzRoHBIFi06aHGB5+m/XC4sIIBAoxMrILfr+YVzFjXPncXPkGSikfytxIeapyIQKHDlUAAIJBN3\
					p7t+Lata0IBt0AGBobVy/IsrxcjDlACL+Htyx3zT+nz3GnEqCyUkJ39wSOHYvh7t1vUVvrz37fu3cNotHfUVs7BElywO+XAKj5VI\
					Mxdw01TS5onwwWHjzYjp6ebaiokFBdXYJUSl8mNT9voq6uBH6/hO7uLXjy5HtQamsKTJMLUo7j5NwWMxw44Mf27TIKCnjs3u1DNF\
					qDVGq5bDJp4M6dHQiHV6OggMeWLaU4enQt7Hg5jltF88WjqIjPNo13aGj4fJnc/v3r32swAFBcnD9vqGmaSm5XE5w58xINDYMgBK\
					iru4ebN+NIpxlGR1WMjWXW6KgKTbMwOKigunoAhACHDz/CqVNjsOM1TVPhBOHHsGG4KnOfK41z577BunWFcDgscByDzyfh9u04Xr\
					5UMTmZWT6fhFevVAQCBaiqKkVpKYfLl6fzNI3UEE9pKgr4duSOB0EqZQAAVNXAyIiKp0/fgudJ1qWEAJcujYEQAll2LMiaiwaG5Z\
					yEpKK8ZRn9hKSPM8bnul3R1TWJUGgtLlyYwtDQX3njtn69E01NQVy58gqMEZvyTIMxo586ndMxQsy4Hdn4eBr37ycwPj6/YIH9mp\
					rScO9eAs+eaXnuBTPudE7HFprELxc1LZCnSVhLh5W804e9LIUgPO/U9aZGAgDDw6CbN1+dM82VbYscl9JjsYgzEIBFy8rC2LgRli\
					hO1BNirphSQkyI4nh9IAArOwh4vV7MzCQ+7egDAIlEAoQAra0H9wnCRM/HVioIEz2trQf3EYLsjP1eFrS3N7Pjx49ERPF138dwe8\
					a9r/va2o5E2tub2QcO9B0hTVv3aQb6d/B4ZKhqS/+tWxGnJL3opFSLE2IsOifJcXYCQgxQqsUl6UXn4GDEqaot/V6v58PfTpmECy\
					ORWPpo4/dYlrvGMLggz3OrFh5tf1BqPuO4VNSyjBsuVzymKB3/+mj7G1dPIltjqpC6AAAAAElFTkSuQmCC',
				id : 'TravelNotes-Control-carImgButton',
				className : 'TravelNotes-Control-ImgButton'
			},
			myButtonsDiv
		);
		myCarButton.transitMode = 'car';
		myCarButton.addEventListener ( 'click', myOnClickTransitModeButton, false );

		myTrainButton = myHTMLElementsFactory.create (
			'img',
			{
				src :
					'data:image/png;base64,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\
					9E2t/6aPsbwfNWty4y/a8AAAAASUVORK5CYII=',
				id : 'TravelNotes-Control-trainImgButton',
				className : 'TravelNotes-Control-ImgButton'
			},
			myButtonsDiv
		);
		myTrainButton.transitMode = 'train';
		myTrainButton.addEventListener ( 'click', myOnClickTransitModeButton, false );

	}

	/*
	--- myCreateUI function -------------------------------------------------------------------------------------------

	This function creates the UI

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateUI ( controlDiv ) {

		myParentDiv = controlDiv;

		myButtonsDiv = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-ItineraryButtonsDiv',
				className : 'TravelNotes-Control-ButtonsDiv'
			},
			controlDiv
		);

		myCreateTransitModesButtons ( );
		myCreateProvidersButtons ( );

	}

	/*
	--- myCreateUI function -------------------------------------------------------------------------------------------

	This function refresh the UI

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myProvidersAdded ( ) {

		myParentDiv.removeChild ( myButtonsDiv );
		myCreateUI ( myParentDiv );
	}

	/*
	--- providersToolbarUI object -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{

			createUI : controlDiv => myCreateUI ( controlDiv ),

			get provider ( ) { return theTravelNotesData.routing.provider; },
			set provider ( providerName ) { mySetProvider ( providerName ); },

			get transitMode ( ) { return theTravelNotesData.routing.transitMode; },
			set transitMode ( transitMode ) { mySetTransitMode ( transitMode ); },

			providersAdded : ( ) => myProvidersAdded ( )
		}
	);
}

/*
--- theProvidersToolbarUI object ---------------------------------------------------------------------------------------

The one and only one providesToolbarUI

-----------------------------------------------------------------------------------------------------------------------
*/

const theProvidersToolbarUI = newProvidersToolbarUI ( );

export { theProvidersToolbarUI };

/*
--- End of ProvidersToolbarUI.js file ---------------------------------------------------------------------------------
*/