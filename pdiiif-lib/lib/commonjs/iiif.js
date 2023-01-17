"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCompatibility = exports.parseAnnotation = exports.getCanvasInfo = exports.getCanvasAnnotations = exports.fetchFullImageService = exports.supportsScaling = exports.isPhysicalDimensionService = exports.isExternalWebResourceWithProfile = exports.getThumbnail = exports.extractChoices = exports.getAllPaintingAnnotations = exports.getPaintables = exports.getI18nValue = exports.vault = void 0;
const tslib_1 = require("tslib");
const cross_fetch_1 = tslib_1.__importDefault(require("cross-fetch"));
const vault_helpers_1 = require("@iiif/vault-helpers");
const iiif_image_api_1 = require("@atlas-viewer/iiif-image-api");
const vault_1 = require("@iiif/vault");
const ocr_js_1 = require("./ocr.js");
const PURPOSE_ORDER = ['commenting', 'describing', 'tagging', 'no-purpose'];
const PURPOSE_LABELS = {
    commenting: 'Comment',
    describing: 'Description',
    tagging: 'Tags',
};
exports.vault = (0, vault_1.globalVault)();
function getI18nValue(val, languagePreference, separator) {
    var _a;
    let splitAfter = false;
    if (!separator) {
        separator = '<<<SNIP>>>';
        splitAfter = true;
    }
    const localized = (0, vault_helpers_1.buildLocaleString)(val, (_a = languagePreference[0]) !== null && _a !== void 0 ? _a : 'none', {
        defaultText: '',
        fallbackLanguages: languagePreference.slice(1),
        separator,
    });
    if (splitAfter) {
        return localized.split(separator).filter((s) => s.length > 0);
    }
    else {
        return localized;
    }
}
exports.getI18nValue = getI18nValue;
class ImageServiceLoader extends iiif_image_api_1.ImageServiceLoader {
    fetch(input, init) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return (0, cross_fetch_1.default)(input, init);
        });
    }
}
// FIXME: Remove type hints once vault-helpers has had a release
const thumbHelper = (0, vault_helpers_1.createThumbnailHelper)(exports.vault, {
    imageServiceLoader: new ImageServiceLoader(),
});
_a = (0, vault_helpers_1.createPaintingAnnotationsHelper)(exports.vault), exports.getPaintables = _a.getPaintables, exports.getAllPaintingAnnotations = _a.getAllPaintingAnnotations, exports.extractChoices = _a.extractChoices;
function getThumbnail(manifest, maxDimension) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const thumb = yield thumbHelper.getBestThumbnailAtSize(manifest, {
            maxWidth: maxDimension,
            maxHeight: maxDimension,
        });
        return (_a = thumb.best) === null || _a === void 0 ? void 0 : _a.id;
    });
}
exports.getThumbnail = getThumbnail;
function isExternalWebResourceWithProfile(res) {
    return (res.type !== undefined &&
        ['Dataset', 'Image', 'Video', 'Sound', 'Text', 'unknown'].indexOf(res.type) >= 0 &&
        res.profile !== undefined);
}
exports.isExternalWebResourceWithProfile = isExternalWebResourceWithProfile;
function isPhysicalDimensionService(service // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
) {
    return (typeof service.profile === 'string' &&
        service.profile === 'http://iiif.io/api/annex/services/physdim');
}
exports.isPhysicalDimensionService = isPhysicalDimensionService;
function supportsScaling(profile) {
    var _a, _b;
    if (typeof profile === 'string') {
        return profile.indexOf('level2') >= 0;
    }
    else {
        return ((_b = (_a = profile.supports) === null || _a === void 0 ? void 0 : _a.indexOf('sizeByWh')) !== null && _b !== void 0 ? _b : -1) >= 0;
    }
}
exports.supportsScaling = supportsScaling;
function fetchFullImageService(serviceRef) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const serviceUrl = `${(_a = serviceRef['@id']) !== null && _a !== void 0 ? _a : serviceRef.id}/info.json`;
        const resp = yield (0, cross_fetch_1.default)(serviceUrl);
        const res = yield resp.json();
        return res;
    });
}
exports.fetchFullImageService = fetchFullImageService;
function getCanvasAnnotations(canvas) {
    return exports.vault
        .get(canvas.annotations)
        .flatMap((p) => exports.vault.get(p.items))
        .filter((a) => {
        var _a;
        return Array.isArray(a.motivation)
            ? a.motivation.find((m) => PURPOSE_LABELS[m] !== undefined) !==
                undefined
            : PURPOSE_LABELS[(_a = a.motivation) !== null && _a !== void 0 ? _a : 'invalid'] !== undefined;
    })
        .map((a) => parseAnnotation(a, []))
        .filter((a) => a !== undefined);
}
exports.getCanvasAnnotations = getCanvasAnnotations;
function getCanvasInfo(canvas) {
    var _a, _b, _c, _d;
    const paintables = (0, exports.getPaintables)(canvas);
    // FIXME: complex choices are currently untested
    const choiceImageIds = (_c = (_b = (_a = paintables.choice) === null || _a === void 0 ? void 0 : _a.items) === null || _b === void 0 ? void 0 : _b.flatMap((i) => {
        if ('items' in i) {
            return i.items;
        }
        else {
            return [i];
        }
    }).map((i) => i.id)) !== null && _c !== void 0 ? _c : [];
    const images = paintables.items
        .filter((p) => p.type === 'image')
        .filter((p) => p.resource.id !== undefined &&
        (choiceImageIds === null || choiceImageIds === void 0 ? void 0 : choiceImageIds.indexOf(p.resource.id)) < 0)
        .map((i) => ({
        img: {
            id: i.resource.id,
            type: 'ContentResource',
        },
        isOptional: false,
    }));
    // TODO: Add support for complex choices?
    if (((_d = paintables.choice) === null || _d === void 0 ? void 0 : _d.type) === 'single-choice') {
        const choice = paintables.choice;
        for (const itm of choice.items) {
            const res = exports.vault.get(itm.id);
            if (res.type !== 'Image') {
                continue;
            }
            images.push({
                img: { id: itm.id, type: 'ContentResource' },
                choiceState: { enabled: itm.selected },
                label: itm.label,
            });
        }
    }
    const text = (0, ocr_js_1.getTextSeeAlso)(canvas);
    return {
        canvas: { id: canvas.id, type: 'Canvas' },
        images,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ocr: text ? { id: text.id } : undefined,
        numAnnotations: getCanvasAnnotations(canvas).length,
    };
}
exports.getCanvasInfo = getCanvasInfo;
function agentToString(agent) {
    var _a;
    let name = Array.isArray(agent.name) ? agent.name.join('; ') : agent.name;
    if (!name) {
        name = (_a = agent.nickname) !== null && _a !== void 0 ? _a : 'unknown';
    }
    if (agent.email) {
        return `${name} <${agent.email}>`;
    }
    return name;
}
function creatorToString(creator) {
    if (Array.isArray(creator)) {
        if (typeof creator[0] === 'string') {
            return creator.join('; ');
        }
        else {
            return creator.map((a) => agentToString(a)).join('; ');
        }
    }
    if (typeof creator === 'string') {
        return creator;
    }
    return agentToString(creator);
}
function parseAnnotation(anno, langPrefs) {
    if (!anno.target) {
        return;
    }
    const annoBody = anno.body.map((bodyRef) => exports.vault.get(bodyRef));
    const creatorNames = annoBody
        .map((body) => body.creator)
        .filter((v) => v !== undefined)
        .map(creatorToString);
    const modifiedDates = annoBody
        .map((body) => body.modified)
        .filter((v) => v !== undefined)
        .map((v) => new Date(v).getTime());
    const target = (0, vault_helpers_1.expandTarget)(anno.target);
    const markup = buildAnnotationMarkup(annoBody);
    if (!markup) {
        // TODO: Log?
        throw `No valid textual content in annotation.`;
    }
    return {
        id: anno.id,
        target,
        markup,
        lastModified: modifiedDates.length > 0
            ? new Date(Math.max(...modifiedDates))
            : undefined,
        author: creatorNames.length > 0 ? creatorNames.join('; ') : undefined,
    };
}
exports.parseAnnotation = parseAnnotation;
function buildAnnotationMarkup(bodies) {
    const parts = {};
    for (const body of bodies) {
        if (body.type !== 'TextualBody' ||
            (body.format !== 'text/plain' && body.format !== 'text/html') ||
            body.value === undefined) {
            continue;
        }
        let { purpose } = body;
        if (Array.isArray(purpose)) {
            purpose = purpose[0];
        }
        else if (!purpose) {
            purpose = 'no-purpose';
        }
        if (!parts[purpose]) {
            parts[purpose] = [];
        }
        parts[purpose].push(body.value);
    }
    if (Object.keys(parts).length === 0) {
        return undefined;
    }
    const out = [];
    for (const purpose of PURPOSE_ORDER) {
        const purposeLabel = PURPOSE_LABELS[purpose];
        if (!parts[purpose]) {
            continue;
        }
        if (parts[purpose].length > 1) {
            if (purposeLabel) {
                out.push(`<p><b>${purposeLabel}:</b></p>`);
            }
            for (const part of parts[purpose]) {
                // TODO: Convert HTML to PDF rich text
                out.push(`<p>${part}</p>`);
            }
        }
        else {
            out.push('<p>');
            if (purposeLabel) {
                out.push(`<b>${purposeLabel}:</b> `);
            }
            out.push(`${parts[purpose][0]}</p>`);
        }
    }
    if (out.length === 0) {
        return undefined;
    }
    return out.join('\n');
}
function checkCompatibility(manifest) {
    const report = {
        compatibility: 'compatible',
        incompatibleElements: {},
    };
    for (const canvas of exports.vault.get(manifest.items)) {
        const paintingResources = exports.vault
            .get(canvas.items)
            .flatMap((ap) => exports.vault.get(ap.items))
            .flatMap((a) => exports.vault.get(a.body));
        const nonPaintingAnnos = manifest.annotations;
        // TODO: Check if canvas has an image
        // TODO: Check if every painting annotation is an image with a JPEG available
        // TODO: Check for the presence of non-painting annotations
    }
    return undefined;
}
exports.checkCompatibility = checkCompatibility;
