import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import multer from 'multer';
const upload = multer({ dest: 'uploads/' }); // this will save files to an 'uploads' folder
const { API_URL, API_KEY } = process.env;
const INDEXES_URL = `${API_URL}/indexes`;
const TASKS_URL = `${API_URL}/tasks`;
const GENERATE_URL = `${API_URL}/generate`;

let currentIndex = "";
let currentTask = "";
let currentVideoID = "";

const app = express();
const port = 3000;

// Serve static files from the "public" directory
app.use(express.static('public'));

app.post("/upload", upload.single('video'), async (req, res) => {
  const newIndex = await generateIndex();
  console.log("Uploading file...");
  if (req.file) {
    try {
      const videoID = await uploadVideo(req.file.path, newIndex);
      const videoText = await generateVideoDescription(videoID);
      res.send(`File output: ${videoText}`);
    } catch (error) {
      res.status(500).send("An error occurred while processing the video.");
    }
  } else {
    res.status(400).send("No file uploaded.");
  }
});

async function generateVideoDescription(videoID) {
  console.log("Generating video description...");

  const data = {
    'video_id': videoID,
    'prompt': 'I want you to give me a detailed description of the house/room shown in the video. I just need to know how the room is set up so that I can classify if it fits for cats or not, or if there is anything I should be worried about.'
  };

  const headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
  };

  const config = {
    method: 'post',
    url: GENERATE_URL,
    headers: headers,
    data: data
  };

  const resp = await axios(config);
  const response = await resp.data;
  console.log(`Status code: ${resp.status}`);
  console.log(response);
}

async function generateIndex() {
  const currentDate = new Date();
  const INDEX_NAME = `index_${currentDate.toISOString()}`;

  const headers = {
    "x-api-key": API_KEY
  };

  const data = {
    "engines": [
      {
        'engine_name': 'pegasus1',
        'engine_options': ['visual', 'conversation']
      }
    ],
    'index_name': INDEX_NAME,
  };

  try {
    const resp = await axios.post(INDEXES_URL, data, { headers });
    const { data: response } = resp;
    const INDEX_ID = response._id;
    currentIndex = INDEX_ID;
    console.log(`Index ID: ${INDEX_ID}`);
    return INDEX_ID;
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

async function uploadVideo(filePath, newIndex) {
  let form = new FormData();
  const file_stream = fs.createReadStream(filePath);

  form.append("video_file", file_stream, { filename: "uploadedVideo.mp4" });
  form.append("index_id", newIndex);
  form.append("language", "en");

  const requestConfig = {
    method: 'post',
    url: TASKS_URL,
    headers: { 
      "x-api-key": API_KEY,
      ...form.getHeaders()
    },
    data: form
  };

  try {
    const response = await axios(requestConfig);
    console.log(`Status code: ${response.status}`);
    const TASK_ID = response.data._id;
    currentTask = TASK_ID;
    console.log(`Task ID: ${TASK_ID}`);
    console.log(`Video ID: ${currentVideoID}`);
    const TASK_STATUS_URL = `${API_URL}/tasks/${TASK_ID}`;
    const uploadResp = await new Promise((resolve) => {
      let index = 0;
      const interval = setInterval(async () => {
        const { data: response } = await axios.get(TASK_STATUS_URL, {
          headers: {
            'x-api-key': API_KEY
          }
        });
        if (response.status == 'ready') {
          console.log("Processing complete");
          clearInterval(interval);
          resolve(response);
        } else {
          console.log(index);
          index++;
        }
      }, 1000);
    });
    console.log(uploadResp.video_id);
    currentVideoID = uploadResp.video_id;
    return currentVideoID;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
