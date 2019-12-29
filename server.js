var express = require("express");
var bodyParser = require("body-parser");
const crypto = require("crypto");
var cors = require("cors"); // se volgio accettare req anche non provenienti da questa pag
const MongoClient = require("mongodb").MongoClient;
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors())// ok richieste get/post da pagine diverse da una di questo sitoson
app.use(bodyParser.json());

app.use(express.static("mia_pag")); // include con USE

app.listen(3000);

console.log("* app in funzione *");
const uri = `mongodb+srv://trello:${process.env.PASS}@miocluster2-igwb8.mongodb.net/test?retryWrites=true&w=majority`;

var sessioni = {};

app.post("/login", (req, res) => {
    var name = req.body.utente;
    var pass = req.body.passw;

    MongoClient.connect(uri, { useNewUrlParser: true }, (err, db) => {
        if (err) {
            res.sendStatus(401);
            db.close();
            throw err;
        }
        var dbo = db.db("trello");

        dbo.collection("utenti").findOne({ Name: name }, function (err, resFind) {
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
    var salt = crypto.randomBytes(32).toString("hex");
    const hash = crypto.createHash("sha256");
    hash.update(salt + pass);
    let hashed = hash.digest("base64");

    MongoClient.connect(uri, { useNewUrlParser: true }, (err, db) => {
        if (err) {
            res.sendStatus(401);
            db.close();
            throw err;
        }
        var dbo = db.db("trello");

        var nuovo_utente = {
            Name: name,
            Salt: salt,
            HashedPwd: hashed
        };
        dbo.collection("utenti").insertOne(nuovo_utente, function (err, resIns) {
            if (err || resIns.insertedCount != 1) {
                res.sendStatus(401);
                db.close();
                throw err;
            }

            var sessId = crypto.randomBytes(32).toString("hex");
            sessioni[sessId] = {
                IDUtente: resIns.insertedId,
                Utente: name,
                chiave: pass
            };
            console.log("1 nuovo utente inserito");
            res.send(sessId);
            db.close();
        });
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
            let testoCrittato = crypto
                .createCipher("aes-256-ctr", key)
                .update(testo.toString(), "utf-8", "hex");
            var nuovaAttivita = {
                Name: nome,
                Text: testoCrittato,
                AppartenenteA: sessioni[sessid].IDUtente
            };
            var dbo = db.db("trello");
            dbo.collection("dati").insertOne(nuovaAttivita, function (err, resIns) {
                console.log(`resIns`, resIns);
                if (err) {
                    res.sendStatus(401);
                    db.close();
                    throw err;
                }
                console.log("1 nuovo doc inserito");
                res.sendStatus(200);
            });
        });
    else res.sendStatus(401);
});

app.post("/allNote", function (req, res) {
    var sessid = req.body.sessid;
    if (sessioni[sessid]) {
        MongoClient.connect(uri, { useNewUrlParser: true }, (err, db) => {
            if (err) {
                res.sendStatus(401);
                db.close();
                throw err;
            }
            var dbo = db.db("trello");
            dbo
                .collection("dati")
                .find({ AppartenenteA: sessioni[sessid].IDUtente })
                .toArray(function (err, resFind) {
                 
                    console.log(`resFind`, resFind);
                    if (err) {
                        res.sendStatus(401);
                        db.close();
                        throw err;
                    }
                    if (resFind.length != 0) {
                        let tutti = []
                        const key = sessioni[sessid].chiave;
                        resFind.forEach(element => {
                            decrittato = crypto
                                .createDecipher("aes-256-ctr", key)
                                .update(element.Text.toString(), "hex", "utf-8");
                            tutti.push({ nome: element.Name, testo: decrittato })
                        });

                        res.json(tutti)
                    } else res.send("nulla salvato");
                    db.close();
                }
                );
        });
    } else res.sendStatus(401);
});
