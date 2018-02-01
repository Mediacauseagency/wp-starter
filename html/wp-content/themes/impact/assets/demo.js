(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

require('./helpers/htmlToText')();
require('./helpers/data/prettyNumber')();
require('./helpers/data/swapText')();
require('./helpers/data/incrementAnimation')();

var _require = require('./helpers/data/toggleClasses'),
    dataToggleClassesSelf = _require.dataToggleClassesSelf,
    dataToggleClassesTarget = _require.dataToggleClassesTarget;

dataToggleClassesSelf();
dataToggleClassesTarget();

},{"./helpers/data/incrementAnimation":3,"./helpers/data/prettyNumber":4,"./helpers/data/swapText":5,"./helpers/data/toggleClasses":6,"./helpers/htmlToText":7}],2:[function(require,module,exports){
'use strict';

// cbs should be an array of callbacks
// debounce can be between 1 - 10, 1 being most frequent and 10 being least
var addScrollEvents = function addScrollEvents(cbs) {
  var debounce = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3;

  var i = 0;
  window.document.addEventListener('scroll', function () {
    debounce = debounce > 10 ? 10 : debounce;
    debounce = debounce < 1 ? 1 : debounce;
    i += 1;
    if (i % debounce === 0) return;
    cbs.forEach(function (cb) {
      return cb();
    });
  });
};

module.exports = addScrollEvents;

},{}],3:[function(require,module,exports){
'use strict';

// adds commas to numbers
var formatNumber = require('format-number')();
var addScrollEvents = require('../addScrollEvents');
var toggleInView = require('../toggleInView');

var attr = 'data-increment';

var getExtraAttr = function getExtraAttr(elm, extra) {
  return (elm.getAttribute(attr + '-' + extra) || '').trim();
};

var animate = function animate(time, goal, incrementBy, elm, start) {
  window.setTimeout(function () {
    var currentStep = start + incrementBy;
    var currentStepCapped = currentStep >= goal ? goal : currentStep;
    var suffix = getExtraAttr(elm, 'suffix');
    var prefix = getExtraAttr(elm, 'prefix');
    elm.innerText = '' + (prefix ? prefix : '') + formatNumber(currentStepCapped) + (suffix ? suffix : '');
    if (currentStepCapped < goal) {
      // ease out function
      var newTime = start < goal / 1.75 ? time : time * 1.15;
      animate(newTime, goal, incrementBy, elm, currentStepCapped);
    }
  }, time);
};

var incrementOnScroll = function incrementOnScroll() {
  return addScrollEvents([function () {
    return toggleInView('[' + attr + ']', incrementOnScrollCb);
  }]);
};

var incrementOnScrollCb = function incrementOnScrollCb(elm, inView, i) {
  var envKey = 'increment_animation_running_' + i;
  window.ENV = window.ENV ? window.ENV : {};

  if (!inView) {
    window.ENV[envKey] = false;
    return;
  }

  if (window.ENV[envKey]) return;

  window.ENV[envKey] = true;

  var goal = Number(elm.getAttribute('' + attr) || 0);

  if (!Number.isInteger(goal)) {
    return console.warn('the ' + attr + ' attribute must be an integer');
  }

  // the number of steps in the animation
  var incrementBy = Math.ceil(goal / 30);

  animate(60, goal, incrementBy, elm, 0);
};

module.exports = incrementOnScroll;

},{"../addScrollEvents":2,"../toggleInView":10,"format-number":11}],4:[function(require,module,exports){
'use strict';

var prettyNumber = require('../prettyNumber');

var dataPrettyNumber = function dataPrettyNumber() {
  return document.querySelectorAll('[data-pretty-number]').forEach(function (elm) {
    var string = elm.getAttribute('data-pretty-number');
    elm.innerHTML = prettyNumber(string);
  });
};

module.exports = dataPrettyNumber;

},{"../prettyNumber":8}],5:[function(require,module,exports){
'use strict';

var style = require('../style');

var replaceText = function replaceText(text, parent) {
  var child = document.createElement('div');
  child.innerText = text;
  style(child, {
    position: 'absolute',
    left: 0,
    top: 0
  });
  child.className = 'js-swap-text-child';
  var previousChild = parent.querySelector('.js-swap-text-child');
  previousChild && previousChild.remove();
  parent.appendChild(child);
};

var show = function show(text, len, elm, i, timeout) {
  window.setTimeout(function () {
    replaceText(text[i], elm);
    var child = elm.querySelector('.js-swap-text-child');
    child.classList.add('fade-in');
    child.classList.remove('fade-out');
    window.setTimeout(function () {
      child.classList.add('fade-out');
      child.classList.remove('fade-in');
    }, timeout - 300);
    show(text, len, elm, ++i % len, timeout);
  }, timeout);
};

var swapText = function swapText() {
  var elms = document.querySelectorAll('[data-swap-text]');
  var timeoutElm = document.querySelectorAll('[data-swap-text-timeout]')[0];
  var timeout = timeoutElm ? timeoutElm.getAttribute('data-swap-text-timeout') : 2000;
  elms.forEach(function (elm) {
    var i = 0;
    var text = (elm.getAttribute('data-swap-text') || '').split(/\.|,/).filter(Boolean).map(function (s) {
      return s.trim();
    });
    var longest = text.reduce(function (longest, current) {
      return current.length >= longest.length ? current : longest;
    }, '');
    elm.style.position = 'relative';
    var spacer = document.createElement('div');
    spacer.innerText = longest;
    spacer.style.visibility = 'hidden';
    elm.appendChild(spacer);
    replaceText(text[0], elm);
    var len = text.length;
    window.setTimeout(function () {
      var child = elm.querySelector('.js-swap-text-child');
      child.classList.add('fade-out');
    }, timeout - 300);
    show(text, len, elm, ++i, timeout);
  });
};

module.exports = swapText;

},{"../style":9}],6:[function(require,module,exports){
'use strict';

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

var checkHref = function checkHref(ev) {
  var href = (ev.target.attributes['href'].value || '').trim();
  return href && href !== '#';
};

var getClassNames = function getClassNames(elm, attr) {
  return elm.getAttribute(attr).split(' ');
};

var dataToggleClassesSelf = function dataToggleClassesSelf() {
  return document.querySelectorAll('[data-toggle-classes-self]').forEach(function (elm) {
    elm.addEventListener('click', function (ev) {
      if (checkHref(ev)) return;
      ev.preventDefault();
      var classNames = getClassNames(elm, 'data-toggle-classes-self');
      classNames.forEach(function (className) {
        elm.classList.toggle(className.trim());
      });
    });
  });
};

var dataToggleClassesTarget = function dataToggleClassesTarget() {
  return document.querySelectorAll('[data-toggle-classes-target]').forEach(function (elm) {
    elm.addEventListener('click', function (ev) {
      if (checkHref(ev)) return;
      ev.preventDefault();

      var _getClassNames = getClassNames(elm, 'data-toggle-classes-target'),
          _getClassNames2 = _toArray(_getClassNames),
          targetSelector = _getClassNames2[0],
          classNames = _getClassNames2.slice(1);

      var targets = document.querySelectorAll(targetSelector);
      classNames.forEach(function (className, i) {
        targets.forEach(function (target) {
          target.classList.toggle(className.trim());
        });
      });
    });
  });
};

module.exports = {
  dataToggleClassesSelf: dataToggleClassesSelf,
  dataToggleClassesTarget: dataToggleClassesTarget
};

},{}],7:[function(require,module,exports){
'use strict';

var htmlToText = function htmlToText() {
  document.querySelectorAll('.js-html').forEach(function (elm) {
    var pre = document.createElement('pre');
    var code = document.createElement('code');
    code.innerText = elm.innerHTML;
    pre.appendChild(code);
    elm.insertBefore(pre, elm.childNodes[0]);
  });
};

module.exports = htmlToText;

},{}],8:[function(require,module,exports){
'use strict';

var addCommas = require('format-number')();
var round = function round(num) {
  return Math.round(num * 10) / 10;
};

// takes a number and returns a formatted string:
//   1234 => '1,234'
//   12345 => '1.2K'
//   1234567 => '1.2M'
var prettyNumber = function prettyNumber(num) {
  if (!num) return '0';
  if (num <= 9999) return addCommas(num);
  if (num <= 999999) return round(num * 0.001) + 'K';
  return addCommas(round(num * 0.000001)) + 'M';
};

module.exports = prettyNumber;

},{"format-number":11}],9:[function(require,module,exports){
"use strict";

var style = function style(elm) {
  var obj = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return Object.keys(obj).map(function (key) {
    elm && elm.style && (elm.style[key] = obj[key]);
  });
};

module.exports = style;

},{}],10:[function(require,module,exports){
"use strict";

// takes a selector and a callback that gets called
// with three args: 
// 1. elm
// 2. whether the elm is in view
// 3. the index of that elm on the page
var toggleInView = function toggleInView(selector, cb) {
  var elms = document.querySelectorAll(selector);
  elms.forEach(function (elm, i) {
    var scrollTop = window.document.body.scrollTop + window.innerHeight;
    var elmTop = findOffset(elm);
    var inView = scrollTop >= elmTop;
    cb(elm, inView, i);
  });
};

var findOffset = function findOffset(elm) {
  if (elm.offsetTop) return elm.offsetTop;
  return findOffset(elm.offsetParent);
};

module.exports = toggleInView;

},{}],11:[function(require,module,exports){

module.exports = formatter;
module.exports.default = formatter;

function formatter(options) {
  options = options || {};


  // *********************************************************************************************
  // Set defaults for negatives
  // options.negative, options.negativeOut, options.separator retained for backward compatibility
  // *********************************************************************************************

  // type of negative; default left
  options.negativeType = options.negativeType || (options.negative === 'R' ? 'right' : 'left')

  // negative symbols '-' or '()'
  if (typeof options.negativeLeftSymbol !== 'string') {
    switch (options.negativeType) {
      case 'left':
        options.negativeLeftSymbol = '-';
        break;
      case 'brackets':
        options.negativeLeftSymbol = '(';
        break;
      default:
        options.negativeLeftSymbol = '';
    }
  }
  if (typeof options.negativeRightSymbol !== 'string') {
    switch (options.negativeType) {
      case 'right':
        options.negativeRightSymbol = '-';
        break;
      case 'brackets':
        options.negativeRightSymbol = ')';
        break;
      default:
        options.negativeRightSymbol = '';
    }
  }

  // whether negative symbol should be inside/outside prefix and suffix

  if (typeof options.negativeLeftOut !== "boolean") {
    options.negativeLeftOut = (options.negativeOut === false ? false : true);
  }
  if (typeof options.negativeRightOut !== "boolean") {
    options.negativeRightOut = (options.negativeOut === false ? false : true);
  }

  //prefix and suffix
  options.prefix = options.prefix || '';
  options.suffix = options.suffix || '';

  //separators
  if (typeof options.integerSeparator !== 'string') {
    options.integerSeparator = (typeof options.separator === 'string' ? options.separator : ',');
  }
  options.decimalsSeparator = typeof options.decimalsSeparator === 'string' ? options.decimalsSeparator : '';
  options.decimal = options.decimal || '.';

  //padders
  options.padLeft = options.padLeft || -1 //default no padding
  options.padRight = options.padRight || -1 //default no padding

  function format(number, overrideOptions) {
    overrideOptions = overrideOptions || {};

    if (number || number === 0) {
      number = '' + number;//convert number to string if it isn't already
    } else {
      return '';
    }

    //identify a negative number and make it absolute
    var output = [];
    var negative = number.charAt(0) === '-';
    number = number.replace(/^\-/g, '');

    //Prepare output with left hand negative and/or prefix
    if (!options.negativeLeftOut && !overrideOptions.noUnits) {
      output.push(options.prefix);
    }
    if (negative) {
      output.push(options.negativeLeftSymbol);
    }
    if (options.negativeLeftOut && !overrideOptions.noUnits) {
      output.push(options.prefix);
    }

    //Format core number
    number = number.split('.');
    if (options.round != null) round(number, options.round);
    if (options.truncate != null) number[1] = truncate(number[1], options.truncate);
    if (options.padLeft > 0) number[0] = padLeft(number[0], options.padLeft);
    if (options.padRight > 0) number[1] = padRight(number[1], options.padRight);
    if (!overrideOptions.noSeparator && number[1]) number[1] = addDecimalSeparators(number[1], options.decimalsSeparator);
    if (!overrideOptions.noSeparator && number[0]) number[0] = addIntegerSeparators(number[0], options.integerSeparator);
    output.push(number[0]);
    if (number[1]) {
      output.push(options.decimal);
      output.push(number[1]);
    }

    //Prepare output with right hand negative and/or prefix
    if (options.negativeRightOut && !overrideOptions.noUnits) {
      output.push(options.suffix);
    }
    if (negative) {
      output.push(options.negativeRightSymbol);
    }
    if (!options.negativeRightOut && !overrideOptions.noUnits) {
      output.push(options.suffix);
    }

    //join output and return
    return output.join('');
  }

  format.negative = options.negative;
  format.negativeOut = options.negativeOut;
  format.negativeType = options.negativeType;
  format.negativeLeftOut = options.negativeLeftOut;
  format.negativeLeftSymbol = options.negativeLeftSymbol;
  format.negativeRightOut = options.negativeRightOut;
  format.negativeRightSymbol = options.negativeRightSymbol;
  format.prefix = options.prefix;
  format.suffix = options.suffix;
  format.separate = options.separate;
  format.integerSeparator = options.integerSeparator;
  format.decimalsSeparator = options.decimalsSeparator;
  format.decimal = options.decimal;
  format.padLeft = options.padLeft;
  format.padRight = options.padRight;
  format.truncate = options.truncate;
  format.round = options.round;

  function unformat(number, allowedSeparators) {
    allowedSeparators = allowedSeparators || [];
    if (options.allowedSeparators) {
      options.allowedSeparators.forEach(function (s) { allowedSeparators.push (s); });
    }
    allowedSeparators.push(options.integerSeparator);
    allowedSeparators.push(options.decimalsSeparator);
    number = number.replace(options.prefix, '');
    number = number.replace(options.suffix, '');
    var newNumber = number;
    do {
      number = newNumber;
      for (var i = 0; i < allowedSeparators.length; i++) {
        newNumber = newNumber.replace(allowedSeparators[i], '');
      }
    } while (newNumber != number);
    return number;
  }
  format.unformat = unformat;

  function validate(number, allowedSeparators) {
    number = unformat(number, allowedSeparators);
    number = number.split(options.decimal);
    if (number.length > 2) {
      return false;
    } else if (options.truncate != null && number[1] && number[1].length > options.truncate) {
      return false;
    }  else if (options.round != null && number[1] && number[1].length > options.round) {
      return false;
    } else {
      return /^-?\d+\.?\d*$/.test(number);
    }
  }
  return format;
}

//where x is already the integer part of the number
function addIntegerSeparators(x, separator) {
  x += '';
  if (!separator) return x;
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x)) {
    x = x.replace(rgx, '$1' + separator + '$2');
  }
  return x;
}

