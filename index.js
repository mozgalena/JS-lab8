'use strict';
var request = require('sync-request'); 
var fs = require('fs'); 
var express = require('express'); 
var app = express(); 

//https://www.eventbrite.com/
var data1 = {
	url: 'https://www.eventbriteapi.com/v3/events/search',
	method: 'GET',
	name: 'eventbrite',
	qs: {
		token: 'PAO2KHAGY63VJFXVLVDU',
		q: 'market',
		'start_date.range_start': '2018-07-01T00:00:00',
		'start_date.range_end': '2018-07-30T00:00:00',
		'location.within': '5km',
		'location.longitude': '-122.42',
		'location.latitude': '37.78',
		page: 1
	}
};

//https://www.meetup.com
var data2 = {
	url: 'https://api.meetup.com/find/upcoming_events',
	method: 'GET',
	name: 'meetup',
	qs: {
		key: '7a53731324143043b576a2734516c4a',
		text: 'market',
		start_date_range: '2018-07-01T00:00:00',
		end_date_range: '2018-07-30T00:00:00',
		radius: '5',
		lon: '-122.42',
		lat: '37.78',
		page: '1000'
	}
};

function getJSON(data) {
	var req1 = request(data.method, data.url, data);
	var res1 = JSON.parse(req1.getBody('utf8'));
	console.log( data.name + ': ' + res1.events.length + ' events were upload.');
	return res1.events;
}

var eventbrite_json = getJSON(data1);
var meetup_json = getJSON(data2);

function repeats_del(meetup_json, eventbrite_json) {
	var count = 0;
	for (var i = 0; i < meetup_json.length; i++) {
		for (var j = 0; j < eventbrite_json.length; j++) {
			if ( meetup_json[i].name == eventbrite_json[j].name.text ) {
				eventbrite_json.splice(j, 1);
				count++;
			}
		}
	}
	console.log(count + ' repeats were deleted.');
}
repeats_del(meetup_json, eventbrite_json);

function entire(meetup_json, eventbrite_json) {
	var array = []; 
	for (var i = 0; i < meetup_json.length; i++) {
		var item = {
			'name': meetup_json[i].name,
			'link': meetup_json[i].link,
			'description': meetup_json[i].description,
			'date_time': meetup_json[i].local_date + 'T' + meetup_json[i].local_time + ':00'
		}
	array = array.concat(item);
}
	for (var j = 0; j < eventbrite_json.length; j++) {
		var item = {
			'name': eventbrite_json[j].name.text,
			'link': eventbrite_json[j].url,
			'description': eventbrite_json[j].description.html, 
			'date_time': eventbrite_json[j].start.local
		}
	array = array.concat(item);
}
return array;
}
var array = entire(meetup_json, eventbrite_json);

array.sort(function(event1, event2) {
	return Date.parse(event1.date_time) - Date.parse(event2.date_time);
});

function file() {
	for (var i = 0; i < array.length; i++) {
		array[i].date = new Date(Date.parse(array[i].date_time)).toLocaleString("en-US", {year: 'numeric', month: 'long', day: 'numeric'});
	}
	var Date1 = array[0].date;

	fs.writeFileSync('laba8.html', 
		'<!DOCTYPE html>' + 
		'<html lang="en">' + 
		'<head><meta charset="UTF-8"><title>Lab8</title>' +
		'<link rel="stylesheet" href="/public/css/main.css">' + 
		'</head>' + 
		'<body>' +
		'<div class="container"><h1>Welcome to meetings in San-Francisco about market</h1><h2 class="date">' + '</h2>');

	for (var i = 1; i < array.length; i++) {
		if (array[i].date == Date1) {
			fs.appendFileSync('laba8.html',
				'<h3 class="title"><a href=' + array[i].link + ' target=blank>' + array[i].name + '</a></h2><br>' + 
				'<div class="date_time"><strong>Date: </strong> ' + (array[i].date_time == "undefinedTundefined:00" ? 'No access to private group' : array[i].date_time) + '</div><br>' +
				'<div class="description"><strong>Description:</strong> ' + (array[i].description == undefined ? 'No access to private group' : array[i].description) + '</div><br><br>'
			)
		} else {
			Date1 = array[i].date;
			fs.appendFileSync('laba8.html', '<h2 class="date">' + '</h2>');
		}
	}
	fs.appendFileSync('laba8.html', '</body></html>');
	console.log('Was added: ' + array.length + 'events');
}
file();

app.use('/public', express.static('public'));
app.get('/', function(req1, res) {
	res.sendFile(__dirname + "/laba8.html");
});
app.listen(100); 

