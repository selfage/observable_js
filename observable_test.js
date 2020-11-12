const assert = require('assert');
const {toObservable, isObservable} = require('./observable');

let rawObj = {
  num: 12,
  arr: [123, 32],
  nobj: {
    num: 111,
    anobj: {
      num: 90
    }
  },
};
assert(!isObservable(rawObj));
assert(!isObservable(rawObj.arr));
assert(!isObservable(rawObj.nobj));
assert(!isObservable(rawObj.nobj.anobj));

let ob = toObservable(rawObj);
assert(isObservable(ob));
assert(isObservable(ob.arr));
assert(isObservable(ob.nobj));
assert(isObservable(ob.nobj.anobj));

let callCount = 0;
let callCount2 = 0;
let callCount3 = 0;

function assertNumberChange(prop, newValue, oldValue, obj) {
  callCount++;
  assert(prop === 'num');
  assert(newValue === 13);
  assert(oldValue === 12);
}
ob.addPropertyChangeHandler(assertNumberChange);
ob.num = 13;
assert(callCount === 1);
ob.num = 13;
assert(callCount === 1);
ob.removePropertyChangeHandler(assertNumberChange);
ob.num = 15;
callCount = 0;

function assertPropagatedArrayPush(prop, newValue, oldValue) {
  callCount++;
  assert(prop === 'arr');
  assert(newValue[0] === 123);
  assert(newValue[1] === 32);
  assert(newValue[2] === 11);
  assert(newValue === oldValue);
}
function assertArrayPush(prop, newValue, oldValue) {
  callCount2++;
  assert(prop === '2' || prop === 'length');
  assert(newValue === 11 || newValue === 3);
  assert(oldValue === undefined || oldValue === 2);
}
ob.addPropertyChangeHandler(assertPropagatedArrayPush);
ob.arr.addPropertyChangeHandler(assertArrayPush);
ob.arr.push(11);
// A bug in Node? Should be called twice. One for array index change. One for
// array length change.
assert(callCount === 1);
assert(callCount2 === 1);
ob.removePropertyChangeHandler(assertPropagatedArrayPush);
ob.arr.removePropertyChangeHandler(assertArrayPush);
callCount = 0;
callCount2 = 0;

function assertPropagatedArrayPop(prop, newValue, oldValue) {
  callCount++;
  assert(prop === 'arr');
  assert(newValue[0] === 123);
  assert(newValue[1] === 32);
  assert(!('2' in newValue));
  assert(newValue === oldValue);
}
function assertArrayPop(prop, newValue, oldValue) {
  callCount2++;
  assert(prop === '2' || prop === 'length');
  assert(newValue === undefined || newValue === 2);
  assert(oldValue === 11 || oldValue === 3);
}
ob.addPropertyChangeHandler(assertPropagatedArrayPop);
ob.arr.addPropertyChangeHandler(assertArrayPop);
ob.arr.pop();
// Called twice. One for array index change. One for array length change.
assert(callCount === 2);
assert(callCount2 === 2);
ob.removePropertyChangeHandler(assertPropagatedArrayPop);
ob.arr.removePropertyChangeHandler(assertArrayPop);
callCount = 0;
callCount2 = 0;

function assertPropagateElementChange(prop, newValue, oldValue) {
  callCount++;
  assert(prop === 'arr');
  assert(newValue[0] === 123);
  assert(newValue[1] === 100);
  assert(newValue.length === 2);
  assert(newValue === oldValue);
}
function assertArrayElementChange(prop, newValue, oldValue) {
  callCount2++;
  assert(prop === '1');
  assert(newValue === 100);
  assert(oldValue === 32);
}
ob.addPropertyChangeHandler(assertPropagateElementChange);
ob.arr.addPropertyChangeHandler(assertArrayElementChange);
ob.arr[1] = 100;
assert(callCount === 1);
assert(callCount2 === 1);
ob.removePropertyChangeHandler(assertPropagateElementChange);
ob.arr.removePropertyChangeHandler(assertArrayElementChange);
callCount = 0;
callCount2 = 0;

