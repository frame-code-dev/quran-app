import ListSurat from '@/app/pages/surat/List';
import React from 'react';
// This function gets called at build time
// eslint-disable-next-line @next/next/no-async-client-component
async function getDetailSurat(nomor) {
  // Call an external API endpoint to get data
  const res = await fetch(`https://equran.id/api/v2/surat/${nomor}`);
  const data = await res.json();

  // By returning { props: { data } }, the Blog component
  // will receive `data` as a prop at build time
  return data.data;
}

export default async function SuratDetail({ params }) {
  const surat = await getDetailSurat(params.nomor)
  const audio = surat.audioFull;
  const reciters = {
    '01': 'Abdullah-Al-Juhany',
    '02': 'Abdul-Muhsin-Al-Qasim',
    '03': 'Abdurrahman-as-Sudais',
    '04': 'Ibrahim-Al-Dossari',
    '05': 'Misyari-Rasyid-Al-Afasi'
};
  console.log(audio);
    return (
      <div className='max-w-6xl mx-auto'>
        <h1 className='font-bold p-5 text-center'>Surat from Quran</h1>
        <div className='grid grid-cols-7 gap-3'>
            <ListSurat/>
            <div className='col-span-5'>
              <div className='border h-full p-3'>
                  <div className='detail'>
                  <div>
                      <h1 className='font-bold p-5 text-center'>{surat.namaLatin} ({surat.nama})</h1>
                      <div className='border p-5'>
                        <p><strong>Arti:</strong> {surat.arti}</p>
                        <p><strong>Jumlah Ayat:</strong> {surat.jumlahAyat}</p>
                        <p><strong>Tempat Turun:</strong> {surat.tempatTurun}</p>
                        <hr/>
                        <h4>Audio Playlist</h4>
                        <div className='grid grid-cols-3 gap-3'>
                          {Object.keys(surat.audioFull).map((key) => (
                              <div key={key} className='mb-4 border p-3'>
                                  <p className='text-center'><strong>{reciters[key]}</strong></p>
                                  <hr className='my-2'/>
                                  <audio className='w-full' controls >
                                      <source src={surat.audioFull[key]} type="audio/mpeg" />
                                      Your browser does not support the audio element.
                                  </audio>
                              </div>
                          ))}
                        </div>
                        <h2>Ayat:</h2>
                        {surat.ayat.map((ayat) => (
                            <>
                            <div className='flex flex-col p-2 gap-3'>
                              <div>
                                  <h4 className='text-lg font-bold'>{ayat.teksArab} </h4>
                                  <small className='text-xs italic'>{ayat.teksIndonesia}</small>
                              </div>
                              <hr/>
                              {/* <p key={ayat.nomorAyat}><strong>{ayat.nomorAyat}</strong>:
                              - </p> */}
                            </div>
                            </>
                        ))}
                      </div>
                  </div>
                  </div>
              </div>
            </div>
          
        </div>
      </div>
    )
}
