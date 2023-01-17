import fetch from 'cross-fetch';
import { buildLocaleString, createPaintingAnnotationsHelper, createThumbnailHelper, expandTarget, } from '@iiif/vault-helpers';
import { ImageServiceLoader as ImageServiceLoader_ } from '@atlas-viewer/iiif-image-api';
import { globalVault } from '@iiif/vault';
import { getTextSeeAlso } from './ocr.js';
const PURPOSE_ORDER = ['commenting', 'describing', 'tagging', 'no-purpose'];
const PURPOSE_LABELS = {
    commenting: 'Comment',
    describing: 'Description',
    tagging: 'Tags',
};
export const vault = globalVault();
export function getI18nValue(val, languagePreference, separator) {
    let splitAfter = false;
    if (!separator) {
        separator = '<<<SNIP>>>';
        splitAfter = true;
    }
    const localized = buildLocaleString(val, languagePreference[0] ?? 'none', {
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
class ImageServiceLoader extends ImageServiceLoader_ {
    async fetch(input, init) {
        return fetch(input, init);
    }
}
// FIXME: Remove type hints once vault-helpers has had a release
const thumbHelper = createThumbnailHelper(vault, {
    imageServiceLoader: new ImageServiceLoader(),
});
export const { getPaintables, getAllPaintingAnnotations, extractChoices } = createPaintingAnnotationsHelper(vault);
export async function getThumbnail(manifest, maxDimension) {
    const thumb = await thumbHelper.getBestThumbnailAtSize(manifest, {
        maxWidth: maxDimension,
        maxHeight: maxDimension,
    });
    return thumb.best?.id;
}
export function isExternalWebResourceWithProfile(res) {
    return (res.type !== undefined &&
        ['Dataset', 'Image', 'Video', 'Sound', 'Text', 'unknown'].indexOf(res.type) >= 0 &&
        res.profile !== undefined);
}
export function isPhysicalDimensionService(service // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
) {
    return (typeof service.profile === 'string' &&
        service.profile === 'http://iiif.io/api/annex/services/physdim');
}
export function supportsScaling(profile) {
    if (typeof profile === 'string') {
        return profile.indexOf('level2') >= 0;
    }
    else {
        return (profile.supports?.indexOf('sizeByWh') ?? -1) >= 0;
    }
}
export async function fetchFullImageService(serviceRef) {
    const serviceUrl = `${serviceRef['@id'] ?? serviceRef.id}/info.json`;
    const resp = await fetch(serviceUrl);
    const res = await resp.json();
    return res;
}
export function getCanvasAnnotations(canvas) {
    return vault
        .get(canvas.annotations)
        .flatMap((p) => vault.get(p.items))
        .filter((a) => Array.isArray(a.motivation)
        ? a.motivation.find((m) => PURPOSE_LABELS[m] !== undefined) !==
            undefined
        : PURPOSE_LABELS[a.motivation ?? 'invalid'] !== undefined)
        .map((a) => parseAnnotation(a, []))
        .filter((a) => a !== undefined);
}
export function getCanvasInfo(canvas) {
    const paintables = getPaintables(canvas);
    // FIXME: complex choices are currently untested
    const choiceImageIds = paintables.choice?.items
        ?.flatMap((i) => {
        if ('items' in i) {
            return i.items;
        }
        else {
            return [i];
        }
    })
        .map((i) => i.id) ?? [];
    const images = paintables.items
        .filter((p) => p.type === 'image')
        .filter((p) => p.resource.id !== undefined &&
        choiceImageIds?.indexOf(p.resource.id) < 0)
        .map((i) => ({
        img: {
            id: i.resource.id,
            type: 'ContentResource',
        },
        isOptional: false,
    }));
    // TODO: Add support for complex choices?
    if (paintables.choice?.type === 'single-choice') {
        const choice = paintables.choice;
        for (const itm of choice.items) {
            const res = vault.get(itm.id);
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
    const text = getTextSeeAlso(canvas);
    return {
        canvas: { id: canvas.id, type: 'Canvas' },
        images,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ocr: text ? { id: text.id } : undefined,
        numAnnotations: getCanvasAnnotations(canvas).length,
    };
}
function agentToString(agent) {
    let name = Array.isArray(agent.name) ? agent.name.join('; ') : agent.name;
    if (!name) {
        name = agent.nickname ?? 'unknown';
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
export function parseAnnotation(anno, langPrefs) {
    if (!anno.target) {
        return;
    }
    const annoBody = anno.body.map((bodyRef) => vault.get(bodyRef));
    const creatorNames = annoBody
        .map((body) => body.creator)
        .filter((v) => v !== undefined)
        .map(creatorToString);
    const modifiedDates = annoBody
        .map((body) => body.modified)
        .filter((v) => v !== undefined)
        .map((v) => new Date(v).getTime());
    const target = expandTarget(anno.target);
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
export function checkCompatibility(manifest) {
    const report = {
        compatibility: 'compatible',
        incompatibleElements: {},
    };
    for (const canvas of vault.get(manifest.items)) {
        const paintingResources = vault
            .get(canvas.items)
            .flatMap((ap) => vault.get(ap.items))
            .flatMap((a) => vault.get(a.body));
        const nonPaintingAnnos = manifest.annotations;
        // TODO: Check if canvas has an image
        // TODO: Check if every painting annotation is an image with a JPEG available
        // TODO: Check for the presence of non-painting annotations
    }
    return undefined;
}
//# sourceMappingURL=iiif.js.map