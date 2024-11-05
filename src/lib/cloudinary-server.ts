import fs from "fs";
import axios from "axios";
import os from "os"; // Import the os module
import path from "path"; // Import the path module

export async function downloadFromCloudinary(file_key: string, url: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      // Use the OS temporary directory
      const tempDir = os.tmpdir(); // Get the temporary directory path
      const fileName = path.join(tempDir, file_key.split("/").pop() || "downloaded_file");

      // Use the provided URL directly for downloading
      const response = await axios({
        url: url, 
        method: "GET",
        responseType: "stream",
      });

      const file = fs.createWriteStream(fileName);
      response.data.pipe(file);

      file.on("finish", () => {
        resolve(fileName); // Return the file path on success
      });

      file.on("error", (error) => {
        console.error("Error writing the file:", error);
        reject(error);
      });
    } catch (error) {
      console.error("Error downloading from Cloudinary:", error);
      reject(error);
    }
  });
}

