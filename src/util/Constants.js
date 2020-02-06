/* eslint no-magic-numbers: "off" */

const THE_CONST = {
	angle : {
		degree0 : 0,
		degree90 : 90,
		degree180 : 180,
		degree270 : 270,
		degree360 : 360,
		degree540 : 540
	},
	baseContextMenu : {
		menuMargin : 20
	},
	baseDialog : {
		dragMargin : 20
	},
	colorDialog : {
		maxColorValue : 255,
		linColorValue : 0,
		colorRowsNumber : 6,
		deltaColor : 51
	},
	collection : {
		swapUp : -1,
		swapDown : 1,
		direction : {
			next : 1,
			previous : -1
		}
	},
	distance : {
		mInKm : 1000,
		round : 10,
		fixed : 2,
		invalid : -1,
		defaultValue : 0
	},
	dataPanesUI : {
		invalidPane : -1,
		itineraryPane : 0,
		travelNotesPane : 1,
		searchPane : 2
	},
	elev : {
		fixed : 2,
		defaultValue : 0
	},
	geoLocation : {
		status : {
			refusedByUser : -1,
			disabled : 0,
			inactive : 1,
			active : 2
		}
	},
	hexadecimal : 16,
	htmlViewsFactory : {
		linksMaxLength : 40,
		minNotesDistance : 9
	},
	invalidObjId : -1,
	layersToolbarUI : {
		buttonsAlwaysVisible : 3
	},
	latLng : {
		defaultValue : 0,
		fixed : 6,
		maxLat : 90,
		minLat : -90,
		maxLng : 180,
		minLng : -180

	},
	mapEditor : {
		defaultMaxZoom : 18,
		defaultMinZoom : 0,
		wayPointIconSize : 40,
		markerBoundsPrecision : 0.01
	},
	mouse : {
		wheelCorrectionFactors : [ 0.3, 10, 1 ]
	},
	note : {
		defaultIconSize : 40,
		zIndexOffset : 100
	},
	notFound : -1,
	numberMinus1 : -1,
	number1 : 1,
	number2 : 2,
	number3 : 3,
	number4 : 4,
	number5 : 5,
	number10 : 10,
	number16 : 16,
	number100 : 100,
	number65536 : 65536,
	passwordDialog : {
		pswdMinLength : 12
	},
	polylinePrecision : 6,
	route : {
		edited : {
			notEdited : 0,
			editedNoChange : 1,
			editedChanged : 2
		},
		minWidth : 1,
		maxWidth : 40
	},
	svgProfile : {
		margin : 50,
		height : 500,
		width : 1000,
		yDeltaText : 30,
		xDeltaText : 10
	},
	svgIcon : {
		positionOnRoute : {
			atStart : -1,
			onRoute : 0,
			atEnd : 1
		},
		width : 40,
		height : 40
	},
	svgIconFromOsmFactory : {
		comparePrecision : 0.00001,
		searchAroundFactor : 1.5
	},
	time : {
		secondInDay : 86400,
		secondInHour : 3600,
		secondInMinut : 60
	},
	xmlHttpRequest : {
		status : {
			ok : 200
		},
		readyState : {
			done : 4
		},
		timeout : 20000
	},
	zero : 0
};

export { THE_CONST };