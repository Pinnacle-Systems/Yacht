import React from "react";

const ImageView = ({ Image }) => {
  return (
       <div className="flex justify-center items-center h-full">
      <img
        src={Image}
        alt="Fabric"
        className="max-h-full max-w-full object-contain"
      />
    </div>
  );
};

export default ImageView;
