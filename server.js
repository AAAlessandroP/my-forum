var express = require("express");
var assert = require("assert");
var bodyParser = require("body-parser");
const crypto = require("crypto");
const fetch = require('node-fetch');
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
var app = express();
app.use(bodyParser.urlencoded({ extended: false, limit: 50 * 1024 * 1024 }));
app.use(bodyParser.json({
    limit: 50 * 1024
}));
const session = require('express-session')
const RedisStore = require('connect-redis')(session)
const Redis = require('ioredis')
const { ObjectId } = require("mongodb");
require('dotenv').config()
app.use(express.static("mia_pag"));
app.use(express.static("public")); //il suo file a.b è raggiungibile con /a.b
app.use(cors())
"use strict";
app.listen(3000);
const client = new Redis({})
const store = new RedisStore({ client })
const cookie_name = "sid"
app.use(
    session({
        store,
        unset: "destroy",
        name: cookie_name,
        saveUninitialized: false,
        resave: false,
        secret: `quiet, pal! it's a secret!`,
        cookie: {
            maxAge: 1000 * 60 * 60 * 1,
            // expires: new Date(Date.now() + 1000 * 60 * 30),//comanda l'ultimo (expire)
            sameSite: true,
            secure: process.env.NODE_ENV === 'production'
        }
    })
)
const uri = `mongodb+srv://forum:${process.env.PASS}@miocluster2-igwb8.mongodb.net/test?retryWrites=true&w=majority`;

//  todo gli STATE del redirect validi in funzione del tempo(cambiano con, non lo stesso sempre)

// '5e726f0534058302ceb2ccc2' è il _id pescato da una query
// ObjectId('5e726f0534058302ceb2ccc2') == '5e726f0534058302ceb2ccc2' sì
// ObjectId('5e726f0534058302ceb2ccc2') == ObjectId(ObjectId('5e726f0534058302ceb2ccc2')) sì

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

async function infoSuDiMeGH(token) {
    let url = `https://api.github.com/user`
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `token ${token}`
        }
    });
    return response.json();
}

async function infoSuDiMeFB(token) {
    let url = `https://graph.facebook.com/v6.0/me?fields=id%2Cname&access_token=` + token
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    return response.json();
}

app.get("/fromGH", async (req, res) => {
    // endpoint del redirect da gh, che ci dà il code e ottenere il token , noi facciamo accedere l'user già registrato/lo registriamo
    console.log("req.query", req.query)
    var client_id = '9468a9a53590c81cc3b9';
    var client_secret = process.env.FB_PASS
    var code = req.query.code


    fetch('https://github.com/login/oauth/access_token', {
        method: 'post',
        body: JSON.stringify({ client_id, client_secret, code }),
        headers: { 'Content-Type': 'application/json', "Accept": "application/json" },//ci facciamo mandare indietro del json(accept header)
    })
        .then(res => res.json())
        .then(async data => {
            try {
                // ObjectId(userOnFB.id.padStart(24, "0"))
                // console.log(`data.access_token`, data.access_token);
                let userOnGH = await infoSuDiMeGH(data.access_token);
                // console.log(`userOnGH`, userOnGH);
                var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
                var lui = await db.db("forum").collection("utenti").findOne({ _id: ObjectId(userOnGH.id.padStart(24, "0")) });
                if (!lui) { //se non c'era già
                    req.session.token = data.access_token
                    let userOnGH = await infoSuDiMeGH(req.session.token);
                    var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
                    await db.db("forum").collection("utenti").insertOne(
                        {
                            _id: ObjectId(userOnGH.id.padStart(24, "0")),
                            token: req.session.token,
                            Name: userOnGH.login,
                        }, { safe: true, upsert: true });

                    req.session.lui = {
                        IDUtente: ObjectId(userOnGH.id.padStart(24, "0")),
                        Utente: userOnGH.login,
                    }
                } else {
                    req.session.token = data.access_token
                    req.session.lui = {
                        IDUtente: lui._id,
                        Utente: lui.Name,
                    }
                }
                res.redirect("/")

                // ora l'user è su / con l'accesso
            } catch (error) {
                console.log(`error`, error);
                res.sendStatus(500);
                return;
            }
        });
});

