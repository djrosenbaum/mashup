var player = {};

player.select_card = function() {

    //STORE REFERENCE TO THE SELECTED CARD
    gameplay.selected_card = card_table.card_deck.cards[ gameplay.$selected_card.index() ];

    //REVEAL THE CARD
    player.reveal_card();

    //CHECK IF FIRST FLIP OR SECOND FLIP
    player.check_flip();

};

player.reveal_card = function () {

    gameplay.$selected_card.append('<img src="' + gameplay.selected_card.card_image_url + '" width="125" height="125">');

};

player.check_flip = function( $selected_card, selected_card ) {
    //Step 1. CHECK IF FIRST CLICK OR SECOND CLICK
    if ( gameplay.flip === 'first' ) {
        player.flip_first_card();
    }
    else {
        player.flip_second_card();
    }
};

player.flip_first_card = function() {

    //SET FIRST FLIPPED CARD
    gameplay.first_flip = gameplay.selected_card;

    //SET TO SECOND FLIP
    gameplay.flip = 'second';

};

player.flip_second_card = function() {

    //INCREMENT SCORE
    stats.increment_score();

    //RESET THE FLIP
    gameplay.flip = 'first';

    //CHECK FOR MATCH
    player.check_for_match();

    //DISPLAY THE SCORE
    stats.show_updated_score();

};

player.check_for_match = function() {

    if ( gameplay.selected_card.card_value === gameplay.first_flip.card_value ) {

        //THERE IS A MATCH
        gameplay.cards_match();

        gameplay.check_for_win();

    }

    else {

        //THERE IS NOT A MATCH
        gameplay.cards_do_not_match();

    }

};
