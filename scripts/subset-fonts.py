# Builds the two homepage fonts: pins/limits variable axes and subsets to Latin (pip install fonttools brotli).
# Sources: @fontsource-variable/bricolage-grotesque and @fontsource-variable/dm-sans (SIL OFL).
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset
import os
TEXT = ''.join(chr(c) for c in range(0x20, 0x7f)) + '£€–—’‘“”…·×°+−éèêëáàâäíìîïóòôöúùûüçñÉÁÓ•→↓'
B = 'node_modules/@fontsource-variable/'
def prep(src, dst, limits):
    f = instancer.instantiateVariableFont(TTFont(src), limits)
    o = subset.Options(); o.flavor = 'woff2'; o.notdef_outline = True
    o.layout_features = ['kern', 'liga', 'lnum', 'pnum', 'tnum', 'calt', 'ccmp', 'locl', 'mark', 'mkmk', 'case', 'frac']
    s = subset.Subsetter(o); s.populate(text=TEXT); s.subset(f); f.flavor = 'woff2'; f.save(dst)
    print(dst, os.path.getsize(dst))
prep(B + 'bricolage-grotesque/files/bricolage-grotesque-latin-opsz-normal.woff2', 'src/assets/fonts/bricolage-subset.woff2', {'wght': (500, 800), 'opsz': (14, 96)})
prep(B + 'dm-sans/files/dm-sans-latin-opsz-normal.woff2', 'src/assets/fonts/dmsans-subset.woff2', {'wght': (400, 700), 'opsz': (14, 32)})
