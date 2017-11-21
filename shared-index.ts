/*\
title: $:/plugins/hoelzro/full-text-search/shared-index.js
type: application/javascript
module-type: library

\*/

declare var require;
declare var $tw;
declare var setTimeout;
declare var setInterval;

module SharedIndex {
    var lunr = require('$:/plugins/hoelzro/full-text-search/lunr.min.js');

    let index = lunr(function() {
        // XXX configurable boost? configurable fields?
        this.field('title', {boost: 10})
        this.field('tags', {boost: 5});
        this.field('text');

        this.ref('title');
    });

    async function delay(millis : number) {
        return new Promise(resolve => {
            setTimeout(resolve, millis);
        });
    }

    export async function buildIndex(wiki, tiddlers, rebuilding, progressCallback) {
        if(rebuilding || !index) {
            index = lunr(function() {
                // XXX configurable boost? configurable fields?
                this.field('title', {boost: 10})
                this.field('tags', {boost: 5});
                this.field('text');

                this.ref('title');
            });
        }

        let i = 0;
        for(let title of tiddlers) {
            let tiddler = wiki.getTiddler(title);

            if(tiddler === undefined) { // avoid drafts that were open when we started
                continue;
            }
            var type = tiddler.fields.type || 'text/vnd.tiddlywiki';
            if(!type.startsWith('text/')) {
                continue;
            }
            updateTiddler(tiddler);
            await progressCallback(++i);
            await delay(1);
        }
        await progressCallback(tiddlers.length);
    };

    export function updateTiddler(tiddler) {
        var fields : any = {
            title: tiddler.fields.title
        };

        if('text' in tiddler.fields) {
            fields.text = tiddler.fields.text;
        }

        if('tags' in tiddler.fields) {
            fields.tags = tiddler.fields.tags.join(' ');
        }

        index.update(fields);
    }

    export function getIndex() {
        return index;
    };

    export function clearIndex() {
        index = lunr(function() {
            // XXX configurable boost? configurable fields?
            this.field('title', {boost: 10})
            this.field('tags', {boost: 5});
            this.field('text');

            this.ref('title');
        });
    }

    export function load(data) {
        index = lunr.Index.load(data);
    }
}
export = SharedIndex;

// vim:sts=4:sw=4
