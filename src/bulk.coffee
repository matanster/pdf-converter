#
# Bulk activation, with controls over degree of parallelism
#
# Note: make sure to check on the degree of parallelism of app.coffee
#       to get a well thought of run (number of cluster workers in app.coffee)
#

http       = require 'http'
fs         = require 'fs'
nconf      = require 'nconf'
util       = require './util/util'
logging    = require './util/logging'
rdbms      = require './storage/rdbms/rdbms' 
#dataWriter = require './data/dataWriter'

#
# configruation
#
nconf.argv().env()
nconf.defaults 
  host        : "localhost"
  flood       : false
  maxFiles    : process.argv[2] or 10000  # first command-line argument if any

#host = nconf.get 'host'#
#port = process.env.PORT or 3080
nconf = require('nconf')
directory = (require './storage/localManagedFiles').rooted(nconf.get("locations")["pdf-source-input"])
host = nconf.get('http-services')["pdf-sourceExtractor"]["host"]
port = nconf.get('http-services')["pdf-sourceExtractor"]["port"] or process.env.PORT

exports.go = (res) -> 
  if appInvoked? 
    logging.logGreen """calling self at hostname #{nconf.get('host')}, port #{port}"""
  else
    logging.logGreen """Connecting to hostname #{nconf.get('host')}, port #{port}"""

  #directory = nconf.get 'directory' # input directory 
  logging.logGreen 'Iterating over input files from ' + util.terminalClickableFileLink(directory)

  flood = nconf.get 'flood'
  switch flood
    when true
      logging.logPerf 'Working in flood mode'
    when false
      logging.logPerf 'Working in controlled load mode' 
    else
      logging.logRed 'Invalid value for the flood argument'
      #process.exit(0)
      
  #parallelism = nconf.get 'parallelism'
  numCPUs = require('os').cpus().length;
  logging.logGreen """#{numCPUs} CPUs detected on host"""

  parallelism = numCPUs - 1
  logging.logPerf """Degree of parallelism: #{parallelism}"""

  maxFiles = nconf.get 'maxFiles'

  logging.logGreen ''

  #
  # establish a unique run id, to be used in logging and data writing by the main app called by this script
  #

  batchRunID = util.simpleGenerateRunID()
  logging.logGreen 'Using run ID ' + batchRunID

  rdbms.write null, 'runIDs', {
      runID: batchRunID
    }

  http.globalAgent.maxSockets = 1000 # omitting this, and this client-side pauses after the 5 first client-side
                                     # node.js requests that saturate the client agent pool (per current default), 
                                     # to a rhythm affected by the keepalive dynamics with the server-side
                                     # and practically take whole minutes to execute..... 
                                     # This definition removes this concurrency limitation from the client-side.

  #
  # Request invoker adhering to specified load strategy
  #

  requests = 0
  responses = 0
  aggregateRequestsWait = 0 # summed requests wait time 

  makeRequest = (filename) ->

    requests += 1
    httpCallBack = ((filename) -> 
      (res) ->

        responses += 1

        # get the server response data
        responseBody = ''

        res.on('data', (chunk) -> responseBody += chunk)

        res.on('end', () -> 
          if res.statusCode is 200
            logging.logGreen 'Server response for ' + filename + ' is:   ' + res.statusCode
            rdbms.write null, 'runs', {
                docName: filename.replace('.pdf','') # just the file name, without its suffix
                runID:   batchRunID
                status:  'success'
              }
          else 
            logging.logYellow 'Server response for ' + filename + ' is:   ' + res.statusCode + ', ' + responseBody
            rdbms.write null, 'runs', {
                docName:      filename.replace('.pdf','') # just the file name, without its suffix
                runID:        batchRunID
                status:       'failed'
                statusDetail: responseBody
              }

          unless flood
            # Invoke next request unless all requests already made
            if toRequest.length > 0
              makeRequest(toRequest.shift())

          console.log responses + ' responses out of ' + requests + ' requests received thus far'
          requestElapsedTime = util.timelog null, 'Server response for ' + filename

          # add up time waited for this request, to the overal wait impact metric
          aggregateRequestsWait += (requestElapsedTime)

          # 
          # done. output timing statistics and wrap up
          #
          if responses is requests
            overall = util.timelog null, 'Overall'
            logging.logPerf ''
            logging.logPerf ' Timing:'
            logging.logPerf ''
            logging.logPerf ' elapsed   ' + overall / 1000 + ' secs'
            logging.logPerf ' averaged  ' + overall / 1000 / responses + ' (sec/request)'
            logging.logPerf ' wait time ' + aggregateRequestsWait / 1000 + ' secs (typically more than elapsed time)'
            logging.logPerf ' averaged  ' + aggregateRequestsWait / 1000 / responses + ' (sec/request)'
            logging.logPerf ''
            logging.logPerf """ Parallelism degree employed was #{parallelism}"""
            logging.logPerf ''
            #setTimeout((()->process.exit(0)), 3000) 
            #process.exit(0) 
            return)) (filename) # Callback application

    console.log "Requesting " + filename
    util.timelog null, 'Server response for ' + filename

    #
    # Make the actual http request
    #
    http.get 
      host: host
      port: port
      path: '/handleInputFile?' + 'localLocation=' + encodeURIComponent(filename) + '&runID=' + batchRunID
      method: 'GET',
      httpCallBack 
    .on('error', (e) ->
      console.log("Got error: " + e.message))

  util.timelog null, 'Overall'

  #
  # build queue of requests - per elligible input files in the supplied input directory
  #
  toRequest = []
  for filename in fs.readdirSync(directory)
    if fs.statSync(directory + filename).isFile() 
      if filename isnt '.gitignore'
        #console.log toRequest.length
        #console.log maxFiles
        if toRequest.length < maxFiles
          toRequest.push(directory + filename)
      else
        console.log 'Skipping .gitignore' 
    else
      console.log 'Skipping subdirectory ' + filename

  #
  # start the requests
  #
  if toRequest.length > 0 
    unless flood
      if parallelism > toRequest.length
        logging.logYellow 'Note: specified degree of parallelism is greater than number of files to process'    
        parallelism = toRequest.length
      for i in [1..parallelism]
        if toRequest.length > 0
          makeRequest(toRequest.shift()) # remove bottom of queue and issue request for it
    else
      for filename in toRequest
        makeRequest(filename)
    res.end "Starting to process all files..."
  else
    res.end 'No files to process in directory, doing nothing.' 
