import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const DropzoneComponent = ({ validation ,onFileRead }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [files, setFiles] = useState([]);

  const onDragEnter = () => {
    setIsDragActive(true);
  };

  const onDragLeave = () => {
    setIsDragActive(false);
  };

   const onDrop = useCallback((acceptedFiles) => {
    // console.log(acceptedFiles)
    setFiles(acceptedFiles.map(file => file.name));
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const binaryStr = reader.result;
        console.log(acceptedFiles[0]); // Handle the file data here
        onFileRead(acceptedFiles[0]); // Send the binary data to the parent component
      };
      reader.readAsArrayBuffer(file);
    });
  }, [onFileRead]);

   const acceptTypes = validation === 'kotak' ? { 'text/csv': ['.csv'] } : { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'application/vnd.ms-excel': ['.xls'] };

  const {
    getRootProps,
    getInputProps,
    isDragAccept,
    isDragReject
  } = useDropzone({
    onDrop,
    accept: acceptTypes
  });

  // Reset files when validation prop changes
  useEffect(() => {
    setFiles([]);
  }, [validation]);

  return (
    <>
    <div {...getRootProps({ className: `dropzone ${isDragActive ? 'active' : ''}` })}>
      <input {...getInputProps()} />
      <p>Drag 'n' drop some files here, or click to select files</p>
    </div>
      <div className={files.length!==0?"files-list":''}>
        {files.length > 0 && (
          <div>
            <h4>Selected files:</h4>
            <ul>
              {files.map((file, index) => (
                <li key={index}>{file}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default DropzoneComponent;
