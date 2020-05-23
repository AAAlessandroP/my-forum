var express = require("express");
var assert = require("assert");
const { check, validationResult } = require('express-validator');
const fileUpload = require('express-fileupload');
var bodyParser = require("body-parser");
const crypto = require("crypto");
const Mastodon = require('mastodon-api');
const fetch = require('node-fetch');
const cors = require("cors");
const fs = require("fs");
const nodemailer = require("nodemailer");
const MongoClient = require("mongodb").MongoClient;
const Telegraf = require('telegraf');
const tsession = require('telegraf/session')
// const { Extra, Markup } = Telegraf;
const sse = require('connect-sse')();
require('dotenv').config()
assert.notEqual(process.env.TELEGRAM_TOKEN, null)

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
bot.use(tsession())
var app = express();
app.use(bodyParser.urlencoded({ extended: false, limit: 50 * 1024 * 1024 }));
app.use(bodyParser.json({
    limit: 50 * 1024
}));
app.use(fileUpload());
const session = require('express-session')
const RedisStore = require('connect-redis')(session)
const Redis = require('ioredis')
const { ObjectId } = require("mongodb");
app.use(express.static("mia_pag"));
app.use(express.static("public")); //il suo file a.b è raggiungibile con /a.b
app.use(cors())
"use strict";
let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
app.listen(port);
console.log(`port`, port);
const client = new Redis(14133, process.env.REDIS_ENDP, { db: 0, password: process.env.REDIS_PASSW })
const store = new RedisStore({ client })
const cookie_name = "sid"
app.use(
    session({
        store,
        unset: "destroy",
        name: cookie_name,
        saveUninitialized: true,//a true permette di mantenere la sessione anche se req.session non viene toccato, altrimenti tutte le richieste che non modificano req.session sarebbero indistinguibili (salvo una precedente req che lo facesse)
        // con saveUninitialized: true la sessione permane anche tra + req che non toccano req.session
        resave: false,
        secret: `quiet, pal! it's a secret!`,
        cookie: {
            maxAge: 1000 * 60 * 60 * 1, //If the session cookie has a expires date, connect-redis will use it as the TTL.
            sameSite: true,
            secure: process.env.NODE_ENV === 'production'
        }
    })
)
// posso manipolare le sessioni a mano con STORE.get() e STORE.set(), lui le salva lì
if (process.env.NODE_ENV == 'production')
    home_sito = "https://my-forum.glitch.me"
else
    home_sito = "http://localhost:" + port

const uri = `mongodb+srv://forum:${process.env.MONGO_PASS}@miocluster2-igwb8.mongodb.net/test?retryWrites=true&w=majority`;
(async () => {
    try {
        var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        var tutti = await db.db("forum").collection("utenti").find({}).toArray()
        console.log(`tutti`, tutti)
    } catch (error) {
        console.log(`error`, error)
    }
})//()

//  todo gli STATE del redirect validi in funzione del tempo(cambiano con, non lo stesso sempre)
//  todo gli STATE del redirect validi in funzione del tempo(cambiano con, non lo stesso sempre)
//  todo gli STATE del redirect validi in funzione del tempo(cambiano con, non lo stesso sempre)
// '5e726f0534058302ceb2ccc2' è il _id pescato da una query
// ObjectId('5e726f0534058302ceb2ccc2') == '5e726f0534058302ceb2ccc2' sì
// ObjectId('5e726f0534058302ceb2ccc2') == ObjectId(ObjectId('5e726f0534058302ceb2ccc2')) sì

// passw lunga
// passw lunga
// email unica
// email unica

// i temp token che arrivano all'endoint nostro sono usabili una sola volta
// i temp token che arrivano all'endoint nostro sono usabili una sola volta
// i temp token che arrivano all'endoint nostro sono usabili una sola volta
function h(s) {
    var hash = crypto.createHash("sha256");
    hash.update(s);
    return hash.digest("base64");
}

function loggedChecker(req, res, next) {
    // console.log("req.session.lui", req.session.lui)
    console.log(`req.sessionID`, req.sessionID)

    if (req.session.lui != undefined && (req.session.lui.confirmed === undefined || req.session.lui.confirmed !== false)) {
        next()
    } else
        res.sendStatus(401)
}

