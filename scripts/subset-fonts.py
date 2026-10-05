# Builds the two site fonts: pins/limits variable axes and subsets to Latin (pip install fonttools brotli).
# Sources: @fontsource-variable/fraunces (display, as used by BioClin) and
# @fontsource-variable/plus-jakarta-sans (text and UI, as used by Medichecks); both SIL OFL.
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset
import os
TEXT = ''.join(chr(c) for c in range(0x20, 0x7f)) + '£€–—’‘“”…·×°+−©±éèêëáàâäíìîïóòôöúùûüçñÉÁÓ•→↓←↑✓'
B = 'node_modules/@fontsource-variable/'
def prep(src, dst, limits):
    # subset first, then limit the axes (the other order trips on glyphs without variations)
    f = TTFont(src)
    o = subset.Options(); o.flavor = 'woff2'; o.notdef_outline = True
    o.layout_features = ['kern', 'liga', 'lnum', 'pnum', 'tnum', 'calt', 'ccmp', 'locl', 'mark', 'mkmk', 'case', 'frac']
    s = subset.Subsetter(o); s.populate(text=TEXT); s.subset(f)
    f = instancer.instantiateVariableFont(f, limits)
    f.flavor = 'woff2'; f.save(dst)
    print(dst, os.path.getsize(dst))
prep(B + 'fraunces/files/fraunces-latin-full-normal.woff2', 'src/assets/fonts/fraunces-subset.woff2', {'wght': (300, 600), 'opsz': (14, 144), 'SOFT': 40, 'WONK': 0})
prep(B + 'plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2', 'src/assets/fonts/jakarta-subset.woff2', {'wght': (400, 800)})
