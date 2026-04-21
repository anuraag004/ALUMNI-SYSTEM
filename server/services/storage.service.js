const { bucket } = require("../config/firebase");
const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Ensure local uploads directory exists
if (!fsSync.existsSync(UPLOADS_DIR)) {
    fsSync.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const getLocalPath = (destination) => {
    const safeDest = destination.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    return path.join(UPLOADS_DIR, safeDest);
};

/**
 * Upload a Buffer to Firebase Storage, with fallback to local disk.
 */
const uploadBuffer = async (buffer, destination, contentType = "application/octet-stream") => {
    try {
        const file = bucket.file(destination);
        await file.save(buffer, {
            metadata: { contentType },
            resumable: false,
        });
        await file.makePublic();
        return `https://storage.googleapis.com/${bucket.name}/${destination}`;
    } catch (err) {
        if (err.message && err.message.includes('exist')) {
            console.warn('[STORAGE] Firebase bucket not configured correctly. Falling back to local disk storage.');
        } else {
            console.warn('[STORAGE] Firebase upload error:', err.message, '- Falling back to local disk storage.');
        }
        const filePath = getLocalPath(destination);
        await fs.writeFile(filePath, buffer);
        return `local://${destination}`;
    }
};

/**
 * Download a file.
 */
const downloadBuffer = async (publicUrl) => {
    if (publicUrl.startsWith('local://')) {
        const destination = publicUrl.replace('local://', '');
        return await fs.readFile(getLocalPath(destination));
    }

    const bucketPrefix = `https://storage.googleapis.com/${bucket.name}/`;
    const filePath = publicUrl.replace(bucketPrefix, "");
    const [buffer] = await bucket.file(filePath).download();
    return buffer;
};

/**
 * Delete a file.
 */
const deleteFile = async (publicUrl) => {
    if (publicUrl.startsWith('local://')) {
        const destination = publicUrl.replace('local://', '');
        await fs.unlink(getLocalPath(destination)).catch(() => {});
        return;
    }

    const bucketPrefix = `https://storage.googleapis.com/${bucket.name}/`;
    const filePath = publicUrl.replace(bucketPrefix, "");
    await bucket.file(filePath).delete();
};

module.exports = { uploadBuffer, downloadBuffer, deleteFile };