// anteprima icona utente
// anteprima icona utente
// anteprima icona utente


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
// TODO quando faccio l'@ medo la lista di possibili target
// TODO quando faccio l'@ medo la lista di possibili target
async function infoSuDiMeFB(token) {
    let url = `https://graph.facebook.com/v6.0/me?fields=id%2Cemail%2Cname&access_token=` + token
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
    var client_id = process.env.NODE_ENV == 'production' ? process.env.GH_PROD_ID : process.env.GH_DEV_ID
    var client_secret = process.env.NODE_ENV == 'production' ? process.env.GH_PROD_PASS : process.env.GH_DEV_PASS
    var code = req.query.code
    console.log(`client_secret`, client_secret);
    console.log(`client_id`, client_id);

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
                console.log(`userOnGH`, userOnGH);
                var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
                var lui = await db.db("forum").collection("utenti").findOne({ _id: ObjectId(userOnGH.id.toString().padStart(24, "0")) });
                if (!lui) { //se non c'era già
                    req.session.token = data.access_token //lo metto in sess
                    // NECESSARIO 2 VOLTE??
                    let userOnGH = await infoSuDiMeGH(req.session.token);
                    var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
                    await db.db("forum").collection("utenti").insertOne(
                        {
                            _id: ObjectId(userOnGH.id.toString().padStart(24, "0")),
                            token: req.session.token,
                            Name: userOnGH.login,
                        }, { safe: true, upsert: true });

                    req.session.lui = {
                        IDUtente: ObjectId(userOnGH.id.toString().padStart(24, "0")),
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
            db.close()
        });
});
// estraggo pic da gh
// estraggo pic da gh
// estraggo pic da gh

app.get("/fromFB", async (req, res) => {
    // endpoint del redirect da fb, che ci dà il code e ottenere il token , noi facciamo accedere l'user già registrato/lo registriamo
    var client_id = process.env.FB_ID
    var client_secret = process.env.FB_PASS
    var code = req.query.code//il token temporaneo da scambiare
    // console.log(`client_id`, client_id);
    // console.log(`client_secret`, client_secret);

    endpoint = `https://graph.facebook.com/v6.0/oauth/access_token?client_id=${client_id}&redirect_uri=${home_sito}/fromFB&client_secret=${client_secret}&code=${code}`

    fetch(endpoint, {
        method: 'get',
        headers: { "Accept": "application/json" },//ci facciamo mandare indietro del json(accept header)
    })
        .then(res => res.json())
        .then(async data => {
            try {
                // console.log(`data`, data);
                let userOnFB = await infoSuDiMeFB(data.access_token);
                // console.log(`userOnFB`, userOnFB);
                var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
                var lui = await db.db("forum").collection("utenti").findOne({ _id: ObjectId(userOnFB.id.toString().padStart(24, "0")) })
                // console.log(`lui`, lui);
                if (lui) { //se c'era già
                    req.session.token = data.access_token
                    var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
                    await db.db("forum").collection("utenti").findOneAndUpdate({ _id: ObjectId(userOnFB.id.toString().padStart(24, "0")) },
                        {
                            $set: {
                                token: data.access_token,
                                expires_in: data.expires_in + Math.trunc(new Date().getTime() / 1000) //secondi rimanenti+ora attuale
                            }
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
                            _id: ObjectId(userOnFB.id.toString().padStart(24, "0")),
                            Name: userOnFB.name.toString().replace(" ", "_"),
                            Email: userOnFB.email,
                        });

                    req.session.lui = {
                        IDUtente: ObjectId(userOnFB.id.toString().padStart(24, "0")),
                        Utente: userOnFB.name,
                    }
                }
                res.redirect("/")// ora l'user è su / con l'accesso
            } catch (error) {
                console.log(`error`, error);
                res.sendStatus(500);
                return;
            }
        }).catch(error => {
            console.log(`error`, error);
            res.sendStatus(500);
        })
    db.close()
});
// share with fb ache sulle altre pagine
// share with fb ache sulle altre pagine
// share with fb ache sulle altre pagine
// share with fb ache sulle altre pagine


async function toot(M_config, txt, base_url) {
    const num = Math.floor(Math.random() * 100);
    const params = {
        spoiler_text: `Check Out What I said on my-forum: ${base_url}`,
        status: txt
    }
    try {
        M_config = new Mastodon(M_config)
        let data = await M_config.post('statuses', params)
        console.log(data);
    } catch (error) {
        console.error(error);
    }
}

