/* eslint-disable no-new-wrappers */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

/// PDF generation code
// FIXME: This is currently one hell of a mess, learning about PDF and coming up
// with good abstractions at the same time was too much of a challenge for me 🙈
import { flatten, isObject, padStart as pad } from 'lodash-es';
import dedent from 'dedent-js';
import { Manifest } from '@iiif/presentation-3';
import { Manifest as ManifestV2 } from '@iiif/presentation-2';

import {
  Metadata,
  PdfObject,
  PdfDictionary,
  makeRef,
  PdfArray,
  PdfRef,
  serialize,
  PdfValue,
  toUTF16BE,
  StructTreeEntry,
} from './common.js';
import { TocItem, textEncoder, randomData, tryDeflateStream } from './util.js';
import { ArrayReader, Writer } from '../io.js';
import PdfImage from './image.js';
import { PdfParser } from './parser.js';
import { OcrPage, OcrSpan } from '../ocr.js';
import pdiiifVersion from '../version.js';
import log from '../log.js';
import { CanvasImage, StartCanvasInfo } from '../download.js';
import { Annotation, CanvasInfo, getI18nValue } from '../iiif.js';
import {
  buildCentralFileDirectory,
  buildLocalZipHeader,
  CentralDirectoryFileSpec,
} from './pkzip.js';
import { crc32 } from '../util.js';
import { exportPdfAnnotation } from './annos.js';

const PRODUCER = `pdiiif v${pdiiifVersion}`;

/// If the font is 10 pts, nominal character width is 5 pts
const CHAR_WIDTH = 2;

/// Taken from tesseract@2d6f38eebf9a14d9fbe65d785f0d7bd898ff46cb, tessdata/pdf.ttf
/// Created by Ken Sharp
/// (C) Copyright 2011, Google Inc.
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
const FONTDATA = new Uint8Array([
  0, 1, 0, 0, 0, 10, 0, 128, 0, 3, 0, 32, 79, 83, 47, 50, 86, 222, 200, 148, 0,
  0, 1, 40, 0, 0, 0, 96, 99, 109, 97, 112, 0, 10, 0, 52, 0, 0, 1, 144, 0, 0, 0,
  30, 103, 108, 121, 102, 21, 34, 65, 36, 0, 0, 1, 184, 0, 0, 0, 24, 104, 101,
  97, 100, 11, 120, 241, 101, 0, 0, 0, 172, 0, 0, 0, 54, 104, 104, 101, 97, 12,
  2, 4, 2, 0, 0, 0, 228, 0, 0, 0, 36, 104, 109, 116, 120, 4, 0, 0, 0, 0, 0, 1,
  136, 0, 0, 0, 8, 108, 111, 99, 97, 0, 12, 0, 0, 0, 0, 1, 176, 0, 0, 0, 6, 109,
  97, 120, 112, 0, 4, 0, 5, 0, 0, 1, 8, 0, 0, 0, 32, 110, 97, 109, 101, 242,
  235, 22, 218, 0, 0, 1, 208, 0, 0, 0, 75, 112, 111, 115, 116, 0, 1, 0, 1, 0, 0,
  2, 28, 0, 0, 0, 32, 0, 1, 0, 0, 0, 1, 0, 0, 176, 148, 113, 16, 95, 15, 60,
  245, 4, 7, 8, 0, 0, 0, 0, 0, 207, 154, 252, 110, 0, 0, 0, 0, 212, 195, 167,
  242, 0, 0, 0, 0, 4, 0, 8, 0, 0, 0, 0, 16, 0, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0,
  8, 0, 255, 255, 0, 0, 4, 0, 0, 0, 0, 0, 4, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 2, 0, 1, 0, 0, 0, 2, 0, 4, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 1, 144, 0, 5, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 1, 0, 1, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 79, 79, 71, 0,
  64, 0, 0, 0, 0, 0, 1, 255, 255, 0, 0, 0, 1, 0, 1, 128, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 2, 0, 1, 0, 0, 0,
  0, 0, 20, 0, 3, 0, 0, 0, 0, 0, 20, 0, 6, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 12, 0, 0, 0, 1, 0, 0, 0, 0, 4, 0, 8, 0, 0, 3, 0, 0, 49, 33, 17, 33,
  4, 0, 252, 0, 8, 0, 0, 0, 0, 3, 0, 42, 0, 0, 0, 3, 0, 0, 0, 5, 0, 22, 0, 0, 0,
  1, 0, 0, 0, 0, 0, 5, 0, 11, 0, 22, 0, 3, 0, 1, 4, 9, 0, 5, 0, 22, 0, 0, 0, 86,
  0, 101, 0, 114, 0, 115, 0, 105, 0, 111, 0, 110, 0, 32, 0, 49, 0, 46, 0, 48,
  86, 101, 114, 115, 105, 111, 110, 32, 49, 46, 48, 0, 0, 1, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
]);

type ZipDummyObjectSpec = {
  filename: string;
  data: Uint8Array;
  deflatedData?: Uint8Array;
  bytesUntilActualData: number;
};

export type GeneratorParams = {
  // Writer to output the PDF to
  writer: Writer;
  // Metadata to include in the PDF
  metadata: Metadata;
  // Information about canvases included in the PDF
  canvasInfos: CanvasInfo[];
  // List of languages to use for rendering labels, in descending order of preference
  langPref: readonly string[];
  // Labels for pages, every position corresponds to the canvas in the same position
  pageLabels?: string[];
  // Outline tree for the PDF
  outline: TocItem[];
  // Whether the PDF should include a hidden text layer
  hasText?: boolean;
  // Reading direction of the PDF
  readingDirection?: 'right-to-left' | 'left-to-right';
  // Information about the canvas (or canvas region) that should be displayed initially
  initialCanvas?: StartCanvasInfo;
  // The manifest to build the PDF from
  manifestJson?: Manifest | ManifestV2;
  // If this is enabled, the PDF will also be a valid ZIP archive of all the resources
  // included in the PDF
  zipPolyglot?: boolean;
  // Base directory name for the polyglot ZIP archive, if not set the resources will be
  // top-level in the archive
  zipBaseDir?: string;
};

