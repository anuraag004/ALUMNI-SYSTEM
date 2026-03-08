/**
 * services/storage.service.js
 * Firebase Storage upload/download helpers.
 */

const { bucket } = require("../config/firebase");

/**
 * Upload a Buffer to Firebase Storage.
 * @param {Buffer} buffer
 * @param {string} destination - Path within the bucket, e.g. 'resumes/uid/file.pdf'
 * @param {string} contentType - MIME type
 * @returns {Promise<string>} Public download URL
 */
const uploadBuffer = async (buffer, destination, contentType = "application/octet-stream") => {
    const file = bucket.file(destination);

    await file.save(buffer, {
        metadata: { contentType },
        resumable: false,
    });

    // Make the file publicly readable
    await file.makePublic();

    return `https://storage.googleapis.com/${bucket.name}/${destination}`;
};

/**
 * Download a file from Firebase Storage by its public URL and return a Buffer.
 * @param {string} publicUrl
 * @returns {Promise<Buffer>}
 */
const downloadBuffer = async (publicUrl) => {
    // Extract the path relative to the bucket root from the public URL
    const bucketPrefix = `https://storage.googleapis.com/${bucket.name}/`;
    const filePath = publicUrl.replace(bucketPrefix, "");

    const [buffer] = await bucket.file(filePath).download();
    return buffer;
};

/**
 * Delete a file from Firebase Storage by its public URL.
 * @param {string} publicUrl
 */
const deleteFile = async (publicUrl) => {
    const bucketPrefix = `https://storage.googleapis.com/${bucket.name}/`;
    const filePath = publicUrl.replace(bucketPrefix, "");
    await bucket.file(filePath).delete();
};

module.exports = { uploadBuffer, downloadBuffer, deleteFile };
