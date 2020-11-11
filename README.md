# observable_js
Observe objects through ES6 Proxy.

# Usage
## Flat object
```javascript
const {toObservable, isObservable} = require('./observable');

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
const {toObservable} = require('./observable');

const ob = toObservable([11,22,33,44,55]);

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
const {toObservable, isObservable} = require('./observable');

const ob = toObservable({
  num: 100,
  nobj: {
    value: 200
  }
});
console.log(isObservable(ob.nobj));

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
const {toObservable, isObservable} = require('./observable');

const ob = toObservable({num: 100});
ob.nobj = {value: 200};
console.log(isObservable(ob.nobj));
```

Assigning an observable nested object is safe.
```javascript
const {toObservable, isObservable} = require('./observable');

const ob = toObservable({num: 100});
ob.nobj = toObservable({value: 200});
console.log(isObservable(ob.nobj));
```

## delete vs null vs undefined 
```javascript
const {toObservable, isObservable} = require('./observable');

// toObservable(null) results in an error

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

## More use cases
You can find almost all use cases in observable_test.js and observable_test2.js.
