// Generated by CoffeeScript 1.6.3
var enableContext, go, loadArticleText, myAjax, reload, remove, renderText, startAfterPrerequisites, startEventMgmt;

remove = function(node) {
  return node.parentNode.removeChild(node);
};

Array.prototype.unique = function() {
  var key, output, value, _i, _ref, _results;
  output = {};
  for (key = _i = 0, _ref = this.length; 0 <= _ref ? _i < _ref : _i > _ref; key = 0 <= _ref ? ++_i : --_i) {
    output[this[key]] = this[key];
  }
  _results = [];
  for (key in output) {
    value = output[key];
    _results.push(value);
  }
  return _results;
};

startAfterPrerequisites = function() {
  var ajaxRequest;
  ajaxRequest = new XMLHttpRequest();
  ajaxRequest.onreadystatechange = function() {
    var inject, script;
    if (ajaxRequest.readyState === 4) {
      if (ajaxRequest.status === 200) {
        console.log('Ajax fetching javascript succeeded.');
        console.log('Proceeding to start processing after fetched javascript will have been fully loaded');
        script = document.createElement("script");
        script.type = "text/javascript";
        inject = ajaxRequest.responseText + '\n' + 'go()';
        script.innerHTML = inject;
        return document.getElementsByTagName("head")[0].appendChild(script);
      } else {
        return console.error('Failed loading prerequisite library via ajax. Aborting...');
      }
    }
  };
  ajaxRequest.open('GET', 'javascripts/external/color.js', true);
  return ajaxRequest.send(null);
};

