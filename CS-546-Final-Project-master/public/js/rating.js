(function($) {
    var leftGame = $('.Left');
    var rightGame = $('.Right');
    var leftGameImage = $('.LeftImage');
    var rightGameImage = $('.RightImage');

    function resetGames(config) {
        $.ajax(config).then(function(response){
            if(response === null) {
                alert('Issue with storing rating, please try again.');
                return;
            }
            var leftHTML = "<a href='/videogames/" + response.id1 + "' class='videogame-link'>" + response.name1 + "</a>" + 
                "<img src='" + response.image1 + "' class='LeftImage' alt='" + response.name1 + "'/>" +
                "<p id='releaseL'>" + response.release1 + "</p>" + 
                "<p id='genreL'>" + response.genre1 + "</p>" +
                "<p id='priceL'>" + response.price1 + "</p>" + 
                "<p id='developerL'>" + response.developer1 + "</p>";
            var rightHTML = "<a href='/videogames/" + response.id2 + "' class='videogame-link'>" + response.name2 + "</a>" +
                "<img src='" + response.image2 + "' class='RightImage' alt='" + response.name2 + "'/>" +
                "<p id='releaseR'>" + response.release2 + "</p>" +
                "<p id='genreR'>" + response.genre2 + "</p>" +
                "<p id='priceR'>" + response.price2 + "</p>" + 
                "<p id='developerR'>" + response.developer2 + "</p>";

            leftGame.html(leftHTML);
            leftGame.children('.LeftImage').first().click(function() {
                var config = {
                    method: 'POST',
                    url: '/rating/reset',
                    data: {side: 'left'}
                };
                resetGames(config);
            });

            rightGame.html(rightHTML);
            rightGame.children('.RightImage').first().click(function() {
                var config = {
                    method: 'POST',
                    url: '/rating/reset',
                    data: {side: 'right'}
                };
                resetGames(config);
            });
        });
    }

    leftGameImage.on('click', function() {
        var config = {
            method: 'POST',
            url: '/rating/reset',
            data: {side: 'left'}
        };
        resetGames(config);
    });
 
    rightGameImage.on('click', function() {
        var config = {
            method: 'POST',
            url: '/rating/reset',
            data: {side: 'right'}
        };
        resetGames(config);
    });

})(window.jQuery);