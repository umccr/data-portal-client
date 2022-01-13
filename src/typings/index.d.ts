// The typings/index ambient declaration file is used to declare types for external packages
// that don't have their own type declarations

declare module 'igv' {

    // NOTE: this is a VERY minimal typings definition copied from
    // https://github.com/datavisyn/igv_wrapper/blob/master/typings/index.d.ts
    // It does not look like the IGV authors are interested in keeping their own, and I don't want to make
    // a comprehensive one in case it gets out of date
    // https://github.com/igvteam/igv.js/issues/1376
    // For the moment, some basic IGV types suit our use cases

    export function setOauthToken(any, any): void;
    export function createBrowser(any, any): Promise<IGVBrowser>;

    export interface IGVBrowser  {
        loadTrack(config: ITrack): Promise<any>;
        removeTrackByName(name: string): void;
        loadGenome(config: any): Promise<any>;

        /**
         * Search by annotation symbol
         * @param {string} locusOrGene
         */
        search(locusOrGene: string): void;

        /**
         * Zoom in by a factor of 2
         */
        zoomIn(): void;

        /**
         * Zoom out by a factor of 2
         */
        zoomOut(): void;
    }

    export interface ITrack {
        /**
         * Track type  No default. If not specified, type is inferred from file format
         */
        type?: 'annotation' | 'wig' | 'alignment' | 'variant' | 'seg';
        /**
         * Type of data source.
         * @default file
         */
        sourceType?: 'file' | 'ga4gh' | 'htsget';
        /**
         * File format  No default. If not specified format is inferred from file name extension
         */
        format?: string;
        /**
         * Display name (label). Required
         */
        name: string;
        /**
         * URL to the track data resource, such as a file or webservice. Required
         */
        url: string;
        /**
         * optional URL to a file index, such as a BAM .bai, Tabix .tbi, or Tribble .idx file.
         */
        indexURL?: string;
        /**
         * Flag used to indicate if a file is indexed or not. If indexURL is provided this flag is redundant, its main purpose is to indicate that a file is not indexed.
         */
        indexed?: boolean;
        /**
         * Integer value specifying relative order of track position on the screen. To pin a track to the bottom use Number.MAX_VALUE. If no order is specified, tracks appear in order of their addition.
         */
        order?: number;
        /**
         * CSS color value for track features, e.g. "#ff0000" or "rgb(100,0,100)"
         */
        color?: string;
        /**
         * Initial height of track viewport in pixels
         * @default 50
         */
        height?: number;
        /**
         * If true, then track height is adjusted dynamically, within the bounds set by minHeight and maxHeight, to accomdodate features in view
         * @default true;
         */
        autoHeight?: boolean;
        /**
         * Minimum height of track in pixels  50
         * @default 50
         */
        minHeight?: number;
        /**
         * Maximum height of track in pixels
         * @default 500
         */
        maxHeight?: number;
        /**
         * Maximum window size in base pairs for which indexed annotations or variants are displayed  1 MB for variants, 30 KB for alignments, whole chromosome for other track types
         */
        visibilityWindow?: number;

        /**
         * If true a "remove" item is included in the track menu.
         */
        removable?: boolean;
        /**
         * http headers to include with each request. For example {"foo": "fooValue", "bar": "barValue"}
         */
        headers?: any;
        /**
         * OAuth token, or function returning an OAuth token. The value will be included as a Bearer token with each request. See Oauth Support
         */
        oauthToken?: string | (()=>string) | (() => Promise<string>);

        // used for htsget - you can provide the endpoint and id as separate parts
        id?: string;
        endpoint?: string;

        squishedCallHeight?: number;
        expandedCallHeight?: number;
        displayMode?: string;
    }

}

