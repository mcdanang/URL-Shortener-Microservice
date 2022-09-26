require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const dns = require('dns');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
});
const Url = mongoose.model("Url", urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
  (mongoose.connection.readyState === 1) ? status = "MongoDB online" : status = "MongoDB offline"
  console.log(status)
});

// Your first API endpoint
app.get('/api/hello', (req, res) => {
  res.json({ greeting: 'hello API' });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

app.post('/api/shorturl', (req, res) => {
  const oriUrl = req.body.url;
  let hostname = oriUrl.replace(/https?:\/\//, "");
  hostname = hostname.replace(/\/.*/, "");
  console.log(oriUrl);
  console.log(hostname);
  
  // lookup the hostname passed as argument
  dns.lookup(hostname, async (error, address, family) => {
    
    // if an error occurs, eg. the hostname is incorrect!
    if (error) {
      console.error(error.message);
      res.json({
        error: "invalid url"
      });
    } else {
      // if no error exists
      console.log(
        `The ip address is ${address} and the ip version is ${family}`
      );

      // check if url exist in database
      const urlExist = await Url.exists({original_url: oriUrl}, async (err, doc) => {
        if (err) {
          console.log(err)
        } else {
          console.log('is url exist?: ' + !!doc);
          if (!!doc) {
            const doc = await Url.findOne({original_url: oriUrl});
            res.json({
              original_url: doc.original_url,
              short_url: doc.short_url
            })            
          } else {
            // insert new doc to db
            const count = await Url.countDocuments({});
            
            const newDoc = await Url.create({
              original_url: oriUrl,
              short_url: count
            });
            console.log("new url has been added to database")

            const doc = await Url.findOne({original_url: oriUrl});
            res.json({
              original_url: doc.original_url,
              short_url: doc.short_url
            });
          }      
        }
      });
    }
  });
});

app.get('/api/shorturl/:shortUrl', async (req, res) => {
  const shortUrl = req.params.shortUrl;
  const shortUrlExist = await Url.exists({short_url: shortUrl}, async (err, doc) => {
    if (err) {
      console.log(err)
    } else {
      console.log('is short_url exist?: ' + !!doc);
      if (!doc) {
        res.json({
          error: "invalid url"
        });
      } else {
        const doc = await Url.findOne({ short_url: shortUrl});
        res.redirect(doc.original_url);      
      }
    }
  });
});