const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res, next) => {
	res.send("Hello World!");
});

app.listen(port, () => {
	console.log(`E-comm backend app listening on port ${port}`);
});
