import { useState, useEffect } from 'react'

const useMobile = () => {
  const [isMobile, setMobileMode] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1);
  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
    }
  }, [])

  const resize = () => {
    if (window.innerWidth <= 660) setMobileMode(true)
    else setMobileMode(false)
    setWindowWidth(window.innerWidth)
  }
  return { isMobile, windowWidth };
}

export default useMobile; 