library(jsonlite)

########################
######################## Start Extracting DATA

print(getwd()) # the Data will be extracted here
setwd("~/Desktop/mbds/R") # to change the place were data will be extracted
download.file(url="http://data.gharchive.org/2018-01-01-0.json.gz", 
              destfile="2015-01-01-0.json.gz", 
              method="internal",
              quiet = FALSE, 
              mode = "wb",
              cacheOK = TRUE)

theFile <- file("2015-01-01-0.json.gz","r") 
theLines <- readLines(theFile) # Need 18 Mb of memory...
close(theFile)

######################## End Extracting DATA
######################## 

########################
######################## Start Process DATA
theEvents <- list()
theTypes <- c()
theLogins <- c()
theRepos <- c()
theComments <- c()
nbOfDeletes <- 0
#nbOfPublic <- 0 # all of them are public :(
n <- length(theLines)
for(line in theLines){
  line = fromJSON(line)
  theTypes = c(theTypes,line$type)
  theLogins = c(theLogins, line$actor$login)
  theRepos = c(theRepos,strsplit(line$repo$name,"/")[[1]][2])
  theEvents[[line$type]] = rbind(theEvents[[line$type]], switch(line$type,
                          "CommitCommentEvent"=line$payload$comment$body,
                          "CreateEvent"=data.frame("description"=if(!is.null(line$payload$description)) line$payload$description else "",
                                             "ref_type"=line$payload$ref_type),
                          "DeleteEvent"=line$payload$ref_type,
                          "ForkEvent"=data.frame("name"=line$payload$forkee$name, 
                                           "login"=line$payload$forkee$owner$login,
                                           "description"=if(!is.null(line$payload$forkee$description)) line$payload$forkee$description else "" ,
                                           "ref_type"=if(!is.null(line$payload$ref_type)) line$payload$ref_type else "" ,
                                           "size"=line$payload$forkee$size),
                          "GollumEvent"=line$payload$pages$page_name,                   
                          "IssueCommentEvent"=data.frame("issueTitle"=line$payload$issue$title,
                                                   "issueUserLogin"=line$payload$issue$user$login,
                                                   "issueComments"=line$payload$issue$comments,
                                                   "issueBody"=if(!is.null(line$payload$issue$body)) line$payload$issue$body else "",
                                                   "commentUserLogin"=line$payload$comment$user$login,
                                                   "commentBody"=line$payload$comment$body),
                          "IssuesEvent"=data.frame("action"=line$payload$action,
                                             "issueId"=line$payload$issue$id,
                                             "issueTitle"=line$payload$issue$title,
                                             "issueUserLogin"=line$payload$issue$user$login,
                                             "issueState"=line$payload$issue$state,
                                             "issueComments"=line$payload$issue$comments,
                                             "issueBody"=if(!is.null(line$payload$issue$body)) line$payload$issue$body else ""),                   
                          "MemberEvent"=1, #noUsefullInfos :(
                          "PublicEvent"=1, #noUsefullInfos :(
                          "PullRequestEvent"=data.frame("action"=line$payload$action,
                                                  "pull_requestState"=line$payload$pull_request$state,
                                                  "pull_requestTitle"=line$payload$pull_request$title,
                                                  "pull_requestUserLogin"=line$payload$pull_request$user$login,
                                                  "pull_requestBody"=if(!is.null(line$payload$pull_request$body)) line$payload$pull_request$body else "",
                                                  "pull_requestBaseRepoName"=line$payload$pull_request$base$repo$name,
                                                  "pull_requestBaseRepoSize"=line$payload$pull_request$base$repo$size,
                                                  "pull_requestBaseRepoLanguage"=if(!is.null(line$payload$pull_request$base$repo$language)) line$payload$pull_request$base$repo$language else "",
                                                  "pull_requestBaseRepoHas_wiki"=line$payload$pull_request$base$repo$has_wiki,
                                                  "pull_requestBaseRepoHas_pages"=line$payload$pull_request$base$repo$has_pages,
                                                  "pull_requestBaseRepoForks_count"=line$payload$pull_request$base$repo$forks_count,
                                                  "pull_requestBaseRepoOpen_issues"=line$payload$pull_request$base$repo$open_issues_count,
                                                  "pull_requestBaseRepoWatchers"=line$payload$pull_request$base$repo$watchers,
                                                  "pull_requestMerged"=line$payload$pull_request$merged,
                                                  "pull_requestCommits"=line$payload$pull_request$commits,
                                                  "pull_requestAdditions"=line$payload$pull_request$additions,
                                                  "pull_requestDeletions"=line$payload$pull_request$deletions,
                                                  "pull_requestChanged_files"=line$payload$pull_request$changed_files),              
                          "PullRequestReviewCommentEvent"=data.frame("action"=line$payload$action,
                                                               "commentUserLogin"=line$payload$comment$user$login,
                                                               "commentBody"=if(!is.null(line$payload$comment$body)) line$payload$comment$body else "",
                                                               "state"=line$payload$pull_request$state,
                                                               "title"=line$payload$pull_request$title,
                                                               "pullRequestBody"=if(!is.null(line$payload$pull_request$body)) line$payload$pull_request$body else "",
                                                               "pull_requestBaseRepoName"=line$payload$pull_request$base$repo$name,
                                                               "pull_requestBaseRepoSize"=line$payload$pull_request$base$repo$size,
                                                               "pull_requestBaseRepoLanguage"=if(!is.null(line$payload$pull_request$base$repo$language)) line$payload$pull_request$base$repo$language else "",
                                                               "pull_requestBaseRepoHas_wiki"=line$payload$pull_request$base$repo$has_wiki,
                                                               "pull_requestBaseRepoHas_pages"=line$payload$pull_request$base$repo$has_pages,
                                                               "pull_requestBaseRepoForks_count"=line$payload$pull_request$base$repo$forks_count,
                                                               "pull_requestBaseRepoOpen_issues"=line$payload$pull_request$base$repo$open_issues_count,
                                                               "pull_requestBaseRepoWatchers"=line$payload$pull_request$base$repo$watchers),
                          "PushEvent"=data.frame("name"= line$payload$commits$author$name,
                                                 "message" = line$payload$commits$message),
                          "ReleaseEvent"=data.frame("action"=line$payload$action,
                                              "releaseName"=if(!is.null(line$payload$release$name)) line$payload$release$name else "",
                                              "releaseAuthorLogin"=line$payload$release$author$login,
                                              "releaseBody"=if(!is.null(line$payload$release$body)) line$payload$release$body else ""),
                          "WatchEvent"=line$payload$action))
}
######################## End Process DATA
######################## 

