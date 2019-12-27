// server.js
// where your node app starts

// init project
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors())
const uri = `mongodb+srv://r00t:${process.env.PASS}@miocluster2-igwb8.mongodb.net/test?retryWrites=true&w=majority`;

var sessioni = {};

app.post("/login", (req, res) => {
  var name = req.body.utente;
  var pass = req.body.passw;

  MongoClient.connect(uri, { useNewUrlParser: true }, (err, db) => {
    if (err) throw err;
    var dbo = db.db("trello");

    dbo.collection("utenti").findOne({ Name: name }, function(err, resFind) {
      if (err || resFind == null) {
        res.sendStatus(401);
        db.close();
        return;
      }
      const hash = crypto.createHash("sha256");
      hash.update(resFind.Salt + pass);
      let hashed = hash.digest("base64");
      if (resFind.HashedPwd === hashed) {
        var sessId = crypto.randomBytes(32).toString("hex");
        sessioni[sessId] = {
          IDUtente: resFind._id,
          Utente: resFind.Name,
          chiave: resFind.pass2cypher
        };
        // console.log(`sessioni dopo /login`, sessioni);
        res.send(sessId);
      } else res.sendStatus(401);
      db.close();
    });
  });
});

app.post("/addUser", (req, res) => {
  var name = req.body.utente;
  var pass = req.body.passw;
  var salt = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256");
  hash.update(salt + pass);
  let hashed = hash.digest("base64");

  MongoClient.connect(uri, { useNewUrlParser: true }, (err, db) => {
    if (err) throw err;
    var dbo = db.db("trello");

    var nuovo_utente = {
      Name: name,
      Salt: salt,
      HashedPwd: hashed,
      pass2cypher: pass
    };
    dbo.collection("utenti").insertOne(nuovo_utente, function(err, resIns) {
      if (err) throw err;
      console.log("1 nuovo utente inserito");
      dbo.collection("utenti").findOne(nuovo_utente, function(err, resFind) {
        if (err) {
          res.sendStatus(401);
          db.close();
          throw err;
        }
        var sessId = crypto.randomBytes(32).toString("hex");
        sessioni[sessId] = {
          IDUtente: resFind._id,
          Utente: nuovo_utente.Name,
          chiave: nuovo_utente.pass2cypher
        };
        res.send(sessId);
        db.close();
      });
    });
  });
});
