var thisScript = document.currentScript;
(function($){
    const commentSection = $('#comment-section');
    const newCommentForm = $('#new-comment');
    const commentTextArea = $('#comment-text-area');
    const titleInput = $('#title-input');
    const missingInputMessage = $('#missing-input-message');
    const likeButton = $('.like-button');
    const dislikeButton = $('.dislike-button');

    $(document).ready(function() {
        const userId = thisScript.getAttribute('data-userId');

        if(userId == '') return;

        const requestConfig = {
            url: `../users/${userId}/comment`,
            type: 'GET'
        };

        $.ajax(requestConfig).then((res) => {
            commentSection.children().each(function(index, li) {
                const commentId = $(li).children().first().attr('data-comment-id');
                console.log(commentId);
                if(res.likedComments.findIndex(x => x === commentId) > -1) {
                    $(li).children().first().children('.like-button').first().css('background-color', '#288628');
                } else if(res.dislikedComments.findIndex(x => x === commentId) > -1) {
                    $(li).children().first().children('.dislike-button').first().css('background-color', 'red');
                }
            });
        });
    });

    newCommentForm.submit(function(e){
        e.preventDefault();

        const username = thisScript.getAttribute('data-username');
        const title = titleInput.val();
        const comment = commentTextArea.val();
        const date = (new Date()).toLocaleString().slice(0, 9);

        if(title.replace(/\s*/g, '').length === 0 || comment.replace(/\s*/g, '').length === 0) {
            missingInputMessage.show();
            return;
        } else {
            missingInputMessage.hide();
        }

        // Make content for page
        const titlePar = $('<p>', {text: title});
        const reviewerPar = $('<p>', {text: `${username}, ${date}`});
        const commentPar = $('<p>', {text: comment});
        const commentDiv = $('<div>', {class: 'comment'});
        const likeButton = $('<button>', {class: 'like-button', text: 'Like', click: likeFunction});
        const dislikeButton = $('<button>', {class: 'dislike-button', text: 'Dislike', click: dislikeFunction});
        const likePar = $('<p>', {text: 'Likes: 0', class: 'like-count'});
        const dislikePar = $('<p>', {text: 'Dislikes: 0', class: 'dislike-count'});
        commentDiv.append(titlePar).append(reviewerPar).append(commentPar).append(likeButton).append(dislikeButton)
            .append(likePar).append(dislikePar);
        const listItem = $('<li>');
        listItem.append(commentDiv);
        commentSection.append(listItem);

        // cool animation idea from:
        // https://stackoverflow.com/a/21353858
        commentSection.animate({
            scrollTop: commentSection.prop('scrollHeight')
          }, 1000);

        // Ajax call
        const requestConfig = {
            type: 'POST',
            url: window.location.href,
            data: {reviewer: username, title: title, comment: comment, date: date}
        }
        $.ajax(requestConfig).then((res) => {
            //console.log(res._id);
            commentDiv.attr('data-comment-id', res._id);
        });

        // Clear inputs
        titleInput.val('');
        commentTextArea.val('');

    });

    const likeFunction = function(e) {
        e.preventDefault();

        const commentId = $(e.target).parent().attr('data-comment-id');
        const userId = thisScript.getAttribute('data-userId');

        if(!userId) {
            window.location.replace('../login');
            return;
        }
             

        const likeCount = $(e.target).parent().children('.like-count').first();
        const dislikeCount = $(e.target).parent().children('.dislike-count').first();

        const relatedDislikeButton = $(e.target).parent().children('.dislike-button').first();

        // Disable buttons 
        $(e.target).prop('disabled', true);
        relatedDislikeButton.prop('disabled', true);

        var requestConfig = {
            type: 'POST',
            url: `../users/${userId}/comment/${commentId}`,
            data: {like: 1, operation: 'addData'}
        }

        $.ajax(requestConfig).then((res) => {
            if(res.modified) {
                // You must up the like count of that comment, possibly decrement the dislike count
                requestConfig.url = window.location.href + '/comment/' + commentId;
                requestConfig.data = {like: 1, operation: 'add'};

                const wasDisliked = res.wasDisliked;

                $.ajax(requestConfig).then((res) => {
                    likeCount.text(`Likes: ${res.likes}`);
                    $(e.target).animate({'background-color': '#288628'}, 100);

                    // If comment was previously disliked, remove that data from user, and decrement dislike count for comment
                    if(wasDisliked) {
                        requestConfig.data = {like: -1, operation: 'remove'};
                        $.ajax(requestConfig).then((res) => {
                            dislikeCount.text(`Dislikes: ${res.dislikes}`);
                            relatedDislikeButton.css('background-color', 'white');
                            // requestConfig.url = `../users/${userId}/comment/${commentId}`;
                            // requestConfig.data = {like: -1, operation: 'removeData'};
                            // $.ajax(requestConfig).then((res) => {
                            //     $(e.target).prop('disabled', false);
                            //     relatedDislikeButton.prop('disabled', false);
                            //     console.log(res);
                            // });
                            $(e.target).prop('disabled', false);
                            relatedDislikeButton.prop('disabled', false);
                        });
                    } else {
                        $(e.target).prop('disabled', false);
                        relatedDislikeButton.prop('disabled', false);
                    }
                });
            } else {
                // You must remove that like from their likes, then decrement comment's like count
                requestConfig.data = {like: 1, operation: 'removeData'};
                $.ajax(requestConfig).then((res) => {
                    requestConfig.url = window.location.href + '/comment/' + commentId;
                    requestConfig.data = {like:1, operation: 'remove'};
                    $.ajax(requestConfig).then((res) => {
                        likeCount.text(`Likes: ${res.likes}`);
                        $(e.target).css('background-color', 'white');
                        $(e.target).prop('disabled', false);
                        relatedDislikeButton.prop('disabled', false);
                    });
                });
            }
        })

    };

    const dislikeFunction = function(e) {
        e.preventDefault();

        const commentId = $(e.target).parent().attr('data-comment-id');
        const userId = thisScript.getAttribute('data-userId');

        if(!userId) {
            window.location.replace('../login');
            return;
        }
             
        const likeCount = $(e.target).parent().children('.like-count').first();
        const dislikeCount = $(e.target).parent().children('.dislike-count').first();

        const relatedLikeButton = $(e.target).parent().children('.like-button').first();

        // Disable buttons 
        $(e.target).prop('disabled', true);
        relatedLikeButton.prop('disabled', true);

        var requestConfig = {
            type: 'POST',
            url: `../users/${userId}/comment/${commentId}`,
            data: {like: -1, operation: 'addData'}
        }

        $.ajax(requestConfig).then((res) => {
            if(res.modified) {
                // You must up the dislike count of that comment, possibly decrement the like count
                requestConfig.url = window.location.href + '/comment/' + commentId;
                requestConfig.data = {like: -1, operation: 'add'};

                const wasLiked = res.wasLiked;

                $.ajax(requestConfig).then((res) => {
                    dislikeCount.text(`Dislikes: ${res.dislikes}`);
                    $(e.target).animate({'background-color': 'red'}, 100);
                    // If comment was previously liked, remove that data from user, and decrement dislike count for comment
                    if(wasLiked) {
                        requestConfig.data = {like: 1, operation: 'remove'};
                        $.ajax(requestConfig).then((res) => {
                            likeCount.text(`Likes: ${res.likes}`);
                            relatedLikeButton.css('background-color', 'white');
                            // requestConfig.url = `../users/${userId}/comment/${commentId}`;
                            // requestConfig.data = {like: 1, operation: 'removeData'};
                            // $.ajax(requestConfig).then((res) => {
                            //     $(e.target).prop('disabled', false);
                            //     relatedLikeButton.prop('disabled', false);
                            // });
                            $(e.target).prop('disabled', false);
                            relatedLikeButton.prop('disabled', false);
                        });

                    } else {
                        $(e.target).prop('disabled', false);
                        relatedLikeButton.prop('disabled', false);
                    }
                });
            } else {
                // You must remove that like from their dislikes, then decrement comment's dislike count
                requestConfig.data = {like: -1, operation: 'removeData'};
                $.ajax(requestConfig).then((res) => {
                    requestConfig.url = window.location.href + '/comment/' + commentId;
                    requestConfig.data = {like: -1, operation: 'remove'};
                    $.ajax(requestConfig).then((res) => {
                        dislikeCount.text(`Dislikes: ${res.dislikes}`);
                        $(e.target).css('background-color', 'white');
                        $(e.target).prop('disabled', false);
                        relatedLikeButton.prop('disabled', false);
                    });
                });
            }
        })

    };

    likeButton.click(likeFunction);
    dislikeButton.click(dislikeFunction);
})(window.jQuery);