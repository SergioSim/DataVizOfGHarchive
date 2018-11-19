library(jsonlite)
Clang <- list()
filenames <- list.files("/media/katzenmaul/385201B452017840/ghArchive/output17", pattern="O*", full.names=TRUE)
for(afile in filenames){
  theFile <- file(afile , "r")
  theName = tail(strsplit(afile,"/")[[1]], n=1)
  theName = substr(theName, 2, nchar(theName) - 5)
  theJson <- fromJSON(readLines(theFile))
  Clang <- append(Clang, list(append(c("date" = theName), theJson)))
}

theNames <- names(table(unlist(lapply(Clang, names))))
allNames <- sapply(theNames, function(n) list(c()))

for(theData in Clang){
  for(aName in theNames){
    if(!is.null(theData[[aName]])){
      print(theData[[aName]])
      allNames[[aName]] = c(allNames[[aName]], theData[[aName]])
    }else{
      allNames[[aName]] = c(allNames[[aName]], 0)
    }
  }
}

plot(1:length(allNames$JavaScript),allNames$JavaScript, "l")

exportJson <- toJSON(split(unname(allNames),names(allNames)))
write(exportJson, "test.json",append = TRUE)

ldf <- lapply(filenames, paste)

j <- fromJSON(readLines(file("/home/katzenmaul/Desktop/mbds/R/prepared-data/tendance2016.json.gz" , "r")))
plot(1:length(j$C),j$C, "l")

getLangues <- function(fileName){
  theFile <- file(fileName,"r") 
  theLine <- readLines(theFile)
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
