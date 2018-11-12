### Sorry for dublication ...
library(jsonlite)

print(getwd()) # the Data will be extracted here
setwd("~/Desktop/mbds/R") # to change the place were data will be extracted

downloadArchive <- function(year,month,day,hour){
  if(month < 9) {month <- paste("0", month, sep = "")}
  if(day < 9) {day <- paste("0", day, sep = "")}
  theURL <- paste("http://data.gharchive.org/", year, "-", month, "-", day, "-", hour, ".json.gz", sep = "")
  theName <- paste(year,"-",month,"-",day,"-",hour,".json.gz")
  download.file(url=theURL, 
                destfile=theName, 
                method="internal",
                quiet = FALSE, 
                mode = "wb",
                cacheOK = TRUE)
}

for(year in 2015:2017){
  for(month in 1:12){
    for(day in 1:28){
      for(hour in 0:23){
        downloadArchive(year,month,day,hour)
      }
    }
  }
}

for(year in 2015:2017){
  for(month in 1:12){
    for(day in 1:28){
      for(hour in 0:23){
        if(month < 9) {month <- paste("0", month, sep = "")}
        if(day < 9) {day <- paste("0", day, sep = "")}
        downloadArchive(year,month,day,hour)
      }
    }
  }
}

getLangues <- function(fileName){
  theFile <- file(fileName,"r") 
  theLines <- readLines(theFile)
  close(theFile)
  languages <- c()
  for(line in theLines){
    line = fromJSON(line)
    if(line$type == "PullRequestEvent"){
      langue <- line$payload$pull_request$base$repo$language
      if(!is.null(langue)){
        languages <- c(languages,langue)
      }
    }
  }
  return(table(languages))
}
getLangues("2015 - 01 - 01 - 1 .json.gz")

#from 2015 . 01 . 1 - 8 
languesOfLangues <- list()
for(day in 1:3){
  if(day < 9) {day <- paste("0", day, sep = "")}
  for(hour in 0:23){
    languesOfLangues <- append(languesOfLangues, list(getLangues(paste(2015,"-","01","-",day,"-",hour,".json.gz"))))
    print(paste("hour:", hour))
  }
  print(day)
}

install.packages("RJSONIO")
library("RJSONIO")

close( file( "test.json", open="w" ) )
allLanguages <- sapply(unique(names(unlist(languesOfLangues))),function(x) c(),simplify = FALSE,USE.NAMES = TRUE)
time = 0
for(line in languesOfLangues){
  for(l in 1:length(line)){
    allLanguages[names(line)[l]][[1]] <- append(unname(allLanguages[names(line)[l]][[1]]),unname(line[l]))
  }
  time <- time + 1
  for(ll in 1:length(allLanguages)){
    if(length(allLanguages[ll][[1]]) < time){
      allLanguages[ll][[1]] <- append(allLanguages[ll][[1]], 0)
    }
  }
}

plot(allLanguages$C, main = "number of commits in C language by hour from 2015-01-01-0 to 2015-01-03-23", xlab = "day", ylab="number commits in C")
lines(allLanguages$C,col="red")
exportJson <- toJSON(split(unname(allLanguages),names(allLanguages)))
write(exportJson, "test.json",append = TRUE)