app.get("/fromFB", async (req, res) => {
    // endpoint del redirect da fb, che ci dà il code e ottenere il token , noi facciamo accedere l'user già registrato/lo registriamo
    console.log("req.query", req.query)
    var client_id = '2546945782289657';
    var client_secret = process.env.FB_PASS
    var code = req.query.code//il token temporaneo da scambiare

    var endpoint = `https://graph.facebook.com/v6.0/oauth/access_token?client_id=${client_id}&redirect_uri=http://localhost:3000/fromFB&client_secret=${client_secret}&code=${code}`;

    fetch(endpoint, {
        method: 'get',
        headers: { "Accept": "application/json" },//ci facciamo mandare indietro del json(accept header)
    })
        .then(res => res.json())
        .then(async data => {
            try {
                console.log(`data`, data);
                let userOnFB = await infoSuDiMeFB(data.access_token);
                console.log(`userOnFB`, userOnFB);
                var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
                var lui = await db.db("forum").collection("utenti").findOne({ _id: userOnFB.id });
                console.log(`lui`, lui);
                if (lui) { //se c'era già
                    req.session.token = data.access_token
                    var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
                    await db.db("forum").collection("utenti").findOneAndUpdate({ _id: ObjectId(userOnFB.id.padStart(24, "0")) },
                        {
                            token: data.access_token,
                            expires_in: data.expires_in + Math.trunc(new Date().getTime() / 1000) //secondi rimanenti+ora attuale
                        }, { safe: true, upsert: false });

                    req.session.lui = {
                        IDUtente: lui._id,
                        Utente: lui.Name,
                    }
                } else {
                    req.session.token = data.access_token
                    var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
                    await db.db("forum").collection("utenti").insertOne(
                        {
                            token: req.session.token,
                            expires_in: data.expires_in + Math.trunc(new Date().getTime() / 1000), //secondi rimanenti+ora attuale
                            _id: ObjectId(userOnFB.id.padStart(24, "0")),
                            Name: userOnFB.name,
                        });

                    req.session.lui = {
                        IDUtente: ObjectId(userOnFB.id.padStart(24, "0")),
                        Utente: userOnFB.name,
                    }
                }
                res.redirect("/")

                // ora l'user è su / con l'accesso
            } catch (error) {
                console.log(`error`, error);
                res.sendStatus(500);
                return;
            }
        });
});

var ARR_AUTH_TOKENS = {};
var access_tokens = {};
app.get("/login", async (req, res) => {
    var Name = req.query.utente;
    var pass = req.query.passw;

    var redirect_uri = req.query.redirect_uri
    var client_id = req.query.client_id
    var scope = req.query.scope

    try {
        var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        var user = await db.db("forum").collection("utenti").findOne({ Name });
        if (user && user.HashedPwd === h(user.Salt + pass)) {
            req.session.lui = {
                IDUtente: user._id,
                Utente: user.Name,
            }
            if (!redirect_uri) // req da script.js
                res.send(req.session.lui.IDUtente);
            else {// req da / per /login con parametri get passati a  /

                let AUTH_TOKEN = crypto.randomBytes(128).toString('hex')
                ARR_AUTH_TOKENS[AUTH_TOKEN] = { uid: user._id, scope: scope }
                res.send("<html><body><script>window.location='" + redirect_uri + "?code=" + AUTH_TOKEN + "&who=" + user._id + "'</script></body></html>");
            }
        } else res.sendStatus(401);
    } catch (error) {
        console.log(`error`, error);
        res.sendStatus(500);
    }
    db.close()
});

