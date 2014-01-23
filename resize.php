<?php

	// get x and y values of top left crop marker
	$x = $_POST[ 'cropX' ];
	$y = $_POST[ 'cropY' ];
	
	// get width and height of crop area
	$w = $_POST[ 'cropWidth' ];
	$h = $_POST[ 'cropHeight' ];
	
	// get original image dimensions
	$origWidth = $_POST[ 'origWidth' ];
	$origHeight = $_POST[ 'origHeight' ];

	// get current width & height of image (incase it's had to be shrunk to fit the container)
	$currentWidth = $_POST[ 'currentWidth' ];
	$currentHeight = $_POST[ 'currentHeight' ];
	
	// get image path
	$path = $_POST[ 'path' ];

	// get dimensions
	$templateDimensions = $_POST[ 'dimensions' ];

	// get percentage scale difference between image size on screen and actual image size
	$percent = ( $currentWidth / $origWidth ) * 100;
	$percent = round( $percent );

	// calculate equivalent x and y co-ordinates	
	$actualX = round( ( 100 / $percent ) * $x );
	$actualY = round( ( 100 / $percent ) * $y );
	
	// calculate equivalent width and height	
	$actualW = round( ( 100 / $percent ) * $w );
	$actualH = round( ( 100 / $percent ) * $h );

	// create new image
	$image = imagecreatefromjpeg( $path );

	// if $templateDimensions is an array it contains the template dimensions
	// create new image with the template dimensions
	if( is_array( $templateDimensions ) ) {
		
		// create black (empty) image with proportions specified
		$imgResized = imagecreatetruecolor( $templateDimensions[0], $templateDimensions[1] );		
		
		// create new image from selection
		imagecopyresampled( $imgResized, $image, 0, 0, $actualX, $actualY, $templateDimensions[0], $templateDimensions[1], $actualW, $actualH );
	}
	else {
		
		// if $templateDimensions is not an array use the original dimensions
		// create a black (empty) image with the original dimensions		
		$imgResized = imagecreatetruecolor( $actualW, $actualH );
		
		// create new image from selection
		imagecopyresampled( $imgResized, $image, 0, 0, $actualX, $actualY, $origWidth, $origHeight, $origWidth, $origHeight );
	}

	// replace original image with new image
	imagejpeg( $imgResized, $path, 100 );

	// get height and width of cropped image
	$size = getimagesize( $path );
	$filesize = round( filesize( $path ) / 1024 );

	// return path, dimensions and filesize (KB)
	exit( json_encode( array( $path, $size[0], $size[1], $filesize ) ) );

?>