startEventMgmt = function() {
  var Color, addElement, baseMarkColor, buttonGroupHtml, buttonGroupHtmlOld, buttonHtmlObsolete, container, contextmenuHandler, dragElements, endDrag, fluffChooser, fluffChooserDisplay, inDrag, inDragMaybe, inTouch, leftDown, leftDrag, logDrag, mark, mousemoveHandler, noColor, page, rightDown, rightDrag, touchmoveHandler;
  console.log("Setting up events...");
  container = document.getElementById('hookPoint');
  page = document.body;
  leftDown = false;
  rightDown = false;
  leftDrag = false;
  rightDrag = false;
  inDragMaybe = false;
  inDrag = false;
  inTouch = false;
  dragElements = new Array();
  fluffChooser = null;
  logDrag = function() {
    console.log(leftDown);
    console.log(rightDown);
    console.log(leftDrag);
    return console.log(rightDrag);
  };
  Color = net.brehaut.Color;
  baseMarkColor = Color('#FFB068');
  noColor = Color('rgba(0, 0, 0, 0)');
  mark = function(elements, type) {
    var currentColor, currentCssBackground, element, i, newColor, _i, _ref, _ref1, _results;
    _results = [];
    for (i = _i = _ref = Math.min.apply(null, elements), _ref1 = Math.max.apply(null, elements); _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; i = _ref <= _ref1 ? ++_i : --_i) {
      element = document.getElementById(i);
      currentCssBackground = window.getComputedStyle(element, null).getPropertyValue('background-color');
      if (currentCssBackground != null) {
        currentColor = Color().fromObject(currentCssBackground);
      } else {
        currentColor = noColor;
      }
      switch (type) {
        case 'on':
          if (currentColor.toCSSHex() === noColor.toCSSHex()) {
            newColor = baseMarkColor;
          } else {
            newColor = currentColor.darkenByRatio(0.1);
          }
          _results.push(element.style.backgroundColor = newColor.toCSS());
          break;
        case 'off':
          switch (currentColor.toCSSHex()) {
            case baseMarkColor.toCSSHex():
              newColor = noColor;
              _results.push(element.style.backgroundColor = newColor.toCSS());
              break;
            case noColor.toCSSHex():
              break;
            default:
              newColor = currentColor.lightenByRatio(0.1);
              _results.push(element.style.setProperty('background-color', newColor.toCSS()));
          }
          break;
        default:
          _results.push(void 0);
      }
    }
    return _results;
    /*
    # Further highlight more the words actually hovered,
    # but not those that were only part of the selected range
    for element in elements
      document.getElementById(element).style.background = '#FAAC58'
    */

  };
  buttonHtmlObsolete = "<div class=\"btn-group\">\n  <button type=\"button\" class=\"btn btn-primary btn-lg\">Primary</button>\n  <button type=\"button\" class=\"btn btn-primary btn-lg dropdown-toggle\" data-toggle=\"dropdown\">\n    <span class=\"caret\"></span>\n    <span class=\"sr-only\">Toggle Dropdown</span>\n  </button>\n  <ul class=\"dropdown-menu\" role=\"menu\">\n    <li><a href=\"#\">Action</a></li>\n    <li><a href=\"#\">Another action</a></li>\n    <li><a href=\"#\">Something else here</a></li>\n    <li class=\"divider\"></li>\n    <li><a href=\"#\">Separated link</a></li>\n  </ul>\n</div>";
  buttonGroupHtmlOld = "<div class=\"panel panel-default\">\n  <div class=\"panel-heading\">What did you just mark?</div>\n  <div class=\"panel-body\">\n    <p>Help clean up this document by picking which category below does it belong to.</p>\n  </div>\n  <div class=\"list-group\">\n    <a href=\"#\" class=\"list-group-item\">Journal name</a>\n    <a href=\"#\" class=\"list-group-item\">Institution</a>\n    <a href=\"#\" class=\"list-group-item\">Author</a>                              \n    <a href=\"#\" class=\"list-group-item\">Contact details</a>                              \n    <a href=\"#\" class=\"list-group-item\">Author description</a>                              \n    <a href=\"#\" class=\"list-group-item\">Classification</a>                              \n    <a href=\"#\" class=\"list-group-item\">Article ID</a>                              \n    <a href=\"#\" class=\"list-group-item\">List of keywords</a>\n    <a href=\"#\" class=\"list-group-item\">Advertisement</a>                              \n    <a href=\"#\" class=\"list-group-item\">History (received, pubslished dates etc)</a>                                                            \n    <a href=\"#\" class=\"list-group-item\">Copyright and permissions</a>                              \n    <a href=\"#\" class=\"list-group-item\">Document type description (e.g. 'Research Article')</a>                              \n    <a href=\"#\" class=\"list-group-item\">Not sure / other</a>                              \n  </div>\n</div>";
  buttonGroupHtml = "<div class=\"panel panel-default\">\n  <div class=\"panel-heading\">What did you just mark?</div>\n  <div class=\"panel-body\">\n    <p>Help clean up this document by picking which category below does it belong to.</p>\n  </div>\n  <div class=\"btn-group-vertical\">\n    <button type=\"button\">Journal name</button>\n    <button type=\"button\">Institution</button>\n    <button type=\"button\">Author</button>      \n    <button type=\"button\">Author Name</a></button>\n    <button type=\"button\">Author Description</buttoni>\n    <button type=\"button\">Contact details</button>                              \n    <button type=\"button\">Author description</button>                              \n    <button type=\"button\">Classification</button>                              \n    <button type=\"button\">Article ID</button>                              \n    <button type=\"button\">List of keywords</button>\n    <button type=\"button\">Advertisement</button>                              \n    <button type=\"button\">History (received, pubslished dates etc)</button>                                                            \n    <button type=\"button\">Copyright and permissions</button>                              \n    <button type=\"button\">Document type description (e.g. 'Research Article')</button>                              \n    <button type=\"button\">Not sure / other</button>                              \n  </div>\n</div>";
  addElement = function(html, atElement, horizontalStart, cssClass) {
    var injectionPoint, newElem;
    injectionPoint = document.getElementById(atElement);
    newElem = document.createElement('div');
    if (typeof classCss !== "undefined" && classCss !== null) {
      newElem.className = cssClass;
    }
    newElem.innerHTML = html;
    horizontalStart -= injectionPoint.getBoundingClientRect().top + window.scrollY;
    newElem.style.setProperty('margin-top', horizontalStart + 'px');
    injectionPoint.appendChild(newElem);
    return newElem;
  };
  fluffChooserDisplay = function(state, elements) {
    var downMost, element, rectangle, topBorder, _i, _len;
    switch (state) {
      case 'show':
        if (fluffChooser != null) {
          fluffChooserDisplay('hide', elements);
        }
        downMost = 100000;
        topBorder = 100000;
        for (_i = 0, _len = elements.length; _i < _len; _i++) {
          element = elements[_i];
          rectangle = document.getElementById(element).getBoundingClientRect();
          if (rectangle.top + window.scrollY < topBorder) {
            topBorder = rectangle.top + window.scrollY;
          }
          if (rectangle.bottom + window.scrollY < downMost) {
            downMost = rectangle.bottom + window.scrollY;
          }
        }
        return fluffChooser = addElement(buttonGroupHtml, 'left-col', topBorder);
      case 'hide':
        fluffChooser.parentNode.removeChild(fluffChooser);
        console.log('removing fluffchooser');
        return fluffChooser = null;
      case 'verifyHidden':
        if (fluffChooser != null) {
          return fluffChooserDisplay('hide');
        }
    }
  };
  endDrag = function() {
    var inDrabMaybe;
    container.removeEventListener("mousemove", mousemoveHandler, false);
    inDrag = false;
    inDrabMaybe = false;
    console.log("drag ended");
    if (dragElements.length > 0) {
      console.log('inTouch is ' + inTouch);
      if (inTouch) {
        inTouch = false;
        mark(dragElements.unique(), 'on');
        return;
      }
      if (leftDrag) {
        leftDrag = false;
        mark(dragElements.unique(), 'on');
        fluffChooserDisplay('show', dragElements.unique());
      }
      if (rightDrag) {
        rightDrag = false;
        mark(dragElements.unique(), 'off');
      }
      return dragElements = new Array();
    }
  };
  mousemoveHandler = function(event) {
    if (inDragMaybe) {
      inDrag = true;
      if (leftDown) {
        leftDrag = true;
      }
      if (rightDown) {
        rightDrag = true;
      }
      console.log('dragging');
      inDragMaybe = false;
    }
    if (inDrag && (event.target !== container)) {
      return dragElements.push(event.target.id);
    }
  };
  touchmoveHandler = function(event) {
    var overElement, touch, _i, _len, _ref;
    console.log('in touch move handler');
    _ref = event.touches;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      touch = _ref[_i];
      if (touch.target !== container) {
        overElement = document.elementFromPoint(touch.clientX, touch.clientY);
        console.log(overElement);
        if (overElement) {
          console.log(overElement.id);
          dragElements.push(overElement.id);
        }
      }
    }
    return false;
  };
  contextmenuHandler = function(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    console.log("right-click event captured");
    console.log(event.target);
    fluffChooserDisplay('verifyHidden');
    return false;
  };
  container.addEventListener("contextmenu", contextmenuHandler);
  container.onclick = function(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    console.log("click event captured");
    fluffChooserDisplay('verifyHidden');
    return false;
  };
  container.ondblclick = function(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    console.log("double-click event captured");
    return false;
  };
  page.onmouseup = function(event) {
    console.log('in mouse up');
    if (event.button === 0) {
      leftDown = false;
    } else {
      rightDown = false;
    }
    inDragMaybe = false;
    if (inDrag) {
      endDrag();
    }
    return false;
  };
  page.ontouchend = function(event) {
    var touch, _i, _len, _ref;
    _ref = event.changedTouches;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      touch = _ref[_i];
      /*
      if touch.target isnt container
        dragElements.push touch.target.id
        console.log 'in touch end/cancel: ' + touch.target.id + ' when ' + dragElements + ' on ' + event.timeStamp 
        #console.dir dragElements
      */

    }
    return endDrag();
  };
  page.ontouchcancel = function(event) {
    return page.ontouchend(event);
  };
  page.onmousedown = function(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    console.log("mouse-down event captured");
    if (event.button === 0) {
      leftDown = true;
    } else {
      rightDown = true;
    }
    if (event.target !== container) {
      inDragMaybe = true;
      container.addEventListener("mousemove", mousemoveHandler, false);
    }
    return false;
  };
  page.ontouchstart = function(event) {
    if (event.target !== container) {
      inTouch = true;
      /*
      #
      # 
      #
      for touch in event.changedTouches
        if touch.target isnt container
          console.log 'in touch start: ' + touch.target.id + ' when ' + dragElements + ' on ' + event.timeStamp 
          dragElements.push touch.target.id
      */

    }
    return false;
  };
  container.addEventListener("touchstart", page.ontouchstart, false);
  container.addEventListener("touchend", page.ontouchend, false);
  container.addEventListener("touchmove", touchmoveHandler, false);
  return container.onselectstart = function(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    console.log("select-start event captured");
    return false;
  };
};

