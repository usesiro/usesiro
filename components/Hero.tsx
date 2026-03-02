"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Hero() {
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [delta, setDelta] = useState(150);

  const toRotate = [ "Without Stress.", "Automatically.", "With Confidence." ];
  const period = 2000;

  useEffect(() => {
    let ticker = setInterval(() => {
      tick();
    }, delta);

    return () => clearInterval(ticker);
  }, [text, delta]);

  const tick = () => {
    let i = loopNum % toRotate.length;
    let fullText = toRotate[i];
    let updatedText = isDeleting 
      ? fullText.substring(0, text.length - 1) 
      : fullText.substring(0, text.length + 1);

    setText(updatedText);

    if (isDeleting) {
      setDelta(prevDelta => prevDelta / 2);
    }

    if (!isDeleting && updatedText === fullText) {
      setIsDeleting(true);
      setDelta(period);
    } else if (isDeleting && updatedText === "") {
      setIsDeleting(false);
      setLoopNum(loopNum + 1);
      setDelta(150);
    }
  };

  return (
    // Added overflow-hidden to prevent scrollbars during side animations
    <section id="home" className="pt-32 pb-16 md:pt-40 md:pb-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* --- TEXT SECTION ANIMATION --- */}
        <div data-aos="fade-up" data-aos-duration="800">
          <h1 className="text-4xl md:text-6xl font-semibold text-dark tracking-tight mb-6 leading-[1.15]">
            Automate Your Records.<br className="hidden md:block" />
            <span className="block mt-2">
              Be Tax-Ready{" "}
              <span className="text-primary">
                {text}
                <span className="animate-pulse">|</span>
              </span>
            </span>
          </h1>

          <p className="mt-5 max-w-2xl mx-auto text-lg text-gray-500 leading-relaxed font-normal">
            Track income and expenses automatically. Know exactly where your 
            business stands without spreadsheets, guesswork, or last-minute panic.
          </p>
        </div>

        {/* --- BUTTONS ANIMATION (Delayed slightly) --- */}
        <div 
          className="mt-8 flex flex-col sm:flex-row justify-center gap-4"
          data-aos="fade-up" 
          data-aos-delay="200"
          data-aos-duration="800"
        >
          <button className="px-8 py-3 bg-primary text-white rounded-lg font-medium text-lg hover:bg-blue-700 transition">
            Get Started
          </button>
          
          <button className="px-8 py-3 bg-white text-primary border border-primary/20 rounded-lg font-medium text-lg hover:bg-blue-50 transition">
            Book a Demo
          </button>
        </div>

        {/* --- DASHBOARD IMAGES ANIMATION --- */}
        <div className="mt-16 relative mx-auto max-w-6xl flex flex-col md:flex-row justify-center items-center md:items-end gap-6 md:gap-2">
          
          {/* Desktop Image - Fades up from the bottom */}
          <div 
            className="w-full md:w-[75%] z-10"
            data-aos="fade-up" 
            data-aos-delay="400"
            data-aos-duration="1000"
          >
             <Image 
               src="/desktop-hero.png" 
               alt="Siro Desktop Dashboard" 
               width={1200} 
               height={850}
               priority 
               unoptimized 
               className="w-full h-auto object-contain"
             />
          </div>

          {/* Mobile Image - Slides in from the right slightly after the desktop */}
          <div 
            className="w-[50%] sm:w-[40%] md:w-[22%] z-20 md:-ml-10 mb-4 md:mb-0"
            data-aos="fade-left" 
            data-aos-delay="700"
            data-aos-duration="1000"
          >
             <Image 
               src="/mobile-hero.png" 
               alt="Siro Mobile Interface" 
               width={400} 
               height={850}
               priority 
               unoptimized 
               className="w-full h-auto object-contain drop-shadow-2xl"
             />
          </div>

        </div>

      </div>
    </section>
  );
}