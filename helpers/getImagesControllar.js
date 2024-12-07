
const path = require('path');
const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const s3 = new AWS.S3({
    region: 'ap-south-1', // Your bucket region (e.g., ap-south-1 for Mumbai)
});

const getImages = async (req, res) => {
    const { imageKey, folder } = req.params; // The key of the image in S3 (the filename)
    const ikey = `${folder}/${imageKey}`
    const params = {
        Bucket: 'crmhai-bucket', // Your S3 bucket name
        Key: ikey,           // The image key (filename) you want to fetch
    };

    try {
        // Fetch the image from S3
        const data = await s3.getObject(params).promise();
        // Set the correct content type based on the file extension
        const extname = path.extname(imageKey).toLowerCase();
        let contentType = 'application/octet-stream'; // Default content type
        // Basic mapping for common image file types
        if (extname === '.jpeg' || extname === '.jpg') {
            contentType = 'image/jpeg';
        } else if (extname === '.png') {
            contentType = 'image/png';
        } else if (extname === '.gif') {
            contentType = 'image/gif';
        }
        // Set the response headers and send the image
        res.setHeader('Content-Type', contentType);
        res.send(data.Body); // Send the image body as the response
    } catch (error) {
        console.error('Error fetching image from S3:', error);
        res.status(500).send(error);
    }
}

module.exports = { getImages }