const assert = require('assert');
const makeObservable = require('./observable');

let callCount = 0;
let callCount2 = 0;
let callCount3 = 0;

let ob = makeObservable({});

function assertNewObjectSet(prop, newValue, oldValue) {
  callCount++;
  assert(prop === 'nobj');
  assert(newValue.yy === 'lol');
  assert(oldValue === undefined);
}
ob.addPropertyChangeHandler(assertNewObjectSet);
ob.nobj = { yy: 'lol' };
assert(callCount === 1);
ob.nobj = ob.nobj;
assert(callCount === 1);
ob.removePropertyChangeHandler(assertNewObjectSet);
callCount = 0;

function assertPropagatedNewObjectFieldChange(prop, newValue, oldValue) {
  callCount++;
  assert(prop === 'nobj');
  assert(newValue.yy === 'lmao');
  assert(newValue === oldValue);
}
function assertNewObjectFieldChange(prop, newValue, oldValue) {
  callCount2++;
  assert(prop === 'yy');
  assert(newValue === 'lmao');
  assert(oldValue === 'lol');
}
ob.addPropertyChangeHandler(assertPropagatedNewObjectFieldChange);
ob.nobj.addPropertyChangeHandler(assertNewObjectFieldChange);
ob.nobj.yy = 'lmao';
assert(callCount === 1);
assert(callCount2 === 1);
ob.removePropertyChangeHandler(assertPropagatedNewObjectFieldChange);
ob.nobj.removePropertyChangeHandler(assertNewObjectFieldChange);
callCount = 0;
callCount2 = 0;

let removed = ob.nobj;
function captureNestedObject(prop, newValue, oldValue) {
  callCount++;
  assert(prop === 'nobj');
  assert(newValue.xx === 'hhhh');
  assert(oldValue.yy === 'lmao');
  assert(oldValue === removed);
}
ob.addPropertyChangeHandler(captureNestedObject);
ob.nobj = { xx: 'hhhh' };
assert(callCount === 1);
ob.removePropertyChangeHandler(captureNestedObject);
callCount = 0;

function assertNoPropagationAfterReplaced() {
  assert.fail();
}
function assertFieldChangeAfterReplaced(prop, newValue, oldValue) {
  callCount++;
  assert(prop === 'yy');
  assert(newValue === 'lll');
  assert(oldValue === 'lmao');
}
ob.addPropertyChangeHandler(assertNoPropagationAfterReplaced);
removed.addPropertyChangeHandler(assertFieldChangeAfterReplaced);
removed.yy = 'lll';
assert(callCount === 1);
ob.removePropertyChangeHandler(assertNoPropagationAfterReplaced);
removed.removePropertyChangeHandler(assertFieldChangeAfterReplaced);
callCount = 0;

function assertPropagatedFieldChange(prop, newValue, oldValue) {
  callCount++;
  assert(prop === 'nobj');
  assert(newValue.xx === 'hmmm');
  assert(newValue === oldValue);
}
function assertFieldChange(prop, newValue, oldValue) {
  callCount2++;
  assert(prop === 'xx');
  assert(newValue === 'hmmm');
  assert(oldValue === 'hhhh');
}
ob.addPropertyChangeHandler(assertPropagatedFieldChange);
ob.nobj.addPropertyChangeHandler(assertFieldChange);
ob.nobj.xx = 'hmmm';
assert(callCount === 1);
assert(callCount2 === 1);
ob.removePropertyChangeHandler(assertPropagatedFieldChange);
ob.nobj.removePropertyChangeHandler(assertFieldChange);
callCount = 0;
callCount2 = 0;

let deleted = ob.nobj;
function assertNoPropagationAfterDeletion() {
  assert.fail();
}
function assertFieldChangeAfterDeletion(prop, newValue, oldValue) {
  callCount++;
  assert(prop === 'xx');
  assert(newValue === 'aha!');
  assert(oldValue === 'hmmm');
}
delete ob.nobj;
ob.addPropertyChangeHandler(assertNoPropagationAfterDeletion);
deleted.addPropertyChangeHandler(assertFieldChangeAfterDeletion);
deleted.xx = 'aha!';
assert(callCount === 1);
ob.removePropertyChangeHandler(assertNoPropagationAfterDeletion);
deleted.removePropertyChangeHandler(assertFieldChangeAfterDeletion);
callCount = 0;

function assertPropagatedFieldChangeAfterAddingBack(prop, newValue, oldValue) {
  callCount++;
  assert(prop === 'nobj');
  assert(newValue.xx === 'haha!');
  assert(newValue === oldValue);
}
function assertFieldChangeAfterAddingBack(prop, newValue, oldValue) {
  callCount2++;
  assert(prop === 'xx');
  assert(newValue === 'haha!');
  assert(oldValue === 'aha!');
}
function assertFieldChangeSeparately(prop, newValue, oldValue) {
  callCount3++;
  assert(prop === 'xx');
  assert(newValue === 'haha!');
  assert(oldValue === 'aha!');
}
ob.nobj = deleted;
ob.addPropertyChangeHandler(assertPropagatedFieldChangeAfterAddingBack);
ob.nobj.addPropertyChangeHandler(assertFieldChangeAfterAddingBack);
deleted.addPropertyChangeHandler(assertFieldChangeSeparately);
ob.nobj.xx = 'haha!';
assert(callCount === 1);
assert(callCount2 === 1);
assert(callCount3 === 1);
ob.removePropertyChangeHandler(assertPropagatedFieldChangeAfterAddingBack);
ob.nobj.removePropertyChangeHandler(assertFieldChangeAfterAddingBack);
deleted.removePropertyChangeHandler(assertFieldChangeSeparately);
callCount = 0;
callCount2 = 0;
callCount3 = 0;

function assertNoPropagationAfterUnset() {
  assert.fail();
}
function assertFieldChangeAfterUnset(prop, newValue, oldValue) {
  callCount++;
  assert(prop === 'xx');
  assert(newValue === 'nana!');
  assert(oldValue === 'haha!');
}
ob.nobj = undefined;
ob.addPropertyChangeHandler(assertNoPropagationAfterUnset);
deleted.addPropertyChangeHandler(assertFieldChangeAfterUnset);
deleted.xx = 'nana!'
assert(callCount === 1);
ob.removePropertyChangeHandler(assertNoPropagationAfterUnset);
deleted.removePropertyChangeHandler(assertFieldChangeAfterUnset);
callCount = 0;
