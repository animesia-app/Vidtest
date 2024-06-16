# VideoBurner - Burn Subtitles into Videos Online

VideoBurner is a web application that allows users to upload a video and a subtitle file, burn the subtitles into the video, and download the processed video. The app supports various subtitle formats (SRT, ASS) and provides different font options for the subtitles. Additionally, users can receive an email with a download link once the video processing is complete.

## Features

- **Upload Video and Subtitles**: Supports MP4 and MKV video formats, and SRT and ASS subtitle formats.
- **Subtitle Font Selection**: Choose from multiple fonts such as Arial Bold, Juventus Fans Bold, and Tungsten-Bold.
- **Progress Tracking**: Monitor the progress of video processing in real-time.
- **Email Notifications**: Receive an email with a download link once the video processing is complete.
- **Download Processed Video**: Download the processed video with burnt-in subtitles directly from the application.

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: HTML, CSS, JavaScript
- **File Upload**: express-fileupload
- **Video Processing**: FFmpeg
- **Email Notifications**: Nodemailer
- **Environment Variables**: dotenv

## Installation

1. **Clone the Repository**
   ```sh
   git clone https://github.com/yourusername/videoburner_2.0.git
   cd videoburner_2.0
   ```

2. **Install Dependencies**
   ```sh
   npm install
   ```

3. **Install main Dependencies**
   ```sh
   apt install ffmpeg
   ```
   
4. **Set Up Environment Variables**
   Create a `.env` file in the root directory and add your email service credentials:
   ```
   APP_KEY=your_email_service_app_key
   ```

5. **Run the Application**
   ```sh
   node index.js
   ```

   The server will start running on `http://0.0.0.0:3000`.

## Deploy on render

**Deploy To Render.com For Free :**
<div align="center">

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/animesia-app/Vidtest)

</div>

## Usage

1. Open your web browser and navigate to `http://0.0.0.0:3000`.
2. Upload a video file (MP4 or MKV) and a subtitle file (SRT or ASS).
3. Select a subtitle font from the dropdown menu.
4. Enter an output file name and your email address to receive the download link.
5. Click the "Upload" button to start the video processing.
6. Monitor the progress and download the processed video once done.

## Contributing

We welcome contributions! Please fork the repository and submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contact

For any inquiries or issues, please contact us at example@gmail.com.

---
