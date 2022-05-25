import fetch from 'node-fetch'
import PDFDocument from './pdfWrap.cjs'
import fs from 'fs';
import imageDataURI from 'image-data-uri'

function v2Extract (manifest) {
  let canvases = []
  for( const sequence of manifest['sequences'] ) {
    let index = 0;
    for( const canvas of sequence['canvases'] ) {
      let imageLabel = canvas['label']['@value'] ? canvas['label']['@value'] : canvas['label']
      for(const image of canvas['images'] ) {
        let imageUrl = image['resource']['@id']
        canvases.push({imageUrl, imageLabel, imagePos : index + 1 })
      }
      index++;
    }
  }
  return canvases
}

function v3Extract (manifest) {
  let canvases = []
  let index = 0;
  for( const item of manifest['items'] ) {
    let imageLabel = item['label']['@none'][0]
    for( const itemDepth2 of item['items'] ) {
      for( const itemDepth3 of itemDepth2['items'] ) {
       let imageUrl = itemDepth3['body']['id']
       canvases.push({imageUrl, imageLabel, imagePos: index + 1})
      }
    }
    index++;
   }
  return canvases
}

function getManifestVersion (manifest) {
  // V3 returns an array V2 is just a string
  let versionUrl = manifest['@context']
  if(Array.isArray(versionUrl)) versionUrl = versionUrl[1] 
  const match = versionUrl.match(/\/presentation\/([0-9]+)\//);
  let version = 0;
  if (match) {
      version = match[1];
  }
  return version
}

// [ [start, end], [start], [start, end] ]
function extractCanvases(canvases, canvasPositionsArray) {
  let extractedCanvases = [];
  for( const subArray of canvasPositionsArray) {
    if(subArray.length === 2) {
      extractedCanvases = extractedCanvases.concat(canvases.slice(subArray[0], subArray[1] + 1)) // non inclusive so +1
    } else if (subArray.length === 1) {
      extractedCanvases.push(canvases[subArray[0]])
    }
  }
  return extractedCanvases
}

async function generatePDF (fileName, extractedCanvases) {

  let doc = new PDFDocument

  // Get a reference to the Outline root
  const { outline } = doc;

  // Add a top-level bookmark
  const top = outline.addItem(fileName);

  for( const imageData of extractedCanvases) {
    // Add a sub-section
    top.addItem(`${fileName}/${imageData.imagePos}`);

    let currentURI = await imageDataURI.encodeFromURL(imageData.imageUrl);

    console.log(imageData.imageUrl)
    doc
    .text("Label: " + imageData.imageLabel, 0, 0)
    .moveDown()
    .image(currentURI, 0, 15, {width: 500})
    .moveDown()
    .addPage()
  }

  doc.pipe(fs.createWriteStream(`${fileName}.pdf`));
  doc.end();
}

const Cocktail = async (manifestURL, canvasPositionsArray, fileName) => { 
  manifestURL = "https://wellcomelibrary.org/iiif/b18035723/manifest";
  // https://iiif.wellcomecollection.org/presentation/v3/b18035723

  const settings = { method: "Get" }
  const res = await fetch(manifestURL, settings)
  const manifest = await res.json()
  
  const version = getManifestVersion(manifest)
  let canvases = []
  if(version === "2") {
    canvases = v2Extract(manifest);
  } else if (version === "3" ) {
    canvases = v3Extract(manifest);
  }

  if(canvases.length) {
   let extractedCanvases = extractCanvases(canvases, canvasPositionsArray);
   await generatePDF(fileName, extractedCanvases)
  } else throw "No canvases to export"
}

export default Cocktail;