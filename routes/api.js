const express = require("express");
const Url = require("../models/Url");
const dns = require("dns");
const router = express.Router();

router.post('/shorturl', async (req, res) => {
  const inputUrl = req.body.url;

  try {

    const parsedUrl = new URL(inputUrl);

    dns.lookup(parsedUrl.hostname, async (err) => {
      if (err) return res.json({ error: 'invalid url' });

      let urlEntry = await Url.findOne({ original_url: inputUrl });
      if (!urlEntry) {

        const lastEntry = await Url.findOne().sort({ short_url: -1 });
        const nextShortUrl = lastEntry ? lastEntry.short_url + 1 : 1;

        urlEntry = new Url({
          original_url: inputUrl,
          short_url: nextShortUrl,
        });
        await urlEntry.save();
      }

      res.json({
        original_url: urlEntry.original_url,
        short_url: urlEntry.short_url,
      });
    });
  } catch (error) {
    res.json({ error: 'invalid url' });
  }
});

router.get('/shorturl/:short_url', async (req, res) => {
  const shortUrl = req.params.short_url;

  try {
    const urlEntry = await Url.findOne({ short_url: shortUrl });

    if (!urlEntry) {
      return res.status(404).json({ error: 'No short URL found' });
    }

    res.redirect(urlEntry.original_url);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