export default class PDFGenerator {
  // Keep track of how many bytes have been written so far
  _offset = 0;
  // PDF objects that are scheduled for writing, will be written on _flush()
  _objects: Array<PdfObject> = [];
  // Number of the next PDF object
  _nextObjNo = 1;
  // References to various central objects
  _objRefs: Record<string, PdfRef> = {};
  // Tracks offset of every XObject
  _offsets: number[] = [];
  // Writer used for outputting the PDF
  _writer: Writer | undefined;
  // Have we already started writing the IIIF pages?
  _pagesStarted = false;
  // Information about each canvas, needed for pre-allocating objects
  _canvasInfos: Array<CanvasInfo> = [];
  // Object number of the first page
  _firstPageObjectNum: number | undefined;
  // Labels for every page in the PDF
  _pageLabels?: string[];
  // Number of cover pages inserted at the beginning of the PDF
  _numCoverPages = 0;
  // PDF outline
  _outline: TocItem[] = [];
  // Is the PDF supposed to have a hidden text layer?
  _hasText = false;
  // List of top-level entries in the PDF's logical structure tree
  _strucTree: StructTreeEntry[] = [];
  // Maps a page's object number to the marked content sequence IDs its content
  // stream has
  _pageMCIds: Map<number, Array<number>> = new Map();
  // Identifier of the next structure parent entry
  _nextStructParentId = 0;
  // For every page, its corresponding parent ID for the parent tree
  _pageParentIds: Map<number, number> = new Map();
  // Language preference
  _langPref: readonly string[];
  _initialCanvas?: StartCanvasInfo;
  private _polyglot: boolean;
  private _manifestJson?: Manifest | ManifestV2;
  private _zipCatalog?: Array<CentralDirectoryFileSpec>;
  private _zipBaseDir?: string;
  private _readingDirection: 'right-to-left' | 'left-to-right';

  constructor({
    writer,
    metadata,
    canvasInfos,
    langPref,
    pageLabels,
    outline = [],
    readingDirection = 'left-to-right',
    hasText = false,
    initialCanvas,
    manifestJson,
    zipPolyglot = false,
    zipBaseDir,
  }: GeneratorParams) {
    this._writer = writer;
    this._canvasInfos = canvasInfos;
    this._pageLabels = pageLabels;
    this._outline = outline;
    this._hasText = hasText;
    this._readingDirection = readingDirection;
    this._langPref = langPref;
    this._initialCanvas = initialCanvas;
    this._polyglot = zipPolyglot;
    this._zipBaseDir = zipBaseDir;
    this._manifestJson = manifestJson;

    const pdfMetadata: PdfDictionary = {
      ...Object.entries(metadata)
        .filter((k, v) => v !== undefined)
        .reduce((prev, [k, v]) => {
          prev[k] = `(${v})`;
          return prev;
        }, {} as PdfDictionary),
      Producer: `(${PRODUCER})`,
    };
    this._addObject(pdfMetadata, 'Info');
  }

  async setup(): Promise<void> {
    const catalog: PdfDictionary = {
      Type: '/Catalog',
    };
    this._addObject(catalog, 'Catalog');

    const pagesObj = this._addObject(
      {
        Type: '/Pages',
        Count: this._canvasInfos.length,
      },
      'Pages'
    );
    catalog.Pages = makeRef(pagesObj);

    if (this._hasText) {
      catalog.MarkInfo = {
        Type: '/MarkInfo',
        Marked: true,
      };
    }

    if (this._outline.length > 0) {
      catalog.PageMode = '/UseOutlines';
      const outlines: PdfDictionary = {
        Type: '/Outlines',
        Count: 0,
      };
      const outlinesObj = this._addObject(outlines);
      catalog.Outlines = makeRef(outlinesObj);
      let prev: PdfObject | undefined;
      for (const [idx, itm] of this._outline.entries()) {
        const [childObj, numKids] = this._addOutline(itm, outlinesObj, prev);
        (outlines.Count as number) += 1 + numKids;
        if (idx === 0) {
          outlines.First = makeRef(childObj);
        } else if (idx === this._outline.length - 1) {
          outlines.Last = makeRef(childObj);
        }
        prev = childObj;
      }
    } else {
      catalog.PageMode = '/UseThumbs';
    }
    catalog.ViewerPreferences = {
      Direction: this._readingDirection === 'right-to-left' ? '/R2L' : '/L2R',
    };
    if (this._hasText) {
      await this._setupHiddenTextFont();
    }
  }

  async _setupHiddenTextFont(): Promise<void> {
    const typeZeroFont = this._addObject(
      {
        Type: '/Font',
        Subtype: '/Type0',
        BaseFont: '/GlyphLessFont',
        Encoding: '/Identity-H',
      },
      'Type0Font'
    );

    const typeTwoFont = this._addObject({
      type: '/Font',
      Subtype: '/CIDFontType2',
      BaseFont: '/GlyphLessFont',
      DW: 1000 / CHAR_WIDTH,
      CIDSystemInfo: {
        Ordering: '(Identity)',
        Registry: '(Adobe)',
        Supplement: 0,
      },
    });
    (typeZeroFont.data as PdfDictionary).DescendantFonts = [
      makeRef(typeTwoFont),
    ];

    const cidtoGidMapData = new Uint8Array(128 * 1024);
    for (let i = 0; i < cidtoGidMapData.length; i++) {
      cidtoGidMapData[i] = i % 2 ? 1 : 0;
    }
    const comp = await tryDeflateStream(cidtoGidMapData);
    const cidToGidMap = this._addObject(comp.dict, undefined, comp.stream);
    (typeTwoFont.data as PdfDictionary).CIDToGIDMap = makeRef(cidToGidMap);

    const cmapStream = dedent`
      /CIDInit /ProcSet findresource begin
        12 dict begin
        begincmap
            /CIDSystemInfo
            <<
              /Registry (Adobe)
              /Ordering (UCS)
              /Supplement 0
            >> def
            /CMapName /Adobe-Identify-UCS def
            /CMapType 2 def
            1 begincodespacerange
            <0000> <FFFF>
            endcodespacerange
            1 beginbfrange
            <0000> <FFFE> <0000>
            endbfrange
        endcmap
        CMapName currentdict /CMap defineresource pop
        end
    end`;
    const cmap = this._addObject(
      {
        Length: cmapStream.length,
      },
      undefined,
      cmapStream
    );
    (typeZeroFont.data as PdfDictionary).ToUnicode = makeRef(cmap);

    const fontDesc = this._addObject({
      Type: '/FontDescriptor',
      FontName: '/GlyphLessFont',
      FontBBox: [0, 0, 1000 / CHAR_WIDTH, 1000],
      Ascent: 1000,
      CapHeight: 1000,
      Descent: -1,
      Flags: 5,
      ItalicAngle: 0,
      StemV: 80,
    });
    (typeTwoFont.data as PdfDictionary).FontDescriptor = makeRef(fontDesc);

    const maybeCompressedFont = await tryDeflateStream(FONTDATA);
    const fontDataObj = this._addObject(
      {
        Length1: FONTDATA.length,
        ...maybeCompressedFont.dict,
      },
      undefined,
      maybeCompressedFont.stream
    );
    (fontDesc.data as PdfDictionary).FontFile2 = makeRef(fontDataObj);
  }

