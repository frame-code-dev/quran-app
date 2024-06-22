
// pages/index.js
import React from 'react';
import SuratList from '@/app/components/SuratList';

// This function gets called at build time
async function getStaticProps() {
  // Call an external API endpoint to get data
  const res = await fetch('https://equran.id/api/v2/surat');
  const data = await res.json();

  // By returning { props: { data } }, the Blog component
  // will receive `data` as a prop at build time
  return data;
}

export default async function ListSurat(){
      const data = await getStaticProps()
      return (
            <div className='col-span-7 border p-3'>
                <div className='w-fit overflow-x-auto grid md:grid-cols-3'>
                    {data.data.map((surat) => (
                        <SuratList 
                            key={surat.nomor} 
                            surat={surat}
                        ></SuratList>
                    ))}

                </div>
            </div>
          
        );
}
  
