<?php

	//	validation

	//	if error during upload
	if ( $_FILES[ 'image' ][ 'error' ] > 0 ) {
  		exit( json_encode( "Error: " . $_FILES[ 'file' ][ 'error' ] ) );
  	}
	else {

		//	check file type
		$types = array( 'image/gif','image/jpg', 'image/jpeg','image/png' );
		$match = false;

		//	if file type is expected, match is true
		for( $i = 0; $i < count( $types ); $i++ ) {
			if( $_FILES[ 'image' ][ 'type' ] === $types[$i] ) {
				$match = true;
			}
		}

		//	if the file type doesnt match the expected types, exit
		if( $match === false ) {
			exit( json_encode( "Sorry, file type not supported." ) );
		}
		else {
			$type = explode( "/", $_FILES[ 'image' ][ 'type' ] );
		}

		//	check file size and exit if over 1mb
		if( round( $_FILES[ 'image' ][ 'size' ] / 1024 ) > 1000 ) {
			exit( json_encode( "Sorry, your image is too big for this tool." ) );
		}

		//	get dimensions of uploaded image
		$size = getimagesize( $_FILES[ 'image' ][ 'tmp_name' ] );

		//	test if image is too small - 81px x 81px is smallest template
		//	or too large
		//	test if $size variable exists to avoid errors

		
		if( $size[0] < 80 || $size[1] < 80 ){
			exit( json_encode( "Sorry, your image is too small for this tool." ) );
		}
		else if( $size[0] > 2100 || $size[1] > 2100 ) {
			exit( json_encode( "Sorry, your image is too big for this tool." ) );
		}

		//	check if dimensions have been specified from the user
		//	and if so test to see if the uploaded image is large enough
		//	for the chosen dimensions to be applied to

		if ( isset( $_POST[ 'dimensions' ] ) ) {
			$dimensions = $_POST[ 'dimensions' ];			
			$dimensions = explode( ",", $dimensions );
			
			//	if image is too small for template, exit
			if( $dimensions[0] > $size[0] || $dimensions[1] > $size[1] ) {
				unset( $_POST[ 'dimensions' ] );
				exit( json_encode( "Sorry, your image isn't large enough for that template." ) );
			}
		}		


		//	validation ends
		
		//	rename image to random name and add file extension		
		$_FILES[ 'image' ][ 'name' ] = randomStr() . '.' . $type[1];

		//	all images should now be converted to jpeg format (not jpg)
		
		//	if file is a png 
		if( $type[1] === "png" ) {
			$image = imagecreatefrompng( $_FILES[ 'image' ][ 'tmp_name' ] );
			convertAndSave( $image, $size, $type[1] );
				
		}
		//	if file is a gif
		else if ( $type[1] === "gif" ) {
			$image = imagecreatefromgif( $_FILES[ 'image' ][ 'tmp_name' ] );
			convertAndSave( $image, $size, $type[1] );
		}
		//	if file is already a jpeg / jpg
		else {
			if( move_uploaded_file ( $_FILES[ 'image' ][ 'tmp_name' ], "temp/" . $_FILES[ 'image' ][ 'name' ] ) === true ) {
				$filename = explode( ".", $_FILES[ 'image' ][ 'name' ] );
				success( $filename[0], $size, $type[1] );
			}
			else {
  				failure();
  			}
		}
  	}


  	//	convert gif or png to jpeg
  	function convertAndSave( $image, $size, $type ) {

  		$bg = imagecreatetruecolor( imagesx( $image ), imagesy( $image ) );
		imagefill( $bg, 0, 0, imagecolorallocate( $bg, 255, 255, 255 ) );
		imagealphablending( $bg, TRUE );
		imagecopy( $bg, $image, 0, 0, 0, 0, imagesx( $image ), imagesy( $image ) );
		imagedestroy( $image );
		$filename = explode( ".", $_FILES[ 'image' ][ 'name' ] );

		//	if file has been successfully converted and saved to temp folder
		//	send back image details to browser

		if( imagejpeg( $bg, "temp/" . $filename[0] . ".jpeg", 100 ) === true ) {
			ImageDestroy( $bg );
			success( $filename[0], $size, $type );				
		}
		else {
			failure();
		}		
  	}


  	//	send image details to browser
  	function success( $name, $size, $type ) {
  		exit(json_encode( array( "temp/" . $name . ".jpeg", 
			$name . ".jpeg", 
			$size[0], 
			$size[1], 
			round( $_FILES[ 'image' ][ 'size' ] / 1024 ), 
			$type . " to jpeg." ) 
		));
  	}	


  	//	save to dir / conversion has failed so send error message to browser
  	function failure() {
  		exit( json_encode( "Sorry upload failed, please try again." ) );
  	}


  	//	create random 5 char string for image name
  	function randomStr() {
	    $characters = '0123456789abcdefghijklmnopqrstuvwxyz';
	    $randomString = '';
	    for ( $i = 0; $i < 5; $i++ ) {
	        $randomString .= $characters[ rand( 0, strlen( $characters ) - 1 ) ];
	    }
	    return $randomString;
	}


?>