let capturedTop = {obj: undefined, nested: undefined};
function assertPropagatedNumberChange(prop, newValue, oldValue, obj) {
  callCount++;
  assert(prop === 'nobj');
  assert(newValue.anobj.num === 80);
  assert(newValue === oldValue);
  capturedTop.obj = obj;
  capturedTop.nested = newValue;
}
let capturedMiddle = {obj: undefined, nested: undefined};
function assertMiddleLevelNumberChange(prop, newValue, oldValue, obj) {
  callCount2++;
  assert(prop === 'anobj');
  assert(newValue.num === 80);
  assert(newValue === oldValue);
  capturedMiddle.obj = obj;
  capturedMiddle.nested = newValue;
}
let capturedBottom = {obj: undefined};
function assertNestedNumberChange(prop, newValue, oldValue, obj) {
  callCount3++;
  assert(prop === 'num');
  assert(newValue === 80);
  assert(oldValue === 90);
  capturedBottom.obj = obj;
}
ob.addPropertyChangeHandler(assertPropagatedNumberChange);
ob.nobj.addPropertyChangeHandler(assertMiddleLevelNumberChange);
ob.nobj.anobj.addPropertyChangeHandler(assertNestedNumberChange);
ob.nobj.anobj.num = 80;
assert(callCount === 1);
assert(callCount2 === 1);
assert(callCount3 === 1);
ob.removePropertyChangeHandler(assertPropagatedNumberChange);
ob.nobj.removePropertyChangeHandler(assertMiddleLevelNumberChange);
ob.nobj.anobj.removePropertyChangeHandler(assertNestedNumberChange);
callCount = 0;
callCount2 = 0;
callCount3 = 0;

function countTopLevelChange() {
  callCount++;
}
function countMiddleLevelChange() {
  callCount2++;
}
function countBottomLevelChange() {
  callCount3++;
}
ob.addPropertyChangeHandler(countTopLevelChange);
ob.nobj.addPropertyChangeHandler(countMiddleLevelChange);
ob.nobj.anobj.addPropertyChangeHandler(countBottomLevelChange);
capturedBottom.obj.num = 100;
capturedMiddle.obj.num = 222;
capturedTop.obj.num = 23;
assert(callCount === 0);
assert(callCount2 === 0);
assert(callCount3 === 0);
capturedMiddle.nested.num = 110;
capturedTop.nested.num = 34;
assert(callCount === 2);
assert(callCount2 === 2);
assert(callCount3 === 1);
ob.removePropertyChangeHandler(countTopLevelChange);
ob.nobj.removePropertyChangeHandler(countMiddleLevelChange);
ob.nobj.anobj.removePropertyChangeHandler(countBottomLevelChange);
callCount = 0;
callCount2 = 0;
callCount3 = 0;

function assertNewString(prop, newValue, oldValue, obj) {
  callCount++;
  assert(prop === 'newString');
  assert(newValue === 'hhhh');
  assert(oldValue === undefined);
  assert(prop in obj);
}
ob.addPropertyChangeHandler(assertNewString);
ob.newString = 'hhhh';
assert(callCount === 1);
ob.removePropertyChangeHandler(assertNewString);
callCount = 0;

function assertUnsetNewString(prop, newValue, oldValue, obj) {
  callCount++;
  assert(prop === 'newString');
  assert(newValue === undefined);
  assert(oldValue === 'hhhh');
  assert(prop in obj);
}
ob.addPropertyChangeHandler(assertUnsetNewString);
ob.newString = undefined;
assert(callCount === 1);
ob.newString = undefined;
assert(callCount === 1);
delete ob.newString;
assert(callCount === 1);
ob.removePropertyChangeHandler(assertUnsetNewString);
callCount = 0;

function assertDeleteNewString(prop, newValue, oldValue, obj) {
  callCount++;
  assert(prop === 'newString');
  assert(newValue === undefined);
  assert(oldValue === 'back');
  assert(!(prop in obj));
}
ob.newString = 'back';
ob.addPropertyChangeHandler(assertDeleteNewString);
delete ob.newString;
assert(callCount === 1);
delete ob.newString;
assert(callCount === 1);
ob.newString === undefined;
assert(callCount === 1);
ob.removePropertyChangeHandler(assertDeleteNewString);
callCount = 0;

function assertPropagatedNewString(prop, newValue, oldValue) {
  callCount++;
  assert(prop === 'nobj');
  assert(newValue.newString === 'xxxx');
  assert(newValue === oldValue);
}
function assertNestedNewString(prop, newValue, oldValue, obj) {
  callCount2++;
  assert(prop === 'newString');
  assert(newValue === 'xxxx');
  assert(oldValue === undefined);
  assert(prop in obj);
}
ob.addPropertyChangeHandler(assertPropagatedNewString);
ob.nobj.addPropertyChangeHandler(assertNestedNewString);
ob.nobj.newString = 'xxxx';
assert(callCount === 1);
assert(callCount2 === 1);
ob.removePropertyChangeHandler(assertPropagatedNewString);
ob.nobj.removePropertyChangeHandler(assertNestedNewString);
callCount = 0;
callCount2 = 0;
