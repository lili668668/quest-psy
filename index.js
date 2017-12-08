var express = require('express');
var app = express();
var session = require('express-session');
var bodyparser = require('body-parser');
var helmet = require('helmet');
var firebase = require('firebase');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(session({
    secret: "",
    resave: false,
    saveUninitialized: true
}));

app.use( bodyparser.json()  );
app.use( bodyparser.urlencoded({
        extended: true
})  );

app.use( helmet() );

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

var config = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: ""
};


firebase.initializeApp(config);
firebase.auth().signInWithEmailAndPassword("", "");
var db = firebase.database();

app.get('/', function(request, response) {
    if (request.session.login) {
        response.redirect('console');
    } else {
        response.render('pages/index');
    }
});

app.get('/sukoi', function(request, response){
    request.session.where = "sukoi";
    response.render('pages/start');
});

app.get('/suge', function(request, response){
    request.session.where = "suge";
    response.render('pages/start');
});

app.post('/go-console', function(request, res){
    var data = request.body;
    if (data.username === undefined || data.password === undefined) {
        res.redirect('/getout');
    }
    if (request.session.login) {
        res.redirect('/console');
    } else {
        var ref = db.ref("/login");
        ref.once("value", function(ob) {
            if (data.username === ob.val().username && data.password === ob.val().password) {
                request.session.login = data.username;
                res.redirect('/console');
            } else {
                res.redirect('/getout');
            }
        });
    }
});

app.post('/go-part2', function(request, response){
    var data = request.body;
    request.session.who = data.sid;
    var entry = {
        sid: data.sid,
        name: data.name,
        class: data.class,
        phone: data.phone,
        email: data.email
    };
    var up = {};
    up["/people/" + data.sid] = entry;
    db.ref().update(up);
    response.redirect('/part2');
});

app.post('/go-part3', function(request, response){
    var data = request.body;
    var who = request.session.who;
    var type = request.session.where;
    var entry = {
        type: type,
        taste: data.taste,
        people: data.people,
        time: data.time
    };

    var up = {};
    up["/people/" + who + "/result"] = entry;
    db.ref().update(up);
    response.redirect('/part3');
});

app.post('/end', function(request, response){
    response.redirect('/finish');
});

app.get('/finish', function(request, response){
    response.render('pages/goodbye2');
});

app.get('/part1', function (request, response){
    response.render('pages/basicinfo');
});

app.get('/part2', function (request, response){
    if (request.session.where == "sukoi") {
        response.render('pages/sukoi');
    } else if (request.session.where == "suge") {
        response.render('pages/suge');
    } else {
        response.redirect('/getout');
    }
});

app.get('/part3', function(request, response){
    response.render('pages/part3');
});

app.get('/console', function(request, response){
    if (request.session.login) {
        var data = [];
        var peo = db.ref("/people").orderByKey();
        peo.once("value").then(function(ob) {
            ob.forEach(function(snap) {
                var entry = {};
                value = snap.val();
                entry.sid = value.sid;
                entry.class = value.class;
                entry.name = value.name;
                entry.phone = value.phone;
                entry.email = value.email;
                var row = value.result;
                if (row === undefined) {
                    return;
                }
                if (row.type == "sukoi") {
                    entry.type = "是";
                } else if (row.type == "suge") {
                    entry.type = "否";
                } else {
                    entry.type = row.type;
                }


                if (row.taste == "origin") {
                    entry.taste = "原味";
                } else if (row.taste == "sugar") {
                    entry.taste = "焦糖";
                } else if (row.taste == "chocolate") {
                    entry.taste = "巧克力";
                } else if (row.taste == "none"){
                    entry.taste = "無";
                } else {
                    entry.taste = row.taste;
                }

                entry.peonum = row.people;
                var time = new Date(parseInt(row.time));
                entry.time = time.getMinutes() + "：" + time.getSeconds() + "：" + time.getMilliseconds();
                data.push(entry);
            });
            response.render('pages/console', {data: data});
        });
    } else {
        response.redirect('/getout');
    }
});

app.get('/logout', function(request, response){
    request.session.login = undefined;
    response.render('pages/goodbye');
});

app.get('/getout', function(request, response){
    response.render('pages/getout');
});

app.listen(app.get('port'), function() {
  console.log('QuestPsy is running on port', app.get('port'));
});
