#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <unordered_map>
#include <algorithm>
#include <sstream>
#include <stdexcept>
#include "../rapidjson-master/include/rapidjson/document.h"
#include "../rapidjson-master/include/rapidjson/stringbuffer.h"
#include "../rapidjson-master/include/rapidjson/writer.h"
#include <boost/iostreams/device/file.hpp>
#include <boost/iostreams/filtering_stream.hpp>
#include <boost/iostreams/filter/gzip.hpp>

/**
    This program takes the arguments year month startDay
    and processes the GH archives stored in :
    /media/katzenmaul/385201B452017840/ghArchive/ghArchive[year]/ghArchive[year-month]/[year-moth-day-hour].json.gz
    Example :
        /media/katzenmaul/385201B452017840/ghArchive/ghArchive16/ghArchive16-1/2016-01-03-19.json.gz
    and writes the output file in the same directory
    Example :
        /media/katzenmaul/385201B452017840/ghArchive/ghArchive16/ghArchive16-1/O2016-01-03-19.json.gz

    It is launched in parallel for each month of a year to speed up the process

    To keep track of the successful execution it writes logs for each processed month
    into a separated file
    Example :
        /home/katzenmaul/Desktop/gitlogs/MyLogs/MyLogs2016_1.log
**/

namespace io = boost::iostreams;
using namespace rapidjson;
using namespace std;

string getName(int year, int month, int day, int hour, bool origin = false){
    int y = year - 2000;
    string str("/media/katzenmaul/385201B452017840/ghArchive/ghArchive");
    str += to_string(y) + "/ghArchive" + to_string(y) + "-" + to_string(month) + "/";
    if(origin){str += "O";}
    str += to_string(year) + "-";
    str += ((month <= 9) ? "0" : "") + to_string(month) + "-";
    str += ((day <= 9) ? "0" : "") + to_string(day) + "-" ;
    str += to_string(hour) + ".json";
    if(!origin){str += ".gz";}
    cout << str << endl;
    return str;
}

unordered_map<string, int> getData(int year, int month, int day, int hour)
{
    io::filtering_istream in;
    in.push(io::gzip_decompressor());
    in.push(io::file_source(getName(year,month, day, hour)));
    const string pullreq("PullRequestEvent");
    vector<string> langs;
    std::string line;
    Document d;
    while (std::getline(in, line, '\n'))
    {
        d.Parse(line.c_str());
        if( pullreq == string(d["type"].GetString()))
        {
            if(d["payload"]["pull_request"]["base"]["repo"]["language"].IsString())
            {
                    langs.push_back( string(d["payload"]["pull_request"]["base"]["repo"]["language"].GetString()));
            }
        }
    }
    unordered_map<string, int> freq;
    for (std::string const &i: langs)
		freq[i]++;
    close(in);
    return freq;
}

void writeData(unordered_map<string, int> freq, int year, int month, int day, int hour)
{
    Document d;
	d.SetObject();
	Document::AllocatorType& allocator = d.GetAllocator();
    for (auto& it: freq)
    {
        string s = it.first;
        Value index(s.c_str(), s.size(), allocator); // copy string
        d.AddMember(index, it.second, allocator);
    }
	StringBuffer strbuf;
	Writer<StringBuffer> writer(strbuf);
	d.Accept(writer);
	FILE* fp = fopen(getName(year,month,day,hour,true).c_str(), "w");
	std::ofstream outfile;
	string fileName("/home/katzenmaul/Desktop/gitlogs/MyLogs");
	fileName += to_string(year)+"_"+to_string(month)+".log";
    outfile.open(fileName.c_str(), std::ios_base::app);
	if (fp)
	{
	    fputs (strbuf.GetString(),fp);
        fclose (fp);
        outfile << "OK ";
	}
	else
    {
        outfile << "NOTOK ";
    }
    outfile << " year= " << year << " month= " << month << "day= " << day << " hour= " << hour << endl;
}

int main(int argc, char** argv)
{
    if(argc < 3 ){
        cout << "need 3 args : year and month and startDay (example 2016 2 1)";
        return -1;
    }
    int year;
    int month;
    int day;
    std::string arg1 = argv[1];
    std::string arg2 = argv[2];
    std::string arg3 = argv[3];
    try {
      std::size_t pos;
      year = std::stoi(arg1, &pos);
      month = std::stoi(arg2, &pos);
      day = std::stoi(arg3, &pos);
      if (pos < arg1.size()) {
        std::cerr << "Trailing characters after number: " << arg1 << '\n';
      }
    } catch (std::invalid_argument const &ex) {
      std::cerr << "Invalid number: " << arg1 << '\n';
    } catch (std::out_of_range const &ex) {
      std::cerr << "Number out of range: " << arg1 << '\n';
    }

    vector<int> monthDays2016 = {31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
    vector<int> monthDays2017 = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
    vector<vector<int>> years;
    years.push_back(monthDays2016); // 2015
    years.push_back(monthDays2016); // 2016
    years.push_back(monthDays2017); // 2017
    for (; day <= years[year - 2015][month-1]; day++ )
    {
        for(int hour = 0; hour < 24; hour ++)
        {
            unordered_map<string, int> freq = getData(year,month, day, hour);
            writeData(freq, year, month, day, hour);
        }
    }
/*
    Ways to slow :(
    int i = 0;
    years.push_back(monthDays2016);
    years.push_back(monthDays2017);
    for (int year = 2016 ; year <= 2017; year++)
    {
        for (int month = 1; month <= 12; month++)
        {
            for ( int day = 1; day <= years[i][month-1]; day++ )
            {
                for(int hour = 0; hour < 24; hour ++)
                {
                    unordered_map<string, int> freq = getData(year,month, day, hour);
                    writeData(freq, year, month, day, hour);
                }
            }
        }
        i++;
    }
*/
    return 0;
}

