import fetch from "node-fetch";
import PDFDocument from "./pdfWrap.cjs";
import cache from "./cache.js";
import * as fs from 'fs';
import { convertManifest } from './pdiiif-lib/lib/esm/index.js';

import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// See https://github.com/vanda/cocktail
function v2Extract(manifest) {
  let canvases = [];
  for (const sequence of manifest["sequences"]) {
    let index = 0;
    for (const canvas of sequence["canvases"]) {
      let imageLabel = canvas["label"]["@value"]
        ? canvas["label"]["@value"]
        : canvas["label"];
      for (const image of canvas["images"]) {
        let imageUrl = image["resource"]["@id"];
        canvases.push({ id: canvas.id, imageUrl, imageLabel, imagePos: index + 1 });
      }
      index++;
    }
  }

  const id = manifest["@id"];
  const label = manifest["label"];

  return {
    id,
    label,
    provider: "Information not Available",
    canvases,
  };
}

function v3Extract(manifest) {
  let canvases = [];
  let index = 0;
  for (const item of manifest["items"]) {
    let imageLabel = "";

    if (
      item.hasOwnProperty("label") &&
      item["label"].hasOwnProperty("none") &&
      Array.isArray(item["label"]["none"])
    )
      imageLabel = item["label"]["none"][0];

    for (const itemDepth2 of item["items"]) {
      for (const itemDepth3 of itemDepth2["items"]) {
        if (
          itemDepth3.hasOwnProperty("body") &&
          itemDepth3["body"].hasOwnProperty("id")
        ) {
          let imageUrl = itemDepth3["body"]["id"];

          canvases.push({ id: item.id, imageUrl, imageLabel, imagePos: index + 1 });
        }
      }
    }
    index++;
  }

  const id = manifest["id"];
  const label = manifest["label"]["none"].toString();
  let provider = "Information not Available";

  if (
    manifest.hasOwnProperty("provider") &&
    Array.isArray(manifest["provider"])
  ) {
    let labels = "";
    for (let providerObj of manifest["provider"]) {
      if (providerObj.hasOwnProperty("label")) {
        let labelArray = [];
        for (let langKey in providerObj["label"]) {
          labelArray.push(providerObj["label"][langKey].join(", "));
        }
        labels += labelArray.join(", ") + " ";
      }
    }
    if (labels.length) provider = labels + " ";
  }

  return {
    id,
    label,
    provider,
    canvases,
  };
}

function getManifestVersion(manifest) {
  // V3 returns an array V2 is just a string
  let versionUrl = manifest["@context"];
  if (Array.isArray(versionUrl)) versionUrl = versionUrl[1];
  const match = versionUrl.match(/\/presentation\/([0-9]+)\//);
  let version = 0;
  if (match) {
    version = match[1];
  }
  return version;
}

// [ [start, end], [start], [start, end] ]
function extractCanvases(canvases, canvasPositionsArray) {
  let extractedCanvases = [];
  for (const subArray of canvasPositionsArray) {
    if (subArray.length === 2) {
      extractedCanvases = extractedCanvases.concat(
        canvases.slice(subArray[0], subArray[1] + 1).map(canvas => canvas.id)
      ); // non inclusive so + 1
    } else if (subArray.length === 1) {
      extractedCanvases.push(canvases[subArray[0]].id);
    }
  }
  return extractedCanvases;
}

async function generatePDF(
  id,
  label,
  provider,
  fileName,
  extractedCanvases,
  cacheName
) {


  let doc = new PDFDocument();

  doc
    .text("Manifest Information")
    .text("Id: " + id)
    .text("Label: " + label)
    .text("Provider: " + provider);

  // Get a reference to the Outline root
  const { outline } = doc;

  // Add a top-level bookmark
  const top = outline.addItem(fileName);

  let item = 1;
  for (const imageData of extractedCanvases) {
    doc.addPage();
    top.addItem(`${fileName}/${imageData.imagePos}`);
    try {
      const settings = { method: "Get", timeout: 8000000 };
      const response = await fetch(imageData.imageUrl, settings);
      const currentBuffer = Buffer.from(await response.arrayBuffer());
      const currentURI = `data:image/jpeg;base64,${currentBuffer.toString(
        "base64"
      )}`;
      doc
        .text("Label: " + imageData.imageLabel, 15, 15)
        .image(currentURI, 15, 30, {fit: [600, 700], align: 'center', valign: 'center'})
    } catch (e) {
      console.log("Error on: ", imageData);
      console.log(e);
      doc.text(
        "Label: " + imageData.imageLabel + " Error could not grab image data.",
        15,
        15
      );
    }
    const progress = Math.round((item / extractedCanvases.length) * 100)
    await cache.set(cacheName, { progress })
    item++
  }

  doc.end();

  return doc;
  //return  await getStream.buffer(doc)

}

const Cocktail = async (
  manifestURL,
  canvasPositionsArray,
  fileName,
  cacheName
) => {
  //"https://wellcomelibrary.org/iiif/b18035723/manifest";
  // https://iiif.wellcomecollection.org/presentation/v3/b18035723


  const settings = { method: "Get" };
  const res = await fetch(manifestURL, settings);
  const manifest = await res.json();

  // TODO fix in CAP
  delete manifest.provider;

  const version = getManifestVersion(manifest);
  let info = {};
  if (version === "2") {
    info = v2Extract(manifest);
  } else if (version === "3") {
    info = v3Extract(manifest);
  }

  
  if (info["canvases"].length) {
    let extractedCanvases = extractCanvases(
      info["canvases"],
      canvasPositionsArray
    );

  console.log("extractedCanvases", extractedCanvases)
   
  
  const webWritable = fs.createWriteStream(path.join(__dirname, `static/${cacheName}`));

  // Start the PDF generation
  const onProgress = status => {
    let count = parseInt(status.pagesWritten)
    const progress = Math.round((  count / extractedCanvases.length) * 100)
    cache.set(cacheName, { progress }).then(() => {
      console.log(`${extractedCanvases.length} -- ${cacheName} -- Pages Written: ${status.pagesWritten} -- Progress ${progress}%.`);
    })
  }

  await convertManifest(
    manifest,
    webWritable,
    {
      maxWidth: 1500,
      onProgress,
      filterCanvases: extractedCanvases
    });
  } else throw "No canvases to export";

  return
};

export default Cocktail;
