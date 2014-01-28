<?php

	// check if string sent contains "temp/" and if so delete image
	$path = $_POST[ 'path' ];
	if ( strpos( $path,'temp/' ) !== false ) {
	    unlink( $path );
	}
	if( isset( $_POST[ 'pngPath' ] ) ) {
		$path2 = $_POST[ 'pngPath' ];
		if ( strpos( $path2,'temp/' ) !== false ) {
		    unlink( $path2 );
		}
	}

?>