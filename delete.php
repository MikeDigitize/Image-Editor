<?php

	//	check if string sent contains "temp/" and if so delete image
	$path = $_POST[ 'path' ];
	if ( strpos( $path,'temp/' ) !== false ) {
	    $result = unlink( $path );
		if( $result === true ) {
			echo true;
		}
		else {
			echo false;
		}
	}
	else {
		echo false;
	}


?>