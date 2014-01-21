//	variables
var input = $( "#imageUpload" ),
	formdata = new FormData(),
	fileUploaded = false,
	imgFinished = false,
	jCropAPI;

//	on file input changing
$( input ).change( function() {
	
	//	if a file has not already been uploaded
	if( fileUploaded === false ) {

		//	get file details - file, file name, type and size
		//	create array of file types to compare against
		//	match boolean to determine if uploaded file is correct type or not

		var size = Math.round( this.files[0].size / 1000 ),
			type = this.files[0].type,
			types = [ 'image/jpeg', 'image/gif', 'image/png' ],
			match = false;

		//	if file size is greater than 1mb, reject
		if( size > 1000 ) {
			userMsg( "Sorry, file too big." );
			return;
		}
		
		//	loop through array of image types checking for a match
		for( var i = 0, l = types.length; i < l; i++ ) {
			if( type === types[i] ) {
				match = true;
				uploadImg( this.files[0] );
				return;
			}
		}

		//	if match is false, file is not supported
		if( match === false ) {
			userMsg( "Sorry, file type not supported." );
		}
	}
	
});

//	handles messages for user
function userMsg( txt ) {
	$( '#user-msg' ).text( txt );
}

//	handles AJAX image upload
function uploadImg( file ) {
	
	//	append image to formdata object				
	formdata.append( "image", file );

	//	test if crop dimensions have been chosen
	//	from drop down and if so append it to form data

	var option = $('#template option:selected' );
	if( option.index() > 0 ) {
		formdata.append( "dimensions", option.data( 'dimensions') );
	} 
	
	//	upload image via AJAX
	$.ajax({
		url: "upload.php",
		type: "POST",
		data: formdata,
		processData: false,
		contentType: false,
		success: function ( res ) {

			//	parse result
			var result = JSON.parse( res );

			//	if result is string it's an error message, so output error to screen
			//	if not, result is an array so grab contents (image details)

			if( typeof result === "string" ) {
				userMsg( result );
			}
			else {
				fileUploaded = true;
				showImg( result );
			}		
		}
	});	
}


//	grab image details and append to image as data
//	disable / enable UI elements
//	display uploaded image

function showImg( res ) {
	
	var imgPath = res[0],
		imgName = res[1],
		imgWidth = res[2],
		imgHeight = res[3],
		imgSize = res[4],
		imgType = res[5];

	$( '#delete' ).removeAttr( 'disabled' );
	$( input ).attr( 'disabled', 'disabled' );
	userMsg( "Image successfully uploaded." );
	$( 'h2' ).animate( { opacity : 1 }, 300 );

	//	display image,
	//	assign image properties as data attributes
	//	and initialise crop tool
	
	$( '#img' ).attr( 'src', imgPath ).data( {
		name : imgName,
		width : imgWidth,
		height : imgHeight,
		size : imgSize,
		type : imgType,
		path : imgPath  
	}).fadeIn( 300 ).Jcrop( {
		onSelect: showCoords,
		setSelect: [ 0, 0, 100, 100 ]
	}, function() {
		jCropAPI = this;
	});
}

//	delete button handler
$( '#delete' ).click( function() {
	var con = confirm( "Are you sure you want to delete the image?" );
	if( con === true ) {
		deleteImg();
	}	
});

//	send ajax call to server with path of image to delete
//	re-init variables, inline CSS on image and UI buttons
function deleteImg() {	
	$.post( "delete.php", { path: $( '#img' ).data( 'path' ) }, function( data ) {
		if( data == 1 ) {
			reinitPage();			
		}
		else {
			userMsg( "Sorry, there seems to have been an error. Please try again." );
		}
	});
}

//	delete file from server if user exits early
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
	  	// For Safari
	  	return message;
	}
}

function reinitPage() {
	jCropAPI.destroy();
	fileUploaded = false;
	$( 'h2' ).animate( { opacity : 0 }, 300 );
	$( '#img' ).fadeOut( 300, function() {
		$( this ).removeAttr( 'src' ).css( { height: '', width: '' });
	});
	$( '#delete' ).attr( 'disabled', 'disabled' );
	$( input ).removeAttr( 'disabled' );
	userMsg( "Image successfully deleted." );
}


function showCoords( c ) {
	console.log( c );
}

