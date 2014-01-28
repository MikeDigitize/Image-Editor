Image-Editor
============

<h3>Overview</h3>
A single paged JavaScript / PHP based tool that crops, resizes and reformats images to fit common social media sizes and allows the user to alter the result with HTML5 Canvas filters.

<h3>Dependencies</h3>
Uses jQuery, Bootstrap, PaintbrushJS (https://github.com/mezzoblue/PaintbrushJS) for the filters and jCrop (http://deepliquid.com/content/Jcrop.html) for the crop tool.

<h3>Current State</h3>
Currently: the user uploads an image (gif, png, jpg, jpeg) with HTML5's File and FormData APIs, the image is validated, renamed, converted to a jpeg and returned to them ready to crop, either freehand or with their chosen social media template. The cropped image is returned to the user. If the user attempts to close the browser tab the image is deleted from the server. The user can then add Canvas filters to change the appearance of the cropped image.

<h3>Next Steps</h3>
4th stage - add download functionality for image with filters
5th stage - tidy up



