// Used to make an ES2015+ ready environment on current browsers
import "@babel/polyfill"
import i18next from 'i18next';
import dayjs from 'dayjs'
import '@vaadin/vaadin-date-picker/vaadin-date-picker.js';

// UIUtils (to make analysis containers)
import UIUtils from './helpers/ui.utils';

// Custom helpers 
// D3 Related should be exported from that package
import {
    // drawPie, 
    drawHorizontalBarGraph, 
    drawLine,
    drawTendanceGraph
} from './helpers/d3.utils';
// Progress handler
import { Progress } from './helpers/progress.utils';
import { 
    eventTypes, 
    getFromGHArchive, 
    filterDataByEvent, 
    getPeriodFromGH,
    getPreparedData
} from './helpers/ghArchive.utils';

import { languageResource } from "./helpers/i18n.utils";
// import { callGitHubForTopic } from "./helpers/githubApi.utils";
import { parsePullRequestsLanguages, parseCommonWordsInCommits, convertMS, meanIssue } from "./helpers/analysis.utils";

const i18n = i18next.init({
    lng: 'en',
    debug: true,
    resources: languageResource
});

i18n.on('languageChanged', (_lang) => {
    console.log('recreating UI for', _lang);
    makeUI();
});

// HTML Elements
const debugZone = document.querySelector('#debug');
const debugElement = document.querySelector('#debugProgress');
const debugProgressTitle = document.querySelector('#debugProgressTitle');
const debugProgress = new Progress(debugElement, debugProgressTitle);

debugProgress.hide();

makeUI();
UIUtils.bindLangFlags(i18n);

/**
 * Paint entire "web-app" ui
 * (called on page load / lang change)
 */
