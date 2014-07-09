##Extending the Ozone HUD
The Ozone HUD is the container in which applications run inside of to provide a consistent interface and access to common applications and utilities.  Ozone HUD components were initially implemented using the x-tag Web Component/polyfill framework from Mozilla.  When the team started experiencing a few issues with it, including older browser support, we decided that, in order to avoid having to rewrite the components, we would provide a lightweight replacement for x-tags.  That replacement is called micro-xtags.  You can refer to the documentation at x-tag.org for general information, but micro-xtags does not fully implement the x-tag functionality.

###If it's not xtags or Web Components, how is it different?
In a true Web component framework, a custom HTML element behaves fully like an HTML element as well has having JavaScript object-like functionalities, such as the ability to have custom methods.  In micro-xtags, generally speaking, this unity is broken.  The object you get from a call to microXTag.getComponent is an mxtElement wrapper for the custom tag.  For convenience, a number of DOM element methods have been added to the mxtElement type which will be applied to the wrapped DOM element, notably setAttribute and getAttribute, but if you use pure DOM methods to find a custom element (e.g., document.getElementsByTagName('ozone-example')), any custom methods you have defined (in the 'methods' section of the registration object) cannot be called on the element.  However, there is a convenience method, 'microXTag.getMxtFromElement' which can be called with the DOM element as the argument, to get the mxtElement to call its methods.

You may reference other custom tags within the HTML markup of your component; however, these references must contain the attribute 'x-micro-tags="true"' in order for them to be automatically stood up as micro-xtag objects.

There is no direct support for xtag-style event registration.  This may be done in traditional ways inside the 'inserted' lifecycle method.

So far, only the 'query', 'addClass' and 'removeClass' utility functions from xtags are implemented on the microXTag namespace.

If you are dynamically inserting a custom element into the page, you must ensure that the "inserted" callback of the corresponding JS object gets fired.  There are currently three ways of doing that:

1. Instead of using parentElement.appendChild(customRawElement), you can use microXTag.appendChild(parentElement, newMxtElement), where newMxtElement is the object returned from a getComponent or getMxtFromElement

2. Again, instead of appendChild, use the jQuery-style appendTo method of the mxtElement, newMxtElement.appendTo(parentElement).

3. If you need to use an insertion method which may not be supported by micro-xtags, such as insertBefore, you can use such a method to insert the raw element manually, but then you must call the onInsert method of the corresponding mxtElement object.


###The Setup
The following assumes we're creating a component called ozone-example and walks through setting up, registering the component and outputting "Hello, World!" within the HUD when navigating to ```http://localhost:3000/#/Example/```.

####Create the required files
Create the supporting files that will contain everything about the component. Navigate to ```public/ozone-hid/components/``` and create 3 files: ```ozone-example.html```, ```ozone-example.js``` and ```ozone-example.css```.

