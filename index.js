import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'; 
import bcrypt from 'bcrypt';

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());


async function hash(input) {
    return await bcrypt.hash(''+input, 10); // make input a string, 10 salt rounds
}

const hashes = [];
app.post('/token', async (req, res) => {
    const { randomNum } = req.body;
    const currentDate = Date.now();
    const hashed = await hash(randomNum);
    console.log(hashed);
    const hashObj = { hash: hashed, createdAt: currentDate };
    hashes.push(hashObj);
    console.log(hashes)
    res.cookie("token", hashed);
    // res.send("ok");
    res.json({ success: "ok", hashObj });
})

const messages = [];
app.post('/message', (req, res) => {
    const { message } = req.body;
    const cookies = req.cookies;
    console.log("Cookies token: ", cookies.token);
    if (!cookies.token) {
        return res.sendStatus(400);
    }
    const hashFound = hashes.find(h => h.hash === cookies.token);
    // console.log(hashFound);
    if (!hashFound) {
        return res.sendStatus(400);
    }
    const timeNow = Date.now();
    const diff = timeNow - hashFound.createdAt;
    // console.log(diff);
    const tooOld =  diff >= 60000; // checks if hashFound is older than 1 minute
    // console.log(tooOld);
    if (tooOld) {
        return res.sendStatus(400);
    }
    messages.push(message);
    console.log(messages);
    res.send("thanks for the message");
})

app.use((req,res) => {
    res.send("mhh, ok.")
})

app.listen(3489, () => {
    console.log("Listening at http://localhost:3489");
})