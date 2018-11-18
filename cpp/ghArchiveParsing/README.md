# Cpp project to process GH archives

## getting the GH archives
First you may need to download the GH archives on your machine.
Use the ../script/aspire.sh script for that, it creates the needed 
directory tree.
Make shure you have enough disk space ~350G and don't unzip the files
else it will take more than 1T of space (gz compression rate may exceed 30-60% with json's).
This takes some time so you have to be patient...(~1.5-2 H per month on my machine)

## To build the project:

(Optional) Import the ghArchiveParsing.cbp into CodeBlocks

the directory paths used are hard-coded in the source code
 - change /media/katzenmaul/385201B452017840/ghArchive/ghArchive
    to where you have launched the aspire script.
 - change /home/katzenmaul/Desktop/gitlogs/MyLogs
    to where you want to save your output logs

the project uses 3 external librarys:
raphidjson libz and libboost_iostreams make shure to link them into the project.
 - change the library paths in the build.sh

then you can build the project
cd ghArchiveParsing
./build.sh

## To run the project:
(make shure to replace the library paths with yours)
cd bin/Debug
xterm -geometry 150x40 -T ghArchiveParsing -e  /usr/local/bin/cb_console_runner LD_LIBRARY_PATH=$LD_LIBRARY_PATH:. /home/katzenmaul/Desktop/projects/cpp/ghArchiveParsing/bin/Debug/ghArchiveParsing 2016 1 0 &

This takes some time too so you have to be patient...(~30min per month on my machine)