  _registerEmbeddedFilesInCatalog() {
    const catalog = this._objects[this._objRefs.Catalog.refObj]
      .data as PdfDictionary;
    const embeddedFiles: PdfArray = [
      `(manifest.json)`,
      makeRef(this._firstPageObjectNum! - (this._polyglot ? 3 : 2)),
    ];
    for (const [idx, canvas] of this._canvasInfos.entries()) {
      if (!canvas.ocr) {
        continue;
      }
      const pageObjNum = this.getCanvasObjectNumber(idx);
      // The file spec for embedded OCR file is the previous to last XObject for a given canvas
      let fileObjNum = pageObjNum + this.getObjectsPerCanvas(idx) - 2;
      if (this._polyglot) {
        // Except if the PDF is polyglot, then it's the second to last XObject
        fileObjNum -= 1;
      }
      embeddedFiles.push(`(${canvas.ocr.id})`);
      embeddedFiles.push(makeRef(fileObjNum));
    }
    if (!catalog.Names) {
      catalog.Names = {
        EmbeddedFiles: { Names: embeddedFiles },
      };
    } else {
      const names = catalog.Names as PdfDictionary;
      const nameTree = names.EmbeddedFiles as PdfDictionary;
      nameTree.Names = (nameTree.Names as PdfArray).concat(embeddedFiles);
    }
  }

  _addOutline(
    itm: TocItem,
    parent: PdfObject,
    prev?: PdfObject
  ): [PdfObject, number] {
    let dest: PdfArray;
    if (typeof itm.startCanvas === 'string') {
      const destCanvasIdx = this._canvasInfos.findIndex(
        (ci) => ci.canvas.id === itm.startCanvas
      );
      if (destCanvasIdx < 0) {
        throw Error(
          `Could not find canvas with id ${itm.startCanvas} in manifest!`
        );
      }
      dest = [destCanvasIdx, '/Fit'];
    } else {
      const canvasId = itm.startCanvas.id;
      const unitScale = 72 / itm.startCanvas.ppi;
      const rect = itm.startCanvas.position;
      const { width, height } = itm.startCanvas.dimensions;
      const destCanvasIdx = this._canvasInfos.findIndex(
        (ci) => ci.canvas.id === canvasId
      );
      if (destCanvasIdx < 0) {
        throw Error(`Could not find canvas with id ${canvasId} in manifest!`);
      }
      dest = [
        destCanvasIdx,
        '/FitR',
        // TODO: Thoroughly test that this is actually working!
        unitScale * rect.x, // left
        unitScale * rect.y, // bottom
        unitScale * (width - (rect.x + rect.width)), // right,
        unitScale * (height - (rect.y + rect.height)), // top,
      ];
    }
    const rec: PdfDictionary = {
      Title: `( ${itm.label} )`,
      Parent: makeRef(parent),
      // NOTE: The first entry is a number only during setup and will later be
      //       replaced with a reference to the actual page object, once we know
      //       how many objects are preceding the page objects.
      Dest: dest,
    };
    const obj = this._addObject(rec);
    if (prev) {
      rec.Prev = makeRef(prev);
      (prev.data as PdfDictionary).Next = makeRef(obj);
    }
    if (itm.children?.length) {
      let prev: PdfObject | undefined;
      rec.Count = 0;
      for (const [idx, child] of itm.children.entries()) {
        const [childObj, numChildren] = this._addOutline(child, obj, prev);
        if (idx === 0) {
          rec.First = makeRef(childObj);
        } else if (idx === itm.children.length - 1) {
          rec.Last = makeRef(childObj);
        }
        rec.Count = rec.Count + 1 + numChildren;
        prev = childObj;
      }
    }
    return [obj, (rec.Count as number) ?? 0];
  }

  _addObject(
    val: PdfValue,
    refName?: string,
    stream?: Uint8Array | string
  ): PdfObject {
    if (stream) {
      if (!isObject(val)) {
        throw new Error(
          'PDF Objects with a stream must have a dictionary as its value'
        );
      }
      if (!(val as PdfDictionary).Length) {
        (val as PdfDictionary).Length = stream.length;
      }
    }
    const obj = {
      num: this._nextObjNo,
      data: val,
      stream,
    };
    this._nextObjNo++;
    this._objects[obj.num] = obj;
    if (refName) {
      this._objRefs[refName] = makeRef(obj);
    }
    return obj;
  }