app.get("/logged?", (req, res) => {
    console.log(`req.session.lui`, req.session.lui);
    if (req.session.lui)
        res.send(req.session.lui.IDUtente.toString())
    else
        res.sendStatus(401)
});

app.post("/addUser", async (req, res) => {
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
            };

            try {
                var resIns = await db
                    .db("forum")
                    .collection("utenti")
                    .insertOne(nuovo_utente, { safe: true, upsert: true });

                assert.notEqual(resIns, null)

                req.session.lui = {
                    IDUtente: user._id,
                    Utente: user.Name,
                }
                res.status(201).send(req.session.lui.IDUtente);
            } catch (error) {
                console.log(`error`, error);
                res.sendStatus(500);
            }
        } else res.status(409).send("username already taken");

        db.close();
    } catch (error) {
        console.log(`error`, error);
        res.sendStatus(500);
    }
});

app.post("/logout", loggedChecker, async (req, res) => {
    req.session.destroy((err) => console.log(err));
    store.destroy(req.sessionID, err => {
        if (err) console.log(err)
    })
    res.clearCookie(cookie_name)
    res.sendStatus(200)
});

// loggedChecker??
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

app.post("/newQuestion", loggedChecker, async (req, res) => {

    try {
        var testo = req.body.domanda;
        var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        let nuovaDomanda = {
            Text: testo,
            by: ObjectId(req.session.lui.IDUtente),
            Date: new Date()
        }
        var done = await db.db("forum").collection("messaggi").insertOne(nuovaDomanda);
        assert.equal(done.insertedCount, 1)
        res.sendStatus(200)
        console.log(`done`, done);
    } catch (error) {
        console.log(`error`, error);
    }

});

