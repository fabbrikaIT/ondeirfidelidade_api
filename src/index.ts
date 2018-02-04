import app from "./config/server";

// const port = process.env.APP_PORT || 3000;
 const port  = process.env.PORT || 8080;

app.listen(port, err => {
    if (err) {
        return console.log(err);
    }

    return console.log(`server is listening on ${port}`);
});
