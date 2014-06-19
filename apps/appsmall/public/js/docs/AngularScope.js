/**
 * ### AngularJS scoping
 *
 * Directives have linking functions that take the following form:
 *
 * ```
 * link: function(scope, element, attrs) {
 *    [stuff happens here]
 * }
 * ```
 *
 * ...where ```element``` is the HTML tag element this directive was applied to, and ```scope``` and ```attrs``` contain the 
 * Angular-bound names and objects "passed in" to the directive via the HTML tag markup itself.  Angular directive scoping is especially tricky, and 
 * YUIDoc has no good way of documenting Angular scope types.  I have used the names below as my own convention:
 *
 * * 1-way binding to ```attrs``` parameter
 * * 1-way binding to ```attrs``` parameter, with bound watcher event
 * * 1-way name binding to ```attrs``` parameter; object with this name must exist in parent scope
 * * function call expression, must exist in parent scope
 * * must exist in parent scope
 * * must exist in parent scope, with bound watcher event
 * * scoped to directive as 1-way binding
 * * scoped to directive as 1-way binding plus scoped watcher event
 * * scoped to directive as 2-way binding
 * * scoped to directive as 2-way binding plus scoped watcher event
 *
 *...where the following applies:
 * 
 * "1-way binding to ```attrs``` parameter" means that the HTML attribute value gets evaluated within the parent scope (almost always the controller) and bound to the ```attrs```
 * linking parameter object under the camel-cased name.
 *
 * "scoped to directive as X-way binding" indicates that this Angular directive has an inner scope, and the HTML attribute values are bound to this inner scope through the ```scope``` 
 * linking parameter object.  1-way bindings are denoted by {``` scope: {someattr: '@' }```} and pass the literal value, and need Handlebars notation in order to pass the scope-evaluated value.  
 * 2-way bindings are denoted by {``` scope: {someattr: '=' }```} and always scope-evaluated, and are betterfor passing objects through the directive.
 *
 * "must exist in parent scope" indicates that this Angular directive has no inner scope, and that the HTML attribute values are evaluated directly within the parent scope.
 *
 * Bound watcher events are triggered whenever the value changes, within the scope indicated (directive scope or parent scope)
 *
 * See the following for a better explanation of Angular directives and scopes:
 *
 * * Sandeep Panda's Angular directive guide: (http://www.sitepoint.com/practical-guide-angularjs-directives/)
 * * Difference between 1-way and 2-way binding: (http://stackoverflow.com/questions/14050195/what-is-the-difference-between-and-in-directive-scope)
 * * AngularJS Wiki: (https://github.com/angular/angular.js/wiki/Understanding-Directives)
 * * Difference between Angular scope and directive scope: (http://www.thinkster.io/angularjs/aw9kWmdnik/angularjs-scope-vs-scope)
 *
 *
 * @module AppsMallUI.AngularScope
 */
