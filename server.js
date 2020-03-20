var express = require("express");
var assert = require("assert");
var bodyParser = require("body-parser");
const crypto = require("crypto");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
var app = express();
app.use(bodyParser.urlencoded({ extended: false, limit: 50 * 1024 * 1024 }));
app.use(bodyParser.json({
    limit: 50 * 1024
}));
const { ObjectId } = require("mongodb");
const session = require('express-session')

app.use(express.static("mia_pag")); // include con USE
app.use(cors())
"use strict";

app.listen(3000);
app.use(
    session({
        // store,
        name: 'sid',
        saveUninitialized: false,
        resave: false,
        secret: `quiet, pal! it's a secret!`,
        cookie: {
            maxAge: 1000 * 60 * 60 * 2,
            sameSite: true,
            secure: process.env.NODE_ENV === 'production'
        }
    })
)
console.log("* app in funzione *");
const uri = `mongodb+srv://forum:${process.env.PASS}@miocluster2-igwb8.mongodb.net/test?retryWrites=true&w=majority`;


function c(s, key) {
    return crypto.createCipher("aes-256-ctr", key).update(s.toString(), "utf-8", "hex");
}

function d(s, key) {
    return crypto.createDecipher("aes-256-ctr", key).update(s, "hex", "utf-8");
}

function h(s) {
    var hash = crypto.createHash("sha256");
    hash.update(s);
    return hash.digest("base64");
}

function loggedChecker(req, res, next) {
    console.log("req.session.lui", req.session.lui)
    if (req.session.lui !== undefined)
        next()
    else
        res.sendStatus(401)
}

var ARR_AUTH_TOKENS = {};
var access_tokens = {};

app.get("/login", loggedChecker, loggedChecker, async (req, res) => {
    var Name = req.query.utente;
    var pass = req.query.passw;

    var redirect_uri = req.query.redirect_uri
    var client_id = req.query.client_id
    var scope = req.query.scope

    try {

        var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        var user = await db.db("forum").collection("utenti").findOne({ Name });
        if (user && user.HashedPwd === h(user.Salt + pass)) {
            var sessId = crypto.randomBytes(32).toString("hex");
            req.session.lui = {
                IDUtente: user._id,
                IDSuoDominio: user.Dominio,
                Utente: user.Name,
                chiave: pass
            }
            if (!redirect_uri) // req da script.js
                res.send(sessId);
            else {// req da / per /login con parametri get passati a  /

                let AUTH_TOKEN = crypto.randomBytes(128).toString('hex')
                ARR_AUTH_TOKENS[AUTH_TOKEN] = { uid: user._id, scope: scope, toCipher: user.stringaCheLapiUsaPerCifrare }
                res.send("<html><body><script>window.location='" + redirect_uri + "?code=" + AUTH_TOKEN + "&who=" + user._id + "'</script></body></html>");
            }
        } else res.sendStatus(401);
    } catch (error) {
        console.log(`error`, error);
        res.sendStatus(500);
    }
    db.close()
});

app.post("/getToken", loggedChecker, async (req, res) => {
    var AUTH_TOKEN = req.body.AUTH_TOKEN;
    var client_id = req.body.client_id;
    var client_secret = req.body.client_secret;
    // TODO gestione scope
    // TODO gestione scope
    // TODO gestione scope
    // TODO gestione scope

    var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    var client = await db.db("forum").collection("apps").findOne({ _id: ObjectId(client_id), client_secret: client_secret.toString() });
    console.log(client)
    console.log(ARR_AUTH_TOKENS[AUTH_TOKEN])

    if (client && ARR_AUTH_TOKENS[AUTH_TOKEN]) {
        console.log("access granted ")
        var token = crypto.randomBytes(256).toString("hex");
        access_tokens[token] = ARR_AUTH_TOKENS[AUTH_TOKEN]
        delete ARR_AUTH_TOKENS[AUTH_TOKEN];
        res.json({ access_token: token, key: access_tokens[token].toCipher })//key è la stringa che il client usa per cifrare i dati dell'utente
    } else res.sendStatus(401)
    db.close()
});

app.post("/addUser", loggedChecker, async (req, res) => {
    var name = req.body.utente;
    var pass = req.body.passw;
    var salt = crypto.randomBytes(32).toString("hex");

    try {
        var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });


        var giaPresente = await db
            .db("forum")
            .collection("utenti")
            .findOne({ Name: name });
        console.log(`giaPresente`, giaPresente);
        if (!giaPresente) {
            //lui non c'era

            var nuovo_utente = {
                Name: name,
                Salt: salt,
                HashedPwd: h(salt + pass),
                stringaCheLapiUsaPerCifrare: crypto.randomBytes(32).toString("hex")
            };

            try {
                var resIns = await db
                    .db("forum")
                    .collection("utenti")
                    .insertOne(nuovo_utente, { safe: true, upsert: true });

                assert.notEqual(resIns, null)

                var sessId = crypto.randomBytes(32).toString("hex");
                req.session.lui = {
                    IDUtente: user._id,
                    IDSuoDominio: user.Dominio,
                    Utente: user.Name,
                    chiave: pass
                }
                res.send(sessId);
            } catch (error) {
                console.log(`error`, error);
                res.sendStatus(500);
            }
        } else res.send("username already taken");

        db.close();
    } catch (error) {
        console.log(`error`, error);
        res.sendStatus(500);
    }
});

