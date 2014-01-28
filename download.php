<?php

	// get file name to download
	$image = $_GET[ 'img' ];
	if ( strpos( $image,'temp/' ) !== false ) {
		
		// set headers to allow download
		if ( file_exists ($image) ) {
			header( 'Content-Description: File Transfer' );
			header( 'Content-Type: application/octet-stream' );
			header( 'Content-Disposition: attachment; filename='.basename( $image ) );
			header( 'Content-Transfer-Encoding: binary' );
			header( 'Expires: 0' );
			header( 'Cache-Control: must-revalidate' );
			header( 'Pragma: public' );
			header( 'Content-Length: ' . filesize( $image ) );
			ob_clean();
			flush();

			//	download image
			readfile( $image );
			exit;
		}
	}

?>