import { useLayoutEffect, useRef } from "react";
import { cloudLoadingAnimation } from "../animations";
import { masterTL } from "../LandingPage";

function CloudLoadingOverlay() {
  const container = useRef(null)
  useLayoutEffect(() => {
    const cleanUp = cloudLoadingAnimation(container.current, masterTL);
    return cleanUp;
  }, [])

  return (
    <div ref={container} className='w-screen h-screen fixed z-50 pointer-events-none overflow-hidden'>
      <img className='cloudLoader1 absolute scale-200 top-0 left-0 w-full object-cover h-full z-20' src='assets/cloud1.png'></img>
      <img className='cloudLoader2 absolute scale-200 top-0 left-0 w-full object-cover h-full z-20' src='assets/cloud2.png'></img>
      <div className='cloudLoaderBG absolute top-0 left-0 w-full h-full bg-[var(--navy)] z-10'></div>
    </div>
  )
}

export default CloudLoadingOverlay;