// endpoint del redirect da gh, che ci dà il code e ottenere il token , noi facciamo accedere l'user già registrato/lo registriamo
app.get("/fromMasto", async (req, res) => {
    var client_id = process.env.MASTO_APP_ID
    var client_secret = process.env.MASTO_APP_SECR
    var code = req.query.code
    // let url = Mastodon.getAuthorizationUrl(client_id, client_secret, "https://botsin.space", "write", "http://localhost:3000/fromMasto")
    // console.log(`url`, url); basta una volta e metti l'url nell'href
    let p = Mastodon.getAccessToken(client_id, client_secret, code, "https://botsin.space", home_sito + "/fromMasto")
    p.then(access_token => {

        const M = new Mastodon({
            client_key: process.env.MASTO_APP_ID,
            client_secret: process.env.MASTO_APP_SECR,
            access_token,
            timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
            api_url: 'https://botsin.space/api/v1/', // optional, defaults to https://mastodon.social/api/v1/
        });

        // serve lo scope:read per leggere qualunque cosa!
        M.get('accounts/verify_credentials').then(async resp => {

            const userOnMasto = resp.data;
            // console.log(`userOnMasto`, userOnMasto);
            var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
            var lui = await db.db("forum").collection("utenti").findOne({ _id: ObjectId(userOnMasto.id.toString().padStart(24, "0")) });
            if (!lui) { //se non c'era già
                req.session.token = access_token
                var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
                await db.db("forum").collection("utenti").insertOne(
                    {
                        _id: ObjectId(userOnMasto.id.toString().padStart(24, "0")),
                        token: req.session.token,
                        Name: userOnMasto.username,
                        picUrl: userOnMasto.avatar.toString()
                    }, { safe: true, upsert: true });

                req.session.lui = {
                    IDUtente: ObjectId(userOnMasto.id.toString().padStart(24, "0")),
                    Utente: userOnMasto.username,
                    masto: M
                }
            } else {
                req.session.token = access_token
                req.session.lui = {
                    IDUtente: lui._id,
                    Utente: lui.Name,
                    masto: M
                }
            }
            db.close()
            res.redirect("/")
        });
    })
});

const picNamesTortoises = []
fs.readdirSync("./files4rechapta/tortoises").forEach(file => {
    if (file.endsWith(".jpg"))
        picNamesTortoises.push("tortoises/" + file)
})
const picNamesSeagulls = []
fs.readdirSync("./files4rechapta/seagulls").forEach(file => {
    if (file.endsWith(".jpg"))
        picNamesSeagulls.push("seagulls/" + file)
})

// mando indietro la pic nel body e l'id di questa nell'header
var i = 0;
var arrAssocIdCategoria = {}
app.get("/rechaptaPhotos", async (req, res) => {
    let randPicName;
    if (Math.random() > 0.5) {
        arrAssocIdCategoria[i] = "tortoise"
        randPicName = picNamesTortoises[Math.round(Math.random() * (picNamesTortoises.length - 1))]
    } else {
        arrAssocIdCategoria[i] = "seagull"
        randPicName = picNamesSeagulls[Math.round(Math.random() * (picNamesSeagulls.length - 1))]
    }
    res.setHeader("X-photo-id", i)
    i++;
    res.sendFile(`./files4rechapta/${randPicName}`, { root: __dirname })
})

// TODO AUTH 3e PARTI mie
// TODO AUTH 3e PARTI mie
// TODO AUTH 3e PARTI mie
// TODO AUTH 3e PARTI mie
// TODO AUTH 3e PARTI mie

