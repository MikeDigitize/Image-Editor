Image-Editor
============

A single paged JavaScript / PHP based tool that crops, resizes and reformats images to fit social media requirements and allows the user to alter the result with HTML5 Canvas filters.

Currently just finished stage one - the user can upload an image (gif, png, jpg, jpeg) with HTML5's File and FormData APIs, the image is validated, renamed, converted to a jpeg (the crop tool I'm using doesn't like transparent backgrounds) and returned to the user ready to crop. The user can delete the image and restart. If the user attempts to close the browser tab the image is deleted from the server.

2nd stage - apply social media image template dimensions to returned image (or free hand crop dimensions) and return the resized image.

3rd stage - allow the user to apply a variety of Canvas filters to the image and have it save and returned as a png.

4th stage - re-organise JavaScript.

5th stage - finish.



