endsWith = (string, match) ->
  string.indexOf(match) is string.length - match.length

startsWith = (string, match) ->
  string.indexOf(match) is 0

contains = (string, match) ->
  string.indexOf(match) isnt -1

#
# Filter the raw html for only divs that do not contain an inner div
# that's because we don't care about wrapper divs that don't contain text content,
# at least with html2pdfEX as the original source.
#
exports.removeOuterDivs = (string) ->
  regex = new RegExp('<div((?!div).)*</div>', 'g') # g indicates to yield all, not just first match
  return string.match(regex) 

#
# Extracts the text of a div element
#
exports.simpleGetDivContent = (xmlNode) ->
  
  # assumes there are no nested divs inside xmlNode
  
  # console.log(xmlNode.length)
  # console.log('</div>'.length)
  content = xmlNode.substr(0, xmlNode.length - "</div>".length) # remove closing div tag
  
  # console.log(content)
  # console.log(content.match('>'))
  content = content.slice(content.indexOf(">") + 1) # remove opening div tag
  # console.log xmlNode
  # console.log content + "\n" + "\n"
  content

#
# Strip a string from a given header and trailer, if they indeed are.
#
strip = (string, prefix, suffix) ->
  if !startsWith(string, prefix)
    throw("Cannot strip string of the supplied prefix")
  if !endsWith(string, suffix)
    throw("Cannot strip string of the supplied suffix")

  string.slice(string.indexOf(prefix)+prefix.length, string.indexOf(suffix))      

#
# Get the css sheet specified in a link element.
# Of course it may be only a relative path.
#
extractCssFileNames = (string) ->
  prefix = '<link rel="stylesheet" href="'
  suffix = '"/>'
  # Regex match: All strings (not including new lines and) starting with the prefix and ending with the suffix
  regex = new RegExp(prefix + '.*' + suffix, 'g') 
  linkStripper = (string) -> strip(string, prefix, suffix)

  cssFiles = (linkStripper stylesheetElem for stylesheetElem in string.match(regex)) # a small for comprehension
  cssFiles
  # console.log cssLinks

extractCssProperties = (string) -> 
  # Strip off any new line characters 
  regex = new RegExp('[\\n|\\r]', 'g') # first back-slash escapes the string, not the regex
  string = string.replace(regex, "")
  
  # Regex replace: remove all CSS comments (of the form /* anything */) 
  # First back-slash escapes the string, not the regex
  regex = new RegExp('/\\*.*?\\*/', 'g')
  string = string.replace(regex, "")
  # console.log(string)  

  # Regex match: Any content followed by a block of braces, unless the block of braces includes 
  #              a block of braces itself. Admittedly this regex is a bit hard to come up with...
  #              This should get all pairs of (CSS selector, CSS styles in braces clause).
  regex = new RegExp('[^\\{]*?\\{[^\\{]*?\\}', 'g') # first back-slash escapes the string, not the regex
  selectors = string.match(regex)   
  pos = -1
  console.log(selectors)

exports.simpleGetCssFiles = (rawHtml, path) ->
  cssFilePaths = (((name) -> path + name) name for name in extractCssFileNames(rawHtml))
  # console.log cssFilePaths
  cssContents = (((file) -> fs.readFileSync(file).toString()) file for file in cssFilePaths)
  # console.log cssContents
  extractCssProperties(cssContents[1])


  