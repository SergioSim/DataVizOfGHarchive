#!/bin/bash
monthDays2016=(31 29 31 30 31 30 31 31 30 31 30 31)
monthDays2017=(31 28 31 30 31 30 31 31 30 31 30 31)
echo "" > aspire.sh

echo "mkdir ghArchive15" >> aspire.sh
echo "cd ghArchive15" >> aspire.sh
month=1
for day in ${monthDays2017[@]}; do
	echo "mkdir ghArchive15-$month"  >> aspire.sh
	echo "cd ghArchive15-$month"  >> aspire.sh

	if [ $month -gt 9 ]; then
		echo "wget http://data.gharchive.org/2015-$month-{01..$day}-{0..23}.json.gz" >> aspire.sh
	else
		echo "wget http://data.gharchive.org/2015-0$month-{01..$day}-{0..23}.json.gz" >> aspire.sh
	fi  

	month=$(($month + 1))  &&
	echo "cd ../" >> aspire.sh
done 

echo "mkdir ghArchive16" >> aspire.sh
echo "cd ghArchive16" >> aspire.sh
month=1
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
month=1
for day in ${monthDays2017[@]}; do
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


echo "" > move.sh
month=1
echo "mkdir output17" >> move.sh
echo "cd ghArchive17" >> move.sh
for day in ${monthDays2017[@]}; do
	echo "cd ghArchive17-$month"  >> move.sh
    echo "mv O* ../../output17/" >> move.sh
	month=$(($month + 1))  &&
	echo "cd ../" >> move.sh
done 
chmod 776 move.sh
