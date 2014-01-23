( function() {
	
	// variables
	var input = $( "#imageUpload" ),
		formdata = new FormData(),
		fileUploaded = false,
		imgFinished = false,
		imgPath,
		imgName,
		imgWidth,
		imgHeight,
		imgSize,
		imgOrigType,
		selectedTemplateIndex,
		jCropAPI,
		cropX,
		cropY,
		cropWidth,
		cropHeight;

	// on file input changing
	$( input ).change( function() {

		// test that window width is greater than the selected template width
		// if it isn't the crop area won't fit on the screen
		if( $( '#template option:selected' ).data( 'dimensions' )[0] < $( window).width() ) {
		
			// if a file has not already been uploaded and a file exists
			if( fileUploaded === false && this.files[0] ) {

				// get file details
				var size = Math.round( this.files[0].size / 1000 ),
					type  = this.files[0].type,
					types = [ 'image/jpeg', 'image/gif', 'image/png' ],
					match = false;

				// check if file is right type
				for( var i = 0, l = types.length; i < l; i++ ) {
					if( type === types[i] ) {
						match = true;
						uploadImg( this.files[0] );
					}
				}

				// if match is false, file is not supported
				if( match === false ) {
					userMsg( "Sorry, file type not supported." );
				}

				// if file size is greater than 1mb, reject
				if( size > 1024 ) {
					userMsg( "Sorry, file too big." );
				}
				
			}
		}
		else {
			userMsg( "Sorry, your screen is too small to use this template." );
		}
		
	});

	// messages to user
	function userMsg( txt ) {
		$( '#user-msg' ).text( txt );
	}

	// AJAX image upload
	function uploadImg( file ) {
		
		// append image to formdata object				
		formdata.append( "image", file );

		// append dimensions to form data and store index of selected option
		formdata.append( "dimensions", $( '#template option:selected' ).data( 'dimensions' ) );
		
		// upload image
		$.ajax({
			url: "upload.php",
			type: "POST",
			data: formdata,
			processData: false,
			contentType: false,
			success: function ( res ) {
				var result = JSON.parse( res );

				// if result is a string it's an error message
				// if not, result is an array so grab contents (the image details)
				if( typeof result === "string" ) {
					userMsg( result );
				}
				else {
					fileUploaded = true;
					imgPath = result[0],
					imgName = result[1],
					imgWidth = result[2],
					imgHeight = result[3],
					imgSize = result[4],
					imgOrigType = result[5];
					prepareCrop();
				}		
			}
		});	
	}


	// create object to hold crop tool settings 
	function prepareCrop() {
		var coOrdinates,
			dimensions,
			minSize,
			option = $( '#template option:selected' ),
			cropOptions = {};
			selectedTemplateIndex = option.index();

		// if a template has been selected
		// restrict size of crop area to chosen dimensions & aspect ratio
		if( option.index() > 0 ) {			
			coordinates = option.data( 'coordinates' );
			dimensions = option.data( 'dimensions' );
			cropOptions = {
				onSelect: getCoords,
				setSelect : coordinates,
				dimensions : dimensions,
				aspectRatio : ( dimensions[0] / dimensions[1] ).toFixed(2),
				minSize : dimensions
			}
		}
		else {
			// no template
			cropOptions = {
				onSelect: getCoords,
				setSelect: [ 0, 0, 100, 100 ],
				minSize : [ 80, 80 ]
			}
		}
		displayUploadedImage( cropOptions );	
	}


	// output uploaded image with crop tool configured
	function displayUploadedImage( cropOptions ) {

		// display image,
		// assign its properties as data attributes
		// initialise crop tool with settings		
		$( '#img' ).attr( 'src', imgPath ).data( {
			name : imgName,
			width : imgWidth,
			height : imgHeight,
			size : imgSize,
			type : imgOrigType,
			path : imgPath  
		}).fadeIn( 300 ).Jcrop( cropOptions, function() {
			jCropAPI = this;
		});
		$( '#delete' ).removeAttr( 'disabled' );
		$( '#crop' ).removeAttr( 'disabled' );
		$( input ).attr( 'disabled', 'disabled' );
		$( '#template' ).attr( 'disabled', 'disabled' );
		$( 'h2' ).animate( { opacity : 1 }, 300 );		
		userMsg( "Image successfully uploaded." );
	}


	// delete image
	// send path of image to delete
	// if data back is 1 (true) re-initialise the page
	$( '#delete' ).click( function() {
		var con = confirm( "Are you sure you want to delete the image?" );
		if( con === true ) {
			$.post( "delete.php", { path: $( '#img' ).data( 'path' ) }, 
				function( data ) {
					if( data == 1 ) {
						reinitPage();			
					}
					else {
						userMsg( "Sorry, there seems to have been an error. Please try again." );
					}
			});
		}	
	});


	// delete file from server if user refreshes / closes tab
	window.onbeforeunload = function (e) {		
		if( imgFinished === false && fileUploaded === true ) {
			var message = "Thanks for using this tool! Your image will now be deleted.",
		  		e = e || window.event;
		  	if (e) {
		  		$.post( "delete.php", { path: $( '#img' ).data( 'path' ) } );
		  		setTimeout( function() {
		  			reinitPage();
		  		}, 300 );
		    	e.returnValue = message;
		  	}
		  	return message;
		}
	}


	// kill the jcrop plugin to remove it
	// re-init variables
	function reinitPage() {		
		jCropAPI.destroy();
		fileUploaded = false;
		$( 'h2' ).animate( { opacity : 0 }, 300 );
		$( '#img' ).fadeOut( 300, function() {
			$( this ).removeAttr( 'src' ).css( { height: '', width: '' });
		});
		$( '#delete' ).attr( 'disabled', 'disabled' );
		$( '#crop' ).attr( 'disabled', 'disabled' );
		$( input ).removeAttr( 'disabled' );
		$( '#template' ).removeAttr( 'disabled' );
		userMsg( "Image successfully deleted." );
	}


	// update variables which hold the crop area dimensions
	function getCoords( c ) {
		cropX = c.x;
		cropY = c.y;
		cropWidth = Math.round( c.w );
		cropHeight = Math.round( c.h );
	}


	// send details of chosen crop area to server
	$( '#crop' ).click( function() {
		$( '#delete' ).attr( 'disabled', 'disabled' );
		$( '#crop' ).attr( 'disabled', 'disabled' );
		$( '#template' ).attr( 'disabled', 'disabled' );

		// if there has been no template selected 
		// ( if selectedTemplateIndex is 0) dimensions = false
		// if there has been a template selected, 
		// dimensions = an array of the selected template dimensions
		var dimensions,	img = $( '#img' );
		if( selectedTemplateIndex === 0 ) {
			dimensions = 0;
		}
		else {
			dimensions = $( '#template option:eq(' + selectedTemplateIndex + ')' ).data( 'dimensions' );
		}
		
		// send details of crop to server to resize
		$.post( "resize.php", { 			
			path: img.data( 'path' ), 
			cropX : cropX, 
			cropY : cropY, 
			cropWidth : cropWidth, 
			cropHeight : cropHeight,
			dimensions : dimensions, 
			origWidth: img.data( 'width' ), 
			origHeight: img.data( 'height' ),
			currentWidth: img.width(),
			currentHeight : img.height() 
		}, 
		function( res ) {

			// get response from server, remove jcrop from image, reset image css 
			// update image source to display newly cropped image (add date so browser forced not to used cached image) 
			// add image details as data attributes
			var result = JSON.parse( res );
			jCropAPI.destroy();
			$( '#delete' ).removeAttr( 'disabled' );
			$( '#img' ).fadeOut( 300, function() {
				var d = new Date();
				$( this ).attr( 'src', '' ).css( { height: '', width: '' }).attr( 'src', result[0] + '?' + d.getTime() ).data( {
					width : result[1],
					height : result[2],
					size : result[3],
				}).fadeIn( 300 );
			});	
		});	
	});

})();