######################## Start transforming Data
########################

theTypes <- table(theTypes)
theLogins <-table(table(theLogins))
theComments = table(strsplit(tolower(paste(theEvents$CommitCommentEvent, collapse=" ")), " "))
theDescription = table(strsplit(tolower(paste(theEvents$CreateEvent$description, collapse=" ")), " "))
langues = table(theEvents$PullRequestEvent$pull_requestBaseRepoLanguage)
languageInPullRequests = langues[names(langues) != ""]
langues = table(theEvents$PullRequestReviewCommentEvent$pull_requestBaseRepoLanguage)
languagesInPullRequestComments = langues[names(langues) != ""]
commitMessages = theEvents$PushEvent$message
commitMessages = tail(sort(table(strsplit(tolower(paste(commitMessages, collapse=" ")), " "))),100)

######################## End transforming Data
########################

######################## Start visualising Data
########################

barplot(theLogins / sum(theLogins), 
        xlab = "number of commits made", 
        ylab = "part from total number of commits", 
        main= "Repartition of the number of commits made in one hour par person")
pie(theTypes, labels = names(theTypes), main="Pie Chart of Git Events")
pie(theComments[theComments > 5])
pie(theDescription[theDescription > 12][-1])
pie(languageInPullRequests,main="Programming languages used in PullRequest")
pie(languagesInPullRequestComments, main="Programming languages used in PullRequestComments")
pie(commitMessages, main = "words used the most in commits...")
barplot(sort(table(theEvents$PushEvent$name), decreasing = TRUE)) #some make more than 150 push events in one hour :/
pie(table(theEvents$CreateEvent$ref_type),main="create event ref-Tyoe")
barplot(table(theEvents$PullRequestEvent$action), main="Number of pullRequestEventActions")
barplot(table(theEvents$PullRequestEvent$pull_requestState), main="state of pullRequestEventActions") #very similar...
theEvents$PullRequestEvent$pull_requestTitle

######################## End visualising Data
########################

# A exporter :
# theLogins / sum(theLogins)
# theTypes
# theComments[theComments > 10]
# languageInPullRequests
# languagesInPullRequestComments
# etc...