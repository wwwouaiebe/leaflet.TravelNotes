# How the application works

## User actions

All user actions are based on events. 

The user do an action, mainly with the mouse on the screen and this action trigger an event. Events can be a right mouse click, a mouse move, a mouse over, a mouse wheel on an object on 
the map (notes, routes, waypoints) or on the user interface (UI), a drag and drop operation on the map or on the UI...

This event is captured by an event listener (one of the classes with the name finishing with __...EL__) and the event listener call a method, mainly in one of the object in the __core__ module / folder.

When the action is performed, the map and the UI have to be updated with the new/modifed/deleted data. So at the end of the procedure a new event is dispatched to the document with the data
( see the coreLib/EventDispatcher.js file ). This second event is captured by an event listener on the document (see  main/AppLoader.#addEventsListeners ( ) method). This event listener call the appropriate methods 
of the classes __coreMapEditor/MapEditor__ and __UI/UI__ to update the map and the UI.

## Loading of the application

When the html page is loaded, some global objects are build (see in the technical documentation Global with name starting with __the...__).

Then the __AppLoader.loadApp ( )__ method is called from the file main.js. This method will first load from the server all the json and csv files with the application configutation.

When the configuration is completely lauched, the method call:
- the __TravelNotes.addReadOnlyMap ( )__ method when a travel file name is given in the parameters of the url
- the __TravelNotes.addControl ( )__ method when no travel file name is given