app.post("/newReply", loggedChecker, async (req, res) => {

    try {
        var testo = req.body.text;
        var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        let nuovaDomanda = {
            replyTo: ObjectId(req.body.replyTo),
            Text: testo,
            by: ObjectId(req.session.lui.IDUtente),
            Date: new Date()
        }
        var done = await db.db("forum").collection("messaggi").insertOne(nuovaDomanda);
        assert.equal(done.insertedCount, 1)
        res.sendStatus(200)
        console.log(`done`, done);
    } catch (error) {
        console.log(`error`, error);
    }

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

var Page = require("./userPage")
var LoggedPage = require("./userPageLogged")
app.get("/user/:uid", async (req, res) => {
    var uid = req.params.uid
    console.log(`uid`, uid);

    if (uid && uid != "undefined") {
        try {
            uid = ObjectId(uid)
        } catch (error) {
            // l'id è quello corto di gh/fb allra
            uid = ObjectId(uid.padStart(24, "0"))
        }
    } else {
        res.sendStatus(400)
        return;
    }
    var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    let hisData = await db.db("forum").collection("utenti").findOne({ _id: uid })
    let all = await db.db("forum").collection("utenti").find({}).toArray()
    let hisPosts = await db.db("forum").collection("messaggi").find({ by: uid }).toArray()
    db.close()
    hisData.picUrl = hisData.picUrl || "https://raw.githubusercontent.com/Infernus101/ProfileUI/0690f5e61a9f7af02c30342d4d6414a630de47fc/icon.png"
    if (!req.session.lui || req.session.lui.IDUtente != uid)//o non loggato o non sua-> solo vedere
        res.send(Page.page(uid, hisData, hisPosts))
    else
        res.send(LoggedPage.page(uid, hisData, hisPosts))
});

app.post("/nuovoNome", loggedChecker, async (req, res) => {
    var Name = req.body.nome
    try {
        var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await db.db("forum").collection("utenti").findOneAndUpdate({ _id: ObjectId(req.session.lui.IDUtente) }, { $set: { Name } });
        req.session.lui.Utente = Name
        res.sendStatus(200)
    } catch (error) {
        console.log(`error`, error);
        res.sendStatus(500)
    }
    db.close()
});
// da rimuovere: /user/id/pic porta alla pic e non è + necessario v
// da rimuovere: /user/id/pic porta alla pic e non è + necessario v
app.get("/myPic", loggedChecker, async (req, res) => {

    var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    let him = await db.db("forum").collection("utenti").findOne({ _id: ObjectId(req.session.lui.IDUtente) })
    console.log(`him`, him);
    // let hisPosts = await db.db("forum").collection("messaggi").find({ by: ObjectId(uid) }).toArray()
    // db.close()
    // res.send(Page.page(uid, him, hisPosts))
    console.log(`him`, him);
    res.send(him.picUrl || "https://raw.githubusercontent.com/Infernus101/ProfileUI/0690f5e61a9f7af02c30342d4d6414a630de47fc/icon.png")
});

app.post("/allQuestions", async (req, res) => {

    try {
        var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

        var dati = await db
            .db("forum")
            .collection("messaggi")
            .find({ replyTo: { $exists: false } })//tutte le domande
            .toArray();
        dati = await Promise.all(dati.map(async post => {
            let a = await db.db("forum").collection("utenti").findOne({ _id: ObjectId(post.by) })
            post.ByName = a.Name
            return post
        }));
        // console.log("dati",dati)
        res.json(dati);
    } catch (error) {
        console.log(`error`, error);
        res.sendStatus(500);
    }
});
// UPLOAD PIC PROFILO/DA IG
// UPLOAD PIC PROFILO/DA IG
var ThreadPage = require("./threadPageMod")
app.get("/thread/:id", async (req, res) => {
    var question_id = req.params.id

    var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });


    let originalQuestion = await db.db("forum").collection("messaggi").findOne({ _id: ObjectId(question_id) })
    if (originalQuestion.replyTo == undefined)
        posts = await db.db("forum").collection("messaggi").find({ "$or": [{ _id: ObjectId(question_id) }, { "replyTo": ObjectId(question_id) }] }).toArray()
    else
        posts = await db.db("forum").collection("messaggi").find({ "$or": [{ _id: ObjectId(question_id) }, { "replyTo": originalQuestion.replyTo }, { _id: originalQuestion.replyTo }] }).toArray()

    let dati = await Promise.all(posts.map(async post => {
        let lui = await db.db("forum").collection("utenti").findOne({ _id: ObjectId(post.by) });
        post.ByName = lui.Name //gli attacco il nome risolto tipo dns
        if (post.by.toString() == originalQuestion.by.toString())
            post.isOP = true
        return post
    }));

    dati.sort((post1, post2) => {
        if (post1.Date && post2.Date)
            if (new Date(post1.Date).getTime() > new Date(post2.Date).getTime())
                return post1;
            else
                return post2;
        else
            return post1
    })

    res.send(ThreadPage.page(question_id, dati))
    db.close()
});

app.post("/modificaNota", loggedChecker, async (req, res) => {

    try {
        var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        var prima = await db.db("forum").collection("messaggi").findOne({ by: ObjectId(req.session.lui.IDUtente), _id: ObjectId(req.body.id) })
        console.log(`prima`, prima);
        var dati = await db.db("forum").collection("messaggi").findOneAndUpdate({ by: ObjectId(req.session.lui.IDUtente), _id: ObjectId(req.body.id) }, { $set: { Text: req.body.text } })
        console.log(`dati`, dati);
        var dopo = await db.db("forum").collection("messaggi").findOne({ by: ObjectId(req.session.lui.IDUtente), _id: ObjectId(req.body.id) })
        console.log(`dopo`, dopo);
        res.sendStatus(200)
    } catch (error) {
        console.log(`error`, error);
        res.sendStatus(500);
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

// TODO aggiungo la nota che il client ci ha passato
app.post("/share", function (req, res) {
    var IDNota = req.body.IDNota;
    // aggiungo la nota che il client ci ha passato
    // aggiungo la nota che il client ci ha passato

});
