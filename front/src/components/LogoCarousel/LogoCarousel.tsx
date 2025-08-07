"use client";
import React from 'react';
import Image from 'next/image';

const LogoCarousel: React.FC = () => {
  const logos = [
    {
      src: '/carruselLogos/channels4_profile.jpg',
      alt: 'Partner Logo 1'
    },
    {
      src: '/carruselLogos/images.png',
      alt: 'Partner Logo 2'
    },
    {
      src: '/carruselLogos/logo.png',
      alt: 'Partner Logo 3'
    },
    {
      src: '/carruselLogos/banner1-small.png',
      alt: 'Partner Logo 4'
    },
    {
      src: '/carruselLogos/santafelogo.webp',
      alt: 'Partner Logo 5'
    }
  ];

  return (
    <>
      <style jsx global>{`
        @keyframes logoScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        
        .logo-scroll {
          animation: logoScroll 20s linear infinite;
          width: calc(100% * 3);
        }
        
        .logo-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
      
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              Colaboramos con
            </h3>
            <p className="text-gray-600">
              Organizaciones que confían en nuestra plataforma
            </p>
          </div>
          
          <div className="relative overflow-hidden">
            <div className="flex logo-scroll">
              {/* Primera serie de logos */}
              {logos.map((logo, index) => (
                <div
                  key={`first-${index}`}
                  className="flex-shrink-0 mx-8 flex items-center justify-center"
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={120}
                    height={80}
                    className="object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
              ))}
              
              {/* Segunda serie de logos (para efecto continuo) */}
              {logos.map((logo, index) => (
                <div
                  key={`second-${index}`}
                  className="flex-shrink-0 mx-8 flex items-center justify-center"
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={120}
                    height={80}
                    className="object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
              ))}
              
              {/* Tercera serie de logos (para efecto continuo) */}
              {logos.map((logo, index) => (
                <div
                  key={`third-${index}`}
                  className="flex-shrink-0 mx-8 flex items-center justify-center"
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={120}
                    height={80}
                    className="object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogoCarousel;