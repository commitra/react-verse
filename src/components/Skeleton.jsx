import React from 'react';

const Skeleton = ({width, height}) => {
  return (
    <span className="skeleton" style={{width:`${width}`, height:`${height}`}}></span>
  )
}

export default Skeleton;