const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const router = express.Router();



// setup express
const app = express();

// setup body parser middleware to conver to JSON and handle URL encoded forms
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

// connect to the mongodb database
mongoose.connect('mongodb://localhost:27017/match-tracker', {
    useUnifiedTopology: true,
    useNewUrlParser: true
});

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const cookieSession = require('cookie-session');
app.use(cookieSession({
    name: 'session',
    keys: [
        'secretValue'
    ],
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// import the users module and setup its API path
const users = require("./users.js");
app.use("/api/users", users.routes);
const validUser = users.valid;


const matchSchema = new mongoose.Schema({
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category'
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    title: String,
    opponent: String,
    score: String,
    date: String,
    notes: String,
    win: Boolean
});

const Match = mongoose.model('Match', matchSchema);

const catSchema = new mongoose.Schema({
    name: String
});

const Category = new mongoose.model('Category', catSchema);

app.post('/api/cat/:cat/match', validUser, async (req, res) => {
    try {
        let cat = await Category.findOne({ name: req.params.cat });
        if (!cat) {
            res.send(404);
            return;
        }
        let match = new Match({
            category: cat,
            user: req.user,
            title: req.body.title,
            opponent: req.body.opponent,
            score: req.body.score,
            date: req.body.date,
            notes: req.body.notes,
            win: req.body.win
        });
        await match.save();
        res.send(match);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.get('/api/cat/:cat/match', validUser, async (req, res) => {
    try {
        let cat = await Category.findOne({ name: req.params.cat });
        if (!cat) {
            res.send(404);
            return;
        }
        let match = await Match.find({
            category: cat,
            user: req.user
        });
        res.send(match);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.put('/api/cat/:catID/match/:matchID', async (req, res) => {
    try {
        let match = await Match.findOne({ _id: req.params.matchID });
        if (!match) {
            res.send(404);
            return;
        }
        match.title = req.body.title;
        match.opponent = req.body.opponent;
        match.score = req.body.score;
        match.date = req.body.date;
        match.notes = req.body.notes;
        match.win = req.body.win;
        await match.save();
        res.send(match);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.delete('/api/cat/:catID/match/:matchID', async (req, res) => {
    try {
        let match = await Match.findOne({ _id: req.params.matchID });
        if (!match) {
            res.send(404);
            return;
        }
        await match.delete();
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.post('/api/cat', async (req, res) => {
    const cat = new Category({
        name: req.body.name
    });
    try {
        await cat.save();
        res.send(cat);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.get('/api/cat', async (req, res) => {
    try {
        let cat = await Category.find();
        res.send(cat);
    } catch (error) {
        res.sendStatus(500);
    }
});


app.listen(3015, () => console.log('Server listening on port 3015!'));