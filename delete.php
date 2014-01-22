<?php

	//	check if 
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