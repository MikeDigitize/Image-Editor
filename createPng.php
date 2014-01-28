<?php

	$base64 = $_POST[ 'png' ];
	$img = $_POST[ 'img' ];

	$base64 = explode( 'data:image/png;base64,', $base64 );

	$data = base64_decode( $base64[1] );
	$filepath = 'temp/' . $img;
	file_put_contents( $filepath, $data );
	echo "sucess";
	