var ARR_AUTH_TOKENS = {};
var access_tokens = {};
app.get("/login", async (req, res) => {
    console.log("login");

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

app.post("/getToken", async (req, res) => {
    var AUTH_TOKEN = req.body.AUTH_TOKEN;
    var client_id = req.body.client_id;
    var client_secret = req.body.client_secret;
    // TODO gestione scope
    // TODO gestione scope
    // TODO gestione scope
    // TODO gestione scope

    var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    var client = await db.db("forum").collection("apps").findOne({ _id: ObjectId(client_id), client_secret: h(client_secret.toString()) });
    // la metto hasciata la passw

    console.log(client)
    console.log(ARR_AUTH_TOKENS[AUTH_TOKEN])

    if (client && ARR_AUTH_TOKENS[AUTH_TOKEN]) {
        console.log("access granted ")
        var token = crypto.randomBytes(256).toString("hex");
        access_tokens[token] = ARR_AUTH_TOKENS[AUTH_TOKEN]
        setTimeout(() => {
            delete access_tokens[token];
        }, 1000 * 60 * 60 * 24);//dopo 1gg scade il token
        delete ARR_AUTH_TOKENS[AUTH_TOKEN];
        res.json({ access_token: token, key: access_tokens[token].toCipher })//key è la stringa che il client usa per cifrare i dati dell'utente
    } else res.sendStatus(401)
    db.close()
});


// TODO pagina : dev > registra app oauth con rechapta
// TODO pagina : dev > registra app oauth con rechapta
// TODO pagina : dev > registra app oauth con rechapta
app.post("/registraApi", async (req, res) => {
    var client_secret = req.body.client_secret;
    var name = req.body.name;
    let shortId = crypto.randomBytes(126).toString("hex")
    client.set(shortId, JSON.stringify({ client_secret, name }))
    sendMail(`vuoi accettare: ${name} ?
    se sì: ${home_sito}/registraApiOk/${shortId}`, "new oauth app", process.env.MIA_MAIL)
    res.sendStatus(200)
});

// store.clear(() => { })

app.get("/registraApiOk/:id", (req, res, next) => {
    console.log(req.sessionID);

    if (req.session.lui && req.session.lui.Utente == "ale")//sono il capo supremo
        next()
    else
        res.sendStatus(401)
}, async (req, res) => {
    var id = req.params.id;
    let m_client = await client.get(id)
    await client.del(id)
    console.log(`m_client`, m_client)
    res.sendStatus(201)
});

function loggedApi(req, res, next) {
    if (true)
        next()
    else
        res.sendStatus(401)
}

app.get("/api/all", loggedApi, async (req, res) => {

    try {
        var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        var dati = await db.db("forum").collection("messaggi").find({}).toArray();
        res.json(dati);
    } catch (error) {
        console.log(`error`, error);
        res.sendStatus(500);
    }
});

app.post("/api", loggedApi, async (req, res, next) => {

    try {
        var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        var arr = [{ _id: { $exists: true } }]

        if (req.body.id)
            arr.push(
                {
                    _id: ObjectId(req.body.id)
                }
            );
        else {
            if (req.body.from && req.body.to)
                arr.push(
                    {
                        Date: { $gte: new Date(req.body.from) }
                    },
                    {
                        Date: { $lte: new Date(req.body.to) }
                    }
                );
            if (req.body.byUser)
                arr.push(
                    {
                        by: ObjectId(req.body.byUser)
                    }
                );
            if (req.body.replyTo)
                arr.push(
                    {
                        replyTo: ObjectId(req.body.replyTo)
                    }
                );
            if (req.body.textEq)
                arr.push(
                    {
                        Text: req.body.textEq
                    }
                );
            if (req.body.textContains)
                arr.push(
                    {
                        Text: { $regex: ".*" + req.body.textContains + ".*" }
                    }
                );
            if (req.body.textMatch)
                arr.push(
                    {
                        Text: { $regex: req.body.textMatch }
                    }
                );
        }
        var dati = await db.db("forum").collection("messaggi").find({ $and: arr }).toArray();




        res.json(dati);
    } catch (error) {
        console.log(`error`, error);
        res.sendStatus(500);
    }
});

//chiamato dalla pag
app.get("/getTempId4TG", sse, (req, res) => {
    let shortId = crypto.randomBytes(16).toString("hex").substr(0, 6)
    client.set(shortId, req.sessionID)
    res.send(shortId)
})

// vogliamo che postino col loro 
// metterli required sia qui che nel fronteted
app.post("/newIssue", loggedChecker, async (req, res) => {
    console.log(`req.session.token`, req.session.token)
    console.log(`req.body["labels[]"]`, req.body["labels[]"]);
    let url = `https://api.github.com/repos/AAAlessandroP/my-forum/issues`
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `token ${req.session.token ? req.session.token : process.env.GH_TOKEN_AAALE}`
        },
        body: JSON.stringify({
            "title": req.body.title,
            "body": req.body.body,
            "labels": [req.body["labels[]"]]//lo forzo ad array
        })
    });
    let r = await response.json();
    console.log(`r`, r)
    res.sendStatus(201)
});



// GESTIONE BOT
// bot.start((ctx) => ctx.replyWithHTML("<pre>Willcommen! type in \n /login \n to log-in in my-forum!</pre>"));
// bot.help((ctx) => ctx.replyWithHTML("<pre>Willcommen! type in \n /login \n to log-in in my-forum!</pre>"));
// bot.command('login', async (ctx) => {
//     ctx.replyWithHTML("manda l'id (quello dato sul sito) in formato: id 123ad2")
// });

// var arrRisolutore = {}
// function risolutore(sid, callbRisolvi, exec) {
//     if (callbRisolvi)
//         arrRisolutore[sid] = callbRisolvi
//     if (exec) {
//         arrRisolutore[sid]()
//         delete arrRisolutore[sid];
//     }
// }

