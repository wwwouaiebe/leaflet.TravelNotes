function getPageId ( ) {
	var UrlSearch = decodeURI ( window.location.search );
	if ( 0 == UrlSearch.length )
	{
		return '';
	}
	if ( 0 <= UrlSearch.indexOf ( 'page=' ) )
	{
		return UrlSearch.substr ( UrlSearch.indexOf ( 'page=' ) + 5 );
	}
	return '';
}

function showTravelNotes ( event )
{
	var show = document.getElementById ( 'TravelNotes-Travel-ShowNotes' ).checked;
	var notes = document.getElementsByClassName ( 'TravelNotes-Roadbook-Travel-Notes-Row' );
	for ( var notesCounter = 0; notesCounter < notes.length; notesCounter ++ ) {
		if ( show ) {
			notes [ notesCounter ].classList.remove ( 'TravelNotes-Roadbook-Hidden-Row' );
		}
		else {
			notes [ notesCounter ].classList.add ( 'TravelNotes-Roadbook-Hidden-Row' );
		}
	}
}

function showRouteNotes ( event )
{
	var show = document.getElementById ( 'TravelNotes-Routes-ShowNotes' ).checked;
	var notes = document.getElementsByClassName ( 'TravelNotes-Roadbook-Route-Notes-Row' );
	for ( var notesCounter = 0; notesCounter < notes.length; notesCounter ++ ) {
		if ( show ) {
			notes [ notesCounter ].classList.remove ( 'TravelNotes-Roadbook-Hidden-Row' );
		}
		else {
			notes [ notesCounter ].classList.add ( 'TravelNotes-Roadbook-Hidden-Row' );
		}
	}
}

function showRouteManeuvers( event )
{
	var show = document.getElementById ( 'TravelNotes-Routes-ShowManeuvers' ).checked;
	var maneuvers = document.getElementsByClassName ( 'TravelNotes-Roadbook-Route-Maneuvers-Row' );
	for ( var maneuversCounter = 0; maneuversCounter < maneuvers.length; maneuversCounter ++ ) {
		if ( show ) {
			maneuvers [ maneuversCounter ].classList.remove ( 'TravelNotes-Roadbook-Hidden-Row' );
		}
		else {
			maneuvers [ maneuversCounter ].classList.add ( 'TravelNotes-Roadbook-Hidden-Row' );
		}
	}
}

function saveFile ( ) 
{
	try {
		var mapFile = window.URL.createObjectURL ( new File ( [ '<!DOCTYPE html>', document.documentElement.outerHTML ], { type: 'text/plain' } ) );
		var element = document.createElement ( 'a' );
		element.setAttribute( 'href', mapFile );
		element.setAttribute( 'download', document.getElementsByClassName ( 'TravelNotes-Roadbook-Travel-Header-Name' ) [ 0 ].innerHTML + '-Roadbook.html' );
		element.style.display = 'none';
		document.body.appendChild ( element );
		element.click ( );
		document.body.removeChild ( element );
		window.URL.revokeObjectURL ( mapFile );
	}
	catch ( Error ) {
		console.log ( Error );
	}				
}
var pageId = getPageId ( );
if ( 0 < pageId.length ) {
	document.getElementById ( 'TravelNotes' ).innerHTML = localStorage.getItem ( getPageId ( ) + "-TravelNotesHTML" ); 
	showTravelNotes ( );
	showRouteNotes ( );
	showRouteManeuvers ( );
	window.addEventListener(
		'storage', 
		function ( event ) { 
			document.getElementById ( 'TravelNotes' ).innerHTML = localStorage.getItem ( getPageId ( ) + "-TravelNotesHTML" );
			showTravelNotes ( );
			showRouteNotes ( );
			showRouteManeuvers ( );
		}
	);
}

document.getElementById ( 'TravelNotes-Travel-ShowNotes' ).addEventListener ( 'change',showTravelNotes );
document.getElementById ( 'TravelNotes-Routes-ShowNotes' ).addEventListener ( 'change',showRouteNotes );
document.getElementById ( 'TravelNotes-Routes-ShowManeuvers' ).addEventListener ( 'change', showRouteManeuvers );
document.getElementById ( 'TravelNotes-Routes-SaveFile' ).addEventListener ( 'click', saveFile );