  /** Clone an object from a foreign PDF into the current PDF, adjusting
   *  the encountered indirect object references.
   */
  private async _transplantObject(
    parser: PdfParser,
    obj: PdfObject,
    seenObjects: Record<number, PdfRef> = {}
  ): Promise<PdfRef> {
    const handleValue = async (value: PdfValue): Promise<PdfValue> => {
      if (value instanceof PdfRef) {
        const o = await parser.resolveRef(value);
        if (o === undefined) {
          throw `Could not resolve reference to object '${value.refObj}'`;
        }
        // Check if we've already transplanted the object
        if (seenObjects[o.num]) {
          return seenObjects[o.num];
        }
        const objDict = o.data as PdfDictionary;
        const newObj = this._addObject(objDict, undefined, o.stream);
        const ref = new PdfRef(newObj.num);
        seenObjects[o.num] = ref;
        newObj.data = await handleValue(objDict);
        if (objDict.Type === '/Page') {
          // Redirect to our own Pages object
          (newObj.data as PdfDictionary).Parent = this._objRefs.Pages;
        }
        return ref;
      } else if (typeof value === 'string' && value[0] != '/') {
        return `(${value})`;
      } else if (Array.isArray(value)) {
        const out = [];
        for (const val of value) {
          out.push(await handleValue(val));
        }
        return out;
      } else if (typeof value === 'object' && value !== null) {
        const out: PdfDictionary = {};
        for (const [key, val] of Object.entries(value)) {
          // Ignore structure keys for now
          if (key === 'StructParent' || key === 'StructParents') {
            continue;
          }
          out[key] = await handleValue(val as PdfDictionary);
        }
        return out;
      }
      return value;
    };
    const ref = new PdfRef(obj.num);
    // TODO: Special case: if the object is a page, we need to check for
    //       a /StructParents key, check for the /StructTreeRoot key in
    //       the catalog, and then transplant that to our _strucTree
    //       and _pageMCIDs structures. Quite the handful!!
    //
    return (await handleValue(ref)) as PdfRef;
  }

  async insertCoverPages(pdfData: ArrayBuffer): Promise<void> {
    if (this._pagesStarted) {
      throw 'Cover pages must be inserted before writing the first regular page';
    }
    const reader = new ArrayReader(new Uint8Array(pdfData));
    const parser = await PdfParser.parse(reader);
    const pagesDict = this._objects[this._objRefs.Pages.refObj]
      .data as PdfDictionary;
    pagesDict.Kids = [];
    // TODO: Parse and transplant the section and parent trees from
    //       the catalog into our own structures.
    for await (const page of parser.pages()) {
      const dict = page.data as PdfDictionary;
      // Ignore associated structured content for now
      delete dict.StructParents;
      delete dict.Parent;
      const newPageRef = await this._transplantObject(parser, page);
      (pagesDict.Kids as PdfArray).push(newPageRef);
      (pagesDict.Count as number) += 1;
      this._numCoverPages += 1;
    }
    return;
  }

  private async _embedResource(
    id: string,
    filename: string,
    description: string,
    mimeType: string,
    data: string
  ) {
    // TODO: Add check that the file is actually pre-registered in
    //       the catalog!
    const fileSpec: PdfDictionary = {
      Type: '/Filespec',
      F: `(${filename})`,
      UF: toUTF16BE(filename),
      Desc: `(${description})`,
      EF: {
        F: makeRef(this._nextObjNo + (this._polyglot ? 2 : 1)),
      },
    };

    const maybeCompressed = await tryDeflateStream(data);
    const embeddedFile = {
      Type: '/EmbeddedFile',
      Subtype: `(${mimeType})`,
      ...maybeCompressed.dict,
    };

    this._addObject(fileSpec);
    if (this._polyglot) {
      let zipData: Uint8Array;
      if (typeof data === 'string') {
        zipData = textEncoder.encode(data);
      } else {
        zipData = data;
      }
      const extraDataLength = this._getSerializedSize(
        {
          num: this._nextObjNo + 2,
          data: { ...embeddedFile, ...maybeCompressed.dict },
          stream: maybeCompressed.stream,
        },
        true
      );
      this._insertZipHeaderDummyObject({
        filename,
        data: zipData,
        deflatedData: maybeCompressed.dict.Filter
          ? (maybeCompressed.stream as Uint8Array)
          : undefined,
        // 2 bytes zlib header of deflated data
        bytesUntilActualData: extraDataLength + 2,
      });
    }
    this._addObject(embeddedFile, undefined, maybeCompressed.stream);
  }

  private async _embedManifest(
    manifestJson: ManifestV2 | Manifest
  ): Promise<void> {
    let manifestMime = 'application/ld+json';
    if (Array.isArray(manifestJson['@context'])) {
      const manifestProfile = manifestJson['@context'].find((p) =>
        p.startsWith('http://iiif.io/api/presentation')
      );
      if (manifestProfile) {
        manifestMime += `;profile="${manifestProfile}"`;
      }
    } else if (manifestJson['@context']) {
      manifestMime += `;profile="${manifestJson['@context']}"`;
    }
    await this._embedResource(
      '@id' in manifestJson ? manifestJson['@id'] : manifestJson.id,
      'manifest.json',
      'IIIF Manifest this PDF is based on',
      manifestMime,
      JSON.stringify(manifestJson)
    );
  }

