
// pages/index.js
import React from 'react';
import ListSurat from './pages/surat/List';
export default async function Home(){
      return (
          <div className='max-w-6xl mx-auto'>
            <h1 className='font-bold p-5 text-center text-4xl'>NGAJI SEK </h1>
            <hr className='mb-4'/>
            <div className='grid grid-cols-7 gap-3'>
                <ListSurat/>
                <div className='col-span-5'>
                  <div className='border h-full p-3'>
                      <div className='detail'>
                        <h2>Surat</h2>
                      </div>
                  </div>
                </div>
              
            </div>
          </div>
        );
}
  
