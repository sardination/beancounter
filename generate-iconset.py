# from https://github.com/retifrav/python-scripts

import os
import sys
import pathlib
import subprocess

if len(sys.argv) < 2:
    print("No path to original / hi-res icon provided")
    raise SystemExit

if len(sys.argv) > 2:
    print("Too many arguments")
    raise SystemExit

originalPicture = sys.argv[1]
if not (os.path.isfile(originalPicture)):
    print("There is no such file: {}".format(sys.argv[1]))
    raise SystemExit

fname = pathlib.Path(originalPicture).stem
ext = pathlib.Path(originalPicture).suffix
destDir = pathlib.Path(originalPicture).parent

iconsetDir = os.path.join(destDir, "{}.iconset".format(fname))
if not (os.path.exists(iconsetDir)):
    pathlib.Path(iconsetDir).mkdir(parents=False, exist_ok=True)

class IconParameters():
    width = 0
    scale = 1
    def __init__(self,width,scale):
        self.width = width
        self.scale = scale
    def getIconName(self):
        if self.scale != 1:
            return "icon_{w}x{w}{e}".format(w=self.width, e=ext)
        else:
            return "icon_{w}x{w}@2x{e}".format(w=self.width//2, e=ext)

# https://developer.apple.com/design/human-interface-guidelines/macos/icons-and-images/app-icon#app-icon-sizes
ListOfIconParameters = [
    IconParameters(16, 1),
    IconParameters(16, 2),
    IconParameters(32, 1),
    IconParameters(32, 2),
    IconParameters(64, 1),
    IconParameters(64, 2),
    IconParameters(128, 1),
    IconParameters(128, 2),
    IconParameters(256, 1),
    IconParameters(256, 2),
    IconParameters(512, 1),
    IconParameters(512, 2),
    IconParameters(1024, 1),
    IconParameters(1024, 2)
]

# generate iconset
for ip in ListOfIconParameters:
    subprocess.call(
        [
            # option 1: sips
            #"sips",
            #"-z",
            #str(ip.width),
            #str(ip.width),
            #originalPicture,
            #"--out",

            # option 2: ImageMagick
            "magick",
            "convert",
            originalPicture,
            "-resize",
            str(ip.width),

            os.path.join(iconsetDir, ip.getIconName())
        ]
    )
    #print(f"Generated {ip.getIconName()}")

# convert iconset to icns file
subprocess.call(
    [
        "iconutil",
        "-c",
        "icns",
        iconsetDir,
        "-o",
        os.path.join(destDir, "{}.icns".format(fname))
    ]
)
