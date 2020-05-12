const express = require('express');
const fs = require('fs');
const path = require("path");

const PORT = process.env.PORT || 7500;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// allow static files to be included in html
app.use('/static', express.static(__dirname + '/static'));
app.use(express.static(__dirname + '/public'));


// get the highest id and add 1
let id = 0;
fs.readFileSync('db.json', (err, data) => {
  if(err) throw new Error('FAILED STARTING SERVER');
  data = JSON.parse(data).notes;
  if(data.length > 0) id = data[data.length - 1].id;
});
console.log(id);

// ROUTES

// html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "/public/views/index.html"));
});

app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, "/public/views/notes.html"));
});

app.get('/notes/:noteID', (req, res) => {
  const id = req.param.noteID;
  // fs.readFile('db.json', (err, data) => {
  //   res.json(JSON.parse(data).notes.filter( note => {
  //     note.id === id;
  //   }));
  // });
  res.sendFile(path.join(__dirname, "public/views/singleNote.html"));
});


// api
app.get('/api/docs', (req, res) => {
  res.sendFile(path.join(__dirname, "public/views/apiDocs.html"));
});

app.get('/api/notes', (req, res) => {
  fs.readFile('db.json', 'utf8', (err, data) => {
    if(err) return res.json(JSON.parse(err));
    else return res.json(JSON.parse(data));
  });
});

app.get('/api/notes/:id', (req, res) => {
  const id = req.params.id;
  fs.readFile('db.json', 'utf8', (err, data) => {
    if(err) return res.json(JSON.parse(err));
    return res.json(JSON.parse(data).notes.filter( note => {
      return note.name === id || note.id == id;
    }));
  });
});

// accept JSON and append it to the db.json file
app.post('/api/notes', (req, res) => {
  const newNote = req.body;

  newNote.id = parseInt(newNote.id);

  fs.readFile('db.json', (err, data) => {
    if(err) console.log(err);

    let myData = JSON.parse(data);

    myData.notes.push(newNote);
    console.log(myData);

    fs.writeFile('db.json', JSON.stringify(myData), (err, result) => {
      if(err) console.log(err);
    });
    return res.json(myData);
  });

});

app.get('/api/notes/delete/:id', (req, res) => {
  console.log('hey');
  const id = req.params.id;
  let arr = [];
  fs.readFile('db.json', 'utf8', (err, data) => {
    if(err) return res.json(JSON.parse(err));
    arr.push(JSON.parse(data).notes.filter( note => {
      return note.id != id;
    }));
  });
  fs.writeFile('db.json', JSON.stringify(arr), (err, data) => {
    if(err) return res.json(JSON.parse(err));
    return res.json(data);
  });

});


const server = app.listen(PORT, function () {
   console.log("Example app listening at http://localhost:" + PORT);
});
