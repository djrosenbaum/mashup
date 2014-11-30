var gameplay = {
    flip_timer : null,
    flip : 'first',
    $selected_card : null,
    selected_card : null,
    $first_flip : null,
    first_flip : null,
    $second_flip : null,
    second_flip : null
};

gameplay.reset_tiles = function() {

    //HIDE THE IMAGES THAT WERE NOT MATCHED
    $('.active').children('img').remove();

    //RESET ACTIVE TILES
    $('.active').removeClass('active');

    //USER CAN NOW SELECT A NEW TILE
    gameplay.flip = 'first';

};

gameplay.cards_match = function() {

    $('.active').addClass('match');

    $('.active').removeClass('active');

};

gameplay.cards_do_not_match = function() {
    //console.log('cards do not match');

    gameplay.flip_timer = setTimeout(function () {

        gameplay.reset_tiles();

    }, 1000);
};

gameplay.check_for_win = function() {

    if ( $('.match').length === card_table.card_deck.cards.length ) {

        gameplay.winner();

    }

};

gameplay.winner = function() {
    stats.games_played += 1;

    var highlight_timer = 100;

    $('.game_board .memory_button').each(function(){

        var that = $(this);

        highlight_timer += 100;

        setTimeout( function(){

            that.addClass('highlight');

        }, highlight_timer);

    });

    stats.check_best_score();

    firebase.send_update();
};

gameplay.reset = function() {

    $('.game_board').empty();

    stats.total_moves = 0;

    stats.show_updated_score();

    //CREATE A NEW DECK WITH X CARDS TO MATCH
    new_deck = new Card_deck( 5 );

    //FETCH CARDS FROM REDDIT
    dealer.request_images_from_reddit();

};