####Linking supporting files
Link to the supporting files from within the html page. Also we need to wrap our content in a template tag that has an id of ```ozone-example-tmpl```. Your HTML should look as follows (notice we're also hiding the content initially):

```
<script type="text/javascript" src="ozone-example.js"></script>
<link rel="stylesheet" href="ozone-example.css">
<!-- Use a script tag of type "text/template" in place of a template tag, since the behavior of the template tag is undefined on earlier browsers -->
<script type="text/template" id="ozone-example-tmpl">
<div id="ozone-example-block" style="display: none;">
    <h1>Hello, Example!</h1>
</div>
</script>
```

####Next let's set up the JavaScript registration
We need to tell the micro-xtags API to register a lifecycle for our component. In this example we will only use the "created" stage of the lifecycle but more exist and can be used by taking a look at x-tag documentation (www.x-tags.org).

The following code is a bare-bones example of our component's JavaScript to display "Hello, World!" when navigating to ```http://localhost:3000/#/Example/```:

```
(function () {
    microXTag.register("ozone-example", "ozone-example-tmpl", {
        lifecycle: {
            created: function() {
                component.init();
            }
        }
    });

    microXTag.ready(function () {
        microXTag.standUpTags(document.getElementsByTagName('ozone-example'));
    });

    var component = (function () {
        return {
            init: function () {
                pubsub.subscribe("navigate", function (hash) {
                    component.navigate(hash);
                });
            },
            navigate: function (hash) {
                if (hash !== undefined && hash.indexOf("#Example/") !== -1) {
                    component.showGui();
                } else {
                    component.hideGui();
                }
            },
            showGui: function () {
                var gui = document.getElementById("ozone-example-block");
                if (!Ozone.utils.isUndefinedOrNull(gui)) {
                    gui.style.display = "block";
                }
            },
            hideGui: function () {
                var gui = document.getElementById("ozone-example-block");
                if (!Ozone.utils.isUndefinedOrNull(gui)) {
                    gui.style.display = "none";
                }
            }
        };
    }());
}());
```

####Now what?
There are now two things we need to do to get your component included and rendered into the container.

First, pull the HTML part of the component in by adding it to the list of imported files in the call to microXTag.loadImports.  This will usually be called in the inline script on the main page.

Second, place your component's tag wherever you want / need within the container's ```index.html``` to use it! The typical thing to do, since it's hidden by default, is to simply drop the tag reference at the bottom with the rest of the components which are loaded on this page which looks like this: ```<ozone-example></ozone-example>```

####That's it!
Now load up your server and navigate to ```http://localhost:3000/#/Example/``` and you'll get a page that says "Hello, World!" in which you can do whatever you want.

####Wait, what's the pubsub stuff?
So to make true decoupled components you want to use messaging to handle cross communication to allow true component replacement. The basic solution used in the HUD is a simple implementation of a publish and subscribe pattern where one component can subscribe to a channel and receive information from another component via publish.

This should NOT be confused with Ozone messaging; this is ONLY a HUD paradigm to support cross component communication where server-side connection and persistence were not required. So while you can expose or make new ones there are some provided by xtagger and the default components which are as follows:

- Channel "navigate" -> Received anytime the hash in the URL is updated; each main HUD component should handle this channel and appropriately show or hide its content.
- Channel "showPersonaMenu" -> Shows the menu displayed typically when the user's name is clicked within the HUD.
- Channel "hidePersonaMenu" -> Hides the menu displayed typically displayed when the user's name is clicked within the HUD.
- Channel "addToPersonaMenu" -> Supports adding a new item to the persona menu and expects an object in the following format: ```{ label: "My Menu", channel: "My pubsub channel" }```.
- Channel "showBar" -> Shows the HUD bar.
- Channel "hideBar" -> Hides the HUD bar.
- Channel "showMask" -> Shows the mask displayed below a component. The following z-indexes should be kept in mind when working with the mask (always keep custom components above the mask's z-index and below the bar's z-mask):
    - A loaded application's z-index: 1000
    - The mask's z-index: 5000
    - The bar's mask: 9000
- Channel "hideMask" -> Hides the mask displayed below a component.

####I'm still confused
No worries; the full ozone-example component is included and registered, by default, in the Ozone build. So feel free to explore the code!

####Extras: animate.js
The HUD was designed to be as light weight and dependency-free as possible to support future inclusion into other web applications as a simple JavaScript include. Due to this, a simple way of animating things was created which consists of two methods available to all components:

```animate(options, callback, context).move()``` -> The animate method accepts a variety of options to specify a specific element by id or reference, the unit of movement, the style to affect, the target value of the style, direction, rate, step, etc; these are the basic items required of animation. Once the appropriate values are specified then calling move() will start the animation.

```animate(options, callback, context).cancel()``` -> The animate method signature is the same here but cancel will cancel the animation that is currently underway.

Example:
```
animate({
    elementId: "ozone-bar-closed",
    unit: "px",
    style: "marginBottom",
    startValue: -16,
    targetValue: 0,
    rate: 20,
    step: 2
}, function () {
    console.log("Moved!");
}).move();
```
