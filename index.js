// const fetch = require("node-fetch");
const { default: axios } = require("axios");
const cors = require("cors");
const express = require("express");
const app = express();
const cheerio = require("cheerio");
var FormData = require("form-data");
const fetch = require("node-fetch");
const fs = require('fs');

//Downloader for video/image
app.get("/download/:slug", async (req, res) => {
  const url = decodeURIComponent(req.query.url);
  console.log(url);

  try {
    if (url != undefined && url != null && url != "") {
      axios({
        url: url,
        method: "GET",
        responseType: "stream", // important
      })
        .then(function (response) {
          let rnd = Math.floor(Math.random() * 100000) + 1;

          const contentType = response.headers["content-type"];
          downloadFile(url, rnd + ".mp4");
          console.log(contentType);
          counter1++;
          console.log(url, ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  " + counter1);
          res.setHeader("Content-Type", contentType);
          response.data.pipe(res);
          // ....
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      return res.status(404).json("Please Enter Valid Url");
    }
  } catch (error) {
    return res.status(404).json(error);
  }
});

app.use(cors());

// reels downloader code
app.get("/instareels/", (req, res) => {
  const id = req.headers.id;
  console.log(id);
  try {
    if (id != undefined && id != null && id != "") {
      return ScrapeVideo1(id)
        .then((result) => {
          // console.log(result);
          if (result != "") {
            if (result != undefined) {
              // counter++;
              // console.log(result, ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  " + counter);
              return res.status(200).json(result);
            } else {
              res.status(404).json("Instagram Server Error");
            }
          } else {
            res.status(404).json("Url is Incorrect or insta id doesn`t exist");
          }
        })
        .catch((err) => {
          res.status(404).json(err);
        });
    } else {
      return res.status(404).json("Please Enter Valid Url");
    }
  } catch (error) {
    return res.status(404).json(error);
  }
});
app.listen(8080, () => console.log(`Example app listening on port 8080!`));


//! server list ----------------------
// 1. https://www.w3toys.com/
//2. https://server.instasave.website/
//3. https://instasave.website
//! server list ----------------------

async function ScrapeVideo1(id) {
  try {
    var data = new FormData();
    data.append("link", `https://www.instagram.com/p/${id}`);
    data.append("submit", "");

    var config = {
      method: "post",
      url: "https://server.instasave.website/",
      headers: {
        Cookie: "__cfduid=db66680008860fa16089cec9d0ed36fb31616757592",
        ...data.getHeaders(),
      },
      data: data,
    };
    const html = await axios(config);
    console.log(html.status);
    const $ = cheerio.load(html.data);
    const videoString = $(".dlsection").find("source").attr("src");
    return videoString + "&dl=1";
  } catch (error) {
    return error.message;
  }
}

async function downloadFile(fileUrl, outputLocationPath) {
  const writer = fs.createWriteStream(outputLocationPath);
  return axios({
    method: "get",
    url: fileUrl,
    responseType: "stream",
  })
    .then(async (response) => {
      response.data.pipe(writer);
      return finished(writer); //this is a Promise
    })
    .catch((err) => {
      console.error(err);
    });
}

