var express = require("express");
var assert = require("assert");
var bodyParser = require("body-parser");
const crypto = require("crypto");
const MongoClient = require("mongodb").MongoClient;
var app = express();
app.use(bodyParser.urlencoded({ extended: false, limit: 50 * 1024 * 1024 }));
app.use(bodyParser.json({
    limit: 50 * 1024 
}));
const { ObjectId } = require("mongodb");
app.use(express.static("mia_pag")); // include con USE

"use strict";

app.listen(3000);
// RIFARLO CON WEBSOCKET
// RIFARLO CON WEBSOCKET
// RIFARLO CON WEBSOCKET
console.log("* app in funzione *");
const uri = `mongodb+srv://forum:${process.env.PASS}@miocluster2-igwb8.mongodb.net/test?retryWrites=true&w=majority`;

// (async function () {
//     var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
//  ci si connette ogni volta prima di una query e dopo ci si scollega!
// })()


var sessioni = {};

app.post("/login", async (req, res) => {
    var name = req.body.utente;
    var pass = req.body.passw;
    var dom = req.body.dom;

    try {
        var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        var dominio = await db
            .db("forum")
            .collection("domini")
            .findOne({ Name: dom });
        if (!dominio) {
            //il dominio non c'era
            res.sendStatus(401);
            return;
        }

        var user = await db.db("forum").collection("utenti").findOne({ Name: name, Dominio: dominio._id });
        if (user && user.HashedPwd === h(user.Salt + pass)) {
            var sessId = crypto.randomBytes(32).toString("hex");
            sessioni[sessId] = {
                IDUtente: user._id,
                IDSuoDominio: user.Dominio,
                Utente: user.Name,
                chiave: pass
            };
            res.send(sessId);
        } else res.sendStatus(401);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.post("/addUser", async (req, res) => {
    var name = req.body.utente;
    var pass = req.body.passw;
    var dom = req.body.dom;
    var salt = crypto.randomBytes(32).toString("hex");

    try {
        var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

        var dominio = await db
            .db("forum")
            .collection("domini")
            .findOne({ Name: dom });

        if (!dominio) {
            //il dominio non c'era
            var newDom = await db
                .db("forum")
                .collection("domini")
                .insertOne({ Name: dom });
            dominio = newDom.ops[0]; //??
        }

        var giaPresente = await db
            .db("forum")
            .collection("utenti")
            .findOne({ Name: name, Dominio: ObjectId(dominio._id) });

        if (!giaPresente) {
            //il dominio non c'era

            var nuovo_utente = {
                Name: name,
                Salt: salt,
                HashedPwd: h(salt + pass),
                Dominio: dominio._id
            };

            try {
                var resIns = await db
                    .db("forum")
                    .collection("utenti")
                    .insertOne(nuovo_utente, { safe: true, upsert: true });

                assert.notEqual(resIns, null)

                var sessId = crypto.randomBytes(32).toString("hex");
                sessioni[sessId] = {
                    IDUtente: resIns.insertedId,//$conn->insert_iid
                    Utente: name,
                    chiave: pass,
                    IDSuoDominio: nuovo_utente.Dominio
                };
                res.send(sessId);
            } catch (error) {
                console.log(`error`, error);
                res.sendStatus(500);
            }
        } else res.send("username already taken in this domain");

        db.close();
    } catch (error) {
        res.sendStatus(500);
    }
});

app.post("/newActivity", (req, res) => {

    console.log('req.files', req.files);


    var nome = req.body.nome;
    var testo = req.body.testo;
    var tipo = req.body.tipo;
    var sessid = req.body.sessid;

    if (sessioni[sessid])
        MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
            if (err) {
                res.sendStatus(401);
                db.close();
                throw err;
            }
            let key = sessioni[sessid].chiave;
            var nuovaAttivita;
            if (tipo == "Semplice")
                nuovaAttivita = {
                    Name: c(nome.toString(), key),
                    Text: c(testo.toString(), key),
                    Tipo: tipo,
                    AppartenenteA: sessioni[sessid].IDUtente,
                    BroadcastDelDom: sessioni[sessid].IDSuoDominio
                };
            else if (tipo == "scheda con scadenza") {
                nuovaAttivita = {
                    Name: c(nome.toString(), key),
                    Text: c(testo.toString(), key),
                    ScadeIL: c(req.body.scadenza.toString(), key),
                    Tipo: tipo,
                    AppartenenteA: sessioni[sessid].IDUtente,
                    BroadcastDelDom: sessioni[sessid].IDSuoDominio
                };
            } else {
                res.sendStatus(500);
                return;
            }

            if (req.files) {
                var docs = []
                if (req.files.docs instanceof Array)
                    req.files.docs.forEach(element => {
                        docs.push(c(JSON.stringify(element), key))
                    });
                else
                    docs.push(c(JSON.stringify(req.files.docs), key))
                nuovaAttivita.allegati = docs;
            }

            // console.log(`nuovaAttivita`, nuovaAttivita);
            db.db("forum")
                .collection("dati")
                .insertOne(nuovaAttivita, function (err, resIns) {
                    // console.log(`resIns`, resIns);
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

app.post("/allUsers", async (req, res) => {

    try {
        var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        var dati = await db
            .db("forum")
            .collection("utenti")
            .find({})
            .project({ Name: 1 })
            .toArray();

        res.json(dati);
    } catch (error) {
        console.log(`error`, error);
        res.sendStatus(500);
    }
});

var page = require("./userPageMod")

app.get("/user/:uid", async (req, res) => {
    var uid = req.params.uid

    let o = ObjectId(uid);
    console.log(o)
    var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    let hisData = await db.db("forum").collection("utenti").findOne({ _id: ObjectId(uid) })
    let hisPosts = await db.db("forum").collection("messaggi").find({ By: ObjectId(uid) }).toArray()
    db.close()
    res.send(page.page(uid, hisData, hisPosts))
});


app.post("/allThreads", async (req, res) => {

    try {
        var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        var dati = await db
            .db("forum")
            .collection("messaggi")
            .find({ replyTo: null })
            .toArray();

        dati = await Promise.all(dati.map(async post => {
            let a = await db.db("forum").collection("utenti").findOne({ _id: ObjectId(post.By) })
            post.ByName = a.Name
            return post
        }));

        console.log(`dati`, dati);
        res.json(dati);
    } catch (error) {
        console.log(`error`, error);
        res.sendStatus(500);
    }
});

app.post("/modificaNota", async (req, res) => {

    var sessid = req.body.sessid;
    var IDNota = req.body.IDNota;
    var titoloNuovo = req.body.nome;
    var testoNuovo = req.body.testo;
    var scadenza = req.body.scadenza;

    if (sessioni[sessid]) {

        try {
            var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
            var whatSet = {
                $set: {
                    Text: c(testoNuovo.toString(), key),
                    Name: c(titoloNuovo.toString(), key)
                }
            };
            let key = sessioni[sessid].chiave;

            if (req.body.scadenza) whatSet.$set.ScadeIL = c(req.body.scadenza, key);
            if (req.files)
                whatSet.$push = { allegati: c(JSON.stringify(req.files.docs), key) };
            let what = { _id: ObjectId(IDNota), BroadcastDelDom: sessioni[sessid].IDSuoDominio, AppartenenteA: sessioni[sessid].IDUtente }

            let result = awaitdb.db("forum").collection("dati").updateOne(what, whatSet);
            assert.equal(err, null);
            // assert.equal(result.modifiedCount, 1); sennò se cerco di modificarlo con dati identici a quelli preesistenti va a 0 modifiedCount
            assert.equal(result.matchedCount, 1);

            var newNote = await db.db("forum").collection("dati").findOne({ _id: ObjectId(IDNota) });
            db.close();
            res.json(newNote);
        } catch (error) {
            res.sendStatus(503);
        }
    } else res.sendStatus(401);
});

app.post("/delNota", function (req, res) {
    var sessid = req.body.sessid;
    var IDNota = req.body.IDNota;
    if (sessioni[sessid]) {
        MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
            if (err) {
                res.sendStatus(401);
                db.close();
                throw err;
            }
            console.log(`sessioni[sessid]`, sessioni[sessid]);
            db.db("forum")
                .collection("dati")
                .deleteOne({ _id: ObjectId(IDNota), BroadcastDelDom: sessioni[sessid].IDSuoDominio, AppartenenteA: sessioni[sessid].IDUtente }, (error, result) => {

                    assert.equal(err, null);
                    if (result.deletedCount == 1)
                        res.sendStatus(200);
                    else
                        res.sendStatus(500);
                });
        });
    } else res.sendStatus(401);
});