  async finalizePdfHeader(): Promise<void> {
    const catalog = this._objects[this._objRefs.Catalog.refObj]
      .data as PdfDictionary;

    // Create page tree with page labels
    if (this._pageLabels) {
      catalog.PageLabels = makeRef(
        this._addObject({
          Nums: flatten(
            this._pageLabels
              .map((label, idx) =>
                label
                  ? [idx + this._numCoverPages, { P: `( ${label} )` }]
                  : undefined
              )
              .filter((x) => x !== undefined) as PdfArray
          ),
        })
      );
    }

    const pagesObj = this._objects[this._objRefs.Pages.refObj];

    // Now that we know from which object number the pages start, we can set the
    // /Kids entry in the Pages object and update the outline destinations.
    const pageDict = pagesObj.data as PdfDictionary;
    if (!pageDict.Kids) {
      pageDict.Kids = [];
    }
    this._firstPageObjectNum = this._nextObjNo;
    if (this._manifestJson) {
      this._firstPageObjectNum += 2;
      if (this._polyglot) {
        this._firstPageObjectNum++;
      }
    }
    for (const [idx] of this._canvasInfos.entries()) {
      (pageDict.Kids as PdfArray).push(
        makeRef(this.getCanvasObjectNumber(idx))
      );
    }
    this._objects
      // Get ToC entry object, the first destination will be the canvas index
      .filter((obj) => (obj.data as PdfDictionary)?.Dest !== undefined)
      .forEach((obj: PdfObject) => {
        const dest = (obj.data as PdfDictionary).Dest as PdfArray;
        if (typeof dest[0] !== 'number') {
          return;
        }
        dest[0] = makeRef(this.getCanvasObjectNumber(dest[0]));
      });

    // Register the structural content tree root
    if (this._hasText) {
      catalog.StructTreeRoot = makeRef(
        this._nextObjNo + this.totalCanvasObjects
      );
    }

    if (this._canvasInfos.some((ci) => ci.images.some((i) => i.choiceState))) {
      // We're *very* explicit with the visibility of the various OCGs to
      // ensure as broad a viewer support as possible (especially pdf.js
      // needed it...)
      const initiallyEnabledOCGs: PdfRef[] = [];
      const initiallyDisabledOCGs: PdfRef[] = [];
      const allOCGs: PdfRef[] = [];
      const rbGroups: PdfRef[][] = [];
      for (const [canvasIdx, { images }] of this._canvasInfos.entries()) {
        const pageObjNum = this.getCanvasObjectNumber(canvasIdx);
        let ocgStart = pageObjNum + 2 + images.length;
        if (this._polyglot) {
          // Take 'dummy' objects for ZIP polyglot into account
          ocgStart += images.length;
        }
        let ocgIdx = 0;
        const rbGroup = [];
        for (const img of images) {
          if (!img.choiceState) {
            continue;
          }
          const ref = makeRef(ocgStart + ocgIdx);
          if (img.choiceState.enabled) {
            initiallyEnabledOCGs.push(ref);
          } else {
            initiallyDisabledOCGs.push(ref);
          }
          allOCGs.push(ref);
          rbGroup.push(ref);
          ocgIdx++;
        }
        rbGroups.push(rbGroup);
      }
      catalog.OCProperties = {
        OCGs: allOCGs,
        D: {
          BaseState: '/OFF',
          ON: initiallyEnabledOCGs,
          OFF: initiallyDisabledOCGs,
          RBGroups: rbGroups,
        },
      };
    }

    if (typeof this._initialCanvas === 'string') {
      catalog.OpenAction = [
        makeRef(
          this.getCanvasObjectNumber(
            this._canvasInfos.findIndex(
              (ci) => ci.canvas.id === this._initialCanvas
            )
          )
        ),
      ];
    } else if (this._initialCanvas) {
      const unitScale = 72 / this._initialCanvas.ppi;
      const rect = this._initialCanvas.position;
      const { width, height } = this._initialCanvas.dimensions;
      catalog.OpenAction = [
        makeRef(
          this.getCanvasObjectNumber(
            this._canvasInfos.findIndex(
              (ci) => ci.canvas.id === this._initialCanvas
            )
          )
        ),
        '/FitR',
        // TODO: Thoroughly test that this is actually working!
        unitScale * rect.x, // left
        unitScale * rect.y, // bottom
        unitScale * (width - (rect.x + rect.width)), // right,
        unitScale * (height - (rect.y + rect.height)), // top,
      ];
    }

    this._registerEmbeddedFilesInCatalog();

    await this._flush();

    if (this._manifestJson) {
      await this._embedManifest(this._manifestJson);
      await this._flush();
    }
  }

