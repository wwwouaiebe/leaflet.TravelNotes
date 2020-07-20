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
	- v1.7.0:
		- added line and circle icons
		- modified bike, pedestrian and car icons
	- v1.6.0:
		- Issue #102 : Sometime the provider toolbar is incomplete at startup
	- v1.12.0:
		- Issue #120 : Review the control
Doc reviewed 20191125
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theRouteEditor } from '../core/RouteEditor.js';

import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';

import { ZERO } from '../util/Constants.js';

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
	let myLineButton = null;
	let myCircleButton = null;
	let myParentDiv = null;

	/*
	--- mySetTransitMode function -------------------------------------------------------------------------------------

	This function set the transit mode

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySetTransitMode ( transitMode ) {

		theTravelNotesData.routing.transitMode = transitMode;
		let activeTransitModeButton =
			document.querySelector ( '.TravelNotes-Control-ActiveTransitModeImgButton' );
		if ( activeTransitModeButton ) {
			activeTransitModeButton.classList.remove ( 'TravelNotes-Control-ActiveTransitModeImgButton' );
		}
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
		let activeProviderButton =
			document.querySelector ( '.TravelNotes-Control-ActiveProviderImgButton' );
		if ( activeProviderButton ) {
			activeProviderButton.classList.remove ( 'TravelNotes-Control-ActiveProviderImgButton' );
		}
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
		if ( provider.transitModes.line ) {
			document.getElementById ( 'TravelNotes-Control-lineImgButton' )
				.classList.remove ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
		}
		else {
			document.getElementById ( 'TravelNotes-Control-lineImgButton' )
				.classList.add ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
		}
		if ( provider.transitModes.circle ) {
			document.getElementById ( 'TravelNotes-Control-circleImgButton' )
				.classList.remove ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
		}
		else {
			document.getElementById ( 'TravelNotes-Control-circleImgButton' )
				.classList.add ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
		}

		// changing the transitMode if the provider don't have the active transit mode
		if ( ! theTravelNotesData.providers.get (
			providerName.toLowerCase ( ) ).transitModes [ theTravelNotesData.routing.transitMode ] ) {
			if ( provider.transitModes.bike ) {
				mySetTransitMode ( 'bike' );
			}
			else if ( provider.transitModes.pedestrian ) {
				mySetTransitMode ( 'pedestrian' );
			}
			else if ( provider.transitModes.car ) {
				mySetTransitMode ( 'car' );
			}
			else if ( provider.transitModes.train ) {
				mySetTransitMode ( 'train' );
			}
			else if ( provider.transitModes.line ) {
				mySetTransitMode ( 'line' );
			}
			else if ( provider.transitModes.circle ) {
				mySetTransitMode ( 'circle' );
			}
		}
	}

	/*
	--- myCreateProviderButton function -------------------------------------------------------------------------------

	This function creates a provider button

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateProviderButton ( provider ) {

		if ( ZERO === provider.providerKey ) {
			return;
		}

		let providerButton = myHTMLElementsFactory.create (
			'img',
			{
				src : provider.icon,
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
			else if ( provider.transitModes.line ) {
				myLineButton.classList.add ( 'TravelNotes-Control-ActiveTransitModeImgButton' );
				theTravelNotesData.routing.transitMode = 'line';
			}
			else if ( provider.transitModes.circle ) {
				myCircleButton.classList.add ( 'TravelNotes-Control-ActiveTransitModeImgButton' );
				theTravelNotesData.routing.transitMode = 'circle';
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
			if ( ! provider.transitModes.line ) {
				myLineButton.classList.add ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
			}
			if ( ! provider.transitModes.circle ) {
				myCircleButton.classList.add ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
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
					'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAIAAAC0Ujn1AAAABmJLR0QAAAAzAJlWvctWAAAACXBIWX\
					MAAA7EAAAOxAGVKw4bAAAAB3RJTUUH5AEIChYTLGSDtAAAA65JREFUSMftVl1sk1UYfs53vnZft4/R/W+hHaUrbshcQch06VCGWd\
					BohmNRCRiXKXphZCOacCEYBeOFXHhDlHDjQDEBdKIx9sL4Q8bqtEPqLAOE/YDrGPspa2m7bt/Xr8eLr3WddFuJ88b4Xp285z1P3v\
					Oe533eQ9xud3FxMcdxmMMURWGMUUoJIUjNFEUZHBwkPp8vovBnHVfB7gghACNIsgEQQgjAwBjiAfFIQqqrLBpNhKeU/to9Vr/fic\
					Wzbw6iqrKEQ/Ks/pkxAODwr9n/0HcHLWq5uoqlXMqMTjR+nj2bKWPlcrH9t4komyHRmgLt3pcq0gQNGOr2dSJZMyycteNaSJKjlk\
					Ih0dk9KjnO3QhORtrsV+YmXjzreW576qfxlrrlJUXCrUkWlBgDlmgJI+Tn7pvHfvTOeYzEodncTfP8xoIu93h7XzDR+Vx1vj8kVx\
					oEp2fqrlvGWihsseoFnggCv2JZRql+1pNMK+xL10T5yiyeI6/UFuzbalydq12YIbWW9CMt1u2bDeVm8VCzdZUl+1j7yEPr8wmBlh\
					JTJg+AEgBI1+L4Gw9OSez8ldsv1JvfbbonKUNi1U6jZNuW0p3vuVRG1K8P6wUc2G4++OlAU03Rh98PV63OKvNNXR8K2oxCqTn747\
					aLgVCkfSBkv+Bvqs5985kV+08OzGTNEoi192lTm71XdTSs1RMl2trhzczUBWXm6vG2PGHcue2+xzeZHNfDWx81vX308tcX/BbTEp\
					X0rR3jOdnpswqSKPAZomC/FABQadA1PlX+uWsCAM8xAK4Rqb7WvMlmebZhzQ5bXl6u+MC9WS9uzM/R6z7ac796fHJa+XtB/sKOSJ\
					Eqg9DpmXJ6wnWvd8RGRjS273TdqFxnvnh5+BPH2Nqy7N/7/F/5ZABArAiiQNUFpRwATlEUhmnVdeiz/saGWa/xWJkoyxF1vefo1Y\
					wNrR8c7wbQ+kX/q42rEiN3bS76Y+i2uo5GGQCeUhplkuryhJROp+fIbmuXa9h9LfTkw0WimNZ8uGeGrwxDo2EAPV75bOfg4eaK8b\
					FAKCQtM+i9t8JvneiPQ0cBkEAgcO6XkZrXvksYe3j5kYK8HN2ZrtEz/ZPza1CNRczP0p4+PyEpM3Swv7Nug62UBwBCZ7USw/vfjq\
					Qobz/0BpNoHs8voHzzik9SsUtZVFNH+Y8NMMqRxQWllAdA/H6/RqPr7bvJGBYcgSz28wIhJK49SR7WUlIoy2HidruNRiOldBGzVr\
					+TfwLXzWMKJ+iQhAAAAABJRU5ErkJggg==',
				id : 'TravelNotes-Control-bikeImgButton',
				className : 'TravelNotes-Control-ImgButton',
				title : theTranslator.getText ( 'ProvidersToolbarUI - bike' )
			},
			myButtonsDiv
		);
		myBikeButton.transitMode = 'bike';
		myBikeButton.addEventListener ( 'click', myOnClickTransitModeButton, false );

		myPedestrianButton = myHTMLElementsFactory.create (
			'img',
			{
				src :
					'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAIAAAC0Ujn1AAAABmJLR0QAAAAzAJlWvctWAAAACXBIWX\
					MAAA7EAAAOxAGVKw4bAAAAB3RJTUUH5AEICholT2tZIQAAAyxJREFUSMetll1IFFEUx/93PtZ13cykJNvWNDXEMkgoyYKICCJISK\
					kIIYjqpU98kB77loogjCzKCvoQkqigh8ioKKS01NS2grDwY7ddLa3dNVt37r1ze5haLXVzV8/TmTN3fufMYeacP3E4HCkpKZIkYX\
					wmhCCEhD/DOXc6ncTr9TKu1D5vgxj7LCEQYvglAYQQnOuSTAiMTAQGgpDlSzNUlSmyLLe0fl1/6BUmzx6exNIl6RLwV7kygUomzB\
					YA8G+LuQD9kyoxRrqxf9HFvQtIVMmUMPeqDuevWZUNgDJ917n3kaLDfRhZmUmGE2dRo6g6HLr6bmtQY+5u78kr7ycZ3fCmlzGdUj\
					01yTyZ6MOb0q6dLYyzmObYE29VFp3Ykjk56HXZU0p2rrDE/m6xJda0c1v+yjTLeIgyCYveujHb0+MfCLBQxOsPHi1dNh40F2HRVm\
					vMz4AW1IbQZyrrF8637S+wT7QhVovKGedMD0U8Xwau3mzYsyM/XpUmhDaZVKHrus5DEVUmu8+/8/T4LpbmGpFjxelvb6zLSjRFhl\
					ZUhTGu86GqzSYJwL6Dz3Lm21ZnWgEkxMfYbdP8QT0ydMWluoorjRrlnAtKdQCKTAC8cAXKymsvn1p752Desry0/h+D+ZnWyNCVtX\
					3XG7yDQdbU3F52+nEIDaDq1bfj5c/efei1z060JSdUnS86snluxH+jRjkIqMYAmIZNkXNPejpc/dOmxgLo6PpeVLDQqkiRoRnjBM\
					TbTwEoyl+Dtbgw25i0U+PNJQce5SSbx0SPOpB1ziVJcvdp/xyYZVEW56YaftJ0K+Woc/4cEz3qXqSUg8DVpwEAGXq/HJv53v0Wd7\
					fvZVNXp/PbjAQ14l4HBhkAt4/+2bS/rabtR/GJlt6+gYZmV3tnb3XT92jQhBBPvyYEMGKJCcBsVijTo1lg92rarHGqLkRQ46NpD/\
					HZ4/d0+6NBX3jaYzhOt3f4FDSs8XXXg+fuetdgNOiQzdtwe2Rwe7nj/+NJlqJXHqM+KcsKAOLz+VQ19uOnbiEwht4gMGSZGJJp4S\
					0jfSalAeJwOOx2uyzLYfTjCAU4Ljn5C1w5SWBHSm1MAAAAAElFTkSuQmCC',
				id : 'TravelNotes-Control-pedestrianImgButton',
				className : 'TravelNotes-Control-ImgButton',
				title : theTranslator.getText ( 'ProvidersToolbarUI - pedestrian' )
			},
			myButtonsDiv
		);
		myPedestrianButton.transitMode = 'pedestrian';
		myPedestrianButton.addEventListener ( 'click', myOnClickTransitModeButton, false );

		myCarButton = myHTMLElementsFactory.create (
			'img',
			{
				src :
					'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAIAAAC0Ujn1AAAABmJLR0QAAAAzAJlWvctWAAAACXBIWX\
					MAAA7EAAAOxAGVKw4bAAAAB3RJTUUH5AEICh4hLGpYPAAAAlZJREFUSMfdlk1oE0EUx/+zszEx3UhD0zZYkn5ksfWjlVgrVk1RQV\
					R6EMFaK9qjggdBRO1NvSiIB8/iyQ/akxepSKteRPxoETXamkQtJAbbBN0ky0boZne8FIu23exqKuhjDgMz78ef/3u8GRIOh/1+P8\
					dxKF1ompZIJEgmkylo/KPHMTBL6QQzCXM2hGxpF222Ak8pffkqvff88xKqHrqE9g0BDrAo10wwAOCwaPFvovmFDo6Gak4f3+x0gj\
					HoOjQNTIfOoOvQ9dn93aF3p268tobu3R9sqC+XJACgdGbxPCgFIbPXHPYWa+gKWtbS7M3nIe669VVTfjm1aRUC53AtwYObHXW1rr\
					ZK90haMuv1mZ4VgsBFYlNzuQBU+kUiybiajMYmeR69e0QLZdwW8gMYGU0ZF+rp6GcArcHlZg3Z5K1avaqKMUwkpGNbawzQ2VxB09\
					DU6Gl0lUVkpQj6xA7xwtntdjsjBBfPdZhpMnc5fXL7wO5DA8+mFCND1gddDgcA8nFCVtUi0OlpRKKyrsPtphuby015PTYuB7r67w\
					3HjdH3H8abDva/eStZKGOt33n9ZNu6tZXG6NagZ6AvVF+3zEJfCwI93BMs6nJ1tbN730rTM+R3JyxjxVQfuRztu5IaG+4UBORyWL\
					Nz0AD34k6nx4NCAYHQ4Cc1XQStMEVRlR8SEmrSjOT4fNf++lBNpfR8npNlzThZlmG3Y6H2nx8tdl8zo6uh6+p/94AtMppypLRQSn\
					kAJJvN2mxL33+YZOynR+9PQgx4VfUbCYfDPp+PUlry7+R3HyvZuSYHFFYAAAAASUVORK5CYII=',
				id : 'TravelNotes-Control-carImgButton',
				className : 'TravelNotes-Control-ImgButton',
				title : theTranslator.getText ( 'ProvidersToolbarUI - car' )
			},
			myButtonsDiv
		);
		myCarButton.transitMode = 'car';
		myCarButton.addEventListener ( 'click', myOnClickTransitModeButton, false );

		myTrainButton = myHTMLElementsFactory.create (
			'img',
			{
				src :
					'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAIAAAC0Ujn1AAAABmJLR0QAAAAzAJlWvctWAAAACXBIWX\
					MAAA7EAAAOxAGVKw4bAAAAB3RJTUUH5AEICiI23EqkBAAABQpJREFUSMetVm1QVFUYfs+55+4u+zEsshK0iuy6iuAHbaSwJhkZNp\
					WjaWn2oQ2Zk1lmpjMllmNqDYZjM+Y0TdkIg8WYHwU6KjqUIzl8KGhihcgCu8Auu3uBXXfZT+89/cBAYFex8f1173nOfea973ne5z\
					2oqrouNUWHMYb7CUqBAkWAEAqD8jxvMplRd08vpWzlhRtA74scwe0PRjwgNMegIyRERCypq3cs/qwWHlyc+RIyZ2oxAASCXniwQQ\
					EAMAB4ff6wG6Yr4YMcVaoi+D/IEUIEAFhCwsL5G6elTEnc8A6RSgnP05vuQOP1juXbrnjpqM4cA4BIxIbFnv/0mnbpyQlLyo6VXU\
					EIHfn1kiYpLjlmtIkTACAMGwleZZAumK8bo5SFQoGxseyhXxqezkyYYnFVXPPYb5F7UyMU/gfzX43f+P5z5L9yvZWrHoACgUDlhb\
					9e23LRHkJ3o4Zw6LIZUevW5HCcc++354/+Zp6YIDPoVZN1YxPiY5TRoujo6NSUpIL3uNw9RgExkalHhAwLX3ySTQizeUd5YU0fgL\
					TJSE8ZHQCOYTvTov1/3pRFpKZ0eCMeLzBoNeofiioKa/p2r4yfnjpeLGb9gWCfx2/nvOZOd7vFIxETsZg0Gb2Tgu4bfkWErKlwxz\
					t/umD2E3OmHSg+t3Zfc+m2tIULDHc/LquVe2TJ0ZFFx/367n/JfAguFz2TMVOXv+dETb2t6cjCe/ICQEKC6utNqeF1jQADwJsGeW\
					nh0lDo1surD6VNjdtX8GJS0sOjlPCz8/UaqRAx68na2IMl52+6AysWa2ama1mWHX1bKxTyzbmTwioEAYBCRlSxyrlZ08tOVAGAz+\
					ezO1wWa4+5vcfY2t3U6q66xjl9vEpGdGq5LmmMNIpixDMYE4IZBndYXBHF12J2tpgFrudsZY3l8311tZxoRHJSALB74O/rPFwfrk\
					I5+BlgeRjUOBlQXnl1t8kVctNeAAAQ3a/VeUCiZjydvHyQemAEbV2rX7QgzcE5u2xOk7nncoOl+LTN5B/SafvXaV56YZYgCEU/VW\
					840N6/uH6efOVyvcXqXLOjFvjhBaEA8H1Jg9frmZ2p06fp0vV4ySLY+lGoo8PeZHRUXzR9d9xiCTJFx0xPZiXHKOUK2aDt3DD7lU\
					olBUSGDkrkdrsv1TuyPzw7sDRvAlm1LPFR/WTdRDXDMAN+1GnhzO2cg+tze0L9Zi+RiAiDCRNSKhVJibElR+q2HOoCgDO7MgwZE8\
					N4SIXplre4dT3GbSabIPCPpSePVcWIxWKtRq3VqCPVus1k3f6z5baaB3U9wvqquujyXc2m9t6sOTNaWjr3Hyj/p7E1GIw4ybju3m\
					27KgJDp8/d7Pztb9r+qLXtyMuZmqotOXzhqdxTr2SrtBOUcSoFYXiEkVgkkkhoe4fr3b3GPgGPylQHoviS7+Sy0oPb01e9Me/xTN\
					3HO899dcbZD2XEwabVU+dm6bPnRs3OnFJxrjG/sPlORTF5eXkWq7eo3BiJ3SegHyusgt0cJcGJCezvF7kgMADQ2QeHKx2nTzTIWb\
					fb7ZPLRbNSotoabbYAWZEzbvy4MQQAGIzu2RE7Szko5QAAYIi31HP09d1NdyxIAIBhCAAgl8vFslHNxi5KASGgdPhkGHmto/T2Fk\
					oppVSgFCggBBhjQMBgPEkXHwr50NWrDYmJ4zFmYMilDwECBEBppBsM9KcSNniebzOZ/gWOPRAUHy2iQwAAAABJRU5ErkJggg==',
				id : 'TravelNotes-Control-trainImgButton',
				className : 'TravelNotes-Control-ImgButton',
				title : theTranslator.getText ( 'ProvidersToolbarUI - train' )
			},
			myButtonsDiv
		);
		myTrainButton.transitMode = 'train';
		myTrainButton.addEventListener ( 'click', myOnClickTransitModeButton, false );

		myLineButton = myHTMLElementsFactory.create (
			'img',
			{
				src :
					'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAIAAAC0Ujn1AAAABmJLR0QAAAAzAJlWvctWAAAACXBIWX\
					MAAA7EAAAOxAGVKw4bAAAAB3RJTUUH5AEICiINbUFNIAAAAfZJREFUSMdjvHz5spycHBMTEwP1wN+/fx8/fsz44cOHP39ZDh+9zf\
					CfJO2MDFANGAxGRhtLFVbWPyzMzMwXLr4ObDxFRVfv6mKwNFNmYmAg0bnEgP8MDAwMZAZxoqXgomJd/GrIMdpCkq270SMi1Iz6Rs\
					9sdxIW4l2x+hSVjV5UrKunI3fpyqO43svUNDrfVSwi1Oztu8/plfsIKmYiKYhrS50ZGBiau/eeeP6LmkbDg3ji7lfEqGeiehCTZj\
					RJQYzTaMb/bBQGMU6j/zOia57f60ZSEBMbIBsbTTXUpI6dvE18EMMBCx65mgBpT3e9Fy8/FLccxZUcE4OUv//4XTD3DglGW0iyle\
					Y7MTAwVLXsRgtiiIl21srKSuKsLMyPn7wlzej5vW58vJyz5h+ef/w9VhN///l7997LQ0fvzl93l4QAgQdx+tTrAVrcUQFqxoZysr\
					IiaCbiTzAsuIL40+fvb958ubvaX0lRnIGB4fv3X9dvPD1x+iFBE3EaDQliVhZmVl5OP2/D799/nTl3/+jJ+1hDkzSjixK1+Xg5v3\
					//dfX6U/JMxGl03/yrl669atnwlPIKEt3oE89/naCGueRXu4PAaGYmRuoayszMwsDAwPjx40dWVs47d1/8/8/ASCUrVJQlfv/+zn\
					j58mVZWVlmZmaqNycB+D3rTYmxQpEAAAAASUVORK5CYII=',
				id : 'TravelNotes-Control-lineImgButton',
				className : 'TravelNotes-Control-ImgButton',
				title : theTranslator.getText ( 'ProvidersToolbarUI - line' )
			},
			myButtonsDiv
		);
		myLineButton.transitMode = 'line';
		myLineButton.addEventListener ( 'click', myOnClickTransitModeButton, false );

		myCircleButton = myHTMLElementsFactory.create (
			'img',
			{
				src :
					'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAIAAAC0Ujn1AAAABmJLR0QAAAAzAJlWvctWAAAACXBIWX\
					MAAA7EAAAOxAGVKw4bAAAAB3RJTUUH5AEICiEaxb+bJAAAAqNJREFUSMdjvHz5spycHBMTEwP1wN+/fx8/fsz44cOHP39ZDh+9zf\
					CfJO2MDFANGAxGRhtLFVbWPyzMzMwXLr4ObDxFRVfv6mKwNFNmYmAg0bnEgP8MDAwMTAw0Ayz4pS0k2RKDlO2slUVFeIWFeBkYGN\
					6++/z6zedDR+/OX3f3xPNfZBo9M1szIsTk48dvBw7fOnvp5cTdrxgYGPJdxYz1xD1dtWIjzBevOJk+9TrJRu/vszUyVJg6+1DVso\
					fI4hN3v2LY/Yqh93JNgHRpvpOOloR19n6sJjDhMldZSSw+ex2aucigZcNT96iVstJCR6c6Emv0zGxNI0OFvKodG659xR8TJ57/Cs\
					vcrKMlMzNbk7DRFpJssRHm3RP3ETQXbnr3xH2xEeYWkmwEjE4MUn7z9nPLhqfEJ7KWDU/fvP2cFaVOwGg7a+UDh2+RmoS3775mai\
					xPwGhREd6zl16SavSJcy+kJAUJGC0sxAtJvySB+cff8/FyEpX4qALQjf70+Xu+qxippiRaCn76/J2A0c+evzfWEyfVaAsjiWfP3x\
					Mw+vTZhw62aqQabWetfPrsQwJGT1t2U0SYty1KnnhzawKk5WVFpi27ScDoE89/LV5xMjvVDjN34Sp1S/OdFq84iVnAYkkh6VOvX7\
					n2ZNV0X4KmW0iyrZrue+XaE6xFK/bEZ529//HTdzuXhdcESOMJh53Lwh8/fYerUMVZXltn75+ZrVlV7JoY/X7PgVsnzr2Yf/w9JJ\
					1ZGEm4OKhJSgiSWRVAQmb+urtZUep21soRISbzeDkhCf/Z8/dHT9ybtuwm+RUYJFZP9F5mYLhMhdxI5YzOzMRIXUOZmVkYGBgYP3\
					78yMrKeefui///GRipZIWKssTv398ZL1++LCsry8zMTPXmJADJwQv2CCSQygAAAABJRU5ErkJggg==',
				id : 'TravelNotes-Control-circleImgButton',
				className : 'TravelNotes-Control-ImgButton',
				title : theTranslator.getText ( 'ProvidersToolbarUI - circle' )
			},
			myButtonsDiv
		);
		myCircleButton.transitMode = 'circle';
		myCircleButton.addEventListener ( 'click', myOnClickTransitModeButton, false );
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
				className : 'TravelNotes-Control-FlexRow TravelNotes-Control-ImgButtonsDiv'
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