(function() {
	
	// variables
	var input = $( "#imageUpload" ),
		formdata = new FormData(),
		fileUploaded = false,
		readyToDownload = false,
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
					}
				}

				// if match is false, file is not supported
				if( match === false ) {
					userMsg( "Sorry, file type not supported." );
				}

				// if file size is greater than 1mb, reject
				else if( size > 1024 ) {
					userMsg( "Sorry, file too big." );
				}

				//	upload image
				else {
					uploadImg( this.files[0] );
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
		$( '#loadingGif' ).show( 300 );
		userMsg( 'Image uploading, please wait...' );
		
		// upload image
		$.ajax({
			url: "upload.php",
			type: "POST",
			data: formdata,
			processData: false,
			contentType: false,
			success: function ( res ) {
				$( '#loadingGif' ).hide( 300 );
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
		$( '#template' ).attr( 'disabled', 'disabled' );
		$( 'h2' ).animate( { opacity : 1 }, 300 );	
		input.attr( 'disabled', 'disabled' );	
		userMsg( "Image successfully uploaded." );
	}


	// delete image
	// send path of image to delete
	// if data back is 1 (true) re-initialise the page
	$( '#delete' ).click( function() {
		var con = confirm( "Are you sure you want to delete the image?" );
		if( con === true ) {
			del();
			reinitPage();
		}	
	});


	// delete image from server
	// test if a png has been created and if so send that path to delete too
	function del() {
		if( $( '#img' ).data( 'pngPath' ) !== undefined ) {
			$.post( "delete.php", { path: $( '#img' ).data( 'path' ), pngPath : $( '#img' ).data( 'pngPath' ) } ); 
		}
		else {
			$.post( "delete.php", { path: $( '#img' ).data( 'path' ) } ); 
		}
	}


	// kill the jcrop plugin to remove it
	// re-init variables and filter options
	function reinitPage() {		
		jCropAPI.destroy();
		removeImgClasses();
		fileUploaded = false;
		readyToDownload = false;
		$( '#filterOptions' ).hide( 300 );
		$( '#filterSelect option:eq(0)' ).attr( 'selected', 'selected' );
		$( '#filterLabel' ).text( 'Blur' );
		$( '#filterSlider' ).data( 'filter', 'pb-blur-amount' ).val( 0 );
		$( '#filterAmount' ).data( 'filter', 'pb-blur-amount' ).text( ': 0' );
		$( 'h2' ).animate( { opacity : 0 }, 300 );
		$( '#img' ).fadeOut( 300, function() {
			$( this ).removeAttr( 'src' ).css( { height: '', width: '' }).removeData();
		});
		$( '#delete' ).attr( 'disabled', 'disabled' );
		$( '#crop' ).attr( 'disabled', 'disabled' );
		$( '#download' ).attr( 'disabled', 'disabled' );
		$( '#template' ).removeAttr( 'disabled' );
		input.removeAttr( 'disabled' ).replaceWith( input = input.val('').clone( true ) );
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
		$( '#loadingGif' ).show( 300 );
		userMsg( 'Processing image, please wait...' );

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
			$( '#filterOptions' ).show( 300, function() {
				$( '#loadingGif' ).hide( 300 );
				userMsg( 'Image crop successful.' );
				var result = JSON.parse( res );
				jCropAPI.destroy();
				$( '#delete' ).removeAttr( 'disabled' );
				$( '#download' ).removeAttr( 'disabled' );
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
	});

	
	// download image
	// test if image is a png (i.e. filters applied)
	// if so create png and then download
	$( "#download" ).click( function (e) {		
		readyToDownload = true;
		if( getImgType() === 'png' ) {
			var img = $( '#img' );
			var name = img.data( 'name' );
			var index = name.indexOf( '.' );
			name = name.substr( 0, index ) + '.png'; 
			
			// create png on server
			$.post( "createPng.php", { img: name, png : img.attr( 'src' ) }, function( res ) {
				$( '#img' ).data( 'pngPath', 'temp/' + name );
				window.location = "download.php?img=" + $( '#img' ).data( 'pngPath' );
			}); 
		}
		else {
			window.location = "download.php?img=" + $( '#img' ).data( 'path' );
		}							
		setTimeout( function(){
			del();
			reinitPage();
		}, 1000 );	
	});


	// filter drop down menu
	// add chosen filter type as a data attribute to the range input 
	// set the value of the range from the value stored in the image's data attribute
	// update label with current chosen filter name
	// update filter amount with filter data attribute & value from image
	$( '#filterSelect' ).change( function() {
		var option = $( '#filterSelect option:selected' ), img = $( '#img' ), pbAmt;
		if( img.data( option.data( 'pb' ) ) === undefined ) {
			pbAmt = 0;
		}
		else {
			pbAmt = img.data( option.data( 'pb' ) );
		}
		$( '#filterSlider' ).data( 'filter', option.data( 'pb' ) ).val( pbAmt );
		$( '#filterLabel' ).text( option.val() );
		$( '#filterAmount' ).data( 'filter', option.data( 'pb' ) ).text( ': ' + pbAmt );
	});


	// create array of classes
	// run through each class and remove all ones beginning with 'filter' or 'pb'
	function removeImgClasses() {
		var classes = $( '#img' ).attr( 'class' ).split( /\s+/);
		$.each( classes, function( index, item ) {
		    if ( item.indexOf( 'filter' ) !== -1 || item.indexOf( 'pb' ) !== -1 ) {
		       $( '#img' ).removeClass( item );
		    }
		});
	}

	// add filter to image 	
	$( '#filterSlider' ).mouseup( function() {	

		// update UI with filter amount and add filter data attribute to image	
		$( '#filterAmount' ).text( ': ' + $( this ).val() );
		$( '#img' ).data( $( this ).data( 'filter' ), $( this ).val() );
		userMsg( "Processing image, please wait..." );
		removeImgClasses();

		// run through each data attribute on image
		// find attributes that begin with pb
		// test values of these data attributes
		// if value is 0 remove data attribute 
		// if value is greater than 0 add the relevant filter class (get it from select menu with same data attribute)
		var d = $( '#img' ).data();
		var data = Object.keys( d );
		$.each( data, function( index, item ) {
		    if ( item.indexOf( 'pb' ) !== -1 ) {
		        if( $( '#img' ).data( item ) == 0 ) {
		       		$( '#img' ).removeData( item );
		        }
		       	else {

		       		// jQuery removes hyphens from data attr names and replaces with capital letter
		       		// loop through the data name and replace capital letters
		       		// then find select option with same data attr and get the filter class
		       		// to add to image
		       		var r = item.match( /[A-Z]/g ), a = item, i = 0;
		       		for( ; i < r.length; i++ ) {
		       			a = a.replace( r[i], '-' + r[i].toLowerCase() );
		       		}		       		
		       		var option = $( '#filterSelect option[data-pb="' + a + '"]' );
		       		$( '#img' ).addClass( option.data( 'class' ) );
		       	}
		    }
		});
		
		// grab all image attributes (classes and data)
		var classes = $( '#img' ).attr( 'class' ).split( /\s+/);
		data = $( '#img' ).data();
		
		// create new image and add attributes
		var img = $( '<img/>' ), i = 0, d = new Date();
		img.attr( 'id', 'img' ).attr( 'src', data.path + '?' + d.getTime() ).data( data ).css( 'visibility', 'visible' );
		for( ; i < classes.length; i++ ) {
			img.addClass( classes[i] );
		}

		// delete the current image, append it to DOM, add filters
		$( '#img' ).hide( 300, function() {
			$( this ).remove();
			$( '#imgHolder' ).append( img );
			$( '#img' ).show( 300, function() {
				processFilters();
				userMsg( "Filters applied." );
			});
		});	
	});


	// returns image type
	// if png filters have been applied
	// determines which image user downloads
	function getImgType() {
		var src = $('#img').attr('src'); 
		if( src.indexOf( 'data' ) !== -1 ) { 
			return 'png'; 
		} 
		else { 
			return 'jpeg'; 
		}
	}


	// delete file from server if user refreshes / closes tab
	// readyToDownload prevents this from firing when the image is being downloaded via GET
	window.onbeforeunload = function (e) {		
		if( fileUploaded === true && readyToDownload === false ) {
			var message = "Thanks for using this tool! Your image will now be deleted.",
		  		e = e || window.event;
		  	if ( e ) {
		  		del();
		  		setTimeout( function() {
		  			reinitPage();
		  		}, 300 );
		    	e.returnValue = message;
		  	}
		  	return message;
		}
	}

})();




