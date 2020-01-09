var express = require("express");
var assert = require("assert");
var bodyParser = require("body-parser");
const crypto = require("crypto");
const MongoClient = require("mongodb").MongoClient;
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const { ObjectId } = require("mongodb");
app.use(express.static("mia_pag")); // include con USE

app.listen(3000);

console.log("* app in funzione *");
const uri = `mongodb+srv://ms-teams:${process.env.PASS}@miocluster2-igwb8.mongodb.net/test?retryWrites=true&w=majority`;

var sessioni = {};

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

app.post("/login", async (req, res) => {

    var name = req.body.utente;
    var pass = req.body.passw;
    var dom = req.body.dom;

    try {
        var db = await MongoClient.connect(uri, { useNewUrlParser: true });
        var dominio = await db.db("ms-teams").collection("domini").findOne({ Name: dom });
        if (!dominio) {//il dominio non c'era
            res.sendStatus(401)
            return;
        }

        var user = await db.db("ms-teams").collection("utenti").findOne({ Name: name, Dominio: dominio._id });
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
        res.sendStatus(500)
    }
});

app.post("/addUser", async (req, res) => {

    var name = req.body.utente;
    var pass = req.body.passw;
    var dom = req.body.dom;
    var salt = crypto.randomBytes(32).toString("hex");

    try {
        var db = await MongoClient.connect(uri, { useNewUrlParser: true });

        var dominio = await db.db("ms-teams").collection("domini").findOne({ Name: dom });

        if (!dominio) {//il dominio non c'era
            var newDom = await db.db("ms-teams").collection("domini").insertOne({ Name: dom });
            dominio = newDom.ops[0]//??
        }

        var giaPresente = await db.db("ms-teams").collection("utenti").findOne({ Name: name, Dominio: ObjectId(dominio._id) });

        if (!giaPresente) {//il dominio non c'era

            var nuovo_utente = {
                Name: name,
                Salt: salt,
                HashedPwd: h(salt + pass),
                Dominio: dominio._id
            };

            var resIns = await db.db("ms-teams").collection("utenti").insertOne(nuovo_utente, { safe: true, upsert: true });

            var sessId = crypto.randomBytes(32).toString("hex");
            sessioni[sessId] = {
                IDUtente: resIns.insertedId,
                Utente: name,
                chiave: pass,
                IDSuoDominio: nuovo_utente.Dominio
            };

            res.send(sessId);
        } else
            res.send("username already taken in this domain")


        db.close();
    } catch (error) {
        res.sendStatus(500)
    }

});
//sarebbe bello avere n domini(sottogruppi)
app.post("/newActivity", (req, res) => {

    var nome = req.body.nome;
    var testo = req.body.testo;
    var tipo = req.body.tipo;
    var sessid = req.body.sessid;

    if (sessioni[sessid])
        MongoClient.connect(uri, { useNewUrlParser: true }, (err, db) => {
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
            else if (tipo == "scheda con scadenza")
                nuovaAttivita = {
                    Name: c(nome.toString(), key),
                    Text: c(testo.toString(), key),
                    ScadeIL: c(req.body.scadenza.toString(), key),
                    Tipo: tipo,
                    AppartenenteA: sessioni[sessid].IDUtente,
                    BroadcastDelDom: sessioni[sessid].IDSuoDominio
                };
            else {
                res.sendStatus(500);
                return;
            }

            db.db("ms-teams")
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

app.post("/newDom", async (req, res) => {/*nuovo gruppo di utenti*/
    var sessid = req.body.sessid;
    var name = req.body.name;

    if (sessioni[sessid]) {
        var db = await MongoClient.connect(uri, { useNewUrlParser: true });
        var dominio = await db.db("ms-teams").collection("domini").findOne({ Name: name });

        if (!dominio) {//il dominio non c'era
            try {
                var newDom = await db.db("ms-teams").collection("domini").insertOne({ Name: name });
                console.log(`newDom`, newDom);
            } catch (error) {
                console.log(`error`, error);
                throw error;
            }
        }

    } else res.sendStatus(401);
});


app.post("/allDomUsers", async (req, res) => {

    var sessid = req.body.sessid;
    try {
        var db = await MongoClient.connect(uri, { useNewUrlParser: true });
        var dati = await db.db("ms-teams").collection("utenti").find({ Dominio: sessioni[sessid].IDSuoDominio }).project({ Name: 1 }).toArray();
        let tutti = [];
        await dati.forEach(ele => {
            tutti.push(ele);
        });
        res.json(tutti);
    } catch (error) {
        console.log(`error`, error);
        res.sendStatus(500)
    }
});

app.post("/allNoteDominio", async (req, res) => {
    var sessid = req.body.sessid;
    try {
        var db = await MongoClient.connect(uri, { useNewUrlParser: true });
        var dati = await db.db("ms-teams").collection("dati").find({ BroadcastDelDom: sessioni[sessid].IDSuoDominio }).toArray();

        let tutti = [];
        let key = sessioni[sessid].chiave;
        let eleDecrittato;
        dati.forEach(ele => {
            // console.log(`ele`, ele);
            eleDecrittato = ele
            eleDecrittato.IDNota = ele._id
            delete eleDecrittato._id
            eleDecrittato.nome = d(ele.Name, key)
            eleDecrittato.testo = d(ele.Text, key)
            if (ele.ScadeIL)//le semplici non l'hanno
                eleDecrittato.ScadeIL = d(ele.ScadeIL, key)
            tutti.push(eleDecrittato);
        });
        // console.log(`tutti`, tutti);
        res.json(tutti);

    } catch (error) {
        console.log(`error`, error);
        res.sendStatus(500)
    }

});

app.post("/modificaNota", function (req, res) {
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

app.post("/delNota", function (req, res) {
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