myAjax = function(url, callback) {
  var ajaxRequest;
  ajaxRequest = new XMLHttpRequest();
  console.log('Making ajax call to ' + url);
  ajaxRequest.onreadystatechange = function() {
    if (ajaxRequest.readyState === 4) {
      if (ajaxRequest.status === 200) {
        console.log('Ajax call to ' + url + ' succeded.');
        return callback(ajaxRequest.responseText);
      } else {
        return console.error('Ajax call to ' + url + ' failed');
      }
    }
  };
  ajaxRequest.open('GET', url, true);
  return ajaxRequest.send(null);
};

renderText = function(tokens) {
  var convertToHtml, plainText, x, _i, _len;
  convertToHtml = function(token, moreStyle) {
    var style, stylesString, text, val, _ref;
    stylesString = '';
    _ref = token.finalStyles;
    for (style in _ref) {
      val = _ref[style];
      stylesString = stylesString + style + ':' + val + '; ';
    }
    if (moreStyle != null) {
      stylesString = stylesString + ' ' + moreStyle;
    }
    if (stylesString.length > 0) {
      stylesString = 'style=\"' + stylesString + '\"';
      if (token.metaType === 'regular') {
        text = token.text;
      } else {
        text = ' ';
      }
      return "<span " + stylesString + " id=\"" + x.id + "\">" + text + "</span>";
    } else {
      console.warn('token had no styles attached to it when building output. token text: ' + token.text);
      return "<span>" + token.text + "</span>";
    }
  };
  for (_i = 0, _len = tokens.length; _i < _len; _i++) {
    x = tokens[_i];
    if (x.metaType === 'regular') {
      switch (x.paragraph) {
        case 'closer':
          x.text = x.text + '<br /><br />';
          plainText = plainText + convertToHtml(x);
          break;
        case 'opener':
          plainText = plainText + convertToHtml(x, 'display: inline-block; text-indent: 2em;');
          break;
        default:
          plainText = plainText + convertToHtml(x);
      }
    } else {
      plainText = plainText + convertToHtml(x);
    }
  }
  return document.getElementById('hookPoint').innerHTML = plainText;
};

loadArticleText = function() {
  var ajaxHost;
  ajaxHost = location.protocol + '//' + location.hostname;
  return myAjax(ajaxHost + '/tokenSync', function(tokenSequenceSerialized) {
    var tokenSequence;
    console.log(tokenSequenceSerialized.length);
    console.time('unpickling');
    tokenSequence = JSON.parse(tokenSequenceSerialized);
    console.timeEnd('unpickling');
    return renderText(tokenSequence);
  });
};

go = function() {
  window.onload = function() {
    return startEventMgmt();
  };
  return loadArticleText();
};

startAfterPrerequisites();

reload = function() {
  var script;
  script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "javascripts/events.js";
  document.getElementsByTagName("head")[0].appendChild(script);
  startEventMgmt();
  return console.log('reloaded');
};

enableContext = function() {
  return document.getElementById("hookPoint").removeEventListener("contextmenu", contextmenuHandler);
};
