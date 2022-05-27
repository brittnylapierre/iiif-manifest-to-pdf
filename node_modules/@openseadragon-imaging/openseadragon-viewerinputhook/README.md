# OpenSeadragonViewerInputHook

[![Gitter](https://badges.gitter.im/openseadragon-imaging/community.svg)](https://gitter.im/openseadragon-imaging/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

OpenSeadragonViewerInputHook is a plugin for [OpenSeadragon](https://github.com/openseadragon/openseadragon) 1.0.0+
which provides hooks into the user input event pipeline for providing additional behavior and/or
overriding the default behavior.

[View the Documentation](https://openseadragon-imaging.github.io/docs/openseadragon-viewerinputhook/index.html)

[Demo/Test Site](https://openseadragon-imaging.github.io/#/imaginghelper)

## Usage

_**Prerequisite note: OpenSeadragonViewerInputHook requires [OpenSeadragon](https://github.com/openseadragon/openseadragon) version 2.0+.**_

The OpenSeadragonViewerInputHook bundle can be obtained the following ways:

1. Direct download [openseadragon-viewerinputhook.js](https://openseadragon-imaging.github.io/builds/openseadragon-viewerinputhook.js) (and optionally [openseadragon-viewerinputhook.js.map](https://openseadragon-imaging.github.io/builds/openseadragon-viewerinputhook.js.map))
2. npm

```
    npm install @openseadragon-imaging/openseadragon-viewerinputhook
```

The OpenSeadragonViewerInputHook bundle can be included using a script tag in HTML or imported as a library module (ES2015, CommonJS, AMD).

A **ViewerInputHook** object can be created and attached (if desired) to an [OpenSeadragon.Viewer](https://openseadragon.github.io/docs/OpenSeadragon.Viewer.html) two ways:

1. Call the addViewerInputHook method on the viewer
2. Create a new ViewerInputHook object, passing a viewer reference in the options parameter (optional)

Both methods return a new ViewerInputHook object, and both methods take an options parameter where the event handlers to be hooked may be specified (see the 'Details' section below).

**Example using an HTML script tag**

```html
<script
  type="text/javascript"
  src="path_to/openseadragon/openseadragon.js"
></script>
<script
  type="text/javascript"
  src="path_to/openseadragon-imaging/openseadragon-viewerinputhook.js"
></script>
```

```javascript
    // Example 1 - Use the Viewer.addViewerInputHook() method to create a ViewerInputHook

    // create an OpenSeadragon viewer
    var viewer = window.OpenSeadragon({...});
    // add a ViewerInputHook to the viewer
    var viewerInputHook = viewer.addViewerInputHook({ hooks: [...] });


    // Example 2 - Attach a new ViewerInputHook to an existing OpenSeadragon.Viewer

    var viewerInputHook = new window.OpenSeadragonImaging.ViewerInputHook({ viewer: existingviewer, hooks: [...] });
```

**Example importing as a module**

```
    npm install openseadragon --save
    npm install @openseadragon-imaging/openseadragon-viewerinputhook --save
```

```javascript
import OpenSeadragon from 'openseadragon';
import OpenSeadragonViewerInputHook from '@openseadragon-imaging/openseadragon-viewerinputhook';

    // Example 1 - Use the Viewer.addViewerInputHook() method to create a ViewerInputHook

    // create an OpenSeadragon viewer
    var viewer = OpenSeadragon({...});
    // add a ViewerInputHook to the viewer
    var viewerInputHook = viewer.addViewerInputHook({ hooks: [...] });


    // Example 2 - Attach a new ViewerInputHook to an existing OpenSeadragon.Viewer

    var viewerInputHook = new OpenSeadragonViewerInputHook({ viewer: existingviewer, hooks: [...] });
```

## Details

Event handler callbacks are specified in the hooks property (array) of the options object passed when creating a ViewerInputHook object (see example code below).
Any number of hooks can be specified.

Each hook specification in the array should have three properties - tracker, handler, and hookHandler.

The tracker property of each hook definition can be a reference to any [OpenSeadragon.MouseTracker](https://openseadragon.github.io/docs/OpenSeadragon.MouseTracker.html) instance,
or one of the pre-defined OpenSeadragon viewer trackers - currently 'viewer' or 'viewer_outer'.

The handler property of each hook definition specifies which MouseTracker handler to hook.
Valid values are:

1. 'enterHandler'
2. 'exitHandler'
3. 'pressHandler'
4. 'nonPrimaryPressHandler' (OpenSeadragon v1.2.1+)
5. 'releaseHandler'
6. 'nonPrimaryReleaseHandler' (OpenSeadragon v1.2.1+)
7. 'moveHandler'
8. 'stopHandler'
9. 'scrollHandler'
10. 'clickHandler'
11. 'dblClickHandler'
12. 'dragHandler'
13. 'dragEndHandler'
14. 'pinchHandler'
15. 'keyDownHandler'
16. 'keyUpHandler'
17. 'keyHandler'
18. 'focusHandler'
19. 'blurHandler'

The hookHandler property of each hook definition should be the user-defined event handler callback. All event handler callbacks have the following signature:

    handlerFunc(event)

The ViewerInputHook class inserts your event hook handler methods in front of any existing event handler methods
so the attached handler will be called first. Additional ViewerInputHook objects can be added on the same viewer/MouseTracker to create a chain of hook methods,
where the last added handler(s) will be called first. **Note: If multiple ViewerInputHook are attached to the same viewer/MouseTracker, destroy() should be called for each ViewerInputHook in reverse order of attachment!**

Your hook event handler methods can control the event handling behavior in one or more of the following ways:

1. Set event.stopHandlers = true to prevent any more handlers in the event handler chain from being called
2. Set event.stopBubbling = true to prevent the original DOM event from bubbling up the DOM tree (all handlers returning false will also disable bubbling)
3. Set event.preventDefaultAction = true to prevent the viewer's default action in response to the event (currently applies to clickHandler, dragHandler, and scrollHandler on the viewer (tracker = 'viewer'))

```javascript
    // Example

    var viewer = OpenSeadragon({...});

    viewer.addViewerInputHook({hooks: [
        {tracker: 'viewer', handler: 'scrollHandler', hookHandler: onViewerScroll},
        {tracker: 'viewer', handler: 'clickHandler', hookHandler: onViewerClick}
    ]});

    function onViewerScroll(event) {
        // Disable mousewheel zoom on the viewer and let the original mousewheel events bubble
        if (!event.isTouchEvent) {
            event.preventDefaultAction = true;
            return true;
        }
    }

    function onViewerClick(event) {
        // Disable click zoom on the viewer using event.preventDefaultAction
        event.preventDefaultAction = true;
        event.stopBubbling = true;
    }
```

## Demo/Test Site

The [demo site](https://openseadragon-imaging.github.io/#/imaginghelper) uses
OpenSeadragonViewerInputHook to monitor cursor position and provide custom click and mousewheel event actions.

The source code can be found [here](https://github.com/openseadragon-imaging/openseadragon-imaging/tree/master/site.github.io/src/page-imaginghelper).

## TODO

1. jsdoc documentation
2. Provide hooks on reference strip events
3. Provide hooks on navigator events