  async renderPage(
    canvasId: string,
    {
      width: canvasWidth,
      height: canvasHeight,
    }: { width: number; height: number },
    images: CanvasImage[],
    annotations: Annotation[],
    ocrText?: OcrPage,
    ppi = 300
  ): Promise<void> {
    if (!this._pagesStarted) {
      log.debug('Initial page, finalizing PDF header structures.');
      await this.finalizePdfHeader();
      this._pagesStarted = true;
    }
    // Factor to multiply pixels by to get equivalent PDF units (72 pdf units === 1 inch)
    const unitScale = 72 / ppi;
    const pageDict: PdfDictionary = {
      Type: '/Page',
      Parent: this._objRefs.Pages,
      MediaBox: [0, 0, unitScale * canvasWidth, unitScale * canvasHeight],
      Resources: {
        ProcSet: ['/PDF', '/Text', '/ImageB', '/ImageI', '/ImageC'],
      },
    };
    if (this._hasText) {
      pageDict.StructParents = this._nextStructParentId;
      this._pageParentIds.set(this._nextObjNo, this._nextStructParentId);
      this._nextStructParentId++;
    }
    if (ocrText && this._objRefs.Type0Font) {
      (pageDict.Resources as PdfDictionary).Font = {
        'f-0-0': this._objRefs.Type0Font,
      };
    }
    const page = this._addObject(pageDict);

    const contentOps: string[] = [];
    const optionalGroupIds: { [imgId: string]: string } = {};
    for (const [
      idx,
      { dimensions, location, isOptional },
    ] of images.entries()) {
      const drawWidth = unitScale * dimensions.width;
      const drawHeight = unitScale * dimensions.height;
      const drawX = unitScale * location.x;
      const drawY = unitScale * (canvasHeight - dimensions.height - location.y);
      const imageId = `/Im${idx + 1}`;

      if (isOptional) {
        const ocId = `/oc${Object.keys(optionalGroupIds).length + 1}`;
        optionalGroupIds[imageId] = ocId;
        contentOps.push(`/OC ${ocId} BDC`);
      }
      contentOps.push(`q ${drawWidth} 0 0 ${drawHeight} ${drawX} ${drawY} cm`);
      contentOps.push(`${imageId} Do`);
      contentOps.push('Q');
      if (isOptional) {
        contentOps.push('EMC');
      }
    }
    if (ocrText) {
      contentOps.push(this._renderOcrText(ocrText, unitScale));
    }
    log.debug('Trying to compress content stream.');
    const contentStreamComp = await tryDeflateStream(contentOps.join('\n'));
    const contentsObj = this._addObject(
      contentStreamComp.dict,
      undefined,
      contentStreamComp.stream
    );
    (page.data as PdfDictionary).Contents = makeRef(contentsObj);

    // Since we need the finalized page dictionary in order to determine
    // the offset for the the local zip header, we pre-generate all the
    // relevant information
    const imageObjectNums = [...images.keys()].map((idx) => {
      if (this._polyglot) {
        return this._nextObjNo + idx * 2 + 1;
      } else {
        return this._nextObjNo + idx;
      }
    });
    const optionalGroupObjectNums: { [imgId: string]: number } = {};
    if (images.some((i) => i.isOptional)) {
      for (const [idx, { isOptional }] of images.entries()) {
        const imageId = `/Im${idx + 1}`;
        if (!isOptional) {
          continue;
        }
        // FIXME: This is broken for the layers example!
        optionalGroupObjectNums[imageId] = imageObjectNums.slice(-1)[0] + idx + 1;
      }
    }
    const pageResources = (page.data as PdfDictionary)
      .Resources as PdfDictionary;
    const xObjects: PdfDictionary = {};
    const properties: PdfDictionary = {};
    for (const [idx, num] of imageObjectNums.entries()) {
      const imageId = `/Im${idx + 1}`;
      xObjects[imageId.substring(1)] = makeRef(num);
      const ocgNum = optionalGroupObjectNums[imageId];
      if (ocgNum !== undefined) {
        const ocgId = optionalGroupIds[imageId];
        properties[ocgId.substring(1)] = makeRef(ocgNum);
      }
    }
    pageResources.XObject = xObjects;
    if (Object.keys(properties).length > 0) {
      pageResources.Properties = properties;
    }

    log.debug('Creating image objects.');
    const canvasIdx = this._canvasInfos.findIndex(
      (ci) => ci.canvas.id === canvasId
    );
    for (const [imgIdx, { data }] of images.entries()) {
      const imageData = new Uint8Array(data!);
      const image = PdfImage.open(imageData);
      // TODO: Currently we only support JPEG, if we expand to other
      //       file types we need to consider multiple objects pe rimage
      const imageObj = image.toObjects(this._nextObjNo)[0];
      if (this._polyglot) {
        const imgPreambleSize = this._getSerializedSize(imageObj, true);
        const filename = `img/canvas-${canvasIdx}-${imgIdx}.jpg`;
        this._insertZipHeaderDummyObject({
          filename,
          data: imageData,
          bytesUntilActualData: imgPreambleSize,
        });
        imageObj.num = this._nextObjNo;
      }
      this._nextObjNo += 1;
      this._objects.push(imageObj);
    }

    if (images.some((i) => i.isOptional)) {
      log.debug('Creating optional content groups for page');
      for (const [
        idx,
        { isOptional, label, visibleByDefault },
      ] of images.entries()) {
        const imageId = `/Im${idx + 1}`;
        if (!isOptional) {
          continue;
        }
        optionalGroupObjectNums[imageId] = this._nextObjNo;
        this._addObject({
          Type: '/OCG',
          Name: label
            ? `(${getI18nValue(label, this._langPref, '/')})`
            : undefined,
          Intent: '/View',
          Usage: visibleByDefault ? '/ON' : '/OFF',
        } as PdfDictionary);
      }
    }

    if (ocrText?.markup) {
      const canvasIdx = this._canvasInfos.findIndex(
        (ci) => ci.canvas.id === canvasId
      );
      let filename = `ocr/canvas-${canvasIdx}`;
      if (ocrText.mimeType.indexOf('html') >= 0) {
        filename += '.html';
      } else {
        filename += '.xml';
      }

      await this._embedResource(
        ocrText.id,
        filename,
        `OCR for canvas #${canvasIdx}`,
        ocrText.mimeType,
        ocrText.markup
      );
    }

    // Add annotations, if present
    if (annotations && annotations.length > 0) {
      log.debug('Creating annotations for page');
      pageDict.Annots = annotations
        .flatMap((anno) => exportPdfAnnotation(anno, unitScale, canvasHeight))
        .map((pdfAnno) => makeRef(this._addObject(pdfAnno)));
    }

    // Write out all of the objects
    log.debug('Flushing data for page');
    await this._flush();
    log.debug('Finished rendering page');
  }

  /** Get PDF instructions to render a hidden text layer with the page's OCR.
   *
   * This owes *a lot* to Tesseract's PDF renderer[1] and the IA's `pdf-tools`[2]
   * that ported it to Python. Accordingly, the license of this method is Apache 2.0.
   *
   * [1] https://github.com/tesseract-ocr/tesseract/blob/5.0.0-beta-20210916/src/api/pdfrenderer.cpp
   * [2] https://github.com/internetarchive/archive-pdf-tools/blob/master/internetarchivepdf/pdfrenderer.py
   *
   *                            Apache License
   *                     Version 2.0, January 2004
   *                  http://www.apache.org/licenses/
   */
  _renderOcrText(ocr: OcrPage, unitScale: number): string {
    // TODO: Handle changes in writing direction!
    // TODO: Handle baselines, at least the simple ``cx+d` skewed-line-type, proper polyline support
    //       requires a per-character transformation matrix, which is a bit much for the current
    //       MVP-ish state
    const pageHeight = ocr.height;
    const ops: Array<string> = [];
    ops.push('BT'); // Begin text rendering
    ops.push('3 Tr'); // Use "invisible ink" (no fill, no stroke)
    const pageObjNum = this._nextObjNo - 1;
    let lineIdx = 0;
    if (ocr.blocks) {
      for (const block of ocr.blocks) {
        const blockEntry: StructTreeEntry = {
          type: 'Sect',
          children: [],
          pageObjNum,
          mcs: [],
        };
        for (const paragraph of block.paragraphs) {
          const paragraphEntry: StructTreeEntry = {
            type: 'P',
            children: [],
            pageObjNum,
            mcs: [],
          };
          for (const line of paragraph.lines) {
            ops.push(
              ...this.renderOcrLine(
                line,
                lineIdx,
                unitScale,
                pageHeight,
                pageObjNum
              )
            );
            paragraphEntry.children.push({
              type: 'Span',
              children: [],
              pageObjNum,
              mcs: [lineIdx],
            });
            lineIdx++;
          }
          blockEntry.children.push(paragraphEntry);
        }
        this._strucTree.push(blockEntry);
      }
    } else if (ocr.paragraphs) {
      for (const paragraph of ocr.paragraphs) {
        const paragraphEntry: StructTreeEntry = {
          type: 'P',
          children: [],
          pageObjNum,
          mcs: [],
        };
        for (const line of paragraph.lines) {
          ops.push(
            ...this.renderOcrLine(
              line,
              lineIdx,
              unitScale,
              pageHeight,
              pageObjNum
            )
          );
          paragraphEntry.children.push({
            type: 'Span',
            children: [],
            pageObjNum,
            mcs: [lineIdx],
          });
          lineIdx++;
        }
        this._strucTree.push(paragraphEntry);
      }
    } else if (ocr.lines) {
      for (const line of ocr.lines) {
        ops.push(
          ...this.renderOcrLine(
            line,
            lineIdx,
            unitScale,
            pageHeight,
            pageObjNum
          )
        );
        this._strucTree.push({
          type: 'Span',
          children: [],
          pageObjNum,
          mcs: [lineIdx],
        });
        lineIdx++;
      }
    }
    ops.push('ET');
    return ops.join('\n');
  }

