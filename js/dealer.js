var dealer = {};

//REQUEST IMAGES FROM REDDIT
dealer.request_images_from_reddit = function () {

    //MAKE AJAX REQUEST TO REDDIT SERVER
    $.ajax({
        type: 'GET',
        url: 'http://www.reddit.com/r/TheSimpsons/hot.json?limit=100',
        success: function(json_data) {

            dealer.filter_reddit_images( json_data.data.children );

            dealer.start_game();

        },
        error: function(e) {
            //console.log(e.message);
        }
    });

};

//LOOPS THROUGH THE JSON DATA RETURNED FROM REDDIT API
dealer.filter_reddit_images = function ( json_data ) {

    var imgur_array = [];

    var image_url;

    for ( var i=0; i < json_data.length; i++) {

        if ( imgur_array.length >= new_deck.match_sets ) {

            break;

        }

        image_url = json_data[i].data.url;

        if ( image_url.indexOf("imgur.com") >= 0 && image_url.slice(-4) === '.jpg' ) {

            imgur_array.push( image_url );

        }

    }

    new_deck.imgur_array = imgur_array;

};


//BUILDS A NEW DECK OF CARDS
dealer.build_deck = function() {

    //PUSH 2 SETS OF CARDS INTO ARRAY FOR EACH MATCH_SET
    this.cards = [];

    //LOOP THROUGH TOTAL NUMBER OF CARDS
    for ( var i = 0; i < this.match_sets; i++ ) {

        //CREATE 2 MATCHING CARDS
        var card_1 = new playing_card(i);
        var card_2 = new playing_card(i);

        //ADD CARDS TO THE DECK
        this.cards.push(card_1,card_2);

    }

    //delete new_deck.imgur_array;

    return this;

};

//SHUFFLES CARDS IN DECK
dealer.shuffle = function() {

    //TOTAL NUMBER OF CARDS NOT YET SHUFFLED, INITIALLY EQUAL TO ALL CARDS IN DECK
    var cards_left_to_shuffle = this.cards.length;

    //LAST CARD IN THE DECK NOT YET SHUFFLED
    var last_card_in_deck_to_shuffle;

    //RANDOM INDEX BASED ON CARDS IN DECK NOT YET SHUFFLED
    var random_index;

    // WHILE THERE ARE CARDS LEFT TO SHUFFLE
    while ( cards_left_to_shuffle > 0 ) {

        //GENERATE RANDOM INDEX BASED ON CARDS IN DECK NOT YET SHUFFLED
        random_index = Math.floor(Math.random() * cards_left_to_shuffle);

        //TOTAL NUMBERS OF CARDS LEFT TO SHUFFLE MINUS 1 TO MATCH 0 BASED INDEX
        cards_left_to_shuffle -= 1;

        //LAST CARD IN THE DECK TO SHUFFLE
        last_card_in_deck_to_shuffle = this.cards[cards_left_to_shuffle];

        // ==== SWAP THE CARDS ====
        //LAST CARD IN DECK TO SHUFFLE IS EQUAL TO RANDOMLY SELECTED CARD NOT YET SHUFFLED
        this.cards[cards_left_to_shuffle] = this.cards[random_index];

        //RANDOM INDEX IS EQUAL TO LAST CARD IN THE DECK NOT YET SHUFFLED
        this.cards[random_index] = last_card_in_deck_to_shuffle;
    }

    return this;

};

//ADD DECK OF CARDS TO THE TABLE
dealer.place_deck_on_table = function ( card_deck ) {

    card_table.card_deck = card_deck;

};

dealer.deal_cards = function() {

    //WHICH COLUMN THE CARD IS DEALT
    var grid_column = 1;

    var row_size = dealer.determine_row_size();

    var memory_button_html = '<div class="memory_button"' + dealer.check_grid_column(grid_column)  + '></div>';

    //LOOP THROUGH ALL OF THE CARDS IN THE DECK
    for ( var i = 0; i < card_table.card_deck.total_cards; i++ ) {

        //IF THE TILE IS IN THE LAST GRID COLUMN, RESET BACK TO THE FIRST COLUMN
        if ( grid_column === 1 || grid_column < row_size ) {
            grid_column++;
        }
        else {
            grid_column = 1;
        }

        //DEAL CARD TO THE GAME BOARD
        $('.game_board').append(memory_button_html);
    }

};

//DETERMINE NUMBER OF CARDS IN GRID ROW
dealer.determine_row_size = function () {

    //GET SQUARE ROOT OF TOTAL CARDS
    var square_root = Math.sqrt( card_table.card_deck.total_cards );

    //IF SQUARE ROOT IS 8 OR LESS AND AN INTEGER CREATE A SQUARE LAYOUT
    if ( square_root <= 8 && square_root % 1 === 0 ) {
        return square_root;
    }

    //ELSE CREATE A RECTANGLE LAYOUT WITH A MAXIMUM OF 8 TILES TO A ROW
    else {
        for (var i=8; i>=2; i--) {
            if ( card_table.card_deck.total_cards % i === 0) {
                return i;
            }
        }
    }
};

//CHECK IF THE CARD IS BEING LAYED DOWN IN THE FIRST COLUMN, IF YES CLEAR THE FLOAT
dealer.check_grid_column = function ( grid_column ) {
    //console.log('checking tile column');
    if ( grid_column === 1 ) {
        return ' first_column';
    }
    else {
        return '';
    }
};

//TIMER USED TO FLIP CARDS OVER WHEN THERE IS NOT A MATCH
/*
dealer.start_timer = function() {

    setTimeout(function () {

        dealer.reset_cards();

    }, 1000);

};
*/

//ASK THE DEALER TO BUILD A DECK, SHUFFLE THE CARDS, AND LAY THE CARDS ON THE TABLE
dealer.start_game = function () {

    dealer.build_deck.apply( new_deck );

    dealer.shuffle.apply( new_deck );

    dealer.place_deck_on_table( new_deck );

    dealer.deal_cards();

};
