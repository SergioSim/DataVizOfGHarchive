library(jsonlite)

########################
######################## Start Extracting DATA

print(getwd()) # the Data will be extracted here
setwd("~/Desktop/mbds/R")
download.file(url="http://data.gharchive.org/2015-01-01-0.json.gz", 
              destfile="2015-01-01-0.json.gz", 
              method="internal",
              quiet = FALSE, 
              mode = "wb",
              cacheOK = TRUE)

theFile <- file("2015-01-01-0.json.gz","r") 
theLines <- readLines(theFile) # Besoin de 18 Mb memoire vive...
close(myFile)
# some infos
myJSONs <- fromJSON(theLines[1])
names(myJSONs)
myJSONs$type # in ["pushEvent","ReleaseEvent","ForkEvent", and 11 others... ]
myJSONs$actor$login
myJSONs$repo$name
myJSONs$payload # changes with the type ... :(
myJSONs$public

######################## End Extracting DATA
######################## 

########################
######################## Start Process DATA
theTypes <- c()
theLogins <- c()
theComments <- c()
theDescription <- c()
#nbOfPublic <- 0 # all of them are public :(
n <- length(theLines)
for(line in theLines){
  line = fromJSON(line)
  theTypes = c(theTypes,line$type)
  theLogins = c(theLogins, line$actor$login)
  if(line$type == "CommitCommentEvent"){
    theComments = c(theComments, line$payload$comment$body)
  }
  if(line$type == "CreateEvent"){
    theDescription = c(theDescription, line$payload$description)
  }
}
######################## End Process DATA
######################## 

######################## Start transforming Data
########################

theTypes <- table(theTypes) # a exporter...
theLogins <-table(table(theLogins)) # a exporter...
theComments = table(strsplit(paste(theComments, collapse=" "), " "))
theDescription = table(strsplit(paste(theDescription, collapse=" "), " "))

######################## End transforming Data
########################

######################## Start visualising Data
########################

barplot(theLogins / sum(theLogins), 
        xlab = "number of commits made", 
        ylab = "part from total number of commits", 
        main= "Repartition of the number of commits made in one hour par person")
pie(theTypes, labels = names(theTypes), main="Pie Chart of Git Events")
pie(theComments[theComments > 10])
pie(theDescription[theDescription > 12][-1])

######################## End visualising Data
########################

### WIP ... 
names(theTypes)
# to see whats is in differents payloads ->
for(theNames in names(theTypes)[1]){
  print("------------------------------------------------------------------------------------------------------------")
  print(theNames)
  print("------------------------------------------------------------------------------------------------------------")
  for(line in theLines){
    line = fromJSON(line)
    if(line$type == theNames){
      print(line$payload)
      break;
    }
  }
}
