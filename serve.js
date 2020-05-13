const express = require('express');
const fs = require('fs');
const path = require("path");
const util = require('util');

const PORT = process.env.PORT || 7500;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// allow static files to be included in html
app.use('/static', express.static(__dirname + '/static'));
app.use(express.static(__dirname + '/public'));

let id = 0;

const getID = async () => {
    let data = await fs.promises.readFile("db.json");
    data = JSON.parse(data);
    // console.log(data.notes[data.notes.length - 1].id + 1);
    if(data.notes.length > 0) return data.notes[data.notes.length - 1].id + 1;
    else return 0;

}

// const main = async () => {
//   let id = await getID();
//   console.log(id);
// }


// ROUTES

// html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "/public/views/index.html"));
});

app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, "/public/views/notes.html"));
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
app.post('/api/notes', async (req, res) => {

  let id = await getID();
  console.log(id);

  const newNote = req.body;
  newNote.id = parseInt(id);

  console.log(newNote);

  fs.readFile('db.json', (err, data) => {
    if(err) console.log(err);

    let myData = JSON.parse(data);

    myData.notes.push(newNote);
    // console.log(myData);

    fs.writeFile('db.json', JSON.stringify(myData), (err, result) => {
      if(err) console.log(err);
    });
    return res.sendFile(path.join(__dirname, "/public/views/index.html"));

  });


});

app.get('/api/notes/delete/:id', (req, res) => {
  const id = req.params.id;
  const newNotes = {"notes": []};
  fs.readFile('db.json', 'utf8', (err, data) => {
    if(err) return res.json(JSON.parse(err));
    let notes = JSON.parse(data).notes;
    notes.forEach( note => {
      if(note.id != id) {
        newNotes.notes.push(note);
      }

    });

    fs.writeFile('db.json', JSON.stringify(newNotes), (err, data) => {
      if(err) return res.json(JSON.parse(err));
      return res.sendFile(path.join(__dirname, "/public/views/notes.html"));
    });

  });



});

const server = app.listen(PORT, function () {
   console.log("Example app listening at http://localhost:" + PORT);
});
