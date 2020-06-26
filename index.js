const express = require("express"),
    fs = require("fs"),
    JSONdata = JSON.parse(fs.readFileSync("./data.json")),
    bodyParser = require("body-parser"),
    cors = require("cors"),
    app = express();
app.use(cors());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header(
        "Access-Control-Allow-Headers",
        "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
    );
    next();
});
app.use(bodyParser.json());
// console.log(JSONdata);

app.get("/api/", (req, res) => {
    res.json(JSONdata);
});
app.post("/api/", (req, res) => {
    const e = Number(req.body.e),
        h0 = Number(req.body.height),
        g = 9.8,
        tg = 0.01, //time gap array of coordinates
        arr = [];
    let totalTime = 0,
        bounce = 0; //till max height reached becomes 0.000000001

    let h = h0,
        T = Math.sqrt((2 * h) / g),
        v = e * 9.8 * T;
    bounce++;
    let time = 0;
    while (time <= T) {
        let height = h - 0.5 * g * time * time;
        arr.push({ time, height });
        time += tg;
    }
    totalTime += T;

    while (v != 0) {
        h = (v * v) / (2 * g);
        if (h <= 0.000000001) break;
        bounce++;
        T = v / g;
        time = 0;
        while (time <= T) {
            height = v * time - 0.5 * g * time * time;
            arr.push({ time: time + totalTime, height });
            time += tg;
        }
        time = 0;
        while (time <= T) {
            height = h - 0.5 * g * time * time;
            arr.push({ time: time + totalTime + T, height });
            time += tg;
        }
        totalTime += 2 * T;
        v = e * v;
    }
    const calculation = {
        e: e,
        h0: h0,
        results: {
            bounce: bounce,
            coordinates: arr,
        },
    };
    JSONdata.data.push(calculation);
    const JSONString = JSON.stringify(JSONdata);
    fs.writeFile("data.json", JSONString, (err) => {
        if (err) console.log(err);
    });
    res.json(calculation);
});

const port = 8000 || process.env.PORT;
app.listen(port, (req, res) => {
    console.log(`Listening to ${port}`);
});
