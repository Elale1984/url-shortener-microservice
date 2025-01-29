const express = require("express");
const Url = require("../models/Url");
const dns = require("dns");
const router = express.Router();

router.post("/api/shorturl", async (req, res) => {
  const inputUrl = req.body.url;

  try {
    const parsedUrl = new URL(inputUrl);

    dns.lookup(parsedUrl.hostname, async (error, address) => {
      if (err || !address) {
        return res.json({ err: "invalid url" });
      }

      const lastEntry = await Url.findOne().sort({ short_url: -1 });
      const nextShortUrl = lastEntry ? lastEntry.short_url + 1 : 1;

      const newUrl = new Url({
        original_url: inputUrl,
        short_url: nextShortUrl,
      });

      await newUrl.save();

      res.json({
        original_url: newUrl.original_url,
        short_url: newUrl.short_url,
      });
    });
  } catch (err) {
    res.json({ err: "invalid url" });
  }
});

router.get("api/shorturl/:short_url", async (req, res) => {
  const shortUrl = req.params.short_url;

  try {
    const urlEntry = await Url.findOne({ shortUrl: shortUrl });

    if (!urlEntry) {
      return res.status(404).json({ err: "No short URL found" });
    }

    res.redirect(urlEntry.original_url);
  } catch (err) {
    res.status(500).json({ err: "Server Error" });
  }
});

module.exports = router;
