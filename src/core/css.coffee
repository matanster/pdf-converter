#
# Obtain the (relevant) css styles applying to the html text representation of the article
#

cssParser = require 'css-parse'
util = require '../util/util'
fs = require 'fs'

relevantStyles = [
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'word-spacing',
  'line-height',
  'color',
  'letter-spacing',
  'height'
  # 'transform'  # for detecting non-horizontal text - see https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function, non zero b indicates rotation 
]

positionData = [
  'left',
  'bottom',
  'right',
  'top'
]

exports.positionData = positionData

#
# Get the css sheet specified in a link html element.
# Of course it may be only a relative path.
#
extractCssFileNames = (string) ->
  prefix = '<link rel="stylesheet" href="'
  suffix = '"/>'
  # Regex match: All strings (not including new lines and) starting with the prefix and ending with the suffix
  regex = new RegExp(prefix + '.*' + suffix, 'g') 
  linkStripper = (string) -> util.strip(string, prefix, suffix)

  cssFiles = (linkStripper stylesheetElem for stylesheetElem in string.match(regex)) # a small for comprehension
  cssFiles

extractCssProperties = (string) -> 
  # Strip off any new line characters 
  regex = new RegExp('[\\n|\\r]', 'g')  # first back-slash escapes the string, not the regex
  string = string.replace(regex, "")
  
  # Regex replace: remove all CSS comments (of the form /* anything */) 
  regex = new RegExp('/\\*.*?\\*/', 'g')  # First back-slash escapes the string, not the regex
  string = string.replace(regex, "")

  css = cssParser string

  # Assuming there is only one media screen element -
  # We deconstruct the media screen element into an array of its sub-elements
  # Alas, ES5 does not provide a 'find' function to use here...  
  mediaScreenElements = css.stylesheet.rules.filter((element) ->
    element.type == 'media' and element.media.indexOf('screen') != -1)[0].rules 

  # todo: for readability - replace nots with new 'filterOut' named function,
  #       that adds the not to the regular filter function

  # Filter out the media elements. 
  # The media 'screen' sub-elements will be merged in below.
  stylesArray = css.stylesheet.rules.filter((element) -> 
    not (element.type == 'media'))

  # Filter out some more irrelevant entity types
  stylesArray = stylesArray.filter((element) -> 
    not (element.type == 'keyframes'))

  # Add the media screen sub-elements
  stylesArray = stylesArray.concat(mediaScreenElements)

  # After all that vanilla filtering above, proceed to more aggressive
  # filtering while deconstructing to a more favorable data structure
  deconstruct = (element) -> 

    #
    # Filter out css properties that exist in the input, yet require no 
    # consideration while handling the text. This just reduces the amount 
    # of data being carried forward.
    #
    # Performance opportunity: sort the array, turn it global, and quit the
    #                          comparison early rather than scanning the whole array 
    #                          also see http://jsperf.com/looking-at-localcompare
    filterProperties = (propertyObjectsArray) ->
      
      propertyObjectsArray = propertyObjectsArray.filter((propertyPair) -> 
        util.isAnyOf(propertyPair.property, relevantStyles.concat(positionData)))
      return propertyObjectsArray

    # Some guards for further filtering out irrelevant output
    return null if not element.declarations[0]? 
      
    {selectors: [name], declarations: propertyObjectsArray} = element # extracting by destructuring
    propertyObjectsArray = filterProperties(propertyObjectsArray)
    return null if propertyObjectsArray.length == 0

    # Consume only class definitions (thus filtering out # selectors and @ definitions)
    # This is quite pdf2htmlEX output specific....
    return null if name.charAt(0)!='.' 

    delete obj.type for obj in propertyObjectsArray
    return {name, propertyObjectsArray}
      
  (deconstruct element for element in stylesArray).filter((elem) -> elem?) 

exports.simpleFetchStyles = (rawHtml, path) ->
  cssFilePaths = (((name) -> path + name) name for name in extractCssFileNames(rawHtml))
  rawCsss = (fs.readFileSync(file).toString() for file in cssFilePaths)
  stylesPerFile = (extractCssProperties rawCss for rawCss in rawCsss)
  
  # Flatten the array of styles per file, into a one level flatter array -
  # thus joining the css declarations from each css file, into one long array.
  # This may be made a utility function named flattenArray or something
  styles = []
  styles = styles.concat(array) for array in stylesPerFile

  # Now turn the array into an object, so it can be searched as a hash/map.
  # this may be made into a utility function.
  stylesMap = {}
  stylesMap[style.name] = style.propertyObjectsArray for style in styles
  stylesMap

# get the css styles for a css class
exports.getFinalStyles = (styleClass, finalStyles) ->
  styleClass = '.' + styleClass # as we are dealing with css classes
  if finalStyles[styleClass]? 
    return finalStyles[styleClass]
  else 
    return undefined 

# return the native css string form of a style. e.g. "font-size:96px;"
serializeStyle = (style) ->
  styleString = style.property + ':' + style.value + ';'
  styleString

exports.serializeStylesArray = (stylesArray) ->
  stylesString = ''
  for style in stylesArray
    stylesString = stylesString + serializeStyle(style)
  stylesString
