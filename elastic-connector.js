/**
 * Created by chamod on 4/29/18.
 */
var express = require('express');
var elasticsearch = require('elasticsearch');

module.exports.getNodes = function (index) {
    return new Promise(function (resolve, reject) {
        var client = new elasticsearch.Client({
            host: 'localhost:9200',
            log: 'trace'
        });

        client.ping({
            // ping usually has e 3000ms timeout
            requestTimeout: 1000
        }, function (err) {
            if (err) {
                console.trace('elasticsearch cluster is down!');
                reject('elasticsearch cluster is down!');
            } else {
                console.log('All is well');
            }
        });

        var graph_json = {
            nodes: [],
            links: []
        }

        client.search({
            index: index,
            type: 'tweet',
            body: {
                query: {
                    match_all: {}
                }
            },
            size: 1000
        }).then(function (resp) {
            var hits = resp.hits;
            hits.hits.forEach(function (value, index) {
                var color = 'green';
                if (value._source.emotion == 'sad') {
                    color = 'blue';
                } else if (value._source.emotion == 'excited') {
                    color = 'yellow';
                } else if (value._source.emotion == 'fear') {
                    color = 'black';
                } else if (value._source.emotion == 'angry') {
                    color = 'red';
                }
                graph_json.nodes.push({
                    name: value._source.id.toString(),
                    color: color,
                    time: value._source.time,
                    title: value._source.text,
                    emotion: value._source.emotion,
                    sentiment: value._source.sentiment,
                });
                graph_json.links.push({
                    source: value._source.parent,
                    target: value._source.id
                });
            });

            resolve(graph_json);
        }, function (err) {
            reject(err.message);
        });
    });
};
