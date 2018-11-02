library(jsonlite)
#changer le chemin vers le fichier 2015-01-01-0.json
myFile <- file("Desktop/mbds/R/2015-01-01-0.json","r") 
myLines <- readLines(myFile) # Besoin de 18 Mb memoire vive...
close(myFile)
# pour afficher quelques infos sur la console
myJSONs <- fromJSON(myLines[1])
names(myJSONs)
myJSONs$type # in ["pushEvent","ReleaseEvent","ForkEvent", etc ... ]
myJSONs$actor$login
myJSONs$repo$name
myJSONs$payload # differe avec le type ... embetant ...
myJSONs$public
###
myTypes <- c()
myLogins <- c()
#nbOfPublic <- 0 # all of them are public :(
n <- length(myLines) # nombre des lignes
for(line in myLines){
  line = fromJSON(line)
  myTypes = c(myTypes,line$type)
  myLogins = c(myLogins, line$actor$login)
  #if(line$public){nbOfPublic <- nbOfPublic + 1}
}
myTypes <- table(myTypes) # a exporter...
myLogins <-table(table(myLogins)) # a exporter...
barplot(myLogins / sum(myLogins), 
        xlab = "number of commits made", 
        ylab = "part from total number of commits", 
        main= "Repartition of the number of commits made in one hour par person")
pie(myTypes, labels = names(myTypes), main="Pie Chart of Git Events")

# to see whats is in differents payloads ->
for(theNames in names(myTypes)){
  print("------------------------------------------------------------------------------------------------------------")
  print(theNames)
  print("------------------------------------------------------------------------------------------------------------")
  for(line in myLines){
    line = fromJSON(line)
    if(line$type == theNames){
      print(line$payload)
      break;
    }
  }
}



