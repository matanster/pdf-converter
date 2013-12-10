require "fs"
#require "jsdom"
#textHookPoint = getElementByID(window.hookPoint)
#textHookPoint.innerHTML = "aaaaa" 

# Load the output template
outputTemplate = fs.readFileSync('./outputTemplate/index.html').toString() # this should be speedy and cached, sync won't hurt much

# Locate to the text position inside the html element where the output should be inserted
# (that's one character after the '>' closing the marked element's opening tag)
hookId = 'hookPoint'
hookElementTextPos = outputTemplate.indexOf(">", outputTemplate.indexOf("<span id=\"" + hookId + "\"")) + 1

exports.serveOutput = (text, name, res) ->
 
  dummyText = "aaaa"

  outputFile = './local-copies/' + 'output/' + name + '.html'

  console.log(hookElementTextPos)
  outputHtml = outputTemplate.slice(0, hookElementTextPos).concat(dummyText, outputTemplate.slice(hookElementTextPos))
  console.log(outputHtml)
  fs.writeFile(outputFile, outputHtml, (err) -> 
  	
  	if err?
  	  res.send(500)
  	  throw err

  	console.log('Output saved')
  	console.log('Sending response....')
  	res.sendfile(outputFile)) # variable use by closure here...