//where x is already the decimal part of the number
function addDecimalSeparators(x, separator) {
  x += '';
  if (!separator) return x;
  var rgx = /(\d{3})(\d+)/;
  while (rgx.test(x)) {
    x = x.replace(rgx, '$1' + separator + '$2');
  }
  return x;
}

//where x is the integer part of the number
function padLeft(x, padding) {
  x = x + '';
  var buf = [];
  while (buf.length + x.length < padding) {
    buf.push('0');
  }
  return buf.join('') + x;
}

//where x is the decimals part of the number
function padRight(x, padding) {
  if (x) {
    x += '';
  } else {
    x = '';
  }
  var buf = [];
  while (buf.length + x.length < padding) {
    buf.push('0');
  }
  return x + buf.join('');
}
function truncate(x, length) {
  if (x) {
    x += '';
  }
  if (x && x.length > length) {
    return x.substr(0, length);
  } else {
    return x;
  }
}

//where number is an array with 0th item as integer string and 1st item as decimal string (no negatives)
function round(number, places) {
  if (number[1] && places >= 0 && number[1].length > places) {
    //truncate to correct number of decimal places
    var decim = number[1].slice(0, places);
    //if next digit was >= 5 we need to round up
    if (+(number[1].substr(places, 1)) >= 5) {
      //But first count leading zeros as converting to a number will loose them
      var leadingzeros = "";
      while (decim.charAt(0)==="0") {
        leadingzeros = leadingzeros + "0";
        decim = decim.substr(1);
      }
      //Then we can change decim to a number and add 1 before replacing leading zeros
      decim = (+decim + 1) + '';
      decim = leadingzeros + decim;
      if (decim.length > places) {
        //adding one has made it longer
        number[0] = (+number[0]+ +decim.charAt(0)) + ''; //add value of firstchar to the integer part
        decim = decim.substring(1);   //ignore the 1st char at the beginning which is the carry to the integer part
      }
    }
    number[1] = decim;
  }
  return number;
}

},{}]},{},[1]);