// app.get('/events', sse, function (req, res, next) {
//     new Promise((resolve, reject) => {
//         risolutore(req.sessionID, () => resolve("ok ok")) // la chiamata fa risolvere la promise e far ritornare /events
//     }).then(() => next())
// }, (req, res) => {
//     store.get(req.sessionID, (error, s) => {
//         res.json(s.lui.IDUtente)
//     });
// });

// // quando l'user fa login qui mette lo shortId che corrisponde al sessionID della sua sess sul sito, sess che segno autenticata
// // todo: rettifica mail magari?
// bot.on('text', async (ctx) => {


//     if (ctx.message.text.match(/.+@.+\..+/)) {//ci ha mandato una mail

//         let userOnTelegram = {
//             username: ctx.from.username.toString().replace(" ", "_"),
//             id: ctx.from.id
//         }

//         try {
//             var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
//             var lui = await db.db("forum").collection("utenti").findOne({ _id: ObjectId(userOnTelegram.id.toString().padStart(24, "0")) })
//             // console.log(`lui`, lui);
//             if (!lui) { //è nuovo utente 

//                 // gli prendo la propic e la salvo e metto come sua pic nel sito
//                 let pics = await bot.telegram.getUserProfilePhotos(ctx.update.message.chat.id)
//                 let link = await bot.telegram.getFileLink(pics.photos[0][0].file_id)// è il link (valido per 1 ora) alla sua pima pic di profilo
//                 const img = await fetch(link);
//                 let imgageBlob = await img.arrayBuffer()
//                 fs.writeFile("./public/" + userOnTelegram.username, Buffer.from(imgageBlob), function (err) {
//                     if (err) throw Error(err)
//                 });

//                 var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
//                 await db.db("forum").collection("utenti").insertOne(
//                     {
//                         _id: ObjectId(userOnTelegram.id.toString().padStart(24, "0")),
//                         Name: userOnTelegram.username,
//                         Email: ctx.message.text,
//                         chatId: ctx.chat.id,
//                         picUrl: home_sito + "/" + userOnTelegram.username,
//                         confirmed: false
//                     });

//                 // gli metto la sess autorizzata 
//                 client.get(ctx.session.id, (err, sessidSulSito) => {
//                     store.get(sessidSulSito, (error, precSess) => {
//                         precSess.lui = {
//                             IDUtente: ObjectId(userOnTelegram.id.toString().padStart(24, "0")),
//                             Utente: lui.Name,
//                             confirmed: false
//                         }
//                         store.set(sessidSulSito, precSess,
//                             () => risolutore(sessidSulSito, null, 1));
//                         ctx.reply(`fatto ${ctx.from.username}!`)
//                     });
//                 })

//                 toConfirm(ctx.message.text, ObjectId(userOnTelegram.id.toString().padStart(24, "0")))
//                 ctx.reply(`fatto ${ctx.from.username}! now check your inbox to confirm your email address.`)
//             }
//         } catch (error) {
//             console.log(`error`, error);
//             return;
//         }
//     } if (ctx.message.text.match(/^id .{6}$/)) {//è l'id 

//         try {
//             let userOnTelegram = {
//                 username: ctx.from.username.toString().replace(" ", "_"),
//                 id: ctx.from.id
//             }
//             var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
//             var lui = await db.db("forum").collection("utenti").findOne({ _id: ObjectId(userOnTelegram.id.toString().padStart(24, "0")) })

//             if (lui) { //se c'era già

//                 // gli metto la sess autorizzata
//                 client.get(ctx.message.text.substring(3), (err, sessidSulSito) => {

//                     store.get(sessidSulSito, (error, precSess) => {
//                         precSess.lui = {
//                             IDUtente: ObjectId(userOnTelegram.id.toString().padStart(24, "0")),
//                             Utente: lui.Name,
//                         }
//                         store.set(sessidSulSito, precSess,
//                             () => risolutore(sessidSulSito, null, 1));

//                         ctx.reply(`fatto ${ctx.from.username}!`)
//                     });
//                 })


//             } else {
//                 ctx.session.id = ctx.message.text.substring(3)//così quando arriva la mail posso salvare anche l'id
//                 ctx.replyWithHTML(`ok dato che vuoi registrarti manda l'inidirizzo di posta a cui vuoi essere contattato se qualcuno ti menziona sul forum.`);
//             }
//         } catch (error) {
//             console.log(`error`, error)
//             ctx.reply("ops, errore")
//         }

