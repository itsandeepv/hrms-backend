const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const s3uploads = require("./s3config");

// Middleware for image upload
const s3ImageUpload = (folderName) => async (req, res, next) => {
    try {
        const file = req.files?.image;

        if (!file) {
            return res.status(400).json({ status: false, message: "No file uploaded" });
        }

        // Generate unique file name
        const fileExtension = path.extname(file.name);
        const fileName = `${uuidv4()}${fileExtension}`;

        // Upload to S3
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${folderName}/${fileName}`,
            Body: fs.createReadStream(file.tempFilePath),
            ContentType: file.mimetype,
        };

        const uploadResponse = await s3uploads.upload(params).promise();

        // Construct image URL and path
        req.s3Image = {
            url: uploadResponse.Location,
            path: uploadResponse.Key,
        };

        // Delete temporary file
        fs.unlinkSync(file.tempFilePath);

        next();
    } catch (error) {
        console.error("Error uploading to S3:", error);
        res.status(500).json({ status: false, message: "Error uploading file to S3", error: error.message });
    }
};

module.exports = s3ImageUpload;
