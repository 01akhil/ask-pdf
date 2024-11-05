
'use client';
import { Inbox, Loader2 } from 'lucide-react';
import React from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const FileUpload: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false); // State to manage loading indicator
  const { mutate } = useMutation({
    mutationFn: async ({ file_key, file_name, url }: { file_key: string; file_name: string; url: string }) => {
      const response = await axios.post('/api/create-chat', {
        file_key,
        file_name,
        url,
      });
      return response.data;
    },
    onError: (error) => {
      console.error("Error creating chat:", error);
      toast.error("Error creating chat"); // Notify on error
    },
    onSuccess: (data) => {
      router.push(`/chat/${data.chat_id}`); // Redirect after successful creation
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
   
    onDrop: async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      // Check file size and notify if it's too large
      if (file.size > 10 * 1024 * 1024) {
        alert("File too large. Maximum size is 10MB.");
        return;
      }

      const file_name = file.name.replace(/\s+/g, "-"); // Replace spaces in file name

      // Read the file as a data URL (base64)
      const reader = new FileReader();
      reader.onloadend = async () => {
        let base64File = reader.result as string;

        // Check if base64File has the correct prefix
        if (!base64File.startsWith('data:application/pdf;base64,')) {
          base64File = `data:application/pdf;base64,${base64File}`;
        }

        setLoading(true); // Set loading state

        // Send the file to the API
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ file: base64File, name: file_name }), // Send as JSON
        });

        const result = await response.json();

        setLoading(false); // Reset loading state

        if (result.error) {
          console.error('Upload Error:', result.error);
          toast.error('Upload Error'); // Notify upload error
        } else {
          // Now call mutate with the file_key and file_name from the response
          const { file_key, url } = result;
          setLoading(true); // Set loading state again for chat creation
          mutate({ file_key, file_name, url });
        }
      };

      reader.readAsDataURL(file); // Read the file as base64
    },
  });

  return (
    <div className='p-2 bg-white rounded-xl'>
      <div
        {...getRootProps({
          className: `border-dashed border-2 rounded-xl cursor-pointer bg-gray py-8 flex justify-center items-center flex-col ${loading ? 'opacity-50' : ''}`,
          onClick: () => { if (loading) return; } // Disable interaction if loading
        })}
      >
        <input {...getInputProps()} />
        {loading ? ( // Display loader if uploading or creating chat
          <>
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">Processing...</p>
          </>
        ) : (
          <>
            <Inbox className='text-blue-500' />
            <p>Drag 'n' drop some files here, or click to select files</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