//     } else
//         ctx.replyWithHTML("<pre>Willcommen! type in the id given by the my-forum's login page.</pre>")
// })
// bot.launch()
// bot.startPolling();



// crea webhook con token
// faccio scegliere per cosa osserva
// tipo un nuovo post o un post di uno o @uno



//se è loggato gli metto l'header che lo specifica
// funz usata per appendere l'header a /allQuestions, così lo script dalla req capisce se è loggato
function isLogged(req, res, next) {
    store.get(req.sessionID, function (err, result) {
        console.log(result);
    });
    if (req.session.lui != undefined && (req.session.lui.confirmed === undefined || req.session.lui.confirmed !== false)) {
        res.setHeader("X-logged", req.session.lui.IDUtente)
        if (req.session.lui.masto)
            res.setHeader("X-masto-logged", "yes")
    }
    else
        res.setHeader("X-logged", "no")

    next()
}

app.post("/addUser", [check('utente').escape()], async (req, res) => {
    var name = req.body.utente;
    var pass = req.body.passw;
    let photoId = req.body.photoId
    let guess = req.body.guess
    let mail = req.body.mail

    var salt = crypto.randomBytes(32).toString("hex");

    try {
        var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        var giaPresente = await db.db("forum").collection("utenti").findOne({ Name: name });
        if (!giaPresente) {
            //lui non c'era
            if (arrAssocIdCategoria[photoId] != guess) {
                res.status(412).send("ma ci vedi?");
                db.close();
                return
            }
            var nuovo_utente = {
                Name: name,
                Salt: salt,
                HashedPwd: h(salt + pass),
                mail,
                confirmed: false
            };
            try {
                var user = await db.db("forum").collection("utenti").insertOne(nuovo_utente, { safe: true, upsert: true });
                user = user.ops[0]
                assert.notEqual(user, null)
                console.log(`req.sessionID che vuole iscriv`, req.sessionID)
                req.session.lui = {
                    IDUtente: user._id,
                    Utente: user.Name,
                    mail,
                    confirmed: false
                }
                toConfirm(mail, req.session.lui.IDUtente)
                res.status(201).send("check your inbox to confirm your email address.");
            } catch (error) {
                console.log(`error`, error);
                res.sendStatus(500);
            }
        } else res.status(409).send("username already taken");

        db.close();
    } catch (error) {
        console.log(`error`, error);
        res.sendStatus(500);
        db.close()
    }
});

function toConfirm(to, IDUtente) {
    let rand = crypto.randomBytes(64).toString("hex")
    client.set(rand, IDUtente)// ttl= xx minuti della sess
    sendMail(`conferma la tua casella di posta, premi qua: ${home_sito}/confermaMail?code=${rand}`, "conferma l'iscrizione a " + home_sito, to)
}

app.get("/confermaMail", async (req, res) => {
    let code = req.query.code
    let who = await client.get(code) // CODE => IDUtente da segnare ok
    try {
        // è una sess diversa da quella del registra
        var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        var done = await db.db("forum").collection("utenti").updateOne({ _id: ObjectId(who) }, { $set: { confirmed: true } }, { safe: true, upsert: true });
        var lui = await db.db("forum").collection("utenti").findOne({ _id: ObjectId(who) })

        if (done.result.nModified != 1)
            throw Error("ops")
        req.session.lui = {
            IDUtente: ObjectId(who),
            Utente: lui.Name,
        }
    } catch (error) {
        console.log(`error`, error)
        res.sendStatus(500)
        return;
    }
    res.redirect("/")
});

app.post("/logout", loggedChecker, async (req, res) => {
    req.session.destroy((err) => console.log(err));
    store.destroy(req.sessionID, err => {
        if (err) console.log(err)
    })
    res.clearCookie(cookie_name)
    res.sendStatus(200)
});

app.post("/newQuestion", [check("domanda").escape()], loggedChecker, async (req, res) => {

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
    } catch (error) {
        console.log(`error`, error);
    }
    db.close()
});

function sendMail(mess, subject, to) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_ADDR,
            pass: process.env.PASS_MAIL
        }
    });
    var mailOptions = {
        from: process.env.MAIL,
        to,
        subject,
        text: mess
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}
// notifica in alto (menzioni)
// notifica in alto (consigliati)
// notifica in alto
// notifica in alto

//qualcuno è stato citato?



