import cloudinary from '../../../lib/cloudinaryConfig';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { file,name } = await request.json(); // Extract the base64 file
  
  
  try {
    // Strip prefix from base64 if it exists
    const base64File = file.replace(/^data:application\/pdf;base64,/, '');

    // Upload to Cloudinary with specified format
    const result = await cloudinary.uploader.upload(
      `data:application/pdf;base64,${base64File}`,
      {
        resource_type: 'raw',
        format: 'pdf', // Force format to pdf
        access_control: [{ access_type: 'anonymous' }], // Ensure public access
        public_id: name,
      }
    );

    // Generate file_key and file_name
    const file_key = `upload/${Date.now().toString()}/${result.public_id}`; 
    // const file_name = result.display_name || result.public_id; // Use display_name or public_id if display_name is not present
    const file_name = result.public_id;
    // Return the secure URL, file key, and file name
    return NextResponse.json({
      message: 'File uploaded successfully',
      url: result.secure_url, // Secure URL from Cloudinary
      file_key, // Newly generated file key
      file_name, // Use the display name or public ID
    });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Error uploading file' }, { status: 500 });
  }
}
