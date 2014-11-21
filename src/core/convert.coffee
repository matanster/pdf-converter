#
# Invokes pdf2htmlEX to convert a pdf to html
#

util    = require '../util/util'
logging = require '../util/logging' 
docMeta = require './docMeta'
storage = require '../storage/simple/storage'
require 'stream'
exec   = require("child_process").exec
riak   = require('riak-js').getClient({host: "localhost", port: "8098"})
fs     = require 'fs'
crypto = require 'crypto'
dataWriter = require '../data/dataWriter'
#output = require '../output'

executable = "pdf2htmlEX"
executalbeParams = "--embed-css=0 --embed-font=0 --embed-image=0 --embed-javascript=0 --decompose-ligature=1" 

#
# * Handles the conversion from pdf to html, and forwards to next stage.
# 
exports.go = (context, localCopy, docLogger, req, res) ->

  name = context.name
  baseFolder = '../data/pdf/1-html/' 
  outFolder = baseFolder + name
  #console.log """About to convert file #{name} from pdf to html"""

  hasher = crypto.createHash('md5')
  fileContent = fs.readFileSync(localCopy)

  util.timelog context, "hashing input file" 
  hasher.update(fileContent)
  hash = hasher.digest('hex')
  util.timelog context, "hashing input file" 
  logging.cond """input file hash is: #{hash}""", "hash"


  #
  # convert from pdf, unless conversion has been cached
  #
  # a hash of the input file content is saved here 
  # to a clustered storage database, to mark whether the file 
  # has already been converted with pdf2htmlEX.
  #
  # NOTE: if the actual local copy of the converstion outputs 
  #       has been cleared, an exception will be ultimately raised
  #
  riak.get('html', hash, (error, formerName) ->  # test for cached version

      if error?
        #
        # not cached - perform the conversion and then pass to extraction
        #
        util.timelog context, "from upload to serving"

        docMeta.storePdfMetaData     context, localCopy, docLogger
        docMeta.storePdfFontsSummary context, localCopy, docLogger

        #logging.logRed fileContent.length
        storage.store context, "pdf", fileContent, docLogger

        util.timelog context, "Conversion to html"
        logging.cond "starting the conversion from pdf to html", 'progress'

        #docMeta.storePdfMetaData(name, localCopy)
        
        # 
        #	html2pdfEX doesn't have an option to pipe the output, so passing its output around
        #	is just a bit clumsier than it could have been. We use a directory structure one level up
        #	of this project, to store originals and conversion artifacts, as a way to share them with
        #	another web server running on the same server.
        #	
        #	For the output of html2pdfEX for a given input PDF document, we create a folder using its 
        #	randomly generated file name generated by html2pdfEX, and in it we store all the conversion 
        #	outputs for that file - the html, and accompanying files such as css, fonts, images, 
        #	and javascript that the html2pdfEX output comprises. 
        #		 
        
        #res.send('Please wait...'');

        util.mkdir(outFolder, name)

        execCommand = executable + " "
        
        execCommand += '"' + localCopy + '"' + " " + executalbeParams + " " + "--dest-dir=" + '"' + outFolder + '"'
        dataWriter.write context, 'pdfToHtml', execCommand
        exec execCommand, (error, stdout, stderr) ->
          logging.cond "finished the conversion from pdf to html", 'progress'
          dataWriter.write context, 'pdfToHtml', executable + "'s stdout: " + stdout
          dataWriter.write context, 'pdfToHtml', executable + "'s stderr: " + stderr
          if error isnt null 
            dataWriter.write context, 'pdfToHtml', executable + "'sexec error: " + error
            console.error """pdf2Html for #{name} failed with error: \n #{error}"""

            res.writeHead 505
            res.write "We are sorry, an unexpected error has occured processing your document"
            res.end()
            #shutdown() # should call shutdown here to avoid leaking stuff

          else

            ###
            # save the converted-to html as data as well
            outFolderResult = outFolder + name + '/'
            for resultFile in fs.readdirSync(outFolderResult)
              if fs.statSync(outFolderResult + resultFile).isFile() 
                #if util.extensionFilter(resultFile)
                util.mkdir(outFolder)
                util.mkdir(outFolder, name)
                fs.createReadStream(outFolderResult + resultFile).pipe(fs.createWriteStream(outFolderResult + resultFile))
            
            # KEEP THIS FOR LATER: redirectToShowHtml('http://localhost:8080/' + 'serve-original-as-html/' + name + "/" + outFileName)
            # redirectToShowRaw('http://localhost/' + 'extract' +'?file=' + name + "/" + outFileName)
            ###
            util.timelog context, "Conversion to html"

            riak.save('html', hash, name, (error) -> 
              # should not data write or time log here, as document handling shutdown() does not 
              # wait for this async call to end (waiting for riak would seem nonsensical, i.e. what if 
              # the call hangs? - not worth implementing a generic shutdown waitFor & timeouts mechanism right now.
              if error?
                 console.log 'pdfToHtml', """failed storing file hash for #{name} to clustered storage"""
              else
            )

            input = 
              'html' : outFolder + '/' + name + ".html"
              'css'  : outFolder + '/'
            require('./extract').go(context, req, input, res, docLogger)
            #redirectToExtract "http://localhost/" + "extract" + "?" + "name=" + name + "&" + "docLogger=" + docLogger

      #
      # cached - pass on to extraction as conversion has already taken place
      #
      else
        logging.cond 'input file has already passed pdf2htmlEX conversion - skipping conversion', 'fileMgmt'

        input = 
          'html' : baseFolder + formerName + '/' + formerName + ".html"
          'css'  : baseFolder + formerName + '/'
        require('./extract').go(context, req, input, res, docLogger)
    )
  
  
redirectToShowHtml = (redirectString) ->
  docLogger.info "Passing html result to next level handler, by redirecting to: " + redirectString
  res.writeHead 301,
    Location: redirectString
  res.end()

redirectToExtract = (redirectString) ->
  docLogger.info "Passing html result to next level handler, by redirecting to: " + redirectString
  res.writeHead 301,
    Location: redirectString
  res.end()
