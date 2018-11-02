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
theLines <- readLines(theFile) # Need 18 Mb of memory...
close(myFile)
# some infos
myJSONs <- fromJSON(theLines[1])
names(myJSONs)
myJSONs$type # in ["pushEvent","ReleaseEvent","ForkEvent", and 11 others... ]
myJSONs$actor$login
strsplit(myJSONs$repo$name,"/")[[1]][2]
myJSONs$payload # changes with the type ... :(
myJSONs$public

######################## End Extracting DATA
######################## 

########################
######################## Start Process DATA
theEvents <- list()
theTypes <- c()
theLogins <- c()
theRepos <- c()
theComments <- c()
theDescription <- c()
nbOfDeletes <- 0
#nbOfPublic <- 0 # all of them are public :(
n <- length(theLines)
for(line in theLines){
  line = fromJSON(line)
  theTypes = c(theTypes,line$type)
  theLogins = c(theLogins, line$actor$login)
  theRepos = c(theRepos,strsplit(line$repo$name,"/")[[1]][2])
  theEvents[[line$type]] = c(theEvents[[line$type]], switch(line$type,
                          "CommitCommentEvent"=line$payload$comment$body,
                          "CreateEvent"=list("description"=line$payload$description,
                                             "ref_type"=line$payload$ref_type),
                          "DeleteEvent"=line$payload$ref_type,
                          "ForkEvent"=list("name"=line$payload$forkee$name, 
                                           "login"=line$payload$forkee$owner,
                                           "description"=line$payload$forkee$description,
                                           "ref_type"=line$payload$ref_type,
                                           "size"=line$payload$forkee$size),
                          "GollumEvent"=line$payload$pages$page_name,                   
                          "IssueCommentEvent"=list("issueTitle"=line$payload$issue$title,
                                                   "issueUserLogin"=line$payload$issue$user$login,
                                                   "issueComments"=line$payload$issue$comments,
                                                   "issueBody"=line$payload$issue$body,
                                                   "commentUserLogin"=line$payload$comment$user$login,
                                                   "commentBody"=line$payload$comment$body),
                          "IssuesEvent"=list("action"=line$payload$action,
                                             "issueId"=line$payload$issue$id,
                                             "issueTitle"=line$payload$issue$title,
                                             "issueUserLogin"=line$payload$issue$user$login,
                                             "issueState"=line$payload$issue$state,
                                             "issueComments"=line$payload$issue$comments,
                                             "issueBody"=line$payload$issue$body),                   
                          "MemberEvent"="", #noUsefullInfos :(
                          "PublicEvent"="", #noUsefullInfos :(
                          "PullRequestEvent"=list("action"=line$payload$action,
                                                  "pull_requestState"=line$payload$pull_request$state,
                                                  "pull_requestTitle"=line$payload$pull_request$title,
                                                  "pull_requestUserLogin"=line$payload$pull_request$user$login,
                                                  "pull_requestBody"=line$payload$pull_request$body,
                                                  "pull_requestHeadRepoName"=line$payload$pull_request$head$repo$name,
                                                  "pull_requestHeadRepoSize"=line$payload$pull_request$head$repo$size,
                                                  "pull_requestHeadRepoLanguage"=line$payload$pull_request$head$repo$language,
                                                  "pull_requestHeadRepoHas_wiki"=line$payload$pull_request$head$repo$has_wiki,
                                                  "pull_requestHeadRepoHas_pages"=line$payload$pull_request$head$repo$has_pages,
                                                  "pull_requestHeadRepoForks_count"=line$payload$pull_request$head$repo$forks_count,
                                                  "pull_requestBaseRepoOpen_issues"=line$payload$pull_request$base$repo$open_issues,
                                                  "pull_requestBaseRepoWatchers"=line$payload$pull_request$base$repo$watchers,
                                                  "pull_requestMerged"=line$payload$pull_request$merged,
                                                  "pull_requestCommits"=line$payload$pull_request$commits,
                                                  "pull_requestAdditions"=line$payload$pull_request$additions,
                                                  "pull_requestDeletions"=line$payload$pull_request$deletions,
                                                  "pull_requestChanged_files"=line$payload$pull_request$changed_files),              
                          "PullRequestReviewCommentEvent"="", ### TODO
                          "PushEvent"="", ### TODO
                          "ReleaseEvent"="", ### TODO
                          "WatchEvent"="")) ### TODO
}
######################## End Process DATA
######################## 

######################## Start transforming Data
########################

theTypes <- table(theTypes) # a exporter...
theLogins <-table(table(theLogins)) # a exporter...
theComments = table(strsplit(paste(theEvents$CommitCommentEvent, collapse=" "), " "))
theDescription = table(strsplit(paste(theEvents$CreateEvent, collapse=" "), " "))

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
for(theNames in names(theTypes)[10]){
  print("------------------------------------------------------------------------------------------------------------")
  print(theNames)
  print("------------------------------------------------------------------------------------------------------------")
  for(line in theLines){
    line = fromJSON(line)
    if(line$type == theNames){
      print(line$payload)
    }
  }
}
