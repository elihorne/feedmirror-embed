const feedmirror = require("./");
feedmirror("foo", (err, resp) => {
  if (err) {
    console.log(err);
  }
  console.log(resp);
});
