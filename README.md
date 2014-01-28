Image-Editor
============

<h3>Overview</h3>
A single paged JavaScript / AJAX / PHP based tool that crops, resizes and reformats images to fit common social media sizes and allows the user to alter the result with HTML5 Canvas filters.

<h3>Dependencies</h3>
Uses jQuery, Bootstrap, PaintbrushJS (https://github.com/mezzoblue/PaintbrushJS) for the filters and jCrop (http://deepliquid.com/content/Jcrop.html) for the crop tool.

<h3>How it Works</h3>
The user uploads any image (gif, png, jpg, jpeg), it's validated, renamed, converted to a jpeg and returned to them ready to crop, either freehand or with a chosen social media template. Once they crop, the image is resized, saved and returned ready for filtering (if required). Once filters have been applied the user can download the result. 