// e con più @ ??
// e con più @ ??
async function verificaCitati(testo, nomeUtenteCheScrive, replyTo) {
    console.log(`testo`, testo)
    testo = testo.replace(/\n/, "")
    console.log(`testo`, testo)
    let pos = testo.toString().search("@")
    if (pos !== -1) {
        console.log(`pos`, pos)
        console.log(`testo.substring(pos)`, testo.substring(pos + 1));
        let chi = /(\w*)( .+|$)/.exec(testo.substring(pos + 1))[1]
        var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        var lui = await db.db("forum").collection("utenti").findOne({ Name: chi });
        if (lui.Email) {
            sendMail(`sei stato citato da ${nomeUtenteCheScrive}.\n${nomeUtenteCheScrive} scrive: "${testo}" \nvedi il messaggio: ${home_sito}/thread/${ObjectId(replyTo)}`, "ti hanno citato", lui.Email)
        }
        if (lui.chatId)
            await bot.telegram.sendMessage(lui.chatId, `sei stato citato da ${nomeUtenteCheScrive}.\n${nomeUtenteCheScrive} scrive: "${testo}" \nvedi il messaggio: ${home_sito}/thread/${ObjectId(replyTo)}`)
        // notifica in alto
        // notifica in alto
        // notifica in alto
        return testo.replace("@" + chi, `<a href="/user/${lui._id}">${chi}</a>`)
    } else
        return testo;
}

app.post("/newReply", [check("text").escape()], loggedChecker, async (req, res) => {

    try {
        var testo = req.body.text;
        var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        testo = await verificaCitati(testo, req.session.lui.Utente, req.body.replyTo)

        let nuovaDomanda = {
            replyTo: ObjectId(req.body.replyTo),
            Text: testo,
            by: ObjectId(req.session.lui.IDUtente),
            Date: new Date()
        }
        var done = await db.db("forum").collection("messaggi").insertOne(nuovaDomanda);
        assert.equal(done.insertedCount, 1)
        res.sendStatus(200)
    } catch (error) {
        console.log(`error`, error);
    }
    db.close()
});