function makeUI(){
    const currentLang = i18n.languages[0];
    const siteTitle = i18n.t('siteTitle');
    document.querySelector('html').lang = currentLang;
    document.querySelector('.title').innerText = siteTitle;
    document.title = siteTitle;

    // GHArchive utils
    // Analysis #1 Languages distributions in Pull requests for a given date
    UIUtils.makeAnalysisContainer(
        'languageDistribution', 
        i18n.t('analysis1'),
        {
            inputValue: "2018-01-01",
            inputValueHour: 12,
            component: 'button',
            title: i18n.t('invert'),
            onStart: async function(){
                debugProgress.show(i18n.t('analysisInProgress'));

                const date = this.input.value;
                if(!date || this.hourInput.value > 23 || this.hourInput.value < 0) return;

                try {
                    const context = this;
                    const parsedObjects = await getFromGHArchive(date+"-"+this.hourInput.value, debugProgress);
                    // Filtering every pullRequest
                    const pullRequests = filterDataByEvent(parsedObjects, eventTypes.pullRequest);
                    debugProgress.total(pullRequests.length);

                    // Instanciate a new languages object
                    const languages = parsePullRequestsLanguages(pullRequests, debugProgress);
                    // draw d3 pie
                    // drawPie(languages, date, this.pie, "language", "count");
                    context.isDesc = true;
                    languages.sort((langA, langB) => langB.count - langA.count);
                    drawHorizontalBarGraph(this.pie, languages, "language", "count", true);
                    this.input.style.border = "";
                    // @tools debug
                    console.log(`Languages distribution in pull requests :`, languages);
                    debugZone.style.display = "block";
                    debugZone.innerHTML = JSON.stringify(languages, null, 2);
                    debugProgress.hide();            
                } catch (err) {
                    this.input.style.border = "1px solid red";
                    throw err;
                }
            },
            onUpdate: async function(event) {
                debugProgress.show(i18n.t('analysisInProgress'));
                const context = this;
                const date = this.input.value;
                console.log('update', event, context);
                const parsedObjects = await getFromGHArchive(this.input.value+"-"+this.hourInput.value, debugProgress);
                const pullRequests = filterDataByEvent(parsedObjects, eventTypes.pullRequest);
                if(context.isDesc === true){
                    context.isDesc = false;
                } else {
                    context.isDesc = true;
                }
                const languages = parsePullRequestsLanguages(pullRequests,debugProgress).sort((langA, langB) => context.isDesc ? langB.count - langA.count : langA.count - langB.count);
                drawHorizontalBarGraph(this.pie, languages, "language", "count", true);
                debugProgress.total(pullRequests.length);
                debugProgress.hide();            
                debugZone.style.display = "block";
                debugZone.innerHTML = JSON.stringify(languages, null, 2);
            }
    }, i18n);

    const numberOfWords = 20;
    UIUtils.makeAnalysisContainer(
        'drawCommonWords', 
        i18n.t('analysis2'),
        {
            inputValue: "2018-01-01",
            inputValueHour: 12,
            onStart: async function(){
                debugProgress.show(i18n.t('analysisInProgress'));
                // https://developers.google.com/machine-learning/guides/text-classification/step-2
                const date = this.input.value;
                if(!date || this.hourInput.value > 23 || this.hourInput.value < 0){
                    return;
                }

                // TODO : Remove bots
                try {
                    const part = await parseCommonWordsInCommits(this.input.value+"-"+this.hourInput.value, numberOfWords, debugProgress);
                    drawHorizontalBarGraph(this.pie, part, "pair", "occurences", true);

                    // drawPie(part, date, this.pie, "pair", "occurences");
                    console.timeEnd();
                    console.log(part);
                    debugZone.style.display = "block";
                    debugZone.innerHTML = JSON.stringify(part, null, 2);
                    debugProgress.hide();            
                } catch (err) {
                    this.input.style.border = "1px solid red";
                    throw err;
                }
            },
            component: 'range',
            title: i18n.t('numberOfWords'),
            min: 1,
            max: 500,
            initialValue: numberOfWords,
            onUpdate: async function(event) {
                const context = this;
                console.log('update', event, context);
                const part = await parseCommonWordsInCommits(this.input.value+"-"+this.hourInput.value, event.target.value, debugProgress);
                drawHorizontalBarGraph(this.pie, part, "pair", "occurences", true);
                // drawPie(part, context.input.value, context.pie, "pair", "occurences", true, true);
            }
    }, i18n);

    UIUtils.makeAnalysisContainer(
        'timeToResolveIssues',
        i18n.t('analysis3'), 
        {
            inputValue: "2018-01-01",
            onStart: async function(){
                debugProgress.show(i18n.t('analysisInProgress'));
                const startDate = this.input.value;
                const endDate = document.querySelector("#endDateInput").value;
                if(!startDate && !endDate){
                    return;
                }
    
                // TODO XXX : Cleanup after next analysis done (we will have a period choicer)
                const periods = await getPeriodFromGH(`${startDate}`, `${endDate}`, debugProgress)
                const dataset = [];

                // WARN : I think it's a wrong analysis (dead-end)
                // INFO : No, it could be an interesting KPI to display
    
                // TODO XXX : Fix this loop, we need to "concat days" as we have data for each hours
                // Todo we just calc the "meanTime" for an hour, not so useful
                Object.keys(periods).map((period)=>{
                    const issuesEvents = filterDataByEvent(periods[period].data, eventTypes.issues);
                    const middleTimeToResolve = issuesEvents
                    .filter((issue)=>{
                        return issue.payload.issue.created_at !== null && issue.payload.issue.closed_at !== null
                    })
                    .map((issue)=>{
                        return dayjs(issue.payload.issue.closed_at).diff(dayjs(issue.payload.issue.created_at));
                    });
                    let x = convertMS(meanIssue(middleTimeToResolve));
                    dataset.push(
                        {
                            "y":x,
                            "x":period
                        }
                    )
                    //console.log("For period : " + period + ", the mean time is : " + x.day + "d " + x.hour + "h " + x.minute + "m " + x.seconds + "s")
                });
                drawLine(dataset, this.pie, i18n.t('date'), i18n.t('meanTimeInDays'), false, true, function(a, b, c) {
                    console.warn('For period : ', a.x, ' the middle time in day is ', a.y.day);
                });
                debugProgress.hide();
            },
            onMount: function() {
                // This function create an input to enable choosing an end date
                // for the timeToResolveIssues analysis
                const endDateInputValue = "2018-01-02";
                let panel = this.panel
                let endDateInput = document.createElement("vaadin-date-picker");
                let toText = document.createElement("span");

                endDateInput.id = "endDateInput";
                endDateInput.value = endDateInputValue;
                panel.insertBefore(endDateInput, this.input.nextSibling);

                toText.innerHTML = i18n.t('\t\tto\t\t');
                panel.insertBefore(toText, endDateInput);
            },
            onUpdate: function(){
                // Todo?
            }
        }, 
        i18n
    );

    // TODO XXX : 
    // Use commit messages to classify by tasks, will be more useful as we are in hours/days
    // Make a dictionary of words related to specific programmer tasks :
    // UI, fix, .....
    // Classify every commit message found in a category
    
    // If we have time to do it...
    UIUtils.makeAnalysisContainer(
        'topicBasedAnalysis', 
        i18n.t('topicBasedAnalysis'),  
        {
            onMount: function() {
                const context = this;
                console.log(context);
                /* 
                    Append a topic add list, [TopicName, TopicInput] + AddButton
                    Append a "period choicer"
                */
            },
            onStart: function(){
                console.warn('WIP : Implement topic based analysis');
                /* 
                    will use : callGitHubForTopic("https://github.com/:owner/:repo", debugProgress);
                    and getPeriodFromGH

                    Draw an analysis container 
                    Topic adder to train classifier with repository url
                    React : reactRepoURL
                    + button to append
                    On "Train click" -> Train foreach topics

                    Period choice from : to:
                    bar graph of occurences in commit messages for period
                */
            }
    }, i18n);

    UIUtils.makeAnalysisContainer(
        'Tendance2016', 
        i18n.t('Tendance2016'),  
        {
            onMount: async function(){
                const context = this;
                console.log(context);
                try {
                    const parsedObjects = await getPreparedData("2016", debugProgress);
                    const theObject = parsedObjects[0];
                    drawTendanceGraph(this.pie, theObject,"2016");
                } catch (err) {
                    console.log("somethink went wrong...");
                    throw err;
                }
            },
    }, i18n);

    UIUtils.bindAccordions();
}


// getPeriodFromGH('2018-01-01-10', '2018-02-01-10', debugProgress);