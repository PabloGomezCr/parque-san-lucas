"""Trace the supplied PNG, without drawing or inventing pelican contours.
Requires numpy and opencv-python. Run from repository root.
The orange restoration is used only underneath moving wings; the unmodified
master PNG is displayed at rest. Contour measurements ignore background texture.
"""
from pathlib import Path
import base64
import hashlib
import json
import cv2
import numpy as np

root = Path('public/assets/branding')
source = root / 'pelicano-logo-san-lucas.png'
im = cv2.imread(str(source))
h, w = im.shape[:2]
assert (w, h) == (1254, 1254), 'Re-evaluate anatomical split for a different master.'
# White foreground is distinct from the orange background in the blue channel.
# Upsampling before tracing preserves subpixel edges; no morphological smoothing.
scale = 4
blue = cv2.resize(im[:, :, 0], (w*scale, h*scale), interpolation=cv2.INTER_LINEAR)
mask = (blue > 140).astype(np.uint8)*255
count, labels, stats, centers = cv2.connectedComponentsWithStats(mask)
components = [i for i in range(1,count) if stats[i,4] > 5*scale*scale]
main = max(components, key=lambda i: stats[i,4])
# A technical cut through the left shoulder; all visible pixels are retained.
cut = np.zeros_like(mask)
polygon = np.array([(0,0),(650,0),(650,690),(610,760),(560,820),(0,820)])*scale
cv2.fillPoly(cut, [polygon], 255)
parts = {name:np.zeros_like(mask) for name in ('wing-left','body','wing-right')}
for i in components:
    component = (labels == i)
    if i == main:
        parts['wing-left'][component & (cut > 0)] = 255
        parts['body'][component & (cut == 0)] = 255
    else:
        x,y=centers[i]/scale
        part = 'wing-left' if x < 600 else 'wing-right' if y < 720 else 'body'
        parts[part][component] = 255

def trace(binary):
    contours, hierarchy = cv2.findContours(binary, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    paths=[]
    for c in contours:
        # <=0.16 native pixels, far below the final 32–120px display scale.
        points=cv2.approxPolyDP(c, .6, True)[:,0,:]/scale + .5/scale
        if len(points)<3: continue
        paths.append('M'+' L'.join(f'{x:.3f} {y:.3f}' for x,y in points)+' Z')
    return ' '.join(paths)

paths={name:trace(part) for name,part in parts.items()}
data={'source':source.name,'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),
      'viewBox':f'0 0 {w} {h}', 'width':w,'height':h,
      'pivots':{'wing-left':[625,733],'wing-right':[755,746]},'paths':paths}
Path('src/components/branding/pelicanPaths.json').write_text(json.dumps(data,separators=(',',':'))+'\n')
# Reconstruct only the orange hidden behind the bird, from surrounding source pixels.
# It is NOT used to alter the bird or as a new master. Keep the original elsewhere.
small=cv2.resize(im,(418,418),interpolation=cv2.INTER_AREA)
white=(small[:,:,0]>80).astype(np.uint8)*255
white=cv2.dilate(white,np.ones((5,5),np.uint8))
background=cv2.inpaint(small,white,5,cv2.INPAINT_TELEA)
cv2.imwrite(str(root/'pelicano-loading-background.png'),background)
svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1254 1254">\n'
svg+='<!-- Derived only from pelicano-logo-san-lucas.png; see README.md. -->\n'
# Background is derived from the master, never another logo reference.
encoded=base64.b64encode((root/'pelicano-loading-background.png').read_bytes()).decode()
svg+=f'<image width="1254" height="1254" href="data:image/png;base64,{encoded}"/>\n'
for name in ('wing-right','body','wing-left'):
    svg+=f'<g id="{name}" fill="white" fill-rule="evenodd" stroke="white" stroke-width="0.25" stroke-linejoin="round"><path d="{paths[name]}"/></g>\n'
svg+='</svg>\n'
(root/'pelicano-logo-san-lucas.svg').write_text(svg)
print(json.dumps({'source':data['sha256'],'groups':list(paths),'svg_bytes':len(svg),'dimensions':[w,h]}))
