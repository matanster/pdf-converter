util = require './util'
logging = require './logging' 

exports.storePdfMetaData = (localCopy) ->
  
  logging.log "Getting pdf file metadata using pdfinfo"
  util.timelog "Getting pdf file metadata using pdfinfo"
  
  execCommand = 'pdfinfo -meta' + ' '
  execCommand += localCopy
  logging.log execCommand
  exec execCommand, (error, stdout, stderr) ->
    logging.log executable + "'s stdout: " + stdout
    logging.log executable + "'s stderr: " + stderr
    if error isnt null
      logging.log executable + "'sexec error: " + error
    else
      util.timelog "Getting pdf file metadata using pdfinfo"
      meta = {raw: stdout, stderr: stderr}
      console.dir(meta)



      