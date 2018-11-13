#include <iostream>
#include "../rapidjson-master/include/rapidjson/document.h"
#include <fstream>
#include <string>
#include <vector>
#include <unordered_map>
#include "../rapidjson-master/include/rapidjson/stringbuffer.h"
#include "../rapidjson-master/include/rapidjson/writer.h"

using namespace rapidjson;
using namespace std;

string getName(int year, int month, int day, int hour, bool origin = false){
    string str("/media/katzenmaul/744883DA48839A0E/gharchive/");
    if(origin){str += "O";}
    str += to_string(year) + "-";
    str += ((month <= 9) ? "0" : "") + to_string(month) + "-";
    str += ((day <= 9) ? "0" : "") + to_string(day) + "-" ;
    str += to_string(hour) + ".json";
    cout << str << endl;
    return str;
}

unordered_map<string, int> getData(int year, int month, int day, int hour)
{

    FILE* fp = fopen(getName(year,month,day,hour).c_str(), "r");
    if (fp == NULL)
        exit(EXIT_FAILURE);

    char* line = NULL;
    size_t len = 0;
    const string pullreq("PullRequestEvent");
    vector<string> langs;
    Document d;
    while ((getline(&line, &len, fp)) != -1)
    {
        d.Parse(line);
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

    fclose(fp);
    if (line)
        free(line);
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
	if (fp)
	{
	    fputs (strbuf.GetString(),fp);
        fclose (fp);
        cout << "OK " << "day " << day << "hour " << hour << endl;
	}
	else
    {
        cout << "NOTOK " << "day " << day << "hour " << hour << endl;
    }
}

int main()
{

    for ( int day = 1; day <= 31; day++ )
    {
        for(int hour = 0; hour < 24; hour ++)
        {
            unordered_map<string, int> freq = getData(2015,1, day, hour);
            writeData(freq,2018,1,day, hour);
        }
    }
    return 0;
}
