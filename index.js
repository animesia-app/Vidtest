// Import necessary modules
const express = require('express');
const fileUpload = require('express-fileupload');
const { exec } = require('child_process');
const fs = require('fs');
const readline = require('readline');
const nodemailer = require('nodemailer');
const path = require('path');
const async = require('async');

// Initialize Express app and port
const app = express();
const port = process.env.PORT || 3000;

// Use file upload middleware
app.use(fileUpload());

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(__dirname + '/uploads'));

// Serve static files from the "public" directory
app.use(express.static(__dirname + '/public'));

// Create a queue to process video encoding tasks
const videoQueue = async.queue((task, callback) => {
  processVideo(task, callback);
}, 1); // Concurrency of 1 ensures tasks are processed sequentially

// Function to process video tasks
function processVideo(task, callback) {
  const { videoFile, subtitlesFile, selectedFont, outputFileName, userEmail } = task;

  const videoPath = __dirname + '/uploads/video.mp4';
  const subtitlesPath = __dirname + '/uploads/subtitles.srt';
  const outputPath = path.join(__dirname, 'uploads', outputFileName);

  videoFile.mv(videoPath, (err) => {
    if (err) {
      console.error(`Error: ${err.message}`);
      return callback(err);
    }

    subtitlesFile.mv(subtitlesPath, (err) => {
      if (err) {
        console.error(`Error: ${err.message}`);
        return callback(err);
      }

      const fontMapping = {
        'Arial-Bold': 'Arial-Bold.ttf',
        'Juventus Fans Bold': 'Juventus-Fans-Bold.ttf',
        'Tungsten-Bold': 'Tungsten-Bold.ttf'
      };

      const selectedFontFile = fontMapping[selectedFont];

      if (!selectedFontFile) {
        return callback(new Error('Selected font is not supported.'));
      }

      const fullFontPath = `fonts/${selectedFontFile}`;

      const subtitlesExtension = path.extname(subtitlesFile.name).toLowerCase();
      const acceptedSubtitleFormats = ['.srt', '.ass'];

      if (!acceptedSubtitleFormats.includes(subtitlesExtension)) {
        return callback(new Error('Selected subtitle format is not supported.'));
      }

      const ffmpegCommand = `ffmpeg -i ${videoPath} -vf "subtitles=${subtitlesPath}:force_style='Fontfile=${fullFontPath}'" ${outputPath}`;

      const ffmpegProcess = exec(ffmpegCommand);

      let totalFrames = 0;
      let processedFrames = 0;
      readline.createInterface({ input: ffmpegProcess.stderr })
        .on('line', (line) => {
          if (line.includes('frame=')) {
            const match = line.match(/frame=\s*(\d+)/);
            if (match && match[1]) {
              processedFrames = parseInt(match[1]);
            }
          }
          if (line.includes('fps=')) {
            const match = line.match(/fps=\s*([\d.]+)/);
            if (match && match[1]) {
              totalFrames = parseInt(match[1]);
            }
          }
          if (totalFrames > 0 && processedFrames > 0) {
            const progressPercent = (processedFrames / totalFrames) * 100;
            console.log(`Processing progress: ${progressPercent.toFixed(2)}%`);
          }
        });

      ffmpegProcess.on('error', (error) => {
        console.error(`Error: ${error.message}`);
        return callback(error);
      });

      ffmpegProcess.on('exit', () => {
        console.log('Video processing completed');

        // Construct the download link
        const downloadLink = `http://${req.hostname}:${port}/uploads/${outputFileName}`;

        // Send an email with the download link
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: 'vpsest@gmail.com',
            pass: process.env.APP_KEY,
          },
        });

        const mailOptions = {
          from: 'vpsest@gmail.com',
          to: userEmail,
          subject: 'Video Encoding Completed',
          text: `Your video has been successfully encoded. You can download it using the following link: ${downloadLink}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error(`Email sending error: ${error}`);
          } else {
            console.log(`Email sent: ${info.response}`);
          }
        });

        // Delete the processed video after 24 hours
        setTimeout(() => {
          fs.unlink(outputPath, (err) => {
            if (err) {
              console.error(`Error deleting file: ${err}`);
            } else {
              console.log('Processed video deleted successfully after 24 hours.');
            }
          });
        }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds

        // Send the download link to the client
        callback();
      });
    });
  });
}

// Route to handle video upload
app.post('/upload', (req, res) => {
  if (!req.files || !req.files.video || !req.files.subtitles) {
    return res.status(400).send('Please upload both video and subtitles.');
  }

  const videoFile = req.files.video;
  const subtitlesFile = req.files.subtitles;
  const selectedFont = req.body.font || 'Arial-Bold';
  const outputFileName = req.body.outputFileName || 'output.mp4';
  const userEmail = req.body.email;

  videoQueue.push({
    videoFile,
    subtitlesFile,
    selectedFont,
    outputFileName,
    userEmail
  }, (err) => {
    if (err) {
      console.error('Error processing video:', err);
      return res.status(500).send('Error occurred during video processing.');
    }
    console.log('Video processing completed successfully');
    res.status(200).send('Video processing completed successfully');
  });
});

// Route to get the current queue length
app.get('/queueNumber', (req, res) => {
  res.status(200).send(String(videoQueue.length()));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