app.post("/newQuestion", (req, res) => {

    console.log('req.files', req.files);


    var nome = req.body.nome;
    var testo = req.body.testo;
    var tipo = req.body.tipo;
    var sessid = req.body.sessid;

    try{
    var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    let key = req.session.lui.chiave;
        var nuovaAttivita;
        nuovaAttivita = {
            Name: c(nome.toString(), key),
            Text: c(testo.toString(), key),
            Tipo: tipo,
            AppartenenteA: req.session.lui.IDUtente,
            BroadcastDelDom: req.session.lui.IDSuoDominio
        }
 (req.files) {
            var docs = []
            if (req.files.docs instanceof Array)
               messaggi.files.docs.forEach(element => {
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
              catch(error){
        console.error(error)
    } // console.log(`resIns`, resIns);
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
});
// new reply
// new reply
// new reply
app.post("/allUsers", loggedChecker, async (req, res) => {

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

var Page = require("./userPageMod")

app.get("/user/:uid", loggedChecker, async (req, res) => {
    var uid = req.params.uid

    let o = ObjectId(uid);
    var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    let hisData = await db.db("forum").collection("utenti").findOne({ _id: ObjectId(uid) })
    let hisPosts = await db.db("forum").collection("messaggi").find({ By: ObjectId(uid) }).toArray()
    db.close()
    res.send(Page.page(uid, hisData, hisPosts))
});

var ThreadPage = require("./threadPageMod")

app.post("/allThreads", loggedChecker, async (req, res) => {

    try {
        var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        var dati        console.log("dati", dati) = await db
            .db("forum")
            .collection("messaggi")
            .find({ replyTo: null })
            .toArray();

        dati = await Promise.all(dati.map(async post => {
            let a = await db.db("forum").collection("utenti").findOne({ _id: ObjectId(post.By) })
            post.ByName = a.Name
            return post
        }));

        res.json(dati);
    } catch (error) {
        console.log(`error`, error);
        res.sendStatus(500);
    }
});

// ORDER BY data
// ORDER BY data
// ORDER BY data
// ORDER BY data

app.get("/thread/:id", loggedChecker, async (req, res) => {
    var id = req.params.id
    //se :id è foglia tira fuori solo quella: invece deve essere: se prima domanda-> i reply a lei; sennò i reply alla ? a cui si replicava
    var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    let whatIs = await db.db("forum").collection("messaggi").findOne({ _id: ObjectId(id) })
    if (whatIs.replyTo == null)
        posts = await db.db("forum").collection("messaggi").find({ "$or": [{ _id: ObjectId(id) }, { "replyTo": ObjectId(id) }] }).toArray()
    else
        posts = await db.db("forum").collection("messaggi").find({ "$or": [{ _id: ObjectId(id) }, { "replyTo": whatIs.replyTo }, { _id: whatIs.replyTo }] }).toArray()

    console.log(posts)

    let dati = await Promise.all(posts.map(async post => {
        let a = await db.db("forum").collection("utenti").findOne({ _id: ObjectId(post.By) })
        post.ByName = a.Name //gli attacco il nome risolto tipo dns
        return post
    }));

    dati.sort((post1, post2) => {
        if (post1.Date && post2.Date)
            if (new Date(post1.Date).getTime() / 1000 > new Date(post2.Date).getTime() / 1000)
                return post1;
            else
                return post2;
        else
            return post1
    })

    res.send(ThreadPage.page(id, dati))
    db.close()
});

app.post("/modificaNota", loggedChecker, async (req, res) => {

    var sessid = req.body.sessid;
    var IDNota = req.body.IDNota;
    var titoloNuovo = req.body.nome;
    var testoNuovo = req.body.testo;
    var scadenza = req.body.scadenza;


    try {
        var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        var whatSet = {
            $set: {
                Text: c(testoNuovo.toString(), key),
                Name: c(titoloNuovo.toString(), key)
            }
        };
        let key = req.session.lui.chiave;

        if (req.body.scadenza) whatSet.$set.ScadeIL = c(req.body.scadenza, key);
        if (req.files)
            whatSet.$push = { allegati: c(JSON.stringify(req.files.docs), key) };
        let what = { _id: ObjectId(IDNota), BroadcastDelDom: req.session.lui.IDSuoDominio, AppartenenteA: req.session.lui.IDUtente }

        let result = await db.db("forum").collection("dati").updateOne(what, whatSet);
        // assert.equal(result.modifiedCount, 1); sennò se cerco di modificarlo con dati identici a quelli preesistenti va a 0 modifiedCount
        assert.equal(result.matchedCount, 1);

        var newNote = await db.db("forum").collection("dati").findOne({ _id: ObjectId(IDNota) });
        db.close();
        res.json(newNote);
    } catch (error) {
        res.sendStatus(503);
    }
});

app.post("/delNota", function (req, res) {
    var sessid = req.body.sessid;
    var IDNota = req.body.IDNota;
    MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
        if (err) {
            res.sendStatus(401);
            db.close();
            throw err;
        }
        console.log(`req.session.lui`, req.session.lui);
        db.db("forum")
            .collection("dati")
            .deleteOne({ _id: ObjectId(IDNota), BroadcastDelDom: req.session.lui.IDSuoDominio, AppartenenteA: req.session.lui.IDUtente }, (error, result) => {

                assert.equal(err, null);
                if (result.deletedCount == 1)
                    res.sendStatus(200);
                else
                    res.sendStatus(500);
            });
    });
});

app.post("/share", function (req, res) {
    var IDNota = req.body.IDNota;
    // aggiungo la nota che il client ci ha passato
    // aggiungo la nota che il client ci ha passato

});