  renderOcrLine(
    line: OcrSpan,
    lineIdx: number,
    unitScale: number,
    pageHeight: number,
    pageObjNum: number
  ): string[] {
    const fontRef = '/f-0-0';
    const scaleX = 1;
    const scaleY = 1;
    const shearX = 0;
    const shearY = 0;
    const ops: Array<string> = [];
    // Begin of marked content sequence that wraps the line in a Span
    ops.push(`/Span << /MCID ${lineIdx} >> BDC`);
    // Approximated font size for western scripts, PDF font size is specified in multiples of
    // 'user units', which default to 1/72inch. The `userScale` gives us the units per pixel.
    const fontSize = line.height * unitScale * 0.75;
    //const fontSize = 8; // TODO: This is what Tesseract uses, why does this work?
    ops.push(`${fontRef} ${fontSize} Tf`);
    // We use a text matrix for every line. Tesseract uses a per-paragraph matrix, but we don't
    // neccesarily have block/paragraph information available, so we'll use the next-closest
    // thing. This means that every word on the line is positioned relative to the line, not
    // relative to the page as in the markup.
    const xPos = line.x * unitScale;
    const lineY = pageHeight - line.y - line.height * 0.75;
    const yPos = lineY * unitScale;
    ops.push(`${scaleX} ${shearX} ${shearY} ${scaleY} ${xPos} ${yPos} Tm`);
    let xOld = 0;
    let yOld = 0;
    for (const word of line.spans) {
      if (!word.text) {
        continue;
      }
      if (word.isExtra || !word.width) {
        // TODO: What to do if word.isExtra?
        continue;
      }
      // Position drawing with relative moveto
      const wordX = (word.x - line.x) * unitScale;
      // Convert beween different y-origins in OCR and PDF
      const wordYAbsolute = pageHeight - word.y - word.height * 0.75;
      const wordY = (wordYAbsolute - lineY) * unitScale;
      const wordWidth = word.width * unitScale;
      const wordHeight = word.height * unitScale;
      const dx = wordX - xOld;
      const dy = wordY - yOld;
      ops.push(`${dx * scaleX + dy * shearX} ${dx * shearY + dy * scaleY} Td`);
      xOld = wordX;
      yOld = wordY;
      // Calculate horizontal stretch
      // TODO: This is ripped straight from Tesseract, I have no clue what it does
      // FIXME: The end of the line seems to be too far to the left sometimes,
      // while the start seems to match
      const wordLength = Math.pow(
        Math.pow(wordWidth, 2) + Math.pow(wordHeight, 2),
        0.5
      );
      const pdfWordLen = word.text.length;
      ops.push(
        `${CHAR_WIDTH * ((100 * wordLength) / (fontSize * pdfWordLen))} Tz`
      );
      // TODO: Account for trailing space in width calculation to prevent readers
      //       from inserting a line break
      const textBytes = serialize(toUTF16BE(word.text + ' ', false));
      ops.push(`[ ${textBytes} ] TJ`);
    }
    ops.push('EMC');
    // Add a newline to visually group together all statements belonging to a line
    ops.push('');
    if (!this._pageMCIds.has(pageObjNum)) {
      this._pageMCIds.set(pageObjNum, []);
    }
    this._pageMCIds.get(pageObjNum)!.push(lineIdx);
    return ops;
  }

  get bytesWritten(): number {
    return this._offset;
  }

  /** Number of objects needed to render all canvases */
  get totalCanvasObjects(): number {
    // Every canvas needs 1 object per image, 1 for the content stream and 1 for the page definition.
    return this._canvasInfos.reduce(
      (sum, _, idx) => sum + this.getCanvasObjectNumber(idx),
      0
    );
  }

  getObjectsPerCanvas(canvasIdx: number): number {
    const { images, ocr, numAnnotations } = this._canvasInfos[canvasIdx];
    let numObjects =
      // 1 XObject per image
      images.length +
      // Page dictionary and content
      2 + 
      // 1 Optional Content Group per optional image
      images.filter((i) => i.choiceState !== undefined).length +
      // 1 XObject per annotation
      numAnnotations;
    if (this._polyglot) {
      // For a polyglot PDF, we need to precede every XObject that we'd like
      // to expose as a file in the ZIP with a separate XObject that contains
      // the local ZIP header for that file. Currently this concerns the
      // images and the OCR data
      numObjects = numObjects + images.length + (ocr ? 1 : 0);
    }
    if (ocr) {
      numObjects += 2;
    }
    return numObjects;
  }

  getCanvasObjectNumber(canvasIdx: number): number {
    let num = this._firstPageObjectNum!;
    for (const [idx] of this._canvasInfos.entries()) {
      if (idx === canvasIdx) {
        return num;
      }
      num += this.getObjectsPerCanvas(idx);
    }
    throw new Error(`Canvas #${canvasIdx} not found.`);
  }

  async _flush(): Promise<void> {
    if (this._offsets.length === 0) {
      log.debug('Writing PDF header');
      await this._write(`%PDF-1.5\n%\xde\xad\xbe\xef\n`);
    }
    for (const obj of this._objects) {
      if (!obj) {
        continue;
      }
      log.debug(`Serializing object #${obj.num}`);
      await this._serializeObject(obj);
    }
    this._objects = [];
  }

  _getSerializedSize(
    { num, data, stream }: PdfObject,
    untilStreamStart = false
  ): number {
    let size = 0;
    size += `${num} 0 obj\n`.length;

    if (data) {
      size += serialize(data).length;
    }
    if (stream) {
      size += '\nstream\n'.length;
      if (untilStreamStart) {
        return size;
      }
      if (typeof stream === 'string') {
        size += textEncoder.encode(stream).byteLength;
      } else {
        size += stream.byteLength;
      }
      size += '\nendstream'.length;
    }
    size += '\nendobj\n'.length;
    return size;
  }

