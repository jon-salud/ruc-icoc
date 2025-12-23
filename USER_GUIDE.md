# Rise Up Challenge - Volunteer Website Guide

This guide explains how to add new devotionals to the Rise Up Challenge website.

**How it works:** The website is connected to a specific **Google Sheet**. Whenever you add a new row to that Sheet, the website automatically updates to show the new video. You do not need to touch any code!

---

## The 3-Step Process

### Step 1: Upload the Recording to YouTube

1.  **Record** your Zoom devotional session.
2.  **Upload** the video file to the ministry YouTube channel.
3.  **Visibility Settings:**
    *   Select **"Unlisted"** if you only want people to see it via the website.
    *   Select **"Public"** if you want it to show up in YouTube search results.
4.  **Copy the Video Link** (e.g., `https://youtu.be/...`).

> **Note:** You do not need to create a thumbnail image. The website will automatically grab the high-quality image from YouTube.

### Step 2: Update the Google Sheet

Open the linked Google Sheet (ask your administrator for the link). Add a new row at the bottom with the following information:

| Column Name | What to type | Example |
| :--- | :--- | :--- |
| **Date** | The date of the devotional (Format: YYYY-MM-DD) | `2024-05-25` |
| **Title** | The topic or title of the lesson | `Faith in the Storm` |
| **Speaker** | Name of the person sharing | `Juan dela Cruz` |
| **Language** | `tl` for Tagalog, `en` for English | `tl` |
| **Scripture** | The Bible verse reference | `Mark 4:35-41` |
| **Video URL** | The YouTube link you copied in Step 1 | `https://youtu.be/...` |

### Step 3: Check the Website

1.  Go to the Rise Up Challenge website.
2.  **Wait 5 Minutes:** Google Sheets takes a few minutes to "publish" the new data to the web.
3.  **Refresh** the website. Your new devotional should appear at the top of the list!

---

## Frequently Asked Questions

**Q: I added the row, but the website is empty or didn't update.**
A: Google servers cache the data. It usually takes between 3 to 5 minutes for changes to appear. Go grab a coffee, come back, and refresh the page!

**Q: The thumbnail image is missing or gray.**
A: Ensure the YouTube video has finished processing. Also, ensure you copied the correct YouTube URL into the sheet.

**Q: Can I fix a typo in the title?**
A: Yes! Just edit the text in the Google Sheet. Wait 5 minutes, and the website will correct itself.

---

## For the Administrator (One-Time Setup)

*Only do this once when setting up the website for the first time.*

1.  Create a Google Sheet.
2.  Add the headers exactly as shown in Step 2.
3.  Go to **File > Share > Publish to web**.
4.  Select **"Entire Document"** and change "Web page" to **"Comma-separated values (.csv)"**.
5.  Click **Publish**.
6.  Copy the generated link and send it to the web developer to add to the website configuration.
