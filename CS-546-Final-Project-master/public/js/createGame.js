(function ($) {
    var previewArea = $('#preview');
    var errorArea = $('.error');

    previewArea.hide();
    errorArea.hide();

    errorArea.click(function(){
        $(this).hide();
        $(this).empty();
    });

    $("#preview_boxart").on('click', function(event){
        event.preventDefault();
        previewArea.hide();
        previewArea.empty();
        if(!$('#boxart').val()){
            previewArea.append($('<p>Please provide a boxart link<p>'));
            previewArea.show();
        }
        else{
            var image = new Image();
            image.src = $('#boxart').val();
            image.onload = function() {
                image.alt = "preview image";
                previewArea.append(image);
                previewArea.show();
            };
            image.onerror = function() {
                previewArea.append($("<p>Image link is not valid</p>"));
                previewArea.show();
            };


        }
    });

    $('#create_game_form').on('submit', function(event){
        event.preventDefault();

        var gameTitle = $("#game_title").val();
        var releaseDate = $("#release_date").val();
        var developer = $("#developer").val();
        var genre = $("#genres").val();
        var price = $("#price").val();
        var boxart= $("#boxart").val();

        errorArea.hide();
        errorArea.empty();

        previewArea.hide();
        previewArea.empty();
        var errored = false;
        // idea taken from: iterative form input validation and missing value highlighting
        // https://stackoverflow.com/questions/47530753/not-able-to-highlight-the-input-fields-if-left-empty
        $( "input, select" ).each( function(){ //iterate all inputs
            var $this = $( this );
            var value = $this.val();
            $this.removeClass( "makeRed" ); //reset the class first
            if ( value == null || value.trim() == "" || value.length == 0 )
            {
               errored = true;
               $this.addClass( "makeRed" ); //add if input is empty
               errorArea.append($(`<p class="makeRed">Empty Field: ${$(this).attr("name")}</p>`));

            }
         });

        if(errored){

            errorArea.show();
            return;
        }

        if(price < 0 ){
            errorArea.append($("<p>Price cannot be negative</p>"));
            errorArea.show();
            return;
        }

        var formSubmitConfig = {
            method: 'POST',
            url: `/videogames/`,
            contentType: 'application/json',  
            data: JSON.stringify({
                gameTitle: gameTitle,
                releaseDate: releaseDate,
                developer: developer,
                genre: genre,
                price: price,
                boxart: boxart
            }),
            //This should never get called means server has errored/input validation in client side insufficient
            error: function(request){
                errorArea.empty();
                errorArea.append($(`<h1>Server Errored with code ${request.status}</h1>`));
                errorArea.append($(request.responseText));
                errorArea.show();
            }      
        };
       
        //Check to see if boxart is valid before submitting the game
        var image = new Image();
        image.src = boxart;
        image.onload = function() {
            $.ajax(formSubmitConfig).then(function(responseMessage){
                var gamePage = $(responseMessage);
                previewArea.hide();
                previewArea.empty();
                previewArea.append(gamePage);
                previewArea.show();
                $("#create_game_form").trigger('reset');
            });
        };
        image.onerror = function() {
            errorArea.append($("<p>Image link is not valid</p>"));
            errorArea.show();
        };


    });

    $( "input,select" ).focus( function(){
        $( this ).removeClass( "makeRed" ); //on focus of the input remove the markRed class
     });

})(window.jQuery);
