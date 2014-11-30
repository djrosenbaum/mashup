//LISTEN TO CARDS THAT DO NOT HAVE A CLASS OF MATCH OR ACTIVE
$('.memory').on('click','.memory_button:not(.match, .active)', function() {

    //CLEAR THE TIMEOUT IF THE PLAYER SELECTS A CARD BEFORE THE TIMER FINISHES
    clearTimeout(gameplay.flip_timer);

    //IF FIRST FLIP, RESET THE TILES BEFORE SELECTING IN THE EVENT PLAYER SELECTS CARD BEFORE TIMER COMPLETES
    if ( gameplay.flip === 'first') {
        gameplay.reset_tiles();
    }

    gameplay.$selected_card = $(this);

    //SET THE CARD THAT WAS CLICKED TO ACTIVE
    $(this).addClass('active');

    player.select_card();

});

//INITIAL GAME SCREEN
$('.player_prompt .join_game').on('click', function() {

    if ( $('.player_name_input').val() < 1 || $('.player_name_input').val() > 20 ) {
        return;
    }

    else {
        firebase.join_game();
    }

});

$('.player_prompt').on('keypress', '.player_name_input', function(e) {

    if (e.keyCode === 13) {

        if ( $('.player_name_input').val() < 1 || $('.player_name_input').val() > 20 ) {
            return;
        }

        else {
            firebase.join_game();
        }

    }

});


$('.memory').on('click','.reset_button',function() {
    gameplay.reset();
});
