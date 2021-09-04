All the program is based on events. 

The user do an action, mainly with the mouse on the screen and this action trigger an event. Events can be a right mouse click, a mouse move, a mouse over, a mouse wheel, a drag and drop
operation on the map, on an object on the map (notes, routes, waypoints) or on the user interface (UI)...

This event is captured by an event listener (one of the classes with the name finishing with ...EL) and the event listener call a method, mainly in one of the object in the core module / folder.

When the action is performed, the map and the UI have to be updated with the new/modifed/deleted data. So at the end of the procedure a new event is dispatched to the document with the data
( see the coreLib/EventDispatcher.js file ). This second event is captured by an event listener (see  main/AppLoader.#addEventsListeners ( ) method). This event listener call the appropriate methods 
of the classes coreMapEditor/MapEditor and UI/UI to update the map and theUI.