  async _serializeObject(obj: PdfObject): Promise<void> {
    this._offsets.push(this._offset);
    const { num, data, stream } = obj;
    await this._write(`${num} 0 obj\n`);
    if (data) {
      await this._write(serialize(data));
    }
    if (stream) {
      await this._write('\nstream\n');
      await this._write(stream);
      await this._write('\nendstream');
    }
    await this._write('\nendobj\n');
  }

  async _write(data: Uint8Array | string): Promise<void> {
    if (this._writer === undefined) {
      throw new Error(
        'Cannot perform mutating operations on an already closed PDFGenerator.'
      );
    }
    if (typeof data === 'string') {
      data = textEncoder.encode(data);
    }
    this._offset += data.byteLength;
    await this._writer.write(data);
  }

  async _writeStructureTree(): Promise<void> {
    const parentRoot: PdfDictionary = {
      Nums: [],
    };
    const parentRootRef = makeRef(this._addObject(parentRoot));
    const root: PdfDictionary = {
      Type: '/StructTreeRoot',
      K: [],
      ParentTree: parentRootRef,
      ParentTreeNextKey: this._nextStructParentId,
    };
    const pageParents: Map<number, Array<PdfRef>> = new Map();
    const rootRef = makeRef(this._addObject(root));
    const visitEntry = async (
      entry: StructTreeEntry,
      parent: PdfDictionary,
      parentRef: PdfRef
    ): Promise<void> => {
      const obj: PdfDictionary = {
        Type: '/StructElem',
        S: `/${entry.type}`,
        P: parentRef,
        Pg: makeRef(entry.pageObjNum),
        K: [],
      };
      if (!pageParents.has(entry.pageObjNum)) {
        pageParents.set(entry.pageObjNum, []);
      }
      const objRef = makeRef(this._addObject(obj));
      (parent.K as PdfRef[]).push(objRef);
      if (entry.children.length > 0) {
        for (const i of entry.children) {
          await visitEntry(i, obj, objRef);
        }
      } else if (entry.mcs.length == 1) {
        obj.K = entry.mcs[0];
      } else if (entry.mcs.length > 0) {
        obj.K = entry.mcs;
      }
      if (entry.mcs.length > 0) {
        const parents = pageParents.get(entry.pageObjNum)!;
        for (const mcId of entry.mcs) {
          parents[mcId] = objRef;
        }
      }
      if (this._objects.length > 1000) {
        await this._flush();
      }
    };
    for (const i of this._strucTree) {
      await visitEntry(i, root, rootRef);
    }
    for (const [pageObjNum, parents] of pageParents) {
      const pidx = this._pageParentIds.get(pageObjNum)!;
      (parentRoot.Nums as PdfArray).push(
        pidx,
        makeRef(this._addObject(parents))
      );
    }
    await this._flush();
  }

  async end(): Promise<void> {
    if (!this._writer) {
      return;
    }
    /* FIXME: Disabled due to poor performance on large volumes and a strange
     *        interaction with streamsaver, where the PDF would be prematurely
     *        closed in the middle of writing out the structure tree.
    console.debug("Writing structure tree");
    if (this._strucTree.length > 0) {
      await this._writeStructureTree();
    }
    */
    log.debug('Writing xref table');
    type XrefEntry = [number, number, 'f' | 'n'];
    const xrefEntries: Array<XrefEntry> = [
      [0, 65535, 'f'],
      ...this._offsets.map((offset): XrefEntry => [offset, 0, 'n']),
    ];
    const xRefTable = xrefEntries
      .map(([off, gen, free]) =>
        [
          pad(off.toString(10), 10, '0'),
          pad(gen.toString(10), 5, '0'),
          free,
          '',
        ].join(' ')
      )
      .join('\n');
    const xrefOffset = this._offset;
    await this._write(`xref\n0 ${xrefEntries.length}\n${xRefTable}`);
    const trailerDict: PdfDictionary = {
      Size: xrefEntries.length,
      Root: this._objRefs.Catalog,
      Info: this._objRefs.Info,
      ID: [randomData(32), randomData(32)],
    };
    const trailer = [
      `\ntrailer\n${serialize(trailerDict)}`,
      `\nstartxref\n${xrefOffset}\n%%EOF`,
    ].join('');
    if (this._polyglot && this._zipCatalog) {
      log.debug('Writing zip end of central directory');
      await this._write(
        buildCentralFileDirectory({
          files: this._zipCatalog,
          trailingLength: trailer.length,
          offset: this._offset,
        })
      );
    }
    await this._flush();
    log.debug('Writing trailer');
    await this._write(trailer);
    log.debug('Flushing');
    await this._flush();
    // FIXME: Never resolves on Node.js, is it really
    // needed in browsers?
    //log.debug('Waiting for drainage');
    //await this._writer.waitForDrain();
    log.debug('PDF finished, closing writer');
    await this._writer.close();
    log.debug('Writer closed');
    this._writer = undefined;
  }

  private _insertZipHeaderDummyObject({
    filename,
    data,
    deflatedData,
    bytesUntilActualData,
  }: ZipDummyObjectSpec): void {
    if (this._zipBaseDir) {
      filename = `${this._zipBaseDir}/${filename}`;
    }
    const zipObjOffset =
      this._offset +
      this._objects.reduce((acc, obj) => acc + this._getSerializedSize(obj), 0);
    const creationDate = new Date();
    bytesUntilActualData += '\nendstream\nendobj\n'.length;
    const zipObj = this._addObject(
      {},
      undefined,
      buildLocalZipHeader({
        filename,
        data,
        compressedData: deflatedData,
        extraDataLength: bytesUntilActualData,
        creationDate,
      })
    );
    const localHeaderOffset =
      zipObjOffset + this._getSerializedSize(zipObj, true);
    if (!this._zipCatalog) {
      this._zipCatalog = [];
    }
    this._zipCatalog.push({
      localHeaderOffset,
      deflated: deflatedData?.length !== data.length,
      creationDate: new Date(),
      crc32: crc32(data),
      dataLength: data.length,
      // skip 2 bytes for zlib header
      compressedDataLength: deflatedData
        ? deflatedData.length - 2
        : data.length,
      filename,
    });
  }
}
