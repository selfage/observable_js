# @selfage/observable_js
Observe objects through ES6 Proxy.

# Function sigatures
```javascript
/**
 * @param {object} obj - Any object except null.
 * @returns {object} observable object
 **/
function toObservable(obj) {}
/**
 * @param {object} obj - Any object except null.
 * @returns {boolean} true if `obj` is observable. See caveats for when it's not accurate.
 **/
function isObservable(obj) {}

/**
 * @callback Handler
 * @param {string} - Prop the name of the changed property.
 * @param {any} newValue - The new value of the changed property.
 * @param {any} oldValue - The supposed old value of the changed proerpty. When propagated, it's the same as
 *   `newValue`.
 * @param {object} obj - The object to which the property belongs. See caveats if you want to use it.
 * @returns {void}
 */
/**
 * Available on an observable object.
 * @param {Handler} handler - To be be invoked when there is a change on any properties belonged to the
 *   observable object.
 * @returns {void} after calling all added handlers and don't wait for async operations.
 **/
function addPropertyChangeHandler(handler) {}
/**
 * Available on an observable object. Removing takes O(n) time where n is the number of all handlers added to
 * the observable object.
 * @param {Function} handler - Must have the same reference to a handler added above.
 * @returns {void}
 **/
function removePropertyChangeHandler(handler) {}
```

# Usage
## Flat object
```javascript
const {toObservable, isObservable} = require('@selfage/observable_js');

const ob = toObservable({num: 100, str: 'lol', bul: false});
console.log(isObservable(ob));
// Print true

function logChange(prop, newValue, oldValue) {
  console.log(`${prop} is changed from ${oldValue} to ${newValue}.`);
}
ob.addPropertyChangeHandler(logChange);
ob.num = 200;
// Print "num is changed from 100 to 200."
ob.num2 = 300;
// Print "num2 is changed from undefined to 300."
ob.removePropertyChangeHandler(logChange);
ob.num = 150;
// Nothing to print.
```

## Array
Array is just an object, except that its `length` property can be updated when push() or pop(). Note that its index is treated as a string.
```javascript
const {toObservable, isObservable} = require('@selfage/observable_js');

const ob = toObservable([11,22,33,44,55]);
console.log(isObservable(ob));
// Print true

function logChange(prop, newValue, oldValue) {
  console.log(`${prop}[${typeof prop}] is changed from ${oldValue} to ${newValue}.`);
}
ob.addPropertyChangeHandler(logChange);
ob[2] = 100;
// Print "2[string] is changed from 33 to 100.";
ob.push(66);
// Print "5[string] is changed from undefined to 66."
// Oddly it might not print length.
ob.pop();
// Print "5[string] is changed from 66 to undefined."
// Print "length[string] is changed from 6 to 5".
```

## Nested object
All nested objects will be observable. Changes in nested objects are propagated/bubbled up until the top-level object. However, newValue and oldValue refer to the same nested object after propagating/bubbling up.
```javascript
const {toObservable, isObservable} = require('@selfage/observable_js');

const ob = toObservable({
  num: 100,
  nobj: {
    value: 200
  }
});
console.log(isObservable(ob.nobj));
// Print "true"

function logChange(prop, newValue, oldValue) {
  console.log(`${prop} is changed from ${JSON.stringify(oldValue)} to ${JSON.stringify(newValue)}.`);
}
ob.addPropertyChangeHandler(logChange);
ob.nobj.addPropertyChangeHandler(logChange);
ob.nobj.value = 300;
// Print "value is changed from 200 to 300."
// Print "nobj is changed from {"value":300} to {"value":300}."
```

## Add nested object
Add/Assign a nested object will automatically convert it to be observable.
```javascript
const {toObservable, isObservable} = require('@selfage/observable_js');

const ob = toObservable({num: 100});
ob.nobj = {value: 200};
console.log(isObservable(ob.nobj));
// Print "true"
```

Assigning an observable nested object is safe.
```javascript
const {toObservable, isObservable} = require('@selfage/observable_js');

const ob = toObservable({num: 100});
ob.nobj = toObservable({value: 200});
console.log(isObservable(ob.nobj));
// Print "true"
```

# Caveats
## delete vs null vs undefined 
```javascript
const {toObservable, isObservable} = require('@selfage/observable_js');

// toObservable(null) results in an error. Never use null.

const ob = toObservable({num: 100});

function logChange(prop, newValue, oldValue) {
  console.log(`${prop} is changed from ${oldValue} to ${newValue}.`);
}
ob.addPropertyChangeHandler(logChange);
delete ob.num;
// Print "num is changed from 100 to undefined".
ob.num = undefined.
// Nothing to print, since ob.num === undefined already.
// If we set `ob.num = undefined` first and `delete ob.num`, logChange() will also not be invoked
// for `delete ob.num`.
delete ob.num;
// Still nothing to print.
// You should decide to delete or set to undefined, depending on how you would deal with
// `'num' in ob` or `Object.keys()`.
```

## Is object passed to handlers observable?
```javascript
const {toObservable, isObservable} = require('@selfage/observable_js');

const ob = toObservable({
  num: 100,
  nobj: {
    value: 200
  }
});

let capturedTopLevel = {obj: undefined, nestedObj: undefined};
function captureTopLevel(prop, newValue, oldValue, obj) {
  capturedTopLevel.obj = obj;
  capturedTopLevel.nestedObj = newValue;
}
let capturedSecondLevel = {obj: undefined};
function captureSecondLevel(prop, newValue, oldValue, obj) {
  capturedTopLevel.obj = obj;
}
ob.addPropertyChangeHandler(captureTopLevel);
ob.nobj.addPropertyChangeHandler(captureSecondLevel);
ob.nobj.value = 300;
ob.removePropertyChangeHandler(captureTopLevel);
ob.nobj.removePropertyChangeHandler(captureSecondLevel);

let topLevelCount = 0;
function countTopLevelChange() {
  topLevelCount++;
}
let secondLevelCount = 0;
function countSecondLevelChange() {
  secondLevelCount++;
}
ob.addPropertyChangeHandler(countTopLevelChange);
ob.nobj.addPropertyChangeHandler(countSecondLevelChange);
ob.nobj.value = 400;
// topLevelCount === 1 && secondLevelCount === 1
capturedSecondLevel.obj.value = 500;
// No change: topLevelCount === 1 && secondLevelCount === 1
capturedTopLevel.obj.num = 0;
// No change: topLevelCount === 1 && secondLevelCount === 1
capturedTopLevel.nestedObj.value = 600;
// topLevelCount === 2 && secondLevelCount === 2
// Conclusion: The fourth parameter `obj` is not trully observable, although
// `isObservable(capturedTopLevel.obj)` and `isObservable(capturedSecondLevel.obj)` are both true;
```

# More cases
You can find almost all use cases in [observable_test.js](https://github.com/teststaybaka/observable_js/blob/main/observable_test.js) and [observable_test2.js](https://github.com/teststaybaka/observable_js/blob/main/observable_test2.js).
