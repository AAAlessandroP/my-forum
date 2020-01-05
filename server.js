var express = require("express");
var assert = require("assert");
var bodyParser = require("body-parser");
const crypto = require("crypto");
// var cors = require("cors"); // se volgio accettare req anche non provenienti da questa pag
const MongoClient = require("mongodb").MongoClient;
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cors())// ok richieste get/post da pagine diverse da una di questo sitoson
app.use(bodyParser.json());
const { ObjectId } = require("mongodb");
app.use(express.static("mia_pag")); // include con USE

app.listen(3000);

console.log("* app in funzione *");
const uri = `mongodb+srv://ms-teams:${process.env.PASS}@miocluster2-igwb8.mongodb.net/test?retryWrites=true&w=majority`;

var sessioni = {};

function c(s, key) {
  return crypto
    .createCipher("aes-256-ctr", key)
    .update(s.toString(), "utf-8", "hex");
}

function d(s, key) {
  return crypto
    .createDecipher("aes-256-ctr", key)
    .update(s.toString(), "utf-8", "hex");
}

function h(s) {
  var hash = crypto.createHash("sha256");
  hash.update(s);
  return hash.digest("base64");
}

app.post("/login", (req, res) => {
  var name = req.body.utente;
  var pass = req.body.passw;

  MongoClient.connect(uri, { useNewUrlParser: true }, (err, db) => {
    if (err) {
      res.sendStatus(401);
      db.close();
      throw err;
    }

    db.db("ms-teams")
      .collection("utenti")
      .findOne({ Name: name }, function(err, resFind) {
        if (err || resFind == null) {
          res.sendStatus(401);
          db.close();
          return;
        }

        if (resFind.HashedPwd === h(resFind.Salt + pass)) {
          var sessId = crypto.randomBytes(32).toString("hex");
          sessioni[sessId] = {
            IDUtente: resFind._id,
            Utente: resFind.Name,
            chiave: pass
          };
          res.send(sessId);
        } else res.sendStatus(401);
        db.close();
      });
  });
});

app.post("/addUser", (req, res) => {
  var name = req.body.utente;
  var pass = req.body.passw;
  var dom = req.body.dom;
  var salt = crypto.randomBytes(32).toString("hex");

  MongoClient.connect(uri, { useNewUrlParser: true }, (err, db) => {
    if (err) {
      res.sendStatus(401);
      db.close();
      throw err;
    }

    var nuovo_utente = {
      Name: name,
      Salt: salt,
      HashedPwd: h(salt + pass)
    };

    //         db.db("ms-teams").collection("utenti").updateOne({},{$push:{dom:nuovo_utente}}).done( function (err, resIns) {
    //             if (err || resIns.insertedCount != 1) {
    //                 res.sendStatus(401);
    //                 db.close();
    //                 throw err;
    //             }

    //             var sessId = crypto.randomBytes(32).toString("hex");
    //             sessioni[sessId] = {
    //                 IDUtente: resIns.insertedId,
    //                 Utente: name,
    //                 chiave: pass
    //             };
    //             console.log("1 nuovo utente inserito");
    //             res.send(sessId);
    //             db.close();
    //         });

    db.db("ms-teams")
      .collection("utenti")
      .updateOne(
        {},
        { $push: { `k`: nuovo_utente } },
        { safe: true, upsert: true },
        function(err, doc) {
          if (err) {
            console.log(err);
          } else {
            console.log(doc.nModified);
            
            // var sessId = crypto.randomBytes(32).toString("hex");
            //             sessioni[sessId] = {
            //                 IDUtente: doc.insertedId,
            //                 Utente: name,
            //                 chiave: pass
            //             };
                        console.log("1 nuovo utente inserito");
                        res.send("sessId");
                        db.close();
          }
        }
      );
  });
});

app.post("/newActivity", (req, res) => {
  var nome = req.body.nome;
  var testo = req.body.testo;
  var sessid = req.body.sessid;

  if (sessioni[sessid])
    MongoClient.connect(uri, { useNewUrlParser: true }, (err, db) => {
      if (err) {
        res.sendStatus(401);
        db.close();
        throw err;
      }
      let key = sessioni[sessid].chiave;

      var nuovaAttivita = {
        Name: c(nome.toString(), key),
        Text: c(testo.toString(), key),
        AppartenenteA: sessioni[sessid].IDUtente
      };
      db.db("ms-teams")
        .collection("dati")
        .insertOne(nuovaAttivita, function(err, resIns) {
          console.log(`resIns`, resIns);
          if (err || resIns.insertedCount != 1) {
            res.sendStatus(401);
            db.close();
            throw err;
          }
          console.log("1 nuovo doc inserito");
          db.close();

          res.send(resIns.insertedId);
        });
    });
  else res.sendStatus(401);
});

app.post("/allNote", function(req, res) {
  var sessid = req.body.sessid;
  if (sessioni[sessid]) {
    MongoClient.connect(uri, { useNewUrlParser: true }, (err, db) => {
      if (err) {
        res.sendStatus(401);
        db.close();
        throw err;
      }
      db.db("ms-teams")
        .collection("dati")
        .find({ AppartenenteA: sessioni[sessid].IDUtente })
        .toArray(function(err, resFind) {
          if (err) {
            res.sendStatus(401);
            db.close();
            throw err;
          }
          if (resFind.length != 0) {
            let tutti = [];
            let key = sessioni[sessid].chiave;

            resFind.forEach(element => {
              tutti.push({
                IDNota: element._id,
                nome: d(element.Name, key),
                testo: d(element.Text, key)
              });
            });

            res.json(tutti);
          } else res.send("nulla salvato");
          db.close();
        });
    });
  } else res.sendStatus(401);
});

app.post("/modificaNota", function(req, res) {
  var sessid = req.body.sessid;
  var IDNota = req.body.IDNota;
  var titoloNuovo = req.body.titoloNuovo;
  var testoNuovo = req.body.testoNuovo;

  if (sessioni[sessid]) {
    let key = sessioni[sessid].chiave;

    MongoClient.connect(uri, { useNewUrlParser: true }, (err, db) => {
      if (err) {
        res.sendStatus(401);
        db.close();
        throw err;
      }

      db.db("ms-teams")
        .collection("dati")
        .updateOne(
          { _id: ObjectId(IDNota) },
          {
            $set: {
              Text: c(testoNuovo.toString(), key),
              Name: c(titoloNuovo.toString(), key)
            }
          },
          (error, result) => {
            assert.equal(err, null);
            db.close();

            res.sendStatus(200);
          }
        );
    });
  } else res.sendStatus(401);
});

app.post("/delNota", function(req, res) {
  var sessid = req.body.sessid;
  var IDNota = req.body.IDNota;

  if (sessioni[sessid]) {
    MongoClient.connect(uri, { useNewUrlParser: true }, (err, db) => {
      if (err) {
        res.sendStatus(401);
        db.close();
        throw err;
      }

      db.db("ms-teams")
        .collection("dati")
        .deleteOne({ _id: ObjectId(IDNota) }, (error, result) => {
          assert.equal(err, null);
          res.sendStatus(200);
        });
    });
  } else res.sendStatus(401);
});