app.post("/allUsers", async (req, res) => {

    try {
        var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        var dati = await db
            .db("forum")
            .collection("utenti")
            .find({ confirmed: { $eq: true } })
            .project({ Name: 1 })
            .toArray();

        res.json(dati);
    } catch (error) {
        console.log(`error`, error);
        res.sendStatus(500);
    }
    db.close()
});
var Page = require("./userPage")
var LoggedPage = require("./userPageLogged")
app.get("/user/:uid", async (req, res) => {
    var uid = req.params.uid
    if (uid && uid != "undefined") {
        try {
            uid = ObjectId(uid)
        } catch (error) {
            // l'id è quello corto di gh/fb allra
            uid = ObjectId(uid.toString().padStart(24, "0"))
        }
    } else {
        res.sendStatus(400)
        return;
    }
    var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    let hisData = await db.db("forum").collection("utenti").findOne({ _id: uid })
    let hisPosts = await db.db("forum").collection("messaggi").find({ by: uid }).toArray()
    db.close()
    hisPosts = hisPosts.reverse() //ord crono inverso

    if (!hisData) {//user non c'è
        res.send("pagina non disponibile. utente cancellato? <button onclick=\"goBack()\">Go Back</button><script>function goBack() {window.history.back();}</script> ")
        return;
    }

    hisData.picUrl = hisData.picUrl || "https://raw.githubusercontent.com/Infernus101/ProfileUI/0690f5e61a9f7af02c30342d4d6414a630de47fc/icon.png"
    if (!req.session.lui || req.session.lui.IDUtente != uid)//o non loggato o non sua-> solo vedere
        res.send(Page.page(uid, hisData, hisPosts))
    else
        res.send(LoggedPage.page(uid, hisData, hisPosts, req.session.lui ? req.session.lui.masto : null))
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

app.post("/delProfile", loggedChecker, async (req, res) => {
    try {
        var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await db.db("forum").collection("utenti").deleteOne({ _id: ObjectId(req.session.lui.IDUtente) });
        res.sendStatus(200)
    } catch (error) {
        console.log(`error`, error);
        res.sendStatus(500)
    }
    db.close()
});

app.get("/user/:uid/pic", loggedChecker, async (req, res) => {
    var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    let him = await db.db("forum").collection("utenti").findOne({ _id: ObjectId(req.session.lui.IDUtente) })
    res.redirect(him.picUrl || "https://raw.githubusercontent.com/Infernus101/ProfileUI/0690f5e61a9f7af02c30342d4d6414a630de47fc/icon.png")
});

app.post("/modificaPic", loggedChecker, async (req, res) => {
    try {
        var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        if (req.files) {
            picc = req.files.newPicc
            picc.mv("./public/" + picc.name)
            let done = await db.db("forum").collection("utenti").findOneAndUpdate({ _id: ObjectId(req.session.lui.IDUtente) }, { $set: { picUrl: home_sito + "/" + picc.name } })
            console.log(`done1`, done);
        } else {
            console.log("else");

            let done = await db.db("forum").collection("utenti").findOneAndUpdate({ _id: ObjectId(req.session.lui.IDUtente) }, { $set: { picUrl: req.body.newPicUrl } })
            console.log(`done`, done);
        }
        res.sendStatus(200)
    } catch (error) {
        console.log(`error`, error);
        res.sendStatus(500)
    }
    db.close()
});

//gli appendo l'header: x-logged
app.post("/allQuestions", isLogged, async (req, res) => {

    try {
        var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

        var dati = await db
            .db("forum")
            .collection("messaggi")
            .find({ replyTo: { $exists: false } })//tutte le domande
            .toArray();
        dati = await Promise.all(dati.map(async post => {
            let a = await db.db("forum").collection("utenti").findOne({ _id: ObjectId(post.by) })
            if (a == null) {
                post.ByName = "Utente Eliminato"
            } else {
                post.ByName = a.Name
            }
            return post
        }));
        db.close()
        // console.log("dati",dati)
        res.json(dati.reverse());//dal + nuovo
    } catch (error) {
        console.log(`error`, error);
        res.sendStatus(500);
    }
});

var ThreadPage = require("./threadPage")
app.get("/thread/:id", async (req, res) => {
    var question_id = req.params.id

    var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    let originalQuestion = await db.db("forum").collection("messaggi").findOne({ _id: ObjectId(question_id) })
    if (originalQuestion == null) {
        res.send("pagina non esistente!")
        return;
    }

    if (originalQuestion.replyTo == undefined)
        posts = await db.db("forum").collection("messaggi").find({ "$or": [{ _id: ObjectId(question_id) }, { "replyTo": ObjectId(question_id) }] }).toArray()
    else
        posts = await db.db("forum").collection("messaggi").find({ "$or": [{ _id: ObjectId(question_id) }, { "replyTo": originalQuestion.replyTo }, { _id: originalQuestion.replyTo }] }).toArray()

    let dati = await Promise.all(posts.map(async post => {
        let lui = await db.db("forum").collection("utenti").findOne({ _id: ObjectId(post.by) });

        if (lui) post.ByName = lui.Name //gli attacco il nome risolto tipo dns
        else post.ByName = "utente eliminato"

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

    res.send(ThreadPage.page(question_id, dati, req.session.lui ? req.session.lui.IDUtente : null, req.session.lui ? req.session.lui.masto : null))
    db.close()
});

app.use(bodyParser.text({ type: 'text' }))

app.post("/modificaNota", [check("text").escape()], loggedChecker, async (req, res) => {
    let newText = req.body.text //html sanitized
    console.log(`newText`, newText);

    try {
        var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        var prima = await db.db("forum").collection("messaggi").findOne({ by: ObjectId(req.session.lui.IDUtente), _id: ObjectId(req.body.id) })
        newText = await verificaCitati(newText, req.session.lui.Utente, prima.replyTo ? prima.replyTo : prima._id)
        await db.db("forum").collection("messaggi").findOneAndUpdate({ by: ObjectId(req.session.lui.IDUtente), _id: ObjectId(req.body.id) }, { $set: { Text: newText } })
        res.sendStatus(200)
        db.close()
    } catch (error) {
        console.log(`error`, error);
        res.sendStatus(500);
    }
});

app.post("/delNota", loggedChecker, async function (req, res) {
    try {
        var db = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        var done = await db.db("forum").collection("messaggi").deleteOne({ by: ObjectId(req.session.lui.IDUtente), _id: ObjectId(req.body.id) })
        if (done.deletedCount != 1)
            throw Error("oops")
        res.sendStatus(200)
        db.close()
    } catch (error) {
        console.log(`error`, error);
        res.sendStatus(500);
    }
});

app.post("/tootIt", loggedChecker, async function (req, res) {
    // console.log(`req.headers.referer`, req.headers.referer); request's origin
    if (req.session.lui.masto) {
        await toot(req.session.lui.masto.config, req.body.testo, req.headers.referer)
        res.sendStatus(201)
    } else
        res.sendStatus(428)
});
