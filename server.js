'use strict';

const express = require('express');

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const mongoose = require('mongoose');

const urlExists = require("url-exists");

const dns = require("dns");

const cors = require('cors');

const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}))

// Basic Configuration 
const port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/shorturl/:shortUrl?', (req,res) => {
  let url = req.params.shortUrl;
  MongoClient.connect(process.env.MONGOLAB_URI, (err, db) => {
    db.collection("urls").find({shortUrl:url}).toArray((err,result) => {
      res.redirect(result[0].originalUrl);
    })
  });
  
});

app.post('/api/shorturl/new', (req,res) => {
  
  let bodyUrl = req.body.url;
  urlExists(bodyUrl, (err, exists) => {
  if (!exists) {
    res.json({"error":"invalid URL"}); 
  }
  else {
    let sliceStart = bodyUrl.indexOf('.');
    let sliceEnd = bodyUrl.indexOf('.com');
    let shortenedUrl = bodyUrl.slice(sliceStart+1, sliceEnd);
    MongoClient.connect(process.env.MONGOLAB_URI, (err, db) => {
     db.collection("urls").find({shortUrl: shortenedUrl}).toArray((err,result) => {
       if (result.length > 0 ) {
         res.json({"error":"URL already exists"});
       }
       else {
         db.collection("urls").insertOne({shortUrl: shortenedUrl, originalUrl: bodyUrl});
         res.json( {"original_url":bodyUrl,"short_url":shortenedUrl});
       }
     });
    })
  }
});

});
  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});