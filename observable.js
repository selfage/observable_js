let HANDLERS = Symbol('handlers');
let OBSERVABLE = Symbol('observable');
let PROPAGATION_HANDLERS = Symbol('propagationHandlers');

module.exports = function makeObservable(obj) {
  if (obj[OBSERVABLE]) {
    return obj;
  }
  obj[OBSERVABLE] = true;

  obj[HANDLERS] = [];
  obj.addPropertyChangeHandler = (handler) => {
  	obj[HANDLERS].push(handler);
  };
  obj.removePropertyChangeHandler = (handler) => {
    let index = obj[HANDLERS].indexOf(handler);
    if (index > -1) {
      obj[HANDLERS].splice(index);
    }
  };
  obj.onPropertyChange = (prop, newValue, oldValue, obj) => {
 		for (let handler of obj[HANDLERS]) {
    	handler(prop, newValue, oldValue, obj);
    }
  };

  obj[PROPAGATION_HANDLERS] = {};
  for (let prop of Object.keys(obj)) {
    if (prop === HANDLERS || prop === OBSERVABLE
        || prop === PROPAGATION_HANDLERS) {
      continue;
    }

    let value = obj[prop];
    if (typeof value === 'object') {
      value = makeObservable(value);
      obj[PROPAGATION_HANDLERS][prop] =
        (nestedProp, nestedNewValue, nestedOldValue, nestedObj) => {
          obj.onPropertyChange(prop, nestedObj, nestedObj, obj);
        };
      value.addPropertyChangeHandler(obj[PROPAGATION_HANDLERS][prop]);
      obj[prop] = value;
    }
  }

  return new Proxy(obj, {
    set: (obj, prop, newValue) => {
      if (typeof newValue === 'object') {
        newValue = makeObservable(newValue);
      }
      let oldValue = obj[prop];
      if (oldValue === newValue) {
        return true;
      }
      
      if (typeof oldValue === 'object') {
        oldValue.removePropertyChangeHandler(obj[PROPAGATION_HANDLERS][prop]);
        if (typeof newValue === 'object') {
          newValue.addPropertyChangeHandler(obj[PROPAGATION_HANDLERS][prop]);
        } else {
          delete obj[PROPAGATION_HANDLERS][prop];
        }
      } else if (typeof newValue === 'object') {
        obj[PROPAGATION_HANDLERS][prop] =
          (nestedProp, nestedNewValue, nestedOldValue, nestedObj) => {
            obj.onPropertyChange(prop, nestedObj, nestedObj, obj);
          };
        newValue.addPropertyChangeHandler(obj[PROPAGATION_HANDLERS][prop]);
      }
      obj[prop] = newValue;
      obj.onPropertyChange(prop, newValue, oldValue, obj);
      return true;
    },
    deleteProperty: (obj, prop) => {
      let oldValue = obj[prop];
      if (typeof oldValue === 'object') {
        oldValue.removePropertyChangeHandler(obj[PROPAGATION_HANDLERS][prop]);
      }
      delete obj[prop];
      delete obj[PROPAGATION_HANDLERS][prop];
      obj.onPropertyChange(prop, undefined, oldValue, obj);
      return true;
    }
  });
}
