#!/bin/bash
monthDays2016=(31 29 31 30 31 30 31 31 30 31 30 31)
monthDays2017=(31 28 31 30 31 30 31 31 30 31 30 31)
month=1
echo "" > aspire.sh
echo "mkdir ghArchive16" >> aspire.sh
echo "cd ghArchive16" >> aspire.sh
for day in ${monthDays2016[@]}; do
	echo "mkdir ghArchive16-$month"  >> aspire.sh
	echo "cd ghArchive16-$month"  >> aspire.sh

	if [ $month -gt 9 ]; then
		echo "wget http://data.gharchive.org/2016-$month-{01..$day}-{0..23}.json.gz" >> aspire.sh
	else
		echo "wget http://data.gharchive.org/2016-0$month-{01..$day}-{0..23}.json.gz" >> aspire.sh
	fi  

	month=$(($month + 1))  &&
	echo "cd ../" >> aspire.sh
done 

echo "mkdir ghArchive17" >> aspire.sh
echo "cd ghArchive17" >> aspire.sh
for day in ${monthDays2016[@]}; do
	echo "mkdir ghArchive17-$month"  >> aspire.sh
	echo "cd ghArchive17-$month"  >> aspire.sh

	if [ $month -gt 9 ]; then
		echo "wget http://data.gharchive.org/2017-$month-{01..$day}-{0..23}.json.gz" >> aspire.sh
	else
		echo "wget http://data.gharchive.org/2017-0$month-{01..$day}-{0..23}.json.gz" >> aspire.sh
	fi  

	month=$(($month + 1))  &&
	echo "cd ../" >> aspire.sh
done 
chmod 776 aspire.sh
