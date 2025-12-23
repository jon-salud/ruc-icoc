# Rise Up Challenge - Data Integration Guide

This guide explains how to connect the website to **Google Sheets** (to manage devotional entries) and **YouTube** (to host videos) without requiring a paid backend server.

---

## Part 1: Google Sheets Setup (The Database)

We will use a standard Google Sheet as our Content Management System (CMS). The website will read this sheet to display the list of devotionals.

### 1. Create the Sheet
1. Create a new Google Sheet.
2. Name the first tab/sheet `Devotionals`.
3. Create the following **Header Row** (Row 1) exactly as written below:

| A | B | C | D | E | F |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Date** | **Title** | **Speaker** | **Language** | **Scripture** | **Video URL** |

### 2. Add Data
Fill in the rows.
*   **Date:** Format as `YYYY-MM-DD` (e.g., `2024-05-20`).
*   **Language:** Use `tl` for Tagalog or `en` for English.
*   **Video URL:** Paste the full YouTube link (e.g., `https://www.youtube.com/watch?v=dQw4w9WgXcQ`).

### 3. Publish to Web (Crucial Step)
This allows the website to read the data without needing complex API keys.

1. In Google Sheets, go to **File** > **Share** > **Publish to web**.
2. In the dialog box:
    *   Select **Link**.
    *   Choose **Entire Document** (or just the `Devotionals` tab).
    *   Change "Web page" to **Comma-separated values (.csv)**.
3. Click **Publish**.
4. **Copy the link** generated. It will look something like this:
   `https://docs.google.com/spreadsheets/d/e/2PACX-1vR.../pub?output=csv`

> **Note:** Save this URL. You will need to add this to your website code later.

---

## Part 2: YouTube Setup (Video Hosting)

### 1. Uploading Videos
1. Upload your recorded Zoom session to YouTube.
2. Set the visibility to **Unlisted** (if you only want it visible via the app) or **Public**.
3. Copy the **Video URL**.

### 2. Thumbnails
The website will automatically generate high-quality thumbnails using the YouTube Video ID. You do **not** need to upload separate images to the sheet.

---

## Part 3: Developer Implementation Guide

To connect the React app to the Google Sheet CSV, follow these steps in the code.

### 1. Install Dependencies
You need a library to parse the CSV data.
```bash
npm install papaparse
npm install --save-dev @types/papaparse
```

### 2. Create a Helper Function
Create a utility to extract the YouTube ID from the URL in the sheet.

```typescript
// utils.ts
export const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const getThumbnailUrl = (videoId: string) => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};
```

### 3. Update `App.tsx` or Data Fetching Logic

Replace the `MOCK_DEVOTIONALS` with a `useEffect` hook to fetch the data.

```typescript
import Papa from 'papaparse';
import { getYouTubeId, getThumbnailUrl } from './utils';

// ... inside your component
const [devotionals, setDevotionals] = useState<Devotional[]>([]);

useEffect(() => {
  const SHEET_URL = "YOUR_GOOGLE_SHEET_CSV_URL_HERE";

  fetch(SHEET_URL)
    .then(response => response.text())
    .then(csvText => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsedData = results.data.map((row: any, index) => {
             const videoId = getYouTubeId(row['Video URL']) || '';
             
             return {
               id: `sheet-${index}`,
               date: row['Date'],
               title: row['Title'],
               speaker: row['Speaker'],
               language: row['Language'].toLowerCase(), // ensure 'tl' or 'en'
               scripture: row['Scripture'],
               videoUrl: row['Video URL'],
               thumbnailUrl: videoId ? getThumbnailUrl(videoId) : '', 
             };
          });
          
          // Sort by date (newest first)
          const sortedData = parsedData.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          
          setDevotionals(sortedData);
        }
      });
    });
}, []);
```

---

## Troubleshooting

*   **CORS Errors:** Google Sheets "Publish to Web" usually handles CORS fine. If issues arise, ensure you are using the `pub?output=csv` link, not the editing link.
*   **Updates not showing:** Google Sheets caches the published CSV. Changes made in the sheet may take **5 minutes** to appear on the website.
